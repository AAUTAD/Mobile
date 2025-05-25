import 'package:aautad_app/screens/categories.dart';
import 'package:aautad_app/screens/featured_section.dart';
import 'package:aautad_app/screens/header_section.dart';
import 'package:aautad_app/screens/news_section.dart';
import 'package:aautad_app/screens/partners_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // for styling
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
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

  // Key to control the news section
  final GlobalKey<NewsSectionState> _newsSectionKey =
      GlobalKey<NewsSectionState>();

  // Scroll controller to detect scroll position
  final ScrollController _scrollController = ScrollController();
  double _scrollOpacity = 0.0; // Use a double for gradual opacity change
  final double _maxScrollForFullOpacity =
      20.0; // Scroll distance for max opacity

  @override
  void initState() {
    super.initState();

    // Initialize future for partners
    futurePartners = apiService.fetchPartners();
    futurePartners.then((partners) {
      setState(() {
        allPartners = partners;
        filteredPartners = partners;
      });
    });

    // Add listener to scroll controller
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    // Calculate opacity based on scroll position as a percentage
    double newOpacity =
        (_scrollController.offset / _maxScrollForFullOpacity).clamp(0.0, 1.0);

    // Only update state if opacity changed significantly (to avoid excessive rebuilds)
    if ((newOpacity - _scrollOpacity).abs() > 0.01) {
      setState(() {
        _scrollOpacity = newOpacity;
      });
    }
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

  // Removed unused _hasToken method

  Future<void> _refreshData() async {
    // Refresh news directly through the key
    if (_newsSectionKey.currentState != null) {
      await _newsSectionKey.currentState!.refreshNews();
    }

    // Also refresh sports data
    await apiService.fetchSports();

    // Update partners
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
      // Add transparent AppBar with centered logo that stays transparent when scrolling
      extendBodyBehindAppBar:
          true, // This ensures content goes behind the AppBar
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        shadowColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        toolbarHeight: 50, // Standard height
        flexibleSpace: Container(
          // No need for AnimatedContainer as we're already smoothly changing the opacity
          color: Colors.black.withOpacity(
              _scrollOpacity * 0.4), // Gradually increase to max opacity of 0.4
          child: Padding(
            padding: EdgeInsets.only(
                top: 45), // Add top margin only to push logo down
            child: Center(
              child: Image.asset(
                'lib/assets/images/logo.png',
                height: 40,
              ),
            ),
          ),
        ),
      ),
      body: MediaQuery.removePadding(
        context: context,
        removeTop: true, // Remove top padding (status bar padding)
        child: RefreshIndicator(
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
                  controller: _scrollController, // Use our scroll controller
                  padding: EdgeInsets.only(bottom: 120), // Add bottom padding for floating nav bar
                  child: Center(
                    child: Column(
                      mainAxisAlignment:
                          MainAxisAlignment.start, // Start from the top
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header Section
                        HeaderSection(),
                        NewsSection(key: _newsSectionKey, filterType: 'main'),
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
      ),
    );
  }
}
