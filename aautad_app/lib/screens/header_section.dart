import 'package:flutter/material.dart';

class HeaderSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ClipPath(
      clipper: HeaderClipper(),
      child: Stack(
        children: [
          Container(
            width: double.infinity,
            height: 250,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage('lib/assets/images/header2.png'),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Theme.of(context).brightness == Brightness.dark
                      ? Colors.white
                      : Colors.black,
                  BlendMode.srcIn,
                ),
              ),
            ),
          ),
          Center(),
        ],
      ),
    );
  }
}

// Custom Clipper for Curved Bottom
class HeaderClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path();
    path.lineTo(0, size.height - 30); // Start from bottom-left

    // Curve from left to right
    path.quadraticBezierTo(
        size.width / 2, size.height - 10, size.width, size.height - 30);

    path.lineTo(size.width, 0); // Top-right
    path.close(); // Complete path

    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) {
    return false;
  }
}
