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
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: SizedBox(
        height: 48,
        child: FloatingActionButton.extended(
          backgroundColor: Color.fromARGB(236, 52, 145, 233),
          onPressed: () async {
            bool hasToken = await _hasToken();

            // Open the bottom sheet when the button is pressed
            showModalBottomSheet(
              context: context,
              isScrollControlled:
                  true, // Ensures it covers the full screen if needed
              useRootNavigator: true, // Provides access to the root navigator
              backgroundColor: Colors.transparent, // Allows customization
              builder: (context) {
                return DraggableScrollableSheet(
                  initialChildSize:
                      0.9, // Adjusts how much the sheet is visible initially
                  maxChildSize: 0.9, // Allows expansion
                  minChildSize: 0.89,
                  builder: (context, scrollController) {
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            BorderRadius.vertical(top: Radius.circular(16)),
                      ),
                      child: ListView(
                        controller: scrollController,
                        children: [
                          Padding(
                              padding: EdgeInsets.all(16),
                              child: Column(
                                children: [
                                  if (hasToken)
                                    FutureBuilder<Widget>(
                                      future: _buildMemberCard(context),
                                      builder: (context, snapshot) {
                                        if (snapshot.connectionState ==
                                            ConnectionState.waiting) {
                                          return CircularProgressIndicator();
                                        } else if (snapshot.hasError) {
                                          return Text(
                                              'Error: ${snapshot.error}');
                                        } else if (snapshot.hasData) {
                                          return snapshot.data!;
                                        }
                                        return Text('No Data');
                                      },
                                    )
                                  else
                                    _buildRegisterPart(context, apiService),
                                ],
                              )),
                        ],
                      ),
                    );
                  },
                );
              },
            );
          },
          label: Text("Abrir Cartao"),
          icon: Icon(Icons.open_in_new),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(32),
          ),
        ),
      ),
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
                      NewsSection(filterType: 'not_sport'),
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

Future<Widget> _buildMemberCard(BuildContext context) async {
  String? token = await secureStorage.read(key: 'jwt_token');

  Map<String, dynamic> decodedToken = {};

  if (token != null) {
    decodedToken = JwtDecoder.decode(token);
  }

  final data = decodedToken['returnObject'];

  // Get user data
  final String firstName = data['firstName'] ?? 'No Name';
  final String lastName = data['lastName'] ?? '';
  final String memberId = data['memberId'] ?? 'N/A';

  return Column(children: [
    Text(
      'Cartão de Sócio',
      style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
    ),
    SizedBox(height: 40),
    Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: MediaQuery.of(context).size.width * 0.9,
          height: 220,
          child: Stack(
            children: [
              SvgPicture.asset(
                'lib/assets/images/cartao_socio_final.svg',
                width: double.infinity,
                height: double.infinity,
                fit: BoxFit.contain,
              ),
              // Position name text
              Positioned(
                top: 80,
                left: 30,
                child: Text(
                  '${firstName.toUpperCase()} ${lastName.toUpperCase()}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2A31D9), // Match the blue from SVG
                  ),
                ),
              ),
              // Position member ID
              Positioned(
                bottom: 75,
                right: 85,
                child: Text(
                  memberId,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2A31D9), // Match the blue from SVG
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 16),
        ElevatedButton(
          onPressed: () async {
            await secureStorage.delete(key: 'jwt_token');
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Token cleared!'),
              ),
            );
            Navigator.pop(context);
          },
          child: Text('Clear Token'),
        ),
      ],
    ),
  ]);
}

Widget _buildRegisterPart(BuildContext context, ApiService apiService) {
  final TextEditingController _emailController = TextEditingController();

  void onSendConfirmation() async {
    // Handle button press
    final uuid = await UUIDService.getOrCreateUUID();
    final String email = _emailController.text;

    apiService.sendEmail(email, uuid);
  }

  return Column(
    children: [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "Cartão de Sócio",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.normal),
          ),
          IconButton(
            icon: Icon(Icons.close),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ],
      ),
      SizedBox(height: 16),
      Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            "Já és sócio?",
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          Container(
            width: MediaQuery.of(context).size.width * 0.8,
            child: TextField(
              controller: _emailController,
              decoration: InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: Colors.blue, // Blue border color
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: Colors.blue, // Blue border color
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: Colors.blue, // Blue border color
                  ),
                ),
              ),
            ),
          ),
          SizedBox(height: 16),
          Container(
            width: MediaQuery.of(context).size.width * 0.8,
            height: 48,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                foregroundColor: Colors.white,
                textStyle: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                backgroundColor: Colors.blue[400],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () {
                // Handle button press
                onSendConfirmation();
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Confirmação enviada!'),
                  ),
                );
              },
              child: Text('Enviar Confirmação'),
            ),
          ),
        ],
      )
    ],
  );
}
