import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

import '../../themes/colors/app_colors.dart';

class ReviewDetailSheet extends StatelessWidget {
  final Map<String,dynamic> review;
  const ReviewDetailSheet({super.key, required this.review});
  static Future<void> show(Map<String,dynamic> r) async {
    Get.generalDialog(
      barrierDismissible: true,
      barrierLabel: 'review-detail',
      pageBuilder: (_, __, ___) => ReviewDetailSheet(review: r),
      transitionBuilder: (context, anim, sec, child){ final curved = Curves.easeOutCubic.transform(anim.value); return Transform.translate(offset: Offset(0,(1-curved)*40), child: Opacity(opacity: anim.value, child: child)); },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
  @override Widget build(BuildContext context){
    final type = (review['targetType'] ?? review['type'] ?? '').toString();
    final rating = (review['rating'] ?? 0).toDouble();
    final comment = (review['comment'] ?? '').toString();
    final created = (review['createdAt'] ?? '').toString();
    const radius = BorderRadius.only(topLeft: Radius.circular(26), topRight: Radius.circular(26));
    return GestureDetector(
      onTap: ()=> Navigator.of(context).maybePop(),
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children:[
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX:14,sigmaY:14),
                child: Container(color: Colors.black.withOpacity(.35)),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: SafeArea(
          bottom: false,
                top:false,
                child: Container(
                  constraints: const BoxConstraints(maxHeight:420),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: radius,
                    border: Border.all(color: AppColors.primary.withOpacity(.15)),
                    boxShadow:[BoxShadow(color: Colors.black.withOpacity(.3), blurRadius:36, offset: const Offset(0,18))],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children:[
                      _Header(title: _typeLabel(type), onClose: ()=> Navigator.of(context).maybePop()),
                      Expanded(
                        child: ListView(
                          padding: const EdgeInsets.fromLTRB(20,12,20,32),
                          children:[
                            Row(
                              children:[
                                ...List.generate(5, (i)=> Icon(i < rating.round()? Icons.star_rounded : Icons.star_border_rounded, size:22, color: Colors.amber.shade600)),
                                const SizedBox(width:10),
                                Text(rating.toStringAsFixed(1), style: const TextStyle(fontWeight: FontWeight.w700)),
                              ],
                            ),
                            const SizedBox(height:14),
                            Text(comment, style: const TextStyle(fontSize:13.5, height:1.4)),
                            const SizedBox(height:18),
                            _meta('Oluşturma', _formatDate(created)),
                            if(review['updatedAt']!=null) _meta('Güncelleme', _formatDate(review['updatedAt'].toString())),
                            const SizedBox(height:30),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  static String _formatDate(String dateStr) {
    try {
      if (dateStr.isEmpty) return 'Bilinmiyor';
      final date = DateTime.parse(dateStr);
      final formatter = DateFormat('dd.MM.yyyy HH:mm');
      return formatter.format(date);
    } catch (e) {
      return dateStr; // Eğer parse edilemiyorsa orijinal string'i döndür
    }
  }
  static Widget _meta(String k, String v)=> Padding(padding: const EdgeInsets.only(bottom:8), child: Row(children:[ SizedBox(width:90, child: Text(k, style: const TextStyle(fontSize:12, fontWeight: FontWeight.w600))), Expanded(child: Text(v, style: const TextStyle(fontSize:12.2))) ]));
  static String _typeLabel(String t){ switch(t){ case 'hotel': return 'Otel Yorumu'; case 'car': return 'Araç Kiralama Yorumu'; case 'tour': return 'Tur Yorumu'; case 'guide': return 'Rehber Yorumu'; case 'transfer': return 'Transfer Yorumu'; default: return 'Yorum'; } }
}

class _Header extends StatelessWidget{ final String title; final VoidCallback onClose; const _Header({required this.title, required this.onClose}); @override Widget build(BuildContext context){ return Padding(padding: const EdgeInsets.fromLTRB(18,14,6,4), child: Row(children:[ Expanded(child: Text(title, maxLines:2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize:19,fontWeight: FontWeight.w700))), IconButton(onPressed: onClose, icon: const Icon(Icons.close_rounded)) ])); }}
