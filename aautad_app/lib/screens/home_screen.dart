import 'package:aautad_app/screens/categories.dart';
import 'package:aautad_app/screens/featured_section.dart';
import 'package:aautad_app/screens/header_section.dart';
import 'package:aautad_app/screens/news_section.dart';
import 'package:aautad_app/screens/partners_section.dart';
import 'package:aautad_app/services/uuid_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // for styling
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../services/api_service.dart';
import '../models/partner.dart';

final FlutterSecureStorage secureStorage = FlutterSecureStorage();

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService apiService = ApiService();
  late Future<List<Partner>> futurePartners;
  List<Partner> allPartners = [];
  List<Partner> filteredPartners = [];
  String selectedCategory = '';

  @override
  void initState() {
    super.initState();
    futurePartners = apiService.fetchPartners();
    futurePartners.then((partners) {
      setState(() {
        allPartners = partners;
        filteredPartners = partners;
      });
    });
  }

  void filterPartnersByCategory(String category) {
    setState(() {
      if (selectedCategory == category) {
        selectedCategory = '';
        filteredPartners = allPartners;
        return;
      } else {
        selectedCategory = category;
        filteredPartners = allPartners
            .where((partner) => partner.tags.contains(category))
            .toList();
      }
    });
  }

  Future<bool> _hasToken() async {
    String? token = await secureStorage.read(key: 'jwt_token');
    return token != null && token.isNotEmpty;
  }

  Future<void> _refreshData() async {
    final partners = await apiService.fetchPartners();
    setState(() {
      allPartners = partners;
      filteredPartners = partners;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF7F7F7),
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: FutureBuilder<List<Partner>>(
          future: futurePartners,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else if (snapshot.hasData) {
              return SingleChildScrollView(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Section
                      HeaderSection(),
                      NewsSection(filterType: 'main'),
                      SizedBox(height: 20),

                      // Featured Offer Card
                      FeaturedSection(),
                      SizedBox(height: 20),

                      // Categories Section
                      CategoriesSection(
                        onCategorySelected: filterPartnersByCategory,
                        selectedCategory: selectedCategory,
                      ),
                      SizedBox(height: 20),

                      // Partners Section
                      PartnersSection(partners: filteredPartners),

                      SizedBox(height: 20),
                    ],
                  ),
                ),
              );
            }
            return Center(child: Text('No Data'));
          },
        ),
      ),
    );
  }
}
