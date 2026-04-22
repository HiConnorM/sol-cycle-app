import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../providers/cycle_provider.dart';
import '../../services/cycle_service.dart';

class InsightsScreen extends ConsumerWidget {
  const InsightsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cycle = ref.watch(cycleProvider);
    final logs = cycle.logs;
    final settings = cycle.settings;

    // Compute basic stats
    final totalDays = logs.length;
    final avgPain = totalDays > 0
        ? (logs.values.map((l) => l.painLevel).reduce((a, b) => a + b) / totalDays).toStringAsFixed(1)
        : '–';

    final symptomCounts = <String, int>{};
    for (final log in logs.values) {
      for (final s in [...log.physicalSymptoms, ...log.emotionalSymptoms]) {
        symptomCounts[s] = (symptomCounts[s] ?? 0) + 1;
      }
    }
    final topSymptoms = (symptomCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value)))
      .take(5)
      .toList();

    final moodCounts = <String, int>{};
    for (final log in logs.values) {
      for (final m in log.moods) {
        moodCounts[m] = (moodCounts[m] ?? 0) + 1;
      }
    }
    final topMoods = (moodCounts.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value)))
      .take(5)
      .toList();

    return Scaffold(
      backgroundColor: SolColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: const Text('Insights'),
            actions: [
              IconButton(icon: const Icon(Icons.menu_rounded), onPressed: Scaffold.of(context).openDrawer),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Cycle overview
                _InsightsSection(
                  title: 'Cycle Overview',
                  child: Row(
                    children: [
                      _StatTile(label: 'Logged Days', value: totalDays.toString()),
                      _StatTile(label: 'Cycle Length', value: '${settings.averageCycleLength}d'),
                      _StatTile(label: 'Avg Pain', value: avgPain),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Current cycle
                if (cycle.cycleDay != null)
                  _InsightsSection(
                    title: 'Current Cycle',
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _CycleProgressBar(
                          cycleDay: cycle.cycleDay!,
                          cycleLength: settings.averageCycleLength,
                          periodLength: settings.averagePeriodLength,
                        ),
                        const SizedBox(height: 12),
                        if (cycle.daysUntilPeriod != null)
                          _InfoRow(
                            icon: Icons.calendar_today_rounded,
                            text: 'Period expected in ${cycle.daysUntilPeriod} day${cycle.daysUntilPeriod == 1 ? '' : 's'}',
                          ),
                        if (cycle.inPmddWindow)
                          _InfoRow(
                            icon: Icons.warning_amber_rounded,
                            text: 'PMDD window active — track mood and symptoms closely',
                            color: SolColors.menstrual,
                          ),
                      ],
                    ),
                  ),

                if (cycle.cycleDay != null) const SizedBox(height: 16),

                // Top symptoms
                if (topSymptoms.isNotEmpty)
                  _InsightsSection(
                    title: 'Most Logged Symptoms',
                    child: Column(
                      children: topSymptoms.map((entry) => _BarRow(
                        label: entry.key,
                        count: entry.value,
                        max: topSymptoms.first.value,
                        color: SolColors.menstrual,
                      )).toList(),
                    ),
                  ),

                if (topSymptoms.isNotEmpty) const SizedBox(height: 16),

                // Top moods
                if (topMoods.isNotEmpty)
                  _InsightsSection(
                    title: 'Most Logged Moods',
                    child: Column(
                      children: topMoods.map((entry) => _BarRow(
                        label: entry.key,
                        count: entry.value,
                        max: topMoods.first.value,
                        color: SolColors.follicular,
                      )).toList(),
                    ),
                  ),

                if (topMoods.isNotEmpty) const SizedBox(height: 16),

                // Phase breakdown
                _InsightsSection(
                  title: 'Phase Guide',
                  child: Column(
                    children: [
                      _PhaseRow(phase: 'menstrual', days: '1–${settings.averagePeriodLength}', label: 'Menstrual · Inner Winter'),
                      _PhaseRow(phase: 'follicular', days: '${settings.averagePeriodLength + 1}–${(settings.averageCycleLength * 0.45).round()}', label: 'Follicular · Inner Spring'),
                      _PhaseRow(phase: 'ovulatory', days: '${(settings.averageCycleLength * 0.45).round() + 1}–${(settings.averageCycleLength * 0.55).round()}', label: 'Ovulatory · Inner Summer'),
                      _PhaseRow(phase: 'luteal', days: '${(settings.averageCycleLength * 0.55).round() + 1}–${settings.averageCycleLength}', label: 'Luteal · Inner Autumn'),
                    ],
                  ),
                ),

                if (totalDays == 0) ...[
                  const SizedBox(height: 24),
                  Center(
                    child: Column(
                      children: [
                        const Text('🌱', style: TextStyle(fontSize: 40)),
                        const SizedBox(height: 12),
                        const Text('Insights grow with your data', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: SolColors.textPrimary)),
                        const SizedBox(height: 4),
                        const Text('Start logging to see patterns and trends', style: TextStyle(fontSize: 13, color: SolColors.textMuted)),
                      ],
                    ),
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

class _InsightsSection extends StatelessWidget {
  final String title;
  final Widget child;

  const _InsightsSection({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SolColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SolColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: SolColors.textMuted, letterSpacing: 0.8)),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;

  const _StatTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(color: SolColors.surface, borderRadius: BorderRadius.circular(12)),
        child: Column(
          children: [
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 10, color: SolColors.textMuted), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _CycleProgressBar extends StatelessWidget {
  final int cycleDay;
  final int cycleLength;
  final int periodLength;

  const _CycleProgressBar({required this.cycleDay, required this.cycleLength, required this.periodLength});

  @override
  Widget build(BuildContext context) {
    final progress = cycleDay / cycleLength;
    final phase = CycleService.getPhase(cycleDay, cycleLength, periodLength);
    final phaseInfo = phaseInfoMap[phase]!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Day $cycleDay of $cycleLength', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: SolColors.textPrimary)),
            Text(phaseInfo.name, style: TextStyle(fontSize: 12, color: Color(phaseInfo.color), fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: SolColors.surface,
            valueColor: AlwaysStoppedAnimation<Color>(Color(phaseInfo.color)),
          ),
        ),
      ],
    );
  }
}

class _BarRow extends StatelessWidget {
  final String label;
  final int count;
  final int max;
  final Color color;

  const _BarRow({required this.label, required this.count, required this.max, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(width: 120, child: Text(label, style: const TextStyle(fontSize: 13, color: SolColors.textPrimary), overflow: TextOverflow.ellipsis)),
          const SizedBox(width: 8),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: count / max,
                minHeight: 6,
                backgroundColor: SolColors.surface,
                valueColor: AlwaysStoppedAnimation<Color>(color.withOpacity(0.7)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Text(count.toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: SolColors.textMuted)),
        ],
      ),
    );
  }
}

class _PhaseRow extends StatelessWidget {
  final String phase;
  final String days;
  final String label;

  const _PhaseRow({required this.phase, required this.days, required this.label});

  @override
  Widget build(BuildContext context) {
    final info = phaseInfoMap[phase]!;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: Color(info.color), shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(label, style: const TextStyle(fontSize: 13, color: SolColors.textPrimary))),
          Text(days, style: const TextStyle(fontSize: 11, color: SolColors.textMuted, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color? color;

  const _InfoRow({required this.icon, required this.text, this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(icon, size: 14, color: color ?? SolColors.textMuted),
          const SizedBox(width: 6),
          Expanded(child: Text(text, style: TextStyle(fontSize: 13, color: color ?? SolColors.textSecondary))),
        ],
      ),
    );
  }
}
