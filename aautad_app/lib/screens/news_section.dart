import 'dart:convert';
import 'package:aautad_app/constants/spacings.dart';
import 'package:aautad_app/models/news.dart';
import 'package:aautad_app/screens/news_page.dart';
import 'package:aautad_app/services/api_service.dart';
import 'package:aautad_app/utils/utils.dart';
import 'package:flutter/material.dart';

class NewsSection extends StatefulWidget {
  final String? filterType; // null = all, 'sport' = only sport, 'not_sport' = all except sport
  const NewsSection({Key? key, this.filterType}) : super(key: key);
  @override
  _NewsSectionState createState() => _NewsSectionState();
}

class _NewsSectionState extends State<NewsSection> {
  final ApiService apiService = ApiService();
  late Future<List<News>> futureNews;

  @override
  void initState() {
    super.initState();
    futureNews = fetchNews();
  }

  Future<List<News>> fetchNews() async {
    final allNews = await apiService.fetchNews();
    if (widget.filterType == null) return allNews;
    if (widget.filterType == 'sport') {
      return allNews.where((n) => n.type == 'sport').toList();
    } else if (widget.filterType == 'not_sport') {
      return allNews.where((n) => n.type != 'sport').toList();
    }
    return allNews;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<News>>(
      future: futureNews,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else if (snapshot.hasData) {
          final news = snapshot.data!;
          return SizedBox(
            height: 250.0,
            child: PageView.builder(
              controller: PageController(viewportFraction: 0.9),
              itemCount: news.length,
              physics: PageScrollPhysics(),
              itemBuilder: (context, index) {
                final item = news[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => NewsDetailsPage(article: news[index]),
                      ),
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16.0),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(
                            item.imageUrl ?? '',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Icon(Icons.broken_image, size: 50),
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.black.withOpacity(0.6),
                                  Colors.transparent,
                                ],
                                begin: Alignment(0.0, 1.0),
                                end: Alignment(0.0, 0.3),
                              ),
                            ),
                          ),
                          Align(
                            alignment: Alignment.bottomLeft,
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    (item.createdAt as DateTime?)?.toLocal().toString().split(' ')[0] ?? '',
                                    style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 14.0,
                                        fontWeight: FontWeight.w600),
                                  ),
                                  SizedBox(height: 4.0),
                                  Text(
                                    fixEncoding(item.title ?? ''),
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18.0,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  // Removed type display
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }
        return Center(child: Text('No News Available'));
      },
    );
  }
}
