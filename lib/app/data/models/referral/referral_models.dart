import 'package:cloud_firestore/cloud_firestore.dart';

DateTime? _dtFromTs(dynamic v) => v is Timestamp ? v.toDate() : v as DateTime?;
Timestamp? _tsFromDt(DateTime? v) => v == null ? null : Timestamp.fromDate(v);

enum ReferralStatus { registered, booking, completed, rejected }

enum ReferralEarningStatus { pending, approved, rejected }

enum ReferralEarningType { signup, booking, bonus }

class ReferralModel {
  final String? id;
  final String inviterId;
  final String inviteeId;
  final String? code;
  final ReferralStatus status;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  ReferralModel({
    required this.id,
    required this.inviterId,
    required this.inviteeId,
    this.code,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });
  factory ReferralModel.fromJson(Map<String,dynamic> json, String id) => ReferralModel(
    id: id,
    inviterId: json['inviterId'] as String,
    inviteeId: json['inviteeId'] as String,
    code: json['code'] as String?,
    status: ReferralStatus.values.firstWhere(
      (e) => e.name == (json['status'] as String? ?? 'registered'),
      orElse: () => ReferralStatus.registered,
    ),
    createdAt: _dtFromTs(json['createdAt']),
    updatedAt: _dtFromTs(json['updatedAt']),
  );
  Map<String,dynamic> toJson() => {
    'inviterId': inviterId,
    'inviteeId': inviteeId,
    'code': code,
    'status': status.name,
    'createdAt': _tsFromDt(createdAt ?? DateTime.now()),
    'updatedAt': _tsFromDt(updatedAt ?? DateTime.now()),
  };
}

class ReferralConfigModel {
  final String? id;
  final String name;
  final bool active;
  final double signupReward;
  final double bookingRewardPercent;
  final double bookingRewardFixed;
  final DateTime? startsAt;
  final DateTime? endsAt;
  ReferralConfigModel({
    this.id,
    required this.name,
    required this.active,
    required this.signupReward,
    required this.bookingRewardPercent,
    required this.bookingRewardFixed,
    this.startsAt,
    this.endsAt,
  });
  factory ReferralConfigModel.fromJson(Map<String,dynamic> json, String id) => ReferralConfigModel(
    id: id,
    name: json['name'] ?? 'Default',
    active: json['active'] ?? true,
    signupReward: (json['signupReward'] ?? 0).toDouble(),
    bookingRewardPercent: (json['bookingRewardPercent'] ?? 0).toDouble(),
    bookingRewardFixed: (json['bookingRewardFixed'] ?? 0).toDouble(),
    startsAt: _dtFromTs(json['startsAt']),
    endsAt: _dtFromTs(json['endsAt']),
  );
  Map<String,dynamic> toJson() => {
    'name': name,
    'active': active,
    'signupReward': signupReward,
    'bookingRewardPercent': bookingRewardPercent,
    'bookingRewardFixed': bookingRewardFixed,
    'startsAt': _tsFromDt(startsAt),
    'endsAt': _tsFromDt(endsAt),
  };
}

class ReferralEarningModel {
  final String? id;
  final String referralId;
  final String userId; // who earns (inviter mostly)
  final double amount;
  final ReferralEarningType type;
  final ReferralEarningStatus status;
  final DateTime? createdAt;
  ReferralEarningModel({
    this.id,
    required this.referralId,
    required this.userId,
    required this.amount,
    required this.type,
    required this.status,
    this.createdAt,
  });
  factory ReferralEarningModel.fromJson(Map<String,dynamic> json, String id) => ReferralEarningModel(
    id: id,
    referralId: json['referralId'] as String,
    userId: json['userId'] as String,
    amount: (json['amount'] ?? 0).toDouble(),
    type: ReferralEarningType.values.firstWhere(
      (e) => e.name == (json['type'] as String? ?? 'signup'),
      orElse: () => ReferralEarningType.signup,
    ),
    status: ReferralEarningStatus.values.firstWhere(
      (e) => e.name == (json['status'] as String? ?? 'pending'),
      orElse: () => ReferralEarningStatus.pending,
    ),
    createdAt: _dtFromTs(json['createdAt']),
  );
  Map<String,dynamic> toJson() => {
    'referralId': referralId,
    'userId': userId,
    'amount': amount,
    'type': type.name,
    'status': status.name,
    'createdAt': _tsFromDt(createdAt ?? DateTime.now()),
  };
}

class ReferralWithdrawalModel {
  final String? id;
  final String userId;
  final double amount;
  final String ibanOrAccount;
  final DateTime? createdAt;
  final ReferralEarningStatus status; // reuse statuses
  ReferralWithdrawalModel({
    this.id,
    required this.userId,
    required this.amount,
    required this.ibanOrAccount,
    this.createdAt,
    this.status = ReferralEarningStatus.pending,
  });
  factory ReferralWithdrawalModel.fromJson(Map<String,dynamic> json, String id) => ReferralWithdrawalModel(
    id: id,
    userId: json['userId'] as String,
    amount: (json['amount'] ?? 0).toDouble(),
    ibanOrAccount: json['ibanOrAccount'] ?? '',
    createdAt: _dtFromTs(json['createdAt']),
    status: ReferralEarningStatus.values.firstWhere(
      (e) => e.name == (json['status'] as String? ?? 'pending'),
      orElse: () => ReferralEarningStatus.pending,
    ),
  );
  Map<String,dynamic> toJson() => {
    'userId': userId,
    'amount': amount,
    'ibanOrAccount': ibanOrAccount,
    'status': status.name,
    'createdAt': _tsFromDt(createdAt ?? DateTime.now()),
  };
}
