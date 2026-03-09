import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../dialogs/login_required_dialog.dart';

/// A favorite button that handles guest user state
/// Shows login dialog when guest tries to toggle favorite
class AuthAwareFavoriteButton extends StatelessWidget {
  final String targetType;
  final String targetId;
  final Map<String, dynamic>? meta;
  final double? size;
  final Color? activeColor;
  final Color? inactiveColor;
  final bool showBackground;

  const AuthAwareFavoriteButton({
    super.key,
    required this.targetType,
    required this.targetId,
    this.meta,
    this.size,
    this.activeColor,
    this.inactiveColor,
    this.showBackground = false,
  });

  @override
  Widget build(BuildContext context) {
    final auth = Get.find<AuthService>();
    final favoriteService = Get.find<FavoriteService>();

    return Obx(() {
      final isGuest = auth.isGuest.value;
      final isFavorite = isGuest ? false : favoriteService.isFavorite(targetType, targetId);

      Widget icon = Icon(
        isFavorite ? Icons.favorite : Icons.favorite_border,
        size: size ?? 24.sp,
        color: isFavorite
            ? (activeColor ?? Colors.red)
            : (inactiveColor ?? Colors.grey[600]),
      );

      if (showBackground) {
        icon = Container(
          padding: EdgeInsets.all(8.w),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.9),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: icon,
        );
      }

      return GestureDetector(
        onTap: () => _handleTap(auth, favoriteService),
        child: icon,
      );
    });
  }

  void _handleTap(AuthService auth, FavoriteService favoriteService) {
    if (auth.isGuest.value || auth.user.value.id == null) {
      // Show login dialog for guest users
      LoginRequiredDialog.showForFavorites();
      return;
    }

    // Toggle favorite
    favoriteService.toggle(
      type: targetType,
      targetId: targetId,
      meta: meta,
    );
  }
}

/// A simple function to check auth and show dialog if needed before performing action
/// Returns true if user is authenticated, false if guest (and dialog was shown)
bool checkAuthAndShowDialog({String? featureName}) {
  final auth = Get.find<AuthService>();
  
  if (auth.isGuest.value || auth.user.value.id == null) {
    LoginRequiredDialog.show(featureName: featureName);
    return false;
  }
  
  return true;
}

/// Wrapper widget that shows login dialog when guest taps on it
class AuthRequiredWrapper extends StatelessWidget {
  final Widget child;
  final String? featureName;
  final VoidCallback? onAuthenticated;

  const AuthRequiredWrapper({
    super.key,
    required this.child,
    this.featureName,
    this.onAuthenticated,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: () {
        if (checkAuthAndShowDialog(featureName: featureName)) {
          onAuthenticated?.call();
        }
      },
      child: AbsorbPointer(
        absorbing: true,
        child: child,
      ),
    );
  }
}
