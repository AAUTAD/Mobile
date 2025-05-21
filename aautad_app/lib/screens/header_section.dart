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
              gradient: LinearGradient(
                colors: [
                  Color(0xF8FAFD).withOpacity(1),
                  Color(0xD4E8F9).withOpacity(0.6),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          Center(
            child: Container(
              width: 350,
              height: 180,
              margin: EdgeInsets.only(top: 100), // Add padding top
              decoration: BoxDecoration(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
                image: DecorationImage(
                  image:
                      AssetImage('lib/assets/images/cartao_socio_frente.png'),
                  fit: BoxFit.cover,
                  alignment: Alignment.topCenter,
                ),
              ),
            ),
          ),
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
