import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../data/enums/campaign_type.dart';
import '../../../data/models/campaign/campaign_model.dart';
import '../../../data/providers/firebase/firebase_api.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../../data/services/campaign/campaign_service.dart';
import '../../../data/services/favorite/favorite_service.dart';
import '../../themes/colors/app_colors.dart';

class CampaignDetailSheet extends StatelessWidget {
  final CampaignModel model;
  const CampaignDetailSheet({super.key, required this.model});

  static Future<void> show(CampaignModel model) async {
    Get.bottomSheet(
      CampaignDetailSheet(model: model),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  Widget build(BuildContext context) {
    final userId = Get.isRegistered<AuthService>() &&
            Get.find<AuthService>().user.value.id != null
        ? Get.find<AuthService>().user.value.id!
        : 'anonymous';
    return _Body(model: model, userId: userId);
  }
}

class _Body extends StatelessWidget {
  final CampaignModel model;
  final String userId;
  const _Body({required this.model, required this.userId});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;
    final borderColor = isDark ? Colors.grey.shade700 : Colors.grey.shade300;

    final service = Get.find<CampaignService>();
    final auth = Get.find<AuthService>();
    
    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );
    
    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Material(
          color: surfaceColor,
          borderRadius: radius,
          clipBehavior: Clip.antiAlias,
          elevation: 8,
          child: CustomScrollView(
            controller: scrollController,
            slivers: [
              SliverToBoxAdapter(
                child: Stack(
                  children: [
                    _HeaderImage(model: model, isDark: isDark),
                    // Drag handle
                    Positioned(
                      top: 12,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: Container(
                          width: 48,
                          height: 5,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.6),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            model.title,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              letterSpacing: .3,
                              color: textColor,
                            ),
                          ),
                        ),
                        Obx(() {
                          final favService = Get.isRegistered<FavoriteService>()
                              ? Get.find<FavoriteService>()
                              : null;
                          final fresh = service.campaigns
                                  .firstWhereOrNull((c) => c.id == model.id) ??
                              model;
                          final saved = favService?.isFavorite(
                                      'campaign', fresh.id ?? '') ??
                              fresh.savedByUserIds.contains(userId);
                          return IconButton(
                            tooltip: saved ? 'Kaydedildi' : 'Kaydet',
                            onPressed: () async {
                              if (fresh.id == null) return;
                              if (favService != null) {
                                final meta = favService.buildMetaForEntity(
                                    type: 'campaign', model: fresh);
                                await favService.toggle(
                                    type: 'campaign',
                                    targetId: fresh.id!,
                                    meta: meta);
                              } else {
                                service.toggleSave(fresh);
                              }
                            },
                            icon: Icon(
                              saved ? Icons.favorite : Icons.favorite_border,
                              color: saved
                                  ? Colors.redAccent
                                  : subtitleColor,
                            ),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _chip(model.type.label, isDark: isDark),
                        if (!model.isActive)
                          _chip('Pasif', color: Colors.grey.shade600, isDark: isDark),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      model.shortDescription,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      model.longDescription,
                      style: TextStyle(
                        fontSize: 15,
                        height: 1.5,
                        color: subtitleColor,
                      ),
                    ),
                  ]),
                ),
              ),
              SliverFillRemaining(
                hasScrollBody: false,
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(
                      18,
                      12,
                      18,
                      18 + MediaQuery.of(context).viewPadding.bottom,
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.of(context).maybePop(),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: textColor,
                              side: BorderSide(color: borderColor),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: const Text('Kapat'),
                          ),
                        ),
                        if (auth.isUserAdmin()) ...[
                          const SizedBox(width: 14),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _EditCampaignSheet.show(model),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.medinaGreen40,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              icon: const Icon(Icons.edit),
                              label: const Text('Düzenle'),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _chip(String label, {Color? color, required bool isDark}) {
    final c = color ?? AppColors.medinaGreen40;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: c.withOpacity(isDark ? .2 : .08),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: c.withOpacity(.45)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w600,
          color: isDark ? c.withOpacity(0.9) : c.darken(),
        ),
      ),
    );
  }
}

class _HeaderImage extends StatelessWidget {
  final CampaignModel model;
  final bool isDark;
  const _HeaderImage({required this.model, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final isNet = model.imageUrl.startsWith('http');
    return SizedBox(
      height: 200,
      child: Stack(
        fit: StackFit.expand,
        children: [
          Positioned.fill(
            child: Hero(
              tag: 'cmp_${model.id}',
              child: isNet
                  ? Image.network(model.imageUrl, fit: BoxFit.cover)
                  : Image.asset(model.imageUrl, fit: BoxFit.cover),
            ),
          ),
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(.15),
                    Colors.black.withOpacity(.55),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            top: 12,
            right: 12,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(.35),
                borderRadius: BorderRadius.circular(14),
              ),
              child: IconButton(
                constraints: const BoxConstraints(),
                padding: const EdgeInsets.all(8),
                onPressed: () => Navigator.of(context).maybePop(),
                icon: const Icon(
                  Icons.close,
                  size: 20,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension _ColorX on Color {
  Color darken([double amount = .35]) {
    final f = 1 - amount;
    return Color.fromARGB(
      alpha,
      (red * f).round(),
      (green * f).round(),
      (blue * f).round(),
    );
  }
}

class _EditCampaignSheet extends StatefulWidget {
  final CampaignModel model;
  const _EditCampaignSheet({required this.model});

  static Future<void> show(CampaignModel model) async {
    Get.bottomSheet(
      _EditCampaignSheet(model: model),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  State<_EditCampaignSheet> createState() => _EditCampaignSheetState();
}

class _EditCampaignSheetState extends State<_EditCampaignSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _title;
  late TextEditingController _short;
  late TextEditingController _long;
  bool _active = true;
  CampaignType _type = CampaignType.hotel;
  File? _pickedImageFile;
  String? _uploadedUrl;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final m = widget.model;
    _title = TextEditingController(text: m.title);
    _short = TextEditingController(text: m.shortDescription);
    _long = TextEditingController(text: m.longDescription);
    _type = m.type;
    _active = m.isActive;
    _uploadedUrl = m.imageUrl;
  }

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
      topLeft: Radius.circular(28),
      topRight: Radius.circular(28),
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
                          'Kampanya Düzenle',
                          style: TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.w700,
                            color: textColor,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: Icon(Icons.close, color: subtitleColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _imagePicker(isDark, subtitleColor),
                  const SizedBox(height: 18),
                  _textField('Başlık', _title, isDark, textColor, borderColor, inputFillColor),
                  _textField('Kısa Açıklama', _short, isDark, textColor, borderColor, inputFillColor, maxLines: 2),
                  _textField('Detaylı Açıklama', _long, isDark, textColor, borderColor, inputFillColor, maxLines: 4),
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<CampaignType>(
                          initialValue: _type,
                          decoration: _decoration('Tür', isDark, borderColor, inputFillColor),
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
                      Expanded(
                        child: SwitchListTile(
                          value: _active,
                          onChanged: (v) => setState(() => _active = v),
                          title: Text('Aktif', style: TextStyle(color: textColor)),
                          contentPadding: EdgeInsets.zero,
                          activeThumbColor: AppColors.medinaGreen40,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _saving ? null : _save,
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
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.medinaGreen40,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
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

  InputDecoration _decoration(String label, bool isDark, Color borderColor, Color inputFillColor) {
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

  Widget _textField(
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
        decoration: _decoration(label, isDark, borderColor, inputFillColor),
      ),
    );
  }

  Widget _imagePicker(bool isDark, Color subtitleColor) {
    final placeholderColor = isDark ? Colors.grey.shade400 : Colors.black54;
    final bgColor = isDark ? const Color(0xFF2D2D2D) : Colors.grey.shade100;

    return GestureDetector(
      onTap: _pick,
      child: AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.medinaGreen40.withOpacity(.25)),
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
                        size: 40,
                        color: placeholderColor,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Görsel Seç',
                        style: TextStyle(fontSize: 12, color: placeholderColor),
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
                        'Değiştir',
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
    );
  }

  Future<void> _pick() async {
    final res = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1600,
      imageQuality: 85,
    );
    if (res != null) setState(() => _pickedImageFile = File(res.path));
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    // upload if changed
    if (_pickedImageFile != null) {
      final path =
          'campaigns/${DateTime.now().millisecondsSinceEpoch}_${_pickedImageFile!.path.split('/').last}';
      final uploadRes = await FirebaseApi()
          .uploadFile(
            path: path,
            file: _pickedImageFile!,
            builder: (url) => url,
          )
          .run();
      _uploadedUrl = uploadRes.match((l) => null, (r) => r as String?);
      if (_uploadedUrl == null) {
        setState(() => _saving = false);
        return;
      }
    }
    final ok = await Get.find<CampaignService>().updateCampaign(
      widget.model,
      title: _title.text.trim(),
      shortDescription: _short.text.trim(),
      longDescription: _long.text.trim(),
      imageUrl: _uploadedUrl,
      type: _type,
      isActive: _active,
    );
    if (ok && mounted) {
      Navigator.of(context).pop(); // close edit sheet
    }
    if (mounted) setState(() => _saving = false);
  }
}
