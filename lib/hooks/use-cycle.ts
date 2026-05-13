'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

export function useCycle() {
  const [logs, setLogs] = useState<CycleLog[]>([])
  const [settings, setSettings] = useState<CycleSettings>({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodStart: null,
    trackingEnabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load data + run one-time schema migration on mount.
  useEffect(() => {
    migrateSchema()
    setLogs(getCycleLogs())
    setSettings(getCycleSettings())
    setIsLoading(false)
  }, [])

  // ---------- Raw cycle state ----------

  const cycleDay = getCurrentCycleDay(settings.lastPeriodStart)

  const currentPhase: CyclePhase | null = cycleDay
    ? getCyclePhase(cycleDay, settings.averageCycleLength, settings.averagePeriodLength)
    : null

  const phaseInfo = currentPhase ? getPhaseInfo(currentPhase) : null

  // ---------- Rich prediction (memoized — expensive to recompute) ----------

  const cyclesIndex: CycleHistoryEntry[] = useMemo(
    () => getCyclesIndex(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logs]
  )

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
  const todayIso = new Date().toISOString().split('T')[0]
  const todayLog = useMemo(
    () => logs.find(l => l.date === todayIso) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.round(
      (prediction.nextPeriodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    return Math.max(0, diff)
  }, [prediction.nextPeriodStart])

  /** @deprecated Use pmddProfile.hasPattern or prediction.pmddWindowStart */
  const inPMDDWindow = cycleDay
    ? isInPMDDWindow(cycleDay, prediction.projectedCycleLength)
    : false

  // ---------- Actions ----------

  const logDay = useCallback(
    (log: CycleLog) => {
      saveCycleLog(log)
      setLogs(getCycleLogs())

      if (log.flow !== 'none') {
        const logDate = new Date(log.date)
        const lastStart = settings.lastPeriodStart
          ? new Date(settings.lastPeriodStart)
          : null

        if (
          !lastStart ||
          (logDate.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24) > 20
        ) {
          const prevDayLog = logs.find(l => {
            const prevDate = new Date(l.date)
            const diffDays =
              (logDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            return diffDays === 1
          })

          if (!prevDayLog || prevDayLog.flow === 'none') {
            updateSettings({ lastPeriodStart: log.date })
          }
        }
      }
    },
    [logs, settings.lastPeriodStart]
  )

  const removeLog = useCallback((date: string) => {
    deleteCycleLog(date)
    setLogs(getCycleLogs())
  }, [])

  const updateSettings = useCallback((updates: Partial<CycleSettings>) => {
    saveCycleSettings(updates)
    setSettings(getCycleSettings())
  }, [])

  const getLogForDate = useCallback(
    (date: string): CycleLog | undefined => logs.find(l => l.date === date),
    [logs]
  )

  const startNewPeriod = useCallback(
    (date: string = new Date().toISOString().split('T')[0]) => {
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
