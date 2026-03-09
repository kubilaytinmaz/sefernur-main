// ignore_for_file: non_constant_identifier_names
import 'package:get/get.dart';

import '../bindings/bindings.dart';
import '../view/pages/booking/webbeds_booking_page.dart';
import '../view/pages/pages.dart';
import 'routes.dart';

class AppPages {
  AppPages._();
  
  static final UNKNOWNPAGE = GetPage(
    name: Routes.NOTFOUND, 
    page: () => const UnknownPage()
  );

  static final pages = [
    GetPage(
      name: Routes.SPLASH, 
      page: () => const SplashPage(),
      binding: SplashBinding()
    ),
    GetPage(
      name: Routes.ONBOARDING, 
      page: () => const OnboardingPage(),
      binding: OnboardingBinding()
    ),
    GetPage(
      name: Routes.AUTH, 
      page: () => const AuthPage(),
      binding: AuthBinding()
    ),
    GetPage(
      name: Routes.SIGN_IN, 
      page: () => const AuthPage(), // Compatibility
      binding: AuthBinding()
    ),
    GetPage(
      name: Routes.MAIN, 
      page: () => const MainPage(),
      binding: MainBinding()
    ),
    GetPage(
      name: Routes.HOTELS, 
      page: () => const HotelsPage(),
    ),
    GetPage(
      name: Routes.CAR_RENTAL, 
      page: () => const CarRentalPage(),
    ),
    GetPage(
      name: Routes.CAR_DETAIL,
      page: () => const CarDetailPage(),
    ),
    GetPage(
      name: Routes.TRANSFERS,
      page: () => const TransfersPage(),
    ),
    GetPage(
      name: Routes.GUIDES,
      page: () => const GuidesPage(),
    ),
    GetPage(
      name: Routes.TOURS,
      page: () => const ToursPage(),
    ),
    GetPage(
      name: Routes.ADMIN, 
      page: () => const AdminPage(),
      binding: AdminBinding()
    ),
    GetPage(
      name: Routes.SELECT_LOCATION, 
      page: () => const SelectLocationPage(),
    ),
    GetPage(
      name: Routes.REFERRALS,
      page: () => const ReferralsPage(),
      binding: ReferralsBinding(),
    ),
    GetPage(
      name: Routes.NOTIFICATIONS,
      page: () => const NotificationsPage(),
      binding: NotificationBinding(),
    ),
    GetPage(
      name: Routes.WEBBEDS_BOOKING,
      page: () => const WebBedsBookingPage(),
    ),
  ];
}