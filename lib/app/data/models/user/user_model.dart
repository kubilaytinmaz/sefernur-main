// ignore_for_file: invalid_annotation_target

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

import '../../../utils/utils.dart';
import '../../enums/enums.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
abstract class UserModel with _$UserModel {
  factory UserModel({
    String? id,
    String? email,
    String? fullName,
    String? username,
    String? firstName,
    String? lastName,
    String? phoneNumber,
    String? imageUrl,
    bool? isAnonymous,
    Map<String, dynamic>? metadata,
  // Primary active FCM token (son kullanılan cihaz token'ı)
  String? fcmToken,
  // Cihazlar arası çoklu oturum desteği için token dizisi (maks 10 önerilir)
  List<String>? fcmTokens,
    @JsonKey(
      fromJson: Parsers.rolesFromInt, 
      toJson: Parsers.rolesToInt
    )
    List<RoleType>? roles,
    @JsonKey(
      fromJson: Parsers.dateTimeFromTimestamp, 
      toJson: Parsers.dateTimeToTimestamp
    )
    DateTime? lastSeen,
    @JsonKey(
      fromJson: Parsers.dateTimeFromTimestamp, 
      toJson: Parsers.dateTimeToTimestamp
    )
    DateTime? updatedAt,
    @JsonKey(
      fromJson: Parsers.dateTimeFromTimestamp, 
      toJson: Parsers.dateTimeToTimestamp
    )
  DateTime? createdAt,
  String? referralCode,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}

