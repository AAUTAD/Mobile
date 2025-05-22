import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class CartaoSocioSheet extends StatelessWidget {
  final bool hasToken;
  final ScrollController scrollController;
  final FlutterSecureStorage secureStorage;

  const CartaoSocioSheet({
    Key? key,
    required this.hasToken,
    required this.scrollController,
    required this.secureStorage,
  }) : super(key: key);

  // Build card image widget
  Widget _buildCardImage(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height * 0.7, // Taller container
      child: Center(
        child: RotatedBox(
          quarterTurns: 1, // Rotate 90 degrees clockwise
          child: Image.asset(
            'lib/assets/images/cartao_socio_tras.png',
            fit: BoxFit.contain, // Maintain aspect ratio
          ),
        ),
      ),
    );
  }

  // Build member card widget
  Future<Widget> _buildMemberCard(BuildContext context) async {
    return Column(children: [
      Text(
        'Cartão de Sócio',
        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
      ),
      SizedBox(height: 40),
      Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Display the PNG card image rotated 90 degrees
          _buildCardImage(context),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: () async {
              await secureStorage.delete(key: 'jwt_token');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Token cleared!'),
                ),
              );
              Navigator.pop(context);
            },
            child: Text('Clear Token'),
          ),
        ],
      ),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: hasToken
          ? FutureBuilder<Widget>(
              future: _buildMemberCard(context),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (snapshot.hasData) {
                  return SingleChildScrollView(
                    controller: scrollController,
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: snapshot.data!,
                    ),
                  );
                }
                return Center(child: Text('No Data'));
              },
            )
          : SingleChildScrollView(
              controller: scrollController,
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      "Cartão de Sócio",
                      style:
                          TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 40),
                    // Display the PNG card image rotated 90 degrees for non-authenticated users
                    _buildCardImage(context),
                    SizedBox(height: 24),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Text(
                        "Você ainda não possui um cartão de sócio ativo.",
                        style: TextStyle(fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}

// Function to show the card sheet
void showCartaoSocioSheet(
    BuildContext context, bool hasToken, FlutterSecureStorage secureStorage) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useRootNavigator: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return DraggableScrollableSheet(
        initialChildSize: 0.9,
        maxChildSize: 0.9,
        minChildSize: 0.89,
        builder: (context, scrollController) {
          return CartaoSocioSheet(
            hasToken: hasToken,
            scrollController: scrollController,
            secureStorage: secureStorage,
          );
        },
      );
    },
  );
}
