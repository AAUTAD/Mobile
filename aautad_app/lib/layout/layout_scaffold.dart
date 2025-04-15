import 'package:aautad_app/constants/colors.dart';
import 'package:aautad_app/models/destinations.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';

class LayoutScaffold extends StatelessWidget {
  const LayoutScaffold({required this.navigationShell, Key? key})
      : super(key: key ?? const ValueKey<String>('LayoutScaffold'));

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: navigationShell.currentIndex,
        backgroundColor: AppColors.navBar,
        onTap: navigationShell.goBranch,
        selectedItemColor: Colors.white,
        items: destinations
            .map((destination) => BottomNavigationBarItem(
                  label: destination.label,
                  icon: SvgPicture.asset(
                    'lib/assets/icons/logo.svg',
                    height: 24,
                    color: navigationShell.currentIndex ==
                            destinations.indexOf(destination)
                        ? Colors.white
                        : null,
                  ),
                ))
            .toList(),
      ),
    );
  }
}
