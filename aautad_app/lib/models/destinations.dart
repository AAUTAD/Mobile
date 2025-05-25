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
  Destination(label: 'Eventos', icon: Icons.event),
  Destination(label: 'Desporto', icon: Icons.map_outlined),
  Destination(label: 'Cartão', icon: Icons.qr_code),
];

Function createIconFromImage(String imagePath) {
  return (BuildContext context) => Image.asset(
        imagePath,
        width: 24,
        height: 24,
      );
}
