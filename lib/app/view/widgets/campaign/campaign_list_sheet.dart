import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/enums/campaign_type.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/campaign/campaign_service.dart';
import '../../themes/colors/app_colors.dart';
import 'campaign_detail_sheet.dart';

class CampaignListSheet extends StatefulWidget {
  final bool showAll;
  const CampaignListSheet({super.key, this.showAll = false});

  static Future<void> show({bool showAll = false}) async {
    Get.bottomSheet(
      CampaignListSheet(showAll: showAll),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  State<CampaignListSheet> createState() => _CampaignListSheetState();
}

class _CampaignListSheetState extends State<CampaignListSheet> {
  CampaignType? _filterType;
  bool _onlyActive = true;

  @override
  void initState() {
    super.initState();
    if (widget.showAll) {
      Future.microtask(() => Get.find<CampaignService>().fetchAll());
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final cardColor = isDark ? const Color(0xFF2D2D2D) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;
    final borderColor = isDark ? Colors.grey.shade700 : Colors.grey.shade300;

    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );

    final service = Get.find<CampaignService>();
    final userId = Get.isRegistered<AuthService>() &&
            Get.find<AuthService>().user.value.id != null
        ? Get.find<AuthService>().user.value.id!
        : 'anonymous';

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
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
              _Header(
                onClose: () => Navigator.of(context).maybePop(),
                isDark: isDark,
                textColor: textColor,
                subtitleColor: subtitleColor,
              ),
              if (!widget.showAll)
                _Filters(
                  filterType: _filterType,
                  onlyActive: _onlyActive,
                  onTypeChanged: (t) => setState(() => _filterType = t),
                  onOnlyActiveChanged: (v) => setState(() => _onlyActive = v),
                  isDark: isDark,
                  textColor: textColor,
                ),
              Expanded(
                child: Obx(() {
                  final source =
                      widget.showAll ? service.allCampaigns : service.campaigns;
                  final list = source.where((c) {
                    if (!widget.showAll) {
                      if (_onlyActive && !c.isActive) return false;
                      if (_filterType != null && c.type != _filterType) {
                        return false;
                      }
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
                  if (list.isEmpty) {
                    return Center(
                      child: Text(
                        'Kampanya bulunamadı',
                        style: TextStyle(color: subtitleColor),
                      ),
                    );
                  }
                  return ListView.separated(
                    controller: scrollController,
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 18),
                    itemBuilder: (_, i) {
                      final m = list[i];
                      final isNet = m.imageUrl.startsWith('http');
                      final saved = m.savedByUserIds.contains(userId);
                      return InkWell(
                        onTap: () => CampaignDetailSheet.show(m),
                        borderRadius: BorderRadius.circular(20),
                        child: Ink(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            color: cardColor,
                            border: Border.all(
                              color: borderColor.withOpacity(0.5),
                            ),
                          ),
                          child: Row(
                            children: [
                              Hero(
                                tag: 'cmp_${m.id}',
                                child: ClipRRect(
                                  borderRadius: const BorderRadius.only(
                                    topLeft: Radius.circular(20),
                                    bottomLeft: Radius.circular(20),
                                  ),
                                  child: SizedBox(
                                    width: 86,
                                    height: 86,
                                    child: isNet
                                        ? Image.network(
                                            m.imageUrl,
                                            fit: BoxFit.cover,
                                          )
                                        : Image.asset(
                                            m.imageUrl,
                                            fit: BoxFit.cover,
                                          ),
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
                                      const SizedBox(height: 4),
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
                                      Row(
                                        children: [
                                          _tag(m.type.label, isDark: isDark),
                                          if (!m.isActive) ...[
                                            const SizedBox(width: 6),
                                            _tag(
                                              'Pasif',
                                              color: Colors.grey.shade600,
                                              isDark: isDark,
                                            ),
                                          ],
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              IconButton(
                                onPressed: () => service.toggleSave(m),
                                icon: Icon(
                                  saved
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                  color: saved
                                      ? Colors.redAccent
                                      : subtitleColor,
                                ),
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

  Widget _tag(String label, {Color? color, required bool isDark}) {
    final c = color ?? AppColors.medinaGreen40;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withOpacity(isDark ? .2 : .08),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: c.withOpacity(.45)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10.5,
          fontWeight: FontWeight.w600,
          color: isDark ? c.withOpacity(0.9) : c.darken(.4),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final VoidCallback onClose;
  final bool isDark;
  final Color textColor;
  final Color subtitleColor;

  const _Header({
    required this.onClose,
    required this.isDark,
    required this.textColor,
    required this.subtitleColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Drag handle
        Center(
          child: Container(
            width: 48,
            height: 5,
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 6, 6, 4),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  'Kampanyalar',
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ),
              IconButton(
                onPressed: onClose,
                icon: Icon(Icons.close_rounded, color: subtitleColor),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Filters extends StatelessWidget {
  final CampaignType? filterType;
  final bool onlyActive;
  final ValueChanged<CampaignType?> onTypeChanged;
  final ValueChanged<bool> onOnlyActiveChanged;
  final bool isDark;
  final Color textColor;

  const _Filters({
    required this.filterType,
    required this.onlyActive,
    required this.onTypeChanged,
    required this.onOnlyActiveChanged,
    required this.isDark,
    required this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                FilterChip(
                  label: Text('Hepsi', style: TextStyle(color: filterType == null ? Colors.white : textColor)),
                  selected: filterType == null,
                  selectedColor: AppColors.medinaGreen40,
                  checkmarkColor: Colors.white,
                  backgroundColor: isDark ? const Color(0xFF2D2D2D) : Colors.grey.shade100,
                  onSelected: (_) => onTypeChanged(null),
                ),
                const SizedBox(width: 6),
                for (final t in CampaignType.values) ...[
                  FilterChip(
                    label: Text(t.label, style: TextStyle(color: filterType == t ? Colors.white : textColor)),
                    selected: filterType == t,
                    selectedColor: AppColors.medinaGreen40,
                    checkmarkColor: Colors.white,
                    backgroundColor: isDark ? const Color(0xFF2D2D2D) : Colors.grey.shade100,
                    onSelected: (_) => onTypeChanged(t),
                  ),
                  const SizedBox(width: 6),
                ],
              ],
            ),
          ),
          SwitchListTile(
            value: onlyActive,
            onChanged: onOnlyActiveChanged,
            contentPadding: EdgeInsets.zero,
            dense: true,
            activeThumbColor: AppColors.medinaGreen40,
            title: Text(
              'Sadece aktif kampanyalar',
              style: TextStyle(color: textColor),
            ),
          ),
        ],
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
