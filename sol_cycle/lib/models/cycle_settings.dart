import 'dart:convert';
import 'package:equatable/equatable.dart';

class CycleSettings extends Equatable {
  final int averageCycleLength;
  final int averagePeriodLength;
  final String? lastPeriodStart;
  final bool trackingEnabled;
  final bool pmddMode;
  final bool endoMode;
  final bool ttcMode;
  final bool pregnancyMode;
  final bool postpartumMode;
  final String calendarSystem;
  final String name;
  // grounded | balanced | spiritual
  final String tonePreference;
  final bool journalInExports;
  final bool medsAffectRecommendations;

  const CycleSettings({
    this.averageCycleLength = 28,
    this.averagePeriodLength = 5,
    this.lastPeriodStart,
    this.trackingEnabled = true,
    this.pmddMode = false,
    this.endoMode = false,
    this.ttcMode = false,
    this.pregnancyMode = false,
    this.postpartumMode = false,
    this.calendarSystem = 'gregorian',
    this.name = '',
    this.tonePreference = 'balanced',
    this.journalInExports = false,
    this.medsAffectRecommendations = true,
  });

  CycleSettings copyWith({
    int? averageCycleLength,
    int? averagePeriodLength,
    String? lastPeriodStart,
    bool? trackingEnabled,
    bool? pmddMode,
    bool? endoMode,
    bool? ttcMode,
    bool? pregnancyMode,
    bool? postpartumMode,
    String? calendarSystem,
    String? name,
    String? tonePreference,
    bool? journalInExports,
    bool? medsAffectRecommendations,
  }) {
    return CycleSettings(
      averageCycleLength: averageCycleLength ?? this.averageCycleLength,
      averagePeriodLength: averagePeriodLength ?? this.averagePeriodLength,
      lastPeriodStart: lastPeriodStart ?? this.lastPeriodStart,
      trackingEnabled: trackingEnabled ?? this.trackingEnabled,
      pmddMode: pmddMode ?? this.pmddMode,
      endoMode: endoMode ?? this.endoMode,
      ttcMode: ttcMode ?? this.ttcMode,
      pregnancyMode: pregnancyMode ?? this.pregnancyMode,
      postpartumMode: postpartumMode ?? this.postpartumMode,
      calendarSystem: calendarSystem ?? this.calendarSystem,
      name: name ?? this.name,
      tonePreference: tonePreference ?? this.tonePreference,
      journalInExports: journalInExports ?? this.journalInExports,
      medsAffectRecommendations:
          medsAffectRecommendations ?? this.medsAffectRecommendations,
    );
  }

  Map<String, dynamic> toJson() => {
    'averageCycleLength': averageCycleLength,
    'averagePeriodLength': averagePeriodLength,
    'lastPeriodStart': lastPeriodStart,
    'trackingEnabled': trackingEnabled,
    'pmddMode': pmddMode,
    'endoMode': endoMode,
    'ttcMode': ttcMode,
    'pregnancyMode': pregnancyMode,
    'postpartumMode': postpartumMode,
    'calendarSystem': calendarSystem,
    'name': name,
    'tonePreference': tonePreference,
    'journalInExports': journalInExports,
    'medsAffectRecommendations': medsAffectRecommendations,
  };

  factory CycleSettings.fromJson(Map<String, dynamic> json) => CycleSettings(
    averageCycleLength: json['averageCycleLength'] as int? ?? 28,
    averagePeriodLength: json['averagePeriodLength'] as int? ?? 5,
    lastPeriodStart: json['lastPeriodStart'] as String?,
    trackingEnabled: json['trackingEnabled'] as bool? ?? true,
    pmddMode: json['pmddMode'] as bool? ?? false,
    endoMode: json['endoMode'] as bool? ?? false,
    ttcMode: json['ttcMode'] as bool? ?? false,
    pregnancyMode: json['pregnancyMode'] as bool? ?? false,
    postpartumMode: json['postpartumMode'] as bool? ?? false,
    calendarSystem: json['calendarSystem'] as String? ?? 'gregorian',
    name: json['name'] as String? ?? '',
    tonePreference: json['tonePreference'] as String? ?? 'balanced',
    journalInExports: json['journalInExports'] as bool? ?? false,
    medsAffectRecommendations:
        json['medsAffectRecommendations'] as bool? ?? true,
  );

  String toJsonString() => jsonEncode(toJson());

  factory CycleSettings.fromJsonString(String jsonString) =>
      CycleSettings.fromJson(jsonDecode(jsonString) as Map<String, dynamic>);

  bool get hasActiveMode =>
      pmddMode || endoMode || ttcMode || pregnancyMode || postpartumMode;

  @override
  List<Object?> get props => [
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart,
    trackingEnabled,
    pmddMode,
    endoMode,
    ttcMode,
    pregnancyMode,
    postpartumMode,
    calendarSystem,
    name,
    tonePreference,
    journalInExports,
    medsAffectRecommendations,
  ];
}
