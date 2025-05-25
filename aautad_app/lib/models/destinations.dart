import 'package:flutter/material.dart';

class Destination {
  const Destination({
    required this.label,
    this.icon = Icons.question_mark,
    this.image = '',
  });

  final String label;
  final IconData icon;
  final String image;
}

const basePath = 'assets/images/destinations/';

const destinations = [
  Destination(label: 'Home', icon: Icons.home),
  Destination(label: 'Events', icon: Icons.event),
  Destination(label: 'Sports', icon: Icons.sports_baseball_outlined),
  Destination(label: 'Card', icon: Icons.qr_code),
];

Function createIconFromImage(String imagePath) {
  return (BuildContext context) => Image.asset(
        imagePath,
        width: 24,
        height: 24,
      );
}
