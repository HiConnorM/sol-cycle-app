import type {
  CycleLog,
  CycleSettings,
  UserPreferences,
  CalendarSystem,
  CycleHistoryEntry,
} from '@/lib/types'
import { daysBetweenKeys } from '@/lib/utils/date-keys'

const STORAGE_KEYS = {
  CYCLE_LOGS: 'sol-cycle-logs',
  CYCLE_SETTINGS: 'sol-cycle-settings',
  USER_PREFERENCES: 'sol-cycle-preferences',
  CYCLES_INDEX: 'sol-cycle-cycles-index',
  SCHEMA_VERSION: 'sol-cycle-schema-version',
} as const

/**
 * Every localStorage key the app owns, including the ones written by feature
 * modules rather than by this file. `clearAllData()` walks this list, so any
 * new key must be registered here — a key left off is health data that
 * survives "delete everything", which is exactly what the privacy promise
 * says cannot happen.
 */
export const ALL_STORAGE_KEYS = [
  ...Object.values(STORAGE_KEYS),
  'sol-cycle-profile',            // name, PMDD / endometriosis flags, goal
  'sol-cycle-tasks',              // ritual + task completion history
  'sol-cycle-user',               // legacy user blob from earlier builds
  'sol-cycle-onboarding-complete',
  'sol-cycle-privacy-accepted',
  'sol-cycle-biometric-enabled',
  'sol-cycle-biometric-cred-id',
] as const

export const CURRENT_SCHEMA_VERSION = 2

const DEFAULT_CYCLE_SETTINGS: CycleSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  lastPeriodStart: null,
  trackingEnabled: true,
}

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  calendarSystem: 'gregorian' as CalendarSystem,
  theme: 'light',
  cycleSettings: DEFAULT_CYCLE_SETTINGS,
  notificationsEnabled: false,
}

// ---------- Change notification ----------

/**
 * Every hook instance reads from localStorage into its own React state, so a
 * write from one instance would otherwise leave the others showing stale data
 * — and a settings write from the side menu could clobber a value the main
 * screen still held a stale copy of. Writers publish here; readers re-read.
 */
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribeToCycleData(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Parsed-value cache.
 *
 * Reads went straight to localStorage and JSON.parse on every call, and the
 * hooks call them several times per render — so a user with a few years of
 * history re-parsed their whole log on every keystroke. The cache also gives
 * each getter a *stable reference* between writes, which is what lets the
 * hooks use useSyncExternalStore: that API re-renders forever if the snapshot
 * returns a fresh object each time it's called.
 *
 * Anything that writes must call `invalidateCache()`.
 */
const cache: {
  logs: CycleLog[] | null
  settings: CycleSettings | null
  preferences: UserPreferences | null
  cyclesIndex: CycleHistoryEntry[] | null
} = { logs: null, settings: null, preferences: null, cyclesIndex: null }

function invalidateCache(): void {
  cache.logs = null
  cache.settings = null
  cache.preferences = null
  cache.cyclesIndex = null
}

/** Drop cached values without notifying — for another tab's writes. */
export function refreshFromStorage(): void {
  invalidateCache()
  notifyCycleDataChanged()
}

function notifyCycleDataChanged(): void {
  for (const listener of listeners) listener()
}

/**
 * Thrown when a write fails because the device is out of storage.
 *
 * Distinguished from other failures so the UI can say something true and
 * actionable ("your device is out of space, export or delete older entries")
 * rather than a generic error — and so a failed save is never silent, which
 * for a tracking app means quietly losing the day the user just recorded.
 */
export class StorageQuotaError extends Error {
  constructor(cause?: unknown) {
    super('Not enough storage space available on this device')
    this.name = 'StorageQuotaError'
    this.cause = cause
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      // Safari reports a bare code in private browsing.
      error.code === 22)
  )
}

/** Write through to localStorage, translating a full disk into a typed error. */
function writeItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    if (isQuotaError(error)) throw new StorageQuotaError(error)
    throw error
  }
}

/** Stable empty results, so SSR snapshots don't churn references either. */
const EMPTY_LOGS: CycleLog[] = []
const EMPTY_INDEX: CycleHistoryEntry[] = []

/**
 * Parse a stored JSON array, tolerating anything that isn't one.
 *
 * `JSON.parse` happily returns `null`, an object, or a number for values that
 * an interrupted write or an older build left behind — and every caller then
 * does `.filter`/`.sort` on it and throws. A read must never throw: showing an
 * empty week is recoverable, crashing on launch is not.
 */
function parseArray<T>(raw: string | null): T[] | null {
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

/** Parse a stored JSON object, tolerating anything that isn't one. */
function parseObject<T extends object>(raw: string | null): Partial<T> | null {
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Partial<T>)
      : {}
  } catch {
    return {}
  }
}

// ---------- Schema migration ----------

function getSchemaVersion(): number {
  if (typeof window === 'undefined') return CURRENT_SCHEMA_VERSION
  const v = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)
  return v ? parseInt(v, 10) || 1 : 1
}

function setSchemaVersion(v: number): void {
  if (typeof window === 'undefined') return
  writeItem(STORAGE_KEYS.SCHEMA_VERSION, String(v))
}

/**
 * Run idempotent one-time migrations. Safe to call on every app load.
 */
export function migrateSchema(): void {
  if (typeof window === 'undefined') return
  const current = getSchemaVersion()
  if (current >= CURRENT_SCHEMA_VERSION) return

  // v1 → v2: derived cyclesIndex didn't exist. Build it from logs.
  if (current < 2) {
    recomputeCyclesIndex()
  }

  setSchemaVersion(CURRENT_SCHEMA_VERSION)
}

// ---------- Logs ----------

export function saveCycleLog(log: CycleLog): void {
  if (typeof window === 'undefined') return

  // Copy rather than mutate: callers hold the cached array by reference.
  const logs = getCycleLogs().filter(l => l.date !== log.date)
  logs.push(log)
  logs.sort((a, b) => a.date.localeCompare(b.date))

  writeItem(STORAGE_KEYS.CYCLE_LOGS, JSON.stringify(logs))
  // Keep derived cycles index fresh.
  recomputeCyclesIndex(logs)
  invalidateCache()
  notifyCycleDataChanged()
}

export function getCycleLogs(): CycleLog[] {
  if (typeof window === 'undefined') return EMPTY_LOGS
  if (cache.logs) return cache.logs

  cache.logs = parseArray<CycleLog>(localStorage.getItem(STORAGE_KEYS.CYCLE_LOGS)) ?? []
  return cache.logs
}

export function getCycleLogForDate(date: string): CycleLog | null {
  const logs = getCycleLogs()
  return logs.find(l => l.date === date) || null
}

export function getCycleLogsInRange(startDate: string, endDate: string): CycleLog[] {
  // Date keys are zero-padded, so lexical comparison is calendar comparison.
  return getCycleLogs().filter(log => log.date >= startDate && log.date <= endDate)
}

export function deleteCycleLog(date: string): void {
  if (typeof window === 'undefined') return

  const logs = getCycleLogs().filter(l => l.date !== date)
  writeItem(STORAGE_KEYS.CYCLE_LOGS, JSON.stringify(logs))
  recomputeCyclesIndex(logs)
  invalidateCache()
  notifyCycleDataChanged()
}

// ---------- Settings & preferences ----------

export function saveCycleSettings(settings: Partial<CycleSettings>): void {
  if (typeof window === 'undefined') return

  const current = getCycleSettings()
  const updated = { ...current, ...settings }
  writeItem(STORAGE_KEYS.CYCLE_SETTINGS, JSON.stringify(updated))
  invalidateCache()
  notifyCycleDataChanged()
}

export function getCycleSettings(): CycleSettings {
  if (typeof window === 'undefined') return DEFAULT_CYCLE_SETTINGS
  if (cache.settings) return cache.settings

  const stored = parseObject<CycleSettings>(localStorage.getItem(STORAGE_KEYS.CYCLE_SETTINGS))
  cache.settings = stored ? { ...DEFAULT_CYCLE_SETTINGS, ...stored } : DEFAULT_CYCLE_SETTINGS
  return cache.settings
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return

  const current = getUserPreferences()
  const updated = { ...current, ...preferences }
  writeItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
  invalidateCache()
  notifyCycleDataChanged()
}

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES
  if (cache.preferences) return cache.preferences

  const stored = parseObject<UserPreferences>(
    localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
  )
  cache.preferences = stored
    ? { ...DEFAULT_USER_PREFERENCES, ...stored }
    : DEFAULT_USER_PREFERENCES
  return cache.preferences
}

// ---------- Period detection (single source of truth) ----------

/**
 * A period start is a log day with non-none, non-spotting flow whose
 * preceding day either has no log, or has flow of 'none' / 'spotting'.
 *
 * Pure: takes logs in, returns dates out. Same logic the engine uses.
 */
export function detectPeriodStartDates(logs: CycleLog[]): string[] {
  // Entries with no usable date can't be placed on a calendar at all.
  const sorted = logs
    .filter(l => typeof l?.date === 'string' && l.date.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const isFlow = (flow: string | undefined) =>
    flow !== undefined && flow !== 'none' && flow !== 'spotting'

  const starts: string[] = []
  for (let i = 0; i < sorted.length; i++) {
    const log = sorted[i]
    if (!isFlow(log.flow)) continue

    if (i === 0) {
      starts.push(log.date)
      continue
    }

    const prev = sorted[i - 1]
    const dayGap = daysBetweenKeys(prev.date, log.date)

    // If previous logged day is more than 1 day before this one, treat as start.
    if (dayGap > 1) {
      starts.push(log.date)
      continue
    }

    if (!isFlow(prev.flow)) {
      starts.push(log.date)
    }
  }

  return starts
}

/**
 * Backwards-compatible name used elsewhere in the codebase.
 */
export function findPeriodStartDates(): string[] {
  return detectPeriodStartDates(getCycleLogs())
}

// ---------- Derived cycles index ----------

/**
 * Build the derived list of completed cycles from period-start dates.
 * Only counts cycles whose length falls in a reasonable band (20–45 days);
 * keeps the latest start in the list (its length is unknown until next start
 * is logged) so consumers can know "we know about N period starts" — but
 * `length` will be 0 for the trailing entry. Filter accordingly.
 */
export function buildCyclesIndex(logs: CycleLog[]): CycleHistoryEntry[] {
  const starts = detectPeriodStartDates(logs)
  const index: CycleHistoryEntry[] = []
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i]
    const next = starts[i + 1]
    if (!next) {
      // Trailing entry; length unknown.
      index.push({ startDate: start, length: 0 })
      continue
    }
    const length = daysBetweenKeys(start, next)
    if (length >= 20 && length <= 45) {
      index.push({ startDate: start, length })
    } else {
      // Out-of-band gap — likely missed logging. Record the start with length 0
      // so the start is still anchored for symptom-day calculations.
      index.push({ startDate: start, length: 0 })
    }
  }
  return index
}

export function recomputeCyclesIndex(logs?: CycleLog[]): CycleHistoryEntry[] {
  if (typeof window === 'undefined') return []
  const source = logs ?? getCycleLogs()
  const index = buildCyclesIndex(source)
  writeItem(STORAGE_KEYS.CYCLES_INDEX, JSON.stringify(index))
  cache.cyclesIndex = index
  return index
}

export function getCyclesIndex(): CycleHistoryEntry[] {
  if (typeof window === 'undefined') return EMPTY_INDEX
  if (cache.cyclesIndex) return cache.cyclesIndex
  // Lazy-build on first access if migration didn't run yet.
  cache.cyclesIndex =
    parseArray<CycleHistoryEntry>(localStorage.getItem(STORAGE_KEYS.CYCLES_INDEX)) ??
    recomputeCyclesIndex()
  return cache.cyclesIndex
}

// ---------- Aggregate helpers ----------

/**
 * Simple unweighted average of completed cycle lengths, kept for compatibility.
 * The richer prediction engine does its own weighted math.
 */
export function calculateAverageCycleLength(): number | null {
  const index = getCyclesIndex().filter(c => c.length > 0)
  if (index.length === 0) return null
  return Math.round(index.reduce((sum, c) => sum + c.length, 0) / index.length)
}

/**
 * Erase everything the app has stored on this device.
 *
 * Clears the registered keys, then sweeps any other `sol-cycle-*` key so a
 * forgotten registration can't leave health data behind. Nothing outside the
 * app's own namespace is touched.
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return

  for (const key of ALL_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }

  const strays = Object.keys(localStorage).filter(k => k.startsWith('sol-cycle-'))
  for (const key of strays) {
    localStorage.removeItem(key)
  }

  invalidateCache()
  notifyCycleDataChanged()
}
