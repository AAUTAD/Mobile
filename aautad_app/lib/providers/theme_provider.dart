// lib/providers/theme_provider.dart
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ThemeProvider extends ChangeNotifier {
  bool _isDarkMode = false;
  final FlutterSecureStorage _storage = FlutterSecureStorage();

  bool get isDarkMode => _isDarkMode;

  ThemeProvider() {
    _loadThemeFromStorage();
  }

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    _saveThemeToStorage();
    notifyListeners();
  }

  void setTheme(bool isDark) {
    _isDarkMode = isDark;
    _saveThemeToStorage();
    notifyListeners();
  }

  Future<void> _loadThemeFromStorage() async {
    String? themeMode = await _storage.read(key: 'theme_mode');
    if (themeMode != null) {
      _isDarkMode = themeMode == 'dark';
      notifyListeners();
    }
  }

  Future<void> _saveThemeToStorage() async {
    await _storage.write(
        key: 'theme_mode', value: _isDarkMode ? 'dark' : 'light');
  }
}
