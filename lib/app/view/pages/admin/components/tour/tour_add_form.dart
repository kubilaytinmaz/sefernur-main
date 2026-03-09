import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';

import '../../../../../controllers/admin/tour_admin_controller.dart';
import '../../../../../data/models/address/address_model.dart';
import '../../../../../data/models/tour/tour_model.dart';
import '../../../../themes/theme.dart';
import '../../../../widgets/currency_price_field.dart';

class TourAddForm extends StatefulWidget {
  const TourAddForm({super.key});
  @override
  State<TourAddForm> createState() => _TourAddFormState();
}

class _TourAddFormState extends State<TourAddForm> {
  late final TourAdminController controller;
  final _formKey = GlobalKey<FormState>();
  final titleCtrl = TextEditingController();
  final descCtrl = TextEditingController();
  final categoryCtrl = TextEditingController();
  final tagsCtrl = TextEditingController();
  // regionsCtrl removed; now using structured address list
  final durationCtrl = TextEditingController();
  final basePriceCtrl = TextEditingController();
  final childPriceCtrl = TextEditingController();
  final companyCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final whatsappCtrl = TextEditingController();
  final startDateCtrl = TextEditingController();
  final endDateCtrl = TextEditingController();

  // Yeni alanlar
  String? selectedServiceType;
  final mekkeNightsCtrl = TextEditingController();
  final medineNightsCtrl = TextEditingController();
  final flightDepFromCtrl = TextEditingController();
  final flightDepToCtrl = TextEditingController();
  final flightRetFromCtrl = TextEditingController();
  final flightRetToCtrl = TextEditingController();
  final airlineCtrl = TextEditingController();
  String? airlineLogo; // Havayolu logosu URL

  List<_ProgramInput> programInputs = [];
  // Yeni: seçilen hizmet adresleri listesi
  final List<AddressModel> _selectedAddresses = [];
  List<String> images = [];
  bool isPopular = false;

  @override
  void initState() {
    super.initState();
    controller = Get.find<TourAdminController>();
    final t = controller.selected.value;
    if (t != null) {
      titleCtrl.text = t.title;
      descCtrl.text = t.description;
      categoryCtrl.text = t.category;
      tagsCtrl.text = t.tags.join(', ');
      // regions removed
      durationCtrl.text = t.durationDays.toString();
      basePriceCtrl.text = t.basePrice.toStringAsFixed(0);
      childPriceCtrl.text = t.childPrice?.toStringAsFixed(0) ?? '';
      companyCtrl.text = t.company ?? '';
      phoneCtrl.text = t.phone ?? '';
      emailCtrl.text = t.email ?? '';
      whatsappCtrl.text = t.whatsapp ?? '';
      programInputs = t.program
          .map(
            (p) => _ProgramInput(
              day: p.day,
              title: TextEditingController(text: p.title),
              details: TextEditingController(text: p.details),
              locationName: p.locationName,
              latitude: p.latitude,
              longitude: p.longitude,
              addressModel: p.addressModel,
              dayLabel: TextEditingController(text: p.dayLabel ?? ''),
            ),
          )
          .toList();
      images = List.from(t.images);
      isPopular = t.isPopular;
      if (t.startDate != null) startDateCtrl.text = _fmtDate(t.startDate!);
      if (t.endDate != null) endDateCtrl.text = _fmtDate(t.endDate!);

      // Yeni alanları doldur
      selectedServiceType = t.serviceType;
      mekkeNightsCtrl.text = t.mekkeNights?.toString() ?? '';
      medineNightsCtrl.text = t.medineNights?.toString() ?? '';
      flightDepFromCtrl.text = t.flightDepartureFrom ?? '';
      flightDepToCtrl.text = t.flightDepartureTo ?? '';
      flightRetFromCtrl.text = t.flightReturnFrom ?? '';
      flightRetToCtrl.text = t.flightReturnTo ?? '';
      airlineCtrl.text = t.airline ?? '';
      airlineLogo = t.airlineLogo;
    }
    if (programInputs.isEmpty) programInputs.add(_ProgramInput(day: 1));
    // Mevcut turda adresler varsa ata
    if (t?.serviceAddresses != null) {
      _selectedAddresses.addAll(t!.serviceAddresses);
    }
  }

  @override
  void dispose() {
    titleCtrl.dispose();
    descCtrl.dispose();
    categoryCtrl.dispose();
    tagsCtrl.dispose();
    // regions removed
    durationCtrl.dispose();
    basePriceCtrl.dispose();
    childPriceCtrl.dispose();
    companyCtrl.dispose();
    phoneCtrl.dispose();
    emailCtrl.dispose();
    whatsappCtrl.dispose();
    startDateCtrl.dispose();
    endDateCtrl.dispose();
    mekkeNightsCtrl.dispose();
    medineNightsCtrl.dispose();
    flightDepFromCtrl.dispose();
    flightDepToCtrl.dispose();
    flightRetFromCtrl.dispose();
    flightRetToCtrl.dispose();
    airlineCtrl.dispose();
    for (final p in programInputs) {
      p.title.dispose();
      p.details.dispose();
      p.dayLabel.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        padding: EdgeInsets.fromLTRB(
          16.w,
          12.h,
          16.w,
          MediaQuery.of(context).viewInsets.bottom + 24.h,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _headerImages(context),
            SizedBox(height: 12.h),
            _field(
              'Tur Başlığı',
              titleCtrl,
              validator: (v) => v!.trim().isEmpty ? 'Gerekli' : null,
            ),
            _multiLine('Açıklama', descCtrl),
            Row(
              children: [
                Expanded(child: _field('Kategori', categoryCtrl)),
                SizedBox(width: 12.w),
                Expanded(
                  child: _field(
                    'Süre (gün)',
                    durationCtrl,
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(child: _field('Firma', companyCtrl)),
                SizedBox(width: 12.w),
                Expanded(
                  child: _field(
                    'Telefon',
                    phoneCtrl,
                    keyboardType: TextInputType.phone,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: _field(
                    'Whatsapp',
                    whatsappCtrl,
                    keyboardType: TextInputType.phone,
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: _field(
                    'E-posta',
                    emailCtrl,
                    validator: (v) {
                      if (v != null && v.isNotEmpty && !GetUtils.isEmail(v))
                        return 'Geçersiz';
                      return null;
                    },
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: _dateField('Başlangıç Tarihi', startDateCtrl, (d) {
                    setState(() => startDateCtrl.text = _fmtDate(d));
                  }),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: _dateField('Bitiş Tarihi', endDateCtrl, (d) {
                    setState(() => endDateCtrl.text = _fmtDate(d));
                  }),
                ),
              ],
            ),
            _field('Etiketler (virgülle)', tagsCtrl),
            _serviceAddressesSection(),

            // --- Yeni Alanlar ---
            SizedBox(height: 16.h),
            Text(
              'Hizmet & Konaklama',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            SizedBox(height: 8.h),
            DropdownButtonFormField<String>(
              initialValue: selectedServiceType,
              decoration: InputDecoration(
                labelText: 'Hizmet Tipi',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 12.w,
                  vertical: 14.h,
                ),
              ),
              items: const [
                DropdownMenuItem(value: 'Servisli', child: Text('Servisli')),
                DropdownMenuItem(
                  value: 'Yürüme Mesafesi',
                  child: Text('Yürüme Mesafesi'),
                ),
                DropdownMenuItem(value: 'VIP', child: Text('VIP')),
              ],
              onChanged: (v) => setState(() => selectedServiceType = v),
            ),
            SizedBox(height: 12.h),
            Row(
              children: [
                Expanded(
                  child: _field(
                    'Mekke (Gece)',
                    mekkeNightsCtrl,
                    keyboardType: TextInputType.number,
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: _field(
                    'Medine (Gece)',
                    medineNightsCtrl,
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),

            SizedBox(height: 16.h),
            Text(
              'Uçuş Bilgileri',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            SizedBox(height: 8.h),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(child: _field('Havayolu', airlineCtrl)),
                SizedBox(width: 12.w),
                // Havayolu logo seçimi
                Padding(
                  padding: EdgeInsets.only(bottom: 12.h),
                  child: GestureDetector(
                    onTap: _pickAirlineLogo,
                    child: Container(
                      width: 42.w,
                      height: 42.h,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.grey[900] : Colors.white,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(
                          color: airlineLogo != null
                              ? AppColors.medinaGreen40
                              : isDark
                                  ? Colors.grey[700]!
                                  : Colors.grey[400]!,
                          width: 1.2,
                        ),
                      ),
                      child: airlineLogo != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(11.r),
                              child: Image.network(
                                airlineLogo!,
                                fit: BoxFit.contain,
                                errorBuilder: (_, __, ___) => Icon(
                                  Icons.flight,
                                  size: 18.sp,
                                  color: Colors.grey[400],
                                ),
                              ),
                            )
                          : Icon(
                              Icons.add_photo_alternate_outlined,
                              size: 18.sp,
                              color: Colors.grey[400],
                            ),
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 8.h),
            Text(
              'Gidiş Uçuşu',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[400] : Colors.grey[700],
              ),
            ),
            Row(
              children: [
                Expanded(child: _field('Nereden', flightDepFromCtrl)),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.w),
                  child: const Icon(
                    Icons.arrow_forward,
                    size: 16,
                    color: Colors.grey,
                  ),
                ),
                Expanded(child: _field('Nereye', flightDepToCtrl)),
              ],
            ),
            SizedBox(height: 8.h),
            Text(
              'Dönüş Uçuşu',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.grey[400] : Colors.grey[700],
              ),
            ),
            Row(
              children: [
                Expanded(child: _field('Nereden', flightRetFromCtrl)),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 8.w),
                  child: const Icon(
                    Icons.arrow_forward,
                    size: 16,
                    color: Colors.grey,
                  ),
                ),
                Expanded(child: _field('Nereye', flightRetToCtrl)),
              ],
            ),
            SizedBox(height: 16.h),

            // --------------------
            UsdCurrencyPriceField(
              controller: basePriceCtrl,
              label: 'Temel Fiyat',
              hint: 'Kişi başı tur ücreti (USD)',
            ),
            SizedBox(height: 12.h),
            UsdCurrencyPriceField(
              controller: childPriceCtrl,
              label: 'Çocuk Fiyat',
              hint: 'Varsa çocuk ücreti (USD)',
              isRequired: false,
            ),
            SizedBox(height: 8.h),
            _programSection(),
            SizedBox(height: 20.h),
            Obx(
              () => SizedBox(
                width: double.infinity,
                height: 48.h,
                child: ElevatedButton.icon(
                  onPressed: controller.isSaving.value ? null : _save,
                  icon: const Icon(Icons.save_outlined),
                  label: Text(
                    controller.isSaving.value ? 'Kaydediliyor...' : 'Kaydet',
                  ),
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14.r),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
            ),
            SizedBox(height: 12.h),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Popüler'),
              value: isPopular,
              onChanged: (v) => setState(() => isPopular = v),
            ),
          ],
        ),
      ),
    );
  }

  Widget _headerImages(BuildContext ctx) {
    final isDark = Theme.of(ctx).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Görseller',
          style: TextStyle(
            fontSize: 13.sp,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        SizedBox(height: 8.h),
        Container(
          height: 110.h,
          width: double.infinity,
          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 10.h),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            border: Border.all(
              color: isDark ? Colors.grey[700]! : Colors.grey[400]!,
              width: 1.2,
            ),
            borderRadius: BorderRadius.circular(14.r),
          ),
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemBuilder: (_, i) {
              if (i == images.length) return _addImageButton();
              final url = images[i];
              return Container(
                width: 130.w,
                decoration: BoxDecoration(
                  border: Border.all(
                    color: isDark ? Colors.grey[700]! : Colors.grey[400]!,
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(12.r),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(
                        alpha: isDark ? 0.2 : 0.05,
                      ),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(11.r),
                      child: Image.network(
                        url,
                        width: 130.w,
                        height: 90.h,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () {
                          setState(() => images.removeAt(i));
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          padding: const EdgeInsets.all(4),
                          child: const Icon(
                            Icons.close,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
            separatorBuilder: (_, __) => SizedBox(width: 10.w),
            itemCount: images.length + 1,
          ),
        ),
      ],
    );
  }

  Widget _addImageButton() {
    return GestureDetector(
      onTap: _pickImages,
      child: Container(
        width: 130.w,
        height: 90.h,
        decoration: BoxDecoration(
          color: AppColors.medinaGreen40.withValues(alpha: .05),
          borderRadius: BorderRadius.circular(12.r),
          border: Border.all(color: AppColors.medinaGreen40, width: 1.6),
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.add_a_photo_outlined,
                color: AppColors.medinaGreen40,
                size: 22.sp,
              ),
              SizedBox(height: 4.h),
              Text(
                'Görsel Ekle',
                style: TextStyle(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w600,
                  color: AppColors.medinaGreen40,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(
    String label,
    TextEditingController ctrl, {
    String? Function(String?)? validator,
    TextInputType keyboardType = TextInputType.text,
  }) {
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    final baseBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(
        color: isDark ? Colors.grey[700]! : Colors.grey[400]!,
        width: 1.2,
      ),
    );
    final focusBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: primaryColor, width: 2),
    );
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: TextFormField(
        controller: ctrl,
        validator: validator,
        keyboardType: keyboardType,
        style: TextStyle(
          fontSize: 13.sp,
          fontWeight: FontWeight.w600,
          color: isDark ? Colors.white : Colors.black87,
        ),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(
            color: isDark ? Colors.grey[400] : Colors.grey[700],
          ),
          filled: true,
          fillColor: isDark ? Colors.grey[900] : Colors.white,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 14.w,
            vertical: 12.h,
          ),
          border: baseBorder,
          enabledBorder: baseBorder,
          focusedBorder: focusBorder,
          floatingLabelStyle: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _multiLine(String label, TextEditingController ctrl) {
    final primaryColor = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    final baseBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(
        color: isDark ? Colors.grey[700]! : Colors.grey[400]!,
        width: 1.2,
      ),
    );
    final focusBorder = OutlineInputBorder(
      borderRadius: BorderRadius.circular(12.r),
      borderSide: BorderSide(color: primaryColor, width: 2),
    );
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: TextFormField(
        controller: ctrl,
        maxLines: 4,
        style: TextStyle(
          fontSize: 13.sp,
          fontWeight: FontWeight.w600,
          color: isDark ? Colors.white : Colors.black87,
        ),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(
            color: isDark ? Colors.grey[400] : Colors.grey[700],
          ),
          alignLabelWithHint: true,
          filled: true,
          fillColor: isDark ? Colors.grey[900] : Colors.white,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 14.w,
            vertical: 12.h,
          ),
          border: baseBorder,
          enabledBorder: baseBorder,
          focusedBorder: focusBorder,
          floatingLabelStyle: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _programSection() {
    final isDark = Get.isDarkMode;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Program',
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: _autoGenerateDays,
              icon: const Icon(Icons.auto_fix_high_outlined),
              label: const Text('Süreye Göre Oluştur'),
            ),
          ],
        ),
        Column(children: programInputs.map((p) => _programDay(p)).toList()),
        SizedBox(height: 8.h),
        SizedBox(
          width: double.infinity,
          height: 42.h,
          child: OutlinedButton.icon(
            onPressed: _addProgramDay,
            icon: const Icon(Icons.add),
            label: const Text('Yeni Gün Ekle'),
            style: OutlinedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _serviceAddressesSection() {
    final isDark = Get.isDarkMode;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Hizmet Bölgeleri',
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w700,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: _pickServiceAddress,
              icon: const Icon(Icons.add_location_alt_outlined),
              label: const Text('Adres Ekle'),
            ),
          ],
        ),
        if (_selectedAddresses.isEmpty)
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(14.w),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[900] : Colors.grey[50],
              border: Border.all(
                color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
              ),
              borderRadius: BorderRadius.circular(14.r),
            ),
            child: Text(
              'Henüz adres eklenmedi',
              style: TextStyle(
                fontSize: 11.sp,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
          )
        else
          Column(
            children: _selectedAddresses.asMap().entries.map((e) {
              final i = e.key;
              final a = e.value;
              return _addressTile(a, i);
            }).toList(),
          ),
        SizedBox(height: 12.h),
      ],
    );
  }

  Widget _addressTile(AddressModel a, int index) {
    final parts = <String>[];
    if (a.city.isNotEmpty) parts.add(a.city);
    if (a.state.isNotEmpty && a.state.toLowerCase() != a.city.toLowerCase())
      parts.add(a.state);
    if (a.country.isNotEmpty) parts.add(a.country);
    final short = parts.isEmpty
        ? (a.address.isNotEmpty ? a.address : 'Adres')
        : parts.join(' • ');
    final isDark = Get.isDarkMode;
    return Container(
      margin: EdgeInsets.only(bottom: 8.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
        ),
        borderRadius: BorderRadius.circular(14.r),
      ),
      child: Row(
        children: [
          Icon(Icons.place, size: 16.sp, color: AppColors.medinaGreen40),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              short,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: isDark ? Colors.white : Colors.black87,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            onPressed: () {
              setState(() => _selectedAddresses.removeAt(index));
            },
            icon: Icon(
              Icons.close,
              size: 18,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickServiceAddress() async {
    final result = await Get.toNamed(
      '/select-location',
      arguments: {
        'tag': 'tour_service_address_${DateTime.now().millisecondsSinceEpoch}',
      },
    );
    if (result is AddressModel) {
      setState(() => _selectedAddresses.add(result));
    }
  }

  Widget _programDay(_ProgramInput p) {
    final isDark = Get.isDarkMode;
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(14.r),
        border: Border.all(
          color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Gün ${p.day}',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5.sp,
                  color: isDark ? Colors.white : Colors.black87,
                ),
              ),
              const Spacer(),
              if (programInputs.length > 1)
                IconButton(
                  onPressed: () => _removeProgramDay(p),
                  icon: Icon(
                    Icons.close,
                    size: 18,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
            ],
          ),
          _field('Gün Başlığı (opsiyonel)', p.dayLabel),
          _field('Başlık', p.title),
          _multiLine('Detaylar', p.details),
          SizedBox(height: 4.h),
          // Hızlı konum seçimi
          _quickLocationChips(p),
          SizedBox(height: 8.h),
          _programLocationPicker(p),
        ],
      ),
    );
  }

  Widget _quickLocationChips(_ProgramInput p) {
    final isDark = Get.isDarkMode;
    final locations = [
      {'name': 'Mekke', 'lat': 21.4225, 'lng': 39.8262},
      {'name': 'Medine', 'lat': 24.4672, 'lng': 39.6024},
      {'name': 'Cidde', 'lat': 21.5433, 'lng': 39.1728},
      {'name': 'Mina', 'lat': 21.4133, 'lng': 39.8933},
      {'name': 'Arafat', 'lat': 21.3549, 'lng': 39.9842},
      {'name': 'Müzdelife', 'lat': 21.3917, 'lng': 39.9367},
      {'name': 'Taif', 'lat': 21.2703, 'lng': 40.4158},
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hızlı Konum',
          style: TextStyle(
            fontSize: 11.sp,
            color: isDark ? Colors.grey[400] : Colors.grey[600],
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 6.h),
        SizedBox(
          height: 32.h,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: locations.length,
            separatorBuilder: (_, __) => SizedBox(width: 8.w),
            itemBuilder: (_, i) {
              final loc = locations[i];
              final isSelected = p.locationName == loc['name'];
              return GestureDetector(
                onTap: () {
                  setState(() {
                    p.locationName = loc['name'] as String;
                    p.latitude = loc['lat'] as double;
                    p.longitude = loc['lng'] as double;
                    p.addressModel = AddressModel(
                      address: loc['name'] as String,
                      city: loc['name'] as String,
                      country: 'Suudi Arabistan',
                      location: LatLng(
                        loc['lat'] as double,
                        loc['lng'] as double,
                      ),
                    );
                  });
                },
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 6.h,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.medinaGreen40
                        : isDark
                            ? Colors.grey[800]
                            : Colors.grey[100],
                    borderRadius: BorderRadius.circular(20.r),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.medinaGreen40
                          : isDark
                              ? Colors.grey[700]!
                              : Colors.grey[300]!,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 14.sp,
                        color: isSelected
                            ? Colors.white
                            : isDark
                                ? Colors.grey[400]
                                : Colors.grey[600],
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        loc['name'] as String,
                        style: TextStyle(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? Colors.white
                              : isDark
                                  ? Colors.grey[300]
                                  : Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _programLocationPicker(_ProgramInput p) {
    final has = p.locationName != null && p.locationName!.isNotEmpty;
    final primary = AppColors.medinaGreen40;
    final isDark = Get.isDarkMode;
    return GestureDetector(
      onTap: () => _pickProgramLocation(p),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: has
              ? primary.withValues(alpha: isDark ? .15 : .05)
              : isDark
                  ? Colors.grey[900]
                  : Colors.grey[50],
          border: Border.all(
            color: has
                ? primary
                : isDark
                    ? Colors.grey[700]!
                    : Colors.grey[300]!,
            width: has ? 1.4 : 1,
          ),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Row(
          children: [
            Icon(
              Icons.location_on,
              size: 16.sp,
              color: has
                  ? primary
                  : isDark
                      ? Colors.grey[400]
                      : Colors.grey[600],
            ),
            SizedBox(width: 8.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Gün Konumu',
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                      color: has
                          ? primary
                          : isDark
                              ? Colors.grey[300]
                              : Colors.grey[700],
                    ),
                  ),
                  if (has) ...[
                    SizedBox(height: 4.h),
                    Text(
                      p.locationName!,
                      style: TextStyle(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w500,
                        color: primary,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ] else
                    Text(
                      'Konum seç',
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: isDark ? Colors.grey[500] : Colors.grey[500],
                      ),
                    ),
                ],
              ),
            ),
            Icon(
              Icons.map_outlined,
              size: 16.sp,
              color: has
                  ? primary
                  : isDark
                      ? Colors.grey[500]
                      : Colors.grey[500],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickProgramLocation(_ProgramInput p) async {
    final result = await Get.toNamed(
      '/select-location',
      arguments: {'tag': 'tour_program_day_${p.day}'},
    );
    if (result is AddressModel) {
      setState(() {
        p.addressModel = result;
        p.locationName = result.address;
        p.latitude = result.location?.latitude;
        p.longitude = result.location?.longitude;
      });
    }
  }

  void _addProgramDay() {
    setState(() {
      programInputs.add(_ProgramInput(day: programInputs.length + 1));
    });
  }

  void _removeProgramDay(_ProgramInput p) {
    setState(() {
      programInputs.remove(p);
      for (int i = 0; i < programInputs.length; i++) {
        programInputs[i].day = i + 1;
      }
    });
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage();
    if (picked.isEmpty) return;
    final urls = await controller.uploadImages(picked);
    if (mounted) {
      setState(() => images.addAll(urls));
      // Snackbar'ı güvenli bir şekilde göster
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (urls.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${urls.length} görsel yüklendi'),
              backgroundColor: AppColors.medinaGreen40,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        } else if (picked.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Görseller yüklenemedi'),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
        }
      });
    }
  }

  Future<void> _pickAirlineLogo() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery);
    if (picked == null) return;
    final urls = await controller.uploadImages([XFile(picked.path)]);
    if (mounted && urls.isNotEmpty) {
      setState(() => airlineLogo = urls.first);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Havayolu logosu yüklendi'),
            backgroundColor: AppColors.medinaGreen40,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      });
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    // Parse dates; end date optional but if provided must be >= start
    DateTime? startDate = _parseDate(startDateCtrl.text.trim());
    DateTime? endDate = _parseDate(endDateCtrl.text.trim());
    if (endDate != null && startDate != null && endDate.isBefore(startDate)) {
      Get.snackbar('Hata', 'Bitiş tarihi başlangıçtan önce olamaz');
      return;
    }
    final t = controller.selected.value;
    final model = TourModel(
      id: t?.id,
      title: titleCtrl.text.trim(),
      description: descCtrl.text.trim(),
      category: categoryCtrl.text.trim(),
      tags: _split(tagsCtrl.text),
      serviceAddresses: _selectedAddresses,
      durationDays: int.tryParse(durationCtrl.text.trim()) ?? 1,
      startDate: startDate,
      endDate: endDate,
      program: programInputs
          .map(
            (p) => TourDayProgram(
              day: p.day,
              title: p.title.text.trim(),
              details: p.details.text.trim(),
              addressModel: p.addressModel,
              dayLabel: p.dayLabel.text.trim().isEmpty
                  ? null
                  : p.dayLabel.text.trim(),
            ),
          )
          .toList(),
      basePrice: double.tryParse(basePriceCtrl.text.trim()) ?? 0,
      childPrice: double.tryParse(childPriceCtrl.text.trim()),
      company: companyCtrl.text.trim().isEmpty ? null : companyCtrl.text.trim(),
      phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
      email: emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
      whatsapp: whatsappCtrl.text.trim().isEmpty
          ? null
          : whatsappCtrl.text.trim(),
      rating: t?.rating ?? 0,
      reviewCount: t?.reviewCount ?? 0,
      images: images,
      availability: t?.availability ?? {},
      isActive: t?.isActive ?? true,
      createdAt: t?.createdAt,
      updatedAt: DateTime.now(),
      isPopular: isPopular,
      addressModel: t?.addressModel,
      serviceType: selectedServiceType,
      mekkeNights: int.tryParse(mekkeNightsCtrl.text.trim()),
      medineNights: int.tryParse(medineNightsCtrl.text.trim()),
      flightDepartureFrom: flightDepFromCtrl.text.trim().isEmpty
          ? null
          : flightDepFromCtrl.text.trim(),
      flightDepartureTo: flightDepToCtrl.text.trim().isEmpty
          ? null
          : flightDepToCtrl.text.trim(),
      flightReturnFrom: flightRetFromCtrl.text.trim().isEmpty
          ? null
          : flightRetFromCtrl.text.trim(),
      flightReturnTo: flightRetToCtrl.text.trim().isEmpty
          ? null
          : flightRetToCtrl.text.trim(),
      airline: airlineCtrl.text.trim().isEmpty ? null : airlineCtrl.text.trim(),
      airlineLogo: airlineLogo,
    );
    await controller.save(model);
    if (mounted) Navigator.of(Get.overlayContext!).pop();
  }

  List<String> _split(String v) =>
      v.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();

  String _fmtDate(DateTime d) {
    return '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  DateTime? _parseDate(String v) {
    if (v.isEmpty) return null;
    return DateTime.tryParse(v);
  }

  Widget _dateField(
    String label,
    TextEditingController ctrl,
    ValueChanged<DateTime> onPicked,
  ) {
    return GestureDetector(
      onTap: () async {
        final now = DateTime.now();
        final initial = _parseDate(ctrl.text) ?? now;
        final picked = await showDatePicker(
          context: context,
          firstDate: DateTime(now.year - 1),
          lastDate: DateTime(now.year + 5),
          initialDate: initial.isBefore(DateTime(now.year - 1)) ? now : initial,
        );
        if (picked != null) onPicked(picked);
      },
      child: AbsorbPointer(
        child: _field(
          label,
          ctrl,
          validator: (v) {
            if (label.contains('Başlangıç') && (v == null || v.trim().isEmpty))
              return 'Gerekli';
            return null;
          },
        ),
      ),
    );
  }

  Future<void> _autoGenerateDays() async {
    final n = int.tryParse(durationCtrl.text.trim());
    if (n == null || n <= 0) {
      Get.snackbar('Hata', 'Geçerli bir süre (gün) giriniz');
      return;
    }
    if (programInputs.isNotEmpty) {
      final ok = await Get.dialog<bool>(
        AlertDialog(
          title: const Text('Günleri Oluştur'),
          content: Text(
            'Süre $n gün. Otomatik $n gün oluşturulsun mu? Mevcut program günleri değiştirilecek.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(Get.overlayContext!).pop(false),
              child: const Text('İptal'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(Get.overlayContext!).pop(true),
              child: const Text('Oluştur'),
            ),
          ],
        ),
      );
      if (ok != true) return;
    }
    setState(() {
      for (final p in programInputs) {
        p.title.dispose();
        p.details.dispose();
        p.dayLabel.dispose();
      }
      programInputs = List.generate(n, (i) => _ProgramInput(day: i + 1));
    });
  }
}

class _ProgramInput {
  _ProgramInput({
    required this.day,
    TextEditingController? title,
    TextEditingController? details,
    TextEditingController? dayLabel,
    this.locationName,
    this.latitude,
    this.longitude,
    this.addressModel,
  }) : title = title ?? TextEditingController(),
       details = details ?? TextEditingController(),
       dayLabel = dayLabel ?? TextEditingController();
  int day;
  final TextEditingController title;
  final TextEditingController details;
  final TextEditingController dayLabel;
  String? locationName;
  double? latitude;
  double? longitude;
  AddressModel? addressModel;
}
