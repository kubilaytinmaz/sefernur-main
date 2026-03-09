import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:logger/logger.dart';

import '../data/enums/enums.dart';
import '../data/services/services.dart';

var logger = Logger();

void cprint(dynamic data, {
  String? errorIn, 
  String? event,
  LogType label = LogType.debug,
  Map<String, dynamic> parameter = const {},
  dynamic error,
  StackTrace? stackTrace,
}) {
  if (kDebugMode) {
    if (errorIn != null) {
      logger.e(
        data,
        time: DateTime.now(),    
        error: error,
        stackTrace: stackTrace,  
      );
    } else {
      switch (label) {
        case LogType.trace:
          logger.t(data);
          break;
        case LogType.debug:
          logger.d(data);
          break;
        case LogType.info:
          logger.i(data);
          break;
        case LogType.warning:
          logger.w(data);
          break;
        case LogType.error:
          logger.e(
            data,
            time: DateTime.now(),    
            error: error,
            stackTrace: stackTrace,  
          );
          break;
        default:
          logger.d(
            data,
            time: DateTime.now(),    
            error: error,
            stackTrace: stackTrace,  
          );
          break;
      }
    }

    if (event != null) {
      AnalyticService analyticService = Get.find<AnalyticService>();
      analyticService.logEvent(event, parameter: parameter);
    }
  }
}