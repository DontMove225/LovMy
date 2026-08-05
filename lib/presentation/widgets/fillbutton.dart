import 'package:lovmy/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class FillButton extends StatelessWidget {
  final void Function()? onTap;
  final Color? bgColor;
  final String title;
  final String? iconpath;
  const FillButton(
      {super.key,
      this.onTap,
      required this.title,
      this.bgColor,
      this.iconpath});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        style: Theme.of(context).elevatedButtonTheme.style!.copyWith(
              backgroundColor: MaterialStatePropertyAll(bgColor),
            ),
        onPressed: onTap ?? () {},
        child: Row(
          mainAxisSize: MainAxisSize.min,
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
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context)
                    .textTheme
                    .labelMedium!
                    .copyWith(color: AppColors.white),
              ),
            ),
          ],
        ));
  }
}
