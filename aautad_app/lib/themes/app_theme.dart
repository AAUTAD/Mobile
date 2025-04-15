// lib/themes/app_theme.dart
import 'package:flutter/material.dart';
import '../constants/colors.dart';

class AppTheme {
  static final lightTheme = ThemeData(
    primaryColor: AppColors.primary,
    colorScheme:
        ColorScheme.fromSwatch().copyWith(secondary: AppColors.secondary),
    scaffoldBackgroundColor: AppColors.background,
    visualDensity: VisualDensity.adaptivePlatformDensity,
    textTheme: TextTheme(bodyLarge: TextStyle(color: Colors.black)),
    fontFamily: 'Lato',
    splashColor: Colors.transparent,
  );
}
