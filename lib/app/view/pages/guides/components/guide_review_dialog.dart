import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../../data/services/review/review_service.dart';

class GuideReviewDialog extends StatefulWidget {
  final String guideId;
  const GuideReviewDialog({super.key, required this.guideId});
  @override
  State<GuideReviewDialog> createState() => _GuideReviewDialogState();
}

class _GuideReviewDialogState extends State<GuideReviewDialog> {
  double rating = 5;
  final TextEditingController ctrl = TextEditingController();
  ReviewService? service;
  @override
  void initState(){
    super.initState();
    service = Get.isRegistered<ReviewService>() ? Get.find<ReviewService>() : null;
  }
  @override
  void dispose(){ ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18.r)),
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children:[
          Text('Yorum Ekle', style: TextStyle(fontSize:16.sp, fontWeight: FontWeight.w700)),
          SizedBox(height:12.h),
          Row(children:[
            Text(rating.toStringAsFixed(1), style: TextStyle(fontSize:32.sp, fontWeight: FontWeight.bold, color: Colors.amber[700])),
            SizedBox(width:12.w),
            Expanded(child: Slider(
              min:1, max:5, divisions:8, value: rating,
              onChanged: (v)=> setState(()=> rating=v),
              label: rating.toStringAsFixed(1),
            ))
          ]),
          TextField(
            controller: ctrl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Yorumunuz',
              border: OutlineInputBorder(),
            ),
          ),
          SizedBox(height:16.h),
          Obx(()=> SizedBox(
            width: double.infinity,
            height: 46.h,
            child: ElevatedButton(
              onPressed: (service?.isSubmitting.value??false)? null : () async {
                if (service==null) return;
                await service!.addReview(type: 'guide', targetId: widget.guideId, rating: rating, comment: ctrl.text.trim());
                if (mounted) Get.back();
              },
              style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14.r))),
              child: Text((service?.isSubmitting.value??false)? 'Gönderiliyor...' : 'Gönder', style: TextStyle(fontSize:14.sp, fontWeight: FontWeight.w600)),
            ),
          ))
        ]),
      ),
    );
  }
}
