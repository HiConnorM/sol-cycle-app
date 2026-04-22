import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/cycle_log.dart';
import '../models/cycle_settings.dart';
import '../services/cycle_service.dart';
import '../services/storage_service.dart';

class CycleState {
  final Map<String, CycleLog> logs;
  final CycleSettings settings;
  final bool isLoading;

  const CycleState({
    this.logs = const {},
    this.settings = const CycleSettings(),
    this.isLoading = true,
  });

  CycleState copyWith({
    Map<String, CycleLog>? logs,
    CycleSettings? settings,
    bool? isLoading,
  }) {
    return CycleState(
      logs: logs ?? this.logs,
      settings: settings ?? this.settings,
      isLoading: isLoading ?? this.isLoading,
    );
  }

  int? get cycleDay => CycleService.getCurrentCycleDay(settings, logs.values.toList());
  String? get currentPhase {
    final day = cycleDay;
    if (day == null) return null;
    return CycleService.getPhase(day, settings.averageCycleLength, settings.averagePeriodLength);
  }

  bool get inPmddWindow => CycleService.isInPmddWindow(cycleDay, settings.averageCycleLength);
  int? get daysUntilPeriod => CycleService.getDaysUntilPeriod(settings);

  CycleLog? logForDate(String date) => logs[date];
}

class CycleNotifier extends StateNotifier<CycleState> {
  CycleNotifier() : super(const CycleState()) {
    _load();
  }

  Future<void> _load() async {
    final logs = await StorageService.loadLogs();
    final settings = await StorageService.loadSettings();
    state = state.copyWith(logs: logs, settings: settings, isLoading: false);
  }

  Future<void> saveLog(CycleLog log) async {
    final updatedLogs = Map<String, CycleLog>.from(state.logs);
    updatedLogs[log.date] = log;
    state = state.copyWith(logs: updatedLogs);
    await StorageService.saveLogs(updatedLogs);
  }

  Future<void> updateSettings(CycleSettings settings) async {
    state = state.copyWith(settings: settings);
    await StorageService.saveSettings(settings);
  }

  Future<void> setPeriodStart(DateTime date) async {
    final dateStr = CycleService.formatDate(date);
    final updatedSettings = state.settings.copyWith(lastPeriodStart: dateStr);
    await updateSettings(updatedSettings);
  }
}

final cycleProvider = StateNotifierProvider<CycleNotifier, CycleState>(
  (ref) => CycleNotifier(),
);
