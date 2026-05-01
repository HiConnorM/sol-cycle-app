import 'dart:math';

class MoonPhaseData {
  final String phase;
  final double illumination;
  final String name;
  final String emoji;

  const MoonPhaseData({
    required this.phase,
    required this.illumination,
    required this.name,
    required this.emoji,
  });
}

class MoonService {
  // Southern hemisphere sees moon phases visually mirrored
  static MoonPhaseData getPhaseForHemisphere(DateTime date, {bool southern = false}) {
    final data = getPhase(date);
    if (!southern) return data;
    final flipped = {
      'waxing-crescent': ('waxing-crescent', 'Waxing Crescent', '🌘'),
      'waxing-gibbous': ('waxing-gibbous', 'Waxing Gibbous', '🌖'),
      'waning-gibbous': ('waning-gibbous', 'Waning Gibbous', '🌔'),
      'waning-crescent': ('waning-crescent', 'Waning Crescent', '🌒'),
    };
    final entry = flipped[data.phase];
    if (entry == null) return data;
    return MoonPhaseData(phase: entry.$1, illumination: data.illumination, name: entry.$2, emoji: entry.$3);
  }

  static MoonPhaseData getPhase(DateTime date) {
    final julianDate = _toJulianDate(date);
    final daysSinceNewMoon = (julianDate - 2451549.5) % 29.53058867;
    final normalized = daysSinceNewMoon < 0
        ? daysSinceNewMoon + 29.53058867
        : daysSinceNewMoon;

    final illumination = ((1 - cos(2 * pi * normalized / 29.53058867)) / 2 * 100).roundToDouble();

    String phase;
    String name;
    String emoji;

    if (normalized < 1.85) {
      phase = 'new'; name = 'New Moon'; emoji = '🌑';
    } else if (normalized < 7.38) {
      phase = 'waxing-crescent'; name = 'Waxing Crescent'; emoji = '🌒';
    } else if (normalized < 9.22) {
      phase = 'first-quarter'; name = 'First Quarter'; emoji = '🌓';
    } else if (normalized < 14.77) {
      phase = 'waxing-gibbous'; name = 'Waxing Gibbous'; emoji = '🌔';
    } else if (normalized < 16.61) {
      phase = 'full'; name = 'Full Moon'; emoji = '🌕';
    } else if (normalized < 22.15) {
      phase = 'waning-gibbous'; name = 'Waning Gibbous'; emoji = '🌖';
    } else if (normalized < 23.99) {
      phase = 'last-quarter'; name = 'Last Quarter'; emoji = '🌗';
    } else {
      phase = 'waning-crescent'; name = 'Waning Crescent'; emoji = '🌘';
    }

    return MoonPhaseData(
      phase: phase,
      illumination: illumination,
      name: name,
      emoji: emoji,
    );
  }

  static double _toJulianDate(DateTime date) {
    final utc = date.toUtc();
    final a = ((14 - utc.month) / 12).floor();
    final y = utc.year + 4800 - a;
    final m = utc.month + 12 * a - 3;
    final jdn = utc.day +
        ((153 * m + 2) / 5).floor() +
        365 * y +
        (y / 4).floor() -
        (y / 100).floor() +
        (y / 400).floor() -
        32045;
    // Julian dates start at noon; offset time fraction from midnight
    final timeFraction = (utc.hour + utc.minute / 60.0 + utc.second / 3600.0) / 24.0 - 0.5;
    return jdn.toDouble() + timeFraction;
  }

  static String getMoonInsight(String phase) {
    switch (phase) {
      case 'new':
        return 'A time for new beginnings and setting intentions inward.';
      case 'waxing-crescent':
        return 'Energy is building. Take action on your intentions.';
      case 'first-quarter':
        return 'A moment of decision. Push through challenges.';
      case 'waxing-gibbous':
        return 'Refinement and preparation. Almost at peak.';
      case 'full':
        return 'Peak illumination — powerful time for manifestation.';
      case 'waning-gibbous':
        return 'Share your gifts. Gratitude and giving.';
      case 'last-quarter':
        return 'Release and forgive. Let go of what no longer serves.';
      case 'waning-crescent':
        return 'Rest and reflect before the new cycle begins.';
      default:
        return '';
    }
  }
}
