import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/profile/profile_controller.dart';
import '../../../../controllers/referrals/referrals_controller.dart';
import '../../../../data/models/referral/referral_models.dart';
import '../../../../data/services/auth/auth_service.dart';
import '../../../../data/services/language/language_service.dart';
import '../../../../data/services/notification/notification_service.dart';
import '../../../../data/services/referral/referral_service.dart';
import '../../../../data/services/theme/theme_service.dart';

class SettingsTab extends StatelessWidget {
  const SettingsTab({super.key});
  @override
  Widget build(BuildContext context) {
    final themeService = Get.find<ThemeService>();
    final languageService = Get.find<LanguageService>();
  final profile = Get.find<ProfileController>();
  Get.find<AuthService>(); // Ensure AuthService initialized
    NotificationService? notif;
    if (Get.isRegistered<NotificationService>()) {
      notif = Get.find<NotificationService>();
    }

    return SingleChildScrollView(
      padding: EdgeInsets.all(20.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Referral dynamic card
          Obx(() => profile.referralStats.value == null ? const SizedBox.shrink() : const _ReferralCard()),

          // Account & security section
          _SettingsSection(children: [
            _SettingsItem(
              icon: Icons.lock_outline,
              title: 'Şifre Değiştir',
              subtitle: 'Hesap güvenliğinizi artırın',
              onTap: profile.changePassword,
            ),
            Obx(() => _SettingsItem(
                  icon: Icons.verified_user,
                  title: 'Kimlik Doğrulama',
                  subtitle: profile.user.value?.isVerified == true ? 'Doğrulanmış hesap' : 'Hesabınızı doğrulayın',
                  onTap: profile.user.value?.isVerified == true ? null : profile.verifyIdentity,
                  trailing: profile.user.value?.isVerified == true
                      ? Icon(Icons.check_circle, color: Colors.green, size: 20.sp)
                      : null,
                )),
          ]),
          SizedBox(height: 20.h),

          // Personalization / preferences
          _SettingsSection(children: [
            Obx(() => _SwitchItem(
                  icon: Icons.dark_mode,
                  title: 'Karanlık Mod',
                  subtitle: themeService.isDarkMode.value ? 'Koyu tema' : 'Açık tema',
                  value: themeService.isDarkMode.value,
                  onChanged: (v) => themeService.toggleTheme(v),
                )),
            _SettingsItem(
              icon: Icons.language,
              title: 'Dil',
              subtitle: _displayLangName(
                languageService.getLanguageEntity().name,
                languageService.getLanguageEntity().locale,
              ),
              onTap: () => _showLanguageSheet(languageService),
            ),
          ]),
          SizedBox(height: 20.h),

          // Notification preferences (dynamic)
            _SettingsSection(children: [
              Obx(() => _SwitchItem(
                    icon: Icons.notifications_active,
                    title: 'Bildirimler',
                    subtitle: profile.notificationsEnabled.value ? 'Aktif' : 'Kapalı',
                    value: profile.notificationsEnabled.value,
                    onChanged: (v) async {
                      profile.notificationsEnabled.value = v;
                      if (notif != null) {
                        await notif.setNotificationsEnabled(v);
                        if (v) {
                          await notif.subscribeToTopic(topic: 'general');
                        } else {
                          await notif.unsubscribeFromTopic(topic: 'general');
                        }
                      }
                    },
                  )),
              Obx(() => _SwitchItem(
                    icon: Icons.email,
                    title: 'E-posta Bildirimleri',
                    subtitle: 'E-posta ile bildirimler',
                    value: profile.emailNotifications.value,
                    onChanged: (v) => profile.emailNotifications.value = v,
                  )),
              Obx(() => _SwitchItem(
                    icon: Icons.sms,
                    title: 'SMS Bildirimleri',
                    subtitle: 'SMS ile bildirimler',
                    value: profile.smsNotifications.value,
                    onChanged: (v) => profile.smsNotifications.value = v,
                  )),
              Obx(() => _SwitchItem(
                    icon: Icons.push_pin,
                    title: 'Push Bildirimleri',
                    subtitle: 'Anlık bildirimler',
                    value: profile.pushNotifications.value,
                    onChanged: (v) => profile.pushNotifications.value = v,
                  )),
            ]),
          SizedBox(height: 20.h),

          // Support & about
          _SettingsSection(children: [
            _SettingsItem(
              icon: Icons.support_agent,
              title: 'Destek & Yardım',
              subtitle: '7/24 müşteri hizmeti',
              onTap: profile.contactSupport,
            ),
            _SettingsItem(
              icon: Icons.info_outline,
              title: 'Hakkında',
              subtitle: 'Uygulama sürümü ve bilgileri',
              onTap: () => Get.snackbar('Sefernur', 'Sürüm 0.0.4+4', snackPosition: SnackPosition.BOTTOM),
            ),
          ]),
          SizedBox(height: 20.h),

          // Logout
          _LogoutTile(onTap: profile.logout),
          SizedBox(height: 16.h),

          // Delete Account
          _DeleteAccountTile(onTap: () => _showDeleteAccountDialog(context, profile)),
          SizedBox(height: 40.h),
        ],
      ),
    );
  }

  Future<void> _showDeleteAccountDialog(BuildContext context, profile) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28.sp),
            SizedBox(width: 12.w),
            Text('Hesabı Sil', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hesabınızı silmek üzeresiniz. Bu işlem:',
              style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 12.h),
            _DeleteWarningItem('Tüm kişisel verilerinizi siler'),
            _DeleteWarningItem('Rezervasyonlarınızı iptal eder'),
            _DeleteWarningItem('Yorumlarınızı kaldırır'),
            _DeleteWarningItem('Referans kazançlarınızı sıfırlar'),
            _DeleteWarningItem('Favorilerinizi siler'),
            SizedBox(height: 16.h),
            Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.red.shade700, size: 20.sp),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: Text(
                      'Bu işlem geri alınamaz!',
                      style: TextStyle(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.red.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('İptal', style: TextStyle(fontSize: 15.sp)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
            ),
            child: Text('Evet, Hesabımı Sil', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (result == true) {
      await profile.deleteAccount();
    }
  }

  void _showLanguageSheet(LanguageService languageService) {
    Get.bottomSheet(
      Container(
        padding: EdgeInsets.fromLTRB(20.w, 16.h, 20.w, 24.h),
        decoration: BoxDecoration(
          color: Get.theme.cardColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42.w,
              height: 5.h,
              margin: EdgeInsets.only(bottom: 16.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade400,
                borderRadius: BorderRadius.circular(4.r),
              ),
            ),
            Text('Dil Seçin', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600)),
            SizedBox(height: 12.h),
            ...languageService.languages.map((l) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.language, color: Get.theme.primaryColor),
                  title: Text(_displayLangName(l.name, l.locale)),
                  trailing: languageService.langCode.value == l.locale.languageCode
                      ? Icon(Icons.check_circle, color: Get.theme.primaryColor)
                      : null,
                  onTap: () {
                    languageService.changeLanguage(l.locale);
                    Get.back();
                  },
                )),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}

class _ReferralCard extends StatelessWidget {
  const _ReferralCard();
  @override
  Widget build(BuildContext context) {
  final referralService = Get.find<ReferralService>();
  final referralsCtrl = Get.find<ReferralsController>();
  final auth = Get.find<AuthService>();
  final isDark = Theme.of(context).brightness == Brightness.dark;
  // Yeşil arka plan üzerinde HER ZAMAN beyaz içerik
  const contentColor = Colors.white;
    final iban = auth.user.value.metadata?['withdrawIban'] as String?;
  final hasPending = referralService.userWithdrawals.any((w)=> w.status == ReferralEarningStatus.pending);
    final canWithdraw = referralService.availableBalance >= 100 && !hasPending && (iban != null && iban.isNotEmpty);
    return Obx(()=> Container(
        padding: EdgeInsets.all(16.w),
        margin: EdgeInsets.only(bottom: 20.h),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight, 
            colors: isDark 
                ? [Colors.green.shade600, Colors.green.shade900] // Karanlık: yeşilden koyu yeşile
                : [Colors.green.shade500, Colors.green.shade400], // Açık: yeşilden açık yeşile
          ),
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          Row(children:[
            Expanded(child: Text('Referans Kazançlarım', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600, color: contentColor))),
            TextButton.icon(
              style: TextButton.styleFrom(foregroundColor: contentColor),
              onPressed: () async {
                final newIban = await _editIbanDialog(context, initial: iban ?? '');
                if(newIban!=null){ final saved = await auth.saveIban(newIban); if(saved){ Get.snackbar('Başarılı','IBAN kaydedildi', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.green, colorText: Colors.white);} else { Get.snackbar('Hata','IBAN kaydedilemedi', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white);} }
              },
              icon: const Icon(Icons.account_balance),
              label: Text(iban==null||iban.isEmpty? 'IBAN Ekle':'IBAN'),
            )
          ]),
          SizedBox(height: 10.h),
          Row(children:[
            Expanded(child: _statTile('Çekilebilir', '${referralService.availableBalance.toStringAsFixed(2)} USD')),
            SizedBox(width: 12.w),
            Expanded(child: _statTile('Toplam Onaylı', referralService.totalEarnings.toStringAsFixed(2))),
          ]),
          SizedBox(height: 8.h),
          Row(children:[
            Expanded(child: _statTile('Bekleyen Ödül', referralService.pendingEarnings.toStringAsFixed(2))),
            SizedBox(width: 12.w),
            Expanded(child: _statTile('Bekleyen Çekim', referralService.totalWithdrawPending.toStringAsFixed(2))),
          ]),
          SizedBox(height: 14.h),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: canWithdraw 
                      ? Colors.white
                      : Colors.white24,
                  foregroundColor: canWithdraw
                      ? Colors.green.shade700
                      : Colors.white70,
                  padding: EdgeInsets.symmetric(vertical: 12.h),
                ),
                onPressed: canWithdraw? referralsCtrl.requestWithdrawal : () {
                  String reason = '';
                  if(iban==null||iban.isEmpty) reason = 'Lütfen önce IBAN ekleyin';
                  else if(hasPending) reason = 'Bekleyen bir çekim isteğiniz var';
                  else if(referralService.availableBalance < 100) reason = 'Minimum 100 USD bakiyeye ulaşmalısınız';
                  Get.snackbar('Çekilemez', reason, snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.orange, colorText: Colors.white);
                },
                icon: const Icon(Icons.payments_outlined),
                label: Text(hasPending? 'Onay Bekliyor' : 'Çekim Talep Et'),
              ),
            ),
            if(!canWithdraw) Padding(
              padding: EdgeInsets.only(top:8.h),
              child: Text(
                iban==null||iban.isEmpty? 'IBAN eklemeden çekim yapamazsınız.' : hasPending? 'Yeni talep için önce mevcut talebin sonuçlanmasını bekleyin.' : 'Minimum 100 USD çekim limiti.',
                style: TextStyle(fontSize: 11.sp, color: Colors.white70),
              ),
            ),
        ]))
    );
  }

  Widget _statTile(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: TextStyle(fontSize: 17.sp, fontWeight: FontWeight.bold, color: Colors.white)),
        SizedBox(height: 4.h),
        Text(label, style: TextStyle(fontSize: 11.sp, color: Colors.white70)),
      ],
    );
  }

  Future<String?> _editIbanDialog(BuildContext context, {required String initial}) async {
    final ctrl = TextEditingController(text: initial);
    return await showDialog<String>(context: context, builder: (c)=> AlertDialog(
      title: const Text('IBAN Bilgisi'),
      content: TextField(controller: ctrl, decoration: const InputDecoration(labelText: 'IBAN'), autofocus: true),
      actions: [
        TextButton(onPressed: ()=> Navigator.pop(c), child: const Text('İptal')),
        ElevatedButton(onPressed: (){ final val = ctrl.text.trim(); if(val.length < 15){ Get.snackbar('Hata','Geçersiz IBAN', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white); return;} Navigator.pop(c, val); }, child: const Text('Kaydet')),
      ],
    ));
  }
}

class _SettingsSection extends StatelessWidget {
  final List<Widget> children;
  const _SettingsSection({required this.children});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: [
          BoxShadow(color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1), blurRadius: 5, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(children: children),
    );
  }
}

class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final Widget? trailing;
  const _SettingsItem({required this.icon, required this.title, required this.subtitle, this.onTap, this.trailing});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // İkon her zaman yeşil
    final iconColor = Colors.green.shade600;
    return ListTile(
      leading: Icon(icon, color: iconColor, size: 24.sp),
      title: Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurfaceVariant)),
      trailing: trailing ?? (onTap != null ? Icon(Icons.arrow_forward_ios, size: 16.sp, color: theme.colorScheme.onSurfaceVariant) : null),
      onTap: onTap,
    );
  }
}

class _SwitchItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _SwitchItem({required this.icon, required this.title, required this.subtitle, required this.value, required this.onChanged});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    // İkon her zaman yeşil
    final iconColor = Colors.green.shade600;
    return ListTile(
      leading: Icon(icon, color: iconColor, size: 24.sp),
      title: Text(title, style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurfaceVariant)),
      trailing: Switch(
        value: value, 
        onChanged: onChanged, 
        activeThumbColor: Colors.green.shade600,
        activeTrackColor: Colors.green.shade300,
        inactiveThumbColor: isDark ? Colors.grey.shade300 : Colors.grey.shade400,
        inactiveTrackColor: isDark ? Colors.grey.shade600 : Colors.grey.shade300,
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),
    );
  }
}

class _LogoutTile extends StatelessWidget {
  final VoidCallback onTap;
  const _LogoutTile({required this.onTap});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: [
          BoxShadow(color: isDark ? Colors.black26 : Colors.grey.withOpacity(0.1), blurRadius: 5, offset: const Offset(0, 2)),
        ],
      ),
      child: ListTile(
        leading: Icon(Icons.logout, color: Colors.red, size: 24.sp),
        title: Text('Çıkış Yap', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: Colors.red)),
        subtitle: Text('Hesabınızdan güvenli çıkış yapın', style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurfaceVariant)),
        onTap: onTap,
      ),
    );
  }
}

class _DeleteAccountTile extends StatelessWidget {
  final VoidCallback onTap;
  const _DeleteAccountTile({required this.onTap});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.red.shade200, width: 1.5),
        boxShadow: [
          BoxShadow(color: isDark ? Colors.black26 : Colors.red.withOpacity(0.1), blurRadius: 5, offset: const Offset(0, 2)),
        ],
      ),
      child: ListTile(
        leading: Icon(Icons.delete_forever, color: Colors.red.shade700, size: 24.sp),
        title: Text('Hesabı Sil', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600, color: Colors.red.shade700)),
        subtitle: Text('Hesabınızı kalıcı olarak silin', style: TextStyle(fontSize: 12.sp, color: theme.colorScheme.onSurfaceVariant)),
        onTap: onTap,
      ),
    );
  }
}

class _DeleteWarningItem extends StatelessWidget {
  final String text;
  const _DeleteWarningItem(this.text);
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        children: [
          Icon(Icons.close, color: Colors.red.shade600, size: 18.sp),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 13.sp, color: theme.colorScheme.onSurfaceVariant),
            ),
          ),
        ],
      ),
    );
  }
}

// Maps a locale/code to its native display name for the Settings UI.
// Currently ensures Turkish shows as 'Türkçe'. Falls back to the provided name otherwise.
String _displayLangName(String fallback, Locale locale) {
  switch (locale.languageCode.toLowerCase()) {
    case 'tr':
      return 'Türkçe';
    default:
      // Extra safety: if the fallback literally says 'turkish', localize it.
      if (fallback.trim().toLowerCase() == 'turkish') return 'Türkçe';
      return fallback;
  }
}
