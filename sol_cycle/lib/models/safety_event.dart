import 'dart:convert';
import 'package:equatable/equatable.dart';

enum SafeTriggerType {
  suicidalThought,
  severeDepression,
  pmddCrisis,
  heavyBleedingWithDistress,
  fainting,
  severePain,
  pregnancyConcern,
  rapidlyWorseningSymptoms,
}

enum SafeTriggerLevel {
  /// Gentle acknowledgment + resources available
  watch,
  /// Safety module shown prominently; self-care content demoted
  caution,
  /// Safety module first; crisis resources required; casual guidance suppressed
  urgent,
}

class SafetyEvent extends Equatable {
  final String id;
  final DateTime triggeredAt;
  final String logDate;
  final SafeTriggerType triggerType;
  final SafeTriggerLevel triggerLevel;
  // IDs of safety/resource content shown
  final List<String> resourcesShown;
  final bool acknowledged;
  final DateTime? acknowledgedAt;
  final bool dismissed;

  const SafetyEvent({
    required this.id,
    required this.triggeredAt,
    required this.logDate,
    required this.triggerType,
    required this.triggerLevel,
    this.resourcesShown = const [],
    this.acknowledged = false,
    this.acknowledgedAt,
    this.dismissed = false,
  });

  SafetyEvent copyWith({
    bool? acknowledged,
    DateTime? acknowledgedAt,
    bool? dismissed,
    List<String>? resourcesShown,
  }) {
    return SafetyEvent(
      id: id,
      triggeredAt: triggeredAt,
      logDate: logDate,
      triggerType: triggerType,
      triggerLevel: triggerLevel,
      resourcesShown: resourcesShown ?? this.resourcesShown,
      acknowledged: acknowledged ?? this.acknowledged,
      acknowledgedAt: acknowledgedAt ?? this.acknowledgedAt,
      dismissed: dismissed ?? this.dismissed,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'triggeredAt': triggeredAt.toIso8601String(),
    'logDate': logDate,
    'triggerType': triggerType.name,
    'triggerLevel': triggerLevel.name,
    'resourcesShown': resourcesShown,
    'acknowledged': acknowledged,
    'acknowledgedAt': acknowledgedAt?.toIso8601String(),
    'dismissed': dismissed,
  };

  factory SafetyEvent.fromJson(Map<String, dynamic> json) => SafetyEvent(
    id: json['id'] as String,
    triggeredAt: DateTime.parse(json['triggeredAt'] as String),
    logDate: json['logDate'] as String,
    triggerType: SafeTriggerType.values.byName(json['triggerType'] as String),
    triggerLevel:
        SafeTriggerLevel.values.byName(json['triggerLevel'] as String),
    resourcesShown: List<String>.from(json['resourcesShown'] ?? []),
    acknowledged: json['acknowledged'] as bool? ?? false,
    acknowledgedAt: json['acknowledgedAt'] != null
        ? DateTime.parse(json['acknowledgedAt'] as String)
        : null,
    dismissed: json['dismissed'] as bool? ?? false,
  );

  String toJsonString() => jsonEncode(toJson());

  factory SafetyEvent.fromJsonString(String s) =>
      SafetyEvent.fromJson(jsonDecode(s) as Map<String, dynamic>);

  @override
  List<Object?> get props => [id, triggeredAt, logDate, triggerType, triggerLevel];
}
