import '../../../utils/utils.dart';

class TokenModel {

  String? tokenType;
  DateTime? expiresIn;
  String? accessToken;
  String? refreshToken;

  TokenModel({
    this.tokenType,
    this.expiresIn,
    this.accessToken,
    this.refreshToken,
  });

  bool get isExpired => expiresIn!.compareTo(DateTime.now()) <= 0;

  TokenModel.fromJson(Map<String, dynamic> json){
    final tokenJson = json['access_token'] != null ? Parsers.jwtParse(json['access_token']) : null;

    expiresIn = tokenJson != null && tokenJson["exp"] != null ? DateTime.fromMillisecondsSinceEpoch(
      int.parse((tokenJson["exp"] as double).floor().toString()) * 1000
    ) : expiresIn;

    tokenType = json['token_type'] ?? tokenJson;
    accessToken = json['access_token'] ?? accessToken;
    refreshToken = json['refresh_token'] ?? refreshToken;
  }

  Map<String, dynamic> toJson(){
    final Map<String, dynamic> data = <String, dynamic>{};
    data['token_type'] = tokenType;
    data['access_token'] = accessToken;
    data['refresh_token'] = refreshToken;
    return data;
  }
}