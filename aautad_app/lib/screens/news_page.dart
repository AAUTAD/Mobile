import 'dart:convert';

import 'package:aautad_app/models/news.dart';
import 'package:aautad_app/utils/utils.dart';
import 'package:flutter/material.dart';

class NewsDetailsPage extends StatelessWidget {
  final News article;

  const NewsDetailsPage({Key? key, required this.article}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon:
              Icon(Icons.arrow_back, color: Theme.of(context).iconTheme.color),
          onPressed: () =>
              Navigator.pop(context), // Go back to the previous screen
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Image
            Stack(
              children: [
                Image.network(
                  article.imageUrl,
                  width: double.infinity,
                  height: 250,
                  fit: BoxFit.cover,
                ),
              ],
            ),

            // News Content
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category & Date
                  SizedBox(height: 4),
                  Text(
                    "${article.createdAt.day.toString().padLeft(2, '0')}-${article.createdAt.month.toString().padLeft(2, '0')}-${article.createdAt.year}",
                    style: TextStyle(
                        color: Theme.of(context)
                            .textTheme
                            .bodyMedium!
                            .color!
                            .withOpacity(0.7),
                        fontSize: 14),
                  ),

                  SizedBox(height: 8),

                  // Title
                  Text(
                    article.title,
                    style: TextStyle(
                      color: Theme.of(context).textTheme.titleLarge!.color,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: 12),

                  // Full Content
                  Text(
                    article.content,
                    style: TextStyle(
                        color: Theme.of(context).textTheme.bodyLarge!.color,
                        fontSize: 16),
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
