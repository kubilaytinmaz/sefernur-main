import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../controllers/address/address_controller.dart';
import '../../data/models/address/address_model.dart';
import '../themes/colors/app_colors.dart';
import 'destination_picker.dart';

/// Modern destinasyon seçim alanı widget'ı.
/// Referans görseldeki tasarıma uygun şekilde yapılmıştır.
///
/// Özellikler:
/// - Tıklandığında bottom sheet açılır
/// - Harita ikonu ile harita seçimine geçiş
/// - Seçili adres gösterimi
class DestinationField extends StatelessWidget {
  /// AddressController için benzersiz tag
  final String tag;

  /// Alan etiketi (varsayılan: 'Destinasyon')
  final String? label;

  /// Placeholder metni
  final String? placeholder;

  /// Değişiklik callback'i
  final void Function(AddressModel)? onChanged;

  /// Çoklu seçim için mevcut seçimler
  final List<AddressModel>? selectedAddresses;

  /// Çoklu seçim aktif mi
  final bool multiSelect;

  /// Özel ikon (varsayılan: location_on_outlined)
  final IconData? icon;

  const DestinationField({
    super.key,
    required this.tag,
    this.label,
    this.placeholder,
    this.onChanged,
    this.selectedAddresses,
    this.multiSelect = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Controller'ı bul veya oluştur
    final addressController = Get.isRegistered<AddressController>(tag: tag)
        ? Get.find<AddressController>(tag: tag)
        : Get.put(AddressController(), tag: tag);

    return Obx(() {
      final hasAddress =
          addressController.address.value.city.isNotEmpty ||
          addressController.address.value.address.isNotEmpty;

      final displayText = hasAddress
          ? _getDisplayText(addressController.address.value)
          : (placeholder ?? 'Destinasyon seçin');

      return GestureDetector(
        onTap: () => _showPicker(context, addressController),
        child: Container(
          decoration: BoxDecoration(
            color: isDark
                ? theme.colorScheme.surfaceContainerHighest
                : Colors.white,
            borderRadius: BorderRadius.circular(12.r),
            border: Border.all(
              color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
            ),
          ),
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
          child: Row(
            children: [
              // Location icon
              Icon(
                icon ?? Icons.location_on_outlined,
                size: 20.sp,
                color: hasAddress
                    ? AppColors.primary
                    : (isDark ? Colors.grey[400] : Colors.grey[600]),
              ),
              SizedBox(width: 12.w),

              // Text content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label ?? 'Destinasyon',
                      style: TextStyle(
                        fontSize: 10.sp,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      displayText,
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: hasAddress
                            ? FontWeight.w600
                            : FontWeight.w400,
                        color: hasAddress
                            ? theme.colorScheme.onSurface
                            : (isDark ? Colors.grey[500] : Colors.grey[500]),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              // Divider
              Container(
                width: 1,
                height: 30.h,
                margin: EdgeInsets.symmetric(horizontal: 12.w),
                color: isDark ? Colors.grey[700] : Colors.grey[300],
              ),

              // Map icon
              GestureDetector(
                onTap: () => _openMap(context),
                child: Container(
                  padding: EdgeInsets.all(8.w),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.grey[800] : Colors.grey[100],
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Icon(
                    Icons.map_outlined,
                    size: 20.sp,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  String _getDisplayText(AddressModel address) {
    final parts = <String>[];
    if (address.city.isNotEmpty) parts.add(address.city);
    if (address.state.isNotEmpty &&
        address.state.toLowerCase() != address.city.toLowerCase()) {
      parts.add(address.state);
    }
    if (address.country.isNotEmpty) parts.add(address.country);
    return parts.isEmpty ? address.address : parts.join(', ');
  }

  void _showPicker(BuildContext context, AddressController controller) async {
    final result = await DestinationPicker.show(
      context: context,
      tag: tag,
      title: label ?? 'Destinasyon Seç',
      selectedAddresses: selectedAddresses,
      multiSelect: multiSelect,
      onSelect: onChanged,
    );

    if (result != null && onChanged != null) {
      onChanged!(result);
    }
  }

  void _openMap(BuildContext context) {
    Get.toNamed('/select-location', arguments: {'tag': tag});
  }
}

/// Transfer için çift destinasyon alanı (Nereden - Nereye)
class TransferDestinationFields extends StatelessWidget {
  final String fromTag;
  final String toTag;
  final void Function(AddressModel)? onFromChanged;
  final void Function(AddressModel)? onToChanged;

  const TransferDestinationFields({
    super.key,
    required this.fromTag,
    required this.toTag,
    this.onFromChanged,
    this.onToChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // From field
        DestinationField(
          tag: fromTag,
          label: 'Nereden',
          placeholder: 'Başlangıç konumu seçin',
          icon: Icons.trip_origin,
          onChanged: onFromChanged,
        ),

        // Swap button
        Transform.translate(
          offset: Offset(0, -4.h),
          child: Align(
            alignment: Alignment.centerRight,
            child: Padding(
              padding: EdgeInsets.only(right: 16.w),
              child: _SwapButton(
                fromTag: fromTag,
                toTag: toTag,
                onSwapped: () {
                  // İsteğe bağlı: swap sonrası callback
                },
              ),
            ),
          ),
        ),

        // To field
        Transform.translate(
          offset: Offset(0, -8.h),
          child: DestinationField(
            tag: toTag,
            label: 'Nereye',
            placeholder: 'Varış konumu seçin',
            icon: Icons.flag_outlined,
            onChanged: onToChanged,
          ),
        ),
      ],
    );
  }
}

class _SwapButton extends StatelessWidget {
  final String fromTag;
  final String toTag;
  final VoidCallback? onSwapped;

  const _SwapButton({
    required this.fromTag,
    required this.toTag,
    this.onSwapped,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => _swap(),
      child: Container(
        padding: EdgeInsets.all(8.w),
        decoration: BoxDecoration(
          color: isDark ? theme.colorScheme.surface : Colors.white,
          shape: BoxShape.circle,
          border: Border.all(
            color: isDark ? theme.colorScheme.outline : Colors.grey[300]!,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(Icons.swap_vert, size: 20.sp, color: AppColors.primary),
      ),
    );
  }

  void _swap() {
    final fromController = Get.find<AddressController>(tag: fromTag);
    final toController = Get.find<AddressController>(tag: toTag);

    final tempAddress = fromController.address.value;
    final tempLatLng = fromController.getLatLng();

    fromController.setAddress(toController.address.value);
    if (toController.currentAddress.hasCoordinates) {
      fromController.setLatLng(toController.getLatLng());
    }

    toController.setAddress(tempAddress);
    if (tempAddress.location != null) {
      toController.setLatLng(tempLatLng);
    }

    onSwapped?.call();
  }
}
