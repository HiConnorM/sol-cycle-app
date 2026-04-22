import 'dart:math';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/cycle_service.dart';

class WheelPainter extends CustomPainter {
  final int segmentCount;
  final int currentSegment;
  final List<Color> segmentColors;
  final List<String> segmentLabels;
  final int? cycleDay;
  final int cycleLength;
  final int periodLength;
  final double moonIllumination;
  final String moonPhase;
  final String displayMonth;
  final int displayDay;
  final int displayYear;
  final String? phase;

  const WheelPainter({
    required this.segmentCount,
    required this.currentSegment,
    required this.segmentColors,
    required this.segmentLabels,
    this.cycleDay,
    this.cycleLength = 28,
    this.periodLength = 5,
    required this.moonIllumination,
    required this.moonPhase,
    required this.displayMonth,
    required this.displayDay,
    required this.displayYear,
    this.phase,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final outerRadius = size.width * 0.46;
    final innerRadius = size.width * 0.28;
    final centerRadius = size.width * 0.22;
    final anglePerSegment = (2 * pi) / segmentCount;

    _drawWheelSegments(canvas, center, outerRadius, innerRadius, anglePerSegment);
    if (cycleDay != null) {
      _drawCycleRing(canvas, center, innerRadius);
    }
    _drawCenterCircle(canvas, center, centerRadius);
    _drawMoon(canvas, center, centerRadius);
    _drawCenterText(canvas, center, centerRadius);
  }

  void _drawWheelSegments(Canvas canvas, Offset center, double outerR, double innerR, double anglePerSeg) {
    for (int i = 0; i < segmentCount; i++) {
      final startAngle = (i * anglePerSeg) - pi / 2;
      final isActive = i == currentSegment;

      final paint = Paint()
        ..color = segmentColors[i].withOpacity(isActive ? 1.0 : 0.65)
        ..style = PaintingStyle.fill;

      final path = _buildSegmentPath(center, outerR, innerR, startAngle, anglePerSeg);
      canvas.drawPath(path, paint);

      // Subtle divider lines
      final linePaint = Paint()
        ..color = Colors.white.withOpacity(0.8)
        ..strokeWidth = 1.2
        ..style = PaintingStyle.stroke;
      canvas.drawPath(path, linePaint);

      // Label text
      final midAngle = startAngle + anglePerSeg / 2;
      final labelR = (outerR + innerR) / 2;
      final labelPos = Offset(
        center.dx + labelR * cos(midAngle),
        center.dy + labelR * sin(midAngle),
      );
      _drawRotatedText(
        canvas,
        segmentLabels[i],
        labelPos,
        midAngle + pi / 2,
        isActive ? 10.5 : 9.0,
        isActive ? FontWeight.w600 : FontWeight.w400,
        isActive ? const Color(0xFF2B2B2B) : const Color(0xFF6B6B6B),
      );
    }
  }

  Path _buildSegmentPath(Offset center, double outerR, double innerR, double startAngle, double sweepAngle) {
    final path = Path();
    final outerStart = Offset(
      center.dx + outerR * cos(startAngle),
      center.dy + outerR * sin(startAngle),
    );
    path.moveTo(outerStart.dx, outerStart.dy);
    path.arcTo(
      Rect.fromCircle(center: center, radius: outerR),
      startAngle, sweepAngle, false,
    );
    final innerEnd = Offset(
      center.dx + innerR * cos(startAngle + sweepAngle),
      center.dy + innerR * sin(startAngle + sweepAngle),
    );
    path.lineTo(innerEnd.dx, innerEnd.dy);
    path.arcTo(
      Rect.fromCircle(center: center, radius: innerR),
      startAngle + sweepAngle, -sweepAngle, false,
    );
    path.close();
    return path;
  }

  void _drawCycleRing(Canvas canvas, Offset center, double innerR) {
    if (cycleDay == null) return;

    final phaseStr = CycleService.getPhase(cycleDay!, cycleLength, periodLength);
    final phaseInfo = phaseInfoMap[phaseStr];
    if (phaseInfo == null) return;

    final ringPaint = Paint()
      ..color = Color(phaseInfo.colorLight).withOpacity(0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10;
    canvas.drawCircle(center, innerR - 6, ringPaint);

    final markerR = innerR - 12;
    final anglePerDay = (2 * pi) / cycleLength;

    for (int day = 1; day <= cycleLength; day++) {
      final angle = (day - 1) * anglePerDay - pi / 2;
      final dayPhase = CycleService.getPhase(day, cycleLength, periodLength);
      final dayPhaseInfo = phaseInfoMap[dayPhase]!;
      final isCurrent = day == cycleDay;

      final tickPaint = Paint()
        ..color = isCurrent ? const Color(0xFF2B2B2B) : Color(dayPhaseInfo.color).withOpacity(0.7)
        ..strokeWidth = isCurrent ? 2.5 : 1.2
        ..strokeCap = StrokeCap.round;

      final inner = Offset(center.dx + (markerR - 6) * cos(angle), center.dy + (markerR - 6) * sin(angle));
      final outer = Offset(center.dx + markerR * cos(angle), center.dy + markerR * sin(angle));
      canvas.drawLine(inner, outer, tickPaint);
    }

    // Current day dot
    final dotAngle = (cycleDay! - 1) * anglePerDay - pi / 2;
    final dotPos = Offset(
      center.dx + (markerR - 3) * cos(dotAngle),
      center.dy + (markerR - 3) * sin(dotAngle),
    );
    canvas.drawCircle(dotPos, 5, Paint()..color = Color(phaseInfo.color));
    canvas.drawCircle(dotPos, 5, Paint()
      ..color = const Color(0xFF2B2B2B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5);
  }

  void _drawCenterCircle(Canvas canvas, Offset center, double radius) {
    final bgPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, bgPaint);

    final borderPaint = Paint()
      ..color = SolColors.border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(center, radius, borderPaint);
  }

  void _drawMoon(Canvas canvas, Offset center, double circleRadius) {
    final moonRadius = circleRadius * 0.28;
    final moonCenter = Offset(center.dx, center.dy - circleRadius * 0.42);

    // Moon background
    canvas.drawCircle(moonCenter, moonRadius, Paint()..color = SolColors.moonDark);

    // Moon illumination
    final illuminatedWidth = moonRadius * 2 * (moonIllumination / 100);
    if (illuminatedWidth > 0) {
      final isWaning = moonPhase.contains('waning');
      final illuminateLeft = isWaning
          ? moonCenter.dx - moonRadius + (moonRadius * 2 - illuminatedWidth)
          : moonCenter.dx - moonRadius;

      final clipPath = Path()..addOval(Rect.fromCircle(center: moonCenter, radius: moonRadius));
      canvas.save();
      canvas.clipPath(clipPath);

      final lightPaint = Paint()..color = SolColors.moonLight;
      canvas.drawRect(
        Rect.fromLTWH(illuminateLeft, moonCenter.dy - moonRadius, illuminatedWidth, moonRadius * 2),
        lightPaint,
      );
      canvas.restore();
    }
  }

  void _drawCenterText(Canvas canvas, Offset center, double circleRadius) {
    final monthStyle = TextStyle(
      fontSize: circleRadius * 0.22,
      fontWeight: FontWeight.w500,
      color: const Color(0xFF2B2B2B),
      letterSpacing: 0.3,
    );
    final dayStyle = TextStyle(
      fontSize: circleRadius * 0.38,
      fontWeight: FontWeight.w700,
      color: const Color(0xFF2B2B2B),
      height: 1.1,
    );
    final yearStyle = TextStyle(
      fontSize: circleRadius * 0.18,
      fontWeight: FontWeight.w400,
      color: const Color(0xFFA0A0A0),
    );

    _drawText(canvas, displayMonth, Offset(center.dx, center.dy + circleRadius * 0.08), monthStyle);
    _drawText(canvas, displayDay.toString(), Offset(center.dx, center.dy + circleRadius * 0.38), dayStyle);
    _drawText(canvas, displayYear.toString(), Offset(center.dx, center.dy + circleRadius * 0.62), yearStyle);

    if (cycleDay != null && phase != null) {
      final cycleDayStyle = TextStyle(
        fontSize: circleRadius * 0.17,
        fontWeight: FontWeight.w500,
        color: const Color(0xFF8B8B8B),
        letterSpacing: 0.5,
      );
      _drawText(canvas, 'day $cycleDay', Offset(center.dx, center.dy + circleRadius * 0.8), cycleDayStyle);
    }
  }

  void _drawText(Canvas canvas, String text, Offset position, TextStyle style) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: style),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();
    tp.paint(canvas, Offset(position.dx - tp.width / 2, position.dy - tp.height / 2));
  }

  void _drawRotatedText(Canvas canvas, String text, Offset position, double angle, double fontSize, FontWeight weight, Color color) {
    final tp = TextPainter(
      text: TextSpan(
        text: text,
        style: TextStyle(fontSize: fontSize, fontWeight: weight, color: color),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout();

    canvas.save();
    canvas.translate(position.dx, position.dy);
    canvas.rotate(angle);
    tp.paint(canvas, Offset(-tp.width / 2, -tp.height / 2));
    canvas.restore();
  }

  @override
  bool shouldRepaint(WheelPainter old) =>
      old.currentSegment != currentSegment ||
      old.cycleDay != cycleDay ||
      old.moonIllumination != moonIllumination ||
      old.displayDay != displayDay ||
      old.segmentCount != segmentCount;
}
