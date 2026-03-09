import 'package:flutter/material.dart';

import '../view/themes/colors/app_colors.dart';

/// Turkish localized date picker helper ensuring consistent theming.
Future<DateTime?> showTrDatePicker({
  required BuildContext context,
  required DateTime initialDate,
  DateTime? firstDate,
  DateTime? lastDate,
}) {
  final theme = Theme.of(context);
  return showDatePicker(
    context: context,
    locale: const Locale('tr', 'TR'),
    initialDate: initialDate,
    firstDate: firstDate ?? DateTime.now(),
    lastDate: lastDate ?? DateTime.now().add(const Duration(days: 365 * 3)),
    builder: (ctx, child) {
      final cs = theme.colorScheme;
      return Theme(
        data: theme.copyWith(
          colorScheme: cs.copyWith(
            primary: AppColors.primary,
            onPrimary: Colors.white,
            surface: cs.surface,
          ),
          textButtonTheme: TextButtonThemeData(
            style: TextButton.styleFrom(foregroundColor: AppColors.primary),
          ),
        ),
        child: child!,
      );
    },
  );
}