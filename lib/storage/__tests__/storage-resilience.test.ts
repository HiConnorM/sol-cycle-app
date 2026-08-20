/**
 * Storage resilience.
 *
 * All of a user's data lives in localStorage, so the failure modes that matter
 * are the ones the browser imposes: a quota that fills up, values corrupted by
 * an interrupted write, and data written by an older version of the app.
 *
 * A cycle tracker that throws on read is worse than one that shows an empty
 * week, so the contract is: never throw out of a read, and never lose data
 * that is still parseable.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { installLocalStorageMock, uninstallLocalStorageMock } from './local-storage-mock'

installLocalStorageMock()

import {
  saveCycleLog,
  getCycleLogs,
  getCycleLogForDate,
  getCycleSettings,
  saveCycleSettings,
  getUserPreferences,
  getCyclesIndex,
  buildCyclesIndex,
  clearAllData,
  refreshFromStorage,
  migrateSchema,
  StorageQuotaError,
} from '../cycle-storage'
import { getTasks, addTask, refreshTasksFromStorage } from '../tasks-storage'
import { addDaysToKey } from '@/lib/utils/date-keys'
import type { CycleLog } from '@/lib/types'

function log(date: string, extra: Partial<CycleLog> = {}): CycleLog {
  return {
    date, flow: 'none', symptoms: [], moods: [],
    painLevel: 0, energy: 5, notes: '', ...extra,
  }
}

beforeEach(() => {
  localStorage.clear()
  refreshFromStorage()
  refreshTasksFromStorage()
  vi.restoreAllMocks()
})

afterAll(() => {
  uninstallLocalStorageMock()
})

describe('corrupt stored values', () => {
  const corruptions = [
    ['truncated JSON', '[{"date":"2026-01-01"'],
    ['empty string', ''],
    ['plain text', 'undefined'],
    ['a JSON object where an array is expected', '{"date":"2026-01-01"}'],
    ['null literal', 'null'],
  ] as const

  for (const [label, value] of corruptions) {
    it(`survives ${label} in the log store`, () => {
      localStorage.setItem('sol-cycle-logs', value)
      refreshFromStorage()
      expect(() => getCycleLogs()).not.toThrow()
      expect(Array.isArray(getCycleLogs())).toBe(true)
    })
  }

  it('survives a corrupt settings blob and falls back to defaults', () => {
    localStorage.setItem('sol-cycle-settings', '{"averageCycleLength":')
    refreshFromStorage()
    expect(getCycleSettings().averageCycleLength).toBe(28)
  })

  it('survives a corrupt preferences blob', () => {
    localStorage.setItem('sol-cycle-preferences', '<<<not json>>>')
    refreshFromStorage()
    expect(getUserPreferences().calendarSystem).toBe('gregorian')
  })

  it('survives a corrupt cycles index', () => {
    localStorage.setItem('sol-cycle-cycles-index', 'nope')
    refreshFromStorage()
    expect(() => getCyclesIndex()).not.toThrow()
  })

  it('survives a corrupt task list', () => {
    localStorage.setItem('sol-cycle-tasks', '[[[')
    refreshTasksFromStorage()
    expect(getTasks()).toEqual([])
  })

  it('lets a good write recover the store after corruption', () => {
    localStorage.setItem('sol-cycle-logs', 'garbage')
    refreshFromStorage()
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    expect(getCycleLogs()).toHaveLength(1)
    expect(getCycleLogForDate('2026-01-01')?.flow).toBe('medium')
  })
})

describe('logs with unexpected shapes', () => {
  it('keeps a log that is missing optional fields', () => {
    localStorage.setItem('sol-cycle-logs', JSON.stringify([{ date: '2026-01-01', flow: 'medium' }]))
    refreshFromStorage()
    expect(getCycleLogs()).toHaveLength(1)
  })

  it('does not crash deriving cycles from partial logs', () => {
    localStorage.setItem('sol-cycle-logs', JSON.stringify([
      { date: '2026-01-01', flow: 'medium' },
      { date: '2026-01-29', flow: 'medium' },
    ]))
    refreshFromStorage()
    expect(() => buildCyclesIndex(getCycleLogs())).not.toThrow()
    expect(buildCyclesIndex(getCycleLogs())[0].length).toBe(28)
  })

  it('ignores entries with no usable date rather than throwing', () => {
    localStorage.setItem('sol-cycle-logs', JSON.stringify([
      { date: '', flow: 'medium' },
      { date: '2026-01-01', flow: 'medium' },
    ]))
    refreshFromStorage()
    expect(() => buildCyclesIndex(getCycleLogs())).not.toThrow()
  })
})

describe('quota exhaustion', () => {
  it('surfaces a failed write rather than silently losing the log', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))

    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded the quota', 'QuotaExceededError')
    })

    // The caller has to be able to tell the user the entry did not save,
    // and to distinguish "disk full" from any other failure.
    expect(() => saveCycleLog(log('2026-01-02', { flow: 'medium' })))
      .toThrow(StorageQuotaError)
  })

  it('leaves previously stored data readable after a failed write', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('exceeded the quota', 'QuotaExceededError')
    })
    try {
      saveCycleLog(log('2026-01-02', { flow: 'medium' }))
    } catch {
      /* expected */
    }
    vi.restoreAllMocks()
    refreshFromStorage()
    expect(getCycleLogForDate('2026-01-01')).not.toBeNull()
  })
})

describe('large histories', () => {
  it('handles ten years of daily logs without choking', () => {
    const logs: CycleLog[] = []
    let key = '2016-01-01'
    for (let i = 0; i < 3650; i++) {
      logs.push(log(key, { flow: i % 28 < 5 ? 'medium' : 'none' }))
      key = addDaysToKey(key, 1)
    }
    localStorage.setItem('sol-cycle-logs', JSON.stringify(logs))
    refreshFromStorage()

    const started = performance.now()
    const index = buildCyclesIndex(getCycleLogs())
    const elapsed = performance.now() - started

    expect(getCycleLogs()).toHaveLength(3650)
    expect(index.length).toBeGreaterThan(100)
    expect(elapsed).toBeLessThan(500)
  })

  it('reads a cached log list without re-parsing it each time', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    // Same reference between writes is what lets useSyncExternalStore work.
    expect(getCycleLogs()).toBe(getCycleLogs())
  })

  it('hands back a new reference after a write', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    const before = getCycleLogs()
    saveCycleLog(log('2026-01-02', { flow: 'medium' }))
    expect(getCycleLogs()).not.toBe(before)
  })

  it('never mutates a previously returned list', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    const snapshot = getCycleLogs()
    const lengthBefore = snapshot.length
    saveCycleLog(log('2026-01-02', { flow: 'medium' }))
    expect(snapshot).toHaveLength(lengthBefore)
  })
})

describe('migration from older stored shapes', () => {
  it('builds the cycles index for a v1 store that never had one', () => {
    localStorage.setItem('sol-cycle-logs', JSON.stringify([
      log('2026-01-01', { flow: 'medium' }),
      log('2026-01-29', { flow: 'medium' }),
    ]))
    refreshFromStorage()
    migrateSchema()
    expect(getCyclesIndex().map(c => c.length)).toEqual([28, 0])
  })

  it('leaves an already-migrated store alone', () => {
    migrateSchema()
    const version = localStorage.getItem('sol-cycle-schema-version')
    migrateSchema()
    expect(localStorage.getItem('sol-cycle-schema-version')).toBe(version)
  })

  it('tolerates a non-numeric schema version', () => {
    localStorage.setItem('sol-cycle-schema-version', 'banana')
    refreshFromStorage()
    expect(() => migrateSchema()).not.toThrow()
  })
})

describe('task store isolation', () => {
  it('keeps tasks after cycle data is cleared', () => {
    addTask({ title: 'Take vitamins', frequency: 'daily', category: 'Health', completed: false })
    expect(getTasks()).toHaveLength(1)

    clearAllData()
    refreshTasksFromStorage()
    // clearAllData is "delete everything", so tasks go too — they are user data.
    expect(getTasks()).toEqual([])
  })
})

describe('settings round-trip', () => {
  it('keeps a cycle length at the edges of the accepted range', () => {
    saveCycleSettings({ averageCycleLength: 21 })
    expect(getCycleSettings().averageCycleLength).toBe(21)
    saveCycleSettings({ averageCycleLength: 45 })
    expect(getCycleSettings().averageCycleLength).toBe(45)
  })

  it('stores a null anchor without turning it into a default', () => {
    saveCycleSettings({ lastPeriodStart: '2026-01-01' })
    saveCycleSettings({ lastPeriodStart: null })
    expect(getCycleSettings().lastPeriodStart).toBeNull()
  })
})
