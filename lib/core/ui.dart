import 'package:flutter/material.dart';

class AppColors {
  // Palette LovMy
  static const Color passionRed = Color(0xFFEB0603);
  static const Color ember = Color(0xFFF64135);
  static const Color velvet = Color(0xFF800001);
  static const Color nightRed = Color(0xFF440004);
  static const Color obsidian = Color(0xFF080714);
  static const Color steelMidnight = Color(0xFF303B63);
  static const Color tenderRose = Color(0xFFE89EA1);
  static const Color ivory = Color(0xFFFBF7F6);

  // Degrades signatures
  static const LinearGradient gradientPrimary = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [ember, passionRed]);
  static const LinearGradient gradientPassion = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [ember, passionRed, velvet],
      stops: [0.0, 0.48, 1.0]);
  static const LinearGradient gradientDuality = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [steelMidnight, passionRed],
      stops: [0.0, 0.88]);
  static const LinearGradient gradientNight = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [nightRed, obsidian]);
  static const LinearGradient gradientCompatibility = LinearGradient(
      begin: Alignment.centerLeft,
      end: Alignment.centerRight,
      colors: [steelMidnight, ember]);
  static const LinearGradient gradientCall = LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [steelMidnight, tenderRose, passionRed]);

  // Alias semantiques utilises dans le reste de l'app
  static Color appColor = passionRed;
  static Color appBgColorlite = ivory;
  static Color appBgColordart = obsidian;
  static Color textLight = obsidian;
  static Color text1Light = steelMidnight;
  static Color textDark = Colors.white;
  static Color text1Dark = Colors.white;
  static Color greyDark = const Color(0xff979491);
  static Color greyLight = const Color(0xffE2E8F0);
  static Color white = ivory;
  static Color black = obsidian;
  static Color borderColor = const Color(0xFFE3DFDF);
  static Color darkBorderColor = nightRed;
  static Color darkBgColor = obsidian;
  static Color darkContainer = const Color(0xFF1A0611);
}

class Themes {
  static ThemeData defaultTheme = ThemeData(
    splashColor: Colors.transparent,
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    dividerColor: Colors.transparent,
    brightness: Brightness.light,
    fontFamily: FontFamilyy.body,
    bottomSheetTheme: const BottomSheetThemeData(backgroundColor: Colors.white),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.transparent,
      shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.borderColor),
          borderRadius: BorderRadius.circular(12)),
      fixedSize: const Size.fromHeight(50),
    )),
   cardColor: AppColors.white,
    dividerTheme: DividerThemeData(color: AppColors.borderColor),
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            shadowColor: Colors.transparent,
            elevation: 0,
            backgroundColor: AppColors.appColor,
            foregroundColor: AppColors.ivory,
            fixedSize: const Size.fromHeight(50),
            shape: RoundedRectangleBorder(
              // side: BorderSide(color: AppColors.greyLight),
              borderRadius: BorderRadius.circular(12),
            )

        )),
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.passionRed,
      brightness: Brightness.light,
      primary: AppColors.passionRed,
      secondary: AppColors.steelMidnight,
      tertiary: AppColors.tenderRose,
      surface: AppColors.ivory,
    ),
    textTheme: TextTheme(

        //this is headLine TextStyles for lite Mode
        headlineLarge: TextStyles.heading1,
        headlineMedium: TextStyles.heading2,
        headlineSmall: TextStyles.heading3,

        //this is Body TextStyles for lite Mode
        bodyLarge: TextStyles.body1,
        bodyMedium: TextStyles.body2,
        bodySmall: TextStyles.body3,

        //this is title TextStyles for lite Mode
        titleMedium: TextStyles.title1,
        titleSmall: TextStyles.title2,

        //this is Button TextStyles for lite Mode
        labelMedium: TextStyles.buttonTextStyle),
    scaffoldBackgroundColor: AppColors.appBgColorlite,
    indicatorColor: AppColors.black,
    appBarTheme: AppBarTheme(
      elevation: 0,
      backgroundColor: AppColors.appBgColorlite,
      iconTheme: IconThemeData(color: AppColors.textLight),

    ),
  );

  static ThemeData darkTheme = ThemeData(

    brightness: Brightness.dark,
    splashColor: Colors.transparent,
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    dividerColor: Colors.transparent,
    fontFamily: FontFamilyy.body,
    bottomSheetTheme: BottomSheetThemeData(backgroundColor: AppColors.darkBgColor),
    cardColor: AppColors.darkContainer,
    dividerTheme: DividerThemeData(color: AppColors.darkBorderColor),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
      shape: RoundedRectangleBorder(
          side: BorderSide(color: AppColors.darkBorderColor),
          borderRadius: BorderRadius.circular(12)),
      fixedSize: const Size.fromHeight(48),
    )),

    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
            elevation: 0,
            backgroundColor: AppColors.appColor,
            foregroundColor: AppColors.ivory,
            fixedSize: const Size.fromHeight(48),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ))),
    indicatorColor: AppColors.white,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.passionRed,
      brightness: Brightness.dark,
      primary: AppColors.passionRed,
      secondary: AppColors.tenderRose,
      tertiary: AppColors.steelMidnight,
      surface: AppColors.obsidian,
    ),
    textTheme: TextTheme(
      //this is headLine TextStyles for Dark Mode
      headlineLarge: TextStyles.heading1.copyWith(color: AppColors.textDark),
      headlineMedium: TextStyles.heading2.copyWith(color: AppColors.textDark),
      headlineSmall: TextStyles.heading3.copyWith(color: AppColors.textDark),

      //this is Body TextStyles for Dark Mode
      bodyLarge: TextStyles.body1.copyWith(color: AppColors.text1Dark),
      bodyMedium: TextStyles.body2.copyWith(color: AppColors.text1Dark),
      bodySmall: TextStyles.body3.copyWith(color: AppColors.text1Dark),

      //this is title TextStyles for Dark Mode
      titleMedium: TextStyles.title1.copyWith(color: AppColors.textDark),
      titleSmall: TextStyles.title2.copyWith(color: AppColors.textDark),

      //this is Button TextStyles for Dark Mode
      labelMedium: TextStyles.buttonTextStyle,
    ),
    scaffoldBackgroundColor: AppColors.appBgColordart,
    appBarTheme: AppBarTheme(
      elevation: 0,
      backgroundColor: AppColors.appBgColordart,
      iconTheme: IconThemeData(color: AppColors.textDark),
    ),
  );
}

class TextStyles {
  // Display / Titres -> Fraunces
  static TextStyle heading1 = TextStyle(
      fontWeight: FontWeight.bold,
      color: AppColors.textLight,
      fontSize: 70,
      fontFamily: FontFamilyy.display);

  static TextStyle heading2 = TextStyle(
      fontWeight: FontWeight.bold,
      color: AppColors.textLight,
      fontSize: 32,
      fontFamily: FontFamilyy.display);

  static TextStyle heading3 = TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 24,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.display);

  // Texte / Interface -> Manrope
  static TextStyle body1 = TextStyle(
      fontWeight: FontWeight.w500,
      fontSize: 18,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.body);

  static TextStyle body2 = TextStyle(
      fontWeight: FontWeight.w500,
      fontSize: 16,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.body);

  static TextStyle body3 = TextStyle(
      fontWeight: FontWeight.w500,
      fontSize: 14,
      color: AppColors.textLight,
      fontFamily: FontFamilyy.body);

  // Accent / Labels -> Space Grotesk
  static TextStyle title1 = TextStyle(
      fontWeight: FontWeight.w600,
      fontSize: 12,
      letterSpacing: 1.2,
      color: AppColors.text1Light,
      fontFamily: FontFamilyy.accent);

  static TextStyle title2 = TextStyle(
      fontWeight: FontWeight.w600,
      fontSize: 10,
      letterSpacing: 1.2,
      color: AppColors.text1Light,
      fontFamily: FontFamilyy.accent);

  static TextStyle buttonTextStyle = TextStyle(
      fontWeight: FontWeight.w700,
      fontSize: 16,
      color: AppColors.ivory,
      fontFamily: FontFamilyy.body
  );
}

class FontFamilyy {
  static const String display = "Fraunces";
  static const String body = "Manrope";
  static const String accent = "SpaceGrotesk";
}
