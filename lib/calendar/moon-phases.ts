import type { MoonPhase, MoonPhaseData } from '@/lib/types'

/**
 * Calculate moon phase for a given date
 * Using a simplified algorithm based on lunar cycle
 * 
 * The average lunar cycle is 29.53 days
 * Reference: January 6, 2000 was a new moon
 */
export function getMoonPhase(date: Date): MoonPhaseData {
  // Reference new moon: January 6, 2000
  const referenceNewMoon = new Date(2000, 0, 6, 18, 14, 0)
  const lunarCycle = 29.53058867 // Average lunar cycle in days
  
  // Calculate days since reference new moon
  const diffTime = date.getTime() - referenceNewMoon.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  // Calculate position in current lunar cycle (0-1)
  const cyclePosition = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle
  const normalizedPosition = cyclePosition / lunarCycle
  
  // Calculate illumination (0-100)
  // Illumination follows a sine curve
  const illumination = Math.round((1 - Math.cos(normalizedPosition * 2 * Math.PI)) / 2 * 100)
  
  // Determine phase based on position
  let phase: MoonPhase
  let name: string
  
  if (normalizedPosition < 0.0625) {
    phase = 'new'
    name = 'New Moon'
  } else if (normalizedPosition < 0.1875) {
    phase = 'waxing-crescent'
    name = 'Waxing Crescent'
  } else if (normalizedPosition < 0.3125) {
    phase = 'first-quarter'
    name = 'First Quarter'
  } else if (normalizedPosition < 0.4375) {
    phase = 'waxing-gibbous'
    name = 'Waxing Gibbous'
  } else if (normalizedPosition < 0.5625) {
    phase = 'full'
    name = 'Full Moon'
  } else if (normalizedPosition < 0.6875) {
    phase = 'waning-gibbous'
    name = 'Waning Gibbous'
  } else if (normalizedPosition < 0.8125) {
    phase = 'last-quarter'
    name = 'Last Quarter'
  } else if (normalizedPosition < 0.9375) {
    phase = 'waning-crescent'
    name = 'Waning Crescent'
  } else {
    phase = 'new'
    name = 'New Moon'
  }
  
  return {
    phase,
    illumination,
    name,
  }
}

/**
 * Get moon phase icon path for SVG
 */
export function getMoonPhaseIcon(phase: MoonPhase): string {
  const icons: Record<MoonPhase, string> = {
    'new': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'waxing-crescent': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 0 1-5.7-13.7 10 10 0 0 0 0 11.4A8 8 0 0 1 12 20z',
    'first-quarter': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18V4a8 8 0 0 1 0 16z',
    'waxing-gibbous': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 16a8 8 0 0 1 0-12 10 10 0 0 0 0 12z',
    'full': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z',
    'waning-gibbous': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm2 16a8 8 0 0 0 0-12 10 10 0 0 1 0 12z',
    'last-quarter': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 0 0 0-16v16z',
    'waning-crescent': 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 0 0 5.7-13.7 10 10 0 0 1 0 11.4A8 8 0 0 0 12 20z',
  }
  
  return icons[phase]
}

/**
 * Get next occurrence of a specific moon phase
 */
export function getNextMoonPhase(phase: MoonPhase, fromDate: Date = new Date()): Date {
  const lunarCycle = 29.53058867
  const targetPositions: Record<MoonPhase, number> = {
    'new': 0,
    'waxing-crescent': 0.125,
    'first-quarter': 0.25,
    'waxing-gibbous': 0.375,
    'full': 0.5,
    'waning-gibbous': 0.625,
    'last-quarter': 0.75,
    'waning-crescent': 0.875,
  }
  
  const targetPosition = targetPositions[phase]
  const referenceNewMoon = new Date(2000, 0, 6, 18, 14, 0)
  
  // Calculate current position
  const diffTime = fromDate.getTime() - referenceNewMoon.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  const currentPosition = ((diffDays % lunarCycle) + lunarCycle) % lunarCycle / lunarCycle
  
  // Calculate days until target
  let daysUntil = (targetPosition - currentPosition) * lunarCycle
  if (daysUntil <= 0) {
    daysUntil += lunarCycle
  }
  
  const nextDate = new Date(fromDate)
  nextDate.setDate(nextDate.getDate() + Math.round(daysUntil))
  
  return nextDate
}
