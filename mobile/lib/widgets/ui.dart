import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/format.dart';
import '../core/i18n.dart';
import '../theme/app_theme.dart';
import 'allay.dart';

// ───────────────────────── Arka plan ─────────────────────────

/// Gece mavisi zemin üzerinde yavaşça süzülen camgöbeği "aurora" lekeleri ve yıldızlar.
class AuroraBackground extends StatefulWidget {
  final Widget child;
  final bool intense;
  const AuroraBackground({super.key, required this.child, this.intense = false});

  @override
  State<AuroraBackground> createState() => _AuroraBackgroundState();
}

class _AuroraBackgroundState extends State<AuroraBackground> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(seconds: 24))..repeat();

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: RepaintBoundary(
            child: AnimatedBuilder(
              animation: _c,
              builder: (_, _) => CustomPaint(painter: _AuroraPainter(_c.value, widget.intense)),
            ),
          ),
        ),
        widget.child,
      ],
    );
  }
}

class _AuroraPainter extends CustomPainter {
  final double v;
  final bool intense;
  _AuroraPainter(this.v, this.intense);

  static final _stars = List.generate(46, (i) {
    final r = math.Random(i * 7919);
    return (r.nextDouble(), r.nextDouble(), r.nextDouble() * 1.4 + 0.4, r.nextDouble());
  });

  void _blob(Canvas canvas, Offset c, double radius, Color color) {
    canvas.drawCircle(
      c,
      radius,
      Paint()..shader = RadialGradient(colors: [color, color.withValues(alpha: 0)]).createShader(Rect.fromCircle(center: c, radius: radius)),
    );
  }

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawRect(Offset.zero & size, Paint()..color = AppColors.background);
    final a = v * 2 * math.pi;
    final w = size.width, h = size.height;
    final k = intense ? 1.35 : 1.0;
    _blob(canvas, Offset(w * (0.85 + 0.06 * math.sin(a)), h * (0.08 + 0.04 * math.cos(a))), w * 0.75,
        AppColors.accent.withValues(alpha: 0.22 * k));
    _blob(canvas, Offset(w * (0.05 + 0.07 * math.cos(a * 1.3)), h * (0.42 + 0.05 * math.sin(a))), w * 0.7,
        AppColors.deepBlue.withValues(alpha: 0.55 * k));
    _blob(canvas, Offset(w * (0.6 + 0.08 * math.sin(a * 0.7)), h * (0.92 + 0.03 * math.cos(a * 1.1))), w * 0.6,
        AppColors.accentText.withValues(alpha: 0.10 * k));

    final star = Paint();
    for (final (x, y, r, phase) in _stars) {
      final twinkle = 0.25 + 0.55 * (0.5 + 0.5 * math.sin(a * 3 + phase * 6.28));
      star.color = AppColors.halo.withValues(alpha: twinkle * 0.5);
      canvas.drawCircle(Offset(x * w, y * h), r, star);
    }
  }

  @override
  bool shouldRepaint(_AuroraPainter old) => old.v != v;
}

// ───────────────────────── Logo ─────────────────────────

/// Piksel damla — brand/neardrop-logo/neardrop-symbol-dark-bg.svg ile aynı 16×16 ızgara.
/// Her satır: (satır, başlangıç sütunu, bitiş sütunu).
const _dropRows = [
  (1, 7, 8), (2, 7, 8), (3, 6, 9), (4, 5, 10), (5, 4, 11), (6, 3, 12), (7, 3, 12), (8, 2, 13),
  (9, 2, 13), (10, 2, 13), (11, 2, 13), (12, 2, 13), (13, 3, 12), (14, 5, 10),
];
const _dropEyes = {(9, 6), (10, 6), (9, 9), (10, 9)};
const _dropGlint = {(6, 4), (7, 4), (8, 3)};

class LogoMark extends StatelessWidget {
  final double size;
  const LogoMark({super.key, this.size = 40});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _PixelDropPainter()),
    );
  }
}

class _PixelDropPainter extends CustomPainter {
  static const _body = Color(0xFF62DCF5);
  static const _glint = Color(0xFFD4FBFF);
  static const _eyes = Color(0xFF0B2D5C);

  @override
  void paint(Canvas canvas, Size size) {
    final cell = size.width / 16;
    // Hücre sınırlarını piksele yuvarla: kenar yumuşatma kapalıyken aralık/üst üste binme olmasın
    Rect rect(int r, int c) => Rect.fromLTRB((c * cell).roundToDouble(), (r * cell).roundToDouble(),
        ((c + 1) * cell).roundToDouble(), ((r + 1) * cell).roundToDouble());

    // Sitedeki gibi hafif camgöbeği parıltı
    canvas.drawCircle(
      Offset(size.width / 2, size.height * 0.62),
      size.width * 0.36,
      Paint()
        ..color = _body.withValues(alpha: 0.30)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, size.width * 0.18),
    );

    final paint = Paint()..isAntiAlias = false;
    for (final (r, c0, c1) in _dropRows) {
      for (var c = c0; c <= c1; c++) {
        paint.color = _dropEyes.contains((r, c)) ? _eyes : (_dropGlint.contains((r, c)) ? _glint : _body);
        canvas.drawRect(rect(r, c), paint);
      }
    }
  }

  @override
  bool shouldRepaint(_PixelDropPainter old) => false;
}

class Wordmark extends StatelessWidget {
  final double size;
  const Wordmark({super.key, this.size = 22});

  @override
  Widget build(BuildContext context) {
    return Text.rich(
      TextSpan(children: [
        TextSpan(text: 'Near', style: AppTheme.display(size)),
        TextSpan(text: 'Drop', style: AppTheme.display(size, color: AppColors.accentText, style: FontStyle.italic)),
      ]),
    );
  }
}

class LogoRow extends StatelessWidget {
  final double size;
  const LogoRow({super.key, this.size = 36});

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        // Oranlar brand/neardrop-logo yatay yerleşimiyle aynı: büyük harf yüksekliği ≈ sembolün %40'ı
        children: [LogoMark(size: size), SizedBox(width: size * 0.16), Wordmark(size: size * 0.56)],
      );
}

// ───────────────────────── Kartlar ve dokunma ─────────────────────────

/// Basınca hafifçe küçülen sarmalayıcı (Apple tarzı dokunma geri bildirimi).
class Pressable extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final double scale;
  const Pressable({super.key, required this.child, this.onTap, this.onLongPress, this.scale = 0.97});

  @override
  State<Pressable> createState() => _PressableState();
}

class _PressableState extends State<Pressable> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onTap != null || widget.onLongPress != null;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: enabled ? (_) => setState(() => _down = true) : null,
      onTapCancel: enabled ? () => setState(() => _down = false) : null,
      onTapUp: enabled ? (_) => setState(() => _down = false) : null,
      onTap: widget.onTap == null
          ? null
          : () {
              HapticFeedback.selectionClick();
              widget.onTap!();
            },
      onLongPress: widget.onLongPress == null
          ? null
          : () {
              HapticFeedback.mediumImpact();
              widget.onLongPress!();
            },
      child: AnimatedScale(
        scale: _down ? widget.scale : 1,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOutCubic,
        child: widget.child,
      ),
    );
  }
}

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final double radius;
  final Color? color;
  final Color? borderColor;
  final Gradient? gradient;
  final bool glow;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(18),
    this.onTap,
    this.onLongPress,
    this.radius = 24,
    this.color,
    this.borderColor,
    this.gradient,
    this.glow = false,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: gradient == null ? (color ?? AppColors.surface.withValues(alpha: 0.78)) : null,
        gradient: gradient,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor ?? AppColors.border.withValues(alpha: 0.9)),
        boxShadow: glow
            ? [BoxShadow(color: AppColors.accent.withValues(alpha: 0.25), blurRadius: 30, offset: const Offset(0, 10))]
            : [BoxShadow(color: Colors.black.withValues(alpha: 0.18), blurRadius: 18, offset: const Offset(0, 8))],
      ),
      child: child,
    );
    if (onTap == null && onLongPress == null) return card;
    return Pressable(onTap: onTap, onLongPress: onLongPress, child: card);
  }
}

/// Bulanık cam yüzey (alt menü, üst çubuk gibi yüzen öğeler için)
class FrostedPanel extends StatelessWidget {
  final Widget child;
  final BorderRadius radius;
  final EdgeInsetsGeometry padding;
  const FrostedPanel({super.key, required this.child, this.radius = const BorderRadius.all(Radius.circular(28)), this.padding = EdgeInsets.zero});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: radius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: AppColors.surface.withValues(alpha: 0.72),
            borderRadius: radius,
            border: Border.all(color: AppColors.borderStrong.withValues(alpha: 0.55)),
          ),
          child: child,
        ),
      ),
    );
  }
}

// ───────────────────────── Butonlar ─────────────────────────

class PrimaryButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool loading;
  final bool expand;
  final bool danger;
  final double height;

  const PrimaryButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.loading = false,
    this.expand = true,
    this.danger = false,
    this.height = 54,
  });

  @override
  Widget build(BuildContext context) {
    final disabled = onPressed == null || loading;
    final gradient = danger
        ? LinearGradient(colors: [AppColors.danger, const Color(0xFFE11D48)])
        : AppColors.buttonGradient;
    final content = Row(
      mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (loading)
          const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
        else if (icon != null)
          Icon(icon, size: 19, color: Colors.white),
        if ((loading || icon != null) && label.isNotEmpty) const SizedBox(width: 10),
        Flexible(
          child: Text(
            label,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15.5, letterSpacing: 0.1),
          ),
        ),
      ],
    );
    return Pressable(
      onTap: disabled ? null : onPressed,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: disabled && !loading ? 0.5 : 1,
        child: Container(
          height: height,
          padding: const EdgeInsets.symmetric(horizontal: 22),
          decoration: BoxDecoration(
            gradient: gradient,
            borderRadius: BorderRadius.circular(height / 2),
            border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
            boxShadow: [
              BoxShadow(
                color: (danger ? AppColors.danger : AppColors.accent).withValues(alpha: 0.35),
                blurRadius: 22,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: content,
        ),
      ),
    );
  }
}

class SecondaryButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool expand;
  final Color? color;
  final double height;
  final bool loading;

  const SecondaryButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.expand = true,
    this.color,
    this.height = 52,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    final fg = color ?? AppColors.foreground;
    return Pressable(
      onTap: loading ? null : onPressed,
      child: Opacity(
        opacity: onPressed == null ? 0.5 : 1,
        child: Container(
          height: height,
          padding: const EdgeInsets.symmetric(horizontal: 18),
          decoration: BoxDecoration(
            color: AppColors.surface2.withValues(alpha: 0.8),
            borderRadius: BorderRadius.circular(height / 2),
            border: Border.all(color: AppColors.borderStrong.withValues(alpha: 0.7)),
          ),
          child: Row(
            mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2.2, color: fg))
              else if (icon != null)
                Icon(icon, size: 18, color: fg),
              if ((loading || icon != null) && label.isNotEmpty) const SizedBox(width: 9),
              Flexible(
                child: Text(label,
                    overflow: TextOverflow.ellipsis, style: TextStyle(color: fg, fontWeight: FontWeight.w600, fontSize: 14.5)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CircleIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final double size;
  final Color? color;
  final Color? background;
  final String? tooltip;
  final Widget? badge;

  const CircleIconButton({
    super.key,
    required this.icon,
    this.onTap,
    this.size = 44,
    this.color,
    this.background,
    this.tooltip,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    Widget w = Pressable(
      onTap: onTap,
      scale: 0.9,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: background ?? AppColors.surface2.withValues(alpha: 0.85),
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.border),
        ),
        child: Icon(icon, size: size * 0.44, color: color ?? AppColors.foreground),
      ),
    );
    if (badge != null) {
      w = Stack(clipBehavior: Clip.none, children: [w, Positioned(right: -2, top: -2, child: badge!)]);
    }
    return tooltip == null ? w : Tooltip(message: tooltip!, child: w);
  }
}

// ───────────────────────── Küçük parçalar ─────────────────────────

class FileTypeIcon extends StatelessWidget {
  final FileCategory category;
  final double size;
  final bool folder;
  const FileTypeIcon({super.key, required this.category, this.size = 46, this.folder = false});

  @override
  Widget build(BuildContext context) {
    final color = folder ? AppColors.accentText : category.color;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(size * 0.3),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color.withValues(alpha: 0.28), color.withValues(alpha: 0.10)],
        ),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Icon(folder ? LucideIcons.folder : category.icon, size: size * 0.46, color: color),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String? action;
  final VoidCallback? onAction;
  const SectionHeader({super.key, required this.title, this.action, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 8, 4, 12),
      child: Row(
        children: [
          Expanded(child: Text(title, style: AppTheme.display(19))),
          if (action != null)
            GestureDetector(
              onTap: onAction,
              child: Row(children: [
                Text(action!, style: TextStyle(color: AppColors.accentText, fontWeight: FontWeight.w600, fontSize: 13.5)),
                Icon(LucideIcons.chevronRight, size: 16, color: AppColors.accentText),
              ]),
            ),
        ],
      ),
    );
  }
}

class Pill extends StatelessWidget {
  final String text;
  final Color color;
  final IconData? icon;
  const Pill(this.text, {super.key, required this.color, this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (icon != null) ...[Icon(icon, size: 12, color: color), const SizedBox(width: 4)],
        Text(text, style: TextStyle(color: color, fontSize: 11.5, fontWeight: FontWeight.w700)),
      ]),
    );
  }
}

class EmptyState extends StatelessWidget {
  final String title;
  final String message;
  final Widget? action;
  const EmptyState({super.key, required this.title, required this.message, this.action});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const AllayMascot(size: 120),
          const SizedBox(height: 18),
          Text(title, textAlign: TextAlign.center, style: AppTheme.display(21)),
          const SizedBox(height: 8),
          Text(message, textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted, height: 1.45)),
          if (action != null) ...[const SizedBox(height: 22), action!],
        ],
      ),
    );
  }
}

class QuotaBar extends StatelessWidget {
  final int used;
  final int quota;
  final double height;
  const QuotaBar({super.key, required this.used, required this.quota, this.height = 10});

  @override
  Widget build(BuildContext context) {
    final ratio = quota <= 0 ? 0.0 : (used / quota).clamp(0.0, 1.0);
    final color = ratio > 0.9 ? AppColors.danger : (ratio > 0.75 ? AppColors.warning : AppColors.accentText);
    return LayoutBuilder(
      builder: (_, c) => Container(
        height: height,
        decoration: BoxDecoration(color: AppColors.surface3, borderRadius: BorderRadius.circular(height)),
        alignment: Alignment.centerLeft,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: ratio),
          duration: const Duration(milliseconds: 900),
          curve: Curves.easeOutCubic,
          builder: (_, v, _) => Container(
            width: math.max(height, c.maxWidth * v),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [AppColors.accent, color]),
              borderRadius: BorderRadius.circular(height),
              boxShadow: [BoxShadow(color: color.withValues(alpha: 0.45), blurRadius: 10)],
            ),
          ),
        ),
      ),
    );
  }
}

class UserAvatar extends StatelessWidget {
  final String? url;
  final String name;
  final double size;
  const UserAvatar({super.key, this.url, required this.name, this.size = 44});

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().isEmpty
        ? '?'
        : name.trim().split(RegExp(r'\s+')).take(2).map((p) => p.isEmpty ? '' : p[0].toUpperCase()).join();
    final fallback = Container(
      alignment: Alignment.center,
      decoration: BoxDecoration(gradient: AppColors.brandGradient),
      child: Text(initials, style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: size * 0.36)),
    );
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.accentText.withValues(alpha: 0.45), width: 1.5),
      ),
      child: ClipOval(
        child: url == null || url!.isEmpty
            ? fallback
            : Image.network(url!, fit: BoxFit.cover, errorBuilder: (_, _, _) => fallback),
      ),
    );
  }
}

// ───────────────────────── Bildirimler ve onaylar ─────────────────────────

void showToast(BuildContext context, String message, {bool error = false, bool success = false}) {
  final messenger = ScaffoldMessenger.maybeOf(context);
  if (messenger == null) return;
  if (error) {
    HapticFeedback.heavyImpact();
  } else if (success) {
    HapticFeedback.lightImpact();
  }
  messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Row(children: [
        Icon(
          error ? LucideIcons.circleAlert : (success ? LucideIcons.circleCheck : LucideIcons.info),
          color: error ? AppColors.danger : (success ? AppColors.success : AppColors.accentText),
          size: 20,
        ),
        const SizedBox(width: 12),
        Expanded(child: Text(message)),
      ]),
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      duration: Duration(milliseconds: error ? 4200 : 2600),
    ));
}

Future<bool> confirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  String? confirm,
  bool danger = false,
}) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(title),
      content: Text(message, style: TextStyle(color: AppColors.muted, height: 1.45)),
      actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      actions: [
        Row(children: [
          Expanded(child: SecondaryButton(label: t('Vazgeç', 'Cancel'), height: 46, onPressed: () => Navigator.pop(ctx, false))),
          const SizedBox(width: 10),
          Expanded(
            child: PrimaryButton(
              label: confirm ?? t('Onayla', 'Confirm'),
              danger: danger,
              height: 46,
              onPressed: () => Navigator.pop(ctx, true),
            ),
          ),
        ]),
      ],
    ),
  );
  return ok == true;
}

Future<String?> promptDialog(
  BuildContext context, {
  required String title,
  String? initial,
  String? hint,
  String? confirm,
  bool obscure = false,
  int maxLines = 1,
}) {
  final controller = TextEditingController(text: initial);
  return showDialog<String>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(title),
      content: TextField(
        controller: controller,
        autofocus: true,
        obscureText: obscure,
        maxLines: maxLines,
        decoration: InputDecoration(hintText: hint),
        onSubmitted: maxLines == 1 ? (v) => Navigator.pop(ctx, v.trim()) : null,
      ),
      actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      actions: [
        Row(children: [
          Expanded(child: SecondaryButton(label: t('Vazgeç', 'Cancel'), height: 46, onPressed: () => Navigator.pop(ctx))),
          const SizedBox(width: 10),
          Expanded(
            child: PrimaryButton(
              label: confirm ?? t('Kaydet', 'Save'),
              height: 46,
              onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            ),
          ),
        ]),
      ],
    ),
  );
}

/// Alt sayfa başlığı + içerik
Future<T?> showSheet<T>(BuildContext context, {required Widget Function(BuildContext) builder, bool scrollable = true}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (ctx) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
      child: scrollable ? SingleChildScrollView(child: builder(ctx)) : builder(ctx),
    ),
  );
}

class SheetAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final VoidCallback onTap;
  final Color? color;
  const SheetAction({super.key, required this.icon, required this.label, required this.onTap, this.subtitle, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.foreground;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        child: Row(children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: c.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 19, color: c),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: TextStyle(fontWeight: FontWeight.w600, color: c, fontSize: 15)),
              if (subtitle != null) Text(subtitle!, style: TextStyle(color: AppColors.subtle, fontSize: 12.5)),
            ]),
          ),
        ]),
      ),
    );
  }
}

class Loader extends StatelessWidget {
  final String? label;
  const Loader({super.key, this.label});

  @override
  Widget build(BuildContext context) => Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const SizedBox(width: 30, height: 30, child: CircularProgressIndicator(strokeWidth: 2.6)),
          if (label != null) ...[const SizedBox(height: 14), Text(label!, style: TextStyle(color: AppColors.muted))],
        ]),
      );
}

class ErrorRetry extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const ErrorRetry({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(LucideIcons.cloudOff, size: 42, color: AppColors.subtle),
            const SizedBox(height: 14),
            Text(message, textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
            const SizedBox(height: 18),
            SecondaryButton(label: t('Tekrar dene', 'Retry'), icon: LucideIcons.refreshCw, expand: false, onPressed: onRetry),
          ]),
        ),
      );
}

/// Sayfa başlığı: serif büyük başlık + opsiyonel alt yazı
class PageTitle extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget> actions;
  const PageTitle({super.key, required this.title, this.subtitle, this.actions = const []});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 16, 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: AppTheme.display(30)),
              if (subtitle != null) ...[
                const SizedBox(height: 4),
                Text(subtitle!, style: TextStyle(color: AppColors.muted, fontSize: 13.5)),
              ],
            ]),
          ),
          ...actions.expand((a) => [const SizedBox(width: 8), a]),
        ],
      ),
    );
  }
}
