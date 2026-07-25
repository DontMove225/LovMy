import 'package:lovmy/core/config.dart';
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Api {
  final Dio _dio = Dio();

  Api() {
    _dio.options.baseUrl = Config.baseUrlApi;
    _dio.options.headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // Intercepteur qui injecte le Bearer token automatiquement
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString("auth_token");
        if (token != null && token.isNotEmpty) {
          options.headers["Authorization"] = "Bearer $token";
        }
        return handler.next(options);
      },
    ));

    _dio.interceptors.add(PrettyDioLogger(
      requestBody: true,
      error: true,
      responseBody: true,
    ));
  }

  Dio get sendRequest => _dio;
}
