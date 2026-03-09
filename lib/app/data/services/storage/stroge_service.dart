import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';

import '../../../utils/utils.dart';


class StorageService extends GetxService {
  late GetStorage box;

  Future<StorageService> init() async {
    box = GetStorage();

    await box.writeIfNull(DARK_MODE, null);
    await box.writeIfNull(LANGUAGE_CODE, Get.deviceLocale!.languageCode);
    await box.writeIfNull(COUNTRY_CODE, Get.deviceLocale!.countryCode);
    await box.writeIfNull(ACCESS_TOKEN, null);
    await box.writeIfNull(ONBOARDING_COMPLETED, false);
    await box.writeIfNull(FIRST_LAUNCH, true);
  await box.writeIfNull(PENDING_INVITE_CODE, null);

    return this;
  }

  darkMode() => box.read(DARK_MODE);
  langugeCode() => box.read(LANGUAGE_CODE);
  countryCode() => box.read(COUNTRY_CODE);
  accessToken() => box.read(ACCESS_TOKEN);
  onboardingCompleted() => box.read(ONBOARDING_COMPLETED) ?? false;
  isFirstLaunch() => box.read(FIRST_LAUNCH) ?? true;

  Future<bool> changeDarkMode(bool value) async {
    await box.write(DARK_MODE, value);
    return box.read(DARK_MODE);
  }

  Future<bool> changeLanguge(String languageCode, String countryCode) async {
    await box.write(LANGUAGE_CODE, languageCode);
    await box.write(COUNTRY_CODE, countryCode);
    return box.read(LANGUAGE_CODE) != null && box.read(COUNTRY_CODE) != null ? true : false;
  }

  Future<bool> changeAccessToken(var value) async {
    await box.write(ACCESS_TOKEN, value);
    return box.read(ACCESS_TOKEN) != null ? true : false;
  }

  Future<void> setOnboardingCompleted() async {
    await box.write(ONBOARDING_COMPLETED, true);
  }

  Future<void> setFirstLaunchCompleted() async {
    await box.write(FIRST_LAUNCH, false);
  }

  // Referral pending invite code helpers
  Future<void> savePendingInviteCode(String? code) async {
    if (code == null) {
      await box.remove(PENDING_INVITE_CODE);
    } else {
      await box.write(PENDING_INVITE_CODE, code);
    }
  }

  String? getPendingInviteCode() => box.read(PENDING_INVITE_CODE);
  Future<void> clearPendingInviteCode() async => box.remove(PENDING_INVITE_CODE);
}
