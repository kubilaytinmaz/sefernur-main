import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../controllers/home/home_controller.dart';

/// Clean re‑implementation with 3 paged 4‑month windows and trend bars.
class WeatherComparison extends StatefulWidget {
  const WeatherComparison({super.key});

  @override
  State<WeatherComparison> createState() => _WeatherComparisonState();
}

class _WeatherComparisonState extends State<WeatherComparison> {
  late final HomeController controller;
  late final PageController _pageController;
  final RxInt currentPage = 0.obs;

  @override
  void initState() {
    super.initState();
    controller = Get.find<HomeController>();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.weatherLoading.value) return _loading();
      final error = controller.weatherError.value;
      if (error.isNotEmpty && controller.mekkahWeather.isEmpty && controller.medinaWeather.isEmpty) {
        return _error(error);
      }
      final mekke = controller.mekkahWeather;
      final medine = controller.medinaWeather;
      if (mekke.isEmpty && medine.isEmpty) return _error('Hava durumu alınamadı.');

      // Sabit 3 periyot: Ocak-Nisan, Mayıs-Ağustos, Eylül-Aralık
      const fixedStarts = [1, 5, 9]; // Ocak, Mayıs, Eylül
      final windows = fixedStarts
          .map((s) => _WindowData(
                startMonth: s,
                mekke: _windowMonths(mekke, s, 4),
                medine: _windowMonths(medine, s, 4),
              ))
          .toList();

      String rangeLabel(int start) {
        final end = start + 3; // 4 ay: start, start+1, start+2, start+3
        return '${_monthLabelFullLower(start).capitalizeFirst}–${_monthLabelFullLower(end).capitalizeFirst}';
      }

      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Range chips (previously with header 'Önümüzdeki Aylar') placed directly under the parent section title.
            Obx(() => Row(
                  children: List.generate(windows.length, (i) {
                    final active = currentPage.value == i;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => _pageController.animateToPage(i, duration: const Duration(milliseconds: 320), curve: Curves.easeOut),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 220),
                          curve: Curves.easeOut,
                          margin: EdgeInsets.only(left: i == 0 ? 0 : 6),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                          decoration: BoxDecoration(
                            color: active ? Get.theme.colorScheme.primary.withOpacity(.16) : Get.theme.cardColor,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: active ? Get.theme.colorScheme.primary : Get.theme.dividerColor.withOpacity(.4),
                              width: 1.1,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              rangeLabel(windows[i].startMonth),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: active ? Get.theme.colorScheme.primary : Get.theme.colorScheme.onSurfaceVariant,
                                letterSpacing: .2,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                )),
            const SizedBox(height: 12),
            SizedBox(
              height: 300,
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (i) => currentPage.value = i,
                itemCount: windows.length,
                itemBuilder: (_, i) {
                  final w = windows[i];
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _CityCard(
                          title: 'Mekke',
                          data: w.mekke,
                          startMonth: w.startMonth,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _CityCard(
                          title: 'Medine',
                          data: w.medine,
                          startMonth: w.startMonth,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            Obx(() {
              final isDark = Get.theme.brightness == Brightness.dark;
              return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(windows.length, (i) {
                    final active = currentPage.value == i;
                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 8,
                      width: active ? 30 : 10,
                      decoration: BoxDecoration(
                        color: active 
                            ? Colors.green.shade600 
                            : (isDark ? Colors.grey.shade600 : Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(30),
                      ),
                    );
                  }),
                );
            }),
          ],
        ),
      );
    });
  }

  Widget _loading() => const SizedBox(
    height: 220,
    child: Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2.4),
          ),
          SizedBox(width: 12),
          Text('Hava durumu yükleniyor...'),
        ],
      ),
    ),
  );

  Widget _error(String msg) => SizedBox(
    height: 220,
    child: Center(
      child: TextButton.icon(
        onPressed: Get.find<HomeController>().loadWeather,
        icon: const Icon(Icons.refresh),
        label: Text(msg),
      ),
    ),
  );
}

class _CityCard extends StatelessWidget {
  final String title;
  final List<_MonthEntry> data;
  final int startMonth;
  const _CityCard({required this.title, required this.data, required this.startMonth});

  // Sıcaklığa göre dinamik renk döndür
  static Color getTemperatureColor(int temp) {
    if (temp >= 40) return Colors.red.shade700;      // Çok sıcak
    if (temp >= 35) return Colors.deepOrange.shade600; // Sıcak
    if (temp >= 30) return Colors.orange.shade600;   // Ilık-sıcak
    if (temp >= 25) return Colors.amber.shade600;    // Ilık
    if (temp >= 20) return Colors.teal.shade500;     // Serin-ılık
    if (temp >= 15) return Colors.green.shade600;    // Serin
    if (temp >= 10) return Colors.cyan.shade600;     // Soğuk-serin
    return Colors.lightBlue.shade600;                // Soğuk
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final borderColor = isDark ? Colors.grey.shade800 : theme.dividerColor.withOpacity(.12);
    
    final cityMaxHigh = data.isEmpty
        ? 1
        : data.map<int>((m) => _toInt(m.entry?.avgHigh) ?? 0).fold<int>(0, (p, e) => e > p ? e : p);
    
    // Ortalama sıcaklığa göre ana renk belirle
    final avgTemp = data.isEmpty
        ? 25
        : (data.map<int>((m) => _toInt(m.entry?.avgHigh) ?? 25).reduce((a, b) => a + b) / data.length).round();
    final baseColor = getTemperatureColor(avgTemp);
    
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: baseColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: baseColor)),
              ),
              const Spacer(),
              Text('Max', style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurfaceVariant)),
              Text('  •  ', style: TextStyle(color: theme.colorScheme.onSurfaceVariant)),
              Text('Min', style: TextStyle(fontSize: 11, color: theme.colorScheme.onSurfaceVariant)),
            ],
          ),
          const SizedBox(height: 10),
          if (data.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Text('Veri yok', style: TextStyle(color: theme.colorScheme.onSurfaceVariant)),
            )
          else ...[
            for (int i = 0; i < data.length; i++)
                _MonthRow(
                  month: data[i].month,
                  entry: data[i].entry,
                  maxHigh: cityMaxHigh,
                ),
          ]
        ],
      ),
    );
  }
}

class _MonthRow extends StatelessWidget {
  final int month; // 1..12
  final dynamic entry; // has avgHigh/avgLow
  final int maxHigh;
  const _MonthRow({required this.month, required this.entry, required this.maxHigh});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final high = _toInt(entry?.avgHigh) ?? 0;
    final low = _toInt(entry?.avgLow) ?? 0;
    final rawLabel = _monthLabelFullLower(month);
    final label = rawLabel.isEmpty ? '' : rawLabel[0].toUpperCase() + rawLabel.substring(1);
    
    // Her satır için sıcaklığa göre dinamik renk kullan
    final accent = _CityCard.getTemperatureColor(high);
    
    // Dynamic styling based on temperature
    double getBarHeight(int t) {
      if (t >= 40) return 13;
      if (t >= 30) return 11;
      return 9;
    }
    
    Color getBarColor(int t, Color base) {
      if (t >= 40) return base.withOpacity(1.0);
      if (t >= 30) return base.withOpacity(0.85);
      if (t >= 20) return base.withOpacity(0.7);
      return base.withOpacity(0.5);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: LayoutBuilder(builder: (context, constraints) {
        // Yapı: Ay ismi, Bar1 - Derece, Bar2 - Derece. Spacing optimize edildi.
        final totalW = constraints.maxWidth;
        const degreeReserve = 44.0; 
        final barMax = (totalW - degreeReserve).clamp(36.0, totalW);
        final maxV = maxHigh == 0 ? 1 : maxHigh.toDouble();
        final highW = (barMax * (high / maxV)).clamp(6.0, barMax);
        final lowW = (barMax * (low / maxV)).clamp(4.0, highW * 0.94);

        Widget bar(double w, double h, {required Color c, Gradient? g}) => Container(
              width: w,
              height: h,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(5),
                color: g == null ? c : null,
                gradient: g,
              ),
            );

        Text tempTxt(String t, Color c) => Text(
              t,
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: c, height: 1.0),
            );

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800, // Daha kalın font
                color: theme.colorScheme.onSurface,
                letterSpacing: .15,
              ),
            ),
            const SizedBox(height: 3),
            Row(
              children: [
                bar(
                  highW,
                  getBarHeight(high),
                  c: getBarColor(high, accent),
                  g: null, // Gradient yerine düz renk opaklık kontrolü daha net sonuç verir
                ),
                const SizedBox(width: 6),
                tempTxt('$high°', accent.withOpacity(.95)),
              ],
            ),
            const SizedBox(height: 3),
            Row(
              children: [
                bar(
                  lowW,
                  getBarHeight(low) - 2, // Low bar biraz daha ince
                  c: getBarColor(low, accent).withOpacity(0.5),
                ),
                const SizedBox(width: 6),
                tempTxt('$low°', accent.withOpacity(.70)),
              ],
            ),
          ],
        );
      }),
    );
  }

  // Önceki sürümde kullanılan _hBar ve _deltaBadge yardımcıları kaldırıldı.
}

// --- Data helpers ---------------------------------------------------------
class _WindowData {
  final int startMonth;
  final List<_MonthEntry> mekke;
  final List<_MonthEntry> medine;
  _WindowData({required this.startMonth, required this.mekke, required this.medine});
}

class _MonthEntry {
  final int month;
  final dynamic entry;
  _MonthEntry(this.month, this.entry);
}

List<_MonthEntry> _windowMonths(List source, int startMonth, int count) {
  if (source.isEmpty || count <= 0) return [];
  final map = <int, dynamic>{};
  for (final e in source) {
    final m = _coerceMonthToInt(e.month);
    if (m != null && m >= 1 && m <= 12) map[m] = e;
  }
  if (map.isEmpty) return [];
  
  final out = <_MonthEntry>[];
  for (int i = 0; i < count; i++) {
    final m = startMonth + i; // Sabit periyotlar: 1-4, 5-8, 9-12
    // Sadece o ay için veri varsa ekle, yoksa null entry ile ekle
    final entry = map[m];
    out.add(_MonthEntry(m, entry));
  }
  return out;
}

// Abbreviated label not needed anymore (we use full lower-case names)

String _monthLabelFullLower(int val) {
  const labels = {
    1: 'ocak',
    2: 'şubat',
    3: 'mart',
    4: 'nisan',
    5: 'mayıs',
    6: 'haziran',
    7: 'temmuz',
    8: 'ağustos',
    9: 'eylül',
    10: 'ekim',
    11: 'kasım',
    12: 'aralık',
  };
  return labels[val] ?? '';
}

// Safe converters
int? _toInt(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  if (v is double) return v.round();
  if (v is num) return v.toInt();
  if (v is String) {
    final s = v.trim().replaceAll('°', '');
    final n = int.tryParse(s);
    return n;
  }
  return null;
}

int? _coerceMonthToInt(dynamic m) {
  if (m is int) return m;
  if (m is String) {
    final lower = m.trim().toLowerCase();
    // Try numeric string
    final asNum = int.tryParse(lower);
    if (asNum != null && asNum >= 1 && asNum <= 12) return asNum;
    // Map common Turkish abbreviations and names
    const map = {
      'oca': 1,
      'ocak': 1,
      'şub': 2,
      'sub': 2,
      'şubat': 2,
      'subat': 2,
      'mar': 3,
      'mart': 3,
      'nis': 4,
      'nisan': 4,
      'may': 5,
      'mayıs': 5,
      'mayis': 5,
      'haz': 6,
      'haziran': 6,
      'tem': 7,
      'temmuz': 7,
      'ağu': 8,
      'agu': 8,
      'ağustos': 8,
      'agustos': 8,
      'eyl': 9,
      'eylül': 9,
      'eylul': 9,
      'eki': 10,
      'ekim': 10,
      'kas': 11,
      'kasım': 11,
      'kasim': 11,
      'ara': 12,
      'aralık': 12,
      'aralik': 12,
    };
    return map[lower];
  }
  return null;
}
