import 'dart:convert';
import 'package:equatable/equatable.dart';

class CycleLog extends Equatable {
  final String date;
  final String flow;
  final List<String> physicalSymptoms;
  final List<String> emotionalSymptoms;
  final List<String> pmddSymptoms;
  final List<String> moods;
  final int painLevel;
  final List<String> painLocations;
  final List<String> painTypes;
  final int energy;
  final int sleep;
  // 0–10 scale; 0 = not logged
  final int sleepQuality;
  final List<String> medications;
  final List<String> supplements;
  final List<String> meals;
  // Self-care actions taken (maps to care_code IDs)
  final List<String> careActions;
  final String notes;
  final String? journalEntry;
  // ISO 8601 timestamp of when the entry was created
  final String? loggedAt;

  const CycleLog({
    required this.date,
    this.flow = 'none',
    this.physicalSymptoms = const [],
    this.emotionalSymptoms = const [],
    this.pmddSymptoms = const [],
    this.moods = const [],
    this.painLevel = 0,
    this.painLocations = const [],
    this.painTypes = const [],
    this.energy = 5,
    this.sleep = 0,
    this.sleepQuality = 0,
    this.medications = const [],
    this.supplements = const [],
    this.meals = const [],
    this.careActions = const [],
    this.notes = '',
    this.journalEntry,
    this.loggedAt,
  });

  CycleLog copyWith({
    String? date,
    String? flow,
    List<String>? physicalSymptoms,
    List<String>? emotionalSymptoms,
    List<String>? pmddSymptoms,
    List<String>? moods,
    int? painLevel,
    List<String>? painLocations,
    List<String>? painTypes,
    int? energy,
    int? sleep,
    int? sleepQuality,
    List<String>? medications,
    List<String>? supplements,
    List<String>? meals,
    List<String>? careActions,
    String? notes,
    String? journalEntry,
    String? loggedAt,
  }) {
    return CycleLog(
      date: date ?? this.date,
      flow: flow ?? this.flow,
      physicalSymptoms: physicalSymptoms ?? this.physicalSymptoms,
      emotionalSymptoms: emotionalSymptoms ?? this.emotionalSymptoms,
      pmddSymptoms: pmddSymptoms ?? this.pmddSymptoms,
      moods: moods ?? this.moods,
      painLevel: painLevel ?? this.painLevel,
      painLocations: painLocations ?? this.painLocations,
      painTypes: painTypes ?? this.painTypes,
      energy: energy ?? this.energy,
      sleep: sleep ?? this.sleep,
      sleepQuality: sleepQuality ?? this.sleepQuality,
      medications: medications ?? this.medications,
      supplements: supplements ?? this.supplements,
      meals: meals ?? this.meals,
      careActions: careActions ?? this.careActions,
      notes: notes ?? this.notes,
      journalEntry: journalEntry ?? this.journalEntry,
      loggedAt: loggedAt ?? this.loggedAt,
    );
  }

  Map<String, dynamic> toJson() => {
    'date': date,
    'flow': flow,
    'physicalSymptoms': physicalSymptoms,
    'emotionalSymptoms': emotionalSymptoms,
    'pmddSymptoms': pmddSymptoms,
    'moods': moods,
    'painLevel': painLevel,
    'painLocations': painLocations,
    'painTypes': painTypes,
    'energy': energy,
    'sleep': sleep,
    'sleepQuality': sleepQuality,
    'medications': medications,
    'supplements': supplements,
    'meals': meals,
    'careActions': careActions,
    'notes': notes,
    'journalEntry': journalEntry,
    'loggedAt': loggedAt,
  };

  factory CycleLog.fromJson(Map<String, dynamic> json) => CycleLog(
    date: json['date'] as String,
    flow: json['flow'] as String? ?? 'none',
    physicalSymptoms: List<String>.from(json['physicalSymptoms'] ?? []),
    emotionalSymptoms: List<String>.from(json['emotionalSymptoms'] ?? []),
    pmddSymptoms: List<String>.from(json['pmddSymptoms'] ?? []),
    moods: List<String>.from(json['moods'] ?? []),
    painLevel: json['painLevel'] as int? ?? 0,
    painLocations: List<String>.from(json['painLocations'] ?? []),
    painTypes: List<String>.from(json['painTypes'] ?? []),
    energy: json['energy'] as int? ?? 5,
    sleep: json['sleep'] as int? ?? 0,
    sleepQuality: json['sleepQuality'] as int? ?? 0,
    medications: List<String>.from(json['medications'] ?? []),
    supplements: List<String>.from(json['supplements'] ?? []),
    meals: List<String>.from(json['meals'] ?? []),
    careActions: List<String>.from(json['careActions'] ?? []),
    notes: json['notes'] as String? ?? '',
    journalEntry: json['journalEntry'] as String?,
    loggedAt: json['loggedAt'] as String?,
  );

  String toJsonString() => jsonEncode(toJson());

  factory CycleLog.fromJsonString(String jsonString) =>
      CycleLog.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);

  bool get hasAnyData =>
      flow != 'none' ||
      physicalSymptoms.isNotEmpty ||
      emotionalSymptoms.isNotEmpty ||
      moods.isNotEmpty ||
      painLevel > 0 ||
      notes.isNotEmpty;

  bool get hasBleeding => flow != 'none' && flow != 'spotting';

  List<String> get allSymptoms => [
    ...physicalSymptoms,
    ...emotionalSymptoms,
    ...pmddSymptoms,
  ];

  @override
  List<Object?> get props => [
    date, flow, physicalSymptoms, emotionalSymptoms, pmddSymptoms,
    moods, painLevel, painLocations, painTypes, energy, sleep, sleepQuality,
    medications, supplements, meals, careActions, notes, journalEntry, loggedAt,
  ];
}
