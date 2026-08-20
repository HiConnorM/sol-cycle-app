'use client'

/**
 * scheduler.ts — hands the planner's output to the OS.
 *
 * Everything here is a no-op outside the native shell: local notifications are
 * a Capacitor plugin, and the web build has no equivalent worth faking. The
 * plugin is imported dynamically so it never enters the web bundle.
 *
 * The scheduling model is replace-all rather than diff: cancel everything this
 * app scheduled, then schedule the current plan. Predictions move every time
 * the user logs a day, so an incremental diff would be more code and more ways
 * to leave a stale reminder behind.
 */
import { isNativeShell } from '@/lib/platform'
import { planNotifications } from './planner'
import type { PlannedNotification, SchedulerInput } from './types'

export type PermissionState = 'granted' | 'denied' | 'unsupported'

/**
 * Ask for notification permission.
 *
 * iOS only shows the system prompt once ever; after that this resolves to
 * whatever the user chose, and changing it means a trip to Settings. The
 * caller surfaces that distinction.
 */
export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!isNativeShell()) return 'unsupported'
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted' ? 'granted' : 'denied'
  } catch {
    return 'unsupported'
  }
}

/** Current permission state without prompting. */
export async function checkNotificationPermission(): Promise<PermissionState> {
  if (!isNativeShell()) return 'unsupported'
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const result = await LocalNotifications.checkPermissions()
    return result.display === 'granted' ? 'granted' : 'denied'
  } catch {
    return 'unsupported'
  }
}

/** Cancel every notification this app has pending. */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNativeShell()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications })
    }
  } catch {
    /* nothing scheduled, or the plugin is unavailable */
  }
}

/**
 * Re-plan and re-schedule from the current cycle state.
 *
 * Safe to call on every data change; returns the notifications it scheduled so
 * callers (and tests) can assert on the result.
 */
export async function rescheduleNotifications(
  input: SchedulerInput
): Promise<PlannedNotification[]> {
  if (!isNativeShell()) return []

  const planned = planNotifications(input)

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    // Permission may have been revoked in Settings since the toggle was set.
    const permission = await LocalNotifications.checkPermissions()
    if (permission.display !== 'granted') {
      await cancelAllNotifications()
      return []
    }

    await cancelAllNotifications()
    if (planned.length === 0) return []

    await LocalNotifications.schedule({
      notifications: planned.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        schedule: { at: n.at, allowWhileIdle: false },
        // Grouped so iOS stacks them rather than showing five separate
        // banners if several land on the same morning.
        group: 'sol-cycle',
        extra: { kind: n.kind },
      })),
    })
  } catch (error) {
    // A scheduling failure must never break the app — the user loses a
    // reminder, not their data.
    console.warn('Could not schedule notifications:', error)
    return []
  }

  return planned
}
