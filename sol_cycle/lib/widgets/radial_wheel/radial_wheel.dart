import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../providers/cycle_provider.dart';
import '../../providers/calendar_provider.dart';
import '../../services/cycle_service.dart';
import 'wheel_painter.dart';

class RadialWheel extends ConsumerStatefulWidget {
  final void Function(DateTime)? onDateSelect;

  const RadialWheel({super.key, this.onDateSelect});

  @override
  ConsumerState<RadialWheel> createState() => _RadialWheelState();
}

class _RadialWheelState extends ConsumerState<RadialWheel>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnim = CurvedAnimation(parent: _controller, curve: Curves.easeOutBack);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final calendar = ref.watch(calendarProvider);
    final cycle = ref.watch(cycleProvider);

    final isIFC = calendar.calendarSystem == CalendarSystem.ifc;
    final segmentCount = isIFC ? 13 : 12;
    final colors = isIFC
        ? SolColors.wheelColors
        : SolColors.wheelColors.where((c) => c != SolColors.wheelColors[6]).toList();

    final labels = isIFC
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Sol', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    final phaseInfo = cycle.currentPhase != null ? phaseInfoMap[cycle.currentPhase] : null;

    return Column(
      children: [
        // Phase badge
        if (phaseInfo != null)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: Color(phaseInfo.colorLight),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Color(phaseInfo.color).withOpacity(0.4)),
            ),
            child: Text(
              'Day ${cycle.cycleDay} · ${phaseInfo.name}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2B2B2B),
                letterSpacing: 0.3,
              ),
            ),
          ),

        // The wheel
        ScaleTransition(
          scale: _scaleAnim,
          child: GestureDetector(
            onTap: () => widget.onDateSelect?.call(calendar.currentDate),
            child: AspectRatio(
              aspectRatio: 1,
              child: CustomPaint(
                painter: WheelPainter(
                  segmentCount: segmentCount,
                  currentSegment: calendar.currentMonth,
                  segmentColors: colors,
                  segmentLabels: labels,
                  cycleDay: cycle.cycleDay,
                  cycleLength: cycle.settings.averageCycleLength,
                  periodLength: cycle.settings.averagePeriodLength,
                  moonIllumination: calendar.moonPhase.illumination,
                  moonPhase: calendar.moonPhase.phase,
                  displayMonth: calendar.displayMonth,
                  displayDay: calendar.displayDay,
                  displayYear: calendar.displayYear,
                  phase: cycle.currentPhase,
                ),
              ),
            ),
          ),
        ),

        // Calendar system toggle
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => ref.read(calendarProvider.notifier).toggleCalendarSystem(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: SolColors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: SolColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  calendar.calendarSystem == CalendarSystem.gregorian
                      ? '12-month view'
                      : '13-month · Sol calendar',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: SolColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 6),
                const Icon(Icons.swap_horiz, size: 14, color: SolColors.textMuted),
              ],
            ),
          ),
        ),

        // Moon phase indicator
        const SizedBox(height: 8),
        Text(
          '${calendar.moonPhase.emoji}  ${calendar.moonPhase.name}  ·  ${calendar.moonPhase.illumination.toInt()}% illuminated',
          style: const TextStyle(
            fontSize: 12,
            color: SolColors.textMuted,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }
}
