import 'dart:async';
import 'dart:io';
import 'package:dio/dio.dart' as dio;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:get/get.dart';
import 'package:logger/logger.dart';

class AppException implements Exception {
  final String message;
  final String? details;
  final int? statusCode;

  AppException(this.message, {this.details, this.statusCode});

  @override
  String toString() => 'AppException: $message${details != null ? ' ($details)' : ''}';
}

class ErrorHandler {
  static final Logger _logger = Logger();

  static AppException handle(dynamic error) {
    if (error is AppException) return error;

    if (error is TimeoutException) {
      return AppException("timeoutErrorMessage".tr);
    }

    if (error is dio.DioException) {
      return _handleDioException(error);
    }

    if (error is FirebaseAuthException) {
      return _handleFirebaseAuthException(error);
    }

    _logger.e('Unhandled error', error: error);
    return AppException("somethingWentWrongErrorMessage".tr);
  }

  static AppException _handleDioException(dio.DioException e) {
    if (e.error is SocketException) {
      return AppException(e.error.toString().replaceAll("SocketException: ", ""));
    }

    switch (e.type) {
      case dio.DioExceptionType.cancel:
        return AppException("cancelErrorMessage".tr);
      case dio.DioExceptionType.connectionTimeout:
        return AppException("connectionTimeoutErrorMessage".tr);
      case dio.DioExceptionType.receiveTimeout:
        return AppException("receiveTimeoutErrorMessage".tr);
      case dio.DioExceptionType.badResponse:
        return _handleBadResponse(e.response);
      case dio.DioExceptionType.sendTimeout:
        return AppException("sendTimeoutErrorMessage".tr);
      case dio.DioExceptionType.unknown:
        if (e.message!.contains("SocketException")) {
          return AppException('noInternetErrorMessage'.tr);
        }
        return AppException("unknownErrorMessage".tr);
      default:
        return AppException("somethingWentWrongErrorMessage".tr);
    }
  }

  static AppException _handleBadResponse(dio.Response? response) {
    final statusCode = response?.statusCode;
    final responseData = response?.data;
    
    String message = "badResponseErrorMessage".trParams({
      "_statusCode": statusCode?.toString() ?? "",
      "_data": _getErrorMessage(statusCode, responseData),
    });

    return AppException(message, statusCode: statusCode, details: responseData.toString());
  }

  static String _getErrorMessage(int? statusCode, dynamic error) {
    switch (statusCode) {
      case 400:
        return 'badRequestErrorMessage'.tr;
      case 401:
        return 'unauthorizedErrorMessage'.tr;
      case 403:
        return 'forbiddenErrorMessage'.tr;
      case 404:
        return error is Map ? error['message'] ?? 'notFoundErrorMessage'.tr : 'notFoundErrorMessage'.tr;
      case 500:
        return 'internalServerErrorErrorMessage'.tr;
      case 502:
        return 'badGatewayErrorMessage'.tr;
      default:
        return 'defaultErrorMessage'.tr;
    }
  }

  static AppException _handleFirebaseAuthException(FirebaseAuthException e) {
    String message;
    switch (e.code) {
      case 'network-request-failed':
        message = "firebaseNetworkErrorMessage".tr;
        break;
      case 'invalid-email':
        message = "firebaseAuthInvalidEmailErrorMessage".tr;
        break;
      case 'user-disabled':
        message = "firebaseAuthUserDisabledErrorMessage".tr;
        break;
      case 'user-not-found':
        message = "firebaseAuthUserNotFoundErrorMessage".tr;
        break;
      case 'wrong-password':
        message = "firebaseAuthWrongPasswordErrorMessage".tr;
        break;
      default:
        message = "firebaseErrorMessage".tr;
    }
    return AppException(message, details: e.code);
  }

  static void logError(dynamic error, [StackTrace? stackTrace]) {
    final appException = handle(error);
    _logger.e(
      appException.toString(), 
      error: error, 
      stackTrace: stackTrace
    );
  }
}