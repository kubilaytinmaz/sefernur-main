import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../data/services/currency/currency_service.dart';

/// TL fiyat girişi yapıldığında otomatik USD karşılığını gösteren widget
/// Admin formlarında fiyat girişi için kullanılır
/// 
/// NOT: Tüm fiyatlar TL olarak girilir ve kaydedilir.
/// USD karşılığı sadece bilgi amaçlı gösterilir.
class CurrencyPriceField extends StatefulWidget {
  const CurrencyPriceField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.validator,
    this.onChanged,
    this.prefixIcon,
    this.enabled = true,
    this.isRequired = true,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final IconData? prefixIcon;
  final bool enabled;
  final bool isRequired;

  @override
  State<CurrencyPriceField> createState() => _CurrencyPriceFieldState();
}

class _CurrencyPriceFieldState extends State<CurrencyPriceField> {
  late final CurrencyService _currencyService;

  @override
  void initState() {
    super.initState();
    _currencyService = Get.find<CurrencyService>();
    widget.controller.addListener(_onValueChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onValueChanged);
    super.dispose();
  }

  void _onValueChanged() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final tryValue = double.tryParse(widget.controller.text) ?? 0;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: widget.controller,
          enabled: widget.enabled,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
          ],
          validator: widget.validator ?? (widget.isRequired ? (v) {
            if (v == null || v.isEmpty) return 'Bu alan zorunludur';
            final val = double.tryParse(v);
            if (val == null || val < 0) return 'Geçerli bir fiyat girin';
            return null;
          } : null),
          onChanged: widget.onChanged,
          style: TextStyle(color: isDark ? Colors.white : Colors.black87),
          decoration: InputDecoration(
            labelText: '${widget.label} (TL)',
            hintText: widget.hint ?? 'TL cinsinden girin',
            prefixIcon: Icon(widget.prefixIcon ?? Icons.currency_lira),
            suffixText: '₺',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[400]!),
            ),
            filled: true,
            fillColor: isDark ? Colors.grey[900] : Colors.grey[50],
            labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
            hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[500]),
          ),
        ),
        if (tryValue > 0) ...[
          SizedBox(height: 8.h),
          Obx(() {
            final usdValue = _currencyService.toUSD(tryValue);
            final usdFormatted = NumberFormat('#,##0.00', 'tr_TR').format(usdValue);
            return Container(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: isDark ? Colors.blue[900]!.withValues(alpha: 0.3) : Colors.blue[50],
                borderRadius: BorderRadius.circular(8.r),
                border: Border.all(color: isDark ? Colors.blue[700]! : Colors.blue[200]!),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.attach_money, size: 16.sp, color: isDark ? Colors.blue[300] : Colors.blue[700]),
                  SizedBox(width: 6.w),
                  Text(
                    'USD Karşılığı: \$$usdFormatted',
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.blue[300] : Colors.blue[700],
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    '(Kur: ${_currencyService.rate.toStringAsFixed(2)})',
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: isDark ? Colors.blue[400] : Colors.blue[600],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ],
    );
  }
}

/// Her iki para biriminde fiyat gösteren widget (sadece görüntüleme için)
/// TL bazlı sistem - tryAmount parametresi TL cinsinden
class DualCurrencyDisplay extends StatelessWidget {
  const DualCurrencyDisplay({
    super.key,
    required this.tryAmount,
    this.style,
    this.usdStyle,
    this.separator = ' / ',
    this.showBoth = true,
    this.primaryCurrency = Currency.try_,
  });

  final double tryAmount;
  final TextStyle? style;
  final TextStyle? usdStyle;
  final String separator;
  final bool showBoth;
  final Currency primaryCurrency;

  @override
  Widget build(BuildContext context) {
    final currencyService = Get.find<CurrencyService>();
    
    return Obx(() {
      final usdAmount = currencyService.toUSD(tryAmount);
      final tryFormatted = NumberFormat('#,##0', 'tr_TR').format(tryAmount);
      final usdFormatted = NumberFormat('#,##0', 'tr_TR').format(usdAmount);
      
      if (!showBoth) {
        if (primaryCurrency == Currency.try_) {
          return Text(
            '$tryFormatted₺',
            style: style,
          );
        } else {
          return Text(
            '\$$usdFormatted',
            style: style,
          );
        }
      }
      
      return RichText(
        text: TextSpan(
          children: [
            TextSpan(
              text: '$tryFormatted₺',
              style: style ?? TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            TextSpan(
              text: separator,
              style: style?.copyWith(fontWeight: FontWeight.normal) ?? TextStyle(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            TextSpan(
              text: '\$$usdFormatted',
              style: usdStyle ?? style?.copyWith(
                color: Colors.blue[700],
              ) ?? TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: Colors.blue[700],
              ),
            ),
          ],
        ),
      );
    });
  }
}

/// Para birimi seçenekleri
enum Currency { usd, try_ }

/// Kompakt fiyat gösterimi (card'larda kullanım için)
/// TL bazlı sistem - tryAmount parametresi TL cinsinden
class CompactPriceDisplay extends StatelessWidget {
  const CompactPriceDisplay({
    super.key,
    required this.tryAmount,
    this.discountedTryAmount,
    this.fontSize,
    this.showUsd = true,
  });

  final double tryAmount;
  final double? discountedTryAmount;
  final double? fontSize;
  final bool showUsd;

  @override
  Widget build(BuildContext context) {
    final currencyService = Get.find<CurrencyService>();
    final hasDiscount = discountedTryAmount != null && discountedTryAmount! < tryAmount;
    final displayAmount = hasDiscount ? discountedTryAmount! : tryAmount;
    
    return Obx(() {
      final usdAmount = currencyService.toUSD(displayAmount);
      final tryFormatted = NumberFormat('#,##0', 'tr_TR').format(tryAmount);
      final displayFormatted = NumberFormat('#,##0', 'tr_TR').format(displayAmount);
      final usdFormatted = NumberFormat('#,##0', 'tr_TR').format(usdAmount);
      
      return Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (hasDiscount)
            Text(
              '$tryFormatted₺',
              style: TextStyle(
                fontSize: (fontSize ?? 14.sp) - 2,
                color: Colors.grey[500],
                decoration: TextDecoration.lineThrough,
              ),
            ),
          Text(
            '$displayFormatted₺',
            style: TextStyle(
              fontSize: fontSize ?? 16.sp,
              fontWeight: FontWeight.bold,
              color: hasDiscount ? Colors.red[600] : Colors.black87,
            ),
          ),
          if (showUsd)
            Text(
              '\$$usdFormatted',
              style: TextStyle(
                fontSize: (fontSize ?? 16.sp) - 2,
                fontWeight: FontWeight.w500,
                color: Colors.blue[600],
              ),
            ),
        ],
      );
    });
  }
}

/// Fiyat aralığı gösterimi
/// TL bazlı sistem
class PriceRangeDisplay extends StatelessWidget {
  const PriceRangeDisplay({
    super.key,
    required this.minTry,
    required this.maxTry,
    this.fontSize,
    this.showUsd = true,
  });

  final double minTry;
  final double maxTry;
  final double? fontSize;
  final bool showUsd;

  @override
  Widget build(BuildContext context) {
    final currencyService = Get.find<CurrencyService>();
    final isSame = minTry == maxTry;
    
    return Obx(() {
      final minUsd = currencyService.toUSD(minTry);
      final maxUsd = currencyService.toUSD(maxTry);
      final minTryFormatted = NumberFormat('#,##0', 'tr_TR').format(minTry);
      final maxTryFormatted = NumberFormat('#,##0', 'tr_TR').format(maxTry);
      final minUsdFormatted = NumberFormat('#,##0', 'tr_TR').format(minUsd);
      final maxUsdFormatted = NumberFormat('#,##0', 'tr_TR').format(maxUsd);
      
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            isSame 
              ? '$minTryFormatted₺'
              : '$minTryFormatted₺ - $maxTryFormatted₺',
            style: TextStyle(
              fontSize: fontSize ?? 14.sp,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          if (showUsd)
            Text(
              isSame
                ? '\$$minUsdFormatted'
                : '\$$minUsdFormatted - \$$maxUsdFormatted',
              style: TextStyle(
                fontSize: (fontSize ?? 14.sp) - 2,
                fontWeight: FontWeight.w500,
                color: Colors.blue[600],
              ),
            ),
        ],
      );
    });
  }
}

/// USD fiyat girişi yapıldığında otomatik TRY karşılığını gösteren widget
/// Tur formlarında fiyat girişi için kullanılır
/// 
/// NOT: Fiyatlar USD olarak girilir. TRY karşılığı otomatik hesaplanır.
/// Veritabanına USD değeri kaydedilir.
class UsdCurrencyPriceField extends StatefulWidget {
  const UsdCurrencyPriceField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.validator,
    this.onChanged,
    this.prefixIcon,
    this.enabled = true,
    this.isRequired = true,
  });

  final TextEditingController controller;
  final String label;
  final String? hint;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final IconData? prefixIcon;
  final bool enabled;
  final bool isRequired;

  @override
  State<UsdCurrencyPriceField> createState() => _UsdCurrencyPriceFieldState();
}

class _UsdCurrencyPriceFieldState extends State<UsdCurrencyPriceField> {
  late final CurrencyService _currencyService;

  @override
  void initState() {
    super.initState();
    _currencyService = Get.find<CurrencyService>();
    widget.controller.addListener(_onValueChanged);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onValueChanged);
    super.dispose();
  }

  void _onValueChanged() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final usdValue = double.tryParse(widget.controller.text) ?? 0;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: widget.controller,
          enabled: widget.enabled,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
          ],
          validator: widget.validator ?? (widget.isRequired ? (v) {
            if (v == null || v.isEmpty) return 'Bu alan zorunludur';
            final val = double.tryParse(v);
            if (val == null || val < 0) return 'Geçerli bir fiyat girin';
            return null;
          } : null),
          onChanged: widget.onChanged,
          style: TextStyle(color: isDark ? Colors.white : Colors.black87),
          decoration: InputDecoration(
            labelText: '${widget.label} (USD)',
            hintText: widget.hint ?? 'USD cinsinden girin',
            prefixIcon: Icon(widget.prefixIcon ?? Icons.attach_money),
            suffixText: '\$',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12.r),
              borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[400]!),
            ),
            filled: true,
            fillColor: isDark ? Colors.grey[900] : Colors.grey[50],
            labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
            hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[500]),
          ),
        ),
        if (usdValue > 0) ...[
          SizedBox(height: 8.h),
          Obx(() {
            final tryValue = _currencyService.toTRY(usdValue);
            final tryFormatted = NumberFormat('#,##0', 'tr_TR').format(tryValue);
            return Container(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: isDark ? Colors.green[900]!.withValues(alpha: 0.3) : Colors.green[50],
                borderRadius: BorderRadius.circular(8.r),
                border: Border.all(color: isDark ? Colors.green[700]! : Colors.green[200]!),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.currency_lira, size: 16.sp, color: isDark ? Colors.green[300] : Colors.green[700]),
                  SizedBox(width: 6.w),
                  Text(
                    'TL Karşılığı: $tryFormatted₺',
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.green[300] : Colors.green[700],
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    '(Kur: ${_currencyService.rate.toStringAsFixed(2)})',
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: isDark ? Colors.green[400] : Colors.green[600],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ],
    );
  }
}

/// USD bazlı kompakt fiyat gösterimi (card'larda kullanım için)
/// usdAmount parametresi USD cinsinden
class UsdCompactPriceDisplay extends StatelessWidget {
  const UsdCompactPriceDisplay({
    super.key,
    required this.usdAmount,
    this.discountedUsdAmount,
    this.fontSize,
    this.showTry = true,
  });

  final double usdAmount;
  final double? discountedUsdAmount;
  final double? fontSize;
  final bool showTry;

  @override
  Widget build(BuildContext context) {
    final currencyService = Get.find<CurrencyService>();
    final hasDiscount = discountedUsdAmount != null && discountedUsdAmount! < usdAmount;
    final displayAmount = hasDiscount ? discountedUsdAmount! : usdAmount;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Obx(() {
      final tryAmount = currencyService.toTRY(displayAmount);
      final usdFormatted = NumberFormat('#,##0', 'tr_TR').format(usdAmount);
      final displayFormatted = NumberFormat('#,##0', 'tr_TR').format(displayAmount);
      final tryFormatted = NumberFormat('#,##0', 'tr_TR').format(tryAmount);
      
      return Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (hasDiscount)
            Text(
              '\$$usdFormatted',
              style: TextStyle(
                fontSize: (fontSize ?? 14.sp) - 2,
                color: Colors.grey[500],
                decoration: TextDecoration.lineThrough,
              ),
            ),
          Text(
            '\$$displayFormatted',
            style: TextStyle(
              fontSize: fontSize ?? 16.sp,
              fontWeight: FontWeight.bold,
              color: hasDiscount ? Colors.red[600] : (isDark ? Colors.white : Colors.black87),
            ),
          ),
          if (showTry)
            Text(
              '$tryFormatted₺',
              style: TextStyle(
                fontSize: (fontSize ?? 16.sp) - 2,
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.green[400] : Colors.green[700],
              ),
            ),
        ],
      );
    });
  }
}

