/// SOL Cycle content registry.
///
/// Single lookup layer for all canonical content objects by ID.
/// Services reference content by string ID; this registry resolves those
/// IDs to typed objects at runtime without coupling services to data files.
library;

import 'content_types.dart';
import 'phases_data.dart';
import 'symptoms_data.dart';
import 'conditions_data.dart';
import 'rituals_data.dart';
import 'foods_data.dart';
import 'lessons_data.dart';
import 'months_data.dart';

// ─── Phase registry ───────────────────────────────────────────────────────────

final Map<String, PhaseObject> _phaseRegistry = {
  phaseMenstrual.meta.id: phaseMenstrual,
  phaseFollicular.meta.id: phaseFollicular,
  phaseOvulatory.meta.id: phaseOvulatory,
  phaseLuteal.meta.id: phaseLuteal,
};

PhaseObject? phaseFor(String id) => _phaseRegistry[id];

// ─── Symptom registry ─────────────────────────────────────────────────────────

final Map<String, SymptomObject> _symptomRegistry = {
  for (final s in allSymptoms) s.meta.id: s,
};

SymptomObject? symptomFor(String id) => _symptomRegistry[id];

// ─── Condition registry ───────────────────────────────────────────────────────

final Map<String, ConditionObject> _conditionRegistry = {
  for (final c in allConditions) c.meta.id: c,
};

ConditionObject? conditionFor(String id) => _conditionRegistry[id];

// ─── Ritual registry ──────────────────────────────────────────────────────────

final Map<String, RitualObject> _ritualRegistry = {
  for (final r in allRituals) r.meta.id: r,
};

RitualObject? ritualFor(String id) => _ritualRegistry[id];

// ─── Food registry ────────────────────────────────────────────────────────────

final Map<String, FoodObject> _foodRegistry = {
  for (final f in allFoods) f.meta.id: f,
};

FoodObject? foodFor(String id) => _foodRegistry[id];

// ─── Lesson registry ──────────────────────────────────────────────────────────

final Map<String, LessonObject> _lessonRegistry = {
  for (final l in allLessons) l.meta.id: l,
};

LessonObject? lessonFor(String id) => _lessonRegistry[id];

// ─── Month registry ───────────────────────────────────────────────────────────

final Map<String, MonthObject> _monthRegistry = {
  for (final m in allMonths) m.meta.id: m,
};

MonthObject? monthFor(String id) => _monthRegistry[id];

// ─── Generic lookup ───────────────────────────────────────────────────────────

/// Resolve any content ID to its typed object without knowing the type.
/// Returns null if the ID is not found in any registry.
/// Callers that need typed access should use the typed lookup functions above.
Object? contentFor(String id) {
  return _phaseRegistry[id] ??
      _symptomRegistry[id] ??
      _conditionRegistry[id] ??
      _ritualRegistry[id] ??
      _foodRegistry[id] ??
      _lessonRegistry[id] ??
      _monthRegistry[id];
}

/// Returns the content type string for any registered ID, or null if not found.
String? contentTypeFor(String id) {
  if (_phaseRegistry.containsKey(id)) return 'phase';
  if (_symptomRegistry.containsKey(id)) return 'symptom';
  if (_conditionRegistry.containsKey(id)) return 'condition';
  if (_ritualRegistry.containsKey(id)) return 'ritual';
  if (_foodRegistry.containsKey(id)) return 'food';
  if (_lessonRegistry.containsKey(id)) return 'lesson';
  if (_monthRegistry.containsKey(id)) return 'month';
  return null;
}

// ─── Bulk resolution helpers ──────────────────────────────────────────────────

/// Resolve a list of ritual IDs to objects, silently skipping unknown IDs.
List<RitualObject> ritualsFor(List<String> ids) =>
    ids.map(ritualFor).whereType<RitualObject>().toList();

/// Resolve a list of food IDs to objects, silently skipping unknown IDs.
List<FoodObject> foodsFor(List<String> ids) =>
    ids.map(foodFor).whereType<FoodObject>().toList();

/// Resolve a list of lesson IDs to objects, silently skipping unknown IDs.
List<LessonObject> lessonsFor(List<String> ids) =>
    ids.map(lessonFor).whereType<LessonObject>().toList();

/// Resolve a list of symptom IDs to objects, silently skipping unknown IDs.
List<SymptomObject> symptomsFor(List<String> ids) =>
    ids.map(symptomFor).whereType<SymptomObject>().toList();

/// Resolve a list of condition IDs to objects, silently skipping unknown IDs.
List<ConditionObject> conditionsFor(List<String> ids) =>
    ids.map(conditionFor).whereType<ConditionObject>().toList();

// ─── Content safety helpers ───────────────────────────────────────────────────

/// Returns all rituals that are safe for pregnancy (no pregnancyCaution set).
List<RitualObject> pregnancySafeRituals() =>
    allRituals.where((r) => r.pregnancyCaution == null).toList();

/// Returns all foods that have no pregnancy flags.
List<FoodObject> pregnancySafeFoods() =>
    allFoods.where((f) => f.meta.pregnancyFlags.isEmpty).toList();

/// Returns rituals relevant to the given phase ID.
List<RitualObject> ritualsForPhase(String phaseId) =>
    allRituals.where((r) => r.phaseIds.contains(phaseId)).toList();

/// Returns foods relevant to the given phase ID.
List<FoodObject> foodsForPhase(String phaseId) =>
    allFoods.where((f) => f.phaseIds.contains(phaseId)).toList();

/// Returns lessons relevant to a given condition ID.
List<LessonObject> lessonsForCondition(String conditionId) =>
    allLessons.where((l) => l.conditionIds.contains(conditionId)).toList();

/// Returns months associated with a given phase ID.
List<MonthObject> monthsForPhase(String phaseId) =>
    allMonths.where((m) => m.relatedPhaseId == phaseId).toList();
