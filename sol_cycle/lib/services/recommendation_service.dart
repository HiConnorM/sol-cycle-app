import '../models/cycle_log.dart';
import '../models/cycle_settings.dart';
import '../models/recommendation.dart';
import '../models/safety_event.dart';
import '../models/symptom_pattern.dart';
import 'safety_service.dart';

/// Builds a ranked RecommendationSet for the given log, phase, and settings.
///
/// Priority bands:
///   0–9   Safety overrides (from SafetyService)
///  10–29  Acute symptom matches (user logged something severe today)
///  30–49  Phase-relevant content
///  50–69  Condition-mode content (PMDD, endo, TTC, pregnancy, postpartum)
///  70–89  Historical pattern matches
///  90–99  Default discovery
class RecommendationService {
  static RecommendationSet build({
    required CycleLog? todayLog,
    required String currentPhase,
    required bool inPmddWindow,
    required CycleSettings settings,
    SymptomPattern? pattern,
  }) {
    final items = <Recommendation>[];

    // 1. Safety first — always evaluated; if urgent, subsequent items are demoted
    final safetyItems = _buildSafetyItems(todayLog);
    items.addAll(safetyItems);

    final hasUrgentSafety = safetyItems.any(
        (r) => r.priority <= 2 && r.type == RecommendationType.safety);

    // If urgent safety event, suppress all casual guidance
    if (hasUrgentSafety) {
      items.add(_escalationItem(currentPhase));
      return RecommendationSet(
        generatedAt: DateTime.now(),
        currentPhase: currentPhase,
        inPmddWindow: inPmddWindow,
        items: items..sort((a, b) => a.priority.compareTo(b.priority)),
      );
    }

    // 2. Acute symptom matches
    items.addAll(_buildAcuteItems(todayLog, currentPhase, settings));

    // 3. Phase-relevant content
    items.addAll(_buildPhaseItems(currentPhase, inPmddWindow, settings));

    // 4. Mode-specific content
    items.addAll(_buildModeItems(settings, currentPhase, inPmddWindow));

    // 5. Pattern-based content
    if (pattern != null) {
      items.addAll(_buildPatternItems(pattern, currentPhase, settings));
    }

    // 6. Default discovery (fill if fewer than 4 items)
    if (items.length < 4) {
      items.addAll(_defaultDiscovery(currentPhase, settings));
    }

    // Deduplicate by contentId, keeping highest-priority (lowest number)
    final seen = <String>{};
    final deduped = <Recommendation>[];
    final sorted = items..sort((a, b) => a.priority.compareTo(b.priority));
    for (final item in sorted) {
      if (seen.add(item.contentId)) deduped.add(item);
    }

    return RecommendationSet(
      generatedAt: DateTime.now(),
      currentPhase: currentPhase,
      inPmddWindow: inPmddWindow,
      items: deduped,
    );
  }

  // ─── Safety items ─────────────────────────────────────────────────────────

  static List<Recommendation> _buildSafetyItems(CycleLog? log) {
    if (log == null) return [];
    final result = SafetyService.evaluate(log);
    if (!result.hasAnyEvent) return [];

    return result.events.map((event) {
      final level = event.triggerLevel;
      final priority = level == SafeTriggerLevel.urgent
          ? 0
          : level == SafeTriggerLevel.caution
              ? 3
              : 6;
      return Recommendation(
        id: 'safety_${event.triggerType.name}',
        type: RecommendationType.safety,
        contentId: 'safety-${event.triggerType.name.toLowerCase()}',
        title: _safetyTitle(event.triggerType),
        summary: SafetyService.inlineNote(event.triggerType),
        phrasing: SafetyService.safetyMessage(event.triggerLevel),
        reason: 'Safety trigger detected: ${event.triggerType.name}',
        priority: priority,
        safetyOverride: level == SafeTriggerLevel.urgent,
        pregnancySafe: true,
        ttcSafe: true,
      );
    }).toList();
  }

  static Recommendation _escalationItem(String phase) {
    return const Recommendation(
      id: 'escalation_care_seeking',
      type: RecommendationType.escalation,
      contentId: 'safety-seek-care-now',
      title: 'Care and support resources',
      summary: 'Finding the right support matters.',
      phrasing:
          'If what you\'re experiencing feels serious, reaching out to a healthcare '
          'provider or crisis line is an important step. You don\'t have to hold this alone.',
      reason: 'Urgent safety event — escalation shown instead of casual guidance',
      priority: 1,
      safetyOverride: true,
    );
  }

  static String _safetyTitle(SafeTriggerType type) {
    switch (type) {
      case SafeTriggerType.suicidalThought:
        return 'Please reach out for support';
      case SafeTriggerType.severeDepression:
        return 'Severe mood symptoms noted';
      case SafeTriggerType.pmddCrisis:
        return 'PMDD crisis support';
      case SafeTriggerType.heavyBleedingWithDistress:
        return 'Heavy bleeding — care may be needed';
      case SafeTriggerType.fainting:
        return 'Fainting warrants medical attention';
      case SafeTriggerType.severePain:
        return 'Severe pain — a provider can help';
      case SafeTriggerType.pregnancyConcern:
        return 'Pregnancy-related concern noted';
      case SafeTriggerType.rapidlyWorseningSymptoms:
        return 'Worsening symptoms — consider seeking care';
      default:
        return 'Support resources available';
    }
  }

  // ─── Acute symptom matching ────────────────────────────────────────────────

  static List<Recommendation> _buildAcuteItems(
      CycleLog? log, String phase, CycleSettings settings) {
    if (log == null) return [];
    final items = <Recommendation>[];
    final symptoms = log.allSymptoms.map((s) => s.toLowerCase()).toSet();

    if (symptoms.contains('cramps') || symptoms.contains('pelvic pain')) {
      items.add(_rec(
        id: 'acute_cramps',
        type: RecommendationType.ritual,
        contentId: 'ritual-warm-compress',
        title: 'Warm compress',
        summary: 'Gentle heat for cramp relief.',
        phrasing: 'You\'ve logged pain or cramps today. A warm compress on the abdomen '
            'or lower back can offer some comfort.',
        reason: 'User logged cramps or pelvic pain',
        priority: 10,
        phase: phase,
        conditions: ['condition-dysmenorrhea', 'condition-endometriosis'],
        settings: settings,
      ));
      items.add(_rec(
        id: 'acute_cramps_education',
        type: RecommendationType.education,
        contentId: 'lesson-painful-periods-basics',
        title: 'About painful periods',
        summary: 'What pain during your period can mean.',
        phrasing: 'Pain with periods is common, but severe or disrupting pain is worth '
            'understanding and tracking.',
        reason: 'User logged cramps — surface educational context',
        priority: 15,
        phase: phase,
        conditions: ['condition-dysmenorrhea'],
        settings: settings,
      ));
    }

    if (symptoms.contains('nausea') || symptoms.contains('bloating')) {
      items.add(_rec(
        id: 'acute_nausea',
        type: RecommendationType.food,
        contentId: 'food-ginger',
        title: 'Ginger for nausea',
        summary: 'A traditional support for digestive discomfort.',
        phrasing: 'Ginger tea or warm ginger broth is a gentle option when nausea or '
            'bloating are present.',
        reason: 'User logged nausea or bloating',
        priority: 12,
        phase: phase,
        settings: settings,
      ));
    }

    if (symptoms.contains('fatigue') || log.energy <= 3) {
      items.add(_rec(
        id: 'acute_fatigue',
        type: RecommendationType.food,
        contentId: 'food-protein-stable-breakfast',
        title: 'Blood-sugar stable eating',
        summary: 'Protein-forward meals can support low-energy days.',
        phrasing: 'On low-energy days, keeping blood sugar steady with protein at each '
            'meal may help.',
        reason: 'User logged fatigue or low energy',
        priority: 13,
        phase: phase,
        settings: settings,
      ));
    }

    if (symptoms.contains('insomnia') || symptoms.contains('poor sleep') || log.sleep <= 5) {
      items.add(_rec(
        id: 'acute_sleep',
        type: RecommendationType.ritual,
        contentId: 'ritual-evening-wind-down',
        title: 'Evening wind-down',
        summary: 'A gentle close to the day.',
        phrasing: 'Sleep has been difficult. A consistent wind-down — dim light, warmth, '
            'no screens — can signal rest to your nervous system.',
        reason: 'User logged poor sleep or low sleep hours',
        priority: 14,
        phase: phase,
        settings: settings,
      ));
    }

    if (symptoms.intersection({
      'low mood', 'irritability', 'rage', 'hopelessness', 'severe depression',
      'anxiety', 'mood swings', 'tearfulness',
    }).isNotEmpty) {
      items.add(_rec(
        id: 'acute_mood',
        type: RecommendationType.prompt,
        contentId: 'prompt-luteal-check-in',
        title: 'Gentle check-in',
        summary: 'A moment to notice what\'s present.',
        phrasing: 'Emotional weight is real. A brief journal or reflection can help '
            'you notice patterns without judgment.',
        reason: 'User logged mood symptoms',
        priority: 16,
        phase: phase,
        settings: settings,
      ));
      if (settings.pmddMode) {
        items.add(_rec(
          id: 'acute_pmdd_education',
          type: RecommendationType.education,
          contentId: 'lesson-pmdd-vs-pms',
          title: 'PMDD vs PMS',
          summary: 'Understanding the difference matters.',
          phrasing: 'If mood symptoms consistently disrupt your life in the second half '
              'of your cycle, learning more about PMDD may feel validating.',
          reason: 'PMDD mode + mood symptoms logged',
          priority: 11,
          phase: phase,
          conditions: ['condition-pmdd'],
          settings: settings,
        ));
      }
    }

    if (log.flow == 'heavy' || log.flow == 'very heavy') {
      items.add(_rec(
        id: 'acute_heavy_bleeding',
        type: RecommendationType.education,
        contentId: 'lesson-heavy-bleeding-basics',
        title: 'About heavy bleeding',
        summary: 'Understanding what counts as heavy and when to seek care.',
        phrasing: 'You\'ve logged heavy bleeding today. Understanding what\'s typical '
            'versus when to seek care is important.',
        reason: 'User logged heavy flow',
        priority: 10,
        phase: phase,
        conditions: ['condition-heavy-menstrual-bleeding'],
        settings: settings,
      ));
    }

    return items;
  }

  // ─── Phase-based content ───────────────────────────────────────────────────

  static List<Recommendation> _buildPhaseItems(
      String phase, bool inPmddWindow, CycleSettings settings) {
    final items = <Recommendation>[];

    switch (phase) {
      case 'menstrual':
        items.addAll([
          _rec(
            id: 'phase_menstrual_rest',
            type: RecommendationType.ritual,
            contentId: 'ritual-menstrual-nesting',
            title: 'Menstrual nesting',
            summary: 'Permission to slow down.',
            phrasing: 'This is a natural time to turn inward. Rest is not laziness — '
                'it\'s your body doing important work.',
            reason: 'Menstrual phase — rest ritual',
            priority: 30,
            phase: phase,
            settings: settings,
          ),
          _rec(
            id: 'phase_menstrual_iron',
            type: RecommendationType.food,
            contentId: 'food-iron-support-meals',
            title: 'Iron-supporting foods',
            summary: 'Nourishing your body during bleeding.',
            phrasing: 'During your period, iron-rich foods — dark leafy greens, lentils, '
                'or red meat if you eat it — can help replenish what\'s lost.',
            reason: 'Menstrual phase — iron support',
            priority: 31,
            phase: phase,
            settings: settings,
          ),
        ]);
        break;
      case 'follicular':
        items.addAll([
          _rec(
            id: 'phase_follicular_energy',
            type: RecommendationType.lesson,
            contentId: 'lesson-what-is-the-menstrual-cycle',
            title: 'Your cycle, explained',
            summary: 'Understanding what\'s happening in your body right now.',
            phrasing: 'Energy often builds in the follicular phase. This is a good time '
                'to learn more about your cycle.',
            reason: 'Follicular phase — educational content',
            priority: 30,
            phase: phase,
            settings: settings,
          ),
        ]);
        break;
      case 'ovulatory':
        items.addAll([
          _rec(
            id: 'phase_ovulatory_tracking',
            type: RecommendationType.lesson,
            contentId: 'lesson-ovulation-basics',
            title: 'Ovulation basics',
            summary: 'What\'s happening at peak vitality.',
            phrasing: 'You\'re in or near your ovulatory window. Energy and social ease '
                'often peak here.',
            reason: 'Ovulatory phase — phase education',
            priority: 30,
            phase: phase,
            settings: settings,
          ),
          if (settings.ttcMode)
            _rec(
              id: 'phase_ovulatory_ttc',
              type: RecommendationType.education,
              contentId: 'lesson-fertility-awareness-basics',
              title: 'Fertile window awareness',
              summary: 'Your most fertile days are near.',
              phrasing: 'You may be in or approaching your fertile window. If you\'re '
                  'trying to conceive, this is an important time to be aware of.',
              reason: 'Ovulatory phase + TTC mode',
              priority: 28,
              phase: phase,
              conditions: [],
              settings: settings,
            ),
        ]);
        break;
      case 'luteal':
        items.addAll([
          _rec(
            id: 'phase_luteal_slowdown',
            type: RecommendationType.ritual,
            contentId: 'ritual-soft-luteal-day',
            title: 'Soft luteal day',
            summary: 'Intentional gentleness as energy shifts.',
            phrasing: 'The luteal phase often asks for less — and that\'s okay. '
                'Softer plans and more margin can make a real difference.',
            reason: 'Luteal phase — slowdown ritual',
            priority: 30,
            phase: phase,
            settings: settings,
          ),
          _rec(
            id: 'phase_luteal_magnesium',
            type: RecommendationType.food,
            contentId: 'food-magnesium-rich-foods',
            title: 'Magnesium-rich foods',
            summary: 'A mineral that supports the second half of your cycle.',
            phrasing: 'Magnesium — found in dark chocolate, pumpkin seeds, and leafy greens — '
                'is often helpful during the luteal phase.',
            reason: 'Luteal phase — magnesium support',
            priority: 32,
            phase: phase,
            settings: settings,
          ),
        ]);
        if (inPmddWindow) {
          items.add(_rec(
            id: 'phase_pmdd_window',
            type: RecommendationType.education,
            contentId: 'lesson-pmdd-vs-pms',
            title: 'PMDD vs PMS',
            summary: 'Understanding severe luteal symptoms.',
            phrasing: 'You may be in a PMDD-risk window. If symptoms feel severe or '
                'disruptive, that\'s worth noting and tracking.',
            reason: 'In PMDD window during luteal phase',
            priority: 25,
            phase: phase,
            conditions: ['condition-pmdd'],
            settings: settings,
          ));
        }
        break;
    }

    return items;
  }

  // ─── Mode-specific content ─────────────────────────────────────────────────

  static List<Recommendation> _buildModeItems(
      CycleSettings settings, String phase, bool inPmddWindow) {
    final items = <Recommendation>[];

    if (settings.endoMode) {
      items.add(_rec(
        id: 'mode_endo_education',
        type: RecommendationType.education,
        contentId: 'lesson-endometriosis-basics',
        title: 'Endometriosis basics',
        summary: 'Understanding endo and how to advocate for yourself.',
        phrasing: 'Living with endometriosis takes a particular kind of self-knowledge. '
            'Here\'s a grounded overview.',
        reason: 'Endometriosis mode active',
        priority: 50,
        phase: phase,
        conditions: ['condition-endometriosis'],
        settings: settings,
      ));
    }

    if (settings.pregnancyMode) {
      items.add(_rec(
        id: 'mode_pregnancy_exercise',
        type: RecommendationType.lesson,
        contentId: 'lesson-pregnancy-exercise-basics',
        title: 'Movement during pregnancy',
        summary: 'ACOG-informed movement guidance.',
        phrasing: 'Gentle movement is generally encouraged during pregnancy. Here\'s '
            'what ACOG recommends as a starting point.',
        reason: 'Pregnancy mode active',
        priority: 48,
        phase: phase,
        settings: settings,
        pregnancySafe: true,
      ));
    }

    if (settings.postpartumMode) {
      items.add(_rec(
        id: 'mode_postpartum_return',
        type: RecommendationType.lesson,
        contentId: 'lesson-postpartum-cycle-return',
        title: 'When your cycle returns',
        summary: 'What to expect as your cycle comes back postpartum.',
        phrasing: 'After birth, cycle return varies widely. Here\'s what\'s considered '
            'typical and what\'s worth mentioning to a provider.',
        reason: 'Postpartum mode active',
        priority: 50,
        phase: phase,
        settings: settings,
      ));
    }

    if (settings.ttcMode && phase == 'luteal') {
      items.add(_rec(
        id: 'mode_ttc_luteal',
        type: RecommendationType.education,
        contentId: 'lesson-luteal-phase-basics',
        title: 'Luteal phase awareness for TTC',
        summary: 'Understanding the two-week wait.',
        phrasing: 'The luteal phase can feel uncertain when you\'re trying to conceive. '
            'Understanding what\'s normal here may help.',
        reason: 'TTC mode + luteal phase',
        priority: 50,
        phase: phase,
        settings: settings,
      ));
    }

    return items;
  }

  // ─── Pattern-based content ────────────────────────────────────────────────

  static List<Recommendation> _buildPatternItems(
      SymptomPattern pattern, String phase, CycleSettings settings) {
    if (pattern.cycleCount < 2) return [];
    final items = <Recommendation>[];

    final topForPhase = pattern.topSymptomsByPhase[phase] ?? [];
    if (topForPhase.contains('insomnia') || topForPhase.contains('poor sleep')) {
      items.add(_rec(
        id: 'pattern_sleep',
        type: RecommendationType.ritual,
        contentId: 'ritual-evening-wind-down',
        title: 'Evening wind-down',
        summary: 'Your patterns suggest sleep often dips here.',
        phrasing: 'Your recent logs show sleep tends to be harder during this phase. '
            'A consistent wind-down routine may help.',
        reason: 'Historical pattern: sleep dips in this phase',
        priority: 70,
        phase: phase,
        settings: settings,
      ));
    }

    final topCareActions = pattern.careActionEnergyCorrelation.entries
        .where((e) => e.value > 6.0)
        .map((e) => e.key)
        .take(2)
        .toList();
    if (topCareActions.isNotEmpty) {
      items.add(Recommendation(
        id: 'pattern_care_effective',
        type: RecommendationType.ritual,
        contentId: topCareActions.first,
        title: 'A support that\'s helped before',
        summary: 'Based on your logs.',
        phrasing: 'Based on your logs, ${topCareActions.first} has often coincided with '
            'higher energy days. It may be worth returning to.',
        reason: 'Historical effectiveness: care action correlates with better energy',
        priority: 72,
        phaseAlignment: phase,
      ));
    }

    return items;
  }

  // ─── Default discovery ────────────────────────────────────────────────────

  static List<Recommendation> _defaultDiscovery(String phase, CycleSettings settings) {
    return [
      _rec(
        id: 'default_breath',
        type: RecommendationType.ritual,
        contentId: 'ritual-breath-reset',
        title: 'Breath reset',
        summary: 'A short grounding practice.',
        phrasing: 'Even two minutes of slow breathing can shift the nervous system. '
            'Worth trying on harder days.',
        reason: 'Default discovery — always available',
        priority: 90,
        phase: phase,
        settings: settings,
      ),
      _rec(
        id: 'default_cycle_checkin',
        type: RecommendationType.prompt,
        contentId: 'ritual-cycle-check-in',
        title: 'Cycle check-in',
        summary: 'A moment to notice where you are.',
        phrasing: 'A brief check-in — how is your body? how is your mood? — builds '
            'awareness over time.',
        reason: 'Default discovery — always available',
        priority: 92,
        phase: phase,
        settings: settings,
      ),
    ];
  }

  // ─── Factory helper ───────────────────────────────────────────────────────

  static Recommendation _rec({
    required String id,
    required RecommendationType type,
    required String contentId,
    required String title,
    required String summary,
    required String phrasing,
    required String reason,
    required int priority,
    required String phase,
    required CycleSettings settings,
    List<String> conditions = const [],
    bool pregnancySafe = true,
    bool ttcSafe = true,
  }) {
    return Recommendation(
      id: id,
      type: type,
      contentId: contentId,
      title: title,
      summary: summary,
      phrasing: phrasing,
      reason: reason,
      priority: priority,
      phaseAlignment: phase,
      conditionRelevant: conditions,
      pregnancySafe: pregnancySafe,
      ttcSafe: ttcSafe,
    );
  }
}

extension _SetIntersection on Set<String> {
  Set<String> intersection(Set<String> other) =>
      where((e) => other.contains(e)).toSet();
}
