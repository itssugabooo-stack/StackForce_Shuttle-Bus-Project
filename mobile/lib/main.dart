import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const TramTrackingApp());
}

class TramTrackingApp extends StatelessWidget {
  const TramTrackingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Tram Tracking',
      home: const HomeScreen(),
    );
  }
}