import 'package:aautad_app/screens/categories.dart';
import 'package:aautad_app/screens/featured_section.dart';
import 'package:aautad_app/screens/header_section.dart';
import 'package:aautad_app/screens/news_section.dart';
import 'package:aautad_app/screens/partners_section.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // for styling
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/partner.dart';
import '../providers/theme_provider.dart';

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
      100.0; // Scroll distance for max opacity

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
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
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
        actions: [
          Consumer<ThemeProvider>(
            builder: (context, themeProvider, child) {
              return Container(
                margin: EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.light
                      ? Colors.white.withOpacity(0.9)
                      : Colors.black.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: Theme.of(context).brightness == Brightness.light
                      ? [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          )
                        ]
                      : null,
                ),
                child: IconButton(
                  icon: Icon(
                    themeProvider.isDarkMode
                        ? Icons.light_mode
                        : Icons.dark_mode,
                    color: Theme.of(context).iconTheme.color,
                  ),
                  onPressed: () {
                    themeProvider.toggleTheme();
                  },
                ),
              );
            },
          ),
          SizedBox(width: 8),
        ],
        flexibleSpace: Container(
          // Adaptive background color based on theme and scroll
          color: Theme.of(context).brightness == Brightness.light
              ? Colors.white.withOpacity(_scrollOpacity * 0.95)
              : Colors.black.withOpacity(_scrollOpacity * 0.4),
          child: Padding(
            padding: EdgeInsets.only(
                top: 45), // Add top margin only to push logo down
            child: Center(
              child: ColorFiltered(
                colorFilter: Theme.of(context).brightness == Brightness.light
                    ? ColorFilter.mode(Colors.transparent, BlendMode.multiply)
                    : ColorFilter.mode(Colors.white, BlendMode.modulate),
                child: Image.asset(
                  'lib/assets/images/logo.png',
                  height: 40,
                ),
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
                return Container(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: Theme.of(context).primaryColor,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Loading...',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ],
                    ),
                  ),
                );
              } else if (snapshot.hasError) {
                return Container(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          color: Colors.red,
                          size: 48,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Error: ${snapshot.error}',
                          style: Theme.of(context).textTheme.bodyLarge,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                );
              } else if (snapshot.hasData) {
                return SingleChildScrollView(
                  controller: _scrollController, // Use our scroll controller
                  padding: EdgeInsets.only(
                      bottom: 120), // Add bottom padding for floating nav bar
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
              return Container(
                color: Theme.of(context).scaffoldBackgroundColor,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.inbox_outlined,
                        color: Theme.of(context).iconTheme.color,
                        size: 48,
                      ),
                      SizedBox(height: 16),
                      Text(
                        'No Data Available',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
