// lib/services/api_service.dart
import 'dart:convert';
import 'package:aautad_app/models/news.dart';
import 'package:http/http.dart' as http;
import '../models/partner.dart';

class ApiService {
  final String baseUrl = "http://localhost:3000/api";

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
