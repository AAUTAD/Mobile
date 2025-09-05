import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:intl/intl.dart';
import 'package:map_launcher/map_launcher.dart';
import '../models/event_model.dart';

class EventDetailScreen extends StatefulWidget {
  final EventModel event;

  const EventDetailScreen({Key? key, required this.event}) : super(key: key);

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  String _formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy - HH:mm').format(date);
  }

  Future<void> _openMap() async {
    try {
      final availableMaps = await MapLauncher.installedMaps;

      if (availableMaps.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Nenhuma aplicação de mapas disponível')),
        );
        return;
      }

      await showModalBottomSheet(
        context: context,
        builder: (BuildContext context) {
          return SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                ListTile(
                  title: Text(
                    'Abrir localização em',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Divider(),
                ...availableMaps.map(
                  (map) => ListTile(
                    onTap: () {
                      map.showMarker(
                        coords: Coords(41.290100,
                            -7.735000), // Default UTAD coordinates, you can adjust based on the location
                        title: widget.event.location,
                        description: widget.event.title,
                      );
                      Navigator.pop(context);
                    },
                    title: Text(map.mapName),
                    leading: Image.asset(
                      map.icon,
                      width: 30,
                      height: 30,
                      package: 'map_launcher',
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao abrir mapas: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250.0,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Image.network(
                widget.event.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey[300],
                    child: Icon(
                      Icons.image_not_supported,
                      size: 50,
                      color: Colors.grey[600],
                    ),
                  );
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.event.title,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 16),
                  Card(
                    elevation: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              Icon(Icons.location_on, color: Colors.redAccent),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  widget.event.location,
                                  style: TextStyle(
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                              // TextButton(
                              //   onPressed: _openMap,
                              //   child: Text(
                              //     'VER NO MAPA',
                              //     style: TextStyle(
                              //       color: Color(0xFFE91E63),
                              //       fontWeight: FontWeight.bold,
                              //     ),
                              //   ),
                              // ),
                            ],
                          ),
                          Divider(),
                          Row(
                            children: [
                              Icon(Icons.calendar_today,
                                  color: Colors.blueGrey),
                              SizedBox(width: 8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Início: ${_formatDate(widget.event.startDate)}',
                                    style: TextStyle(fontSize: 16),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    'Fim: ${_formatDate(widget.event.endDate)}',
                                    style: TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 24),
                  Text(
                    'Descrição',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Html(
                    data: widget.event.description,
                    style: {
                      'body': Style(
                        fontSize: FontSize(16),
                      ),
                      'br': Style(
                        height: Height(0), // Reduce the height of <br> elements
                      ),
                    },
                  ),
                  SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
