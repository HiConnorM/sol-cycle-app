import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../providers/cycle_provider.dart';
import '../../services/storage_service.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  final VoidCallback onComplete;
  const OnboardingScreen({super.key, required this.onComplete});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _pageCtrl = PageController();
  int _page = 0;

  String _name = '';
  int _cycleLength = 28;
  int _periodLength = 5;
  DateTime? _lastPeriodDate;
  bool _pmddMode = false;
  bool _endoMode = false;

  void _next() {
    if (_page < 4) {
      _pageCtrl.nextPage(duration: const Duration(milliseconds: 350), curve: Curves.easeInOut);
    } else {
      _complete();
    }
  }

  void _back() {
    _pageCtrl.previousPage(duration: const Duration(milliseconds: 350), curve: Curves.easeInOut);
  }

  Future<void> _complete() async {
    final settings = ref.read(cycleProvider).settings.copyWith(
      averageCycleLength: _cycleLength,
      averagePeriodLength: _periodLength,
      lastPeriodStart: _lastPeriodDate != null
          ? '${_lastPeriodDate!.year}-${_lastPeriodDate!.month.toString().padLeft(2, '0')}-${_lastPeriodDate!.day.toString().padLeft(2, '0')}'
          : null,
      pmddMode: _pmddMode,
      endoMode: _endoMode,
      name: _name,
    );
    await ref.read(cycleProvider.notifier).updateSettings(settings);
    await StorageService.setOnboarded();
    widget.onComplete();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SolColors.background,
      body: Stack(
        children: [
          PageView(
            controller: _pageCtrl,
            physics: const NeverScrollableScrollPhysics(),
            onPageChanged: (p) => setState(() => _page = p),
            children: [
              _WelcomePage(onNext: _next),
              _NamePage(name: _name, onChanged: (v) => setState(() => _name = v), onNext: _next),
              _CyclePage(
                cycleLength: _cycleLength,
                periodLength: _periodLength,
                onCycleChanged: (v) => setState(() => _cycleLength = v),
                onPeriodChanged: (v) => setState(() => _periodLength = v),
                onNext: _next,
              ),
              _LastPeriodPage(
                selected: _lastPeriodDate,
                onSelected: (d) => setState(() => _lastPeriodDate = d),
                onNext: _next,
                onSkip: _next,
              ),
              _CarePage(
                pmddMode: _pmddMode,
                endoMode: _endoMode,
                onPmddChanged: (v) => setState(() => _pmddMode = v),
                onEndoChanged: (v) => setState(() => _endoMode = v),
                onComplete: _complete,
              ),
            ],
          ),

          // Progress dots
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: i == _page ? 20 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: i == _page ? SolColors.primary : SolColors.border,
                  borderRadius: BorderRadius.circular(3),
                ),
              )),
            ),
          ),

          // Back button
          if (_page > 0)
            Positioned(
              top: 60,
              left: 20,
              child: IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: SolColors.textSecondary),
                onPressed: _back,
              ),
            ),
        ],
      ),
    );
  }
}

class _WelcomePage extends StatelessWidget {
  final VoidCallback onNext;
  const _WelcomePage({required this.onNext});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              gradient: const RadialGradient(colors: [Color(0xFFEAD9A0), Color(0xFFC6A882)]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: SolColors.primary.withOpacity(0.3), blurRadius: 30, offset: const Offset(0, 8))],
            ),
            child: const Center(child: Text('☀', style: TextStyle(fontSize: 48))),
          ),
          const SizedBox(height: 40),
          const Text('Sol Cycle', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: SolColors.textPrimary, letterSpacing: -1)),
          const SizedBox(height: 12),
          const Text(
            'A private, intelligent cycle companion\nbuilt around your natural rhythm.',
            style: TextStyle(fontSize: 16, color: SolColors.textSecondary, height: 1.6),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 60),
          _OnboardingButton(label: 'Begin', onTap: onNext),
          const SizedBox(height: 16),
          const Text(
            'Your data lives on your device.\nNothing leaves without your permission.',
            style: TextStyle(fontSize: 12, color: SolColors.textMuted, height: 1.5),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _NamePage extends StatelessWidget {
  final String name;
  final ValueChanged<String> onChanged;
  final VoidCallback onNext;
  const _NamePage({required this.name, required this.onChanged, required this.onNext});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 100, 32, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('What should\nwe call you?', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: SolColors.textPrimary, height: 1.2)),
          const SizedBox(height: 8),
          const Text('Optional — this stays on your device.', style: TextStyle(fontSize: 14, color: SolColors.textMuted)),
          const SizedBox(height: 40),
          TextField(
            onChanged: onChanged,
            autofocus: true,
            decoration: const InputDecoration(hintText: 'Your name or nickname'),
            style: const TextStyle(fontSize: 18, color: SolColors.textPrimary),
          ),
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(onPressed: onNext, child: const Text('Skip')),
              _OnboardingButton(label: 'Continue', onTap: onNext),
            ],
          ),
        ],
      ),
    );
  }
}

class _CyclePage extends StatelessWidget {
  final int cycleLength;
  final int periodLength;
  final ValueChanged<int> onCycleChanged;
  final ValueChanged<int> onPeriodChanged;
  final VoidCallback onNext;

  const _CyclePage({
    required this.cycleLength,
    required this.periodLength,
    required this.onCycleChanged,
    required this.onPeriodChanged,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 100, 32, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Your cycle rhythm', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: SolColors.textPrimary, height: 1.2)),
          const SizedBox(height: 8),
          const Text('You can always update this later.', style: TextStyle(fontSize: 14, color: SolColors.textMuted)),
          const SizedBox(height: 40),

          _SliderField(
            label: 'Cycle length',
            value: cycleLength,
            suffix: 'days',
            min: 21, max: 45,
            color: SolColors.primary,
            onChanged: onCycleChanged,
          ),
          const SizedBox(height: 28),
          _SliderField(
            label: 'Period length',
            value: periodLength,
            suffix: 'days',
            min: 2, max: 10,
            color: SolColors.menstrual,
            onChanged: onPeriodChanged,
          ),

          const Spacer(),
          Align(alignment: Alignment.centerRight, child: _OnboardingButton(label: 'Continue', onTap: onNext)),
        ],
      ),
    );
  }
}

class _LastPeriodPage extends StatelessWidget {
  final DateTime? selected;
  final ValueChanged<DateTime> onSelected;
  final VoidCallback onNext;
  final VoidCallback onSkip;

  const _LastPeriodPage({required this.selected, required this.onSelected, required this.onNext, required this.onSkip});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 100, 32, 32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('When did your last\nperiod start?', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: SolColors.textPrimary, height: 1.2)),
          const SizedBox(height: 8),
          const Text('This helps us calculate where you are in your cycle.', style: TextStyle(fontSize: 14, color: SolColors.textMuted, height: 1.4)),
          const SizedBox(height: 40),

          GestureDetector(
            onTap: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: DateTime.now().subtract(const Duration(days: 14)),
                firstDate: DateTime.now().subtract(const Duration(days: 90)),
                lastDate: DateTime.now(),
              );
              if (date != null) onSelected(date);
            },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: selected != null ? SolColors.primaryLight : SolColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: selected != null ? SolColors.primary : SolColors.border, width: selected != null ? 1.5 : 1),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_rounded, color: SolColors.primary),
                  const SizedBox(width: 12),
                  Text(
                    selected != null
                        ? '${selected!.day} / ${selected!.month} / ${selected!.year}'
                        : 'Tap to select a date',
                    style: TextStyle(fontSize: 16, color: selected != null ? SolColors.textPrimary : SolColors.textMuted, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ),

          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(onPressed: onSkip, child: const Text('Skip for now')),
              _OnboardingButton(
                label: selected != null ? 'Continue' : 'Skip',
                onTap: selected != null ? onNext : onSkip,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CarePage extends StatelessWidget {
  final bool pmddMode;
  final bool endoMode;
  final ValueChanged<bool> onPmddChanged;
  final ValueChanged<bool> onEndoChanged;
  final VoidCallback onComplete;

  const _CarePage({
    required this.pmddMode,
    required this.endoMode,
    required this.onPmddChanged,
    required this.onEndoChanged,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 100, 32, 80),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Your care needs', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: SolColors.textPrimary, height: 1.2)),
          const SizedBox(height: 8),
          const Text('Enable deeper support modes. You can change these anytime.', style: TextStyle(fontSize: 14, color: SolColors.textMuted, height: 1.4)),
          const SizedBox(height: 40),

          _CareToggleCard(
            emoji: '🧠',
            title: 'PMDD Mode',
            description: 'Predicts your harder windows, tracks emotional patterns, and surfaces support before tough days.',
            color: SolColors.luteal,
            value: pmddMode,
            onChanged: onPmddChanged,
          ),
          const SizedBox(height: 16),
          _CareToggleCard(
            emoji: '🌿',
            title: 'Endometriosis Mode',
            description: 'Tracks flares, pain location, bowel and bladder symptoms, and builds clinician-ready reports.',
            color: SolColors.menstrual,
            value: endoMode,
            onChanged: onEndoChanged,
          ),

          const Spacer(),
          _OnboardingButton(label: 'Enter Sol Cycle →', onTap: onComplete),
        ],
      ),
    );
  }
}

class _CareToggleCard extends StatelessWidget {
  final String emoji;
  final String title;
  final String description;
  final Color color;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _CareToggleCard({
    required this.emoji,
    required this.title,
    required this.description,
    required this.color,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: value ? color.withOpacity(0.08) : SolColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: value ? color.withOpacity(0.4) : SolColors.border, width: value ? 1.5 : 1),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
                const SizedBox(height: 3),
                Text(description, style: const TextStyle(fontSize: 12, color: SolColors.textSecondary, height: 1.4)),
              ],
            ),
          ),
          Switch(value: value, onChanged: onChanged, activeColor: SolColors.primary),
        ],
      ),
    );
  }
}

class _SliderField extends StatelessWidget {
  final String label;
  final int value;
  final String suffix;
  final int min;
  final int max;
  final Color color;
  final ValueChanged<int> onChanged;

  const _SliderField({
    required this.label,
    required this.value,
    required this.suffix,
    required this.min,
    required this.max,
    required this.color,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: SolColors.textSecondary)),
            Text('$value $suffix', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: color)),
          ],
        ),
        Slider(
          value: value.toDouble(),
          min: min.toDouble(), max: max.toDouble(),
          divisions: max - min,
          activeColor: color,
          inactiveColor: SolColors.border,
          onChanged: (v) => onChanged(v.toInt()),
        ),
      ],
    );
  }
}

class _OnboardingButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _OnboardingButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
        decoration: BoxDecoration(
          color: SolColors.textPrimary,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.2)),
      ),
    );
  }
}
