import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:tram_tracking_mobile/utils/error_message.dart';

void main() {
  test('timeout uses its message without the exception type or duration', () {
    expect(
      userFacingError(
        TimeoutException(
          'Backend request timed out',
          const Duration(seconds: 15),
        ),
      ),
      'Backend request timed out',
    );
    expect(
      userFacingError(TimeoutException(null)),
      'Request timed out. Please try again.',
    );
  });

  test('only a leading generic exception prefix is removed', () {
    expect(
      userFacingError(Exception('Trip is already completed')),
      'Trip is already completed',
    );
    expect(
      userFacingError('Details: Exception: keep this'),
      'Details: Exception: keep this',
    );
  });

  test('only transport failures qualify for clearing after reconnect', () {
    expect(isConnectionError(TimeoutException('Timed out')), isTrue);
    expect(
      isConnectionError(http.ClientException('Connection refused')),
      isTrue,
    );
    expect(isConnectionError(Exception('Unauthorized')), isFalse);
    expect(
      userFacingError(http.ClientException('Connection refused')),
      'Unable to reach the backend. Check your connection.',
    );
  });
}
