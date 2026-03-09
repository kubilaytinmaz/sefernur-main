import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/enums/place_city.dart';
import '../../../data/enums/role_type.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/place/place_service.dart';
import '../../themes/colors/app_colors.dart';
import 'place_create_sheet.dart';
import 'place_detail_sheet.dart';

class PlaceListSheet extends StatefulWidget {
  final PlaceCity city;
  final bool showAll;
  const PlaceListSheet({super.key, required this.city, this.showAll = false});

  static Future<void> show({
    required PlaceCity city,
    bool showAll = false,
  }) async {
    Get.bottomSheet(
      PlaceListSheet(city: city, showAll: showAll),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  State<PlaceListSheet> createState() => _PlaceListSheetState();
}

class _PlaceListSheetState extends State<PlaceListSheet> {
  bool _onlyActive = true;
  static const bool _adminFilterGatingEnabled = false;

  bool get _isAdmin {
    if (!Get.isRegistered<AuthService>()) return false;
    final roles = Get.find<AuthService>().user.value.roles;
    return roles != null && roles.contains(RoleType.admin);
  }

  @override
  void initState() {
    super.initState();
    if (widget.showAll) {
      Future.microtask(
        () => Get.find<PlaceService>().fetchAll(city: widget.city),
      );
    } else {
      Future.microtask(
        () => Get.find<PlaceService>().fetchActive(city: widget.city),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;
    final cardColor = isDark ? const Color(0xFF2D2D2D) : Colors.white;
    final cardBorderColor = isDark ? Colors.grey.shade700 : Colors.black.withOpacity(.06);

    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );

    final service = Get.find<PlaceService>();
    final showActiveSwitch = !widget.showAll && (!_adminFilterGatingEnabled || _isAdmin);

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
          child: Column(
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
                        '${widget.city.label} Yerler',
                        style: TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.w700,
                          color: textColor,
                        ),
                      ),
                    ),
                    if (_isAdmin)
                      IconButton(
                        onPressed: () {
                          Navigator.of(context).pop();
                          Future.delayed(
                            const Duration(milliseconds: 120),
                            () => PlaceCreateSheet.show(widget.city),
                          );
                        },
                        icon: Icon(
                          Icons.add_circle_outline,
                          color: AppColors.medinaGreen40,
                        ),
                      ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close_rounded, color: subtitleColor),
                    ),
                  ],
                ),
              ),
              // Active filter
              if (showActiveSwitch && _isAdmin)
                SwitchListTile(
                  value: _onlyActive,
                  onChanged: (v) => setState(() => _onlyActive = v),
                  dense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                  title: Text('Sadece aktif', style: TextStyle(color: textColor)),
                  activeThumbColor: AppColors.medinaGreen40,
                ),
              // List
              Expanded(
                child: Obx(() {
                  final source = widget.showAll
                      ? service.allByCity(widget.city)
                      : service.activeByCity(widget.city);
                  final list = source.where((p) {
                    if (!widget.showAll && _onlyActive && !p.isActive) {
                      return false;
                    }
                    return true;
                  }).toList()
                    ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

                  if (widget.showAll &&
                      service.isLoadingAll.value &&
                      source.isEmpty) {
                    return Center(
                      child: CircularProgressIndicator(
                        color: AppColors.medinaGreen40,
                      ),
                    );
                  }
                  if (!widget.showAll &&
                      service.isLoading.value &&
                      source.isEmpty) {
                    return Center(
                      child: CircularProgressIndicator(
                        color: AppColors.medinaGreen40,
                      ),
                    );
                  }
                  if (list.isEmpty) {
                    return Center(
                      child: Text(
                        'İçerik yok',
                        style: TextStyle(color: subtitleColor),
                      ),
                    );
                  }

                  return ListView.separated(
                    controller: scrollController,
                    padding: EdgeInsets.fromLTRB(
                      12,
                      8,
                      12,
                      18 + MediaQuery.of(context).viewPadding.bottom,
                    ),
                    itemBuilder: (_, i) {
                      final m = list[i];
                      final thumb = m.images.isNotEmpty ? m.images.first : null;
                      return InkWell(
                        onTap: () => PlaceDetailSheet.show(m),
                        borderRadius: BorderRadius.circular(20),
                        child: Ink(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            color: cardColor,
                            border: Border.all(color: cardBorderColor),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(20),
                                  bottomLeft: Radius.circular(20),
                                ),
                                child: SizedBox(
                                  width: 86,
                                  height: 86,
                                  child: thumb == null
                                      ? Container(
                                          color: isDark
                                              ? Colors.grey.shade800
                                              : Colors.black12,
                                        )
                                      : Image.network(
                                          thumb,
                                          fit: BoxFit.cover,
                                        ),
                                ),
                              ),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                    14,
                                    10,
                                    6,
                                    10,
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        m.title,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: textColor,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        m.shortDescription,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 12.5,
                                          height: 1.25,
                                          color: subtitleColor,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Wrap(
                                        spacing: 6,
                                        runSpacing: 4,
                                        children: [
                                          _tag(m.city.label, isDark),
                                          if (!m.isActive)
                                            _tag(
                                              'Pasif',
                                              isDark,
                                              color: Colors.grey.shade600,
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              Icon(
                                Icons.chevron_right,
                                color: subtitleColor,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemCount: list.length,
                  );
                }),
              ),
            ],
          ),
        );
      },
    );
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
