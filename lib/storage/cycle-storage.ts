import type { CycleLog, CycleSettings, UserPreferences, CalendarSystem } from '@/lib/types'

const STORAGE_KEYS = {
  CYCLE_LOGS: 'sol-cycle-logs',
  CYCLE_SETTINGS: 'sol-cycle-settings',
  USER_PREFERENCES: 'sol-cycle-preferences',
} as const

// Default values
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

/**
 * Save cycle log for a specific date
 */
export function saveCycleLog(log: CycleLog): void {
  if (typeof window === 'undefined') return
  
  const logs = getCycleLogs()
  const existingIndex = logs.findIndex(l => l.date === log.date)
  
  if (existingIndex >= 0) {
    logs[existingIndex] = log
  } else {
    logs.push(log)
  }
  
  // Sort by date
  logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  localStorage.setItem(STORAGE_KEYS.CYCLE_LOGS, JSON.stringify(logs))
}

/**
 * Get all cycle logs
 */
export function getCycleLogs(): CycleLog[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLE_LOGS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get cycle log for a specific date
 */
export function getCycleLogForDate(date: string): CycleLog | null {
  const logs = getCycleLogs()
  return logs.find(l => l.date === date) || null
}

/**
 * Get cycle logs for a date range
 */
export function getCycleLogsInRange(startDate: string, endDate: string): CycleLog[] {
  const logs = getCycleLogs()
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  
  return logs.filter(log => {
    const logTime = new Date(log.date).getTime()
    return logTime >= start && logTime <= end
  })
}

/**
 * Delete cycle log for a specific date
 */
export function deleteCycleLog(date: string): void {
  if (typeof window === 'undefined') return
  
  const logs = getCycleLogs().filter(l => l.date !== date)
  localStorage.setItem(STORAGE_KEYS.CYCLE_LOGS, JSON.stringify(logs))
}

/**
 * Save cycle settings
 */
export function saveCycleSettings(settings: Partial<CycleSettings>): void {
  if (typeof window === 'undefined') return
  
  const current = getCycleSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(STORAGE_KEYS.CYCLE_SETTINGS, JSON.stringify(updated))
}

/**
 * Get cycle settings
 */
export function getCycleSettings(): CycleSettings {
  if (typeof window === 'undefined') return DEFAULT_CYCLE_SETTINGS
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLE_SETTINGS)
    return stored ? { ...DEFAULT_CYCLE_SETTINGS, ...JSON.parse(stored) } : DEFAULT_CYCLE_SETTINGS
  } catch {
    return DEFAULT_CYCLE_SETTINGS
  }
}

/**
 * Save user preferences
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') return
  
  const current = getUserPreferences()
  const updated = { ...current, ...preferences }
  localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))
}

/**
 * Get user preferences
 */
export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return stored ? { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_USER_PREFERENCES
  } catch {
    return DEFAULT_USER_PREFERENCES
  }
}

/**
 * Find period start dates from logs
 */
export function findPeriodStartDates(): string[] {
  const logs = getCycleLogs()
  const periodDates: string[] = []
  
  let inPeriod = false
  
  for (const log of logs) {
    const hasFlow = log.flow !== 'none' && log.flow !== undefined
    
    if (hasFlow && !inPeriod) {
      periodDates.push(log.date)
      inPeriod = true
    } else if (!hasFlow) {
      inPeriod = false
    }
  }
  
  return periodDates
}

/**
 * Calculate average cycle length from history
 */
export function calculateAverageCycleLength(): number | null {
  const periodStarts = findPeriodStartDates()
  
  if (periodStarts.length < 2) return null
  
  const cycleLengths: number[] = []
  
  for (let i = 1; i < periodStarts.length; i++) {
    const prevStart = new Date(periodStarts[i - 1])
    const currentStart = new Date(periodStarts[i])
    const diff = Math.round((currentStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24))
    
    // Only count reasonable cycle lengths (21-45 days)
    if (diff >= 21 && diff <= 45) {
      cycleLengths.push(diff)
    }
  }
  
  if (cycleLengths.length === 0) return null
  
  return Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
}

/**
 * Clear all stored data (for testing/reset)
 */
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(STORAGE_KEYS.CYCLE_LOGS)
  localStorage.removeItem(STORAGE_KEYS.CYCLE_SETTINGS)
  localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
}
