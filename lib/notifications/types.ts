/**
 * types.ts — the shape the notification scheduler works from.
 *
 * Kept separate from the scheduler so the planning logic can be unit-tested
 * without importing the Capacitor plugin, which only resolves in the native
 * build.
 */
import type { CyclePrediction, SymptomPattern } from '@/lib/types'

/** The notification preferences, as stored under `sol-cycle-preferences`. */
export interface NotificationPreferences {
  notificationsEnabled: boolean
  dailyCheckIn: boolean
  phaseChangeAlerts: boolean
  pmddAlerts: boolean
  hardDayAlerts: boolean
  mealSuggestions: boolean
  quietMode: boolean
}

/** Which toggle produced a given notification. */
export type NotificationKind =
  | 'daily-check-in'
  | 'phase-change'
  | 'pmdd-window'
  | 'hard-day'
  | 'meal-suggestion'

/**
 * A notification the scheduler wants the OS to deliver.
 *
 * `id` is stable and derived from kind + date so re-planning produces the same
 * ids for the same days — the scheduler cancels everything it owns before
 * re-scheduling, and stable ids make that safe to run repeatedly.
 */
export interface PlannedNotification {
  id: number
  kind: NotificationKind
  title: string
  body: string
  /** Local time the notification should fire. */
  at: Date
}

export interface SchedulerInput {
  prediction: CyclePrediction
  symptomPatterns: SymptomPattern[]
  preferences: NotificationPreferences
  /** Cycle length used to place phase boundaries. */
  cycleLength: number
  periodLength: number
  /** Anchor for the current cycle — the most recent period start. */
  lastPeriodStart: string | null
  /** "Now", injected so the planner is deterministic under test. */
  now: Date
}
