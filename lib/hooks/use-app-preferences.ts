'use client'

/**
 * use-app-preferences.ts
 *
 * Read-only access to the settings the side menu writes.
 *
 * The side menu owns the full preferences blob and its editing UI; screens
 * that merely *respond* to a setting shouldn't have to import that component's
 * internal type. This exposes the handful of fields other screens act on, with
 * defaults, read through the same store so a settings change re-renders them
 * immediately.
 */

import { useSyncExternalStore } from 'react'
import { subscribeToCycleData } from '@/lib/storage/cycle-storage'

const PREFERENCES_KEY = 'sol-cycle-preferences'

export interface AppPreferences {
  /** Whether to show phase-based food guidance at all. */
  recommendationsEnabled: boolean
  /** 'light' shows a short list; 'detailed' shows everything. */
  foodTrackingStyle: 'light' | 'detailed'
  /** First day of the week in calendar grids. 0 = Sunday. */
  weekStartDay: 0 | 1 | 6
}

const DEFAULTS: AppPreferences = {
  recommendationsEnabled: true,
  foodTrackingStyle: 'light',
  weekStartDay: 0,
}

/**
 * Cached so the snapshot is referentially stable between writes —
 * useSyncExternalStore re-renders without end otherwise.
 */
let cached: AppPreferences | null = null
let cachedRaw: string | null = null

function getSnapshot(): AppPreferences {
  if (typeof window === 'undefined') return DEFAULTS

  const raw = localStorage.getItem(PREFERENCES_KEY)
  if (raw === cachedRaw && cached) return cached

  cachedRaw = raw
  try {
    const parsed = raw ? JSON.parse(raw) : null
    cached =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? {
            recommendationsEnabled:
              typeof parsed.recommendationsEnabled === 'boolean'
                ? parsed.recommendationsEnabled
                : DEFAULTS.recommendationsEnabled,
            foodTrackingStyle:
              parsed.foodTrackingStyle === 'detailed' ? 'detailed' : 'light',
            weekStartDay:
              parsed.weekStartDay === 1 || parsed.weekStartDay === 6
                ? parsed.weekStartDay
                : 0,
          }
        : DEFAULTS
  } catch {
    cached = DEFAULTS
  }
  return cached
}

function getServerSnapshot(): AppPreferences {
  return DEFAULTS
}

export function useAppPreferences(): AppPreferences {
  return useSyncExternalStore(subscribeToCycleData, getSnapshot, getServerSnapshot)
}
