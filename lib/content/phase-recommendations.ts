import type { CyclePhase } from '@/lib/types'

interface PhaseRecommendations {
  insight: string
  foods: string[]
  exercises: string[]
  rituals: string[]
  pmddSupport?: {
    message: string
    tips: string[]
  }
}

const PHASE_RECOMMENDATIONS: Record<CyclePhase, PhaseRecommendations> = {
  menstrual: {
    insight: 'Your body is releasing and renewing. Honor this natural process with rest, warmth, and gentle self-care. This is your inner winter - a time to slow down and turn inward.',
    foods: [
      'Iron-rich foods like spinach, lentils, and lean red meat to replenish what you lose',
      'Warm, comforting soups and broths to soothe your body',
      'Dark chocolate (70%+) for magnesium and mood support',
      'Anti-inflammatory foods like ginger, turmeric, and fatty fish',
      'Hydrating fruits like watermelon and oranges',
      'Herbal teas like chamomile, raspberry leaf, and ginger',
    ],
    exercises: [
      'Gentle yoga with restorative poses',
      'Slow walks in nature',
      'Light stretching to ease cramps',
      'Yin yoga or meditation',
      'Swimming (if comfortable)',
      'Rest days are perfectly okay',
    ],
    rituals: [
      'Take warm baths with Epsom salts',
      'Use a heating pad for comfort',
      'Journal about your feelings and intentions',
      'Practice deep breathing exercises',
      'Get extra sleep - aim for 8-9 hours',
      'Limit social commitments if needed',
    ],
  },
  
  follicular: {
    insight: 'Energy is building! Your body is preparing for ovulation and you may feel more creative, social, and motivated. This is your inner spring - a time for new beginnings and fresh ideas.',
    foods: [
      'Fresh, vibrant vegetables and leafy greens',
      'Lean proteins like chicken, fish, and eggs',
      'Fermented foods like yogurt, kimchi, and sauerkraut',
      'Complex carbs like oats, quinoa, and sweet potatoes',
      'Citrus fruits for vitamin C',
      'Sprouted or raw foods to match your rising energy',
    ],
    exercises: [
      'Try new workout classes or activities',
      'Cardio exercises like running, cycling, or dancing',
      'Strength training - your body is primed for building muscle',
      'High-energy group fitness classes',
      'Hiking or outdoor adventures',
      'Push yourself a bit harder than usual',
    ],
    rituals: [
      'Start new projects or set goals',
      'Brainstorm and plan for the month ahead',
      'Social activities and networking',
      'Creative pursuits and hobbies',
      'Morning routines and habit building',
      'Spring cleaning and organizing',
    ],
  },
  
  ovulatory: {
    insight: 'You\'re at peak energy! Confidence, communication skills, and magnetism are heightened. This is your inner summer - embrace your power and shine.',
    foods: [
      'Light, fresh meals that don\'t weigh you down',
      'Raw vegetables and colorful salads',
      'Antioxidant-rich berries',
      'Fiber-rich foods to support estrogen metabolism',
      'Hydrating foods like cucumber and celery',
      'Cooling herbs like mint and cilantro',
    ],
    exercises: [
      'High-intensity interval training (HIIT)',
      'Challenging strength workouts',
      'Group fitness and team sports',
      'Running or cycling at higher intensity',
      'Dance classes',
      'Competitive activities you enjoy',
    ],
    rituals: [
      'Important conversations and presentations',
      'Date nights and social gatherings',
      'Take on leadership roles',
      'Network and connect with others',
      'Express yourself creatively',
      'Celebrate your accomplishments',
    ],
  },
  
  luteal: {
    insight: 'Your body is preparing for the next cycle. Energy may feel more inward-focused. This is your inner autumn - a time to complete projects, nest, and prepare for rest.',
    foods: [
      'Complex carbohydrates to support serotonin production',
      'Magnesium-rich foods like dark chocolate, nuts, and seeds',
      'B-vitamin foods like whole grains and leafy greens',
      'Comfort foods that nourish without inflammation',
      'Foods rich in calcium like dairy or fortified alternatives',
      'Soothing herbal teas like chamomile or valerian',
    ],
    exercises: [
      'Moderate-intensity workouts',
      'Pilates and barre classes',
      'Swimming or water aerobics',
      'Yoga with a mix of active and restorative',
      'Walking and light jogging',
      'Scale back intensity as the phase progresses',
    ],
    rituals: [
      'Complete ongoing projects',
      'Organize and tidy your space',
      'Self-care evenings at home',
      'Journaling and reflection',
      'Prepare for your upcoming period',
      'Set boundaries and say no when needed',
    ],
    pmddSupport: {
      message: 'You\'re in the PMDD window. Your symptoms are valid, and this will pass. Be extra gentle with yourself.',
      tips: [
        'Track your symptoms to identify patterns',
        'Prioritize sleep and rest',
        'Reduce caffeine and alcohol',
        'Consider supplements like calcium, magnesium, or vitamin B6 (consult your doctor)',
        'Reach out to your support system',
        'Use coping strategies that have worked before',
        'Remember: this is temporary and you will feel better',
        'If symptoms are severe, talk to a healthcare provider about treatment options',
      ],
    },
  },
}

const DEFAULT_RECOMMENDATIONS: PhaseRecommendations = {
  insight: 'Start tracking your cycle to receive personalized recommendations based on your current phase.',
  foods: [
    'Balanced meals with plenty of vegetables',
    'Adequate protein for sustained energy',
    'Whole grains for fiber and B vitamins',
    'Healthy fats like avocado and olive oil',
  ],
  exercises: [
    'Regular movement that you enjoy',
    'Mix of cardio and strength training',
    'Stretching and flexibility work',
    'Listen to your body\'s signals',
  ],
  rituals: [
    'Consistent sleep schedule',
    'Daily moments of stillness',
    'Connection with loved ones',
    'Activities that bring you joy',
  ],
}

export function getPhaseRecommendations(
  phase: CyclePhase | null,
  inPMDDWindow: boolean = false
): PhaseRecommendations {
  if (!phase) {
    return DEFAULT_RECOMMENDATIONS
  }
  
  const recommendations = PHASE_RECOMMENDATIONS[phase]
  
  // Add PMDD support to any phase if in window
  if (inPMDDWindow && phase === 'luteal') {
    return recommendations
  }
  
  // Remove PMDD support if not in window
  const { pmddSupport, ...rest } = recommendations
  return inPMDDWindow ? recommendations : rest
}

// Export individual phase data for use in articles/community content
export const MENSTRUAL_PHASE_INFO = PHASE_RECOMMENDATIONS.menstrual
export const FOLLICULAR_PHASE_INFO = PHASE_RECOMMENDATIONS.follicular
export const OVULATORY_PHASE_INFO = PHASE_RECOMMENDATIONS.ovulatory
export const LUTEAL_PHASE_INFO = PHASE_RECOMMENDATIONS.luteal
