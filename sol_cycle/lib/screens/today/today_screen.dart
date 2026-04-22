import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../providers/cycle_provider.dart';
import '../../providers/calendar_provider.dart';
import '../../services/cycle_service.dart';
import '../../services/moon_service.dart';
import '../../services/phase_content.dart';
import '../../widgets/radial_wheel/radial_wheel.dart';
import '../../widgets/insight_card.dart';
import '../log/log_sheet.dart';

class TodayScreen extends ConsumerStatefulWidget {
  const TodayScreen({super.key});

  @override
  ConsumerState<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends ConsumerState<TodayScreen> {
  String _greeting = 'Welcome';

  @override
  void initState() {
    super.initState();
    final hour = DateTime.now().hour;
    if (hour < 12) _greeting = 'Good morning';
    else if (hour < 17) _greeting = 'Good afternoon';
    else _greeting = 'Good evening';
  }

  void _openLogSheet(DateTime date) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LogSheet(date: date),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cycle = ref.watch(cycleProvider);
    final calendar = ref.watch(calendarProvider);
    final phase = cycle.currentPhase;
    final phaseInfo = phase != null ? phaseInfoMap[phase] : null;
    final recommendations = phase != null
        ? getPhaseRecommendations(phase, inPmddWindow: cycle.inPmddWindow)
        : null;
    final moonData = calendar.moonPhase;

    String statusText = '';
    if (cycle.cycleDay == null) {
      statusText = 'Start tracking your cycle';
    } else if (cycle.daysUntilPeriod != null && cycle.daysUntilPeriod! <= 3) {
      statusText = 'Period expected in ${cycle.daysUntilPeriod} day${cycle.daysUntilPeriod == 1 ? '' : 's'}';
    } else if (cycle.inPmddWindow) {
      statusText = 'PMDD window — take extra care of yourself';
    } else if (phaseInfo != null) {
      statusText = phaseInfo.description;
    }

    return Scaffold(
      backgroundColor: SolColors.background,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverAppBar(
            pinned: true,
            backgroundColor: SolColors.background,
            elevation: 0,
            expandedHeight: 0,
            toolbarHeight: 64,
            title: Row(
              children: [
                const _SolLogo(),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Sol Cycle', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
                    Text(_greeting, style: const TextStyle(fontSize: 12, color: SolColors.textMuted)),
                  ],
                ),
              ],
            ),
            actions: [
              if (phaseInfo != null)
                Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Color(phaseInfo.colorLight),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    'Day ${cycle.cycleDay}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: SolColors.textPrimary),
                  ),
                ),
              IconButton(
                icon: const Icon(Icons.menu_rounded, color: SolColors.textPrimary),
                onPressed: Scaffold.of(context).openDrawer,
              ),
            ],
            bottom: statusText.isNotEmpty
                ? PreferredSize(
                    preferredSize: const Size.fromHeight(32),
                    child: Container(
                      width: double.infinity,
                      color: cycle.inPmddWindow ? SolColors.pmddWarningLight : SolColors.surface,
                      padding: const EdgeInsets.symmetric(vertical: 7),
                      child: Text(
                        statusText,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: cycle.inPmddWindow ? const Color(0xFF8B3A3A) : SolColors.textSecondary,
                        ),
                      ),
                    ),
                  )
                : null,
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([
                // Radial Wheel
                RadialWheel(onDateSelect: _openLogSheet),

                const SizedBox(height: 28),

                // Moon phase card
                InsightCard(
                  title: 'MOON PHASE',
                  label: moonData.name,
                  icon: Text(moonData.emoji, style: const TextStyle(fontSize: 14)),
                  variant: InsightCardVariant.subtle,
                  child: Text(
                    MoonService.getMoonInsight(moonData.phase),
                    style: const TextStyle(fontSize: 14, color: SolColors.textSecondary, height: 1.55),
                  ),
                ),

                if (recommendations != null) ...[
                  const SizedBox(height: 12),

                  // Today's insight
                  InsightCard(
                    title: 'TODAY\'S INSIGHT',
                    label: phaseInfo?.name,
                    phase: phase,
                    variant: InsightCardVariant.highlight,
                    icon: const Icon(Icons.auto_awesome_rounded, size: 14, color: SolColors.primary),
                    child: Text(recommendations.insight, style: const TextStyle(fontSize: 14, color: SolColors.textPrimary, height: 1.6)),
                  ),
                  const SizedBox(height: 12),

                  // Nourishment
                  InsightCard(
                    title: 'NOURISHMENT',
                    icon: const Icon(Icons.restaurant_menu_rounded, size: 14, color: SolColors.textMuted),
                    child: BulletList(items: recommendations.foods),
                  ),
                  const SizedBox(height: 12),

                  // Movement
                  InsightCard(
                    title: 'MOVEMENT',
                    icon: const Icon(Icons.directions_walk_rounded, size: 14, color: SolColors.textMuted),
                    child: BulletList(items: recommendations.exercises),
                  ),
                  const SizedBox(height: 12),

                  // Self-care
                  InsightCard(
                    title: 'SELF-CARE',
                    icon: const Icon(Icons.favorite_rounded, size: 14, color: SolColors.textMuted),
                    child: BulletList(items: recommendations.rituals),
                  ),
                ],

                // PMDD support
                if (cycle.inPmddWindow && recommendations?.pmddSupport != null) ...[
                  const SizedBox(height: 12),
                  InsightCard(
                    title: 'PMDD SUPPORT',
                    label: 'Priority',
                    phase: 'luteal',
                    variant: InsightCardVariant.highlight,
                    icon: const Icon(Icons.favorite_border_rounded, size: 14, color: SolColors.menstrual),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          recommendations!.pmddSupport!.message,
                          style: const TextStyle(fontSize: 14, color: SolColors.textPrimary, height: 1.55),
                        ),
                        const SizedBox(height: 8),
                        BulletList(
                          items: recommendations.pmddSupport!.tips,
                          bulletColor: SolColors.menstrual,
                        ),
                      ],
                    ),
                  ),
                ],

                if (cycle.cycleDay == null) ...[
                  const SizedBox(height: 20),
                  _StartTrackingCard(
                    onTap: () => _openLogSheet(DateTime.now()),
                  ),
                ],
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _SolLogo extends StatelessWidget {
  const _SolLogo();
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        gradient: const RadialGradient(
          colors: [Color(0xFFEAD9A0), Color(0xFFC6A882)],
          center: Alignment.center,
        ),
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: SolColors.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: const Center(
        child: Text('☀', style: TextStyle(fontSize: 16)),
      ),
    );
  }
}

class _StartTrackingCard extends StatelessWidget {
  final VoidCallback onTap;
  const _StartTrackingCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFFF5EFE6), Color(0xFFEDE3D5)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: SolColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: SolColors.primary,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(Icons.add_rounded, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Start tracking', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: SolColors.textPrimary)),
                  SizedBox(height: 2),
                  Text('Log your first cycle day to unlock insights', style: TextStyle(fontSize: 12, color: SolColors.textSecondary)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: SolColors.textMuted),
          ],
        ),
      ),
    );
  }
}
