import 'package:flutter/material.dart';
import 'package:aautad_app/screens/news_section.dart';
import 'package:aautad_app/screens/sport_details_page.dart';

class SportsScreen extends StatefulWidget {
  @override
  _SportsScreenState createState() => _SportsScreenState();
}

class _SportsScreenState extends State<SportsScreen> {
  final GlobalKey<NewsSectionState> _newsSectionKey =
      GlobalKey<NewsSectionState>();

  Future<void> _refreshData() async {
    // Explicitly tell the NewsSection to refresh its data
    await _newsSectionKey.currentState?.refreshNews();
    return Future.value();
  }

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
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: NewsSection(key: _newsSectionKey, filterType: 'sports'),
          ),
        ),
      ),
    );
  }
}
