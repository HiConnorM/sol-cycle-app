import 'content_types.dart';

const List<RitualObject> allRituals = [
  ritualWarmCompress,
  ritualRestorativeBath,
  ritualBreathReset,
  ritualLightWalk,
  ritualEveningWindDown,
  ritualCycleCheckIn,
  ritualSoftLutealDay,
  ritualMenstrualNesting,
  ritualGentleStretching,
  ritualMoonReflection,
];

RitualObject? ritualById(String id) {
  try {
    return allRituals.firstWhere((r) => r.meta.id == id);
  } catch (_) {
    return null;
  }
}

// ─── Warm Compress ────────────────────────────────────────────────────────────

const ritualWarmCompress = RitualObject(
  meta: ContentMeta(
    id: 'ritual-warm-compress',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['heat', 'cramps', 'pain', 'menstrual', 'gentle'],
    sourceRefs: ['Traditional use; some research supports continuous low-level heat for dysmenorrhea'],
    safetyFlags: [],
    pregnancyFlags: ['A warm (not hot) compress is generally safe in pregnancy; avoid very hot heat packs on the abdomen.'],
  ),
  title: 'Warm Compress',
  summary:
      'Applying gentle heat to the lower abdomen or back to ease cramping, pelvic tension, and menstrual pain.',
  whatItIs:
      'A warm compress — a hot water bottle, heat pad, or warmed cloth — placed on the lower abdomen or lower back. '
      'Heat relaxes smooth muscle, improves local blood flow, and may modulate pain perception. '
      'Research supports low-level heat as a comparable option to ibuprofen for mild-to-moderate menstrual cramps.',
  whoItMayHelp:
      'People experiencing menstrual cramps, lower back pain, pelvic tension, or general discomfort during their period.',
  whenUseful: 'Most useful in the menstrual phase, particularly on the first 1–3 days of bleeding.',
  whenToAvoid: 'Avoid applying very high heat directly to the skin for prolonged periods to prevent burns.',
  duration: '15–20 minutes, repeated as needed',
  energyRequired: 'low',
  phaseIds: ['phase-menstrual'],
  symbolicResonance: 'Warmth as care — an act of tending to yourself rather than pushing through.',
  symptomIds: ['symptom-cramps', 'symptom-pelvic-pain', 'symptom-back-pain'],
  pregnancyCaution: 'Gentle warmth is generally safe in pregnancy; avoid high heat and keep the pack warm rather than hot.',
  steps: [
    'Fill a hot water bottle with hot (not boiling) water, or use a heat pad set to low or medium.',
    'Place a light cloth between the heat source and your skin if needed.',
    'Lie down or sit comfortably, placing the compress on your lower abdomen or lower back — wherever the discomfort is greatest.',
    'Rest for 15–20 minutes. Breathe slowly and let the muscles soften toward the warmth.',
    'Repeat as needed throughout the day.',
  ],
);

// ─── Restorative Bath ─────────────────────────────────────────────────────────

const ritualRestorativeBath = RitualObject(
  meta: ContentMeta(
    id: 'ritual-restorative-bath',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['bath', 'nervous system', 'rest', 'magnesium', 'menstrual', 'luteal'],
    sourceRefs: ['Traditional use; hydrotherapy has long-standing traditional roots'],
    safetyFlags: [],
    pregnancyFlags: ['Avoid very hot baths in pregnancy — keep water warm, not hot. Hot tubs and saunas should be avoided.'],
  ),
  title: 'Restorative Bath',
  summary:
      'A warm bath taken with intention — to ease muscle tension, support the nervous system, and offer the body care during a difficult phase.',
  whatItIs:
      'Warm water immersion helps relax muscles, ease pelvic and back tension, and signal the nervous system toward rest. '
      'Adding Epsom salts (magnesium sulfate) is a traditional practice — while systemic magnesium absorption through skin is debated, '
      'many people find the ritual itself deeply settling. '
      'The bath is approached as a gentle, deliberate act of self-tending, not just hygiene.',
  whoItMayHelp:
      'People with cramps, back pain, fatigue, pelvic tension, insomnia, or high nervous system activation — '
      'particularly during the menstrual or luteal phase.',
  whenUseful: 'Menstrual phase for pain; late luteal phase for nervous system support; any phase for wind-down.',
  duration: '15–30 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-menstrual', 'phase-luteal'],
  symbolicResonance: 'Water as release and restoration. A threshold between doing and being.',
  symptomIds: ['symptom-cramps', 'symptom-back-pain', 'symptom-insomnia', 'symptom-irritability'],
  pregnancyCaution: 'Keep bath water warm rather than hot in pregnancy. Avoid hot tubs.',
  steps: [
    'Draw a warm (not scalding) bath.',
    'Add 1–2 cups of Epsom salts if available and desired.',
    'Optional: a few drops of lavender essential oil on the surface (not for use if pregnant).',
    'Dim the lights or use a candle if that feels settling.',
    'Enter slowly and allow yourself to arrive — no phone, no agenda.',
    'Let the warmth work on your body. Breathe slowly. You do not need to do anything here.',
    'Stay for 15–30 minutes, or until you feel ready to rest.',
  ],
);

// ─── Breath Reset ─────────────────────────────────────────────────────────────

const ritualBreathReset = RitualObject(
  meta: ContentMeta(
    id: 'ritual-breath-reset',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['breathwork', 'nervous system', 'grounding', 'short', 'any phase'],
    sourceRefs: ['Breathwork traditions; parasympathetic activation is well-supported physiologically'],
    safetyFlags: [],
    pregnancyFlags: ['Gentle diaphragmatic breathing is safe and beneficial in pregnancy.'],
  ),
  title: 'Breath Reset',
  summary:
      'A simple 2–5 minute practice using slow, deliberate breathing to shift the nervous system toward calm.',
  whatItIs:
      'Slow, extended exhales activate the parasympathetic nervous system — the "rest and digest" branch — '
      'countering the stress response. This can reduce the experience of pain, anxiety, irritability, and overwhelm. '
      'This is not meditation — it is simply using breath as a physiological tool. It requires very little energy '
      'and can be done lying down, sitting, or even at a desk.',
  whoItMayHelp: 'Anyone, at any phase. Particularly useful when overwhelmed, in pain, anxious, or before sleep.',
  whenUseful: 'Any time — particularly useful in high-irritability or high-pain moments.',
  duration: '2–5 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-menstrual', 'phase-luteal', 'phase-follicular', 'phase-ovulatory'],
  symbolicResonance: 'The breath as anchor. Always available, always returning.',
  symptomIds: ['symptom-irritability', 'symptom-insomnia', 'symptom-low-mood', 'symptom-headache'],
  steps: [
    'Find a comfortable position — lying, sitting, or standing.',
    'Close your eyes or soften your gaze downward.',
    'Inhale slowly through your nose for a count of 4.',
    'Hold gently for a count of 2.',
    'Exhale slowly through your mouth for a count of 6–8.',
    'Repeat for 2–5 minutes, or as long as feels settling.',
    'Notice how your body feels different after even a few rounds.',
  ],
);

// ─── Light Walk ───────────────────────────────────────────────────────────────

const ritualLightWalk = RitualObject(
  meta: ContentMeta(
    id: 'ritual-light-walk',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['walking', 'movement', 'gentle exercise', 'mood', 'digestion'],
    sourceRefs: ['ACOG — Exercise during pregnancy and beyond', 'Research on walking for mood and pain'],
    safetyFlags: [],
    pregnancyFlags: ['Walking is one of the safest and most recommended forms of exercise in pregnancy — stop if you feel dizzy, short of breath, or have pain.'],
  ),
  title: 'Light Walk',
  summary:
      'A short, unhurried walk taken as movement, not exercise — to support digestion, mood, and gentle circulation without demanding energy the body may not have.',
  whatItIs:
      'Low-intensity walking supports circulation, digestion, mood through endorphin and serotonin effects, '
      'and can ease bloating and cramping. Unlike high-intensity exercise, a light walk meets the body where it is. '
      'The emphasis is on ease and presence, not performance.',
  whoItMayHelp: 'People with low energy, bloating, low mood, constipation, or mild cramping.',
  whenUseful: 'Follicular and ovulatory phases for natural momentum; menstrual and luteal phases as a gentle support when tolerated.',
  duration: '10–30 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-follicular', 'phase-ovulatory', 'phase-menstrual', 'phase-luteal'],
  symbolicResonance: 'Moving with the body rather than against it. Gentle rhythm as medicine.',
  symptomIds: ['symptom-bloating', 'symptom-fatigue', 'symptom-low-mood', 'symptom-brain-fog'],
  pregnancyCaution: 'Walking is encouraged throughout pregnancy. Slow your pace as needed and stop if uncomfortable.',
  steps: [
    'Choose a route that feels comfortable — outdoors is ideal, but indoors works too.',
    'Walk at a pace that allows easy conversation. This is not a workout.',
    'Notice what you see, hear, and feel. Let the walk be present, not planned.',
    'No headphones are required, but soft music or a podcast is fine if that feels right.',
    'Return home when you feel ready — even 10 minutes counts.',
  ],
);

// ─── Evening Wind-Down ────────────────────────────────────────────────────────

const ritualEveningWindDown = RitualObject(
  meta: ContentMeta(
    id: 'ritual-evening-wind-down',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['sleep', 'nervous system', 'evening', 'routine', 'luteal'],
    sourceRefs: ['Sleep hygiene evidence base; parasympathetic nervous system regulation'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Evening Wind-Down',
  summary:
      'A consistent pre-sleep ritual to transition from stimulation to rest — particularly important in the luteal and menstrual phases when sleep is most disrupted.',
  whatItIs:
      'The nervous system needs a transition from the demands of the day to rest. '
      'In the luteal phase, hormonal changes can make sleep onset harder — a consistent wind-down sequence helps. '
      'This is not about perfection; it is about giving the body a cue that the day is ending.',
  whoItMayHelp: 'Anyone with sleep difficulties, elevated stress, or trouble unwinding — especially in the luteal phase.',
  whenUseful: 'Late luteal phase and menstrual phase — when sleep disruption is most common.',
  duration: '20–45 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-luteal', 'phase-menstrual'],
  symbolicResonance: 'The closing of the day as a threshold — from doing to being.',
  symptomIds: ['symptom-insomnia', 'symptom-irritability', 'symptom-brain-fog'],
  steps: [
    'Set a consistent wind-down start time — about 45 minutes before you want to be asleep.',
    'Dim lights throughout your home. Light is the primary signal to the brain that it is daytime.',
    'Put your phone in another room or use night mode / grayscale.',
    'Choose a quiet, settling activity: reading (paper, not screen), a warm drink, a gentle stretch, or a bath.',
    'If your mind is busy, write down tomorrow\'s tasks or worries on a piece of paper — "parking" them outside your head.',
    'Get into bed when you feel the pull toward sleep, not before.',
  ],
);

// ─── Cycle Check-In ───────────────────────────────────────────────────────────

const ritualCycleCheckIn = RitualObject(
  meta: ContentMeta(
    id: 'ritual-cycle-check-in',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.internalSynthesis,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['check-in', 'reflection', 'journaling', 'body awareness', 'any phase'],
    sourceRefs: ['Cyclical awareness traditions; body literacy practices'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Cycle Check-In',
  summary:
      'A brief daily or weekly moment of intentional noticing — how is your body, your energy, your mood, '
      'and where are you in your cycle.',
  whatItIs:
      'The cycle check-in is a practice of body literacy: pausing to observe, without judgment, where you are. '
      'This builds pattern recognition over time — helping you anticipate what your body needs before it signals distress. '
      'It can be done in 2 minutes (mental scan) or expanded into journaling.',
  whoItMayHelp: 'Anyone who wants to develop a clearer understanding of their cyclical patterns.',
  whenUseful: 'Daily, or at key transition points: ovulation, premenstrual window, and the first day of bleeding.',
  duration: '2–10 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-menstrual', 'phase-follicular', 'phase-ovulatory', 'phase-luteal'],
  symbolicResonance: 'The pause as wisdom. Witnessing yourself without the pressure to fix.',
  symptomIds: [],
  steps: [
    'Find a moment of quiet — morning works well, but any time is fine.',
    'Ask yourself: What is my energy like today, on a scale of 1–10?',
    'Ask: What is my mood — the emotional weather of this moment?',
    'Ask: What does my body feel — any tension, pain, comfort, or ease?',
    'Note where you think you are in your cycle (or check your log).',
    'Notice if today matches what you might expect for this phase — or if something feels different.',
    'Write it down if you find that useful, or just hold the noticing.',
  ],
);

// ─── Soft Luteal Day ──────────────────────────────────────────────────────────

const ritualSoftLutealDay = RitualObject(
  meta: ContentMeta(
    id: 'ritual-soft-luteal-day',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.internalSynthesis,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['luteal', 'rest', 'boundary', 'PMS', 'PMDD', 'gentle'],
    sourceRefs: ['Cyclical living practices'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Soft Luteal Day',
  summary:
      'A day built with intentional gentleness — reduced demands, more margin, and the explicit permission to do less.',
  whatItIs:
      'In the late luteal phase, energy, emotional resilience, and tolerance for stimulation often decrease. '
      'A soft luteal day is not about doing nothing — it\'s about building the day around what the body actually has. '
      'This is a practice of accommodation, not failure.',
  whoItMayHelp: 'People with PMS, PMDD, or anyone who notices their tolerance and energy consistently dip in the luteal phase.',
  whenUseful: 'The late luteal phase, particularly 5–10 days before menstruation.',
  duration: 'A full day',
  energyRequired: 'low',
  phaseIds: ['phase-luteal'],
  symbolicResonance: 'Autumn slowing before the release of winter. There is wisdom in resting now.',
  symptomIds: ['symptom-irritability', 'symptom-fatigue', 'symptom-low-mood', 'symptom-brain-fog'],
  steps: [
    'Look at what\'s on your schedule for the day. Ask: what is truly necessary and what can wait?',
    'Remove or reschedule what can be deferred.',
    'Build in at least one unstructured rest period with no task attached to it.',
    'Choose foods that feel nourishing rather than convenient (a warm meal matters on days like this).',
    'Notice your stimulation threshold — reduce noise, social demands, or screen time if needed.',
    'Let yourself move slowly. Rest when the pull comes, rather than pushing through.',
    'At the end of the day: notice what felt gentle. Do more of that.',
  ],
);

// ─── Menstrual Nesting ────────────────────────────────────────────────────────

const ritualMenstrualNesting = RitualObject(
  meta: ContentMeta(
    id: 'ritual-menstrual-nesting',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.internalSynthesis,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['menstrual', 'rest', 'nesting', 'phase-1', 'permission'],
    sourceRefs: ['Cyclical living traditions; rest as a cyclical practice'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Menstrual Nesting',
  summary:
      'Creating a comfortable, intentional rest space for the menstrual phase — physical comfort as a form of care.',
  whatItIs:
      'Menstrual nesting is the practice of arranging your physical environment for rest and ease during your period. '
      'Blankets, warmth, accessible snacks, reduced obligations, reduced noise. '
      'It is the body asking for a sanctuary — and this practice answers that request directly.',
  whoItMayHelp: 'People who experience significant fatigue, pain, or emotional heaviness during menstruation.',
  whenUseful: 'The first 1–3 days of menstruation — particularly on the heaviest or most uncomfortable days.',
  duration: 'As long as needed',
  energyRequired: 'low',
  phaseIds: ['phase-menstrual'],
  symbolicResonance: 'The cave in winter. Shelter as wisdom. The body\'s demand for stillness honored.',
  symptomIds: ['symptom-fatigue', 'symptom-cramps', 'symptom-heavy-bleeding', 'symptom-low-mood'],
  steps: [
    'Identify your most comfortable space — a couch, bed, or chair with blankets.',
    'Gather what you need within reach: water, a warm drink, snacks, a heat pack, any medication.',
    'Clear your immediate obligations where possible — let people know you need the day.',
    'Choose comfort content if you want distraction: a show, a book, music, or silence.',
    'Remove pressure to be productive. This is the nest, not the desk.',
    'Tend to your body\'s signals: eat when hungry, rest when tired, move gently if you feel the pull.',
  ],
);

// ─── Gentle Stretching ────────────────────────────────────────────────────────

const ritualGentleStretching = RitualObject(
  meta: ContentMeta(
    id: 'ritual-gentle-stretching',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['stretching', 'yoga', 'pelvic', 'cramps', 'gentle movement'],
    sourceRefs: ['Restorative yoga traditions; pelvic floor physical therapy principles'],
    safetyFlags: [],
    pregnancyFlags: ['Gentle prenatal-appropriate stretching is beneficial in pregnancy — avoid deep twists and supine positions past the first trimester.'],
  ),
  title: 'Gentle Stretching',
  summary:
      'Simple, slow stretches targeting the hips, pelvis, and lower back — to ease tension and support comfort during the menstrual phase.',
  whatItIs:
      'Gentle movement — particularly stretches that open the hips and pelvis — can ease the muscular tension '
      'that accompanies cramping and pelvic pain. This is not a workout; it is movement as care. '
      'The emphasis is on ease and breath, not depth or achievement.',
  whoItMayHelp: 'People with menstrual cramps, lower back pain, pelvic tension, or general stiffness.',
  whenUseful: 'Any phase, particularly the menstrual phase and late luteal phase.',
  duration: '10–20 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-menstrual', 'phase-luteal', 'phase-follicular'],
  symbolicResonance: 'Opening what contracts. The body releasing what it holds.',
  symptomIds: ['symptom-cramps', 'symptom-back-pain', 'symptom-pelvic-pain', 'symptom-bloating'],
  pregnancyCaution: 'Opt for prenatal-appropriate stretches in pregnancy. Avoid deep hip openers and supine positions later in pregnancy.',
  steps: [
    'Child\'s pose: kneel, fold forward, arms extended or by your sides. Hold for 5–10 breaths.',
    'Supine knee hug: lie on your back, draw both knees to your chest. Gently rock side to side.',
    'Supine figure-four: cross one ankle over the opposite knee, flex the foot, gently press the knee away.',
    'Cat-cow: on all fours, slowly arch and round the back with breath.',
    'Seated forward fold: sit with legs extended, gently fold forward only as far as is comfortable.',
    'Move slowly between each shape. Breathe into any tension. Never push to the point of pain.',
  ],
);

// ─── Moon Reflection ──────────────────────────────────────────────────────────

const ritualMoonReflection = RitualObject(
  meta: ContentMeta(
    id: 'ritual-moon-reflection',
    type: 'ritual',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['moon', 'reflection', 'symbolic', 'spiritual', 'luteal', 'full moon', 'new moon'],
    sourceRefs: ['Cyclical living traditions; lunar symbolism across cultures'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Moon Reflection',
  summary:
      'A reflective practice aligned with the lunar cycle — using the new and full moon as natural checkpoints for setting intentions and releasing what is no longer serving.',
  whatItIs:
      'The moon\'s 29.5-day cycle mirrors the average menstrual cycle in length, which has given rise to a rich tradition '
      'of lunar symbolism in cyclical living practices. This ritual uses the lunar phases — particularly the new moon '
      '(a time for beginnings) and the full moon (a time for completion and release) — as a reflective framework. '
      'This is offered as a poetic and meaningful container, not a scientific claim.',
  whoItMayHelp: 'People who find meaning in symbolic or seasonal frameworks as part of self-reflection.',
  whenUseful:
      'New moon (beginning of the lunar cycle) and full moon — or at natural transitions in your own cycle.',
  duration: '10–30 minutes',
  energyRequired: 'low',
  phaseIds: ['phase-luteal', 'phase-menstrual', 'phase-follicular'],
  symbolicResonance: 'The moon as mirror. The cyclical as teacher. What waxes and wanes as teacher of rhythm.',
  symptomIds: [],
  steps: [
    'Check the current moon phase — new, waxing, full, or waning.',
    'Find a quiet moment, ideally at night, outdoors or near a window.',
    'New moon: write one intention for this lunar month. What is wanting to begin?',
    'Full moon: write one thing you are ready to release. What has run its course?',
    'Sit with what you wrote for a few minutes. Let it be simple.',
    'This practice asks nothing of you but presence. There is no correct way to do it.',
  ],
);
