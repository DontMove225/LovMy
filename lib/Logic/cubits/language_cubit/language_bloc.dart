import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
part 'language_state.dart';

class LanguageCubit extends Cubit<LanguageState>{
  LanguageCubit() : super(const SelectedLanguage(Locale('fr')));

  void toFrench() =>  emit(const SelectedLanguage(Locale('fr')));

  void toArabic() =>  emit(const SelectedLanguage(Locale('ar')));

  void toEnglish() =>  emit(const SelectedLanguage(Locale('en')));

  void toSpanish() =>  emit(const SelectedLanguage(Locale('es')));

  void toHindi() =>  emit(const SelectedLanguage(Locale('hi')));

  void toGujarati() =>  emit(const SelectedLanguage(Locale('gu')));

  void toAfrikaans() =>  emit(const SelectedLanguage(Locale('af')));

  void toBengali() =>  emit(const SelectedLanguage(Locale('be')));

  void toIndonesian() =>  emit(const SelectedLanguage(Locale('id')));

  void toItalian() =>  emit(const SelectedLanguage(Locale('it')));

  void toPortuguese() =>  emit(const SelectedLanguage(Locale('pt')));

  void toGerman() =>  emit(const SelectedLanguage(Locale('de')));

  void toDutch() =>  emit(const SelectedLanguage(Locale('nl')));

  void toChinese() =>  emit(const SelectedLanguage(Locale('zh')));

  void toJapanese() =>  emit(const SelectedLanguage(Locale('ja')));

  void toVietnamese() =>  emit(const SelectedLanguage(Locale('vi')));

  void toRussian() =>  emit(const SelectedLanguage(Locale('ru')));

  void toTurkish() =>  emit(const SelectedLanguage(Locale('tr')));
}
