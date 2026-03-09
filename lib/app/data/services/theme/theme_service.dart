import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../dev_utils/dev_utils.dart';
import '../services.dart';

class ThemeService extends GetxService {
  late StorageService storage;

  final RxBool isDarkMode = false.obs;

  Future<ThemeService> init() async {
    storage = Get.find<StorageService>();
    await getThemeStatus();
    return this;
  }

  Future<void> getThemeStatus() async {
    // Kaydedilmiş tema tercihini oku
    final savedDarkMode = storage.darkMode();
    
    // Eğer kayıtlı tercih varsa onu kullan, yoksa varsayılan olarak aydınlık tema
    if (savedDarkMode != null) {
      isDarkMode.value = savedDarkMode;
    } else {
      isDarkMode.value = false; // Varsayılan: Aydınlık tema
    }
    
    Get.changeThemeMode(isDarkMode.value ? ThemeMode.dark : ThemeMode.light);

    cprint(
      'Theme Mode: ${isDarkMode.value ? "Dark Mode" : "Light Mode"} (saved: $savedDarkMode)',
    );
  }

  /// Tema modunu değiştirir ve kalıcı olarak kaydeder
  Future<void> toggleTheme(bool value) async {
    isDarkMode.value = value;
    await storage.changeDarkMode(value);
    Get.changeThemeMode(value ? ThemeMode.dark : ThemeMode.light);
    
    cprint('Theme changed to: ${value ? "Dark Mode" : "Light Mode"}');
  }

  ThemeMode getThemeMode() {
    return isDarkMode.value ? ThemeMode.dark : ThemeMode.light;
  }
}
