import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/models/reservation/reservation_model.dart';

/// WebBeds Rezervasyon İptal Dialog'u
/// 
/// Doğrudan iptal yerine müşteri hizmetlerine yönlendirir.
/// WhatsApp, telefon veya e-posta ile iletişim seçenekleri sunar.
class WebBedsCancelDialog extends StatelessWidget {
  final ReservationModel reservation;
  
  // Müşteri hizmetleri iletişim bilgileri
  static const String _whatsappNumber = '905551234567'; // Değiştirilecek
  static const String _phoneNumber = '+90 555 123 45 67'; // Değiştirilecek
  static const String _email = 'destek@sefernur.com'; // Değiştirilecek
  
  const WebBedsCancelDialog({super.key, required this.reservation});
  
  /// Dialog'u göster
  static Future<bool?> show(ReservationModel reservation) {
    return Get.dialog<bool>(
      WebBedsCancelDialog(reservation: reservation),
      barrierDismissible: true,
    );
  }

  String get _bookingCode => reservation.meta['webbedsBookingCode'] ?? '';

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
      title: Row(
        children: [
          Icon(Icons.support_agent, color: Colors.teal[700], size: 24.sp),
          SizedBox(width: 8.w),
          const Expanded(child: Text('Rezervasyon İptali')),
        ],
      ),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Bilgi mesajı
            Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.amber[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.amber[800], size: 20.sp),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Text(
                      'Rezervasyon iptalleri müşteri hizmetlerimiz tarafından gerçekleştirilmektedir.',
                      style: TextStyle(fontSize: 13.sp, color: Colors.amber[900]),
                    ),
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 16.h),
            
            // Rezervasyon bilgisi
            Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(reservation.title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
                  SizedBox(height: 4.h),
                  Text('Rezervasyon Kodu: $_bookingCode', style: TextStyle(fontSize: 12.sp, color: Colors.grey[600])),
                  SizedBox(height: 4.h),
                  Text(
                    'Tarih: ${_formatDate(reservation.startDate)} - ${_formatDate(reservation.endDate)}',
                    style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 20.h),
            
            // İletişim başlığı
            Text(
              'Bizimle İletişime Geçin',
              style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
            ),
            
            SizedBox(height: 12.h),
            
            // WhatsApp butonu
            _ContactButton(
              icon: Icons.chat,
              iconColor: Colors.green[700]!,
              title: 'WhatsApp',
              subtitle: 'Hızlı yanıt için',
              onTap: () => _launchWhatsApp(),
            ),
            
            SizedBox(height: 8.h),
            
            // Telefon butonu
            _ContactButton(
              icon: Icons.phone,
              iconColor: Colors.blue[700]!,
              title: 'Telefon',
              subtitle: _phoneNumber,
              onTap: () => _launchPhone(),
            ),
            
            SizedBox(height: 8.h),
            
            // E-posta butonu
            _ContactButton(
              icon: Icons.email,
              iconColor: Colors.orange[700]!,
              title: 'E-posta',
              subtitle: _email,
              onTap: () => _launchEmail(),
            ),
            
            SizedBox(height: 16.h),
            
            // Çalışma saatleri
            Container(
              padding: EdgeInsets.all(10.w),
              decoration: BoxDecoration(
                color: Colors.teal[50],
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Row(
                children: [
                  Icon(Icons.access_time, size: 16.sp, color: Colors.teal[700]),
                  SizedBox(width: 8.w),
                  Text(
                    'Çalışma Saatleri: 09:00 - 22:00 (7/24 WhatsApp)',
                    style: TextStyle(fontSize: 11.sp, color: Colors.teal[800]),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Get.back(result: false),
          child: const Text('Kapat'),
        ),
      ],
    );
  }
  
  String _formatDate(DateTime date) {
    return '${date.day}.${date.month}.${date.year}';
  }
  
  void _launchWhatsApp() async {
    final message = 'Merhaba, rezervasyon iptal talebim var.\n\n'
        'Rezervasyon Kodu: $_bookingCode\n'
        'Otel: ${reservation.title}\n'
        'Tarih: ${_formatDate(reservation.startDate)} - ${_formatDate(reservation.endDate)}';
    
    final url = Uri.parse('https://wa.me/$_whatsappNumber?text=${Uri.encodeComponent(message)}');
    
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar('Hata', 'WhatsApp açılamadı', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Hata', 'WhatsApp başlatılamadı: $e', snackPosition: SnackPosition.BOTTOM);
    }
  }
  
  void _launchPhone() async {
    final url = Uri.parse('tel:${_phoneNumber.replaceAll(' ', '')}');
    
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        Get.snackbar('Hata', 'Telefon açılamadı', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Hata', 'Telefon başlatılamadı: $e', snackPosition: SnackPosition.BOTTOM);
    }
  }
  
  void _launchEmail() async {
    final subject = 'Rezervasyon İptal Talebi - $_bookingCode';
    final body = 'Merhaba,\n\n'
        'Aşağıdaki rezervasyonumu iptal etmek istiyorum:\n\n'
        'Rezervasyon Kodu: $_bookingCode\n'
        'Otel: ${reservation.title}\n'
        'Giriş: ${_formatDate(reservation.startDate)}\n'
        'Çıkış: ${_formatDate(reservation.endDate)}\n\n'
        'İsim: ${reservation.meta['leadPassenger'] ?? ''}\n'
        'Telefon: ${reservation.userPhone ?? ''}\n\n'
        'Teşekkürler.';
    
    final url = Uri.parse('mailto:$_email?subject=${Uri.encodeComponent(subject)}&body=${Uri.encodeComponent(body)}');
    
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        Get.snackbar('Hata', 'E-posta açılamadı', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Hata', 'E-posta başlatılamadı: $e', snackPosition: SnackPosition.BOTTOM);
    }
  }
}

/// İletişim butonu widget'ı
class _ContactButton extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  
  const _ContactButton({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });
  
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12.r),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(8.w),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 20.sp, color: iconColor),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                    Text(subtitle, style: TextStyle(fontSize: 12.sp, color: Colors.grey[600])),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, size: 16.sp, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }
}
