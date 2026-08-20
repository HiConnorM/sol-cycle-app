import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  toDateKey,
  todayKey,
  fromDateKey,
  startOfLocalDay,
  daysBetween,
  daysBetweenKeys,
  addDays,
  addDaysToKey,
  isValidDateKey,
} from '../date-keys'

// getTimezoneOffset() is minutes of UTC ahead of local: positive west of UTC
// (America/*), negative east of it (Europe/*, Asia/*), zero at UTC itself.
// Which end of the day diverges from the UTC day depends on that sign, so the
// tests below derive it rather than assuming a single zone.
const OFFSET_MINUTES = new Date(2026, 7, 18).getTimezoneOffset()
const WEST_OF_UTC = OFFSET_MINUTES > 0
const EAST_OF_UTC = OFFSET_MINUTES < 0
const utcDayOf = (d: Date) => d.toISOString().split('T')[0]

afterEach(() => {
  vi.useRealTimers()
})

describe('toDateKey', () => {
  it('formats a date as local YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 7, 18))).toBe('2026-08-18')
  })

  it('zero-pads single-digit months and days', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('uses the local day late at night, when western zones have rolled into the next UTC day', () => {
    // 11:30pm on the 18th in America/* is already the 19th in UTC. The old
    // `toISOString().split('T')[0]` returned "2026-08-19" here and filed the
    // log under tomorrow.
    const lateEvening = new Date(2026, 7, 18, 23, 30)
    expect(toDateKey(lateEvening)).toBe('2026-08-18')
    if (WEST_OF_UTC) {
      expect(utcDayOf(lateEvening)).toBe('2026-08-19')
      expect(toDateKey(lateEvening)).not.toBe(utcDayOf(lateEvening))
    }
  })

  it('uses the local day early in the morning, when eastern zones are still on the previous UTC day', () => {
    // The mirror-image failure: 00:30 in Asia/Tokyo is still the 17th in UTC,
    // so the old code filed the log under yesterday.
    const earlyMorning = new Date(2026, 7, 18, 0, 30)
    expect(toDateKey(earlyMorning)).toBe('2026-08-18')
    if (EAST_OF_UTC) {
      expect(utcDayOf(earlyMorning)).toBe('2026-08-17')
      expect(toDateKey(earlyMorning)).not.toBe(utcDayOf(earlyMorning))
    }
  })

  it('uses the local day just before midnight', () => {
    expect(toDateKey(new Date(2026, 7, 18, 23, 59, 59))).toBe('2026-08-18')
  })

  it('uses the local day just after midnight', () => {
    expect(toDateKey(new Date(2026, 7, 18, 0, 0, 1))).toBe('2026-08-18')
  })
})

describe('todayKey', () => {
  it('returns the local calendar day even at 11pm', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 18, 23, 0, 0))
    expect(todayKey()).toBe('2026-08-18')
  })

  it('rolls over at local midnight, not at the UTC boundary', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 18, 23, 59, 59))
    expect(todayKey()).toBe('2026-08-18')
    vi.setSystemTime(new Date(2026, 7, 19, 0, 0, 1))
    expect(todayKey()).toBe('2026-08-19')
  })
})

describe('fromDateKey', () => {
  it('parses to local midnight, not UTC midnight', () => {
    const d = fromDateKey('2026-08-18')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(18)
    expect(d.getHours()).toBe(0)
  })

  it('round-trips with toDateKey', () => {
    for (const key of ['2026-01-01', '2026-02-28', '2026-06-15', '2026-12-31']) {
      expect(toDateKey(fromDateKey(key))).toBe(key)
    }
  })

  it('disagrees with new Date(key) off UTC — the bug this replaces', () => {
    if (OFFSET_MINUTES === 0) return
    expect(fromDateKey('2026-08-18').getTime()).not.toBe(new Date('2026-08-18').getTime())
  })

  it('returns an Invalid Date for malformed input', () => {
    for (const bad of ['', 'nope', '2026-8-18', '18-08-2026', '2026/08/18']) {
      expect(Number.isNaN(fromDateKey(bad).getTime())).toBe(true)
    }
  })
})

describe('startOfLocalDay', () => {
  it('strips the time component', () => {
    const d = startOfLocalDay(new Date(2026, 7, 18, 17, 45, 30, 500))
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
    expect(d.getMilliseconds()).toBe(0)
    expect(d.getDate()).toBe(18)
  })
})

describe('daysBetween', () => {
  it('counts whole calendar days forward', () => {
    expect(daysBetween(new Date(2026, 7, 18), new Date(2026, 7, 21))).toBe(3)
  })

  it('is negative when b precedes a', () => {
    expect(daysBetween(new Date(2026, 7, 21), new Date(2026, 7, 18))).toBe(-3)
  })

  it('ignores times of day', () => {
    expect(
      daysBetween(new Date(2026, 7, 18, 23, 59), new Date(2026, 7, 19, 0, 1))
    ).toBe(1)
  })

  it('returns 0 for two moments on the same day', () => {
    expect(daysBetween(new Date(2026, 7, 18, 1, 0), new Date(2026, 7, 18, 22, 0))).toBe(0)
  })

  it('counts a spring-forward DST day as exactly one day', () => {
    // 2026-03-08 is the US DST transition: that local day is only 23 hours.
    expect(daysBetween(new Date(2026, 2, 7), new Date(2026, 2, 8))).toBe(1)
    expect(daysBetween(new Date(2026, 2, 7), new Date(2026, 2, 9))).toBe(2)
  })

  it('counts a fall-back DST day as exactly one day', () => {
    // 2026-11-01 is 25 hours long in US zones.
    expect(daysBetween(new Date(2026, 9, 31), new Date(2026, 10, 1))).toBe(1)
    expect(daysBetween(new Date(2026, 9, 31), new Date(2026, 10, 2))).toBe(2)
  })

  it('spans a full non-leap year', () => {
    expect(daysBetween(new Date(2026, 0, 1), new Date(2027, 0, 1))).toBe(365)
  })

  it('spans a leap year', () => {
    expect(daysBetween(new Date(2028, 0, 1), new Date(2029, 0, 1))).toBe(366)
  })
})

describe('daysBetweenKeys', () => {
  it('measures a typical cycle length', () => {
    expect(daysBetweenKeys('2026-08-01', '2026-08-29')).toBe(28)
  })

  it('crosses a month boundary', () => {
    expect(daysBetweenKeys('2026-08-31', '2026-09-01')).toBe(1)
  })

  it('crosses a year boundary', () => {
    expect(daysBetweenKeys('2026-12-31', '2027-01-01')).toBe(1)
  })

  it('crosses the DST transition without drift', () => {
    expect(daysBetweenKeys('2026-02-20', '2026-03-20')).toBe(28)
    expect(daysBetweenKeys('2026-10-20', '2026-11-17')).toBe(28)
  })
})

describe('addDays / addDaysToKey', () => {
  it('adds days across a month boundary', () => {
    expect(addDaysToKey('2026-08-29', 5)).toBe('2026-09-03')
  })

  it('subtracts days across a month boundary', () => {
    expect(addDaysToKey('2026-09-03', -5)).toBe('2026-08-29')
  })

  it('handles a leap day', () => {
    expect(addDaysToKey('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDaysToKey('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('stays on local midnight across DST', () => {
    expect(addDays(new Date(2026, 2, 7), 1).getHours()).toBe(0)
    expect(addDays(new Date(2026, 9, 31), 1).getHours()).toBe(0)
  })

  it('is the inverse of daysBetweenKeys', () => {
    expect(daysBetweenKeys('2026-08-18', addDaysToKey('2026-08-18', 28))).toBe(28)
  })
})

describe('isValidDateKey', () => {
  it('accepts real calendar days', () => {
    expect(isValidDateKey('2026-08-18')).toBe(true)
    expect(isValidDateKey('2028-02-29')).toBe(true)
  })

  it('rejects days that do not exist', () => {
    expect(isValidDateKey('2026-02-30')).toBe(false)
    expect(isValidDateKey('2026-13-01')).toBe(false)
    expect(isValidDateKey('2026-00-10')).toBe(false)
  })

  it('rejects malformed strings', () => {
    expect(isValidDateKey('2026-8-18')).toBe(false)
    expect(isValidDateKey('')).toBe(false)
  })
})
