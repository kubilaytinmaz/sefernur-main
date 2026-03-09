import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';

class AnalyticService extends GetxService {
  late FirebaseAnalytics kAnalytics;

  Future<AnalyticService> init() async {
    kAnalytics = FirebaseAnalytics.instance;
    return this;
  }

  void logEvent(String event, {Map<String, dynamic>? parameter}) {
    if (kReleaseMode) {
      kAnalytics.logEvent(
        name: event, 
        parameters: parameter?.map((key, value) => MapEntry(key, value.toString())) ?? {}
      );
    } else {
      if (kDebugMode) {
        print("[EVENT]: $event");
      }
    }
  }
}
