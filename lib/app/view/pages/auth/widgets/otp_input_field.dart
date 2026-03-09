import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:pinput/pinput.dart';

import '../../../themes/theme.dart';

class OTPInputField extends StatelessWidget {
  final Function(String) onCompleted;
  final Function(String)? onChanged;
  final bool hasError;
  final String? errorText;
  final int length;

  const OTPInputField({
    super.key,
    required this.onCompleted,
    this.onChanged,
    this.hasError = false,
    this.errorText,
    this.length = 6,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final defaultPinTheme = PinTheme(
      width: 50.w,
      height: 56.h,
      textStyle: TextStyle(
        fontSize: 20.sp,
        fontWeight: FontWeight.w600,
        color: isDark ? Colors.white : Colors.black87,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2D2D2D) : Colors.grey[50],
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(
          color: isDark ? Colors.grey.shade700 : Colors.grey[300]!,
          width: 1.5,
        ),
      ),
    );

    final focusedPinTheme = defaultPinTheme.copyWith(
      decoration: defaultPinTheme.decoration?.copyWith(
        border: Border.all(
          color: AppColors.medinaGreen40,
          width: 2,
        ),
        color: isDark ? const Color(0xFF3D3D3D) : Colors.white,
      ),
    );

    final submittedPinTheme = defaultPinTheme.copyWith(
      decoration: defaultPinTheme.decoration?.copyWith(
        border: Border.all(
          color: AppColors.medinaGreen40.withOpacity(0.5),
          width: 1.5,
        ),
        color: AppColors.medinaGreen40.withOpacity(isDark ? 0.15 : 0.05),
      ),
    );

    final errorPinTheme = defaultPinTheme.copyWith(
      decoration: defaultPinTheme.decoration?.copyWith(
        border: Border.all(
          color: Colors.red,
          width: 2,
        ),
        color: Colors.red.withOpacity(isDark ? 0.15 : 0.05),
      ),
    );

    return Column(
      children: [
        Pinput(
          length: length,
          defaultPinTheme: hasError ? errorPinTheme : defaultPinTheme,
          focusedPinTheme: hasError ? errorPinTheme : focusedPinTheme,
          submittedPinTheme: hasError ? errorPinTheme : submittedPinTheme,
          showCursor: true,
          cursor: Container(
            width: 2.w,
            height: 24.h,
            decoration: BoxDecoration(
              color: AppColors.medinaGreen40,
              borderRadius: BorderRadius.circular(1.r),
            ),
          ),
          onCompleted: onCompleted,
          onChanged: onChanged,
          hapticFeedbackType: HapticFeedbackType.lightImpact,
          keyboardType: TextInputType.number,
        ),
        
        if (errorText != null && hasError) ...[
          SizedBox(height: 12.h),
          Text(
            errorText!,
            style: TextStyle(
              color: Colors.red,
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }
}

class OTPTimer extends StatefulWidget {
  final int duration;
  final VoidCallback onTimerFinished;
  final VoidCallback onResend;

  const OTPTimer({
    super.key,
    this.duration = 60,
    required this.onTimerFinished,
    required this.onResend,
  });

  @override
  State<OTPTimer> createState() => _OTPTimerState();
}

class _OTPTimerState extends State<OTPTimer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late int _remainingTime;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _remainingTime = widget.duration;
    _controller = AnimationController(
      duration: Duration(seconds: widget.duration),
      vsync: this,
    );

    _controller.addListener(() {
      setState(() {
        _remainingTime = (widget.duration * (1 - _controller.value)).round();
      });
    });

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() {
          _canResend = true;
        });
        widget.onTimerFinished();
      }
    });

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _resetTimer() {
    setState(() {
      _canResend = false;
      _remainingTime = widget.duration;
    });
    _controller.reset();
    _controller.forward();
    widget.onResend();
  }

  String get _timerText {
    final minutes = _remainingTime ~/ 60;
    final seconds = _remainingTime % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final timerColor = isDark ? Colors.grey.shade400 : Colors.grey[600];
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (!_canResend) ...[
          Icon(
            Icons.timer_outlined,
            size: 16.sp,
            color: timerColor,
          ),
          SizedBox(width: 8.w),
          Text(
            'Yeniden gönder: $_timerText',
            style: TextStyle(
              fontSize: 14.sp,
              color: timerColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ] else ...[
          TextButton(
            onPressed: _resetTimer,
            style: TextButton.styleFrom(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            child: Text(
              'Kodu Yeniden Gönder',
              style: TextStyle(
                fontSize: 14.sp,
                color: AppColors.medinaGreen40,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ],
    );
  }
}
