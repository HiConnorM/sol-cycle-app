import type { CyclePhase, CycleSettings } from '@/lib/types'

/**
 * Calculate the current cycle day based on last period start
 */
export function getCurrentCycleDay(lastPeriodStart: string | null): number | null {
  if (!lastPeriodStart) return null
  
  const start = new Date(lastPeriodStart)
  const today = new Date()
  const diffTime = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Return cycle day (1-indexed)
  return diffDays + 1
}

/**
 * Determine the current cycle phase
 * 
 * Default cycle phases (assuming 28-day cycle):
 * - Menstrual: Days 1-5
 * - Follicular: Days 6-13
 * - Ovulatory: Days 14-16
 * - Luteal: Days 17-28
 */
export function getCyclePhase(
  cycleDay: number,
  cycleLength: number = 28,
  periodLength: number = 5
): CyclePhase {
  if (cycleDay <= periodLength) {
    return 'menstrual'
  }
  
  // Calculate phase boundaries based on cycle length
  const ovulationDay = Math.floor(cycleLength / 2)
  const follicularEnd = ovulationDay - 1
  const ovulatoryEnd = ovulationDay + 2
  
  if (cycleDay <= follicularEnd) {
    return 'follicular'
  }
  
  if (cycleDay <= ovulatoryEnd) {
    return 'ovulatory'
  }
  
  return 'luteal'
}

/**
 * Get phase display information
 */
export function getPhaseInfo(phase: CyclePhase): {
  name: string
  description: string
  color: string
  colorLight: string
} {
  const phases = {
    menstrual: {
      name: 'Menstrual',
      description: 'Your period phase',
      color: '#C7C3D9', // Lavender Gray
      colorLight: 'rgba(199, 195, 217, 0.15)',
    },
    follicular: {
      name: 'Follicular',
      description: 'Building energy',
      color: '#BFD8C2', // Sage Green
      colorLight: 'rgba(191, 216, 194, 0.15)',
    },
    ovulatory: {
      name: 'Ovulatory',
      description: 'Peak energy',
      color: '#EAD9A0', // Muted Gold
      colorLight: 'rgba(234, 217, 160, 0.15)',
    },
    luteal: {
      name: 'Luteal',
      description: 'Winding down',
      color: '#D8A7A7', // Dusty Rose
      colorLight: 'rgba(216, 167, 167, 0.15)',
    },
  }
  
  return phases[phase]
}

/**
 * Predict next period start date
 */
export function predictNextPeriod(
  lastPeriodStart: string | null,
  cycleLength: number = 28
): Date | null {
  if (!lastPeriodStart) return null
  
  const start = new Date(lastPeriodStart)
  const nextPeriod = new Date(start)
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength)
  
  return nextPeriod
}

/**
 * Default PMDD window: last 10 days of the cycle. Personal data overrides
 * this in `pmdd-profile.ts`.
 */
export function getDefaultPMDDWindow(cycleLength: number = 28): {
  startDay: number
  endDay: number
} {
  return { startDay: Math.max(1, cycleLength - 10), endDay: cycleLength }
}

/**
 * Check if currently in PMDD window (typically last 7-10 days of luteal phase)
 */
export function isInPMDDWindow(
  cycleDay: number,
  cycleLength: number = 28
): boolean {
  const { startDay, endDay } = getDefaultPMDDWindow(cycleLength)
  return cycleDay >= startDay && cycleDay <= endDay
}

/**
 * Compute the cycle day for a given date relative to the most recent
 * preceding period start. Returns null if the date is before any known start.
 *
 * This is the single source of truth for "what day of the cycle was this log
 * on?" — never use array index modulo a fixed cycle length.
 */
export function getCycleDayFromDate(
  date: Date | string,
  periodStarts: string[]
): number | null {
  if (!periodStarts || periodStarts.length === 0) return null

  const target =
    typeof date === 'string' ? new Date(date).getTime() : date.getTime()

  // Sort ascending and find latest start that is <= target.
  const sorted = [...periodStarts]
    .map(s => new Date(s).getTime())
    .filter(t => !isNaN(t))
    .sort((a, b) => a - b)

  let mostRecent: number | null = null
  for (const t of sorted) {
    if (t <= target) mostRecent = t
    else break
  }
  if (mostRecent === null) return null

  const days = Math.floor((target - mostRecent) / (1000 * 60 * 60 * 24))
  return days + 1
}

/**
 * Calculate days until next period
 */
export function daysUntilNextPeriod(
  lastPeriodStart: string | null,
  cycleLength: number = 28
): number | null {
  if (!lastPeriodStart) return null
  
  const cycleDay = getCurrentCycleDay(lastPeriodStart)
  if (!cycleDay) return null
  
  return Math.max(0, cycleLength - cycleDay + 1)
}

/**
 * Get cycle day within current cycle (normalized to cycle length)
 */
export function getNormalizedCycleDay(
  cycleDay: number,
  cycleLength: number = 28
): number {
  return ((cycleDay - 1) % cycleLength) + 1
}

/**
 * Calculate fertility window (roughly days 11-17 of cycle)
 */
export function getFertilityWindow(cycleLength: number = 28): {
  start: number
  peak: number
  end: number
} {
  const ovulationDay = Math.floor(cycleLength / 2)
  return {
    start: ovulationDay - 5,
    peak: ovulationDay,
    end: ovulationDay + 2,
  }
}

/**
 * Get phase color for a specific cycle day
 */
export function getPhaseColorForDay(
  day: number,
  cycleLength: number = 28,
  periodLength: number = 5
): string {
  const phase = getCyclePhase(day, cycleLength, periodLength)
  const info = getPhaseInfo(phase)
  return info.color
}
