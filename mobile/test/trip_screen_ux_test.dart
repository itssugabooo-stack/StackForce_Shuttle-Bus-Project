import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:tram_tracking_mobile/screens/trip_screen.dart';
import 'package:tram_tracking_mobile/services/auth_service.dart';
import 'package:tram_tracking_mobile/services/socket_service.dart';
import 'package:tram_tracking_mobile/services/trip_service.dart';

class FakeLocation extends GeolocatorPlatform {
  LocationPermission permission = LocationPermission.deniedForever;
  bool settingsOpened = true;
  int settingsCalls = 0;
  int positionCalls = 0;

  @override
  Future<bool> isLocationServiceEnabled() async => true;

  @override
  Future<LocationPermission> checkPermission() async => permission;

  @override
  Future<bool> openAppSettings() async {
    settingsCalls++;
    return settingsOpened;
  }

  @override
  Future<Position> getCurrentPosition({
    LocationSettings? locationSettings,
  }) async {
    positionCalls++;
    return Position(
      latitude: 13.9653,
      longitude: 100.5872,
      timestamp: DateTime(2026, 11, 8),
      accuracy: 1,
      altitude: 0,
      altitudeAccuracy: 1,
      heading: 0,
      headingAccuracy: 1,
      speed: 0,
      speedAccuracy: 1,
    );
  }

  @override
  Stream<Position> getPositionStream({LocationSettings? locationSettings}) =>
      const Stream.empty();
}

void main() {
  late FakeLocation location;
  late GeolocatorPlatform originalLocation;

  setUp(() {
    originalLocation = GeolocatorPlatform.instance;
    location = FakeLocation();
    GeolocatorPlatform.instance = location;
    AuthService.token = 'test-token';
    TripService.activeTripId = 'demo-trip';
    SocketService.connectionStatus.value = 'Disconnected';
  });

  tearDown(() {
    SocketService.disconnect();
    AuthService.logout();
    TripService.activeTripId = null;
    GeolocatorPlatform.instance = originalLocation;
  });

  Future<void> openTrip(WidgetTester tester) async {
    tester.view.physicalSize = const Size(900, 1800);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(const MaterialApp(home: TripScreen()));
    await tester.pumpAndSettle();
  }

  Future<void> press(WidgetTester tester, String label) async {
    final button = find.ancestor(
      of: find.text(label),
      matching: find.byWidgetPredicate((widget) => widget is ButtonStyleButton),
    );
    await tester.ensureVisible(button);
    await tester.tap(button);
    await tester.pumpAndSettle();
  }

  testWidgets(
    'permanent denial opens settings and permission recovery restores GPS',
    (tester) async {
      await openTrip(tester);
      expect(
        find.textContaining(
          'Permissions > Location > Allow only while using the app',
        ),
        findsOneWidget,
      );
      expect(location.positionCalls, 0);
      await press(tester, 'Open App Settings');
      expect(location.settingsCalls, 1);

      location.permission = LocationPermission.whileInUse;
      await press(tester, 'Start GPS Tracking');
      expect(find.text('Open App Settings'), findsNothing);
      expect(find.text('GPS Tracking Active'), findsOneWidget);
      expect(location.positionCalls, 1);
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
    },
  );

  testWidgets(
    'failed settings launch offers manual instructions and clears on success',
    (tester) async {
      location.settingsOpened = false;
      await openTrip(tester);
      await press(tester, 'Open App Settings');
      expect(find.textContaining('Could not open settings.'), findsOneWidget);
      SocketService.connectionStatus.value = 'Connected';
      await tester.pump();
      expect(find.textContaining('Could not open settings.'), findsOneWidget);
      location.settingsOpened = true;
      await press(tester, 'Open App Settings');
      expect(find.textContaining('Could not open settings.'), findsNothing);
      await tester.pumpWidget(const SizedBox.shrink());
    },
  );

  for (final transportFailure in [true, false]) {
    testWidgets(
      transportFailure
          ? 'reconnection clears timed-out trip error without retrying the operation'
          : 'reconnection preserves a backend rejection',
      (tester) async {
        await openTrip(tester);
        var requests = 0;
        await http.runWithClient(
          () async {
            await press(tester, 'End Trip');
            await tester.tap(
              find.widgetWithText(ElevatedButton, 'End Trip').last,
            );
            await tester.pumpAndSettle();
          },
          () => MockClient((request) async {
            requests++;
            expect(request.method, 'POST');
            expect(request.url.path, '/api/trips/demo-trip/end');
            if (transportFailure) {
              throw TimeoutException('Backend request timed out');
            }
            return http.Response(
              '{"error":"Unauthorized to end this trip"}',
              403,
            );
          }),
        );

        final message = transportFailure
            ? 'Backend request timed out'
            : 'Unauthorized to end this trip';
        expect(find.text(message), findsOneWidget);
        expect(requests, 1);
        SocketService.connectionStatus.value = 'Connected';
        await tester.pumpAndSettle();
        expect(
          find.text(message),
          transportFailure ? findsNothing : findsOneWidget,
        );
        expect(requests, 1);
        expect(TripService.activeTripId, 'demo-trip');
        expect(find.text('Trip Status: Active'), findsOneWidget);
        await tester.pumpWidget(const SizedBox.shrink());
        // A later socket update must not call setState on the disposed screen.
        SocketService.connectionStatus.value = 'Connected';
        await tester.pump();
        expect(tester.takeException(), isNull);
      },
    );
  }
}
