import 'package:aautad_app/constants/colors.dart';
import 'package:aautad_app/layout/cartao_socio_sheet.dart';
import 'package:aautad_app/models/destinations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

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

  // Build member card widget for backward compatibility
  Future<Widget> _buildMemberCard(BuildContext context) async {
    // This is now just a wrapper for the functionality in CartaoSocioSheet
    return Column(children: [
      Text(
        'Cartão de Sócio',
        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
      ),
      SizedBox(height: 40),
      Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Display the PNG card image rotated 90 degrees
          Container(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height * 0.7,
            child: Center(
              child: RotatedBox(
                quarterTurns: 1,
                child: Image.asset(
                  'lib/assets/images/cartao_socio_tras.png',
                  fit: BoxFit.contain,
                ),
              ),
            ),
          ),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: () async {
              await secureStorage.delete(key: 'jwt_token');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Token cleared!')),
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
    showCartaoSocioSheet(context, hasToken, secureStorage);
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
                            : index == 1
                              ? SvgPicture.asset(
                                'lib/assets/icons/destinations/calendar-black.svg',
                                height: 24,
                                color: isSelected
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.5),
                              )
                              : index == 2
                                ? SvgPicture.asset(
                                  'lib/assets/icons/destinations/sports.svg',
                                  height: 24,
                                  color: isSelected
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.5),
                                )
                                : destination.image != ''
                                  ? Image.asset(
                                    destination.image,
                                    height: 24,
                                    color: isSelected || isCardItem
                                      ? Colors.white
                                      : Colors.white.withAlpha((0.5 * 255).toInt()),
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
