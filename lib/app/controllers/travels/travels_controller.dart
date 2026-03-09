import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../data/models/hotel/hotel_model.dart';
import '../../data/models/reservation/reservation_model.dart';
import '../../data/repositories/hotel/hotel_repository.dart';
import '../../data/services/reservation/reservation_service.dart';

/// TravelsController artık dinamik olarak sadece OTEL rezervasyonlarını çeker
/// ReservationService üzerinden akan verileri HotelRepository ile zenginleştirip
/// UI'ın kullandığı Travel adapter modeline dönüştürür.
class TravelsController extends GetxController {
  // State
  final isLoading = false.obs;
  final upcomingTravels = <Travel>[].obs;
  final pastTravels = <Travel>[].obs;
  final selectedTravel = Rx<Travel?>(null);

  late ReservationService _reservationService;
  final _hotelRepo = HotelRepository();
  final Map<String, HotelModel> _hotelCache = {};
  Worker? _resWorker;

  @override
  void onInit() {
    super.onInit();
    _init();
  }

  Future<void> _init() async {
    await _ensureReservationService();
    _bindReservations();
  }

  Future<void> _ensureReservationService() async {
    if (Get.isRegistered<ReservationService>()) {
      _reservationService = Get.find<ReservationService>();
    } else {
      isLoading.value = true;
      try {
        _reservationService = await Get.putAsync(() => ReservationService().init());
      } finally {
        isLoading.value = false;
      }
    }
  }

  void _bindReservations() {
    _resWorker?.dispose();
    // Her değişimde rebuild
    _resWorker = ever<List<ReservationModel>>(
      _reservationService.reservations,
      (_) => _rebuildTravels(),
    );
    _rebuildTravels();
  }

  Future<void> refreshTravels() async => _rebuildTravels(forceHotelReload: true);

  Future<void> _rebuildTravels({bool forceHotelReload = false}) async {
    final hotelReservations = _reservationService.reservations
        .where((r) => r.type == ReservationType.hotel)
        .toList();
    if (hotelReservations.isEmpty) {
      upcomingTravels.clear();
      pastTravels.clear();
      return;
    }
    isLoading.value = true;
    try {
      // Eksik (veya zorunlu yeniden) hotel verilerini getir
      final neededIds = hotelReservations
          .map((r) => r.itemId)
          .where((id) => forceHotelReload || !_hotelCache.containsKey(id))
          .toSet();
      for (final id in neededIds) {
        final hotel = await _hotelRepo.getHotelById(id);
        if (hotel != null) _hotelCache[id] = hotel;
      }

      final travels = hotelReservations.map((r) {
        final hotel = _hotelCache[r.itemId];
        return Travel.fromReservation(r, hotel);
      }).toList();

      // Sıralama: tarih artan
      travels.sort((a, b) => a.startDate.compareTo(b.startDate));
      final now = DateTime.now();
      final upcoming = <Travel>[];
      final past = <Travel>[];
      for (final t in travels) {
        if (t.endDate.isBefore(now) || t.status == TravelStatus.completed) {
          past.add(t);
        } else {
          upcoming.add(t);
        }
      }
      upcomingTravels.assignAll(upcoming);
      pastTravels.assignAll(past);
    } catch (e) {
      Get.snackbar('Hata', 'Seyahatler yüklenemedi: $e', snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  // UI Actions -------------------------------------------------------------
  void viewTravelDetails(Travel travel) {
    selectedTravel.value = travel;
    _showHotelDetailBottomSheet(travel);
  }

  Future<void> cancelTravel(String travelId) async {
    final travel = (upcomingTravels + pastTravels).firstWhereOrNull((t) => t.id == travelId);
    if (travel == null || !travel.canCancel || travel.reservationId == null) return;
    
    final r = _reservationService.byId(travel.reservationId!);
    if (r == null) return;
    
    // WebBeds rezervasyonu mu kontrol et - evet ise WebBedsCancelDialog göster
    final isWebBeds = r.meta['source'] == 'webbeds' && r.meta['webbedsBookingCode'] != null;
    
    if (isWebBeds) {
      // Import'u kontrol et - dinamik olarak WebBedsCancelDialog'u çağır
      _showCancelSupportDialog(r);
    } else {
      // Diğer rezervasyonlar için de müşteri hizmetlerine yönlendir
      _showCancelSupportDialog(r);
    }
  }
  
  /// Müşteri hizmetlerine yönlendirme dialog'u göster
  void _showCancelSupportDialog(ReservationModel r) {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.support_agent, color: Colors.teal[700]),
            const SizedBox(width: 8),
            const Expanded(child: Text('Rezervasyon İptali')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.amber[800], size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Rezervasyon iptalleri müşteri hizmetlerimiz tarafından gerçekleştirilmektedir.',
                      style: TextStyle(fontSize: 13, color: Colors.amber[900]),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Lütfen bizimle iletişime geçin',
              style: TextStyle(fontSize: 14, color: Colors.grey[700]),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Kapat'),
          ),
          ElevatedButton.icon(
            onPressed: () {
              Get.back();
              createSupportRequest(r.id ?? '');
            },
            icon: const Icon(Icons.support_agent, size: 18),
            label: const Text('Destek Al'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.teal,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  void submitReview(String travelId, int rating, String comment) {
    // TODO: Otel değerlendirme entegrasyonu (HotelRepository.addReview) - ileride
    Get.snackbar('Teşekkürler', 'Değerlendirmeniz kaydedildi (mock).', snackPosition: SnackPosition.BOTTOM);
    // Lokal state güncelle (demo)
    final listAll = [...upcomingTravels, ...pastTravels];
    final idx = listAll.indexWhere((t) => t.id == travelId);
    if (idx != -1) {
      final t = listAll[idx];
      final updated = t.copyWith(rating: rating, review: comment, reviewDate: DateTime.now());
      if (pastTravels.any((p) => p.id == travelId)) {
        final pIdx = pastTravels.indexWhere((p) => p.id == travelId);
        pastTravels[pIdx] = updated;
        pastTravels.refresh();
      }
    }
  }

  void createSupportRequest(String travelId) {
    Get.snackbar('Destek', 'Destek talebi (mock) oluşturuldu', snackPosition: SnackPosition.BOTTOM);
  }

  void downloadDocument(TravelDocument document) {
    Get.snackbar('İndiriliyor', '${document.title} indiriliyor...', snackPosition: SnackPosition.BOTTOM);
  }

  void viewDocument(TravelDocument document) {
    Get.snackbar('Belge', '${document.title} açılıyor...', snackPosition: SnackPosition.BOTTOM);
  }

  // Mappers & helpers ------------------------------------------------------
  String getStatusText(TravelStatus status) {
    switch (status) {
      case TravelStatus.confirmed:
        return 'Onaylandı';
      case TravelStatus.pending:
        return 'Beklemede';
      case TravelStatus.cancelled:
        return 'İptal Edildi';
      case TravelStatus.completed:
        return 'Tamamlandı';
    }
  }

  Color getStatusColor(TravelStatus status) {
    switch (status) {
      case TravelStatus.confirmed:
        return Colors.green;
      case TravelStatus.pending:
        return Colors.orange;
      case TravelStatus.cancelled:
        return Colors.red;
      case TravelStatus.completed:
        return Colors.blue;
    }
  }

  IconData getServiceTypeIcon(ServiceType type) {
    switch (type) {
      case ServiceType.hotel:
        return Icons.hotel;
      case ServiceType.tour:
        return Icons.tour;
      case ServiceType.transfer:
        return Icons.transfer_within_a_station;
      case ServiceType.carRental:
        return Icons.car_rental;
      case ServiceType.guide:
        return Icons.person_pin;
      case ServiceType.visa:
        return Icons.assignment;
    }
  }

  String getDocumentTypeText(DocumentType type) {
    switch (type) {
      case DocumentType.confirmation:
        return 'Onay Belgesi';
      case DocumentType.invoice:
        return 'Fatura';
      case DocumentType.ticket:
        return 'Bilet';
      case DocumentType.visa:
        return 'Vize';
      case DocumentType.certificate:
        return 'Sertifika';
    }
  }

  void _showHotelDetailBottomSheet(Travel travel) {
    final hotel = _hotelCache[travel.hotelId ?? ''];
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SafeArea(
          bottom: false,
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 48,
                  height: 5,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.hotel, color: Colors.indigo),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      travel.title,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: getStatusColor(travel.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      getStatusText(travel.status),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: getStatusColor(travel.status),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(travel.location, style: TextStyle(color: Colors.grey[700], fontSize: 13)),
              const SizedBox(height: 12),
              if (travel.imageUrl.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    travel.imageUrl,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 160,
                      color: Colors.grey.shade200,
                      alignment: Alignment.center,
                      child: const Icon(Icons.broken_image, size: 40, color: Colors.grey),
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              _detailRow(Icons.calendar_today, 'Tarih', _dateRange(travel.startDate, travel.endDate)),
              _detailRow(Icons.payments, 'Ücret', '${travel.totalAmount.toStringAsFixed(2)} USD'),
              if (hotel != null) ...[
                _detailRow(Icons.location_on_outlined, 'Adres', _hotelAddress(hotel)),
                if (hotel.amenities.isNotEmpty)
                  _detailRow(Icons.check_circle_outline, 'Öne Çıkan', hotel.amenities.take(5).join(', ')),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: travel.canCancel ? () => cancelTravel(travel.id) : null,
                      icon: const Icon(Icons.cancel_outlined),
                      label: Text(travel.canCancel ? 'İptal Et' : 'İptal Edilemez'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: travel.canCancel ? Colors.red.shade600 : Colors.grey.shade300,
                        foregroundColor: travel.canCancel ? Colors.white : Colors.grey.shade600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Get.back(),
                      icon: const Icon(Icons.close),
                      label: const Text('Kapat'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _detailRow(IconData icon, String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: Colors.grey[600]),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                  const SizedBox(height: 2),
                  Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ],
        ),
      );

  String _hotelAddress(HotelModel h) {
    final parts = [h.addressModel.city, h.addressModel.state, h.addressModel.country]
        .where((e) => e.isNotEmpty)
        .toList();
    if (parts.isEmpty) return h.addressModel.address;
    return parts.join(', ');
  }

  String _dateRange(DateTime a, DateTime b) {
    final f = DateFormat('dd/MM/yyyy');
    if (a.isAtSameMomentAs(b)) return f.format(a);
    return '${f.format(a)} - ${f.format(b)}';
  }

  @override
  void onClose() {
    _resWorker?.dispose();
    super.onClose();
  }
}

// ---------------------------------------------------------------------------
// Adapter Travel Model (UI ihtiyaçlarına göre)
// ---------------------------------------------------------------------------
class Travel {
  final String id; // unique (reservationId)
  final String? reservationId; // or same as id
  final String? hotelId;
  final String title;
  final String location; // city - country
  final DateTime startDate;
  final DateTime endDate;
  final TravelStatus status;
  final double totalAmount;
  final String imageUrl;
  final List<TravelService> services;
  final List<TravelDocument> documents;
  final bool canCancel;
  final bool canModify;
  final int? rating;
  final String? review;
  final DateTime? reviewDate;

  Travel({
    required this.id,
    required this.reservationId,
    required this.hotelId,
    required this.title,
    required this.location,
    required this.startDate,
    required this.endDate,
    required this.status,
    required this.totalAmount,
    required this.imageUrl,
    required this.services,
    required this.documents,
    required this.canCancel,
    required this.canModify,
    this.rating,
    this.review,
    this.reviewDate,
  });

  factory Travel.fromReservation(ReservationModel r, HotelModel? h) {
    final status = _travelStatusFromReservation(r.status);
    final canCancel = (r.status == 'pending' || r.status == 'confirmed') && r.startDate.isAfter(DateTime.now());
    final image = r.imageUrl.isNotEmpty
        ? r.imageUrl
        : (h != null && h.images.isNotEmpty ? h.images.first : '');
    final loc = h != null
        ? [h.addressModel.city, h.addressModel.country].where((e) => e.isNotEmpty).join(' - ')
        : r.subtitle;
    final service = TravelService(
      id: 'hotel-${r.itemId}',
      type: ServiceType.hotel,
      title: r.title,
      description: h?.description ?? '',
      amount: r.price,
      status: _serviceStatusFromReservation(r.status),
      details: {
        'city': h?.addressModel.city,
        'country': h?.addressModel.country,
      },
    );
    return Travel(
      id: r.id ?? r.itemId,
      reservationId: r.id,
      hotelId: r.itemId,
      title: r.title,
      location: loc,
      startDate: r.startDate,
      endDate: r.endDate,
      status: status,
      totalAmount: r.price,
      imageUrl: image,
      services: [service],
      documents: const [],
      canCancel: canCancel,
      canModify: false,
      rating: null,
      review: null,
      reviewDate: null,
    );
  }

  Travel copyWith({
    TravelStatus? status,
    bool? canCancel,
    bool? canModify,
    int? rating,
    String? review,
    DateTime? reviewDate,
  }) {
    return Travel(
      id: id,
      reservationId: reservationId,
      hotelId: hotelId,
      title: title,
      location: location,
      startDate: startDate,
      endDate: endDate,
      status: status ?? this.status,
      totalAmount: totalAmount,
      imageUrl: imageUrl,
      services: services,
      documents: documents,
      canCancel: canCancel ?? this.canCancel,
      canModify: canModify ?? this.canModify,
      rating: rating ?? this.rating,
      review: review ?? this.review,
      reviewDate: reviewDate ?? this.reviewDate,
    );
  }
}

class TravelService {
  final String id;
  final ServiceType type;
  final String title;
  final String description;
  final double amount;
  final ServiceStatus status;
  final Map<String, dynamic> details;
  const TravelService({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.amount,
    required this.status,
    required this.details,
  });
}

class TravelDocument {
  final String id;
  final String title;
  final DocumentType type;
  final String url;
  final DateTime uploadDate;
  const TravelDocument({
    required this.id,
    required this.title,
    required this.type,
    required this.url,
    required this.uploadDate,
  });
}

enum TravelStatus { confirmed, pending, cancelled, completed }
enum ServiceType { hotel, tour, transfer, carRental, guide, visa }
enum ServiceStatus { confirmed, pending, cancelled, completed, processing }
enum DocumentType { confirmation, invoice, ticket, visa, certificate }

TravelStatus _travelStatusFromReservation(String s) {
  switch (s) {
    case 'confirmed':
      return TravelStatus.confirmed;
    case 'cancelled':
      return TravelStatus.cancelled;
    case 'completed':
      return TravelStatus.completed;
    case 'pending':
    default:
      return TravelStatus.pending;
  }
}

ServiceStatus _serviceStatusFromReservation(String s) {
  switch (s) {
    case 'confirmed':
      return ServiceStatus.confirmed;
    case 'cancelled':
      return ServiceStatus.cancelled;
    case 'completed':
      return ServiceStatus.completed;
    case 'pending':
    default:
      return ServiceStatus.pending;
  }
}
