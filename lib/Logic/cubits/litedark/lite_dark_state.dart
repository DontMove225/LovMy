import 'package:flutter/material.dart';

class ThemeState {
  final ThemeMode themeMode;

  ThemeState(this.themeMode);

  static ThemeState get system => ThemeState(ThemeMode.system);

  static ThemeState get light => ThemeState(ThemeMode.light);

  static ThemeState get dark => ThemeState(ThemeMode.dark);
}
