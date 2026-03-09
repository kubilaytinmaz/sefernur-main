import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../../controllers/address/address_controller.dart';
import '../../../../../controllers/admin/transfer_admin_controller.dart';
import '../../../../../data/models/address/address_model.dart';
import '../../../../../data/models/transfer/transfer_model.dart';
import '../../../../themes/theme.dart';
import '../../../../widgets/currency_price_field.dart';

class TransferAddForm extends StatefulWidget {
  const TransferAddForm({super.key});

  @override
  State<TransferAddForm> createState() => _TransferAddFormState();
}

class _TransferAddFormState extends State<TransferAddForm> {
  final _formKey = GlobalKey<FormState>();
  late final TransferAdminController controller;
  final _picker = ImagePicker();

  // Controllers
  final TextEditingController companyCtrl = TextEditingController();
  final TextEditingController vehicleNameCtrl = TextEditingController();
  final TextEditingController capacityCtrl = TextEditingController();
  final TextEditingController luggageCapacityCtrl = TextEditingController();
  final TextEditingController childSeatCtrl = TextEditingController();
  final TextEditingController basePriceCtrl = TextEditingController();
  final TextEditingController durationCtrl = TextEditingController();
  final TextEditingController phoneCtrl = TextEditingController();
  final TextEditingController emailCtrl = TextEditingController();
  final TextEditingController whatsappCtrl = TextEditingController();

  VehicleType vehicleType = VehicleType.sedan;
  Set<VehicleAmenity> selectedAmenities = {};
  bool isActive = true;
  bool isPopular = false;

  // Locations
  AddressController? fromAddress;
  AddressController? toAddress;

  // Images
  final RxList<XFile> newImages = <XFile>[].obs;
  final RxList<String> existingImages = <String>[].obs;
  final RxSet<String> removedExisting = <String>{}.obs;

  TransferModel? editing;

  @override
  void initState() {
    super.initState();
    controller = Get.find<TransferAdminController>();
    editing = controller.selected.value;
    if (editing != null) {
      companyCtrl.text = editing!.company;
      vehicleNameCtrl.text = editing!.vehicleName;
      capacityCtrl.text = editing!.capacity.toString();
      luggageCapacityCtrl.text = editing!.luggageCapacity.toString();
      childSeatCtrl.text = editing!.childSeatCount.toString();
      basePriceCtrl.text = editing!.basePrice.toStringAsFixed(0);
      durationCtrl.text = editing!.durationMinutes.toString();
      vehicleType = editing!.vehicleTypeEnum;
      selectedAmenities = editing!.amenityList.toSet();
      isActive = editing!.isActive;
      isPopular = editing!.isPopular;
      existingImages.assignAll(editing!.images);
      phoneCtrl.text = editing!.phone ?? '';
      emailCtrl.text = editing!.email ?? '';
      whatsappCtrl.text = editing!.whatsapp ?? '';
    }
    fromAddress = Get.put(AddressController(), tag: 'transfer_from_address');
    toAddress = Get.put(AddressController(), tag: 'transfer_to_address');
    if (editing != null) {
      // Prefill from structured addresses
      fromAddress!.setAddress(editing!.fromAddress);
      toAddress!.setAddress(editing!.toAddress);
    }
  }

  @override
  void dispose() {
    companyCtrl.dispose();
    vehicleNameCtrl.dispose();
    capacityCtrl.dispose();
    luggageCapacityCtrl.dispose();
    childSeatCtrl.dispose();
    basePriceCtrl.dispose();
    durationCtrl.dispose();
    phoneCtrl.dispose();
    emailCtrl.dispose();
    whatsappCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Obx(() => SingleChildScrollView(
        padding: EdgeInsets.only(left:16.w, right:16.w, bottom: MediaQuery.of(context).viewInsets.bottom + 16.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionTitle('Güzergah'),
            // Kalkış ve Varış alanlarını dikey sırala (daha fazla alan ve canlı önizleme için)
            _locationPicker('Kalkış', fromAddress!, () => _pickLocation(fromAddress!, 'transfer_from_address')),
            SizedBox(height: 12.h),
            _locationPicker('Varış', toAddress!, () => _pickLocation(toAddress!, 'transfer_to_address')),
            SizedBox(height: 12.h),
            _routePreview(),
            SizedBox(height: 18.h),
            
            _sectionTitle('Araç Bilgileri'),
            _vehicleTypeSelector(),
            SizedBox(height: 12.h),
            _filledField('Araç Adı (opsiyonel)', controller: vehicleNameCtrl, hint: 'GMC YUKON, Mercedes Vito vb.'),
            SizedBox(height: 12.h),
            Row(children:[
              Expanded(child: _filledField('Yolcu Kap.', controller: capacityCtrl, keyboard: TextInputType.number, validator: _reqNum, hint: 'Kişi sayısı')),
              SizedBox(width: 12.w),
              Expanded(child: _filledField('Bagaj Kap.', controller: luggageCapacityCtrl, keyboard: TextInputType.number, hint: 'Bavul adedi')),
            ]),
            SizedBox(height: 12.h),
            Row(children:[
              Expanded(child: _filledField('Çocuk Koltuğu', controller: childSeatCtrl, keyboard: TextInputType.number, hint: 'Adet')),
              SizedBox(width: 12.w),
              Expanded(child: _filledField('Süre (dk)', controller: durationCtrl, keyboard: TextInputType.number, validator: _reqNum)),
            ]),
            SizedBox(height: 18.h),
            
            _sectionTitle('Araç Özellikleri'),
            _amenitiesSelector(),
            SizedBox(height: 18.h),
            
            _sectionTitle('Firma & İletişim'),
            _filledField('Firma', controller: companyCtrl, validator: (v)=> v==null||v.isEmpty? 'Zorunlu':null),
            SizedBox(height: 12.h),
            Row(children:[
              Expanded(child: _filledField('Telefon', controller: phoneCtrl, keyboard: TextInputType.phone)),
              SizedBox(width: 12.w),
              Expanded(child: _filledField('Whatsapp', controller: whatsappCtrl, keyboard: TextInputType.phone)),
            ]),
            SizedBox(height: 12.h),
            _filledField('E-posta', controller: emailCtrl, keyboard: TextInputType.emailAddress, validator: (v){ if(v!=null && v.isNotEmpty && !GetUtils.isEmail(v)) return 'Geçersiz'; return null; }),
            SizedBox(height: 18.h),
            
            _sectionTitle('Fiyat'),
            UsdCurrencyPriceField(
              controller: basePriceCtrl,
              label: 'Baz Fiyat (USD)',
              hint: 'Transfer ücreti',
            ),
            SizedBox(height: 12.h),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Aktif'),
              value: isActive,
              onChanged: (v)=> setState(()=> isActive = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Popüler'),
              value: isPopular,
              onChanged: (v)=> setState(()=> isPopular = v),
            ),
            SizedBox(height: 18.h),
            _sectionTitle('Görseller'),
            _imagesSection(),
            SizedBox(height: 24.h),
            SizedBox(
              width: double.infinity,
              height: 50.h,
              child: ElevatedButton.icon(
                onPressed: controller.isSaving.value? null : _save,
                icon: const Icon(Icons.save_outlined),
                label: Text(controller.isSaving.value? 'Kaydediliyor...' : 'Kaydet'),
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r)),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      )),
    );
  }

  Widget _vehicleTypeSelector() {
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return Wrap(
      spacing: 8.w,
      runSpacing: 8.h,
      children: VehicleType.values.map((type) {
        final isSelected = vehicleType == type;
        return GestureDetector(
          onTap: () => setState(() => vehicleType = type),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
            decoration: BoxDecoration(
              color: isSelected 
                  ? primaryColor.withValues(alpha: 0.15)
                  : (isDark ? Colors.grey[800] : Colors.grey[100]),
              border: Border.all(
                color: isSelected ? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
                width: isSelected ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getVehicleIcon(type),
                  size: 18.sp,
                  color: isSelected ? primaryColor : (isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
                SizedBox(width: 6.w),
                Text(
                  type.trLabel,
                  style: TextStyle(
                    fontSize: 13.sp,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? primaryColor : (isDark ? Colors.grey[300] : Colors.grey[700]),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  IconData _getVehicleIcon(VehicleType type) {
    switch (type) {
      case VehicleType.sedan:
        return Icons.directions_car;
      case VehicleType.van:
        return Icons.airport_shuttle;
      case VehicleType.bus:
        return Icons.directions_bus;
      case VehicleType.vip:
        return Icons.local_taxi;
      case VehicleType.jeep:
        return Icons.terrain;
      case VehicleType.coster:
        return Icons.directions_bus_filled;
    }
  }

  Widget _amenitiesSelector() {
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return Wrap(
      spacing: 8.w,
      runSpacing: 8.h,
      children: VehicleAmenity.values.map((amenity) {
        final isSelected = selectedAmenities.contains(amenity);
        return GestureDetector(
          onTap: () {
            setState(() {
              if (isSelected) {
                selectedAmenities.remove(amenity);
              } else {
                selectedAmenities.add(amenity);
              }
            });
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
            decoration: BoxDecoration(
              color: isSelected 
                  ? primaryColor.withValues(alpha: 0.15)
                  : (isDark ? Colors.grey[800] : Colors.grey[100]),
              border: Border.all(
                color: isSelected ? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!),
                width: isSelected ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(10.r),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getAmenityIcon(amenity),
                  size: 16.sp,
                  color: isSelected ? primaryColor : (isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
                SizedBox(width: 6.w),
                Text(
                  amenity.label,
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    color: isSelected ? primaryColor : (isDark ? Colors.grey[300] : Colors.grey[700]),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  IconData _getAmenityIcon(VehicleAmenity amenity) {
    switch (amenity) {
      case VehicleAmenity.insurance:
        return Icons.security;
      case VehicleAmenity.airCondition:
        return Icons.ac_unit;
      case VehicleAmenity.wifi:
        return Icons.wifi;
      case VehicleAmenity.comfort:
        return Icons.airline_seat_recline_extra;
      case VehicleAmenity.usb:
        return Icons.usb;
      case VehicleAmenity.water:
        return Icons.water_drop;
      case VehicleAmenity.snacks:
        return Icons.cookie;
      case VehicleAmenity.tv:
        return Icons.tv;
      case VehicleAmenity.bluetooth:
        return Icons.bluetooth;
      case VehicleAmenity.gps:
        return Icons.gps_fixed;
    }
  }

  Widget _sectionTitle(String t) {
    final isDark = Get.isDarkMode;
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(t, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.white : Colors.black87)),
    );
  }

  Widget _locationPicker(String label, AddressController ac, VoidCallback onTap) {
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return Obx(() {
      final short = ac.getShortAddress();
      final full = ac.currentAddress.address;
      final has = full.isNotEmpty;
      final borderColor = has ? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!);
      return GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.all(14.w),
            decoration: BoxDecoration(
              color: has ? primaryColor.withValues(alpha: .05) : (isDark ? const Color(0xFF1E1E1E) : Colors.grey[50]),
              border: Border.all(color: borderColor, width: has ? 1.4 : 1),
              borderRadius: BorderRadius.circular(14.r),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children:[
                  Icon(Icons.location_on, size: 18.sp, color: has ? primaryColor : (isDark ? Colors.grey[500] : Colors.grey[600])),
                  SizedBox(width: 6.w),
                  Text(label, style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: has ? primaryColor : (isDark ? Colors.grey[400] : Colors.grey[700]))),
                  const Spacer(),
                  Icon(Icons.edit_location_alt_outlined, size: 16.sp, color: isDark ? Colors.grey[600] : Colors.grey[500])
                ]),
                SizedBox(height: 6.h),
                if (!has)
                  Text('Konum seç', style: TextStyle(fontSize: 12.sp, color: isDark ? Colors.grey[600] : Colors.grey[500]))
                else ...[
                  if (short.isNotEmpty)
                    Text(short, style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: primaryColor)),
                  if (short.isNotEmpty) SizedBox(height: 4.h),
                  // Tam adresi kesmeden çok satırlı göster
                  Text(
                    full,
                    style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w500, color: isDark ? Colors.grey[400] : Colors.grey[800], height: 1.25),
                    softWrap: true,
                  ),
                ]
              ],
            ),
        ),
      );
    });
  }

  Widget _routePreview() {
    final primaryColor = AppColors.medinaGreen40;
    return Obx(() {
      final from = fromAddress?.currentAddress.address ?? '';
      final to = toAddress?.currentAddress.address ?? '';
      if (from.isEmpty && to.isEmpty) return const SizedBox.shrink();
      final fromShort = fromAddress!.getShortAddress();
      final toShort = toAddress!.getShortAddress();
      return AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.all(14.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors:[primaryColor.withValues(alpha:.08), primaryColor.withValues(alpha:.02)]),
          border: Border.all(color: primaryColor.withValues(alpha:.4)),
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Row(children:[
            Icon(Icons.alt_route, color: primaryColor, size: 18.sp),
            SizedBox(width: 6.w),
            Expanded(child: Text('Seçilen Güzergah', style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w700, color: primaryColor))),
          ]),
          SizedBox(height: 8.h),
          if (from.isNotEmpty)
            _routeLine('Kalkış', fromShort, from, Icons.trip_origin),
          if (to.isNotEmpty) ...[
            SizedBox(height: 8.h),
            _routeLine('Varış', toShort, to, Icons.flag),
          ]
        ]),
      );
    });
  }

  Widget _routeLine(String label, String short, String full, IconData icon) {
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Icon(icon, size: 16.sp, color: primaryColor),
      SizedBox(width: 6.w),
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Text('$label${short.isNotEmpty ? ': $short' : ''}', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, color: primaryColor)),
          SizedBox(height: 2.h),
          Text(full, style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w500, color: isDark ? Colors.grey[400] : Colors.grey[800], height: 1.25), softWrap: true),
        ]),
      ),
    ]);
  }

  Widget _filledField(String label,{required TextEditingController controller, TextInputType keyboard = TextInputType.text, String? Function(String?)? validator, String? hint}) {
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
    return TextFormField(
      controller: controller,
      keyboardType: keyboard,
      validator: validator,
      style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
        hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400], fontSize: 12.sp),
        filled: true,
        fillColor: isDark ? Colors.grey[900] : Colors.white,
        isDense: false,
        contentPadding: EdgeInsets.symmetric(horizontal:14.w, vertical:12.h),
        border: baseBorder,
        enabledBorder: baseBorder,
        focusedBorder: focusBorder,
        floatingLabelStyle: TextStyle(color: primaryColor, fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _imagesSection() {
    final isDark = Get.isDarkMode;
    return Obx(() => Wrap(spacing: 8.w, runSpacing: 8.w, children: [
      ...existingImages.where((e)=> !removedExisting.contains(e)).map((url) => Stack(
        children:[
          ClipRRect(
            borderRadius: BorderRadius.circular(12.r),
            child: Image.network(url, width: 80.w, height: 80.w, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(color: isDark ? Colors.grey[800] : Colors.grey[300], width: 80.w, height: 80.w, child: Icon(Icons.broken_image, color: isDark ? Colors.grey[400] : Colors.grey[600])),
            ),
          ),
          Positioned(
            top: 2, right: 2,
            child: GestureDetector(
              onTap: ()=> removedExisting.add(url),
              child: Container(
                decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20.r)),
                padding: EdgeInsets.all(4.w),
                child: const Icon(Icons.close, size: 14, color: Colors.white),
              ),
            ),
          )
        ],
      )),
      ...newImages.map((x) => FutureBuilder<Uint8List>(
        future: x.readAsBytes(),
        builder: (context, snap) {
          final bytes = snap.data;
          return Stack(children:[
            ClipRRect(
              borderRadius: BorderRadius.circular(12.r),
              child: bytes == null
                  ? Container(width:80.w,height:80.w,alignment:Alignment.center,child: const SizedBox(width:18,height:18,child:CircularProgressIndicator(strokeWidth:2)))
                  : Image.memory(bytes, width: 80.w, height: 80.w, fit: BoxFit.cover),
            ),
            Positioned(
              top: 2, right: 2,
              child: GestureDetector(
                onTap: ()=> newImages.remove(x),
                child: Container(
                  decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20.r)),
                  padding: EdgeInsets.all(4.w),
                  child: const Icon(Icons.close, size: 14, color: Colors.white),
                ),
              ),
            )
          ]);
        },
      )),
      GestureDetector(
        onTap: _pickImages,
        child: Container(
          width: 80.w,
          height: 80.w,
          decoration: BoxDecoration(
            color: isDark ? Colors.grey[800] : Colors.grey[100],
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(color: isDark ? Colors.grey[600]! : Colors.grey[300]!),
          ),
          child: Icon(Icons.add_a_photo_outlined, color: isDark ? Colors.grey[400] : Colors.grey),
        ),
      ),
    ]));
  }

  String? _reqNum(String? v) {
    if (v == null || v.isEmpty) return 'Zorunlu';
    if (int.tryParse(v) == null) return 'Sayı girin';
    return null;
  }

  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage(imageQuality: 80);
    if (picked.isNotEmpty) newImages.addAll(picked);
  }

  Future<void> _pickLocation(AddressController tagController, String tag) async {
    final result = await Get.toNamed('/select-location', arguments: {'tag': tag});
    if (result is AddressModel) {
      tagController.setAddress(result);
    }
    if (mounted) setState(() {});
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (!fromAddress!.currentAddress.hasCoordinates || !toAddress!.currentAddress.hasCoordinates) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Konumlar seçilmelidir'), backgroundColor: Colors.red),
      );
      return;
    }
    try {
      controller.isSaving.value = true;
      // upload new images first
      final newUrls = await controller.uploadImages(newImages);
      final keptExisting = existingImages.where((e)=> !removedExisting.contains(e)).toList();
      final allImages = [...keptExisting, ...newUrls];

      final model = TransferModel(
        id: editing?.id,
        fromAddress: fromAddress!.currentAddress,
        toAddress: toAddress!.currentAddress,
        vehicleType: vehicleType.key,
        vehicleName: vehicleNameCtrl.text.trim(),
        capacity: int.tryParse(capacityCtrl.text.trim()) ?? 0,
        luggageCapacity: int.tryParse(luggageCapacityCtrl.text.trim()) ?? 0,
        childSeatCount: int.tryParse(childSeatCtrl.text.trim()) ?? 0,
        amenities: selectedAmenities.map((e) => e.key).toList(),
        basePrice: double.tryParse(basePriceCtrl.text.trim()) ?? 0,
        durationMinutes: int.tryParse(durationCtrl.text.trim()) ?? 0,
        company: companyCtrl.text.trim(),
        phone: phoneCtrl.text.trim().isEmpty? null : phoneCtrl.text.trim(),
        email: emailCtrl.text.trim().isEmpty? null : emailCtrl.text.trim(),
        whatsapp: whatsappCtrl.text.trim().isEmpty? null : whatsappCtrl.text.trim(),
        images: allImages,
        availability: editing?.availability ?? {},
        isActive: isActive,
        isPopular: isPopular,
        createdAt: editing?.createdAt,
        updatedAt: DateTime.now(),
      );
      await controller.save(model);
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transfer kaydedildi'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Hata: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      controller.isSaving.value = false;
    }
  }
}
