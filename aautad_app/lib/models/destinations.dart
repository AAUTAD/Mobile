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
  Destination(label: 'Eventos', icon: Icons.event),
  Destination(label: 'Desporto', icon: Icons.map_outlined),
  Destination(label: 'Cartão', icon: Icons.qr_code),
];
