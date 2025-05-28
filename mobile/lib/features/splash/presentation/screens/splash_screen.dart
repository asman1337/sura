import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:sura/core/config/app_config.dart';
import 'package:sura/core/services/auth_service.dart';
import 'package:sura/core/theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToNextScreen();
  }

  Future<void> _navigateToNextScreen() async {
    // Wait for the splash animation
    await Future.delayed(AppConfig.splashDuration);
    
    if (!mounted) return;
    
    // Get auth service
    final authService = Provider.of<AuthService>(context, listen: false);
    
    // Navigate to the appropriate screen
    if (authService.isAuthenticated) {
      context.go('/home');
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // App logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Center(
                child: Icon(
                  Icons.security,
                  size: 60,
                  color: AppTheme.primaryColor,
                ),
              ),
            )
            .animate()
            .scale(
              begin: const Offset(0.5, 0.5),
              end: const Offset(1.0, 1.0),
              duration: const Duration(milliseconds: 500),
              curve: Curves.easeOutBack,
            ),
            
            const SizedBox(height: 32),
            
            // App name
            Text(
              AppConfig.appName,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            )
            .animate()
            .fadeIn(
              duration: const Duration(milliseconds: 600),
              delay: const Duration(milliseconds: 300),
            )
            .slideY(
              begin: 0.2,
              end: 0,
              duration: const Duration(milliseconds: 600),
              delay: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
            ),
            
            const SizedBox(height: 8),
            
            // App subtitle
            const Text(
              'Malkhana Management System',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white70,
              ),
            )
            .animate()
            .fadeIn(
              duration: const Duration(milliseconds: 600),
              delay: const Duration(milliseconds: 500),
            ),
            
            const SizedBox(height: 64),
            
            // Loading indicator
            const CircularProgressIndicator(
              color: Colors.white,
              strokeWidth: 3,
            )
            .animate()
            .fadeIn(
              duration: const Duration(milliseconds: 600),
              delay: const Duration(milliseconds: 800),
            ),
          ],
        ),
      ),
    );
  }
} 