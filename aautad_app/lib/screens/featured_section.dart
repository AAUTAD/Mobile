import 'package:aautad_app/constants/spacings.dart';
import 'package:flutter/material.dart';

class FeaturedSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: Spacings.horizontalPadding,
          child: Text(
            'Destaques',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface),
          ),
        ),
        SizedBox(
          height: Spacings.VerticalSpacing,
        ),
        Padding(
          padding: Spacings.horizontalPadding,
          child: Stack(
            children: [
              Container(
                height: 85,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  // image: DecorationImage(
                  //   image: AssetImage('lib/assets/images/featured_offer.jpg'),
                  //   fit: BoxFit.cover,
                  // ),
                ),
              ),
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: Theme.of(context).colorScheme.surface, // Back to theme surface (white)
                  ),
                ),
              ),
              Positioned(
                top: 0,
                left: 0,
                child: Container(
                  padding: EdgeInsets.symmetric(
                      horizontal: 14, vertical: 3), // Add padding to the text
                  decoration: BoxDecoration(
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(16),
                        bottomRight: Radius.circular(6),
                      ),
                      color: Theme.of(context).colorScheme.primary),
                  child: Text(
                    'Até 19 Julho',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimary,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 0,
                bottom: 0,
                right: 0,
                child: Container(
                  width: 85,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    image: DecorationImage(
                      image: AssetImage('lib/assets/images/image.png'),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                left: 14,
                top: 34,
                right: 0,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '20% Desconto',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurface,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ],
    );
  }
}
