import 'dart:convert';

import 'package:morphable_shape/morphable_shape.dart';

class BaloonShape {
  static MorphableShapeBorder get decoded => BaloonShape().baloonDecoded!;

  MorphableShapeBorder? baloonDecoded = parseMorphableShapeBorder(json.decode(
     """{
      "type":"Bubble",
      "border":{
        "color":"ff000000",
        "width":0,
        "style":"none",
        "strokeCap":"butt",
        "strokeJoin":"miter"
      },
      "side":"bottom",
      "borderRadius":"16%",
      "arrowHeight":"8%",
      "arrowWidth":"25%",
      "arrowCenterPosition":"50%",
      "arrowHeadPosition":"50%"
    }"""
  ));
}