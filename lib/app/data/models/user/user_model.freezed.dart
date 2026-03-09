// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$UserModel {

 String? get id; String? get email; String? get fullName; String? get username; String? get firstName; String? get lastName; String? get phoneNumber; String? get imageUrl; bool? get isAnonymous; Map<String, dynamic>? get metadata;// Primary active FCM token (son kullanılan cihaz token'ı)
 String? get fcmToken;// Cihazlar arası çoklu oturum desteği için token dizisi (maks 10 önerilir)
 List<String>? get fcmTokens;@JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt) List<RoleType>? get roles;@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? get lastSeen;@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? get updatedAt;@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? get createdAt; String? get referralCode;
/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserModelCopyWith<UserModel> get copyWith => _$UserModelCopyWithImpl<UserModel>(this as UserModel, _$identity);

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.username, username) || other.username == username)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.phoneNumber, phoneNumber) || other.phoneNumber == phoneNumber)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.isAnonymous, isAnonymous) || other.isAnonymous == isAnonymous)&&const DeepCollectionEquality().equals(other.metadata, metadata)&&(identical(other.fcmToken, fcmToken) || other.fcmToken == fcmToken)&&const DeepCollectionEquality().equals(other.fcmTokens, fcmTokens)&&const DeepCollectionEquality().equals(other.roles, roles)&&(identical(other.lastSeen, lastSeen) || other.lastSeen == lastSeen)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.referralCode, referralCode) || other.referralCode == referralCode));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,fullName,username,firstName,lastName,phoneNumber,imageUrl,isAnonymous,const DeepCollectionEquality().hash(metadata),fcmToken,const DeepCollectionEquality().hash(fcmTokens),const DeepCollectionEquality().hash(roles),lastSeen,updatedAt,createdAt,referralCode);

@override
String toString() {
  return 'UserModel(id: $id, email: $email, fullName: $fullName, username: $username, firstName: $firstName, lastName: $lastName, phoneNumber: $phoneNumber, imageUrl: $imageUrl, isAnonymous: $isAnonymous, metadata: $metadata, fcmToken: $fcmToken, fcmTokens: $fcmTokens, roles: $roles, lastSeen: $lastSeen, updatedAt: $updatedAt, createdAt: $createdAt, referralCode: $referralCode)';
}


}

/// @nodoc
abstract mixin class $UserModelCopyWith<$Res>  {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) _then) = _$UserModelCopyWithImpl;
@useResult
$Res call({
 String? id, String? email, String? fullName, String? username, String? firstName, String? lastName, String? phoneNumber, String? imageUrl, bool? isAnonymous, Map<String, dynamic>? metadata, String? fcmToken, List<String>? fcmTokens,@JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt) List<RoleType>? roles,@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? lastSeen,@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? updatedAt,@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? createdAt, String? referralCode
});




}
/// @nodoc
class _$UserModelCopyWithImpl<$Res>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._self, this._then);

  final UserModel _self;
  final $Res Function(UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? email = freezed,Object? fullName = freezed,Object? username = freezed,Object? firstName = freezed,Object? lastName = freezed,Object? phoneNumber = freezed,Object? imageUrl = freezed,Object? isAnonymous = freezed,Object? metadata = freezed,Object? fcmToken = freezed,Object? fcmTokens = freezed,Object? roles = freezed,Object? lastSeen = freezed,Object? updatedAt = freezed,Object? createdAt = freezed,Object? referralCode = freezed,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,fullName: freezed == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String?,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,firstName: freezed == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String?,lastName: freezed == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String?,phoneNumber: freezed == phoneNumber ? _self.phoneNumber : phoneNumber // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,isAnonymous: freezed == isAnonymous ? _self.isAnonymous : isAnonymous // ignore: cast_nullable_to_non_nullable
as bool?,metadata: freezed == metadata ? _self.metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,fcmToken: freezed == fcmToken ? _self.fcmToken : fcmToken // ignore: cast_nullable_to_non_nullable
as String?,fcmTokens: freezed == fcmTokens ? _self.fcmTokens : fcmTokens // ignore: cast_nullable_to_non_nullable
as List<String>?,roles: freezed == roles ? _self.roles : roles // ignore: cast_nullable_to_non_nullable
as List<RoleType>?,lastSeen: freezed == lastSeen ? _self.lastSeen : lastSeen // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,referralCode: freezed == referralCode ? _self.referralCode : referralCode // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [UserModel].
extension UserModelPatterns on UserModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserModel value)  $default,){
final _that = this;
switch (_that) {
case _UserModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserModel value)?  $default,){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? id,  String? email,  String? fullName,  String? username,  String? firstName,  String? lastName,  String? phoneNumber,  String? imageUrl,  bool? isAnonymous,  Map<String, dynamic>? metadata,  String? fcmToken,  List<String>? fcmTokens, @JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt)  List<RoleType>? roles, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? lastSeen, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? updatedAt, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? createdAt,  String? referralCode)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.email,_that.fullName,_that.username,_that.firstName,_that.lastName,_that.phoneNumber,_that.imageUrl,_that.isAnonymous,_that.metadata,_that.fcmToken,_that.fcmTokens,_that.roles,_that.lastSeen,_that.updatedAt,_that.createdAt,_that.referralCode);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? id,  String? email,  String? fullName,  String? username,  String? firstName,  String? lastName,  String? phoneNumber,  String? imageUrl,  bool? isAnonymous,  Map<String, dynamic>? metadata,  String? fcmToken,  List<String>? fcmTokens, @JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt)  List<RoleType>? roles, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? lastSeen, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? updatedAt, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? createdAt,  String? referralCode)  $default,) {final _that = this;
switch (_that) {
case _UserModel():
return $default(_that.id,_that.email,_that.fullName,_that.username,_that.firstName,_that.lastName,_that.phoneNumber,_that.imageUrl,_that.isAnonymous,_that.metadata,_that.fcmToken,_that.fcmTokens,_that.roles,_that.lastSeen,_that.updatedAt,_that.createdAt,_that.referralCode);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? id,  String? email,  String? fullName,  String? username,  String? firstName,  String? lastName,  String? phoneNumber,  String? imageUrl,  bool? isAnonymous,  Map<String, dynamic>? metadata,  String? fcmToken,  List<String>? fcmTokens, @JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt)  List<RoleType>? roles, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? lastSeen, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? updatedAt, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp)  DateTime? createdAt,  String? referralCode)?  $default,) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.email,_that.fullName,_that.username,_that.firstName,_that.lastName,_that.phoneNumber,_that.imageUrl,_that.isAnonymous,_that.metadata,_that.fcmToken,_that.fcmTokens,_that.roles,_that.lastSeen,_that.updatedAt,_that.createdAt,_that.referralCode);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UserModel implements UserModel {
   _UserModel({this.id, this.email, this.fullName, this.username, this.firstName, this.lastName, this.phoneNumber, this.imageUrl, this.isAnonymous, final  Map<String, dynamic>? metadata, this.fcmToken, final  List<String>? fcmTokens, @JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt) final  List<RoleType>? roles, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) this.lastSeen, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) this.updatedAt, @JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) this.createdAt, this.referralCode}): _metadata = metadata,_fcmTokens = fcmTokens,_roles = roles;
  factory _UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

@override final  String? id;
@override final  String? email;
@override final  String? fullName;
@override final  String? username;
@override final  String? firstName;
@override final  String? lastName;
@override final  String? phoneNumber;
@override final  String? imageUrl;
@override final  bool? isAnonymous;
 final  Map<String, dynamic>? _metadata;
@override Map<String, dynamic>? get metadata {
  final value = _metadata;
  if (value == null) return null;
  if (_metadata is EqualUnmodifiableMapView) return _metadata;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}

// Primary active FCM token (son kullanılan cihaz token'ı)
@override final  String? fcmToken;
// Cihazlar arası çoklu oturum desteği için token dizisi (maks 10 önerilir)
 final  List<String>? _fcmTokens;
// Cihazlar arası çoklu oturum desteği için token dizisi (maks 10 önerilir)
@override List<String>? get fcmTokens {
  final value = _fcmTokens;
  if (value == null) return null;
  if (_fcmTokens is EqualUnmodifiableListView) return _fcmTokens;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

 final  List<RoleType>? _roles;
@override@JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt) List<RoleType>? get roles {
  final value = _roles;
  if (value == null) return null;
  if (_roles is EqualUnmodifiableListView) return _roles;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

@override@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) final  DateTime? lastSeen;
@override@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) final  DateTime? updatedAt;
@override@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) final  DateTime? createdAt;
@override final  String? referralCode;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserModelCopyWith<_UserModel> get copyWith => __$UserModelCopyWithImpl<_UserModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.email, email) || other.email == email)&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.username, username) || other.username == username)&&(identical(other.firstName, firstName) || other.firstName == firstName)&&(identical(other.lastName, lastName) || other.lastName == lastName)&&(identical(other.phoneNumber, phoneNumber) || other.phoneNumber == phoneNumber)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.isAnonymous, isAnonymous) || other.isAnonymous == isAnonymous)&&const DeepCollectionEquality().equals(other._metadata, _metadata)&&(identical(other.fcmToken, fcmToken) || other.fcmToken == fcmToken)&&const DeepCollectionEquality().equals(other._fcmTokens, _fcmTokens)&&const DeepCollectionEquality().equals(other._roles, _roles)&&(identical(other.lastSeen, lastSeen) || other.lastSeen == lastSeen)&&(identical(other.updatedAt, updatedAt) || other.updatedAt == updatedAt)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.referralCode, referralCode) || other.referralCode == referralCode));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,email,fullName,username,firstName,lastName,phoneNumber,imageUrl,isAnonymous,const DeepCollectionEquality().hash(_metadata),fcmToken,const DeepCollectionEquality().hash(_fcmTokens),const DeepCollectionEquality().hash(_roles),lastSeen,updatedAt,createdAt,referralCode);

@override
String toString() {
  return 'UserModel(id: $id, email: $email, fullName: $fullName, username: $username, firstName: $firstName, lastName: $lastName, phoneNumber: $phoneNumber, imageUrl: $imageUrl, isAnonymous: $isAnonymous, metadata: $metadata, fcmToken: $fcmToken, fcmTokens: $fcmTokens, roles: $roles, lastSeen: $lastSeen, updatedAt: $updatedAt, createdAt: $createdAt, referralCode: $referralCode)';
}


}

/// @nodoc
abstract mixin class _$UserModelCopyWith<$Res> implements $UserModelCopyWith<$Res> {
  factory _$UserModelCopyWith(_UserModel value, $Res Function(_UserModel) _then) = __$UserModelCopyWithImpl;
@override @useResult
$Res call({
 String? id, String? email, String? fullName, String? username, String? firstName, String? lastName, String? phoneNumber, String? imageUrl, bool? isAnonymous, Map<String, dynamic>? metadata, String? fcmToken, List<String>? fcmTokens,@JsonKey(fromJson: Parsers.rolesFromInt, toJson: Parsers.rolesToInt) List<RoleType>? roles,@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? lastSeen,@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? updatedAt,@JsonKey(fromJson: Parsers.dateTimeFromTimestamp, toJson: Parsers.dateTimeToTimestamp) DateTime? createdAt, String? referralCode
});




}
/// @nodoc
class __$UserModelCopyWithImpl<$Res>
    implements _$UserModelCopyWith<$Res> {
  __$UserModelCopyWithImpl(this._self, this._then);

  final _UserModel _self;
  final $Res Function(_UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? email = freezed,Object? fullName = freezed,Object? username = freezed,Object? firstName = freezed,Object? lastName = freezed,Object? phoneNumber = freezed,Object? imageUrl = freezed,Object? isAnonymous = freezed,Object? metadata = freezed,Object? fcmToken = freezed,Object? fcmTokens = freezed,Object? roles = freezed,Object? lastSeen = freezed,Object? updatedAt = freezed,Object? createdAt = freezed,Object? referralCode = freezed,}) {
  return _then(_UserModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,fullName: freezed == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String?,username: freezed == username ? _self.username : username // ignore: cast_nullable_to_non_nullable
as String?,firstName: freezed == firstName ? _self.firstName : firstName // ignore: cast_nullable_to_non_nullable
as String?,lastName: freezed == lastName ? _self.lastName : lastName // ignore: cast_nullable_to_non_nullable
as String?,phoneNumber: freezed == phoneNumber ? _self.phoneNumber : phoneNumber // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,isAnonymous: freezed == isAnonymous ? _self.isAnonymous : isAnonymous // ignore: cast_nullable_to_non_nullable
as bool?,metadata: freezed == metadata ? _self._metadata : metadata // ignore: cast_nullable_to_non_nullable
as Map<String, dynamic>?,fcmToken: freezed == fcmToken ? _self.fcmToken : fcmToken // ignore: cast_nullable_to_non_nullable
as String?,fcmTokens: freezed == fcmTokens ? _self._fcmTokens : fcmTokens // ignore: cast_nullable_to_non_nullable
as List<String>?,roles: freezed == roles ? _self._roles : roles // ignore: cast_nullable_to_non_nullable
as List<RoleType>?,lastSeen: freezed == lastSeen ? _self.lastSeen : lastSeen // ignore: cast_nullable_to_non_nullable
as DateTime?,updatedAt: freezed == updatedAt ? _self.updatedAt : updatedAt // ignore: cast_nullable_to_non_nullable
as DateTime?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,referralCode: freezed == referralCode ? _self.referralCode : referralCode // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
