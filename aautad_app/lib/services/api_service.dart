// lib/services/api_service.dart
import 'dart:convert';
import 'dart:io';
import 'package:aautad_app/models/news.dart';
import 'package:http/http.dart' as http;
import '../models/partner.dart';
import '../models/sport_info.dart';

String getBaseUrl() {
  if (Platform.isAndroid) {
    // Option 1: Android Emulator (10.0.2.2 is the special IP that Android emulator
    // uses to communicate with the host machine)
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.isIOS) {
    // For iOS simulator
    return 'http://localhost:3000/api';
  } else {
    // For web or other platforms
    return 'http://localhost:3000/api';
  }

  // Uncomment and use one of these alternatives if needed:

  // Option 2: Physical device on same network (replace with your actual IP)
  // return 'http://192.168.1.96:3000/api';

  // Option 3: Using ngrok for remote testing (replace with your actual ngrok URL)
  // return 'https://your-ngrok-url.ngrok.io/api';
}

class ApiService {
  final String baseUrl = getBaseUrl();

  Future<List<Partner>> fetchPartners() async {
    final response = await http.get(Uri.parse('$baseUrl/parceiros/'));

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => Partner.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load partner data');
    }
  }

  Future<List<News>> fetchNews() async {
    final response = await http.get(Uri.parse('$baseUrl/noticias/'));

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => News.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load news data');
    }
  }

  Future<List<SportInfo>> fetchSports() async {
    final response = await http.get(Uri.parse('$baseUrl/desporto/'));

    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => SportInfo.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load sports data');
    }
  }

  // Send email and uuid to the API
  Future<void> sendEmail(String email, String uuid) async {
    await http.post(
      Uri.parse('$baseUrl/membros'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'email': email,
        'verification_token': uuid,
      }),
    );
  }
}
