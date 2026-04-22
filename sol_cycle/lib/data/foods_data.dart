import 'content_types.dart';

const List<FoodObject> allFoods = [
  foodGinger,
  foodMagnesiumRichFoods,
  foodIronSupportMeals,
  foodMineralBroth,
  foodHydrationSupport,
  foodWarmingMeals,
  foodDigestiveSoothingFoods,
  foodProteinStableBreakfast,
  foodFiberSupportBasics,
];

FoodObject? foodById(String id) {
  try {
    return allFoods.firstWhere((f) => f.meta.id == id);
  } catch (_) {
    return null;
  }
}

// ─── Ginger ───────────────────────────────────────────────────────────────────

const foodGinger = FoodObject(
  meta: ContentMeta(
    id: 'food-ginger',
    type: 'food',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['ginger', 'nausea', 'anti-inflammatory', 'digestive', 'warming', 'cramps'],
    sourceRefs: ['Traditional use; some clinical research supports ginger for dysmenorrhea and nausea'],
    safetyFlags: ['High-dose ginger supplements may interact with blood-thinning medications — discuss with a provider.'],
    pregnancyFlags: ['Ginger tea in moderate amounts is generally considered safe in pregnancy for nausea. Avoid high-dose supplements without provider guidance.'],
  ),
  title: 'Ginger',
  summary:
      'A warming root with traditional use for nausea, cramping, and digestive discomfort. '
      'Some research supports its use for menstrual pain and morning sickness.',
  whySupportive:
      'Ginger contains compounds (gingerols and shogaols) with anti-inflammatory properties that may help reduce '
      'prostaglandin activity — the same mechanism targeted by NSAIDs for period pain. '
      'It has a long history of use for nausea and digestive discomfort. '
      'Some small studies suggest ginger may reduce menstrual pain, though the evidence base is limited.',
  whoItMayHelp: 'People with cramping, nausea, bloating, or digestive sluggishness around their cycle.',
  preparationSimplicity: 'easy',
  symptomIds: ['symptom-nausea', 'symptom-cramps', 'symptom-bloating', 'symptom-back-pain'],
  phaseIds: ['phase-menstrual'],
  conditionIds: ['condition-dysmenorrhea'],
  importantCautions: [
    'Moderate food-form amounts (fresh ginger, ginger tea) are generally safe.',
    'High-dose supplements may not be appropriate for everyone — discuss with a provider before using therapeutically.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Fresh ginger steeped in hot water as tea (thin slices of fresh ginger root + honey if desired)',
    'Ginger tea bags',
    'Fresh ginger in stir-fries, soups, or warm broths',
    'Crystallized ginger as a small snack for nausea',
    'Ginger in smoothies or warm golden milk',
  ],
);

// ─── Magnesium-Rich Foods ─────────────────────────────────────────────────────

const foodMagnesiumRichFoods = FoodObject(
  meta: ContentMeta(
    id: 'food-magnesium-rich-foods',
    type: 'food',
    evidenceLabel: EvidenceLabel.internalSynthesis,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['magnesium', 'PMS', 'cramps', 'sleep', 'luteal', 'mood'],
    sourceRefs: [
      'Some research suggests magnesium may reduce PMS symptoms and menstrual pain',
      'Office on Women\'s Health — PMS',
    ],
    safetyFlags: [],
    pregnancyFlags: ['Magnesium is important in pregnancy; food sources are always safe. Discuss supplements with your provider.'],
  ),
  title: 'Magnesium-Rich Foods',
  summary:
      'Foods high in magnesium — a mineral linked to muscle relaxation, mood support, and reduced PMS symptoms. '
      'Particularly relevant in the luteal phase.',
  whySupportive:
      'Magnesium plays a role in muscle relaxation (including the uterus), nervous system regulation, and serotonin synthesis. '
      'Some research suggests that people with PMS tend to have lower magnesium levels, '
      'and that increasing dietary or supplemental magnesium may reduce bloating, mood symptoms, and cramps. '
      'Evidence is moderate but the safety profile of food-form magnesium is excellent.',
  whoItMayHelp: 'People with PMS, PMDD, cramping, insomnia, or irritability — particularly in the luteal phase.',
  preparationSimplicity: 'easy',
  symptomIds: ['symptom-cramps', 'symptom-irritability', 'symptom-insomnia', 'symptom-bloating', 'symptom-headache'],
  phaseIds: ['phase-luteal', 'phase-menstrual'],
  conditionIds: ['condition-pms', 'condition-pmdd', 'condition-dysmenorrhea'],
  importantCautions: [
    'Food-form magnesium is safe. Supplements should be discussed with a provider, particularly in pregnancy.',
    'Magnesium supplements in high doses can cause GI effects (loose stools).',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Dark chocolate (70%+ cocoa) — one of the highest food sources',
    'Pumpkin seeds (pepitas)',
    'Dark leafy greens: spinach, Swiss chard',
    'Almonds and cashews',
    'Black beans and lentils',
    'Avocado',
    'Banana',
    'Whole grains: brown rice, oats, quinoa',
  ],
);

// ─── Iron-Support Meals ───────────────────────────────────────────────────────

const foodIronSupportMeals = FoodObject(
  meta: ContentMeta(
    id: 'food-iron-support-meals',
    type: 'food',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['iron', 'anemia', 'menstrual', 'heavy bleeding', 'fatigue'],
    sourceRefs: ['ACOG — Heavy Menstrual Bleeding', 'Office on Women\'s Health', 'WHO — Iron Deficiency Anemia'],
    safetyFlags: ['Suspected iron deficiency anemia should be confirmed by blood test — food alone may not be sufficient treatment.'],
    pregnancyFlags: ['Iron needs increase significantly in pregnancy. Prenatal vitamins and dietary iron are both important — discuss with your provider.'],
  ),
  title: 'Iron-Support Meals',
  summary:
      'Foods that provide or enhance iron absorption — especially important during and after heavy menstrual bleeding, '
      'or for anyone at risk of iron deficiency anemia.',
  whySupportive:
      'Menstrual bleeding — particularly heavy bleeding — results in iron loss. '
      'Iron is essential for oxygen transport in red blood cells. Low iron leads to fatigue, brain fog, pallor, and shortness of breath. '
      'Heme iron (from animal sources) is most bioavailable. Non-heme iron (from plant sources) is enhanced by vitamin C '
      'and inhibited by calcium and tannins (tea, coffee). Both food choices and pairing matter.',
  whoItMayHelp: 'People with heavy periods, fatigue during menstruation, or confirmed or suspected iron deficiency.',
  preparationSimplicity: 'moderate',
  symptomIds: ['symptom-fatigue', 'symptom-heavy-bleeding', 'symptom-brain-fog'],
  phaseIds: ['phase-menstrual'],
  conditionIds: ['condition-heavy-menstrual-bleeding', 'condition-adenomyosis', 'condition-fibroids'],
  importantCautions: [
    'Suspected iron deficiency anemia should be confirmed with blood tests.',
    'Iron supplements can cause constipation — discuss type and dose with a provider.',
    'Do not take iron supplements with calcium or coffee/tea — it reduces absorption.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Red meat (beef, lamb) — high heme iron',
    'Chicken and turkey (dark meat)',
    'Canned or fresh sardines and salmon',
    'Lentils and chickpeas — pair with vitamin C for better absorption',
    'Tofu',
    'Spinach and dark leafy greens — cook lightly to reduce oxalates',
    'Fortified cereals',
    'Pumpkin seeds',
    'Add vitamin C alongside plant iron: citrus, bell peppers, tomatoes, strawberries',
  ],
);

// ─── Mineral Broth ────────────────────────────────────────────────────────────

const foodMineralBroth = FoodObject(
  meta: ContentMeta(
    id: 'food-mineral-broth',
    type: 'food',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['broth', 'minerals', 'warmth', 'nourishment', 'menstrual', 'fatigue'],
    sourceRefs: ['Traditional nourishment practices across many cultures'],
    safetyFlags: [],
    pregnancyFlags: ['Broth is nourishing and safe in pregnancy.'],
  ),
  title: 'Mineral Broth',
  summary:
      'A warming, easily digestible liquid nourishment — traditionally used for recovery, fatigue, and digestive gentleness.',
  whySupportive:
      'Mineral broth — made from vegetables, bones (optional), and aromatics — provides minerals and warmth in an '
      'easily absorbed form. When appetite is low, digestion is sluggish, or the body is depleted from bleeding, '
      'liquid nourishment offers something substantial without demanding much of the gut. '
      'This is traditional "sick food" across many cultures, adapted for menstrual recovery.',
  whoItMayHelp: 'People with low appetite, nausea, fatigue, or digestive discomfort during menstruation.',
  preparationSimplicity: 'moderate',
  symptomIds: ['symptom-fatigue', 'symptom-nausea', 'symptom-heavy-bleeding'],
  phaseIds: ['phase-menstrual'],
  conditionIds: ['condition-heavy-menstrual-bleeding'],
  importantCautions: [
    'Bone broths are high in sodium — mindful if you have blood pressure concerns.',
    'Commercial broths vary in quality — homemade or low-sodium varieties are preferable.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Homemade vegetable broth: onion, carrot, celery, garlic, parsley, peppercorns, simmered 1–2 hours',
    'Bone broth (chicken, beef) — simmered 4–12 hours',
    'Miso soup (fermented — gentle on digestion)',
    'Simple vegetable or chicken soup',
    'A cup of broth on its own as a warm drink',
  ],
);

// ─── Hydration Support ────────────────────────────────────────────────────────

const foodHydrationSupport = FoodObject(
  meta: ContentMeta(
    id: 'food-hydration-support',
    type: 'food',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['hydration', 'water', 'headache', 'fatigue', 'bloating', 'any phase'],
    sourceRefs: ['Standard hydration guidelines; dehydration and symptom amplification'],
    safetyFlags: [],
    pregnancyFlags: ['Adequate hydration is especially important in pregnancy — aim for 8–10 glasses of water per day.'],
  ),
  title: 'Hydration Support',
  summary:
      'Adequate fluid intake through water and hydrating foods — foundational support for reducing headaches, fatigue, and bloating across the cycle.',
  whySupportive:
      'Dehydration amplifies headache, fatigue, bloating, and cognitive impairment — all symptoms already common '
      'in the luteal and menstrual phases. Adequate hydration supports circulation, digestion, and kidney function. '
      'Counterintuitively, adequate water intake can also reduce fluid retention.',
  whoItMayHelp: 'Everyone — but particularly those with headaches, bloating, or fatigue.',
  preparationSimplicity: 'easy',
  symptomIds: ['symptom-headache', 'symptom-bloating', 'symptom-fatigue', 'symptom-brain-fog'],
  phaseIds: ['phase-menstrual', 'phase-luteal', 'phase-follicular', 'phase-ovulatory'],
  conditionIds: [],
  importantCautions: [
    'Excessive water intake (hyponatremia) is rare but possible with extreme overhydration — more common in endurance athletes.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Plain water — 6–8 glasses per day as a baseline',
    'Herbal teas (non-caffeinated): peppermint, ginger, chamomile, raspberry leaf',
    'Water-rich foods: cucumber, celery, watermelon, citrus fruits, berries',
    'Coconut water for electrolytes on heavy flow days',
    'Warm water with lemon in the morning',
  ],
);

// ─── Warming Meals ────────────────────────────────────────────────────────────

const foodWarmingMeals = FoodObject(
  meta: ContentMeta(
    id: 'food-warming-meals',
    type: 'food',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['warming', 'cooked', 'TCM', 'menstrual', 'digestion', 'nourishment'],
    sourceRefs: ['TCM dietary principles; traditional food cultures across cold/damp conditions'],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  title: 'Warming Meals',
  summary:
      'Cooked, warm foods that support digestion and comfort during the menstrual phase — grounded in TCM tradition '
      'and practical digestive ease.',
  whySupportive:
      'Traditional Chinese Medicine and many traditional food cultures emphasize warm, cooked foods during '
      'menstruation — when the body is physically working hard and digestion may be more sensitive. '
      'Warm cooked foods are generally easier to digest than raw and cold foods, and warmth may help ease muscle tension. '
      'This is offered as a traditional food principle, not a clinical prescription.',
  whoItMayHelp: 'People with digestive sensitivity, cramping, fatigue, or a preference for warmth during their period.',
  preparationSimplicity: 'moderate',
  symptomIds: ['symptom-cramps', 'symptom-nausea', 'symptom-bloating', 'symptom-fatigue'],
  phaseIds: ['phase-menstrual', 'phase-luteal'],
  conditionIds: ['condition-dysmenorrhea'],
  importantCautions: [
    'This is a traditional dietary principle — not a substitute for treating underlying conditions.',
    'Warm foods are appropriate for many people but not a universal requirement.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Soups and stews: chicken and vegetable, lentil, miso',
    'Congee (rice porridge) — easy to digest and comforting',
    'Roasted vegetables with warming spices: cumin, cinnamon, ginger, turmeric',
    'Oatmeal with warming additions: cinnamon, banana, nut butter',
    'Slow-cooked grains: brown rice, quinoa, barley',
    'Warming drinks: herbal teas, golden milk (turmeric + warm milk)',
  ],
);

// ─── Digestive Soothing Foods ─────────────────────────────────────────────────

const foodDigestiveSoothingFoods = FoodObject(
  meta: ContentMeta(
    id: 'food-digestive-soothing-foods',
    type: 'food',
    evidenceLabel: EvidenceLabel.traditionalPractice,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['digestion', 'IBS', 'bloating', 'nausea', 'gentle', 'menstrual'],
    sourceRefs: ['Traditional digestive care; some foods have evidence for digestive support'],
    safetyFlags: [],
    pregnancyFlags: ['Digestive discomfort is common in pregnancy — these gentle foods are appropriate.'],
  ),
  title: 'Digestive Soothing Foods',
  summary:
      'Gentle, easy-to-digest foods that reduce bloating, nausea, and GI discomfort — particularly useful '
      'around menstruation when prostaglandins affect the gut.',
  whySupportive:
      'Prostaglandins produced during menstruation can cause GI effects including nausea, diarrhea, and bloating. '
      'Gentle, easily digestible foods place less demand on a gut that may already be reactive. '
      'Some foods have specific traditional support for digestive ease.',
  whoItMayHelp: 'People with nausea, bloating, loose stools, or GI discomfort around their period.',
  preparationSimplicity: 'easy',
  symptomIds: ['symptom-nausea', 'symptom-bloating', 'symptom-cramps'],
  phaseIds: ['phase-menstrual'],
  conditionIds: ['condition-dysmenorrhea', 'condition-endometriosis'],
  importantCautions: [
    'Avoid foods that you personally know trigger GI symptoms.',
    'Severe GI symptoms with periods may warrant evaluation for endometriosis or IBS.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Ginger tea — nausea support',
    'Peppermint tea — bloating and cramp support',
    'Fennel tea — traditional carminative (gas-relieving)',
    'Plain rice or congee — easy on the gut',
    'Banana — gentle and potassium-rich',
    'Toast with almond butter — simple, settles the stomach',
    'Clear soups and broths',
    'Cooked rather than raw vegetables',
  ],
);

// ─── Protein-Stable Breakfast ─────────────────────────────────────────────────

const foodProteinStableBreakfast = FoodObject(
  meta: ContentMeta(
    id: 'food-protein-stable-breakfast',
    type: 'food',
    evidenceLabel: EvidenceLabel.internalSynthesis,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['protein', 'blood sugar', 'breakfast', 'energy', 'brain fog', 'luteal'],
    sourceRefs: ['Blood sugar stability and mood/energy research; nutritional principles'],
    safetyFlags: [],
    pregnancyFlags: ['Adequate protein is important in pregnancy — these breakfasts are appropriate.'],
  ),
  title: 'Protein-Stable Breakfast',
  summary:
      'A morning meal anchored in protein to support stable blood sugar, sustained energy, and reduced mood vulnerability — '
      'particularly useful in the luteal phase.',
  whySupportive:
      'Blood sugar instability — which follows high-sugar, low-protein breakfasts — amplifies fatigue, irritability, '
      'brain fog, and mood swings. In the luteal phase, when serotonin sensitivity is already lower, '
      'blood sugar variability can make mood symptoms worse. Protein slows carbohydrate absorption and supports '
      'steadier energy throughout the morning.',
  whoItMayHelp: 'People who notice that skipping breakfast or eating sugary breakfasts worsens luteal-phase symptoms.',
  preparationSimplicity: 'easy',
  symptomIds: ['symptom-fatigue', 'symptom-irritability', 'symptom-brain-fog', 'symptom-low-mood'],
  phaseIds: ['phase-luteal', 'phase-menstrual'],
  conditionIds: ['condition-pms', 'condition-pmdd'],
  importantCautions: [
    'This is a supportive dietary principle, not a medical treatment.',
    'Individual nutritional needs vary — what helps one person may not help another.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Eggs — scrambled, boiled, or poached — with wholegrain toast',
    'Greek yogurt with nuts and low-sugar fruit',
    'Oatmeal with protein: nut butter, seeds, or a boiled egg alongside',
    'Smoothie with protein: spinach, banana, protein powder or Greek yogurt, nut butter',
    'Cottage cheese with fruit',
    'Smoked salmon on wholegrain crackers',
    'Tofu scramble with vegetables',
  ],
);

// ─── Fiber Support Basics ─────────────────────────────────────────────────────

const foodFiberSupportBasics = FoodObject(
  meta: ContentMeta(
    id: 'food-fiber-support-basics',
    type: 'food',
    evidenceLabel: EvidenceLabel.clinicalGuideline,
    knowledgeLane: KnowledgeLane.clinical,
    tags: ['fiber', 'digestion', 'estrogen', 'constipation', 'hormonal balance'],
    sourceRefs: ['Dietary fiber and hormonal health research', 'Standard nutritional guidelines'],
    safetyFlags: [],
    pregnancyFlags: ['Adequate fiber and hydration are important in pregnancy, especially as constipation is common.'],
  ),
  title: 'Fiber Support Basics',
  summary:
      'Adequate dietary fiber supports healthy digestion and estrogen clearance — both relevant to cycle health.',
  whySupportive:
      'Fiber supports healthy bowel transit, which matters for estrogen metabolism — excess estrogen is excreted '
      'through the gut, and constipation can allow it to be reabsorbed. '
      'Fiber also supports gut microbiome health, blood sugar stability, and reduces bloating over time '
      '(though rapid fiber increases can temporarily worsen gas). '
      'Gradual increases in fiber alongside adequate water are key.',
  whoItMayHelp: 'People with constipation, bloating, or hormonal imbalance patterns.',
  preparationSimplicity: 'easy',
  symptomIds: ['symptom-bloating'],
  phaseIds: ['phase-follicular', 'phase-ovulatory', 'phase-luteal'],
  conditionIds: ['condition-pms', 'condition-pcos'],
  importantCautions: [
    'Increase fiber gradually — rapid increases can worsen gas and bloating.',
    'Adequate water intake is essential alongside increased fiber.',
    'Very high-fiber diets without adequate water can cause constipation.',
  ],
  pregnancySafe: true,
  exampleFoods: [
    'Legumes: lentils, chickpeas, black beans (high fiber, also iron-rich)',
    'Whole grains: oats, brown rice, quinoa, barley',
    'Vegetables: broccoli, Brussels sprouts, carrots, sweet potato (with skin)',
    'Fruits: berries, pears, apples (with skin), avocado',
    'Seeds: flaxseed (ground), chia seeds',
    'Nuts: almonds, walnuts',
  ],
);
