import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/services/review/review_service.dart';
import 'review_detail_sheet.dart';

class ReviewHorizontalList extends StatefulWidget {
  const ReviewHorizontalList({super.key});
  @override State<ReviewHorizontalList> createState()=> _ReviewHorizontalListState();
}

class _ReviewHorizontalListState extends State<ReviewHorizontalList>{
  late final ReviewService service;
  @override void initState(){ super.initState(); service = Get.find<ReviewService>(); }
  @override Widget build(BuildContext context){
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return StreamBuilder<List<Map<String,dynamic>>>(
      stream: service.topHomeReviewsStream(),
      builder: (context, snap){
        if (snap.connectionState == ConnectionState.waiting) {
          return SizedBox(height:140, child: Center(child: CircularProgressIndicator(strokeWidth:2, color: Colors.green.shade600)));
        }
        final list = snap.data ?? [];
        if(list.isEmpty){ return SizedBox(height:140, child: Center(child: Text('Henüz yorum yok', style: TextStyle(color: theme.colorScheme.onSurfaceVariant)))); }
        return SizedBox(height:150, child: ListView.separated(padding: const EdgeInsets.symmetric(horizontal:16), scrollDirection: Axis.horizontal, itemBuilder: (_,i){ final r = list[i]; return _item(r, theme, isDark); }, separatorBuilder: (_,__)=> const SizedBox(width:12), itemCount: list.length));
      },
    );
  }
  Widget _item(Map<String,dynamic> r, ThemeData theme, bool isDark){ 
    final rating = (r['rating'] ?? 0).toDouble(); 
    final comment = (r['comment'] ?? '').toString(); 
    final type = (r['targetType'] ?? r['type'] ?? '').toString(); 
    return GestureDetector(
      onTap: ()=> ReviewDetailSheet.show(r), 
      child: Container(
        width:230, 
        padding: const EdgeInsets.all(14), 
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surfaceContainerHigh : theme.colorScheme.surface, 
          borderRadius: BorderRadius.circular(16), 
          border: Border.all(color: isDark ? theme.colorScheme.outline.withOpacity(.3) : Colors.grey.shade200), 
          boxShadow: [BoxShadow(color: isDark ? Colors.black26 : Colors.grey.withOpacity(.05), blurRadius: 8, offset: const Offset(0, 2))]
        ), 
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, 
          children:[ 
            Row(children:[ 
              Icon(_icon(type), size:16, color: Colors.green.shade600), 
              const SizedBox(width:6), 
              Expanded(child: Text(_typeLabel(type), maxLines:1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize:12.5, fontWeight: FontWeight.w600, color: theme.colorScheme.onSurface))) 
            ]), 
            const SizedBox(height:6), 
            Expanded(child: Text(comment, maxLines:3, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize:12, color: theme.colorScheme.onSurfaceVariant))), 
            const SizedBox(height:6), 
            Row(children: List.generate(5, (i)=> Icon(i < rating.round() ? Icons.star_rounded : Icons.star_border_rounded, size:15, color: Colors.amber.shade600))) 
          ]
        )
      )
    ); 
  }
  IconData _icon(String t){ switch(t){ case 'hotel': return Icons.hotel; case 'car': return Icons.directions_car_filled; case 'tour': return Icons.tour; case 'guide': return Icons.person_pin_circle; case 'transfer': return Icons.airport_shuttle; default: return Icons.reviews; } }
  String _typeLabel(String t){ switch(t){ case 'hotel': return 'Otel'; case 'car': return 'Araç'; case 'tour': return 'Tur'; case 'guide': return 'Rehber'; case 'transfer': return 'Transfer'; default: return 'Diğer'; } }
}
