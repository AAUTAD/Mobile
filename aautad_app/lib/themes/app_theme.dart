// lib/themes/app_theme.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/colors.dart';

class AppTheme {
  // Light Theme
  static final lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: Color(0xFFF86728), // Use proper orange without opacity
    colorScheme: ColorScheme.fromSeed(
      seedColor: Color(0xFFF86728), // Solid orange primary color
      brightness: Brightness.light,
      secondary: AppColors.secondary,
      surface: Colors.white,
      background: AppColors.background, // Back to original grayish background
      onBackground: Colors.black87,
      onSurface: Colors.black87,
    ),
    scaffoldBackgroundColor: AppColors.background, // Back to original grayish background
    visualDensity: VisualDensity.adaptivePlatformDensity,
    fontFamily: 'Lato',
    splashColor: Colors.transparent,

    // AppBar Theme
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
      elevation: 0,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: Colors.black,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),

    // Card Theme
    cardTheme: CardTheme(
      color: Colors.white, // Back to white cards
      elevation: 4, // Increased elevation for better contrast
      shadowColor: Colors.black26, // Add subtle shadow
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!, width: 1), // Add border
      ),
    ),

    // Text Theme
    textTheme: TextTheme(
      bodyLarge: TextStyle(color: Colors.black87, fontSize: 16),
      bodyMedium: TextStyle(color: Colors.black87, fontSize: 14),
      bodySmall: TextStyle(color: Colors.black54, fontSize: 12),
      headlineSmall: TextStyle(
        color: Colors.black, 
        fontWeight: FontWeight.bold,
        fontSize: 20,
      ),
      titleLarge: TextStyle(
        color: Colors.black, 
        fontWeight: FontWeight.bold,
        fontSize: 18,
      ),
      titleMedium: TextStyle(
        color: Colors.black87, 
        fontWeight: FontWeight.w600,
        fontSize: 16,
      ),
    ),

    // Icon Theme
    iconTheme: IconThemeData(color: Colors.grey[700]),

    // Bottom Navigation Bar Theme
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: Colors.white,
      selectedItemColor: Color(0xFFF86728), // Use solid orange
      unselectedItemColor: Colors.grey[600],
      elevation: 8, // Add elevation for contrast
    ),
  );

  // Dark Theme
  static final darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: const Color.fromARGB(255, 230, 91, 40),
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
      secondary: AppColors.secondary,
      surface: Color.fromARGB(255, 52, 52, 52),
      background: Color.fromARGB(255, 27, 27, 27),
    ),
    scaffoldBackgroundColor: Color.fromARGB(255, 27, 27, 27),
    visualDensity: VisualDensity.adaptivePlatformDensity,
    fontFamily: 'Lato',
    splashColor: Colors.transparent,

    // AppBar Theme
    appBarTheme: AppBarTheme(
      backgroundColor: Color.fromARGB(255, 27, 27, 27),
      foregroundColor: Colors.white,
      elevation: 0,
      systemOverlayStyle: SystemUiOverlayStyle.light,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: Colors.white,
        fontSize: 18,
        fontWeight: FontWeight.bold,
      ),
    ),

    // Card Theme
    cardTheme: CardTheme(
      color: Color.fromARGB(255, 27, 27, 27),
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),

    // Text Theme
    textTheme: TextTheme(
      bodyLarge: TextStyle(color: Colors.white70),
      bodyMedium: TextStyle(color: Colors.white70),
      headlineSmall:
          TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      titleLarge: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
    ),

    // Icon Theme
    iconTheme: IconThemeData(color: Colors.grey[400]),

    // Bottom Navigation Bar Theme
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: Color(0xFF2A2A2A),
      selectedItemColor: AppColors.secondary,
      unselectedItemColor: Colors.grey[500],
    ),
  );
}
