import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import 'detail_sheet_constants.dart';

Future<void> showUnifiedReviewDialog({
  required String type,
  required String id,
  required Future<void> Function(double rating, String comment) onSubmit,
  String? title,
}) async {
  final rating = 5.0.obs;
  final textCtrl = TextEditingController();
  await Get.dialog(
    Dialog(
      shape: DetailSheetConfig.dialogShape,
      insetPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 32.h),
      child: Padding(
        padding: EdgeInsets.all(20.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title ?? 'Yorum Ekle',
              style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w700),
            ),
            SizedBox(height: 14.h),
            Obx(
              () => Row(
                children: List.generate(5, (i) {
                  final filled = i < rating.value.round();
                  return IconButton(
                    onPressed: () => rating.value = (i + 1).toDouble(),
                    icon: Icon(
                      filled ? Icons.star_rounded : Icons.star_border_rounded,
                      color: Colors.amber,
                      size: 30.sp,
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  );
                }),
              ),
            ),
            SizedBox(height: 12.h),
            TextField(
              controller: textCtrl,
              minLines: 3,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Deneyiminizi paylaşın...',
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16.r),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                contentPadding: EdgeInsets.all(14.w),
              ),
            ),
            SizedBox(height: 20.h),
            Row(
              children: [
                Expanded(
                  child: Builder(
                    builder: (context) => OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                      ),
                      child: const Text('Vazgeç'),
                    ),
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Builder(
                    builder: (context) => ElevatedButton(
                      onPressed: () async {
                        final comment = textCtrl.text.trim();
                        if (comment.isEmpty) {
                          Get.snackbar('Uyarı', 'Lütfen yorum giriniz');
                          return;
                        }
                        Navigator.of(context).pop();
                        await onSubmit(rating.value, comment);
                      },
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 14.h),
                      ),
                      child: const Text('Gönder'),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}
