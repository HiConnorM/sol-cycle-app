import '../core/constants.dart';
import '../models/cycle_log.dart';
import '../models/cycle_settings.dart';

class PhaseInfo {
  final String phase;
  final String name;
  final String description;
  final int color;
  final int colorLight;

  const PhaseInfo({
    required this.phase,
    required this.name,
    required this.description,
    required this.color,
    required this.colorLight,
  });
}

const Map<String, PhaseInfo> phaseInfoMap = {
  CyclePhase.menstrual: PhaseInfo(
    phase: CyclePhase.menstrual,
    name: 'Menstrual',
    description: 'Your inner winter. Rest, release, and turn inward.',
    color: 0xFFD8A7A7,
    colorLight: 0xFFF2E0E0,
  ),
  CyclePhase.follicular: PhaseInfo(
    phase: CyclePhase.follicular,
    name: 'Follicular',
    description: 'Your inner spring. Energy builds, ideas bloom.',
    color: 0xFFAFC3A4,
    colorLight: 0xFFDDEDD8,
  ),
  CyclePhase.ovulatory: PhaseInfo(
    phase: CyclePhase.ovulatory,
    name: 'Ovulatory',
    description: 'Your inner summer. Peak energy and radiance.',
    color: 0xFFEAD9A0,
    colorLight: 0xFFF7F0D0,
  ),
  CyclePhase.luteal: PhaseInfo(
    phase: CyclePhase.luteal,
    name: 'Luteal',
    description: 'Your inner autumn. Slow down and prepare.',
    color: 0xFFBFA8C9,
    colorLight: 0xFFE8DDEF,
  ),
};

class CycleService {
  static String getPhase(int cycleDay, int cycleLength, int periodLength) {
    if (cycleDay <= periodLength) return CyclePhase.menstrual;
    final follicularEnd = (cycleLength * 0.45).round();
    if (cycleDay <= follicularEnd) return CyclePhase.follicular;
    final ovulatoryEnd = (cycleLength * 0.55).round();
    if (cycleDay <= ovulatoryEnd) return CyclePhase.ovulatory;
    return CyclePhase.luteal;
  }

  static int? getCurrentCycleDay(CycleSettings settings, List<CycleLog> logs) {
    if (settings.lastPeriodStart == null) return null;

    final start = DateTime.parse(settings.lastPeriodStart!);
    final today = DateTime.now();
    final diff = today.difference(start).inDays + 1;

    if (diff < 1) return null;
    if (diff > settings.averageCycleLength) {
      return ((diff - 1) % settings.averageCycleLength) + 1;
    }
    return diff;
  }

  static bool isInPmddWindow(int? cycleDay, int cycleLength) {
    if (cycleDay == null) return false;
    final pmddStart = cycleLength - 14;
    final pmddEnd = cycleLength - 4;
    return cycleDay >= pmddStart && cycleDay <= pmddEnd;
  }

  static int? getDaysUntilPeriod(CycleSettings settings) {
    if (settings.lastPeriodStart == null) return null;
    final start = DateTime.parse(settings.lastPeriodStart!);
    final today = DateTime.now();
    final nextPeriod = start.add(Duration(days: settings.averageCycleLength));
    final diff = nextPeriod.difference(today).inDays;
    return diff >= 0 ? diff : null;
  }

  static String formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }
}
