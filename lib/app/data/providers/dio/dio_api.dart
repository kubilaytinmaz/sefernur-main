import 'package:dio/dio.dart';
import 'package:fpdart/fpdart.dart';

import '../../../utils/utils.dart';
import 'dio_paths.dart';

class DioApi {
  DioApi._privateConstructor() {
    dio = Dio(
      BaseOptions(
        baseUrl: DioPaths.baseUrl,
        connectTimeout: const Duration(
          milliseconds: DioPaths.connectionTimeout
        ),
        receiveTimeout: const Duration(
          milliseconds: DioPaths.receiveTimeout
        ),
        responseType: ResponseType.json,
      ),
    );
  }

  static final DioApi _instance = DioApi._privateConstructor();

  factory DioApi() {
    return _instance;
  }

  late Dio dio;

  Future<Map<String, String>> getHeaders([Map<String, String>? headers]) async {
    final defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (headers != null) {
      defaultHeaders.addAll(headers);
    }

    return defaultHeaders;
  }

  TaskEither<ServerFailure, T> get<T>({
    required String path,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final Response response = await dio.get(
          path,
          queryParameters: queryParameters,
          options: options,
          cancelToken: cancelToken,
          onReceiveProgress: onReceiveProgress,
        );
        return builder(response.data);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> post<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    required Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final Response response = await dio.post(
          path,
          data: data,
          queryParameters: queryParameters,
          options: options,
          cancelToken: cancelToken,
          onSendProgress: onSendProgress,
          onReceiveProgress: onReceiveProgress,
        );
        return builder(response.data);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> put<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    required Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final Response response = await dio.put(
          path,
          data: data,
          queryParameters: queryParameters,
          options: options,
          cancelToken: cancelToken,
          onSendProgress: onSendProgress,
          onReceiveProgress: onReceiveProgress,
        );
        return builder(response.data);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> patch<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    required Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final Response response = await dio.patch(
          path,
          data: data,
          queryParameters: queryParameters,
          options: options,
          cancelToken: cancelToken,
        );
        return builder(response.data);
      },
      (e, _) => ServerFailure( 
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> delete<T>({
    required String path,
    dynamic data,
    Map<String, dynamic>? queryParameters,
    required Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final Response response = await dio.delete(
          path,
          data: data,
          queryParameters: queryParameters,
          options: options,
          cancelToken: cancelToken,
        );
        return builder(response.data);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }
}
