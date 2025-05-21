import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:sura/core/theme/app_theme.dart';
import 'package:sura/core/config/app_config.dart';
import 'package:sura/core/services/auth_service.dart';
import 'package:sura/features/home/presentation/screens/home_screen.dart';
import 'package:sura/features/auth/presentation/screens/login_screen.dart';
import 'package:sura/features/splash/presentation/screens/splash_screen.dart';
import 'package:sura/features/qr_scanner/presentation/screens/qr_scanner_screen.dart';
import 'package:sura/features/malkhana/presentation/screens/malkhana_detail_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );
  
  // Initialize services
  final authService = AuthService();
  await authService.init();
  
  runApp(MyApp(authService: authService));
}

class MyApp extends StatefulWidget {
  final AuthService authService;
  
  const MyApp({super.key, required this.authService});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final GoRouter _router;
  
  @override
  void initState() {
    super.initState();
    
    _router = GoRouter(
      initialLocation: '/splash',
      redirect: (context, state) {
        final isLoggedIn = widget.authService.isAuthenticated;
        final isLoggingIn = state.matchedLocation == '/login';
        final isSplash = state.matchedLocation == '/splash';
        
        // If not logged in and not on login or splash screen, redirect to login
        if (!isLoggedIn && !isLoggingIn && !isSplash) {
          return '/login';
        }
        
        // If logged in and on login screen, redirect to home
        if (isLoggedIn && isLoggingIn) {
          return '/home';
        }
        
        return null;
      },
      routes: [
        GoRoute(
          path: '/splash',
          builder: (context, state) => const SplashScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/qr-scanner',
          builder: (context, state) => const QrScannerScreen(),
        ),
        GoRoute(
          path: '/malkhana/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return MalkhanaDetailScreen(itemId: id);
          },
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthService>.value(value: widget.authService),
      ],
      child: MaterialApp.router(
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        routerConfig: _router,
      ),
    );
  }
}
