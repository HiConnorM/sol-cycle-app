import 'dart:convert';
import 'package:equatable/equatable.dart';

enum PredictionType {
  nextPeriod,
  phaseTransition,
  symptomWindow,
  energyWindow,
  moodWindow,
  sleepWindow,
  painWindow,
  supportSuggestion,
}

enum PredictionConfidence {
  insufficient, // < 2 cycles logged
  low,          // 2–3 cycles, high variability
  moderate,     // 3–5 cycles, moderate variability
  high,         // 6+ cycles, low variability
}

class PredictionSnapshot extends Equatable {
  final String id;
  final DateTime generatedAt;
  final PredictionType type;
  final DateTime? windowStart;
  final DateTime? windowEnd;
  final PredictionConfidence confidence;
  final String confidenceReason;
  final int basedOnCyclesCount;
  final int basedOnLogsCount;
  // Short label shown in UI, e.g. "Period likely this week"
  final String label;
  // Full user-facing phrasing in app voice
  final String phrasing;
  // IDs of content objects to surface alongside this prediction
  final List<String> recommendedContentIds;
  final bool anomalyFlag;
  final String? anomalyNote;

  const PredictionSnapshot({
    required this.id,
    required this.generatedAt,
    required this.type,
    required this.confidence,
    required this.confidenceReason,
    required this.basedOnCyclesCount,
    required this.basedOnLogsCount,
    required this.label,
    required this.phrasing,
    this.windowStart,
    this.windowEnd,
    this.recommendedContentIds = const [],
    this.anomalyFlag = false,
    this.anomalyNote,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'generatedAt': generatedAt.toIso8601String(),
    'type': type.name,
    'windowStart': windowStart?.toIso8601String(),
    'windowEnd': windowEnd?.toIso8601String(),
    'confidence': confidence.name,
    'confidenceReason': confidenceReason,
    'basedOnCyclesCount': basedOnCyclesCount,
    'basedOnLogsCount': basedOnLogsCount,
    'label': label,
    'phrasing': phrasing,
    'recommendedContentIds': recommendedContentIds,
    'anomalyFlag': anomalyFlag,
    'anomalyNote': anomalyNote,
  };

  factory PredictionSnapshot.fromJson(Map<String, dynamic> json) =>
      PredictionSnapshot(
        id: json['id'] as String,
        generatedAt: DateTime.parse(json['generatedAt'] as String),
        type: PredictionType.values.byName(json['type'] as String),
        windowStart: json['windowStart'] != null
            ? DateTime.parse(json['windowStart'] as String)
            : null,
        windowEnd: json['windowEnd'] != null
            ? DateTime.parse(json['windowEnd'] as String)
            : null,
        confidence:
            PredictionConfidence.values.byName(json['confidence'] as String),
        confidenceReason: json['confidenceReason'] as String,
        basedOnCyclesCount: json['basedOnCyclesCount'] as int,
        basedOnLogsCount: json['basedOnLogsCount'] as int,
        label: json['label'] as String,
        phrasing: json['phrasing'] as String,
        recommendedContentIds:
            List<String>.from(json['recommendedContentIds'] ?? []),
        anomalyFlag: json['anomalyFlag'] as bool? ?? false,
        anomalyNote: json['anomalyNote'] as String?,
      );

  String toJsonString() => jsonEncode(toJson());

  @override
  List<Object?> get props => [
    id, generatedAt, type, windowStart, windowEnd, confidence,
    confidenceReason, basedOnCyclesCount, basedOnLogsCount,
    label, phrasing, recommendedContentIds, anomalyFlag, anomalyNote,
  ];
}
