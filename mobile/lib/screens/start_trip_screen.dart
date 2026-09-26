import 'package:flutter/material.dart';

import '../models/vehicle.dart';
import '../models/route.dart';
import '../services/api_service.dart';
import 'trip_screen.dart';

class StartTripScreen extends StatefulWidget {
  const StartTripScreen({super.key});

  @override
  State<StartTripScreen> createState() => _StartTripScreenState();
}

class _StartTripScreenState extends State<StartTripScreen> {
  Vehicle? selectedVehicle;
  TramRoute? selectedRoute;

  late Future<List<dynamic>> _dataFuture;

  @override
  void initState() {
    super.initState();
    _dataFuture = _loadData();
  }

  Future<List<dynamic>> _loadData() async {
    return Future.wait([ApiService.getVehicles(), ApiService.getRoutes()]);
  }

  void continueToTrip() {
    final vehicle = selectedVehicle;
    final route = selectedRoute;
    if (vehicle == null || route == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a vehicle and route')),
      );
      return;
    }

    Navigator.pushNamed(
      context,
      '/trip',
      arguments: TripArguments(vehicle: vehicle, route: route),
    );
  }

  void _retry() {
    setState(() {
      selectedVehicle = null;
      selectedRoute = null;
      _dataFuture = _loadData();
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
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Unable to load vehicles and routes. Check your connection and try again.\n${snapshot.error}',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _retry,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
            );
          }

          final vehicles = snapshot.data![0] as List<Vehicle>;
          final routes = snapshot.data![1] as List<TramRoute>;

          if (vehicles.isEmpty || routes.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'A vehicle and route are needed to start a trip.\nNo vehicles or routes are available.',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: _retry, child: const Text('Retry')),
                ],
              ),
            );
          }

          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Select Vehicle',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 10),

                DropdownButtonFormField<Vehicle>(
                  isExpanded: true,
                  initialValue: selectedVehicle,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.directions_bus),
                  ),
                  hint: const Text('Choose vehicle'),
                  items: vehicles.map((vehicle) {
                    return DropdownMenuItem<Vehicle>(
                      value: vehicle,
                      child: Text('${vehicle.name} (${vehicle.id})'),
                    );
                  }).toList(),
                  onChanged: (vehicle) {
                    setState(() {
                      selectedVehicle = vehicle;
                    });
                  },
                ),

                const SizedBox(height: 25),

                const Text(
                  'Select Route',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 10),

                DropdownButtonFormField<TramRoute>(
                  isExpanded: true,
                  initialValue: selectedRoute,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.alt_route),
                  ),
                  hint: const Text('Choose route'),
                  items: routes.map((route) {
                    return DropdownMenuItem<TramRoute>(
                      value: route,
                      child: Text(route.name),
                    );
                  }).toList(),
                  onChanged: (route) {
                    setState(() {
                      selectedRoute = route;
                    });
                  },
                ),

                const Spacer(),

                ElevatedButton.icon(
                  onPressed: continueToTrip,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Continue'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
