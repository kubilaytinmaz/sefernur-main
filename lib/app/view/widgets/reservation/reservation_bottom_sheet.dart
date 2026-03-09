import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/currency/currency_service.dart';

/// Ortak rezervasyon bottom sheet iskeleti.
/// bodyBuilder içine hizmete özel form alanları yerleştirilir.
class ReservationBottomSheet extends StatefulWidget {
  final String title;
  final List<String>? images;
  final Widget Function(BuildContext context, ReservationSheetController c) bodyBuilder;
  final Future<String> Function(ReservationSheetController c) onSubmit; // submit callback (ID dönebilir)
  final String submitLabel;
  final String? subtitle;
  final double? price;
  final String? priceLabel; // örn. 'Toplam'
  const ReservationBottomSheet({
    super.key,
    required this.title,
    required this.bodyBuilder,
    required this.onSubmit,
    this.images,
    this.submitLabel = 'Rezervasyonu Gönder',
    this.subtitle,
    this.price,
    this.priceLabel,
  });

  static Future<void> show(ReservationBottomSheet sheet) async {
    await Get.bottomSheet(sheet,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      ignoreSafeArea: false,
    );
  }

  @override
  State<ReservationBottomSheet> createState() => _ReservationBottomSheetState();
}

/// Bottom sheet iç durum yöneticisi (form değerleri, iletişim alanları vb.)
class ReservationSheetController extends GetxController {
  final isSubmitting = false.obs;
  final error = RxnString();
  final phoneCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final noteCtrl = TextEditingController();
  final formKey = GlobalKey<FormState>();
  final values = <String, dynamic>{}.obs; // hizmete özel alanlar
  VoidCallback? _rebuild;
  void setRebuild(VoidCallback cb){ _rebuild = cb; }
  void rebuild(){ _rebuild?.call(); }
  void setVal(String key, dynamic val){ values[key] = val; rebuild(); }
  T? val<T>(String key){ final v = values[key]; if (v is T) return v; return null; }
  void disposeAll(){ phoneCtrl.dispose(); emailCtrl.dispose(); noteCtrl.dispose(); }
}

class _ReservationBottomSheetState extends State<ReservationBottomSheet> {
  late final ReservationSheetController c;

  @override
  void initState() {
    super.initState();
  // Controller'ı tip üzerinden register ediyoruz ki form alanları Get.find<ReservationSheetController>() ile erişebilsin.
  c = Get.put(ReservationSheetController());
  c.setRebuild((){ if (mounted) setState((){}); });
    // Kullanıcı profilinden otomatik doldurma (varsayımsal AuthService)
    if (Get.isRegistered<AuthService>()) {
      final auth = Get.find<AuthService>();
      final user = auth.user.value;
  final phone = (user.phoneNumber ?? '').toString();
  final email = (user.email ?? '').toString();
  if (phone.isNotEmpty) c.phoneCtrl.text = phone;
  if (email.isNotEmpty) c.emailCtrl.text = email;
    }
  }

  @override
  void dispose() {
    c.disposeAll();
    // Sayfa kapandığında registry'den kaldır
    if (Get.isRegistered<ReservationSheetController>()) {
      Get.delete<ReservationSheetController>();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).padding.bottom;
    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      maxChildSize: 0.95,
      minChildSize: 0.6,
      expand: false,
      builder: (ctx, scroll) => SafeArea(
          bottom: false,
        top: false,
        child: Obx(() => Stack(children:[
          Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
            ),
            child: Form(
              key: c.formKey,
              child: CustomScrollView(
                controller: scroll,
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(20.w,12.h,20.w,140.h),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children:[
                          Center(
                            child: Container(
                              width: 44.w, height: 5.h,
                              margin: EdgeInsets.only(bottom:16.h),
                              decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(20)),
                            ),
                          ),
                          Text(widget.title, style: TextStyle(fontSize:20.sp, fontWeight: FontWeight.w800)),
                          if (widget.subtitle!=null) ...[
                            SizedBox(height:4.h),
                            Text(widget.subtitle!, style: TextStyle(fontSize:12.sp, color: Colors.blueGrey[600])),
                          ],
                          SizedBox(height:16.h),
                          _contactFields(),
                          SizedBox(height:16.h),
                          widget.bodyBuilder(context, c),
                          SizedBox(height:16.h),
                          _notesField(),
                          if (widget.price != null) ...[
                            SizedBox(height:20.h),
                            _priceBox(widget.price!, widget.priceLabel ?? 'Toplam'),
                          ],
                          if (c.error.value != null) ...[
                            SizedBox(height:20.h),
                            _errorBanner(c.error.value!),
                          ],
                        ],
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
          _submitBar(bottom),
          if (c.isSubmitting.value) _loadingOverlay(),
        ])),
      ),
    );
  }

  Widget _contactFields() => Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
    Text('İletişim', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700)),
    SizedBox(height:8.h),
    TextFormField(
      controller: c.phoneCtrl,
      decoration: const InputDecoration(labelText: 'Telefon*'),
      keyboardType: TextInputType.phone,
      validator: (v){ if (v==null || v.trim().isEmpty) return 'Telefon gerekli'; if (v.length < 7) return 'Geçersiz telefon'; return null; },
    ),
    SizedBox(height:12.h),
    TextFormField(
      controller: c.emailCtrl,
      decoration: const InputDecoration(labelText: 'E-posta'),
      keyboardType: TextInputType.emailAddress,
      validator: (v){ if (v!=null && v.isNotEmpty && !v.contains('@')) return 'E-posta geçersiz'; return null; },
    ),
  ]);

  Widget _notesField() => Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
    Text('Not', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w700)),
    SizedBox(height:8.h),
    TextFormField(
      controller: c.noteCtrl,
      maxLines: 4,
      decoration: const InputDecoration(hintText: 'Eklemek istediğiniz not'),
    ),
  ]);

  Widget _priceBox(double price, String label) {
    final currencyService = Get.find<CurrencyService>();
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(color: Colors.blueGrey[50], borderRadius: BorderRadius.circular(20.r)),
      child: Row(children:[
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Text(label, style: TextStyle(fontSize:12.sp, fontWeight: FontWeight.w600, color: Colors.blueGrey[600])),
          SizedBox(height:4.h),
          Obx(() => Text(
            currencyService.currentRate.value.formatBoth(price),
            style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w800, color: Colors.blueGrey[900])
          ))
        ])),
        const Icon(Icons.attach_money, color: Colors.blueGrey)
      ]),
    );
  }

  Widget _errorBanner(String msg) => Container(
    width: double.infinity,
    padding: EdgeInsets.all(12.w),
    decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(14.r), border: Border.all(color: Colors.red[200]!)),
    child: Row(children:[
      const Icon(Icons.error_outline, color: Colors.red),
      SizedBox(width:8.w),
      Expanded(child: Text(msg, style: TextStyle(fontSize:12.sp, color: Colors.red[900]))),
    ]),
  );

  Widget _submitBar(double bottomPad) => Align(
    alignment: Alignment.bottomCenter,
    child: Container(
      padding: EdgeInsets.fromLTRB(20.w, 14.h, 20.w, bottomPad + 16.h),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0,-8)),
        ],
      ),
      child: SafeArea(
          bottom: false,
        top: false,
        child: SizedBox(
          width: double.infinity,
      child: Obx(() => ElevatedButton(
            onPressed: c.isSubmitting.value ? null : () async {
              if (!c.formKey.currentState!.validate()) return;
              c.isSubmitting.value = true;
              c.error.value = null;
              try {
                await widget.onSubmit(c);
                if (context.mounted) {
                  Navigator.of(context).pop();
                  // Snackbar'ı navigation sonrası göster
                  Future.delayed(const Duration(milliseconds: 100), () {
                    Get.snackbar(
                      'Başarılı',
                      'Rezervasyon isteğiniz alındı',
                      backgroundColor: Colors.green[600],
                      colorText: Colors.white,
                      snackPosition: SnackPosition.TOP,
                      margin: EdgeInsets.all(16.w),
                      borderRadius: 18.r,
                      duration: const Duration(seconds: 4),
                      icon: const Icon(Icons.check_circle, color: Colors.white),
                    );
                  });
                }
              } catch (e){
                c.error.value = e.toString();
              } finally {
                c.isSubmitting.value = false;
              }
            },
            style: ElevatedButton.styleFrom(
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
              padding: EdgeInsets.symmetric(vertical: 18.h),
              textStyle: TextStyle(fontSize:16.sp, fontWeight: FontWeight.w700),
            ),
            child: c.isSubmitting.value ? SizedBox(height:20.h, width:20.h, child: const CircularProgressIndicator(strokeWidth:2, color: Colors.white)) : Text(widget.submitLabel),
          )),
        ),
      ),
    ),
  );

  Widget _loadingOverlay() => Container(
    color: Colors.black.withOpacity(0.15),
    child: const Center(child: CircularProgressIndicator()),
  );
}
