import type {
  CycleLog,
  CycleSettings,
  CyclePhase,
  CyclePrediction,
  ConfidenceTier,
  CycleHistoryEntry,
  SymptomPattern,
} from '@/lib/types'
import { getCyclePhase, getPhaseInfo } from './cycle-calculations'
import { getMoonPhase } from './moon-phases'
import { detectPeriodStartDates, buildCyclesIndex } from '@/lib/storage/cycle-storage'

/**
 * Recency weights applied to up to the last 4 completed cycle lengths.
 * Newest first. Falls back to unweighted mean if <3 completed cycles.
 */
const RECENCY_WEIGHTS = [0.5, 0.3, 0.15, 0.05]

export interface PatternInsight {
  title: string
  description: string
  type: 'positive' | 'neutral' | 'attention'
  icon: string
}

// Re-export for downstream consumers that imported the old type from here.
export type { CyclePrediction }

/**
 * Map a numeric confidence (0-100) and the number of observed cycles to a
 * user-facing tier. The tier is what the UI shows; the number is for math.
 */
export function getConfidenceTier(
  confidence: number,
  cyclesObserved: number
): ConfidenceTier {
  if (cyclesObserved < 3) return 'learning'
  if (confidence >= 75) return 'high'
  if (confidence >= 50) return 'medium'
  return 'low'
}

function weightedMean(lengths: number[]): number {
  if (lengths.length === 0) return 0
  if (lengths.length < 3) {
    return lengths.reduce((a, b) => a + b, 0) / lengths.length
  }
  // Apply recency weights. lengths is oldest-first; reverse so newest gets
  // the largest weight.
  const recent = [...lengths].reverse().slice(0, RECENCY_WEIGHTS.length)
  let weightSum = 0
  let weighted = 0
  for (let i = 0; i < recent.length; i++) {
    const w = RECENCY_WEIGHTS[i]
    weighted += recent[i] * w
    weightSum += w
  }
  return weighted / weightSum
}

function stdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function formatRangeReason(meanLen: number, sd: number): string {
  const sdRounded = Math.max(1, Math.round(sd))
  return `Based on your last cycles (avg ${meanLen.toFixed(1)} days, varies ±${sdRounded}d).`
}

/**
 * Analyze logged cycles and produce a richer prediction object.
 *
 * Determinism: same logs in → same prediction out. No randomness, no API.
 */
export function analyzeCyclePatterns(
  logs: CycleLog[],
  settings: CycleSettings
): CyclePrediction {
  const cyclesIndex: CycleHistoryEntry[] = buildCyclesIndex(logs)
  const completed = cyclesIndex.filter(c => c.length > 0)
  const lengths = completed.map(c => c.length)
  const cyclesObserved = completed.length

  const reason: string[] = []

  // Defaults / fallback when no usable history.
  const fallbackLength = settings.averageCycleLength
  let projectedCycleLength = fallbackLength
  let cycleLengthStdDev = 0
  let confidence = 0
  let trend: CyclePrediction['trend'] = 'regular'

  if (cyclesObserved === 0) {
    reason.push(
      `Using your default cycle length of ${fallbackLength} days (no completed cycles logged yet).`
    )
    confidence = 30
  } else if (cyclesObserved < 3) {
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
    projectedCycleLength = Math.round(mean)
    cycleLengthStdDev = stdDev(lengths, mean)
    confidence = 45
    reason.push(
      `Based on ${cyclesObserved} completed ${
        cyclesObserved === 1 ? 'cycle' : 'cycles'
      } (avg ${mean.toFixed(1)}d). Predictions improve as you log more.`
    )
  } else {
    const mean = weightedMean(lengths)
    projectedCycleLength = Math.round(mean)
    cycleLengthStdDev = stdDev(lengths, mean)
    confidence = Math.max(0, Math.min(100, Math.round(100 - cycleLengthStdDev * 10)))

    const last3 = lengths.slice(-3)
    const drift = last3[2] - last3[0]
    if (cycleLengthStdDev > 5) trend = 'irregular'
    else if (drift > 2) trend = 'lengthening'
    else if (drift < -2) trend = 'shortening'
    else trend = 'regular'

    reason.push(formatRangeReason(mean, cycleLengthStdDev))
    if (trend === 'irregular') {
      reason.push('Your cycle length varies — the predicted range reflects that.')
    } else if (trend === 'lengthening') {
      reason.push('Recent cycles have been getting longer.')
    } else if (trend === 'shortening') {
      reason.push('Recent cycles have been getting shorter.')
    }
  }

  // Anchor for projecting the next period: prefer the latest known period
  // start from the index, fall back to settings.
  const latestStart =
    cyclesIndex.length > 0
      ? cyclesIndex[cyclesIndex.length - 1].startDate
      : settings.lastPeriodStart

  let nextPeriodStart: Date | null = null
  let nextOvulation: Date | null = null
  let pmddWindowStart: Date | null = null
  let pmddWindowEnd: Date | null = null
  let pmddWindowStartDay: number | null = null
  let pmddWindowEndDay: number | null = null
  let nextPeriodEarliest: Date | null = null
  let nextPeriodLatest: Date | null = null

  if (latestStart) {
    const anchor = new Date(latestStart)
    nextPeriodStart = addDays(anchor, projectedCycleLength)
    nextOvulation = addDays(anchor, Math.round(projectedCycleLength / 2))

    // Range: ±1 std dev, clamped to ≥1 day; widened to ±3 if learning/no data.
    const k = cyclesObserved >= 3 ? 1 : 1.5
    const halfWidth = Math.max(
      cyclesObserved < 3 ? 3 : 1,
      Math.round(cycleLengthStdDev * k)
    )
    nextPeriodEarliest = addDays(nextPeriodStart, -halfWidth)
    nextPeriodLatest = addDays(nextPeriodStart, halfWidth)

    pmddWindowStartDay = Math.max(1, projectedCycleLength - 10)
    pmddWindowEndDay = projectedCycleLength
    pmddWindowStart = addDays(anchor, pmddWindowStartDay - 1)
    pmddWindowEnd = addDays(anchor, pmddWindowEndDay - 1)
  }

  return {
    nextPeriodStart,
    nextPeriodRange: { earliest: nextPeriodEarliest, latest: nextPeriodLatest },
    nextOvulation,
    pmddWindowStart,
    pmddWindowEnd,
    pmddWindowStartDay,
    pmddWindowEndDay,
    confidence,
    confidenceTier: getConfidenceTier(confidence, cyclesObserved),
    projectedCycleLength,
    cycleLengthStdDev: Math.round(cycleLengthStdDev * 10) / 10,
    trend,
    reason,
    cycleHistoryCount: cyclesObserved,
  }
}

/**
 * Daily nudge: if today's log shows the user's known lead-indicator
 * symptoms, shift the predicted start earlier (within bounds).
 * If expected bleeding hasn't appeared by `nextPeriodLatest`, shift later.
 *
 * Pure: returns a new prediction, never mutates the input.
 */
export function adjustPredictionWithToday(
  prediction: CyclePrediction,
  todayLog: CycleLog | null,
  leadIndicators: SymptomPattern[],
  today: Date = new Date()
): CyclePrediction {
  if (!prediction.nextPeriodStart) return prediction

  let adjusted: CyclePrediction = {
    ...prediction,
    reason: [...prediction.reason],
    nextPeriodRange: {
      earliest: prediction.nextPeriodRange.earliest,
      latest: prediction.nextPeriodRange.latest,
    },
  }

  // Did expected bleeding fail to appear?
  const latest = prediction.nextPeriodRange.latest
  if (latest && today.getTime() > latest.getTime()) {
    const daysLate = Math.floor(
      (today.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24)
    )
    adjusted.nextPeriodStart = adjusted.nextPeriodStart
      ? addDays(adjusted.nextPeriodStart, daysLate)
      : null
    adjusted.nextPeriodRange = {
      earliest: latest,
      latest: adjusted.nextPeriodStart
        ? addDays(adjusted.nextPeriodStart, 3)
        : null,
    }
    adjusted.reason.push(
      `Expected start has passed by ${daysLate}d — prediction shifted forward.`
    )
    return adjusted
  }

  // Did the user log lead-indicator symptoms today?
  if (!todayLog || todayLog.symptoms.length === 0) return adjusted
  if (leadIndicators.length === 0) return adjusted

  const matchedLeads = leadIndicators.filter(li =>
    todayLog.symptoms.includes(li.symptom)
  )
  if (matchedLeads.length === 0) return adjusted

  // Average expected lead time across matched indicators.
  const avgLead =
    matchedLeads.reduce((sum, m) => sum + (m.daysBeforePeriod ?? 3), 0) /
    matchedLeads.length

  const expectedStart = addDays(today, Math.round(avgLead))
  // Only shift if the expectedStart is *earlier* than current prediction.
  if (
    adjusted.nextPeriodStart &&
    expectedStart.getTime() < adjusted.nextPeriodStart.getTime()
  ) {
    const sdHalf = Math.max(1, Math.round(adjusted.cycleLengthStdDev))
    adjusted.nextPeriodStart = expectedStart
    adjusted.nextPeriodRange = {
      earliest: addDays(expectedStart, -sdHalf),
      latest: addDays(expectedStart, sdHalf),
    }
    adjusted.reason.push(
      `Today's symptoms (${matchedLeads
        .map(m => m.symptom)
        .join(', ')}) usually appear ~${Math.round(avgLead)}d before your period.`
    )
  }

  return adjusted
}

/**
 * Generate user-facing insights from logs + prediction.
 * Bug fix vs. prior version: symptom day-in-cycle is computed from the
 * actual nearest preceding period start, not array-index modulo cycle length.
 */
export function generateInsights(
  logs: CycleLog[],
  settings: CycleSettings,
  prediction: CyclePrediction,
  symptomPatterns: SymptomPattern[] = []
): PatternInsight[] {
  const insights: PatternInsight[] = []

  if (logs.length < 7) {
    insights.push({
      title: 'Keep logging',
      description: 'Log at least 7 days to start seeing patterns.',
      type: 'neutral',
      icon: 'calendar',
    })
    return insights
  }

  // Top symptom pattern (uses correct cycle-day, not array index).
  const top = symptomPatterns[0]
  if (top && top.occurrences >= 3) {
    const phaseInfo = getPhaseInfo(top.phase)
    insights.push({
      title: `${top.symptom} pattern`,
      description: `${top.symptom} most often appears around day ${Math.round(
        top.avgCycleDay
      )} of your cycle (your ${phaseInfo.name.toLowerCase()} phase).`,
      type: 'neutral',
      icon: 'activity',
    })
  }

  // Energy.
  const avgEnergy = logs.reduce((acc, log) => acc + log.energy, 0) / logs.length
  if (avgEnergy < 4) {
    insights.push({
      title: 'Low energy trend',
      description:
        'Your average energy is below 4. Consider adding more iron-rich foods and rest.',
      type: 'attention',
      icon: 'battery-low',
    })
  } else if (avgEnergy >= 7) {
    insights.push({
      title: 'Great energy levels',
      description: 'Your energy has been consistently high. Keep doing what works!',
      type: 'positive',
      icon: 'zap',
    })
  }

  // Pain.
  const highPainDays = logs.filter(log => log.painLevel >= 6).length
  if (highPainDays > logs.length * 0.3) {
    insights.push({
      title: 'Pain patterns detected',
      description: `High pain (6+) on ${Math.round(
        (highPainDays / logs.length) * 100
      )}% of logged days. Consider noting triggers.`,
      type: 'attention',
      icon: 'alert-circle',
    })
  }

  // PMDD-like symptoms (descriptive only).
  const pmddSymptomsFound = logs.some(log =>
    log.symptoms.some(
      s => s.includes('Severe') || s.includes('Extreme') || s.includes('Panic')
    )
  )
  if (pmddSymptomsFound) {
    insights.push({
      title: 'Pre-period mood pattern',
      description:
        "You've logged severe mood symptoms. Tracking consistently helps identify your personal pattern.",
      type: 'attention',
      icon: 'heart',
    })
  }

  // Confidence.
  if (prediction.confidenceTier === 'high') {
    insights.push({
      title: 'Reliable predictions',
      description: `${prediction.confidence}% confidence in your cycle predictions based on consistent patterns.`,
      type: 'positive',
      icon: 'check-circle',
    })
  } else if (prediction.confidenceTier === 'learning') {
    insights.push({
      title: 'Still learning',
      description:
        'Predictions improve as you log more cycles. Your first 3 cycles are the most valuable.',
      type: 'neutral',
      icon: 'sparkles',
    })
  }

  if (prediction.trend === 'irregular') {
    insights.push({
      title: 'Variable cycles',
      description:
        'Your cycle length varies. This is normal, and tracking helps make predictions honest.',
      type: 'neutral',
      icon: 'trending-up',
    })
  }

  return insights.slice(0, 5)
}

/**
 * Reflective insight only — never used in date prediction.
 */
export function getMoonCycleCorrelation(
  logs: CycleLog[]
): { correlation: string; insight: string } | null {
  if (logs.length < 28) return null
  const periodStarts = detectPeriodStartDates(logs)
  if (periodStarts.length < 2) return null

  const phases = periodStarts.map(d => getMoonPhase(new Date(d)).phase)
  const total = phases.length

  const newAligned = phases.filter(
    p => p === 'new' || p === 'waxing-crescent'
  ).length
  const fullAligned = phases.filter(
    p => p === 'full' || p === 'waning-gibbous'
  ).length

  if (newAligned / total >= 0.5) {
    return {
      correlation: 'White Moon Cycle',
      insight:
        'Your period has tended to align with the new moon — traditionally associated with rest and renewal.',
    }
  }
  if (fullAligned / total >= 0.5) {
    return {
      correlation: 'Red Moon Cycle',
      insight:
        'Your period has tended to align with the full moon — traditionally associated with introspection.',
    }
  }
  return null
}

export function getSeasonForMonth(
  month: number
): 'winter' | 'spring' | 'summer' | 'autumn' {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function getSeasonalColors(): Record<
  string,
  { primary: string; secondary: string; accent: string }
> {
  return {
    winter: {
      primary: '#C9D6E3',
      secondary: '#C7C3D9',
      accent: '#B7D3CF',
    },
    spring: {
      primary: '#BFD8C2',
      secondary: '#AFC3A4',
      accent: '#E4BFC3',
    },
    summer: {
      primary: '#EAD9A0',
      secondary: '#E8D2B0',
      accent: '#E6B8A2',
    },
    autumn: {
      primary: '#D8A7A7',
      secondary: '#BFA8C9',
      accent: '#E6B8A2',
    },
  }
}

// ---------- helpers ----------

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
