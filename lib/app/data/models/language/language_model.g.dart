// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'language_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_LanguageModel _$LanguageModelFromJson(Map<String, dynamic> json) =>
    _LanguageModel(
      name: json['name'] as String?,
      code: json['code'] as String?,
      texts: (json['texts'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
    );

Map<String, dynamic> _$LanguageModelToJson(_LanguageModel instance) =>
    <String, dynamic>{
      'name': instance.name,
      'code': instance.code,
      'texts': instance.texts,
    };
