import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

import '../../data/services/auth/auth_service.dart';
import '../../data/services/referral/referral_service.dart';

class ReferralsController extends GetxController {
  var isLoading = false.obs;
  var referralCode = ''.obs;
  var totalEarnings = 0.0.obs;
  var availableBalance = 0.0.obs;
  var minWithdrawal = 100.0.obs;
  
  // Dummy data - replace with actual data from API
  // Legacy dummy removed; earnings now via ReferralService
  
  var referralHistory = <ReferralHistory>[].obs; // will be populated later
  
  var withdrawalRequests = <WithdrawalRequest>[].obs;
  
  var faqItems = <FAQItem>[
    FAQItem(
      question: 'Referans sistemi nasıl çalışır?',
      answer: 'Arkadaşlarınızı davet ettiğinizde, onların yaptığı her başarılı rezervasyon için ödül kazanırsınız.',
    ),
    FAQItem(
      question: 'Ne kadar ödül kazanırım?',
      answer: 'Her başarılı referans için 100 USD\'ye kadar ödül kazanabilirsiniz.',
    ),
    FAQItem(
      question: 'Ödeme ne zaman yapılır?',
      answer: 'Minimum 100 USD biriktirdikten sonra ödeme talebinde bulunabilirsiniz.',
    ),
    FAQItem(
      question: 'Referans kodum süresi var mı?',
      answer: 'Hayır, referans kodunuz süresizdir ve istediğiniz zaman kullanabilirsiniz.',
    ),
  ].obs;

  @override
  void onInit() {
    super.onInit();
    // Initialize data or fetch from API
    _initReferral();
  }
  Future<void> _initReferral() async {
    final auth = Get.find<AuthService>();
    if (auth.user.value.id != null) {
      final refService = Get.find<ReferralService>();
      final code = await refService.ensureUserReferralCode(auth.user.value.id!);
      if (code != null) referralCode.value = code;
      totalEarnings.value = refService.totalEarnings;
      availableBalance.value = refService.availableBalance;
    }
  }

  void copyReferralCode() {
    Clipboard.setData(ClipboardData(text: referralCode.value));
    Get.snackbar(
      'Başarılı',
      'Referans kodu kopyalandı!',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Get.theme.primaryColor,
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }

  void copyReferralLink() {
    String referralLink = 'https://sefernur.com/ref/${referralCode.value}';
    Clipboard.setData(ClipboardData(text: referralLink));
    Get.snackbar(
      'Başarılı',
      'Referans linki kopyalandı!',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Get.theme.primaryColor,
      colorText: Colors.white,
      duration: const Duration(seconds: 2),
    );
  }

  void requestWithdrawal() {
    final auth = Get.find<AuthService>();
    final userId = auth.user.value.id;
    if (userId == null) return;
    final referral = Get.find<ReferralService>();
    final maxAmount = referral.availableBalance; // simplify
    if (maxAmount < minWithdrawal.value) {
      Get.snackbar('Uyarı', 'Minimum ${minWithdrawal.value} USD bakiye gereklidir.', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.orange, colorText: Colors.white);
      return;
    }
    final amountCtrl = TextEditingController(text: maxAmount.toStringAsFixed(2));
    final ibanCtrl = TextEditingController();
    Get.dialog(AlertDialog(
      title: const Text('Ödeme Talebi'),
      content: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Row(children:[
          Expanded(child: TextField(controller: amountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Tutar (USD)'))),
          const SizedBox(width:8),
          TextButton(
            onPressed: (){ amountCtrl.text = maxAmount.toStringAsFixed(2); },
            child: const Text('Tümünü Çek'),
          )
        ]),
        TextField(controller: ibanCtrl, decoration: const InputDecoration(labelText: 'IBAN / Hesap')),
        const SizedBox(height: 12),
        const Text('Talep edilen tutar 3-5 iş günü içinde IBAN hesabınıza aktarılır.', style: TextStyle(fontSize: 12, color: Colors.grey)),
      ])),
      actions: [
        TextButton(onPressed: ()=>Get.back(), child: const Text('İptal')),
        ElevatedButton(onPressed: () async {
          final amt = double.tryParse(amountCtrl.text.replaceAll(',', '.')) ?? 0;
            final iban = ibanCtrl.text.trim();
          if (amt <= 0 || amt > maxAmount) {
            Get.snackbar('Hata', 'Geçerli bir tutar girin (max ${maxAmount.toStringAsFixed(2)})', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white); return; }
          if (!_validIban(iban)) { Get.snackbar('Hata', 'Geçersiz IBAN / Hesap', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white); return; }
          final ok = await referral.requestWithdrawal(userId: userId, amount: amt, iban: iban);
          if (ok) {
            Get.back();
            // Refresh local observable balances
            totalEarnings.value = referral.totalEarnings;
            availableBalance.value = referral.availableBalance;
            Get.snackbar('Başarılı', 'Ödeme talebiniz alındı', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.green, colorText: Colors.white);
          } else {
            Get.snackbar('Hata', 'Talep oluşturulamadı', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white);
          }
        }, child: const Text('Gönder')),
      ],
    ));
  }

  bool _validIban(String input){
    if(input.isEmpty) return false;
    final iban = input.replaceAll(' ', '').toUpperCase();
    // Basic TR IBAN length check or generic length 15-34
    if(iban.length < 15 || iban.length > 34) return false;
    final regex = RegExp(r'^[A-Z0-9]+$');
    if(!regex.hasMatch(iban)) return false;
    // Move first 4 chars to end and convert letters to numbers (A=10 ... Z=35), then mod 97 == 1
    String rearranged = iban.substring(4) + iban.substring(0,4);
    final expanded = rearranged.split('').map((c){
      final code = c.codeUnitAt(0);
      if(code >= 65 && code <= 90){ // A-Z
        return (code - 55).toString();
      }
      return c;
    }).join();
    int remainder = 0;
    for(final chunk in expanded.split('').map((e)=>e).toList()){
      remainder = int.parse('$remainder$chunk') % 97;
    }
    return remainder == 1;
  }

  String getStatusText(String status) {
    switch (status) {
      case 'Completed':
        return 'Tamamlandı';
      case 'Pending':
        return 'Beklemede';
      case 'Processing':
        return 'İşleniyor';
      default:
        return status;
    }
  }

  Color getStatusColor(String status) {
    switch (status) {
      case 'Completed':
        return Colors.green;
      case 'Pending':
        return Colors.orange;
      case 'Processing':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}

class EarningHistory {
  final DateTime date;
  final double amount;
  final String type;
  final String status;

  EarningHistory({
    required this.date,
    required this.amount,
    required this.type,
    required this.status,
  });
}

class ReferralHistory {
  final String userName;
  final String service;
  final DateTime date;
  final double earnedAmount;
  final String status;

  ReferralHistory({
    required this.userName,
    required this.service,
    required this.date,
    required this.earnedAmount,
    required this.status,
  });
}

class WithdrawalRequest {
  final DateTime date;
  final double amount;
  final String status;
  final String bankAccount;

  WithdrawalRequest({
    required this.date,
    required this.amount,
    required this.status,
    required this.bankAccount,
  });
}

class FAQItem {
  final String question;
  final String answer;
  bool isExpanded;

  FAQItem({
    required this.question,
    required this.answer,
    this.isExpanded = false,
  });
}
