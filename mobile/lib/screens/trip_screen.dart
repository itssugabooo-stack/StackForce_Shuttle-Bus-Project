import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../models/vehicle.dart';
import '../models/route.dart';
import '../services/socket_service.dart';
import '../services/trip_service.dart';
import '../utils/error_message.dart';

enum _ErrorKind { location, trip, connection }

class TripScreen extends StatefulWidget {
  const TripScreen({super.key});

  @override
  State<TripScreen> createState() => _TripScreenState();
}

class _TripScreenState extends State<TripScreen> {
  StreamSubscription<Position>? _positionSubscription;
  int _trackingGeneration = 0;

  String locationText = 'Starting GPS tracking...';
  bool loadingLocation = false;
  bool gpsTracking = false;
  bool endingTrip = false;
  String? errorMessage;
  _ErrorKind? _errorKind;
  bool _permissionPermanentlyDenied = false;
  bool _openingSettings = false;

  @override
  void initState() {
    super.initState();
    SocketService.connectionStatus.addListener(_onConnectionChanged);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) startGpsTracking();
    });
  }

  @override
  void dispose() {
    SocketService.connectionStatus.removeListener(_onConnectionChanged);
    _trackingGeneration++;
    _positionSubscription?.cancel();
    SocketService.disconnect();
    super.dispose();
  }

  void _onConnectionChanged() {
    if (mounted &&
        SocketService.connectionStatus.value == 'Connected' &&
        _errorKind == _ErrorKind.connection) {
      setState(() {
        errorMessage = null;
        _errorKind = null;
      });
    }
  }

  Future<void> _openAppSettings() async {
    setState(() => _openingSettings = true);
    try {
      final opened = await Geolocator.openAppSettings();
      if (!mounted) return;
      setState(() {
        if (opened) {
          if (_errorKind == _ErrorKind.location) {
            errorMessage = null;
            _errorKind = null;
          }
        } else {
          _errorKind = _ErrorKind.location;
          errorMessage =
              'Could not open settings. Open Android Settings > Apps > '
              'tram_tracking_mobile > Permissions > Location manually.';
        }
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorKind = _ErrorKind.location;
        errorMessage = 'Could not open app settings. ${userFacingError(error)}';
      });
    } finally {
      if (mounted) setState(() => _openingSettings = false);
    }
  }

  Future<bool> _ensureLocationReady() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!mounted) return false;

    if (!serviceEnabled) {
      if (!mounted) return false;

      setState(() {
        locationText = 'Location service is disabled';
      });
      return false;
    }

    var permission = await Geolocator.checkPermission();
    if (!mounted) return false;

    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (!mounted) return false;
    setState(() {
      _permissionPermanentlyDenied =
          permission == LocationPermission.deniedForever;
    });

    if (permission == LocationPermission.denied) {
      if (!mounted) return false;

      setState(() {
        locationText = 'Location permission denied';
      });
      return false;
    }

    if (permission == LocationPermission.deniedForever) {
      if (!mounted) return false;

      setState(() {
        locationText = 'Location permission permanently denied';
      });
      return false;
    }

    return true;
  }

  void _handlePosition(Position position) {
    if (!mounted) return;
    SocketService.sendLocation(
      lat: position.latitude,
      lng: position.longitude,
      speed: position.speed,
      heading: position.heading,
    );

    if (!mounted) return;

    setState(() {
      gpsTracking = true;
      if (_errorKind == _ErrorKind.location) {
        errorMessage = null;
        _errorKind = null;
      }
      locationText =
          'Latitude: ${position.latitude}\n'
          'Longitude: ${position.longitude}';
    });
  }

  Future<void> startGpsTracking() async {
    if (!mounted ||
        loadingLocation ||
        endingTrip ||
        _positionSubscription != null) {
      return;
    }
    final generation = ++_trackingGeneration;

    setState(() {
      loadingLocation = true;
      if (_errorKind == _ErrorKind.location) {
        errorMessage = null;
        _errorKind = null;
      }
    });

    try {
      final locationReady = await _ensureLocationReady();

      if (!mounted || generation != _trackingGeneration || !locationReady) {
        return;
      }

      SocketService.connect();

      final currentPosition = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 20),
        ),
      );

      if (!mounted || generation != _trackingGeneration) return;
      _handlePosition(currentPosition);

      _positionSubscription =
          Geolocator.getPositionStream(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.high,
              distanceFilter: 5,
            ),
          ).listen(
            (position) {
              if (generation == _trackingGeneration) _handlePosition(position);
            },
            onError: (error) {
              if (!mounted || generation != _trackingGeneration) return;
              _trackingGeneration++;
              _positionSubscription?.cancel();
              _positionSubscription = null;
              SocketService.disconnect();

              setState(() {
                gpsTracking = false;
                _errorKind = _ErrorKind.location;
                errorMessage = 'GPS tracking error: ${userFacingError(error)}';
              });
            },
          );
    } catch (e) {
      if (!mounted || generation != _trackingGeneration) return;
      SocketService.disconnect();

      setState(() {
        gpsTracking = false;
        locationText = 'Failed to start GPS tracking';
        _errorKind = _ErrorKind.location;
        errorMessage = userFacingError(e);
      });
    } finally {
      if (mounted) {
        setState(() {
          loadingLocation = false;
        });
      }
    }
  }

  Future<void> stopGpsTracking() async {
    _trackingGeneration++;
    final subscription = _positionSubscription;
    _positionSubscription = null;
    SocketService.disconnect();
    await subscription?.cancel();

    if (!mounted) return;

    setState(() {
      gpsTracking = false;
    });
  }

  Future<void> endTrip() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('End Trip'),
          content: const Text('Are you sure you want to end this trip?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, false);
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context, true);
              },
              child: const Text('End Trip'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) return;

    setState(() {
      endingTrip = true;
      errorMessage = null;
      _errorKind = null;
    });

    try {
      await TripService.endTrip();
      await stopGpsTracking();

      if (!mounted) return;

      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _errorKind = isConnectionError(e)
            ? _ErrorKind.connection
            : _ErrorKind.trip;
        errorMessage = userFacingError(e);
      });
    } finally {
      if (mounted) {
        setState(() {
          endingTrip = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final arguments =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    final vehicle = arguments?['vehicle'] as Vehicle?;
    final route = arguments?['route'] as TramRoute?;

    return Scaffold(
      appBar: AppBar(title: const Text('Active Trip')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          children: [
            const Text(
              'Trip Status: Active',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 20),

            Card(
              child: ListTile(
                leading: const Icon(Icons.directions_bus),
                title: Text(vehicle?.name ?? 'Unknown Vehicle'),
                subtitle: Text('Vehicle ID: ${vehicle?.id ?? '-'}'),
              ),
            ),

            Card(
              child: ListTile(
                leading: const Icon(Icons.alt_route),
                title: Text(route?.name ?? 'Unknown Route'),
                subtitle: Text('Route ID: ${route?.id ?? '-'}'),
              ),
            ),

            Card(
              child: ListTile(
                leading: const Icon(Icons.location_on),
                title: const Text('GPS Location'),
                subtitle: Text(
                  '$locationText\n'
                  'Tracking: ${gpsTracking ? 'active' : 'inactive'}',
                ),
              ),
            ),

            const SizedBox(height: 20),

            ValueListenableBuilder<String>(
              valueListenable: SocketService.connectionStatus,
              builder: (context, status, _) =>
                  Text('Backend connection: $status'),
            ),

            if (_permissionPermanentlyDenied) ...[
              const SizedBox(height: 12),
              const Text(
                'Location permission is blocked. Open app settings, choose '
                'Permissions > Location > Allow only while using the app, '
                'and enable precise location. Return here and tap Start GPS Tracking.',
              ),
              OutlinedButton.icon(
                onPressed: _openingSettings ? null : _openAppSettings,
                icon: const Icon(Icons.settings),
                label: const Text('Open App Settings'),
              ),
            ],

            ElevatedButton.icon(
              onPressed: loadingLocation || gpsTracking || endingTrip
                  ? null
                  : startGpsTracking,
              icon: const Icon(Icons.my_location),
              label: Text(
                loadingLocation
                    ? 'Starting GPS...'
                    : gpsTracking
                    ? 'GPS Tracking Active'
                    : 'Start GPS Tracking',
              ),
            ),

            if (errorMessage != null) ...[
              const SizedBox(height: 15),
              Text(
                errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
            ],

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: endingTrip ? null : endTrip,
              icon: const Icon(Icons.stop),
              label: Text(endingTrip ? 'Ending Trip...' : 'End Trip'),
            ),
          ],
        ),
      ),
    );
  }
}
