import type { IFCDate, GregorianDate } from '@/lib/types'

// IFC Month names
const IFC_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'Sol',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Get the day of year (1-366) for a given date
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Convert a Gregorian date to International Fixed Calendar date
 * 
 * IFC Rules:
 * - 13 months of 28 days each = 364 days
 * - Year Day: December 29 (day 365), not part of any week or month
 * - Leap Day: Sol 29 (day 169 in leap years), not part of any week
 */
export function gregorianToIFC(date: Date): IFCDate {
  const year = date.getFullYear()
  const dayOfYear = getDayOfYear(date)
  const isLeap = isLeapYear(year)
  
  // Handle Year Day (December 29 in IFC, last day of year)
  if (dayOfYear === 365 || (isLeap && dayOfYear === 366)) {
    return {
      year,
      month: 13,
      day: 29,
      isYearDay: true,
      isLeapDay: false,
      monthName: 'Year Day',
    }
  }
  
  // Handle Leap Day (June 29 in IFC, day 169)
  // In leap years, Leap Day comes after June 28 (day 168)
  if (isLeap && dayOfYear === 169) {
    return {
      year,
      month: 6,
      day: 29,
      isYearDay: false,
      isLeapDay: true,
      monthName: 'Leap Day',
    }
  }
  
  // Adjust day of year for leap day if we're past it
  let adjustedDay = dayOfYear
  if (isLeap && dayOfYear > 169) {
    adjustedDay = dayOfYear - 1
  }
  
  // Calculate month and day (each month has exactly 28 days)
  const month = Math.ceil(adjustedDay / 28)
  const day = adjustedDay - (month - 1) * 28
  
  return {
    year,
    month,
    day: day || 28, // Handle edge case where day is 0
    isYearDay: false,
    isLeapDay: false,
    monthName: IFC_MONTH_NAMES[month - 1] || 'Unknown',
  }
}

/**
 * Convert an IFC date back to a Gregorian Date object
 */
export function ifcToGregorian(ifcDate: IFCDate): Date {
  const { year, month, day, isYearDay, isLeapDay } = ifcDate
  const isLeap = isLeapYear(year)
  
  // Handle Year Day
  if (isYearDay) {
    return new Date(year, 11, 31) // December 31
  }
  
  // Handle Leap Day
  if (isLeapDay) {
    // Leap Day is June 17 in Gregorian (day 169)
    return new Date(year, 5, 17)
  }
  
  // Calculate day of year
  let dayOfYear = (month - 1) * 28 + day
  
  // Adjust for leap day if we're past it (month > 6 or month === 6 and day > 28)
  if (isLeap && (month > 6 || (month === 6 && day > 28))) {
    dayOfYear += 1
  }
  
  // Convert day of year to date
  const date = new Date(year, 0, 1)
  date.setDate(dayOfYear)
  return date
}

/**
 * Get all IFC month data for a given year
 */
export function getIFCMonths(year: number): Array<{ name: string; number: number; days: number }> {
  return IFC_MONTH_NAMES.map((name, index) => ({
    name,
    number: index + 1,
    days: 28,
  }))
}

/**
 * Get the IFC week day (always 1-7, Sunday-Saturday)
 * Since every month starts on Sunday, the day of week is predictable
 */
export function getIFCWeekDay(ifcDate: IFCDate): number {
  if (ifcDate.isYearDay || ifcDate.isLeapDay) {
    return 0 // Special days outside the week
  }
  // Day 1 = Sunday (0), Day 2 = Monday (1), etc.
  return (ifcDate.day - 1) % 7
}

/**
 * Format an IFC date as a string
 */
export function formatIFCDate(ifcDate: IFCDate): string {
  if (ifcDate.isYearDay) {
    return `Year Day, ${ifcDate.year}`
  }
  if (ifcDate.isLeapDay) {
    return `Leap Day, ${ifcDate.year}`
  }
  return `${ifcDate.monthName} ${ifcDate.day}, ${ifcDate.year}`
}

/**
 * Get the Gregorian month name
 */
export function getGregorianMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Unknown'
}

/**
 * Get days in a Gregorian month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Format a Gregorian date as a string
 */
export function formatGregorianDate(date: Date): string {
  const month = getGregorianMonthName(date.getMonth() + 1)
  return `${month} ${date.getDate()}, ${date.getFullYear()}`
}
