import '../core/constants.dart';

class PhaseRecommendations {
  final String insight;
  final List<String> foods;
  final List<String> exercises;
  final List<String> rituals;
  final PmddSupport? pmddSupport;

  const PhaseRecommendations({
    required this.insight,
    required this.foods,
    required this.exercises,
    required this.rituals,
    this.pmddSupport,
  });
}

class PmddSupport {
  final String message;
  final List<String> tips;
  const PmddSupport({required this.message, required this.tips});
}

const Map<String, PhaseRecommendations> _phaseContent = {
  CyclePhase.menstrual: PhaseRecommendations(
    insight: 'Your body is releasing and renewing. Honor this with rest, warmth, and gentle care. This is your inner winter — a sacred time to slow down and turn inward.',
    foods: [
      'Iron-rich foods — spinach, lentils, lean red meat',
      'Warm nourishing soups and broths',
      'Dark chocolate (70%+) for magnesium and mood',
      'Anti-inflammatory ginger, turmeric, fatty fish',
      'Hydrating fruits like watermelon and oranges',
      'Raspberry leaf tea, chamomile, ginger tea',
    ],
    exercises: [
      'Gentle yoga — restorative and yin poses',
      'Slow walks in nature',
      'Light stretching to ease cramps',
      'Meditation and breathwork',
      'Rest days are fully valid',
    ],
    rituals: [
      'Warm Epsom salt baths',
      'Heating pad for lower belly',
      'Journaling intentions for the next cycle',
      'Deep, slow breathing',
      'Extra sleep — aim for 8–9 hours',
    ],
  ),
  CyclePhase.follicular: PhaseRecommendations(
    insight: 'Energy is building. Your creativity and motivation are rising. This is your inner spring — a time for fresh starts, new ideas, and setting intentions into motion.',
    foods: [
      'Fresh vegetables and leafy greens',
      'Lean proteins — chicken, fish, eggs',
      'Fermented foods for gut health',
      'Complex carbs — oats, quinoa, sweet potato',
      'Citrus fruits for Vitamin C',
      'Sprouted foods to match your rising energy',
    ],
    exercises: [
      'Try a new workout class',
      'Cardio — running, cycling, dancing',
      'Strength training — your body builds well now',
      'High-energy group fitness',
      'Hiking and outdoor movement',
    ],
    rituals: [
      'Brainstorm and set new goals',
      'Social connection and collaboration',
      'Creative projects — writing, art, music',
      'Spring clean your space',
      'Morning sunlight and fresh air',
    ],
  ),
  CyclePhase.ovulatory: PhaseRecommendations(
    insight: 'You are at peak vitality. Communication flows easily, energy is high, and you feel most yourself. Your inner summer — radiate, connect, and enjoy.',
    foods: [
      'Raw and vibrant salads and vegetables',
      'Light proteins — fish, legumes, tofu',
      'Anti-inflammatory foods — berries, turmeric',
      'Fiber-rich foods for estrogen balance',
      'Hydrating foods and coconut water',
      'Cold-pressed juices and smoothies',
    ],
    exercises: [
      'High-intensity interval training',
      'Group sports and active socializing',
      'Dance classes and movement',
      'Long runs or challenging hikes',
      'Push your body — energy is at its peak',
    ],
    rituals: [
      'Schedule important conversations and presentations',
      'Connect with people you love',
      'Channel creative and sexual energy',
      'Be visible — attend events, share your ideas',
      'Celebrate what is working in your life',
    ],
  ),
  CyclePhase.luteal: PhaseRecommendations(
    insight: 'Your energy is turning inward. This is a time for completing, refining, and slowing down — not pushing. Your inner autumn is asking you to prepare for rest.',
    foods: [
      'Magnesium-rich foods — dark leafy greens, pumpkin seeds',
      'Complex carbs to stabilize mood — brown rice, lentils',
      'Calcium-rich foods — dairy, almonds, broccoli',
      'B6 foods — bananas, chickpeas, salmon',
      'Warming root vegetables',
      'Chamomile and passionflower tea for calm',
    ],
    exercises: [
      'Moderate-intensity workouts',
      'Yoga and pilates',
      'Walking and gentle movement',
      'Swimming',
      'Reduce intensity as the week progresses',
    ],
    rituals: [
      'Complete and wrap up projects',
      'Rest more and say no when needed',
      'Gentle body care — massage, warm baths',
      'Track what triggers discomfort',
      'Journal and process emotions',
    ],
    pmddSupport: PmddSupport(
      message: 'Your PMDD window may be approaching. Be extra gentle with yourself.',
      tips: [
        'Reduce caffeine and alcohol',
        'Prioritize sleep above all else',
        'Communicate your needs to people close to you',
        'Reschedule non-essential demands',
        'Magnesium glycinate may help',
        'Reach out to your doctor if symptoms feel unmanageable',
      ],
    ),
  ),
};

PhaseRecommendations getPhaseRecommendations(String phase, {bool inPmddWindow = false}) {
  final base = _phaseContent[phase] ?? _phaseContent[CyclePhase.follicular]!;
  if (inPmddWindow && base.pmddSupport == null) {
    return PhaseRecommendations(
      insight: base.insight,
      foods: base.foods,
      exercises: base.exercises,
      rituals: base.rituals,
      pmddSupport: const PmddSupport(
        message: 'Your PMDD window may be approaching. Be extra gentle with yourself.',
        tips: [
          'Reduce caffeine and alcohol',
          'Prioritize sleep',
          'Communicate your needs',
          'Reschedule non-essential demands',
        ],
      ),
    );
  }
  return base;
}

const List<Map<String, dynamic>> nourishCards = [
  {
    'phase': CyclePhase.menstrual,
    'title': 'Replenish',
    'description': 'Iron-rich, warming, and grounding foods to restore what is lost.',
    'tags': ['Iron', 'Warming', 'Anti-inflammatory'],
  },
  {
    'phase': CyclePhase.follicular,
    'title': 'Energize',
    'description': 'Fresh, vibrant, and protein-forward foods to match your rising energy.',
    'tags': ['Fresh', 'Protein', 'Fermented'],
  },
  {
    'phase': CyclePhase.ovulatory,
    'title': 'Radiate',
    'description': 'Raw, light, and fiber-rich foods to support peak vitality.',
    'tags': ['Raw', 'Light', 'Hydrating'],
  },
  {
    'phase': CyclePhase.luteal,
    'title': 'Stabilize',
    'description': 'Magnesium, B6, and complex carbs to steady your mood and energy.',
    'tags': ['Magnesium', 'B6', 'Grounding'],
  },
];
