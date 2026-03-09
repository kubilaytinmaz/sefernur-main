import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../data/services/auth/auth_service.dart';

// Dynamic, editable profile header widget.
class ProfileHeader extends StatefulWidget {
  const ProfileHeader({super.key});
  @override
  State<ProfileHeader> createState() => _ProfileHeaderState();
}

class _ProfileHeaderState extends State<ProfileHeader> {
  final _editing = false.obs;
  final _loading = false.obs;
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _pickedImage = Rx<XFile?>(null);

  AuthService get _auth => Get.find<AuthService>();

  @override
  void initState() {
    super.initState();
    _fillFromUser();
    ever(_auth.user, (_) => _fillFromUser());
  }

  void _fillFromUser() {
    final u = _auth.user.value;
    _firstNameCtrl.text = u.firstName ?? '';
    _lastNameCtrl.text = u.lastName ?? '';
    _phoneCtrl.text = u.phoneNumber ?? '';
    _emailCtrl.text = u.email ?? '';
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 900,
      imageQuality: 85,
    );
    if (img != null) _pickedImage.value = img;
  }

  Future<void> _save() async {
    final u = _auth.user.value;
    if (u.id == null) return;
    if (_firstNameCtrl.text.trim().isEmpty ||
        _lastNameCtrl.text.trim().isEmpty) {
      Get.snackbar(
        'Hata',
        'Ad ve soyad boş olamaz',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }
    _loading.value = true;
    final updated = u.copyWith(
      firstName: _firstNameCtrl.text.trim(),
      lastName: _lastNameCtrl.text.trim(),
      phoneNumber: _phoneCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
    );
    try {
      final res = await _auth.userRepository.updateUserData(updated).run();
      await res.match(
        (f) async {
          Get.snackbar(
            'Hata',
            f.message,
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.red,
            colorText: Colors.white,
          );
        },
        (ok) async {
          if (_pickedImage.value != null && updated.id != null) {
            final file = File(_pickedImage.value!.path);
            final imgRes = await _auth.userRepository
                .updateUserImage(file, updated.id!)
                .run();
            imgRes.match(
              (f) => Get.snackbar(
                'Hata',
                f.message,
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: Colors.red,
                colorText: Colors.white,
              ),
              (r) {},
            );
          }
          Get.snackbar(
            'Başarılı',
            'Profil güncellendi',
            snackPosition: SnackPosition.BOTTOM,
            backgroundColor: Colors.green,
            colorText: Colors.white,
          );
          _editing.value = false;
        },
      );
    } catch (e) {
      Get.snackbar(
        'Hata',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    } finally {
      _loading.value = false;
    }
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Yeşil arka plan üzerinde HER ZAMAN beyaz içerik (her iki modda da)
    const contentColor = Colors.white;
    const contentColorLight = Colors.white70;
    
    return Obx(() {
      final u = _auth.user.value;
      if (u.id == null) {
        return const SizedBox(
          height: 130,
          child: Center(child: CircularProgressIndicator(color: Colors.white)),
        );
      }
      final fullName = '${u.firstName ?? ''} ${u.lastName ?? ''}'.trim();
      return Column(
        children: [
          Row(
            children: [
              Obx(
                () => Stack(
                  children: [
                    CircleAvatar(
                      radius: 46.r,
                      backgroundColor: Colors.white,
                      backgroundImage: _pickedImage.value != null
                          ? FileImage(File(_pickedImage.value!.path))
                          : (u.imageUrl != null &&
                                (u.imageUrl ?? '').isNotEmpty)
                          ? NetworkImage(u.imageUrl!) as ImageProvider
                          : const AssetImage('assets/images/app_icon.png'),
                    ),
                    Positioned(
                      bottom: 2,
                      right: 2,
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          width: 32.w,
                          height: 32.w,
                          decoration: BoxDecoration(
                            color: Get.theme.primaryColor,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: const [
                              BoxShadow(color: Colors.black26, blurRadius: 4),
                            ],
                          ),
                          child: Icon(
                            Icons.camera_alt,
                            size: 16.sp,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fullName.isEmpty ? 'İsimsiz Kullanıcı' : fullName,
                      style: TextStyle(
                        fontSize: 20.sp,
                        fontWeight: FontWeight.w600,
                        color: contentColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if ((u.email ?? '').isNotEmpty) ...[
                      SizedBox(height: 4.h),
                      Text(
                        u.email ?? '',
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: contentColorLight,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              Obx(
                () => IconButton(
                  onPressed: _loading.value
                      ? null
                      : () => _editing.value ? _save() : _editing.value = true,
                  icon: _loading.value
                      ? SizedBox(
                          width: 20.w,
                          height: 20.w,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: contentColor,
                          ),
                        )
                      : Icon(
                          _editing.value ? Icons.save : Icons.edit,
                          color: contentColor,
                        ),
                ),
              ),
            ],
          ),
          Obx(() => _editing.value ? _editForm() : const SizedBox.shrink()),
        ],
      );
    });
  }

  Widget _editForm() {
    // Yeşil arka plan üzerinde her zaman beyaz
    const borderColor = Colors.white24;
    final bgColor = Colors.white.withOpacity(0.08);
    
    return Container(
      width: double.infinity,
      margin: EdgeInsets.only(top: 18.h),
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: _field(_firstNameCtrl, 'Ad')),
              SizedBox(width: 14.w),
              Expanded(child: _field(_lastNameCtrl, 'Soyad')),
            ],
          ),
          SizedBox(height: 14.h),
          _field(_phoneCtrl, 'Telefon', keyboard: TextInputType.phone),
          SizedBox(height: 14.h),
          _field(_emailCtrl, 'E-posta', keyboard: TextInputType.emailAddress),
          SizedBox(height: 22.h),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    _fillFromUser();
                    _pickedImage.value = null;
                    _editing.value = false;
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                  ),
                  child: const Text('Vazgeç'),
                ),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: ElevatedButton(
                  onPressed: _loading.value ? null : _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                  ),
                  child: Text(
                    'Kaydet',
                    style: TextStyle(color: Get.theme.primaryColor),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _field(
    TextEditingController c,
    String label, {
    TextInputType? keyboard,
  }) {
    return TextField(
      controller: c,
      keyboardType: keyboard,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        enabledBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Colors.white24),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: Get.theme.primaryColor),
        ),
      ),
    );
  }
}
