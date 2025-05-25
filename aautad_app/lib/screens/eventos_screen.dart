import 'package:flutter/material.dart';

class EventosScreen extends StatelessWidget {
  final List<Map<String, dynamic>> events = [
    {
      "id": "cm914cfyn000610ioptvunlqu",
      "title": "teste imagem",
      "description": "imagem top",
      "location": "Pedrinhas",
      "startDate": "2025-04-09T07:53:00.000Z",
      "endDate": "2025-04-16T07:53:00.000Z",
      "imageUrl":
          "https://mobile-backoffice-local-paris.s3.eu-west-3.amazonaws.com/c6b0dd973cbee5cfc1d79b69a87c40fad2ce83630896456a7fdf1acb5225db85",
    },
    // Add more events here
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Eventos'),
        backgroundColor: Theme.of(context).appBarTheme.backgroundColor,
      ),
      body: ListView.builder(
        itemCount: events.length,
        itemBuilder: (context, index) {
          final event = events[index];
          return Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Event Image
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    event['imageUrl'],
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                  ),
                ),
                SizedBox(width: 16),
                // Event Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event['title'],
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        "${DateTime.parse(event['startDate']).toLocal().toString().split(' ')[0]} - ${DateTime.parse(event['endDate']).toLocal().toString().split(' ')[0]}",
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        event['location'],
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      backgroundColor: Colors.white,
    );
  }
}
