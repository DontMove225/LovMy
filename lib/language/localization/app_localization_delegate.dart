import 'package:lovmy/language/localization/app_localization.dart';
import 'package:flutter/material.dart' show Locale, LocalizationsDelegate;

class AppLocalizationDelegate extends LocalizationsDelegate<AppLocalizations>{
 const AppLocalizationDelegate();
  @override
  bool isSupported(Locale locale){
  return ['fr','en','ar','af','be','gu','hi','id','es','it','pt','de','nl','zh','ja','vi','ru','tr','pl'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async{
    AppLocalizations appLocalizations = AppLocalizations(locale);
    await appLocalizations.load();
    return appLocalizations;
  }

  @override
  bool shouldReload(covariant LocalizationsDelegate<AppLocalizations> old) => false;

}