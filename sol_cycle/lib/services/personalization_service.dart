import '../models/cycle_log.dart';
import '../models/cycle_settings.dart';
import '../models/recommendation.dart';
import '../models/symptom_pattern.dart';

/// Tone-aware phrasing variants for a given message template.
///
/// Each ToneVariant holds the same informational content in three registers:
/// - grounded: clinical-light, direct, evidence-aware
/// - balanced: warm, accessible, emotionally literate (default)
/// - spiritual: seasonal metaphor, phase archetype, ritual framing
class ToneVariant {
  final String grounded;
  final String balanced;
  final String spiritual;

  const ToneVariant({
    required this.grounded,
    required this.balanced,
    required this.spiritual,
  });

  String forTone(String tone) {
    switch (tone) {
      case 'grounded':
        return grounded;
      case 'spiritual':
        return spiritual;
      default:
        return balanced;
    }
  }
}

/// Phase display names in each tone register.
const Map<String, ToneVariant> phaseNames = {
  'menstrual': ToneVariant(
    grounded: 'menstrual phase',
    balanced: 'your period',
    spiritual: 'inner winter',
  ),
  'follicular': ToneVariant(
    grounded: 'follicular phase',
    balanced: 'the follicular phase',
    spiritual: 'inner spring',
  ),
  'ovulatory': ToneVariant(
    grounded: 'ovulatory phase',
    balanced: 'ovulation window',
    spiritual: 'inner summer',
  ),
  'luteal': ToneVariant(
    grounded: 'luteal phase',
    balanced: 'the luteal phase',
    spiritual: 'inner autumn',
  ),
};

/// Phase descriptions in each tone register.
const Map<String, ToneVariant> phaseDescriptions = {
  'menstrual': ToneVariant(
    grounded: 'This is typically the lowest-energy phase of the cycle, associated with '
        'prostaglandin activity, possible cramping, and iron loss.',
    balanced: 'This is a natural time for rest and inward focus. '
        'Your body is doing real work, and that deserves real support.',
    spiritual: 'Your inner winter has arrived — a time to release, rest, and turn inward. '
        'The cycle asks for stillness here, and stillness is not emptiness.',
  ),
  'follicular': ToneVariant(
    grounded: 'Estrogen rises during the follicular phase, which commonly produces '
        'increased energy, improved mood, and better cognitive function.',
    balanced: 'Energy and clarity often build during the follicular phase. '
        'This can be a naturally good time to start new things.',
    spiritual: 'Inner spring is here — something new is stirring beneath the surface. '
        'Let yourself lean toward the light.',
  ),
  'ovulatory': ToneVariant(
    grounded: 'Ovulation typically occurs around the midpoint of the cycle, triggered by '
        'an LH surge. Energy, libido, and social ease commonly peak.',
    balanced: 'This is often the highest-energy phase. Many people find communication '
        'and connection feel easier right now.',
    spiritual: 'Inner summer — your radiance is at its fullest. '
        'This is a time for presence, connection, and full expression.',
  ),
  'luteal': ToneVariant(
    grounded: 'Progesterone dominates the luteal phase. Energy may decrease, and '
        'symptoms such as bloating, mood changes, and fatigue are common.',
    balanced: 'The luteal phase often calls for more gentleness — with plans, '
        'with others, and with yourself. Symptoms are real and valid.',
    spiritual: 'Inner autumn invites you to harvest what you\'ve grown and prepare for rest. '
        'There is wisdom in slowing down now.',
  ),
};

/// Low-data prompt shown when fewer than 2 cycles have been logged.
const ToneVariant notEnoughDataPrompt = ToneVariant(
  grounded: 'Keep logging to build up your personal cycle history. '
      'Predictions and patterns emerge over time.',
  balanced: 'The more you log, the more the app can learn about your rhythms. '
      'Every entry helps.',
  spiritual: 'Your cycle is still revealing itself here. Each entry is an act of '
      'listening — and patterns will emerge in their own time.',
);

/// Produces a personalization profile used to adapt content ordering and tone.
class PersonalizationProfile {
  final String tone;
  final bool pmddActive;
  final bool endoActive;
  final bool ttcActive;
  final bool pregnancyActive;
  final bool postpartumActive;
  final bool hasEnoughData;
  final String currentPhase;
  final bool inPmddWindow;
  final List<String> recentTopSymptoms;
  final List<String> effectiveCareActions;

  const PersonalizationProfile({
    required this.tone,
    required this.pmddActive,
    required this.endoActive,
    required this.ttcActive,
    required this.pregnancyActive,
    required this.postpartumActive,
    required this.hasEnoughData,
    required this.currentPhase,
    required this.inPmddWindow,
    this.recentTopSymptoms = const [],
    this.effectiveCareActions = const [],
  });
}

class PersonalizationService {
  /// Build a profile from settings + recent logs + optional pattern data.
  static PersonalizationProfile buildProfile({
    required CycleSettings settings,
    required String currentPhase,
    required bool inPmddWindow,
    List<CycleLog> recentLogs = const [],
    SymptomPattern? pattern,
  }) {
    final topSymptoms = _recentTopSymptoms(recentLogs);
    final effectiveActions = _effectiveCareActions(pattern);

    return PersonalizationProfile(
      tone: settings.tonePreference,
      pmddActive: settings.pmddMode,
      endoActive: settings.endoMode,
      ttcActive: settings.ttcMode,
      pregnancyActive: settings.pregnancyMode,
      postpartumActive: settings.postpartumMode,
      hasEnoughData: (pattern?.cycleCount ?? 0) >= 2,
      currentPhase: currentPhase,
      inPmddWindow: inPmddWindow,
      recentTopSymptoms: topSymptoms,
      effectiveCareActions: effectiveActions,
    );
  }

  /// Filter and re-phrase recommendations based on the profile.
  static List<Recommendation> adapt({
    required List<Recommendation> recommendations,
    required PersonalizationProfile profile,
  }) {
    return recommendations
        .where((r) => _isVisible(r, profile))
        .map((r) => _applyTone(r, profile.tone, profile.currentPhase))
        .toList();
  }

  /// Returns the phase display name in the user's tone.
  static String phaseLabel(String phase, String tone) {
    return phaseNames[phase]?.forTone(tone) ?? phase;
  }

  /// Returns the phase description in the user's tone.
  static String phaseDescription(String phase, String tone) {
    return phaseDescriptions[phase]?.forTone(tone) ??
        'This phase brings its own rhythms worth noticing.';
  }

  /// Returns the low-data notice in the user's tone.
  static String lowDataNotice(String tone) => notEnoughDataPrompt.forTone(tone);

  // ─── Internal helpers ─────────────────────────────────────────────────────

  static bool _isVisible(Recommendation rec, PersonalizationProfile profile) {
    // Safety items are always shown
    if (rec.type == RecommendationType.safety || rec.safetyOverride) return true;

    // Pregnancy mode: only show pregnancy-safe items
    if (profile.pregnancyActive && !rec.pregnancySafe) return false;

    // TTC mode: only show TTC-safe items
    if (profile.ttcActive && !rec.ttcSafe) return false;

    // Spiritual content: only show if tone is spiritual or balanced
    if (rec.contentId.contains('moon') || rec.contentId.contains('ritual-moon')) {
      if (profile.tone == 'grounded') return false;
    }

    return true;
  }

  /// Re-phrases the recommendation's phrasing field based on tone preference.
  /// Keeps content IDs and priorities intact; only touches user-visible text.
  static Recommendation _applyTone(
      Recommendation rec, String tone, String currentPhase) {
    if (tone == 'balanced') return rec;

    final phaseWord = phaseNames[currentPhase]?.forTone(tone) ?? currentPhase;
    String phrasing = rec.phrasing;

    if (tone == 'grounded') {
      // Strip seasonal metaphors; use direct language
      phrasing = phrasing
          .replaceAll('inner winter', 'your menstrual phase')
          .replaceAll('inner spring', 'your follicular phase')
          .replaceAll('inner summer', 'your ovulatory phase')
          .replaceAll('inner autumn', 'your luteal phase')
          .replaceAll('your body may be moving into', 'you may be entering')
          .replaceAll('this phase invites', 'during this phase,');
    } else if (tone == 'spiritual') {
      // Enrich with phase archetype
      phrasing = phrasing
          .replaceAll('the luteal phase', 'your inner autumn')
          .replaceAll('the follicular phase', 'your inner spring')
          .replaceAll('the ovulatory phase', 'your inner summer')
          .replaceAll('your period', 'your inner winter')
          .replaceAll('during this phase', 'as you move through $phaseWord');
    }

    return Recommendation(
      id: rec.id,
      type: rec.type,
      contentId: rec.contentId,
      title: rec.title,
      summary: rec.summary,
      phrasing: phrasing,
      reason: rec.reason,
      priority: rec.priority,
      safetyOverride: rec.safetyOverride,
      phaseAlignment: rec.phaseAlignment,
      conditionRelevant: rec.conditionRelevant,
      pregnancySafe: rec.pregnancySafe,
      ttcSafe: rec.ttcSafe,
    );
  }

  static List<String> _recentTopSymptoms(List<CycleLog> logs) {
    final counts = <String, int>{};
    final recent = logs.length > 14 ? logs.sublist(logs.length - 14) : logs;
    for (final log in recent) {
      for (final s in log.allSymptoms) {
        counts[s] = (counts[s] ?? 0) + 1;
      }
    }
    final sorted = counts.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    return sorted.take(5).map((e) => e.key).toList();
  }

  static List<String> _effectiveCareActions(SymptomPattern? pattern) {
    if (pattern == null) return [];
    final effective = pattern.careActionEnergyCorrelation.entries
        .where((e) => e.value > 6.0)
        .toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    return effective.take(3).map((e) => e.key).toList();
  }
}
