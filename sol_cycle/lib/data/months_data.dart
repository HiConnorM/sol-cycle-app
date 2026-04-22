/// SOL Cycle — 13 symbolic month objects.
///
/// Months are not calendar months. They are symbolic containers that wrap
/// around the clinical support system — each one a lens through which the
/// user can explore their cycle across roughly a lunar month (~28 days).
/// Month 13 is the liminal threshold month: the half-month that makes 13
/// fit a solar year of 365 days (13 × 28 = 364).
///
/// Evidence label: symbolic-spiritual throughout.
/// These are NOT clinical objects. They carry no medical claims.
library;

import 'content_types.dart';

// ─── Month 01: Seed Moon ──────────────────────────────────────────────────────

const monthSeed = MonthObject(
  meta: ContentMeta(
    id: 'month-01',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'menstrual', 'rest', 'beginning', 'potential'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 1,
  title: 'Seed Moon',
  subtitle: 'The quiet beginning of everything',
  symbolicQualities: [
    'potential',
    'stillness',
    'latency',
    'deep knowing',
    'fertile ground before the bloom',
  ],
  seasonality: 'Deep winter — the earth holds its breath',
  colorPaletteKeys: ['crimson-deep', 'near-black', 'warm-earth'],
  emotionalThemes: [
    'Surrendering the need to perform or produce',
    'Making peace with being in-between',
    'Allowing grief or release without explanation',
    'Finding dignity in doing nothing',
  ],
  bodyThemes: [
    'The body is in its most inward-turning state',
    'Blood flow as release, not loss',
    'Warmth and heaviness as messengers, not enemies',
    'Rest as biological intelligence, not laziness',
  ],
  reflectiveThemes: [
    'What am I ready to release from the last cycle?',
    'What has been waiting in me, unseen?',
    'Where have I been performing strength when I needed softness?',
  ],
  ritualThemes: [
    'Warmth rituals — heat packs, warm baths, warm drinks',
    'Lying down with intention — not sleep, but chosen stillness',
    'Dimming external noise: no harsh light, no urgent tasks',
  ],
  journalPrompts: [
    'What arrived in me this month that I did not invite?',
    'If this blood had a message, what would it say?',
    'What does rest feel like in my body right now — not what I think it should feel like, what it actually feels like?',
    'What is so quiet inside me it can only speak here?',
  ],
  relatedPhaseId: 'phase-menstrual',
);

// ─── Month 02: Thaw Moon ──────────────────────────────────────────────────────

const monthThaw = MonthObject(
  meta: ContentMeta(
    id: 'month-02',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'follicular', 'emergence', 'curiosity', 'renewal'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 2,
  title: 'Thaw Moon',
  subtitle: 'The first stirring after stillness',
  symbolicQualities: [
    'emergence',
    'curiosity',
    'tentative hope',
    'the courage of a green shoot',
    'openness without urgency',
  ],
  seasonality: 'Late winter into early spring — ground softening, light lengthening',
  colorPaletteKeys: ['pale-sage', 'soft-yellow', 'blush-dawn'],
  emotionalThemes: [
    'Noticing what feels newly interesting',
    'Curiosity without the pressure of conclusions',
    'Recovering the sense that something is possible',
    'Gentleness with the self that is just waking up',
  ],
  bodyThemes: [
    'Rising energy as a slow tide, not a switch',
    'The body beginning to gather its resources',
    'Appetite returning — for food, for ideas, for connection',
    'Light feeling in the chest after heaviness',
  ],
  reflectiveThemes: [
    'What is beginning to stir in me after the quiet?',
    'What am I newly curious about, without knowing why?',
    'What does hope feel like in my body this month — even small, even tentative?',
  ],
  ritualThemes: [
    'Morning light rituals — sitting near a window, short outdoor walks',
    'Beginning something small: a sketch, a first sentence, a seed planted',
    'Nourishing the body with foods that feel like renewal',
  ],
  journalPrompts: [
    'What is emerging in me that I am almost afraid to name?',
    'Where in my body does hope live right now?',
    'What would I begin if I knew it was allowed to be imperfect?',
    'What is the thaw asking of me this month?',
  ],
  relatedPhaseId: 'phase-follicular',
);

// ─── Month 03: Bloom Moon ─────────────────────────────────────────────────────

const monthBloom = MonthObject(
  meta: ContentMeta(
    id: 'month-03',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'ovulatory', 'expansion', 'expression', 'visibility'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 3,
  title: 'Bloom Moon',
  subtitle: 'The fullness of opening',
  symbolicQualities: [
    'radiance',
    'expression',
    'magnetism',
    'generosity of presence',
    'the fullness before the turn',
  ],
  seasonality: 'Full spring — everything open, everything reaching toward light',
  colorPaletteKeys: ['warm-gold', 'soft-coral', 'bright-green'],
  emotionalThemes: [
    'Feeling seen, or wanting to be',
    'The pleasure of connection and collaboration',
    'Confidence that doesn\'t need to explain itself',
    'Generosity — with ideas, with time, with self',
  ],
  bodyThemes: [
    'Peak energy and physical ease',
    'The body as an open channel rather than a container',
    'Voice feeling fuller, more willing',
    'Sensuality and aliveness in ordinary moments',
  ],
  reflectiveThemes: [
    'What am I ready to offer the world this month?',
    'Where does my body feel most alive?',
    'What creative or relational act is calling me outward?',
  ],
  ritualThemes: [
    'Creation rituals — making, building, expressing',
    'Moving the body joyfully: dancing, hiking, free movement',
    'Reaching toward connection: gatherings, honest conversations, collaboration',
  ],
  journalPrompts: [
    'What am I in full bloom around right now?',
    'What does it feel like to be seen — and do I let myself be?',
    'What would I create this month if I were not afraid of it mattering?',
    'Where in my life am I most generously myself?',
  ],
  relatedPhaseId: 'phase-ovulatory',
);

// ─── Month 04: Amber Moon ─────────────────────────────────────────────────────

const monthAmber = MonthObject(
  meta: ContentMeta(
    id: 'month-04',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'luteal', 'integration', 'discernment', 'turning inward'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 4,
  title: 'Amber Moon',
  subtitle: 'The wisdom of the turning light',
  symbolicQualities: [
    'discernment',
    'integration',
    'the beauty of slowing',
    'inner voice growing louder',
    'preservation of what matters',
  ],
  seasonality: 'Early autumn — the harvest begins, light angles differently',
  colorPaletteKeys: ['amber', 'rust', 'deep-ochre'],
  emotionalThemes: [
    'Noticing what is no longer working without shame',
    'The inner critic as a messenger, not an enemy',
    'Feelings arriving without invitation — and deserving a hearing',
    'Fatigue as information, not failure',
  ],
  bodyThemes: [
    'Heaviness in the body as signal to slow',
    'Sensitivity increasing — to noise, to demands, to one\'s own needs',
    'Appetite and cravings as the body asking for something real',
    'The nervous system lowering its tolerance for overwhelm',
  ],
  reflectiveThemes: [
    'What is my body telling me that I have been too busy to hear?',
    'What do I need to let go of before the next beginning?',
    'What has this cycle taught me — about my patterns, my needs, my truth?',
  ],
  ritualThemes: [
    'Decluttering rituals — space, schedule, relationships',
    'Slow cooking, warm meals, nourishment over efficiency',
    'Evening wind-down: dimmer light, earlier quiet, screen-free time',
  ],
  journalPrompts: [
    'What is asking to be released before the next moon begins?',
    'Where has my inner voice been loudest this month — and what has it said?',
    'What have I been carrying that was never mine to carry?',
    'What single truth do I want to remember from this cycle?',
  ],
  relatedPhaseId: 'phase-luteal',
);

// ─── Month 05: River Moon ─────────────────────────────────────────────────────

const monthRiver = MonthObject(
  meta: ContentMeta(
    id: 'month-05',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'flow', 'emotion', 'release', 'movement'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 5,
  title: 'River Moon',
  subtitle: 'Letting the current carry what it will',
  symbolicQualities: [
    'fluidity',
    'emotional honesty',
    'the courage of release',
    'being moved without being swept away',
    'trust in direction even without a map',
  ],
  seasonality: 'The season of rain and melt — rivers running full',
  colorPaletteKeys: ['deep-blue', 'slate', 'soft-grey'],
  emotionalThemes: [
    'Allowing feelings to move through rather than accumulate',
    'The difference between being emotional and being overwhelmed',
    'Grief, longing, and tenderness as forms of intelligence',
    'Trusting that what is released is ready to go',
  ],
  bodyThemes: [
    'Water in the body — bloating, retention, shifts in weight as cyclical information',
    'Tears and crying as physiological release, not weakness',
    'Sensation of being in motion even when still',
    'The body as a living river, not a fixed object',
  ],
  reflectiveThemes: [
    'What feelings have been dammed up inside me?',
    'What am I afraid to let flow freely?',
    'Where in my life am I clinging to a bank when the current is calling me forward?',
  ],
  ritualThemes: [
    'Water rituals — baths, swimming, standing in rain if possible',
    'Crying with intention: letting it come without stopping it',
    'Writing or speaking the thing that has been held back',
  ],
  journalPrompts: [
    'What emotion has been moving beneath the surface this month?',
    'If I were a river right now, what would I be carrying?',
    'What am I ready to release into the current?',
    'What does it feel like to let myself be moved?',
  ],
  relatedPhaseId: null,
);

// ─── Month 06: Root Moon ──────────────────────────────────────────────────────

const monthRoot = MonthObject(
  meta: ContentMeta(
    id: 'month-06',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'grounding', 'stability', 'body', 'foundation'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 6,
  title: 'Root Moon',
  subtitle: 'The medicine of staying in the body',
  symbolicQualities: [
    'groundedness',
    'stability',
    'belonging to oneself',
    'the intelligence of the body itself',
    'returning after being scattered',
  ],
  seasonality: 'Midsummer or midwinter — the deep anchor of a season',
  colorPaletteKeys: ['earth-brown', 'forest-green', 'warm-terracotta'],
  emotionalThemes: [
    'Returning to the body after a period of being in the head',
    'The safety of one\'s own presence',
    'Steadiness as a felt experience, not a performance',
    'Belonging — to oneself, to the earth, to the present moment',
  ],
  bodyThemes: [
    'The pelvis, hips, and lower body as home base',
    'Feet on the ground as a somatic practice',
    'Breath as the most reliable anchor',
    'Hunger, thirst, and tiredness as honest guides',
  ],
  reflectiveThemes: [
    'When did I last feel truly at home in my body?',
    'What pulls me out of my body — and what brings me back?',
    'What does my body need more of that I have been deferring?',
  ],
  ritualThemes: [
    'Walking barefoot on natural ground',
    'Slow, grounding meals eaten without distraction',
    'Bodywork: massage, stretching, resting on the floor',
  ],
  journalPrompts: [
    'What does it feel like to be fully in my body right now?',
    'Where have I been scattered, and what would help me gather?',
    'What does my body know that my mind has been arguing with?',
    'What would I do differently if I trusted my body completely?',
  ],
  relatedPhaseId: 'phase-menstrual',
);

// ─── Month 07: Lantern Moon ───────────────────────────────────────────────────

const monthLantern = MonthObject(
  meta: ContentMeta(
    id: 'month-07',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'clarity', 'inner light', 'discernment', 'truth-telling'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 7,
  title: 'Lantern Moon',
  subtitle: 'Carrying your own light into dark places',
  symbolicQualities: [
    'inner clarity',
    'self-illumination',
    'courage to see clearly',
    'light that guides rather than blinds',
    'the warmth of honest seeing',
  ],
  seasonality: 'Autumn dusk — the moment lanterns are lit because daylight is not enough',
  colorPaletteKeys: ['warm-amber', 'candlelight-gold', 'deep-indigo'],
  emotionalThemes: [
    'The courage to look at what has been in shadow',
    'Clarity arriving as relief, not threat',
    'The difference between harsh scrutiny and honest seeing',
    'Trusting one\'s own perception even when it contradicts outside voices',
  ],
  bodyThemes: [
    'The eyes, vision, and what we choose to focus on',
    'Headaches and mental fatigue as signals of cognitive overload',
    'Rest for the visual and nervous system: darkness, candlelight, eye pillows',
    'The body as a truth-teller when words fail',
  ],
  reflectiveThemes: [
    'What am I finally ready to see clearly?',
    'Where have I been dimming my own perception to keep the peace?',
    'What truth is waiting for me in the places I have been avoiding?',
  ],
  ritualThemes: [
    'Candlelight rituals — journaling or reflecting by candlelight',
    'Darkness practices: sitting in low light, stargazing, morning darkness before screens',
    'Naming exercises: writing down the thing you have not said aloud',
  ],
  journalPrompts: [
    'What am I finally ready to admit to myself?',
    'Where in my life is my own lantern needed most right now?',
    'What would I do differently if I trusted what I already know?',
    'What shadow have I been carrying that could become a teacher?',
  ],
  relatedPhaseId: 'phase-luteal',
);

// ─── Month 08: Storm Moon ─────────────────────────────────────────────────────

const monthStorm = MonthObject(
  meta: ContentMeta(
    id: 'month-08',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'intensity', 'transformation', 'disruption', 'catharsis'],
    sourceRefs: [],
    safetyFlags: ['This month\'s themes of emotional intensity are symbolic. If you are experiencing severe mood episodes, suicidal thoughts, or crisis, please reach out to a mental health professional.'],
    pregnancyFlags: [],
  ),
  number: 8,
  title: 'Storm Moon',
  subtitle: 'The clearing that only intensity can bring',
  symbolicQualities: [
    'intensity',
    'catharsis',
    'disruption as precursor to clarity',
    'the power of what cannot be contained',
    'the calm that follows the storm',
  ],
  seasonality: 'The wild season — late autumn gales, spring thunderstorms',
  colorPaletteKeys: ['storm-grey', 'electric-violet', 'midnight-blue'],
  emotionalThemes: [
    'Intense feelings as messengers, not malfunctions',
    'The difference between a storm passing through and one that never leaves',
    'Anger, grief, or fear that has been suppressed finally moving',
    'Finding the eye of the storm — the still place inside the intensity',
  ],
  bodyThemes: [
    'The body under emotional intensity: heart rate, breath, tension',
    'Premenstrual storms as physiological events, not character flaws',
    'Using breath to stay anchored when feelings are large',
    'Rest after intensity as necessary recovery, not defeat',
  ],
  reflectiveThemes: [
    'What storm has been building in me — and what is it trying to clear?',
    'What would I understand about this intensity if I stopped fighting it?',
    'What needs to break open before something new can grow?',
  ],
  ritualThemes: [
    'Movement as emotional release: shaking, running, dancing hard',
    'Breath practices for intensity: extended exhale, breath holds',
    'Writing without editing — uncensored storm on the page',
  ],
  journalPrompts: [
    'What is moving through me with great force right now?',
    'What has been suppressed so long it is now a storm?',
    'What would I understand if I let this feeling move all the way through?',
    'After the storm — what has been cleared?',
  ],
  relatedPhaseId: 'phase-luteal',
);

// ─── Month 09: Honey Moon ─────────────────────────────────────────────────────

const monthHoney = MonthObject(
  meta: ContentMeta(
    id: 'month-09',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'pleasure', 'sweetness', 'nourishment', 'sensuality'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 9,
  title: 'Honey Moon',
  subtitle: 'Tasting the sweetness of your own life',
  symbolicQualities: [
    'pleasure',
    'nourishment',
    'sensuality',
    'slowness as luxury',
    'savoring without guilt',
  ],
  seasonality: 'Midsummer abundance — long evenings, warmth, ripeness',
  colorPaletteKeys: ['golden-honey', 'soft-peach', 'warm-cream'],
  emotionalThemes: [
    'Permission to enjoy — without earning it first',
    'Sensory pleasure as a spiritual practice',
    'Gratitude that arrives through the body, not the mind',
    'Rest and delight as equally valid forms of living',
  ],
  bodyThemes: [
    'Taste and smell as underused forms of presence',
    'The body\'s pleasure responses as health signals',
    'Eating slowly, with attention, as a care practice',
    'Skin, warmth, and touch as connective tissues of wellbeing',
  ],
  reflectiveThemes: [
    'Where have I been denying myself pleasure, and why?',
    'What does sweetness mean to my body right now?',
    'What small luxuries am I postponing until conditions are "right"?',
  ],
  ritualThemes: [
    'Slow meals: food chosen and eaten with genuine enjoyment',
    'Touch rituals: self-massage, warm oil, soft fabrics',
    'Beauty as nourishment — flowers, music, light, whatever moves you',
  ],
  journalPrompts: [
    'What brought genuine pleasure to my body this month?',
    'Where do I withhold sweetness from myself — and what story justifies that?',
    'What would it mean to live a life that tasted good?',
    'What is one small act of pleasure I can offer myself today without waiting?',
  ],
  relatedPhaseId: 'phase-ovulatory',
);

// ─── Month 10: Ember Moon ─────────────────────────────────────────────────────

const monthEmber = MonthObject(
  meta: ContentMeta(
    id: 'month-10',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'warmth', 'memory', 'long burn', 'perseverance'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 10,
  title: 'Ember Moon',
  subtitle: 'The long warmth beneath the surface',
  symbolicQualities: [
    'quiet perseverance',
    'sustained warmth',
    'the fire that outlasts the flame',
    'endurance without exhaustion',
    'memory of what matters',
  ],
  seasonality: 'Deep autumn — the fire is needed, the days are short',
  colorPaletteKeys: ['deep-ember', 'burnt-sienna', 'ash-grey'],
  emotionalThemes: [
    'Perseverance as a form of love, not stubbornness',
    'The warmth you carry into difficult seasons',
    'Memory as nourishment: what has sustained you before',
    'Quiet commitment that does not require an audience',
  ],
  bodyThemes: [
    'Warmth as medicine in the cold or heavy months',
    'Slow metabolism seasons: the body wanting more fuel, more rest',
    'Chronic symptoms as embers — the body\'s ongoing, quiet signal',
    'Tending, not fixing: what the body asks for when it is in a long burn',
  ],
  reflectiveThemes: [
    'What fire in me is burning long and slow, even when unseen?',
    'What sustains me through cycles that feel hard without relief?',
    'What have I been tending quietly that deserves to be acknowledged?',
  ],
  ritualThemes: [
    'Fire rituals: candles, hearth, bonfire, anything with warmth and light',
    'Long, slow cooking: the ember of nourishment',
    'Acknowledging your own consistency: a private gratitude for your staying power',
  ],
  journalPrompts: [
    'What is still burning in me even after months of difficulty?',
    'What quiet flame have I been tending without recognition?',
    'What has sustained me that I have not thanked?',
    'Where is my warmth most needed — in myself, or in my life?',
  ],
  relatedPhaseId: 'phase-luteal',
);

// ─── Month 11: Dark Moon ──────────────────────────────────────────────────────

const monthDark = MonthObject(
  meta: ContentMeta(
    id: 'month-11',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'liminal', 'void', 'deep rest', 'transformation'],
    sourceRefs: [],
    safetyFlags: ['The Dark Moon\'s themes of shadow and void are symbolic. If you are experiencing persistent hopelessness, emptiness, or thoughts of self-harm, please speak with a mental health professional. You deserve real support.'],
    pregnancyFlags: [],
  ),
  number: 11,
  title: 'Dark Moon',
  subtitle: 'The fertile void before the next beginning',
  symbolicQualities: [
    'the void as possibility',
    'deep unknowing',
    'the courage to rest in the dark',
    'the space between stories',
    'primal stillness',
  ],
  seasonality: 'The darkest night of the year — the longest dark',
  colorPaletteKeys: ['near-black', 'deep-indigo', 'starless-charcoal'],
  emotionalThemes: [
    'Being in the space between identities, roles, or seasons',
    'The discomfort of not yet knowing',
    'Death and ending as cyclical, not final',
    'The courage of not grasping for premature resolution',
  ],
  bodyThemes: [
    'The body in its most depleted or minimum state — and the wisdom there',
    'Sleep as portal: longer nights, deeper dreaming',
    'Fasting or simplicity as intentional emptying',
    'Darkness as necessary rest for the visual and nervous systems',
  ],
  reflectiveThemes: [
    'What am I in the dark about right now — and can I stay there a little longer?',
    'What is dying in me that needed to die?',
    'What might be born from this emptiness if I do not fill it too quickly?',
  ],
  ritualThemes: [
    'Darkness rituals: sitting in total darkness, sleeping with no light',
    'Silence practices: a period of intentional wordlessness',
    'Intentional emptying: clearing the schedule, the inbox, the to-do list',
  ],
  journalPrompts: [
    'What is in the dark in me right now that I have not named?',
    'What would become possible if I stopped filling every silence?',
    'What chapter of my story is ending — and am I allowing that?',
    'What does this darkness have to teach me about my own light?',
  ],
  relatedPhaseId: 'phase-menstrual',
);

// ─── Month 12: Dawn Moon ──────────────────────────────────────────────────────

const monthDawn = MonthObject(
  meta: ContentMeta(
    id: 'month-12',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'emergence', 'renewal', 'integration', 'new beginning'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 12,
  title: 'Dawn Moon',
  subtitle: 'The self that survives its own winters',
  symbolicQualities: [
    'renewal',
    'the earned return of light',
    'integration of everything survived',
    'the self that comes through',
    'gratitude for continuity',
  ],
  seasonality: 'The winter solstice turning — darkness at peak, light beginning its return',
  colorPaletteKeys: ['rose-dawn', 'pale-gold', 'warm-white'],
  emotionalThemes: [
    'Gratitude for surviving — not performing gratitude, real gratitude',
    'Recognizing growth that only hard seasons produce',
    'The sweetness of return: to oneself, to joy, to possibility',
    'Integration: becoming the person who lived through that',
  ],
  bodyThemes: [
    'The body after hardship: what has shifted, what has strengthened',
    'Recovery as non-linear — up and back and up again',
    'Noticing small signs of vitality: appetite, sleep, curiosity, lightness',
    'Celebrating what the body has carried and survived',
  ],
  reflectiveThemes: [
    'Who am I now, after everything this cycle has held?',
    'What have I learned about myself that I could not have learned any other way?',
    'What am I taking with me into the next cycle — and what am I choosing to leave?',
  ],
  ritualThemes: [
    'Completion rituals: burning, releasing, marking the end',
    'New-cycle intention setting — not resolutions, but an honest direction',
    'Celebrating survival: something small and real',
  ],
  journalPrompts: [
    'What has this year of cycles taught me about who I am?',
    'What am I most grateful for having survived, even if it was hard?',
    'What does the person I am now need that the person I was at Month 1 did not know to ask for?',
    'What is one truth I am carrying into the next year of moons?',
  ],
  relatedPhaseId: 'phase-follicular',
);

// ─── Month 13: Threshold Moon ─────────────────────────────────────────────────

const monthThreshold = MonthObject(
  meta: ContentMeta(
    id: 'month-13',
    type: 'month',
    evidenceLabel: EvidenceLabel.symbolicSpiritual,
    knowledgeLane: KnowledgeLane.holistic,
    tags: ['symbolic', 'liminal', 'integration', 'transition', 'the between'],
    sourceRefs: [],
    safetyFlags: [],
    pregnancyFlags: [],
  ),
  number: 13,
  title: 'Threshold Moon',
  subtitle: 'The door between who you were and who you are becoming',
  symbolicQualities: [
    'liminality',
    'the sacred between',
    'neither and both',
    'the pause that allows transformation',
    'standing in the doorway with no urgency to choose a side',
  ],
  seasonality: 'The edge of seasons — the week when you can\'t tell if it\'s still winter or already spring',
  colorPaletteKeys: ['dusk-lavender', 'twilight-grey', 'warm-silver'],
  emotionalThemes: [
    'Being between identities without rushing to choose a new one',
    'The discomfort and gift of not knowing what comes next',
    'Holding opposites: grief and hope, ending and beginning, knowing and mystery',
    'The self that can stand in the doorway — belonging to neither room fully',
  ],
  bodyThemes: [
    'The body in transition: shifting hormones, shifting seasons, shifting rhythms',
    'Neither fully in one phase nor another — and the strange intelligence of that',
    'Symptoms that don\'t fit neatly: the body in transition resists easy labels',
    'Rest at the threshold: not sleep, not action — just being between',
  ],
  reflectiveThemes: [
    'What doorway am I standing in right now — in my body, in my life?',
    'What am I neither done with nor ready to begin?',
    'What does it feel like to not know yet?',
  ],
  ritualThemes: [
    'Threshold rituals: standing in a doorway, walking to the edge of a boundary',
    'Writing what cannot yet be resolved — the honest, unfinished sentence',
    'Sitting with the discomfort of in-between without reaching for resolution',
  ],
  journalPrompts: [
    'What transition am I in the middle of — not done, not arrived?',
    'What am I both holding onto and beginning to release at the same time?',
    'What would it feel like to be fully at peace in the not-yet-knowing?',
    'What is the threshold teaching me that arrival never could?',
  ],
  relatedPhaseId: null,
);

// ─── Registry ─────────────────────────────────────────────────────────────────

const List<MonthObject> allMonths = [
  monthSeed,
  monthThaw,
  monthBloom,
  monthAmber,
  monthRiver,
  monthRoot,
  monthLantern,
  monthStorm,
  monthHoney,
  monthEmber,
  monthDark,
  monthDawn,
  monthThreshold,
];

MonthObject? monthByNumber(int number) {
  try {
    return allMonths.firstWhere((m) => m.number == number);
  } catch (_) {
    return null;
  }
}

MonthObject? monthById(String id) {
  try {
    return allMonths.firstWhere((m) => m.meta.id == id);
  } catch (_) {
    return null;
  }
}
