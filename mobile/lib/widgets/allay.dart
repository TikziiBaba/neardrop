import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Sitedeki 3D Allay rehberinin 2D piksel hali (components/mascot/allay-model.ts ile aynı palet ve dokular).
class AllayMascot extends StatefulWidget {
  final double size;
  final bool excited;
  const AllayMascot({super.key, this.size = 120, this.excited = false});

  @override
  State<AllayMascot> createState() => _AllayMascotState();
}

class _AllayMascotState extends State<AllayMascot> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(seconds: 6))..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: SizedBox(
        width: widget.size,
        height: widget.size,
        child: AnimatedBuilder(
          animation: _c,
          builder: (_, _) => CustomPaint(
            painter: _AllayPainter(_c.value * 6, widget.excited ? 2.2 : 1),
          ),
        ),
      ),
    );
  }
}

const _palette = {
  'L': Color(0xFFA6F3FF),
  'W': Color(0xFFD4FBFF),
  'B': Color(0xFF62DCF5),
  'D': Color(0xFF38B3DB),
  'X': Color(0xFF2B8FC4),
  'E': Color(0xFF16336F),
};

const _face = [
  'WLLLLLLW',
  'LLBBBBLL',
  'BBBBBBBB',
  'BBEBBEBB',
  'BBEBBEBB',
  'BBBBBBBB',
  'DBBBBBBD',
  'DDDDDDDD',
];

const _wing = [
  '..WWWW..',
  '.WLLLLW.',
  'WLLLLLLW',
  'WLLWLLLW',
  'WLLLLLLW',
  '.WLLLLW.',
  '..WLLW..',
  '...WW...',
];

class _AllayPainter extends CustomPainter {
  final double t; // saniye
  final double flap;
  _AllayPainter(this.t, this.flap);

  void _pixels(Canvas canvas, List<String> rows, Rect rect, {double opacity = 1}) {
    final px = rect.width / rows.first.length;
    final paint = Paint()..isAntiAlias = false;
    for (var y = 0; y < rows.length; y++) {
      for (var x = 0; x < rows[y].length; x++) {
        final c = _palette[rows[y][x]];
        if (c == null) continue;
        paint.color = c.withValues(alpha: opacity);
        canvas.drawRect(Rect.fromLTWH(rect.left + x * px, rect.top + y * px, px + 0.5, px + 0.5), paint);
      }
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 100;
    final bob = math.sin(t * 2 * math.pi / 3) * 4 * s;
    canvas.translate(0, bob);

    // Hale
    canvas.drawCircle(
      Offset(50 * s, 52 * s),
      44 * s,
      Paint()
        ..shader = RadialGradient(colors: [
          const Color(0xFF62DCF5).withValues(alpha: 0.38),
          const Color(0xFF62DCF5).withValues(alpha: 0),
        ]).createShader(Rect.fromCircle(center: Offset(50 * s, 52 * s), radius: 44 * s)),
    );

    // Kanatlar: sırttan çırpar (yatay ölçekle)
    final wingScale = 0.55 + 0.45 * math.sin(t * 2 * math.pi * 1.6 * flap).abs();
    for (final dir in [-1.0, 1.0]) {
      canvas.save();
      final pivot = Offset(50 * s + dir * 8 * s, 58 * s);
      canvas.translate(pivot.dx, pivot.dy);
      canvas.scale(wingScale, 1);
      canvas.rotate(dir * -0.25);
      final w = 30 * s;
      final rect = dir < 0 ? Rect.fromLTWH(-w, -w * 0.8, w, w) : Rect.fromLTWH(0, -w * 0.8, w, w);
      _pixels(canvas, _wing, rect, opacity: 0.75);
      canvas.restore();
    }

    // Gövde: yarı saydam, içte parlak çekirdek
    final body = RRect.fromRectAndRadius(Rect.fromLTWH(38 * s, 56 * s, 24 * s, 28 * s), Radius.circular(3 * s));
    canvas.drawRRect(body, Paint()..color = const Color(0xFF9FF0FF).withValues(alpha: 0.55));
    canvas.drawRRect(
      RRect.fromRectAndRadius(Rect.fromLTWH(43 * s, 61 * s, 14 * s, 17 * s), Radius.circular(2 * s)),
      Paint()..color = const Color(0xFFD4FBFF).withValues(alpha: 0.9),
    );

    // Kollar
    final swing = math.sin(t * 2 * math.pi / 1.5) * 0.25;
    for (final dir in [-1.0, 1.0]) {
      canvas.save();
      canvas.translate(50 * s + dir * 15 * s, 58 * s);
      canvas.rotate(dir * (0.15 + swing));
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(-3.5 * s, 0, 7 * s, 22 * s), Radius.circular(2 * s)),
        Paint()..color = const Color(0xFF62DCF5).withValues(alpha: 0.85),
      );
      canvas.restore();
    }

    // Kafa
    final head = Rect.fromLTWH(30 * s, 18 * s, 40 * s, 40 * s);
    canvas.drawRect(
      head.inflate(2 * s),
      Paint()
        ..color = const Color(0xFF62DCF5).withValues(alpha: 0.35)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, 6 * s),
    );
    _pixels(canvas, _face, head);
  }

  @override
  bool shouldRepaint(_AllayPainter old) => old.t != t || old.flap != flap;
}
