import 'package:get/get.dart';
import 'package:sefernur/app/data/models/payment/kuveytturk_models.dart';
import 'package:sefernur/app/data/models/reservation/reservation_model.dart';
import 'package:sefernur/app/data/models/webbeds/webbeds_models.dart';
import 'package:sefernur/app/data/providers/webbeds/webbeds_xml_builder.dart';
import 'package:sefernur/app/data/services/auth/auth_service.dart';
import 'package:sefernur/app/data/services/payment/kuveytturk_service.dart';
import 'package:sefernur/app/data/services/reservation/reservation_service.dart';
import 'package:sefernur/app/data/services/webbeds/webbeds_service.dart';

/// WebBeds Otel Rezervasyon Controller
/// 
/// Oda seçimi, bloklama, yolcu bilgileri, ödeme ve rezervasyon onayı işlemleri.
/// 
/// Akış:
/// 1. Oda Seçimi (blocking)
/// 2. Yolcu Bilgileri
/// 3. Özet & Ödeme (KuveytTürk 3D Secure)
/// 4. Onay (WebBeds confirmbooking)
class WebBedsBookingController extends GetxController {
  late WebBedsService _webBedsService;
  late ReservationService _reservationService;
  late AuthService _authService;
  late KuveytTurkService _kuveytTurkService;

  // State
  final isLoading = false.obs;
  final error = RxnString();
  final currentStep = 0.obs; // 0: Oda Seçimi, 1: Yolcu Bilgileri, 2: Özet, 3: Onay

  // Seçilen otel & oda bilgileri
  final selectedHotel = Rxn<WebBedsHotel>();
  final roomsResponse = Rxn<WebBedsRoomsResponse>();
  final selectedRoomType = Rxn<WebBedsRoomType>();
  final selectedRate = Rxn<WebBedsRate>();
  final isBlocked = false.obs;

  // Yolcu bilgileri
  final passengers = <PassengerFormData>[].obs;
  final customerReference = ''.obs;
  final specialRequests = <String>[].obs;

  // Rezervasyon sonucu
  final bookingResult = Rxn<WebBedsBookingResponse>();
  final reservationId = RxnString(); // Firebase reservation ID
  
  // Ödeme state
  final paymentOrderId = RxnString();
  final paymentStatus = Rx<KuveytTurkPaymentStatus>(KuveytTurkPaymentStatus.pending);
  final isPaymentProcessing = false.obs;
  
  // Kart bilgileri (ödeme için)
  final cardInfo = Rxn<KuveytTurkCardInfo>();

  // Search parametreleri (WebBedsService'den)
  DateTime? get checkIn => _webBedsService.lastCheckIn;
  DateTime? get checkOut => _webBedsService.lastCheckOut;
  int get adults => _webBedsService.lastAdults;
  int get rooms => _webBedsService.lastRooms;
  List<int> get childrenAges => _webBedsService.lastChildrenAges;
  int get totalGuests => adults + childrenAges.length;
  int get nights => _webBedsService.nights;

  @override
  void onInit() {
    super.onInit();
    _initServices();
  }

  void _initServices() {
    _webBedsService = Get.find<WebBedsService>();
    _reservationService = Get.find<ReservationService>();
    _authService = Get.find<AuthService>();
    _kuveytTurkService = Get.find<KuveytTurkService>();
  }

  // ============================================================
  // STEP 0: ODA SEÇİMİ
  // ============================================================

  /// Otel detaylarını ve odaları yükle
  Future<void> loadHotelRooms(WebBedsHotel hotel) async {
    try {
      isLoading.value = true;
      error.value = null;
      selectedHotel.value = hotel;

      final response = await _webBedsService.getHotelRooms(hotel);
      if (response != null && response.success) {
        roomsResponse.value = response;
      } else {
        error.value = _webBedsService.error.value ?? 'Oda bilgisi alınamadı';
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Oda tipi ve rate seç, bloklama yap
  Future<bool> selectRoomAndRate(WebBedsRoomType roomType, WebBedsRate rate) async {
    try {
      isLoading.value = true;
      error.value = null;
      selectedRoomType.value = roomType;
      selectedRate.value = rate;

      // Bloklama yap
      final blocked = await _webBedsService.blockSelectedRoom(
        roomType: roomType,
        rate: rate,
      );

      if (blocked) {
        isBlocked.value = true;
        
        // Yolcu formlarını oluştur
        _initPassengerForms();
        
        // Sonraki adıma geç
        currentStep.value = 1;
        return true;
      } else {
        error.value = _webBedsService.error.value ?? 'Oda bloklanamadı';
        isBlocked.value = false;
        return false;
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Yolcu formlarını başlat
  void _initPassengerForms() {
    passengers.clear();
    
    // İlk yolcu leading passenger
    passengers.add(PassengerFormData(
      isLeading: true,
      roomIndex: 0,
    ));

    // Diğer yetişkinler
    for (int i = 1; i < adults; i++) {
      passengers.add(PassengerFormData(
        isLeading: false,
        roomIndex: 0, // Basit implementasyon - tüm misafirler ilk odada
      ));
    }

    // Çocuklar varsa onları da ekle (ebeveynlerle aynı odada)
    for (int i = 0; i < childrenAges.length; i++) {
      passengers.add(PassengerFormData(
        isLeading: false,
        roomIndex: 0,
        isChild: true,
        childAge: childrenAges[i],
      ));
    }
  }

  // ============================================================
  // STEP 1: YOLCU BİLGİLERİ
  // ============================================================

  /// Yolcu bilgilerini güncelle
  void updatePassenger(int index, PassengerFormData data) {
    if (index >= 0 && index < passengers.length) {
      passengers[index] = data;
      passengers.refresh();
    }
  }

  /// Tüm yolcu bilgileri dolu mu?
  bool get isPassengerInfoComplete {
    return passengers.every((p) => p.isValid);
  }

  /// Yolcu bilgilerini onayla ve sonraki adıma geç
  bool validateAndProceedToSummary() {
    if (!isPassengerInfoComplete) {
      error.value = 'Lütfen tüm yolcu bilgilerini doldurun';
      return false;
    }
    error.value = null;
    currentStep.value = 2;
    return true;
  }

  // ============================================================
  // STEP 2: ÖZET
  // ============================================================

  /// Customer reference güncelle
  void setCustomerReference(String ref) {
    customerReference.value = ref;
  }

  /// Özel istek ekle
  void addSpecialRequest(String request) {
    if (request.isNotEmpty && !specialRequests.contains(request)) {
      specialRequests.add(request);
    }
  }

  /// Özel istek sil
  void removeSpecialRequest(String request) {
    specialRequests.remove(request);
  }

  // ============================================================
  // STEP 2: ÖZET & ÖDEME
  // ============================================================

  /// Kart bilgilerini ayarla
  void setCardInfo(KuveytTurkCardInfo info) {
    cardInfo.value = info;
  }

  /// Ödeme başlat (KuveytTürk 3D Secure)
  Future<String?> initiatePayment({
    required KuveytTurkCardInfo cardInfo,
    int installmentCount = 0,
  }) async {
    if (!isBlocked.value || selectedHotel.value == null || selectedRate.value == null) {
      error.value = 'Geçersiz rezervasyon durumu';
      return null;
    }

    if (!isPassengerInfoComplete) {
      error.value = 'Yolcu bilgileri eksik';
      return null;
    }

    if (!cardInfo.isValid) {
      error.value = 'Geçersiz kart bilgileri';
      return null;
    }

    try {
      isPaymentProcessing.value = true;
      error.value = null;

      // Sipariş no oluştur
      final orderId = _kuveytTurkService.generateOrderId();
      paymentOrderId.value = orderId;

      // Kart bilgilerini sakla
      this.cardInfo.value = cardInfo;

      // Ana yolcunun iletişim bilgilerini al (3D Secure 2.X için)
      final leadPassenger = passengers.firstWhere(
        (p) => p.isLeading,
        orElse: () => passengers.first,
      );
      final identityTaxNumber = leadPassenger.identityNumber.trim();

      // KuveytTürk 3D ödeme başlat - HTML form döner
      final htmlContent = await _kuveytTurkService.initiate3DPayment(
        orderId: orderId,
        amount: totalPrice,
        currency: currency,
        cardInfo: cardInfo,
        identityTaxNumber: identityTaxNumber,
        installmentCount: installmentCount,
        email: leadPassenger.email.trim().isNotEmpty ? leadPassenger.email.trim() : null,
        phoneNumber: leadPassenger.phone.trim().isNotEmpty ? leadPassenger.phone.trim() : null,
      );

      if (htmlContent == null) {
        error.value = _kuveytTurkService.error.value ?? 'Ödeme başlatılamadı';
        return null;
      }

      paymentStatus.value = KuveytTurkPaymentStatus.processing;
      return htmlContent;

    } finally {
      isPaymentProcessing.value = false;
    }
  }

  /// Ödeme sonucunu işle
  Future<bool> handlePaymentResult(KuveytTurkPaymentResult result) async {
    paymentStatus.value = result.status;

    if (result.isSuccess) {
      // Ödeme başarılı - WebBeds rezervasyonunu onayla
      return await confirmBooking();
    } else {
      // Ödeme başarısız
      error.value = result.errorMessage ?? 'Ödeme başarısız oldu';
      return false;
    }
  }

  // ============================================================
  // STEP 3: REZERVASYON ONAY
  // ============================================================

  /// Rezervasyonu onayla
  Future<bool> confirmBooking() async {
    if (!isBlocked.value || selectedHotel.value == null || selectedRate.value == null) {
      error.value = 'Geçersiz rezervasyon durumu';
      return false;
    }

    if (!isPassengerInfoComplete) {
      error.value = 'Yolcu bilgileri eksik';
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      // Customer reference oluştur (boşsa)
      final custRef = customerReference.value.isNotEmpty
          ? customerReference.value
          : 'SEF${DateTime.now().millisecondsSinceEpoch}';

      // PassengerFormData'ları PassengerInfo'ya çevir
      final passengerInfos = passengers
          .where((p) => !p.isChild) // Sadece yetişkinler API'ye gider
          .map((p) => PassengerInfo(
                isLeading: p.isLeading,
                salutation: _salutationCodeToInt(p.salutation),
                firstName: p.firstName,
                lastName: p.lastName,
              ))
          .toList();

      // WebBeds API'ye booking gönder
      final response = await _webBedsService.confirmBooking(
        passengers: passengerInfos,
        customerReference: custRef,
        specialRequests: specialRequests.toList(),
      );

      if (response != null && response.success) {
        bookingResult.value = response;
        
        // Firebase'e rezervasyon kaydet
        await _saveToFirebase(response, custRef);
        
        currentStep.value = 3;
        return true;
      } else {
        error.value = _webBedsService.error.value ?? 'Rezervasyon onaylanamadı';
        return false;
      }
    } finally {
      isLoading.value = false;
    }
  }

  /// Firebase'e rezervasyon kaydet
  Future<void> _saveToFirebase(WebBedsBookingResponse response, String customerRef) async {
    final user = _authService.user.value;
    if (user.id == null) return;

    final hotel = selectedHotel.value!;
    final rate = selectedRate.value!;
    final roomType = selectedRoomType.value!;
    final leadPassenger = passengers.firstWhere((p) => p.isLeading);

    final reservation = ReservationModel(
      userId: user.id!,
      type: ReservationType.hotel,
      itemId: 'webbeds_${hotel.hotelId}',
      title: hotel.name,
      subtitle: '${hotel.cityName}, ${hotel.countryName}',
      imageUrl: hotel.mainImage ?? '',
      startDate: checkIn!,
      endDate: checkOut!,
      quantity: nights,
      people: totalGuests,
      price: response.totalPrice,
      currency: response.currency,
      status: _mapBookingStatus(response.bookingStatus),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      userPhone: user.phoneNumber,
      userEmail: user.email,
      meta: {
        // WebBeds spesifik bilgiler
        'source': 'webbeds',
        'webbedsBookingCode': response.bookingCode,
        'webbedsHotelId': hotel.hotelId,
        'customerReference': customerRef,
        'paymentGuaranteedBy': response.paymentGuaranteedBy,
        // Ödeme bilgileri
        'paymentOrderId': paymentOrderId.value,
        'paymentStatus': paymentStatus.value.name,
        // Oda bilgileri
        'roomTypeCode': roomType.code,
        'roomTypeName': roomType.name,
        'rateBasis': rate.name,
        'rateBasisName': rate.rateBasisName,
        'rateId': rate.id,
        'nonRefundable': rate.nonRefundable,
        // Yolcu bilgileri
        'leadPassenger': '${leadPassenger.firstName} ${leadPassenger.lastName}',
        'adults': adults,
        'children': childrenAges.length,
        'childrenAges': childrenAges,
        'rooms': rooms,
        // Otel bilgileri
        'hotelAddress': hotel.fullAddress,
        'hotelPhone': hotel.phone,
        'checkInTime': hotel.checkInTime,
        'checkOutTime': hotel.checkOutTime,
        'starRating': hotel.starRating,
        // Özel istekler
        if (specialRequests.isNotEmpty) 'specialRequests': specialRequests.toList(),
      },
    );

    try {
      final savedId = await _reservationService.create(reservation);
      reservationId.value = savedId;
    } catch (e) {
      // Firebase kaydı başarısız olsa bile WebBeds rezervasyonu tamamlandı
      // Loglama yapılabilir
      print('Firebase reservation save error: $e');
    }
  }

  /// WebBeds status'unu uygulama status'una çevir
  String _mapBookingStatus(String webBedsStatus) {
    switch (webBedsStatus.toLowerCase()) {
      case 'confirmed':
      case 'ok':
        return 'confirmed';
      case 'pending':
      case 'on request':
        return 'pending';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  /// Toplam fiyat
  double get totalPrice => selectedRate.value?.price ?? 0.0;

  /// Para birimi
  String get currency => selectedRate.value?.currency ?? 'USD';

  /// Gecelik fiyat
  double get pricePerNight => nights > 0 ? totalPrice / nights : totalPrice;

  /// Kişi başı fiyat
  double get pricePerPerson => totalGuests > 0 ? totalPrice / totalGuests : totalPrice;

  /// Adım başlığı
  String get stepTitle {
    switch (currentStep.value) {
      case 0: return 'Oda Seçimi';
      case 1: return 'Yolcu Bilgileri';
      case 2: return 'Özet';
      case 3: return 'Onay';
      default: return '';
    }
  }

  /// Önceki adıma git
  void previousStep() {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  /// Belirli bir adıma git
  void goToStep(int step) {
    if (step >= 0 && step <= 3) {
      currentStep.value = step;
    }
  }

  /// Controller'ı sıfırla
  void reset() {
    currentStep.value = 0;
    selectedHotel.value = null;
    roomsResponse.value = null;
    selectedRoomType.value = null;
    selectedRate.value = null;
    isBlocked.value = false;
    passengers.clear();
    customerReference.value = '';
    specialRequests.clear();
    bookingResult.value = null;
    reservationId.value = null;
    error.value = null;
    // Payment state
    paymentOrderId.value = null;
    paymentStatus.value = KuveytTurkPaymentStatus.pending;
    isPaymentProcessing.value = false;
    cardInfo.value = null;
    _kuveytTurkService.reset();
    _webBedsService.clearSelection();
  }

  @override
  void onClose() {
    reset();
    super.onClose();
  }

  /// String salutation kodunu int'e çevir (WebBeds API için)
  int _salutationCodeToInt(String code) {
    switch (code.toUpperCase()) {
      case 'MR': return 1;
      case 'MRS': return 2;
      case 'MS': return 3;
      case 'CHD': return 4;
      case 'INF': return 5;
      default: return 1;
    }
  }
}

// ============================================================
// FORM DATA MODEL
// ============================================================

/// Yolcu form verisi
class PassengerFormData {
  final bool isLeading;
  final int roomIndex;
  final bool isChild;
  final int? childAge;
  
  String salutation;
  String firstName;
  String lastName;
  String email;
  String phone;
  String identityNumber; // TC veya Pasaport No

  PassengerFormData({
    this.isLeading = false,
    this.roomIndex = 0,
    this.isChild = false,
    this.childAge,
    this.salutation = 'MR',
    this.firstName = '',
    this.lastName = '',
    this.email = '',
    this.phone = '',
    this.identityNumber = '',
  });

  /// Form dolu mu?
  bool get isValid {
    if (isChild) return true; // Çocuklar için detaylı bilgi gerekmiyor
    final hasBasicInfo = firstName.trim().isNotEmpty && lastName.trim().isNotEmpty;
    if (isLeading) {
      // Ana yolcu için iletişim bilgileri de zorunlu
      return hasBasicInfo && 
             email.trim().isNotEmpty && 
             phone.trim().isNotEmpty &&
             identityNumber.trim().isNotEmpty;
    }
    return hasBasicInfo && identityNumber.trim().isNotEmpty;
  }

  /// Kopyala
  PassengerFormData copyWith({
    bool? isLeading,
    int? roomIndex,
    bool? isChild,
    int? childAge,
    String? salutation,
    String? firstName,
    String? lastName,
    String? email,
    String? phone,
    String? identityNumber,
  }) {
    return PassengerFormData(
      isLeading: isLeading ?? this.isLeading,
      roomIndex: roomIndex ?? this.roomIndex,
      isChild: isChild ?? this.isChild,
      childAge: childAge ?? this.childAge,
      salutation: salutation ?? this.salutation,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      identityNumber: identityNumber ?? this.identityNumber,
    );
  }
}

/// Salutation seçenekleri
class SalutationOptions {
  static const List<Map<String, String>> options = [
    {'code': 'MR', 'label': 'Erkek'},
    {'code': 'MRS', 'label': 'Kadın'},
    {'code': 'CHD', 'label': 'Çocuk'},
    {'code': 'INF', 'label': 'Bebek'},
  ];

  static String getLabel(String code) {
    return options.firstWhere(
      (o) => o['code'] == code,
      orElse: () => {'code': code, 'label': code},
    )['label']!;
  }
}
