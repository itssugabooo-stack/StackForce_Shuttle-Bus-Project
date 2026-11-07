import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/shuttle_ui.dart';

import '../utils/error_message.dart';

import '../models/vehicle.dart';
import '../models/route.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/trip_service.dart';

class StartTripScreen extends StatefulWidget {
  const StartTripScreen({super.key});

  @override
  State<StartTripScreen> createState() => _StartTripScreenState();
}

class _StartTripScreenState extends State<StartTripScreen> {
  TramRoute? selectedRoute;
  Vehicle? loggedInVehicle;
  List<TramRoute> availableRoutes = [];
  Map<String, dynamic>? activeTrip;

  bool isStartingTrip = false;
  String? errorMessage;

  late Future<List<dynamic>> _dataFuture;

  @override
  void initState() {
    super.initState();
    _dataFuture = _loadData();
  }

  Future<List<dynamic>> _loadData() async {
    final results = await Future.wait([
      ApiService.getVehicles(),
      ApiService.getRoutes(),
    ]);

    final vehicles = results[0] as List<Vehicle>;
    final routes = results[1] as List<TramRoute>;

    final vehicleId = AuthService.vehicleId;

    if (vehicleId == null) {
      throw Exception('No logged-in vehicle');
    }

    final vehicle = vehicles.where((v) => v.id == vehicleId).firstOrNull;

    if (vehicle == null) {
      throw Exception('Logged-in vehicle not found');
    }

    final currentActiveTrip = await TripService.getActiveTrip();

    loggedInVehicle = vehicle;
    availableRoutes = routes;
    activeTrip = currentActiveTrip;

    return [vehicle, routes, currentActiveTrip];
  }

  TramRoute? _routeForTrip(List<TramRoute> routes, Map<String, dynamic>? trip) {
    final routeId = trip?['routeId']?.toString();

    if (routeId == null) {
      return null;
    }

    return routes.where((route) => route.id == routeId).firstOrNull;
  }

  void _openTripScreen({
    required Vehicle vehicle,
    required List<TramRoute> routes,
    required Map<String, dynamic>? trip,
    TramRoute? fallbackRoute,
  }) {
    final tripRoute = _routeForTrip(routes, trip) ?? fallbackRoute;

    Navigator.pushReplacementNamed(
      context,
      '/trip',
      arguments: {'vehicle': vehicle, 'route': tripRoute, 'trip': trip},
    );
  }

  Future<void> startTrip() async {
    if (selectedRoute == null) {
      setState(() {
        errorMessage = 'Please select a route';
      });
      return;
    }

    setState(() {
      isStartingTrip = true;
      errorMessage = null;
    });

    try {
      final trip = await TripService.startTrip(routeId: selectedRoute!.id);

      if (!mounted) return;

      activeTrip = trip;

      _openTripScreen(
        vehicle: loggedInVehicle!,
        routes: availableRoutes,
        trip: trip,
        fallbackRoute: selectedRoute,
      );
    } catch (e) {
      if (!mounted) return;

      setState(() {
        errorMessage = userFacingError(e);
      });
    } finally {
      if (mounted) {
        setState(() {
          isStartingTrip = false;
        });
      }
    }
  }

  Future<void> resumeActiveTrip() async {
    if (loggedInVehicle == null) {
      setState(() {
        errorMessage = 'Logged-in vehicle not found';
      });
      return;
    }

    setState(() {
      isStartingTrip = true;
      errorMessage = null;
    });

    try {
      final trip = activeTrip ?? await TripService.getActiveTrip();

      if (trip == null) {
        if (!mounted) return;

        setState(() {
          errorMessage = 'No active trip found';
        });
        return;
      }

      if (!mounted) return;

      activeTrip = trip;

      _openTripScreen(
        vehicle: loggedInVehicle!,
        routes: availableRoutes,
        trip: trip,
      );
    } catch (e) {
      if (!mounted) return;

      setState(() {
        errorMessage = userFacingError(e);
      });
    } finally {
      if (mounted) {
        setState(() {
          isStartingTrip = false;
        });
      }
    }
  }

  Future<void> retry() async {
    setState(() {
      _dataFuture = _loadData();
      errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Start Trip')),
      body: FutureBuilder<List<dynamic>>(
        future: _dataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadState();
          }
          if (snapshot.hasError) {
            return LoadState(
              error: userFacingError(snapshot.error!),
              onRetry: retry,
            );
          }
          final vehicle = snapshot.data![0] as Vehicle;
          final routes = snapshot.data![1] as List<TramRoute>;
          final currentActiveTrip = snapshot.data![2] as Map<String, dynamic>?;
          return ShuttlePage(
            children: [
              const PageHeading(
                eyebrow: 'Trip preparation',
                title: 'Set your course.',
                subtitle: 'Check your vehicle and choose your campus route.',
              ),
              const SectionHeading('01  Your vehicle'),
              DetailCard(
                icon: Icons.directions_bus_rounded,
                title: vehicle.name,
                subtitle: '${vehicle.type} \u2022 ${vehicle.status}',
                tag: 'VEHICLE ${vehicle.id}',
              ),
              if (currentActiveTrip != null) ...[
                const SizedBox(height: 14),
                Card(
                  color: const Color(0xFFEAF1FF),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const IconBadge(Icons.trip_origin_rounded),
                        const SizedBox(height: 14),
                        Text(
                          'Active trip in progress',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text('Trip ID: ${currentActiveTrip['id'] ?? '-'}'),
                        const SizedBox(height: 18),
                        ElevatedButton.icon(
                          onPressed: isStartingTrip ? null : resumeActiveTrip,
                          icon: const Icon(Icons.play_circle_outline_rounded),
                          label: Text(
                            isStartingTrip
                                ? 'Resuming Trip...'
                                : 'Resume Active Trip',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              const SectionHeading('02  Select route'),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Where are you heading?'),
                      const SizedBox(height: 14),
                      DropdownButtonFormField<TramRoute>(
                        initialValue: selectedRoute,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.alt_route_rounded),
                        ),
                        hint: const Text('Choose route'),
                        items: routes
                            .map(
                              (route) => DropdownMenuItem<TramRoute>(
                                value: route,
                                child: Text(
                                  route.name,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: isStartingTrip
                            ? null
                            : (route) {
                                setState(() {
                                  selectedRoute = route;
                                  errorMessage = null;
                                });
                              },
                      ),
                      if (routes.isEmpty)
                        const Notice(
                          'No routes are available. Contact your shuttle coordinator.',
                        ),
                      AnimatedSize(
                        duration: const Duration(milliseconds: 200),
                        alignment: Alignment.topCenter,
                        child: selectedRoute == null
                            ? const SizedBox.shrink()
                            : Padding(
                                padding: const EdgeInsets.only(top: 16),
                                child: Text(
                                  'Route ${selectedRoute!.id} \u2022 ${selectedRoute!.status}',
                                  style: const TextStyle(
                                    color: ShuttleTheme.blue,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
              if (errorMessage != null) Notice(errorMessage!, isError: true),
              const SizedBox(height: 28),
              ElevatedButton.icon(
                onPressed: isStartingTrip ? null : startTrip,
                icon: const Icon(Icons.play_arrow_rounded),
                label: Text(isStartingTrip ? 'Starting Trip...' : 'Start Trip'),
              ),
              const SizedBox(height: 14),
              const Text(
                'GPS tracking starts when you enter your trip.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: ShuttleTheme.muted),
              ),
            ],
          );
        },
      ),
    );
  }
}
