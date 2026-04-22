/// SOL Cycle canonical content object type system.
///
/// All content objects share a common metadata shape.
/// Each subtype adds domain-specific fields.
/// Evidence labels and knowledge lanes keep clinical from symbolic.
library;

// ─── Evidence labels ──────────────────────────────────────────────────────────

abstract class EvidenceLabel {
  static const clinicalGuideline = 'clinical-guideline';
  static const governmentHealth = 'government-health';
  static const peerReviewedReview = 'peer-reviewed-review';
  static const expertOrg = 'expert-org';
  static const traditionalPractice = 'traditional-practice';
  static const symbolicSpiritual = 'symbolic-spiritual';
  static const communityLivedExperience = 'community-lived-experience';
  static const internalSynthesis = 'internal-synthesis';
}

// ─── Knowledge lanes ─────────────────────────────────────────────────────────

abstract class KnowledgeLane {
  static const clinical = 'A-clinical';
  static const holistic = 'B-holistic';
  static const community = 'C-community';
}

// ─── Shared metadata ─────────────────────────────────────────────────────────

class ContentMeta {
  final String id;
  final String type;
  final String evidenceLabel;
  final String knowledgeLane;
  final List<String> tags;
  final List<String> sourceRefs;
  final List<String> safetyFlags;
  final List<String> pregnancyFlags;
  final String status;

  const ContentMeta({
    required this.id,
    required this.type,
    required this.evidenceLabel,
    required this.knowledgeLane,
    this.tags = const [],
    this.sourceRefs = const [],
    this.safetyFlags = const [],
    this.pregnancyFlags = const [],
    this.status = 'approved',
  });
}

// ─── Phase object ─────────────────────────────────────────────────────────────

class PhaseObject {
  final ContentMeta meta;
  final String title;
  final String archetype;
  final String summary;
  final String bodyDescription;
  final String emotionalLandscape;
  final String supportFocus;
  final String groundedDescription;
  final String balancedDescription;
  final String spiritualDescription;
  final List<int> typicalDayRange;
  final String dominantHormones;
  final List<String> commonSymptomIds;
  final List<String> ritualIds;
  final List<String> foodIds;
  final List<String> lessonIds;
  final String colorKey;

  const PhaseObject({
    required this.meta,
    required this.title,
    required this.archetype,
    required this.summary,
    required this.bodyDescription,
    required this.emotionalLandscape,
    required this.supportFocus,
    required this.groundedDescription,
    required this.balancedDescription,
    required this.spiritualDescription,
    required this.typicalDayRange,
    required this.dominantHormones,
    required this.commonSymptomIds,
    required this.ritualIds,
    required this.foodIds,
    required this.lessonIds,
    required this.colorKey,
  });
}

// ─── Symptom object ───────────────────────────────────────────────────────────

class SymptomObject {
  final ContentMeta meta;
  final String title;
  final String summary;
  final String whatItIs;
  final String whatItMayFeelLike;
  final List<String> cyclePhaseIds;
  final List<String> relatedConditionIds;
  final List<String> commonMisconceptions;
  final List<String> gentleSupports;
  final String whenToSeekCare;
  final List<String> ritualIds;
  final List<String> foodIds;
  final List<String> lessonIds;
  final String? pregnancyCaution;

  const SymptomObject({
    required this.meta,
    required this.title,
    required this.summary,
    required this.whatItIs,
    required this.whatItMayFeelLike,
    required this.cyclePhaseIds,
    required this.relatedConditionIds,
    required this.commonMisconceptions,
    required this.gentleSupports,
    required this.whenToSeekCare,
    required this.ritualIds,
    required this.foodIds,
    required this.lessonIds,
    this.pregnancyCaution,
  });
}

// ─── Condition object ─────────────────────────────────────────────────────────

class ConditionObject {
  final ContentMeta meta;
  final String title;
  final String summary;
  final String overview;
  final List<String> commonSymptomIds;
  final String howItDiffers;
  final String diagnosticReality;
  final List<String> carePathways;
  final List<String> selfAdvocacyNotes;
  final String emotionalImpact;
  final List<String> lessonIds;
  final List<String> escalationPoints;

  const ConditionObject({
    required this.meta,
    required this.title,
    required this.summary,
    required this.overview,
    required this.commonSymptomIds,
    required this.howItDiffers,
    required this.diagnosticReality,
    required this.carePathways,
    required this.selfAdvocacyNotes,
    required this.emotionalImpact,
    required this.lessonIds,
    required this.escalationPoints,
  });
}

// ─── Ritual object ────────────────────────────────────────────────────────────

class RitualObject {
  final ContentMeta meta;
  final String title;
  final String summary;
  final String whatItIs;
  final String whoItMayHelp;
  final String whenUseful;
  final String? whenToAvoid;
  final String duration;
  // low | medium | high
  final String energyRequired;
  final List<String> phaseIds;
  final String? symbolicResonance;
  final List<String> symptomIds;
  final String? pregnancyCaution;
  final List<String> steps;

  const RitualObject({
    required this.meta,
    required this.title,
    required this.summary,
    required this.whatItIs,
    required this.whoItMayHelp,
    required this.whenUseful,
    required this.duration,
    required this.energyRequired,
    required this.phaseIds,
    required this.symptomIds,
    required this.steps,
    this.whenToAvoid,
    this.symbolicResonance,
    this.pregnancyCaution,
  });
}

// ─── Food object ──────────────────────────────────────────────────────────────

class FoodObject {
  final ContentMeta meta;
  final String title;
  final String summary;
  final String whySupportive;
  final String whoItMayHelp;
  // easy | moderate
  final String preparationSimplicity;
  final List<String> symptomIds;
  final List<String> phaseIds;
  final List<String> conditionIds;
  final List<String> importantCautions;
  final bool pregnancySafe;
  final List<String> exampleFoods;

  const FoodObject({
    required this.meta,
    required this.title,
    required this.summary,
    required this.whySupportive,
    required this.whoItMayHelp,
    required this.preparationSimplicity,
    required this.symptomIds,
    required this.phaseIds,
    required this.conditionIds,
    required this.importantCautions,
    required this.pregnancySafe,
    required this.exampleFoods,
  });
}

// ─── Lesson section ───────────────────────────────────────────────────────────

class LessonSection {
  final String heading;
  final String body;

  const LessonSection({required this.heading, required this.body});
}

// ─── Lesson object ────────────────────────────────────────────────────────────

class LessonObject {
  final ContentMeta meta;
  final String title;
  final String summary;
  final int readingTimeMinutes;
  // beginner | intermediate
  final String difficulty;
  final List<LessonSection> sections;
  final String whenToSeekCare;
  final List<String> symptomIds;
  final List<String> conditionIds;
  final List<String> phaseIds;
  final List<String> relatedLessonIds;

  const LessonObject({
    required this.meta,
    required this.title,
    required this.summary,
    required this.readingTimeMinutes,
    required this.difficulty,
    required this.sections,
    required this.whenToSeekCare,
    required this.symptomIds,
    required this.conditionIds,
    required this.phaseIds,
    required this.relatedLessonIds,
  });
}

// ─── Month object ─────────────────────────────────────────────────────────────

class MonthObject {
  final ContentMeta meta;
  final int number;
  final String title;
  final String subtitle;
  final List<String> symbolicQualities;
  final String seasonality;
  final List<String> colorPaletteKeys;
  final List<String> emotionalThemes;
  final List<String> bodyThemes;
  final List<String> reflectiveThemes;
  final List<String> ritualThemes;
  final String? relatedPhaseId;
  final List<String> journalPrompts;

  const MonthObject({
    required this.meta,
    required this.number,
    required this.title,
    required this.subtitle,
    required this.symbolicQualities,
    required this.seasonality,
    required this.colorPaletteKeys,
    required this.emotionalThemes,
    required this.bodyThemes,
    required this.reflectiveThemes,
    required this.ritualThemes,
    required this.journalPrompts,
    this.relatedPhaseId,
  });
}
