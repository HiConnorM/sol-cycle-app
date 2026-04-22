import 'dart:math';
import 'package:uuid/uuid.dart';
import '../models/cycle_log.dart';
import '../models/cycle_settings.dart';
import '../models/prediction_snapshot.dart';
import '../models/symptom_pattern.dart';
import 'cycle_service.dart';

const _uuid = Uuid();

/// Symptom codes that belong to the mood/emotional domain for window detection.
const _moodSymptomCodes = {
  'irritability', 'low mood', 'anxiety', 'rage', 'hopelessness',
  'severe depression', 'mood swings', 'brain fog', 'tearfulness',
  'severe irritability', 'depression', 'overwhelm',
};

class PredictionService {
  /// Primary entry point. Generates all predictions from the full log history.
  static List<PredictionSnapshot> generateAll({
    required Map<String, CycleLog> logs,
    required CycleSettings settings,
    SymptomPattern? pattern,
  }) {
    final sortedLogs = _sortedLogs(logs);
    final bleedStarts = _detectBleedStarts(sortedLogs);
    final cycleLengths = _computeCycleLengths(bleedStarts);
    final confidence = _computeConfidence(cycleLengths);

    final snapshots = <PredictionSnapshot>[];

    snapshots.add(_predictNextPeriod(
      settings: settings,
      bleedStarts: bleedStarts,
      cycleLengths: cycleLengths,
      confidence: confidence,
      totalLogs: sortedLogs.length,
    ));

    if (pattern != null && confidence != PredictionConfidence.insufficient) {
      snapshots.addAll(_predictSymptomWindows(
        pattern: pattern,
        settings: settings,
        bleedStarts: bleedStarts,
        cycleLengths: cycleLengths,
        confidence: confidence,
        totalLogs: sortedLogs.length,
      ));
    }

    return snapshots;
  }

  // ─── Cycle-timing prediction ──────────────────────────────────────────────

  static PredictionSnapshot _predictNextPeriod({
    required CycleSettings settings,
    required List<DateTime> bleedStarts,
    required List<int> cycleLengths,
    required PredictionConfidence confidence,
    required int totalLogs,
  }) {
    final avgLength = _weightedAvgCycleLength(cycleLengths, settings.averageCycleLength);
    final lastBleed = bleedStarts.isNotEmpty
        ? bleedStarts.last
        : (settings.lastPeriodStart != null
            ? DateTime.parse(settings.lastPeriodStart!)
            : null);

    DateTime? windowStart;
    DateTime? windowEnd;
    bool anomaly = false;
    String? anomalyNote;

    if (lastBleed != null) {
      final predicted = lastBleed.add(Duration(days: avgLength.round()));
      final variance = _cycleVariance(cycleLengths);
      final buffer = max(2, (variance * 0.5).round());
      windowStart = predicted.subtract(Duration(days: buffer));
      windowEnd = predicted.add(Duration(days: buffer));

      // Flag if cycle is running significantly longer than usual
      final today = DateTime.now();
      if (today.isAfter(predicted.add(const Duration(days: 5)))) {
        anomaly = true;
        anomalyNote = 'Your cycle appears to be running longer than usual. '
            'If you haven\'t started your period, this may be worth noting for a provider.';
      }
    }

    return PredictionSnapshot(
      id: _uuid.v4(),
      generatedAt: DateTime.now(),
      type: PredictionType.nextPeriod,
      windowStart: windowStart,
      windowEnd: windowEnd,
      confidence: confidence,
      confidenceReason: _confidenceReason(confidence, cycleLengths.length),
      basedOnCyclesCount: cycleLengths.length,
      basedOnLogsCount: totalLogs,
      label: _periodLabel(confidence, windowStart),
      phrasing: _periodPhrasing(confidence, windowStart, windowEnd, anomaly, anomalyNote),
      anomalyFlag: anomaly,
      anomalyNote: anomalyNote,
    );
  }

  // ─── Symptom window predictions ───────────────────────────────────────────

  static List<PredictionSnapshot> _predictSymptomWindows({
    required SymptomPattern pattern,
    required CycleSettings settings,
    required List<DateTime> bleedStarts,
    required List<int> cycleLengths,
    required PredictionConfidence confidence,
    required int totalLogs,
  }) {
    final snapshots = <PredictionSnapshot>[];
    final lastBleed = bleedStarts.isNotEmpty ? bleedStarts.last : null;
    if (lastBleed == null) return snapshots;

    final avgLength = _weightedAvgCycleLength(cycleLengths, settings.averageCycleLength);

    // Mood window prediction
    if (pattern.highMoodSymptomRelativeDays.isNotEmpty) {
      snapshots.add(_windowSnapshot(
        type: PredictionType.moodWindow,
        relativeDays: pattern.highMoodSymptomRelativeDays,
        lastBleed: lastBleed,
        avgCycleLength: avgLength.round(),
        confidence: confidence,
        cycleCount: cycleLengths.length,
        totalLogs: totalLogs,
        label: 'Mood shift window likely approaching',
        phrasingTemplate: (start, end) =>
            'Based on your recent logs, you\'ve often noticed emotional or mood changes '
            '${_relativeWindowPhrase(start, end)}. '
            'This may be worth having extra support ready.',
        contentIds: ['lesson-pmdd-vs-pms', 'ritual-soft-luteal-day', 'prompt-luteal-check-in'],
      ));
    }

    // Pain window prediction
    if (pattern.highPainRelativeDays.isNotEmpty) {
      snapshots.add(_windowSnapshot(
        type: PredictionType.painWindow,
        relativeDays: pattern.highPainRelativeDays,
        lastBleed: lastBleed,
        avgCycleLength: avgLength.round(),
        confidence: confidence,
        cycleCount: cycleLengths.length,
        totalLogs: totalLogs,
        label: 'Higher-pain days may be ahead',
        phrasingTemplate: (start, end) =>
            'Your logs suggest pain tends to be higher '
            '${_relativeWindowPhrase(start, end)}. '
            'Having warmth and gentler plans ready may help.',
        contentIds: ['ritual-warm-compress', 'food-ginger', 'lesson-painful-periods-basics'],
      ));
    }

    // Energy window prediction
    final lowEnergyPhase = _findLowEnergyPhase(pattern);
    if (lowEnergyPhase != null) {
      final today = DateTime.now();
      final cycleDay = today.difference(lastBleed).inDays + 1;
      final currentPhase = CycleService.getPhase(
          cycleDay, avgLength.round(), settings.averagePeriodLength);
      if (currentPhase == lowEnergyPhase || _isApproaching(currentPhase, lowEnergyPhase)) {
        snapshots.add(PredictionSnapshot(
          id: _uuid.v4(),
          generatedAt: DateTime.now(),
          type: PredictionType.energyWindow,
          confidence: confidence,
          confidenceReason: _confidenceReason(confidence, cycleLengths.length),
          basedOnCyclesCount: cycleLengths.length,
          basedOnLogsCount: totalLogs,
          label: 'Lower-energy days often cluster here',
          phrasing:
              'Your recent logs show energy tends to dip during your '
              '${_phaseDisplayName(lowEnergyPhase)} phase. '
              'Lighter plans and extra rest may serve you well right now.',
          recommendedContentIds: [
            'ritual-menstrual-nesting',
            'food-protein-stable-breakfast',
            'lesson-luteal-phase-basics',
          ],
        ));
      }
    }

    return snapshots;
  }

  // ─── Pattern computation ──────────────────────────────────────────────────

  /// Builds a SymptomPattern from all historical logs.
  static SymptomPattern buildPattern({
    required Map<String, CycleLog> logs,
    required CycleSettings settings,
  }) {
    final sortedLogs = _sortedLogs(logs);
    final bleedStarts = _detectBleedStarts(sortedLogs);
    final cycleLengths = _computeCycleLengths(bleedStarts);

    // Map each log entry to a relative day based on nearest prior bleed start
    final Map<int, List<String>> symptomsByRelDay = {};
    final Map<int, List<int>> painByRelDay = {};
    final Map<int, List<int>> energyByRelDay = {};
    final Map<int, List<int>> sleepByRelDay = {};

    for (final log in sortedLogs) {
      final logDate = DateTime.parse(log.date);
      final relDay = _relativeDay(logDate, bleedStarts);
      if (relDay == null) continue;

      symptomsByRelDay.putIfAbsent(relDay, () => []).addAll(log.allSymptoms);
      if (log.painLevel > 0) {
        painByRelDay.putIfAbsent(relDay, () => []).add(log.painLevel);
      }
      energyByRelDay.putIfAbsent(relDay, () => []).add(log.energy);
      sleepByRelDay.putIfAbsent(relDay, () => []).add(log.sleep);
    }

    final cycleCount = cycleLengths.length;
    final symptomFrequency = _computeFrequency(symptomsByRelDay, max(1, cycleCount));

    final highPainDays = _topNDays(
        painByRelDay.map((k, v) => MapEntry(k, v.reduce((a, b) => a + b) / v.length)),
        count: 4,
        threshold: 5.0);

    final highMoodDays = _topNDaysBySymbolSet(symptomFrequency, _moodSymptomCodes, count: 4);

    final topByPhase = _topSymptomsByPhase(sortedLogs, settings);
    final avgEnergyByPhase = _avgMetricByPhase(sortedLogs, settings, (l) => l.energy.toDouble());
    final avgSleepByPhase = _avgMetricByPhase(sortedLogs, settings, (l) => l.sleep.toDouble());
    final avgPainByPhase = _avgMetricByPhase(sortedLogs, settings, (l) => l.painLevel.toDouble());
    final careCorrelation = _careActionCorrelation(sortedLogs);

    return SymptomPattern(
      generatedAt: DateTime.now(),
      cycleCount: cycleCount,
      logCount: sortedLogs.length,
      avgCycleLength: _weightedAvgCycleLength(cycleLengths, settings.averageCycleLength),
      cycleVariability: _cycleVariance(cycleLengths),
      symptomFrequencyByRelativeDay: symptomFrequency,
      topSymptomsByPhase: topByPhase,
      avgEnergyByPhase: avgEnergyByPhase,
      avgSleepByPhase: avgSleepByPhase,
      avgPainByPhase: avgPainByPhase,
      careActionEnergyCorrelation: careCorrelation,
      highPainRelativeDays: highPainDays,
      highMoodSymptomRelativeDays: highMoodDays,
    );
  }

  // ─── Helper utilities ─────────────────────────────────────────────────────

  static List<CycleLog> _sortedLogs(Map<String, CycleLog> logs) {
    final list = logs.values.toList();
    list.sort((a, b) => a.date.compareTo(b.date));
    return list;
  }

  /// Detects bleed-start dates: a log day where bleeding begins after a non-bleeding day.
  static List<DateTime> _detectBleedStarts(List<CycleLog> sorted) {
    final starts = <DateTime>[];
    String prevFlow = 'none';
    for (final log in sorted) {
      final isBleed = log.flow != 'none';
      final prevWasNone = prevFlow == 'none' || prevFlow == 'spotting';
      if (isBleed && prevWasNone && log.flow != 'spotting') {
        starts.add(DateTime.parse(log.date));
      }
      prevFlow = log.flow;
    }
    return starts;
  }

  static List<int> _computeCycleLengths(List<DateTime> starts) {
    if (starts.length < 2) return [];
    final lengths = <int>[];
    for (int i = 1; i < starts.length; i++) {
      lengths.add(starts[i].difference(starts[i - 1]).inDays);
    }
    return lengths;
  }

  /// Weighted average: more recent cycles count more.
  static double _weightedAvgCycleLength(List<int> lengths, int fallback) {
    if (lengths.isEmpty) return fallback.toDouble();
    double weightedSum = 0;
    double totalWeight = 0;
    for (int i = 0; i < lengths.length; i++) {
      final weight = i + 1.0;
      weightedSum += lengths[i] * weight;
      totalWeight += weight;
    }
    return weightedSum / totalWeight;
  }

  static double _cycleVariance(List<int> lengths) {
    if (lengths.length < 2) return 0;
    final avg = lengths.reduce((a, b) => a + b) / lengths.length;
    final variance = lengths.map((l) => pow(l - avg, 2)).reduce((a, b) => a + b) / lengths.length;
    return sqrt(variance);
  }

  static PredictionConfidence _computeConfidence(List<int> cycleLengths) {
    final count = cycleLengths.length;
    if (count == 0) return PredictionConfidence.insufficient;
    if (count < 3) return PredictionConfidence.low;
    final variance = _cycleVariance(cycleLengths);
    if (count >= 6 && variance < 4) return PredictionConfidence.high;
    if (count >= 3) return PredictionConfidence.moderate;
    return PredictionConfidence.low;
  }

  static String _confidenceReason(PredictionConfidence c, int cycleCount) {
    switch (c) {
      case PredictionConfidence.insufficient:
        return 'Not enough cycle history yet — keep logging to improve predictions.';
      case PredictionConfidence.low:
        return 'Based on $cycleCount cycle${cycleCount == 1 ? '' : 's'} with some variability.';
      case PredictionConfidence.moderate:
        return 'Based on $cycleCount cycles. More logging will sharpen this estimate.';
      case PredictionConfidence.high:
        return 'Based on $cycleCount consistent cycles.';
    }
  }

  static int? _relativeDay(DateTime logDate, List<DateTime> bleedStarts) {
    if (bleedStarts.isEmpty) return null;
    DateTime? nearestPrior;
    for (final start in bleedStarts) {
      if (!start.isAfter(logDate)) nearestPrior = start;
    }
    if (nearestPrior == null) return null;
    return logDate.difference(nearestPrior).inDays;
  }

  static Map<int, Map<String, double>> _computeFrequency(
      Map<int, List<String>> symptomsByRelDay, int cycleCount) {
    final result = <int, Map<String, double>>{};
    for (final entry in symptomsByRelDay.entries) {
      final counts = <String, int>{};
      for (final s in entry.value) {
        counts[s] = (counts[s] ?? 0) + 1;
      }
      result[entry.key] = counts.map((k, v) => MapEntry(k, v / cycleCount));
    }
    return result;
  }

  static List<int> _topNDays(Map<int, double> scores, {required int count, double threshold = 0}) {
    final filtered = scores.entries.where((e) => e.value >= threshold).toList();
    filtered.sort((a, b) => b.value.compareTo(a.value));
    return filtered.take(count).map((e) => e.key).toList()..sort();
  }

  static List<int> _topNDaysBySymbolSet(
    Map<int, Map<String, double>> freq,
    Set<String> targetSet, {
    required int count,
  }) {
    final dayScores = <int, double>{};
    for (final entry in freq.entries) {
      double score = 0;
      for (final symptom in targetSet) {
        score += entry.value[symptom] ?? 0;
      }
      if (score > 0) dayScores[entry.key] = score;
    }
    return _topNDays(dayScores, count: count);
  }

  static Map<String, List<String>> _topSymptomsByPhase(
      List<CycleLog> sorted, CycleSettings settings) {
    final byPhase = <String, Map<String, int>>{};
    for (final log in sorted) {
      final day = _estimateCycleDay(log, sorted, settings);
      if (day == null) continue;
      final phase = CycleService.getPhase(
          day, settings.averageCycleLength, settings.averagePeriodLength);
      final counts = byPhase.putIfAbsent(phase, () => {});
      for (final s in log.allSymptoms) {
        counts[s] = (counts[s] ?? 0) + 1;
      }
    }
    return byPhase.map((phase, counts) {
      final sorted = counts.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
      return MapEntry(phase, sorted.take(5).map((e) => e.key).toList());
    });
  }

  static Map<String, double> _avgMetricByPhase(
    List<CycleLog> sorted,
    CycleSettings settings,
    double Function(CycleLog) metric,
  ) {
    final sums = <String, double>{};
    final counts = <String, int>{};
    for (final log in sorted) {
      final day = _estimateCycleDay(log, sorted, settings);
      if (day == null) continue;
      final phase = CycleService.getPhase(
          day, settings.averageCycleLength, settings.averagePeriodLength);
      sums[phase] = (sums[phase] ?? 0) + metric(log);
      counts[phase] = (counts[phase] ?? 0) + 1;
    }
    return sums.map((k, v) => MapEntry(k, v / (counts[k] ?? 1)));
  }

  static Map<String, double> _careActionCorrelation(List<CycleLog> sorted) {
    final energySums = <String, double>{};
    final energyCounts = <String, int>{};
    for (final log in sorted) {
      for (final action in log.careActions) {
        energySums[action] = (energySums[action] ?? 0) + log.energy;
        energyCounts[action] = (energyCounts[action] ?? 0) + 1;
      }
    }
    return energySums.map((k, v) => MapEntry(k, v / (energyCounts[k] ?? 1)));
  }

  static int? _estimateCycleDay(
      CycleLog log, List<CycleLog> allSorted, CycleSettings settings) {
    if (settings.lastPeriodStart == null) return null;
    final logDate = DateTime.parse(log.date);
    final lastStart = DateTime.parse(settings.lastPeriodStart!);
    final diff = logDate.difference(lastStart).inDays + 1;
    if (diff < 1) return null;
    if (diff > settings.averageCycleLength) {
      return ((diff - 1) % settings.averageCycleLength) + 1;
    }
    return diff;
  }

  static String? _findLowEnergyPhase(SymptomPattern pattern) {
    if (pattern.avgEnergyByPhase.isEmpty) return null;
    return pattern.avgEnergyByPhase.entries
        .reduce((a, b) => a.value < b.value ? a : b)
        .key;
  }

  static bool _isApproaching(String current, String target) {
    const order = ['follicular', 'ovulatory', 'luteal', 'menstrual'];
    final ci = order.indexOf(current);
    final ti = order.indexOf(target);
    if (ci == -1 || ti == -1) return false;
    return (ti - ci + 4) % 4 == 1;
  }

  static String _phaseDisplayName(String phase) {
    const names = {
      'menstrual': 'menstrual',
      'follicular': 'follicular',
      'ovulatory': 'ovulatory',
      'luteal': 'luteal',
    };
    return names[phase] ?? phase;
  }

  static PredictionSnapshot _windowSnapshot({
    required PredictionType type,
    required List<int> relativeDays,
    required DateTime lastBleed,
    required int avgCycleLength,
    required PredictionConfidence confidence,
    required int cycleCount,
    required int totalLogs,
    required String label,
    required String Function(DateTime?, DateTime?) phrasingTemplate,
    required List<String> contentIds,
  }) {
    final minRel = relativeDays.reduce(min);
    final maxRel = relativeDays.reduce(max);
    final windowStart = lastBleed.add(Duration(days: minRel));
    final windowEnd = lastBleed.add(Duration(days: maxRel));
    return PredictionSnapshot(
      id: _uuid.v4(),
      generatedAt: DateTime.now(),
      type: type,
      windowStart: windowStart,
      windowEnd: windowEnd,
      confidence: confidence,
      confidenceReason: _confidenceReason(confidence, cycleCount),
      basedOnCyclesCount: cycleCount,
      basedOnLogsCount: totalLogs,
      label: label,
      phrasing: phrasingTemplate(windowStart, windowEnd),
      recommendedContentIds: contentIds,
    );
  }

  // ─── Phrasing helpers ─────────────────────────────────────────────────────

  static String _periodLabel(PredictionConfidence c, DateTime? windowStart) {
    if (c == PredictionConfidence.insufficient) {
      return 'Not enough data yet';
    }
    if (windowStart == null) return 'Period prediction unavailable';
    final daysAway = windowStart.difference(DateTime.now()).inDays;
    if (daysAway < 0) return 'Period may have started';
    if (daysAway == 0) return 'Period may start today';
    if (daysAway <= 2) return 'Period likely in the next couple of days';
    if (daysAway <= 7) return 'Period likely this week';
    return 'Period likely in about $daysAway days';
  }

  static String _periodPhrasing(
    PredictionConfidence confidence,
    DateTime? windowStart,
    DateTime? windowEnd,
    bool anomaly,
    String? anomalyNote,
  ) {
    if (confidence == PredictionConfidence.insufficient) {
      return 'We\'re still learning your cycle. Log a few more months and '
          'predictions will begin to take shape.';
    }
    if (windowStart == null) {
      return 'We don\'t have enough information yet to estimate your next period.';
    }
    final confidenceWord = confidence == PredictionConfidence.high
        ? 'Based on your recent cycles'
        : confidence == PredictionConfidence.moderate
            ? 'Based on your recent logs'
            : 'Based on limited cycle history';

    final base = '$confidenceWord, your next period may arrive around '
        '${_formatDate(windowStart)}${windowEnd != null ? '–${_formatDate(windowEnd)}' : ''}.';

    if (anomaly && anomalyNote != null) return '$base $anomalyNote';
    return base;
  }

  static String _relativeWindowPhrase(DateTime? start, DateTime? end) {
    if (start == null) return 'during this part of your cycle';
    final now = DateTime.now();
    final daysFromNow = start.difference(now).inDays;
    if (daysFromNow < -1) return 'during the days around now';
    if (daysFromNow <= 0) return 'right around now';
    if (daysFromNow <= 3) return 'in the next few days';
    return 'coming up soon';
  }

  static String _formatDate(DateTime d) {
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[d.month]} ${d.day}';
  }
}
