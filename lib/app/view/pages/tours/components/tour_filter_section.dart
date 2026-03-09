import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../controllers/search/tour_search_controller.dart';

class TourFilterSection extends StatefulWidget {
  final TourSearchController controller;
  const TourFilterSection({super.key, required this.controller});

  @override
  State<TourFilterSection> createState() => _TourFilterSectionState();
}

class _TourFilterSectionState extends State<TourFilterSection> {
  bool showCats = true; // kategoriler açık
  bool showTags = false; // etiketler kapalı
  bool showAdvanced = true; // gelişmiş filtreler (favori, rating, süre, sıralama)
  bool collapsed = false; // tamamını gizle/göster

  @override
  Widget build(BuildContext context) {
  final c = widget.controller;
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;
  if (collapsed) return _collapsedBar(c, context);
  return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24.r),
        gradient: isDark ? null : LinearGradient(
          colors: [Colors.white, Colors.grey[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        color: isDark ? theme.colorScheme.surfaceContainerHigh : null,
        boxShadow: isDark ? null : [
          BoxShadow(color: Colors.black.withOpacity(.04), blurRadius: 18, offset: const Offset(0,8)),
        ],
        border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[200]!),
      ),
      child: Padding(
        padding: EdgeInsets.fromLTRB(14.w, 12.h, 14.w, 14.h),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
          _topBar(c, context),
          SizedBox(height: 4.h),
          _divider(context),
          SizedBox(height: 10.h),
          _sectionHeader(
            icon: Icons.category_outlined,
            title: 'Kategoriler',
            open: showCats,
            toggle: ()=> setState(()=> showCats = !showCats),
            count: c.selectedCategories.length,
            color: Colors.indigo,
            context: context,
          ),
          AnimatedCrossFade(
            crossFadeState: showCats ? CrossFadeState.showFirst : CrossFadeState.showSecond,
            duration: const Duration(milliseconds: 220),
            firstChild: Padding(
              padding: EdgeInsets.only(top: 8.h, bottom: 12.h),
              child: _categories(c, context),
            ),
            secondChild: SizedBox(height: 4.h),
          ),
          _sectionHeader(
            icon: Icons.tag_outlined,
            title: 'Etiketler',
            open: showTags,
            toggle: ()=> setState(()=> showTags = !showTags),
            count: c.selectedTags.length,
            color: Colors.deepPurple,
            context: context,
          ),
          AnimatedCrossFade(
            crossFadeState: showTags ? CrossFadeState.showFirst : CrossFadeState.showSecond,
            duration: const Duration(milliseconds: 220),
            firstChild: Padding(
              padding: EdgeInsets.only(top: 8.h, bottom: 6.h),
              child: _tags(c, context),
            ),
            secondChild: SizedBox(height: 4.h),
          ),
          SizedBox(height: 4.h),
          _sectionHeader(
            icon: Icons.tune,
            title: 'Gelişmiş',
            open: showAdvanced,
            toggle: ()=> setState(()=> showAdvanced = !showAdvanced),
            count: _advancedActiveCount(c),
            color: Colors.teal,
            context: context,
          ),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 240),
            child: showAdvanced ? Padding(
              key: const ValueKey('adv'),
              padding: EdgeInsets.only(top: 10.h),
              child: _advanced(c, context),
            ) : SizedBox(height: 4.h, key: const ValueKey('adv_empty')),
          ),
        ]),
      ),
    );
  }

  Widget _topBar(TourSearchController c, BuildContext context){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Row(children:[
      Icon(Icons.filter_alt_outlined, size: 18.sp, color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[600]),
      SizedBox(width: 6.w),
      Text('Filtreler', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, letterSpacing: .3, color: theme.colorScheme.onSurface)),
      SizedBox(width: 8.w),
      Obx(()=> _activeBadge(c, context)),
      const Spacer(),
      // Gizle butonu
      Tooltip(
        message: 'Filtreleri gizle',
        child: IconButton(
          icon: const Icon(Icons.keyboard_arrow_up),
          onPressed: ()=> setState(()=> collapsed = true),
        ),
      ),
      Tooltip(
        message: 'Favorileri göster',
        child: Obx(()=> InkWell(
          borderRadius: BorderRadius.circular(22.r),
          onTap: c.toggleFavoritesOnly,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 220),
            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
            decoration: BoxDecoration(
              color: c.favoritesOnly.value ? Colors.red[50] : (isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100]),
              borderRadius: BorderRadius.circular(20.r),
              border: Border.all(color: c.favoritesOnly.value ? Colors.redAccent : (isDark ? Colors.grey[600]! : Colors.grey[300]!)),
            ),
            child: Row(children:[
              Icon(c.favoritesOnly.value ? Icons.favorite : Icons.favorite_border, size: 14.sp, color: c.favoritesOnly.value ? Colors.red : (isDark ? Colors.grey[400] : Colors.grey[600])),
              SizedBox(width: 4.w),
              Text('Favori', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: c.favoritesOnly.value ? Colors.red : (isDark ? Colors.grey[300] : Colors.grey[700])))
            ]),
          ),
        )),
      ),
      SizedBox(width: 6.w),
      IconButton(onPressed: c.clearFilters, icon: const Icon(Icons.clear_all, size:18), tooltip: 'Temizle'),
    ]);
  }

  Widget _sectionHeader({required IconData icon, required String title, required bool open, required VoidCallback toggle, int count = 0, Color? color, required BuildContext context}){
    final theme = Theme.of(context);
    final accent = color ?? Colors.blueGrey;
    return InkWell(
      borderRadius: BorderRadius.circular(14.r),
      onTap: toggle,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 6.h),
        child: Row(children:[
          AnimatedRotation(
            duration: const Duration(milliseconds: 250),
            turns: open ? .0 : -.25,
            child: Icon(open ? Icons.expand_less : Icons.expand_more, size: 20.sp, color: accent),
          ),
          SizedBox(width: 4.w),
            Container(
              padding: EdgeInsets.all(6.w),
              decoration: BoxDecoration(
                color: accent.withOpacity(.08),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Icon(icon, size: 14.sp, color: accent),
            ),
          SizedBox(width: 8.w),
          Expanded(child: Text(title, style: TextStyle(fontSize: 12.5.sp, fontWeight: FontWeight.w700, letterSpacing: .2, color: theme.colorScheme.onSurface))),
          if (count > 0)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
              decoration: BoxDecoration(color: accent.withOpacity(.12), borderRadius: BorderRadius.circular(12.r)),
              child: Text('$count', style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: accent)),
            ),
        ]),
      ),
    );
  }

  Widget _categories(TourSearchController c, BuildContext context){
    return Obx((){
      final list = c.allCategories.toList()..sort();
      if(list.isEmpty) return _empty('Kategori yok', context);
      return Wrap(
        spacing: 8.w,
        runSpacing: 8.h,
        children: list.take(20).map((cat){
          final sel = c.selectedCategories.contains(cat);
          return _choiceChip(label: cat.toUpperCase(), selected: sel, onTap: ()=> c.toggleCategory(cat), color: Colors.indigo, context: context);
        }).toList(),
      );
    });
  }

  Widget _tags(TourSearchController c, BuildContext context){
    return Obx((){
      final list = c.allTags.toList()..sort();
      if(list.isEmpty) return _empty('Etiket yok', context);
      return Wrap(
        spacing: 8.w,
        runSpacing: 8.h,
        children: list.take(30).map((tag){
          final sel = c.selectedTags.contains(tag);
          return _choiceChip(label: tag.toUpperCase(), selected: sel, onTap: ()=> c.toggleTag(tag), color: Colors.deepPurple, context: context);
        }).toList(),
      );
    });
  }

  Widget _advanced(TourSearchController c, BuildContext context){
    final maxDays = c.allTours.isEmpty ? 15 : math.max(5, c.allTours.map((t)=> t.durationDays).fold<int>(0, (p,n)=> n>p?n:p));
    return Column(children:[
      // Rating & Duration
      Row(children:[
        Expanded(child: Obx(()=> _ratingSlider(c, context))),
        SizedBox(width: 16.w),
        Expanded(child: Obx(()=> _durationSlider(c, maxDays, context))),
      ]),
      SizedBox(height: 14.h),
      Obx(()=> _sortRow(c, context)),
    ]);
  }

  Widget _ratingSlider(TourSearchController c, BuildContext context){
    final theme = Theme.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Row(children:[
        Icon(Icons.star, size: 16.sp, color: Colors.amber[700]),
        SizedBox(width: 4.w),
        Text('Min. Puan', style: TextStyle(fontSize: 11.5.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        const Spacer(),
        Text(c.minRating.value.toStringAsFixed(1), style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: Colors.amber[800])),
      ]),
      Slider(
        value: c.minRating.value,
        min: 0,
        max: 5,
        divisions: 10,
        label: c.minRating.value.toStringAsFixed(1),
        onChanged: (v)=> c.setMinRating(double.parse(v.toStringAsFixed(1))),
      ),
    ]);
  }

  Widget _durationSlider(TourSearchController c, int maxDays, BuildContext context){
    final theme = Theme.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children:[
      Row(children:[
        Icon(Icons.timer_outlined, size: 16.sp, color: Colors.teal[700]),
        SizedBox(width: 4.w),
        Text('Maks. Gün', style: TextStyle(fontSize: 11.5.sp, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface)),
        const Spacer(),
        Text(c.maxDuration.value == 0 ? '—' : c.maxDuration.value.toString(), style: TextStyle(fontSize: 11.sp, fontWeight: FontWeight.w600, color: Colors.teal[800])),
      ]),
      Slider(
        value: (c.maxDuration.value == 0 ? maxDays.toDouble() : c.maxDuration.value.toDouble()).clamp(0, maxDays.toDouble()),
        min: 0,
        max: maxDays.toDouble(),
        divisions: maxDays,
        label: c.maxDuration.value == 0 ? 'Sınırsız' : c.maxDuration.value.toString(),
        onChanged: (v){ final val = v.round(); c.setMaxDuration(val == maxDays ? 0 : val); },
      ),
    ]);
  }

  Widget _sortRow(TourSearchController c, BuildContext context){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    const opts = [
      {'key':'price_asc','icon':Icons.arrow_downward,'label':'Fiyat'},
      {'key':'price_desc','icon':Icons.arrow_upward,'label':'Fiyat'},
      {'key':'rating_desc','icon':Icons.star,'label':'Puan'},
      {'key':'duration_asc','icon':Icons.timer,'label':'Süre'},
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(children:[
        Text('Sırala:', style: TextStyle(fontSize: 11.5.sp, fontWeight: FontWeight.w600, color: isDark ? Colors.grey[400] : Colors.grey[700])),
        SizedBox(width: 6.w),
        ...opts.map((o){
          final sel = c.sortOption.value == o['key'];
          return Padding(
            padding: EdgeInsets.only(right: 6.w),
            child: _choiceChip(
              label: o['label'] as String,
              selected: sel,
              onTap: ()=> c.setSort(o['key'] as String),
              color: Colors.blueGrey,
              leading: Icon(o['icon'] as IconData, size: 14.sp),
              context: context,
            ),
          );
        })
      ]),
    );
  }

  int _advancedActiveCount(TourSearchController c){
    var n = 0;
    if (c.minRating.value>0) n++;
    if (c.maxDuration.value>0) n++;
    if (c.sortOption.value!='price_asc') n++;
    if (c.favoritesOnly.value) n++;
    return n;
  }

  Widget _divider(BuildContext context){ 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Container(height: 1, width: double.infinity, decoration: BoxDecoration(gradient: LinearGradient(colors: isDark ? [Colors.grey[700]!, Colors.grey[800]!, Colors.grey[700]!] : [Colors.grey[200]!, Colors.grey[100]!, Colors.grey[200]!]))); 
  }

  Widget _choiceChip({required String label, required bool selected, required VoidCallback onTap, required Color color, Widget? leading, required BuildContext context}){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bg = selected ? color.withOpacity(.15) : (isDark ? theme.colorScheme.surfaceContainerHighest : Colors.grey[100]);
    final border = selected ? color.withOpacity(.45) : (isDark ? Colors.grey[600]! : Colors.grey[300]!);
    final fg = selected ? (color.computeLuminance() > .5 ? Colors.black87 : color.withOpacity(.9)) : (isDark ? Colors.grey[300] : Colors.grey[700]);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30.r),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 7.h),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(30.r),
          border: Border.all(color: border, width: 1),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children:[
          if (leading != null) ...[leading, SizedBox(width: 4.w)],
          Text(label, style: TextStyle(fontSize: 10.5.sp, fontWeight: FontWeight.w600, letterSpacing: .5, color: fg)),
          if (selected) ...[
            SizedBox(width: 4.w),
            Icon(Icons.check_circle, size: 14.sp, color: fg),
          ]
        ]),
      ),
    );
  }

  Widget _empty(String msg, BuildContext context){ 
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Text(msg, style: TextStyle(fontSize:11.sp, color: isDark ? Colors.grey[400] : Colors.grey[500])); 
  }

  Widget _activeBadge(TourSearchController c, BuildContext context){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final count = c.selectedCategories.length + c.selectedTags.length + (c.favoritesOnly.value ? 1 : 0) + (c.minRating.value>0 ? 1 : 0) + (c.maxDuration.value>0 ? 1 : 0);
    if (count==0) return const SizedBox();
    return Container(
      padding: EdgeInsets.symmetric(horizontal:8.w, vertical:4.h),
      decoration: BoxDecoration(color: isDark ? Colors.blue[900]!.withOpacity(0.3) : Colors.blue[50], borderRadius: BorderRadius.circular(14.r)),
      child: Text('$count', style: TextStyle(fontSize:11.sp, fontWeight: FontWeight.w700, color: isDark ? Colors.blue[300] : Colors.blue[700])),
    );
  }

  // Küçük daraltılmış bar
  Widget _collapsedBar(TourSearchController c, BuildContext context){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Align(
      alignment: Alignment.topLeft,
      child: InkWell(
        borderRadius: BorderRadius.circular(28.r),
        onTap: ()=> setState(()=> collapsed = false),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28.r),
            gradient: isDark ? null : LinearGradient(colors:[Colors.white, Colors.grey[100]!]),
            color: isDark ? theme.colorScheme.surfaceContainerHigh : null,
            border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
            boxShadow: isDark ? null : [BoxShadow(color: Colors.black.withOpacity(.05), blurRadius: 12, offset: const Offset(0,4))],
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children:[
            Icon(Icons.filter_alt_outlined, size: 18.sp, color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[600]),
            SizedBox(width: 6.w),
            Text('Filtreleri Aç', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600, letterSpacing: .2, color: theme.colorScheme.onSurface)),
            SizedBox(width: 8.w),
            Obx(()=> _activeBadge(c, context)),
            SizedBox(width: 4.w),
            Icon(Icons.keyboard_arrow_down, size: 20.sp, color: isDark ? Colors.blueGrey[300] : Colors.blueGrey[600]),
          ]),
        ),
      ),
    );
  }
}
