import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/enums/place_city.dart';
import '../../../data/models/place/place_model.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/place/place_service.dart';
import '../../themes/colors/app_colors.dart';
import 'place_edit_sheet.dart';

class PlaceDetailSheet extends StatelessWidget {
  final PlaceModel model;
  const PlaceDetailSheet({super.key, required this.model});

  static Future<void> show(PlaceModel model) async {
    Get.bottomSheet(
      PlaceDetailSheet(model: model),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;

    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Material(
          color: surfaceColor,
          borderRadius: radius,
          clipBehavior: Clip.antiAlias,
          elevation: 8,
          child: _Body(model: model, scrollController: scrollController),
        );
      },
    );
  }
}

class _Body extends StatefulWidget {
  final PlaceModel model;
  final ScrollController scrollController;
  const _Body({required this.model, required this.scrollController});

  @override
  State<_Body> createState() => _BodyState();
}

class _BodyState extends State<_Body> {
  int _page = 0;
  bool get _isAdmin => Get.find<AuthService>().isUserAdmin();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;

    final m = widget.model;
    final service = Get.find<PlaceService>();
    final live = service.allPlaces.firstWhereOrNull((p) => p.id == m.id) ??
        service.activePlaces.firstWhereOrNull((p) => p.id == m.id) ??
        m;

    return Column(
      children: [
        // Drag handle
        Center(
          child: Container(
            width: 48,
            height: 5,
            margin: const EdgeInsets.only(top: 14, bottom: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
        ),
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 4, 6, 4),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  live.title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: Icon(Icons.close_rounded, color: subtitleColor),
              ),
            ],
          ),
        ),
        // Image carousel
        AspectRatio(
          aspectRatio: 16 / 9,
          child: Stack(
            children: [
              PageView.builder(
                itemCount: live.images.length,
                onPageChanged: (i) => setState(() => _page = i),
                itemBuilder: (_, i) {
                  final url = live.images[i];
                  return Image.network(url, fit: BoxFit.cover);
                },
              ),
              if (live.images.length > 1)
                Positioned(
                  bottom: 8,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (var i = 0; i < live.images.length; i++)
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: i == _page ? Colors.white : Colors.white54,
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        // Content
        Expanded(
          child: SingleChildScrollView(
            controller: widget.scrollController,
            padding: EdgeInsets.fromLTRB(
              18,
              14,
              18,
              18 + MediaQuery.of(context).viewPadding.bottom,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    _tag(live.city.label, isDark),
                    const SizedBox(width: 8),
                    if (!live.isActive)
                      _tag('Pasif', isDark, color: Colors.grey.shade600),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  live.shortDescription,
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  live.longDescription,
                  style: TextStyle(
                    height: 1.5,
                    fontSize: 15,
                    color: subtitleColor,
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _openMap(live),
                        icon: const Icon(Icons.map_rounded),
                        label: const Text('Konuma Git'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.medinaGreen40,
                          side: BorderSide(
                            color: AppColors.medinaGreen40.withOpacity(.6),
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    if (_isAdmin)
                      ElevatedButton.icon(
                        onPressed: () => PlaceEditSheet.show(live),
                        icon: const Icon(Icons.edit),
                        label: const Text('Düzenle'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.medinaGreen40,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 18,
                            vertical: 12,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _openMap(PlaceModel live) async {
    final raw = live.locationUrl?.trim();
    Uri? target;
    if (raw != null && raw.isNotEmpty) {
      try {
        target = Uri.parse(raw);
      } catch (_) {
        target = null;
      }
    }
    if (target == null) {
      final query = Uri.encodeComponent(live.title);
      target = Uri.parse('https://www.google.com/maps/search/?api=1&query=$query');
    }
    final ok = await canLaunchUrl(target);
    if (ok) {
      await launchUrl(target, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        Get.snackbar(
          'Harita',
          'Uygulama açılamadı',
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    }
  }

  Widget _tag(String label, bool isDark, {Color? color}) {
    final c = color ?? AppColors.medinaGreen40;
    final bgOpacity = isDark ? .15 : .08;
    final borderOpacity = isDark ? .5 : .45;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withOpacity(bgOpacity),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: c.withOpacity(borderOpacity)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w600,
          color: isDark ? c.withOpacity(.9) : c.darken(.4),
        ),
      ),
    );
  }
}

extension _ColorX on Color {
  Color darken([double amount = .35]) {
    final f = 1 - amount;
    return Color.fromARGB(
      alpha,
      (red * f).round(),
      (green * f).round(),
      (blue * f).round(),
    );
  }
}
