import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/visa/visa_controller.dart';
import '../../../themes/theme.dart';

class VisaPaymentStep extends GetView<VisaController> {
  const VisaPaymentStep({super.key});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Ödeme Bilgileri', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
      SizedBox(height: 16.h),
      Container(
        padding: EdgeInsets.all(20.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: isDark 
            ? [Colors.blue[900]!.withOpacity(0.3), Colors.blue[800]!.withOpacity(0.2)]
            : [Colors.blue[50]!, Colors.blue[100]!]), 
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Column(children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Vize Başvuru Ücreti', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
            Obx(()=> Text('\$${controller.getVisaFee(controller.selectedCountry.value).toStringAsFixed(0)}', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold, color: AppColors.medinaGreen40))),
          ]),
          SizedBox(height: 8.h),
          Obx(()=> Text('${controller.selectedCountry.value} - ${controller.selectedPurpose.value}', style: TextStyle(fontSize: 14.sp, color: isDark ? Colors.grey[400] : Colors.grey[600]))),
        ]),
      ),
      SizedBox(height: 20.h),
      _bankSection(theme, isDark),
      SizedBox(height: 20.h),
      Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(12.r)),
        child: Row(children: [
          Icon(Icons.security, color: Colors.green, size: 24.sp), SizedBox(width: 12.w),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Güvenli Ödeme', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: Colors.green[700])),
              Text('Ödeme bilgileriniz 256-bit SSL şifrelemesi ile korunmaktadır.', style: TextStyle(fontSize: 12.sp, color: Colors.green[600])),
            ])),
        ]),
      ),
    ]);
  }

  Widget _bankSection(ThemeData theme, bool isDark){
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: isDark ? theme.colorScheme.surfaceContainerHigh : null,
        border: Border.all(color: isDark ? Colors.grey[600]! : Colors.grey[300]!), 
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Banka Havalesi / EFT', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        SizedBox(height: 12.h),
        _bankRow('Banka', 'Ziraat Bankası', theme, isDark),
        _bankRow('Hesap Adı', 'Sefernur Turizm', theme, isDark),
        _bankRow('IBAN', 'TR12 3456 7890 1234 5678 9012 34', theme, isDark, copyable: true),
        _bankRow('Açıklama', 'Vize - Ad Soyad', theme, isDark),
        SizedBox(height: 16.h),
        Text('Dekont Yükle', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        SizedBox(height: 8.h),
        Obx(()=> controller.paymentReceiptFile.value == null
          ? OutlinedButton.icon(
              onPressed: controller.pickPaymentReceipt, 
              icon: Icon(Icons.upload_file, color: isDark ? Colors.grey[300] : null), 
              label: Text('Dekont Seç', style: TextStyle(color: isDark ? Colors.grey[300] : null)),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: isDark ? Colors.grey[600]! : Colors.grey[400]!),
              ),
            )
          : Container(padding: EdgeInsets.all(12.w), decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(8.r)), child: Row(children:[
              const Icon(Icons.check_circle, color: Colors.green, size: 20), SizedBox(width: 8.w), Expanded(child: Text(controller.paymentReceiptFile.value!.path.split('/').last, style: TextStyle(fontSize: 13.sp, color: Colors.green[800]))),
              TextButton(onPressed: controller.pickPaymentReceipt, child: const Text('Değiştir'))
            ]))) ,
      ]),
    );
  }

  Widget _bankRow(String label, String value, ThemeData theme, bool isDark, {bool copyable = false}){
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(children: [
        SizedBox(width: 90.w, child: Text(label, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[400] : Colors.grey[700]))),
        Expanded(child: Text(value, style: TextStyle(fontSize: 13.sp, color: theme.colorScheme.onSurface))),
        if(copyable) IconButton(icon: Icon(Icons.copy, size: 18, color: isDark ? Colors.grey[400] : null), onPressed: (){})
      ]),
    );
  }
}
