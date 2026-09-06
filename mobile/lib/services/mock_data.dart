import '../models/vehicle.dart';
import '../models/route.dart';
import '../models/stop.dart';
import '../models/route_stop.dart';

class MockData {
  static final List<Vehicle> vehicles = [
    Vehicle(
      id: 1,
      name: 'Tram 01',
      status: 'Active',
    ),
    Vehicle(
      id: 2,
      name: 'Tram 02',
      status: 'Inactive',
    ),
  ];

  static final List<TramRoute> routes = [
    TramRoute(
      id: 1,
      name: 'Route A',
      startStop: 'Main Gate',
      endStop: 'Building 11',
    ),
    TramRoute(
      id: 2,
      name: 'Route B',
      startStop: 'Building 11',
      endStop: 'Library',
    ),
  ];

  static final List<TramStop> stops = [
    TramStop(
      id: 1,
      name: 'Main Gate',
      latitude: 13.9640,
      longitude: 100.5860,
    ),
    TramStop(
      id: 2,
      name: 'Building 11',
      latitude: 13.9650,
      longitude: 100.5870,
    ),
    TramStop(
      id: 3,
      name: 'Library',
      latitude: 13.9660,
      longitude: 100.5880,
    ),
  ];

  static final List<RouteStop> routeStops = [
    RouteStop(
      id: 1,
      routeId: 1,
      stopId: 1,
      stopOrder: 1,
    ),
    RouteStop(
      id: 2,
      routeId: 1,
      stopId: 2,
      stopOrder: 2,
    ),
  ];
}