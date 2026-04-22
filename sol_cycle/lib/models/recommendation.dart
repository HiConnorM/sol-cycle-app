import 'package:equatable/equatable.dart';

enum RecommendationType {
  safety,       // Safety module — always renders first if present
  education,    // Condition/symptom explainer
  ritual,       // Self-care ritual
  food,         // Food/nourishment suggestion
  lesson,       // Educational lesson
  prompt,       // Journaling or reflection prompt
  escalation,   // Care-seeking guidance
}

class Recommendation extends Equatable {
  final String id;
  final RecommendationType type;
  // References a content object ID (e.g. 'ritual-warm-compress')
  final String contentId;
  final String title;
  final String summary;
  // Personalized phrasing in the user's selected tone
  final String phrasing;
  // Why this was surfaced (internal reasoning, not shown to user)
  final String reason;
  // Lower number = higher priority; safety items use 0–9
  final int priority;
  final bool safetyOverride;
  final String? phaseAlignment;
  final List<String> conditionRelevant;
  final bool pregnancySafe;
  final bool ttcSafe;

  const Recommendation({
    required this.id,
    required this.type,
    required this.contentId,
    required this.title,
    required this.summary,
    required this.phrasing,
    required this.reason,
    required this.priority,
    this.safetyOverride = false,
    this.phaseAlignment,
    this.conditionRelevant = const [],
    this.pregnancySafe = true,
    this.ttcSafe = true,
  });

  @override
  List<Object?> get props => [id, contentId, type, priority];
}

class RecommendationSet extends Equatable {
  final DateTime generatedAt;
  final String currentPhase;
  final bool inPmddWindow;
  final List<Recommendation> items;

  const RecommendationSet({
    required this.generatedAt,
    required this.currentPhase,
    required this.inPmddWindow,
    required this.items,
  });

  List<Recommendation> get safetyItems =>
      items.where((r) => r.type == RecommendationType.safety || r.safetyOverride).toList();

  List<Recommendation> get supportItems =>
      items.where((r) => r.type != RecommendationType.safety && !r.safetyOverride).toList();

  bool get hasSafetyContent => safetyItems.isNotEmpty;

  @override
  List<Object?> get props => [generatedAt, currentPhase, items];
}
