import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';

import '../../models/visa/visa_application_model.dart';
import '../../providers/firebase/firebase_paths.dart';

class VisaRepository {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;
  final String _collection = FirestorePaths.visaApplicationsCollection();

  Future<String> create(VisaApplicationModel app) async {
    final data = app.toJson();
    data.remove('id');
    data['createdAt'] = (data['createdAt'] ?? DateTime.now().toIso8601String());
    data['updatedAt'] = DateTime.now().toIso8601String();
    final doc = await _firestore.collection(_collection).add(data);
    return doc.id;
  }

  Future<void> update(String id, VisaApplicationModel app) async {
    final data = app.toJson();
    data['updatedAt'] = DateTime.now().toIso8601String();
    await _firestore.collection(_collection).doc(id).update(data);
  }

  Future<void> updateStatus(String id, String status, {String? adminNote, DateTime? estimatedCompletion}) async {
    await _firestore.collection(_collection).doc(id).update({
      'status': status,
      if (adminNote != null) 'adminNote': adminNote,
      if (estimatedCompletion != null) 'estimatedCompletion': estimatedCompletion.toIso8601String(),
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> attachPayment(String id, {String? receiptUrl, String? paymentNote}) async {
    await _firestore.collection(_collection).doc(id).update({
      if (receiptUrl != null) 'paymentReceiptUrl': receiptUrl,
      if (paymentNote != null) 'paymentNote': paymentNote,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<VisaApplicationModel?> getById(String id) async {
    final doc = await _firestore.collection(_collection).doc(id).get();
    if (!doc.exists) return null;
    return VisaApplicationModel.fromJson(doc.data()!, doc.id);
  }

  Future<List<VisaApplicationModel>> getUserApplications(String userId) async {
    final snap = await _firestore.collection(_collection)
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .get();
    return snap.docs.map((d) => VisaApplicationModel.fromJson(d.data(), d.id)).toList();
  }

  Stream<List<VisaApplicationModel>> streamUserApplications(String userId) {
    return _firestore.collection(_collection)
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((s) => s.docs.map((d) => VisaApplicationModel.fromJson(d.data(), d.id)).toList());
  }

  Stream<List<VisaApplicationModel>> streamAll({int limit = 200}) {
    return _firestore.collection(_collection)
        .orderBy('createdAt', descending: true)
        .limit(limit)
        .snapshots()
        .map((s) => s.docs.map((d) => VisaApplicationModel.fromJson(d.data(), d.id)).toList());
  }

  Future<String> uploadFile(String userId, File file, {required String type}) async {
    final ref = _storage.ref().child('visaApplications/$userId/${DateTime.now().millisecondsSinceEpoch}_$type');
    final task = await ref.putFile(file, SettableMetadata(contentType: _inferMime(file.path)));
    return task.ref.getDownloadURL();
  }

  String _inferMime(String path) {
    final lower = path.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    return 'application/octet-stream';
  }
}
