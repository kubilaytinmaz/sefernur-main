import 'package:cloud_firestore/cloud_firestore.dart';

/// Firestore stored visa application model
class VisaApplicationModel {
  final String? id; // firestore doc id
  final String userId;
  final String firstName;
  final String lastName;
  final String passportNumber;
  final String phone;
  final String email;
  final String? address;
  final String country;
  final String city;
  final String purpose; // Umre, Hac, Turizm...
  final DateTime departureDate;
  final DateTime returnDate;
  final double fee; // captured at submission
  final String currency;
  final String status; // received, processing, completed, rejected
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? estimatedCompletion;
  final List<String> requiredFileUrls; // passport, photo, id (ordered)
  final List<String> additionalFileUrls; // optional uploads
  final String? paymentReceiptUrl; // dekont
  final String? paymentNote; // payment reference / açıklama
  final String? adminNote; // internal admin note
  final String? userNote; // user provided extra note
  final String? maritalStatus; // Medeni Durum (Bekar, Evli, Dul, Boşanmış)

  VisaApplicationModel({
    this.id,
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.passportNumber,
    required this.phone,
    required this.email,
    this.address,
    required this.country,
    required this.city,
    required this.purpose,
    required this.departureDate,
    required this.returnDate,
    required this.fee,
    this.currency = 'USD',
    this.status = 'received',
    required this.createdAt,
    required this.updatedAt,
    this.estimatedCompletion,
    this.requiredFileUrls = const [],
    this.additionalFileUrls = const [],
    this.paymentReceiptUrl,
    this.paymentNote,
    this.adminNote,
    this.userNote,
    this.maritalStatus,
  });

  bool get isTerminal => ['completed', 'rejected'].contains(status);

  factory VisaApplicationModel.fromJson(Map<String, dynamic> json, String id) {
    return VisaApplicationModel(
      id: id,
      userId: json['userId'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      passportNumber: json['passportNumber'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      address: json['address'],
      country: json['country'] ?? '',
      city: json['city'] ?? '',
      purpose: json['purpose'] ?? '',
      departureDate: _parseDate(json['departureDate']),
      returnDate: _parseDate(json['returnDate']),
      fee: (json['fee'] is int) ? (json['fee'] as int).toDouble() : (json['fee'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'USD',
      status: json['status'] ?? 'received',
      createdAt: _parseDate(json['createdAt']),
      updatedAt: _parseDate(json['updatedAt']),
      estimatedCompletion: json['estimatedCompletion'] != null ? _parseDate(json['estimatedCompletion']) : null,
      requiredFileUrls: List<String>.from(json['requiredFileUrls'] ?? const []),
      additionalFileUrls: List<String>.from(json['additionalFileUrls'] ?? const []),
      paymentReceiptUrl: json['paymentReceiptUrl'],
      paymentNote: json['paymentNote'],
      adminNote: json['adminNote'],
      userNote: json['userNote'],
      maritalStatus: json['maritalStatus'],
    );
  }

  Map<String, dynamic> toJson() => {
        'userId': userId,
        'firstName': firstName,
        'lastName': lastName,
        'passportNumber': passportNumber,
        'phone': phone,
        'email': email,
        if (address != null && address!.isNotEmpty) 'address': address,
        'country': country,
        'city': city,
        'purpose': purpose,
        'departureDate': departureDate.toIso8601String(),
        'returnDate': returnDate.toIso8601String(),
        'fee': fee,
        'currency': currency,
        'status': status,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        if (estimatedCompletion != null) 'estimatedCompletion': estimatedCompletion!.toIso8601String(),
        'requiredFileUrls': requiredFileUrls,
        'additionalFileUrls': additionalFileUrls,
        if (paymentReceiptUrl != null) 'paymentReceiptUrl': paymentReceiptUrl,
        if (paymentNote != null) 'paymentNote': paymentNote,
        if (adminNote != null) 'adminNote': adminNote,
        if (userNote != null) 'userNote': userNote,
        if (maritalStatus != null) 'maritalStatus': maritalStatus,
      };

  VisaApplicationModel copyWith({
    String? id,
    String? userId,
    String? firstName,
    String? lastName,
    String? passportNumber,
    String? phone,
    String? email,
    String? address,
    String? country,
    String? city,
    String? purpose,
    DateTime? departureDate,
    DateTime? returnDate,
    double? fee,
    String? currency,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? estimatedCompletion,
    List<String>? requiredFileUrls,
    List<String>? additionalFileUrls,
    String? paymentReceiptUrl,
    String? paymentNote,
    String? adminNote,
    String? userNote,
    String? maritalStatus,
  }) {
    return VisaApplicationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      passportNumber: passportNumber ?? this.passportNumber,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      address: address ?? this.address,
      country: country ?? this.country,
      city: city ?? this.city,
      purpose: purpose ?? this.purpose,
      departureDate: departureDate ?? this.departureDate,
      returnDate: returnDate ?? this.returnDate,
      fee: fee ?? this.fee,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      estimatedCompletion: estimatedCompletion ?? this.estimatedCompletion,
      requiredFileUrls: requiredFileUrls ?? this.requiredFileUrls,
      additionalFileUrls: additionalFileUrls ?? this.additionalFileUrls,
      paymentReceiptUrl: paymentReceiptUrl ?? this.paymentReceiptUrl,
      paymentNote: paymentNote ?? this.paymentNote,
      adminNote: adminNote ?? this.adminNote,
      userNote: userNote ?? this.userNote,
      maritalStatus: maritalStatus ?? this.maritalStatus,
    );
  }

  static DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.now();
    if (v is Timestamp) return v.toDate();
    return DateTime.tryParse(v.toString()) ?? DateTime.now();
  }
}
