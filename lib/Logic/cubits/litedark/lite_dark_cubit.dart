import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'lite_dark_state.dart';

class ThemeBloc extends Cubit<ThemeState> {
  ThemeBloc() : super(ThemeState.system) {
    getTheme().then((value) {
      switch (value) {
        case "dark":
          emit(ThemeState.dark);
          break;
        case "light":
        case "lite": // legacy persisted value, kept for backward compatibility
          emit(ThemeState.light);
          break;
        default:
          emit(ThemeState.system);
      }
    });
  }

  setTheme(ThemeMode mode) {
    emit(ThemeState(mode));
    _persist(mode);
  }

  Future<void> _persist(ThemeMode mode) async {
    SharedPreferences preferences = await SharedPreferences.getInstance();
    final value = switch (mode) {
      ThemeMode.dark => "dark",
      ThemeMode.light => "light",
      ThemeMode.system => "system",
    };
    await preferences.setString("ThemeData", value);
  }
}

Future<String?> getTheme() async {
  SharedPreferences preferences = await SharedPreferences.getInstance();

  return preferences.getString("ThemeData");
}
