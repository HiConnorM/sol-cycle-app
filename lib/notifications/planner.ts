/**
 * planner.ts — decides *what* to notify and *when*.
 *
 * Pure: takes the current prediction and preferences, returns a list of
 * notifications. No plugin imports, no side effects, no clock reads — `now` is
 * passed in. That keeps the scheduling rules unit-testable, which matters
 * because a mis-scheduled reminder is invisible until it fires on the wrong
 * day in someone's real life.
 *
 * Two constraints shape the output:
 *
 * • iOS allows at most 64 pending local notifications per app. The planner
 *   works a rolling 30-day window and stays well inside that.
 * • Everything is scheduled from the *predicted* cycle, which moves as the
 *   user logs. The scheduler re-plans on every data change, so the planner
 *   must be idempotent — the same input always yields the same ids.
 */
import { addDays, daysBetween, fromDateKey, startOfLocalDay, toDateKey } from '@/lib/utils/date-keys'
import { getCyclePhase, getPhaseInfo } from '@/lib/calendar/cycle-calculations'
import type { CyclePhase } from '@/lib/types'
import type { NotificationKind, PlannedNotification, SchedulerInput } from './types'

/** How far ahead to schedule. Re-planned on every data change anyway. */
const HORIZON_DAYS = 30

/** Local hour each kind fires at. */
const HOUR: Record<NotificationKind, number> = {
  'daily-check-in': 20, // evening, once the day has actually happened
  'phase-change': 9,
  'pmdd-window': 9,
  'hard-day': 8, // early enough to change the shape of the day
  'meal-suggestion': 11, // before lunch
}

/**
 * Stable numeric id: kind index in the high digits, days-from-epoch in the low.
 * Deterministic for a given (kind, day) so re-planning overwrites rather than
 * duplicates.
 */
const KIND_INDEX: Record<NotificationKind, number> = {
  'daily-check-in': 1,
  'phase-change': 2,
  'pmdd-window': 3,
  'hard-day': 4,
  'meal-suggestion': 5,
}

function notificationId(kind: NotificationKind, day: Date): number {
  const dayNumber = Math.floor(startOfLocalDay(day).getTime() / 86_400_000)
  return KIND_INDEX[kind] * 1_000_000 + dayNumber
}

function at(day: Date, kind: NotificationKind): Date {
  const when = startOfLocalDay(day)
  when.setHours(HOUR[kind], 0, 0, 0)
  return when
}

/** Phase-appropriate nourishment prompts, matching the Nourish screen's voice. */
const MEAL_BY_PHASE: Record<CyclePhase, string> = {
  menstrual: 'Iron-rich foods and something warm can help today.',
  follicular: 'Fresh, light foods suit your rising energy right now.',
  ovulatory: 'Fibre and antioxidants support you through this phase.',
  luteal: 'Complex carbs and magnesium can smooth out this stretch.',
}

/**
 * Plan the notifications for the next 30 days.
 *
 * Returns an empty list whenever notifications are off or quiet mode is on, so
 * the caller can treat "plan then replace" as the single code path.
 */
export function planNotifications(input: SchedulerInput): PlannedNotification[] {
  const { preferences, prediction, symptomPatterns, cycleLength, periodLength, lastPeriodStart, now } = input

  if (!preferences.notificationsEnabled || preferences.quietMode) return []

  const planned: PlannedNotification[] = []
  const today = startOfLocalDay(now)
  const horizonEnd = addDays(today, HORIZON_DAYS)

  const inWindow = (d: Date) => d.getTime() > now.getTime() && d.getTime() <= horizonEnd.getTime()

  // ── Daily check-in ────────────────────────────────────────────────────────
  if (preferences.dailyCheckIn) {
    for (let i = 0; i < HORIZON_DAYS; i++) {
      const when = at(addDays(today, i), 'daily-check-in')
      if (!inWindow(when)) continue
      planned.push({
        id: notificationId('daily-check-in', when),
        kind: 'daily-check-in',
        title: 'How was today?',
        body: 'Take a moment to log how you felt.',
        at: when,
      })
    }
  }

  // ── Phase changes ─────────────────────────────────────────────────────────
  // Walks forward from the current cycle anchor, emitting one notification on
  // each day the phase differs from the day before.
  if (preferences.phaseChangeAlerts && lastPeriodStart) {
    const anchor = fromDateKey(lastPeriodStart)
    let previousPhase: CyclePhase | null = null

    for (let i = 0; i < HORIZON_DAYS + 1; i++) {
      const day = addDays(today, i - 1) // start one day back to seed previousPhase
      // Cycle day wraps: the projection continues into the next cycle.
      const elapsed = daysBetween(anchor, day)
      if (elapsed < 0) continue
      const cycleDay = (elapsed % cycleLength) + 1
      const phase = getCyclePhase(cycleDay, cycleLength, periodLength)

      if (previousPhase !== null && phase !== previousPhase) {
        const when = at(day, 'phase-change')
        if (inWindow(when)) {
          const info = getPhaseInfo(phase)
          planned.push({
            id: notificationId('phase-change', when),
            kind: 'phase-change',
            title: `Entering your ${info.name.toLowerCase()} phase`,
            body: info.description,
            at: when,
          })
        }
      }
      previousPhase = phase
    }
  }

  // ── PMDD window ───────────────────────────────────────────────────────────
  // One notification at the start of the predicted window, framed as awareness
  // rather than prediction — the app never tells someone how they will feel.
  if (preferences.pmddAlerts && prediction.pmddWindowStart) {
    const when = at(prediction.pmddWindowStart, 'pmdd-window')
    if (inWindow(when)) {
      planned.push({
        id: notificationId('pmdd-window', when),
        kind: 'pmdd-window',
        title: 'Your pre-period window starts around now',
        body: 'Some people notice stronger moods here. Being gentle with yourself is enough.',
        at: when,
      })
    }
  }

  // ── Hard-day heads-up ─────────────────────────────────────────────────────
  // Uses the user's own lead-indicator symptoms: reliable ones that show up a
  // known number of days before their period. Only fires for patterns strong
  // enough to be worth acting on.
  if (preferences.hardDayAlerts && prediction.nextPeriodStart) {
    const leads = symptomPatterns
      .filter(p => p.isLeadIndicator && p.frequency >= 0.6 && p.daysBeforePeriod !== undefined)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 2)

    for (const pattern of leads) {
      // Land the day before the symptom typically appears.
      const when = at(
        addDays(prediction.nextPeriodStart, -(pattern.daysBeforePeriod! + 1)),
        'hard-day'
      )
      if (!inWindow(when)) continue
      planned.push({
        id: notificationId('hard-day', when),
        kind: 'hard-day',
        title: 'A gentler day may be ahead',
        body: `You often log ${pattern.symptom.toLowerCase()} around now. Worth planning some room.`,
        at: when,
      })
    }
  }

  // ── Meal suggestions ──────────────────────────────────────────────────────
  // One per phase rather than daily — a food nudge every day is noise.
  if (preferences.mealSuggestions && lastPeriodStart) {
    const anchor = fromDateKey(lastPeriodStart)
    const seen = new Set<CyclePhase>()

    for (let i = 0; i < HORIZON_DAYS; i++) {
      const day = addDays(today, i)
      const elapsed = daysBetween(anchor, day)
      if (elapsed < 0) continue
      const cycleDay = (elapsed % cycleLength) + 1
      const phase = getCyclePhase(cycleDay, cycleLength, periodLength)
      if (seen.has(phase)) continue

      const when = at(day, 'meal-suggestion')
      if (!inWindow(when)) continue
      seen.add(phase)
      planned.push({
        id: notificationId('meal-suggestion', when),
        kind: 'meal-suggestion',
        title: 'Eating for this phase',
        body: MEAL_BY_PHASE[phase],
        at: when,
      })
    }
  }

  // Deterministic order, and de-duplicated by id so two rules can't collide.
  const byId = new Map<number, PlannedNotification>()
  for (const n of planned) if (!byId.has(n.id)) byId.set(n.id, n)

  const ordered = [...byId.values()].sort((a, b) => a.at.getTime() - b.at.getTime())

  // Applied once, at the end, rather than at each call site above. Every rule
  // that adds a notification is then discreet by construction — a new one
  // cannot forget to handle it.
  return preferences.discreetNotifications ? ordered.map(toDiscreet) : ordered
}

/**
 * Neutral wording for a notification, used when discreet mode is on.
 *
 * The reminder still has to be worth acting on, so each one says there is
 * something to see and where — it just never names a phase, a symptom, or
 * anything about the body. The app's own name still appears in the iOS
 * notification header; that is not suppressible and is not what leaks.
 */
const DISCREET_BODY: Record<NotificationKind, string> = {
  'daily-check-in': 'Time for your daily check-in.',
  'phase-change': 'There is an update waiting in the app.',
  'pmdd-window': 'There is a note waiting for you in the app.',
  'hard-day': 'There is a note waiting for you in the app.',
  'meal-suggestion': 'There is a suggestion waiting in Nourish.',
}

export function toDiscreet(notification: PlannedNotification): PlannedNotification {
  return {
    ...notification,
    title: 'Sol Cycle',
    body: DISCREET_BODY[notification.kind],
  }
}

/** Date keys of every planned notification — used by the tests and debug UI. */
export function plannedDays(planned: PlannedNotification[]): string[] {
  return planned.map(n => toDateKey(n.at))
}
