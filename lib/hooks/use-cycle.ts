'use client'

import { useEffect, useCallback, useMemo, useSyncExternalStore } from 'react'
import type {
  CycleLog,
  CycleSettings,
  CyclePhase,
  CyclePrediction,
  SymptomPattern,
  PMDDProfile,
  EndoFlag,
  CycleHistoryEntry,
} from '@/lib/types'
import {
  getCycleLogs,
  saveCycleLog,
  getCycleSettings,
  saveCycleSettings,
  deleteCycleLog,
  getCyclesIndex,
  migrateSchema,
  subscribeToCycleData,
  refreshFromStorage,
} from '@/lib/storage/cycle-storage'
import {
  getCurrentCycleDay,
  getCyclePhase,
  getPhaseInfo,
  isInPMDDWindow,
} from '@/lib/calendar/cycle-calculations'
import {
  analyzeCyclePatterns,
  adjustPredictionWithToday,
} from '@/lib/calendar/cycle-predictions'
import { computeSymptomPatterns, getLeadIndicators } from '@/lib/calendar/symptom-patterns'
import { computePMDDProfile } from '@/lib/calendar/pmdd-profile'
import { computeEndoFlags } from '@/lib/calendar/endo-flags'
import { daysBetween, daysBetweenKeys, todayKey } from '@/lib/utils/date-keys'

/**
 * Subscribe to the storage module and to cross-tab writes.
 *
 * Defined once at module scope so useSyncExternalStore sees a stable function
 * and doesn't resubscribe on every render.
 */
function subscribeToStore(onStoreChange: () => void): () => void {
  const unsubscribe = subscribeToCycleData(onStoreChange)
  // Another tab wrote directly to localStorage, so the storage module's
  // parsed-value cache is stale — drop it, which notifies subscribers.
  const onStorage = () => refreshFromStorage()
  window.addEventListener('storage', onStorage)
  return () => {
    unsubscribe()
    window.removeEventListener('storage', onStorage)
  }
}

const SERVER_LOGS: CycleLog[] = []
const SERVER_INDEX: CycleHistoryEntry[] = []
const SERVER_SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  trackingEnabled: true,
}

export function useCycle() {
  // localStorage is an external mutable store, so it's read through
  // useSyncExternalStore rather than copied into state on mount. That drops
  // the extra render every mount used to cost, and means every instance of
  // this hook observes exactly the same snapshot. The getters return cached,
  // referentially stable values (see cycle-storage), which this API requires.
  const logs = useSyncExternalStore(subscribeToStore, getCycleLogs, () => SERVER_LOGS)
  const settings = useSyncExternalStore(
    subscribeToStore,
    getCycleSettings,
    () => SERVER_SETTINGS
  )

  // One-time schema migration. Runs after paint; migrateSchema is idempotent
  // and notifies subscribers itself if it rebuilds the cycles index.
  useEffect(() => {
    migrateSchema()
  }, [])

  // Data is available synchronously on the client; the flag stays for the
  // screens that still branch on it during server render / hydration.
  const isLoading = typeof window === 'undefined'

  // The index is derived from the logs and rebuilt by the storage layer on
  // every write, so reading it through the same store keeps it in step without
  // a memo keyed on `logs`.
  const cyclesIndex: CycleHistoryEntry[] = useSyncExternalStore(
    subscribeToStore,
    getCyclesIndex,
    () => SERVER_INDEX
  )

  // ---------- Raw cycle state ----------

  /**
   * The single anchor everything counts from.
   *
   * Cycle day used to count from the date entered at onboarding while the
   * prediction counted from the first *logged* bleeding day. When those
   * differed, Reports showed "Day 4" beside a next-period date implying a
   * different day one — the screen contradicting itself. Logged evidence wins
   * once there is any; the declared date is the fallback before then.
   */
  const effectiveAnchor =
    cyclesIndex.length > 0
      ? cyclesIndex[cyclesIndex.length - 1].startDate
      : settings.lastPeriodStart

  const cycleDay = getCurrentCycleDay(effectiveAnchor)

  const currentPhase: CyclePhase | null = cycleDay
    ? getCyclePhase(cycleDay, settings.averageCycleLength, settings.averagePeriodLength)
    : null

  const phaseInfo = currentPhase ? getPhaseInfo(currentPhase) : null

  // ---------- Rich prediction (memoized — expensive to recompute) ----------

  const basePrediction: CyclePrediction = useMemo(
    () => analyzeCyclePatterns(logs, settings),
    [logs, settings]
  )

  const symptomPatterns: SymptomPattern[] = useMemo(
    () =>
      computeSymptomPatterns(logs, cyclesIndex, {
        projectedCycleLength: basePrediction.projectedCycleLength,
      }),
    [logs, cyclesIndex, basePrediction.projectedCycleLength]
  )

  const leadIndicators = useMemo(
    () => getLeadIndicators(symptomPatterns),
    [symptomPatterns]
  )

  // Daily-adjusted prediction: shifts earlier when lead-indicator symptoms are
  // logged today, shifts later if bleeding hasn't appeared past the window.
  const todayIso = todayKey()
  const todayLog = useMemo(
    () => logs.find(l => l.date === todayIso) ?? null,
    [logs, todayIso]
  )

  const prediction: CyclePrediction = useMemo(
    () => adjustPredictionWithToday(basePrediction, todayLog, leadIndicators),
    [basePrediction, todayLog, leadIndicators]
  )

  const pmddProfile: PMDDProfile = useMemo(
    () => computePMDDProfile(logs, cyclesIndex, prediction),
    [logs, cyclesIndex, prediction]
  )

  const endoFlags: EndoFlag[] = useMemo(
    () => computeEndoFlags(logs, cyclesIndex),
    [logs, cyclesIndex]
  )

  // ---------- Shims for screens that use the old API (will be cleaned up) ----------

  /** @deprecated Use prediction.nextPeriodStart */
  const nextPeriod = prediction.nextPeriodStart

  /** @deprecated Use prediction.nextPeriodStart and prediction.nextPeriodRange */
  const daysUntil: number | null = useMemo(() => {
    if (!prediction.nextPeriodStart) return null
    return Math.max(0, daysBetween(new Date(), prediction.nextPeriodStart))
  }, [prediction.nextPeriodStart])

  /** @deprecated Use pmddProfile.hasPattern or prediction.pmddWindowStart */
  const inPMDDWindow = cycleDay
    ? isInPMDDWindow(cycleDay, prediction.projectedCycleLength)
    : false

  // ---------- Actions ----------

  const updateSettings = useCallback((updates: Partial<CycleSettings>) => {
    saveCycleSettings(updates)
  }, [])

  const logDay = useCallback(
    (log: CycleLog) => {
      // saveCycleLog notifies every subscriber, including this hook's own
      // refresh, so there is no need to setLogs() here.
      saveCycleLog(log)

      // Anchor a new period start. 'spotting' deliberately does not count,
      // matching detectPeriodStartDates() — otherwise the anchor and the
      // engine's cycle index would disagree about where a cycle began.
      const startsFlow = log.flow !== 'none' && log.flow !== 'spotting'

      if (startsFlow) {
        // Read through to storage rather than the render's closure: another
        // instance of this hook may have written since this callback was made.
        const lastStart = getCycleSettings().lastPeriodStart

        if (!lastStart || daysBetweenKeys(lastStart, log.date) > 20) {
          const prevDayLog = getCycleLogs().find(
            l => daysBetweenKeys(l.date, log.date) === 1
          )

          if (!prevDayLog || prevDayLog.flow === 'none' || prevDayLog.flow === 'spotting') {
            updateSettings({ lastPeriodStart: log.date })
          }
        }
      }
    },
    [updateSettings]
  )

  const removeLog = useCallback((date: string) => {
    deleteCycleLog(date)
  }, [])

  const getLogForDate = useCallback(
    (date: string): CycleLog | undefined => logs.find(l => l.date === date),
    [logs]
  )

  const startNewPeriod = useCallback(
    (date: string = todayKey()) => {
      updateSettings({ lastPeriodStart: date })

      const existingLog = getLogForDate(date)
      if (!existingLog) {
        logDay({
          date,
          flow: 'medium',
          symptoms: [],
          moods: [],
          painLevel: 0,
          energy: 5,
          notes: '',
        })
      } else if (existingLog.flow === 'none') {
        logDay({ ...existingLog, flow: 'medium' })
      }
    },
    [updateSettings, getLogForDate, logDay]
  )

  return {
    // Raw data
    logs,
    settings,
    isLoading,

    // Current state
    cycleDay,
    currentPhase,
    phaseInfo,

    // Rich prediction object (use this going forward)
    prediction,
    cyclesIndex,
    symptomPatterns,
    pmddProfile,
    endoFlags,

    // Legacy shims (kept so existing screens still compile)
    nextPeriod,
    daysUntil,
    inPMDDWindow,

    // Actions
    logDay,
    removeLog,
    updateSettings,
    getLogForDate,
    startNewPeriod,
  }
}
