/**
 * date-keys.ts — canonical local-date handling for Sol Cycle.
 *
 * Every log is keyed by a calendar day, written `YYYY-MM-DD` and referred to
 * throughout the codebase as a "date key".
 *
 * The rule: a date key always means the day the user was living in, never a
 * UTC day. Two JS footguns break that if you let them:
 *
 *   new Date().toISOString().split('T')[0]
 *     → converts to UTC first. In America/Los_Angeles at 6pm on the 18th this
 *       yields "2026-08-19" — the log lands on tomorrow.
 *
 *   new Date('2026-08-18')
 *     → parsed as UTC midnight, not local midnight. Comparing it against a
 *       local `new Date()` skews every difference by the UTC offset, which is
 *       why cycle day used to advance in the evening rather than at midnight.
 *
 * So: build keys from local calendar components, and parse them back to local
 * midnight. Nothing in the app should call `toISOString()` on a date it intends
 * to use as a day.
 */

/** `YYYY-MM-DD` in the user's own timezone. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today's date key, in the user's own timezone. */
export function todayKey(): string {
  return toDateKey(new Date())
}

/**
 * Parse a `YYYY-MM-DD` key back to local midnight on that day.
 * Invalid input yields an Invalid Date rather than a silently wrong one.
 */
export function fromDateKey(key: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return new Date(NaN)
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d))
}

/** Local midnight on the day containing `date`. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Local midnight today. */
export function todayStart(): Date {
  return startOfLocalDay(new Date())
}

/**
 * Whole calendar days from `a` to `b` (negative when b precedes a).
 *
 * Both ends are normalised to local midnight and the result is rounded, so a
 * 23- or 25-hour DST day still counts as exactly one day.
 */
export function daysBetween(a: Date, b: Date): number {
  const ms = startOfLocalDay(b).getTime() - startOfLocalDay(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** Whole calendar days between two date keys (negative when b precedes a). */
export function daysBetweenKeys(a: string, b: string): number {
  return daysBetween(fromDateKey(a), fromDateKey(b))
}

/** `date` shifted by `days`, preserving local midnight. */
export function addDays(date: Date, days: number): Date {
  const next = startOfLocalDay(date)
  next.setDate(next.getDate() + days)
  return next
}

/** A date key shifted by `days`. */
export function addDaysToKey(key: string, days: number): string {
  return toDateKey(addDays(fromDateKey(key), days))
}

/** True when `key` is a well-formed `YYYY-MM-DD` naming a real calendar day. */
export function isValidDateKey(key: string): boolean {
  const parsed = fromDateKey(key)
  return !Number.isNaN(parsed.getTime()) && toDateKey(parsed) === key
}
