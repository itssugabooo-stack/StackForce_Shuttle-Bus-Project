import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

/// Shared timeout and response handling for the existing backend requests.
class BackendHttp {
  static Future<http.Response> get(Uri url, {Map<String, String>? headers}) =>
      _withTimeout(http.get(url, headers: headers));

  static Future<http.Response> post(
    Uri url, {
    Map<String, String>? headers,
    Object? body,
  }) => _withTimeout(http.post(url, headers: headers, body: body));

  static Future<http.Response> _withTimeout(Future<http.Response> request) =>
      request.timeout(
        const Duration(seconds: 15),
        onTimeout: () => throw TimeoutException(
          'Backend request timed out. Check the connection. For trip actions, '
          'check the active trip before retrying.',
        ),
      );

  static dynamic decode(http.Response response) {
    try {
      return jsonDecode(response.body);
    } on FormatException {
      throw Exception(
        'Backend returned an invalid response (HTTP ${response.statusCode}). '
        'Check the backend address and server status.',
      );
    }
  }

  static Map<String, dynamic> decodeObject(http.Response response) {
    final data = decode(response);
    if (data is Map<String, dynamic>) return data;
    throw Exception('Expected a backend object (HTTP ${response.statusCode}).');
  }
}
