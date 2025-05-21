class LoginRequest {
  final String? email;
  final String? username;
  final String password;

  LoginRequest({
    this.email,
    this.username,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    if (email != null) data['email'] = email;
    if (username != null) data['username'] = username;
    data['password'] = password;
    return data;
  }
} 