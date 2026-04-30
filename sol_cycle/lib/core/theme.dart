import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class SolColors {
  // Base palette
  static const Color background = Color(0xFFFCFAF8);   // Soft Ivory White
  static const Color surface = Color(0xFFF5F0F4);       // Petal Mist
  static const Color card = Color(0xFFFFFFFF);           // Pure White
  static const Color border = Color(0xFFE6DEE6);         // Cloud Mauve

  // Text
  static const Color textPrimary = Color(0xFF3E3745);    // Deep Plum Slate
  static const Color textSecondary = Color(0xFF7F7788);  // Muted Mauve Gray
  static const Color textMuted = Color(0xFFADA7B3);      // Light Mauve

  // Accent
  static const Color primary = Color(0xFFB6A3B6);        // Moon Mauve
  static const Color primaryLight = Color(0xFFE8DEE8);   // Light Mauve
  static const Color primaryDark = Color(0xFF7F7788);    // Muted Mauve Gray

  // Phase colors — drawn from the new wheel palette
  static const Color menstrual = Color(0xFFF0A28F);      // Coral (inner winter warmth)
  static const Color menstrualLight = Color(0xFFFAE3DC); // Light Coral
  static const Color follicular = Color(0xFFB7DFA3);     // Soft Green (inner spring)
  static const Color follicularLight = Color(0xFFDEF2D4);// Light Green
  static const Color ovulatory = Color(0xFFF2DEA0);      // Warm Yellow (inner summer)
  static const Color ovulatoryLight = Color(0xFFFAF2D5); // Light Yellow
  static const Color luteal = Color(0xFFB7A6D9);         // Lavender (inner autumn)
  static const Color lutealLight = Color(0xFFE5DFF5);    // Light Lavender

  // Wheel month colors — Sol Cycle brand spectrum
  static const List<Color> wheelColors = [
    Color(0xFFB7A6D9), // January  - Lavender
    Color(0xFFAEBCE8), // February - Periwinkle Blue
    Color(0xFFA9D2EC), // March    - Sky Blue
    Color(0xFFA8E0D4), // April    - Seafoam
    Color(0xFFB7DFA3), // May      - Soft Green
    Color(0xFFD5E59B), // June     - Yellow-Green
    Color(0xFFF2DEA0), // Sol      - Warm Yellow (13th month)
    Color(0xFFF6C59F), // July     - Peach
    Color(0xFFF0A28F), // August   - Coral
    Color(0xFFD98C78), // September- Terracotta
    Color(0xFFC98A97), // October  - Mauve Pink
    Color(0xFFB48FAF), // November - Soft Violet
    Color(0xFF9D8BC2), // December - Medium Purple
  ];

  // Moon
  static const Color moonDark = Color(0xFFE6DEE6);   // Cloud Mauve
  static const Color moonLight = Color(0xFFFCFAF8);  // Soft Ivory White

  // Status
  static const Color pmddWarning = Color(0xFFF0A28F);      // Coral
  static const Color pmddWarningLight = Color(0xFFFAE3DC); // Light Coral
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
        error: Color(0xFFF0A28F),
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
