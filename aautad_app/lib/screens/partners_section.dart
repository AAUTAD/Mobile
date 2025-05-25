import 'package:aautad_app/constants/spacings.dart';
import 'package:aautad_app/models/partner.dart';
import 'package:flutter/material.dart';

class PartnersSection extends StatelessWidget {
  final List<Partner> partners;

  PartnersSection({required this.partners});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: Spacings.horizontalPadding,
          child: Text(
            'Explorar',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface),
          ),
        ),
        SizedBox(height: Spacings.VerticalSpacing),
        Padding(
          padding: Spacings.horizontalPadding,
          child: GridView.builder(
            padding: EdgeInsets.zero, // Remove internal padding
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, // 2 per row
              crossAxisSpacing: 24,
              mainAxisSpacing: 16,
              mainAxisExtent: 220,
            ),
            itemCount: partners.length,
            itemBuilder: (context, index) {
              return PartnerCard(partner: partners[index]);
            },
          ),
        ),
      ],
    );
  }
}

class PartnerCard extends StatelessWidget {
  final Partner partner;

  PartnerCard({required this.partner});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: ClipPath(
        clipper: PartnerCardClipper(),
        child: Container(
          width: 150,
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    height: 145,
                    width: double.infinity,
                    color: Theme.of(context).cardColor,
                  ),
                  Positioned(
                    child: Container(
                      height: 81,
                      width: 81,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        image: DecorationImage(
                          image: NetworkImage(partner.nameUrl),
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  )
                ],
              ),
              Container(
                height: 75,
                width: double.infinity,
                color: Colors.red[900],
                alignment: Alignment.center,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      partner.discount.toString(),
                      style: TextStyle(color: Colors.white, fontSize: 20),
                    ),
                    Text(
                      ' Desconto',
                      style: TextStyle(color: Colors.white),
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}

// 🎬 Custom Clipper with Transparent Cutouts
class PartnerCardClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path mainPath = Path(); // Base shape (rectangle with rounded corners)
    Path cutoutPath = Path(); // Cutout circles

    // Draw the rounded rectangle
    mainPath.addRRect(RRect.fromRectAndRadius(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Radius.circular(12),
    ));

    // Cut out circles (transparent effect)
    double radius = 12;
    double centerX = 0;
    double centerY = 145;

    cutoutPath.addOval(
        Rect.fromCircle(center: Offset(centerX, centerY), radius: radius));
    cutoutPath.addOval(
        Rect.fromCircle(center: Offset(size.width, centerY), radius: radius));

    // Use PathOperation.difference to subtract circles from main shape
    return Path.combine(PathOperation.difference, mainPath, cutoutPath);
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => true;
}
