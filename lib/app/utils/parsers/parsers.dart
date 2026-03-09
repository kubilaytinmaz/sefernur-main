import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';

import '../../data/enums/enums.dart';

class Parsers{
  // --------------------------------------------> DateTime & Timestamp
  static Timestamp? dateTimeToTimestamp(DateTime? dateTime) => dateTime != null ? Timestamp.fromDate(dateTime) : null;
  static DateTime? dateTimeFromTimestamp(Timestamp? timestamp) => timestamp?.toDate();

  // --------------------------------------------> RoleType & int
  static List<int>? rolesToInt(List<RoleType>? roles) => roles?.map((e) => e.index).toList();
  
  /// Parse roles from Firestore. Handles:
  /// - List<int> (standard mobile format, e.g. [3])
  /// - List<String> (legacy web format, e.g. ["user"])
  /// - single int or string
  static List<RoleType>? rolesFromInt(dynamic roles){
    if(roles == null) return null;
    
    // Map string role names to enum (must match enum order: admin=0, agent=1, moderator=2, user=3)
    const roleNameMap = {
      'admin': RoleType.admin,
      'agent': RoleType.agent,
      'moderator': RoleType.moderator,
      'user': RoleType.user,
    };
    
    if(roles is List) {
      return roles.map((e) {
        if (e is int) return RoleType.values[e];
        if (e is String) return roleNameMap[e.toLowerCase()] ?? RoleType.user;
        return RoleType.user;
      }).toList();
    } else if (roles is int) {
      return [RoleType.values[roles]];
    } else if (roles is String) {
      return [roleNameMap[roles.toLowerCase()] ?? RoleType.user];
    }
    return null;
  }

  // --------------------------------------------> Map<String, dynamic> & User
  static Map<String, dynamic> jwtParse(String token) {
    final parts = token.split('.');

    if (parts.length != 3) {
      throw Exception('Invalid token');
    }

    final payload = decodeBase64(parts[1]);

    final payloadMap = json.decode(payload);

    if (payloadMap is! Map<String, dynamic>) {
      throw Exception('Invalid payload');
    }

    return payloadMap;
  }

  static String decodeBase64(String str) {
    String output = str.replaceAll('-', '+').replaceAll('_', '/');

    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw Exception('Illegal base64url string');
    }

    return utf8.decode(base64Url.decode(output));
  }
}