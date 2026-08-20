/**
 * International Fixed Calendar tests.
 *
 * The 13-month calendar: 13 months of exactly 28 days (364), plus Year Day at
 * the end of December, plus Leap Day after June in leap years. Sol is the
 * seventh month, inserted between June and July — which is where the wheel's
 * month mapping used to go wrong.
 */
import { describe, it, expect } from 'vitest'
import {
  IFC_MONTHS,
  isLeapYear,
  getDayOfYear,
  gregorianToIFC,
  ifcToGregorian,
  getIFCMonths,
  formatIFCDate,
} from '../international-fixed-calendar'
import { addDays, daysBetween, toDateKey } from '../../utils/date-keys'
import type { IFCDate } from '../../types'

/** The Gregorian date on which IFC month `month` day 1 falls. */
function ifcMonthStart(year: number, month: number): Date {
  return ifcToGregorian({
    year,
    month,
    day: 1,
    isYearDay: false,
    isLeapDay: false,
    monthName: '',
  })
}

describe('month names and ordering', () => {
  it('has 13 months with Sol seventh, between June and July', () => {
    expect(IFC_MONTHS).toHaveLength(13)
    expect(IFC_MONTHS[5]).toBe('June')
    expect(IFC_MONTHS[6]).toBe('Sol')
    expect(IFC_MONTHS[7]).toBe('July')
  })

  it('reports every month as 28 days', () => {
    const months = getIFCMonths(2026)
    expect(months).toHaveLength(13)
    expect(months.every(m => m.days === 28)).toBe(true)
    expect(months.reduce((sum, m) => sum + m.days, 0)).toBe(364)
  })
})

describe('wheel month index → real dates', () => {
  // This is the bug the user reported: the wheel passed its segment index
  // straight to Date.setMonth, so tapping Sol (index 6) opened Gregorian July,
  // July (index 7) opened August, and so on for every month after Sol.
  it('maps Sol to mid-June, not July', () => {
    const solStart = ifcMonthStart(2026, 7)
    expect(gregorianToIFC(solStart).monthName).toBe('Sol')
    // Sol day 1 is day 169 of a common year — 18 June.
    expect(toDateKey(solStart)).toBe('2026-06-18')
  })

  it('maps IFC July to mid-July, not August', () => {
    const julyStart = ifcMonthStart(2026, 8)
    expect(gregorianToIFC(julyStart).monthName).toBe('July')
    expect(toDateKey(julyStart)).toBe('2026-07-16')
  })

  it('round-trips the start of every month back to the same month name', () => {
    for (let month = 1; month <= 13; month++) {
      const start = ifcMonthStart(2026, month)
      const back = gregorianToIFC(start)
      expect(back.month).toBe(month)
      expect(back.day).toBe(1)
      expect(back.monthName).toBe(IFC_MONTHS[month - 1])
    }
  })

  it('starts each month exactly 28 days after the previous one', () => {
    // daysBetween, not raw millisecond division: a DST boundary between two
    // month starts makes the span 27h-short of 28 × 24h.
    for (let month = 1; month < 13; month++) {
      const a = ifcMonthStart(2026, month)
      const b = ifcMonthStart(2026, month + 1)
      expect(daysBetween(a, b)).toBe(28)
    }
  })

  it('adds a day across Leap Day in a leap year', () => {
    // Leap Day sits between June and Sol, so that one gap is 29 days wide.
    expect(daysBetween(ifcMonthStart(2028, 6), ifcMonthStart(2028, 7))).toBe(29)
    expect(daysBetween(ifcMonthStart(2026, 6), ifcMonthStart(2026, 7))).toBe(28)
  })
})

describe('day-of-year', () => {
  it('starts at 1 on 1 January', () => {
    expect(getDayOfYear(new Date(2026, 0, 1))).toBe(1)
  })

  it('ends at 365 in a common year', () => {
    expect(getDayOfYear(new Date(2026, 11, 31))).toBe(365)
  })

  it('ends at 366 in a leap year', () => {
    expect(getDayOfYear(new Date(2028, 11, 31))).toBe(366)
  })

  it('is unaffected by the time of day', () => {
    expect(getDayOfYear(new Date(2026, 7, 18, 0, 1))).toBe(
      getDayOfYear(new Date(2026, 7, 18, 23, 59))
    )
  })

  it('does not drift across the spring DST transition', () => {
    // The old millisecond-division version floored to the wrong day for every
    // date after the transition, shifting half the year by one.
    const beforeDst = new Date(2026, 2, 7) // 7 March
    const afterDst = new Date(2026, 2, 9) // 9 March, past the change
    expect(getDayOfYear(afterDst) - getDayOfYear(beforeDst)).toBe(2)
  })

  it('does not drift across the autumn DST transition', () => {
    const before = new Date(2026, 9, 31)
    const after = new Date(2026, 10, 2)
    expect(getDayOfYear(after) - getDayOfYear(before)).toBe(2)
  })

  it('counts every day of a common year exactly once', () => {
    const seen = new Set<number>()
    let d = new Date(2026, 0, 1)
    for (let i = 0; i < 365; i++) {
      seen.add(getDayOfYear(d))
      d = addDays(d, 1)
    }
    expect(seen.size).toBe(365)
  })
})

describe('Year Day', () => {
  it('is the last day of a common year', () => {
    const ifc = gregorianToIFC(new Date(2026, 11, 31))
    expect(ifc.isYearDay).toBe(true)
    expect(ifc.monthName).toBe('Year Day')
  })

  it('is the last day of a leap year', () => {
    const ifc = gregorianToIFC(new Date(2028, 11, 31))
    expect(ifc.isYearDay).toBe(true)
  })

  it('does not swallow 30 December in a leap year', () => {
    // The old check was `dayOfYear === 365 || (isLeap && dayOfYear === 366)`,
    // so in a leap year day 365 — 30 December — was also flagged as Year Day.
    const ifc = gregorianToIFC(new Date(2028, 11, 30))
    expect(ifc.isYearDay).toBe(false)
    expect(ifc.monthName).toBe('December')
  })

  it('converts back to 31 December', () => {
    const yearDay: IFCDate = {
      year: 2026,
      month: 13,
      day: 29,
      isYearDay: true,
      isLeapDay: false,
      monthName: 'Year Day',
    }
    expect(toDateKey(ifcToGregorian(yearDay))).toBe('2026-12-31')
  })

  it('formats without a month name', () => {
    expect(formatIFCDate(gregorianToIFC(new Date(2026, 11, 31)))).toBe('Year Day, 2026')
  })
})

describe('Leap Day', () => {
  it('appears only in leap years', () => {
    expect(isLeapYear(2028)).toBe(true)
    expect(isLeapYear(2026)).toBe(false)
    expect(isLeapYear(2100)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
  })

  it('falls after June and before Sol', () => {
    // Day 169 of a leap year is 17 June.
    const leapDay = gregorianToIFC(new Date(2028, 5, 17))
    expect(leapDay.isLeapDay).toBe(true)
    expect(leapDay.monthName).toBe('Leap Day')
  })

  it('does not shift Sol in a common year', () => {
    expect(gregorianToIFC(new Date(2026, 5, 18)).monthName).toBe('Sol')
  })

  it('shifts the months after it by one day in a leap year', () => {
    // With Leap Day inserted, Sol day 1 lands a day later than in a common year.
    expect(toDateKey(ifcMonthStart(2028, 7))).toBe('2028-06-18')
    expect(toDateKey(ifcMonthStart(2026, 7))).toBe('2026-06-18')
  })

  it('formats without a month name', () => {
    expect(formatIFCDate(gregorianToIFC(new Date(2028, 5, 17)))).toBe('Leap Day, 2028')
  })
})

describe('the year adds up', () => {
  for (const year of [2025, 2026, 2027, 2028, 2100, 2400]) {
    it(`covers every day of ${year} with no gaps or repeats`, () => {
      const days = isLeapYear(year) ? 366 : 365
      const seen = new Map<string, number>()

      let d = new Date(year, 0, 1)
      for (let i = 0; i < days; i++) {
        const ifc = gregorianToIFC(d)
        // Each day maps to a unique (month, day, special) slot.
        const slot = `${ifc.month}-${ifc.day}-${ifc.isYearDay}-${ifc.isLeapDay}`
        seen.set(slot, (seen.get(slot) ?? 0) + 1)
        d = addDays(d, 1)
      }

      expect(seen.size).toBe(days)
      expect([...seen.values()].every(count => count === 1)).toBe(true)
    })
  }

  it('gives 13 months × 28 days plus the special days', () => {
    const counts = new Map<number, number>()
    let special = 0
    let d = new Date(2028, 0, 1) // leap year: expect both special days
    for (let i = 0; i < 366; i++) {
      const ifc = gregorianToIFC(d)
      if (ifc.isYearDay || ifc.isLeapDay) special++
      else counts.set(ifc.month, (counts.get(ifc.month) ?? 0) + 1)
      d = addDays(d, 1)
    }
    expect(special).toBe(2) // Year Day + Leap Day
    expect(counts.size).toBe(13)
    expect([...counts.values()].every(c => c === 28)).toBe(true)
  })
})

describe('weekday alignment', () => {
  // Every IFC month is exactly 4 weeks, so in a common year all 13 months
  // begin on the same weekday. The intercalary days belong to no week: Leap
  // Day shifts every month after it by one Gregorian weekday, and Year Day
  // absorbs the shift at the end so the next year starts cleanly.
  const weekday = (year: number, month: number) => ifcMonthStart(year, month).getDay()

  it('starts all 13 months on the same weekday in a common year', () => {
    const first = weekday(2026, 1)
    for (let month = 1; month <= 13; month++) {
      expect(weekday(2026, month)).toBe(first)
    }
  })

  it('starts months 1-6 on the same weekday in a leap year', () => {
    const first = weekday(2028, 1)
    for (let month = 1; month <= 6; month++) {
      expect(weekday(2028, month)).toBe(first)
    }
  })

  it('shifts months 7-13 by one weekday after Leap Day', () => {
    const beforeLeapDay = weekday(2028, 6)
    for (let month = 7; month <= 13; month++) {
      expect(weekday(2028, month)).toBe((beforeLeapDay + 1) % 7)
    }
  })

  it('never lets an intercalary day take a month slot', () => {
    // Year Day and Leap Day sit outside the week cycle, so no month's day 1
    // may land on one — that would push a whole month out of alignment.
    for (const year of [2026, 2028]) {
      for (let month = 1; month <= 13; month++) {
        const ifc = gregorianToIFC(ifcMonthStart(year, month))
        expect(ifc.isYearDay).toBe(false)
        expect(ifc.isLeapDay).toBe(false)
        expect(ifc.day).toBe(1)
      }
    }
  })
})
