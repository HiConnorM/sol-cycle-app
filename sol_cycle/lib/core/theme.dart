import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SolColors {
  // Base palette
  static const Color background = Color(0xFFFAF7F2);
  static const Color surface = Color(0xFFF5F0E8);
  static const Color card = Color(0xFFFFFFFF);
  static const Color border = Color(0xFFE8E4DF);

  // Text
  static const Color textPrimary = Color(0xFF2B2B2B);
  static const Color textSecondary = Color(0xFF6B6B6B);
  static const Color textMuted = Color(0xFFA0A0A0);

  // Accent
  static const Color primary = Color(0xFFC6A882);
  static const Color primaryLight = Color(0xFFF0E8D8);
  static const Color primaryDark = Color(0xFF8B6E4E);

  // Phase colors
  static const Color menstrual = Color(0xFFD8A7A7);
  static const Color menstrualLight = Color(0xFFF2E0E0);
  static const Color follicular = Color(0xFFAFC3A4);
  static const Color follicularLight = Color(0xFFDDEDD8);
  static const Color ovulatory = Color(0xFFEAD9A0);
  static const Color ovulatoryLight = Color(0xFFF7F0D0);
  static const Color luteal = Color(0xFFBFA8C9);
  static const Color lutealLight = Color(0xFFE8DDEF);

  // Wheel month colors (seasonal pastel spectrum)
  static const List<Color> wheelColors = [
    Color(0xFFC9D6E3), // January  - Pale Blue
    Color(0xFFC7C3D9), // February - Lavender Gray
    Color(0xFFBFA8C9), // March    - Soft Plum
    Color(0xFFBFD8C2), // April    - Sage Green
    Color(0xFFAFC3A4), // May      - Soft Olive
    Color(0xFFEAD9A0), // June     - Muted Gold
    Color(0xFFE8D2B0), // Sol      - Warm Sand (13th month)
    Color(0xFFE6B8A2), // July     - Soft Peach
    Color(0xFFD8A7A7), // August   - Dusty Rose
    Color(0xFFE4BFC3), // September- Blush Pink
    Color(0xFFB7D3CF), // October  - Misty Teal
    Color(0xFFC9D6E3), // November - Pale Blue
    Color(0xFFC7C3D9), // December - Lavender Gray
  ];

  // Moon
  static const Color moonDark = Color(0xFFE8E4DF);
  static const Color moonLight = Color(0xFFFFFEF8);

  // Status
  static const Color pmddWarning = Color(0xFFE8BBBB);
  static const Color pmddWarningLight = Color(0xFFF5E0E0);
}

class SolTheme {
  static ThemeData get light {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: SolColors.background,
      colorScheme: const ColorScheme.light(
        primary: SolColors.primary,
        onPrimary: Colors.white,
        secondary: SolColors.primaryLight,
        onSecondary: SolColors.textPrimary,
        surface: SolColors.surface,
        onSurface: SolColors.textPrimary,
        outline: SolColors.border,
        error: Color(0xFFD8A7A7),
      ),
      textTheme: _buildTextTheme(),
      appBarTheme: const AppBarTheme(
        backgroundColor: SolColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: SolColors.textPrimary),
        titleTextStyle: TextStyle(
          color: SolColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: SolColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: SolColors.border, width: 1),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: SolColors.card,
        selectedItemColor: SolColors.primary,
        unselectedItemColor: SolColors.textMuted,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
      ),
      dividerTheme: const DividerThemeData(
        color: SolColors.border,
        thickness: 1,
        space: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SolColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SolColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SolColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: SolColors.primary, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  static TextTheme _buildTextTheme() {
    final googleFonts = GoogleFonts.dmSansTextTheme();
    return googleFonts.copyWith(
      displayLarge: GoogleFonts.cormorantGaramond(
        fontSize: 48,
        fontWeight: FontWeight.w300,
        color: SolColors.textPrimary,
        letterSpacing: -1,
      ),
      displayMedium: GoogleFonts.cormorantGaramond(
        fontSize: 36,
        fontWeight: FontWeight.w400,
        color: SolColors.textPrimary,
        letterSpacing: -0.5,
      ),
      headlineLarge: GoogleFonts.dmSans(
        fontSize: 28,
        fontWeight: FontWeight.w600,
        color: SolColors.textPrimary,
        letterSpacing: -0.5,
      ),
      headlineMedium: GoogleFonts.dmSans(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: SolColors.textPrimary,
        letterSpacing: -0.3,
      ),
      headlineSmall: GoogleFonts.dmSans(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: SolColors.textPrimary,
        letterSpacing: -0.2,
      ),
      titleLarge: GoogleFonts.dmSans(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: SolColors.textPrimary,
        letterSpacing: -0.1,
      ),
      titleMedium: GoogleFonts.dmSans(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: SolColors.textPrimary,
      ),
      bodyLarge: GoogleFonts.dmSans(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: SolColors.textPrimary,
        height: 1.6,
      ),
      bodyMedium: GoogleFonts.dmSans(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: SolColors.textSecondary,
        height: 1.5,
      ),
      bodySmall: GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: SolColors.textMuted,
        height: 1.4,
      ),
      labelLarge: GoogleFonts.dmSans(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: SolColors.textPrimary,
        letterSpacing: 0.1,
      ),
      labelMedium: GoogleFonts.dmSans(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: SolColors.textSecondary,
        letterSpacing: 0.5,
      ),
      labelSmall: GoogleFonts.dmSans(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        color: SolColors.textMuted,
        letterSpacing: 0.5,
      ),
    );
  }
}
