import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../services/cycle_service.dart';

enum InsightCardVariant { standard, highlight, subtle }

class InsightCard extends StatelessWidget {
  final String title;
  final String? label;
  final Widget? icon;
  final String? phase;
  final InsightCardVariant variant;
  final Widget child;
  final VoidCallback? onTap;

  const InsightCard({
    super.key,
    required this.title,
    required this.child,
    this.label,
    this.icon,
    this.phase,
    this.variant = InsightCardVariant.standard,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor = SolColors.card;
    Color borderColor = SolColors.border;

    if (phase != null) {
      final info = phaseInfoMap[phase];
      if (info != null) {
        if (variant == InsightCardVariant.highlight) {
          bgColor = Color(info.colorLight);
          borderColor = Color(info.color).withOpacity(0.3);
        }
      }
    } else if (variant == InsightCardVariant.subtle) {
      bgColor = SolColors.surface;
      borderColor = SolColors.border;
    }

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (icon != null) ...[
                    icon!,
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: SolColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  if (label != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: SolColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        label!,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: SolColors.primaryDark,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              DefaultTextStyle(
                style: const TextStyle(
                  fontSize: 14,
                  color: SolColors.textPrimary,
                  height: 1.55,
                ),
                child: child,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BulletList extends StatelessWidget {
  final List<String> items;
  final Color? bulletColor;

  const BulletList({super.key, required this.items, this.bulletColor});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.take(3).map((item) => Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 6, right: 8),
              child: Container(
                width: 5,
                height: 5,
                decoration: BoxDecoration(
                  color: bulletColor ?? SolColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Expanded(
              child: Text(item, style: const TextStyle(fontSize: 14, color: SolColors.textPrimary, height: 1.5)),
            ),
          ],
        ),
      )).toList(),
    );
  }
}
