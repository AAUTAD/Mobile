import 'package:aautad_app/utils/utils.dart';
import 'package:flutter/material.dart';
import 'package:aautad_app/models/sport_info.dart';
import 'package:aautad_app/services/api_service.dart';

class SportDetailsPage extends StatefulWidget {
  @override
  _SportDetailsPageState createState() => _SportDetailsPageState();
}

class _SportDetailsPageState extends State<SportDetailsPage> {
  late Future<List<SportInfo>> _sportsFuture;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _sportsFuture = _apiService.fetchSports();
  }

  Future<void> _refreshSports() async {
    final newFuture = _apiService.fetchSports();
    setState(() {
      _sportsFuture = newFuture;
    });
    await newFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Informações das Modalidades'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshSports,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: FutureBuilder<List<SportInfo>>(
            future: _sportsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(
                    child: Text(
                        'Erro ao carregar modalidades: ${snapshot.error}'));
              } else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
                final sports = snapshot.data!;
                return ListView.builder(
                  itemCount: sports.length,
                  itemBuilder: (context, index) {
                    final sport = sports[index];
                    return Card(
                      elevation: 3,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      margin: const EdgeInsets.only(bottom: 16.0),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (sport.imageUrl != null &&
                                sport.imageUrl!.isNotEmpty)
                              ClipRRect(
                                borderRadius: BorderRadius.circular(8.0),
                                child: Image.network(
                                  sport.imageUrl!,
                                  height: 180,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            if (sport.imageUrl != null &&
                                sport.imageUrl!.isNotEmpty)
                              SizedBox(height: 12),
                            Text(
                              sport.name,
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 10),
                            if (sport.location != null &&
                                sport.location!.isNotEmpty)
                              _buildInfoRow(context, Icons.location_on,
                                  'Local:', sport.location!),
                            _buildInfoRow(
                              context,
                              Icons.people,
                              'Responsáveis:',
                              (sport.persons != null &&
                                      sport.persons!.isNotEmpty)
                                  ? sport.persons!
                                      .map((p) => fixEncoding(p.name))
                                      .join(', ')
                                  : 'N/A',
                            ),
                            if (sport.details != null &&
                                sport.details!.isNotEmpty)
                              _buildInfoRow(context, Icons.info_outline,
                                  'Detalhes:', fixEncoding(sport.details!)),
                            if (sport.link != null && sport.link!.isNotEmpty)
                              _buildInfoRow(
                                  context, Icons.link, 'Link:', sport.link!),
                          ],
                        ),
                      ),
                    );
                  },
                );
              }
              return Center(
                  child: Text('Nenhuma modalidade desportiva encontrada.'));
            },
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(
      BuildContext context, IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: Theme.of(context).colorScheme.primary),
          SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: Theme.of(context).textTheme.bodyMedium,
                children: [
                  TextSpan(
                      text: '$label ',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  TextSpan(text: value),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
