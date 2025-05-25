import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/event_model.dart';

class EventService {
  final String _baseUrl = 'http://mobile.aautad.pt/api';

  // Singleton pattern
  static final EventService _instance = EventService._internal();
  factory EventService() => _instance;
  EventService._internal();

  // Cache for events
  List<EventModel>? _cachedEvents;
  DateTime? _lastFetched;

  // Cache timeout (10 minutes)
  static const cacheValidityDuration = Duration(minutes: 10);

  Future<List<EventModel>> getEvents({bool forceRefresh = false}) async {
    // Return cached data if it's still valid and not forcing refresh
    if (!forceRefresh && _cachedEvents != null && _lastFetched != null) {
      final difference = DateTime.now().difference(_lastFetched!);
      if (difference < cacheValidityDuration) {
        return _cachedEvents!;
      }
    }

    try {
      final response = await http.get(Uri.parse('$_baseUrl/eventos'));

      if (response.statusCode == 200) {
        final List<dynamic> eventsJson = json.decode(response.body);
        _cachedEvents =
            eventsJson.map((json) => EventModel.fromJson(json)).toList();
        _lastFetched = DateTime.now();
        return _cachedEvents!;
      } else {
        // If request fails but we have cached data, return it
        if (_cachedEvents != null) {
          return _cachedEvents!;
        }
        throw Exception('Failed to load events: ${response.statusCode}');
      }
    } catch (e) {
      // If any error occurs but we have cached data, return it
      if (_cachedEvents != null) {
        return _cachedEvents!;
      }
      throw Exception('Failed to load events: $e');
    }
  }
}
