import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

/// Döviz kuru bilgilerini tutan model
class ExchangeRateModel {
  final String id;
  final String baseCurrency; // USD
  final String targetCurrency; // TRY
  final double rate; // 1 USD = X TRY
  final DateTime updatedAt;
  final String? updatedBy; // admin user id

  ExchangeRateModel({
    this.id = 'usd_try',
    this.baseCurrency = 'USD',
    this.targetCurrency = 'TRY',
    required this.rate,
    required this.updatedAt,
    this.updatedBy,
  });

  factory ExchangeRateModel.fromJson(Map<String, dynamic> json) {
    return ExchangeRateModel(
      id: json['id'] ?? 'usd_try',
      baseCurrency: json['baseCurrency'] ?? 'USD',
      targetCurrency: json['targetCurrency'] ?? 'TRY',
      rate: double.tryParse(json['rate']?.toString() ?? '0') ?? 0,
      updatedAt: _parseDate(json['updatedAt']),
      updatedBy: json['updatedBy'],
    );
  }

  static DateTime _parseDate(dynamic v) {
    if (v == null) return DateTime.now();
    if (v is Timestamp) return v.toDate();
    return DateTime.tryParse(v.toString()) ?? DateTime.now();
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'baseCurrency': baseCurrency,
      'targetCurrency': targetCurrency,
      'rate': rate,
      'updatedAt': updatedAt.toIso8601String(),
      'updatedBy': updatedBy,
    };
  }

  ExchangeRateModel copyWith({
    String? id,
    String? baseCurrency,
    String? targetCurrency,
    double? rate,
    DateTime? updatedAt,
    String? updatedBy,
  }) {
    return ExchangeRateModel(
      id: id ?? this.id,
      baseCurrency: baseCurrency ?? this.baseCurrency,
      targetCurrency: targetCurrency ?? this.targetCurrency,
      rate: rate ?? this.rate,
      updatedAt: updatedAt ?? this.updatedAt,
      updatedBy: updatedBy ?? this.updatedBy,
    );
  }

  /// TL fiyatını USD'ye çevir (TL bazlı sistem)
  double toUSD(double tryAmount) {
    if (rate == 0) return 0;
    return tryAmount / rate;
  }

  /// USD fiyatını TL'ye çevir
  double toTRY(double usdAmount) {
    return usdAmount * rate;
  }

  /// Formatlanmış TL fiyatı (direkt TL değeri)
  String formatTRYDirect(double tryAmount) {
    final formatter = NumberFormat('#,###', 'tr_TR');
    return '${formatter.format(tryAmount)}₺';
  }

  /// Formatlanmış USD fiyatı (TL'den çevrilmiş)
  String formatUSDFromTRY(double tryAmount) {
    final usd = toUSD(tryAmount);
    final formatter = NumberFormat('#,###', 'en_US');
    return '\$${formatter.format(usd.round())}';
  }

  /// Her iki para biriminde formatlanmış fiyat (TL bazlı giriş için)
  /// tryAmount: TL cinsinden fiyat
  /// Gösterim: TL önce, USD sonra
  String formatBoth(double tryAmount) {
    return '${formatTRYDirect(tryAmount)} / ${formatUSDFromTRY(tryAmount)}';
  }

  // ============ ESKİ METODLAR (geriye uyumluluk) ============
  
  /// Formatlanmış TL fiyatı (USD'den çevrilmiş) - ESKİ
  String formatTRY(double usdAmount) {
    final try_ = toTRY(usdAmount);
    final formatter = NumberFormat('#,###', 'tr_TR');
    return '${formatter.format(try_)}₺';
  }

  /// Formatlanmış USD fiyatı - ESKİ
  String formatUSD(double usdAmount) {
    final formatter = NumberFormat('#,###', 'en_US');
    return '\$${formatter.format(usdAmount)}';
  }
}

/// Para birimi türleri
enum Currency {
  usd('USD', '\$', 'Dolar'),
  try_('TRY', '₺', 'Türk Lirası'),
  eur('EUR', '€', 'Euro');

  final String code;
  final String symbol;
  final String name;
  const Currency(this.code, this.symbol, this.name);
}
