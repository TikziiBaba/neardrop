import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

Color _hsl(double h, double s, double l) => HSLColor.fromAHSL(1, h, s / 100, l / 100).toColor();

/// NearDrop "Allay" tasarım sistemi — web'deki globals.css token'larıyla birebir aynı.
/// Gece mavisi zemin · Allay camgöbeği vurgu · Buz mavisi ışıltı
class AppColors {
  static final background = _hsl(220, 62, 6);
  static final surface = _hsl(218, 50, 10);
  static final surface2 = _hsl(216, 43, 14);
  static final surface3 = _hsl(214, 37, 19);
  static final border = _hsl(212, 40, 19);
  static final borderStrong = _hsl(208, 34, 29);
  static final foreground = _hsl(192, 60, 97);
  static final muted = _hsl(203, 30, 75);
  static final subtle = _hsl(208, 17, 55);
  static final accent = _hsl(198, 88, 43);
  static final accentHover = _hsl(194, 92, 49);
  static final accentText = _hsl(189, 92, 68);
  static final halo = _hsl(187, 100, 84);
  static final success = _hsl(158, 64, 54);
  static final warning = _hsl(43, 96, 64);
  static final danger = _hsl(350, 96, 71);
  static final fileVideo = _hsl(268, 85, 78);
  static final fileAudio = _hsl(330, 92, 76);
  static const deepBlue = Color(0xFF0B2D5C);

  static LinearGradient get brandGradient => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [deepBlue, accent, accentText],
        stops: const [0, 0.55, 1],
      );

  static LinearGradient get buttonGradient => LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [accent, accentHover],
      );
}

class AppTheme {
  static TextStyle display(double size, {FontWeight weight = FontWeight.w600, Color? color, FontStyle? style}) =>
      GoogleFonts.fraunces(
        fontSize: size,
        fontWeight: weight,
        color: color ?? AppColors.foreground,
        fontStyle: style,
        letterSpacing: -0.4,
        height: 1.15,
      );

  static ThemeData build() {
    final base = ThemeData(useMaterial3: true, brightness: Brightness.dark);
    final text = GoogleFonts.plusJakartaSansTextTheme(base.textTheme).apply(
      bodyColor: AppColors.foreground,
      displayColor: AppColors.foreground,
    );

    final scheme = ColorScheme.dark(
      primary: AppColors.accent,
      onPrimary: Colors.white,
      secondary: AppColors.accentText,
      onSecondary: AppColors.background,
      surface: AppColors.surface,
      onSurface: AppColors.foreground,
      surfaceContainerHighest: AppColors.surface3,
      surfaceContainerHigh: AppColors.surface2,
      surfaceContainer: AppColors.surface,
      error: AppColors.danger,
      onError: Colors.white,
      outline: AppColors.borderStrong,
      outlineVariant: AppColors.border,
    );

    OutlineInputBorder inputBorder(Color c, [double w = 1]) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: c, width: w),
        );

    return base.copyWith(
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.background,
      textTheme: text,
      splashFactory: InkSparkle.splashFactory,
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle.light.copyWith(statusBarColor: Colors.transparent),
        titleTextStyle: display(22),
        iconTheme: IconThemeData(color: AppColors.foreground),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface2.withValues(alpha: 0.7),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        hintStyle: TextStyle(color: AppColors.subtle),
        labelStyle: TextStyle(color: AppColors.muted),
        floatingLabelStyle: TextStyle(color: AppColors.accentText),
        prefixIconColor: AppColors.subtle,
        suffixIconColor: AppColors.subtle,
        border: inputBorder(AppColors.border),
        enabledBorder: inputBorder(AppColors.border),
        focusedBorder: inputBorder(AppColors.accentHover, 1.4),
        errorBorder: inputBorder(AppColors.danger),
        focusedErrorBorder: inputBorder(AppColors.danger, 1.4),
      ),
      dividerTheme: DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        dragHandleColor: AppColors.borderStrong,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(26),
          side: BorderSide(color: AppColors.border),
        ),
        titleTextStyle: display(20),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.surface3,
        contentTextStyle: GoogleFonts.plusJakartaSans(color: AppColors.foreground, fontWeight: FontWeight.w500),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? Colors.white : AppColors.subtle),
        trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? AppColors.accent : AppColors.surface3),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: AppColors.accentText,
        linearTrackColor: AppColors.surface3,
        circularTrackColor: Colors.transparent,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surface2,
        selectedColor: AppColors.accent.withValues(alpha: 0.25),
        side: BorderSide(color: AppColors.border),
        labelStyle: GoogleFonts.plusJakartaSans(color: AppColors.foreground, fontSize: 13, fontWeight: FontWeight.w600),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      popupMenuTheme: PopupMenuThemeData(
        color: AppColors.surface2,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: AppColors.border)),
      ),
      textSelectionTheme: TextSelectionThemeData(
        cursorColor: AppColors.accentText,
        selectionColor: AppColors.accent.withValues(alpha: 0.4),
        selectionHandleColor: AppColors.accentText,
      ),
      pageTransitionsTheme: const PageTransitionsTheme(builders: {
        TargetPlatform.android: PredictiveBackPageTransitionsBuilder(),
        TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      }),
    );
  }
}
