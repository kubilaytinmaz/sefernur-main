import 'package:flutter/material.dart';

class DetailSheetConfig {
  static const double initialChildSize = 0.95; // unified
  static const double maxChildSize = 0.995;
  static const double minChildSize = 0.70;

  static BorderRadius get radius =>
      const BorderRadius.vertical(top: Radius.circular(32));
  static ShapeBorder get dialogShape =>
      RoundedRectangleBorder(borderRadius: BorderRadius.circular(28));
  static EdgeInsets contentPadding([double v = 16]) =>
      EdgeInsets.symmetric(horizontal: 20, vertical: v);
}
