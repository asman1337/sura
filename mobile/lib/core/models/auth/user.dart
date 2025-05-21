class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String badgeNumber;
  final String userType;
  final String? gender;
  final String? profilePhotoUrl;
  final Rank? rank;
  final Organization? organization;
  final Unit? primaryUnit;
  final Department? department;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.badgeNumber,
    required this.userType,
    this.gender,
    this.profilePhotoUrl,
    this.rank,
    this.organization,
    this.primaryUnit,
    this.department,
  });

  String get fullName => '$firstName $lastName';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      badgeNumber: json['badgeNumber'] as String,
      userType: json['userType'] as String,
      gender: json['gender'] as String?,
      profilePhotoUrl: json['profilePhotoUrl'] as String?,
      rank: json['rank'] != null ? Rank.fromJson(json['rank']) : null,
      organization: json['organization'] != null ? Organization.fromJson(json['organization']) : null,
      primaryUnit: json['primaryUnit'] != null ? Unit.fromJson(json['primaryUnit']) : null,
      department: json['department'] != null ? Department.fromJson(json['department']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'badgeNumber': badgeNumber,
      'userType': userType,
      'gender': gender,
      'profilePhotoUrl': profilePhotoUrl,
      'rank': rank?.toJson(),
      'organization': organization?.toJson(),
      'primaryUnit': primaryUnit?.toJson(),
      'department': department?.toJson(),
    };
  }
}

class Rank {
  final String id;
  final String name;
  final String? abbreviation;
  final int? level;

  Rank({
    required this.id,
    required this.name,
    this.abbreviation,
    this.level,
  });

  factory Rank.fromJson(Map<String, dynamic> json) {
    return Rank(
      id: json['id'] as String,
      name: json['name'] as String,
      abbreviation: json['abbreviation'] as String?,
      level: json['level'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'abbreviation': abbreviation,
      'level': level,
    };
  }
}

class Organization {
  final String id;
  final String name;
  final String? code;
  final String? type;

  Organization({
    required this.id,
    required this.name,
    this.code,
    this.type,
  });

  factory Organization.fromJson(Map<String, dynamic> json) {
    return Organization(
      id: json['id'] as String,
      name: json['name'] as String,
      code: json['code'] as String?,
      type: json['type'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'type': type,
    };
  }
}

class Unit {
  final String id;
  final String name;
  final String? code;
  final String? type;

  Unit({
    required this.id,
    required this.name,
    this.code,
    this.type,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'] as String,
      name: json['name'] as String,
      code: json['code'] as String?,
      type: json['type'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'type': type,
    };
  }
}

class Department {
  final String id;
  final String name;

  Department({
    required this.id,
    required this.name,
  });

  factory Department.fromJson(Map<String, dynamic> json) {
    return Department(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
} 