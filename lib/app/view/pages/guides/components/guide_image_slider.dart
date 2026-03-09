import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class GuideImageSlider extends StatefulWidget {
  final List<String> images;
  const GuideImageSlider({super.key, required this.images});
  @override
  State<GuideImageSlider> createState() => _GuideImageSliderState();
}

class _GuideImageSliderState extends State<GuideImageSlider> {
  final PageController _pc = PageController();
  int index = 0;
  @override
  void dispose(){ _pc.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    if (widget.images.isEmpty) {
      return Container(
        height: 220.h,
        decoration: BoxDecoration(
          color: Colors.blueGrey[50],
          borderRadius: BorderRadius.circular(20.r),
        ),
        child: Icon(Icons.person, size: 72.sp, color: Colors.blueGrey[300]),
      );
    }
    return Column(children:[
      ClipRRect(
        borderRadius: BorderRadius.circular(20.r),
        child: SizedBox(
          height: 220.h,
          width: double.infinity,
          child: PageView.builder(
            controller: _pc,
            itemCount: widget.images.length,
            onPageChanged: (i)=> setState(()=> index=i),
            itemBuilder: (_, i){
              final url = widget.images[i];
              return Image.network(url, fit: BoxFit.cover);
            },
          ),
        ),
      ),
      if (widget.images.length>1)
        Padding(
          padding: EdgeInsets.only(top:8.h),
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(widget.images.length, (i){
            final active = i==index;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: EdgeInsets.symmetric(horizontal:3.w),
              height: 6.w,
              width: active? 18.w : 6.w,
              decoration: BoxDecoration(
                color: active? Colors.blueAccent : Colors.grey[400],
                borderRadius: BorderRadius.circular(30.r),
              ),
            );
          })),
        )
    ]);
  }
}
