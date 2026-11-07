import 'dart:async';

import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/shuttle_ui.dart';
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
      body: ShuttlePage(
        children: [
          const PageHeading(
            eyebrow: 'Live tracking',
            title: 'You\u2019re on your way.',
            subtitle: 'Keep this screen open while driving your route.',
          ),
          // Keep the accessible status wording consistent with the trip workflow.
          const Text(
            'Trip Status: Active',
            style: TextStyle(
              color: ShuttleTheme.blue,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [ShuttleTheme.blue, Color(0xFF1642AF)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Icon(Icons.my_location_rounded, color: Colors.white),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'GPS Location',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    Icon(
                      gpsTracking ? Icons.gps_fixed : Icons.gps_not_fixed,
                      color: const Color(0xFFBFD4FF),
                      size: 18,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                AnimatedSize(
                  duration: const Duration(milliseconds: 200),
                  alignment: Alignment.centerLeft,
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      locationText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        height: 1.8,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                Text(
                  'Tracking: ${gpsTracking ? 'active' : 'inactive'}',
                  style: const TextStyle(
                    color: Color(0xFFD6E3FF),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          ValueListenableBuilder<String>(
            valueListenable: SocketService.connectionStatus,
            builder: (context, status, _) => AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: status == 'Connected'
                    ? const Color(0xFFE6F5F0)
                    : const Color(0xFFFFF4DF),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Icon(
                    status == 'Connected'
                        ? Icons.cloud_done_outlined
                        : Icons.cloud_off_rounded,
                    size: 20,
                    color: status == 'Connected'
                        ? const Color(0xFF22755D)
                        : const Color(0xFF8A6219),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Backend connection: $status',
                      style: const TextStyle(
                        color: ShuttleTheme.navy,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SectionHeading('Your journey'),
          DetailCard(
            icon: Icons.directions_bus_rounded,
            title: vehicle?.name ?? 'Unknown Vehicle',
            subtitle: 'Vehicle ID: ${vehicle?.id ?? '-'}',
          ),
          DetailCard(
            icon: Icons.alt_route_rounded,
            title: route?.name ?? 'Unknown Route',
            subtitle: 'Route ID: ${route?.id ?? '-'}',
          ),
          if (_permissionPermanentlyDenied) ...[
            const Notice(
              'Location permission is blocked. Open app settings, choose Permissions > Location > Allow only while using the app, and enable precise location. Return here and tap Start GPS Tracking.',
            ),
            OutlinedButton.icon(
              onPressed: _openingSettings ? null : _openAppSettings,
              icon: const Icon(Icons.settings),
              label: const Text('Open App Settings'),
            ),
          ],
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: loadingLocation || gpsTracking || endingTrip
                ? null
                : startGpsTracking,
            icon: Icon(
              gpsTracking
                  ? Icons.check_circle_outline_rounded
                  : Icons.my_location,
            ),
            label: Text(
              loadingLocation
                  ? 'Starting GPS...'
                  : gpsTracking
                  ? 'GPS Tracking Active'
                  : 'Start GPS Tracking',
            ),
          ),
          if (errorMessage != null) Notice(errorMessage!, isError: true),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFFEBEE),
              foregroundColor: const Color(0xFFAD2940),
            ),
            onPressed: endingTrip ? null : endTrip,
            icon: const Icon(Icons.stop_circle_outlined),
            label: Text(endingTrip ? 'Ending Trip...' : 'End Trip'),
          ),
        ],
      ),
    );
  }
}
