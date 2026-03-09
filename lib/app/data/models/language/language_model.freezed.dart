// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'language_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$LanguageModel {

 String? get name; String? get code; Map<String, String>? get texts;
/// Create a copy of LanguageModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$LanguageModelCopyWith<LanguageModel> get copyWith => _$LanguageModelCopyWithImpl<LanguageModel>(this as LanguageModel, _$identity);

  /// Serializes this LanguageModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is LanguageModel&&(identical(other.name, name) || other.name == name)&&(identical(other.code, code) || other.code == code)&&const DeepCollectionEquality().equals(other.texts, texts));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,name,code,const DeepCollectionEquality().hash(texts));

@override
String toString() {
  return 'LanguageModel(name: $name, code: $code, texts: $texts)';
}


}

/// @nodoc
abstract mixin class $LanguageModelCopyWith<$Res>  {
  factory $LanguageModelCopyWith(LanguageModel value, $Res Function(LanguageModel) _then) = _$LanguageModelCopyWithImpl;
@useResult
$Res call({
 String? name, String? code, Map<String, String>? texts
});




}
/// @nodoc
class _$LanguageModelCopyWithImpl<$Res>
    implements $LanguageModelCopyWith<$Res> {
  _$LanguageModelCopyWithImpl(this._self, this._then);

  final LanguageModel _self;
  final $Res Function(LanguageModel) _then;

/// Create a copy of LanguageModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? name = freezed,Object? code = freezed,Object? texts = freezed,}) {
  return _then(_self.copyWith(
name: freezed == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String?,code: freezed == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String?,texts: freezed == texts ? _self.texts : texts // ignore: cast_nullable_to_non_nullable
as Map<String, String>?,
  ));
}

}


/// Adds pattern-matching-related methods to [LanguageModel].
extension LanguageModelPatterns on LanguageModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _LanguageModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _LanguageModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _LanguageModel value)  $default,){
final _that = this;
switch (_that) {
case _LanguageModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _LanguageModel value)?  $default,){
final _that = this;
switch (_that) {
case _LanguageModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? name,  String? code,  Map<String, String>? texts)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _LanguageModel() when $default != null:
return $default(_that.name,_that.code,_that.texts);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? name,  String? code,  Map<String, String>? texts)  $default,) {final _that = this;
switch (_that) {
case _LanguageModel():
return $default(_that.name,_that.code,_that.texts);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? name,  String? code,  Map<String, String>? texts)?  $default,) {final _that = this;
switch (_that) {
case _LanguageModel() when $default != null:
return $default(_that.name,_that.code,_that.texts);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _LanguageModel implements LanguageModel {
   _LanguageModel({this.name, this.code, final  Map<String, String>? texts}): _texts = texts;
  factory _LanguageModel.fromJson(Map<String, dynamic> json) => _$LanguageModelFromJson(json);

@override final  String? name;
@override final  String? code;
 final  Map<String, String>? _texts;
@override Map<String, String>? get texts {
  final value = _texts;
  if (value == null) return null;
  if (_texts is EqualUnmodifiableMapView) return _texts;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableMapView(value);
}


/// Create a copy of LanguageModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$LanguageModelCopyWith<_LanguageModel> get copyWith => __$LanguageModelCopyWithImpl<_LanguageModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$LanguageModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _LanguageModel&&(identical(other.name, name) || other.name == name)&&(identical(other.code, code) || other.code == code)&&const DeepCollectionEquality().equals(other._texts, _texts));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,name,code,const DeepCollectionEquality().hash(_texts));

@override
String toString() {
  return 'LanguageModel(name: $name, code: $code, texts: $texts)';
}


}

/// @nodoc
abstract mixin class _$LanguageModelCopyWith<$Res> implements $LanguageModelCopyWith<$Res> {
  factory _$LanguageModelCopyWith(_LanguageModel value, $Res Function(_LanguageModel) _then) = __$LanguageModelCopyWithImpl;
@override @useResult
$Res call({
 String? name, String? code, Map<String, String>? texts
});




}
/// @nodoc
class __$LanguageModelCopyWithImpl<$Res>
    implements _$LanguageModelCopyWith<$Res> {
  __$LanguageModelCopyWithImpl(this._self, this._then);

  final _LanguageModel _self;
  final $Res Function(_LanguageModel) _then;

/// Create a copy of LanguageModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? name = freezed,Object? code = freezed,Object? texts = freezed,}) {
  return _then(_LanguageModel(
name: freezed == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String?,code: freezed == code ? _self.code : code // ignore: cast_nullable_to_non_nullable
as String?,texts: freezed == texts ? _self._texts : texts // ignore: cast_nullable_to_non_nullable
as Map<String, String>?,
  ));
}


}

// dart format on
