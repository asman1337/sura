import 'package:flutter/foundation.dart';

class AppConfig {
  // App information
  static const String appName = 'SURA';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Evidence Management System';
  
  // API configuration
  static const String apiBaseUrl = kDebugMode ? "http://192.168.31.121:3000" : "https://sura.otmalse.com";
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Endpoints
  static final ApiEndpoints endpoints = ApiEndpoints();
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  
  // Timeouts
  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration toastDuration = Duration(seconds: 3);
  
  // Animation durations
  static const Duration shortAnimationDuration = Duration(milliseconds: 300);
  static const Duration mediumAnimationDuration = Duration(milliseconds: 500);
  static const Duration longAnimationDuration = Duration(milliseconds: 800);
}

class ApiEndpoints {
  final String login = '/auth/login';
  final String register = '/auth/register';
  final String forgotPassword = '/auth/forgot-password';
  final String resetPassword = '/auth/reset-password';
  final String profile = '/auth/profile';
  final String changePassword = '/auth/change-password';
  
  // Malkhana endpoints
  final String malkhanaItems = '/malkhana/items';
  final String malkhanaItem = '/malkhana/items';  // + /{id}
  final String shelves = '/malkhana/shelves';
  final String shelf = '/malkhana/shelves';  // + /{id}
} 