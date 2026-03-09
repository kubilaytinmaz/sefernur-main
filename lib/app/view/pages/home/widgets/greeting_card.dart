import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

import '../../../../controllers/home/home_controller.dart';
import '../../../../controllers/main/main_controller.dart';
import '../../../../data/models/campaign/campaign_model.dart';
import '../../../../data/services/auth/auth_service.dart';
import '../../../../data/services/campaign/campaign_service.dart';
import '../../../../data/services/favorite/favorite_service.dart';
import '../../../themes/theme.dart';
import '../../../widgets/campaign/campaign_detail_sheet.dart';
import '../../../widgets/campaign/campaign_list_sheet.dart';

/// Yeniden tasarlanan üst header: Tam genişlik, yüksek alan + kampanya slider.
class GreetingCard extends GetView<HomeController> {
  const GreetingCard({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    const height =
        340.0; // daha fazla alan (kart içerikleri üst üste binmemesi için)
    return SizedBox(
      height: height,
      child: Stack(
        children: [
          // Arka plan gradient - üstte açık, altta koyu
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: isDark ? [
                  AppColors.medinaGreen40,
                  AppColors.medinaGreen30,
                ] : [
                  AppColors.medinaGreen40,
                  AppColors.medinaGreen50,
                ],
              ),
            ),
          ),
          // Üst içerik (kullanıcı selamlama)
          SafeArea(
          bottom: false,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            // Profil sekmesine yönlendir
                            Get.find<MainController>().changeTabIndex(5);
                          },
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Obx(() {
                                String greet = 'Hayırlı Günler';
                                try {
                                  if (Get.isRegistered<AuthService>()) {
                                    final u =
                                        Get.find<AuthService>().user.value;
                                    final first = (u.firstName ?? '').trim();
                                    if (first.isEmpty) {
                                      // If user has no recorded name but is logged in (has id), encourage completion
                                      if ((u.id ?? '').isNotEmpty) {
                                        greet = 'İsminizi Ekleyin';
                                      }
                                    } else {
                                      greet = 'Merhaba $first';
                                    }
                                  }
                                } catch (_) {}
                                return Text(
                                  greet,
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(.85),
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                );
                              }),
                              const SizedBox(height: 4),
                              Obx(() {
                                final name = _userName();
                                return Text(
                                  name,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                    letterSpacing: .4,
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                      ),
                      _campaignCountChip(isDark),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                // Slider alanı
                Expanded(child: _CampaignSlider()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _userName() {
    try {
      if (Get.isRegistered<AuthService>()) {
        final auth = Get.find<AuthService>();
        final u = auth.user.value;
        if ((u.id ?? '').isEmpty) return '...';
        if (u.firstName?.trim().isNotEmpty ?? false) return u.firstName!.trim();
        if (u.fullName?.trim().isNotEmpty ?? false)
          return u.fullName!.trim().split(' ').first;
        if (u.username?.trim().isNotEmpty ?? false) return u.username!.trim();
        if (u.email?.trim().isNotEmpty ?? false)
          return u.email!.split('@').first;
        if (u.phoneNumber?.trim().isNotEmpty ?? false) {
          final p = u.phoneNumber!;
          return p.length > 4 ? '***${p.substring(p.length - 4)}' : p;
        }
      }
    } catch (_) {}
    return 'Ziyaretçi';
  }

  Widget _campaignCountChip(bool isDark) {
    final campaignService = Get.find<CampaignService>();
    return Obx(() {
      final total = campaignService.campaigns.length;
      return AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.black.withOpacity(.2)
              : Colors.white.withOpacity(.15),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.local_offer, size: 18, color: Colors.white),
            const SizedBox(width: 6),
            Text(
              '$total kampanya',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    });
  }
}

class _CampaignSlider extends StatefulWidget {
  @override
  State<_CampaignSlider> createState() => _CampaignSliderState();
}

class _CampaignSliderState extends State<_CampaignSlider> {
  late final PageController _pageController;
  int _index = 0; // varsayılan ilk
  int _lastLen = -1; // yeniden ayarlama kontrolü

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: .88, initialPage: 0);
    // İlk yüklemede mevcut uzunluğa göre başlangıç sayfasını ayarla
    WidgetsBinding.instance.addPostFrameCallback((_) => _adjustInitialIndex());
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final campaignService = Get.find<CampaignService>();
    return Obx(() {
      final dynamicList = campaignService.campaigns;
      // limit to first 3
      final List items = dynamicList.take(3).toList();
      _scheduleAdjustIfNeeded(items.length);
      if (items.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.local_offer_outlined,
                size: 48,
                color: Colors.white.withOpacity(.85),
              ),
              const SizedBox(height: 12),
              const Text(
                'Henüz kampanya yok',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Yeni kampanyalar eklendiğinde burada görünecek',
                style: TextStyle(
                  color: Colors.white.withOpacity(.8),
                  fontSize: 12.5,
                ),
              ),
            ],
          ),
        );
      }
      // Tek kampanya: ortala ve sayfa göstergesi gizle
      if (items.length == 1) {
        return Column(
          children: [
            Expanded(
              child: Center(
                child: SizedBox(
                  width: MediaQuery.of(context).size.width * .88,
                  child: _CampaignModelCard(
                    items.first as CampaignModel,
                    emphasized: true,
                  ),
                ),
              ),
            ),
          ],
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: items.length,
              onPageChanged: (i) => setState(() => _index = i),
              itemBuilder: (context, i) {
                final cmp = items[i];
                final selected = i == _index;
                return AnimatedPadding(
                  duration: const Duration(milliseconds: 320),
                  curve: Curves.easeOutQuart,
                  padding: EdgeInsets.only(
                    right: 12,
                    top: selected ? 0 : 12,
                    bottom: selected ? 0 : 12,
                  ),
                  child: _CampaignModelCard(
                    cmp as CampaignModel,
                    emphasized: selected,
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                SmoothPageIndicator(
                  controller: _pageController,
                  count: items.length,
                  effect: ExpandingDotsEffect(
                    dotColor: Colors.white.withOpacity(.4),
                    activeDotColor: Colors.white,
                    dotHeight: 7,
                    dotWidth: 7,
                    expansionFactor: 3.2,
                    spacing: 5,
                  ),
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: () {
                    if (dynamicList.isNotEmpty) CampaignListSheet.show();
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    textStyle: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  icon: const Icon(
                    Icons.arrow_forward,
                    size: 18,
                    color: Colors.white,
                  ),
                  label: const Text(
                    'Tümü',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    });
  }

  void _scheduleAdjustIfNeeded(int len) {
    if (len != _lastLen) {
      _lastLen = len;
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => _adjustInitialIndex(len: len),
      );
    }
  }

  void _adjustInitialIndex({int? len}) {
    final campaignService = Get.find<CampaignService>();
    final l = len ?? campaignService.campaigns.length;
    if (!mounted) return;
    if (l <= 2) {
      if (_index != 0) {
        _pageController.jumpToPage(0);
        setState(() => _index = 0);
      }
    } else {
      if (_index != 1) {
        // 3 veya daha fazla: ikinci eleman ortada
        _pageController.jumpToPage(1);
        setState(() => _index = 1);
      }
    }
  }
}

class _CampaignModelCard extends StatelessWidget {
  final CampaignModel cmp;
  final bool emphasized;
  const _CampaignModelCard(this.cmp, {required this.emphasized});

  @override
  Widget build(BuildContext context) {
    final campaignService = Get.find<CampaignService>();
    final favService = Get.isRegistered<FavoriteService>()
        ? Get.find<FavoriteService>()
        : null;
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: () => CampaignDetailSheet.show(cmp),
        splashColor: Colors.white24,
        highlightColor: Colors.white10,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Positioned.fill(
              child: Hero(
                tag: 'cmp_${cmp.id}',
                child: cmp.imageUrl.startsWith('http')
                    ? Image.network(cmp.imageUrl, fit: BoxFit.cover)
                    : Image.asset(cmp.imageUrl, fit: BoxFit.cover),
              ),
            ),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withOpacity(.05),
                      Colors.black.withOpacity(.40),
                      Colors.black.withOpacity(.75),
                    ],
                    stops: const [0, .45, 1],
                  ),
                ),
              ),
            ),
            Positioned(
              top: 12,
              left: 12,
              child: _TagChip(label: cmp.type.name),
            ),
            Positioned(
              left: 16,
              right: 16,
              bottom: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    cmp.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      height: 1.2,
                      letterSpacing: .3,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    cmp.shortDescription,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withOpacity(.95),
                      fontSize: 15,
                      height: 1.3,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => CampaignDetailSheet.show(cmp),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.green.shade600,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          textStyle: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                        ),
                        child: const Text('İncele'),
                      ),
                      const SizedBox(width: 12),
                      Obx(() {
                        final fresh =
                            campaignService.campaigns.firstWhereOrNull(
                              (e) => e.id == cmp.id,
                            ) ??
                            cmp;
                        final isFav =
                            favService?.isFavorite(
                              'campaign',
                              fresh.id ?? '',
                            ) ??
                            false;
                        return IconButton(
                          tooltip: isFav
                              ? 'Favoriden çıkar'
                              : 'Favorilere ekle',
                          onPressed: () async {
                            if (fresh.id == null || favService == null) return;
                            await favService.toggle(
                              type: 'campaign',
                              targetId: fresh.id!,
                              meta: {
                                'title': fresh.title,
                                'subtitle': fresh.shortDescription,
                                'imageUrl': fresh.imageUrl,
                                'type': 'campaign',
                              },
                            );
                          },
                          icon: Icon(
                            isFav ? Icons.favorite : Icons.favorite_border,
                            color: isFav ? Colors.redAccent : Colors.white,
                          ),
                        );
                      }),
                    ],
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

class _TagChip extends StatelessWidget {
  final String label;
  const _TagChip({required this.label});
  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(.15),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(.25)),
          ),
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: .4,
            ),
          ),
        ),
      ),
    );
  }
}
