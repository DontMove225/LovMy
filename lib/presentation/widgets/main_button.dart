import 'package:lovmy/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

class MainButton extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final borderRadius = BorderRadius.circular(radius ?? 14);

    final content = error != null && error!
        ? LoadingAnimationWidget.staggeredDotsWave(
            size: 30,
            color: Colors.white,
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              iconpath?.isEmpty ?? true
                  ? const SizedBox()
                  : SvgPicture.asset(
                      iconpath!,
                      height: 25,
                    ),
              iconpath?.isEmpty ?? true
                  ? const SizedBox()
                  : const SizedBox(
                      width: 8,
                    ),
              Flexible(
                child: Text(
                  title,
                  style: Theme.of(context)
                      .textTheme
                      .labelMedium
                      ?.copyWith(color: titleColor ?? AppColors.white),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          );

    // Bouton avec couleur explicite (secondaire/ghost) — fond plat, ombre lÃ©gÃ¨re
    // pour signaler quand mÃªme que c'est tapable.
    if (bgColor != null) {
      return Container(
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
          color: bgColor,
          borderRadius: borderRadius,
          child: InkWell(
            borderRadius: borderRadius,
            onTap: onTap ?? () {},
            child: Container(
              height: 50,
              alignment: Alignment.center,
              child: content,
            ),
          ),
        ),
      );
    }

    // Bouton principal par dÃ©faut â dÃ©gradÃ© Passion de la charte + lueur,
    // avec effet ripple au tap pour une affordance claire.
    return Container(
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
          onTap: onTap ?? () {},
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
  }
}
