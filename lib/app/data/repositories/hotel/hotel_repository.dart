import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/hotel/hotel_model.dart';

class HotelRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'hotels';

  // Tüm otelleri getir
  Future<List<HotelModel>> getAllHotels() async {
    try {
      final snapshot = await _firestore
          .collection(_collection)
          .where('isActive', isEqualTo: true)
          .get();

      final hotels = snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return HotelModel.fromJson(data);
      }).toList();

      // Client tarafında sıralama
      hotels.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      return hotels;
    } catch (e) {
      throw Exception('Oteller getirilirken hata oluştu: $e');
    }
  }

  // Otel incelemesi ekle (hotels/{hotelId}/reviews alt koleksiyonu)
  Future<void> addReview(String hotelId, {
    required String userId,
    required double rating,
    required String comment,
  }) async {
    try {
      final reviewData = {
        'userId': userId,
        'rating': rating,
        'comment': comment,
        'status': 'pending', // editor onayı sonrası published olacak
        'createdAt': DateTime.now().toIso8601String(),
        'updatedAt': DateTime.now().toIso8601String(),
      };
      await _firestore.collection(_collection)
          .doc(hotelId)
          .collection('reviews')
          .add(reviewData);
    } catch (e) {
      throw Exception('Yorum kaydedilirken hata oluştu: $e');
    }
  }

  // Otel detayını getir
  Future<HotelModel?> getHotelById(String hotelId) async {
    try {
      final doc = await _firestore.collection(_collection).doc(hotelId).get();
      
      if (doc.exists) {
        final data = doc.data()!;
        data['id'] = doc.id;
        return HotelModel.fromJson(data);
      }
      return null;
    } catch (e) {
      throw Exception('Otel detayı getirilirken hata oluştu: $e');
    }
  }

  // Yeni otel ekle
  Future<String> addHotel(HotelModel hotel) async {
    try {
      final hotelData = hotel.toJson();
      hotelData.remove('id'); // ID Firestore tarafından otomatik oluşturulacak
      
      final docRef = await _firestore.collection(_collection).add(hotelData);
      return docRef.id;
    } catch (e) {
      throw Exception('Otel eklenirken hata oluştu: $e');
    }
  }

  // Otel güncelle
  Future<void> updateHotel(String hotelId, HotelModel hotel) async {
    try {
      final hotelData = hotel.toJson();
      hotelData.remove('id');
      hotelData['updatedAt'] = DateTime.now().toIso8601String();
      
      await _firestore.collection(_collection).doc(hotelId).update(hotelData);
    } catch (e) {
      throw Exception('Otel güncellenirken hata oluştu: $e');
    }
  }

  // Otel sil (soft delete)
  Future<void> deleteHotel(String hotelId) async {
    try {
      await _firestore.collection(_collection).doc(hotelId).update({
        'isActive': false,
        'updatedAt': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Otel silinirken hata oluştu: $e');
    }
  }

  // Şehre göre otelleri getir
  Future<List<HotelModel>> getHotelsByCity(String city) async {
    try {
      final snapshot = await _firestore
          .collection(_collection)
          .where('city', isEqualTo: city)
          .where('isActive', isEqualTo: true)
          .orderBy('rating', descending: true)
          .get();

      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return HotelModel.fromJson(data);
      }).toList();
    } catch (e) {
      throw Exception('Şehir otelları getirilirken hata oluştu: $e');
    }
  }

  // Kategoriye göre otelleri getir
  Future<List<HotelModel>> getHotelsByCategory(String category) async {
    try {
      final snapshot = await _firestore
          .collection(_collection)
          .where('category', isEqualTo: category)
          .where('isActive', isEqualTo: true)
          .orderBy('rating', descending: true)
          .get();

      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return HotelModel.fromJson(data);
      }).toList();
    } catch (e) {
      throw Exception('Kategori otelları getirilirken hata oluştu: $e');
    }
  }

  // Müsaitlik durumuna göre otelleri filtrele
  Future<List<HotelModel>> getAvailableHotels(String checkInDate, String checkOutDate, {int requiredPeople = 1}) async {
    try {
      // Bu durumda tüm otelleri alıp client-side filtreleme yapmamız gerekiyor
      // çünkü Firestore karmaşık nested sorguları desteklemiyor
      final allHotels = await getAllHotels();
      
      return allHotels.where((hotel) {
        return _isHotelAvailable(hotel, checkInDate, checkOutDate, requiredPeople: requiredPeople);
      }).toList();
    } catch (e) {
      throw Exception('Müsait oteller getirilirken hata oluştu: $e');
    }
  }

  // Otel müsaitlik kontrolü
  bool _isHotelAvailable(HotelModel hotel, String checkInDate, String checkOutDate, {int requiredPeople = 1}) {
    final checkIn = DateTime.parse(checkInDate);
    final checkOut = DateTime.parse(checkOutDate);
    
    // Tarih aralığındaki her gün için kontrol
    for (DateTime date = checkIn; date.isBefore(checkOut); date = date.add(const Duration(days: 1))) {
      final dateString = date.toIso8601String().split('T')[0];
      final availability = hotel.availability[dateString];
      
  if (availability == null || !availability.isAvailable || availability.availableRooms < requiredPeople) {
        return false;
      }
    }
    
    return true;
  }

  // Otel doluluk oranını güncelle
  Future<void> updateHotelAvailability(String hotelId, String date, DailyAvailability availability) async {
    try {
      await _firestore.collection(_collection).doc(hotelId).update({
        'availability.$date': availability.toJson(),
        'updatedAt': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Otel doluluk oranı güncellenirken hata oluştu: $e');
    }
  }

  // Toplu doluluk oranı güncelleme
  Future<void> updateBulkAvailability(String hotelId, Map<String, DailyAvailability> availabilityMap) async {
    try {
      final Map<String, dynamic> updateData = {};
      
      availabilityMap.forEach((date, availability) {
        updateData['availability.$date'] = availability.toJson();
      });
      
      updateData['updatedAt'] = DateTime.now().toIso8601String();
      
      await _firestore.collection(_collection).doc(hotelId).update(updateData);
    } catch (e) {
      throw Exception('Toplu doluluk oranı güncellenirken hata oluştu: $e');
    }
  }

  // Otel arama
  Future<List<HotelModel>> searchHotels(String query) async {
    try {
      // Firestore'da full-text search sınırlı olduğu için basit bir yaklaşım kullanıyoruz
      final snapshot = await _firestore
          .collection(_collection)
          .where('isActive', isEqualTo: true)
          .get();

      final allHotels = snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return HotelModel.fromJson(data);
      }).toList();

      // Client-side filtreleme
      return allHotels.where((hotel) {
        final searchQuery = query.toLowerCase();
        return hotel.name.toLowerCase().contains(searchQuery) ||
               hotel.city.toLowerCase().contains(searchQuery) ||
               hotel.state.toLowerCase().contains(searchQuery) ||
               hotel.address.toLowerCase().contains(searchQuery);
      }).toList();
    } catch (e) {
      throw Exception('Otel araması yapılırken hata oluştu: $e');
    }
  }
}
