import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:shimmer/shimmer.dart';

class BackButtons extends StatelessWidget {
  const BackButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: InkWell(
        onTap: () {
          Navigator.pop(context);
        },
        child: SvgPicture.asset(
          "assets/icons/BackIcon.svg",
          height: 25,
          width: 25,
          colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),
        ),
      ),
    );
  }
}

/// Enveloppe tappable avec un léger effet d'appui (scale down) — utilisée
/// pour donner une sensation cohérente et "vivante" aux éléments tappables
/// qui n'ont pas déjà leur propre feedback (MainButton, boutons de la barre
/// du bas...). Purement visuel : [onTap] reste la seule logique déclenchée.
class PressScale extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final double scaleDown;

  const PressScale({super.key, required this.child, this.onTap, this.scaleDown = 0.94});

  @override
  State<PressScale> createState() => _PressScaleState();
}

class _PressScaleState extends State<PressScale> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (_pressed != value) setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _setPressed(true),
      onTapCancel: () => _setPressed(false),
      onTapUp: (_) => _setPressed(false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _pressed ? widget.scaleDown : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOut,
        child: widget.child,
      ),
    );
  }
}

Widget commonSimmer({required double height, required double width,double? radius,BorderRadiusGeometry? customGeometry}) {
  return Shimmer.fromColors(
    baseColor: Colors.black45,
    highlightColor: Colors.grey.shade100,
    enabled: true,
    child: Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: Colors.grey.withOpacity(0.2),
        borderRadius: customGeometry ?? BorderRadius.circular(radius ?? 12),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [],
      ),
    ),
  );
}
