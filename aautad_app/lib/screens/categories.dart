import 'package:aautad_app/constants/spacings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';

class CategoriesSection extends StatelessWidget {
  final Function(String) onCategorySelected;
  final String selectedCategory;

  CategoriesSection(
      {required this.onCategorySelected, required this.selectedCategory});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: Spacings.horizontalPadding,
          child: Text(
            'Categorias',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface),
          ),
        ),
        SizedBox(height: 18),
        Container(
          height: 100, // Adjust height as needed
          child: ListView(
            padding: Spacings.horizontalPadding,
            scrollDirection: Axis.horizontal,
            children: [
              CategoryIconSvg(
                  assetName: 'lib/assets/icons/restaurantes.svg',
                  label: 'Restaurantes',
                  isSelected: selectedCategory == 'food',
                  onTap: () => onCategorySelected('food')),
              SizedBox(width: 16),
              CategoryIconSvg(
                  assetName: 'lib/assets/icons/educacao.svg',
                  label: 'Educação',
                  isSelected: selectedCategory == 'educacao',
                  onTap: () => onCategorySelected('educacao')),
              SizedBox(width: 16),
              CategoryIconSvg(
                  assetName: 'lib/assets/icons/saude.svg',
                  label: 'Saúde',
                  isSelected: selectedCategory == 'saude',
                  onTap: () => onCategorySelected('saude')),
              SizedBox(width: 16),
              CategoryIconSvg(
                  assetName: 'lib/assets/icons/beleza.svg',
                  label: 'Beleza',
                  isSelected: selectedCategory == 'beleza',
                  onTap: () => onCategorySelected('beleza')),
              SizedBox(width: 16),
              CategoryIconSvg(
                  assetName: 'lib/assets/icons/aventura.svg',
                  label: 'Aventura',
                  isSelected: selectedCategory == 'aventura',
                  onTap: () => onCategorySelected('aventura')),
              SizedBox(width: 16),
              CategoryIconSvg(
                  assetName: 'lib/assets/icons/restaurantes.svg',
                  label: 'Saúde',
                  isSelected: selectedCategory == 'saude',
                  onTap: () => onCategorySelected('saude')),
            ],
          ),
        ),
      ],
    );
  }
}

class CategoryIconSvg extends StatelessWidget {
  final String assetName;
  final String label;
  final VoidCallback onTap;
  final bool isSelected;

  CategoryIconSvg(
      {required this.assetName,
      required this.label,
      required this.onTap,
      required this.isSelected});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: Container(
              color: isSelected
                  ? Theme.of(context).primaryColor
                  : Theme.of(context).cardColor, // Use theme colors

              height: 64,
              width: 64,
              child: Center(
                  child: SvgPicture.asset(
                assetName,
                width: 24,
                height: 24,
                color: isSelected
                    ? Colors.white
                    : Theme.of(context).iconTheme.color,
              )),
            ),
          ),
          SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }
}

class CategoryIcon extends StatelessWidget {
  final IconData icon;
  final String label;

  CategoryIcon({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(100),
          child: Container(
            color: Theme.of(context).cardColor,
            padding: EdgeInsets.all(20),
            child:
                Icon(icon, size: 24, color: Theme.of(context).iconTheme.color),
          ),
        ),
        SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}
