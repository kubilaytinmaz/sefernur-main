import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../controllers/profile/profile_controller.dart';
import '../../../../data/models/reservation/reservation_model.dart';
import '../../../../data/services/currency/currency_service.dart';
import '../../../../data/services/reservation/reservation_service.dart';
import '../../booking/webbeds_cancel_dialog.dart';
import 'shared/empty_state.dart';

class ReservationsTab extends GetView<ProfileController> {
  const ReservationsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final service = Get.find<ReservationService>();
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _FilterChips(service: service),
          SizedBox(height: 16.h),
          Expanded(
            child: Obx(() {
              if (service.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              if (service.filtered.isEmpty) {
                return const EmptyState(
                  message: 'Henüz rezervasyonunuz bulunmuyor',
                  icon: Icons.bookmark_border,
                );
              }
              return ListView.builder(
                padding: EdgeInsets.only(bottom: 12.h),
                itemCount: service.filtered.length,
                itemBuilder: (context, index) {
                  final r = service.filtered[index];
                  return _ReservationCard(
                    model: r,
                    onTap: () => _showReservationDetail(context, r, service),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String text;
  final Color color;
  const _Chip({required this.text, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _ReservationCard extends StatelessWidget {
  final ReservationModel model;
  final VoidCallback onTap;
  const _ReservationCard({required this.model, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12.r),
      child: Container(
        margin: EdgeInsets.only(bottom: 16.h),
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16.r),
          border: Border.all(
            color: Colors.green.shade600.withOpacity(0.18),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: isDark
                  ? Colors.black26
                  : Colors.green.shade600.withOpacity(0.06),
              blurRadius: 14,
              spreadRadius: 1,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _Chip(
                  text: _labelForType(model.type),
                  color: Colors.green.shade600,
                ),
                _Chip(
                  text: _statusLabel(model.status),
                  color: _statusColor(model.status),
                ),
              ],
            ),
            SizedBox(height: 12.h),
            Text(
              model.title,
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (model.subtitle.isNotEmpty) ...[
              SizedBox(height: 6.h),
              Text(
                model.subtitle,
                style: TextStyle(
                  fontSize: 12.sp,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            SizedBox(height: 8.h),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16.sp,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                SizedBox(width: 4.w),
                Text(
                  _dateRange(model.startDate, model.endDate),
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            SizedBox(height: 10.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Obx(() {
                  final currencyService = Get.find<CurrencyService>();
                  return Text(
                    model.currency == 'USD'
                        ? currencyService.currentRate.value.formatBoth(
                            model.price,
                          )
                        : '${NumberFormat('#,###', 'tr_TR').format(model.price)} ${model.currency}',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.green.shade600,
                    ),
                  );
                }),
                Row(
                  children: [
                    TextButton.icon(
                      onPressed: onTap,
                      icon: const Icon(Icons.info_outline, size: 16),
                      label: const Text('Detay'),
                    ),
                    const Icon(
                      Icons.chevron_right,
                      size: 18,
                      color: Colors.grey,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  static String _labelForType(ReservationType t) {
    switch (t) {
      case ReservationType.hotel:
        return 'Otel';
      case ReservationType.car:
        return 'Araç';
      case ReservationType.transfer:
        return 'Transfer';
      case ReservationType.guide:
        return 'Rehber';
      case ReservationType.tour:
        return 'Tur';
    }
  }

  static String _statusLabel(String s) {
    switch (s) {
      case 'confirmed':
        return 'Onaylandı';
      case 'pending':
        return 'Beklemede';
      case 'cancelled':
        return 'İptal';
      case 'completed':
        return 'Tamamlandı';
      default:
        return s;
    }
  }

  static String _dateRange(DateTime a, DateTime b) {
    final f = DateFormat('dd/MM/yyyy');
    if (a.isAtSameMomentAs(b)) return f.format(a);
    return '${f.format(a)} - ${f.format(b)}';
  }

  static Color _statusColor(String s) {
    switch (s) {
      case 'confirmed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      case 'completed':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}

class _FilterChips extends StatelessWidget {
  final ReservationService service;
  const _FilterChips({required this.service});
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // label, type, statusKey
    // (label, type, statusKey) where type null & statusKey null => all
    final entries = <(String, ReservationType?, String?)>[
      ('Tümü', null, null),
      ('Otel', ReservationType.hotel, null),
      ('Araç', ReservationType.car, null),
      ('Transfer', ReservationType.transfer, null),
      ('Rehber', ReservationType.guide, null),
      ('Tur', ReservationType.tour, null),
      ('İptal edilenler', null, 'cancelled'),
    ];
    return Obx(() {
      return SizedBox(
        height: 36.h,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: EdgeInsets.zero,
          child: Row(
            children: [
              for (final e in entries) ...[
                _buildChip(
                  theme: theme,
                  label: e.$1,
                  type: e.$2,
                  statusKey: e.$3,
                  selected: e.$3 == 'cancelled'
                      ? service.statusFilter.value == 'cancelled'
                      : service.statusFilter.value == null &&
                            service.activeFilter.value == e.$2,
                ),
                SizedBox(width: 6.w),
              ],
            ],
          ),
        ),
      );
    });
  }

  Widget _buildChip({
    required ThemeData theme,
    required String label,
    required ReservationType? type,
    required String? statusKey,
    required bool selected,
  }) {
    final isDark = theme.brightness == Brightness.dark;
    return InkWell(
      borderRadius: BorderRadius.circular(18.r),
      onTap: () {
        if (statusKey == 'cancelled') {
          service.setStatusFilter('cancelled');
          service.setFilter(null);
        } else {
          service.setStatusFilter(null);
          service.setFilter(type);
        }
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: selected
              ? Colors.green.shade600
              : (isDark
                    ? theme.colorScheme.surfaceContainerHigh
                    : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(18.r),
          border: Border.all(
            color: selected
                ? Colors.green.shade600
                : (isDark ? theme.colorScheme.outline : Colors.grey.shade300),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (selected) ...[
              Icon(Icons.check, size: 14.sp, color: Colors.white),
              SizedBox(width: 4.w),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
                color: selected ? Colors.white : theme.colorScheme.onSurface,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Bottom sheet detail
void _showReservationDetail(
  BuildContext context,
  ReservationModel model,
  ReservationService service,
) {
  final theme = Theme.of(context);
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: theme.colorScheme.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
    ),
    builder: (_) {
      final canCancel =
          (model.status == 'pending' || model.status == 'confirmed');
      final dateRange = _ReservationCard._dateRange(
        model.startDate,
        model.endDate,
      );
      return DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.78,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  margin: EdgeInsets.only(bottom: 12.h),
                  decoration: BoxDecoration(
                    color: theme.brightness == Brightness.dark
                        ? Colors.grey.shade600
                        : Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              Row(
                children: [
                  Icon(Icons.bookmark, color: Colors.green.shade600),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: Text(
                      model.title,
                      style: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                  _Chip(
                    text: _ReservationCard._statusLabel(model.status),
                    color: _ReservationCard._statusColor(model.status),
                  ),
                ],
              ),
              SizedBox(height: 8.h),
              Text(
                model.subtitle,
                style: TextStyle(
                  fontSize: 13.sp,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              SizedBox(height: 16.h),
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _sectionTitle('Rezervasyon Bilgileri'),
                      _infoRow(
                        Icons.category_outlined,
                        'Hizmet',
                        _ReservationCard._labelForType(model.type),
                      ),
                      _infoRow(Icons.calendar_today, 'Tarih', dateRange),
                      _infoRow(Icons.groups, 'Kişi', model.people.toString()),
                      _infoRow(
                        Icons.confirmation_number_outlined,
                        'Adet',
                        model.quantity.toString(),
                      ),
                      _infoRow(
                        Icons.monetization_on_outlined,
                        'Ücret',
                        '${model.price.toStringAsFixed(2)} ${model.currency}',
                      ),
                      if (model.notes != null && model.notes!.trim().isNotEmpty)
                        _infoRow(Icons.note_outlined, 'Not', model.notes!),
                      SizedBox(height: 20.h),
                      _sectionTitle('İletişim'),
                      _ContactButtons(meta: model.meta),
                      SizedBox(height: 24.h),
                    ],
                  ),
                ),
              ),
              SafeArea(
          bottom: false,
                top: false,
                child: Row(
                  children: [
                    Expanded(
                      child: _BottomActionButton(
                        label: canCancel ? 'İptal Et' : 'İptal Edilemez',
                        icon: Icons.cancel_outlined,
                        gradient: canCancel
                            ? LinearGradient(
                                colors: [
                                  Colors.red.shade400,
                                  Colors.red.shade600,
                                ],
                              )
                            : null,
                        color: canCancel ? null : Colors.grey.shade300,
                        foreground: canCancel
                            ? Colors.white
                            : Colors.grey.shade600,
                        onTap: canCancel
                            ? () => _confirmCancel(context, service, model)
                            : null,
                      ),
                    ),
                    SizedBox(width: 12.w),
                    Expanded(
                      child: _BottomActionButton(
                        label: 'Kapat',
                        icon: Icons.close_rounded,
                        gradient: LinearGradient(
                          colors: [
                            Colors.green.shade600,
                            Colors.green.shade700,
                          ],
                        ),
                        foreground: Colors.white,
                        onTap: () => Navigator.of(context).pop(),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

Widget _sectionTitle(String text) => Builder(
  builder: (context) => Padding(
    padding: EdgeInsets.only(bottom: 8.h),
    child: Text(
      text,
      style: TextStyle(
        fontSize: 15.sp,
        fontWeight: FontWeight.w600,
        color: Theme.of(context).colorScheme.onSurface,
      ),
    ),
  ),
);

Widget _infoRow(IconData icon, String label, String value) => Builder(
  builder: (context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: 10.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18.sp, color: theme.colorScheme.onSurfaceVariant),
          SizedBox(width: 10.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12.sp,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                SizedBox(height: 2.h),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  },
);

class _ContactButtons extends StatelessWidget {
  final Map<String, dynamic> meta;
  const _ContactButtons({required this.meta});

  @override
  Widget build(BuildContext context) {
    final phone = meta['providerPhone']?.toString();
    final email = meta['providerEmail']?.toString();
    final whatsapp = meta['providerWhatsapp']?.toString();
    final website = meta['providerWebsite']?.toString();
    final buttons = <Widget>[];
    if (phone != null && phone.isNotEmpty) {
      buttons.add(
        _contactBtn(
          Icons.call,
          'Ara',
          () => _launchUri(Uri.parse('tel:$phone')),
        ),
      );
    }
    if (whatsapp != null && whatsapp.isNotEmpty) {
      final normalized = whatsapp.replaceAll('+', '');
      buttons.add(
        _contactBtn(
          Icons.chat,
          'WhatsApp',
          () => _launchUri(Uri.parse('https://wa.me/$normalized')),
        ),
      );
    }
    if (email != null && email.isNotEmpty) {
      buttons.add(
        _contactBtn(
          Icons.email_outlined,
          'E-posta',
          () => _launchUri(Uri.parse('mailto:$email')),
        ),
      );
    }
    if (website != null && website.isNotEmpty) {
      buttons.add(
        _contactBtn(
          Icons.language,
          'Site',
          () => _launchUri(
            Uri.parse(
              website.startsWith('http') ? website : 'https://$website',
            ),
          ),
        ),
      );
    }
    if (buttons.isEmpty) {
      return Builder(
        builder: (context) => Text(
          'Sağlayıcı iletişim bilgisi yok',
          style: TextStyle(
            fontSize: 12.sp,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      );
    }
    return Wrap(spacing: 8.w, runSpacing: 8.h, children: buttons);
  }

  Widget _contactBtn(IconData icon, String label, VoidCallback onTap) =>
      OutlinedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 16),
        label: Text(label),
        style: OutlinedButton.styleFrom(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      );
}

// _StatusFilterBar removed; integrated 'İptal' into main chips.
class _BottomActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final LinearGradient? gradient;
  final Color? color;
  final Color foreground;
  final VoidCallback? onTap;
  const _BottomActionButton({
    required this.label,
    required this.icon,
    this.gradient,
    this.color,
    required this.foreground,
    this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    final bg = gradient == null ? color ?? Colors.grey.shade300 : null;
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: onTap == null ? 0.6 : 1,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16.r),
        child: Ink(
          decoration: BoxDecoration(
            gradient: gradient,
            color: bg,
            borderRadius: BorderRadius.circular(16.r),
            boxShadow: [
              if (onTap != null && gradient != null)
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
            ],
          ),
          padding: EdgeInsets.symmetric(vertical: 14.h, horizontal: 12.w),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18.sp, color: foreground),
              SizedBox(width: 6.w),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w600,
                  color: foreground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> _launchUri(Uri uri) async {
  try {
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      Get.snackbar(
        'Hata',
        'Açılamadı: ${uri.toString()}',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  } catch (e) {
    Get.snackbar(
      'Hata',
      'Başlatılamadı: $e',
      snackPosition: SnackPosition.BOTTOM,
    );
  }
}

void _confirmCancel(
  BuildContext context,
  ReservationService service,
  ReservationModel model,
) {
  // WebBeds rezervasyonu mu kontrol et
  final isWebBeds =
      model.meta['source'] == 'webbeds' &&
      model.meta['webbedsBookingCode'] != null;

  if (isWebBeds) {
    // WebBeds rezervasyonu için özel iptal dialog'u
    _confirmWebBedsCancel(context, model);
  } else {
    // Normal Firebase rezervasyonu için basit iptal
    _confirmLocalCancel(context, service, model);
  }
}

/// WebBeds rezervasyonu iptal et - Müşteri hizmetlerine yönlendir
void _confirmWebBedsCancel(BuildContext context, ReservationModel model) async {
  // Dialog'u göster (artık sadece müşteri hizmetlerine yönlendiriyor)
  await WebBedsCancelDialog.show(model);
}

/// Normal (Firebase) rezervasyonu iptal et - Müşteri hizmetlerine yönlendir
void _confirmLocalCancel(
  BuildContext context,
  ReservationService service,
  ReservationModel model,
) {
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
          // Bilgi mesajı
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
          // Rezervasyon bilgisi
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(model.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(
                  '${model.startDate.day}.${model.startDate.month}.${model.startDate.year} - ${model.endDate.day}.${model.endDate.month}.${model.endDate.year}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
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
          onPressed: () async {
            Get.back();
            // WhatsApp'a yönlendir
            final message = 'Merhaba, rezervasyon iptal talebim var.\n\n'
                'Rezervasyon: ${model.title}\n'
                'Tarih: ${model.startDate.day}.${model.startDate.month}.${model.startDate.year}';
            final url = Uri.parse('https://wa.me/905551234567?text=${Uri.encodeComponent(message)}');
            try {
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            } catch (e) {
              Get.snackbar('Hata', 'WhatsApp açılamadı', snackPosition: SnackPosition.BOTTOM);
            }
          },
          icon: const Icon(Icons.chat, size: 18),
          label: const Text('WhatsApp'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
          ),
        ),
      ],
    ),
  );
}
