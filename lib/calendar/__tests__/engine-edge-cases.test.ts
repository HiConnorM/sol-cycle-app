/**
 * Edge cases for the prediction engine.
 *
 * The happy path lives in engine.test.ts. This file covers the awkward
 * inputs — empty, single, extreme, contradictory, malformed — and the
 * behaviour the product promises: that predictions adapt as a body changes,
 * and that uncertainty is reported honestly rather than hidden.
 */
import { describe, it, expect } from 'vitest'
import {
  analyzeCyclePatterns,
  getConfidenceTier,
  adjustPredictionWithToday,
} from '../cycle-predictions'
import { getCurrentCycleDay, getCycleDayFromDate, getCyclePhase, predictNextPeriod } from '../cycle-calculations'
import { buildCyclesIndex, detectPeriodStartDates } from '../../storage/cycle-storage'
import { buildCycleIndex, logsInCycle } from '../cycle-index'
import { computeSymptomPatterns } from '../symptom-patterns'
import { computePMDDProfile } from '../pmdd-profile'
import { computeEndoFlags } from '../endo-flags'
import { addDaysToKey, toDateKey } from '../../utils/date-keys'
import type { CycleLog, CycleSettings, CycleHistoryEntry } from '../../types'

const SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  trackingEnabled: true,
}

function log(date: string, extra: Partial<CycleLog> = {}): CycleLog {
  return {
    date,
    flow: 'none',
    symptoms: [],
    moods: [],
    painLevel: 0,
    energy: 5,
    notes: '',
    ...extra,
  }
}

/** Period logs for cycles of the given lengths, starting at `start`. */
function historyFromLengths(start: string, lengths: number[], periodDays = 5): CycleLog[] {
  const logs: CycleLog[] = []
  let key = start
  for (const length of lengths) {
    for (let d = 0; d < periodDays; d++) {
      logs.push(log(addDaysToKey(key, d), { flow: 'medium' }))
    }
    key = addDaysToKey(key, length)
  }
  // Final period so the last gap is a completed cycle.
  for (let d = 0; d < periodDays; d++) {
    logs.push(log(addDaysToKey(key, d), { flow: 'medium' }))
  }
  return logs
}

describe('analyzeCyclePatterns — empty and degenerate input', () => {
  it('falls back to the configured default with no logs at all', () => {
    const p = analyzeCyclePatterns([], SETTINGS)
    expect(p.projectedCycleLength).toBe(28)
    expect(p.cycleHistoryCount).toBe(0)
    expect(p.nextPeriodStart).toBeNull()
    expect(p.confidenceTier).toBe('learning')
    expect(p.reason.join(' ')).toContain('no completed cycles')
  })

  it('respects a non-default configured cycle length when there is no history', () => {
    const p = analyzeCyclePatterns([], { ...SETTINGS, averageCycleLength: 35 })
    expect(p.projectedCycleLength).toBe(35)
  })

  it('produces no prediction from logs that record no bleeding', () => {
    const logs = ['2026-01-01', '2026-01-02'].map(d => log(d, { flow: 'none' }))
    expect(analyzeCyclePatterns(logs, SETTINGS).nextPeriodStart).toBeNull()
  })

  it('anchors on the settings date when logs exist but no period start does', () => {
    const p = analyzeCyclePatterns(
      [log('2026-01-10', { flow: 'none' })],
      { ...SETTINGS, lastPeriodStart: '2026-01-01' }
    )
    expect(p.nextPeriodStart).not.toBeNull()
    expect(toDateKey(p.nextPeriodStart!)).toBe('2026-01-29')
  })

  it('stays in the learning tier after a single cycle', () => {
    const logs = historyFromLengths('2026-01-01', [28])
    const p = analyzeCyclePatterns(logs, SETTINGS)
    expect(p.cycleHistoryCount).toBe(1)
    expect(p.confidenceTier).toBe('learning')
  })
})

describe('analyzeCyclePatterns — extreme and irregular histories', () => {
  it('ignores an implausibly long gap rather than predicting from it', () => {
    // A 200-day gap is missed logging, not a 200-day cycle.
    const logs = historyFromLengths('2026-01-01', [200])
    const p = analyzeCyclePatterns(logs, SETTINGS)
    expect(p.cycleHistoryCount).toBe(0)
    expect(p.projectedCycleLength).toBe(28)
  })

  it('handles the shortest cycles it will accept', () => {
    const p = analyzeCyclePatterns(historyFromLengths('2026-01-01', [21, 21, 21, 21]), SETTINGS)
    expect(p.projectedCycleLength).toBe(21)
    expect(p.confidence).toBeGreaterThan(90)
  })

  it('handles the longest cycles it will accept', () => {
    const p = analyzeCyclePatterns(historyFromLengths('2026-01-01', [45, 45, 45, 45]), SETTINGS)
    expect(p.projectedCycleLength).toBe(45)
  })

  it('reports wildly irregular cycles as irregular with low confidence', () => {
    const p = analyzeCyclePatterns(
      historyFromLengths('2026-01-01', [21, 44, 23, 41, 22, 45]),
      SETTINGS
    )
    expect(p.trend).toBe('irregular')
    expect(p.confidence).toBeLessThan(30)
    expect(p.reason.join(' ').toLowerCase()).toContain('varies')
  })

  it('widens the prediction window when cycles vary', () => {
    const steady = analyzeCyclePatterns(historyFromLengths('2026-01-01', [28, 28, 28, 28]), SETTINGS)
    const erratic = analyzeCyclePatterns(historyFromLengths('2026-01-01', [22, 34, 24, 33]), SETTINGS)

    const width = (p: typeof steady) =>
      p.nextPeriodRange.latest!.getTime() - p.nextPeriodRange.earliest!.getTime()
    expect(width(erratic)).toBeGreaterThan(width(steady))
  })

  it('never collapses the range to zero, even for a perfectly regular user', () => {
    const p = analyzeCyclePatterns(historyFromLengths('2026-01-01', [28, 28, 28, 28, 28]), SETTINGS)
    expect(p.nextPeriodRange.earliest!.getTime()).toBeLessThan(p.nextPeriodStart!.getTime())
    expect(p.nextPeriodRange.latest!.getTime()).toBeGreaterThan(p.nextPeriodStart!.getTime())
  })

  it('detects a lengthening trend', () => {
    const p = analyzeCyclePatterns(historyFromLengths('2026-01-01', [26, 27, 28, 31]), SETTINGS)
    expect(p.trend).toBe('lengthening')
  })

  it('detects a shortening trend', () => {
    const p = analyzeCyclePatterns(historyFromLengths('2026-01-01', [33, 31, 29, 26]), SETTINGS)
    expect(p.trend).toBe('shortening')
  })
})

describe('adaptivity — the engine tracks the body it is looking at', () => {
  it('weights recent cycles more heavily than old ones', () => {
    // Long-settled at 30 after a run of 26s: the projection should sit nearer 30.
    const p = analyzeCyclePatterns(
      historyFromLengths('2024-01-01', [26, 26, 26, 26, 30, 30, 30, 30]),
      SETTINGS
    )
    expect(p.projectedCycleLength).toBeGreaterThanOrEqual(29)
  })

  it('recovers confidence once an erratic user settles down', () => {
    // Erratic for six cycles, then six steady ones. Confidence should reflect
    // the steady present, not the erratic past.
    const settled = analyzeCyclePatterns(
      historyFromLengths('2024-01-01', [21, 45, 23, 42, 24, 44, 28, 28, 28, 28, 28, 28]),
      SETTINGS
    )
    expect(settled.confidence).toBeGreaterThan(80)
    expect(settled.trend).toBe('regular')
  })

  it('still reports low confidence for a user who is erratic right now', () => {
    const erratic = analyzeCyclePatterns(
      historyFromLengths('2024-01-01', [28, 28, 28, 28, 28, 28, 21, 45, 23, 42, 24, 44]),
      SETTINGS
    )
    expect(erratic.confidence).toBeLessThan(40)
    expect(erratic.trend).toBe('irregular')
  })

  it('moves its projection as a user’s cycle genuinely changes', () => {
    const before = analyzeCyclePatterns(historyFromLengths('2024-01-01', [28, 28, 28, 28]), SETTINGS)
    const after = analyzeCyclePatterns(
      historyFromLengths('2024-01-01', [28, 28, 28, 28, 32, 33, 34, 34]),
      SETTINGS
    )
    expect(after.projectedCycleLength).toBeGreaterThan(before.projectedCycleLength)
  })
})

describe('getConfidenceTier', () => {
  it('is always learning below three cycles, whatever the number says', () => {
    expect(getConfidenceTier(100, 0)).toBe('learning')
    expect(getConfidenceTier(100, 2)).toBe('learning')
  })

  it('maps the bands at their boundaries', () => {
    expect(getConfidenceTier(75, 3)).toBe('high')
    expect(getConfidenceTier(74, 3)).toBe('medium')
    expect(getConfidenceTier(50, 3)).toBe('medium')
    expect(getConfidenceTier(49, 3)).toBe('low')
    expect(getConfidenceTier(0, 3)).toBe('low')
  })
})

describe('adjustPredictionWithToday', () => {
  const base = () => analyzeCyclePatterns(historyFromLengths('2026-01-01', [28, 28, 28, 28]), SETTINGS)

  it('returns the prediction untouched when there is nothing to go on', () => {
    const p = base()
    // `today` has to sit inside the predicted window, otherwise the
    // "bleeding never arrived" branch legitimately shifts the estimate.
    const insideWindow = new Date(p.nextPeriodStart!.getTime())
    const adjusted = adjustPredictionWithToday(p, null, [], insideWindow)
    expect(adjusted.nextPeriodStart).toEqual(p.nextPeriodStart)
  })

  it('never mutates the prediction it is given', () => {
    const p = base()
    const before = p.nextPeriodStart!.getTime()
    const beforeReasons = p.reason.length
    adjustPredictionWithToday(p, log('2026-05-01', { symptoms: ['Cramps'] }), [])
    expect(p.nextPeriodStart!.getTime()).toBe(before)
    expect(p.reason.length).toBe(beforeReasons)
  })

  it('passes through a prediction that has no start date', () => {
    const empty = analyzeCyclePatterns([], SETTINGS)
    expect(adjustPredictionWithToday(empty, null, []).nextPeriodStart).toBeNull()
  })

  it('pushes the estimate later once the window has passed with no bleeding', () => {
    const p = base()
    const wellPast = new Date(p.nextPeriodRange.latest!.getTime() + 3 * 86_400_000)
    const adjusted = adjustPredictionWithToday(p, log('2026-06-01'), [], wellPast)
    expect(adjusted.nextPeriodStart!.getTime()).toBeGreaterThanOrEqual(p.nextPeriodStart!.getTime())
  })
})

describe('getCurrentCycleDay', () => {
  it('rejects malformed anchors instead of returning a wild number', () => {
    expect(getCurrentCycleDay('not-a-date')).toBeNull()
    expect(getCurrentCycleDay('2026-13-45')).toBeNull()
    expect(getCurrentCycleDay('')).toBeNull()
  })

  it('returns null with no anchor', () => {
    expect(getCurrentCycleDay(null)).toBeNull()
  })

  it('counts the start day itself as day 1', () => {
    expect(getCurrentCycleDay(toDateKey(new Date()))).toBe(1)
  })
})

describe('getCycleDayFromDate', () => {
  const starts = ['2026-01-01', '2026-01-29', '2026-02-26']

  it('returns null before any known cycle', () => {
    expect(getCycleDayFromDate('2025-12-31', starts)).toBeNull()
  })

  it('returns null when there are no starts', () => {
    expect(getCycleDayFromDate('2026-01-05', [])).toBeNull()
  })

  it('counts from the most recent start at or before the date', () => {
    expect(getCycleDayFromDate('2026-01-01', starts)).toBe(1)
    expect(getCycleDayFromDate('2026-01-28', starts)).toBe(28)
    expect(getCycleDayFromDate('2026-01-29', starts)).toBe(1)
    expect(getCycleDayFromDate('2026-03-01', starts)).toBe(4)
  })

  it('is unaffected by the order the starts are given in', () => {
    const shuffled = ['2026-02-26', '2026-01-01', '2026-01-29']
    expect(getCycleDayFromDate('2026-01-30', shuffled)).toBe(2)
  })

  it('ignores malformed starts rather than throwing', () => {
    expect(getCycleDayFromDate('2026-01-30', ['nope', '2026-01-29'])).toBe(2)
  })
})

describe('getCyclePhase', () => {
  it('covers every day of a 28-day cycle without gaps', () => {
    const seen = new Set<string>()
    for (let day = 1; day <= 28; day++) seen.add(getCyclePhase(day, 28, 5))
    expect(seen).toEqual(new Set(['menstrual', 'follicular', 'ovulatory', 'luteal']))
  })

  it('treats the whole period as menstrual', () => {
    for (let day = 1; day <= 5; day++) expect(getCyclePhase(day, 28, 5)).toBe('menstrual')
    expect(getCyclePhase(6, 28, 5)).not.toBe('menstrual')
  })

  it('scales the phases to a short cycle', () => {
    expect(getCyclePhase(1, 21, 4)).toBe('menstrual')
    expect(getCyclePhase(21, 21, 4)).toBe('luteal')
  })

  it('scales the phases to a long cycle', () => {
    expect(getCyclePhase(45, 45, 5)).toBe('luteal')
    expect(getCyclePhase(22, 45, 5)).toBe('ovulatory')
  })
})

describe('predictNextPeriod', () => {
  it('adds the cycle length to the anchor', () => {
    expect(toDateKey(predictNextPeriod('2026-01-01', 28)!)).toBe('2026-01-29')
  })

  it('rejects a malformed anchor', () => {
    expect(predictNextPeriod('garbage', 28)).toBeNull()
    expect(predictNextPeriod(null, 28)).toBeNull()
  })

  it('crosses a year boundary correctly', () => {
    expect(toDateKey(predictNextPeriod('2026-12-20', 28)!)).toBe('2027-01-17')
  })
})

describe('buildCycleIndex', () => {
  const cycles: CycleHistoryEntry[] = [
    { startDate: '2026-01-01', length: 28 },
    { startDate: '2026-01-29', length: 28 },
    { startDate: '2026-02-26', length: 0 },
  ]

  it('is empty when there are no cycles', () => {
    const index = buildCycleIndex([log('2026-01-05')], [])
    expect(index.annotated).toEqual([])
  })

  it('is empty when there are no logs', () => {
    expect(buildCycleIndex([], cycles).annotated).toEqual([])
  })

  it('drops logs that predate every known cycle', () => {
    const index = buildCycleIndex([log('2025-12-01'), log('2026-01-05')], cycles)
    expect(index.annotated.map(l => l.date)).toEqual(['2026-01-05'])
  })

  it('assigns each log to the cycle containing it', () => {
    const index = buildCycleIndex(
      [log('2026-01-05'), log('2026-02-01'), log('2026-03-01')],
      cycles
    )
    expect(index.annotated.map(l => l.cycleStart)).toEqual([
      '2026-01-01', '2026-01-29', '2026-02-26',
    ])
    expect(index.annotated.map(l => l.cycleDay)).toEqual([5, 4, 4])
  })

  it('is insensitive to the order logs arrive in', () => {
    const forward = buildCycleIndex([log('2026-01-05'), log('2026-02-01')], cycles)
    const reversed = buildCycleIndex([log('2026-02-01'), log('2026-01-05')], cycles)
    expect(reversed.annotated).toEqual(forward.annotated)
  })

  it('bounds a completed cycle by its recorded length', () => {
    const index = buildCycleIndex(
      [log('2026-01-01'), log('2026-01-28'), log('2026-01-29')],
      cycles
    )
    expect(logsInCycle(index, '2026-01-01').map(l => l.date)).toEqual([
      '2026-01-01', '2026-01-28',
    ])
  })

  it('leaves the trailing open cycle unbounded', () => {
    const index = buildCycleIndex([log('2026-02-26'), log('2026-04-15')], cycles)
    expect(logsInCycle(index, '2026-02-26')).toHaveLength(2)
  })

  it('skips malformed dates instead of throwing', () => {
    const index = buildCycleIndex([log('nonsense'), log('2026-01-05')], cycles)
    expect(index.annotated.map(l => l.date)).toEqual(['2026-01-05'])
  })

  it('returns an empty group for a cycle with no logs', () => {
    expect(logsInCycle(buildCycleIndex([], cycles), '2026-01-01')).toEqual([])
    expect(logsInCycle(buildCycleIndex([], cycles), 'unknown-cycle')).toEqual([])
  })
})

describe('analysis modules gate on evidence', () => {
  it('reports no symptom patterns without cycles', () => {
    expect(computeSymptomPatterns([log('2026-01-01', { symptoms: ['Cramps'] })], [], {
      projectedCycleLength: 28,
    })).toEqual([])
  })

  it('reports no PMDD pattern on a single cycle', () => {
    const logs = historyFromLengths('2026-01-01', [28])
    const index = buildCyclesIndex(logs)
    const profile = computePMDDProfile(logs, index, analyzeCyclePatterns(logs, SETTINGS))
    expect(profile.hasPattern).toBe(false)
  })

  it('raises no endo flags on a single cycle', () => {
    const logs = historyFromLengths('2026-01-01', [28])
    expect(computeEndoFlags(logs, buildCyclesIndex(logs))).toEqual([])
  })

  it('never phrases an endo flag as a diagnosis', () => {
    // Severe pain every day across several cycles — the strongest signal
    // the heuristics can see. It must still read as a pattern, not a verdict.
    const logs: CycleLog[] = []
    let key = '2026-01-01'
    for (let c = 0; c < 4; c++) {
      for (let d = 0; d < 28; d++) {
        logs.push(log(addDaysToKey(key, d), {
          flow: d < 5 ? 'heavy' : 'none',
          painLevel: 9,
          painLocations: ['Bowel', 'Bladder'],
        }))
      }
      key = addDaysToKey(key, 28)
    }
    const flags = computeEndoFlags(logs, buildCyclesIndex(logs))
    expect(flags.length).toBeGreaterThan(0)
    for (const flag of flags) {
      const text = `${flag.title} ${flag.description} ${flag.evidence} ${flag.suggestedAction}`
      expect(text.toLowerCase()).not.toContain('endometriosis')
      expect(text.toLowerCase()).not.toContain('diagnos')
      expect(flag.suggestedAction.toLowerCase()).toContain('clinician')
    }
  })
})

describe('detectPeriodStartDates — awkward log sequences', () => {
  it('handles an empty list', () => {
    expect(detectPeriodStartDates([])).toEqual([])
  })

  it('treats a one-day gap in logging mid-period as the same period', () => {
    const logs = [
      log('2026-01-01', { flow: 'medium' }),
      log('2026-01-02', { flow: 'medium' }),
      // 2026-01-03 not logged at all
      log('2026-01-04', { flow: 'medium' }),
    ]
    // The gap is larger than one day, so this reads as a new start — the
    // engine cannot tell an unlogged day from a stopped period.
    expect(detectPeriodStartDates(logs)).toEqual(['2026-01-01', '2026-01-04'])
  })

  it('starts a new period after spotting resumes as flow', () => {
    const logs = [
      log('2026-01-01', { flow: 'medium' }),
      log('2026-01-02', { flow: 'spotting' }),
      log('2026-01-03', { flow: 'medium' }),
    ]
    expect(detectPeriodStartDates(logs)).toEqual(['2026-01-01', '2026-01-03'])
  })

  it('ignores duplicate dates rather than double-counting them', () => {
    const logs = [
      log('2026-01-01', { flow: 'medium' }),
      log('2026-01-01', { flow: 'heavy' }),
    ]
    expect(detectPeriodStartDates(logs)).toHaveLength(1)
  })
})

describe('buildCyclesIndex — boundary lengths', () => {
  it('accepts a 20-day cycle but not a 19-day one', () => {
    expect(buildCyclesIndex(historyFromLengths('2026-01-01', [20]))[0].length).toBe(20)
    expect(buildCyclesIndex(historyFromLengths('2026-01-01', [19]))[0].length).toBe(0)
  })

  it('accepts a 45-day cycle but not a 46-day one', () => {
    expect(buildCyclesIndex(historyFromLengths('2026-01-01', [45]))[0].length).toBe(45)
    expect(buildCyclesIndex(historyFromLengths('2026-01-01', [46]))[0].length).toBe(0)
  })

  it('spans a leap day without drift', () => {
    // 2028 is a leap year: Feb 1 + 29 days lands on Mar 1.
    const logs = [
      log('2028-02-01', { flow: 'medium' }),
      log('2028-03-01', { flow: 'medium' }),
    ]
    expect(buildCyclesIndex(logs)[0].length).toBe(29)
  })
})
