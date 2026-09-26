import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../models/route.dart';
import '../models/vehicle.dart';

class TripArguments {
  final Vehicle vehicle;
  final TramRoute route;

  const TripArguments({required this.vehicle, required this.route});
}

class TripScreen extends StatefulWidget {
  final TripArguments arguments;

  const TripScreen({super.key, required this.arguments});

  @override
  State<TripScreen> createState() => _TripScreenState();
}

class _TripScreenState extends State<TripScreen> {
  String locationText = 'Location not started';
  bool loadingLocation = false;
  bool _tripActive = false;
  bool _confirmingEndTrip = false;

  @override
  void initState() {
    super.initState();
    _startTrip();
  }

  void _startTrip() {
    // TODO: Call backend Start Trip API here when endpoint is provided.
    // For now, this status represents a local trip only.
    _tripActive = true;
  }

  Future<void> _endTrip() async {
    if (_confirmingEndTrip || !_tripActive) return;
    setState(() => _confirmingEndTrip = true);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('End Trip?'),
        content: const Text('End this trip and return to Home?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('End Trip'),
          ),
        ],
      ),
    );
    if (!mounted) return;
    setState(() => _confirmingEndTrip = false);
    if (confirmed != true) return;

    // TODO: Call backend End Trip API here when endpoint is provided.
    setState(() => _tripActive = false);
    Navigator.popUntil(context, ModalRoute.withName('/home'));
  }

  Future<void> getCurrentLocation() async {
    setState(() {
      loadingLocation = true;
    });

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!mounted) return;

      if (!serviceEnabled) {
        setState(() {
          locationText = 'Location service is disabled';
        });
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (!mounted) return;

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (!mounted) return;
      }

      if (permission == LocationPermission.denied) {
        setState(() {
          locationText = 'Location permission denied';
        });
        return;
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() {
          locationText = 'Location permission permanently denied';
        });
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      if (!mounted || !_tripActive) return;

      // TODO: Send GPS location to backend / Socket.IO when event
      // specification is provided.

      setState(() {
        locationText =
            'Latitude: ${position.latitude}\n'
            'Longitude: ${position.longitude}';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        locationText = 'Failed to get location: $e';
      });
    } finally {
      if (mounted) {
        setState(() {
          loadingLocation = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Active Trip')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          children: [
            Text(
              'Trip Status: ${_tripActive ? 'Active' : 'Ended'}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),

            Card(
              child: ListTile(
                leading: const Icon(Icons.directions_bus),
                title: Text('Vehicle: ${widget.arguments.vehicle.name}'),
                subtitle: Text('Vehicle ID: ${widget.arguments.vehicle.id}'),
              ),
            ),

            Card(
              child: ListTile(
                leading: const Icon(Icons.alt_route),
                title: Text('Route: ${widget.arguments.route.name}'),
                subtitle: Text('Route ID: ${widget.arguments.route.id}'),
              ),
            ),

            Card(
              child: ListTile(
                leading: const Icon(Icons.location_on),
                title: const Text('GPS Location'),
                subtitle: Text(locationText),
              ),
            ),

            const SizedBox(height: 20),

            ElevatedButton.icon(
              onPressed: loadingLocation ? null : getCurrentLocation,
              icon: loadingLocation
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location),
              label: Text(
                loadingLocation ? 'Getting Location...' : 'Get GPS Location',
              ),
            ),

            const SizedBox(height: 32),

            ElevatedButton.icon(
              onPressed: _tripActive && !_confirmingEndTrip ? _endTrip : null,
              icon: const Icon(Icons.stop),
              label: const Text('End Trip'),
            ),
          ],
        ),
      ),
    );
  }
}
