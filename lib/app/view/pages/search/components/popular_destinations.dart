import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:latlong2/latlong.dart';

import '../../../../data/models/address/address_model.dart';

class PopularDestinations extends StatelessWidget {
  final void Function(AddressModel) onSelect;
  final String? title;
  final EdgeInsetsGeometry? padding;
  final bool dense;
  final bool horizontalScroll;
  /// Seçili adresleri belirlemek için (şehir adına göre eşleşme)
  final List<AddressModel>? selectedAddresses;

  const PopularDestinations({
    super.key,
    required this.onSelect,
    this.title,
    this.padding,
    this.dense = true,
    this.horizontalScroll = false,
    this.selectedAddresses,
  });

  static final List<_Preset> _presets = [
    _Preset(
      label: 'Mekke',
      icon: Icons.location_city,
      address: AddressModel(
        location: const LatLng(21.3891, 39.8579),
        address: 'Mekke, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Mekke',
        state: 'Mekke',
      ),
    ),
    _Preset(
      label: 'Medine',
      icon: Icons.location_city,
      address: AddressModel(
        location: const LatLng(24.4686, 39.6142),
        address: 'Medine, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Medine',
        state: 'Medine',
      ),
    ),
    _Preset(
      label: 'Cidde',
      icon: Icons.location_city,
      address: AddressModel(
        location: const LatLng(21.4858, 39.1925),
        address: 'Cidde, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Cidde',
        state: 'Mekke',
      ),
    ),
    _Preset(
      label: 'Taif',
      icon: Icons.location_city,
      address: AddressModel(
        location: const LatLng(21.2701, 40.4158),
        address: 'Taif, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Taif',
        state: 'Mekke',
      ),
    ),
    _Preset(
      label: 'Mina',
      icon: Icons.mosque,
      address: AddressModel(
        location: const LatLng(21.4133, 39.8931),
        address: 'Mina, Mekke, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Mina',
        state: 'Mekke',
      ),
    ),
    _Preset(
      label: 'Arafat',
      icon: Icons.mosque,
      address: AddressModel(
        location: const LatLng(21.3549, 39.9842),
        address: 'Arafat, Mekke, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Arafat',
        state: 'Mekke',
      ),
    ),
    _Preset(
      label: 'Müzdelife',
      icon: Icons.mosque,
      address: AddressModel(
        location: const LatLng(21.3894, 39.9333),
        address: 'Müzdelife, Mekke, Suudi Arabistan',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        city: 'Müzdelife',
        state: 'Mekke',
      ),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final pad = padding ?? EdgeInsets.only(top: 8.h);
    return Padding(
      padding: pad,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null)
            Padding(
              padding: EdgeInsets.only(bottom: 6.h),
              child: Text(
                title!,
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.grey.shade300 : Colors.grey[700],
                ),
              ),
            ),
          if (horizontalScroll)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _presets.map((p) => Padding(
                  padding: EdgeInsets.only(right: 8.w),
                  child: _buildChip(p, isDark),
                )).toList(),
              ),
            )
          else
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: _presets.map((p) => _buildChip(p, isDark)).toList(),
            ),
        ],
      ),
    );
  }

  bool _isSelected(_Preset p) {
    if (selectedAddresses == null || selectedAddresses!.isEmpty) return false;
    return selectedAddresses!.any((a) => 
      a.city.toLowerCase() == p.address.city.toLowerCase() ||
      a.address.toLowerCase().contains(p.label.toLowerCase())
    );
  }

  Widget _buildChip(_Preset p, bool isDark) {
    final isSelected = _isSelected(p);
    final primaryColor = isDark ? Colors.green.shade400 : Colors.green.shade600;
    
    return ActionChip(
      visualDensity: dense ? const VisualDensity(horizontal: -2, vertical: -2) : VisualDensity.standard,
      avatar: Icon(
        isSelected ? Icons.check_circle : p.icon, 
        size: 16.sp, 
        color: isSelected ? primaryColor : (isDark ? Colors.grey.shade400 : Colors.grey[700]),
      ),
      label: Text(
        p.label, 
        style: TextStyle(
          fontSize: 12.sp, 
          fontWeight: FontWeight.w600,
          color: isSelected ? primaryColor : (isDark ? Colors.grey.shade300 : Colors.grey[800]),
        ),
      ),
      onPressed: () => onSelect(p.address),
      shape: StadiumBorder(
        side: BorderSide(
          color: isSelected ? primaryColor : (isDark ? Colors.grey.shade600 : Colors.grey[300]!),
          width: isSelected ? 1.5 : 1,
        ),
      ),
      backgroundColor: isSelected 
          ? primaryColor.withOpacity(0.1) 
          : (isDark ? Colors.grey.shade800 : Colors.white),
      elevation: 0,
    );
  }
}

class _Preset {
  final String label;
  final IconData icon;
  final AddressModel address;
  const _Preset({required this.label, required this.icon, required this.address});
}
