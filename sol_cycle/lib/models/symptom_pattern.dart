import 'dart:convert';
import 'package:equatable/equatable.dart';

/// Derived summary of a single completed cycle.
class CycleSummary extends Equatable {
  final String id;
  final DateTime bleedStart;
  final DateTime? bleedEnd;
  final int? cycleLength;
  final int? periodLength;
  // day relative to bleed start → list of symptom codes logged that day
  final Map<int, List<String>> symptomsByRelativeDay;
  final Map<int, int> painByRelativeDay;
  final Map<int, int> energyByRelativeDay;
  final Map<int, int> sleepByRelativeDay;

  const CycleSummary({
    required this.id,
    required this.bleedStart,
    this.bleedEnd,
    this.cycleLength,
    this.periodLength,
    this.symptomsByRelativeDay = const {},
    this.painByRelativeDay = const {},
    this.energyByRelativeDay = const {},
    this.sleepByRelativeDay = const {},
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'bleedStart': bleedStart.toIso8601String(),
    'bleedEnd': bleedEnd?.toIso8601String(),
    'cycleLength': cycleLength,
    'periodLength': periodLength,
    'symptomsByRelativeDay': symptomsByRelativeDay
        .map((k, v) => MapEntry(k.toString(), v)),
    'painByRelativeDay':
        painByRelativeDay.map((k, v) => MapEntry(k.toString(), v)),
    'energyByRelativeDay':
        energyByRelativeDay.map((k, v) => MapEntry(k.toString(), v)),
    'sleepByRelativeDay':
        sleepByRelativeDay.map((k, v) => MapEntry(k.toString(), v)),
  };

  factory CycleSummary.fromJson(Map<String, dynamic> json) => CycleSummary(
    id: json['id'] as String,
    bleedStart: DateTime.parse(json['bleedStart'] as String),
    bleedEnd: json['bleedEnd'] != null
        ? DateTime.parse(json['bleedEnd'] as String)
        : null,
    cycleLength: json['cycleLength'] as int?,
    periodLength: json['periodLength'] as int?,
    symptomsByRelativeDay: (json['symptomsByRelativeDay'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(int.parse(k), List<String>.from(v as List))),
    painByRelativeDay: (json['painByRelativeDay'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(int.parse(k), v as int)),
    energyByRelativeDay: (json['energyByRelativeDay'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(int.parse(k), v as int)),
    sleepByRelativeDay: (json['sleepByRelativeDay'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(int.parse(k), v as int)),
  );

  @override
  List<Object?> get props => [id, bleedStart, bleedEnd, cycleLength, periodLength];
}

/// Aggregated patterns across multiple cycles.
class SymptomPattern extends Equatable {
  final DateTime generatedAt;
  final int cycleCount;
  final int logCount;
  final double avgCycleLength;
  // Standard deviation of cycle lengths
  final double cycleVariability;
  // relative day (negative = before bleed) → symptom code → frequency 0.0–1.0
  final Map<int, Map<String, double>> symptomFrequencyByRelativeDay;
  // phase → list of top symptoms (by frequency)
  final Map<String, List<String>> topSymptomsByPhase;
  final Map<String, double> avgEnergyByPhase;
  final Map<String, double> avgSleepByPhase;
  final Map<String, double> avgPainByPhase;
  // care action code → avg log energy on days that action was taken
  final Map<String, double> careActionEnergyCorrelation;
  // relative days with highest average pain (e.g. [-2, -1, 0, 1])
  final List<int> highPainRelativeDays;
  // relative days with highest mood symptom frequency
  final List<int> highMoodSymptomRelativeDays;

  const SymptomPattern({
    required this.generatedAt,
    required this.cycleCount,
    required this.logCount,
    required this.avgCycleLength,
    required this.cycleVariability,
    this.symptomFrequencyByRelativeDay = const {},
    this.topSymptomsByPhase = const {},
    this.avgEnergyByPhase = const {},
    this.avgSleepByPhase = const {},
    this.avgPainByPhase = const {},
    this.careActionEnergyCorrelation = const {},
    this.highPainRelativeDays = const [],
    this.highMoodSymptomRelativeDays = const [],
  });

  Map<String, dynamic> toJson() => {
    'generatedAt': generatedAt.toIso8601String(),
    'cycleCount': cycleCount,
    'logCount': logCount,
    'avgCycleLength': avgCycleLength,
    'cycleVariability': cycleVariability,
    'symptomFrequencyByRelativeDay': symptomFrequencyByRelativeDay
        .map((k, v) => MapEntry(k.toString(), v)),
    'topSymptomsByPhase': topSymptomsByPhase,
    'avgEnergyByPhase': avgEnergyByPhase,
    'avgSleepByPhase': avgSleepByPhase,
    'avgPainByPhase': avgPainByPhase,
    'careActionEnergyCorrelation': careActionEnergyCorrelation,
    'highPainRelativeDays': highPainRelativeDays,
    'highMoodSymptomRelativeDays': highMoodSymptomRelativeDays,
  };

  factory SymptomPattern.fromJson(Map<String, dynamic> json) => SymptomPattern(
    generatedAt: DateTime.parse(json['generatedAt'] as String),
    cycleCount: json['cycleCount'] as int,
    logCount: json['logCount'] as int,
    avgCycleLength: (json['avgCycleLength'] as num).toDouble(),
    cycleVariability: (json['cycleVariability'] as num).toDouble(),
    symptomFrequencyByRelativeDay: (json['symptomFrequencyByRelativeDay'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(int.parse(k),
            (v as Map<String, dynamic>).map((sk, sv) => MapEntry(sk, (sv as num).toDouble())))),
    topSymptomsByPhase: (json['topSymptomsByPhase'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, List<String>.from(v as List))),
    avgEnergyByPhase: (json['avgEnergyByPhase'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num).toDouble())),
    avgSleepByPhase: (json['avgSleepByPhase'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num).toDouble())),
    avgPainByPhase: (json['avgPainByPhase'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num).toDouble())),
    careActionEnergyCorrelation: (json['careActionEnergyCorrelation'] as Map<String, dynamic>? ?? {})
        .map((k, v) => MapEntry(k, (v as num).toDouble())),
    highPainRelativeDays: List<int>.from(json['highPainRelativeDays'] ?? []),
    highMoodSymptomRelativeDays:
        List<int>.from(json['highMoodSymptomRelativeDays'] ?? []),
  );

  String toJsonString() => jsonEncode(toJson());

  factory SymptomPattern.fromJsonString(String s) =>
      SymptomPattern.fromJson(jsonDecode(s) as Map<String, dynamic>);

  @override
  List<Object?> get props => [generatedAt, cycleCount, logCount];
}
