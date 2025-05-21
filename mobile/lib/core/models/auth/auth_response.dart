import 'package:sura/core/models/auth/user.dart';

class AuthResponse {
  final String accessToken;
  final User officer;

  AuthResponse({
    required this.accessToken,
    required this.officer,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      officer: User.fromJson(json['officer'] as Map<String, dynamic>),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accessToken': accessToken,
      'officer': officer.toJson(),
    };
  }
} 