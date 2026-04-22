import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';
import '../services/recommendation_service.dart';
import '../services/personalization_service.dart';
import '../services/cycle_service.dart';
import 'cycle_provider.dart';
import 'prediction_provider.dart';

class RecommendationState {
  final RecommendationSet? set;
  final PersonalizationProfile? profile;
  final bool isLoading;

  const RecommendationState({
    this.set,
    this.profile,
    this.isLoading = true,
  });

  List<Recommendation> get allItems => set?.items ?? [];
  List<Recommendation> get safetyItems => set?.safetyItems ?? [];
  List<Recommendation> get supportItems => set?.supportItems ?? [];
  bool get hasSafetyContent => set?.hasSafetyContent ?? false;

  RecommendationState copyWith({
    RecommendationSet? set,
    PersonalizationProfile? profile,
    bool? isLoading,
  }) {
    return RecommendationState(
      set: set ?? this.set,
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class RecommendationNotifier extends StateNotifier<RecommendationState> {
  final Ref _ref;

  RecommendationNotifier(this._ref) : super(const RecommendationState()) {
    _build();
  }

  Future<void> _build() async {
    state = state.copyWith(isLoading: true);

    final cycleState = _ref.read(cycleProvider);
    final predictionState = _ref.read(predictionProvider);
    final settings = cycleState.settings;
    final logs = cycleState.logs;
    final phase = cycleState.currentPhase ?? 'luteal';
    final inPmddWindow = cycleState.inPmddWindow;
    final today = CycleService.formatDate(DateTime.now());
    final todayLog = logs[today];

    final pattern = predictionState.pattern;

    final recentLogs = logs.values.toList()
      ..sort((a, b) => a.date.compareTo(b.date));
    final last14 = recentLogs.length > 14
        ? recentLogs.sublist(recentLogs.length - 14)
        : recentLogs;

    final profile = PersonalizationService.buildProfile(
      settings: settings,
      currentPhase: phase,
      inPmddWindow: inPmddWindow,
      recentLogs: last14,
      pattern: pattern,
    );

    final rawSet = RecommendationService.build(
      todayLog: todayLog,
      currentPhase: phase,
      inPmddWindow: inPmddWindow,
      settings: settings,
      pattern: pattern,
    );

    final adapted = PersonalizationService.adapt(
      recommendations: rawSet.items,
      profile: profile,
    );

    final finalSet = RecommendationSet(
      generatedAt: rawSet.generatedAt,
      currentPhase: rawSet.currentPhase,
      inPmddWindow: rawSet.inPmddWindow,
      items: adapted,
    );

    state = state.copyWith(set: finalSet, profile: profile, isLoading: false);
  }

  Future<void> refresh() => _build();
}

final StateNotifierProvider<RecommendationNotifier, RecommendationState>
    recommendationProvider =
    StateNotifierProvider<RecommendationNotifier, RecommendationState>(
  (ref) {
    ref.listen<CycleState>(cycleProvider, (prev, next) {
      if (prev?.logs != next.logs || prev?.settings != next.settings) {
        ref.read(recommendationProvider.notifier).refresh();
      }
    });
    ref.listen<PredictionState>(predictionProvider, (prev, next) {
      if (prev?.pattern != next.pattern) {
        ref.read(recommendationProvider.notifier).refresh();
      }
    });
    return RecommendationNotifier(ref);
  },
);
