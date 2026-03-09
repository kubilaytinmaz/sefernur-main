import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/car/car_model.dart';

class CarRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String _collection = 'cars';

  DateTime _safeDate(dynamic value) {
    if (value is Timestamp) return value.toDate();
    if (value is String) return DateTime.tryParse(value) ?? DateTime(1970);
    return DateTime(1970);
  }

  Future<List<CarModel>> getAllCars() async {
    final snapshot = await _firestore.collection(_collection).get();
    final list = snapshot.docs.map((d) {
      final data = d.data();
      final normalized = {
        ...data,
        'id': d.id,
        if (data['createdAt'] != null)
          'createdAt': _safeDate(data['createdAt']).toIso8601String(),
        if (data['updatedAt'] != null)
          'updatedAt': _safeDate(data['updatedAt']).toIso8601String(),
      };
      return CarModel.fromJson(normalized);
    }).toList();
    list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<void> addCar(CarModel car) async {
    await _firestore.collection(_collection).add(car.toJson());
  }

  Future<void> updateCar(CarModel car) async {
    if (car.id == null) return;
    await _firestore.collection(_collection).doc(car.id).update(car.toJson());
  }

  Future<void> deleteCar(String carId) async {
    await _firestore.collection(_collection).doc(carId).delete();
  }

  Future<void> updateCarAvailability(String carId, String date, CarDailyAvailability availability) async {
    await _firestore.collection(_collection).doc(carId).update({
      'availability.$date': availability.toJson(),
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> updateCarAvailabilityBulk(String carId, Map<String, CarDailyAvailability> availabilityMap) async {
    final Map<String, dynamic> updateData = {
      'updatedAt': DateTime.now().toIso8601String(),
    };
    availabilityMap.forEach((date, a) {
      updateData['availability.$date'] = a.toJson();
    });
    await _firestore.collection(_collection).doc(carId).update(updateData);
  }

  Future<List<CarModel>> getAvailableCars({
    required String pickupDate,
    required String dropoffDate,
    required int passengers,
    String? pickupTimeSlot,
  }) async {
    final cars = await getAllCars();
    return cars.where((c) => _isCarAvailable(c, pickupDate, dropoffDate, passengers, pickupTimeSlot: pickupTimeSlot)).toList();
  }

  bool _isCarAvailable(CarModel car, String pickupDate, String dropoffDate, int passengers, {String? pickupTimeSlot}) {
    if (!car.isActive) return false;
    if (car.seats < passengers) return false;
    if (car.availability.isEmpty) return true;
    final start = DateTime.parse(pickupDate);
    final end = DateTime.parse(dropoffDate);
    for (DateTime d = start; d.isBefore(end); d = d.add(const Duration(days: 1))) {
      final key = d.toIso8601String().split('T').first;
      final a = car.availability[key];
      if (a == null) continue;
      if (!a.isAvailable || a.availableCount <= 0) return false;
      if (d == start && pickupTimeSlot != null) {
        final slotOk = a.timeSlots[pickupTimeSlot];
        if (slotOk != true) return false;
      }
    }
    return true;
  }
}
