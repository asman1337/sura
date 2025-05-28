class ShelfModel {
  final String id;
  final String name;
  final String location;
  final String? category;
  final int? itemCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  ShelfModel({
    required this.id,
    required this.name,
    required this.location,
    this.category,
    this.itemCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ShelfModel.fromJson(Map<String, dynamic> json) {
    return ShelfModel(
      id: json['id'],
      name: json['name'],
      location: json['location'],
      category: json['category'],
      itemCount: json['itemCount'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'location': location,
      'category': category,
      'itemCount': itemCount,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
} 