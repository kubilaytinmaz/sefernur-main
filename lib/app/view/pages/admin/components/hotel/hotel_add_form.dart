import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../../controllers/controllers.dart';
import '../../../../../data/models/models.dart';
import '../../../../../routes/routes.dart';
import '../../../../themes/theme.dart';
import '../../../../widgets/currency_price_field.dart';

class HotelAddForm extends StatefulWidget {
  const HotelAddForm({super.key});

  @override
  State<HotelAddForm> createState() => _HotelAddFormState();
}

class _HotelAddFormState extends State<HotelAddForm> with SingleTickerProviderStateMixin {
  static final Color _primaryColor = AppColors.medinaGreen40;
  final AdminController controller = Get.find<AdminController>();
  final _formKey = GlobalKey<FormState>();
  
  // Form controllers
  late TextEditingController nameController;
  late TextEditingController descriptionController;
  late TextEditingController phoneController;
  late TextEditingController emailController;
  late TextEditingController websiteController;
  late TextEditingController whatsappController;
  
  // Form data
  final RxList<String> selectedImages = <String>[].obs;
  final RxList<String> selectedAmenities = <String>[].obs;
  final RxString selectedCategory = 'budget'.obs;
  final RxList<RoomType> roomTypes = <RoomType>[].obs;
  // Popular flag
  final RxBool isPopular = false.obs;
  
  // Room type form
  final TextEditingController roomNameController = TextEditingController();
  final TextEditingController roomDescController = TextEditingController();
  final TextEditingController roomCapacityController = TextEditingController();
  final TextEditingController roomPriceController = TextEditingController();
  final TextEditingController roomDiscountController = TextEditingController();
  final RxString selectedBoardType = 'BB'.obs;
  final RxList<String> selectedRoomAmenities = <String>[].obs;
  final RxList<String> selectedRoomImages = <String>[].obs;
  
  // Tab controller for room types
  late TabController tabController;
  
  // Predefined data
  final List<String> categories = ['budget', 'luxury', 'boutique', 'business'];
  final List<String> boardTypes = ['BB', 'HB', 'FB', 'AI'];
  final Map<String, String> boardTypeNames = {
    'BB': 'Bed & Breakfast',
    'HB': 'Yarım Pansiyon',
    'FB': 'Tam Pansiyon',
    'AI': 'Her Şey Dahil',
  };
  
  final List<String> hotelAmenities = [
    'WiFi', 'Otopark', 'Havuz', 'Spa', 'Fitness', 'Restaurant', 
    'Bar', 'Concierge', 'Room Service', 'Klima', 'Mini Bar',
    'Kasa', 'TV', 'Balkon', 'Deniz Manzarası', 'Çamaşırhane'
  ];
  
  final List<String> roomAmenities = [
    'WiFi', 'Klima', 'TV', 'Mini Bar', 'Kasa', 'Balkon',
    'Deniz Manzarası', 'Jakuzi', 'Küvet', 'Duş', 'Saç Kurutma Makinesi'
  ];

  @override
  void initState() {
    super.initState();
    tabController = TabController(length: 2, vsync: this);
    
    // Controllers'ı initialize et
    nameController = TextEditingController();
    descriptionController = TextEditingController();
    phoneController = TextEditingController();
    emailController = TextEditingController();
    websiteController = TextEditingController();
  whatsappController = TextEditingController();
    
    // Eğer düzenleme modundaysa, mevcut değerleri yükle
    _loadHotelData();
  }

  @override
  void dispose() {
    tabController.dispose();
    nameController.dispose();
    descriptionController.dispose();
    phoneController.dispose();
    emailController.dispose();
    websiteController.dispose();
  whatsappController.dispose();
    roomNameController.dispose();
    roomDescController.dispose();
    roomCapacityController.dispose();
    roomPriceController.dispose();
    roomDiscountController.dispose();
    super.dispose();
  }

  void _loadHotelData() {
    final hotel = controller.selectedHotel.value;
    if (hotel != null) {
      nameController.text = hotel.name;
      descriptionController.text = hotel.description;
      phoneController.text = hotel.phone;
      emailController.text = hotel.email;
      websiteController.text = hotel.website;
  whatsappController.text = hotel.whatsapp ?? '';
      
      selectedImages.value = List<String>.from(hotel.images);
      selectedAmenities.value = List<String>.from(hotel.amenities);
      selectedCategory.value = hotel.category;
      roomTypes.value = List<RoomType>.from(hotel.roomTypes);
      isPopular.value = hotel.isPopular;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Form(
      key: _formKey,
      child: Column(
        children: [
          // Tab Bar
          TabBar(
            controller: tabController,
            labelColor: _primaryColor,
            unselectedLabelColor: isDark ? Colors.grey[400] : Colors.grey,
            indicatorColor: _primaryColor,
            dividerColor: isDark ? Colors.grey[800] : Colors.grey[300],
            tabs: const [
              Tab(text: 'Genel Bilgiler'),
              Tab(text: 'Oda Tipleri'),
            ],
          ),

          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
              child: Column(
                children: [
                  // Tab Views
                  Expanded(
                    child: TabBarView(
                      controller: tabController,
                      children: [
                        _buildGeneralInfoTab(),
                        _buildRoomTypesTab(),
                      ],
                    ),
                  ),
                  
                  SizedBox(height: 16.h),
                  
                  // Save Button
                  Obx(() => SizedBox(
                    width: double.infinity,
                    height: 48.h,
                    child: ElevatedButton(
                      onPressed: controller.isSaving.value ? null : _saveHotel,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                      ),
                      child: controller.isSaving.value
                          ? SizedBox(
                              width: 20.w,
                              height: 20.h,
                              child: const CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : Text(
                              controller.selectedHotel.value == null ? 'Otel Ekle' : 'Güncelle',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                    ),
                  )),
          
                ],
              )
            )
          )
          
        ],
      ),
    );
  }

  Widget _buildGeneralInfoTab() {
    final isDark = Get.isDarkMode;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hotel Images
          Text(
            'Otel Fotoğrafları',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          SizedBox(height: 8.h),
          
          Obx(() => SizedBox(
            height: 100.h, // Kare boyutu için yüksekliği düzelttik
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: selectedImages.length + 1, // +1 for add button
              itemBuilder: (context, index) {
                // Last item is always the add button
                if (index == selectedImages.length) {
                  return Container(
                    width: 100.w, // 1:1 oran için aynı boyut
                    height: 100.h, // 1:1 oran için aynı boyut
                    margin: EdgeInsets.only(right: 8.w),
                    child: GestureDetector(
                      onTap: _addImages,
                      child: Container(
                        width: 100.w,
                        height: 100.h,
                        decoration: BoxDecoration(
                          color: isDark ? Colors.grey[900] : Colors.white,
                          border: Border.all(
                            color: isDark ? Colors.grey[700]! : Colors.grey[300]!,
                            style: BorderStyle.solid,
                            width: 2,
                          ),
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.add_a_photo,
                              size: 28.sp,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                            SizedBox(height: 4.h),
                            Text(
                              'Resim\nEkle',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 9.sp,
                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                                height: 1.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }
                
                // Image items
                return Container(
                  width: 100.w, // 1:1 oran için kare boyut
                  height: 100.h, // 1:1 oran için kare boyut
                  margin: EdgeInsets.only(right: 8.w),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8.r),
                        child: SizedBox(
                          width: 100.w,
                          height: 100.h,
                          child: _buildImage(selectedImages[index]),
                        ),
                      ),
                      Positioned(
                        top: 4.h,
                        right: 4.w,
                        child: GestureDetector(
                          onTap: () => selectedImages.removeAt(index),
                          child: Container(
                            padding: EdgeInsets.all(2.w),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.close,
                              size: 16.sp,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          )),
          
          SizedBox(height: 16.h),
          
          // Hotel Name
          TextFormField(
            controller: nameController,
            decoration: InputDecoration(
              labelText: 'Otel Adı *',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: _primaryColor, width: 2),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Lütfen otel adını giriniz';
              }
              return null;
            },
          ),
          
          SizedBox(height: 16.h),
          
          // Description
          TextFormField(
            controller: descriptionController,
            decoration: InputDecoration(
              labelText: 'Açıklama',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: _primaryColor, width: 2),
              ),
            ),
            maxLines: 3,
          ),
          
          SizedBox(height: 16.h),
          
          // Location
          Text(
            'Konum *',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          SizedBox(height: 8.h),
          
          Obx(() => Container(
            width: double.infinity,
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[900] : Colors.white,
              border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[400]!),
              borderRadius: BorderRadius.circular(8.r),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        controller.addressController.currentAddress.address.isEmpty
                            ? 'Konum seçilmedi'
                            : controller.addressController.getShortAddress(),
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: controller.addressController.currentAddress.address.isEmpty
                              ? (isDark ? Colors.grey[500] : Colors.grey[600])
                              : (isDark ? Colors.white : Colors.black87),
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: _selectLocation,
                      child: const Text('Konum Seç'),
                    ),
                  ],
                ),
                if (controller.addressController.currentAddress.address.isNotEmpty)
                  Text(
                    controller.addressController.currentAddress.address,
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          )),
          
          SizedBox(height: 16.h),
          
          // Contact Info
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: phoneController,
                  decoration: InputDecoration(
                    labelText: 'Telefon *',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: _primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Lütfen telefon numarasını giriniz';
                    }
                    return null;
                  },
                ),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: TextFormField(
                  controller: emailController,
                  decoration: InputDecoration(
                    labelText: 'E-posta *',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: _primaryColor, width: 2),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Lütfen e-posta adresini giriniz';
                    }
                    if (!GetUtils.isEmail(value)) {
                      return 'Lütfen geçerli bir e-posta adresi giriniz';
                    }
                    return null;
                  },
                ),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          TextFormField(
            controller: whatsappController,
            decoration: InputDecoration(
              labelText: 'Whatsapp',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: _primaryColor, width: 2),
              ),
            ),
            keyboardType: TextInputType.phone,
          ),
          
          SizedBox(height: 16.h),
          
          // Website
          TextFormField(
            controller: websiteController,
            decoration: InputDecoration(
              labelText: 'Website',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8.r),
                borderSide: BorderSide(color: _primaryColor, width: 2),
              ),
            ),
          ),
          
          SizedBox(height: 16.h),
          // Popular toggle
          Obx(()=> SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Popüler (önerilen olarak göster)'),
            value: isPopular.value,
            onChanged: (v)=> isPopular.value = v,
          )),
          SizedBox(height: 16.h),
          
          // Category
          Text(
            'Kategori *',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          SizedBox(height: 8.h),
          
          Obx(() => Wrap(
            spacing: 8.w,
            runSpacing: 8.h,
            children: categories.map((category) {
              final isSelected = selectedCategory.value == category;
              return FilterChip(
                label: Text(category, style: TextStyle(color: isSelected ? _primaryColor : (isDark ? Colors.white : Colors.black87))),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    selectedCategory.value = category;
                  }
                },
                backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                selectedColor: _primaryColor.withOpacity(isDark ? 0.3 : 0.2),
                checkmarkColor: _primaryColor,
              );
            }).toList(),
          )),
          
          SizedBox(height: 16.h),
          
          // Amenities
          Text(
            'Otel Olanakları',
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          SizedBox(height: 8.h),
          
          Obx(() => Wrap(
            spacing: 8.w,
            runSpacing: 8.h,
            children: hotelAmenities.map((amenity) {
              final isSelected = selectedAmenities.contains(amenity);
              return FilterChip(
                label: Text(amenity, style: TextStyle(color: isSelected ? _primaryColor : (isDark ? Colors.white : Colors.black87))),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    selectedAmenities.add(amenity);
                  } else {
                    selectedAmenities.remove(amenity);
                  }
                },
                backgroundColor: isDark ? Colors.grey[800] : Colors.grey[200],
                selectedColor: _primaryColor.withOpacity(isDark ? 0.3 : 0.2),
                checkmarkColor: _primaryColor,
              );
            }).toList(),
          )),
        ],
      ),
    );
  }

  Widget _buildRoomTypesTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Add Room Type Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _showAddRoomTypeDialog,
            style: ElevatedButton.styleFrom(
              backgroundColor: _primaryColor,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            icon: Icon(Icons.add, size: 18.sp),
            label: const Text('Yeni Oda Tipi Ekle'),
          ),
        ),
        
        SizedBox(height: 16.h),
        
        // Room Types List
        Expanded(
          child: Obx(() {
            if (roomTypes.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.bed_outlined,
                      size: 48.sp,
                      color: Colors.grey[400],
                    ),
                    SizedBox(height: 16.h),
                    Text(
                      'Henüz oda tipi eklenmemiş',
                      style: TextStyle(
                        fontSize: 16.sp,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              );
            }
            
            return ListView.builder(
              itemCount: roomTypes.length,
              itemBuilder: (context, index) {
                final roomType = roomTypes[index];
                return _buildRoomTypeCard(roomType, index);
              },
            );
          }),
        ),
      ],
    );
  }

  Widget _buildRoomTypeCard(RoomType roomType, int index) {
    final isDark = Get.isDarkMode;
    return Container(
      margin: EdgeInsets.only(bottom: 12.h),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    roomType.name,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                PopupMenuButton(
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, size: 16.sp),
                          SizedBox(width: 8.w),
                          const Text('Düzenle'),
                        ],
                      ),
                    ),
                    PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, size: 16.sp, color: Colors.red),
                          SizedBox(width: 8.w),
                          const Text('Sil', style: TextStyle(color: Colors.red)),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    switch (value) {
                      case 'edit':
                        _showEditRoomTypeDialog(roomType, index);
                        break;
                      case 'delete':
                        roomTypes.removeAt(index);
                        break;
                    }
                  },
                ),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            Text(
              roomType.description,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
            ),
            
            SizedBox(height: 8.h),
            
            Row(
              children: [
                Icon(Icons.people, size: 14.sp, color: Colors.grey[600]),
                SizedBox(width: 4.w),
                Text(
                  '${roomType.capacity} kişi',
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: Colors.grey[600],
                  ),
                ),
                SizedBox(width: 16.w),
                Icon(Icons.restaurant, size: 14.sp, color: Colors.grey[600]),
                SizedBox(width: 4.w),
                Text(
                  boardTypeNames[roomType.boardType] ?? roomType.boardType,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            Row(
              children: [
                if (roomType.discountedPrice != null) ...[
                  Text(
                    '${roomType.originalPrice.toStringAsFixed(0)} TL',
                    style: TextStyle(
                      fontSize: 12.sp,
                      color: Colors.grey[600],
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    '${roomType.discountedPrice!.toStringAsFixed(0)} TL',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: _primaryColor,
                    ),
                  ),
                  if (roomType.discountPercentage != null) ...[
                    SizedBox(width: 8.w),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Text(
                        '%${roomType.discountPercentage} İndirim',
                        style: TextStyle(
                          fontSize: 10.sp,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ] else ...[
                  Text(
                    '${roomType.originalPrice.toStringAsFixed(0)} TL',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: _primaryColor,
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _addImages() async {
    final images = await controller.pickImages();
    if (images != null) {
      selectedImages.addAll(images);
    }
  }

  // URL veya local path'e göre image widget oluşturan helper
  Widget _buildImage(String value) {
    final bool isUrl = value.startsWith('http://') || value.startsWith('https://');
    if (isUrl) {
      return Image.network(
        value,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _imageFallback(),
      );
    } else {
      return Image.file(
        File(value),
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => _imageFallback(),
      );
    }
  }

  Widget _imageFallback() {
    return Container(
      color: Colors.grey[300],
      child: Icon(
        Icons.image_not_supported,
        size: 32.sp,
        color: Colors.grey[600],
      ),
    );
  }

  void _selectLocation() {
    // Address selection sayfasını açacak
    Get.toNamed(Routes.SELECT_LOCATION)?.then((result) {
      if (result != null && result is AddressModel) {
        controller.addressController.setAddress(result);
      }
    });
  }

  void _showAddRoomTypeDialog() {
    _clearRoomTypeForm();
    _showRoomTypeDialog();
  }

  void _showEditRoomTypeDialog(RoomType roomType, int index) {
    _loadRoomTypeForm(roomType);
    _showRoomTypeDialog(editIndex: index);
  }

  void _showRoomTypeDialog({int? editIndex}) {
    final isDark = Get.isDarkMode;
    Get.dialog(
      Dialog(
        insetPadding: EdgeInsets.all(8.w),
        backgroundColor: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Container(
          width: Get.width,
          height: Get.height * 0.7,
          padding: EdgeInsets.all(16.w),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Text(
                      editIndex == null ? 'Yeni Oda Tipi Ekle' : 'Oda Tipini Düzenle',
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.of(Get.overlayContext!).pop(),
                      icon: Icon(Icons.close, size: 24.sp),
                    ),
                  ],
                ),
                
                SizedBox(height: 16.h),
                
                // Room Name
                TextFormField(
                  controller: roomNameController,
                  decoration: InputDecoration(
                    labelText: 'Oda Adı *',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: _primaryColor, width: 2),
                    ),
                  ),
                ),
                
                SizedBox(height: 16.h),
                
                // Room Description
                TextFormField(
                  controller: roomDescController,
                  decoration: InputDecoration(
                    labelText: 'Açıklama',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: _primaryColor, width: 2),
                    ),
                  ),
                  maxLines: 2,
                ),
                
                SizedBox(height: 16.h),
                
                // Capacity & Price
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: roomCapacityController,
                        decoration: InputDecoration(
                          labelText: 'Kapasite *',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.r),
                            borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.r),
                            borderSide: BorderSide(color: Colors.grey[400]!, width: 1),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.r),
                            borderSide: BorderSide(color: _primaryColor, width: 2),
                          ),
                        ),
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    SizedBox(width: 16.w),
                    Expanded(
                      child: CurrencyPriceField(
                        controller: roomPriceController,
                        label: 'Fiyat',
                        hint: 'Gecelik fiyat',
                      ),
                    ),
                  ],
                ),
                
                SizedBox(height: 16.h),
                
                // Discount Price
                CurrencyPriceField(
                  controller: roomDiscountController,
                  label: 'İndirimli Fiyat',
                  hint: 'Varsa indirimli fiyat',
                  isRequired: false,
                ),
                
                SizedBox(height: 16.h),
                
                // Board Type
                Text(
                  'Pansiyon Tipi *',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 8.h),
                
                Obx(() => Wrap(
                  spacing: 8.w,
                  runSpacing: 8.h,
                  children: boardTypes.map((boardType) {
                    final isSelected = selectedBoardType.value == boardType;
                    return FilterChip(
                      label: Text(boardTypeNames[boardType] ?? boardType),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          selectedBoardType.value = boardType;
                        }
                      },
                      backgroundColor: Colors.grey[200],
                      selectedColor: _primaryColor.withOpacity(0.2),
                      checkmarkColor: _primaryColor,
                    );
                  }).toList(),
                )),
                
                SizedBox(height: 16.h),
                
                // Room Amenities
                Text(
                  'Oda Olanakları',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 8.h),
                
                Obx(() => Wrap(
                  spacing: 8.w,
                  runSpacing: 8.h,
                  children: roomAmenities.map((amenity) {
                    final isSelected = selectedRoomAmenities.contains(amenity);
                    return FilterChip(
                      label: Text(amenity),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) {
                          selectedRoomAmenities.add(amenity);
                        } else {
                          selectedRoomAmenities.remove(amenity);
                        }
                      },
                      backgroundColor: Colors.grey[200],
                      selectedColor: _primaryColor.withOpacity(0.2),
                      checkmarkColor: _primaryColor,
                    );
                  }).toList(),
                )),
                
                SizedBox(height: 24.h),
                
                // Save Button
                SizedBox(
                  width: double.infinity,
                  height: 48.h,
                  child: ElevatedButton(
                    onPressed: () => _saveRoomType(editIndex),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.r),
                      ),
                    ),
                    child: Text(
                      editIndex == null ? 'Oda Tipi Ekle' : 'Güncelle',
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _clearRoomTypeForm() {
    roomNameController.clear();
    roomDescController.clear();
    roomCapacityController.clear();
    roomPriceController.clear();
    roomDiscountController.clear();
    selectedBoardType.value = 'BB';
    selectedRoomAmenities.clear();
    selectedRoomImages.clear();
  }

  void _loadRoomTypeForm(RoomType roomType) {
    roomNameController.text = roomType.name;
    roomDescController.text = roomType.description;
    roomCapacityController.text = roomType.capacity.toString();
    roomPriceController.text = roomType.originalPrice.toString();
    roomDiscountController.text = roomType.discountedPrice?.toString() ?? '';
    selectedBoardType.value = roomType.boardType;
    selectedRoomAmenities.value = List<String>.from(roomType.amenities);
    selectedRoomImages.value = List<String>.from(roomType.images);
  }

  void _saveRoomType(int? editIndex) {
    if (roomNameController.text.isEmpty || 
        roomCapacityController.text.isEmpty || 
        roomPriceController.text.isEmpty) {
      Get.snackbar(
        'Eksik Bilgi',
        'Lütfen oda adı, kapasite ve fiyat bilgilerini eksiksiz doldurunuz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final originalPrice = double.tryParse(roomPriceController.text) ?? 0.0;
    final discountedPrice = roomDiscountController.text.isEmpty 
        ? null 
        : double.tryParse(roomDiscountController.text);
    
    int? discountPercentage;
    if (discountedPrice != null && originalPrice > 0) {
      discountPercentage = ((originalPrice - discountedPrice) / originalPrice * 100).round();
    }

    final roomType = RoomType(
      id: editIndex == null ? DateTime.now().millisecondsSinceEpoch.toString() : roomTypes[editIndex].id,
      name: roomNameController.text,
      description: roomDescController.text,
      capacity: int.tryParse(roomCapacityController.text) ?? 2,
      originalPrice: originalPrice,
      discountedPrice: discountedPrice,
      discountPercentage: discountPercentage,
      boardType: selectedBoardType.value,
      amenities: List<String>.from(selectedRoomAmenities),
      images: List<String>.from(selectedRoomImages),
    );

    if (editIndex == null) {
      roomTypes.add(roomType);
    } else {
      roomTypes[editIndex] = roomType;
    }

    Navigator.of(Get.overlayContext!).pop();
  }

  Future<void> _saveHotel() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!controller.addressController.isAddressValid()) {
      Get.snackbar(
        'Konum Seçimi',
        'Lütfen haritadan otel konumunu seçiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    if (roomTypes.isEmpty) {
      Get.snackbar(
        'Oda Tipi Eksik',
        'En az bir oda tipi eklemelisiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final address = controller.addressController.currentAddress;
    final hotel = HotelModel(
      id: controller.selectedHotel.value?.id,
      name: nameController.text.trim(),
      description: descriptionController.text.trim(),
      images: List<String>.from(selectedImages),
      addressModel: address, // tek kaynak
      phone: phoneController.text.trim(),
      email: emailController.text.trim(),
      website: websiteController.text.trim(),
  whatsapp: whatsappController.text.trim().isEmpty ? null : whatsappController.text.trim(),
      roomTypes: List<RoomType>.from(roomTypes),
      amenities: List<String>.from(selectedAmenities),
      rating: controller.selectedHotel.value?.rating ?? 0.0,
      reviewCount: controller.selectedHotel.value?.reviewCount ?? 0,
      category: selectedCategory.value,
      availability: controller.selectedHotel.value?.availability ?? {},
      isActive: true,
      isPopular: isPopular.value,
      createdAt: controller.selectedHotel.value?.createdAt ?? DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final success = await controller.saveHotel(hotel);
    if (success) {
      Navigator.of(Get.overlayContext!).pop(); // Dialog'u kapat
      
      // Başarı snackbar'ını göster
      Get.snackbar(
        'Başarılı',
        controller.selectedHotel.value == null 
            ? 'Yeni otel başarıyla eklendi'
            : 'Otel bilgileri başarıyla güncellendi',
        backgroundColor: Colors.green[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
    } else {
      // Hata snackbar'ını göster
      Get.snackbar(
        'Kayıt Hatası',
        'Otel kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyiniz',
        backgroundColor: Colors.red[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}
