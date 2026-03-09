import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../controllers/visa/visa_controller.dart';
import '../../../data/models/visa/visa_application_model.dart';
import '../../../data/repositories/visa/visa_repository.dart';

class VisaApplicationSheet extends StatelessWidget {
  final VisaApplicationModel app;
  final bool isAdmin;
  final VisaRepository repo;
  const VisaApplicationSheet({super.key, required this.app, required this.isAdmin, required this.repo});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (_, controller) => Container(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24.r),
            topRight: Radius.circular(24.r),
          ),
        ),
        child: SingleChildScrollView(
          controller: controller,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 50.w,
                  height: 5.h,
                  margin: EdgeInsets.only(bottom: 16.h),
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4.r)),
                ),
              ),
              Text('Başvuru Detayı', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold)),
              SizedBox(height: 16.h),
              _section('Genel', [
                _row('No', app.id ?? ''),
                _row('Ad Soyad', '${app.firstName} ${app.lastName}'),
                _row('Ülke / Şehir', '${app.country} / ${app.city}'),
                _row('Amaç', app.purpose),
                _row('Tarih', '${_fmt(app.departureDate)} - ${_fmt(app.returnDate)}'),
                _row('Durum', Get.find<VisaController>().getStatusText(app.status)),
              ]),
              SizedBox(height: 12.h),
              _section('İletişim', [
                _row('Telefon', app.phone, action: IconButton(icon: const Icon(Icons.phone, size: 18), onPressed: () => _launch('tel:${app.phone}'))),
                _row('E-posta', app.email, action: IconButton(icon: const Icon(Icons.mail, size: 18), onPressed: () => _launch('mailto:${app.email}'))),
              ]),
              SizedBox(height: 12.h),
              _section('Belgeler', [
                for (int i = 0; i < app.requiredFileUrls.length; i++) _fileRow('Zorunlu ${i + 1}', app.requiredFileUrls[i]),
                if (app.additionalFileUrls.isNotEmpty) const SizedBox(height: 8),
                for (int i = 0; i < app.additionalFileUrls.length; i++) _fileRow('Ek ${i + 1}', app.additionalFileUrls[i]),
              ]),
              if (app.paymentReceiptUrl != null) ...[
                SizedBox(height: 12.h),
                _section('Ödeme', [ _fileRow('Dekont', app.paymentReceiptUrl!) ]),
              ],
              _notesSection(context),
              if (isAdmin) ...[
                SizedBox(height: 20.h),
                Text('Admin İşlemleri', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600)),
                SizedBox(height: 12.h),
                Wrap(spacing: 8.w, runSpacing: 8.h, children: [
                  _adminButton('İşlemde', Colors.orange, () => repo.updateStatus(app.id!, 'processing')),
                  _adminButton('Onayla', Colors.green, () => repo.updateStatus(app.id!, 'completed')),
                  _adminButton('Reddet', Colors.red, () => repo.updateStatus(app.id!, 'rejected')),
                ]),
              ],
              SizedBox(height: 40.h),
            ],
          ),
        ),
      ),
    );
  }

  Widget _notesSection(BuildContext context){
    final controller = Get.find<VisaController>();
    final adminController = TextEditingController(text: app.adminNote ?? '');
    final userController = TextEditingController(text: app.userNote ?? '');
    return Column(children:[
      SizedBox(height: 12.h),
      _section('Notlar', [
        if(isAdmin)...[
          Text('Admin Notu', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: Colors.grey[700])),
          SizedBox(height:4.h),
          TextField(controller: adminController, maxLines: 3, decoration: _noteDecoration('Admin iç notları')),
          SizedBox(height:12.h),
        ],
        Text('Kullanıcı Notu', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        SizedBox(height:4.h),
        TextField(controller: userController, maxLines: 3, decoration: _noteDecoration('Sorun / Açıklama ekleyin')),
        SizedBox(height:12.h),
        Align(alignment: Alignment.centerRight, child: Obx(()=> controller.isLoading.value ? const SizedBox(width:20,height:20,child:CircularProgressIndicator(strokeWidth:2)) : ElevatedButton.icon(onPressed: (){
          controller.updateNotes(app, adminNote: isAdmin? adminController.text.trim(): null, userNote: userController.text.trim());
        }, icon: const Icon(Icons.save, size:16), label: const Text('Kaydet'))))
      ])
    ]);
  }

  InputDecoration _noteDecoration(String hint){
    return InputDecoration(
      hintText: hint,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r)),
      isDense: true,
    );
  }

  Widget _section(String title, List<Widget> children) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        SizedBox(height: 8.h),
        ...children,
      ]),
    );
  }

  Widget _row(String label, String value, {Widget? action}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(children: [
        SizedBox(width: 110.w, child: Text(label, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: Colors.grey[600]))),
        Expanded(child: Text(value, style: TextStyle(fontSize: 13.sp))),
        if (action != null) action,
      ]),
    );
  }

  Widget _fileRow(String label, String url) {
    return _row(label, 'Dosyayı Aç', action: IconButton(icon: const Icon(Icons.open_in_new, size: 18), onPressed: () => _openFile(url)));
  }

  Widget _adminButton(String text, Color color, VoidCallback onTap) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white, padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r))),
      onPressed: onTap,
      child: Text(text, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600)),
    );
  }

  String _fmt(DateTime d) => '${d.day.toString().padLeft(2,'0')}/${d.month.toString().padLeft(2,'0')}/${d.year}';

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri)) {
      Get.snackbar('Hata', 'Açılamadı: $url', snackPosition: SnackPosition.BOTTOM);
    }
  }

  Future<void> _openFile(String url) async {
    // Web vs mobile: on web simply launch URL
    // For now we use launchUrl universally; platform specific logic could integrate with file saver packages.
    await _launch(url);
  }
}
