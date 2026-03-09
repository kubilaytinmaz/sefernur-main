import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ImageSlider extends StatefulWidget {
  final List<String> images;
  final double aspectRatio;
  final BorderRadius borderRadius;
  final EdgeInsets margin;
  const ImageSlider({
    super.key,
    required this.images,
    this.aspectRatio = 16 / 9,
    this.borderRadius = const BorderRadius.all(Radius.circular(24)),
    this.margin = EdgeInsets.zero,
  });
  @override
  State<ImageSlider> createState() => _ImageSliderState();
}

class _ImageSliderState extends State<ImageSlider> {
  late final PageController _controller;
  int _current = 0;
  @override
  void initState() {
    super.initState();
    _controller = PageController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final h =
        (MediaQuery.of(context).size.width - widget.margin.horizontal) /
        widget.aspectRatio;
    if (widget.images.isEmpty) {
      return Container(
        height: h,
        margin: widget.margin,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: widget.borderRadius,
        ),
        child: Icon(Icons.image, size: 44.sp, color: Colors.grey[500]),
      );
    }
    return Container(
      margin: widget.margin,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AspectRatio(
            aspectRatio: widget.aspectRatio,
            child: ClipRRect(
              borderRadius: widget.borderRadius,
              child: PageView.builder(
                controller: _controller,
                itemCount: widget.images.length,
                onPageChanged: (i) => setState(() => _current = i),
                itemBuilder: (_, i) {
                  final url = widget.images[i];
                  return Image.network(
                    url,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: Colors.grey[300],
                      child: const Icon(Icons.broken_image),
                    ),
                  );
                },
              ),
            ),
          ),
          SizedBox(height: 8.h),
          _buildIndicators(),
        ],
      ),
    );
  }

  /// Indicator widget - çok fazla görsel varsa sadece sayı göster
  Widget _buildIndicators() {
    final total = widget.images.length;
    const maxDots = 7; // Maksimum nokta sayısı
    
    if (total <= maxDots) {
      // Normal dot indicator
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(total, (i) {
          final active = i == _current;
          return AnimatedContainer(
            duration: const Duration(milliseconds: 260),
            margin: EdgeInsets.symmetric(horizontal: 3.w),
            height: 8.w,
            width: active ? 20.w : 8.w,
            decoration: BoxDecoration(
              color: active ? Colors.blueGrey[700] : Colors.blueGrey[300],
              borderRadius: BorderRadius.circular(12.r),
            ),
          );
        }),
      );
    }
    
    // Çok fazla görsel var - sayı göster
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: Colors.blueGrey[100],
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Text(
        '${_current + 1} / $total',
        style: TextStyle(
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
          color: Colors.blueGrey[700],
        ),
      ),
    );
  }
}
