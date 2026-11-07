import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/shuttle_ui.dart';

import '../utils/error_message.dart';

import '../models/vehicle.dart';
import '../models/route.dart';
import '../models/stop.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
      ApiService.getStops(),
    ]);

    return results;
  }

  Future<void> _refresh() async {
    setState(() {
      _dataFuture = _loadData();
    });

    try {
      await _dataFuture;
    } catch (_) {
      // FutureBuilder displays the loading error and retry action.
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('StackForce'),
        actions: [
          IconButton(
            tooltip: 'Refresh shuttle data',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh_rounded),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _dataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadState();
          }
          if (snapshot.hasError) {
            return LoadState(
              error: userFacingError(snapshot.error!),
              onRetry: _refresh,
            );
          }
          final vehicles = snapshot.data![0] as List<Vehicle>;
          final routes = snapshot.data![1] as List<TramRoute>;
          final stops = snapshot.data![2] as List<TramStop>;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ShuttlePage(
              children: [
                const PageHeading(
                  eyebrow: 'Campus overview',
                  title: 'Let\u2019s get moving.',
                  subtitle: 'Your shuttle network, all in one place.',
                ),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: ShuttleTheme.navy,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(
                        Icons.directions_bus_rounded,
                        color: Color(0xFF9EBFFF),
                        size: 36,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Ready for your next trip?',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Choose a route or resume your active trip.',
                        style: TextStyle(color: Color(0xFFBECCE5)),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () =>
                            Navigator.pushNamed(context, '/start-trip'),
                        icon: const Icon(Icons.arrow_forward_rounded),
                        label: const Text('Start Trip'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    Chip(
                      avatar: const Icon(
                        Icons.directions_bus_outlined,
                        size: 18,
                      ),
                      label: Text('${vehicles.length} vehicles'),
                    ),
                    Chip(
                      avatar: const Icon(Icons.alt_route_rounded, size: 18),
                      label: Text('${routes.length} routes'),
                    ),
                    Chip(
                      avatar: const Icon(Icons.place_outlined, size: 18),
                      label: Text('${stops.length} stops'),
                    ),
                  ],
                ),
                SectionHeading('Vehicles', count: vehicles.length),
                if (vehicles.isEmpty)
                  const Notice('No vehicles are available yet.'),
                ...vehicles.map(
                  (v) => DetailCard(
                    icon: Icons.directions_bus_rounded,
                    title: v.name,
                    subtitle: '${v.type} \u2022 ${v.status}',
                    tag:
                        '${v.id} \u2022 Route: ${v.assignedRouteId ?? 'Not assigned'}',
                  ),
                ),
                SectionHeading('Routes', count: routes.length),
                if (routes.isEmpty)
                  const Notice('No routes are available yet.'),
                ...routes.map(
                  (r) => DetailCard(
                    icon: Icons.alt_route_rounded,
                    title: r.name,
                    subtitle: 'Status: ${r.status}',
                    tag: r.id,
                  ),
                ),
                SectionHeading('Campus stops', count: stops.length),
                if (stops.isEmpty) const Notice('No stops are available yet.'),
                ...stops.map(
                  (s) => DetailCard(
                    icon: Icons.location_on_outlined,
                    title: s.nameEn,
                    subtitle:
                        '${s.nameTh}\n${s.lat != null && s.lng != null ? '${s.lat}, ${s.lng}' : 'Coordinates unavailable'}',
                    tag: s.id,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
