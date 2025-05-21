import 'shelf_model.dart';

class MalkhanaItemModel {
  final String id;
  final int registryNumber;
  final String motherNumber;
  final String caseNumber;
  final String description;
  final String category;
  final DateTime dateReceived;
  final String receivedFrom;
  final String condition;
  final String status;
  final DateTime? disposalDate;
  final String? disposalReason;
  final String? disposalApprovedBy;
  final String? notes;
  final String registryType;
  final int registryYear;
  final List<String>? photos;
  final String? shelfId;
  final ShelfModel? shelf;

  MalkhanaItemModel({
    required this.id,
    required this.registryNumber,
    required this.motherNumber,
    required this.caseNumber,
    required this.description,
    required this.category,
    required this.dateReceived,
    required this.receivedFrom,
    required this.condition,
    required this.status,
    required this.registryType,
    required this.registryYear,
    this.disposalDate,
    this.disposalReason,
    this.disposalApprovedBy,
    this.notes,
    this.photos,
    this.shelfId,
    this.shelf,
  });

  factory MalkhanaItemModel.fromJson(Map<String, dynamic> json) {
    return MalkhanaItemModel(
      id: json['id'],
      registryNumber: json['registryNumber'],
      motherNumber: json['motherNumber'],
      caseNumber: json['caseNumber'],
      description: json['description'],
      category: json['category'],
      dateReceived: DateTime.parse(json['dateReceived']),
      receivedFrom: json['receivedFrom'],
      condition: json['condition'],
      status: json['status'],
      disposalDate: json['disposalDate'] != null ? DateTime.parse(json['disposalDate']) : null,
      disposalReason: json['disposalReason'],
      disposalApprovedBy: json['disposalApprovedBy'],
      notes: json['notes'],
      registryType: json['registryType'],
      registryYear: json['registryYear'],
      photos: json['photos'] != null ? List<String>.from(json['photos']) : null,
      shelfId: json['shelfId'],
      shelf: json['shelf'] != null ? ShelfModel.fromJson(json['shelf']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registryNumber': registryNumber,
      'motherNumber': motherNumber,
      'caseNumber': caseNumber,
      'description': description,
      'category': category,
      'dateReceived': dateReceived.toIso8601String(),
      'receivedFrom': receivedFrom,
      'condition': condition,
      'status': status,
      'disposalDate': disposalDate?.toIso8601String(),
      'disposalReason': disposalReason,
      'disposalApprovedBy': disposalApprovedBy,
      'notes': notes,
      'registryType': registryType,
      'registryYear': registryYear,
      'photos': photos,
      'shelfId': shelfId,
      'shelf': shelf?.toJson(),
    };
  }
} 