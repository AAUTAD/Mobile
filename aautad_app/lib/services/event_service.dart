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
      // Fetch both upcoming and past events concurrently
      final futures = await Future.wait([
        http.get(Uri.parse('$_baseUrl/eventos')),      // upcoming events
        http.get(Uri.parse('$_baseUrl/eventos/past')), // past events
      ]);


      final upcomingResponse = futures[0];
      final pastResponse = futures[1];

      List<EventModel> allEvents = [];

      // Process upcoming events
      if (upcomingResponse.statusCode == 200) {
        final List<dynamic> upcomingJson = json.decode(upcomingResponse.body);
        allEvents.addAll(
          upcomingJson.map((json) => EventModel.fromJson(json)).toList(),
        );
      }

      // Process past events
      if (pastResponse.statusCode == 200) {
        final List<dynamic> pastJson = json.decode(pastResponse.body);
        allEvents.addAll(
          pastJson.map((json) => EventModel.fromJson(json)).toList(),
        );
      }

      // Sort all events: upcoming first (by start date), then past (by end date desc)
      final now = DateTime.now();
      final upcomingEvents = allEvents.where((event) => 
        event.startDate.isAfter(now) || event.endDate.isAfter(now)
      ).toList();
      final pastEvents = allEvents.where((event) => 
        event.endDate.isBefore(now)
      ).toList();

      // Sort upcoming by start date (ascending)
      upcomingEvents.sort((a, b) => a.startDate.compareTo(b.startDate));
      
      // Sort past by end date (descending - most recent first)
      pastEvents.sort((a, b) => b.endDate.compareTo(a.endDate));

      // Combine: upcoming first, then past
      _cachedEvents = [...upcomingEvents, ...pastEvents];
      _lastFetched = DateTime.now();
      
      return _cachedEvents!;
    } catch (e) {
      // If any error occurs but we have cached data, return it
      if (_cachedEvents != null) {
        return _cachedEvents!;
      }
      throw Exception('Failed to load events: $e');
    }
  }
}
