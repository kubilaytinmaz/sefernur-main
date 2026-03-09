import 'dart:async';

import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;

import '../../../../firebase_options.dart';
import '../../../dev_utils/dev_utils.dart';
import '../../providers/payment/kuveytturk_config.dart';
import '../../providers/transport/uber_remote_config.dart';
import '../blog/blog_service.dart';
import '../place/place_service.dart';
import '../services.dart';
import '../tour/tour_service.dart';

class StarterService extends GetxService {
  static bool _firebaseReady = false;
  static Completer<void>? _firebaseInitLock; // prevents race causing duplicate-app
  // Canonical Storage bucket (appspot.com). google-services.json currently points to firebasestorage.app which causes 404.
  static const String canonicalBucket = 'sefernur-app.appspot.com';
  Future<StarterService> init(WidgetsBinding widgetsBinding) async {
    await _initializeOrientation();
    await _initializeFirebase();
    await _initializeStorage();
    await _initializeScreenSize();
    await _initializeBaseServices();
    await _initializeWidgetsBinding(widgetsBinding);
    return this;
  }

  Future<void> _initializeOrientation() async {
    try {
      await SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);
    } catch (e) {
      cprint("Failed to initialize orientation: $e");
    }
  }

  Future<void> _initializeFirebase() async {
    // Prevent concurrent initialization attempts
    if (_firebaseInitLock != null) {
      try { await _firebaseInitLock!.future; } catch (_) {}
      return;
    }
    _firebaseInitLock = Completer<void>();
    bool duplicateApp = false;
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
      } else {
        // already present (e.g. after hot restart)
      }
    } catch (e) {
      final msg = e.toString();
      if (msg.contains('duplicate-app')) {
        duplicateApp = true; // benign on hot restart
        cprint('Duplicate app detected, continuing with existing instance');
      } else {
        _firebaseInitLock!.completeError(e);
        cprint("Failed to initialize Firebase: $e");
        return; // unrecoverable
      }
    }
    // Even if duplicate-app, we still try to activate App Check and mark ready.
    await _activateAppCheck();
    _firebaseReady = true;
    _firebaseInitLock!.complete();
    if (kDebugMode) {
      try {
        final apps = Firebase.apps.map((a)=>a.name).join(',');
        cprint('Firebase ready (duplicate=$duplicateApp) apps=[$apps]');
        // Force fetch a debug App Check token to ensure provider active
        final token = await FirebaseAppCheck.instance.getToken(true);
        cprint('App Check token length=${token?.length}');
      } catch (e) {
        cprint('Post-init debug failed: $e');
      }
    }
    // Post-init debug checks (only once & only in debug mode)
    if (kDebugMode && _firebaseReady) {
      _debugVerifyStorage();
      _debugRawHttp();
    }
  }

  Future<void> _activateAppCheck() async {
    // App Check geçici olarak devre dışı - Storage 404 hatası veriyor
    // Firebase Console'da App Check > Storage için "Not enforced" yapıldıktan sonra
    // bu kodu tekrar aktif edebilirsiniz.
    if (kDebugMode) {
      cprint('App Check devre dışı bırakıldı (debug modunda)');
      return; // Debug modunda App Check'i atla
    }
    
    try {
      // Only activate once; safe to call multiple times but we guard anyway
      // Debug provider prints a token you must add to Firebase console under App Check > Debug tokens.
      await FirebaseAppCheck.instance.activate(
        androidProvider: AndroidProvider.playIntegrity,
        // For iOS/macOS you can add: appleProvider: AppleProvider.deviceCheck,
      );
    } catch (e) {
      cprint('AppCheck activation failed (continuing without proper token, Storage may 404): $e');
    }
  }

  Future<void> _initializeStorage() async {
    try {
      await GetStorage.init();
    } catch (e) {
      cprint("Failed to initialize GetStorage: $e");
    }
  }

  Future<void> _initializeScreenSize() async {
    try {
      await ScreenUtil.ensureScreenSize();
    } catch (e) {
      cprint("Failed to initialize ScreenUtil: $e");
    }
  }

  Future<void> _initializeBaseServices() async {
    try {
      await Get.putAsync(() => StorageService().init());
      await Get.putAsync(() => ThemeService().init());
      await Get.putAsync(() => LanguageService().init());
      await Get.putAsync(() => AnalyticService().init());
      // Döviz kuru servisi - uygulama genelinde kullanılıyor
      Get.put(CurrencyService(), permanent: true);
    } catch (e) {
      cprint("Failed to initialize base services: $e");
    }
  }

  Future<void> _initializeWidgetsBinding(WidgetsBinding widgetsBinding) async {
    try {
      widgetsBinding.deferFirstFrame();
      widgetsBinding.addPostFrameCallback((_) async {
        widgetsBinding.allowFirstFrame();
      });
    } catch (e) {
      cprint("Failed to initialize WidgetsBinding: $e");
    }
  }

  Future<void> initializeAppServices() async {
    try {
      await Get.putAsync(() => AuthService().init());
      await Get.putAsync(() => NotificationService().init());
  await Get.putAsync(() => FavoriteService().init());
  await Get.putAsync(() => ReviewService().init());
  await Get.putAsync(() => ReservationService().init());
  await Get.putAsync(() => CampaignService().init());
  await Get.putAsync(() => PlaceService().init());
  await Get.putAsync(() => BlogService().init());
  await Get.putAsync(() => TourService().init());
  await Get.putAsync(() => ReferralService().init());
  // WebBeds API Service
  await Get.putAsync(() => WebBedsService().init());
  // KuveytTürk Payment Service - Remote Config'den credentials okunur
  await KuveytTurkConfig.init();
  // Uber taxi behavior/fallback ayarları Remote Config'den okunur (non-secret)
  await UberRemoteConfig.init();
  await Get.putAsync(() => KuveytTurkService().init());
    } catch (e) {
      cprint("Failed to initialize app services: $e");
    }
  }
}

// Debug helper (not part of the service's public API)
Future<void> _debugVerifyStorage() async {
  try {
    final app = Firebase.app();
    // Force a storage instance with canonical bucket to bypass wrong native config (temporary until google-services.json fixed)
    final storage = FirebaseStorage.instanceFor(app: Firebase.app(), bucket: StarterService.canonicalBucket);
    final auth = FirebaseAuth.instance;
    
    // Only sign in anonymously if not already authenticated
    if (auth.currentUser == null) {
      try {
        await auth.signInAnonymously();
      } catch (e) {
        // If anonymous sign-in is disabled or fails, skip storage debug tests
        print('[STORAGE-DEBUG][AUTH] Anonymous sign-in failed (likely disabled): $e');
        print('[STORAGE-DEBUG] Skipping storage tests - requires authentication');
        return;
      }
    }
    
    final uid = auth.currentUser?.uid;
    final bucket = storage.ref().bucket;
    // Detect mismatch between code canonical bucket and app options
    final configuredBucket = app.options.storageBucket;
    if (configuredBucket != null && configuredBucket != StarterService.canonicalBucket) {
      cprint('UYARI: Firebase app storageBucket=$configuredBucket canonical=${StarterService.canonicalBucket} (google-services.json yeniden indirilmeli)');
    }
    // ignore: avoid_print
    print('[STORAGE-DEBUG] START bucket=$bucket appBucket=${app.options.storageBucket} uid=$uid');

    // Root list attempt
    try {
      final rootList = await storage.ref().list(const ListOptions(maxResults: 5));
      // ignore: avoid_print
      print('[STORAGE-DEBUG] root sample=${rootList.items.map((e)=>e.fullPath).toList()}');
    } catch (e) {
      // ignore: avoid_print
      print('[STORAGE-DEBUG][ROOT-LIST][ERROR] $e');
    }

    // Specific folder list attempt
    try {
      final transfersList = await storage.ref('transfers/uploads').list(const ListOptions(maxResults: 5));
      // ignore: avoid_print
      print('[STORAGE-DEBUG] transfers/uploads sample=${transfersList.items.map((e)=>e.fullPath).toList()}');
    } catch (e) {
      // ignore: avoid_print
      print('[STORAGE-DEBUG][TRANSFERS-LIST][ERROR] $e');
    }

    // Test upload
    final testRef = storage.ref().child('debug/__ping_${DateTime.now().millisecondsSinceEpoch}.txt');
    final data = 'ping ${DateTime.now().toIso8601String()}';
    final bytes = Uint8List.fromList(data.codeUnits);
    try {
      await testRef.putData(bytes, SettableMetadata(contentType: 'text/plain'));
      final url = await testRef.getDownloadURL();
      // ignore: avoid_print
      print('[STORAGE-DEBUG] test upload ok url=$url');
    } on FirebaseException catch (e, st) {
      // ignore: avoid_print
      print('[STORAGE-DEBUG][UPLOAD][FIREBASE] code=${e.code} message=${e.message}');
      print(st);
    } catch (e, st) {
      // ignore: avoid_print
      print('[STORAGE-DEBUG][UPLOAD][GEN] $e');
      print(st);
    }

    // Attempt to read a console-created marker file (create one manually if absent)
    try {
      final markerRef = storage.ref('debug/manual_marker.txt');
      final meta = await markerRef.getMetadata();
      // ignore: avoid_print
      print('[STORAGE-DEBUG] marker metadata size=${meta.size} contentType=${meta.contentType}');
      final url = await markerRef.getDownloadURL();
      print('[STORAGE-DEBUG] marker downloadURL=$url');
    } on FirebaseException catch (e) {
      print('[STORAGE-DEBUG][MARKER][FIREBASE] code=${e.code} message=${e.message}');
    } catch (e) {
      print('[STORAGE-DEBUG][MARKER][GEN] $e');
    }
  } catch (e, st) {
    // ignore: avoid_print
    print('[STORAGE-DEBUG][FATAL] $e\n$st');
  }
}

Future<void> _debugRawHttp() async {
  try {
    final uri = Uri.parse('https://firebasestorage.googleapis.com/v0/b/sefernur-app.appspot.com/o');
    final res = await http.get(uri).timeout(const Duration(seconds: 8));
    // ignore: avoid_print
    print('[STORAGE-HTTP] status=${res.statusCode} len=${res.body.length} bodySnippet=${res.body.substring(0, res.body.length > 120 ? 120 : res.body.length)}');
  } catch (e, st) {
    // ignore: avoid_print
    print('[STORAGE-HTTP][ERROR] $e\n$st');
  }
}
