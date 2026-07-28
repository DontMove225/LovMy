import 'package:lovmy/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

class MainButton extends StatefulWidget {
  final void Function()? onTap;
  final Color? bgColor;
  final String title;
  final Color? titleColor;
  final String? iconpath;
  final double? radius;
  final bool? error;
  const MainButton(
      {super.key,
      this.onTap,
      required this.title,
      this.bgColor,
      this.iconpath,
      this.titleColor, this.radius, this.error});

  @override
  State<MainButton> createState() => _MainButtonState();
}

class _MainButtonState extends State<MainButton> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (_pressed != value) setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(widget.radius ?? 14);

    final content = widget.error != null && widget.error!
        ? LoadingAnimationWidget.staggeredDotsWave(
            size: 30,
            color: Colors.white,
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              widget.iconpath?.isEmpty ?? true
                  ? const SizedBox()
                  : SvgPicture.asset(
                      widget.iconpath!,
                      height: 25,
                    ),
              widget.iconpath?.isEmpty ?? true
                  ? const SizedBox()
                  : const SizedBox(
                      width: 8,
                    ),
              Flexible(
                child: Text(
                  widget.title,
                  style: Theme.of(context)
                      .textTheme
                      .labelMedium
                      ?.copyWith(color: widget.titleColor ?? AppColors.white),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          );

    // Bouton avec couleur explicite (secondaire/ghost) — fond plat, ombre légère
    // pour signaler quand même que c'est tapable.
    final Widget button = widget.bgColor != null
        ? Container(
            decoration: BoxDecoration(
              borderRadius: borderRadius,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.10),
                  blurRadius: 14,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Material(
              color: widget.bgColor,
              borderRadius: borderRadius,
              child: InkWell(
                borderRadius: borderRadius,
                onTapDown: (_) => _setPressed(true),
                onTapCancel: () => _setPressed(false),
                onTap: () {
                  _setPressed(false);
                  widget.onTap?.call();
                },
                child: Container(
                  height: 50,
                  alignment: Alignment.center,
                  child: content,
                ),
              ),
            ),
          )
        // Bouton principal par défaut — dégradé Passion de la charte + lueur,
        // avec effet ripple au tap pour une affordance claire.
        : Container(
            decoration: BoxDecoration(
              borderRadius: borderRadius,
              gradient: AppColors.gradientPrimary,
              boxShadow: [
                BoxShadow(
                  color: AppColors.passionRed.withOpacity(0.38),
                  blurRadius: 26,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              borderRadius: borderRadius,
              child: InkWell(
                borderRadius: borderRadius,
                onTapDown: (_) => _setPressed(true),
                onTapCancel: () => _setPressed(false),
                onTap: () {
                  _setPressed(false);
                  widget.onTap?.call();
                },
                splashColor: Colors.white.withOpacity(0.18),
                highlightColor: Colors.white.withOpacity(0.10),
                child: Container(
                  height: 50,
                  alignment: Alignment.center,
                  child: content,
                ),
              ),
            ),
          );

    return AnimatedScale(
      scale: _pressed ? 0.96 : 1.0,
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOut,
      child: button,
    );
  }
}
