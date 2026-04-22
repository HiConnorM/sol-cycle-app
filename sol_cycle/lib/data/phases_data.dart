import 'content_types.dart';

const List<PhaseObject> allPhases = [
  phaseMenstrual,
  phaseFollicular,
  phaseOvulatory,
  phaseLuteal,
];

PhaseObject? phaseById(String id) {
  try {
    return allPhases.firstWhere((p) => p.meta.id == id);
  } catch (_) {
    return null;
  }
}

// ─── Menstrual ────────────────────────────────────────────────────────────────

const phaseMenstrual = PhaseObject(
  meta: ContentMeta(
    id: 'phase-menstrual',
    type: 'cycle_phase',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['menstruation', 'bleeding', 'rest', 'iron', 'winter'],
    sourceRefs: [
      'Office on Women\'s Health — Your Menstrual Cycle',
      'ACOG — The Menstrual Cycle infographic',
    ],
    safetyFlags: [
      'Heavy or prolonged bleeding warrants medical evaluation.',
      'Fever with pelvic pain during menstruation — seek care.',
    ],
    pregnancyFlags: ['Menstruation does not occur during pregnancy.'],
  ),
  title: 'Menstrual Phase',
  archetype: 'Inner Winter',
  summary:
      'The first days of the cycle. The uterine lining sheds, hormones are at their lowest, and the body calls for rest and replenishment.',
  bodyDescription:
      'Estrogen and progesterone drop sharply at the start of menstruation, triggering the uterine lining to shed. '
      'Prostaglandins — hormone-like compounds released during this process — can cause uterine contractions and cramping. '
      'This phase typically lasts 3–7 days. Iron loss through bleeding makes nutrition important.',
  emotionalLandscape:
      'Many people experience lower energy, a pull toward quiet, and a natural desire to withdraw. '
      'Reflective, intuitive, and sometimes more emotionally sensitive.',
  supportFocus:
      'Rest is not optional — it is appropriate. Warmth, iron-rich foods, gentle movement only if it feels supportive, '
      'and permission to do less are the core supports here.',
  groundedDescription:
      'Estrogen and progesterone are at their lowest. The uterine lining is shedding. '
      'Prostaglandins drive cramping. Energy is physiologically lower. '
      'Iron loss through bleeding makes this a key time for nutritional support.',
  balancedDescription:
      'Your period has arrived. Hormones are at their lowest point, and your body is doing significant work. '
      'Energy dipping is normal — rest is not a luxury here, it\'s appropriate. '
      'Warmth, gentleness, and iron-supportive foods are your allies.',
  spiritualDescription:
      'Inner winter has arrived. This is the season of release — the body letting go of what no longer serves. '
      'The pull inward is not weakness; it is wisdom. Rest, warmth, and stillness belong here.',
  typicalDayRange: [1, 5],
  dominantHormones: 'Estrogen and progesterone at cycle low; prostaglandins active',
  commonSymptomIds: [
    'symptom-cramps',
    'symptom-fatigue',
    'symptom-heavy-bleeding',
    'symptom-back-pain',
    'symptom-nausea',
    'symptom-low-mood',
  ],
  ritualIds: [
    'ritual-warm-compress',
    'ritual-menstrual-nesting',
    'ritual-restorative-bath',
    'ritual-gentle-stretching',
  ],
  foodIds: [
    'food-iron-support-meals',
    'food-warming-meals',
    'food-ginger',
    'food-mineral-broth',
    'food-hydration-support',
  ],
  lessonIds: [
    'lesson-what-is-the-menstrual-cycle',
    'lesson-painful-periods-basics',
    'lesson-heavy-bleeding-basics',
  ],
  colorKey: 'phaseMenstrual',
);

// ─── Follicular ───────────────────────────────────────────────────────────────

const phaseFollicular = PhaseObject(
  meta: ContentMeta(
    id: 'phase-follicular',
    type: 'cycle_phase',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['follicular', 'estrogen', 'energy', 'spring', 'renewal'],
    sourceRefs: [
      'Office on Women\'s Health — Your Menstrual Cycle',
      'ACOG — The Menstrual Cycle infographic',
    ],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Follicular Phase',
  archetype: 'Inner Spring',
  summary:
      'After menstruation, estrogen rises as follicles in the ovaries develop. Energy builds, mood often lifts, and cognition sharpens.',
  bodyDescription:
      'The pituitary gland releases FSH (follicle-stimulating hormone), prompting several follicles in the ovaries to develop. '
      'The dominant follicle produces increasing amounts of estrogen, which thickens the uterine lining. '
      'Rising estrogen is associated with improved energy, mood, and cognitive clarity. '
      'This phase overlaps with the end of menstruation and extends to ovulation.',
  emotionalLandscape:
      'Typically characterized by increasing optimism, creativity, and motivation. '
      'New ideas, social energy, and forward momentum often feel more accessible.',
  supportFocus:
      'Let energy build naturally. Fresh, lighter foods support this phase well. '
      'This is a good time for new projects, learning, and physical activity if you feel drawn to it.',
  groundedDescription:
      'FSH rises, stimulating follicle development. Estrogen increases steadily, rebuilding the uterine lining. '
      'Energy and cognitive function improve. This phase bridges the end of menstruation and the approach to ovulation.',
  balancedDescription:
      'Energy begins to return. Estrogen is rising, and many people find this the most naturally productive part of their cycle. '
      'It\'s a good time to lean into things that feel lighter — new ideas, connection, movement that feels good.',
  spiritualDescription:
      'Inner spring is here. Something is stirring beneath the surface, reaching toward light. '
      'New beginnings feel more possible now — let yourself lean into what is wanting to emerge.',
  typicalDayRange: [6, 13],
  dominantHormones: 'FSH; rising estrogen',
  commonSymptomIds: [],
  ritualIds: [
    'ritual-light-walk',
    'ritual-cycle-check-in',
    'ritual-gentle-stretching',
  ],
  foodIds: [
    'food-protein-stable-breakfast',
    'food-fiber-support-basics',
    'food-hydration-support',
  ],
  lessonIds: [
    'lesson-what-is-the-menstrual-cycle',
    'lesson-how-to-track-your-cycle',
    'lesson-ovulation-basics',
  ],
  colorKey: 'phaseFollicular',
);

// ─── Ovulatory ────────────────────────────────────────────────────────────────

const phaseOvulatory = PhaseObject(
  meta: ContentMeta(
    id: 'phase-ovulatory',
    type: 'cycle_phase',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['ovulation', 'LH surge', 'fertility', 'peak energy', 'summer'],
    sourceRefs: [
      'Office on Women\'s Health — Ovulation and Fertility',
      'ACOG — The Menstrual Cycle infographic',
    ],
    safetyFlags: [
      'Ovulation pain (mittelschmerz) is common, but severe or persistent pelvic pain warrants evaluation.',
    ],
    pregnancyFlags: ['This is the most fertile window; conception is most likely here.'],
  ),
  title: 'Ovulatory Phase',
  archetype: 'Inner Summer',
  summary:
      'An LH surge triggers the release of a mature egg. Energy, libido, and social ease typically peak. This is the fertile window.',
  bodyDescription:
      'A rapid surge in LH (luteinizing hormone) triggers ovulation — the release of a mature egg from the dominant follicle. '
      'Estrogen peaks just before ovulation; testosterone also rises slightly. '
      'The egg is viable for approximately 12–24 hours. Sperm can survive up to 5 days, '
      'making the fertile window approximately 5 days before ovulation through the day of ovulation. '
      'Cervical mucus becomes clear and stretchy around this time.',
  emotionalLandscape:
      'Many people feel a peak in energy, confidence, and social ease. '
      'Communication, connection, and visibility often feel more natural.',
  supportFocus:
      'Honor the vitality of this phase if it\'s present, but it\'s not required to perform at a peak. '
      'For those trying to conceive, this is the most important fertility window.',
  groundedDescription:
      'LH surge triggers egg release. Estrogen peaks; testosterone rises slightly. '
      'Fertile window is approximately day 10–17 in a 28-day cycle, but this varies considerably. '
      'Cervical mucus becomes clear and stretchy, indicating peak fertility.',
  balancedDescription:
      'You may be approaching or in your ovulatory window. Energy and social ease often peak here. '
      'If you\'re trying to conceive, this is your most fertile time. '
      'If you\'re not, this phase can still be a good time to lean into connection and expression.',
  spiritualDescription:
      'Your inner summer arrives — full bloom, full expression, full presence. '
      'Radiance is not performance; it is simply what happens when your body is at its peak vitality. '
      'Receive it gently, offer it generously.',
  typicalDayRange: [14, 16],
  dominantHormones: 'LH surge; peak estrogen; slight testosterone rise',
  commonSymptomIds: [],
  ritualIds: [
    'ritual-light-walk',
    'ritual-cycle-check-in',
  ],
  foodIds: [
    'food-hydration-support',
    'food-fiber-support-basics',
    'food-protein-stable-breakfast',
  ],
  lessonIds: [
    'lesson-ovulation-basics',
    'lesson-fertility-awareness-basics',
  ],
  colorKey: 'phaseOvulatory',
);

// ─── Luteal ───────────────────────────────────────────────────────────────────

const phaseLuteal = PhaseObject(
  meta: ContentMeta(
    id: 'phase-luteal',
    type: 'cycle_phase',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['luteal', 'progesterone', 'PMS', 'PMDD', 'autumn', 'slowdown'],
    sourceRefs: [
      'Office on Women\'s Health — Premenstrual Syndrome',
      'ACOG — Premenstrual Syndrome',
      'IAPMD — PMDD Research',
    ],
    safetyFlags: [
      'Severe mood symptoms, particularly hopelessness or suicidal thoughts, in the luteal phase may indicate PMDD — seek medical support.',
      'Symptoms that significantly disrupt daily function warrant clinical evaluation.',
    ],
    pregnancyFlags: [
      'If pregnancy occurs, progesterone remains elevated and the period does not start.',
    ],
  ),
  title: 'Luteal Phase',
  archetype: 'Inner Autumn',
  summary:
      'After ovulation, progesterone rises. Energy often gradually decreases. PMS and PMDD symptoms commonly emerge in the second half of this phase.',
  bodyDescription:
      'After ovulation, the corpus luteum (the follicle shell left behind) produces progesterone. '
      'If fertilization does not occur, the corpus luteum breaks down, progesterone and estrogen fall, '
      'and menstruation begins. If fertilization does occur, the corpus luteum is maintained by hCG. '
      'Progesterone can cause fluid retention, breast tenderness, and mood changes. '
      'The PMDD-risk window is typically the 14 days before menstruation, peaking 4–5 days before.',
  emotionalLandscape:
      'The first half of the luteal phase is often comfortable. The second half may bring irritability, '
      'low mood, fatigue, brain fog, or heightened sensitivity. '
      'For those with PMDD, symptoms can be severe and significantly disruptive.',
  supportFocus:
      'Gentleness — with plans, with people, with self. Magnesium-rich foods, rest, lighter movement, '
      'and reducing stimulation can all help. Self-compassion is not optional here.',
  groundedDescription:
      'Progesterone dominates after ovulation. If no conception occurs, progesterone and estrogen decline, '
      'triggering menstruation. PMS symptoms are common; PMDD affects approximately 3–8% of those with cycles. '
      'Brain fog, fatigue, irritability, and mood changes are progesterone-related.',
  balancedDescription:
      'The luteal phase asks for more gentleness than other parts of the cycle. '
      'Progesterone is dominant, energy often dips, and many people notice increased sensitivity or irritability. '
      'This is normal — and worth tracking if it\'s disrupting your life.',
  spiritualDescription:
      'Your inner autumn calls you inward. The harvest is gathered, and the body prepares to release. '
      'Let yourself slow down. This is not failure — it is wisdom. The cycle asks for rest here, and rest is sacred.',
  typicalDayRange: [17, 28],
  dominantHormones: 'Progesterone dominant; estrogen secondary; both declining late luteal',
  commonSymptomIds: [
    'symptom-bloating',
    'symptom-irritability',
    'symptom-low-mood',
    'symptom-fatigue',
    'symptom-insomnia',
    'symptom-breast-tenderness',
    'symptom-headache',
    'symptom-brain-fog',
    'symptom-food-cravings',
  ],
  ritualIds: [
    'ritual-soft-luteal-day',
    'ritual-evening-wind-down',
    'ritual-breath-reset',
    'ritual-cycle-check-in',
    'ritual-moon-reflection',
  ],
  foodIds: [
    'food-magnesium-rich-foods',
    'food-warming-meals',
    'food-protein-stable-breakfast',
    'food-digestive-soothing-foods',
  ],
  lessonIds: [
    'lesson-luteal-phase-basics',
    'lesson-pmdd-vs-pms',
  ],
  colorKey: 'phaseLuteal',
);
