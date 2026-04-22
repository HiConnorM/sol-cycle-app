import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme.dart';
import 'providers/cycle_provider.dart';
import 'screens/today/today_screen.dart';
import 'screens/nourish/nourish_screen.dart';
import 'screens/insights/insights_screen.dart';
import 'screens/reports/reports_screen.dart';
import 'screens/log/log_sheet.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'widgets/side_menu.dart';
import 'services/storage_service.dart';

final _onboardedProvider = FutureProvider<bool>((ref) => StorageService.isOnboarded());

class SolCycleApp extends StatelessWidget {
  const SolCycleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sol Cycle',
      debugShowCheckedModeBanner: false,
      theme: SolTheme.light,
      home: const _AppRoot(),
    );
  }
}

class _AppRoot extends ConsumerWidget {
  const _AppRoot();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final onboardedAsync = ref.watch(_onboardedProvider);
    final cycle = ref.watch(cycleProvider);

    if (cycle.isLoading) {
      return const Scaffold(
        backgroundColor: SolColors.background,
        body: Center(child: _SolSplash()),
      );
    }

    return onboardedAsync.when(
      loading: () => const Scaffold(backgroundColor: SolColors.background, body: Center(child: _SolSplash())),
      error: (_, __) => const _MainShell(),
      data: (onboarded) => onboarded ? const _MainShell() : _OnboardingWrapper(),
    );
  }
}

class _OnboardingWrapper extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return OnboardingScreen(
      onComplete: () => ref.invalidate(_onboardedProvider),
    );
  }
}

class _MainShell extends ConsumerStatefulWidget {
  const _MainShell();

  @override
  ConsumerState<_MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<_MainShell> {
  int _tab = 0;

  final _screens = const [
    TodayScreen(),
    NourishScreen(),
    InsightsScreen(),
    ReportsScreen(),
  ];

  void _openLog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => LogSheet(date: DateTime.now()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const SolDrawer(),
      body: IndexedStack(index: _tab, children: _screens),
      floatingActionButton: FloatingActionButton(
        onPressed: _openLog,
        backgroundColor: SolColors.textPrimary,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: _BottomNav(
        currentIndex: _tab,
        onTap: (i) => setState(() => _tab = i),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _BottomNav({required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: SolColors.card,
        border: const Border(top: BorderSide(color: SolColors.border)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, -2)),
        ],
      ),
      child: SafeArea(
        top: false,
        child: BottomAppBar(
          color: Colors.transparent,
          elevation: 0,
          notchMargin: 8,
          shape: const CircularNotchedRectangle(),
          child: SizedBox(
            height: 56,
            child: Row(
              children: [
                _NavItem(icon: Icons.home_rounded, label: 'Today', index: 0, current: currentIndex, onTap: onTap),
                _NavItem(icon: Icons.restaurant_menu_rounded, label: 'Nourish', index: 1, current: currentIndex, onTap: onTap),
                const SizedBox(width: 60),
                _NavItem(icon: Icons.insights_rounded, label: 'Insights', index: 2, current: currentIndex, onTap: onTap),
                _NavItem(icon: Icons.bar_chart_rounded, label: 'Reports', index: 3, current: currentIndex, onTap: onTap),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int current;
  final ValueChanged<int> onTap;

  const _NavItem({required this.icon, required this.label, required this.index, required this.current, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isActive = index == current;
    return Expanded(
      child: GestureDetector(
        onTap: () => onTap(index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 22, color: isActive ? SolColors.primary : SolColors.textMuted),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? SolColors.primary : SolColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SolSplash extends StatelessWidget {
  const _SolSplash();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            gradient: const RadialGradient(colors: [Color(0xFFEAD9A0), Color(0xFFC6A882)]),
            shape: BoxShape.circle,
            boxShadow: [BoxShadow(color: SolColors.primary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 6))],
          ),
          child: const Center(child: Text('☀', style: TextStyle(fontSize: 36))),
        ),
        const SizedBox(height: 16),
        const Text('Sol Cycle', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
      ],
    );
  }
}
