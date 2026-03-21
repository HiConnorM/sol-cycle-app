/**
 * Basic astrology utilities for star chart display
 * Zodiac sign calculations based on sun position
 */

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'

export interface ZodiacInfo {
  sign: ZodiacSign
  name: string
  symbol: string
  element: 'fire' | 'earth' | 'air' | 'water'
  startDate: { month: number; day: number }
  endDate: { month: number; day: number }
  traits: string[]
}

export const ZODIAC_SIGNS: ZodiacInfo[] = [
  {
    sign: 'aries',
    name: 'Aries',
    symbol: '♈',
    element: 'fire',
    startDate: { month: 3, day: 21 },
    endDate: { month: 4, day: 19 },
    traits: ['Bold', 'Ambitious', 'Independent'],
  },
  {
    sign: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    element: 'earth',
    startDate: { month: 4, day: 20 },
    endDate: { month: 5, day: 20 },
    traits: ['Patient', 'Reliable', 'Devoted'],
  },
  {
    sign: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    element: 'air',
    startDate: { month: 5, day: 21 },
    endDate: { month: 6, day: 20 },
    traits: ['Curious', 'Adaptable', 'Expressive'],
  },
  {
    sign: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    element: 'water',
    startDate: { month: 6, day: 21 },
    endDate: { month: 7, day: 22 },
    traits: ['Intuitive', 'Nurturing', 'Protective'],
  },
  {
    sign: 'leo',
    name: 'Leo',
    symbol: '♌',
    element: 'fire',
    startDate: { month: 7, day: 23 },
    endDate: { month: 8, day: 22 },
    traits: ['Creative', 'Confident', 'Generous'],
  },
  {
    sign: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    element: 'earth',
    startDate: { month: 8, day: 23 },
    endDate: { month: 9, day: 22 },
    traits: ['Analytical', 'Practical', 'Kind'],
  },
  {
    sign: 'libra',
    name: 'Libra',
    symbol: '♎',
    element: 'air',
    startDate: { month: 9, day: 23 },
    endDate: { month: 10, day: 22 },
    traits: ['Diplomatic', 'Fair', 'Social'],
  },
  {
    sign: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    element: 'water',
    startDate: { month: 10, day: 23 },
    endDate: { month: 11, day: 21 },
    traits: ['Passionate', 'Determined', 'Intuitive'],
  },
  {
    sign: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    element: 'fire',
    startDate: { month: 11, day: 22 },
    endDate: { month: 12, day: 21 },
    traits: ['Optimistic', 'Adventurous', 'Honest'],
  },
  {
    sign: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    element: 'earth',
    startDate: { month: 12, day: 22 },
    endDate: { month: 1, day: 19 },
    traits: ['Disciplined', 'Ambitious', 'Responsible'],
  },
  {
    sign: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    element: 'air',
    startDate: { month: 1, day: 20 },
    endDate: { month: 2, day: 18 },
    traits: ['Progressive', 'Original', 'Humanitarian'],
  },
  {
    sign: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    element: 'water',
    startDate: { month: 2, day: 19 },
    endDate: { month: 3, day: 20 },
    traits: ['Compassionate', 'Artistic', 'Intuitive'],
  },
]

/**
 * Get current zodiac sign based on date
 */
export function getZodiacSign(date: Date): ZodiacInfo {
  const month = date.getMonth() + 1
  const day = date.getDate()

  for (const sign of ZODIAC_SIGNS) {
    const { startDate, endDate } = sign
    
    // Handle signs that span year boundary (Capricorn)
    if (startDate.month > endDate.month) {
      if (
        (month === startDate.month && day >= startDate.day) ||
        (month === endDate.month && day <= endDate.day) ||
        month > startDate.month ||
        month < endDate.month
      ) {
        return sign
      }
    } else {
      if (
        (month === startDate.month && day >= startDate.day) ||
        (month === endDate.month && day <= endDate.day) ||
        (month > startDate.month && month < endDate.month)
      ) {
        return sign
      }
    }
  }

  return ZODIAC_SIGNS[0] // Fallback to Aries
}

/**
 * Get element color
 */
export function getElementColor(element: 'fire' | 'earth' | 'air' | 'water'): string {
  const colors = {
    fire: '#E6B8A2', // Soft Peach
    earth: '#AFC3A4', // Soft Olive
    air: '#C9D6E3', // Pale Blue
    water: '#B7D3CF', // Misty Teal
  }
  return colors[element]
}

/**
 * Get cycle phase associated with zodiac element
 */
export function getElementCyclePhase(element: 'fire' | 'earth' | 'air' | 'water'): string {
  const phases = {
    fire: 'ovulatory', // Peak energy, expressive
    earth: 'luteal', // Grounding, nesting
    air: 'follicular', // Rising energy, planning
    water: 'menstrual', // Intuitive, introspective
  }
  return phases[element]
}

/**
 * Get horoscope-like cycle insight based on current sign and phase
 */
export function getCycleAstroInsight(
  zodiac: ZodiacInfo,
  cyclePhase: string | null
): string {
  const elementInsights = {
    fire: {
      menstrual: 'Rest now to fuel your natural fire. Your energy will return stronger.',
      follicular: 'Your creative spark is igniting. Channel this rising energy into bold plans.',
      ovulatory: 'You\'re radiating peak fire energy. Lead with confidence.',
      luteal: 'Turn your fire inward. Reflect before taking action.',
    },
    earth: {
      menstrual: 'Ground yourself deeply. Your body knows what it needs.',
      follicular: 'Plant seeds for new routines. Build steady foundations.',
      ovulatory: 'Your practical energy is at its peak. Make things happen.',
      luteal: 'Nest and prepare. Your earth energy calls for comfort.',
    },
    air: {
      menstrual: 'Let your thoughts drift freely. Dreams carry messages.',
      follicular: 'Your mind is clearing. Fresh ideas are flowing in.',
      ovulatory: 'Communicate boldly. Your words carry extra power now.',
      luteal: 'Mental fog is normal. Write down what swirls in your mind.',
    },
    water: {
      menstrual: 'Flow with your emotions. This is your most intuitive time.',
      follicular: 'Emotional clarity is returning. Trust your rising feelings.',
      ovulatory: 'Your emotional intelligence peaks. Connect deeply with others.',
      luteal: 'The emotional tide is shifting. Honor what surfaces.',
    },
  }

  const phase = (cyclePhase || 'menstrual') as keyof typeof elementInsights.fire
  return elementInsights[zodiac.element][phase]
}
