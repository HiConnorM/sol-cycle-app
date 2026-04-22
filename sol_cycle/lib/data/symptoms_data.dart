import 'content_types.dart';

const List<SymptomObject> allSymptoms = [
  symptomCramps,
  symptomBloating,
  symptomFatigue,
  symptomIrritability,
  symptomLowMood,
  symptomInsomnia,
  symptomBreastTenderness,
  symptomPelvicPain,
  symptomHeadache,
  symptomBrainFog,
  symptomNausea,
  symptomBackPain,
  symptomHeavyBleeding,
  symptomIrregularBleeding,
];

SymptomObject? symptomById(String id) {
  try {
    return allSymptoms.firstWhere((s) => s.meta.id == id);
  } catch (_) {
    return null;
  }
}

// ─── Cramps ───────────────────────────────────────────────────────────────────

const symptomCramps = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-cramps',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['pain', 'menstrual', 'prostaglandins', 'dysmenorrhea'],
    sourceRefs: ['ACOG — Dysmenorrhea: Painful Periods', 'Office on Women\'s Health'],
    safetyFlags: [
      'Pain severe enough to prevent normal activity warrants medical evaluation.',
      'Worsening pain over time, or pain outside of periods, may indicate endometriosis or adenomyosis.',
    ],
    pregnancyFlags: ['Cramping in early pregnancy should be discussed with a provider.'],
  ),
  title: 'Cramps',
  summary:
      'Painful contractions of the uterus, most common in the first 1–3 days of menstruation. '
      'A very common experience, but severe or worsening cramps are worth investigating.',
  whatItIs:
      'Menstrual cramps — medically called dysmenorrhea — occur when the uterus contracts to shed its lining. '
      'Prostaglandins, hormone-like substances released during menstruation, trigger these contractions. '
      'Higher prostaglandin levels are associated with stronger cramping. '
      'Primary dysmenorrhea has no underlying condition; secondary dysmenorrhea is associated with conditions '
      'like endometriosis, adenomyosis, or fibroids.',
  whatItMayFeelLike:
      'Dull or sharp aching in the lower abdomen, sometimes radiating to the lower back or thighs. '
      'May come in waves or feel constant. Can range from mild and manageable to severely debilitating.',
  cyclePhaseIds: ['phase-menstrual'],
  relatedConditionIds: [
    'condition-dysmenorrhea',
    'condition-endometriosis',
    'condition-adenomyosis',
    'condition-fibroids',
  ],
  commonMisconceptions: [
    '"Cramps are just part of being a woman — everyone has them this bad." Severe cramps that disrupt daily life are not normal and may indicate an underlying condition.',
    '"If you\'ve always had bad cramps, nothing is wrong." Worsening pain over time is a reason to seek evaluation.',
    '"A heating pad isn\'t real medicine." Heat has research support for mild-to-moderate period pain.',
  ],
  gentleSupports: [
    'Warm compress or hot water bottle on lower abdomen or back',
    'Ginger tea — traditional support with some research basis for mild relief',
    'Gentle movement if tolerable — light walking or restorative yoga',
    'Magnesium-rich foods in the days before the period may reduce cramping frequency for some people',
    'Rest without guilt — the body is working hard',
  ],
  whenToSeekCare:
      'Seek care if cramps are severe enough to prevent normal activities, worsen over time, '
      'occur outside of your period, do not respond to over-the-counter pain relief, '
      'or are accompanied by heavy bleeding, fever, or unusual discharge.',
  ritualIds: ['ritual-warm-compress', 'ritual-restorative-bath', 'ritual-gentle-stretching'],
  foodIds: ['food-ginger', 'food-magnesium-rich-foods', 'food-warming-meals'],
  lessonIds: ['lesson-painful-periods-basics', 'lesson-what-is-the-menstrual-cycle'],
  pregnancyCaution:
      'Cramping in pregnancy — especially with bleeding — should be discussed with a provider promptly.',
);

// ─── Bloating ─────────────────────────────────────────────────────────────────

const symptomBloating = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-bloating',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['bloating', 'fluid retention', 'luteal', 'digestive'],
    sourceRefs: ['Office on Women\'s Health — PMS', 'ACOG — Premenstrual Syndrome'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Bloating',
  summary:
      'A feeling of fullness, swelling, or pressure in the abdomen. Common in the luteal phase due to hormonal shifts affecting fluid balance and digestion.',
  whatItIs:
      'Bloating around the menstrual cycle is primarily driven by hormonal changes — particularly progesterone — '
      'that affect fluid retention and slow digestive motility. Some people also experience more gas and intestinal sensitivity around menstruation. '
      'For those with endometriosis or IBS, bloating may be more pronounced.',
  whatItMayFeelLike:
      'A sense of fullness or tightness in the abdomen. Clothing may feel tighter. '
      'Physical discomfort that can range from mild to noticeable. Sometimes accompanied by gas or digestive sluggishness.',
  cyclePhaseIds: ['phase-luteal', 'phase-menstrual'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd', 'condition-endometriosis'],
  commonMisconceptions: [
    '"Bloating means I ate something wrong." Hormonal bloating is not caused by food choice — though some foods can amplify it.',
    '"I\'m just imagining it." Fluid retention and slowed digestion during the luteal phase are real physiological changes.',
  ],
  gentleSupports: [
    'Warm, cooked foods may be easier to digest than raw during the luteal phase',
    'Ginger and peppermint tea — traditional digestive supports',
    'Gentle movement, including walking or light yoga, can aid digestion',
    'Reducing carbonated drinks and very salty foods in the days before your period may help for some people',
    'Staying well-hydrated — counterintuitively, adequate water can reduce fluid retention',
  ],
  whenToSeekCare:
      'Seek care if bloating is severe and persistent beyond your cycle, if it\'s accompanied by pain, '
      'changes in bowel habits, or if it feels significantly different from your usual pattern.',
  ritualIds: ['ritual-gentle-stretching', 'ritual-light-walk', 'ritual-warm-compress'],
  foodIds: ['food-ginger', 'food-digestive-soothing-foods', 'food-hydration-support', 'food-warming-meals'],
  lessonIds: ['lesson-luteal-phase-basics', 'lesson-pmdd-vs-pms'],
);

// ─── Fatigue ──────────────────────────────────────────────────────────────────

const symptomFatigue = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-fatigue',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['fatigue', 'energy', 'iron', 'menstrual', 'luteal'],
    sourceRefs: ['Office on Women\'s Health', 'ACOG — Heavy Menstrual Bleeding'],
    safetyFlags: [
      'Severe fatigue with heavy bleeding may indicate iron deficiency anemia — seek evaluation.',
    ],
    pregnancyFlags: ['Fatigue is very common in the first trimester of pregnancy.'],
  ),
  title: 'Fatigue',
  summary:
      'Low energy, exhaustion, or a persistent need for rest. Common across the menstrual cycle, particularly during menstruation and the late luteal phase.',
  whatItIs:
      'Cyclical fatigue is tied to hormonal fluctuations — progesterone has a sedative quality, '
      'and estrogen withdrawal can reduce energy. During menstruation, iron loss through bleeding '
      'can contribute to fatigue for those who bleed heavily. Fatigue may also accompany PMDD in the luteal phase.',
  whatItMayFeelLike:
      'A sense of heaviness, low motivation, difficulty concentrating, physical tiredness even after rest, '
      'or a strong desire to sleep more than usual.',
  cyclePhaseIds: ['phase-menstrual', 'phase-luteal'],
  relatedConditionIds: [
    'condition-pms',
    'condition-pmdd',
    'condition-heavy-menstrual-bleeding',
    'condition-endometriosis',
  ],
  commonMisconceptions: [
    '"Fatigue during my period just means I\'m lazy." Lower energy during menstruation is physiologically driven.',
    '"I should push through it." Listening to the body\'s need for rest is supportive, not indulgent.',
    '"Fatigue is just part of PMDD." It is a common PMDD symptom, but severe fatigue with heavy bleeding may indicate anemia.',
  ],
  gentleSupports: [
    'Prioritize sleep quality — the luteal phase often disrupts sleep, which compounds fatigue',
    'Iron-rich foods during menstruation if you bleed heavily',
    'Protein at each meal to stabilize blood sugar and support sustained energy',
    'Gentle movement if energy allows — even a short walk can help',
    'Permission to rest without guilt — the body\'s energy needs shift through the cycle',
  ],
  whenToSeekCare:
      'Seek care if fatigue is severe enough to impair daily functioning, if it accompanies heavy bleeding, '
      'if it persists through most of your cycle, or if you\'re concerned about iron deficiency anemia.',
  ritualIds: ['ritual-menstrual-nesting', 'ritual-evening-wind-down', 'ritual-restorative-bath'],
  foodIds: ['food-iron-support-meals', 'food-protein-stable-breakfast', 'food-mineral-broth'],
  lessonIds: ['lesson-heavy-bleeding-basics', 'lesson-luteal-phase-basics'],
  pregnancyCaution:
      'First-trimester fatigue is extremely common and usually not a concern, '
      'but severe fatigue or dizziness in pregnancy should be mentioned to your provider.',
);

// ─── Irritability ─────────────────────────────────────────────────────────────

const symptomIrritability = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-irritability',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['irritability', 'mood', 'luteal', 'PMS', 'PMDD'],
    sourceRefs: ['ACOG — PMS', 'IAPMD — PMDD', 'Office on Women\'s Health — PMDD'],
    safetyFlags: [
      'Severe or uncontrollable irritability that damages relationships or functioning may indicate PMDD — seek evaluation.',
    ],
    pregnancyFlags: [],
  ),
  title: 'Irritability',
  summary:
      'A heightened reactivity, short temper, or low frustration tolerance. Common in the luteal phase, and a core feature of both PMS and PMDD.',
  whatItIs:
      'Irritability in the luteal phase is linked to hormonal changes — particularly declining estrogen and rising progesterone — '
      'which affect serotonin and other neurotransmitter systems. '
      'In PMS, irritability is uncomfortable but manageable. In PMDD, it can become severe, disproportionate, and distressing.',
  whatItMayFeelLike:
      'Snapping at people for small things, feeling easily overwhelmed, a sense that everything is annoying, '
      'difficulty tolerating noise or demands, or anger that feels out of proportion to what triggered it.',
  cyclePhaseIds: ['phase-luteal'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd', 'condition-pme'],
  commonMisconceptions: [
    '"I\'m just being crazy." Luteal-phase irritability has a physiological basis; dismissing it is not helpful.',
    '"It\'s not real if it goes away after my period." The cyclical pattern IS the data — and it\'s meaningful.',
    '"I should just control it." Willpower is not the primary solution; understanding the pattern helps more.',
  ],
  gentleSupports: [
    'Tracking the pattern — noticing when irritability appears and its relationship to your cycle',
    'Reducing overstimulation: noise, screens, social demands in the peak window',
    'Magnesium-rich foods — some research suggests magnesium may help reduce irritability',
    'Breath practices and grounding movement',
    'Communicating your pattern with people close to you when possible',
  ],
  whenToSeekCare:
      'Seek care if irritability is severe, if it damages relationships or your sense of self, '
      'if it escalates to rage, or if it appears consistently in the luteal phase and resolves with menstruation.',
  ritualIds: ['ritual-breath-reset', 'ritual-soft-luteal-day', 'ritual-evening-wind-down'],
  foodIds: ['food-magnesium-rich-foods', 'food-protein-stable-breakfast'],
  lessonIds: ['lesson-pmdd-vs-pms', 'lesson-luteal-phase-basics'],
);

// ─── Low Mood ─────────────────────────────────────────────────────────────────

const symptomLowMood = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-low-mood',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['low mood', 'depression', 'luteal', 'PMDD', 'emotional'],
    sourceRefs: ['IAPMD — PMDD', 'Office on Women\'s Health — PMDD', 'ACOG — PMS'],
    safetyFlags: [
      'Severe depression or thoughts of self-harm — seek crisis support immediately.',
      'Low mood that severely disrupts functioning in the luteal phase may indicate PMDD.',
    ],
    pregnancyFlags: [
      'Low mood or depression in pregnancy or postpartum should be discussed with a provider.',
    ],
  ),
  title: 'Low Mood',
  summary:
      'Sadness, emotional flatness, hopelessness, or tearfulness. Common in the late luteal phase, '
      'and a hallmark symptom of PMDD when severe.',
  whatItIs:
      'Cyclical low mood is tied to hormonal effects on neurotransmitter systems, particularly serotonin. '
      'Estrogen supports serotonin function; as it drops in the late luteal phase, some people are more vulnerable '
      'to mood dips. In PMDD, this can become severe depression-level distress that lifts when menstruation begins.',
  whatItMayFeelLike:
      'Sadness that feels heavier than circumstances warrant, crying more than usual, a sense of hopelessness, '
      'emotional numbness, withdrawal from people or activities, or difficulty finding things meaningful.',
  cyclePhaseIds: ['phase-luteal'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd', 'condition-pme'],
  commonMisconceptions: [
    '"If it\'s hormonal, it\'s not real depression." Hormonal effects on brain chemistry produce real distress.',
    '"It goes away on its own so it doesn\'t need treatment." Cyclical suffering is not acceptable just because it\'s predictable.',
    '"Journaling will fix it." Journaling is supportive, but severe low mood often needs clinical care.',
  ],
  gentleSupports: [
    'Tracking the cycle correlation — knowing it is cyclical does not fix it, but it can reduce the sense of being lost in it',
    'Gentle movement — walking is among the best-supported non-pharmacological tools for mild mood symptoms',
    'Social connection at the level that feels manageable, not forced',
    'Light exposure in the morning',
    'Reducing alcohol, which amplifies mood instability',
  ],
  whenToSeekCare:
      'Seek care if low mood is severe, if you have thoughts of harming yourself or not wanting to be alive, '
      'if it significantly impairs daily life, or if it is reliably cyclical and worsening over time. '
      'PMDD is a treatable condition and clinical care is appropriate.',
  ritualIds: ['ritual-evening-wind-down', 'ritual-breath-reset', 'ritual-cycle-check-in'],
  foodIds: ['food-magnesium-rich-foods', 'food-protein-stable-breakfast'],
  lessonIds: ['lesson-pmdd-vs-pms', 'lesson-luteal-phase-basics'],
  pregnancyCaution:
      'Perinatal and postpartum depression are serious and treatable. Please reach out to a provider.',
);

// ─── Insomnia ─────────────────────────────────────────────────────────────────

const symptomInsomnia = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-insomnia',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['insomnia', 'sleep', 'luteal', 'progesterone', 'PMS'],
    sourceRefs: ['Office on Women\'s Health — PMS', 'ACOG — PMS'],
    safetyFlags: [],
    pregnancyFlags: ['Sleep disruption is very common in pregnancy — discuss persistent insomnia with your provider.'],
  ),
  title: 'Insomnia',
  summary:
      'Difficulty falling asleep, staying asleep, or waking too early. Sleep disturbance is common in the late luteal phase and during menstruation.',
  whatItIs:
      'Hormonal fluctuations in the luteal phase — particularly the drop in progesterone and estrogen — '
      'can disrupt sleep. Progesterone has mild sedative properties, but as it drops before menstruation, '
      'sleep architecture can be affected. Body temperature also rises slightly after ovulation, which may impact sleep quality. '
      'Pain, cramping, and anxiety can further disrupt sleep around menstruation.',
  whatItMayFeelLike:
      'Difficulty falling asleep despite tiredness, waking in the night and struggling to return to sleep, '
      'waking earlier than intended, or sleeping but not feeling rested.',
  cyclePhaseIds: ['phase-luteal', 'phase-menstrual'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd'],
  commonMisconceptions: [
    '"Sleep problems aren\'t related to my cycle." The connection between hormones and sleep is well-established.',
    '"I should take a sleep aid every month." Supporting sleep hygiene and addressing the hormonal cause is more sustainable.',
  ],
  gentleSupports: [
    'Consistent wind-down routine: dim light, warm bath or shower, no screens 30–60 minutes before bed',
    'Cool room temperature — the body temperature rise of the luteal phase means some people sleep better cooler',
    'Magnesium — some people find it helpful for sleep quality',
    'Avoiding caffeine after noon in the luteal window',
    'Gentle breath practices or progressive muscle relaxation before sleep',
  ],
  whenToSeekCare:
      'Seek care if insomnia is severe and persistent, if it significantly impairs daily functioning, '
      'or if it is accompanied by other mood symptoms that might suggest PMDD.',
  ritualIds: ['ritual-evening-wind-down', 'ritual-restorative-bath', 'ritual-breath-reset'],
  foodIds: ['food-magnesium-rich-foods', 'food-warming-meals'],
  lessonIds: ['lesson-luteal-phase-basics', 'lesson-pmdd-vs-pms'],
);

// ─── Breast Tenderness ────────────────────────────────────────────────────────

const symptomBreastTenderness = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-breast-tenderness',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['breast tenderness', 'mastalgia', 'luteal', 'progesterone', 'PMS'],
    sourceRefs: ['ACOG — PMS', 'Office on Women\'s Health'],
    safetyFlags: [
      'Breast lumps, one-sided tenderness, nipple changes, or tenderness that does not correlate with your cycle should be evaluated by a provider.',
    ],
    pregnancyFlags: ['Breast tenderness is common in early pregnancy.'],
  ),
  title: 'Breast Tenderness',
  summary:
      'Aching, swelling, or heightened sensitivity in the breasts. Common in the luteal phase, driven by progesterone and estrogen changes.',
  whatItIs:
      'Cyclical mastalgia (breast pain tied to the menstrual cycle) is caused by hormonal changes — '
      'particularly progesterone — that cause fluid retention and increased breast tissue sensitivity. '
      'It typically peaks in the late luteal phase and resolves with the start of menstruation.',
  whatItMayFeelLike:
      'Aching, heaviness, swelling, or sensitivity to touch across one or both breasts. '
      'May feel worse with movement or pressure from clothing.',
  cyclePhaseIds: ['phase-luteal'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd'],
  commonMisconceptions: [
    '"Breast tenderness means something is wrong." Cyclical breast tenderness is common and usually benign.',
    '"I should just ignore it." Tracking its pattern helps distinguish cyclical from non-cyclical tenderness.',
  ],
  gentleSupports: [
    'A well-fitting, supportive bra — especially during activity',
    'Reducing caffeine in the luteal phase may help for some people',
    'Warm compress for comfort',
    'Evening primrose oil is used traditionally, though evidence is mixed — discuss with a provider before using',
  ],
  whenToSeekCare:
      'Seek care if tenderness is severe, non-cyclical, one-sided, accompanied by a lump or skin changes, '
      'or involves nipple discharge.',
  ritualIds: ['ritual-warm-compress', 'ritual-soft-luteal-day'],
  foodIds: ['food-magnesium-rich-foods', 'food-hydration-support'],
  lessonIds: ['lesson-luteal-phase-basics'],
  pregnancyCaution: 'Breast tenderness and growth is expected in pregnancy — mention unusual lumps or discharge to your provider.',
);

// ─── Pelvic Pain ──────────────────────────────────────────────────────────────

const symptomPelvicPain = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-pelvic-pain',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['pelvic pain', 'endometriosis', 'adenomyosis', 'pain', 'cycle'],
    sourceRefs: [
      'ESHRE — Endometriosis Guideline 2022',
      'ACOG — Dysmenorrhea',
      'EndoFound — Endometriosis Overview',
    ],
    safetyFlags: [
      'Severe pelvic pain should be evaluated — especially if it is worsening, occurs outside periods, or is accompanied by fever.',
      'Pain with intercourse warrants clinical evaluation for endometriosis, fibroids, or other causes.',
    ],
    pregnancyFlags: ['Pelvic pain in pregnancy should always be discussed with a provider.'],
  ),
  title: 'Pelvic Pain',
  summary:
      'Pain in the lower abdomen or pelvis. It may be cyclical (linked to the menstrual cycle) or ongoing. '
      'Pelvic pain is one of the most common symptoms of endometriosis, adenomyosis, and fibroids.',
  whatItIs:
      'Pelvic pain can have many causes. Cyclical pelvic pain tied to menstruation may be primary dysmenorrhea '
      '(no underlying condition) or secondary dysmenorrhea associated with endometriosis, adenomyosis, fibroids, or ovarian cysts. '
      'Ovulation pain (mittelschmerz) occurs mid-cycle. Chronic pelvic pain lasting more than 6 months deserves thorough evaluation.',
  whatItMayFeelLike:
      'Deep, cramping, stabbing, or aching pain in the lower abdomen, pelvis, or lower back. '
      'May radiate to thighs or rectum. May worsen during or after sex, during bowel movements, or throughout the menstrual cycle.',
  cyclePhaseIds: ['phase-menstrual', 'phase-ovulatory'],
  relatedConditionIds: [
    'condition-endometriosis',
    'condition-adenomyosis',
    'condition-fibroids',
    'condition-dysmenorrhea',
  ],
  commonMisconceptions: [
    '"Deep pelvic pain during sex is normal." Pain with intercourse is not expected and warrants evaluation.',
    '"My scan was clear, so I don\'t have endometriosis." Imaging cannot rule out endometriosis — diagnosis typically requires laparoscopy.',
    '"If it was endometriosis I would have been diagnosed by now." The average diagnostic delay for endometriosis is 7–10 years.',
  ],
  gentleSupports: [
    'Warm compress on the lower abdomen',
    'Gentle movement — yoga and stretching for pelvic relaxation if tolerable',
    'Tracking pain patterns: when in your cycle, severity, location, and what makes it better or worse',
    'Bringing a written symptom diary to medical appointments',
  ],
  whenToSeekCare:
      'Seek care if pelvic pain is severe, worsening, occurs outside of your period, '
      'disrupts daily life or sex, is accompanied by GI symptoms, or has never been evaluated. '
      'Pain with sex always warrants evaluation.',
  ritualIds: ['ritual-warm-compress', 'ritual-restorative-bath', 'ritual-gentle-stretching'],
  foodIds: ['food-ginger', 'food-warming-meals', 'food-magnesium-rich-foods'],
  lessonIds: ['lesson-endometriosis-basics', 'lesson-painful-periods-basics'],
  pregnancyCaution: 'Pelvic pain in pregnancy — especially one-sided or with bleeding — should be evaluated promptly.',
);

// ─── Headache ─────────────────────────────────────────────────────────────────

const symptomHeadache = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-headache',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['headache', 'migraine', 'estrogen', 'menstrual', 'luteal'],
    sourceRefs: ['Office on Women\'s Health', 'ACOG — PMS'],
    safetyFlags: [
      'Sudden severe headache (thunderclap headache) is a medical emergency — seek immediate care.',
      'Headache with neurological symptoms (vision changes, weakness, confusion) requires urgent evaluation.',
    ],
    pregnancyFlags: [
      'New or severe headaches in pregnancy, especially with swelling or visual changes, may indicate preeclampsia — seek care immediately.',
    ],
  ),
  title: 'Headache',
  summary:
      'Head pain linked to the menstrual cycle, often tied to estrogen fluctuations. '
      'Menstrual migraines occur reliably around menstruation in some people.',
  whatItIs:
      'Menstrual headaches and migraines are commonly triggered by the drop in estrogen just before menstruation. '
      'Estrogen withdrawal is a well-established migraine trigger. Some people experience headaches in the late luteal phase '
      'as estrogen and progesterone decline. Dehydration, sleep disruption, and caffeine changes around the cycle can also contribute.',
  whatItMayFeelLike:
      'Tension headache: dull, band-like pressure. Migraine: throbbing, often one-sided, may be accompanied by '
      'nausea, light or sound sensitivity, or visual aura.',
  cyclePhaseIds: ['phase-luteal', 'phase-menstrual'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd'],
  commonMisconceptions: [
    '"Headaches around my period aren\'t related." The estrogen-headache connection is well-established.',
    '"If I can function, it\'s not a migraine." Migraines vary widely in severity.',
  ],
  gentleSupports: [
    'Hydration — dehydration amplifies headache and migraine vulnerability',
    'Consistent sleep schedule around the cycle',
    'Avoiding migraine triggers in the luteal window (for those who know their triggers)',
    'Cool or warm compress on the head depending on what feels relieving',
    'Magnesium: some research supports magnesium supplementation for menstrual migraine prevention — discuss with a provider',
  ],
  whenToSeekCare:
      'Seek care if headaches are severe and frequent, if they significantly impact your quality of life, '
      'if they are accompanied by neurological symptoms, or if a sudden severe headache comes on with no warning.',
  ritualIds: ['ritual-evening-wind-down', 'ritual-breath-reset'],
  foodIds: ['food-hydration-support', 'food-magnesium-rich-foods'],
  lessonIds: ['lesson-luteal-phase-basics'],
  pregnancyCaution: 'Severe headaches in pregnancy — particularly with swelling, vision changes, or sudden onset — require immediate attention.',
);

// ─── Brain Fog ────────────────────────────────────────────────────────────────

const symptomBrainFog = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-brain-fog',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.internalSynthesis,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['brain fog', 'cognition', 'concentration', 'luteal', 'PMDD'],
    sourceRefs: ['IAPMD — PMDD Symptoms', 'Office on Women\'s Health — PMS'],
    safetyFlags: [],
    pregnancyFlags: ['Cognitive changes are common in pregnancy ("pregnancy brain") and generally not cause for concern.'],
  ),
  title: 'Brain Fog',
  summary:
      'Difficulty concentrating, mental sluggishness, forgetfulness, or cognitive cloudiness. '
      'Common in the late luteal phase and during menstruation, particularly for those with PMDD.',
  whatItIs:
      'Cognitive changes through the menstrual cycle are real and have a hormonal basis. '
      'Estrogen supports cognitive function; as it drops in the late luteal phase, many people notice '
      'reduced sharpness, concentration difficulties, or word-finding problems. '
      'Sleep disruption — also common in the luteal phase — compounds cognitive impairment. '
      'In PMDD, brain fog can be severe and significantly disruptive.',
  whatItMayFeelLike:
      'Difficulty concentrating for normal lengths of time, forgetting words or tasks, '
      'feeling mentally slow or unclear, difficulty making decisions, or feeling "not quite yourself" cognitively.',
  cyclePhaseIds: ['phase-luteal', 'phase-menstrual'],
  relatedConditionIds: ['condition-pms', 'condition-pmdd'],
  commonMisconceptions: [
    '"I\'m just distracted." Hormonal effects on cognition are real, not a character flaw.',
    '"It goes away so it doesn\'t matter." Cyclical cognitive disruption affects work, relationships, and functioning.',
  ],
  gentleSupports: [
    'Prioritizing sleep — fatigue and fog are strongly linked',
    'Reducing cognitive load in the luteal window when possible: simpler tasks, more lists',
    'Hydration and blood sugar stability',
    'Brief physical movement to support mental clarity',
    'Self-compassion — this is not a personal failing',
  ],
  whenToSeekCare:
      'Seek care if brain fog is severe, persistent through the entire cycle, worsening over time, '
      'or significantly impairs work or daily life.',
  ritualIds: ['ritual-soft-luteal-day', 'ritual-light-walk', 'ritual-breath-reset'],
  foodIds: ['food-protein-stable-breakfast', 'food-hydration-support'],
  lessonIds: ['lesson-pmdd-vs-pms', 'lesson-luteal-phase-basics'],
);

// ─── Nausea ───────────────────────────────────────────────────────────────────

const symptomNausea = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-nausea',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['nausea', 'menstrual', 'prostaglandins', 'GI', 'endometriosis'],
    sourceRefs: ['ACOG — Dysmenorrhea', 'Office on Women\'s Health'],
    safetyFlags: [
      'Nausea with sudden severe abdominal pain or inability to keep fluids down warrants urgent care.',
    ],
    pregnancyFlags: [
      'Nausea and vomiting are very common in the first trimester. Severe nausea with inability to keep fluids down (hyperemesis gravidarum) requires medical care.',
    ],
  ),
  title: 'Nausea',
  summary:
      'A feeling of queasiness or an urge to vomit. Can accompany menstruation, particularly when prostaglandins are elevated.',
  whatItIs:
      'Prostaglandins released during menstruation can affect the gastrointestinal tract in addition to the uterus, '
      'causing nausea, diarrhea, or vomiting in some people. GI sensitivity is also common with endometriosis. '
      'Nausea may also accompany severe pain, ovulation, or the early stages of pregnancy.',
  whatItMayFeelLike:
      'Queasy stomach, reduced appetite, sensitivity to food smells, or the urge to vomit. '
      'May accompany cramping at the start of menstruation.',
  cyclePhaseIds: ['phase-menstrual'],
  relatedConditionIds: ['condition-dysmenorrhea', 'condition-endometriosis'],
  commonMisconceptions: [
    '"Nausea with periods is normal so I shouldn\'t mention it." Severe GI symptoms with periods deserve evaluation.',
  ],
  gentleSupports: [
    'Ginger — fresh, crystallized, or as tea — has traditional and some research support for nausea',
    'Small, easily digestible meals rather than large ones',
    'Cool, fresh air if possible',
    'Peppermint tea',
    'Rest in a comfortable position',
  ],
  whenToSeekCare:
      'Seek care if nausea is severe, if you cannot keep fluids down, if it occurs with sudden severe pain, '
      'or if nausea around your cycle is significantly impacting your quality of life.',
  ritualIds: ['ritual-menstrual-nesting', 'ritual-restorative-bath'],
  foodIds: ['food-ginger', 'food-digestive-soothing-foods', 'food-mineral-broth'],
  lessonIds: ['lesson-painful-periods-basics'],
  pregnancyCaution:
      'Nausea in pregnancy is common. Hyperemesis gravidarum (severe, debilitating nausea/vomiting) requires medical treatment.',
);

// ─── Back Pain ────────────────────────────────────────────────────────────────

const symptomBackPain = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-back-pain',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['back pain', 'lower back', 'menstrual', 'prostaglandins', 'endometriosis'],
    sourceRefs: ['ACOG — Dysmenorrhea', 'Office on Women\'s Health'],
    safetyFlags: [
      'Back pain accompanied by fever or painful urination may indicate a kidney or urinary tract infection — seek care.',
    ],
    pregnancyFlags: ['Lower back pain is common in pregnancy due to postural changes and ligament laxity.'],
  ),
  title: 'Back Pain',
  summary:
      'Aching or cramping in the lower back, often accompanying menstruation. May radiate from the uterus or reflect referred pain.',
  whatItIs:
      'Uterine prostaglandins can trigger referred pain to the lower back and thighs during menstruation. '
      'Back pain may also accompany endometriosis when tissue affects areas near the bowel, bladder, or ligaments. '
      'Adenomyosis commonly causes both uterine cramping and lower back pain.',
  whatItMayFeelLike:
      'Dull, aching discomfort in the lower back that may radiate into the hips or upper thighs. '
      'Often accompanies menstrual cramps or follows a similar pattern.',
  cyclePhaseIds: ['phase-menstrual'],
  relatedConditionIds: ['condition-dysmenorrhea', 'condition-endometriosis', 'condition-adenomyosis'],
  commonMisconceptions: [
    '"Period back pain is just muscle tension." It is often referred pain from prostaglandin activity — which responds to similar supports as cramping.',
  ],
  gentleSupports: [
    'Warm compress or heat pad on the lower back',
    'Gentle stretching targeting the lower back and hips',
    'Positioning: lying on your side with knees bent may reduce discomfort',
    'Gentle walking if tolerable',
  ],
  whenToSeekCare:
      'Seek care if back pain is severe, if it persists beyond your period, if it is accompanied by fever, '
      'urinary symptoms, or if it is significantly worsening over time.',
  ritualIds: ['ritual-warm-compress', 'ritual-gentle-stretching', 'ritual-restorative-bath'],
  foodIds: ['food-magnesium-rich-foods', 'food-warming-meals'],
  lessonIds: ['lesson-painful-periods-basics', 'lesson-endometriosis-basics'],
  pregnancyCaution: 'Back pain in pregnancy is common; sudden severe back pain may warrant evaluation.',
);

// ─── Heavy Bleeding ───────────────────────────────────────────────────────────

const symptomHeavyBleeding = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-heavy-bleeding',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['heavy bleeding', 'menorrhagia', 'anemia', 'fibroids', 'adenomyosis'],
    sourceRefs: [
      'ACOG — Heavy Menstrual Bleeding',
      'Office on Women\'s Health — Period Problems',
      'NICE NG88 — Heavy Menstrual Bleeding',
    ],
    safetyFlags: [
      'Soaking through a pad or tampon every hour for more than 2 hours — seek care the same day.',
      'Heavy bleeding with dizziness, fainting, or shortness of breath — seek urgent care.',
      'Signs of anemia (extreme fatigue, pallor, shortness of breath) warrant evaluation.',
    ],
    pregnancyFlags: [
      'Significant bleeding in pregnancy — particularly after 12 weeks — is a medical emergency.',
    ],
  ),
  title: 'Heavy Bleeding',
  summary:
      'Menstrual blood loss that is heavier than typical. Heavy periods affect quality of life and can cause iron deficiency anemia.',
  whatItIs:
      'Heavy menstrual bleeding (medically called menorrhagia or heavy menstrual bleeding, HMB) is defined as blood loss '
      'that interferes with quality of life. Clinical indicators include soaking through a pad or tampon every hour for several hours, '
      'passing clots larger than a quarter, or bleeding lasting more than 7 days. '
      'Common causes include fibroids, adenomyosis, endometriosis, hormonal imbalance, thyroid disorders, '
      'and bleeding conditions such as von Willebrand disease.',
  whatItMayFeelLike:
      'Frequent product changes, passing large clots, flooding through clothing or bedding, '
      'period lasting longer than 7 days, or feeling exhausted or light-headed from blood loss.',
  cyclePhaseIds: ['phase-menstrual'],
  relatedConditionIds: [
    'condition-heavy-menstrual-bleeding',
    'condition-fibroids',
    'condition-adenomyosis',
    'condition-endometriosis',
  ],
  commonMisconceptions: [
    '"Heavy periods are just the way some people are." Heavy bleeding that impairs quality of life is not something to simply tolerate — it is treatable.',
    '"Clots mean something is seriously wrong." Small clots are common; clots larger than a quarter more consistently warrant evaluation.',
    '"Iron levels are fine until I feel really sick." Anemia can develop gradually and affect energy and cognition before feeling severe.',
  ],
  gentleSupports: [
    'Iron-rich foods and vitamin C to support iron absorption during heavy bleeding',
    'Mineral broth for nourishment when appetite is low',
    'Tracking flow quantity — number of products used, clot size — to bring to medical appointments',
    'Rest, particularly on heaviest days',
  ],
  whenToSeekCare:
      'Seek care if you are soaking through protection every hour for more than 2 hours, '
      'if you have signs of anemia (extreme fatigue, dizziness, pallor), '
      'if your bleeding is significantly impacting your life, '
      'or if heavy bleeding is new or worsening.',
  ritualIds: ['ritual-menstrual-nesting'],
  foodIds: ['food-iron-support-meals', 'food-mineral-broth', 'food-hydration-support'],
  lessonIds: ['lesson-heavy-bleeding-basics'],
  pregnancyCaution: 'Significant bleeding in pregnancy is a medical emergency at any stage.',
);

// ─── Irregular Bleeding ───────────────────────────────────────────────────────

const symptomIrregularBleeding = SymptomObject(
  meta: ContentMeta(
    id: 'symptom-irregular-bleeding',
    type: 'symptom',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['irregular bleeding', 'spotting', 'irregular periods', 'PCOS', 'cycle'],
    sourceRefs: ['Office on Women\'s Health — Period Problems', 'ACOG'],
    safetyFlags: [
      'Bleeding after sex, between periods, or after menopause warrants prompt medical evaluation.',
      'Irregular bleeding with pelvic pain or unusual discharge may indicate infection or other conditions.',
    ],
    pregnancyFlags: [
      'Light spotting in early pregnancy can be normal, but any bleeding in pregnancy should be discussed with a provider.',
    ],
  ),
  title: 'Irregular Bleeding',
  summary:
      'Periods that arrive unpredictably, spotting between periods, or significant variation in cycle length. '
      'Many causes are benign, but irregular bleeding warrants investigation.',
  whatItIs:
      'A "regular" cycle can range from 21–35 days; variation of a few days each cycle is normal. '
      'Irregular bleeding can mean cycles shorter or longer than this range, variable cycle lengths, '
      'spotting between periods, or missed periods. '
      'Common causes include PCOS, thyroid disorders, perimenopause, stress, hormonal changes, '
      'uterine polyps, fibroids, or endometriosis.',
  whatItMayFeelLike:
      'Unpredictable period timing, light spotting between expected periods, '
      'cycles that vary by more than a week, or periods that come very frequently or rarely.',
  cyclePhaseIds: ['phase-menstrual'],
  relatedConditionIds: [
    'condition-irregular-periods',
    'condition-pcos',
    'condition-endometriosis',
    'condition-fibroids',
  ],
  commonMisconceptions: [
    '"Irregular periods are just stress." While stress can affect cycles, persistent irregularity has many possible causes worth investigating.',
    '"My cycle is irregular because I\'m young — it will sort itself out." This may be true, but it\'s worth tracking and discussing with a provider if it continues.',
  ],
  gentleSupports: [
    'Consistent tracking of period start dates and cycle lengths to identify patterns',
    'Noting other symptoms alongside bleeding irregularity',
    'Reducing known cycle disruptors where possible: extreme stress, significant weight changes, excessive exercise',
  ],
  whenToSeekCare:
      'Seek care if your cycle is consistently outside the 21–35 day range, '
      'if you have spotting after sex or between periods, '
      'if your periods have changed significantly without explanation, '
      'or if you are trying to conceive and have irregular cycles.',
  ritualIds: ['ritual-cycle-check-in'],
  foodIds: ['food-protein-stable-breakfast'],
  lessonIds: ['lesson-how-to-track-your-cycle', 'lesson-what-is-the-menstrual-cycle'],
  pregnancyCaution: 'Any bleeding in pregnancy should be reported to your provider.',
);
