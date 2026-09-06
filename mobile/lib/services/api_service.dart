import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Replace this later with your team's backend URL
  static const String baseUrl = 'http://10.0.2.2:3000';

  static Future<List<dynamic>> getRoutes() async {
    final response = await http.get(
      Uri.parse('$baseUrl/routes'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load routes');
    }
  }
}