import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/shuttle_ui.dart';

import '../utils/error_message.dart';

import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final sourceIdController = TextEditingController();
  final secretController = TextEditingController();

  bool isLoading = false;
  String? errorMessage;

  Future<void> login() async {
    final sourceId = sourceIdController.text.trim();
    final secret = secretController.text.trim();

    if (sourceId.isEmpty || secret.isEmpty) {
      setState(() {
        errorMessage = 'Please enter Source ID and Secret';
      });
      return;
    }

    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      await AuthService.login(sourceId: sourceId, secret: secret);

      if (!mounted) return;

      Navigator.pushReplacementNamed(context, '/home');
    } catch (e) {
      if (!mounted) return;

      setState(() {
        errorMessage = userFacingError(e);
      });
    } finally {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    sourceIdController.dispose();
    secretController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ShuttlePage(
        children: [
          const SizedBox(height: 24),
          const Row(
            children: [
              IconBadge(Icons.directions_bus_rounded),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'STACKFORCE',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      color: ShuttleTheme.navy,
                    ),
                  ),
                  Text(
                    'RANGSIT UNIVERSITY',
                    style: TextStyle(
                      fontSize: 10,
                      letterSpacing: 1.5,
                      color: ShuttleTheme.muted,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [ShuttleTheme.blue, Color(0xFF103BA4)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(28),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.route_rounded, color: Color(0xFFADCAFF)),
                    SizedBox(width: 8),
                    Text(
                      'CAMPUS SHUTTLE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  'Every journey,\nconnected.',
                  style: Theme.of(
                    context,
                  ).textTheme.headlineLarge?.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Your route. Your campus.\nA smoother ride for everyone.',
                  style: TextStyle(color: Color(0xFFDAE6FF), height: 1.6),
                ),
                const SizedBox(height: 24),
                const Row(
                  children: [
                    Icon(
                      Icons.radio_button_checked,
                      color: Colors.white,
                      size: 16,
                    ),
                    Expanded(
                      child: Divider(
                        color: Color(0xFF7197EE),
                        indent: 10,
                        endIndent: 10,
                      ),
                    ),
                    Icon(
                      Icons.directions_bus_rounded,
                      color: Colors.white,
                      size: 34,
                    ),
                    Expanded(
                      child: Divider(
                        color: Color(0xFF7197EE),
                        indent: 10,
                        endIndent: 10,
                      ),
                    ),
                    Icon(
                      Icons.location_on_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Welcome aboard',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 6),
                  const Text('Sign in to your vehicle to begin a trip.'),
                  const SizedBox(height: 24),
                  TextField(
                    controller: sourceIdController,
                    autocorrect: false,
                    enableSuggestions: false,
                    textCapitalization: TextCapitalization.none,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Source ID',
                      hintText: 'TS01',
                      prefixIcon: Icon(Icons.directions_bus_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: secretController,
                    obscureText: true,
                    autocorrect: false,
                    enableSuggestions: false,
                    textCapitalization: TextCapitalization.none,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => isLoading ? null : login(),
                    decoration: const InputDecoration(
                      labelText: 'Secret',
                      prefixIcon: Icon(Icons.lock_outline_rounded),
                    ),
                  ),
                  if (errorMessage != null)
                    Notice(errorMessage!, isError: true),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: isLoading ? null : login,
                    icon: const Icon(Icons.arrow_forward_rounded),
                    label: Text(isLoading ? 'Logging in...' : 'Login'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'STACKFORCE  /  DRIVER APPLICATION',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 10,
              letterSpacing: 1.6,
              color: ShuttleTheme.muted,
            ),
          ),
        ],
      ),
    );
  }
}
