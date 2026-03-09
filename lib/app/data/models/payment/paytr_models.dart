/// PayTR Ödeme Modelleri
library;

/// Token alma isteği
class PayTrTokenRequest {
  final String merchantId;
  final String userIp;
  final String merchantOid; // Sipariş no
  final String email;
  final int paymentAmount; // 100 ile çarpılmış
  final String userBasket; // Base64 encoded JSON
  final int noInstallment;
  final int maxInstallment;
  final String currency;
  final int testMode;
  final String userName;
  final String userAddress;
  final String userPhone;
  final String merchantOkUrl;
  final String merchantFailUrl;
  final int timeoutLimit;
  final int debugOn;
  final String paytrToken; // HMAC hash
  final String? lang;

  PayTrTokenRequest({
    required this.merchantId,
    required this.userIp,
    required this.merchantOid,
    required this.email,
    required this.paymentAmount,
    required this.userBasket,
    required this.noInstallment,
    required this.maxInstallment,
    required this.currency,
    required this.testMode,
    required this.userName,
    required this.userAddress,
    required this.userPhone,
    required this.merchantOkUrl,
    required this.merchantFailUrl,
    required this.timeoutLimit,
    required this.debugOn,
    required this.paytrToken,
    this.lang,
  });

  Map<String, dynamic> toMap() {
    return {
      'merchant_id': merchantId,
      'user_ip': userIp,
      'merchant_oid': merchantOid,
      'email': email,
      'payment_amount': paymentAmount.toString(),
      'user_basket': userBasket,
      'no_installment': noInstallment.toString(),
      'max_installment': maxInstallment.toString(),
      'currency': currency,
      'test_mode': testMode.toString(),
      'user_name': userName,
      'user_address': userAddress,
      'user_phone': userPhone,
      'merchant_ok_url': merchantOkUrl,
      'merchant_fail_url': merchantFailUrl,
      'timeout_limit': timeoutLimit.toString(),
      'debug_on': debugOn.toString(),
      'paytr_token': paytrToken,
      if (lang != null) 'lang': lang,
    };
  }
}

/// Token yanıtı
class PayTrTokenResponse {
  final bool success;
  final String? token;
  final String? reason;

  PayTrTokenResponse({
    required this.success,
    this.token,
    this.reason,
  });

  factory PayTrTokenResponse.fromJson(Map<String, dynamic> json) {
    return PayTrTokenResponse(
      success: json['status'] == 'success',
      token: json['token'],
      reason: json['reason'],
    );
  }
  
  /// iFrame URL'ini oluştur
  String? get iframeUrl => token != null 
      ? 'https://www.paytr.com/odeme/guvenli/$token' 
      : null;
}

/// Ödeme bildirimi (Webhook'tan gelen)
class PayTrNotification {
  final String merchantOid;
  final String status; // 'success' veya 'failed'
  final int totalAmount; // 100 ile çarpılmış
  final String hash;
  final int? failedReasonCode;
  final String? failedReasonMsg;
  final int? testMode;
  final String paymentType; // 'card' veya 'eft'
  final String? currency;
  final int? paymentAmount;

  PayTrNotification({
    required this.merchantOid,
    required this.status,
    required this.totalAmount,
    required this.hash,
    this.failedReasonCode,
    this.failedReasonMsg,
    this.testMode,
    required this.paymentType,
    this.currency,
    this.paymentAmount,
  });

  factory PayTrNotification.fromMap(Map<String, dynamic> map) {
    return PayTrNotification(
      merchantOid: map['merchant_oid'] ?? '',
      status: map['status'] ?? '',
      totalAmount: int.tryParse(map['total_amount']?.toString() ?? '0') ?? 0,
      hash: map['hash'] ?? '',
      failedReasonCode: int.tryParse(map['failed_reason_code']?.toString() ?? ''),
      failedReasonMsg: map['failed_reason_msg'],
      testMode: int.tryParse(map['test_mode']?.toString() ?? ''),
      paymentType: map['payment_type'] ?? 'card',
      currency: map['currency'],
      paymentAmount: int.tryParse(map['payment_amount']?.toString() ?? ''),
    );
  }

  bool get isSuccess => status == 'success';
  
  /// Gerçek tutarı döndür (100'e böl)
  double get actualAmount => totalAmount / 100;
}

/// Sepet içeriği (user_basket için)
class PayTrBasketItem {
  final String name;
  final double unitPrice;
  final int quantity;

  PayTrBasketItem({
    required this.name,
    required this.unitPrice,
    required this.quantity,
  });

  List<dynamic> toList() {
    return [name, unitPrice.toStringAsFixed(2), quantity];
  }
}

/// Ödeme durumu
enum PayTrPaymentStatus {
  pending,    // Bekliyor
  success,    // Başarılı
  failed,     // Başarısız
  timeout,    // Zaman aşımı
  cancelled,  // İptal edildi
}

/// Ödeme sonucu
class PayTrPaymentResult {
  final PayTrPaymentStatus status;
  final String? transactionId;
  final double? amount;
  final String? currency;
  final String? errorMessage;
  final DateTime timestamp;

  PayTrPaymentResult({
    required this.status,
    this.transactionId,
    this.amount,
    this.currency,
    this.errorMessage,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isSuccess => status == PayTrPaymentStatus.success;
}
