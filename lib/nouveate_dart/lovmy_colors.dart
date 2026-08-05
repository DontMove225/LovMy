import 'package:flutter/painting.dart';

/// Palette officielle LovMy (charte graphique V2).
///
/// Toutes les couleurs de marque, exposées en `const` pour un usage direct
/// dans les widgets et le thème.
abstract final class LovMyColors {
  // — Rouges —
  /// Rouge Passion — couleur héroïque, CTA principaux.
  static const Color passion = Color(0xFFEB0603);

  /// Braise — accent chaud, dégradés et halos.
  static const Color ember = Color(0xFFF64135);

  /// Velours — rouge profond, profondeur et ombres.
  static const Color velvet = Color(0xFF800001);

  /// Rouge Nuit — le plus sombre des rouges.
  static const Color nightRed = Color(0xFF440004);

  // — Neutres profonds —
  /// Obsidienne — fond principal de l'application.
  static const Color obsidian = Color(0xFF080714);
  static const Color ink = Color(0xFF0C0A16);
  static const Color paper = Color(0xFF100B1C);
  static const Color surface = Color(0xFF17111F);

  // — Bleus / acier —
  /// Acier Minuit — accent froid secondaire.
  static const Color steel = Color(0xFF303B63);
  static const Color steelLight = Color(0xFF8AA0D8);
  static const Color steelDeep = Color(0xFF1A2236);

  // — Accents clairs —
  /// Rose Tendre — douceur, accents et icônes.
  static const Color blush = Color(0xFFE89EA1);

  /// Ivoire — surfaces claires, textes sur fond rouge.
  static const Color ivory = Color(0xFFFBF7F6);

  // — Texte —
  static const Color fg = Color(0xFFEDE7EA);
  static const Color fgSoft = Color(0xFFB8AEB8);
  static const Color fgFaint = Color(0xFF7C7388);

  // — États —
  /// Vert « en ligne » / succès.
  static const Color online = Color(0xFF7ED9A6);

  // — Lignes / bordures —
  /// Bordure subtile ≈ rgba(232,158,161,.16).
  static const Color line = Color(0x29E89EA1);
}
