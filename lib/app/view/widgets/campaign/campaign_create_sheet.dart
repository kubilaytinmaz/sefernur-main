import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../data/enums/campaign_type.dart';
import '../../../data/providers/firebase/firebase_api.dart';
import '../../../data/services/campaign/campaign_service.dart';
import '../../themes/colors/app_colors.dart';
import 'campaign_list_sheet.dart';

class CampaignCreateSheet extends StatefulWidget {
  const CampaignCreateSheet({super.key});

  static Future<void> show() async {
    Get.bottomSheet(
      const CampaignCreateSheet(),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  State<CampaignCreateSheet> createState() => _CampaignCreateSheetState();
}

class _CampaignCreateSheetState extends State<CampaignCreateSheet> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _short = TextEditingController();
  final _long = TextEditingController();
  File? _pickedImageFile;
  String? _uploadedUrl;
  CampaignType _type = CampaignType.hotel;
  bool _saving = false;

  @override
  void dispose() {
    _title.dispose();
    _short.dispose();
    _long.dispose();
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
                      Container(
                        width: 6,
                        height: 48,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              AppColors.medinaGreen40,
                              AppColors.medinaGreen40.withOpacity(0.6),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Yeni Kampanya',
                              style: TextStyle(
                                fontSize: 21,
                                fontWeight: FontWeight.w700,
                                color: textColor,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Kampanya bilgilerini doldurun',
                              style: TextStyle(
                                fontSize: 12.5,
                                color: subtitleColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: Icon(Icons.close, color: subtitleColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  _field(
                    label: 'Başlık',
                    controller: _title,
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Gerekli' : null,
                    isDark: isDark,
                    inputFillColor: inputFillColor,
                    textColor: textColor,
                    borderColor: borderColor,
                  ),
                  _field(
                    label: 'Kısa Açıklama',
                    controller: _short,
                    maxLines: 2,
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Gerekli' : null,
                    isDark: isDark,
                    inputFillColor: inputFillColor,
                    textColor: textColor,
                    borderColor: borderColor,
                  ),
                  _field(
                    label: 'Detaylı Açıklama',
                    controller: _long,
                    maxLines: 4,
                    validator: (v) =>
                        (v == null || v.trim().isEmpty) ? 'Gerekli' : null,
                    isDark: isDark,
                    inputFillColor: inputFillColor,
                    textColor: textColor,
                    borderColor: borderColor,
                  ),
                  _imagePickerArea(isDark, subtitleColor),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<CampaignType>(
                          initialValue: _type,
                          decoration: _inputDecoration(
                            'Tür',
                            isDark: isDark,
                            inputFillColor: inputFillColor,
                            borderColor: borderColor,
                          ),
                          dropdownColor: isDark ? const Color(0xFF2D2D2D) : Colors.white,
                          style: TextStyle(color: textColor, fontSize: 14),
                          items: CampaignType.values
                              .map((e) => DropdownMenuItem(
                                    value: e,
                                    child: Text(e.label),
                                  ))
                              .toList(),
                          onChanged: (v) {
                            if (v != null) setState(() => _type = v);
                          },
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(child: SizedBox()),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.medinaGreen40,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      icon: _saving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.save_outlined),
                      label: Text(_saving ? 'Kaydediliyor...' : 'Kaydet'),
                      onPressed: _saving ? null : _submit,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Center(
                    child: TextButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        Future.delayed(const Duration(milliseconds: 120), () {
                          CampaignListSheet.show(showAll: true);
                        });
                      },
                      child: Text(
                        'Kaydedilen Kampanyalar',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.medinaGreen40,
                        ),
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

  InputDecoration _inputDecoration(
    String label, {
    required bool isDark,
    required Color inputFillColor,
    required Color borderColor,
  }) {
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

  Widget _field({
    required String label,
    required TextEditingController controller,
    int maxLines = 1,
    String? Function(String?)? validator,
    required bool isDark,
    required Color inputFillColor,
    required Color textColor,
    required Color borderColor,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        validator: validator,
        style: TextStyle(color: textColor),
        decoration: _inputDecoration(
          label,
          isDark: isDark,
          inputFillColor: inputFillColor,
          borderColor: borderColor,
        ),
      ),
    );
  }

  Widget _imagePickerArea(bool isDark, Color subtitleColor) {
    const ratio = 16 / 9;
    final placeholderColor = isDark ? Colors.grey.shade400 : Colors.black54;
    final bgColor = isDark ? const Color(0xFF2D2D2D) : Colors.grey.shade100;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Görsel',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: subtitleColor,
          ),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: _pickImage,
          child: AspectRatio(
            aspectRatio: ratio,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: AppColors.medinaGreen40.withOpacity(.25),
                  width: 1.3,
                ),
                color: bgColor,
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  if (_pickedImageFile != null)
                    Positioned.fill(
                      child: Image.file(_pickedImageFile!, fit: BoxFit.cover),
                    )
                  else if (_uploadedUrl != null)
                    Positioned.fill(
                      child: Image.network(_uploadedUrl!, fit: BoxFit.cover),
                    )
                  else
                    Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.image_outlined,
                            size: 42,
                            color: placeholderColor,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '16:9 görsel seçin',
                            style: TextStyle(
                              fontSize: 12.5,
                              color: placeholderColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Positioned(
                    right: 10,
                    bottom: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.medinaGreen40.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.edit, size: 16, color: Colors.white),
                          SizedBox(width: 6),
                          Text(
                            'Seç',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 14),
      ],
    );
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final result = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      imageQuality: 85,
    );
    if (result != null) {
      setState(() {
        _pickedImageFile = File(result.path);
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    // require image
    if (_pickedImageFile == null && _uploadedUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Görsel seçin')),
      );
      setState(() => _saving = false);
      return;
    }
    // upload if file chosen and not uploaded yet
    if (_pickedImageFile != null) {
      final storagePath =
          'campaigns/${DateTime.now().millisecondsSinceEpoch}_${_pickedImageFile!.path.split('/').last}';
      final uploadRes = await FirebaseApi()
          .uploadFile(path: storagePath, file: _pickedImageFile!, builder: (url) => url)
          .run();
      _uploadedUrl = uploadRes.match((l) => null, (r) => r as String?);
      if (_uploadedUrl == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Yükleme başarısız')),
        );
        setState(() => _saving = false);
        return;
      }
    }
    final ok = await Get.find<CampaignService>().addCampaign(
      title: _title.text.trim(),
      shortDescription: _short.text.trim(),
      longDescription: _long.text.trim(),
      imageUrl: _uploadedUrl!,
      type: _type,
      isActive: true,
    );
    if (ok && mounted) {
      Navigator.of(context).pop();
    }
    if (mounted) setState(() => _saving = false);
  }
}
