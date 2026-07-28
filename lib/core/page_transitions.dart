import 'package:flutter/material.dart';

/// Transition de page signature de l'app : léger slide vers le haut + fondu
/// + zoom-in discret. Utilisée partout via [Routes.onGenerateRoute] pour que
/// chaque navigation nommée ait la même sensation, sans rien changer à la
/// destination/logique des écrans.
class LovMyPageRoute<T> extends PageRouteBuilder<T> {
  LovMyPageRoute({required WidgetBuilder builder, RouteSettings? settings})
      : super(
          settings: settings,
          transitionDuration: const Duration(milliseconds: 380),
          reverseTransitionDuration: const Duration(milliseconds: 280),
          pageBuilder: (context, animation, secondaryAnimation) =>
              builder(context),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            final curved = CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
              reverseCurve: Curves.easeInCubic,
            );
            return FadeTransition(
              opacity: curved,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 0.04),
                  end: Offset.zero,
                ).animate(curved),
                child: ScaleTransition(
                  scale: Tween<double>(begin: 0.96, end: 1.0).animate(curved),
                  child: child,
                ),
              ),
            );
          },
        );
}
