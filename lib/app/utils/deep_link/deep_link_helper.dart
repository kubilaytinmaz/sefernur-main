import 'dart:async';

import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

import '../../data/services/storage/stroge_service.dart';
import '../../routes/routes.dart';

// Simple deep link manager (custom scheme + https fallback)
class DeepLinkHelper {
  static final DeepLinkHelper _instance = DeepLinkHelper._internal();
  factory DeepLinkHelper() => _instance;
  DeepLinkHelper._internal();

  StreamSubscription<Uri>? _sub;
  late final AppLinks _appLinks;
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return; _initialized = true;
    _appLinks = AppLinks();
    try {
      final initial = await _appLinks.getInitialLink();
      if (initial != null) _handle(initial);
    } catch (e) { if (kDebugMode) print('[DEEPLINK] initial error $e'); }
    _sub = _appLinks.uriLinkStream.listen(_handle, onError: (e) {
      if (kDebugMode) print('[DEEPLINK] stream error $e');
    });
  }

  void dispose() { _sub?.cancel(); }

  Uri buildReferralUri(String code) {
    // Use https universal link (better for sharing). Custom scheme for fallback: sefernur://ref?code=XXX
    return Uri.parse('https://sefernur.com/ref?code=$code');
  }

  void _handle(Uri uri) {
    if (kDebugMode) print('[DEEPLINK] received $uri');
    
    // Firebase auth callback: keep SDK handling, but also route user to auth
    // so pending OTP state can be restored on app resume.
    if (uri.scheme.contains('firebaseauth') || 
        uri.host.contains('firebaseauth') ||
        uri.path.contains('__/auth/callback')) {
      if (Get.isRegistered<StorageService>()) {
        final storage = Get.find<StorageService>();
        final hasPendingVerification =
            storage.box.read<String>('pending_verification_id') != null;

        if (hasPendingVerification && Get.currentRoute != Routes.AUTH) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Get.offAllNamed(Routes.AUTH);
          });
        }
      }
      if (kDebugMode) print('[DEEPLINK] firebase auth callback handled');
      return;
    }
    
    final code = _extractReferralCode(uri);
    if (code != null) {
      if (Get.isRegistered<StorageService>()) {
        Get.find<StorageService>().savePendingInviteCode(code);
      }
      if (kDebugMode) print('[DEEPLINK] referral code captured=$code');
    }
  }

  String? _extractReferralCode(Uri uri) {
    // Match patterns: https://sefernur.com/ref?code=XXXX or sefernur://ref?code=XXXX
    if (uri.queryParameters['code'] != null) return uri.queryParameters['code'];
    // Path style: /ref/SRABCDEF
    final segments = uri.pathSegments;
    if (segments.length >= 2 && segments.first == 'ref') {
      return segments[1];
    }
    return null;
  }
}