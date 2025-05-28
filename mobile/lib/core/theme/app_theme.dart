import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Colors
  static const Color primaryColor = Color(0xFF1A56DB);
  static const Color secondaryColor = Color(0xFF6B7280);
  static const Color accentColor = Color(0xFF3B82F6);
  static const Color successColor = Color(0xFF10B981);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color infoColor = Color(0xFF3B82F6);
  
  // Light theme colors
  static const Color lightBackgroundColor = Color(0xFFF9FAFB);
  static const Color lightSurfaceColor = Colors.white;
  static const Color lightTextColor = Color(0xFF1F2937);
  static const Color lightSecondaryTextColor = Color(0xFF6B7280);
  static const Color lightDividerColor = Color(0xFFE5E7EB);
  
  // Dark theme colors
  static const Color darkBackgroundColor = Color(0xFF111827);
  static const Color darkSurfaceColor = Color(0xFF1F2937);
  static const Color darkTextColor = Color(0xFFF9FAFB);
  static const Color darkSecondaryTextColor = Color(0xFF9CA3AF);
  static const Color darkDividerColor = Color(0xFF374151);
  
  // Elevation
  static const double cardElevation = 2.0;
  static const double dialogElevation = 8.0;
  static const double appBarElevation = 0.0;
  
  // Border radius
  static const double borderRadius = 12.0;
  static const double buttonRadius = 8.0;
  static const double cardRadius = 12.0;
  static const double inputRadius = 8.0;
  
  // Light theme
  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: accentColor,
      surface: lightSurfaceColor,
      error: errorColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: lightTextColor,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: lightBackgroundColor,
    appBarTheme: const AppBarTheme(
      elevation: appBarElevation,
      backgroundColor: lightBackgroundColor,
      foregroundColor: lightTextColor,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: lightTextColor,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: cardElevation,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(cardRadius),
      ),
      color: lightSurfaceColor,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
        side: const BorderSide(color: primaryColor, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryColor,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: lightSurfaceColor,
      contentPadding: const EdgeInsets.all(16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: lightDividerColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: lightDividerColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: errorColor),
      ),
      labelStyle: const TextStyle(color: lightSecondaryTextColor),
      hintStyle: const TextStyle(color: lightSecondaryTextColor),
    ),
    dividerTheme: const DividerThemeData(
      color: lightDividerColor,
      thickness: 1,
      space: 1,
    ),
    textTheme: GoogleFonts.poppinsTextTheme(ThemeData.light().textTheme).copyWith(
      displayLarge: const TextStyle(color: lightTextColor, fontWeight: FontWeight.bold),
      displayMedium: const TextStyle(color: lightTextColor, fontWeight: FontWeight.bold),
      displaySmall: const TextStyle(color: lightTextColor, fontWeight: FontWeight.bold),
      headlineLarge: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w600),
      headlineMedium: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w600),
      headlineSmall: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w600),
      titleLarge: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w600),
      titleMedium: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w500),
      titleSmall: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w500),
      bodyLarge: const TextStyle(color: lightTextColor),
      bodyMedium: const TextStyle(color: lightTextColor),
      bodySmall: const TextStyle(color: lightSecondaryTextColor),
      labelLarge: const TextStyle(color: lightTextColor, fontWeight: FontWeight.w500),
      labelMedium: const TextStyle(color: lightTextColor),
      labelSmall: const TextStyle(color: lightSecondaryTextColor),
    ),
  );
  
  // Dark theme
  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: accentColor,
      surface: darkSurfaceColor,
      error: errorColor,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: darkTextColor,
      onError: Colors.white,
    ),
    scaffoldBackgroundColor: darkBackgroundColor,
    appBarTheme: const AppBarTheme(
      elevation: appBarElevation,
      backgroundColor: darkBackgroundColor,
      foregroundColor: darkTextColor,
      centerTitle: false,
      titleTextStyle: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: darkTextColor,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: cardElevation,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(cardRadius),
      ),
      color: darkSurfaceColor,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primaryColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(buttonRadius),
        ),
        side: const BorderSide(color: primaryColor, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryColor,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: darkSurfaceColor,
      contentPadding: const EdgeInsets.all(16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: darkDividerColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: darkDividerColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: primaryColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(inputRadius),
        borderSide: const BorderSide(color: errorColor),
      ),
      labelStyle: const TextStyle(color: darkSecondaryTextColor),
      hintStyle: const TextStyle(color: darkSecondaryTextColor),
    ),
    dividerTheme: const DividerThemeData(
      color: darkDividerColor,
      thickness: 1,
      space: 1,
    ),
    textTheme: GoogleFonts.poppinsTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: const TextStyle(color: darkTextColor, fontWeight: FontWeight.bold),
      displayMedium: const TextStyle(color: darkTextColor, fontWeight: FontWeight.bold),
      displaySmall: const TextStyle(color: darkTextColor, fontWeight: FontWeight.bold),
      headlineLarge: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w600),
      headlineMedium: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w600),
      headlineSmall: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w600),
      titleLarge: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w600),
      titleMedium: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w500),
      titleSmall: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w500),
      bodyLarge: const TextStyle(color: darkTextColor),
      bodyMedium: const TextStyle(color: darkTextColor),
      bodySmall: const TextStyle(color: darkSecondaryTextColor),
      labelLarge: const TextStyle(color: darkTextColor, fontWeight: FontWeight.w500),
      labelMedium: const TextStyle(color: darkTextColor),
      labelSmall: const TextStyle(color: darkSecondaryTextColor),
    ),
  );
} 