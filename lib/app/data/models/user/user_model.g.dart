// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
  id: json['id'] as String?,
  email: json['email'] as String?,
  fullName: json['fullName'] as String?,
  username: json['username'] as String?,
  firstName: json['firstName'] as String?,
  lastName: json['lastName'] as String?,
  phoneNumber: json['phoneNumber'] as String?,
  imageUrl: json['imageUrl'] as String?,
  isAnonymous: json['isAnonymous'] as bool?,
  metadata: json['metadata'] as Map<String, dynamic>?,
  fcmToken: json['fcmToken'] as String?,
  fcmTokens: (json['fcmTokens'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  roles: Parsers.rolesFromInt(json['roles']),
  lastSeen: Parsers.dateTimeFromTimestamp(json['lastSeen'] as Timestamp?),
  updatedAt: Parsers.dateTimeFromTimestamp(json['updatedAt'] as Timestamp?),
  createdAt: Parsers.dateTimeFromTimestamp(json['createdAt'] as Timestamp?),
  referralCode: json['referralCode'] as String?,
);

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'email': instance.email,
      'fullName': instance.fullName,
      'username': instance.username,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'phoneNumber': instance.phoneNumber,
      'imageUrl': instance.imageUrl,
      'isAnonymous': instance.isAnonymous,
      'metadata': instance.metadata,
      'fcmToken': instance.fcmToken,
      'fcmTokens': instance.fcmTokens,
      'roles': Parsers.rolesToInt(instance.roles),
      'lastSeen': Parsers.dateTimeToTimestamp(instance.lastSeen),
      'updatedAt': Parsers.dateTimeToTimestamp(instance.updatedAt),
      'createdAt': Parsers.dateTimeToTimestamp(instance.createdAt),
      'referralCode': instance.referralCode,
    };
