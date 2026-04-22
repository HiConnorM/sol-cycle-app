import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../providers/cycle_provider.dart';
import '../../services/cycle_service.dart';
import '../../services/phase_content.dart';

class NourishScreen extends ConsumerWidget {
  const NourishScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cycle = ref.watch(cycleProvider);
    final phase = cycle.currentPhase;
    final phaseInfo = phase != null ? phaseInfoMap[phase] : null;
    final recommendations = phase != null
        ? getPhaseRecommendations(phase, inPmddWindow: cycle.inPmddWindow)
        : null;

    return Scaffold(
      backgroundColor: SolColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            title: const Text('Nourish'),
            actions: [
              IconButton(
                icon: const Icon(Icons.menu_rounded),
                onPressed: Scaffold.of(context).openDrawer,
              ),
            ],
          ),

          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            sliver: SliverList(
              delegate: SliverChildListDelegate([

                // Phase banner
                if (phaseInfo != null)
                  _PhaseBanner(phaseInfo: phaseInfo, cycleDay: cycle.cycleDay),

                const SizedBox(height: 20),

                // Today's nourishment card
                if (recommendations != null) ...[
                  _NourishCard(
                    title: 'Foods to Emphasize',
                    subtitle: 'Based on your ${phaseInfo?.name ?? ''} phase',
                    color: Color(phaseInfo?.color ?? 0xFFC6A882),
                    lightColor: Color(phaseInfo?.colorLight ?? 0xFFF0E8D8),
                    items: recommendations.foods,
                    icon: Icons.restaurant_menu_rounded,
                  ),
                  const SizedBox(height: 16),

                  _NourishCard(
                    title: 'Movement Support',
                    subtitle: 'Exercise that works with your body',
                    color: SolColors.follicular,
                    lightColor: SolColors.follicularLight,
                    items: recommendations.exercises,
                    icon: Icons.directions_walk_rounded,
                  ),
                  const SizedBox(height: 16),

                  _NourishCard(
                    title: 'Rituals & Self-Care',
                    subtitle: 'Support your nervous system',
                    color: SolColors.luteal,
                    lightColor: SolColors.lutealLight,
                    items: recommendations.rituals,
                    icon: Icons.spa_rounded,
                  ),
                ],

                const SizedBox(height: 28),
                const _SectionDivider('All Phase Guidance'),
                const SizedBox(height: 16),

                // Phase-specific nourish cards
                ...nourishCards.map((card) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _PhaseNourishCard(card: card, currentPhase: phase),
                )),

                const SizedBox(height: 28),
                const _SectionDivider('Cycle-Aware Hydration'),
                const SizedBox(height: 16),
                const _HydrationCard(),
              ]),
            ),
          ),
        ],
      ),
    );
  }
}

class _PhaseBanner extends StatelessWidget {
  final PhaseInfo phaseInfo;
  final int? cycleDay;

  const _PhaseBanner({required this.phaseInfo, this.cycleDay});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(phaseInfo.colorLight), Color(phaseInfo.colorLight).withOpacity(0.4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Color(phaseInfo.color).withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Color(phaseInfo.color).withOpacity(0.25),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                _phaseEmoji(phaseInfo.phase),
                style: const TextStyle(fontSize: 22),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  phaseInfo.name,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: SolColors.textPrimary),
                ),
                Text(
                  cycleDay != null ? 'Day $cycleDay · ${phaseInfo.description}' : phaseInfo.description,
                  style: const TextStyle(fontSize: 12, color: SolColors.textSecondary, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _phaseEmoji(String phase) {
    switch (phase) {
      case 'menstrual': return '❄️';
      case 'follicular': return '🌱';
      case 'ovulatory': return '☀️';
      case 'luteal': return '🍂';
      default: return '🌿';
    }
  }
}

class _NourishCard extends StatefulWidget {
  final String title;
  final String subtitle;
  final Color color;
  final Color lightColor;
  final List<String> items;
  final IconData icon;

  const _NourishCard({
    required this.title,
    required this.subtitle,
    required this.color,
    required this.lightColor,
    required this.items,
    required this.icon,
  });

  @override
  State<_NourishCard> createState() => _NourishCardState();
}

class _NourishCardState extends State<_NourishCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final displayItems = _expanded ? widget.items : widget.items.take(3).toList();

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: SolColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: SolColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            decoration: BoxDecoration(
              color: widget.lightColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Icon(widget.icon, size: 16, color: widget.color),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
                      Text(widget.subtitle, style: const TextStyle(fontSize: 11, color: SolColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ...displayItems.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 6, right: 8),
                        child: Container(
                          width: 5,
                          height: 5,
                          decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
                        ),
                      ),
                      Expanded(
                        child: Text(item, style: const TextStyle(fontSize: 14, color: SolColors.textPrimary, height: 1.5)),
                      ),
                    ],
                  ),
                )),
                if (widget.items.length > 3)
                  GestureDetector(
                    onTap: () => setState(() => _expanded = !_expanded),
                    child: Text(
                      _expanded ? 'Show less' : '+${widget.items.length - 3} more',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: widget.color),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PhaseNourishCard extends StatelessWidget {
  final Map<String, dynamic> card;
  final String? currentPhase;

  const _PhaseNourishCard({required this.card, this.currentPhase});

  @override
  Widget build(BuildContext context) {
    final isActive = card['phase'] == currentPhase;
    final phaseInfo = phaseInfoMap[card['phase'] as String]!;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isActive ? Color(phaseInfo.colorLight) : SolColors.card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive ? Color(phaseInfo.color).withOpacity(0.4) : SolColors.border,
          width: isActive ? 1.5 : 1,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      card['title'] as String,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: isActive ? Color(phaseInfo.color) : SolColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      phaseInfo.name,
                      style: TextStyle(fontSize: 11, color: Color(phaseInfo.color).withOpacity(0.7)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(card['description'] as String, style: const TextStyle(fontSize: 13, color: SolColors.textSecondary, height: 1.4)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: (card['tags'] as List<String>).map((tag) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Color(phaseInfo.color).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(tag, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(phaseInfo.color))),
                  )).toList(),
                ),
              ],
            ),
          ),
          if (isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Color(phaseInfo.color),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('Now', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
            ),
        ],
      ),
    );
  }
}

class _HydrationCard extends StatelessWidget {
  const _HydrationCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFD6EDF5), Color(0xFFE8F4F8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFB0D8E8).withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Row(
            children: [
              Text('💧', style: TextStyle(fontSize: 18)),
              SizedBox(width: 8),
              Text('Hydration', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: SolColors.textPrimary)),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Hydration needs shift throughout your cycle. During menstruation and follicular phase, aim for slightly more water. '
            'Progesterone in the luteal phase can cause water retention — focus on electrolytes over raw volume.',
            style: TextStyle(fontSize: 13, color: SolColors.textSecondary, height: 1.55),
          ),
          SizedBox(height: 10),
          Text('Herbal teas that help:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: SolColors.textSecondary)),
          SizedBox(height: 4),
          Text('Chamomile · Raspberry leaf · Ginger · Nettle · Peppermint',
            style: TextStyle(fontSize: 13, color: SolColors.textPrimary, height: 1.5)),
        ],
      ),
    );
  }
}

class _SectionDivider extends StatelessWidget {
  final String label;
  const _SectionDivider(this.label);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Divider(color: SolColors.border)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: SolColors.textMuted, letterSpacing: 0.5)),
        ),
        Expanded(child: Divider(color: SolColors.border)),
      ],
    );
  }
}
