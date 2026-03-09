import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../data/models/promotion/promotion_model.dart';
import '../../../../data/repositories/promotion/promotion_repository.dart';

/// Arama sekmelerinde gösterilecek promosyon banner widget'ı
class PromotionBanner extends StatelessWidget {
  final PromotionTargetType targetType;
  final EdgeInsetsGeometry? margin;

  const PromotionBanner({
    super.key,
    required this.targetType,
    this.margin,
  });

  @override
  Widget build(BuildContext context) {
    final repo = PromotionRepository();
    
    return StreamBuilder<List<PromotionModel>>(
      stream: repo.streamByTarget(targetType),
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const SizedBox.shrink();
        }

        final promotions = snapshot.data!;
        
        // Tek promosyon varsa direkt göster
        if (promotions.length == 1) {
          return Padding(
            padding: margin ?? EdgeInsets.zero,
            child: _buildBanner(promotions.first),
          );
        }

        // Birden fazla varsa carousel
        return Container(
          margin: margin,
          height: 140.h,
          child: PageView.builder(
            itemCount: promotions.length,
            controller: PageController(viewportFraction: 0.95),
            itemBuilder: (ctx, i) => Padding(
              padding: EdgeInsets.only(right: i < promotions.length - 1 ? 8.w : 0),
              child: _buildBanner(promotions[i]),
            ),
          ),
        );
      },
    );
  }

  Widget _buildBanner(PromotionModel promo) {
    final startColor = _parseColor(promo.gradientStartColor);
    final endColor = _parseColor(promo.gradientEndColor);
    final badgeColor = promo.badgeColor != null ? _parseColor(promo.badgeColor!) : Colors.orange;

    return Container(
      width: double.infinity,
      height: 140.h,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12.r),
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [startColor, endColor],
        ),
      ),
      child: Padding(
        padding: EdgeInsets.all(20.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              promo.title,
              style: TextStyle(
                color: Colors.white,
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              promo.subtitle,
              style: TextStyle(
                color: Colors.white,
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            Row(
              children: [
                if (promo.badgeText != null)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: badgeColor,
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Text(
                      promo.badgeText!,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                if (promo.discountCode != null) ...[
                  SizedBox(width: 8.w),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.confirmation_number, size: 14.sp, color: Colors.white),
                        SizedBox(width: 4.w),
                        Text(
                          promo.discountCode!,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _parseColor(String hex) {
    try {
      return Color(int.parse(hex.replaceFirst('#', '0xFF')));
    } catch (_) {
      return Colors.blue;
    }
  }
}
