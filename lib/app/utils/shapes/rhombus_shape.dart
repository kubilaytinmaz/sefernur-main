import 'dart:convert';

import 'package:morphable_shape/morphable_shape.dart';

class RhombusShape {
  static MorphableShapeBorder get decoded => RhombusShape().rhombusDecoded!;

  MorphableShapeBorder? rhombusDecoded = parseMorphableShapeBorder(json.decode(
    """{
      "type": "Path",
      "border": {
        "color": "ff000000",
        "width": 0,
        "style": "none",
        "strokeCap": "butt",
        "strokeJoin": "miter"
      },
      "path": {
        "size": {
          "width": 600,
          "height": 600
        },
        "nodes": [
          {
            "pos": {
              "dx": 412.5,
              "dy": 112.5
            },
            "prev": {
              "dx": 337.5,
              "dy": 37.5
            }
          },
          {
            "pos": {
              "dx": 450,
              "dy": 150
            }
          },
          {
            "pos": {
              "dx": 487.5,
              "dy": 187.5
            },
            "next": {
              "dx": 562.5,
              "dy": 262.5
            }
          },
          {
            "pos": {
              "dx": 487.5,
              "dy": 412.5
            },
            "prev": {
              "dx": 562.5,
              "dy": 337.5
            }
          },
          {
            "pos": {
              "dx": 450,
              "dy": 450
            }
          },
          {
            "pos": {
              "dx": 412.5,
              "dy": 487.5
            },
            "next": {
              "dx": 337.5,
              "dy": 562.5
            }
          },
          {
            "pos": {
              "dx": 187.5,
              "dy": 487.5
            },
            "prev": {
              "dx": 262.5,
              "dy": 562.5
            }
          },
          {
            "pos": {
              "dx": 150,
              "dy": 450
            }
          },
          {
            "pos": {
              "dx": 112.5,
              "dy": 412.5
            },
            "next": {
              "dx": 37.5,
              "dy": 337.5
            }
          },
          {
            "pos": {
              "dx": 112.5,
              "dy": 187.5
            },
            "prev": {
              "dx": 37.5,
              "dy": 262.5
            }
          },
          {
            "pos": {
              "dx": 150,
              "dy": 150
            }
          },
          {
            "pos": {
              "dx": 187.5,
              "dy": 112.5
            },
            "next": {
              "dx": 262.5,
              "dy": 37.5
            }
          }
        ]
      }
    }"""
  ));
}