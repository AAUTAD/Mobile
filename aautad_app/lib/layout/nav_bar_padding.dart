import 'package:aautad_app/constants/spacings.dart';
import 'package:flutter/material.dart';

/// A widget that adds padding at the bottom of the screen to account for the floating navigation bar
class NavBarPadding extends StatelessWidget {
  final Widget child;

  const NavBarPadding({
    required this.child,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Spacings.navBarHeight),
      child: child,
    );
  }
}
