import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../providers/cycle_provider.dart';
class ReportsScreen extends ConsumerWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cycle = ref.watch(cycleProvider);
    final logs = cycle.logs;

    // Group logs by month
    final byMonth = <String, List<String>>{};
    for (final date in logs.keys) {
      final month = date.substring(0, 7);
      byMonth[month] = [...(byMonth[month] ?? []), date];
    }
    final months = byMonth.keys.toList()..sort((a, b) => b.compareTo(a));

    return Scaffold(
      backgroundColor: SolColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: const Text('Reports'),
            actions: [
              IconButton(icon: const Icon(Icons.menu_rounded), onPressed: Scaffold.of(context).openDrawer),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Report type cards
                const _ReportTypeGrid(),
                const SizedBox(height: 24),

                // Monthly summaries
                if (months.isEmpty)
                  const _EmptyState()
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('MONTHLY SUMMARIES', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: SolColors.textMuted, letterSpacing: 0.8)),
                      const SizedBox(height: 12),
                      ...months.map((month) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _MonthlySummaryCard(
                          month: month,
                          dates: byMonth[month]!,
                          logs: cycle.logs,
                          cycleLength: cycle.settings.averageCycleLength,
                          periodLength: cycle.settings.averagePeriodLength,
                        ),
                      )),
                    ],
                  ),

                // PMDD summary if applicable
                if (cycle.settings.pmddMode) ...[
                  const SizedBox(height: 24),
                  const _PmddSummarySection(),
                ],

                // Export section
                const SizedBox(height: 24),
                const _ExportSection(),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReportTypeGrid extends StatelessWidget {
  const _ReportTypeGrid();

  @override
  Widget build(BuildContext context) {
    const items = [
      (Icons.calendar_month_rounded, 'Weekly', 'Last 7 days'),
      (Icons.bar_chart_rounded, 'Monthly', 'Last 28 days'),
      (Icons.medical_services_outlined, 'Clinician', 'Export ready'),
      (Icons.psychology_outlined, 'PMDD', 'Pattern report'),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: items.map((item) => _ReportTypeCard(
        icon: item.$1,
        title: item.$2,
        subtitle: item.$3,
      )).toList(),
    );
  }
}

class _ReportTypeCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _ReportTypeCard({required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SolColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SolColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: SolColors.primary),
          const Spacer(),
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: SolColors.textMuted)),
        ],
      ),
    );
  }
}

class _MonthlySummaryCard extends StatelessWidget {
  final String month;
  final List<String> dates;
  final Map logs;
  final int cycleLength;
  final int periodLength;

  const _MonthlySummaryCard({
    required this.month,
    required this.dates,
    required this.logs,
    required this.cycleLength,
    required this.periodLength,
  });

  @override
  Widget build(BuildContext context) {
    final parsed = DateTime.parse('$month-01');
    final label = DateFormat('MMMM yyyy').format(parsed);
    final logList = dates.map((d) => logs[d]).whereType<dynamic>().toList();

    int painDays = 0;
    int flowDays = 0;
    for (final log in logList) {
      if (log.painLevel > 3) painDays++;
      if (log.flow != 'none') flowDays++;
    }

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
              Text('${dates.length} days logged', style: const TextStyle(fontSize: 11, color: SolColors.textMuted)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _MiniStat(label: 'Flow days', value: flowDays.toString(), color: SolColors.menstrual),
              const SizedBox(width: 12),
              _MiniStat(label: 'Pain >3', value: painDays.toString(), color: SolColors.luteal),
              const SizedBox(width: 12),
              _MiniStat(label: 'Logged', value: dates.length.toString(), color: SolColors.follicular),
            ],
          ),
          const SizedBox(height: 12),
          // Day grid
          _DayGrid(dates: dates, logs: logs),
        ],
      ),
    );
  }
}

class _DayGrid extends StatelessWidget {
  final List<String> dates;
  final Map logs;

  const _DayGrid({required this.dates, required this.logs});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 3,
      runSpacing: 3,
      children: dates.take(31).map((date) {
        final log = logs[date];
        final day = int.parse(date.split('-')[2]);
        Color dotColor = SolColors.border;
        if (log != null) {
          if (log.flow != 'none') dotColor = SolColors.menstrual;
          else if (log.physicalSymptoms.isNotEmpty || log.emotionalSymptoms.isNotEmpty) dotColor = SolColors.luteal;
          else dotColor = SolColors.follicular;
        }
        return Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            color: dotColor.withOpacity(log != null ? 0.5 : 0.2),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Center(
            child: Text(
              day.toString(),
              style: TextStyle(fontSize: 8, fontWeight: FontWeight.w600, color: log != null ? SolColors.textPrimary : SolColors.textMuted),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _MiniStat({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: color)),
        Text(label, style: const TextStyle(fontSize: 9, color: SolColors.textMuted)),
      ],
    );
  }
}

class _PmddSummarySection extends StatelessWidget {
  const _PmddSummarySection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SolColors.pmddWarningLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SolColors.pmddWarning),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Row(
            children: [
              Icon(Icons.psychology_outlined, size: 18, color: Color(0xFF8B3A3A)),
              SizedBox(width: 8),
              Text('PMDD Pattern Report', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF8B3A3A))),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Track 3+ cycles to unlock your PMDD pattern analysis, onset prediction, and clinician-ready PDF export.',
            style: TextStyle(fontSize: 13, color: SolColors.textSecondary, height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _ExportSection extends StatelessWidget {
  const _ExportSection();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('EXPORT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: SolColors.textMuted, letterSpacing: 0.8)),
        const SizedBox(height: 12),
        _ExportRow(icon: Icons.picture_as_pdf_rounded, label: 'PDF Report', subtitle: 'Clinician-ready format', color: SolColors.menstrual),
        _ExportRow(icon: Icons.table_chart_rounded, label: 'CSV Export', subtitle: 'Raw data spreadsheet', color: SolColors.follicular),
        _ExportRow(icon: Icons.download_rounded, label: 'Export All Data', subtitle: 'Complete JSON archive', color: SolColors.primary),
      ],
    );
  }
}

class _ExportRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;

  const _ExportRow({required this.icon, required this.label, required this.subtitle, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: SolColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: SolColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: SolColors.textPrimary)),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: SolColors.textMuted)),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: SolColors.textMuted),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: const [
            Text('📊', style: TextStyle(fontSize: 40)),
            SizedBox(height: 12),
            Text('No reports yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: SolColors.textPrimary)),
            SizedBox(height: 4),
            Text('Log a few days to generate your first report', style: TextStyle(fontSize: 13, color: SolColors.textMuted), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
