import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../../controllers/admin/guide_admin_controller.dart';
import '../../../../../data/models/address/address_model.dart';
import '../../../../../data/models/guide/guide_model.dart';
import '../../../../../routes/routes.dart';
import '../../../../widgets/currency_price_field.dart';

class GuideAddForm extends StatefulWidget { const GuideAddForm({super.key}); @override State<GuideAddForm> createState()=> _GuideAddFormState(); }
class _GuideAddFormState extends State<GuideAddForm> {
  late final GuideAdminController controller;
  final _formKey = GlobalKey<FormState>();
  final nameCtrl = TextEditingController();
  final bioCtrl = TextEditingController();
  final languagesCtrl = TextEditingController();
  final specialtiesCtrl = TextEditingController();
  final List<AddressModel> serviceAddresses = [];
  final certsCtrl = TextEditingController();
  final expCtrl = TextEditingController();
  final rateCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final whatsappCtrl = TextEditingController();
  List<String> images = [];
  bool isPopular = false;

  @override void initState(){
    super.initState();
    controller = Get.find<GuideAdminController>();
    final g = controller.selected.value;
    if (g!=null){
      nameCtrl.text = g.name;
      bioCtrl.text = g.bio;
      languagesCtrl.text = g.languages.join(', ');
      specialtiesCtrl.text = g.specialties.join(', ');
      certsCtrl.text = g.certifications.join(', ');
      expCtrl.text = g.yearsExperience.toString();
      rateCtrl.text = g.dailyRate.toStringAsFixed(0);
      images = List.from(g.images);
      phoneCtrl.text = g.phone??'';
      emailCtrl.text = g.email??'';
      whatsappCtrl.text = g.whatsapp??'';
      serviceAddresses.addAll(g.serviceAddresses);
      isPopular = g.isPopular;
    }
  }
  @override void dispose(){ nameCtrl.dispose(); bioCtrl.dispose(); languagesCtrl.dispose(); specialtiesCtrl.dispose(); certsCtrl.dispose(); expCtrl.dispose(); rateCtrl.dispose(); phoneCtrl.dispose(); emailCtrl.dispose(); whatsappCtrl.dispose(); super.dispose(); }

  @override Widget build(BuildContext context){
    return Form(key:_formKey, child: SingleChildScrollView(padding: EdgeInsets.fromLTRB(16.w,12.h,16.w, MediaQuery.of(context).viewInsets.bottom+24.h), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      _headerImages(context), SizedBox(height:12.h),
      _field('Ad Soyad', nameCtrl, validator: (v)=> v!.trim().isEmpty? 'Gerekli': null),
      _multiLine('Biyografi', bioCtrl),
  _field('Diller (virgülle)', languagesCtrl),
  _field('Uzmanlıklar (virgülle)', specialtiesCtrl),
  _serviceAddressSection(),
      _field('Sertifikalar (virgülle)', certsCtrl),
  Row(children:[ Expanded(child: _field('Telefon', phoneCtrl)), SizedBox(width:12.w), Expanded(child: _field('Whatsapp', whatsappCtrl)), ]),
  _field('E-posta', emailCtrl, validator: (v){ if(v==null||v.isEmpty) return 'Gerekli'; if(!GetUtils.isEmail(v)) return 'Geçersiz'; return null; }),
      _field('Deneyim (yıl)', expCtrl, keyboardType: TextInputType.number),
      SizedBox(height: 12.h),
      CurrencyPriceField(
        controller: rateCtrl,
        label: 'Günlük Ücret',
        hint: 'Günlük rehberlik ücreti',
      ),
      SizedBox(height:20.h),
      Obx(()=> SizedBox(width: double.infinity, height:48.h, child: ElevatedButton.icon(
        onPressed: controller.isSaving.value? null : _save,
        icon: const Icon(Icons.save_outlined),
        label: Text(controller.isSaving.value? 'Kaydediliyor...' : 'Kaydet'),
        style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)), elevation:0),
      ))),
      SizedBox(height:12.h),
      SwitchListTile(
        contentPadding: EdgeInsets.zero,
        title: const Text('Popüler'),
        value: isPopular,
        onChanged: (v)=> setState(()=> isPopular = v),
      ),
    ])));
  }

  Widget _headerImages(BuildContext ctx){
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Text('Görseller', style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)), SizedBox(height:8.h),
      Container(
        height: 110.h,
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal:10.w, vertical:10.h),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[400]!, width: 1.2),
          borderRadius: BorderRadius.circular(14.r),
        ),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemBuilder: (_,i){
            if (i==images.length) return _addImageButton();
            final url = images[i];
            return Container(
              width: 130.w,
              decoration: BoxDecoration(
                border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[400]!, width: 1),
                borderRadius: BorderRadius.circular(12.r),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05), blurRadius:4, offset: const Offset(0,2))
                ],
              ),
              child: Stack(children:[
                ClipRRect(
                  borderRadius: BorderRadius.circular(11.r),
                  child: Image.network(url, width:130.w, height:90.h, fit: BoxFit.cover),
                ),
                Positioned(top:4,right:4, child: GestureDetector(
                  onTap: (){ setState(()=> images.removeAt(i)); },
                  child: Container(
                    decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
                    padding: const EdgeInsets.all(4),
                    child: const Icon(Icons.close, size:16, color: Colors.white),
                  ),
                ))
              ]),
            );
          },
          separatorBuilder: (_, __)=> SizedBox(width:10.w),
          itemCount: images.length+1,
        ),
      ),
    ]);
  }

  Widget _addImageButton(){
    final primaryColor = AppColors.medinaGreen40;
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        width: 130.w,
        height: 90.h,
        decoration: BoxDecoration(
          color: primaryColor.withValues(alpha:.05),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: primaryColor, width: 1.6),
        ),
        child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children:[
            Icon(Icons.add_a_photo_outlined, color: primaryColor, size:22.sp),
            SizedBox(height:4.h),
            Text('Görsel Ekle', style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w600, color: primaryColor)),
          ]),
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl, {String? Function(String?)? validator, TextInputType keyboardType = TextInputType.text}){
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    final baseBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[400]!, width: 1.2),
    );
    final focusBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: primaryColor, width: 2),
    );
    return Padding(
      padding: EdgeInsets.only(bottom:12.h),
      child: TextFormField(
        controller: ctrl,
        validator: validator,
        keyboardType: keyboardType,
        style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
          filled: true,
          fillColor: isDark ? Colors.grey[900] : Colors.white,
          contentPadding: EdgeInsets.symmetric(horizontal:14.w, vertical:12.h),
          border: baseBorder,
          enabledBorder: baseBorder,
            focusedBorder: focusBorder,
          floatingLabelStyle: TextStyle(color: primaryColor, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }
  Widget _multiLine(String label, TextEditingController ctrl){
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    final baseBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[400]!, width: 1.2),
    );
    final focusBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: primaryColor, width: 2),
    );
    return Padding(
      padding: EdgeInsets.only(bottom:12.h),
      child: TextFormField(
        controller: ctrl,
        maxLines: 4,
        style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
          alignLabelWithHint: true,
          filled: true,
          fillColor: isDark ? Colors.grey[900] : Colors.white,
          contentPadding: EdgeInsets.symmetric(horizontal:14.w, vertical:12.h),
          border: baseBorder,
          enabledBorder: baseBorder,
          focusedBorder: focusBorder,
          floatingLabelStyle: TextStyle(color: primaryColor, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Widget _serviceAddressSection(){
    final isDark = Get.isDarkMode;
    return Padding(
      padding: EdgeInsets.only(bottom:12.h),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children:[
            Text('Hizmet Adresleri', style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)),
            TextButton.icon(
              onPressed: _addAddress,
              icon: const Icon(Icons.add_location_alt_outlined, size:18),
              label: const Text('Adres Ekle'),
              style: TextButton.styleFrom(padding: EdgeInsets.symmetric(horizontal:10.w)),
            )
          ],
        ),
        if (serviceAddresses.isEmpty)
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(14.w),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Text('Henüz adres eklenmedi. "Adres Ekle" ile ekleyin.', style: TextStyle(fontSize:12.sp, color: isDark ? Colors.grey[500] : Colors.grey[600])),
          )
        else
          Column(
            children: serviceAddresses.asMap().entries.map((e){
              final idx = e.key; final a = e.value;
              return Container(
                margin: EdgeInsets.only(bottom:8.h),
                padding: EdgeInsets.all(12.w),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                  border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
                    Text(a.state.isNotEmpty? a.state : '-', style: TextStyle(fontSize:13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
                    if (a.city.isNotEmpty) Text(a.city, style: TextStyle(fontSize:12.sp, color: isDark ? Colors.grey[400] : Colors.grey[700])),
                    if (a.country.isNotEmpty) Text(a.country, style: TextStyle(fontSize:11.sp, color: isDark ? Colors.grey[500] : Colors.grey[600])),
                  ])),
                  Column(children:[
                    IconButton(onPressed: ()=> _editAddress(idx), icon: Icon(Icons.edit_location_alt_outlined, size:20, color: isDark ? Colors.grey[400] : Colors.grey[700])),
                    IconButton(onPressed: ()=> setState(()=> serviceAddresses.removeAt(idx)), icon: const Icon(Icons.delete_outline, size:20, color: Colors.redAccent)),
                  ])
                ]),
              );
            }).toList(),
          )
      ]),
    );
  }

  Future<void> _addAddress() async {
    final result = await Get.toNamed(Routes.SELECT_LOCATION, arguments: {'tag': 'guide_service_${DateTime.now().millisecondsSinceEpoch}'});
    if (result is AddressModel){
      setState(()=> serviceAddresses.add(result));
    }
  }

  Future<void> _editAddress(int index) async {
    final tag = 'guide_service_edit_$index';
    final result = await Get.toNamed(Routes.SELECT_LOCATION, arguments: {'tag': tag});
    if (result is AddressModel){
      setState(()=> serviceAddresses[index] = result);
    }
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage();
    if (picked.isEmpty) return;
    final urls = await controller.uploadImages(picked);
    if (mounted) setState(()=> images.addAll(urls));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final g = controller.selected.value;
    final model = GuideModel(
      id: g?.id,
      name: nameCtrl.text.trim(),
      bio: bioCtrl.text.trim(),
      languages: _split(languagesCtrl.text),
      specialties: _split(specialtiesCtrl.text),
  // regions removed; rely on structured serviceAddresses
  serviceAddresses: serviceAddresses,
      certifications: _split(certsCtrl.text),
      yearsExperience: int.tryParse(expCtrl.text.trim()) ?? 0,
      dailyRate: double.tryParse(rateCtrl.text.trim()) ?? 0,
      images: images,
      availability: g?.availability ?? {},
      rating: g?.rating ?? 0,
      reviewCount: g?.reviewCount ?? 0,
      isActive: g?.isActive ?? true,
  isPopular: isPopular,
      createdAt: g?.createdAt,
      updatedAt: DateTime.now(),
      addressModel: g?.addressModel, // UI henüz yok, eski kayıtlar korunur
      phone: phoneCtrl.text.trim().isEmpty? null : phoneCtrl.text.trim(),
      email: emailCtrl.text.trim().isEmpty? null : emailCtrl.text.trim(),
      whatsapp: whatsappCtrl.text.trim().isEmpty? null : whatsappCtrl.text.trim(),
    );
    await controller.save(model);
    if (mounted) Navigator.of(Get.overlayContext!).pop();
  }

  List<String> _split(String v) => v.split(',').map((e)=> e.trim()).where((e)=> e.isNotEmpty).toList();
}
