import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:tram_tracking_mobile/models/stop.dart';
import 'package:tram_tracking_mobile/models/route_stop.dart';
import 'package:tram_tracking_mobile/services/backend_http.dart';

void main() {
  final stopJson = <String, dynamic>{
    'id': 'S01',
    'nameTh': 'Main gate',
    'nameEn': null,
    'lat': null,
    'lng': null,
    'status': 'active',
    'createdAt': '2026-11-07T00:00:00Z',
  };

  test('nullable backend stop fields do not invent coordinates', () {
    final stop = TramStop.fromJson(stopJson);
    expect(stop.nameEn, 'Main gate');
    expect(stop.lat, isNull);
    expect(stop.lng, isNull);
    expect(RouteStopInfo.fromJson(stopJson).nameEn, 'Main gate');
  });

  test('numeric stop coordinates remain usable', () {
    final stop = TramStop.fromJson({...stopJson, 'lat': 14, 'lng': 100.5});
    expect(stop.lat, 14.0);
    expect(stop.lng, 100.5);
  });

  test('HTML error response reports HTTP status instead of a JSON error', () {
    expect(
      () => BackendHttp.decodeObject(
        http.Response('<html>Unavailable</html>', 502),
      ),
      throwsA(predicate((e) => e.toString().contains('HTTP 502'))),
    );
  });

  test('unexpected JSON shape is rejected', () {
    expect(
      () => BackendHttp.decodeObject(http.Response('[]', 200)),
      throwsException,
    );
  });

  test('backend error object is preserved', () {
    expect(
      BackendHttp.decodeObject(
        http.Response('{"error":"Invalid credentials"}', 401),
      ),
      {'error': 'Invalid credentials'},
    );
  });
}
