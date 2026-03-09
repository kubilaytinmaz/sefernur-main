import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';


Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Background isolate: initialize a local notifications plugin instance and
  // display the notification. Avoid depending on app singletons (GetX)
  // because they are not available in the background isolate.
  final FlutterLocalNotificationsPlugin plugin = FlutterLocalNotificationsPlugin();
  try {
    const initializationSettings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(),
    );
    await plugin.initialize(initializationSettings);

    var notification = message.notification;
    if (notification != null) {
      var details = const NotificationDetails(
        android: AndroidNotificationDetails(
          'sefernur_notification_channel',
          'Sefernur Notifications',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      );
      await plugin.show(
        Random().nextInt(100000),
        notification.title,
        notification.body,
        details,
        payload: message.data.toString(),
      );
    }
  } catch (e) {
    // Background failures shouldn't crash the app - just log.
    print('[NOTIFICATION][BG] Failed to show local notification: $e');
  }
}

class NotificationService extends GetxService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotificationsPlugin = FlutterLocalNotificationsPlugin();

  Future<NotificationService> init() async {
    if (!kIsWeb) {
      createNotificationChannel();
      await requestPermissions();
      // On iOS we may need to wait a short while for the APNs token to be
      // available. Calling APIs that require the APNs token too early throws
      // a firebase_messaging/apns-token-not-set exception. Wait with retries
      // (non-blocking, short) before configuring messaging.
      if (Platform.isIOS) {
        await _waitForAPNSToken(timeout: const Duration(seconds: 8));
      }

      if (await checkNotificationPermissions()) {
        await _configureLocalNotifications();
        _configureFirebaseMessaging();
      }
    }
    return this;
  }

  /// Waits for APNs token to be available on iOS. Retries until timeout.
  Future<void> _waitForAPNSToken({Duration timeout = const Duration(seconds: 8)}) async {
    if (!Platform.isIOS) return;
    final end = DateTime.now().add(timeout);
    while (DateTime.now().isBefore(end)) {
      try {
        final apns = await _messaging.getAPNSToken();
        if (apns != null && apns.isNotEmpty) {
          // We have the APNs token — debug log and return.
          print('[NOTIFICATION] APNs token obtained: $apns');
          return;
        }
      } catch (e) {
        // getAPNSToken may throw if token isn't ready yet — ignore and retry.
      }
      await Future.delayed(const Duration(milliseconds: 500));
    }
    print('[NOTIFICATION] APNs token not available after ${timeout.inSeconds}s');
  }

  void _configureFirebaseMessaging() {
    // Foreground messages -> show a local notification
    FirebaseMessaging.onMessage.listen(showLocalNotification);

    // Background handler must be a top-level function. Keep it but avoid
    // relying on GetX singletons inside the background isolate.
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Listen for FCM token refreshes for debugging and server registration
    _messaging.onTokenRefresh.listen((token) {
      print('[NOTIFICATION] FCM token refreshed: $token');
    });
  }

  Future _configureLocalNotifications() async {
    var initializationSettings = const InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(),
    );
    await _localNotificationsPlugin.initialize(initializationSettings);
  }

  void showLocalNotification(RemoteMessage message) {
    var notification = message.notification;
    if (notification != null && !kIsWeb) {
      var details = const NotificationDetails(
        android: AndroidNotificationDetails(
          'sefernur_notification_channel',
          'Sefernur Notifications',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      );
      _localNotificationsPlugin.show(
        Random().nextInt(1000),
        notification.title,
        notification.body,
        details,
        payload: message.data.toString(),
      );
    }
  }

  Future<void> createNotificationChannel() async {
    if (Platform.isAndroid) {
      var channel = const AndroidNotificationChannel(
        'sefernur_notification_channel',
        'Sefernur Notifications',
        importance: Importance.high,
        description: 'Sefernur bildirimleri için kanal',
      );
      await _localNotificationsPlugin
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);
    }
  }

  Future requestPermissions() async {
    NotificationSettings settings = await _messaging.requestPermission();
    if (settings.authorizationStatus != AuthorizationStatus.authorized && (Platform.isIOS || Platform.isMacOS)) {
      await _localNotificationsPlugin
          .resolvePlatformSpecificImplementation<IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(
            alert: true,
            badge: true,
            sound: true,
          );
    }
  }

  Future<bool> checkNotificationPermissions() async {
    NotificationSettings settings = await _messaging.getNotificationSettings();
    return settings.authorizationStatus == AuthorizationStatus.authorized;
  }

  Future<String?> getDeviceToken() async {
    // On iOS, ensure APNs token is available before getting FCM token
    if (Platform.isIOS) {
      await _waitForAPNSToken(timeout: const Duration(seconds: 5));
    }
    final token = await _messaging.getToken();
    return token;
  }

  Future subscribeToTopic({required String topic}) async {
    // On iOS, ensure APNs token is available before subscribing
    if (Platform.isIOS) {
      await _waitForAPNSToken(timeout: const Duration(seconds: 5));
    }
    try {
      await _messaging.subscribeToTopic(topic);
      print('[NOTIFICATION] Subscribed to topic: $topic');
    } catch (e) {
      print('[NOTIFICATION] Failed to subscribe to topic $topic: $e');
    }
  }

  Future unsubscribeFromTopic({required String topic}) async {
    try {
      if (Platform.isIOS) {
        await _waitForAPNSToken(timeout: const Duration(seconds: 5));
      }
      await _messaging.unsubscribeFromTopic(topic);
    } catch (e) {
      print('[NOTIFICATION] Failed to unsubscribe from topic $topic: $e');
      // Don't throw - allow app to continue logout/cleanup
    }
  }

  Future setNotificationsEnabled(bool enabled) async {
    if (enabled) {
      await requestPermissions();
    } else {
      await _messaging.deleteToken();
    }
  }
}

