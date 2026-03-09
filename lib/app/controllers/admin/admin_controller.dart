import 'dart:async';
import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../data/models/models.dart';
import '../../data/repositories/repository.dart';
import '../address/address_controller.dart';

class AdminController extends GetxController {
  final HotelRepository _hotelRepository = HotelRepository();
  final FirebaseStorage _storage = FirebaseStorage.instance;
  
  // Tab kontrolü
  final RxInt selectedTabIndex = 0.obs;
  
  // Loading states
  final RxBool isLoading = false.obs;
  final RxBool isSaving = false.obs;
  
  // Otel listesi
  final RxList<HotelModel> hotels = <HotelModel>[].obs;
  
  // Seçili otel (düzenleme için)
  final Rx<HotelModel?> selectedHotel = Rx<HotelModel?>(null);
  
  // Address controller
  late AddressController addressController;

  @override
  void onInit() {
    super.onInit();
    addressController = Get.put(AddressController(), tag: 'admin_address');
    loadHotels();
  _listenHotelAggregateChanges();
  }

  @override
  void onClose() {
  _hotelAggSub?.cancel();
    Get.delete<AddressController>(tag: 'admin_address');
    super.onClose();
  }

  // Tab değiştirme
  void changeTab(int index) {
    selectedTabIndex.value = index;
  }

  StreamSubscription? _hotelAggSub;

  void _listenHotelAggregateChanges(){
    _hotelAggSub?.cancel();
    _hotelAggSub = FirebaseFirestore.instance
      .collection('hotels')
      .where('isActive', isEqualTo: true)
      .snapshots()
      .listen((snap){
        final current = {for (final h in hotels) h.id: h};
        bool changed = false;
        for (final d in snap.docs){
          final data = d.data();
          data['id'] = d.id;
          final rating = double.tryParse(data['rating']?.toString() ?? '0') ?? 0.0;
          final reviewCount = data['reviewCount'] is int ? data['reviewCount'] as int : int.tryParse(data['reviewCount']?.toString() ?? '0') ?? 0;
          final existing = current[d.id];
          if (existing != null && (existing.rating != rating || existing.reviewCount != reviewCount)){
            current[d.id] = existing.copyWith(rating: rating, reviewCount: reviewCount);
            changed = true;
          } else if (existing == null){
            current[d.id] = HotelModel.fromJson(data);
            changed = true;
          }
        }
        if (changed){
          hotels.assignAll(current.values.toList()..sort((a,b)=> b.createdAt.compareTo(a.createdAt)));
        }
      });
  }

  // Otelleri yükle
  Future<void> loadHotels() async {
    try {
      isLoading.value = true;
      final hotelList = await _hotelRepository.getAllHotels();
      hotels.value = hotelList;
    } catch (e) {
      Get.snackbar(
        'Yükleme Hatası',
        'Oteller yüklenirken bir sorun oluştu. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  // Otel seç (düzenleme için)
  void selectHotel(HotelModel hotel) {
    selectedHotel.value = hotel;
    
    // Adres bilgilerini address controller'a aktar
    // Eğer yeni addressModel varsa onu kullan, yoksa eski alanlardan oluştur
  addressController.setAddress(hotel.addressModel);
  }

  // Otel seçimini temizle
  void clearSelectedHotel() {
    selectedHotel.value = null;
    addressController.resetAddress();
  }

  // Otel kaydet (yeni veya güncelleme)
  Future<bool> saveHotel(HotelModel hotel) async {
    try {
      isSaving.value = true;
      
      // Adres bilgilerini otel modeline aktar
      final currentAddress = addressController.currentAddress;
      final updatedHotel = hotel.copyWith(
        addressModel: currentAddress,
        updatedAt: DateTime.now(),
      );
      
      if (updatedHotel.id == null) {
        // Yeni otel ekle
        await _hotelRepository.addHotel(updatedHotel);
      } else {
        // Mevcut oteli güncelle
        await _hotelRepository.updateHotel(updatedHotel.id!, updatedHotel);
      }
      
      // Listeyi yenile
      await loadHotels();
      clearSelectedHotel();
      
      return true;
    } catch (e) {
      return false;
    } finally {
      isSaving.value = false;
    }
  }

  // Otel sil
  Future<void> deleteHotel(String hotelId) async {
    try {
      await _hotelRepository.deleteHotel(hotelId);
      Get.snackbar(
        'Başarılı',
        'Otel başarıyla silindi',
        backgroundColor: Colors.green[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      await loadHotels();
    } catch (e) {
      Get.snackbar(
        'Silme Hatası',
        'Otel silinirken bir sorun oluştu. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.red[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  // Doluluk oranını güncelle
  Future<void> updateHotelAvailability(String hotelId, String date, DailyAvailability availability) async {
    try {
      await _hotelRepository.updateHotelAvailability(hotelId, date, availability);
      Get.snackbar(
        'Başarılı',
        'Doluluk oranı güncellendi',
        backgroundColor: Colors.green[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar(
        'Güncelleme Hatası',
        'Doluluk oranı güncellenemedi. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  // Toplu doluluk oranı güncelle
  Future<void> updateBulkAvailability(String hotelId, Map<String, DailyAvailability> availabilityMap) async {
    try {
      await _hotelRepository.updateBulkAvailability(hotelId, availabilityMap);
      Get.snackbar(
        'Başarılı',
        'Doluluk oranları toplu olarak güncellendi',
        backgroundColor: Colors.green[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar(
        'Güncelleme Hatası',
        'Toplu doluluk oranı güncellenemedi. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  // Resim seç
  Future<List<String>?> pickImages() async {
    try {
      final ImagePicker picker = ImagePicker();
      final List<XFile> images = await picker.pickMultiImage();
      
      if (images.isNotEmpty) {
        // Seçilen resimleri Firebase Storage'a yükle ve URL'lerini döndür
        final List<String> downloadUrls = [];
        for (final image in images) {
          final url = await _uploadImageToStorage(image);
          if (url != null) downloadUrls.add(url);
        }
        return downloadUrls;
      }
      return null;
    } catch (e) {
      Get.snackbar(
        'Resim Seçme Hatası',
        'Resimler seçilirken bir sorun oluştu. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }
  }

  // Tek resim seç
  Future<String?> pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
      
      if (image != null) {
        // Resmi Firebase Storage'a yükle ve URL'ini döndür
        return _uploadImageToStorage(image);
      }
      return null;
    } catch (e) {
      Get.snackbar(
        'Resim Seçme Hatası',
        'Resim seçilirken bir sorun oluştu. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.orange[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }
  }

  // Firebase Storage'a resim yükleme helper'ı
  Future<String?> _uploadImageToStorage(XFile image) async {
    try {
      final String fileName = '${DateTime.now().millisecondsSinceEpoch}_${image.name}';
      final Reference ref = _storage.ref().child('hotels/uploads/$fileName');
      final UploadTask uploadTask = ref.putFile(File(image.path));
      await uploadTask.whenComplete(() {});
      final String downloadUrl = await ref.getDownloadURL();
      return downloadUrl;
    } catch (e) {
      Get.snackbar(
        'Yükleme Hatası',
        'Resim yüklenemedi. Lütfen tekrar deneyiniz',
        backgroundColor: Colors.red[600],
        colorText: Colors.white,
        duration: const Duration(seconds: 3),
        snackPosition: SnackPosition.BOTTOM,
      );
      return null;
    }
  }
}
