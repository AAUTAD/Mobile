import 'package:flutter/material.dart';
import 'package:aautad_app/screens/news_section.dart';
import 'package:aautad_app/screens/sport_details_page.dart';

class SportsScreen extends StatefulWidget {
  @override
  _SportsScreenState createState() => _SportsScreenState();
}

class _SportsScreenState extends State<SportsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Desporto'),
            IconButton(
              icon: Icon(Icons.info_outline),
              tooltip: 'Informações das modalidades',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => SportDetailsPage(),
                  ),
                );
              },
            ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: NewsSection(filterType: 'sport'),
      ),
    );
  }
}
