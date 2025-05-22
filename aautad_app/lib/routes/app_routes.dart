// lib/routes/app_routes.dart
import 'package:aautad_app/layout/layout_scaffold.dart';
import 'package:aautad_app/routes/routes.dart';
import 'package:aautad_app/screens/eventos_screen.dart';
import 'package:aautad_app/screens/sports_screen.dart';
import 'package:flutter/material.dart';
import '../screens/home_screen.dart';
import 'package:go_router/go_router.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: Routes.homePage,
  routes: [
    StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => LayoutScaffold(
              navigationShell: navigationShell,
            ),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                  path: Routes.homePage,
                  name: Routes.homePage,
                  pageBuilder: (context, state) =>
                      MaterialPage(child: HomeScreen())),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                  path: Routes.eventsPage,
                  name: Routes.eventsPage,
                  pageBuilder: (context, state) {
                    return MaterialPage(child: EventosScreen());
                  }),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                  path: Routes.sportsPage,
                  name: Routes.sportsPage,
                  pageBuilder: (context, state) {
                    return MaterialPage(child: SportsScreen());
                  }),
            ],
          ),
          // This branch is just a placeholder since we handle the card through a modal
          StatefulShellBranch(
            routes: [
              GoRoute(
                  path: Routes.memberCard,
                  name: Routes.memberCard,
                  pageBuilder: (context, state) {
                    // This page won't actually be shown since we use a modal
                    return MaterialPage(child: SizedBox());
                  }),
            ],
          ),
        ])
  ],
);
