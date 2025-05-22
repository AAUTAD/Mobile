import 'package:flutter/material.dart';

class Destination {
  const Destination({
    required this.label,
    required this.icon,
  });

  final String label;
  final IconData icon;
}

const destinations = [
  Destination(label: 'Home', icon: Icons.home),
  Destination(label: 'Events', icon: Icons.event),
  Destination(label: 'Sports', icon: Icons.map_outlined),
  Destination(label: 'Card', icon: Icons.qr_code),
];
