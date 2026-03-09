import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../data/enums/place_city.dart';
import '../../../data/providers/firebase/firebase_api.dart';
import '../../../data/services/place/place_service.dart';
import '../../themes/colors/app_colors.dart';

class PlaceCreateSheet extends StatefulWidget {
  final PlaceCity city;
  final bool showAllAfterCreate;
  const PlaceCreateSheet({
    super.key,
    required this.city,
    this.showAllAfterCreate = false,
  });

  static Future<void> show(PlaceCity city, {bool showAllAfterCreate = false}) async {
    Get.bottomSheet(
      PlaceCreateSheet(city: city, showAllAfterCreate: showAllAfterCreate),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  State<PlaceCreateSheet> createState() => _PlaceCreateSheetState();
}

class _PlaceCreateSheetState extends State<PlaceCreateSheet> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _short = TextEditingController();
  final _long = TextEditingController();
  final _locationUrl = TextEditingController();
  late PlaceCity _city;
  bool _active = true;
  bool _saving = false;
  final List<File> _picked = [];
  final List<String> _uploaded = [];

  @override
  void initState() {
    super.initState();
    _city = widget.city;
  }

  @override
  void dispose() {
    _title.dispose();
    _short.dispose();
    _long.dispose();
    _locationUrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;
    final borderColor = isDark ? Colors.grey.shade700 : Colors.grey.shade300;
    final inputFillColor = isDark ? const Color(0xFF2D2D2D) : Colors.grey.shade50;

    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Material(
          color: surfaceColor,
          borderRadius: radius,
          clipBehavior: Clip.antiAlias,
          elevation: 8,
          child: Form(
            key: _formKey,
            child: ListView(
              controller: scrollController,
              padding: EdgeInsets.fromLTRB(
                22,
                14,
                22,
                24 + MediaQuery.of(context).viewPadding.bottom,
              ),
              children: [
                // Drag handle
                Center(
                  child: Container(
                    width: 48,
                    height: 5,
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Yeni Yer',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: textColor,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close_rounded, color: subtitleColor),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _field('Başlık', _title, isDark, textColor, borderColor, inputFillColor),
                _field('Kısa Açıklama', _short, isDark, textColor, borderColor, inputFillColor),
                _field('Detaylı Açıklama', _long, isDark, textColor, borderColor, inputFillColor, maxLines: 4),
                _field('Harita / Konum URL', _locationUrl, isDark, textColor, borderColor, inputFillColor),
                DropdownButtonFormField<PlaceCity>(
                  initialValue: _city,
                  decoration: _dec('Şehir', isDark, borderColor, inputFillColor),
                  dropdownColor: surfaceColor,
                  style: TextStyle(color: textColor, fontSize: 16),
                  items: PlaceCity.values
                      .map((e) => DropdownMenuItem(
                            value: e,
                            child: Text(e.label),
                          ))
                      .toList(),
                  onChanged: (v) {
                    if (v != null) setState(() => _city = v);
                  },
                ),
                SwitchListTile(
                  value: _active,
                  onChanged: (v) => setState(() => _active = v),
                  contentPadding: EdgeInsets.zero,
                  title: Text('Aktif', style: TextStyle(color: textColor)),
                  activeThumbColor: AppColors.medinaGreen40,
                ),
                const SizedBox(height: 4),
                _imagesArea(isDark, subtitleColor),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _saving ? null : _submit,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.add_photo_alternate_outlined),
                    label: Text(_saving ? 'Kaydediliyor...' : 'Ekle'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.medinaGreen40,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  InputDecoration _dec(String label, bool isDark, Color borderColor, Color inputFillColor) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(
        color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
      ),
      filled: true,
      fillColor: inputFillColor,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: borderColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: borderColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide(color: AppColors.medinaGreen40, width: 2),
      ),
    );
  }

  Widget _field(
    String label,
    TextEditingController c,
    bool isDark,
    Color textColor,
    Color borderColor,
    Color inputFillColor, {
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: c,
        maxLines: maxLines,
        validator: (v) => (v == null || v.trim().isEmpty) ? 'Gerekli' : null,
        style: TextStyle(color: textColor),
        decoration: _dec(label, isDark, borderColor, inputFillColor),
      ),
    );
  }

  Widget _imagesArea(bool isDark, Color subtitleColor) {
    final placeholderColor = isDark ? Colors.grey.shade400 : Colors.black54;
    final bgColor = isDark ? const Color(0xFF2D2D2D) : Colors.grey.shade100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Görseller',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: subtitleColor,
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 110,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemBuilder: (_, i) {
              if (i == _uploaded.length) {
                return GestureDetector(
                  onTap: _pickImages,
                  child: Container(
                    width: 110,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: AppColors.medinaGreen40.withOpacity(.35),
                      ),
                      borderRadius: BorderRadius.circular(16),
                      color: bgColor,
                    ),
                    child: Center(
                      child: Icon(
                        Icons.add_a_photo_outlined,
                        color: placeholderColor,
                      ),
                    ),
                  ),
                );
              }
              final url = _uploaded[i];
              return ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.network(url, width: 110, height: 110, fit: BoxFit.cover),
              );
            },
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemCount: _uploaded.length + 1,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '${_uploaded.length} görsel yüklendi',
          style: TextStyle(fontSize: 11, color: subtitleColor),
        ),
      ],
    );
  }

  Future<void> _pickImages() async {
    final picker = ImagePicker();
    final files = await picker.pickMultiImage(imageQuality: 85, maxWidth: 1600);
    if (files.isNotEmpty) {
      setState(() => _picked.addAll(files.map((x) => File(x.path))));
      for (final f in _picked) {
        final path =
            'places/${DateTime.now().millisecondsSinceEpoch}_${f.path.split('/').last}';
        final up = await FirebaseApi()
            .uploadFile(path: path, file: f, builder: (url) => url)
            .run();
        up.match((l) {}, (r) {
          setState(() => _uploaded.add(r as String));
        });
      }
      _picked.clear();
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_uploaded.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('En az 1 görsel gerekli')),
      );
      return;
    }
    setState(() => _saving = true);
    final ok = await Get.find<PlaceService>().addPlace(
      title: _title.text.trim(),
      shortDescription: _short.text.trim(),
      longDescription: _long.text.trim(),
      city: _city,
      images: _uploaded,
      isActive: _active,
      locationUrl: _locationUrl.text.trim().isEmpty ? null : _locationUrl.text.trim(),
    );
    if (ok && mounted) Navigator.of(context).pop();
    if (mounted) setState(() => _saving = false);
  }
}
