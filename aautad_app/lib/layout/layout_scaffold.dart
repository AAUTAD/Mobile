import 'package:aautad_app/layout/floating_nav_bar.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LayoutScaffold extends StatelessWidget {
  const LayoutScaffold({required this.navigationShell, Key? key})
      : super(key: key ?? const ValueKey<String>('LayoutScaffold'));

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false, // The navigation bar will handle bottom padding
        child: Stack(
          children: [
            // Main content
            navigationShell,

            // Floating navigation bar
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: FloatingNavBar(navigationShell: navigationShell),
            ),
          ],
        ),
      ),
    );
  }
}
