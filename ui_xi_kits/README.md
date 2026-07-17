# LovMy UI — Flutter

Bibliothèque de composants **Flutter premium** pour l'application de rencontre **LovMy**, dérivée de la charte graphique V2. Pensée comme l'équivalent mobile de la librairie web `@lovmy/ui` : même identité, mêmes tokens, mêmes signatures visuelles (dégradé passion, halos, cœur battant).

- **Zéro dépendance runtime** hors SDK Flutter — animations en `AnimationController` / animations implicites / `CustomPainter`.
- **Material 3**, thème **dark-first**.
- Le cœur du logo est **peint vectoriellement** (aucun asset, aucun plugin SVG).
- `Dart 3.3+` · `Flutter 3.19+`.

## Installation

```yaml
# pubspec.yaml de votre app
dependencies:
  lovmy_ui:
    path: ../lovmy_ui   # ou dépôt Git / chemin local
```

Puis appliquez le thème :

```dart
import 'package:lovmy_ui/lovmy_ui.dart';

MaterialApp(
  theme: LovMyTheme.dark,
  home: const HomeScreen(),
);
```

## Polices

Le package **ne bundle pas** les fontes. Fournissez-les depuis votre app (bundle ou `google_fonts`) sous ces noms : `Fraunces` (display), `Manrope` (corps), `SpaceGrotesk` (eyebrows). À défaut, Flutter retombera sur la police système sans casser la mise en page.

## Tokens de marque

| Token | Valeur | Usage |
|---|---|---|
| `LovMyColors.passion` | `#EB0603` | CTA héroïques |
| `LovMyColors.ember` | `#F64135` | Braise, halos |
| `LovMyColors.velvet` | `#800001` | Profondeur |
| `LovMyColors.nightRed` | `#440004` | Ombres rouges |
| `LovMyColors.obsidian` | `#080714` | Fond app |
| `LovMyColors.steel` | `#303B63` | Accent froid |
| `LovMyColors.blush` | `#E89EA1` | Douceur, icônes |
| `LovMyColors.ivory` | `#FBF7F6` | Surfaces claires |
| `LovMyColors.online` | `#7ED9A6` | Statut en ligne |

Également : `LovMyGradients` (passion, velvet, photoScrim, glow), `LovMyRadii`, `LovMyShadows` (ember/passion/velvet), `LovMyMotion` (courbes `easeLovmy` / `easeHeart`), `LovMyTypography`.

## Aperçu

Une galerie exécutable est fournie dans `example/` :

```bash
cd example
flutter run
```

## Composants livrés — Étape 1 (fondations + un représentant par famille)

- **Branding** : `LovMyHeartMark`, `LovMyLogo`
- **Boutons** : `LovMyPassionButton`, `LovMyEmberGlowButton`, `LovMyScaleTapButton`, `LovMyLikeButton`
- **Cartes** : `LovMyGlassCard`
- **Profil** : `LovMyProfileCard`
- **Matching** : `LovMySwipeCard`
- **Chat** : `LovMyChatBubble`, `LovMyTypingIndicator`
- **Premium** : `LovMyPremiumBadge`, `LovMyPricingCard`
- **Loaders** : `LovMyHeartbeatLoader`
- **Fonds** : `LovMyAuroraBackground`
- **Animations** : `LovMyReveal`

## Feuille de route (par famille)

| Famille | Cible | Livrés |
|---|---|---|
| UI premium | 25 | 3 |
| Animations réutilisables | 20 | 1 |
| Effets de fond | 10 | 1 |
| Loaders | 8 | 1 |
| Transitions de page | 12 | 0 |
| Boutons animés | 30 | 4 |
| Cartes premium | 25 | 3 |
| Composants de chat | 20 | 2 |
| Composants profil | 15 | 1 |
| Système de matching | 15 | 1 |
| Composants Premium | 10 | 2 |
| **Total** | **190** | **19** |

Chaque lot suivant réutilise strictement les mêmes tokens et conventions, sans dépendance runtime supplémentaire.

## Conventions

- Un widget par fichier, préfixe `LovMy`, barrel unique `lovmy_ui.dart`.
- Interactif → `StatefulWidget` + `AnimationController` (`dispose()` systématique).
- Statique / composé → `StatelessWidget` `const`.
- Bascules : motif contrôlé/non-contrôlé (`value` optionnel + `onChanged`).
- Aucune couleur en dur hors des tokens de `LovMyColors` / `LovMyGradients`.
