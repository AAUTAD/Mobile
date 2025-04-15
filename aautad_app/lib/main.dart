import 'package:aautad_app/routes/routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'routes/app_routes.dart';
import 'themes/app_theme.dart';
import 'package:uni_links/uni_links.dart';

final FlutterSecureStorage secureStorage = FlutterSecureStorage();

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  // Variable to store the current deep link
  String? _initialLink;

  // Variable to store the deep link token
  String? _deepLinkToken;

  @override
  void initState() {
    super.initState();
    initDeepLink();
  }

  // Initialize deep linking to capture the initial link
  Future<void> initDeepLink() async {
    // Handle the initial deep link (when the app is launched from a deep link)
    try {
      final initialLink = await getInitialLink();
      _handleDeepLink(initialLink);
      setState(() {
        _initialLink = initialLink;
      });
      // Perform navigation based on the deep link
      // _navigateToDeepLink(_initialLink);
      _handleDeepLink(initialLink);
    } catch (e) {
      print('Error retrieving deep link: $e');
    }

    // Listen for deep links while the app is in the foreground
    linkStream.listen((String? link) {
      setState(() {
        _initialLink = link;
      });
      _handleDeepLink(link);
    });
  }

  // Handle the deep link, extract the token and store it securely
  void _handleDeepLink(String? link) async {
    if (link != null && link.contains('token=')) {
      final Uri uri = Uri.parse(link);
      final String token = uri.queryParameters['token'] ?? '';

      if (token.isNotEmpty) {
        String decodedToken = Uri.decodeComponent(token);
        // Store the JWT token securely using flutter_secure_storage
        debugPrint('Token: $decodedToken');
        await secureStorage.write(key: 'jwt_token', value: decodedToken);
        setState(() {
          _deepLinkToken = token;
        });

        // After storing the token, navigate to the home page
        router.goNamed(Routes.homePage);
      }
    }
  }

  // // Navigate to the specific screen based on the deep link
  // void _navigateToDeepLink(String? link) {
  //   if (link != null && link.contains('member-card')) {
  //     // Navigate to the member card screen
  //     // Replace with your actual navigation logic
  //     router.goNamed(Routes.homePage);
  //   } else {
  //     router.goNamed(Routes.homePage);
  //   }
  // }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: router,
      title: 'My Flutter App',
      theme: AppTheme.lightTheme, // Apply global theme
    );
  }
}
