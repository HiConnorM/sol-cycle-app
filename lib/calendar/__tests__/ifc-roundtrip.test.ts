import { describe, it, expect } from 'vitest'
import { gregorianToIFC, ifcToGregorian, getDayOfYear, isLeapYear } from '@/lib/calendar/international-fixed-calendar'
import { toDateKey, addDays } from '@/lib/utils/date-keys'

describe('IFC round-trip', () => {
  for (const year of [2026, 2028]) {
    it(`round-trips every day of ${year} (${isLeapYear(year) ? 'leap' : 'common'})`, () => {
      const days = isLeapYear(year) ? 366 : 365
      const failures: string[] = []
      let d = new Date(year, 0, 1)
      for (let i = 0; i < days; i++) {
        const ifc = gregorianToIFC(d)
        const back = ifcToGregorian(ifc)
        if (toDateKey(back) !== toDateKey(d)) {
          failures.push(`${toDateKey(d)} -> ${ifc.monthName} ${ifc.day} -> ${toDateKey(back)}`)
        }
        d = addDays(d, 1)
      }
      expect(failures.slice(0, 5)).toEqual([])
    })
    it(`day-of-year is 1..N with no gaps in ${year}`, () => {
      const days = isLeapYear(year) ? 366 : 365
      const seen: number[] = []
      let d = new Date(year, 0, 1)
      for (let i = 0; i < days; i++) { seen.push(getDayOfYear(d)); d = addDays(d, 1) }
      expect(seen).toEqual(Array.from({ length: days }, (_, i) => i + 1))
    })
  }
})
