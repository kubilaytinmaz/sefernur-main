import 'dart:io';

import 'package:flutter/material.dart';
import '../../../../themes/theme.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';

import '../../../../../controllers/address/address_controller.dart';
import '../../../../../controllers/admin/car_admin_controller.dart';
import '../../../../../data/models/models.dart';
import '../../../../../routes/routes.dart';
import '../../../../widgets/currency_price_field.dart';

class CarAddForm extends StatefulWidget {
  const CarAddForm({super.key});

  @override
  State<CarAddForm> createState() => _CarAddFormState();
}

class _CarAddFormState extends State<CarAddForm> {
  final CarAdminController controller = Get.find<CarAdminController>();
  final AddressController address = Get.put(AddressController(), tag: 'car_address');
  final _formKey = GlobalKey<FormState>();

  CarModel? editing;
  bool _addressPrefilled = false; // ensure we inject existing address only once

  final brandCtrl = TextEditingController();
  final modelCtrl = TextEditingController();
  final companyCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final whatsappCtrl = TextEditingController();
  final locationNameCtrl = TextEditingController();
  final seatsCtrl = TextEditingController(text: '4');
  final priceCtrl = TextEditingController();
  final type = 'economy'.obs;
  final transmission = 'manual'.obs;
  final fuel = 'petrol'.obs;
  final RxBool isPopular = false.obs;

  final ImagePicker _picker = ImagePicker();
  final List<XFile> _images = [];
  final List<String> _existingImageUrls = [];
  final Set<int> _existingRemoved = {};
  LatLng? _pickedLocation; // fallback when editing without reopening map

  @override
  void dispose() {
    brandCtrl.dispose();
    modelCtrl.dispose();
    companyCtrl.dispose();
  phoneCtrl.dispose();
  emailCtrl.dispose();
  whatsappCtrl.dispose();
    locationNameCtrl.dispose();
    seatsCtrl.dispose();
    priceCtrl.dispose();
    Get.delete<AddressController>(tag: 'car_address');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    editing ??= controller.selectedCar.value;
    // Prefill once
    if (editing != null && brandCtrl.text.isEmpty) {
      final e = editing!;
      brandCtrl.text = e.brand;
      modelCtrl.text = e.model;
      companyCtrl.text = e.company;
  phoneCtrl.text = e.phone;
  emailCtrl.text = e.email;
  whatsappCtrl.text = e.whatsapp ?? '';
      locationNameCtrl.text = e.locationName;
      seatsCtrl.text = e.seats.toString();
      priceCtrl.text = e.dailyPrice.toString();
      type.value = e.type;
      transmission.value = e.transmission;
      fuel.value = e.fuelType;
      _pickedLocation = e.location;
      _existingImageUrls.clear();
      _existingImageUrls.addAll(e.images);
      isPopular.value = e.isPopular;
    }

    // Inject existing location into AddressController so previously selected map address shows
    if (editing != null && !_addressPrefilled) {
      if (address.currentAddress.isEmpty) {
        // Tercihen yeni addressModel'i kullan; yoksa legacy alanlardan üret
  final existingAddr = editing!.addressModel;
        address.setAddress(existingAddr);
        // Arka planda ayrıntıları güncelle (şehir vb.)
        address.updateAddressFromLocation();
      }
      _addressPrefilled = true;
    }
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Form(
      key: _formKey,
      child: Padding(
        padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, bottomInset + 16.h),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: _textField('Marka', brandCtrl, validator: _required)),
                  SizedBox(width: 12.w),
                  Expanded(child: _textField('Model', modelCtrl, validator: _required)),
                ],
              ),
              SizedBox(height: 12.h),
              _textField('Firma', companyCtrl, validator: _required),
              SizedBox(height: 12.h),
              Row(children: [
                Expanded(child: _textField('Telefon', phoneCtrl, validator: _required, keyboardType: TextInputType.phone)),
                SizedBox(width: 12.w),
                Expanded(child: _textField('Whatsapp', whatsappCtrl, keyboardType: TextInputType.phone)),
              ]),
              SizedBox(height: 12.h),
              _textField('E-posta', emailCtrl, keyboardType: TextInputType.emailAddress, validator: (v){ if(v==null||v.isEmpty) return 'Zorunlu'; if(!GetUtils.isEmail(v)) return 'Geçersiz'; return null; }),
              SizedBox(height: 12.h),
              Row(
                children: [
                  Expanded(child: _dropdown('Tip', type, ['economy','compact','suv','premium'])),
                  SizedBox(width: 12.w),
                  Expanded(child: _dropdown('Vites', transmission, ['manual','automatic'])),
                ],
              ),
              SizedBox(height: 12.h),
              Row(
                children: [
                  Expanded(child: _dropdown('Yakıt', fuel, ['petrol','diesel','hybrid','electric'])),
                  SizedBox(width: 12.w),
                  Expanded(child: _textField('Koltuk (kişi)', seatsCtrl, validator: _required, keyboardType: TextInputType.number)),
                ],
              ),
              SizedBox(height: 12.h),
              CurrencyPriceField(
                controller: priceCtrl,
                label: 'Günlük Fiyat',
                hint: 'Günlük kiralama ücreti',
                prefixIcon: Icons.attach_money,
              ),
              SizedBox(height: 12.h),
              Obx(()=> SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Popüler'),
                value: isPopular.value,
                onChanged: (v)=> isPopular.value = v,
              )),
              SizedBox(height: 12.h),

              // Address selection (same pattern as hotel)
              _locationPicker(context),

                  SizedBox(height: 12.h),
                  _imagesPicker(),

              SizedBox(height: 16.h),
              SizedBox(
                width: double.infinity,
                height: 48.h,
                child: Obx(() => ElevatedButton(
                  onPressed: controller.isSaving.value ? null : _save,
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                    elevation: 0,
                  ),
                  child: controller.isSaving.value
                      ? const CircularProgressIndicator.adaptive(backgroundColor: Colors.white)
                      : const Text('Kaydet'),
                )),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _textField(String label, TextEditingController ctrl, {String? Function(String?)? validator, TextInputType? keyboardType}) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      decoration: _decor(label),
      validator: validator,
    );
  }

  Widget _dropdown(String label, RxString value, List<String> options) {
    final isDark = Get.isDarkMode;
    return Obx(() => DropdownButtonFormField<String>(
      initialValue: value.value,
      dropdownColor: isDark ? const Color(0xFF2A2A2A) : Colors.white,
      style: TextStyle(color: isDark ? Colors.white : Colors.black87),
      decoration: _decor(label).copyWith(contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 14.h)),
      isExpanded: true,
      items: options.map((e) => DropdownMenuItem(value: e, child: Text(e, style: TextStyle(color: isDark ? Colors.white : Colors.black87)))).toList(),
      onChanged: (v) { if (v != null) value.value = v; },
    ));
  }

  Widget _locationPicker(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = AppColors.medinaGreen40;
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!, width: 1.2),
        borderRadius: BorderRadius.circular(12.r),
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.location_on_outlined, size: 16.sp, color: isDark ? Colors.grey[400] : Colors.grey[700]),
              SizedBox(width: 6.w),
              Text('Teslim Noktası', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
            ],
          ),
          SizedBox(height: 8.h),
          TextFormField(
            controller: locationNameCtrl,
            style: TextStyle(color: isDark ? Colors.white : Colors.black87),
            decoration: _decor('Teslim Noktası Adı').copyWith(hintText: 'Örn: King Abdulaziz Havalimanı, Cidde', hintStyle: TextStyle(color: isDark ? Colors.grey[600] : Colors.grey[400])),
            validator: _required,
          ),
          SizedBox(height: 8.h),
          Row(
            children: [
              Expanded(
                child: Obx(() => Text(
                  address.isAddressValid()
                      ? address.getShortAddress().isNotEmpty
                          ? address.getShortAddress()
                          : address.currentAddress.address
                      : (editing != null ? editing!.locationName : 'Haritadan konum seçin'),
                  style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
                  overflow: TextOverflow.ellipsis,
                )),
              ), 
              SizedBox(width: 8.w),
              OutlinedButton.icon(
                onPressed: () {
                  Get.toNamed(Routes.SELECT_LOCATION)?.then((result) {
                    if (result != null && result is AddressModel) {
                      address.setAddress(result);
                      setState(() {});
                    }
                  });
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: primaryColor),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                ),
                icon: Icon(Icons.map_outlined, color: primaryColor),
                label: Text('Harita', style: TextStyle(color: primaryColor)),
              )
            ],
          ),
        ],
      ),
    );
  }

  InputDecoration _decor(String label) {
    final primary = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[700]),
      filled: true,
      fillColor: isDark ? Colors.grey[900] : Colors.white,
      contentPadding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[400]!, width: 1.2),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey[400]!, width: 1.2),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: BorderSide(color: primary, width: 2),
      ),
      floatingLabelStyle: TextStyle(color: primary, fontWeight: FontWeight.w600),
    );
  }

  String? _required(String? v) => (v == null || v.trim().isEmpty) ? 'Zorunlu' : null;

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    // If editing and no new map selection, fallback to existing coordinates
    if (!address.isAddressValid() && _pickedLocation == null) {
      Get.snackbar('Konum Seçimi', 'Lütfen haritadan teslim konumunu seçiniz');
      return;
    }

    controller.isSaving.value = true;
    // Start with existing images minus removed
    List<String> finalImageUrls = [
      for (int i = 0; i < _existingImageUrls.length; i++)
        if (!_existingRemoved.contains(i)) _existingImageUrls[i]
    ];
    try {
      if (_images.isNotEmpty) {
        final uploaded = await controller.uploadImages(_images);
        finalImageUrls.addAll(uploaded);
      }

      final LatLng loc = address.isAddressValid()
          ? LatLng(
              address.currentAddress.location?.latitude ?? 0,
              address.currentAddress.location?.longitude ?? 0,
            )
          : (_pickedLocation ?? const LatLng(0, 0));

      // Ensure non-null AddressModel (CarModel requires it)
      if (address.currentAddress.isEmpty) {
        if (editing?.addressModel == null) {
          Get.snackbar('Adres', 'Lütfen teslim adresini haritadan seçiniz');
          controller.isSaving.value = false;
          return;
        }
      }
      final AddressModel addrModel = address.currentAddress.isEmpty
          ? editing!.addressModel // safe because we returned if null
          : address.currentAddress.copyWith(location: loc);

      final car = CarModel(
        id: editing?.id,
        brand: brandCtrl.text.trim(),
        model: modelCtrl.text.trim(),
        type: type.value,
        transmission: transmission.value,
        fuelType: fuel.value,
        seats: int.tryParse(seatsCtrl.text) ?? 4,
        company: companyCtrl.text.trim(),
  phone: phoneCtrl.text.trim(),
  email: emailCtrl.text.trim(),
  whatsapp: whatsappCtrl.text.trim().isEmpty ? null : whatsappCtrl.text.trim(),
        addressModel: addrModel,
        dailyPrice: double.tryParse(priceCtrl.text) ?? 0,
        discountedDailyPrice: editing?.discountedDailyPrice,
        rating: editing?.rating ?? 0,
        reviewCount: editing?.reviewCount ?? 0,
        images: finalImageUrls,
        availability: editing?.availability ?? const {},
        isActive: editing?.isActive ?? true,
        isPopular: isPopular.value,
        createdAt: editing?.createdAt,
      );
      await controller.saveCar(car);
      Navigator.of(Get.overlayContext!).pop();
    } catch (e) {
      Get.snackbar('Görsel Yükleme', 'Görseller yüklenirken hata oluştu: $e');
    } finally {
      controller.isSaving.value = false;
    }
  }

  Widget _imagesPicker() {
    final primary = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!, width: 1.2),
        borderRadius: BorderRadius.circular(12.r),
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.directions_car_filled_outlined, size: 16.sp, color: isDark ? Colors.grey[400] : Colors.grey[700]),
              SizedBox(width: 6.w),
              Text('Araç Görselleri', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87)),
              const Spacer(),
              TextButton.icon(
                onPressed: _onPickImages,
                style: TextButton.styleFrom(foregroundColor: primary),
                icon: const Icon(Icons.add_photo_alternate_outlined),
                label: const Text('Ekle'),
              )
            ],
          ),
          SizedBox(height: 8.h),
          if (_existingImageUrls.isEmpty && _images.isEmpty)
            Text('Henüz görsel seçilmedi', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[600]))
          else ...[
            if (_existingImageUrls.isNotEmpty)
              Wrap(
                spacing: 8.w,
                runSpacing: 8.h,
                children: List.generate(_existingImageUrls.length, (i) => _thumbExisting(i, _existingImageUrls[i])),
              ),
            if (_images.isNotEmpty) ...[
              SizedBox(height: 8.h),
              Wrap(
                spacing: 8.w,
                runSpacing: 8.h,
                children: List.generate(_images.length, (i) => _thumb(i)),
              ),
            ]
          ],
        ],
      ),
    );
  }

  void _onPickImages() async {
    try {
      final picked = await _picker.pickMultiImage(imageQuality: 80, maxWidth: 1600);
      if (picked.isNotEmpty) {
        setState(() {
          _images.addAll(picked);
        });
      }
    } catch (e) {
      Get.snackbar('Görsel Seçimi', 'Görsel seçilirken hata: $e');
    }
  }

  Widget _thumb(int index) {
    final file = _images[index];
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10.r),
          child: Image.file(
            File(file.path),
            width: 80.w,
            height: 80.w,
            fit: BoxFit.cover,
          ),
        ),
        Positioned(
          right: 4,
          top: 4,
          child: InkWell(
            onTap: () {
              setState(() { _images.removeAt(index); });
            },
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(12.r),
              ),
              padding: const EdgeInsets.all(2),
              child: const Icon(Icons.close, color: Colors.white, size: 16),
            ),
          ),
        )
      ],
    );
  }

  Widget _thumbExisting(int index, String url) {
    final removed = _existingRemoved.contains(index);
    return Stack(
      children: [
        ColorFiltered(
          colorFilter: removed
              ? const ColorFilter.mode(Colors.black45, BlendMode.darken)
              : const ColorFilter.mode(Colors.transparent, BlendMode.dst),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10.r),
            child: Image.network(
              url,
              width: 80.w,
              height: 80.w,
              fit: BoxFit.cover,
            ),
          ),
        ),
        Positioned(
          right: 4,
          top: 4,
          child: InkWell(
            onTap: () {
              setState(() {
                if (removed) {
                  _existingRemoved.remove(index);
                } else {
                  _existingRemoved.add(index);
                }
              });
            },
            child: Container(
              decoration: BoxDecoration(
                color: removed ? Colors.green : Colors.black54,
                borderRadius: BorderRadius.circular(12.r),
              ),
              padding: const EdgeInsets.all(2),
              child: Icon(removed ? Icons.undo : Icons.close, color: Colors.white, size: 16),
            ),
          ),
        )
      ],
    );
  }
}
