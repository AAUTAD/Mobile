import 'dart:convert';
import 'package:aautad_app/constants/spacings.dart';
import 'package:aautad_app/models/news.dart';
import 'package:aautad_app/screens/news_page.dart';
import 'package:aautad_app/services/api_service.dart';
import 'package:aautad_app/utils/utils.dart';
import 'package:flutter/material.dart';

class NewsSection extends StatefulWidget {
  final String?
      filterType; // null = all, 'sports' = only sports, 'main' = only main
  const NewsSection({Key? key, this.filterType}) : super(key: key);
  @override
  NewsSectionState createState() => NewsSectionState();
}

// Changed to public state class so it can be referenced by key
class NewsSectionState extends State<NewsSection> {
  final ApiService apiService = ApiService();
  late Future<List<News>> futureNews;

  @override
  void initState() {
    super.initState();
    futureNews = fetchNews();
  }

  Future<List<News>> fetchNews() async {
    if (widget.filterType == 'main') {
      return apiService.fetchMainNews();
    } else if (widget.filterType == 'sports') {
      return apiService.fetchSportsNews();
    } else {
      // Get all news
      return apiService.fetchNews();
    }
  }

  // Method to refresh news data
  Future<void> refreshNews() async {
    setState(() {
      // Make sure to get fresh data
      futureNews = fetchNews();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: Spacings.horizontalPadding,
          child: Text(
            widget.filterType == 'sports' ? 'Notícias' : 'Notícias',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF464646),
            ),
          ),
        ),
        SizedBox(height: Spacings.VerticalSpacing),
        FutureBuilder<List<News>>(
          future: futureNews,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else if (snapshot.hasData && snapshot.data!.isNotEmpty) {
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
                            builder: (context) =>
                                NewsDetailsPage(article: news[index]),
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
                                item.imageUrl,
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.createdAt
                                            .toLocal()
                                            .toString()
                                            .split(' ')[0],
                                        style: TextStyle(
                                            color: Colors.white70,
                                            fontSize: 14.0,
                                            fontWeight: FontWeight.w600),
                                      ),
                                      SizedBox(height: 4.0),
                                      Text(
                                        fixEncoding(item.title),
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 18.0,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
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
        ),
      ],
    );
  }
}
