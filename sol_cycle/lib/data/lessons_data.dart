import 'content_types.dart';

const List<LessonObject> allLessons = [
  lessonWhatIsTheMenstrualCycle,
  lessonHowToTrackYourCycle,
  lessonPainfulPeriodsBasics,
  lessonPmddVsPms,
  lessonEndometriosisBasics,
  lessonHeavyBleedingBasics,
  lessonLutealPhaseBasics,
  lessonOvulationBasics,
  lessonFertilityAwarenessBasics,
  lessonPregnancyExerciseBasics,
];

LessonObject? lessonById(String id) {
  try {
    return allLessons.firstWhere((l) => l.meta.id == id);
  } catch (_) {
    return null;
  }
}

// ─── What Is the Menstrual Cycle ──────────────────────────────────────────────

const lessonWhatIsTheMenstrualCycle = LessonObject(
  meta: ContentMeta(
    id: 'lesson-what-is-the-menstrual-cycle',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['cycle basics', 'phases', 'hormones', 'menstruation', 'ovulation', 'education'],
    sourceRefs: [
      'Office on Women\'s Health — Your Menstrual Cycle',
      'ACOG — The Menstrual Cycle infographic',
      'ACOG — Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign',
    ],
    safetyFlags: [],
  ),
  title: 'What Is the Menstrual Cycle?',
  summary:
      'A clear, grounded explanation of the four phases of the menstrual cycle — what is happening hormonally, '
      'physically, and why it matters for your health.',
  readingTimeMinutes: 5,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'The cycle is more than your period',
      body:
          'When most people think of their "cycle," they think of their period. But the menstrual cycle is a month-long '
          'hormonal process, of which menstruation is just the first phase. '
          'Understanding all four phases can help you make sense of why your energy, mood, body, and symptoms shift throughout the month — '
          'and why that\'s not random.',
    ),
    LessonSection(
      heading: 'The four phases',
      body:
          'The menstrual cycle is divided into four phases:\n\n'
          'Menstrual phase (approximately days 1–5): Progesterone and estrogen drop, triggering the uterine lining to shed. '
          'Energy is typically lowest. Rest is physiologically appropriate.\n\n'
          'Follicular phase (approximately days 6–13): FSH prompts follicle development in the ovaries. '
          'Rising estrogen rebuilds the uterine lining. Energy and mood often improve.\n\n'
          'Ovulatory phase (approximately days 14–16): An LH surge triggers the release of an egg. '
          'Estrogen peaks and testosterone rises slightly. Many people feel their most energetic and socially engaged.\n\n'
          'Luteal phase (approximately days 17–28): The corpus luteum produces progesterone. '
          'If no pregnancy occurs, progesterone and estrogen decline, and menstruation begins again. '
          'PMS and PMDD symptoms commonly emerge here.',
    ),
    LessonSection(
      heading: 'What "normal" actually means',
      body:
          'A normal menstrual cycle can range from 21–35 days in length. Period length is typically 3–7 days. '
          'Variation of a few days from cycle to cycle is normal. '
          'What counts as irregular is a consistent pattern outside these ranges, cycles that vary significantly, '
          'or any bleeding pattern that has changed without explanation.',
    ),
    LessonSection(
      heading: 'The cycle as a vital sign',
      body:
          'ACOG has stated that the menstrual cycle should be considered a vital sign — like blood pressure or temperature. '
          'Changes in cycle pattern, period length, pain, or flow can be early indicators of changes in overall health. '
          'This makes tracking not just useful for predicting periods, but genuinely informative for your wellbeing.',
    ),
    LessonSection(
      heading: 'You don\'t have to memorize the textbook',
      body:
          'Understanding your cycle doesn\'t mean having a perfect grasp of all the hormone names and day ranges. '
          'It means building familiarity with your own patterns — noticing when you feel most energetic, '
          'when symptoms typically appear, what feels different, and what feels familiar. '
          'That personal knowledge is the most useful information of all.',
    ),
  ],
  whenToSeekCare:
      'Seek care if your cycles are consistently outside the 21–35 day range, if your periods have changed significantly, '
      'if you have severe pain or heavy bleeding, or if something about your cycle feels wrong.',
  symptomIds: [],
  conditionIds: [],
  phaseIds: ['phase-menstrual', 'phase-follicular', 'phase-ovulatory', 'phase-luteal'],
  relatedLessonIds: ['lesson-how-to-track-your-cycle', 'lesson-luteal-phase-basics', 'lesson-ovulation-basics'],
);

// ─── How to Track Your Cycle ──────────────────────────────────────────────────

const lessonHowToTrackYourCycle = LessonObject(
  meta: ContentMeta(
    id: 'lesson-how-to-track-your-cycle',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['tracking', 'body literacy', 'patterns', 'symptoms', 'logging'],
    sourceRefs: [
      'ACOG — Menstruation as a Vital Sign',
      'Office on Women\'s Health — Tracking Your Period',
    ],
    safetyFlags: [],
  ),
  title: 'How to Track Your Cycle',
  summary:
      'Why tracking your cycle matters, what to track, and how to use your data to understand patterns '
      'and communicate more effectively with healthcare providers.',
  readingTimeMinutes: 5,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'Why tracking matters',
      body:
          'Cycle tracking builds body literacy — the ability to recognize your patterns, anticipate your needs, '
          'and notice when something is changing. '
          'It also gives you something concrete to bring to medical appointments. '
          'Many people are told their symptoms are normal; a tracked record can demonstrate the pattern clearly.',
    ),
    LessonSection(
      heading: 'What to track',
      body:
          'At minimum, track: your period start and end dates, flow intensity (spotting, light, medium, heavy), '
          'and any standout symptoms.\n\n'
          'If you want richer data, also track: energy level (1–10), mood, sleep hours, '
          'specific symptoms (cramps, bloating, headache, brain fog, irritability), '
          'pain level (1–10), and any care actions you take.\n\n'
          'Even simple tracking — just start and end dates — builds useful pattern recognition over time.',
    ),
    LessonSection(
      heading: 'How to build the habit',
      body:
          'The most effective tracking is the tracking you actually do. '
          'Simpler and more consistent beats detailed and sporadic. '
          'A daily log of just two or three items is more useful than a detailed entry done once a week. '
          'Apps that allow quick daily logging (like this one) reduce the friction.',
    ),
    LessonSection(
      heading: 'Using your data in medical conversations',
      body:
          'When you see a provider about menstrual symptoms, your tracked data is powerful. '
          'Be specific: "My pain is typically a 7/10 on days 1–2, and I need to take ibuprofen every 4 hours to manage it." '
          'Or: "My mood symptoms appear reliably on days 18–25 and resolve within 2 days of my period." '
          'This language — with evidence — is much harder to dismiss than "I just feel bad before my period."',
    ),
    LessonSection(
      heading: 'What to do if your cycle is irregular',
      body:
          'Irregular cycles are harder to predict but even more important to track. '
          'Document cycle start dates consistently. If cycles are highly variable, that pattern itself is meaningful data. '
          'Three months of tracked irregular cycles, with associated symptoms, is a reasonable dataset to bring to a provider.',
    ),
  ],
  whenToSeekCare:
      'Seek care if tracking reveals cycles consistently outside the 21–35 day range, '
      'or if any tracked symptom significantly impacts your quality of life.',
  symptomIds: [],
  conditionIds: [],
  phaseIds: ['phase-menstrual', 'phase-follicular', 'phase-ovulatory', 'phase-luteal'],
  relatedLessonIds: ['lesson-what-is-the-menstrual-cycle'],
);

// ─── Painful Periods Basics ───────────────────────────────────────────────────

const lessonPainfulPeriodsBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-painful-periods-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['dysmenorrhea', 'cramps', 'period pain', 'endometriosis', 'treatment'],
    sourceRefs: [
      'ACOG — Dysmenorrhea: Painful Periods',
      'Office on Women\'s Health — Period Problems',
      'ESHRE — Endometriosis Guideline 2022',
    ],
    safetyFlags: [
      'Severe or worsening pain should be evaluated for secondary causes including endometriosis.',
    ],
  ),
  title: 'Painful Periods: What You Should Know',
  summary:
      'A grounded explanation of why periods hurt, the difference between primary and secondary dysmenorrhea, '
      'what counts as "too much" pain, and what actually helps.',
  readingTimeMinutes: 6,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'Pain has a cause — and it\'s not weakness',
      body:
          'Period pain happens because the uterus contracts to shed its lining. '
          'These contractions are driven by prostaglandins — hormone-like compounds released during menstruation. '
          'Higher levels of prostaglandins are associated with stronger contractions and more pain. '
          'This is not a character flaw or a sign that something is fundamentally wrong with your body — '
          'but severe pain is also not something you should simply endure.',
    ),
    LessonSection(
      heading: 'Primary vs secondary dysmenorrhea',
      body:
          'Primary dysmenorrhea is period pain with no identifiable underlying condition. '
          'It typically begins in adolescence and often improves with age or after pregnancy, though not always.\n\n'
          'Secondary dysmenorrhea is period pain caused by a condition — most commonly endometriosis, adenomyosis, or fibroids. '
          'Secondary dysmenorrhea pain may begin earlier in the cycle, last longer, extend beyond the period, '
          'or worsen over time.\n\n'
          'If your pain is severe, getting worse, or not responding to usual pain relief, it deserves investigation for a secondary cause.',
    ),
    LessonSection(
      heading: 'What actually helps',
      body:
          'NSAIDs (ibuprofen, naproxen) — taken before pain begins or at its onset — are the most evidence-based option '
          'for primary dysmenorrhea. They work by reducing prostaglandin production.\n\n'
          'Heat — applied to the lower abdomen or back — is supported by research as comparable to mild analgesics '
          'for mild-to-moderate pain.\n\n'
          'Gentle movement is supportive for some people; rest is appropriate for others. '
          'Listen to your own body here.\n\n'
          'Magnesium, ginger, and omega-3 fatty acids have some preliminary evidence for reducing period pain — '
          'though the evidence base is smaller than for NSAIDs.',
    ),
    LessonSection(
      heading: 'When pain is not acceptable — even if it\'s common',
      body:
          'Period pain that prevents you from going to school, work, or doing daily activities is not "normal" '
          'in the sense of "acceptable" or "not worth treating." It is common — and it is also often undertreated.\n\n'
          '"Many people have period pain" does not mean your level of pain should be expected or tolerated. '
          'If pain is significantly impacting your life, that\'s a reason to seek care, not to wait.',
    ),
    LessonSection(
      heading: 'Endometriosis and pain',
      body:
          'Endometriosis is one of the most common causes of severe period pain. It is also one of the most commonly '
          'delayed diagnoses — averaging 7–10 years from symptom onset to diagnosis.\n\n'
          'Pain with sex, pain with bowel movements or urination, pain that starts before bleeding and persists after, '
          'or pain that is getting progressively worse are all patterns that warrant evaluation for endometriosis. '
          'A normal ultrasound does not rule it out.',
    ),
  ],
  whenToSeekCare:
      'Seek care if: pain is severe enough to prevent normal activities, does not respond to over-the-counter pain relief, '
      'is worsening over time, occurs outside your period, is accompanied by pain with sex or bowel movements, '
      'or if endometriosis has never been discussed.',
  symptomIds: ['symptom-cramps', 'symptom-pelvic-pain', 'symptom-back-pain', 'symptom-nausea'],
  conditionIds: ['condition-dysmenorrhea', 'condition-endometriosis', 'condition-adenomyosis'],
  phaseIds: ['phase-menstrual'],
  relatedLessonIds: ['lesson-endometriosis-basics', 'lesson-heavy-bleeding-basics'],
);

// ─── PMDD vs PMS ──────────────────────────────────────────────────────────────

const lessonPmddVsPms = LessonObject(
  meta: ContentMeta(
    id: 'lesson-pmdd-vs-pms',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['PMDD', 'PMS', 'luteal', 'mood', 'diagnosis', 'mental health'],
    sourceRefs: [
      'IAPMD — PMDD Education',
      'ACOG — Premenstrual Dysphoric Disorder',
      'Office on Women\'s Health — PMDD',
    ],
    safetyFlags: [
      'PMDD can include suicidal ideation — this requires urgent clinical care and crisis support.',
    ],
  ),
  title: 'PMDD vs PMS: Understanding the Difference',
  summary:
      'A clear, validating explanation of the difference between PMS and PMDD, how PMDD is diagnosed, '
      'and what support is available.',
  readingTimeMinutes: 7,
  difficulty: 'intermediate',
  sections: [
    LessonSection(
      heading: 'Both are real — and they\'re not the same thing',
      body:
          'PMS and PMDD exist on a spectrum of premenstrual experience, but they are meaningfully different. '
          'PMS causes discomfort and frustration. PMDD causes severe, cyclical suffering that significantly disrupts daily life. '
          'PMDD is listed in the DSM-5 — the diagnostic manual used by psychiatrists — as a depressive disorder. '
          'It is not "really bad PMS" or "being dramatic." It is a recognized clinical condition with a neurobiological basis.',
    ),
    LessonSection(
      heading: 'What PMS is',
      body:
          'PMS affects an estimated 20–40% of people who cycle to some degree. '
          'Symptoms appear in the 1–2 weeks before menstruation and resolve with or shortly after bleeding begins. '
          'Physical symptoms: bloating, breast tenderness, headache, fatigue. '
          'Emotional symptoms: irritability, low mood, tearfulness, anxiety. '
          'These symptoms are real and can be uncomfortable — but in PMS, people can generally still function.',
    ),
    LessonSection(
      heading: 'What PMDD is',
      body:
          'PMDD affects 3–8% of people who cycle. '
          'Its symptoms are severe enough to significantly impair work, relationships, and daily functioning. '
          'Core features include: severe irritability or anger, severe depression or hopelessness, '
          'marked anxiety or tension, and significant mood swings. '
          'Physical symptoms overlap with PMS but are often more pronounced.\n\n'
          'The key characteristic of PMDD: symptoms begin after ovulation and resolve within a few days of menstruation. '
          'The follicular phase (after bleeding begins) is symptom-free or significantly lighter. '
          'This cyclical pattern is what distinguishes PMDD from generalized depression or anxiety.',
    ),
    LessonSection(
      heading: 'The neurobiological basis',
      body:
          'PMDD is not caused by too much progesterone or "hormonal imbalance" in the traditional sense. '
          'Research suggests that people with PMDD have a differential sensitivity to normal hormonal fluctuations — '
          'particularly in the serotonergic system. The hormones themselves may be identical to someone without PMDD, '
          'but the brain\'s response to them is different. '
          'This is important: it means PMDD is not a reflection of weakness or instability.',
    ),
    LessonSection(
      heading: 'How PMDD is diagnosed',
      body:
          'PMDD is diagnosed through prospective symptom tracking — recording symptoms daily across at least two menstrual cycles '
          'to confirm the cyclical pattern. There is no blood test. '
          'A daily symptom diary (the DRSP — Daily Record of Severity of Problems — is a validated tool) '
          'that shows symptom presence in the luteal phase and absence in the follicular phase is the gold standard.\n\n'
          'Many people with PMDD are initially misdiagnosed with depression, anxiety, or borderline personality disorder — '
          'because providers fail to ask about the cyclical pattern. Tracking your own data is important.',
    ),
    LessonSection(
      heading: 'What actually helps',
      body:
          'PMDD is treatable. First-line pharmacological treatments include SSRIs, which can be taken continuously or '
          'only during the luteal phase (intermittent dosing) — both approaches are effective for many people. '
          'Hormonal therapies (combined contraceptives, progesterone-suppressing approaches) are used for some people. '
          'GnRH agonists suppress ovulation and are highly effective but have significant side effects. '
          'Hysterectomy with oophorectomy is a last-resort option for severe, refractory PMDD.\n\n'
          'CBT adapted for PMDD is also evidence-supported. Lifestyle approaches (exercise, sleep, reducing alcohol) '
          'are adjuncts, not primary treatments.',
    ),
    LessonSection(
      heading: 'You deserve care that actually works',
      body:
          'Being told to "try yoga" or "just track it" for PMDD is not adequate care. '
          'If your symptoms are severely disrupting your life, you deserve clinical treatment. '
          'The IAPMD (iapmd.org) has a provider directory of clinicians who specialize in PMDD.',
    ),
  ],
  whenToSeekCare:
      'Seek care if symptoms are severe enough to impair daily functioning, relationships, or work. '
      'Seek crisis support immediately if you experience suicidal thoughts or thoughts of self-harm. '
      'PMDD-related suicidal ideation is common — please reach out for support.',
  symptomIds: [
    'symptom-irritability',
    'symptom-low-mood',
    'symptom-brain-fog',
    'symptom-insomnia',
    'symptom-fatigue',
    'symptom-bloating',
  ],
  conditionIds: ['condition-pmdd', 'condition-pms', 'condition-pme'],
  phaseIds: ['phase-luteal'],
  relatedLessonIds: ['lesson-luteal-phase-basics'],
);

// ─── Endometriosis Basics ─────────────────────────────────────────────────────

const lessonEndometriosisBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-endometriosis-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['endometriosis', 'pelvic pain', 'diagnosis', 'infertility', 'surgery'],
    sourceRefs: [
      'ESHRE — Endometriosis Guideline 2022',
      'ACOG — Endometriosis',
      'Office on Women\'s Health — Endometriosis',
      'EndoFound — Endometriosis Overview',
    ],
    safetyFlags: [
      'Sudden severe pelvic pain may indicate a ruptured ovarian cyst — seek emergency care.',
    ],
  ),
  title: 'Endometriosis: What You Need to Know',
  summary:
      'An honest, informed overview of endometriosis — what it is, how it\'s diagnosed, why diagnosis takes so long, '
      'and what you can do to advocate for yourself.',
  readingTimeMinutes: 8,
  difficulty: 'intermediate',
  sections: [
    LessonSection(
      heading: 'What endometriosis actually is',
      body:
          'Endometriosis is a chronic inflammatory condition in which tissue similar to the uterine lining '
          '(the endometrium) grows in places outside the uterus. '
          'This tissue responds to hormonal cycles — thickening, breaking down, and bleeding — '
          'but unlike the uterine lining, it has no way to exit the body. '
          'This causes inflammation, scarring, and adhesions (tissue that sticks organs together). '
          'It most commonly affects the ovaries, fallopian tubes, bowel, bladder, and pelvic lining.',
    ),
    LessonSection(
      heading: 'How common it is — and how commonly it\'s missed',
      body:
          'Endometriosis affects approximately 10% of people who menstruate worldwide — about 190 million people. '
          'Despite this, the average time from symptom onset to diagnosis is 7–10 years. '
          'This is not because endometriosis is rare or mysterious. '
          'It is because pain with periods is normalized, symptoms are dismissed, '
          'and many healthcare providers lack the training to identify it early.',
    ),
    LessonSection(
      heading: 'Symptoms — which are often more than pain',
      body:
          'The most recognized symptom of endometriosis is pelvic pain — but the picture is often more complex:\n\n'
          '- Painful periods (dysmenorrhea), often severe\n'
          '- Pelvic pain outside of periods\n'
          '- Pain with sex (dyspareunia), particularly deep penetration\n'
          '- Pain with bowel movements or urination, especially during menstruation\n'
          '- Heavy or irregular bleeding\n'
          '- Fatigue — often significant\n'
          '- Bloating ("endo belly")\n'
          '- GI symptoms: constipation, diarrhea, nausea\n'
          '- Difficulty conceiving\n\n'
          'Not everyone with endometriosis has all of these. Some people have significant disease with minimal pain; '
          'others have severe pain with minimal visible disease at surgery.',
    ),
    LessonSection(
      heading: 'The diagnostic challenge',
      body:
          'A normal ultrasound does not rule out endometriosis. '
          'Most endometriosis is not visible on standard imaging — especially superficial peritoneal disease. '
          'Endometriomas (ovarian cysts from endo) and deep infiltrating disease may be visible on specialized MRI or ultrasound.\n\n'
          'The definitive diagnostic standard is laparoscopy with histological confirmation (biopsy). '
          'This means a surgical procedure is currently required for a confirmed diagnosis. '
          'This creates a significant barrier to timely care.',
    ),
    LessonSection(
      heading: 'Endometriosis and fertility',
      body:
          'Endometriosis is a leading cause of infertility, affecting approximately 30–50% of those with the condition. '
          'It can affect fertility through inflammation, ovarian reserve, fallopian tube adhesions, and embryo implantation. '
          'However, many people with endometriosis do conceive — sometimes naturally, sometimes with treatment. '
          'If you suspect endometriosis and are trying to conceive, seeking specialist referral earlier rather than later is recommended.',
    ),
    LessonSection(
      heading: 'Treatment options',
      body:
          'Treatment depends on goals (symptom relief vs fertility). Options include:\n\n'
          '- Pain management: NSAIDs, heat\n'
          '- Hormonal therapies: combined contraceptives, progestogens, GnRH agonists (these suppress, not cure)\n'
          '- Surgery: laparoscopic excision (removing lesions) or ablation (burning lesions); excision generally '
          'has better long-term outcomes\n'
          '- Specialist care from an endometriosis-trained surgeon for complex disease\n'
          '- Fertility treatment when needed\n\n'
          'Endometriosis is chronic — there is currently no cure, but symptoms can be managed and quality of life improved.',
    ),
    LessonSection(
      heading: 'How to advocate for yourself',
      body:
          'Many people with endometriosis have been told their pain is normal, that they\'re being dramatic, '
          'or that nothing is wrong because their scan was clear. None of that makes it true.\n\n'
          'Bring tracked symptom data to appointments. Be specific about pain location, severity, and timing. '
          'Mention pain with sex, bowel movements, or urination if present — these are specific red flags for endometriosis. '
          'Say: "I am concerned about endometriosis. What is the pathway to investigate this?"\n\n'
          'A second opinion is always valid.',
    ),
  ],
  whenToSeekCare:
      'Seek care if you have pelvic pain that disrupts your life, pain with sex or bowel movements, '
      'heavy bleeding, or fertility concerns. Seek emergency care for sudden severe pelvic pain.',
  symptomIds: ['symptom-pelvic-pain', 'symptom-cramps', 'symptom-heavy-bleeding', 'symptom-fatigue', 'symptom-bloating'],
  conditionIds: ['condition-endometriosis', 'condition-adenomyosis'],
  phaseIds: ['phase-menstrual'],
  relatedLessonIds: ['lesson-painful-periods-basics', 'lesson-heavy-bleeding-basics'],
);

// ─── Heavy Bleeding Basics ────────────────────────────────────────────────────

const lessonHeavyBleedingBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-heavy-bleeding-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['heavy bleeding', 'menorrhagia', 'HMB', 'anemia', 'quality of life'],
    sourceRefs: [
      'ACOG — Heavy Menstrual Bleeding',
      'NICE NG88 — Heavy Menstrual Bleeding',
      'Office on Women\'s Health — Period Problems',
    ],
    safetyFlags: [
      'Soaking through protection every hour for 2+ hours — seek same-day care.',
      'Dizziness, fainting, or severe fatigue with heavy bleeding — seek urgent care.',
    ],
  ),
  title: 'Heavy Periods: When It\'s More Than Heavy',
  summary:
      'A clear overview of what heavy bleeding is, when it crosses from common to concerning, '
      'what causes it, and what evaluation and treatment look like.',
  readingTimeMinutes: 6,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'What counts as "heavy"?',
      body:
          'Heavy menstrual bleeding is defined not by a precise measurement but by its impact on your life. '
          'Signs that your bleeding may be heavy:\n\n'
          '- Soaking through a full pad or tampon within 1–2 hours, on multiple occasions\n'
          '- Passing clots larger than a quarter (approximately 2.5 cm)\n'
          '- Bleeding that lasts more than 7 days\n'
          '- Needing to double up on protection (pad + tampon)\n'
          '- Waking at night to change protection\n'
          '- Flooding through clothing or bedding\n'
          '- Limiting activities because of your flow\n\n'
          'If your bleeding consistently meets two or more of these descriptions, it is appropriate to seek evaluation.',
    ),
    LessonSection(
      heading: 'Common causes',
      body:
          'Heavy bleeding can have many causes. The most common include:\n\n'
          '- Fibroids: non-cancerous uterine growths\n'
          '- Adenomyosis: endometrial tissue within the uterine wall\n'
          '- Uterine polyps: benign growths inside the uterus\n'
          '- Hormonal imbalance: including PCOS or anovulatory cycles\n'
          '- Thyroid disorders\n'
          '- Bleeding disorders, including von Willebrand disease (affects approximately 1 in 5 people with heavy periods)\n'
          '- Endometriosis\n'
          '- Certain medications (anticoagulants)\n\n'
          'Understanding the cause matters — because it changes the treatment.',
    ),
    LessonSection(
      heading: 'The anemia risk',
      body:
          'Heavy periods cause significant iron loss. Over time, this can lead to iron deficiency anemia — '
          'which causes fatigue, pallor, breathlessness, brain fog, and reduced functioning. '
          'Many people with heavy periods have lived with low iron for so long it feels normal. '
          'If you have heavy periods and significant fatigue, asking for a blood test to check iron levels is appropriate.',
    ),
    LessonSection(
      heading: 'What to track before your appointment',
      body:
          'If you\'re seeking care for heavy bleeding, a "pictorial blood loss chart" or '
          'a simple log of number of pads/tampons used per day, plus clot size, gives your provider concrete information. '
          '"I use about 8 regular pads per day on my heaviest day and pass clots the size of a 50p coin" '
          'is much more actionable than "I bleed a lot."',
    ),
    LessonSection(
      heading: 'Treatment options',
      body:
          'Treatment depends on the cause and whether you want to preserve fertility. Options include:\n\n'
          '- Hormonal IUD (Mirena): very effective at reducing bleeding for many causes\n'
          '- Combined oral contraceptives\n'
          '- Progestogens\n'
          '- Tranexamic acid: non-hormonal, taken during the period to reduce bleeding\n'
          '- NSAIDs: mild reduction in blood loss\n'
          '- Surgery: endometrial ablation, myomectomy (for fibroids), hysterectomy for severe cases\n'
          '- Treating the underlying cause (e.g., thyroid treatment, bleeding disorder management)',
    ),
    LessonSection(
      heading: 'Von Willebrand disease — worth asking about',
      body:
          'Von Willebrand disease is an inherited bleeding disorder and is significantly underdiagnosed '
          'in people with heavy periods. It may be worth asking for a coagulation screen — '
          'particularly if you have had heavy periods since your first cycle, '
          'easy bruising, or a family history of bleeding problems.',
    ),
  ],
  whenToSeekCare:
      'Seek same-day care if you are soaking through protection every hour for 2+ hours. '
      'Seek urgent care for dizziness, fainting, or shortness of breath with heavy bleeding. '
      'Seek routine care if heavy bleeding is impacting your quality of life, '
      'even if it has been present for a long time.',
  symptomIds: ['symptom-heavy-bleeding', 'symptom-fatigue', 'symptom-cramps'],
  conditionIds: ['condition-heavy-menstrual-bleeding', 'condition-fibroids', 'condition-adenomyosis'],
  phaseIds: ['phase-menstrual'],
  relatedLessonIds: ['lesson-painful-periods-basics', 'lesson-endometriosis-basics'],
);

// ─── Luteal Phase Basics ──────────────────────────────────────────────────────

const lessonLutealPhaseBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-luteal-phase-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['luteal', 'progesterone', 'PMS', 'PMDD', 'mood', 'energy'],
    sourceRefs: ['ACOG — PMS', 'Office on Women\'s Health — PMS and PMDD', 'IAPMD — PMDD'],
    safetyFlags: ['Severe luteal-phase mood symptoms warrant clinical evaluation — PMDD is treatable.'],
  ),
  title: 'The Luteal Phase: What\'s Actually Happening',
  summary:
      'A clear explanation of what the luteal phase is, why symptoms often worsen in this window, '
      'and how to support yourself through it.',
  readingTimeMinutes: 5,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'After ovulation — the second half begins',
      body:
          'After ovulation, the follicle that released the egg becomes the corpus luteum and begins producing progesterone. '
          'Progesterone rises sharply in the first half of the luteal phase, then gradually declines as menstruation approaches. '
          'Estrogen also rises and falls during this phase. '
          'If pregnancy occurs, progesterone stays elevated; if it doesn\'t, both hormones drop, triggering menstruation.',
    ),
    LessonSection(
      heading: 'Why the second half often feels harder',
      body:
          'As estrogen and progesterone decline in the second half of the luteal phase, neurotransmitter systems — '
          'particularly serotonin — are affected. This is where PMS and PMDD symptoms commonly emerge. '
          'The PMDD-risk window is typically the 14 days before menstruation, with symptoms often peaking '
          'in the last 5–7 days before bleeding begins.\n\n'
          'Progesterone itself has mild sedative effects (which may worsen fatigue and brain fog) and '
          'can affect fluid balance (contributing to bloating and breast tenderness). '
          'These are physiological effects — not psychological ones.',
    ),
    LessonSection(
      heading: 'Common luteal-phase experiences',
      body:
          'Many people notice some combination of:\n'
          '- Reduced energy and motivation\n'
          '- Increased irritability or emotional sensitivity\n'
          '- Bloating and digestive changes\n'
          '- Breast tenderness\n'
          '- Sleep disruption\n'
          '- Brain fog\n'
          '- Food cravings (particularly for carbohydrates and sweets — often a response to serotonin dip)\n\n'
          'These experiences vary significantly between people and between cycles.',
    ),
    LessonSection(
      heading: 'Gentle supports for the luteal phase',
      body:
          'No single approach works for everyone, but these have the most consistent support:\n\n'
          '- Reducing overstimulation: lighter social schedules, quieter environments\n'
          '- Magnesium-rich foods and adequate protein at each meal\n'
          '- Sleep prioritization\n'
          '- Gentle movement rather than high-intensity exercise if energy is low\n'
          '- Self-compassion — the luteal phase asks for accommodation, not performance',
    ),
    LessonSection(
      heading: 'When self-care is not enough',
      body:
          'If luteal-phase symptoms are severe enough to impair your functioning, relationships, or sense of self, '
          'that is not something to manage with rituals and magnesium. '
          'PMDD is a recognized and treatable condition. Track your symptoms — the pattern across cycles is the key evidence. '
          'Bring that evidence to a provider and ask specifically about PMDD evaluation.',
    ),
  ],
  whenToSeekCare:
      'Seek care if luteal-phase symptoms are significantly disrupting daily life, or if you experience severe mood symptoms, '
      'including hopelessness or thoughts of self-harm.',
  symptomIds: ['symptom-bloating', 'symptom-irritability', 'symptom-fatigue', 'symptom-insomnia', 'symptom-brain-fog'],
  conditionIds: ['condition-pms', 'condition-pmdd'],
  phaseIds: ['phase-luteal'],
  relatedLessonIds: ['lesson-pmdd-vs-pms', 'lesson-what-is-the-menstrual-cycle'],
);

// ─── Ovulation Basics ─────────────────────────────────────────────────────────

const lessonOvulationBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-ovulation-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['ovulation', 'LH surge', 'fertile window', 'cervical mucus', 'OPK'],
    sourceRefs: [
      'Office on Women\'s Health — Ovulation',
      'ACOG — The Menstrual Cycle',
      'NICHD — Reproductive Health',
    ],
    safetyFlags: [],
  ),
  title: 'Ovulation: What\'s Happening and How to Recognize It',
  summary:
      'What ovulation is, when it typically happens, the physical signs that often accompany it, '
      'and why it matters for both cycle health and fertility.',
  readingTimeMinutes: 5,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'The key event of the cycle',
      body:
          'Ovulation is the release of a mature egg from one of the ovaries. '
          'It is triggered by a surge in LH (luteinizing hormone), which is itself triggered by peak estrogen. '
          'The egg is viable for approximately 12–24 hours after release. '
          'Ovulation marks the transition from the follicular phase to the luteal phase.',
    ),
    LessonSection(
      heading: 'When ovulation typically happens',
      body:
          'In a 28-day cycle, ovulation typically occurs around day 14. '
          'But cycles vary — and ovulation typically occurs approximately 14 days before the next period, '
          'not 14 days after the last one. '
          'This means in a 35-day cycle, ovulation might happen around day 21. '
          'In an irregular cycle, predicting ovulation from cycle day alone is unreliable.',
    ),
    LessonSection(
      heading: 'Signs that ovulation may be happening',
      body:
          'Some people notice no signs of ovulation; others notice several:\n\n'
          '- Cervical mucus changes: around ovulation, mucus often becomes clear, stretchy, and slippery — '
          'often compared to raw egg whites. This is called "fertile quality" mucus.\n'
          '- Basal body temperature rise: temperature rises slightly (0.2–0.5°C) after ovulation, '
          'reflecting the progesterone effect of the corpus luteum. Tracking requires a basal thermometer and '
          'consistent measurement before getting out of bed.\n'
          '- Mittelschmerz: a one-sided abdominal twinge or ache around ovulation, experienced by some people.\n'
          '- LH peak on an OPK (ovulation predictor kit): OPKs detect the LH surge and are the most objective home method.',
    ),
    LessonSection(
      heading: 'Ovulation as a health signal',
      body:
          'Regular ovulation indicates healthy hormonal communication between the brain and ovaries. '
          'Absent or irregular ovulation (anovulation) is associated with PCOS, hypothalamic amenorrhea, '
          'thyroid disorders, and other conditions. '
          'If you are not sure whether you are ovulating, tracking signs or using OPKs across several cycles can help clarify.',
    ),
  ],
  whenToSeekCare:
      'Seek care if you have signs of not ovulating (very irregular or absent cycles), '
      'if you have been trying to conceive without success, or if you have other symptoms suggesting hormonal imbalance.',
  symptomIds: [],
  conditionIds: ['condition-pcos', 'condition-amenorrhea', 'condition-irregular-periods'],
  phaseIds: ['phase-ovulatory', 'phase-follicular'],
  relatedLessonIds: ['lesson-what-is-the-menstrual-cycle', 'lesson-fertility-awareness-basics'],
);

// ─── Fertility Awareness Basics ───────────────────────────────────────────────

const lessonFertilityAwarenessBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-fertility-awareness-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['fertility awareness', 'TTC', 'fertile window', 'ovulation', 'FAM'],
    sourceRefs: [
      'Office on Women\'s Health — Trying to Conceive',
      'ACOG — Fertility Awareness-Based Methods',
      'NICHD — Fertility',
    ],
    safetyFlags: [],
  ),
  title: 'Fertility Awareness Basics',
  summary:
      'A grounded overview of fertility awareness — the fertile window, how to identify it, '
      'what it can and cannot tell you, and when to seek specialist support.',
  readingTimeMinutes: 5,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'What fertility awareness is',
      body:
          'Fertility awareness refers to methods of observing and interpreting signs of fertility in the body — '
          'primarily to understand when conception is most and least likely. '
          'These methods can be used for conception (TTC) or contraception. '
          'This lesson focuses on fertility awareness in the context of trying to conceive.',
    ),
    LessonSection(
      heading: 'The fertile window',
      body:
          'Pregnancy can only occur from sex in the roughly 6-day window ending on the day of ovulation. '
          'Sperm can survive in the reproductive tract for up to 5 days; the egg is viable for approximately 24 hours. '
          'This makes the most fertile days typically the 2–3 days before and the day of ovulation. '
          'Identifying this window is the core goal of fertility awareness for TTC.',
    ),
    LessonSection(
      heading: 'How to identify your fertile window',
      body:
          '- Ovulation predictor kits (OPKs): detect the LH surge 24–36 hours before ovulation. Accessible and objective.\n'
          '- Cervical mucus observation: fertile quality mucus (clear, stretchy, slippery) indicates approaching ovulation.\n'
          '- Basal body temperature (BBT): temperature rises after ovulation, confirming it occurred — but this is retrospective, so less useful for TTC than for pattern recognition.\n'
          '- Cycle length tracking: if cycles are regular, ovulation likely occurs around 14 days before the next expected period.',
    ),
    LessonSection(
      heading: 'What fertility awareness can and cannot tell you',
      body:
          'Fertility awareness can help you time intercourse or insemination for the most fertile window. '
          'It cannot guarantee pregnancy, diagnose infertility, or assess sperm, tube, or uterine health. '
          'It is most useful when cycles are regular. With irregular cycles, OPKs and mucus monitoring are more reliable than calendar prediction.',
    ),
    LessonSection(
      heading: 'When to seek fertility specialist support',
      body:
          'ACOG recommends seeking evaluation:\n'
          '- After 12 months of regular unprotected sex without conception (for those under 35)\n'
          '- After 6 months for those 35 and over\n'
          '- Sooner if you have irregular cycles, known endometriosis, PCOS, or other factors that may affect fertility\n\n'
          'Fertility evaluation is not a failure — it is useful information.',
    ),
  ],
  whenToSeekCare:
      'Seek care after 12 months of unprotected sex without conception (or 6 months if 35 or over). '
      'Seek care sooner with irregular cycles, known conditions affecting fertility, or other concerns.',
  symptomIds: [],
  conditionIds: ['condition-pcos', 'condition-endometriosis'],
  phaseIds: ['phase-ovulatory'],
  relatedLessonIds: ['lesson-ovulation-basics'],
);

// ─── Pregnancy Exercise Basics ────────────────────────────────────────────────

const lessonPregnancyExerciseBasics = LessonObject(
  meta: ContentMeta(
    id: 'lesson-pregnancy-exercise-basics',
    type: 'lesson',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['pregnancy', 'exercise', 'movement', 'ACOG', 'prenatal'],
    sourceRefs: [
      'ACOG — Exercise During Pregnancy',
      'MotherToBaby — Exercise in Pregnancy',
    ],
    safetyFlags: [
      'Stop exercise and seek care for: chest pain, dizziness, shortness of breath, vaginal bleeding, calf swelling or pain.',
    ],
    pregnancyFlags: ['This entire lesson is specifically for use during pregnancy.'],
  ),
  title: 'Movement During Pregnancy: ACOG Basics',
  summary:
      'What ACOG recommends for exercise during pregnancy — general principles, what\'s considered safe, '
      'and when to stop and seek care.',
  readingTimeMinutes: 5,
  difficulty: 'beginner',
  sections: [
    LessonSection(
      heading: 'Movement in pregnancy is generally encouraged',
      body:
          'ACOG recommends that people with uncomplicated pregnancies aim for at least 150 minutes of moderate-intensity '
          'aerobic activity per week during pregnancy. '
          'Regular exercise during pregnancy has benefits including reduced risk of gestational diabetes, '
          'preeclampsia, and cesarean birth, and may reduce low back pain, improve mood, and aid recovery.\n\n'
          'This is guidance for uncomplicated pregnancies. Always discuss your specific situation with your provider.',
    ),
    LessonSection(
      heading: 'Generally safe activities',
      body:
          'Most people can safely continue or begin:\n'
          '- Walking\n'
          '- Swimming and water aerobics\n'
          '- Stationary cycling\n'
          '- Modified prenatal yoga and pilates\n'
          '- Low-impact aerobics\n'
          '- Strength training with modifications\n\n'
          'If you were active before pregnancy, you can generally continue at a modified level. '
          'If you are new to exercise, start gradually.',
    ),
    LessonSection(
      heading: 'Activities typically avoided in pregnancy',
      body:
          '- Contact sports or activities with high fall risk (e.g., skiing, horse riding after first trimester)\n'
          '- Hot yoga or exercises that significantly raise core body temperature\n'
          '- Scuba diving\n'
          '- Exercises lying flat on the back after the first trimester (compresses a major blood vessel)\n'
          '- High-altitude exercise if not acclimatized\n\n'
          'Your provider can give specific guidance for your situation.',
    ),
    LessonSection(
      heading: 'Warning signs — stop and seek care',
      body:
          'Stop exercise and contact your provider or seek urgent care if you experience:\n'
          '- Vaginal bleeding\n'
          '- Dizziness or feeling faint\n'
          '- Chest pain or palpitations\n'
          '- Headache\n'
          '- Calf pain or swelling\n'
          '- Shortness of breath before exertion begins\n'
          '- Preterm labor signs: regular contractions, amniotic fluid leaking\n\n'
          'These signs mean exercise should stop and medical assessment should happen.',
    ),
    LessonSection(
      heading: 'This app is not your prenatal care provider',
      body:
          'This lesson is educational, based on general ACOG guidance. '
          'It is not a substitute for individualized advice from your obstetrician, midwife, or GP. '
          'Your provider knows your specific pregnancy, history, and risks — and their advice takes precedence.',
    ),
  ],
  whenToSeekCare:
      'Seek immediate care for any warning sign listed above. '
      'Discuss all exercise choices with your prenatal care provider.',
  symptomIds: [],
  conditionIds: [],
  phaseIds: [],
  relatedLessonIds: ['lesson-fertility-awareness-basics'],
);
