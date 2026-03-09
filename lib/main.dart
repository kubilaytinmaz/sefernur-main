import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import 'app/controllers/main/main_controller.dart';
import 'app/data/services/services.dart';
import 'app/routes/app_pages.dart';
import 'app/routes/routes.dart';
import 'app/translation/app_translation.dart';
import 'app/view/themes/theme.dart';

void main() async {
  FlutterError.onError = (FlutterErrorDetails details) {
    final errorText = details.exceptionAsString();
    final isOverlaySnackbarError =
        errorText.contains('No Overlay widget found') &&
        details.stack.toString().contains('snackbar_controller.dart');

    if (isOverlaySnackbarError) {
      debugPrint('[SNACKBAR-GUARD] Ignored transient overlay error: $errorText');
      return;
    }

    FlutterError.presentError(details);
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    final errorText = error.toString();
    final isOverlaySnackbarError =
        errorText.contains('No Overlay widget found') &&
        stack.toString().contains('snackbar_controller.dart');

    if (isOverlaySnackbarError) {
      debugPrint('[SNACKBAR-GUARD] Ignored async overlay error: $errorText');
      return true;
    }

    return false;
  };

  await Get.putAsync(() => StarterService().init(
    WidgetsFlutterBinding.ensureInitialized(),
  ));
  
  runApp(const App());
}

class App extends GetView<LanguageService> {
  const App({super.key});

  static DateTime? _lastBackPress;

  @override
  Widget build(BuildContext context) {
    final themeService = Get.find<ThemeService>();
    
    return ScreenUtilInit(
      designSize: const Size(360, 690),
      minTextAdapt: true,
      splitScreenMode: true,

      builder: (context , child) => PopScope(
        canPop: false,
        onPopInvoked: (didPop) async {
          if (didPop) return;
          final mainController = Get.isRegistered<MainController>() ? Get.find<MainController>() : null;
          if (mainController == null) {
            SystemNavigator.pop();
            return;
          }
          if (mainController.currentIndex.value != 0) {
            mainController.changeTabIndex(0);
            return;
          }
          final now = DateTime.now();
          if (_lastBackPress == null || now.difference(_lastBackPress!) > const Duration(seconds: 2)) {
            _lastBackPress = now;
            Get.closeAllSnackbars();
            Get.snackbar(
              'Çıkış',
              'Çıkmak için tekrar basın',
              snackPosition: SnackPosition.BOTTOM,
              margin: const EdgeInsets.all(16),
              backgroundColor: Colors.black87,
              colorText: Colors.white,
              duration: const Duration(seconds: 2),
              borderRadius: 14,
            );
            return;
          }
          await SystemNavigator.pop();
        },
        child: Obx(() => GetMaterialApp(
        title: 'Sefernur',
        
        theme: AppLightTheme.light(),
        darkTheme: AppDarkTheme.dark(),
        themeMode: themeService.isDarkMode.value ? ThemeMode.dark : ThemeMode.light,
        
        debugShowCheckedModeBanner: false,
        defaultTransition: Transition.fade,

        translationsKeys: AppTranslation.translations,
        locale: controller.getLocale(),
        fallbackLocale: const Locale('en', 'US'),

        // Localization delegates for widgets, material, cupertino
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('en', 'US'),
          Locale('tr', 'TR'),
        ],

        unknownRoute: AppPages.UNKNOWNPAGE,
        getPages: AppPages.pages,
        initialRoute: "/",
        routingCallback: (routing) {
          final current = routing?.current ?? '';
          if (current.startsWith('/link')) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (Get.currentRoute != Routes.AUTH) {
                Get.offAllNamed(Routes.AUTH);
              }
            });
          }
        },
      )))
    );
  }
}
