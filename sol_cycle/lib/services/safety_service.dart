import 'dart:math';
import '../models/cycle_log.dart';
import '../models/safety_event.dart';

/// Strings that trigger suicidal-thought detection across any symptom field.
const _suicidalKeywords = {
  'suicidal thoughts',
  'wanting to die',
  'thoughts of suicide',
  'self-harm',
  'hurting myself',
  'not wanting to be here',
};

/// Strings that trigger severe-depression detection.
const _severeMoodKeywords = {
  'severe depression',
  'hopelessness',
  'complete hopelessness',
  'can\'t function',
  'cannot function',
  'severe hopelessness',
  'severe anxiety',
  'rage',
};

/// PMDD-specific crisis indicators.
const _pmddCrisisKeywords = {
  'pmdd crisis',
  'pmdd rage',
  'out of control',
  'dissociation',
  'severe mood swings',
};

/// Physical symptoms that, when combined with heavy flow + low energy,
/// warrant the heavyBleedingWithDistress trigger.
const _bleedingDistressSymptoms = {'dizziness', 'fainting', 'lightheaded', 'weakness'};

/// Physical symptoms that alone trigger the fainting trigger.
const _faintingSymptoms = {'fainting', 'passed out', 'loss of consciousness'};

/// Pregnancy-concern keywords scanned in notes + physical symptoms.
const _pregnancyKeywords = {
  'pregnancy',
  'pregnant',
  'miscarriage',
  'bleeding while pregnant',
  'spotting while pregnant',
  'cramping while pregnant',
};

/// Rapid worsening pattern — pain >= 9 AND energy <= 2 AND flow is heavy.
const _heavyFlowValues = {'heavy', 'very heavy'};

class SafetyCheckResult {
  final List<SafetyEvent> events;

  const SafetyCheckResult({required this.events});

  bool get hasUrgent =>
      events.any((e) => e.triggerLevel == SafeTriggerLevel.urgent);
  bool get hasCaution =>
      events.any((e) => e.triggerLevel == SafeTriggerLevel.caution);
  bool get hasWatch =>
      events.any((e) => e.triggerLevel == SafeTriggerLevel.watch);
  bool get hasAnyEvent => events.isNotEmpty;

  SafeTriggerLevel? get highestLevel {
    if (hasUrgent) return SafeTriggerLevel.urgent;
    if (hasCaution) return SafeTriggerLevel.caution;
    if (hasWatch) return SafeTriggerLevel.watch;
    return null;
  }
}

class SafetyService {
  static SafetyCheckResult evaluate(CycleLog log) {
    final events = <SafetyEvent>[];
    final allText = _allText(log);

    // 1. Suicidal thought — urgent
    if (_containsAny(allText, _suicidalKeywords)) {
      events.add(_makeEvent(log, SafeTriggerType.suicidalThought, SafeTriggerLevel.urgent, [
        'safety-crisis-mental-health',
        'safety-988-lifeline',
        'safety-pmdd-crisis',
      ]));
    }

    // 2. PMDD crisis — urgent if any pmddCrisisKeyword found in PMDD symptoms field
    if (_containsAny(log.pmddSymptoms.join(' ').toLowerCase(), _pmddCrisisKeywords)) {
      events.add(_makeEvent(log, SafeTriggerType.pmddCrisis, SafeTriggerLevel.urgent, [
        'safety-pmdd-crisis',
        'safety-crisis-mental-health',
      ]));
    }

    // 3. Severe depression — caution; escalate to urgent if combined with pmdd crisis event
    final hasSevereMood = _containsAny(allText, _severeMoodKeywords);
    final hasPmddCrisis = events.any((e) => e.triggerType == SafeTriggerType.pmddCrisis);
    if (hasSevereMood) {
      final level = hasPmddCrisis ? SafeTriggerLevel.urgent : SafeTriggerLevel.caution;
      events.add(_makeEvent(log, SafeTriggerType.severeDepression, level, [
        'safety-severe-mood',
        'safety-seek-mental-health-care',
      ]));
    }

    // 4. Fainting alone — urgent
    if (_containsAny(log.physicalSymptoms.join(' ').toLowerCase(), _faintingSymptoms)) {
      events.add(_makeEvent(log, SafeTriggerType.fainting, SafeTriggerLevel.urgent, [
        'safety-fainting',
        'safety-seek-care-now',
      ]));
    }

    // 5. Heavy bleeding with distress — urgent
    final isHeavyFlow = _heavyFlowValues.contains(log.flow.toLowerCase());
    final hasBleedingDistress = log.physicalSymptoms
        .any((s) => _bleedingDistressSymptoms.contains(s.toLowerCase()));
    if (isHeavyFlow && (hasBleedingDistress || log.energy <= 2)) {
      events.add(_makeEvent(
          log, SafeTriggerType.heavyBleedingWithDistress, SafeTriggerLevel.urgent, [
        'safety-heavy-bleeding',
        'safety-anemia-awareness',
        'safety-seek-care-now',
      ]));
    }

    // 6. Severe pain + inability to function — caution
    final hasLowFunction = log.painLevel >= 8 && log.energy <= 2;
    if (hasLowFunction) {
      events.add(_makeEvent(log, SafeTriggerType.severePain, SafeTriggerLevel.caution, [
        'safety-severe-pain',
        'safety-endometriosis-awareness',
      ]));
    }

    // 7. Pregnancy concern — caution
    if (_containsAny(allText, _pregnancyKeywords)) {
      events.add(_makeEvent(log, SafeTriggerType.pregnancyConcern, SafeTriggerLevel.caution, [
        'safety-pregnancy-concern',
        'safety-mothertobaby',
        'safety-seek-ob-care',
      ]));
    }

    // 8. Rapidly worsening — watch; escalate if multiple serious flags
    final isRapidlyWorsening = isHeavyFlow && log.painLevel >= 9 && log.energy <= 2;
    if (isRapidlyWorsening) {
      events.add(_makeEvent(
          log, SafeTriggerType.rapidlyWorseningSymptoms, SafeTriggerLevel.caution, [
        'safety-worsening-symptoms',
        'safety-seek-care-soon',
      ]));
    }

    return SafetyCheckResult(events: events);
  }

  /// Returns the user-facing safety message appropriate for the highest trigger level.
  static String safetyMessage(SafeTriggerLevel level) {
    switch (level) {
      case SafeTriggerLevel.urgent:
        return 'Something you logged today may need more support than this app can offer. '
            'Please reach out to a healthcare provider or crisis resource. You deserve real care.';
      case SafeTriggerLevel.caution:
        return 'Some of what you\'re experiencing warrants attention beyond self-care. '
            'We\'ve noted some resources below. Please consider reaching out to a provider.';
      case SafeTriggerLevel.watch:
        return 'We noticed some patterns worth keeping an eye on. '
            'If things feel harder than usual, care and support are available.';
    }
  }

  /// Returns the one-line phrase shown inline on the Today screen.
  static String inlineNote(SafeTriggerType type) {
    switch (type) {
      case SafeTriggerType.suicidalThought:
        return 'Please reach out — you don\'t have to hold this alone.';
      case SafeTriggerType.severeDepression:
        return 'Severe mood symptoms deserve real support, not just self-care.';
      case SafeTriggerType.pmddCrisis:
        return 'PMDD can reach a crisis level. Support resources are here.';
      case SafeTriggerType.heavyBleedingWithDistress:
        return 'Heavy bleeding with these symptoms may need medical attention.';
      case SafeTriggerType.fainting:
        return 'Fainting is a reason to seek care today.';
      case SafeTriggerType.severePain:
        return 'Pain this intense — especially if recurring — is worth discussing with a provider.';
      case SafeTriggerType.pregnancyConcern:
        return 'If you\'re concerned about a pregnancy, please contact a healthcare provider.';
      case SafeTriggerType.rapidlyWorseningSymptoms:
        return 'If symptoms are rapidly worsening, please seek care.';
    }
  }

  static String _allText(CycleLog log) {
    return [
      ...log.physicalSymptoms,
      ...log.emotionalSymptoms,
      ...log.pmddSymptoms,
      ...log.moods,
      log.notes,
      log.journalEntry ?? '',
    ].join(' ').toLowerCase();
  }

  static bool _containsAny(String text, Set<String> keywords) =>
      keywords.any((kw) => text.contains(kw));

  static SafetyEvent _makeEvent(
    CycleLog log,
    SafeTriggerType type,
    SafeTriggerLevel level,
    List<String> resources,
  ) {
    return SafetyEvent(
      id: '${log.date}_${type.name}_${Random().nextInt(99999)}',
      triggeredAt: DateTime.now(),
      logDate: log.date,
      triggerType: type,
      triggerLevel: level,
      resourcesShown: resources,
    );
  }
}
