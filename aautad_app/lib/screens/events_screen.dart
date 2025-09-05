import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import '../models/event_model.dart';
import '../services/event_service.dart';
import '../providers/theme_provider.dart';
import 'event_detail_screen.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({Key? key}) : super(key: key);

  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  final EventService _eventService = EventService();
  late Future<List<EventModel>> _eventsFuture;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  bool _showCalendar = false;

  @override
  void initState() {
    super.initState();
    _eventsFuture = _eventService.getEvents();
    _selectedDay = DateTime.now();
  }

  // Function to get events for a specific day
  List<EventModel> _getEventsForDay(DateTime day, List<EventModel> allEvents) {
    return allEvents.where((event) {
      final eventStart = DateTime(
          event.startDate.year, event.startDate.month, event.startDate.day);
      final eventEnd =
          DateTime(event.endDate.year, event.endDate.month, event.endDate.day);
      final targetDay = DateTime(day.year, day.month, day.day);

      return (targetDay.isAtSameMomentAs(eventStart) ||
          targetDay.isAtSameMomentAs(eventEnd) ||
          (targetDay.isAfter(eventStart) && targetDay.isBefore(eventEnd)));
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Eventos',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Stack(
            children: [
              Icon(
                Icons.calendar_month,
                color: _showCalendar
                    ? Color(0xFFE91E63)
                    : Theme.of(context).iconTheme.color,
              ),
              // Show small indicator when filtering by date
              if (_selectedDay != null &&
                  !isSameDay(_selectedDay, DateTime.now()))
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
          onPressed: () {
            setState(() {
              _showCalendar = !_showCalendar;
            });
          },
          tooltip: _showCalendar ? 'Fechar calendário' : 'Abrir calendário',
        ),
        actions: [
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return IconButton(
                icon: Icon(
                  themeProvider.isDarkMode ? Icons.light_mode : Icons.dark_mode,
                  color: Theme.of(context).iconTheme.color,
                ),
                onPressed: () {
                  themeProvider.toggleTheme();
                },
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _eventsFuture = _eventService.getEvents();
          });
        },
        child: FutureBuilder<List<EventModel>>(
          future: _eventsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 60, color: Colors.red),
                    SizedBox(height: 16),
                    Text('Erro ao carregar eventos',
                        style: TextStyle(fontSize: 18)),
                    SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _eventsFuture = _eventService.getEvents();
                        });
                      },
                      child: Text('Tentar novamente'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        foregroundColor:
                            Theme.of(context).colorScheme.onPrimary,
                      ),
                    ),
                  ],
                ),
              );
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return Center(child: Text('Sem eventos disponíveis'));
            }

            final allEvents = snapshot.data!;
            final now = DateTime.now();

            // Get events for selected day if a day is selected
            final selectedDayEvents = _selectedDay != null
                ? _getEventsForDay(_selectedDay!, allEvents)
                : <EventModel>[];

            // If a specific day is selected, show only events for that day
            final eventsToShow =
                _selectedDay != null && !isSameDay(_selectedDay, DateTime.now())
                    ? selectedDayEvents
                    : allEvents;

            final upcomingEvents = eventsToShow
                .where((event) =>
                    event.startDate.isAfter(now) || event.endDate.isAfter(now))
                .toList();

            final pastEvents = eventsToShow
                .where((event) => event.endDate.isBefore(now))
                .toList();

            return ListView(
              padding: EdgeInsets.fromLTRB(16, 16, 16, 136),
              children: [
                // Calendar Widget (Dropdown)
                if (_showCalendar)
                  AnimatedContainer(
                    duration: Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                    child: Card(
                      elevation: 3,
                      margin: EdgeInsets.only(bottom: 24),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Calendário de Eventos',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context)
                                        .textTheme
                                        .titleLarge
                                        ?.color,
                                  ),
                                ),
                                IconButton(
                                  icon: Icon(Icons.close, size: 20),
                                  onPressed: () {
                                    setState(() {
                                      _showCalendar = false;
                                    });
                                  },
                                  tooltip: 'Fechar calendário',
                                ),
                              ],
                            ),
                            SizedBox(height: 12),
                            TableCalendar<EventModel>(
                              firstDay: DateTime.utc(2020, 1, 1),
                              lastDay: DateTime.utc(2030, 12, 31),
                              focusedDay: _focusedDay,
                              selectedDayPredicate: (day) {
                                return isSameDay(_selectedDay, day);
                              },
                              eventLoader: (day) =>
                                  _getEventsForDay(day, allEvents),
                              calendarFormat: CalendarFormat.month,
                              headerStyle: HeaderStyle(
                                formatButtonVisible: false,
                                titleCentered: true,
                                titleTextStyle: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              calendarStyle: CalendarStyle(
                                outsideDaysVisible: false,
                                weekendTextStyle:
                                    TextStyle(color: Colors.red[400]),
                                holidayTextStyle:
                                    TextStyle(color: Colors.red[400]),
                                selectedDecoration: BoxDecoration(
                                  color: Color(0xFFE91E63),
                                  shape: BoxShape.circle,
                                ),
                                todayDecoration: BoxDecoration(
                                  color: Color(0xFFE91E63).withOpacity(0.5),
                                  shape: BoxShape.circle,
                                ),
                                markerDecoration: BoxDecoration(
                                  color: Colors.blue,
                                  shape: BoxShape.circle,
                                ),
                                markersMaxCount: 1,
                                markerSize: 4.0,
                                markerMargin:
                                    EdgeInsets.symmetric(horizontal: 1.0),
                              ),
                              onDaySelected: (selectedDay, focusedDay) {
                                setState(() {
                                  _selectedDay = selectedDay;
                                  _focusedDay = focusedDay;
                                });
                              },
                              onPageChanged: (focusedDay) {
                                _focusedDay = focusedDay;
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                // Show selected date info and clear filter option
                if (_selectedDay != null &&
                    !isSameDay(_selectedDay, DateTime.now())) ...[
                  Card(
                    elevation: 1,
                    margin: EdgeInsets.only(bottom: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(Icons.filter_list, color: Color(0xFFE91E63)),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Eventos para ${DateFormat('dd/MM/yyyy').format(_selectedDay!)}',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _selectedDay = DateTime.now();
                              });
                            },
                            child: Text(
                              'Ver todos',
                              style: TextStyle(
                                color: Color(0xFFE91E63),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                // Show message if no events on selected date
                if (_selectedDay != null &&
                    !isSameDay(_selectedDay, DateTime.now()) &&
                    selectedDayEvents.isEmpty) ...[
                  Card(
                    elevation: 1,
                    margin: EdgeInsets.only(bottom: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Icon(
                            Icons.event_busy,
                            size: 48,
                            color: Colors.grey[400],
                          ),
                          SizedBox(height: 12),
                          Text(
                            'Nenhum evento nesta data',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Selecione outra data ou veja todos os eventos',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[500],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
                if (upcomingEvents.isNotEmpty) ...[
                  SectionHeader(
                    icon: Icons.event_available,
                    title: _selectedDay != null &&
                            !isSameDay(_selectedDay, DateTime.now())
                        ? 'Eventos da Data Selecionada'
                        : 'Próximos Eventos',
                    color: Color(0xFFE91E63),
                  ),
                  ...upcomingEvents
                      .map((event) => EventCard(event: event, isPast: false)),
                ],
                if (pastEvents.isNotEmpty) ...[
                  SectionHeader(
                    icon: Icons.history,
                    title: _selectedDay != null &&
                            !isSameDay(_selectedDay, DateTime.now())
                        ? 'Eventos Passados da Data'
                        : 'Eventos Passados',
                    color: Colors.grey[600]!,
                  ),
                  ...pastEvents
                      .map((event) => EventCard(event: event, isPast: true)),
                ],
              ],
            );
          },
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;

  const SectionHeader({
    super.key,
    required this.icon,
    required this.title,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          SizedBox(width: 8),
          Text(
            title,
            style: TextStyle(
                fontSize: 18, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}

class EventCard extends StatelessWidget {
  final EventModel event;
  final bool isPast;

  const EventCard({Key? key, required this.event, this.isPast = false})
      : super(key: key);

  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy - HH:mm').format(date);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 3,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) => EventDetailScreen(event: event)),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                  child: Image.network(
                    event.imageUrl,
                    width: double.infinity,
                    height: 180,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 180,
                        width: double.infinity,
                        color: Theme.of(context).colorScheme.surfaceVariant,
                        child: Icon(
                          Icons.image_not_supported,
                          size: 50,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      );
                    },
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        height: 180,
                        width: double.infinity,
                        color: Theme.of(context).colorScheme.surfaceVariant,
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                          ),
                        ),
                      );
                    },
                  ),
                ),
                if (isPast)
                  Container(
                    height: 180,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.3),
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          event.title,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: isPast
                                ? Theme.of(context).disabledColor
                                : Theme.of(context).textTheme.bodyLarge?.color,
                          ),
                        ),
                      ),
                      if (isPast)
                        Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Finalizado',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          size: 16, color: Theme.of(context).iconTheme.color),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          event.location,
                          style: TextStyle(
                              color: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.color),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.calendar_today,
                          size: 16, color: Theme.of(context).iconTheme.color),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          _formatDate(event.startDate),
                          style: TextStyle(
                              color: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.color),
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    EventDetailScreen(event: event)),
                          );
                        },
                        child: Text(
                          'Ver mais',
                          style: TextStyle(
                            color: isPast
                                ? Theme.of(context).disabledColor
                                : Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
