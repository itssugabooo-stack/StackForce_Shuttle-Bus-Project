import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'backend_http.dart';

import '../config/app_config.dart';

class AuthService {
  static const String baseUrl = AppConfig.backendUrl;

  static String? token;
  static String? vehicleId;
  static String? sourceId;

  static bool get isLoggedIn => token != null;

  static Future<void> login({
    required String sourceId,
    required String secret,
  }) async {
    final trimmedSourceId = sourceId.trim();
    final trimmedSecret = secret.trim();
    final loginUrl = '$baseUrl/api/auth/vehicle/login';

    debugPrint('LOGIN URL: $loginUrl');
    debugPrint('LOGIN sourceId="$trimmedSourceId"');
    debugPrint('LOGIN secret length=${trimmedSecret.length}');

    final response = await BackendHttp.post(
      Uri.parse(loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'sourceId': trimmedSourceId, 'secret': trimmedSecret}),
    );

    debugPrint('LOGIN status=${response.statusCode}');

    final data = BackendHttp.decodeObject(response);

    if (response.statusCode != 200) {
      throw Exception(data['error'] ?? data['message'] ?? 'Login failed');
    }

    final newToken = data['token'];
    final newVehicleId = data['vehicleId'];
    final newSourceId = data['sourceId'];
    if (newToken is! String ||
        newToken.isEmpty ||
        newVehicleId is! String ||
        newVehicleId.isEmpty ||
        newSourceId is! String ||
        newSourceId.isEmpty) {
      throw Exception(
        'Backend login response is missing valid credentials or vehicle ID',
      );
    }
    token = newToken;
    vehicleId = newVehicleId;
    AuthService.sourceId = newSourceId;
  }

  static void logout() {
    token = null;
    sourceId = null;
    vehicleId = null;
  }
}
