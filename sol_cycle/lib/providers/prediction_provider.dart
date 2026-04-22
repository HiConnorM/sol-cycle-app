import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/prediction_snapshot.dart';
import '../models/symptom_pattern.dart';
import '../services/prediction_service.dart';
import 'cycle_provider.dart';

class PredictionState {
  final List<PredictionSnapshot> snapshots;
  final SymptomPattern? pattern;
  final bool isComputing;

  const PredictionState({
    this.snapshots = const [],
    this.pattern,
    this.isComputing = false,
  });

  PredictionSnapshot? get nextPeriodPrediction => snapshots
      .where((s) => s.type == PredictionType.nextPeriod)
      .firstOrNull;

  List<PredictionSnapshot> get symptomWindowPredictions => snapshots
      .where((s) => s.type != PredictionType.nextPeriod)
      .toList();

  PredictionState copyWith({
    List<PredictionSnapshot>? snapshots,
    SymptomPattern? pattern,
    bool? isComputing,
  }) {
    return PredictionState(
      snapshots: snapshots ?? this.snapshots,
      pattern: pattern ?? this.pattern,
      isComputing: isComputing ?? this.isComputing,
    );
  }
}

class PredictionNotifier extends StateNotifier<PredictionState> {
  final Ref _ref;

  PredictionNotifier(this._ref) : super(const PredictionState()) {
    _compute();
  }

  Future<void> _compute() async {
    state = state.copyWith(isComputing: true);
    final cycleState = _ref.read(cycleProvider);
    final logs = cycleState.logs;
    final settings = cycleState.settings;

    final pattern = PredictionService.buildPattern(
      logs: logs,
      settings: settings,
    );

    final snapshots = PredictionService.generateAll(
      logs: logs,
      settings: settings,
      pattern: pattern,
    );

    state = state.copyWith(
      snapshots: snapshots,
      pattern: pattern,
      isComputing: false,
    );
  }

  /// Re-run predictions when new logs are saved.
  Future<void> refresh() => _compute();
}

final StateNotifierProvider<PredictionNotifier, PredictionState> predictionProvider =
    StateNotifierProvider<PredictionNotifier, PredictionState>(
  (ref) {
    ref.listen<CycleState>(cycleProvider, (prev, next) {
      if (prev?.logs != next.logs) {
        ref.read(predictionProvider.notifier).refresh();
      }
    });
    return PredictionNotifier(ref);
  },
);
