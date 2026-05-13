import type {
  CycleLog,
  CycleHistoryEntry,
  CyclePhase,
  SymptomPattern,
} from '@/lib/types'
import { getCyclePhase, getCycleDayFromDate } from './cycle-calculations'

/**
 * Pure-function module for personal symptom-timing patterns.
 *
 * All math runs against the user's own `cyclesIndex` — never against a
 * generic 28-day modulo. Determinism + minimum sample sizes are how we keep
 * this trustworthy without ML.
 */

export interface SymptomEvent {
  symptom: string
  date: string
  cycleDay: number
  cycleStartDate: string
}

/**
 * For each symptom occurrence, attribute it to the cycle whose start it
 * falls into.
 */
export function buildSymptomEvents(
  logs: CycleLog[],
  cyclesIndex: CycleHistoryEntry[]
): SymptomEvent[] {
  if (cyclesIndex.length === 0) return []
  const periodStarts = cyclesIndex.map(c => c.startDate)

  const events: SymptomEvent[] = []
  for (const log of logs) {
    if (!log.symptoms || log.symptoms.length === 0) continue
    const cycleDay = getCycleDayFromDate(log.date, periodStarts)
    if (cycleDay === null) continue

    // Find which cycle this log belongs to (latest start <= log date).
    const target = new Date(log.date).getTime()
    let cycleStart = periodStarts[0]
    for (const s of periodStarts) {
      if (new Date(s).getTime() <= target) cycleStart = s
      else break
    }

    for (const symptom of log.symptoms) {
      events.push({ symptom, date: log.date, cycleDay, cycleStartDate: cycleStart })
    }
  }
  return events
}

/**
 * Compute per-symptom pattern statistics from the user's own cycle history.
 *
 * `minOccurrences` gates: a single bad day shouldn't produce a "pattern".
 * `leadIndicatorThreshold`: fraction of completed cycles where the symptom
 * appeared in the last N days before the next period start.
 */
export function computeSymptomPatterns(
  logs: CycleLog[],
  cyclesIndex: CycleHistoryEntry[],
  options: {
    minOccurrences?: number
    leadWindowDays?: number
    leadIndicatorThreshold?: number
    projectedCycleLength?: number
  } = {}
): SymptomPattern[] {
  const minOccurrences = options.minOccurrences ?? 2
  const leadWindow = options.leadWindowDays ?? 7
  const leadThreshold = options.leadIndicatorThreshold ?? 0.6
  const projectedLength = options.projectedCycleLength ?? 28

  const completedCycles = cyclesIndex.filter(c => c.length > 0)
  const completedCount = completedCycles.length
  if (completedCount === 0) return []

  const events = buildSymptomEvents(logs, cyclesIndex)
  if (events.length === 0) return []

  // Group events by symptom.
  const bySymptom = new Map<string, SymptomEvent[]>()
  for (const e of events) {
    const list = bySymptom.get(e.symptom) ?? []
    list.push(e)
    bySymptom.set(e.symptom, list)
  }

  const patterns: SymptomPattern[] = []
  for (const [symptom, evts] of bySymptom.entries()) {
    if (evts.length < minOccurrences) continue

    const days = evts.map(e => e.cycleDay)
    const mean = days.reduce((a, b) => a + b, 0) / days.length
    const variance =
      days.reduce((acc, d) => acc + (d - mean) ** 2, 0) / days.length
    const spread = Math.sqrt(variance)

    // Frequency: in how many distinct *completed* cycles did this appear?
    const cyclesWithSymptom = new Set<string>()
    for (const e of evts) {
      // Only count this event if its cycleStart matches a completed cycle.
      if (completedCycles.some(c => c.startDate === e.cycleStartDate)) {
        cyclesWithSymptom.add(e.cycleStartDate)
      }
    }
    const frequency = cyclesWithSymptom.size / completedCount

    // Lead-indicator detection: for each completed cycle, was the symptom
    // logged in the final `leadWindow` days?
    let leadHits = 0
    let totalLeadDays = 0
    let leadDayCount = 0
    for (const cycle of completedCycles) {
      const cycleEvents = evts.filter(e => e.cycleStartDate === cycle.startDate)
      const inWindow = cycleEvents.filter(
        e => cycle.length - e.cycleDay + 1 <= leadWindow && e.cycleDay <= cycle.length
      )
      if (inWindow.length > 0) {
        leadHits++
        for (const e of inWindow) {
          totalLeadDays += cycle.length - e.cycleDay + 1
          leadDayCount++
        }
      }
    }
    const isLeadIndicator =
      completedCount >= 2 && leadHits / completedCount >= leadThreshold
    const daysBeforePeriod =
      isLeadIndicator && leadDayCount > 0
        ? Math.round(totalLeadDays / leadDayCount)
        : undefined

    const phase: CyclePhase = getCyclePhase(
      Math.round(mean),
      projectedLength
    )

    patterns.push({
      symptom,
      frequency,
      avgCycleDay: Math.round(mean * 10) / 10,
      spread: Math.round(spread * 10) / 10,
      phase,
      occurrences: evts.length,
      isLeadIndicator,
      daysBeforePeriod,
    })
  }

  // Sort by frequency desc.
  patterns.sort((a, b) => b.frequency - a.frequency)
  return patterns
}

/**
 * Identify "lead indicator" symptoms — those reliably preceding bleeding.
 * Used by the daily-adjustment rule.
 */
export function getLeadIndicators(patterns: SymptomPattern[]): SymptomPattern[] {
  return patterns.filter(p => p.isLeadIndicator)
}
