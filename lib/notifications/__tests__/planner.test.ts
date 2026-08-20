/**
 * Notification planner tests.
 *
 * A mis-scheduled reminder is invisible until it fires on the wrong day in
 * someone's real life, so the rules get the same treatment as the prediction
 * engine: fixed `now`, explicit expectations, and the awkward cases covered.
 */
import { describe, it, expect } from 'vitest'
import { planNotifications } from '../planner'
import type { NotificationPreferences } from '../types'
import type { CyclePrediction, SymptomPattern } from '@/lib/types'
import { addDays, toDateKey } from '@/lib/utils/date-keys'

const NOW = new Date(2026, 7, 18, 10, 0) // Tue 18 Aug 2026, 10am local

const ALL_ON: NotificationPreferences = {
  notificationsEnabled: true,
  dailyCheckIn: true,
  phaseChangeAlerts: true,
  pmddAlerts: true,
  hardDayAlerts: true,
  mealSuggestions: true,
  quietMode: false,
  discreetNotifications: false,
}

const ALL_OFF: NotificationPreferences = {
  notificationsEnabled: true,
  dailyCheckIn: false,
  phaseChangeAlerts: false,
  pmddAlerts: false,
  hardDayAlerts: false,
  mealSuggestions: false,
  quietMode: false,
  discreetNotifications: false,
}

function prediction(overrides: Partial<CyclePrediction> = {}): CyclePrediction {
  return {
    nextPeriodStart: new Date(2026, 8, 5),
    nextPeriodRange: { earliest: new Date(2026, 8, 3), latest: new Date(2026, 8, 7) },
    nextOvulation: new Date(2026, 7, 22),
    pmddWindowStart: new Date(2026, 7, 26),
    pmddWindowEnd: new Date(2026, 8, 4),
    pmddWindowStartDay: 18,
    pmddWindowEndDay: 28,
    confidence: 80,
    confidenceTier: 'high',
    projectedCycleLength: 28,
    cycleLengthStdDev: 1.5,
    trend: 'regular',
    reason: [],
    cycleHistoryCount: 5,
    ...overrides,
  }
}

function plan(
  preferences: NotificationPreferences,
  extra: Partial<Parameters<typeof planNotifications>[0]> = {}
) {
  return planNotifications({
    prediction: prediction(),
    symptomPatterns: [],
    preferences,
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: '2026-08-15',
    now: NOW,
    ...extra,
  })
}

const kinds = (p: ReturnType<typeof plan>) => new Set(p.map(n => n.kind))

describe('master switches', () => {
  it('plans nothing when notifications are off', () => {
    expect(plan({ ...ALL_ON, notificationsEnabled: false })).toEqual([])
  })

  it('plans nothing in quiet mode, even with every alert on', () => {
    expect(plan({ ...ALL_ON, quietMode: true })).toEqual([])
  })

  it('plans nothing when every individual alert is off', () => {
    expect(plan(ALL_OFF)).toEqual([])
  })

  it('plans something when notifications are on', () => {
    expect(plan(ALL_ON).length).toBeGreaterThan(0)
  })
})

describe('scheduling window', () => {
  it('never schedules in the past', () => {
    for (const n of plan(ALL_ON)) {
      expect(n.at.getTime()).toBeGreaterThan(NOW.getTime())
    }
  })

  it('never schedules beyond the 30-day horizon', () => {
    const horizon = addDays(NOW, 30).getTime() + 86_400_000
    for (const n of plan(ALL_ON)) {
      expect(n.at.getTime()).toBeLessThan(horizon)
    }
  })

  it('stays well inside the iOS 64-notification limit', () => {
    expect(plan(ALL_ON).length).toBeLessThan(64)
  })

  it('returns notifications in chronological order', () => {
    const times = plan(ALL_ON).map(n => n.at.getTime())
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })

  it('assigns every notification a unique id', () => {
    const p = plan(ALL_ON)
    expect(new Set(p.map(n => n.id)).size).toBe(p.length)
  })
})

describe('idempotence', () => {
  it('produces identical ids for identical input', () => {
    const first = plan(ALL_ON).map(n => n.id)
    const second = plan(ALL_ON).map(n => n.id)
    expect(second).toEqual(first)
  })

  it('keeps the same id for the same kind on the same day across re-plans', () => {
    // Re-planning an hour later must not create a second daily reminder.
    const later = plan(ALL_ON, { now: new Date(2026, 7, 18, 11, 0) })
    const first = plan(ALL_ON)
    const firstDaily = first.filter(n => n.kind === 'daily-check-in')
    const laterDaily = later.filter(n => n.kind === 'daily-check-in')
    const overlap = firstDaily.filter(n => laterDaily.some(l => l.id === n.id))
    expect(overlap.length).toBeGreaterThan(0)
  })
})

describe('daily check-in', () => {
  it('schedules one per day for the horizon', () => {
    const daily = plan({ ...ALL_OFF, dailyCheckIn: true })
    expect(daily.length).toBeGreaterThanOrEqual(28)
    expect(kinds(daily)).toEqual(new Set(['daily-check-in']))
  })

  it('schedules at most one per calendar day', () => {
    const days = plan({ ...ALL_OFF, dailyCheckIn: true }).map(n => toDateKey(n.at))
    expect(new Set(days).size).toBe(days.length)
  })

  it('fires in the evening, once the day has happened', () => {
    for (const n of plan({ ...ALL_OFF, dailyCheckIn: true })) {
      expect(n.at.getHours()).toBe(20)
    }
  })

  it('skips today when its slot has already passed', () => {
    const lateEvening = new Date(2026, 7, 18, 22, 0) // after the 20:00 slot
    const first = plan({ ...ALL_OFF, dailyCheckIn: true }, { now: lateEvening })[0]
    expect(toDateKey(first.at)).toBe('2026-08-19')
  })
})

describe('phase change alerts', () => {
  it('plans nothing without a cycle anchor', () => {
    const p = plan({ ...ALL_OFF, phaseChangeAlerts: true }, { lastPeriodStart: null })
    expect(p).toEqual([])
  })

  it('fires on phase boundaries, not every day', () => {
    const p = plan({ ...ALL_OFF, phaseChangeAlerts: true })
    // A 28-day cycle has four phases; a 30-day horizon crosses a handful.
    expect(p.length).toBeGreaterThan(0)
    expect(p.length).toBeLessThan(8)
  })

  it('names the phase being entered', () => {
    const p = plan({ ...ALL_OFF, phaseChangeAlerts: true })
    for (const n of p) {
      expect(n.title.toLowerCase()).toMatch(/menstrual|follicular|ovulatory|luteal/)
    }
  })
})

describe('PMDD window alert', () => {
  it('fires once, at the start of the window', () => {
    const p = plan({ ...ALL_OFF, pmddAlerts: true })
    expect(p).toHaveLength(1)
    expect(toDateKey(p[0].at)).toBe('2026-08-26')
  })

  it('plans nothing when there is no predicted window', () => {
    const p = plan(
      { ...ALL_OFF, pmddAlerts: true },
      { prediction: prediction({ pmddWindowStart: null }) }
    )
    expect(p).toEqual([])
  })

  it('describes the window without predicting how the user will feel', () => {
    const [n] = plan({ ...ALL_OFF, pmddAlerts: true })
    const text = `${n.title} ${n.body}`.toLowerCase()
    expect(text).not.toContain('you will')
    expect(text).not.toContain('diagnos')
    expect(text).toContain('some people')
  })

  it('skips a window that falls outside the horizon', () => {
    const p = plan(
      { ...ALL_OFF, pmddAlerts: true },
      { prediction: prediction({ pmddWindowStart: new Date(2026, 10, 1) }) }
    )
    expect(p).toEqual([])
  })
})

describe('hard-day alerts', () => {
  const lead = (overrides: Partial<SymptomPattern> = {}): SymptomPattern => ({
    symptom: 'Cramps',
    frequency: 0.8,
    avgCycleDay: 26,
    spread: 1,
    phase: 'luteal',
    occurrences: 4,
    isLeadIndicator: true,
    daysBeforePeriod: 2,
    ...overrides,
  })

  it('uses the user’s own lead-indicator symptoms', () => {
    const p = plan({ ...ALL_OFF, hardDayAlerts: true }, { symptomPatterns: [lead()] })
    expect(p).toHaveLength(1)
    expect(p[0].body.toLowerCase()).toContain('cramps')
  })

  it('lands the day before the symptom typically appears', () => {
    const p = plan({ ...ALL_OFF, hardDayAlerts: true }, { symptomPatterns: [lead()] })
    // Period 5 Sep, symptom 2 days before (3 Sep), alert the day before that.
    expect(toDateKey(p[0].at)).toBe('2026-09-02')
  })

  it('ignores symptoms that are not lead indicators', () => {
    const p = plan(
      { ...ALL_OFF, hardDayAlerts: true },
      { symptomPatterns: [lead({ isLeadIndicator: false })] }
    )
    expect(p).toEqual([])
  })

  it('ignores weak patterns', () => {
    const p = plan(
      { ...ALL_OFF, hardDayAlerts: true },
      { symptomPatterns: [lead({ frequency: 0.3 })] }
    )
    expect(p).toEqual([])
  })

  it('uses at most the two strongest patterns', () => {
    const patterns = ['Cramps', 'Headache', 'Fatigue', 'Bloating'].map((symptom, i) =>
      lead({ symptom, frequency: 0.9 - i * 0.05, daysBeforePeriod: 2 + i })
    )
    const p = plan({ ...ALL_OFF, hardDayAlerts: true }, { symptomPatterns: patterns })
    expect(p.length).toBeLessThanOrEqual(2)
  })

  it('plans nothing without a predicted period', () => {
    const p = plan(
      { ...ALL_OFF, hardDayAlerts: true },
      { symptomPatterns: [lead()], prediction: prediction({ nextPeriodStart: null }) }
    )
    expect(p).toEqual([])
  })
})

describe('meal suggestions', () => {
  it('sends one per phase rather than one per day', () => {
    const p = plan({ ...ALL_OFF, mealSuggestions: true })
    expect(p.length).toBeGreaterThan(0)
    expect(p.length).toBeLessThanOrEqual(4)
  })

  it('plans nothing without a cycle anchor', () => {
    const p = plan({ ...ALL_OFF, mealSuggestions: true }, { lastPeriodStart: null })
    expect(p).toEqual([])
  })
})

describe('content safety', () => {
  it('never uses diagnostic language in any notification', () => {
    const patterns: SymptomPattern[] = [
      {
        symptom: 'Cramps',
        frequency: 0.9,
        avgCycleDay: 26,
        spread: 1,
        phase: 'luteal',
        occurrences: 5,
        isLeadIndicator: true,
        daysBeforePeriod: 2,
      },
    ]
    for (const n of plan(ALL_ON, { symptomPatterns: patterns })) {
      const text = `${n.title} ${n.body}`.toLowerCase()
      expect(text).not.toContain('diagnos')
      expect(text).not.toContain('endometriosis')
      expect(text).not.toContain('disorder')
      expect(text).not.toMatch(/\byou (will|should take|must)\b/)
    }
  })

  it('gives every notification a non-empty title and body', () => {
    for (const n of plan(ALL_ON)) {
      expect(n.title.trim().length).toBeGreaterThan(0)
      expect(n.body.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('discreet mode', () => {
  const DISCREET: NotificationPreferences = { ...ALL_ON, discreetNotifications: true }

  /** The words that must never reach a lock screen in discreet mode. */
  const REVEALING = [
    'menstrual',
    'follicular',
    'ovulatory',
    'luteal',
    'period',
    'pre-period',
    'cramps',
    'cycle',
    'phase',
    'ovulation',
  ]

  const leadPattern: SymptomPattern = {
    symptom: 'Cramps',
    frequency: 0.9,
    avgCycleDay: 26,
    spread: 1,
    phase: 'luteal',
    occurrences: 5,
    isLeadIndicator: true,
    daysBeforePeriod: 2,
  }

  it('says nothing about the body in any notification', () => {
    const planned = plan(DISCREET, { symptomPatterns: [leadPattern] })
    expect(planned.length).toBeGreaterThan(0)
    for (const n of planned) {
      const text = `${n.title} ${n.body}`.toLowerCase()
      for (const word of REVEALING) {
        // 'Sol Cycle' is the app name, which iOS shows regardless; it is the
        // only place the word 'cycle' may appear.
        const withoutAppName = text.replace(/sol cycle/g, '')
        expect(withoutAppName, `${word} in "${n.title} / ${n.body}"`).not.toContain(word)
      }
    }
  })

  it('names a symptom in normal mode but not in discreet mode', () => {
    const normal = plan({ ...ALL_OFF, hardDayAlerts: true }, { symptomPatterns: [leadPattern] })
    expect(normal[0].body.toLowerCase()).toContain('cramps')

    const discreet = plan(
      { ...ALL_OFF, hardDayAlerts: true, discreetNotifications: true },
      { symptomPatterns: [leadPattern] }
    )
    expect(discreet[0].body.toLowerCase()).not.toContain('cramps')
  })

  it('names the phase in normal mode but not in discreet mode', () => {
    const normal = plan({ ...ALL_OFF, phaseChangeAlerts: true })
    expect(normal.some(n => /menstrual|follicular|ovulatory|luteal/i.test(n.title))).toBe(true)

    const discreet = plan({ ...ALL_OFF, phaseChangeAlerts: true, discreetNotifications: true })
    expect(discreet.some(n => /menstrual|follicular|ovulatory|luteal/i.test(n.title))).toBe(false)
  })

  it('still tells the user there is something to look at', () => {
    for (const n of plan(DISCREET, { symptomPatterns: [leadPattern] })) {
      expect(n.title.trim().length).toBeGreaterThan(0)
      expect(n.body.trim().length).toBeGreaterThan(0)
    }
  })

  it('changes only the wording, never the schedule', () => {
    // Turning discreet mode on must not drop, add, or move a reminder.
    const normal = plan(ALL_ON, { symptomPatterns: [leadPattern] })
    const discreet = plan(DISCREET, { symptomPatterns: [leadPattern] })

    expect(discreet.map(n => n.id)).toEqual(normal.map(n => n.id))
    expect(discreet.map(n => n.at.getTime())).toEqual(normal.map(n => n.at.getTime()))
    expect(discreet.map(n => n.kind)).toEqual(normal.map(n => n.kind))
  })

  it('covers every notification kind that can be planned', () => {
    // A new kind added to the planner without discreet wording would surface
    // here as an undefined body rather than shipping a leak.
    const kinds = new Set(plan(DISCREET, { symptomPatterns: [leadPattern] }).map(n => n.kind))
    expect(kinds.size).toBeGreaterThan(0)
    for (const n of plan(DISCREET, { symptomPatterns: [leadPattern] })) {
      expect(n.body, n.kind).toBeTypeOf('string')
      expect(n.body).not.toBe('undefined')
    }
  })

  it('is off in the fixtures used by the other suites', () => {
    // Guards against a future default flip silently rewriting those assertions.
    expect(ALL_ON.discreetNotifications).toBe(false)
    expect(ALL_OFF.discreetNotifications).toBe(false)
  })
})
