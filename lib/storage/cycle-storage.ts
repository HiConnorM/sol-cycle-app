import type {
  CycleLog,
  CycleSettings,
  UserPreferences,
  CalendarSystem,
  CycleHistoryEntry,
} from '@/lib/types'

const STORAGE_KEYS = {
  CYCLE_LOGS: 'sol-cycle-logs',
  CYCLE_SETTINGS: 'sol-cycle-settings',
  USER_PREFERENCES: 'sol-cycle-preferences',
  CYCLES_INDEX: 'sol-cycle-cycles-index',
  SCHEMA_VERSION: 'sol-cycle-schema-version',
} as const

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

// ---------- Schema migration ----------

function getSchemaVersion(): number {
  if (typeof window === 'undefined') return CURRENT_SCHEMA_VERSION
  const v = localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)
  return v ? parseInt(v, 10) || 1 : 1
}

function setSchemaVersion(v: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(v))
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

  const logs = getCycleLogs()
  const existingIndex = logs.findIndex(l => l.date === log.date)

  if (existingIndex >= 0) {
    logs[existingIndex] = log
  } else {
    logs.push(log)
  }

  logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  localStorage.setItem(STORAGE_KEYS.CYCLE_LOGS, JSON.stringify(logs))
  // Keep derived cycles index fresh.
  recomputeCyclesIndex(logs)
}

export function getCycleLogs(): CycleLog[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLE_LOGS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getCycleLogForDate(date: string): CycleLog | null {
  const logs = getCycleLogs()
  return logs.find(l => l.date === date) || null
}

export function getCycleLogsInRange(startDate: string, endDate: string): CycleLog[] {
  const logs = getCycleLogs()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  return logs.filter(log => {
    const logTime = new Date(log.date).getTime()
    return logTime >= start && logTime <= end
  })
}

export function deleteCycleLog(date: string): void {
  if (typeof window === 'undefined') return

  const logs = getCycleLogs().filter(l => l.date !== date)
  localStorage.setItem(STORAGE_KEYS.CYCLE_LOGS, JSON.stringify(logs))
  recomputeCyclesIndex(logs)
}

// ---------- Settings & preferences ----------

export function saveCycleSettings(settings: Partial<CycleSettings>): void {
  if (typeof window === 'undefined') return

  const current = getCycleSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(STORAGE_KEYS.CYCLE_SETTINGS, JSON.stringify(updated))
}

export function getCycleSettings(): CycleSettings {
  if (typeof window === 'undefined') return DEFAULT_CYCLE_SETTINGS

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLE_SETTINGS)
    return stored ? { ...DEFAULT_CYCLE_SETTINGS, ...JSON.parse(stored) } : DEFAULT_CYCLE_SETTINGS
  } catch {
    return DEFAULT_CYCLE_SETTINGS
  }
}

export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return

  const current = getUserPreferences()
  const updated = { ...current, ...preferences }
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
}

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return stored ? { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_USER_PREFERENCES
  } catch {
    return DEFAULT_USER_PREFERENCES
  }
}

// ---------- Period detection (single source of truth) ----------

/**
 * A period start is a log day with non-none, non-spotting flow whose
 * preceding day either has no log, or has flow of 'none' / 'spotting'.
 *
 * Pure: takes logs in, returns dates out. Same logic the engine uses.
 */
export function detectPeriodStartDates(logs: CycleLog[]): string[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

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
    const prevDate = new Date(prev.date)
    const curDate = new Date(log.date)
    const dayGap = Math.round(
      (curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    )

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
    const length = Math.round(
      (new Date(next).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    )
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
  localStorage.setItem(STORAGE_KEYS.CYCLES_INDEX, JSON.stringify(index))
  return index
}

export function getCyclesIndex(): CycleHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLES_INDEX)
    if (stored) return JSON.parse(stored)
    // Lazy-build on first access if migration didn't run yet.
    return recomputeCyclesIndex()
  } catch {
    return []
  }
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

export function clearAllData(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(STORAGE_KEYS.CYCLE_LOGS)
  localStorage.removeItem(STORAGE_KEYS.CYCLE_SETTINGS)
  localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
  localStorage.removeItem(STORAGE_KEYS.CYCLES_INDEX)
  localStorage.removeItem(STORAGE_KEYS.SCHEMA_VERSION)
}
