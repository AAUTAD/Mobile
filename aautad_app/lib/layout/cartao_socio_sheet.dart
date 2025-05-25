import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:google_fonts/google_fonts.dart';

class CartaoSocioSheet extends StatefulWidget {
  final bool hasToken;
  final ScrollController scrollController;
  final FlutterSecureStorage secureStorage;

  const CartaoSocioSheet({
    Key? key,
    required this.hasToken,
    required this.scrollController,
    required this.secureStorage,
  }) : super(key: key);

  @override
  State<CartaoSocioSheet> createState() => _CartaoSocioSheetState();
}

class _CartaoSocioSheetState extends State<CartaoSocioSheet> {
  final TextEditingController _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  // Function to handle associating a card with an email
  void _handleAssociateCard() {
    final email = _emailController.text.trim();
    if (email.isNotEmpty) {
      // TODO: Implement the association functionality
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('A implementar: Associar cartão para $email'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Por favor, insira um email válido'),
        ),
      );
    }
  }

  // Function to open the membership URL in browser
  Future<void> _launchMembershipURL() async {
    final Uri url = Uri.parse('https://aautad.pt/socio/pedido');
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Não foi possível abrir o link'),
        ),
      );
    }
  }

  // Build card image widget
  Widget _buildCardImage() {
    return Container(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height *
          0.5, // Adjusted height for dialog
      child: Center(
        child: Image.asset(
          'lib/assets/images/cartao_socio_tras.png',
          fit: BoxFit.contain, // Maintain aspect ratio
        ),
      ),
    );
  }

  // Build member card widget
  Future<Widget> _buildMemberCard() async {
    return Column(children: [
      Text(
        'Cartão de Sócio',
        style:
            GoogleFonts.montserrat(fontSize: 24, fontWeight: FontWeight.bold),
      ),
      SizedBox(height: 24),
      Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Display the PNG card image rotated 90 degrees
          _buildCardImage(),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: () async {
              await widget.secureStorage.delete(key: 'jwt_token');
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Token cleared!'),
                ),
              );
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary,
              foregroundColor: Theme.of(context).colorScheme.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            child: Text(
              'Clear Token',
              style: GoogleFonts.montserrat(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    ]);
  }

  // Build the "Já és Socio?" section
  Widget _buildExistingMemberSection() {
    return Column(
      children: [
        Text(
          "Já és Socio?",
          style: GoogleFonts.montserrat(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
          textAlign: TextAlign.center,
        ),
        SizedBox(height: 16),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 24),
          child: TextField(
            controller: _emailController,
            decoration: InputDecoration(
              hintText: 'Email',
              filled: true,
              fillColor: Colors.white,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: BorderSide(color: Colors.grey, width: 1.5),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: BorderSide(color: Colors.grey.shade400, width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.0),
                borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2.0),
              ),
            ),
            keyboardType: TextInputType.emailAddress,
          ),
        ),
        SizedBox(height: 16),
        ElevatedButton(
          onPressed: _handleAssociateCard,
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
          child: Text(
            'Associar Cartão',
            style: GoogleFonts.montserrat(fontWeight: FontWeight.w500),
          ),
        ),
        SizedBox(height: 16),
        Divider(thickness: 1),
        SizedBox(height: 16),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: widget.hasToken
          ? FutureBuilder<Widget>(
              future: _buildMemberCard(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (snapshot.hasData) {
                  return SingleChildScrollView(
                    controller: widget.scrollController,
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
              controller: widget.scrollController,
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Add the "Já és Socio?" section
                    _buildExistingMemberSection(),

                    Text(
                      "Ser sócio nunca foi tão fácil!",
                      style: GoogleFonts.montserrat(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 24),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: GoogleFonts.montserrat(
                            fontSize: 16,
                            color: Colors.black87,
                            height: 1.5,
                          ),
                          children: [
                            TextSpan(text: 'Faz-te '),
                            TextSpan(
                              text: 'sócio',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            TextSpan(text: ' e desfruta de '),
                            TextSpan(
                              text: 'descontos',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            TextSpan(text: ' tanto em diversos '),
                            TextSpan(
                              text: 'eventos',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            TextSpan(text: ' organizados pela a '),
                            TextSpan(
                              text: 'AAUTAD',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            TextSpan(text: ' como em '),
                            TextSpan(
                              text: 'parceiros locais da nossa academia.',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ElevatedButton(
                          onPressed: _launchMembershipURL,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(
                                0xFFE91E63), // Pink color from mypink class
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            padding: EdgeInsets.symmetric(
                                horizontal: 20, vertical: 12),
                          ),
                          child: Text(
                            'Aderir',
                            style: GoogleFonts.montserrat(
                                fontWeight: FontWeight.w500),
                          ),
                        ),
                        SizedBox(width: 12),
                      ],
                    ),
                    SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}

// Function to show the card as a centered dialog overlay
void showCartaoSocioSheet(
    BuildContext context, bool hasToken, FlutterSecureStorage secureStorage) {
  showDialog(
    context: context,
    barrierDismissible: true,
    builder: (context) {
      ScrollController scrollController = ScrollController();
      return Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Stack(
          children: [
            Container(
              width: double.infinity,
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.85,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: CartaoSocioSheet(
                hasToken: hasToken,
                scrollController: scrollController,
                secureStorage: secureStorage,
              ),
            ),
            Positioned(
              top: 10,
              right: 10,
              child: GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Container(
                  padding: EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.close, size: 22, color: Colors.black54),
                ),
              ),
            ),
          ],
        ),
      );
    },
  );
}
