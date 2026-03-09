import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../data/services/currency/currency_service.dart';
import '../../../../themes/theme.dart';

/// Admin paneli için döviz kuru yönetim sekmesi
class CurrencyManagementTab extends StatefulWidget {
  const CurrencyManagementTab({super.key});

  @override
  State<CurrencyManagementTab> createState() => _CurrencyManagementTabState();
}

class _CurrencyManagementTabState extends State<CurrencyManagementTab> {
  late final CurrencyService _currencyService;
  final TextEditingController _rateController = TextEditingController();
  final TextEditingController _testUsdController = TextEditingController(text: '100');

  @override
  void initState() {
    super.initState();
    _currencyService = Get.find<CurrencyService>();
    _rateController.text = _currencyService.rate.toStringAsFixed(4);
  }

  @override
  void dispose() {
    _rateController.dispose();
    _testUsdController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCurrentRateCard(),
          SizedBox(height: 16.h),
          _buildUpdateRateCard(),
          SizedBox(height: 16.h),
          _buildTestConverterCard(),
          SizedBox(height: 16.h),
          _buildInfoCard(),
        ],
      ),
    );
  }

  Widget _buildCurrentRateCard() {
    final primaryColor = AppColors.medinaGreen40;
    return Obx(() {
      final rate = _currencyService.currentRate.value;
      return Container(
        width: double.infinity,
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              primaryColor,
              primaryColor.withOpacity(0.8),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16.r),
          boxShadow: [
            BoxShadow(
              color: primaryColor.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.currency_exchange, color: Colors.white, size: 28.sp),
                SizedBox(width: 12.w),
                Text(
                  'Güncel Döviz Kuru',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            SizedBox(height: 20.h),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '1 USD',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 16.sp,
                  ),
                ),
                SizedBox(width: 12.w),
                Text(
                  '=',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 20.sp,
                  ),
                ),
                SizedBox(width: 12.w),
                Text(
                  '${rate.rate.toStringAsFixed(4)} ₺',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.access_time, color: Colors.white70, size: 16.sp),
                  SizedBox(width: 6.w),
                  Text(
                    'Son güncelleme: ${_currencyService.lastUpdateFormatted}',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12.sp,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildUpdateRateCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = AppColors.medinaGreen40;
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.edit, color: primaryColor, size: 24.sp),
              SizedBox(width: 12.w),
              Text(
                'Kuru Güncelle',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          TextField(
            controller: _rateController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,4}')),
            ],
            style: TextStyle(color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              labelText: '1 USD = ? TL',
              hintText: 'Örn: 34.5000',
              prefixIcon: Icon(Icons.attach_money, color: isDark ? Colors.grey[400] : Colors.grey[600]),
              suffixText: '₺',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              filled: true,
              fillColor: isDark ? Colors.grey[900] : Colors.grey[50],
            ),
          ),
          SizedBox(height: 16.h),
          Obx(() {
            final isLoading = _currencyService.isLoading.value;
            return Row(
              children: [
                Expanded(
                  flex: 4,
                  child: OutlinedButton.icon(
                    onPressed: isLoading ? null : _fetchFromTCMB,
                    icon: Icon(Icons.cloud_download, size: 18.sp),
                    label: Text(
                      'TCMB\'den Çek',
                      style: TextStyle(fontSize: 12.sp),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      minimumSize: Size(double.infinity, 45.h),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 8.w),
                Expanded(
                  flex: 5,
                  child: ElevatedButton.icon(
                    onPressed: isLoading ? null : _updateRate,
                    icon: isLoading
                        ? SizedBox(
                            width: 16.w,
                            height: 16.w,
                            child: const CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : Icon(Icons.save, size: 18.sp),
                    label: Text(
                      isLoading ? 'Güncelleniyor...' : 'Kuru Kaydet',
                      style: TextStyle(fontSize: 12.sp),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      minimumSize: Size(double.infinity, 45.h),
                      backgroundColor: AppColors.medinaGreen40,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTestConverterCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.calculate, color: Colors.orange[700], size: 24.sp),
              SizedBox(width: 12.w),
              Text(
                'Dönüşüm Testi',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          TextField(
            controller: _testUsdController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
            ],
            onChanged: (_) => setState(() {}),
            style: TextStyle(color: isDark ? Colors.white : Colors.black87),
            decoration: InputDecoration(
              labelText: 'USD Miktarı',
              prefixIcon: Icon(Icons.attach_money, color: isDark ? Colors.grey[400] : Colors.grey[600]),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              filled: true,
              fillColor: isDark ? Colors.grey[900] : Colors.grey[50],
            ),
          ),
          SizedBox(height: 16.h),
          Obx(() {
            final usd = double.tryParse(_testUsdController.text) ?? 0;
            final tryAmount = _currencyService.toTRY(usd);
            return Container(
              width: double.infinity,
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: isDark ? Colors.green[900]!.withValues(alpha: 0.3) : Colors.green[50],
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: isDark ? Colors.green[700]! : Colors.green[200]!),
              ),
              child: Column(
                children: [
                  Text(
                    '\$${usd.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 24.sp,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.grey[400] : Colors.grey[700],
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Icon(Icons.arrow_downward, color: isDark ? Colors.green[400] : Colors.green[600], size: 24.sp),
                  SizedBox(height: 8.h),
                  Text(
                    '${tryAmount.toStringAsFixed(2)} ₺',
                    style: TextStyle(
                      fontSize: 28.sp,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.green[400] : Colors.green[700],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: isDark ? Colors.blue[900]!.withOpacity(0.3) : Colors.blue[50],
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: isDark ? Colors.blue[800]! : Colors.blue[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: isDark ? Colors.blue[400] : Colors.blue[700], size: 20.sp),
              SizedBox(width: 8.w),
              Text(
                'Bilgilendirme',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.blue[400] : Colors.blue[700],
                ),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          Text(
            '• Tüm fiyatlar USD olarak girilir ve otomatik TL karşılığı hesaplanır.\n'
            '• Kur değiştiğinde mevcut fiyatların TL karşılıkları otomatik güncellenir.\n'
            '• Müşteriler hem USD hem TL fiyatı görebilir.',
            style: TextStyle(
              fontSize: 13.sp,
              color: isDark ? Colors.blue[300] : Colors.blue[800],
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _fetchFromTCMB() async {
    final success = await _currencyService.updateRateFromTCMB();
    if (success) {
      _rateController.text = _currencyService.rate.toStringAsFixed(4);
      setState(() {});
    }
  }

  Future<void> _updateRate() async {
    final newRate = double.tryParse(_rateController.text);
    if (newRate == null || newRate <= 0) {
      Get.snackbar(
        'Hata',
        'Geçerli bir kur değeri girin',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red[100],
        colorText: Colors.red[900],
      );
      return;
    }

    final success = await _currencyService.updateRate(newRate);
    if (success) {
      setState(() {});
    }
  }
}
