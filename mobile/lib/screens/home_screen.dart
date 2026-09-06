import 'package:flutter/material.dart';
import '../services/mock_data.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tram Tracking'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Vehicles',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            ...MockData.vehicles.map(
              (vehicle) => Card(
                child: ListTile(
                  leading: const Icon(Icons.directions_bus),
                  title: Text(vehicle.name),
                  subtitle: Text('Status: ${vehicle.status}'),
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Routes',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            ...MockData.routes.map(
              (route) => Card(
                child: ListTile(
                  leading: const Icon(Icons.alt_route),
                  title: Text(route.name),
                  subtitle: Text(
                    '${route.startStop} → ${route.endStop}',
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Stops',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            ...MockData.stops.map(
              (stop) => Card(
                child: ListTile(
                  leading: const Icon(Icons.location_on),
                  title: Text(stop.name),
                  subtitle: Text(
                    'Lat: ${stop.latitude}, Lng: ${stop.longitude}',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}