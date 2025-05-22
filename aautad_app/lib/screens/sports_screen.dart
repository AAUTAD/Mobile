import 'package:flutter/material.dart';
import 'package:aautad_app/screens/news_section.dart';
import 'package:aautad_app/screens/sport_details_page.dart';
import 'package:aautad_app/screens/athlete_registration_page.dart';

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
        title: Text('Desporto'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                NewsSection(key: _newsSectionKey, filterType: 'sports'),
                SizedBox(height: 20),

                // --- First Button ---
                Tooltip(
                  message: 'Informações das modalidades',
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => SportDetailsPage(),
                        ),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      height: 110,
                      decoration: BoxDecoration(
                        image: DecorationImage(
                          image: AssetImage('lib/assets/images/image.png'),
                          fit: BoxFit.cover,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Align(
                        alignment: Alignment.bottomLeft,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            'Informações',
                            style: TextStyle(
                              fontSize: 20,
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 20), // Add spacing between the two buttons

                // --- Second Button (Duplicate of the first) ---
                Tooltip(
                  message:
                      'Inscrição de Atleta', // Changed tooltip message
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              AthleteRegistrationPage(), // Navigate to AthleteRegistrationPage
                        ),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      height: 110,
                      decoration: BoxDecoration(
                        image: DecorationImage(
                          image: AssetImage(
                              'lib/assets/images/image.png'), // Same background image
                          fit: BoxFit.cover,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Align(
                        alignment: Alignment.bottomLeft,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            'Quero me tornar Atleta!', // Changed button text
                            style: TextStyle(
                              fontSize: 20,
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
