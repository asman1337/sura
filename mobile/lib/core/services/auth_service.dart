import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:sura/core/config/app_config.dart';
import 'package:sura/core/models/auth/auth_response.dart';
import 'package:sura/core/models/auth/login_request.dart';
import 'package:sura/core/models/auth/user.dart';

class AuthService extends ChangeNotifier {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: AppConfig.connectionTimeout,
    receiveTimeout: AppConfig.receiveTimeout,
    contentType: 'application/json',
  ));
  
  final _storage = const FlutterSecureStorage();
  
  bool _isAuthenticated = false;
  User? _user;
  String? _token;
  
  bool get isAuthenticated => _isAuthenticated;
  User? get user => _user;
  String? get token => _token;
  
  Future<void> init() async {
    try {
      final token = await _storage.read(key: AppConfig.tokenKey);
      if (token != null) {
        final userJson = await _storage.read(key: AppConfig.userKey);
        if (userJson != null) {
          _token = token;
          _user = User.fromJson(jsonDecode(userJson));
          _isAuthenticated = true;
          _dio.options.headers['Authorization'] = 'Bearer $_token';
        } else {
          await logout();
        }
      }
    } catch (e) {
      await logout();
    }
    notifyListeners();
  }
  
  Future<bool> login(String email, String password) async {
    try {
      final response = await _dio.post(
        AppConfig.endpoints.login,
        data: LoginRequest(
          email: email,
          password: password,
        ).toJson(),
      );
      
      final authResponse = AuthResponse.fromJson(response.data);
      _token = authResponse.accessToken;
      _user = authResponse.officer;
      _isAuthenticated = true;
      
      // Set auth header for future requests
      _dio.options.headers['Authorization'] = 'Bearer $_token';
      
      // Store credentials
      await _storage.write(key: AppConfig.tokenKey, value: _token);
      await _storage.write(key: AppConfig.userKey, value: jsonEncode(_user!.toJson()));
      
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }
  
  Future<void> logout() async {
    _token = null;
    _user = null;
    _isAuthenticated = false;
    _dio.options.headers.remove('Authorization');
    
    // Clear stored credentials
    await _storage.delete(key: AppConfig.tokenKey);
    await _storage.delete(key: AppConfig.userKey);
    
    notifyListeners();
  }
  
  // Helper method to get authenticated Dio instance
  Dio get dio {
    if (_token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $_token';
    }
    return _dio;
  }
} 