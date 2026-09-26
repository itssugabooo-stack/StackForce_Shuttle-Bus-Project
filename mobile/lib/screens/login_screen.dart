import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tram Tracking')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Vehicle Login',
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 30),

            const TextField(
              decoration: InputDecoration(
                labelText: 'Vehicle ID',
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 16),

            const TextField(
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Authenticate the vehicle with the backend when the
                  // authentication specification is provided, before navigating.
                  Navigator.pushReplacementNamed(context, '/home');
                },
                child: Text('Login'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
