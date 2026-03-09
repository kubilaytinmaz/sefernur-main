import 'package:freezed_annotation/freezed_annotation.dart';

part 'language_model.freezed.dart';
part 'language_model.g.dart';

@freezed
abstract class LanguageModel with _$LanguageModel {

  factory LanguageModel({
    String? name,
    String? code,
    Map<String, String>? texts,
  }) = _LanguageModel;

  factory LanguageModel.fromJson(Map<String, dynamic> json) => _$LanguageModelFromJson(json);
}