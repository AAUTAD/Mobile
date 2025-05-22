import 'package:aautad_app/constants/colors.dart';
import 'package:aautad_app/models/destinations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:jwt_decoder/jwt_decoder.dart';

class FloatingNavBar extends StatefulWidget {
  final StatefulNavigationShell navigationShell;

  const FloatingNavBar({
    required this.navigationShell,
    Key? key,
  }) : super(key: key);

  @override
  State<FloatingNavBar> createState() => _FloatingNavBarState();
}

class _FloatingNavBarState extends State<FloatingNavBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  final FlutterSecureStorage secureStorage = FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Animate the icon when tapped
  void _animateIcon() {
    _animationController.forward().then((_) {
      _animationController.reverse();
    });
  }

  // Check if user has a token
  Future<bool> _hasToken() async {
    String? token = await secureStorage.read(key: 'jwt_token');
    return token != null && token.isNotEmpty;
  }

  // Build member card widget
  Future<Widget> _buildMemberCard(BuildContext context) async {
    String? token = await secureStorage.read(key: 'jwt_token');
    Map<String, dynamic> decodedToken = {};

    if (token != null) {
      decodedToken = JwtDecoder.decode(token);
    }

    final data = decodedToken['returnObject'];

    // Get user data
    final String firstName =
        data != null ? data['firstName'] ?? 'No Name' : 'No Name';
    final String lastName = data != null ? data['lastName'] ?? '' : '';
    final String memberId = data != null ? data['memberId'] ?? 'N/A' : 'N/A';

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

  // Open card bottom sheet
  void _openCardSheet(BuildContext context) async {
    bool hasToken = await _hasToken();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.9,
          maxChildSize: 0.9,
          minChildSize: 0.89,
          builder: (context, scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: hasToken
                  ? FutureBuilder<Widget>(
                      future: _buildMemberCard(context),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return Center(child: CircularProgressIndicator());
                        } else if (snapshot.hasError) {
                          return Center(
                              child: Text('Error: ${snapshot.error}'));
                        } else if (snapshot.hasData) {
                          return SingleChildScrollView(
                            controller: scrollController,
                            child: Padding(
                              padding: EdgeInsets.all(16),
                              child: snapshot.data!,
                            ),
                          );
                        }
                        return Center(child: Text('No Data'));
                      },
                    )
                  : ListView(
                      controller: scrollController,
                      children: [
                        Padding(
                          padding: EdgeInsets.all(16),
                          child: Text(
                            "Cartão de Sócio",
                            style: TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Center(
                          child: Icon(
                            Icons.qr_code_scanner,
                            size: 120,
                            color: Colors.grey,
                          ),
                        ),
                        SizedBox(height: 24),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            "Você ainda não possui um cartão de sócio ativo.",
                            style: TextStyle(fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        SizedBox(height: 40),
                      ],
                    ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Container(
        height: 65,
        decoration: BoxDecoration(
          color: AppColors.navBar,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              spreadRadius: 1,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: List.generate(destinations.length, (index) {
            final isSelected = index < 3
                ? widget.navigationShell.currentIndex == index
                : false;
            final destination = destinations[index];
            final bool isCardItem = index == 3; // Card item is at index 3

            return Expanded(
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    _animateIcon();
                    if (isCardItem) {
                      _openCardSheet(context);
                    } else {
                      widget.navigationShell.goBranch(index);
                    }
                  },
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  borderRadius: BorderRadius.circular(32),
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(32),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedBuilder(
                          animation: _animationController,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: isSelected ? _scaleAnimation.value : 1.0,
                              child: index == 0
                                  ? SvgPicture.asset(
                                      'lib/assets/icons/logo.svg',
                                      height: 24,
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.white.withOpacity(0.5),
                                    )
                                  : Icon(
                                      destination.icon,
                                      size: 24,
                                      color: isSelected || isCardItem
                                          ? Colors.white
                                          : Colors.white.withOpacity(0.5),
                                    ),
                            );
                          },
                        ),
                        const SizedBox(height: 4),
                        Text(
                          destination.label,
                          style: TextStyle(
                            color: isSelected || isCardItem
                                ? Colors.white
                                : Colors.white.withOpacity(0.5),
                            fontSize: 12,
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
