

import 'package:animated_bottom_navigation_bar/animated_bottom_navigation_bar.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:sefernur/app/view/widgets/regions/page_region.dart';

import '../../../controllers/main/main_controller.dart';
import '../../../controllers/notification/notification_controller.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../routes/routes.dart';
import '../../themes/theme.dart';
import '../profile/profile_content.dart';

class MainPage extends GetView<MainController> {
  const MainPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PageRegion(
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        backgroundColor: Get.theme.scaffoldBackgroundColor,
        appBar: AppBar(
          backgroundColor: AppColors.primary,
          elevation: 0,
          automaticallyImplyLeading: false, // Geri butonu kaldırıldı
          title: const Text(
            'SEFERNUR',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          actions: [
            IconButton(
              onPressed: () => Get.to(() => const ProfileContent()),
              icon: const Icon(Icons.person, color: Colors.white, size: 24),
              tooltip: 'Profil',
            ),
            Builder(
              builder: (_) {
                if (!Get.isRegistered<NotificationController>()) {
                  return IconButton(
                    onPressed: () => Get.toNamed(Routes.NOTIFICATIONS),
                    icon: const Icon(
                      Icons.notifications_outlined,
                      color: Colors.white,
                      size: 24,
                    ),
                  );
                }
                final nc = Get.find<NotificationController>();
                return Obx(() {
                  final unread = nc.unreadCount.value;
                  return Stack(
                    alignment: Alignment.topRight,
                    children: [
                      IconButton(
                        onPressed: () => Get.toNamed(Routes.NOTIFICATIONS),
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      if (unread > 0)
                        Positioned(
                          right: 6,
                          top: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.redAccent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              unread > 99 ? '99+' : unread.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  );
                });
              },
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: Obx(() => controller.getCurrentPage()),
        floatingActionButton: Obx(() {
          final auth = Get.find<AuthService>();
          return controller.currentIndex.value == 1 && auth.isUserAdmin()
              ? FloatingActionButton(
                  onPressed: () {
                    Get.toNamed(Routes.ADMIN);
                  },
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.add, color: Colors.white),
                )
              : const SizedBox.shrink();
        }),
        bottomNavigationBar: Builder(
          builder: (context) {
            final theme = Theme.of(context);
            return Obx(
              () => AnimatedBottomNavigationBar.builder(
                itemCount: controller.bottomNavIcons.length,
                tabBuilder: (int index, bool isActive) {
                  // Visa (index 4) için özel animasyonlu / gradyanlı buton
                  if (controller.bottomNavLabels[index] == 'Vize') {
                    return _VisaNewBadgeItem(
                      icon: controller.bottomNavIcons[index],
                      label: controller.bottomNavLabels[index],
                      active: isActive,
                    );
                  }
                  return _StandardNavItem(
                    icon: controller.bottomNavIcons[index],
                    label: controller.bottomNavLabels[index],
                    active: isActive,
                    activeColor: AppColors.primary,
                  );
                },
                backgroundColor: theme.cardColor,
                activeIndex: controller.currentIndex.value,
                splashColor: AppColors.primary.withOpacity(0.1),
                notchSmoothness: NotchSmoothness.smoothEdge,
                leftCornerRadius: 0,
                rightCornerRadius: 0,
                onTap: (index) => controller.changeTabIndex(index),
                hideAnimationController: null,
                gapLocation: GapLocation.none,
                shadow: BoxShadow(
                  offset: const Offset(0, -1),
                  blurRadius: 16,
                  spreadRadius: 0,
                  color: Colors.black.withOpacity(0.06),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// Standart (animasyonsuz) nav item
class _StandardNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final Color activeColor;
  const _StandardNavItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.activeColor,
  });
  @override
  Widget build(BuildContext context) {
    final color = active ? activeColor : Colors.grey;
    return SizedBox(
      height: 70,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 24, color: color),
            const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: active ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}

class _VisaNewBadgeItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  const _VisaNewBadgeItem({
    required this.icon,
    required this.label,
    required this.active,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : Colors.grey;
    return SizedBox(
      height: 70,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(icon, size: 24, color: color),
              Positioned(
                right: -10,
                top: -6,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(.35),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: const Text(
                    'yeni',
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: active ? FontWeight.w600 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}
