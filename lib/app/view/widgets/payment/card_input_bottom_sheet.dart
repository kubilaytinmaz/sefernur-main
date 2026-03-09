import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../data/models/payment/kuveytturk_models.dart';
import '../../../data/providers/payment/kuveytturk_config.dart';

/// Kart numarası formatter (XXXX XXXX XXXX XXXX)
class _CardNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    final buffer = StringBuffer();
    for (var i = 0; i < digits.length && i < 16; i++) {
      if (i > 0 && i % 4 == 0) buffer.write(' ');
      buffer.write(digits[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

/// Son kullanma tarihi formatter (MM/YY)
class _ExpiryDateFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    final buffer = StringBuffer();
    for (var i = 0; i < digits.length && i < 4; i++) {
      if (i == 2) buffer.write('/');
      buffer.write(digits[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}

/// Modern kart bilgisi bottom sheet'i
///
/// Kullanıcıdan kart bilgilerini alır, dönen [KuveytTurkCardInfo] ile
/// ödeme akışına devam eder.
///
/// Test modunda: Test kartı ile hızlı doldurma butonu sunar.
class CardInputBottomSheet extends StatefulWidget {
  /// Ödeme tutarı (gösterim için)
  final double amount;

  /// Para birimi
  final String currency;

  const CardInputBottomSheet({
    super.key,
    required this.amount,
    required this.currency,
  });

  /// Bottom sheet'i göster ve kart bilgilerini al
  static Future<KuveytTurkCardInfo?> show({
    required BuildContext context,
    required double amount,
    required String currency,
  }) {
    return showModalBottomSheet<KuveytTurkCardInfo>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CardInputBottomSheet(
        amount: amount,
        currency: currency,
      ),
    );
  }

  @override
  State<CardInputBottomSheet> createState() => _CardInputBottomSheetState();
}

class _CardInputBottomSheetState extends State<CardInputBottomSheet>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();

  final _cardNumberCtrl = TextEditingController();
  final _cardHolderCtrl = TextEditingController();
  final _expiryCtrl = TextEditingController();
  final _cvvCtrl = TextEditingController();

  final _cardNumberFocus = FocusNode();
  final _cardHolderFocus = FocusNode();
  final _expiryFocus = FocusNode();
  final _cvvFocus = FocusNode();

  String _detectedCardType = '';
  bool _isProcessing = false;

  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _animCtrl.forward();

    _cardNumberCtrl.addListener(_onCardNumberChanged);
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _cardNumberCtrl.dispose();
    _cardHolderCtrl.dispose();
    _expiryCtrl.dispose();
    _cvvCtrl.dispose();
    _cardNumberFocus.dispose();
    _cardHolderFocus.dispose();
    _expiryFocus.dispose();
    _cvvFocus.dispose();
    super.dispose();
  }

  void _onCardNumberChanged() {
    final cleaned = _cardNumberCtrl.text.replaceAll(' ', '');
    final type = KuveytTurkConfig.detectCardType(cleaned);
    if (type != _detectedCardType) {
      setState(() => _detectedCardType = type);
    }
  }

  void _fillTestCard() {
    _cardNumberCtrl.text = '5188 9619 3919 2544';
    _cardHolderCtrl.text = 'TEST USER';
    _expiryCtrl.text = '06/25';
    _cvvCtrl.text = '929';
    setState(() {});
  }

  void _submit() {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _isProcessing = true);

    final expiry = _expiryCtrl.text.split('/');
    final cardInfo = KuveytTurkCardInfo(
      cardNumber: _cardNumberCtrl.text.replaceAll(' ', ''),
      cardHolderName: _cardHolderCtrl.text.trim().toUpperCase(),
      cardExpireMonth: expiry[0].padLeft(2, '0'),
      cardExpireYear: expiry.length > 1 ? expiry[1] : '',
      cardCvv: _cvvCtrl.text.trim(),
    );

    Navigator.of(context).pop(cardInfo);
  }

  // ───────────────────── UI ─────────────────────

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return FadeTransition(
      opacity: _fadeAnim,
      child: Container(
        margin: EdgeInsets.only(bottom: bottomInset),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 16.h),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag handle
                  _buildDragHandle(),
                  SizedBox(height: 16.h),

                  // Header
                  _buildHeader(),
                  SizedBox(height: 20.h),

                  // Kart görseli
                  _buildCardPreview(),
                  SizedBox(height: 24.h),

                  // İnput alanları
                  _buildCardNumberField(),
                  SizedBox(height: 14.h),
                  _buildCardHolderField(),
                  SizedBox(height: 14.h),
                  _buildExpiryAndCvvRow(),
                  SizedBox(height: 8.h),

                  // Test modu butonu
                  if (!KuveytTurkConfig.isProduction) ...[
                    SizedBox(height: 6.h),
                    _buildTestFillButton(),
                  ],

                  SizedBox(height: 24.h),

                  // Ödeme butonu
                  _buildPayButton(),
                  SizedBox(height: 8.h),

                  // Güvenlik notu
                  _buildSecurityNote(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ───────────────────── WIDGETS ─────────────────────

  Widget _buildDragHandle() {
    return Center(
      child: Container(
        width: 40.w,
        height: 4.h,
        decoration: BoxDecoration(
          color: Colors.grey[350],
          borderRadius: BorderRadius.circular(2.r),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(10.w),
          decoration: BoxDecoration(
            color: Colors.teal.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12.r),
          ),
          child: Icon(Icons.lock_outline, color: Colors.teal, size: 22.sp),
        ),
        SizedBox(width: 12.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'payment_info'.tr.isNotEmpty ? 'Ödeme Bilgileri' : 'Ödeme Bilgileri',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  letterSpacing: -0.3,
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                '3D Secure güvenli ödeme',
                style: TextStyle(
                  fontSize: 12.sp,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
        // Tutar badge
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: Colors.teal,
            borderRadius: BorderRadius.circular(20.r),
          ),
          child: Text(
            '${widget.amount.toStringAsFixed(2)} ${widget.currency}',
            style: TextStyle(
              color: Colors.white,
              fontSize: 13.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCardPreview() {
    final cardNum = _cardNumberCtrl.text.isEmpty
        ? '•••• •••• •••• ••••'
        : _cardNumberCtrl.text;
    final holder = _cardHolderCtrl.text.isEmpty
        ? 'AD SOYAD'
        : _cardHolderCtrl.text.toUpperCase();
    final expiry = _expiryCtrl.text.isEmpty ? 'MM/YY' : _expiryCtrl.text;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A5C40), Color(0xFF0D7B52)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16.r),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1A5C40).withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Üst: chip + logo
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Chip
              Container(
                width: 36.w,
                height: 26.h,
                decoration: BoxDecoration(
                  color: Colors.amber[300],
                  borderRadius: BorderRadius.circular(5.r),
                ),
              ),
              _buildCardBrandIcon(),
            ],
          ),
          SizedBox(height: 20.h),

          // Kart numarası
          Text(
            cardNum,
            style: TextStyle(
              color: Colors.white,
              fontSize: 20.sp,
              fontWeight: FontWeight.w500,
              letterSpacing: 2.5,
              fontFamily: 'monospace',
            ),
          ),
          SizedBox(height: 16.h),

          // Alt satır: isim + tarih
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'KART SAHİBİ',
                      style: TextStyle(
                        color: Colors.white60,
                        fontSize: 9.sp,
                        letterSpacing: 1,
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      holder,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'SON KULLANMA',
                    style: TextStyle(
                      color: Colors.white60,
                      fontSize: 9.sp,
                      letterSpacing: 1,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    expiry,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCardBrandIcon() {
    IconData icon;
    Color color;

    switch (_detectedCardType) {
      case 'Visa':
        icon = Icons.credit_card;
        color = Colors.white;
        break;
      case 'Troy':
        icon = Icons.credit_card;
        color = Colors.blue[200]!;
        break;
      default: // MasterCard
        icon = Icons.credit_card;
        color = Colors.orange[200]!;
    }

    return Row(
      children: [
        if (_detectedCardType.isNotEmpty)
          Text(
            _detectedCardType,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 11.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
        SizedBox(width: 4.w),
        Icon(icon, color: color, size: 28.sp),
      ],
    );
  }

  // ───────── Input fields ─────────

  Widget _buildCardNumberField() {
    return TextFormField(
      controller: _cardNumberCtrl,
      focusNode: _cardNumberFocus,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        _CardNumberFormatter(),
      ],
      textInputAction: TextInputAction.next,
      onFieldSubmitted: (_) => _cardHolderFocus.requestFocus(),
      decoration: _inputDecoration(
        label: 'Kart Numarası',
        hint: '0000 0000 0000 0000',
        prefixIcon: Icons.credit_card_outlined,
      ),
      style: TextStyle(
        fontSize: 16.sp,
        letterSpacing: 1.2,
        fontWeight: FontWeight.w500,
      ),
      validator: (v) {
        final cleaned = v?.replaceAll(' ', '') ?? '';
        if (cleaned.isEmpty) return 'Kart numarası gerekli';
        if (cleaned.length < 15) return 'Geçersiz kart numarası';
        return null;
      },
    );
  }

  Widget _buildCardHolderField() {
    return TextFormField(
      controller: _cardHolderCtrl,
      focusNode: _cardHolderFocus,
      textCapitalization: TextCapitalization.characters,
      textInputAction: TextInputAction.next,
      onFieldSubmitted: (_) => _expiryFocus.requestFocus(),
      onChanged: (_) => setState(() {}),
      decoration: _inputDecoration(
        label: 'Kart Üzerindeki İsim',
        hint: 'AD SOYAD',
        prefixIcon: Icons.person_outline,
      ),
      style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w500),
      validator: (v) {
        if (v == null || v.trim().isEmpty) return 'Kart sahibi adı gerekli';
        return null;
      },
    );
  }

  Widget _buildExpiryAndCvvRow() {
    return Row(
      children: [
        // Son Kullanma
        Expanded(
          flex: 3,
          child: TextFormField(
            controller: _expiryCtrl,
            focusNode: _expiryFocus,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              _ExpiryDateFormatter(),
            ],
            textInputAction: TextInputAction.next,
            onFieldSubmitted: (_) => _cvvFocus.requestFocus(),
            onChanged: (_) => setState(() {}),
            decoration: _inputDecoration(
              label: 'Son Kullanma',
              hint: 'AA/YY',
              prefixIcon: Icons.calendar_today_outlined,
            ),
            style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w500),
            validator: (v) {
              final digits = v?.replaceAll(RegExp(r'\D'), '') ?? '';
              if (digits.length < 4) return 'Geçersiz tarih';
              final month = int.tryParse(digits.substring(0, 2)) ?? 0;
              if (month < 1 || month > 12) return 'Geçersiz ay';
              return null;
            },
          ),
        ),
        SizedBox(width: 12.w),
        // CVV
        Expanded(
          flex: 2,
          child: TextFormField(
            controller: _cvvCtrl,
            focusNode: _cvvFocus,
            keyboardType: TextInputType.number,
            obscureText: true,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(4),
            ],
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _submit(),
            decoration: _inputDecoration(
              label: 'CVV',
              hint: '•••',
              prefixIcon: Icons.security_outlined,
            ),
            style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w500),
            validator: (v) {
              if (v == null || v.length < 3) return 'Geçersiz';
              return null;
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTestFillButton() {
    return GestureDetector(
      onTap: _fillTestCard,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: Colors.amber.withOpacity(0.12),
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(color: Colors.amber.withOpacity(0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.bug_report_outlined, size: 16.sp, color: Colors.amber[800]),
            SizedBox(width: 6.w),
            Text(
              'Test kartı ile doldur',
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: Colors.amber[800],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPayButton() {
    return SizedBox(
      width: double.infinity,
      height: 52.h,
      child: ElevatedButton(
        onPressed: _isProcessing ? null : _submit,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.teal,
          foregroundColor: Colors.white,
          disabledBackgroundColor: Colors.teal.withOpacity(0.5),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14.r),
          ),
        ),
        child: _isProcessing
            ? SizedBox(
                width: 22.w,
                height: 22.w,
                child: const CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.lock_outline, size: 20.sp),
                  SizedBox(width: 8.w),
                  Text(
                    'Güvenli Ödeme Yap',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildSecurityNote() {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.verified_user_outlined, size: 14.sp, color: Colors.grey[500]),
          SizedBox(width: 4.w),
          Text(
            'Bilgileriniz 256-bit SSL ile şifrelenir',
            style: TextStyle(
              fontSize: 11.sp,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  // ───────── Shared decoration ─────────

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    required IconData prefixIcon,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14.sp),
      prefixIcon: Icon(prefixIcon, size: 20.sp),
      filled: true,
      fillColor: Colors.grey[50],
      contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: BorderSide(color: Colors.grey[300]!),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: const BorderSide(color: Colors.teal, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: BorderSide(color: Colors.red[300]!),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12.r),
        borderSide: const BorderSide(color: Colors.red, width: 1.5),
      ),
      counterText: '',
    );
  }
}
