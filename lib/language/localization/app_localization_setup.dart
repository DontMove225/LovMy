// ignore_for_file: depend_on_referenced_packages

import 'package:lovmy/language/localization/app_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

class AppLocalizationSetup{
  static const Iterable<Locale> supportedLanguage =[
    Locale('fr'),
    Locale('en'),
    Locale('ar'),
    Locale('af'),
    Locale('be'),
    Locale('gu'),
    Locale('hi'),
    Locale('id'),
    Locale('es'),
    Locale('it'),
    Locale('pt'),
    Locale('de'),
    Locale('nl'),
    Locale('zh'),
    Locale('ja'),
    Locale('vi'),
    Locale('ru'),
    Locale('tr'),
  ];

  static  Iterable<LocalizationsDelegate<dynamic>> localizationsDelegates = [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];
  static Locale localeResolutionCallback(Locale? locale,Iterable<Locale> supportedLocales ){
    for(Locale supportedLocal in supportedLanguage){
      if(supportedLocal.languageCode == locale!.languageCode && supportedLocal.countryCode == locale.countryCode){
        return supportedLocal;
      }
    }
    return supportedLanguage.first;
  }
}
