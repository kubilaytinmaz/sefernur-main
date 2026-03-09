import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactButtons extends StatelessWidget {
  final String? phone; final String? sms; final String? whatsapp; final MainAxisAlignment alignment;
  const ContactButtons({super.key, this.phone, this.sms, this.whatsapp, this.alignment = MainAxisAlignment.spaceEvenly});
  @override
  Widget build(BuildContext context){
    final list = <Widget>[
      _btn(Icons.phone, 'Telefon', phone, _launchTel),
      _btn(Icons.sms, 'SMS', sms ?? phone, _launchSms),
      _btn(Icons.chat, 'WhatsApp', whatsapp ?? phone, _launchWhatsApp),
    ].where((e)=> e.key != const ValueKey('empty')).toList();
    if (list.isEmpty) return const SizedBox();
    return Row(mainAxisAlignment: alignment, children: list);
  }
  Widget _btn(IconData icon, String label, String? v, Future<void> Function(String) launcher){
    final value = (v ?? '').trim(); if (value.isEmpty) return const SizedBox(key: ValueKey('empty'));
    return Expanded(child: Padding(padding: EdgeInsets.symmetric(horizontal:4.w), child: ElevatedButton.icon(
      onPressed: ()=> launcher(value), icon: Icon(icon, size:18.sp), label: FittedBox(child: Text(label, style: TextStyle(fontSize:12.sp, fontWeight: FontWeight.w600))),
      style: ElevatedButton.styleFrom(elevation:0, backgroundColor: Colors.blueGrey[50], foregroundColor: Colors.blueGrey[800], padding: EdgeInsets.symmetric(horizontal:12.w, vertical:12.h), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18.r))),
    )));
  }
  Future<void> _launchTel(String phone) async => _safeLaunch(Uri(scheme:'tel', path: phone));
  Future<void> _launchSms(String phone) async => _safeLaunch(Uri(scheme:'sms', path: phone));
  Future<void> _launchWhatsApp(String phone) async { final cleaned = phone.replaceAll(RegExp(r'[^0-9+]'), ''); await _safeLaunch(Uri.parse('https://wa.me/$cleaned')); }
  Future<void> _safeLaunch(Uri uri) async { try { if (await canLaunchUrl(uri)) { await launchUrl(uri, mode: LaunchMode.externalApplication); } } catch (_){} }
}
