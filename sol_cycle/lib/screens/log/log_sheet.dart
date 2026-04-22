import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../core/constants.dart';
import '../../models/cycle_log.dart';
import '../../providers/cycle_provider.dart';
import '../../services/cycle_service.dart';

class LogSheet extends ConsumerStatefulWidget {
  final DateTime date;
  const LogSheet({super.key, required this.date});

  @override
  ConsumerState<LogSheet> createState() => _LogSheetState();
}

class _LogSheetState extends ConsumerState<LogSheet> with SingleTickerProviderStateMixin {
  late TabController _tabs;
  late CycleLog _log;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    final dateStr = CycleService.formatDate(widget.date);
    final existing = ref.read(cycleProvider).logForDate(dateStr);
    _log = existing ?? CycleLog(date: dateStr);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    await ref.read(cycleProvider.notifier).saveLog(_log);
    if (!mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Logged ✓'),
        backgroundColor: SolColors.follicular,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = DateFormat('EEEE, MMMM d').format(widget.date);

    return DraggableScrollableSheet(
      initialChildSize: 0.92,
      minChildSize: 0.5,
      maxChildSize: 0.97,
      builder: (context, scrollController) => Container(
        decoration: const BoxDecoration(
          color: SolColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // Handle
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 10),
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: SolColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Log Day', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
                      Text(dateLabel, style: const TextStyle(fontSize: 13, color: SolColors.textMuted)),
                    ],
                  ),
                  const Spacer(),
                  FilledButton(
                    onPressed: _save,
                    style: FilledButton.styleFrom(
                      backgroundColor: SolColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Save', style: TextStyle(fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: SolColors.textMuted),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Tab bar
            Container(
              margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              decoration: BoxDecoration(
                color: SolColors.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabs,
                dividerColor: Colors.transparent,
                indicator: BoxDecoration(
                  color: SolColors.card,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 4, offset: const Offset(0, 1))],
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                unselectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
                labelColor: SolColors.textPrimary,
                unselectedLabelColor: SolColors.textMuted,
                tabs: const [
                  Tab(text: 'Body'),
                  Tab(text: 'Mind'),
                  Tab(text: 'Care'),
                  Tab(text: 'Notes'),
                ],
              ),
            ),

            // Tab content
            Expanded(
              child: TabBarView(
                controller: _tabs,
                children: [
                  _BodyTab(log: _log, onChanged: (l) => setState(() => _log = l), scrollController: scrollController),
                  _MindTab(log: _log, onChanged: (l) => setState(() => _log = l), scrollController: scrollController),
                  _CareTab(log: _log, onChanged: (l) => setState(() => _log = l), scrollController: scrollController),
                  _NotesTab(log: _log, onChanged: (l) => setState(() => _log = l), scrollController: scrollController),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Body Tab ───────────────────────────────────────────────────────────────

class _BodyTab extends StatelessWidget {
  final CycleLog log;
  final ValueChanged<CycleLog> onChanged;
  final ScrollController scrollController;

  const _BodyTab({required this.log, required this.onChanged, required this.scrollController});

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
      children: [
        _SectionLabel('Flow'),
        _FlowSelector(
          value: log.flow,
          onChanged: (v) => onChanged(log.copyWith(flow: v)),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Pain level  ${log.painLevel > 0 ? log.painLevel.toString() : ''}'),
        Slider(
          value: log.painLevel.toDouble(),
          min: 0, max: 10, divisions: 10,
          activeColor: SolColors.menstrual,
          inactiveColor: SolColors.border,
          label: log.painLevel.toString(),
          onChanged: (v) => onChanged(log.copyWith(painLevel: v.toInt())),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Physical symptoms'),
        _ChipGrid(
          items: physicalSymptoms,
          selected: log.physicalSymptoms,
          color: SolColors.menstrual,
          onChanged: (v) => onChanged(log.copyWith(physicalSymptoms: v)),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Energy level  ${log.energy}/10'),
        Slider(
          value: log.energy.toDouble(),
          min: 0, max: 10, divisions: 10,
          activeColor: SolColors.ovulatory,
          inactiveColor: SolColors.border,
          label: log.energy.toString(),
          onChanged: (v) => onChanged(log.copyWith(energy: v.toInt())),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Sleep  ${log.sleep > 0 ? '${log.sleep}h' : ''}'),
        Slider(
          value: log.sleep.toDouble(),
          min: 0, max: 12, divisions: 12,
          activeColor: SolColors.follicular,
          inactiveColor: SolColors.border,
          label: '${log.sleep}h',
          onChanged: (v) => onChanged(log.copyWith(sleep: v.toInt())),
        ),
      ],
    );
  }
}

// ─── Mind Tab ───────────────────────────────────────────────────────────────

class _MindTab extends StatelessWidget {
  final CycleLog log;
  final ValueChanged<CycleLog> onChanged;
  final ScrollController scrollController;

  const _MindTab({required this.log, required this.onChanged, required this.scrollController});

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
      children: [
        _SectionLabel('Moods'),
        _ChipGrid(
          items: moods,
          selected: log.moods,
          color: SolColors.follicular,
          onChanged: (v) => onChanged(log.copyWith(moods: v)),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Emotional symptoms'),
        _ChipGrid(
          items: emotionalSymptoms,
          selected: log.emotionalSymptoms,
          color: SolColors.luteal,
          onChanged: (v) => onChanged(log.copyWith(emotionalSymptoms: v)),
        ),
        const SizedBox(height: 20),

        _SectionLabel('PMDD symptoms'),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: SolColors.pmddWarningLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: SolColors.pmddWarning),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Track these separately for PMDD pattern detection', style: TextStyle(fontSize: 11, color: Color(0xFF8B3A3A))),
              const SizedBox(height: 8),
              _ChipGrid(
                items: pmddSymptoms,
                selected: log.pmddSymptoms,
                color: SolColors.menstrual,
                onChanged: (v) => onChanged(log.copyWith(pmddSymptoms: v)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Care Tab ───────────────────────────────────────────────────────────────

class _CareTab extends StatelessWidget {
  final CycleLog log;
  final ValueChanged<CycleLog> onChanged;
  final ScrollController scrollController;

  const _CareTab({required this.log, required this.onChanged, required this.scrollController});

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
      children: [
        _SectionLabel('Medications'),
        _ChipGrid(
          items: medications,
          selected: log.medications,
          color: const Color(0xFFB7D3CF),
          onChanged: (v) => onChanged(log.copyWith(medications: v)),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Supplements'),
        _ChipGrid(
          items: supplements,
          selected: log.supplements,
          color: SolColors.ovulatory,
          onChanged: (v) => onChanged(log.copyWith(supplements: v)),
        ),
      ],
    );
  }
}

// ─── Notes Tab ──────────────────────────────────────────────────────────────

class _NotesTab extends StatefulWidget {
  final CycleLog log;
  final ValueChanged<CycleLog> onChanged;
  final ScrollController scrollController;

  const _NotesTab({required this.log, required this.onChanged, required this.scrollController});

  @override
  State<_NotesTab> createState() => _NotesTabState();
}

class _NotesTabState extends State<_NotesTab> {
  late TextEditingController _notesCtrl;
  late TextEditingController _journalCtrl;

  @override
  void initState() {
    super.initState();
    _notesCtrl = TextEditingController(text: widget.log.notes);
    _journalCtrl = TextEditingController(text: widget.log.journalEntry ?? '');
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    _journalCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: widget.scrollController,
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
      children: [
        _SectionLabel('Quick note'),
        TextField(
          controller: _notesCtrl,
          maxLines: 3,
          onChanged: (v) => widget.onChanged(widget.log.copyWith(notes: v)),
          decoration: const InputDecoration(
            hintText: 'Anything to note today...',
            hintStyle: TextStyle(color: SolColors.textMuted),
          ),
        ),
        const SizedBox(height: 20),

        _SectionLabel('Journal entry'),
        const Text(
          'Private reflection — not included in exports unless you choose.',
          style: TextStyle(fontSize: 12, color: SolColors.textMuted),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _journalCtrl,
          maxLines: 8,
          onChanged: (v) => widget.onChanged(widget.log.copyWith(journalEntry: v)),
          decoration: const InputDecoration(
            hintText: 'How are you feeling today? What do you notice?',
            hintStyle: TextStyle(color: SolColors.textMuted),
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }
}

// ─── Shared Widgets ──────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: SolColors.textMuted,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _FlowSelector extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _FlowSelector({required this.value, required this.onChanged});

  static const _levels = [
    ('none', 'None', '○'),
    ('spotting', 'Spotting', '·'),
    ('light', 'Light', '◔'),
    ('medium', 'Medium', '◑'),
    ('heavy', 'Heavy', '●'),
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: _levels.map((l) {
        final isSelected = l.$1 == value;
        return Expanded(
          child: GestureDetector(
            onTap: () => onChanged(l.$1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? SolColors.menstrual : SolColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? SolColors.menstrual : SolColors.border,
                  width: isSelected ? 1.5 : 1,
                ),
              ),
              child: Column(
                children: [
                  Text(l.$3, style: TextStyle(fontSize: 18, color: isSelected ? Colors.white : SolColors.textMuted)),
                  const SizedBox(height: 3),
                  Text(l.$2, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : SolColors.textMuted)),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _ChipGrid extends StatelessWidget {
  final List<String> items;
  final List<String> selected;
  final Color color;
  final ValueChanged<List<String>> onChanged;

  const _ChipGrid({
    required this.items,
    required this.selected,
    required this.color,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: items.map((item) {
        final isSelected = selected.contains(item);
        return GestureDetector(
          onTap: () {
            final updated = List<String>.from(selected);
            if (isSelected) updated.remove(item);
            else updated.add(item);
            onChanged(updated);
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: isSelected ? color.withOpacity(0.9) : SolColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? color : SolColors.border,
                width: isSelected ? 1.5 : 1,
              ),
            ),
            child: Text(
              item,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? Colors.white : SolColors.textSecondary,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
