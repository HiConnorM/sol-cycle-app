import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { installLocalStorageMock, uninstallLocalStorageMock } from './local-storage-mock'

// The storage module touches localStorage only inside its functions, never at
// module scope, so installing the mock here — before any test runs — is enough.
installLocalStorageMock()

import {
  ALL_STORAGE_KEYS,
  CURRENT_SCHEMA_VERSION,
  saveCycleLog,
  getCycleLogs,
  getCycleLogForDate,
  getCycleLogsInRange,
  deleteCycleLog,
  saveCycleSettings,
  getCycleSettings,
  saveUserPreferences,
  getUserPreferences,
  detectPeriodStartDates,
  buildCyclesIndex,
  getCyclesIndex,
  calculateAverageCycleLength,
  migrateSchema,
  clearAllData,
  subscribeToCycleData,
  refreshFromStorage,
} from '../cycle-storage'
import type { CycleLog } from '@/lib/types'

function log(date: string, extra: Partial<CycleLog> = {}): CycleLog {
  return {
    date,
    flow: 'none',
    symptoms: [],
    moods: [],
    painLevel: 0,
    energy: 5,
    notes: '',
    ...extra,
  }
}

beforeEach(() => {
  localStorage.clear()
  // The storage module caches parsed values; clearing the backing store
  // behind its back has to drop that cache too.
  refreshFromStorage()
})

afterAll(() => {
  uninstallLocalStorageMock()
})

describe('cycle logs', () => {
  it('round-trips a saved log', () => {
    saveCycleLog(log('2026-08-18', { flow: 'medium', painLevel: 3 }))
    const stored = getCycleLogForDate('2026-08-18')
    expect(stored?.flow).toBe('medium')
    expect(stored?.painLevel).toBe(3)
  })

  it('returns null for a date with no log', () => {
    expect(getCycleLogForDate('2026-08-18')).toBeNull()
  })

  it('replaces rather than duplicates a log for the same date', () => {
    saveCycleLog(log('2026-08-18', { flow: 'light' }))
    saveCycleLog(log('2026-08-18', { flow: 'heavy' }))
    expect(getCycleLogs()).toHaveLength(1)
    expect(getCycleLogForDate('2026-08-18')?.flow).toBe('heavy')
  })

  it('keeps logs in chronological order regardless of insertion order', () => {
    saveCycleLog(log('2026-09-02'))
    saveCycleLog(log('2026-08-18'))
    saveCycleLog(log('2026-12-31'))
    saveCycleLog(log('2026-01-05'))
    expect(getCycleLogs().map(l => l.date)).toEqual([
      '2026-01-05', '2026-08-18', '2026-09-02', '2026-12-31',
    ])
  })

  it('deletes a log without touching the others', () => {
    saveCycleLog(log('2026-08-18'))
    saveCycleLog(log('2026-08-19'))
    deleteCycleLog('2026-08-18')
    expect(getCycleLogs().map(l => l.date)).toEqual(['2026-08-19'])
  })

  it('filters a date range inclusively at both ends', () => {
    for (const d of ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20']) {
      saveCycleLog(log(d))
    }
    expect(getCycleLogsInRange('2026-08-18', '2026-08-19').map(l => l.date))
      .toEqual(['2026-08-18', '2026-08-19'])
  })

  it('returns an empty list when the stored JSON is corrupt', () => {
    localStorage.setItem('sol-cycle-logs', '{not json')
    refreshFromStorage()
    expect(getCycleLogs()).toEqual([])
  })
})

describe('settings and preferences', () => {
  it('merges partial settings updates over the defaults', () => {
    saveCycleSettings({ averageCycleLength: 30 })
    const settings = getCycleSettings()
    expect(settings.averageCycleLength).toBe(30)
    expect(settings.averagePeriodLength).toBe(5)
    expect(settings.lastPeriodStart).toBeNull()
  })

  it('preserves earlier settings across successive writes', () => {
    saveCycleSettings({ averageCycleLength: 30 })
    saveCycleSettings({ lastPeriodStart: '2026-08-18' })
    const settings = getCycleSettings()
    expect(settings.averageCycleLength).toBe(30)
    expect(settings.lastPeriodStart).toBe('2026-08-18')
  })

  it('falls back to defaults when settings JSON is corrupt', () => {
    localStorage.setItem('sol-cycle-settings', 'nope')
    refreshFromStorage()
    expect(getCycleSettings().averageCycleLength).toBe(28)
  })

  it('preserves unrelated keys sharing the preferences blob', () => {
    // The side menu writes its own settings under the same key.
    saveUserPreferences({ calendarSystem: 'international-fixed' })
    localStorage.setItem('sol-cycle-preferences', JSON.stringify({
      ...JSON.parse(localStorage.getItem('sol-cycle-preferences')!),
      theme: 'dark',
      weekStartDay: 1,
    }))
    refreshFromStorage()
    saveUserPreferences({ notificationsEnabled: true })

    const raw = JSON.parse(localStorage.getItem('sol-cycle-preferences')!)
    expect(raw.calendarSystem).toBe('international-fixed')
    expect(raw.theme).toBe('dark')
    expect(raw.weekStartDay).toBe(1)
    expect(raw.notificationsEnabled).toBe(true)
    expect(getUserPreferences().calendarSystem).toBe('international-fixed')
  })
})

describe('detectPeriodStartDates', () => {
  it('finds no starts when nothing bleeds', () => {
    expect(detectPeriodStartDates([log('2026-08-18'), log('2026-08-19')])).toEqual([])
  })

  it('treats the first bleeding day as a start', () => {
    const logs = [log('2026-08-18', { flow: 'medium' }), log('2026-08-19', { flow: 'medium' })]
    expect(detectPeriodStartDates(logs)).toEqual(['2026-08-18'])
  })

  it('does not treat spotting as a period start', () => {
    const logs = [
      log('2026-08-17', { flow: 'spotting' }),
      log('2026-08-18', { flow: 'medium' }),
    ]
    expect(detectPeriodStartDates(logs)).toEqual(['2026-08-18'])
  })

  it('starts a new period after a gap in logging', () => {
    const logs = [
      log('2026-08-18', { flow: 'medium' }),
      log('2026-09-15', { flow: 'medium' }),
    ]
    expect(detectPeriodStartDates(logs)).toEqual(['2026-08-18', '2026-09-15'])
  })

  it('does not restart mid-period on consecutive bleeding days', () => {
    const logs = ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21']
      .map(d => log(d, { flow: 'medium' }))
    expect(detectPeriodStartDates(logs)).toEqual(['2026-08-18'])
  })

  it('is independent of input order', () => {
    const logs = [
      log('2026-09-15', { flow: 'medium' }),
      log('2026-08-18', { flow: 'medium' }),
    ]
    expect(detectPeriodStartDates(logs)).toEqual(['2026-08-18', '2026-09-15'])
  })

  it('spans a month boundary without drift', () => {
    const logs = [
      log('2026-08-31', { flow: 'medium' }),
      log('2026-09-01', { flow: 'medium' }),
    ]
    expect(detectPeriodStartDates(logs)).toEqual(['2026-08-31'])
  })
})

describe('buildCyclesIndex', () => {
  it('measures the gap between consecutive starts', () => {
    const logs = [
      log('2026-01-01', { flow: 'medium' }),
      log('2026-01-29', { flow: 'medium' }),
      log('2026-02-26', { flow: 'medium' }),
    ]
    const index = buildCyclesIndex(logs)
    expect(index.map(c => c.length)).toEqual([28, 28, 0])
  })

  it('leaves the trailing cycle length unknown', () => {
    const logs = [log('2026-01-01', { flow: 'medium' })]
    expect(buildCyclesIndex(logs)).toEqual([{ startDate: '2026-01-01', length: 0 }])
  })

  it('records an out-of-band gap as length 0 rather than a wild cycle', () => {
    const logs = [
      log('2026-01-01', { flow: 'medium' }),
      log('2026-05-01', { flow: 'medium' }), // 120 days — missed logging
    ]
    expect(buildCyclesIndex(logs).map(c => c.length)).toEqual([0, 0])
  })

  it('measures a cycle spanning the spring DST transition as exactly 28 days', () => {
    const logs = [
      log('2026-02-20', { flow: 'medium' }),
      log('2026-03-20', { flow: 'medium' }),
    ]
    expect(buildCyclesIndex(logs)[0].length).toBe(28)
  })

  it('measures a cycle spanning the autumn DST transition as exactly 28 days', () => {
    const logs = [
      log('2026-10-20', { flow: 'medium' }),
      log('2026-11-17', { flow: 'medium' }),
    ]
    expect(buildCyclesIndex(logs)[0].length).toBe(28)
  })
})

describe('cycles index persistence', () => {
  it('refreshes on save', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    saveCycleLog(log('2026-01-29', { flow: 'medium' }))
    expect(getCyclesIndex().map(c => c.length)).toEqual([28, 0])
  })

  it('refreshes on delete', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    saveCycleLog(log('2026-01-29', { flow: 'medium' }))
    deleteCycleLog('2026-01-29')
    expect(getCyclesIndex()).toEqual([{ startDate: '2026-01-01', length: 0 }])
  })

  it('averages only completed cycles', () => {
    for (const d of ['2026-01-01', '2026-01-29', '2026-02-28']) {
      saveCycleLog(log(d, { flow: 'medium' }))
    }
    // Gaps are 28 and 30; the trailing entry has unknown length.
    expect(calculateAverageCycleLength()).toBe(29)
  })

  it('has no average before any cycle completes', () => {
    saveCycleLog(log('2026-01-01', { flow: 'medium' }))
    expect(calculateAverageCycleLength()).toBeNull()
  })
})

describe('migrateSchema', () => {
  it('stamps the current version on a fresh install', () => {
    migrateSchema()
    expect(localStorage.getItem('sol-cycle-schema-version')).toBe(String(CURRENT_SCHEMA_VERSION))
  })

  it('builds the cycles index when upgrading from v1', () => {
    localStorage.setItem('sol-cycle-logs', JSON.stringify([
      log('2026-01-01', { flow: 'medium' }),
      log('2026-01-29', { flow: 'medium' }),
    ]))
    refreshFromStorage()
    // v1 had no version stamp and no cycles index.
    expect(localStorage.getItem('sol-cycle-cycles-index')).toBeNull()

    migrateSchema()

    expect(JSON.parse(localStorage.getItem('sol-cycle-cycles-index')!).map((c: {length: number}) => c.length))
      .toEqual([28, 0])
  })

  it('is idempotent', () => {
    migrateSchema()
    const first = localStorage.getItem('sol-cycle-cycles-index')
    migrateSchema()
    expect(localStorage.getItem('sol-cycle-cycles-index')).toBe(first)
  })
})

describe('clearAllData', () => {
  // The privacy promise is that "delete everything" leaves nothing behind, so
  // this is asserted key by key rather than by spot check.
  const everyKey = [
    'sol-cycle-logs',
    'sol-cycle-settings',
    'sol-cycle-preferences',
    'sol-cycle-cycles-index',
    'sol-cycle-schema-version',
    'sol-cycle-profile',
    'sol-cycle-tasks',
    'sol-cycle-user',
    'sol-cycle-onboarding-complete',
    'sol-cycle-privacy-accepted',
    'sol-cycle-biometric-enabled',
    'sol-cycle-biometric-cred-id',
  ]

  it('registers every known key', () => {
    for (const key of everyKey) {
      expect(ALL_STORAGE_KEYS).toContain(key)
    }
  })

  it('erases every key the app writes', () => {
    for (const key of everyKey) localStorage.setItem(key, 'x')
    clearAllData()
    for (const key of everyKey) {
      expect(localStorage.getItem(key)).toBeNull()
    }
  })

  it('sweeps an unregistered sol-cycle key too', () => {
    localStorage.setItem('sol-cycle-some-future-feature', 'sensitive')
    clearAllData()
    expect(localStorage.getItem('sol-cycle-some-future-feature')).toBeNull()
  })

  it('leaves keys belonging to other apps alone', () => {
    localStorage.setItem('unrelated-app-key', 'keep me')
    clearAllData()
    expect(localStorage.getItem('unrelated-app-key')).toBe('keep me')
  })

  it('leaves the app with no logs afterwards', () => {
    saveCycleLog(log('2026-08-18', { flow: 'heavy', notes: 'private' }))
    clearAllData()
    expect(getCycleLogs()).toEqual([])
  })
})

describe('subscribeToCycleData', () => {
  it('notifies on a log write', () => {
    const listener = vi.fn()
    subscribeToCycleData(listener)
    saveCycleLog(log('2026-08-18'))
    expect(listener).toHaveBeenCalled()
  })

  it('notifies on delete, settings and preference writes, and clear', () => {
    saveCycleLog(log('2026-08-18'))
    const listener = vi.fn()
    const unsubscribe = subscribeToCycleData(listener)

    deleteCycleLog('2026-08-18')
    saveCycleSettings({ averageCycleLength: 30 })
    saveUserPreferences({ notificationsEnabled: true })
    clearAllData()

    expect(listener).toHaveBeenCalledTimes(4)
    unsubscribe()
  })

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToCycleData(listener)
    unsubscribe()
    saveCycleLog(log('2026-08-18'))
    expect(listener).not.toHaveBeenCalled()
  })

  it('notifies every subscriber, which is what keeps two hook instances in step', () => {
    const mainScreen = vi.fn()
    const sideMenu = vi.fn()
    const un1 = subscribeToCycleData(mainScreen)
    const un2 = subscribeToCycleData(sideMenu)

    saveCycleLog(log('2026-08-18', { flow: 'medium' }))

    expect(mainScreen).toHaveBeenCalledTimes(1)
    expect(sideMenu).toHaveBeenCalledTimes(1)
    un1()
    un2()
  })
})
