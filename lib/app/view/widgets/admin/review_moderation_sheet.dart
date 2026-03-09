import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../data/services/review/review_service.dart';

/// Generic review moderation sheet for any target type.
/// Shows list of reviews with status filter and allows approve/reject/delete.
class ReviewModerationSheet extends StatefulWidget {
  const ReviewModerationSheet({super.key, required this.type, required this.targetId, required this.title});
  final String type; // hotel|car|transfer|guide|tour
  final String targetId;
  final String title;

  static Future<void> show({required String type, required String targetId, required String title}) async {
    final reviewService = Get.find<ReviewService>();
    await reviewService.loadTargetReviews(type, targetId);
    await Get.bottomSheet(
      ReviewModerationSheet(type: type, targetId: targetId, title: title),
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    );
  }

  @override
  State<ReviewModerationSheet> createState() => _ReviewModerationSheetState();
}

class _ReviewModerationSheetState extends State<ReviewModerationSheet> {
  late ReviewService service;
  final statuses = const [
    {'key':'pending','label':'Bekleyen'},
    {'key':'published','label':'Onaylı'},
    {'key':'rejected','label':'Reddedilen'},
    {'key':'all','label':'Hepsi'},
  ];

  // Simple in-memory cache for userId -> email
  final Map<String,String?> _userEmailCache = {};

  Future<String?> _fetchEmail(String userId) async {
    if (_userEmailCache.containsKey(userId)) return _userEmailCache[userId];
    try {
      final doc = await FirebaseFirestore.instance.collection('users').doc(userId).get();
      final email = doc.data()?['email'] as String?;
      _userEmailCache[userId] = email;
      return email;
    } catch (_) {
      _userEmailCache[userId] = null;
      return null;
    }
  }

  @override
  void initState() {
    super.initState();
    service = Get.find<ReviewService>();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
          bottom: false,
      top: false,
      child: Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
        child: DraggableScrollableSheet(
          initialChildSize: 0.9,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: false,
          builder: (_, controller) => Obx(() => Column(
            children: [
              Container(width: 42.w, height: 5.h, margin: EdgeInsets.symmetric(vertical: 8.h), decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(4))),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 4.h),
                child: Row(children: [
                  Expanded(child: Text('Yorumlar • ${widget.title}', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w700))),
                  if (service.isModerating.value) SizedBox(width: 18.w, height: 18.w, child: const CircularProgressIndicator(strokeWidth: 2)),
                  IconButton(onPressed: ()=> Get.back(), icon: const Icon(Icons.close)),
                ]),
              ),
              SizedBox(
                height: 42.h,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: EdgeInsets.symmetric(horizontal: 12.w),
                  itemBuilder: (_, i){
                    final s = statuses[i];
                    final active = service.adminStatusFilter.value == s['key'];
                    return ChoiceChip(
                      label: Text(s['label']!),
                      selected: active,
                      onSelected: (_){ service.setAdminStatusFilter(s['key']!, widget.type, widget.targetId); },
                    );
                  },
                  separatorBuilder: (_, __)=> SizedBox(width: 8.w),
                  itemCount: statuses.length,
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => service.loadTargetReviews(widget.type, widget.targetId),
                  child: service.adminTargetReviews.isEmpty
                      ? ListView(controller: controller, children: [
                          SizedBox(height: 120.h),
                          Icon(Icons.reviews, size: 48.sp, color: Colors.grey[400]),
                          SizedBox(height: 12.h),
                          Center(child: Text('Yorum bulunamadı', style: TextStyle(color: Colors.grey[600]))),
                        ])
                      : ListView.builder(
                          controller: controller,
                          itemCount: service.adminTargetReviews.length,
                          itemBuilder: (_, i){
                            final r = service.adminTargetReviews[i];
                            return _reviewTile(r);
                          },
                        ),
                ),
              )
            ],
          )),
        ),
      ),
    );
  }

  Widget _reviewTile(Map<String,dynamic> r){
    final status = (r['status'] ?? 'pending') as String;
    final isPending = status == 'pending';
    final isPublished = status == 'published';
    final isRejected = status == 'rejected';
    Color badgeColor(){
      if (isPublished) return Colors.green;
      if (isRejected) return Colors.red;
      return Colors.orange;
    }
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      child: Padding(
        padding: EdgeInsets.all(12.w),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children:[
            Text('⭐ ${(r['rating'] ?? 0).toString()}', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
            SizedBox(width: 8.w),
            Container(padding: EdgeInsets.symmetric(horizontal:8.w, vertical:4.h), decoration: BoxDecoration(color: badgeColor().withOpacity(.12), borderRadius: BorderRadius.circular(20)), child: Text(status, style: TextStyle(color: badgeColor(), fontSize: 11.sp, fontWeight: FontWeight.w600))),
            const Spacer(),
            PopupMenuButton<String>(
              onSelected: (v){
                switch(v){
                  case 'approve': service.moderate(type: widget.type, targetId: widget.targetId, reviewId: r['id'], status: 'published'); break;
                  case 'reject': service.moderate(type: widget.type, targetId: widget.targetId, reviewId: r['id'], status: 'rejected'); break;
                  case 'pending': service.moderate(type: widget.type, targetId: widget.targetId, reviewId: r['id'], status: 'pending'); break;
                  case 'delete': _confirmDelete(r['id']); break;
                }
              },
              itemBuilder: (_){
                return <PopupMenuEntry<String>>[
                  if (!isPublished) const PopupMenuItem(value:'approve', child: Text('Onayla')),
                  if (!isRejected) const PopupMenuItem(value:'reject', child: Text('Reddet')),
                  if (!isPending) const PopupMenuItem(value:'pending', child: Text('Beklemeye Al')),
                  const PopupMenuItem(value:'delete', child: Text('Sil')),
                ];
              },
              icon: const Icon(Icons.more_vert),
            )
          ]),
          SizedBox(height: 6.h),
          Text(r['comment'] ?? '', style: TextStyle(fontSize: 13.sp)),
          SizedBox(height: 6.h),
          Row(children:[
            Icon(Icons.person, size: 14.sp, color: Colors.grey[600]),
            SizedBox(width:4.w),
            FutureBuilder<String?>(
              future: _fetchEmail(r['userId'] ?? ''),
              builder: (context, snapshot){
                final email = snapshot.data;
                final loading = snapshot.connectionState == ConnectionState.waiting;
                return Text(
                  loading ? 'Yükleniyor...' : (email ?? (r['userId'] ?? '—')),
                  style: TextStyle(fontSize: 11.sp, color: Colors.grey[600]),
                  overflow: TextOverflow.ellipsis,
                );
              },
            ),
            SizedBox(width:12.w),
            Icon(Icons.access_time, size: 14.sp, color: Colors.grey[500]),
            SizedBox(width:4.w),
            Text(_fmtDate(r['createdAt']), style: TextStyle(fontSize: 11.sp, color: Colors.grey[600]))
          ])
        ]),
      ),
    );
  }

  void _confirmDelete(String reviewId){
    Get.dialog(AlertDialog(
      title: const Text('Yorumu sil?'),
      content: const Text('Bu işlem geri alınamaz.'),
      actions: [
        TextButton(onPressed: ()=> Get.back(), child: const Text('İptal')),
        TextButton(onPressed: (){ Get.back(); service.deleteReview(type: widget.type, targetId: widget.targetId, reviewId: reviewId); }, child: const Text('Sil')),
      ],
    ));
  }

  String _fmtDate(dynamic iso){
    if (iso is String){
      try { final dt = DateTime.parse(iso); return '${dt.year}-${dt.month.toString().padLeft(2,'0')}-${dt.day.toString().padLeft(2,'0')}'; } catch(_){ return '-'; }
    }
    return '-';
  }
}
