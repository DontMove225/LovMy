import 'dart:ui';

/// Best-effort guess of the user's country (ISO 3166-1 alpha-2) from the
/// device's region setting, used only as the initial flag shown in phone
/// number fields — the user can always override it by picking their own
/// country, and [value.countryCode] from IntlPhoneField's onChanged is the
/// source of truth once they start typing.
String defaultPhoneCountryIso() {
  final countryCode = PlatformDispatcher.instance.locale.countryCode;
  return (countryCode == null || countryCode.isEmpty) ? "US" : countryCode;
}
