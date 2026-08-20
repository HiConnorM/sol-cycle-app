'use client'

/**
 * use-notifications.ts
 *
 * Keeps the OS's pending notifications in step with the user's preferences and
 * their current prediction.
 *
 * Everything the app schedules is derived from data that moves — the predicted
 * period start shifts each time a day is logged — so the hook re-plans whenever
 * the prediction, the settings, or the cycle anchor change. Re-planning is
 * replace-all and idempotent (see scheduler.ts), so an extra run is harmless.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useCycle } from './use-cycle'
import { isNativeShell } from '@/lib/platform'
import {
  cancelAllNotifications,
  checkNotificationPermission,
  requestNotificationPermission,
  rescheduleNotifications,
  type PermissionState,
} from '@/lib/notifications/scheduler'
import type { NotificationPreferences } from '@/lib/notifications/types'

export interface UseNotificationsReturn {
  /** Whether this build can schedule notifications at all. */
  isSupported: boolean
  /** OS permission state; 'unsupported' on the web build. */
  permission: PermissionState
  /**
   * Ask for permission. Returns the resulting state so the caller can decide
   * whether to leave the toggle on. iOS prompts only once ever — a 'denied'
   * result after that means the user must change it in Settings.
   */
  request: () => Promise<PermissionState>
  /** Cancel everything pending — used when notifications are switched off. */
  cancelAll: () => Promise<void>
}

export function useNotifications(
  preferences: NotificationPreferences | null
): UseNotificationsReturn {
  const { prediction, symptomPatterns, settings } = useCycle()
  const [permission, setPermission] = useState<PermissionState>('unsupported')
  const isSupported = isNativeShell()

  useEffect(() => {
    let cancelled = false
    checkNotificationPermission().then(state => {
      if (!cancelled) setPermission(state)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const request = useCallback(async () => {
    const state = await requestNotificationPermission()
    setPermission(state)
    return state
  }, [])

  const cancelAll = useCallback(async () => {
    await cancelAllNotifications()
  }, [])

  // Re-plan whenever the inputs move. The dependency list is deliberately the
  // *values* the plan depends on rather than the objects holding them — the
  // prediction object is rebuilt on every render of useCycle.
  const nextPeriodTime = prediction.nextPeriodStart?.getTime() ?? null
  const pmddWindowTime = prediction.pmddWindowStart?.getTime() ?? null
  const preferenceKey = preferences ? JSON.stringify(preferences) : null

  // Held in a ref so the scheduling effect can read the latest values without
  // listing objects that change identity every render. Written in an effect
  // rather than during render — a ref mutated in the render body is a write
  // React is entitled to discard. Declared before the scheduling effect so it
  // runs first.
  const latest = useRef({ prediction, symptomPatterns, settings, preferences })
  useEffect(() => {
    latest.current = { prediction, symptomPatterns, settings, preferences }
  })

  useEffect(() => {
    if (!isSupported || permission !== 'granted' || preferenceKey === null) return

    const { prediction: p, symptomPatterns: s, settings: cfg, preferences: prefs } = latest.current
    if (!prefs) return

    void rescheduleNotifications({
      prediction: p,
      symptomPatterns: s,
      preferences: prefs,
      cycleLength: cfg.averageCycleLength,
      periodLength: cfg.averagePeriodLength,
      lastPeriodStart: cfg.lastPeriodStart,
      now: new Date(),
    })
  }, [
    isSupported,
    permission,
    preferenceKey,
    nextPeriodTime,
    pmddWindowTime,
    settings.averageCycleLength,
    settings.averagePeriodLength,
    settings.lastPeriodStart,
  ])

  return { isSupported, permission, request, cancelAll }
}
