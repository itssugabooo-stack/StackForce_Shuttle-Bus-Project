import 'dart:async';

import 'package:http/http.dart' as http;

String userFacingError(Object error) {
  if (error is TimeoutException) {
    return error.message ?? 'Request timed out. Please try again.';
  }
  if (error is http.ClientException) {
    return 'Unable to reach the backend. Check your connection.';
  }
  return error.toString().replaceFirst(RegExp(r'^Exception: '), '');
}

bool isConnectionError(Object error) =>
    error is TimeoutException || error is http.ClientException;
