/**
 * Prediction engine unit tests.
 *
 * All functions under test are pure — no localStorage, no DOM.
 * We use synthetic cycle histories and verify the output is honest and
 * correct before any UI wire-up.
 */
import { describe, it, expect } from 'vitest'
import {
  analyzeCyclePatterns,
  getConfidenceTier,
  adjustPredictionWithToday,
  generateInsights,
} from '../cycle-predictions'
import { getCycleDayFromDate } from '../cycle-calculations'
import { buildCyclesIndex, detectPeriodStartDates } from '../../storage/cycle-storage'
import { computeSymptomPatterns } from '../symptom-patterns'
import { computePMDDProfile } from '../pmdd-profile'
import { computeEndoFlags } from '../endo-flags'
import type { CycleLog, CycleSettings, CycleHistoryEntry } from '../../types'

// ---------- helpers ----------

function isoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Add `days` to a UTC midnight Date without timezone issues.
 * Always operates in UTC ms, never uses getDate()/setDate().
 */
function addDaysUTC(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

/** Build a list of logs with flow starting on `start`, lasting `periodDays`. */
function makePeriodLogs(
  start: Date,
  periodDays = 5,
  extras: Partial<CycleLog> = {}
): CycleLog[] {
  const logs: CycleLog[] = []
  for (let i = 0; i < periodDays; i++) {
    const d = addDaysUTC(start, i)
    logs.push({
      date: isoDate(d),
      flow: i === 0 ? 'medium' : 'light',
      symptoms: [],
      moods: [],
      painLevel: 0,
      energy: 5,
      notes: '',
      ...extras,
    })
  }
  return logs
}

/**
 * Build a synthetic multi-cycle log history.
 * `cycleLengths` = lengths between consecutive period starts.
 * Uses UTC arithmetic only — no getDate()/setDate() to avoid timezone bugs.
 */
function buildSyntheticHistory(
  firstStart: Date,
  cycleLengths: number[],
  periodDays = 5,
  extraPerCycle: Partial<CycleLog>[] = []
): CycleLog[] {
  const allLogs: CycleLog[] = []
  let offset = 0
  for (let i = 0; i <= cycleLengths.length; i++) {
    const current = addDaysUTC(firstStart, offset)
    const extras = extraPerCycle[i] ?? {}
    allLogs.push(...makePeriodLogs(current, periodDays, extras))
    if (i < cycleLengths.length) {
      offset += cycleLengths[i]
    }
  }
  return allLogs
}

const BASE_SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  trackingEnabled: true,
}

// ---------- getConfidenceTier ----------

describe('getConfidenceTier', () => {
  it('returns learning when <3 cycles regardless of score', () => {
    expect(getConfidenceTier(99, 0)).toBe('learning')
    expect(getConfidenceTier(99, 2)).toBe('learning')
  })
  it('returns high for ≥75 confidence with ≥3 cycles', () => {
    expect(getConfidenceTier(75, 3)).toBe('high')
    expect(getConfidenceTier(100, 5)).toBe('high')
  })
  it('returns medium for 50-74', () => {
    expect(getConfidenceTier(50, 3)).toBe('medium')
    expect(getConfidenceTier(74, 4)).toBe('medium')
  })
  it('returns low for <50 with ≥3 cycles', () => {
    expect(getConfidenceTier(49, 3)).toBe('low')
    expect(getConfidenceTier(0, 10)).toBe('low')
  })
})

// ---------- getCycleDayFromDate ----------

describe('getCycleDayFromDate', () => {
  const starts = ['2024-01-01', '2024-02-01', '2024-03-01']

  it('returns day 1 on the period start date', () => {
    expect(getCycleDayFromDate('2024-01-01', starts)).toBe(1)
    expect(getCycleDayFromDate('2024-02-01', starts)).toBe(1)
  })
  it('returns correct day mid-cycle', () => {
    expect(getCycleDayFromDate('2024-01-15', starts)).toBe(15)
    expect(getCycleDayFromDate('2024-02-14', starts)).toBe(14)
  })
  it('returns null when date is before any known start', () => {
    expect(getCycleDayFromDate('2023-12-31', starts)).toBeNull()
  })
})

// ---------- buildCyclesIndex ----------

describe('buildCyclesIndex', () => {
  it('produces correct lengths for regular 28-day cycles', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28, 28])
    const index = buildCyclesIndex(logs)
    const completed = index.filter(c => c.length > 0)
    expect(completed).toHaveLength(3)
    completed.forEach(c => expect(c.length).toBe(28))
  })

  it('handles irregular cycles', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [24, 35, 28])
    const index = buildCyclesIndex(logs)
    const completed = index.filter(c => c.length > 0)
    expect(completed[0].length).toBe(24)
    expect(completed[1].length).toBe(35)
    expect(completed[2].length).toBe(28)
  })

  it('trailing entry has length 0', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28])
    const index = buildCyclesIndex(logs)
    expect(index[index.length - 1].length).toBe(0)
  })
})

// ---------- analyzeCyclePatterns ----------

describe('analyzeCyclePatterns', () => {
  it('returns learning tier with no history', () => {
    const result = analyzeCyclePatterns([], BASE_SETTINGS)
    expect(result.confidenceTier).toBe('learning')
    expect(result.projectedCycleLength).toBe(28)
    expect(result.cycleHistoryCount).toBe(0)
  })

  it('new user: no range dates without lastPeriodStart', () => {
    const result = analyzeCyclePatterns([], BASE_SETTINGS)
    expect(result.nextPeriodStart).toBeNull()
  })

  it('returns high confidence for 4 regular 28±1 day cycles', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 29, 28, 27])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const result = analyzeCyclePatterns(logs, settings)
    expect(result.confidenceTier).toBe('high')
    expect(result.projectedCycleLength).toBeGreaterThanOrEqual(27)
    expect(result.projectedCycleLength).toBeLessThanOrEqual(29)
    // Tight range
    const { earliest, latest } = result.nextPeriodRange
    expect(earliest).not.toBeNull()
    expect(latest).not.toBeNull()
    if (earliest && latest) {
      const width = Math.round(
        (latest.getTime() - earliest.getTime()) / 86400000
      )
      expect(width).toBeLessThanOrEqual(6) // tight = ≤6 days wide
    }
  })

  it('returns low confidence and wide range for variable cycles', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [24, 35, 28, 33])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const result = analyzeCyclePatterns(logs, settings)
    expect(result.confidenceTier).not.toBe('high')
    const { earliest, latest } = result.nextPeriodRange
    if (earliest && latest) {
      const width = Math.round(
        (latest.getTime() - earliest.getTime()) / 86400000
      )
      expect(width).toBeGreaterThan(4) // wider range for variable cycles
    }
  })

  it('populates reason array', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28, 28])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const result = analyzeCyclePatterns(logs, settings)
    expect(result.reason.length).toBeGreaterThan(0)
    expect(typeof result.reason[0]).toBe('string')
  })

  it('detects lengthening trend', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 30, 33])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const result = analyzeCyclePatterns(logs, settings)
    expect(result.trend).toBe('lengthening')
  })

  it('detects shortening trend', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [33, 30, 27])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const result = analyzeCyclePatterns(logs, settings)
    expect(result.trend).toBe('shortening')
  })

  it('detects irregular trend (high std dev)', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [21, 38, 24, 40])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const result = analyzeCyclePatterns(logs, settings)
    expect(result.trend).toBe('irregular')
  })
})

// ---------- adjustPredictionWithToday ----------

describe('adjustPredictionWithToday', () => {
  it('shifts prediction earlier when lead-indicator symptoms appear', () => {
    const firstStart = new Date('2024-01-01T00:00:00Z')
    const logs = buildSyntheticHistory(firstStart, [28, 28, 28])
    // Add cramps 5 days before each period end (day 24 of 28-day cycle).
    // daysBeforePeriod = 28 - 24 + 1 = 5
    const crampsLogs: CycleLog[] = [23, 51, 79].map(offsetDays => ({
      date: isoDate(addDaysUTC(firstStart, offsetDays)),
      flow: 'none' as const,
      symptoms: ['Cramps'],
      moods: [],
      painLevel: 4,
      energy: 5,
      notes: '',
    }))
    const allLogs = [...logs, ...crampsLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const prediction = analyzeCyclePatterns(allLogs, settings)
    const index = buildCyclesIndex(allLogs)
    const patterns = computeSymptomPatterns(allLogs, index, {
      projectedCycleLength: prediction.projectedCycleLength,
    })
    const leads = patterns.filter(p => p.isLeadIndicator)

    // Simulate today = 8 days before nextPeriodStart.
    // expectedStart from symptom = today + 5 = nextPeriodStart - 3 (earlier).
    const today = addDaysUTC(prediction.nextPeriodStart!, -8)
    const todayLog: CycleLog = {
      date: isoDate(today),
      flow: 'none',
      symptoms: ['Cramps'],
      moods: [],
      painLevel: 4,
      energy: 5,
      notes: '',
    }

    const adjusted = adjustPredictionWithToday(prediction, todayLog, leads, today)
    // Adjusted start should be earlier than (or equal to) original
    if (prediction.nextPeriodStart && adjusted.nextPeriodStart) {
      expect(adjusted.nextPeriodStart.getTime()).toBeLessThanOrEqual(
        prediction.nextPeriodStart.getTime()
      )
    }
    expect(adjusted.reason.length).toBeGreaterThan(prediction.reason.length)
  })

  it('shifts prediction later when expected bleeding has not appeared', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28, 28])
    const settings = { ...BASE_SETTINGS, lastPeriodStart: isoDate(firstStart) }
    const prediction = analyzeCyclePatterns(logs, settings)
    // Simulate today = 5 days after predicted latest
    const today = new Date(prediction.nextPeriodRange.latest!)
    today.setDate(today.getDate() + 5)
    const adjusted = adjustPredictionWithToday(prediction, null, [], today)
    if (prediction.nextPeriodStart && adjusted.nextPeriodStart) {
      expect(adjusted.nextPeriodStart.getTime()).toBeGreaterThan(
        prediction.nextPeriodStart.getTime()
      )
    }
  })
})

// ---------- computeSymptomPatterns ----------

describe('computeSymptomPatterns', () => {
  it('returns empty for no completed cycles', () => {
    const index: CycleHistoryEntry[] = [{ startDate: '2024-01-01', length: 0 }]
    const result = computeSymptomPatterns([], index)
    expect(result).toHaveLength(0)
  })

  it('detects a recurring symptom and correct cycle day', () => {
    const firstStart = new Date('2024-01-01')
    const cycleLengths = [28, 28, 28]
    const logs = buildSyntheticHistory(firstStart, cycleLengths)
    // Add Cramps on day 25 of each cycle.
    const crampLogs: CycleLog[] = [24, 52, 80].map(offset => {
      const d = new Date(firstStart)
      d.setDate(d.getDate() + offset)
      return {
        date: isoDate(d),
        flow: 'none',
        symptoms: ['Cramps'],
        moods: [],
        painLevel: 5,
        energy: 5,
        notes: '',
      }
    })
    const allLogs = [...logs, ...crampLogs]
    const index = buildCyclesIndex(allLogs)
    const patterns = computeSymptomPatterns(allLogs, index)
    const cramps = patterns.find(p => p.symptom === 'Cramps')
    expect(cramps).toBeDefined()
    expect(cramps?.avgCycleDay).toBeCloseTo(25, 0)
    expect(cramps?.isLeadIndicator).toBe(true) // day 25 of 28 = 4 days before
  })
})

// ---------- computePMDDProfile ----------

describe('computePMDDProfile', () => {
  it('returns hasPattern=false with <2 cycles of evidence', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28])
    const index = buildCyclesIndex(logs)
    const result = computePMDDProfile(logs, index, null)
    expect(result.hasPattern).toBe(false)
  })

  it('detects PMDD pattern when severe mood symptoms appear pre-period', () => {
    const firstStart = new Date('2024-01-01')
    const cycleLengths = [28, 28, 28]
    const logs = buildSyntheticHistory(firstStart, cycleLengths)
    // Add 'Severe mood swings' on days 22-25 of each cycle.
    const pmddLogs: CycleLog[] = [21, 22, 23, 49, 50, 51, 77, 78, 79].map(offset => {
      const d = new Date(firstStart)
      d.setDate(d.getDate() + offset)
      return {
        date: isoDate(d),
        flow: 'none',
        symptoms: ['Severe mood swings'],
        moods: ['Sad'],
        painLevel: 2,
        energy: 3,
        notes: '',
      }
    })
    const allLogs = [...logs, ...pmddLogs]
    const index = buildCyclesIndex(allLogs)
    const result = computePMDDProfile(allLogs, index, null)
    expect(result.hasPattern).toBe(true)
    expect(result.windowStartDay).toBeGreaterThanOrEqual(18)
    expect(result.cyclesObserved).toBeGreaterThanOrEqual(3)
  })
})

// ---------- computeEndoFlags ----------

describe('computeEndoFlags', () => {
  it('returns empty array with no flags', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28])
    const index = buildCyclesIndex(logs)
    const flags = computeEndoFlags(logs, index)
    expect(flags).toHaveLength(0)
  })

  it('flags high-pain-recurring after ≥2 cycles with pain ≥7', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28])
    const painLogs: CycleLog[] = [1, 29].map(offset => {
      const d = new Date(firstStart)
      d.setDate(d.getDate() + offset)
      return {
        date: isoDate(d),
        flow: 'medium',
        symptoms: ['Cramps'],
        moods: [],
        painLevel: 8,
        energy: 3,
        notes: '',
      }
    })
    const allLogs = [...logs, ...painLogs]
    const index = buildCyclesIndex(allLogs)
    const flags = computeEndoFlags(allLogs, index)
    expect(flags.some(f => f.pattern === 'high-pain-recurring')).toBe(true)
  })

  it('flags pain-outside-bleeding when pain ≥4 on non-flow days', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28])
    const painLogs: CycleLog[] = [10, 38].map(offset => {
      const d = new Date(firstStart)
      d.setDate(d.getDate() + offset)
      return {
        date: isoDate(d),
        flow: 'none',
        symptoms: ['Cramps'],
        moods: [],
        painLevel: 5,
        energy: 5,
        notes: '',
      }
    })
    const allLogs = [...logs, ...painLogs]
    const index = buildCyclesIndex(allLogs)
    const flags = computeEndoFlags(allLogs, index)
    expect(flags.some(f => f.pattern === 'pain-outside-bleeding')).toBe(true)
  })

  it('flags long-bleeding when >7 flow days in ≥2 cycles', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, [28, 28], 9) // 9-day periods
    const index = buildCyclesIndex(logs)
    const flags = computeEndoFlags(logs, index)
    expect(flags.some(f => f.pattern === 'long-bleeding')).toBe(true)
  })

  it('does NOT flag with only 1 cycle of evidence', () => {
    const firstStart = new Date('2024-01-01')
    const logs = buildSyntheticHistory(firstStart, []) // only 1 period
    const painLog: CycleLog = {
      date: isoDate(new Date(firstStart.getTime() + 10 * 86400000)),
      flow: 'none',
      symptoms: ['Cramps'],
      moods: [],
      painLevel: 8,
      energy: 3,
      notes: '',
    }
    const index = buildCyclesIndex([...logs, painLog])
    const flags = computeEndoFlags([...logs, painLog], index)
    // No completed cycles → no flags
    expect(flags).toHaveLength(0)
  })
})
