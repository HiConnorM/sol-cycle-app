import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/safety_event.dart';
import '../services/safety_service.dart';
import '../services/cycle_service.dart';
import 'cycle_provider.dart';

class SafetyState {
  final List<SafetyEvent> activeEvents;
  final List<SafetyEvent> history;

  const SafetyState({
    this.activeEvents = const [],
    this.history = const [],
  });

  bool get hasUrgent =>
      activeEvents.any((e) => e.triggerLevel == SafeTriggerLevel.urgent);
  bool get hasCaution =>
      activeEvents.any((e) => e.triggerLevel == SafeTriggerLevel.caution);
  bool get hasAnyActive => activeEvents.isNotEmpty;

  SafeTriggerLevel? get highestLevel {
    if (hasUrgent) return SafeTriggerLevel.urgent;
    if (hasCaution) return SafeTriggerLevel.caution;
    if (activeEvents.any((e) => e.triggerLevel == SafeTriggerLevel.watch)) {
      return SafeTriggerLevel.watch;
    }
    return null;
  }

  String? get primaryMessage {
    final level = highestLevel;
    if (level == null) return null;
    return SafetyService.safetyMessage(level);
  }

  SafetyState copyWith({
    List<SafetyEvent>? activeEvents,
    List<SafetyEvent>? history,
  }) {
    return SafetyState(
      activeEvents: activeEvents ?? this.activeEvents,
      history: history ?? this.history,
    );
  }
}

class SafetyNotifier extends StateNotifier<SafetyState> {
  final Ref _ref;

  SafetyNotifier(this._ref) : super(const SafetyState()) {
    _evaluate();
  }

  void _evaluate() {
    final cycleState = _ref.read(cycleProvider);
    final today = CycleService.formatDate(DateTime.now());
    final todayLog = cycleState.logs[today];

    if (todayLog == null) {
      state = state.copyWith(activeEvents: []);
      return;
    }

    final result = SafetyService.evaluate(todayLog);
    final newEvents = result.events;
    final updatedHistory = [...state.history, ...newEvents];

    state = state.copyWith(
      activeEvents: newEvents,
      history: updatedHistory,
    );
  }

  void acknowledgeEvent(String eventId) {
    final updatedActive = state.activeEvents
        .map((e) => e.id == eventId
            ? e.copyWith(acknowledged: true, acknowledgedAt: DateTime.now())
            : e)
        .toList();
    state = state.copyWith(activeEvents: updatedActive);
  }

  void dismissEvent(String eventId) {
    final updatedActive = state.activeEvents
        .map((e) => e.id == eventId ? e.copyWith(dismissed: true) : e)
        .where((e) => !e.dismissed)
        .toList();
    state = state.copyWith(activeEvents: updatedActive);
  }

  void refresh() => _evaluate();
}

final StateNotifierProvider<SafetyNotifier, SafetyState> safetyProvider =
    StateNotifierProvider<SafetyNotifier, SafetyState>(
  (ref) {
    ref.listen<CycleState>(cycleProvider, (prev, next) {
      final today = CycleService.formatDate(DateTime.now());
      if (prev?.logs[today] != next.logs[today]) {
        ref.read(safetyProvider.notifier).refresh();
      }
    });
    return SafetyNotifier(ref);
  },
);
