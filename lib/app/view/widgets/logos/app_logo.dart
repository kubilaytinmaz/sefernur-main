import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import '../../../utils/utils.dart';

class AppLogo extends StatelessWidget {
  final double? height;
  final double? width;
  
  const AppLogo({
    super.key,
    this.height,
    this.width
  });

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      AssetPaths.eyexappLogo,
      colorFilter: ColorFilter.mode(
        Get.theme.colorScheme.primary,
        BlendMode.srcIn,
      ),
      height: height,
      width: width,
    );
  }
}

