/// KuveytTürk Sanal POS Modelleri
/// 
/// 3D Secure Model için request/response modelleri.
library;

import 'package:xml/xml.dart';

// ============================================================
// ENUMS
// ============================================================

/// Ödeme durumu
enum KuveytTurkPaymentStatus {
  pending,    // Beklemede
  processing, // İşleniyor
  success,    // Başarılı
  failed,     // Başarısız
  cancelled,  // İptal edildi
}

/// İşlem tipi
enum KuveytTurkTransactionType {
  sale,         // Satış
  saleReversal, // İade
  cancel,       // İptal
}

// ============================================================
// REQUEST MODELS
// ============================================================

/// Kart bilgileri
class KuveytTurkCardInfo {
  final String cardHolderName;
  final String cardNumber;
  final String cardExpireMonth; // MM formatında
  final String cardExpireYear;  // YY formatında
  final String cardCvv;
  final String? cardType; // Visa, MasterCard, Troy

  KuveytTurkCardInfo({
    required this.cardHolderName,
    required this.cardNumber,
    required this.cardExpireMonth,
    required this.cardExpireYear,
    required this.cardCvv,
    this.cardType,
  });

  /// Kart numarasını maskele (son 4 hane görünsün)
  String get maskedCardNumber {
    if (cardNumber.length < 4) return '****';
    return '**** **** **** ${cardNumber.substring(cardNumber.length - 4)}';
  }

  /// Geçerlilik kontrolü
  bool get isValid {
    return cardHolderName.trim().isNotEmpty &&
           cardNumber.replaceAll(' ', '').length >= 15 &&
           cardExpireMonth.length == 2 &&
           cardExpireYear.length == 2 &&
           cardCvv.length >= 3;
  }
}

/// 3D Ödeme başlatma isteği (İlk adım)
/// KuveytTürk 3D Secure 2.X uyumlu - TDV2.0.0
class KuveytTurkPaymentRequest {
  final String merchantId;
  final String customerId;
  final String userName;
  final String merchantOrderId;
  final int amount; // 100 ile çarpılmış (örn: 100.50 TL = 10050)
  final String currencyCode;
  final String okUrl;
  final String failUrl;
  final String hashData;
  final KuveytTurkCardInfo cardInfo;
  final int installmentCount;
  final String transactionType;
  
  // 3D Secure 2.X zorunlu alanlar
  final String clientIp; // Kart sahibinin IP adresi (zorunlu)
  final String deviceChannel; // 01=Mobil, 02=Web Browser
  
  // CardHolderData (3D Secure 2.X için beklenen)
  final String? billAddrCity;
  final String? billAddrCountry; // ISO 3166-1 sayısal (792=Türkiye)
  final String? billAddrLine1;
  final String? billAddrPostCode;
  final String? billAddrState; // ISO 3166-2 il kodu
  final String? email;
  final String? phoneCountryCode; // Cc (90=Türkiye)
  final String? phoneSubscriber; // Telefon numarası
  
  // Banka zorunlu alanı (dokümantasyonda yok ama sunucu zorunlu tutuyor)
  final String identityTaxNumber; // TC Kimlik No

  KuveytTurkPaymentRequest({
    required this.merchantId,
    required this.customerId,
    required this.userName,
    required this.merchantOrderId,
    required this.amount,
    required this.currencyCode,
    required this.okUrl,
    required this.failUrl,
    required this.hashData,
    required this.cardInfo,
    required this.clientIp,
    this.deviceChannel = '02',
    this.billAddrCity,
    this.billAddrCountry,
    this.billAddrLine1,
    this.billAddrPostCode,
    this.billAddrState,
    this.email,
    this.phoneCountryCode,
    this.phoneSubscriber,
    required this.identityTaxNumber,
    this.installmentCount = 0,
    this.transactionType = 'Sale',
  });

  /// XML formatına çevir (KuveytTürk 3D Secure 2.X spec'ine uygun)
  String toXml() {
    final cardType = cardInfo.cardType ?? 'MasterCard';
    
    // CardHolderData bölümü (opsiyonel ama 3D Secure 2.X için beklenen)
    final cardHolderDataXml = StringBuffer();
    if (billAddrCity != null || billAddrCountry != null || email != null || phoneSubscriber != null) {
      cardHolderDataXml.writeln('  <CardHolderData>');
      if (billAddrCity != null) cardHolderDataXml.writeln('    <BillAddrCity>$billAddrCity</BillAddrCity>');
      if (billAddrCountry != null) cardHolderDataXml.writeln('    <BillAddrCountry>$billAddrCountry</BillAddrCountry>');
      if (billAddrLine1 != null) cardHolderDataXml.writeln('    <BillAddrLine1>$billAddrLine1</BillAddrLine1>');
      if (billAddrPostCode != null) cardHolderDataXml.writeln('    <BillAddrPostCode>$billAddrPostCode</BillAddrPostCode>');
      if (billAddrState != null) cardHolderDataXml.writeln('    <BillAddrState>$billAddrState</BillAddrState>');
      if (email != null) cardHolderDataXml.writeln('    <Email>$email</Email>');
      if (phoneCountryCode != null || phoneSubscriber != null) {
        cardHolderDataXml.writeln('    <MobilePhone>');
        if (phoneCountryCode != null) cardHolderDataXml.writeln('      <Cc>$phoneCountryCode</Cc>');
        if (phoneSubscriber != null) cardHolderDataXml.writeln('      <Subscriber>$phoneSubscriber</Subscriber>');
        cardHolderDataXml.writeln('    </MobilePhone>');
      }
      cardHolderDataXml.writeln('  </CardHolderData>');
    }
    
    return '''<?xml version="1.0" encoding="UTF-8"?>
<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <APIVersion>TDV2.0.0</APIVersion>
  <OkUrl>$okUrl</OkUrl>
  <FailUrl>$failUrl</FailUrl>
  <HashData>$hashData</HashData>
  <MerchantId>$merchantId</MerchantId>
  <CustomerId>$customerId</CustomerId>
  <DeviceData>
    <DeviceChannel>$deviceChannel</DeviceChannel>
    <ClientIP>$clientIp</ClientIP>
  </DeviceData>
${cardHolderDataXml.toString()}  <UserName>$userName</UserName>
  <CardNumber>${cardInfo.cardNumber}</CardNumber>
  <CardExpireDateYear>${cardInfo.cardExpireYear}</CardExpireDateYear>
  <CardExpireDateMonth>${cardInfo.cardExpireMonth}</CardExpireDateMonth>
  <CardCVV2>${cardInfo.cardCvv}</CardCVV2>
  <CardHolderName>${cardInfo.cardHolderName}</CardHolderName>
  <CardType>$cardType</CardType>
  <BatchID>0</BatchID>
  <TransactionType>$transactionType</TransactionType>
  <InstallmentCount>$installmentCount</InstallmentCount>
  <Amount>$amount</Amount>
  <DisplayAmount>$amount</DisplayAmount>
  <CurrencyCode>$currencyCode</CurrencyCode>
  <MerchantOrderId>$merchantOrderId</MerchantOrderId>
  <TransactionSecurity>3</TransactionSecurity>
  <SubMerchantId>0</SubMerchantId>
  <Description>Otel Rezervasyon Odemesi</Description>
  <IdentityTaxNumber>$identityTaxNumber</IdentityTaxNumber>
</KuveytTurkVPosMessage>''';
  }
}

/// 3D Ödeme onay isteği (Son adım - MD ile)
class KuveytTurkApprovalRequest {
  final String merchantId;
  final String customerId;
  final String userName;
  final String merchantOrderId;
  final int amount;
  final String currencyCode;
  final String hashData;
  final String md; // 3D doğrulama sonrası dönen MD değeri
  final int installmentCount;
  final String transactionType;

  KuveytTurkApprovalRequest({
    required this.merchantId,
    required this.customerId,
    required this.userName,
    required this.merchantOrderId,
    required this.amount,
    required this.currencyCode,
    required this.hashData,
    required this.md,
    this.installmentCount = 0,
    this.transactionType = 'Sale',
  });

  /// XML formatına çevir (KuveytTürk 3D Secure 2.X spec'ine uygun)
  String toXml() {
    return '''<?xml version="1.0" encoding="UTF-8"?>
<KuveytTurkVPosMessage xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <APIVersion>TDV2.0.0</APIVersion>
  <HashData>$hashData</HashData>
  <MerchantId>$merchantId</MerchantId>
  <CustomerId>$customerId</CustomerId>
  <UserName>$userName</UserName>
  <TransactionType>$transactionType</TransactionType>
  <InstallmentCount>$installmentCount</InstallmentCount>
  <Amount>$amount</Amount>
  <MerchantOrderId>$merchantOrderId</MerchantOrderId>
  <TransactionSecurity>3</TransactionSecurity>
  <KuveytTurkVPosAdditionalData>
    <AdditionalData>
      <Key>MD</Key>
      <Data>$md</Data>
    </AdditionalData>
  </KuveytTurkVPosAdditionalData>
</KuveytTurkVPosMessage>''';
  }
}

// ============================================================
// RESPONSE MODELS
// ============================================================

/// 3D Doğrulama yanıtı (AuthenticationResponse)
class KuveytTurkAuthResponse {
  final String responseCode;
  final String responseMessage;
  final String? merchantOrderId;
  final int? orderId;
  final String? provisionNumber;
  final String? rrn;
  final String? stan;
  final String? md;
  final int? amount;
  final String? hashData;
  final bool isEnrolled;
  final String? acsUrl;
  final String? authenticationPacket;

  KuveytTurkAuthResponse({
    required this.responseCode,
    required this.responseMessage,
    this.merchantOrderId,
    this.orderId,
    this.provisionNumber,
    this.rrn,
    this.stan,
    this.md,
    this.amount,
    this.hashData,
    this.isEnrolled = false,
    this.acsUrl,
    this.authenticationPacket,
  });

  /// Başarılı mı? (ResponseCode = "00")
  bool get isSuccess => responseCode == '00';

  /// Kart doğrulandı mı?
  bool get isCardVerified => isSuccess && md != null && md!.isNotEmpty;

  /// XML'den parse et
  factory KuveytTurkAuthResponse.fromXml(String xmlString) {
    try {
      final document = XmlDocument.parse(xmlString);
      final root = document.rootElement;

      String getText(String name) {
        final element = root.findElements(name).firstOrNull;
        return element?.innerText ?? '';
      }

      int? getInt(String name) {
        final text = getText(name);
        return text.isNotEmpty ? int.tryParse(text) : null;
      }

      // VPosMessage içindeki değerler
      final vposMessage = root.findElements('VPosMessage').firstOrNull;
      String getVPosText(String name) {
        if (vposMessage == null) return '';
        final element = vposMessage.findElements(name).firstOrNull;
        return element?.innerText ?? '';
      }

      return KuveytTurkAuthResponse(
        responseCode: getText('ResponseCode'),
        responseMessage: getText('ResponseMessage'),
        merchantOrderId: getVPosText('MerchantOrderId').isNotEmpty 
            ? getVPosText('MerchantOrderId') 
            : getText('MerchantOrderId'),
        orderId: int.tryParse(getVPosText('OrderId')) ?? getInt('OrderId'),
        provisionNumber: getVPosText('ProvisionNumber').isNotEmpty 
            ? getVPosText('ProvisionNumber') 
            : getText('ProvisionNumber'),
        rrn: getVPosText('RRN').isNotEmpty ? getVPosText('RRN') : getText('RRN'),
        stan: getVPosText('Stan').isNotEmpty ? getVPosText('Stan') : getText('Stan'),
        md: getText('MD'),
        amount: int.tryParse(getVPosText('Amount')) ?? getInt('Amount'),
        hashData: getVPosText('HashData').isNotEmpty 
            ? getVPosText('HashData') 
            : getText('HashData'),
        isEnrolled: getText('IsEnrolled').toLowerCase() == 'true',
        acsUrl: getText('ACSURL'),
        authenticationPacket: getText('AuthenticationPacket'),
      );
    } catch (e) {
      return KuveytTurkAuthResponse(
        responseCode: 'PARSE_ERROR',
        responseMessage: 'XML parse hatası: $e',
      );
    }
  }
}

/// Ödeme onay yanıtı
class KuveytTurkPaymentResponse {
  final String responseCode;
  final String responseMessage;
  final String? merchantOrderId;
  final int? orderId;
  final String? provisionNumber;
  final String? rrn;
  final String? stan;
  final int? amount;
  final String? hashData;
  final DateTime? transactionTime;

  KuveytTurkPaymentResponse({
    required this.responseCode,
    required this.responseMessage,
    this.merchantOrderId,
    this.orderId,
    this.provisionNumber,
    this.rrn,
    this.stan,
    this.amount,
    this.hashData,
    this.transactionTime,
  });

  /// Başarılı mı?
  bool get isSuccess => responseCode == '00';

  /// XML'den parse et
  factory KuveytTurkPaymentResponse.fromXml(String xmlString) {
    try {
      final document = XmlDocument.parse(xmlString);
      final root = document.rootElement;

      String getText(String name) {
        final element = root.findElements(name).firstOrNull;
        return element?.innerText ?? '';
      }

      int? getInt(String name) {
        final text = getText(name);
        return text.isNotEmpty ? int.tryParse(text) : null;
      }

      // VPosMessage içindeki değerler
      final vposMessage = root.findElements('VPosMessage').firstOrNull;
      String getVPosText(String name) {
        if (vposMessage == null) return '';
        final element = vposMessage.findElements(name).firstOrNull;
        return element?.innerText ?? '';
      }

      return KuveytTurkPaymentResponse(
        responseCode: getText('ResponseCode'),
        responseMessage: getText('ResponseMessage'),
        merchantOrderId: getVPosText('MerchantOrderId').isNotEmpty 
            ? getVPosText('MerchantOrderId') 
            : getText('MerchantOrderId'),
        orderId: int.tryParse(getVPosText('OrderId')) ?? getInt('OrderId'),
        provisionNumber: getVPosText('ProvisionNumber').isNotEmpty 
            ? getVPosText('ProvisionNumber') 
            : getText('ProvisionNumber'),
        rrn: getVPosText('RRN').isNotEmpty ? getVPosText('RRN') : getText('RRN'),
        stan: getVPosText('Stan').isNotEmpty ? getVPosText('Stan') : getText('Stan'),
        amount: int.tryParse(getVPosText('Amount')) ?? getInt('Amount'),
        hashData: getVPosText('HashData').isNotEmpty 
            ? getVPosText('HashData') 
            : getText('HashData'),
        transactionTime: DateTime.tryParse(getText('TransactionTime')),
      );
    } catch (e) {
      return KuveytTurkPaymentResponse(
        responseCode: 'PARSE_ERROR',
        responseMessage: 'XML parse hatası: $e',
      );
    }
  }
}

/// Ödeme sonucu (UI için)
class KuveytTurkPaymentResult {
  final KuveytTurkPaymentStatus status;
  final String? transactionId;
  final String? provisionNumber;
  final String? orderId;
  final double? amount;
  final String? errorMessage;
  final String? errorCode;

  KuveytTurkPaymentResult({
    required this.status,
    this.transactionId,
    this.provisionNumber,
    this.orderId,
    this.amount,
    this.errorMessage,
    this.errorCode,
  });

  bool get isSuccess => status == KuveytTurkPaymentStatus.success;
  bool get isFailed => status == KuveytTurkPaymentStatus.failed;
  bool get isPending => status == KuveytTurkPaymentStatus.pending;

  factory KuveytTurkPaymentResult.success({
    required String transactionId,
    String? provisionNumber,
    String? orderId,
    double? amount,
  }) {
    return KuveytTurkPaymentResult(
      status: KuveytTurkPaymentStatus.success,
      transactionId: transactionId,
      provisionNumber: provisionNumber,
      orderId: orderId,
      amount: amount,
    );
  }

  factory KuveytTurkPaymentResult.failed({
    String? errorMessage,
    String? errorCode,
  }) {
    return KuveytTurkPaymentResult(
      status: KuveytTurkPaymentStatus.failed,
      errorMessage: errorMessage,
      errorCode: errorCode,
    );
  }

  factory KuveytTurkPaymentResult.cancelled() {
    return KuveytTurkPaymentResult(
      status: KuveytTurkPaymentStatus.cancelled,
      errorMessage: 'Ödeme iptal edildi',
    );
  }
}

/// Sepet öğesi
class KuveytTurkBasketItem {
  final String name;
  final double unitPrice;
  final int quantity;

  KuveytTurkBasketItem({
    required this.name,
    required this.unitPrice,
    this.quantity = 1,
  });

  double get totalPrice => unitPrice * quantity;
}
