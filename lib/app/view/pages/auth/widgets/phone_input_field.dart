import 'package:country_code_picker/country_code_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../themes/theme.dart';

class PhoneInputField extends StatelessWidget {
  final TextEditingController controller;
  final Function(CountryCode)? onCountryChanged;
  final CountryCode? initialCountryCode;
  final String? errorText;
  final bool enabled;

  const PhoneInputField({
    super.key,
    required this.controller,
    this.onCountryChanged,
    this.initialCountryCode,
    this.errorText,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    // Hajj and Umrah related countries (Islamic countries)
    final List<String> islamicCountries = [
      'SA', // Saudi Arabia
      'TR', // Turkey
      'AE', // UAE
      'EG', // Egypt
      'JO', // Jordan
      'MA', // Morocco
      'TN', // Tunisia
      'DZ', // Algeria
      'LB', // Lebanon
      'SY', // Syria
      'IQ', // Iraq
      'IR', // Iran
      'AF', // Afghanistan
      'PK', // Pakistan
      'BD', // Bangladesh
      'ID', // Indonesia
      'MY', // Malaysia
      'BN', // Brunei
      'MV', // Maldives
      'KW', // Kuwait
      'QA', // Qatar
      'BH', // Bahrain
      'OM', // Oman
      'YE', // Yemen
      'PS', // Palestine
      'AZ', // Azerbaijan
      'KZ', // Kazakhstan
      'KG', // Kyrgyzstan
      'TJ', // Tajikistan
      'TM', // Turkmenistan
      'UZ', // Uzbekistan
      'SN', // Senegal
      'ML', // Mali
      'NE', // Niger
      'TD', // Chad
      'SD', // Sudan
      'SO', // Somalia
      'DJ', // Djibouti
      'KM', // Comoros
      'GM', // Gambia
      'GN', // Guinea
      'SL', // Sierra Leone
      'BF', // Burkina Faso
      'LY', // Libya
      'MR', // Mauritania
      'NG', // Nigeria (has large Muslim population)
    ];

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = isDark ? const Color(0xFF2D2D2D) : Colors.grey[50];
    final borderColorNormal = isDark ? Colors.grey.shade700 : Colors.grey[200]!;
    final dividerColor = isDark ? Colors.grey.shade600 : Colors.grey[300]!;
    final textColorMain = isDark ? Colors.white : Colors.black87;
    final textColorDisabled = isDark ? Colors.grey.shade500 : Colors.grey[500];
    final hintColor = isDark ? Colors.grey.shade500 : Colors.grey[400];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(
              color: errorText != null ? Colors.red : borderColorNormal,
              width: errorText != null ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              // Country Code Picker
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8.w),
                decoration: BoxDecoration(
                  border: Border(
                    right: BorderSide(color: dividerColor, width: 1),
                  ),
                ),
                child: CountryCodePicker(
                  onChanged: onCountryChanged,
                  initialSelection: initialCountryCode?.code ?? 'TR',
                  favorite: const ['TR', 'SA', 'AE', 'EG'],
                  countryFilter: islamicCountries,
                  showCountryOnly: false,
                  showOnlyCountryWhenClosed: true,
                  showFlag: false,
                  alignLeft: false,
                  textStyle: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                    color: enabled ? textColorMain : textColorDisabled,
                  ),
                  padding: EdgeInsets.zero,
                  margin: EdgeInsets.zero,
                  flagWidth: 24.w,
                  closeIcon: Icon(
                    Icons.close,
                    size: 20.sp,
                    color: AppColors.medinaGreen40,
                  ),
                  searchStyle: TextStyle(
                    fontSize: 14.sp,
                    color: textColorMain,
                  ),
                  searchDecoration: InputDecoration(
                    hintText: 'Ülke ara...',
                    hintStyle: TextStyle(
                      fontSize: 14.sp,
                      color: hintColor,
                    ),
                    prefixIcon: Icon(
                      Icons.search,
                      size: 20.sp,
                      color: AppColors.medinaGreen40,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: dividerColor),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8.r),
                      borderSide: BorderSide(color: AppColors.medinaGreen40, width: 2),
                    ),
                  ),
                  dialogTextStyle: TextStyle(
                    fontSize: 14.sp,
                    color: textColorMain,
                  ),
                  dialogSize: Size(Get.width * 0.9, Get.height * 0.6),
                  emptySearchBuilder: (context) => Center(
                    child: Text(
                      'Ülke bulunamadı',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: isDark ? Colors.grey.shade400 : Colors.grey[600],
                      ),
                    ),
                  ),
                ),
              ),
              
              // Phone Number Input
              Expanded(
                child: TextFormField(
                  controller: controller,
                  enabled: enabled,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    PhoneNumberFormatter(),
                  ],
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w500,
                    color: enabled ? textColorMain : textColorDisabled,
                  ),
                  decoration: InputDecoration(
                    hintText: '555 123 45 67',
                    hintStyle: TextStyle(
                      fontSize: 14.sp,
                      color: hintColor,
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16.w,
                      vertical: 16.h,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        
        if (errorText != null) ...[
          SizedBox(height: 8.h),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.w),
            child: Text(
              errorText!,
              style: TextStyle(
                color: Colors.red,
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class PhoneNumberFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text;
    
    if (text.isEmpty) {
      return newValue;
    }
    
    String formatted = '';
    
    for (int i = 0; i < text.length && i < 10; i++) {
      if (i == 3 || i == 6) {
        formatted += ' ';
      }
      if (i == 8) {
        formatted += ' ';
      }
      formatted += text[i];
    }
    
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
