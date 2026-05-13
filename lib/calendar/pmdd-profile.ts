import type {
  CycleLog,
  CycleHistoryEntry,
  PMDDProfile,
  CyclePrediction,
} from '@/lib/types'
import { PMDD_SYMPTOMS, EMOTIONAL_SYMPTOMS } from '@/lib/types'
import { getCycleDayFromDate } from './cycle-calculations'

const PMDD_KEYWORDS = ['Severe', 'Extreme', 'Panic', 'Suicidal', 'Hopelessness']

const SEVERE_PMDD_SYMPTOMS = new Set<string>([
  ...PMDD_SYMPTOMS.filter(s =>
    PMDD_KEYWORDS.some(k => s.includes(k))
  ),
])

const PMDD_SYMPTOM_SET = new Set<string>([
  ...PMDD_SYMPTOMS,
  ...EMOTIONAL_SYMPTOMS.filter(s =>
    ['Mood swings', 'Irritability', 'Crying spells', 'Rage', 'Hopelessness'].includes(s)
  ),
])

function isPMDDSymptom(symptom: string): boolean {
  if (PMDD_SYMPTOM_SET.has(symptom)) return true
  return PMDD_KEYWORDS.some(k => symptom.includes(k))
}

function isSeverePMDDSymptom(symptom: string): boolean {
  if (SEVERE_PMDD_SYMPTOMS.has(symptom)) return true
  return ['Severe', 'Extreme', 'Panic', 'Suicidal'].some(k => symptom.includes(k))
}

/**
 * Build a personal PMDD-pattern profile from cycle history.
 *
 * Gating: requires ≥2 completed cycles with PMDD-like symptoms in the days
 * preceding bleeding. Below that, returns hasPattern=false; the UI falls
 * back to the generic "last 10 days" window from cycle-calculations.
 */
export function computePMDDProfile(
  logs: CycleLog[],
  cyclesIndex: CycleHistoryEntry[],
  prediction: CyclePrediction | null,
  options: {
    minCycles?: number
    leadWindowDays?: number
  } = {}
): PMDDProfile {
  const minCycles = options.minCycles ?? 2
  const leadWindow = options.leadWindowDays ?? 10

  const empty: PMDDProfile = {
    hasPattern: false,
    windowStartDay: null,
    windowEndDay: null,
    windowStartDate: null,
    windowEndDate: null,
    severity: null,
    trend: null,
    cyclesObserved: 0,
    reason: [],
  }

  const completed = cyclesIndex.filter(c => c.length > 0)
  if (completed.length < minCycles) {
    return {
      ...empty,
      reason: [
        `Need at least ${minCycles} completed cycles with logs to detect a personal pre-period mood pattern.`,
      ],
    }
  }

  const periodStarts = cyclesIndex.map(c => c.startDate)

  // For each completed cycle, find PMDD-like symptom logs in the final
  // `leadWindow` days. Track earliest day, severity, and presence per cycle.
  const perCycle: Array<{
    cycleStart: string
    cycleLength: number
    earliestLeadDay: number | null // days before period start
    severityCount: number // count of severe symptoms
    presence: boolean
  }> = []

  for (const cycle of completed) {
    const start = new Date(cycle.startDate).getTime()
    const end = start + cycle.length * 24 * 60 * 60 * 1000
    const cycleLogs = logs.filter(l => {
      const t = new Date(l.date).getTime()
      return t >= start && t < end
    })

    let earliestLead: number | null = null
    let severeCount = 0
    let present = false

    for (const log of cycleLogs) {
      if (!log.symptoms || log.symptoms.length === 0) continue
      const cd = getCycleDayFromDate(log.date, periodStarts)
      if (cd === null) continue
      const daysBeforePeriod = cycle.length - cd + 1
      if (daysBeforePeriod < 0 || daysBeforePeriod > leadWindow) continue

      const pmddHits = log.symptoms.filter(isPMDDSymptom)
      if (pmddHits.length === 0) continue

      present = true
      if (earliestLead === null || daysBeforePeriod > earliestLead) {
        earliestLead = daysBeforePeriod
      }
      severeCount += log.symptoms.filter(isSeverePMDDSymptom).length
    }

    perCycle.push({
      cycleStart: cycle.startDate,
      cycleLength: cycle.length,
      earliestLeadDay: earliestLead,
      severityCount: severeCount,
      presence: present,
    })
  }

  const presentCycles = perCycle.filter(c => c.presence)
  if (presentCycles.length < minCycles) {
    return {
      ...empty,
      cyclesObserved: completed.length,
      reason: [
        "Not enough recurring pre-period mood symptoms across cycles to flag a personal pattern yet.",
      ],
    }
  }

  // Personal window: average earliest-lead day across cycles where it appeared.
  const avgEarliest =
    presentCycles.reduce((acc, c) => acc + (c.earliestLeadDay ?? 0), 0) /
    presentCycles.length

  const projectedLength = prediction?.projectedCycleLength ?? 28
  const windowStartDay = Math.max(1, projectedLength - Math.round(avgEarliest))
  const windowEndDay = projectedLength

  // Severity tier: average severe count across present cycles.
  const avgSevere =
    presentCycles.reduce((acc, c) => acc + c.severityCount, 0) /
    presentCycles.length
  let severity: PMDDProfile['severity'] = 'mild'
  if (avgSevere >= 4) severity = 'severe'
  else if (avgSevere >= 2) severity = 'moderate'

  // Trend: compare last 3 vs prior cycles (3-cycle moving average direction).
  let trend: PMDDProfile['trend'] = 'steady'
  if (presentCycles.length >= 3) {
    const recent = presentCycles.slice(-3)
    const earlier = presentCycles.slice(0, -3)
    if (earlier.length > 0) {
      const recentAvg =
        recent.reduce((a, c) => a + c.severityCount, 0) / recent.length
      const earlierAvg =
        earlier.reduce((a, c) => a + c.severityCount, 0) / earlier.length
      const delta = recentAvg - earlierAvg
      if (delta >= 1) trend = 'worsening'
      else if (delta <= -1) trend = 'improving'
    }
  }

  // Window dates relative to the latest known period start.
  let windowStartDate: Date | null = null
  let windowEndDate: Date | null = null
  if (cyclesIndex.length > 0) {
    const anchor = new Date(cyclesIndex[cyclesIndex.length - 1].startDate)
    windowStartDate = new Date(anchor)
    windowStartDate.setDate(anchor.getDate() + windowStartDay - 1)
    windowEndDate = new Date(anchor)
    windowEndDate.setDate(anchor.getDate() + windowEndDay - 1)
  }

  const reason: string[] = []
  reason.push(
    `Recurring pre-period mood symptoms across ${presentCycles.length} of ${completed.length} completed cycles.`
  )
  reason.push(
    `Symptoms typically begin around day ${windowStartDay} of your cycle (about ${Math.round(
      avgEarliest
    )} days before bleeding).`
  )
  if (trend === 'worsening') {
    reason.push('Severity has been increasing in recent cycles — worth noting.')
  } else if (trend === 'improving') {
    reason.push('Severity has been decreasing recently.')
  }

  return {
    hasPattern: true,
    windowStartDay,
    windowEndDay,
    windowStartDate,
    windowEndDate,
    severity,
    trend,
    cyclesObserved: completed.length,
    reason,
  }
}
