import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme.dart';
import '../models/cycle_settings.dart';
import '../providers/cycle_provider.dart';
import '../services/cycle_service.dart';

class SolDrawer extends ConsumerWidget {
  const SolDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cycle = ref.watch(cycleProvider);
    final settings = cycle.settings;

    return Drawer(
      backgroundColor: SolColors.background,
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // Profile header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      gradient: const RadialGradient(
                        colors: [Color(0xFFEAD9A0), Color(0xFFC6A882)],
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(child: Text('☀', style: TextStyle(fontSize: 24))),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          settings.name.isEmpty ? 'Your Profile' : settings.name,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: SolColors.textPrimary),
                        ),
                        Text(
                          cycle.cycleDay != null
                              ? 'Day ${cycle.cycleDay} · ${phaseInfoMap[cycle.currentPhase]?.name ?? ''}'
                              : 'Not tracking yet',
                          style: const TextStyle(fontSize: 12, color: SolColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(height: 1),
            const SizedBox(height: 8),

            _DrawerSection('CYCLE SETTINGS', [
              _DrawerItem(
                icon: Icons.favorite_outline_rounded,
                label: 'Cycle Length',
                trailing: '${settings.averageCycleLength} days',
                onTap: () => _showCycleLengthDialog(context, ref),
              ),
              _DrawerItem(
                icon: Icons.water_drop_outlined,
                label: 'Period Length',
                trailing: '${settings.averagePeriodLength} days',
                onTap: () => _showPeriodLengthDialog(context, ref),
              ),
              _DrawerItem(
                icon: Icons.calendar_today_rounded,
                label: 'Last Period Start',
                trailing: settings.lastPeriodStart ?? 'Not set',
                onTap: () => _showDatePicker(context, ref),
              ),
            ]),

            _DrawerSection('CARE MODES', [
              _DrawerSwitch(
                icon: Icons.psychology_outlined,
                label: 'PMDD Mode',
                subtitle: 'Enhanced PMDD tracking & support',
                value: settings.pmddMode,
                onChanged: (v) => ref.read(cycleProvider.notifier).updateSettings(settings.copyWith(pmddMode: v)),
              ),
              _DrawerSwitch(
                icon: Icons.healing_outlined,
                label: 'Endometriosis Mode',
                subtitle: 'Endo-specific symptom tracking',
                value: settings.endoMode,
                onChanged: (v) => ref.read(cycleProvider.notifier).updateSettings(settings.copyWith(endoMode: v)),
              ),
            ]),

            _DrawerSection('DISPLAY', [
              _DrawerItem(
                icon: Icons.calendar_month_rounded,
                label: 'Calendar System',
                trailing: settings.calendarSystem == 'gregorian' ? '12-month' : '13-month Sol',
                onTap: () => ref.read(cycleProvider.notifier).updateSettings(
                  settings.copyWith(
                    calendarSystem: settings.calendarSystem == 'gregorian' ? 'international-fixed' : 'gregorian',
                  ),
                ),
              ),
            ]),

            _DrawerSection('PRIVACY & DATA', [
              _DrawerItem(
                icon: Icons.lock_outline_rounded,
                label: 'Privacy Center',
                onTap: () => _showPrivacyInfo(context),
              ),
              _DrawerItem(
                icon: Icons.download_outlined,
                label: 'Export All Data',
                onTap: () {},
              ),
              _DrawerItem(
                icon: Icons.delete_outline_rounded,
                label: 'Delete All Data',
                color: const Color(0xFFD8A7A7),
                onTap: () => _showDeleteConfirm(context, ref),
              ),
            ]),

            const SizedBox(height: 8),
            const Divider(height: 1),
            const SizedBox(height: 8),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('SOL CYCLE', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: SolColors.textMuted, letterSpacing: 1)),
                  const Text('Privacy-first cycle intelligence', style: TextStyle(fontSize: 11, color: SolColors.textMuted)),
                  const SizedBox(height: 4),
                  Text('v1.0.0', style: const TextStyle(fontSize: 10, color: SolColors.textMuted)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showCycleLengthDialog(BuildContext context, WidgetRef ref) async {
    final settings = ref.read(cycleProvider).settings;
    int value = settings.averageCycleLength;
    await showDialog(
      context: context,
      builder: (ctx) => _NumberDialog(
        title: 'Cycle Length',
        value: value,
        min: 21, max: 45,
        onSave: (v) => ref.read(cycleProvider.notifier).updateSettings(settings.copyWith(averageCycleLength: v)),
      ),
    );
  }

  Future<void> _showPeriodLengthDialog(BuildContext context, WidgetRef ref) async {
    final settings = ref.read(cycleProvider).settings;
    await showDialog(
      context: context,
      builder: (ctx) => _NumberDialog(
        title: 'Period Length',
        value: settings.averagePeriodLength,
        min: 2, max: 10,
        onSave: (v) => ref.read(cycleProvider.notifier).updateSettings(settings.copyWith(averagePeriodLength: v)),
      ),
    );
  }

  Future<void> _showDatePicker(BuildContext context, WidgetRef ref) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 90)),
      lastDate: DateTime.now(),
    );
    if (date != null) {
      ref.read(cycleProvider.notifier).setPeriodStart(date);
    }
  }

  void _showPrivacyInfo(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: SolColors.background,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Privacy Center', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
            const SizedBox(height: 16),
            const _PrivacyRow(icon: Icons.phone_iphone_rounded, label: 'Stored locally on your device'),
            const _PrivacyRow(icon: Icons.cloud_off_rounded, label: 'No sync without your consent'),
            const _PrivacyRow(icon: Icons.psychology_outlined, label: 'AI toggle — you control what AI sees'),
            const _PrivacyRow(icon: Icons.download_rounded, label: 'Export all your data anytime'),
            const _PrivacyRow(icon: Icons.delete_forever_rounded, label: 'Delete everything with one tap'),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Future<void> _showDeleteConfirm(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete All Data'),
        content: const Text('This will permanently delete all your cycle logs, settings, and history. This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: SolColors.menstrual),
            child: const Text('Delete Everything'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(cycleProvider.notifier).updateSettings(const CycleSettings());
    }
  }
}

class _DrawerSection extends StatelessWidget {
  final String title;
  final List<Widget> children;
  const _DrawerSection(this.title, this.children);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 0, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: SolColors.textMuted, letterSpacing: 0.8)),
          const SizedBox(height: 8),
          ...children,
        ],
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? trailing;
  final Color? color;
  final VoidCallback? onTap;

  const _DrawerItem({required this.icon, required this.label, this.trailing, this.color, this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 0),
      minVerticalPadding: 0,
      leading: Icon(icon, size: 20, color: color ?? SolColors.textSecondary),
      title: Text(label, style: TextStyle(fontSize: 14, color: color ?? SolColors.textPrimary)),
      trailing: trailing != null
          ? Text(trailing!, style: const TextStyle(fontSize: 12, color: SolColors.textMuted))
          : const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: SolColors.textMuted),
      onTap: onTap,
    );
  }
}

class _DrawerSwitch extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _DrawerSwitch({required this.icon, required this.label, required this.subtitle, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 0),
      leading: Icon(icon, size: 20, color: SolColors.textSecondary),
      title: Text(label, style: const TextStyle(fontSize: 14, color: SolColors.textPrimary)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: SolColors.textMuted)),
      trailing: Switch(
        value: value,
        onChanged: onChanged,
        activeColor: SolColors.primary,
      ),
    );
  }
}

class _PrivacyRow extends StatelessWidget {
  final IconData icon;
  final String label;
  const _PrivacyRow({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: SolColors.follicular),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(fontSize: 14, color: SolColors.textPrimary)),
        ],
      ),
    );
  }
}

class _NumberDialog extends StatefulWidget {
  final String title;
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onSave;

  const _NumberDialog({required this.title, required this.value, required this.min, required this.max, required this.onSave});

  @override
  State<_NumberDialog> createState() => _NumberDialogState();
}

class _NumberDialogState extends State<_NumberDialog> {
  late int _value;

  @override
  void initState() {
    super.initState();
    _value = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$_value days', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: SolColors.primary)),
          Slider(
            value: _value.toDouble(),
            min: widget.min.toDouble(),
            max: widget.max.toDouble(),
            divisions: widget.max - widget.min,
            activeColor: SolColors.primary,
            onChanged: (v) => setState(() => _value = v.toInt()),
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        TextButton(
          onPressed: () {
            widget.onSave(_value);
            Navigator.pop(context);
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
