import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:sefernur/app/view/themes/theme.dart';

import '../../../../data/enums/blog_category.dart';
import '../../../../data/enums/place_city.dart';
import '../../../widgets/blog/blog_list_sheet.dart';
import '../../../widgets/campaign/campaign_create_sheet.dart';
import '../../../widgets/place/place_list_sheet.dart';

class AdminAddSheet extends StatelessWidget {
  const AdminAddSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final padding = media.viewInsets; // alt boşluk kaldırıldı
    return GestureDetector(
      onTap: () => Navigator.of(context).maybePop(),
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children: [
            // Blur backdrop
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                child: Container(color: Colors.black.withOpacity(.25)),
              ),
            ),
            // Sheet
            Align(
              alignment: Alignment.bottomCenter,
              child: Padding(padding: padding, child: _SheetBody()),
            ),
          ],
        ),
      ),
    );
  }
}

class _SheetBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final borderColor = isDark
        ? Colors.grey.shade700
        : AppColors.medinaGreen40.withOpacity(.15);
    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );
    return AnimatedContainer(
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeOutCubic,
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 640),
      decoration: BoxDecoration(
        borderRadius: radius,
        color: surfaceColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(.25),
            blurRadius: 32,
            offset: const Offset(0, 12),
          ),
        ],
        border: Border.all(color: borderColor, width: 1.1),
      ),
      child: ClipRRect(
        borderRadius: radius,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 10),
            _Handle(isDark: isDark),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 2, 20, 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sol renk şeridi
                  Container(
                    width: 5,
                    height: 46,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: isDark
                            ? [
                                AppColors.medinaGreen40,
                                AppColors.medinaGreen40.withOpacity(.6),
                              ]
                            : [
                                AppColors.medinaGreen40,
                                AppColors.medinaGreen40.withOpacity(.7),
                              ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'İçerik Ekle',
                          style: TextStyle(
                            fontSize: 21,
                            fontWeight: FontWeight.w700,
                            letterSpacing: .2,
                            color: isDark ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Ana sayfa modüllerine yeni içerik ekle',
                          style: TextStyle(
                            fontSize: 12.2,
                            letterSpacing: .15,
                            color: isDark
                                ? Colors.grey.shade400
                                : Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            _AdminAddList(isDark: isDark),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 0, 22, 24),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: isDark
                            ? Colors.grey.shade300
                            : Colors.grey.shade700,
                        side: BorderSide(
                          color: isDark
                              ? Colors.grey.shade600
                              : Colors.grey.shade400,
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text('Kapat'),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {},
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.medinaGreen40,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text('Devam'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Handle extends StatelessWidget {
  final bool isDark;
  const _Handle({this.isDark = false});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 48,
      height: 5,
      decoration: BoxDecoration(
        color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
        borderRadius: BorderRadius.circular(3),
      ),
    );
  }
}

class _AdminAddList extends StatelessWidget {
  final bool isDark;
  const _AdminAddList({this.isDark = false});
  @override
  Widget build(BuildContext context) {
    final items = [
      _AdminListTile(
        icon: Icons.local_offer_rounded,
        label: 'Kampanyalar',
        color: Colors.orange,
        isDark: isDark,
        onTap: () {
          Navigator.of(context).pop();
          // slight delay to allow pop animation
          Future.delayed(const Duration(milliseconds: 180), () {
            CampaignCreateSheet.show();
          });
        },
      ),
      _AdminListTile(
        icon: Icons.place_rounded,
        label: 'Mekke Gezilecek Yerler',
        color: Colors.teal,
        isDark: isDark,
        onTap: () {
          Navigator.of(context).pop();
          Future.delayed(const Duration(milliseconds: 160), () {
            PlaceListSheet.show(city: PlaceCity.mekke, showAll: true);
          });
        },
      ),
      _AdminListTile(
        icon: Icons.mosque_rounded,
        label: 'Medine Gezilecek Yerler',
        color: Colors.indigo,
        isDark: isDark,
        onTap: () {
          Navigator.of(context).pop();
          Future.delayed(const Duration(milliseconds: 160), () {
            PlaceListSheet.show(city: PlaceCity.medine, showAll: true);
          });
        },
      ),
      _AdminListTile(
        icon: Icons.menu_book_rounded,
        label: 'Hazırlık Rehberleri',
        color: Colors.pink,
        isDark: isDark,
        onTap: () {
          Navigator.of(context).pop();
          Future.delayed(const Duration(milliseconds: 160), () {
            BlogListSheet.show(category: BlogCategory.hazirlik, showAll: true);
          });
        },
      ),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
      child: Column(children: [for (var w in items) w]),
    );
  }
}

class _AdminListTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;
  const _AdminListTile({
    required this.icon,
    required this.label,
    required this.color,
    this.isDark = false,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    final bgOpacity = isDark ? .12 : .07;
    final borderOpacity = isDark ? .45 : .35;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            color: color.withOpacity(bgOpacity),
            border: Border.all(
              color: color.withOpacity(borderOpacity),
              width: 1,
            ),
          ),
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          child: Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [color, color.withOpacity(.65)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(.45),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    letterSpacing: .2,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: color.withOpacity(.9)),
            ],
          ),
        ),
      ),
    );
  }
}
