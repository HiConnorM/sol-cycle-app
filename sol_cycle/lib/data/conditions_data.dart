import 'content_types.dart';

const List<ConditionObject> allConditions = [
  conditionPms,
  conditionPmdd,
  conditionPme,
  conditionDysmenorrhea,
  conditionEndometriosis,
  conditionAdenomyosis,
  conditionHeavyMenstrualBleeding,
  conditionIrregularPeriods,
  conditionAmenorrhea,
  conditionFibroids,
  conditionPcos,
];

ConditionObject? conditionById(String id) {
  try {
    return allConditions.firstWhere((c) => c.meta.id == id);
  } catch (_) {
    return null;
  }
}

// ─── PMS ──────────────────────────────────────────────────────────────────────

const conditionPms = ConditionObject(
  meta: ContentMeta(
    id: 'condition-pms',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['PMS', 'premenstrual', 'luteal', 'mood', 'physical'],
    sourceRefs: ['ACOG — Premenstrual Syndrome', 'Office on Women\'s Health — PMS'],
    safetyFlags: [
      'If PMS symptoms severely disrupt daily functioning, consider evaluation for PMDD.',
    ],
  ),
  title: 'PMS',
  summary:
      'Premenstrual Syndrome. A cluster of physical and emotional symptoms in the 1–2 weeks before menstruation '
      'that resolves with or shortly after the start of bleeding.',
  overview:
      'PMS is defined by symptoms that reliably appear in the luteal phase and resolve around menstruation. '
      'It is estimated to affect 20–40% of people with cycles to some degree, with a smaller percentage '
      'experiencing symptoms severe enough to significantly disrupt daily life. '
      'PMS involves both physical and emotional components, and is driven by the hormonal changes of the luteal phase.',
  commonSymptomIds: [
    'symptom-bloating',
    'symptom-breast-tenderness',
    'symptom-irritability',
    'symptom-low-mood',
    'symptom-fatigue',
    'symptom-insomnia',
    'symptom-headache',
    'symptom-brain-fog',
    'symptom-food-cravings',
    'symptom-back-pain',
  ],
  howItDiffers:
      'PMS differs from PMDD in severity. PMS causes discomfort and disruption, but people can generally function. '
      'PMDD symptoms are severe enough to significantly impair work, relationships, and daily life. '
      'PMS also differs from normal premenstrual awareness — some symptom awareness before a period is typical and not pathological.',
  diagnosticReality:
      'There is no single test for PMS. Diagnosis is based on tracking symptoms across at least two menstrual cycles, '
      'confirming the pattern of symptom onset in the luteal phase and resolution with menstruation.',
  carePathways: [
    'Lifestyle approaches: exercise, sleep hygiene, dietary adjustments (magnesium, reducing salt and caffeine)',
    'Over-the-counter support: NSAIDs for physical symptoms; some evidence for magnesium',
    'Clinical care if symptoms are severe or disruptive',
  ],
  selfAdvocacyNotes: [
    'Track your symptoms across at least two full cycles before a medical appointment.',
    'Use the language "these symptoms consistently appear in the 1–2 weeks before my period and resolve with bleeding."',
    'You have the right to ask for a referral if your primary care provider does not have expertise in PMS/PMDD.',
  ],
  emotionalImpact:
      'Many people with PMS feel dismissed — both by healthcare providers and by cultural messaging that normalizes '
      'premenstrual suffering. The symptoms are real, they have a physiological basis, and they are worth taking seriously.',
  lessonIds: ['lesson-pmdd-vs-pms', 'lesson-luteal-phase-basics'],
  escalationPoints: [
    'Symptoms are severe enough to disrupt work, relationships, or daily functioning',
    'Mood symptoms include hopelessness, thoughts of self-harm, or severe depression',
    'Symptoms are worsening over time',
  ],
);

// ─── PMDD ─────────────────────────────────────────────────────────────────────

const conditionPmdd = ConditionObject(
  meta: ContentMeta(
    id: 'condition-pmdd',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['PMDD', 'premenstrual dysphoric disorder', 'luteal', 'mental health', 'severe'],
    sourceRefs: [
      'IAPMD — PMDD',
      'ACOG — Premenstrual Dysphoric Disorder',
      'Office on Women\'s Health — PMDD',
    ],
    safetyFlags: [
      'PMDD can include suicidal ideation — this is a medical emergency. Please seek crisis support.',
      'PMDD is associated with significantly elevated risk of suicidal thoughts — take these symptoms seriously and seek care.',
    ],
  ),
  title: 'PMDD',
  summary:
      'Premenstrual Dysphoric Disorder. A severe, clinically recognized condition in which luteal-phase symptoms '
      'significantly disrupt functioning. Not "bad PMS" — a distinct disorder with a neurobiological basis.',
  overview:
      'PMDD affects an estimated 3–8% of people with menstrual cycles. It is characterized by severe emotional, '
      'behavioral, and physical symptoms in the luteal phase that resolve within a few days of menstruation onset. '
      'PMDD is listed in the DSM-5 as a depressive disorder. It is not caused by excess hormones but by an '
      'abnormal sensitivity to normal hormonal fluctuations, particularly in serotonergic pathways. '
      'It is a serious and often debilitating condition that significantly impacts relationships, work, and quality of life.',
  commonSymptomIds: [
    'symptom-irritability',
    'symptom-low-mood',
    'symptom-brain-fog',
    'symptom-fatigue',
    'symptom-insomnia',
    'symptom-bloating',
    'symptom-breast-tenderness',
    'symptom-food-cravings',
  ],
  howItDiffers:
      'PMDD is distinguished from PMS by severity and functional impairment. In PMDD, symptoms are severe enough to '
      'significantly disrupt daily life — affecting work performance, relationships, and the ability to carry out normal activities. '
      'PMDD mood symptoms can reach the level of severe depression or debilitating anxiety. '
      'It differs from clinical depression in its reliable cyclical pattern: symptoms begin after ovulation and resolve within days of menstruation.',
  diagnosticReality:
      'PMDD requires prospective symptom tracking across at least two cycles for diagnosis. '
      'A daily symptom diary is the gold standard. Many people with PMDD are initially misdiagnosed with depression or anxiety, '
      'because providers may not ask about the cyclical pattern. Advocating for tracking-based evaluation is important.',
  carePathways: [
    'SSRIs (continuous or luteal-phase dosing) are the first-line pharmacological treatment and are highly effective for many people',
    'Hormonal management: hormonal contraception, GnRH agonists',
    'CBT adapted for PMDD',
    'Lifestyle: exercise, sleep, dietary approaches as adjuncts',
    'Specialist care from a provider familiar with PMDD',
  ],
  selfAdvocacyNotes: [
    'Track symptoms daily for 2 cycles using a validated tool (e.g., the DRSP or PMDD diary).',
    'Bring your symptom diary to your appointment.',
    'State clearly: "My symptoms are cyclical — they begin reliably after ovulation and resolve when bleeding starts."',
    'You deserve treatment that actually helps, not just reassurance. PMDD is treatable.',
    'The IAPMD (iapmd.org) has provider resources and a provider directory.',
  ],
  emotionalImpact:
      'PMDD can cause profound suffering — a predictable, recurrent disruption to identity, relationships, and functioning. '
      'Many people with PMDD describe the luteal phase as losing themselves. The grief, shame, and exhaustion this creates '
      'are real and valid. Community support (e.g., r/PMDD) can be important alongside clinical care.',
  lessonIds: ['lesson-pmdd-vs-pms'],
  escalationPoints: [
    'Suicidal thoughts or thoughts of self-harm — seek crisis support immediately',
    'Severity is significantly impacting safety, relationships, or ability to work',
    'Symptoms are worsening over time',
    'Suspected PMDD has not been evaluated by a clinician',
  ],
);

// ─── PME ──────────────────────────────────────────────────────────────────────

const conditionPme = ConditionObject(
  meta: ContentMeta(
    id: 'condition-pme',
    type: 'condition',
    evidenceLabel: EvidenceLabel.expertOrg,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['PME', 'premenstrual exacerbation', 'PMDD', 'comorbidity'],
    sourceRefs: ['IAPMD — PME', 'ACOG'],
    safetyFlags: [
      'PME in the context of severe mental health conditions requires coordination with psychiatric care.',
    ],
  ),
  title: 'PME',
  summary:
      'Premenstrual Exacerbation. When an existing mental health condition — such as depression, anxiety, bipolar disorder, or OCD — '
      'significantly worsens in the luteal phase.',
  overview:
      'PME is distinct from PMDD: in PME, symptoms do not fully resolve after menstruation because they stem from '
      'a pre-existing condition that is being amplified by hormonal fluctuations. '
      'PME is common — many people with mood disorders, anxiety conditions, PTSD, OCD, or eating disorders '
      'notice meaningful worsening in the luteal phase. It may co-occur with PMDD.',
  commonSymptomIds: [
    'symptom-low-mood',
    'symptom-irritability',
    'symptom-insomnia',
    'symptom-brain-fog',
  ],
  howItDiffers:
      'PMDD symptoms are absent (or minimal) in the follicular phase and resolve fully or nearly fully with menstruation. '
      'PME symptoms are present throughout the cycle but worsen in the luteal phase and do not fully remit with bleeding. '
      'The distinction matters for treatment, since PME requires treating the underlying condition.',
  diagnosticReality:
      'Like PMDD, PME diagnosis benefits from prospective daily tracking. '
      'The cyclical worsening pattern — even if a baseline exists throughout the cycle — is the key feature to document.',
  carePathways: [
    'Treating the underlying condition is the primary approach',
    'Coordinating with a provider who understands both the condition and cyclical exacerbation',
    'In some cases, adjusting medication timing or dosing in the luteal phase',
  ],
  selfAdvocacyNotes: [
    'Tell your provider: "My [depression/anxiety/other condition] is significantly worse in the 1–2 weeks before my period."',
    'Bring tracked data showing the pattern.',
    'The IAPMD has resources specifically for PME.',
  ],
  emotionalImpact:
      'PME can make an already challenging condition feel unmanageable for part of every month. '
      'The predictability can feel both validating (there is a pattern) and demoralizing (it returns every cycle).',
  lessonIds: ['lesson-pmdd-vs-pms'],
  escalationPoints: [
    'Suicidal thoughts or severe mental health crisis',
    'PME is severely impacting functioning or safety',
    'Underlying condition is unmanaged or undertreated',
  ],
);

// ─── Dysmenorrhea ─────────────────────────────────────────────────────────────

const conditionDysmenorrhea = ConditionObject(
  meta: ContentMeta(
    id: 'condition-dysmenorrhea',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['dysmenorrhea', 'painful periods', 'cramps', 'prostaglandins'],
    sourceRefs: ['ACOG — Dysmenorrhea: Painful Periods', 'Office on Women\'s Health'],
    safetyFlags: [
      'Severe, worsening, or non-period-linked pelvic pain warrants evaluation for secondary causes.',
    ],
  ),
  title: 'Dysmenorrhea',
  summary:
      'Painful periods. Primary dysmenorrhea has no underlying cause; secondary dysmenorrhea is caused by a condition such as endometriosis.',
  overview:
      'Dysmenorrhea (painful menstruation) is one of the most common gynecological conditions. '
      'Primary dysmenorrhea is caused by prostaglandin-driven uterine contractions with no identifiable underlying condition. '
      'Secondary dysmenorrhea is pain caused by an underlying condition — most commonly endometriosis, adenomyosis, or fibroids. '
      'Severe or worsening period pain should always be evaluated for a secondary cause.',
  commonSymptomIds: [
    'symptom-cramps',
    'symptom-back-pain',
    'symptom-nausea',
    'symptom-fatigue',
    'symptom-pelvic-pain',
  ],
  howItDiffers:
      'Primary dysmenorrhea typically begins 1–2 days before or at the start of bleeding and improves over the first few days. '
      'Secondary dysmenorrhea may start earlier, last longer, or persist between periods. '
      'Pain that is getting worse over time, or that disrupts more and more of your life, points toward a secondary cause.',
  diagnosticReality:
      'Primary dysmenorrhea is often assumed; secondary dysmenorrhea — especially endometriosis — is frequently missed or delayed. '
      'If pain is severe or not well controlled, asking about secondary causes is appropriate and important.',
  carePathways: [
    'NSAIDs (e.g., ibuprofen) — most evidence-based approach for primary dysmenorrhea; most effective when started before or at pain onset',
    'Heat therapy — research supports it as comparable to mild analgesics for pain reduction',
    'Hormonal management if appropriate',
    'For secondary causes: treating the underlying condition',
  ],
  selfAdvocacyNotes: [
    'Track pain severity and timing across multiple cycles.',
    'If pain is not well-controlled with NSAIDs, say so clearly and ask about further evaluation.',
    'Worsening pain, or pain that spreads to other parts of your cycle, is a reason to revisit the diagnosis.',
  ],
  emotionalImpact:
      'Painful periods are often dismissed. Many people are told to "just take paracetamol" for pain that significantly '
      'disrupts school, work, and daily life. This dismissal is common, harmful, and worth pushing back on.',
  lessonIds: ['lesson-painful-periods-basics'],
  escalationPoints: [
    'Pain severe enough to prevent normal activities and not responding to usual analgesics',
    'Worsening pain over time',
    'Pain that occurs outside of periods or lasts through the cycle',
    'Pain with sex, bowel movements, or urination',
  ],
);

// ─── Endometriosis ────────────────────────────────────────────────────────────

const conditionEndometriosis = ConditionObject(
  meta: ContentMeta(
    id: 'condition-endometriosis',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['endometriosis', 'pelvic pain', 'infertility', 'diagnosis delay', 'chronic'],
    sourceRefs: [
      'ESHRE — Endometriosis Guideline 2022',
      'ACOG — Endometriosis',
      'Office on Women\'s Health — Endometriosis',
      'EndoFound — Overview',
    ],
    safetyFlags: [
      'Sudden severe pelvic pain may indicate a ruptured cyst — seek emergency care.',
      'Endometriosis affects fertility; TTC concerns with suspected endo warrant prompt specialist referral.',
    ],
  ),
  title: 'Endometriosis',
  summary:
      'A chronic condition in which tissue similar to the uterine lining grows outside the uterus. '
      'It causes pain, inflammation, and can affect fertility. Average diagnostic delay is 7–10 years.',
  overview:
      'Endometriosis affects an estimated 10% of people who menstruate worldwide — approximately 190 million people. '
      'Endometrial-like tissue outside the uterus responds to hormonal cycles, causing inflammation, scarring, and adhesions. '
      'It most commonly affects the ovaries, fallopian tubes, bowel, bladder, and pelvic peritoneum. '
      'Symptoms vary widely — some have debilitating pain; others have minimal symptoms despite significant disease. '
      'The average time from symptom onset to diagnosis is 7–10 years, which represents a profound healthcare failure.',
  commonSymptomIds: [
    'symptom-pelvic-pain',
    'symptom-cramps',
    'symptom-heavy-bleeding',
    'symptom-back-pain',
    'symptom-nausea',
    'symptom-fatigue',
    'symptom-bloating',
    'symptom-irregular-bleeding',
  ],
  howItDiffers:
      'Endometriosis pain often begins before the period and lasts beyond it. Pain with sex, bowel movements, or urination '
      'is strongly associated with endometriosis and typically does not occur with primary dysmenorrhea. '
      'Adenomyosis is a related but distinct condition where the tissue grows into the uterine wall rather than outside it.',
  diagnosticReality:
      'Imaging (ultrasound, MRI) can identify endometriomas and deep infiltrating disease but cannot rule out endometriosis. '
      'Laparoscopy with histological confirmation remains the diagnostic standard. '
      'Normal imaging does not mean no endometriosis. Many people must advocate persistently for evaluation.',
  carePathways: [
    'Pain management: NSAIDs, hormonal therapies (combined contraceptives, progestogens, GnRH agonists)',
    'Surgical management: laparoscopic excision or ablation',
    'Multidisciplinary care for complex cases (colorectal, urology, pain management)',
    'Fertility treatment when needed',
    'Specialist care from an endometriosis-trained gynecologist where possible',
  ],
  selfAdvocacyNotes: [
    'Document pain severity, timing, and impact in detail — the pattern matters.',
    'Specifically mention pain with sex, bowel movements, or urination if present.',
    'Say clearly: "I am concerned about endometriosis. What is the path to ruling this in or out?"',
    'Normal ultrasound does not rule out endometriosis — it is okay to say this to your provider.',
    'A second opinion is always valid if you feel dismissed.',
    'The ESHRE guideline patient version is a useful document to share with providers.',
  ],
  emotionalImpact:
      'The diagnostic journey with endometriosis is often devastating — years of pain dismissed, '
      'misdiagnosed, or minimized. Many people grieve the time lost and the suffering endured. '
      'Community support (r/endometriosis, EndoFound) alongside clinical care matters.',
  lessonIds: ['lesson-endometriosis-basics', 'lesson-painful-periods-basics'],
  escalationPoints: [
    'Sudden severe pelvic pain — may indicate a ruptured ovarian cyst; seek emergency care',
    'Unable to manage daily life due to pain',
    'Fertility concerns with suspected or confirmed endo — prompt specialist referral is warranted',
    'Urinary or bowel symptoms worsening with your cycle',
  ],
);

// ─── Adenomyosis ──────────────────────────────────────────────────────────────

const conditionAdenomyosis = ConditionObject(
  meta: ContentMeta(
    id: 'condition-adenomyosis',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['adenomyosis', 'heavy bleeding', 'pelvic pain', 'uterus', 'chronic'],
    sourceRefs: ['ACOG', 'ESHRE — Endometriosis Guideline', 'Office on Women\'s Health'],
    safetyFlags: [
      'Heavy bleeding with severe pain warrants evaluation, particularly for associated anemia.',
    ],
  ),
  title: 'Adenomyosis',
  summary:
      'A condition in which the uterine lining (endometrium) grows into the muscular wall of the uterus. '
      'Causes heavy, painful periods, and an enlarged or tender uterus.',
  overview:
      'Adenomyosis occurs when endometrial tissue embeds within the myometrium (uterine muscle). '
      'This can cause the uterus to enlarge and create painful, heavy periods. '
      'It may be diffuse (throughout the uterine wall) or focal (in a localized area, called an adenomyoma). '
      'Adenomyosis often co-occurs with endometriosis and fibroids. '
      'It is most commonly diagnosed in people in their 30s and 40s, though it can affect younger people.',
  commonSymptomIds: [
    'symptom-heavy-bleeding',
    'symptom-cramps',
    'symptom-pelvic-pain',
    'symptom-back-pain',
    'symptom-bloating',
    'symptom-fatigue',
  ],
  howItDiffers:
      'Adenomyosis involves the uterine wall itself, while endometriosis involves tissue outside the uterus. '
      'They can coexist. Adenomyosis classically causes a uniformly enlarged, tender uterus and heavy, painful periods. '
      'Fibroids are benign tumors in or on the uterus, not the same as adenomyosis though symptoms overlap.',
  diagnosticReality:
      'Adenomyosis can be suspected on MRI and sometimes transvaginal ultrasound, though imaging sensitivity varies. '
      'Historically, definitive diagnosis required hysterectomy, but imaging criteria are improving. '
      'Many providers are not well-versed in adenomyosis, and self-advocacy for proper imaging and evaluation matters.',
  carePathways: [
    'Hormonal management: progestogens, hormonal IUD (often reduces bleeding significantly), GnRH agonists',
    'Pain management: NSAIDs',
    'Uterine-sparing procedures: ablation in selected cases (though adenomyosis recurrence is common)',
    'Hysterectomy as a definitive treatment for severe cases where fertility is not desired',
  ],
  selfAdvocacyNotes: [
    'Ask specifically about adenomyosis if you have heavy, painful periods, particularly if endometriosis has been ruled out.',
    'Request an MRI if ultrasound findings are unclear.',
    'Track symptom patterns and quality-of-life impact to present to your provider.',
  ],
  emotionalImpact:
      'Adenomyosis is frequently overlooked or diagnosed late. The chronic nature of heavy, painful periods '
      'takes a significant physical and emotional toll. Many people feel their symptoms are minimized.',
  lessonIds: ['lesson-heavy-bleeding-basics', 'lesson-painful-periods-basics'],
  escalationPoints: [
    'Heavy bleeding causing anemia symptoms (extreme fatigue, dizziness, pallor)',
    'Pain severely impacting daily life',
    'Fertility concerns with suspected adenomyosis',
  ],
);

// ─── Heavy Menstrual Bleeding ─────────────────────────────────────────────────

const conditionHeavyMenstrualBleeding = ConditionObject(
  meta: ContentMeta(
    id: 'condition-heavy-menstrual-bleeding',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['heavy bleeding', 'menorrhagia', 'HMB', 'anemia', 'quality of life'],
    sourceRefs: [
      'ACOG — Heavy Menstrual Bleeding',
      'NICE NG88 — Heavy Menstrual Bleeding',
      'Office on Women\'s Health',
    ],
    safetyFlags: [
      'Soaking through a pad or tampon every hour for more than 2 hours — seek same-day care.',
      'Dizziness, fainting, or shortness of breath with heavy bleeding — seek emergency care.',
    ],
  ),
  title: 'Heavy Menstrual Bleeding',
  summary:
      'Menstrual blood loss that is heavy enough to interfere with quality of life. '
      'Affects approximately 1 in 5 people who menstruate and is a leading cause of iron deficiency anemia.',
  overview:
      'Heavy menstrual bleeding (HMB) is defined not by a specific volume but by its impact on quality of life — '
      'whether it limits activity, causes embarrassment, requires frequent product changes, or results in anemia. '
      'Causes include: structural (fibroids, polyps, adenomyosis), hormonal (PCOS, thyroid disorders), '
      'coagulopathy (von Willebrand disease — a bleeding disorder — affects up to 20% of those with HMB), '
      'and idiopathic (no identified cause).',
  commonSymptomIds: ['symptom-heavy-bleeding', 'symptom-fatigue', 'symptom-cramps'],
  howItDiffers:
      'Not all heavy periods have the same cause, and the treatment varies accordingly. '
      'Heavy bleeding with fibroids differs from HMB caused by a coagulopathy or thyroid disorder. '
      'This is why evaluation — not just symptom management — matters.',
  diagnosticReality:
      'Evaluation for HMB typically includes blood tests (CBC, thyroid, coagulation screen including von Willebrand factor), '
      'pelvic ultrasound, and sometimes endometrial biopsy. '
      'Von Willebrand disease is frequently underdiagnosed in people with HMB — it is worth asking about.',
  carePathways: [
    'Hormonal management: hormonal IUD (highly effective), combined contraceptives, progestogens, tranexamic acid',
    'Non-hormonal: tranexamic acid, NSAIDs',
    'Surgical: endometrial ablation, myomectomy (for fibroids), hysterectomy in refractory cases',
    'Treating the underlying cause where identified',
    'Iron supplementation for associated anemia',
  ],
  selfAdvocacyNotes: [
    'Track pad/tampon usage, clot size, and how many days of heavy flow.',
    'Say clearly: "My bleeding impacts my quality of life and I want it properly evaluated."',
    'Ask about von Willebrand disease testing if heavy bleeding has been present since your first period.',
    'Anemia is a complication worth testing for with HMB.',
  ],
  emotionalImpact:
      'Living with heavy periods is exhausting, logistically demanding, and often socially limiting. '
      'Many people manage for years before being taken seriously. This is not acceptable — HMB is treatable.',
  lessonIds: ['lesson-heavy-bleeding-basics'],
  escalationPoints: [
    'Soaking through protection every hour for 2 or more hours',
    'Dizziness, fainting, or pallor from blood loss',
    'Clots larger than a quarter',
    'Severe anemia symptoms',
    'HMB that has not been medically evaluated',
  ],
);

// ─── Irregular Periods ────────────────────────────────────────────────────────

const conditionIrregularPeriods = ConditionObject(
  meta: ContentMeta(
    id: 'condition-irregular-periods',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['irregular periods', 'oligomenorrhea', 'cycle variation', 'PCOS', 'thyroid'],
    sourceRefs: ['Office on Women\'s Health — Period Problems', 'ACOG'],
    safetyFlags: [],
  ),
  title: 'Irregular Periods',
  summary:
      'Cycles that fall outside the 21–35 day range, vary significantly in length, or are unpredictable. '
      'May reflect underlying hormonal, thyroid, or other conditions.',
  overview:
      'While some natural variation in cycle length is normal, consistently irregular cycles may indicate '
      'hormonal imbalance (including PCOS), thyroid disorders, hyperprolactinemia, perimenopause, '
      'significant weight change, excessive exercise, chronic stress, or other conditions. '
      'Regular cycles are considered a vital sign of reproductive health — irregularity deserves attention.',
  commonSymptomIds: ['symptom-irregular-bleeding'],
  howItDiffers:
      'Irregular periods are a symptom of multiple possible conditions, not a condition itself. '
      'PCOS is one of the most common causes of irregular periods. '
      'Irregular periods in adolescence in the first few years after menarche are often normal as the cycle establishes.',
  diagnosticReality:
      'Evaluation typically includes blood tests (hormones, thyroid, prolactin), a pelvic ultrasound, '
      'and a thorough history. Tracking cycle dates and patterns is essential context for evaluation.',
  carePathways: [
    'Depends on the underlying cause',
    'For PCOS: lifestyle approaches, hormonal management, insulin-sensitizing medications if appropriate',
    'For thyroid issues: treating the thyroid condition',
    'For stress or lifestyle factors: addressing root causes',
  ],
  selfAdvocacyNotes: [
    'Bring at least 3–6 months of tracked cycle dates to a medical appointment.',
    'Note when irregularity started and any associated changes.',
    'Ask about what testing will be done to identify a cause.',
  ],
  emotionalImpact:
      'Irregular periods create uncertainty and can be distressing, particularly for those trying to conceive '
      'or manage their cycle-related symptoms.',
  lessonIds: ['lesson-how-to-track-your-cycle', 'lesson-ovulation-basics'],
  escalationPoints: [
    'Cycles consistently outside 21–35 days',
    'Periods that have stopped (see amenorrhea)',
    'Irregular cycles with other symptoms like excess hair growth, acne, or weight changes (may suggest PCOS)',
    'Trying to conceive with irregular cycles — seek fertility evaluation sooner',
  ],
);

// ─── Amenorrhea ───────────────────────────────────────────────────────────────

const conditionAmenorrhea = ConditionObject(
  meta: ContentMeta(
    id: 'condition-amenorrhea',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['amenorrhea', 'missing periods', 'hypothalamic', 'PCOS', 'thyroid'],
    sourceRefs: ['ACOG', 'Office on Women\'s Health'],
    safetyFlags: [
      'Absence of periods for 3 or more months (when not pregnant) warrants medical evaluation.',
      'Amenorrhea can indicate bone density loss over time if estrogen is deficient — seek care.',
    ],
  ),
  title: 'Amenorrhea',
  summary:
      'The absence of menstrual periods. Primary amenorrhea means periods have never started; '
      'secondary amenorrhea means periods have stopped for 3 or more months in someone who previously had them.',
  overview:
      'Secondary amenorrhea has many possible causes: pregnancy (always rule this out first), '
      'hypothalamic amenorrhea (from extreme stress, low body weight, or excessive exercise), '
      'PCOS, thyroid disorders, hyperprolactinemia, premature ovarian insufficiency, and others. '
      'Estrogen deficiency associated with some forms of amenorrhea can affect bone health over time.',
  commonSymptomIds: [],
  howItDiffers:
      'Amenorrhea differs from irregular periods (cycles still occur, but unpredictably). '
      'It is distinct from the normal absence of periods during pregnancy, postpartum (especially while breastfeeding), '
      'or perimenopause/menopause.',
  diagnosticReality:
      'Evaluation includes pregnancy test, hormone panel (FSH, LH, estrogen, prolactin, thyroid), '
      'and assessment of lifestyle factors. Imaging may be needed depending on findings.',
  carePathways: [
    'Treat the underlying cause',
    'For hypothalamic amenorrhea: restore energy balance, address exercise or stress patterns',
    'Estrogen support may be indicated if deficiency is confirmed',
  ],
  selfAdvocacyNotes: [
    'Missing periods for 3 months deserves medical evaluation, not watchful waiting alone.',
    'Track when periods stopped and any associated changes.',
  ],
  emotionalImpact:
      'Missing periods can create anxiety, uncertainty about health and fertility, and — in some contexts — '
      'feelings of loss. The cause matters greatly for the emotional and physical path forward.',
  lessonIds: ['lesson-what-is-the-menstrual-cycle'],
  escalationPoints: [
    'No period for 3 or more months (when not pregnant)',
    'Symptoms of estrogen deficiency: hot flashes, vaginal dryness, mood changes',
    'Concern about fertility',
  ],
);

// ─── Fibroids ─────────────────────────────────────────────────────────────────

const conditionFibroids = ConditionObject(
  meta: ContentMeta(
    id: 'condition-fibroids',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['fibroids', 'uterine fibroids', 'leiomyoma', 'heavy bleeding', 'pelvic pressure'],
    sourceRefs: ['ACOG — Uterine Fibroids', 'Office on Women\'s Health'],
    safetyFlags: [
      'Rapidly enlarging fibroids or severe pain warrants prompt evaluation.',
    ],
  ),
  title: 'Fibroids',
  summary:
      'Non-cancerous growths in or on the uterus. Extremely common — affecting up to 70–80% of people with a uterus by age 50. '
      'Many are asymptomatic; others cause heavy bleeding, pain, or pressure symptoms.',
  overview:
      'Uterine fibroids (leiomyomas) are benign smooth muscle tumors of the uterus. '
      'They range from microscopic to very large, and their location (submucosal, intramural, subserosal) '
      'strongly influences whether and what symptoms they cause. '
      'Submucosal fibroids (inside the uterine cavity) are most likely to cause heavy bleeding. '
      'Fibroids are significantly more common and often more severe in Black women.',
  commonSymptomIds: [
    'symptom-heavy-bleeding',
    'symptom-pelvic-pain',
    'symptom-cramps',
    'symptom-bloating',
    'symptom-back-pain',
  ],
  howItDiffers:
      'Fibroids are structural growths, distinct from adenomyosis (endometrium within the muscle) '
      'and endometriosis (endometrial-like tissue outside the uterus). '
      'They can co-occur with these conditions.',
  diagnosticReality:
      'Fibroids are typically diagnosed by pelvic ultrasound. Saline infusion sonography or MRI may be used '
      'to better characterize their number, size, and location.',
  carePathways: [
    'Watchful waiting if asymptomatic',
    'Hormonal management to reduce bleeding',
    'Uterine fibroid embolization (UFE)',
    'Myomectomy (fibroid removal, uterus preserved)',
    'Hysterectomy for severe cases where fertility is not desired',
    'Newer approaches: MRI-guided focused ultrasound, Oriahnn (approved hormonal treatment)',
  ],
  selfAdvocacyNotes: [
    'Ask about fibroid location and type — the treatment options differ.',
    'If fertility is important to you, make this clear — treatment choices vary.',
    'Track bleeding severity and symptom impact to quantify quality of life for your provider.',
  ],
  emotionalImpact:
      'The burden of fibroids — particularly for those who bleed heavily — can be exhausting and life-limiting. '
      'Racial disparities in fibroid diagnosis and treatment are well-documented and worth being aware of.',
  lessonIds: ['lesson-heavy-bleeding-basics'],
  escalationPoints: [
    'Severe or rapidly increasing blood loss',
    'Pressure symptoms (urinary frequency, constipation) worsening',
    'Fertility concerns',
    'Significant quality-of-life impact from any fibroid-related symptom',
  ],
);

// ─── PCOS ─────────────────────────────────────────────────────────────────────

const conditionPcos = ConditionObject(
  meta: ContentMeta(
    id: 'condition-pcos',
    type: 'condition',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['PCOS', 'polycystic ovarian syndrome', 'irregular periods', 'androgen', 'fertility'],
    sourceRefs: ['ACOG — PCOS', 'Office on Women\'s Health', 'NICHD — PCOS'],
    safetyFlags: [
      'PCOS is associated with increased risk of endometrial cancer with prolonged unopposed estrogen — seek care for irregular periods.',
    ],
  ),
  title: 'PCOS',
  summary:
      'Polycystic Ovary Syndrome. A hormonal condition affecting ovulation, androgens, and often metabolism. '
      'One of the most common causes of irregular periods and difficulty conceiving.',
  overview:
      'PCOS affects an estimated 8–13% of people with ovaries. It is characterized by at least two of three features: '
      'irregular ovulation or lack of ovulation, excess androgen (elevated testosterone or clinical signs like acne and excess hair), '
      'and polycystic ovarian morphology on ultrasound. '
      'Despite the name, cysts are not required for diagnosis. PCOS is associated with insulin resistance, '
      'which influences its broader metabolic effects. It is also a leading cause of ovulatory infertility.',
  commonSymptomIds: [
    'symptom-irregular-bleeding',
    'symptom-fatigue',
    'symptom-brain-fog',
  ],
  howItDiffers:
      'PCOS is distinct from other causes of irregular periods. The combination of androgen excess '
      '(acne, excess facial/body hair, male-pattern hair thinning), irregular cycles, and often insulin resistance '
      'points specifically to PCOS rather than, say, thyroid disease or hypothalamic amenorrhea.',
  diagnosticReality:
      'Diagnosis uses Rotterdam criteria (at least 2 of 3 features). Blood tests (androgens, insulin, glucose, thyroid) '
      'and pelvic ultrasound are typically part of evaluation. PCOS is both underdiagnosed and misunderstood.',
  carePathways: [
    'Lifestyle approaches: diet, exercise — particularly beneficial for insulin-resistant PCOS',
    'Hormonal contraceptives to regulate cycles and manage androgen symptoms',
    'Metformin for insulin resistance',
    'Ovulation induction for those trying to conceive',
    'Management of long-term metabolic health',
  ],
  selfAdvocacyNotes: [
    'Ask to have androgen levels, fasting glucose, and insulin checked alongside imaging.',
    'PCOS management is long-term — ask about both immediate symptoms and long-term health monitoring.',
    'If trying to conceive, ask for a referral to a reproductive endocrinologist.',
  ],
  emotionalImpact:
      'PCOS affects body image, fertility hopes, and energy in significant ways. '
      'Many people with PCOS feel dismissed or given oversimplified advice ("just lose weight"). '
      'The psychological impact — particularly for those struggling with fertility — is real and deserves support.',
  lessonIds: ['lesson-ovulation-basics', 'lesson-fertility-awareness-basics'],
  escalationPoints: [
    'Trying to conceive without success after 6–12 months',
    'Irregular periods not being managed (risk of endometrial hyperplasia with prolonged anovulation)',
    'Significant metabolic symptoms (weight gain, blood sugar irregularities)',
  ],
);
