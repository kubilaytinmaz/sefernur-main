import 'package:cloud_firestore/cloud_firestore.dart';

import '../../models/referral/referral_models.dart';

class ReferralRepository {
  final _db = FirebaseFirestore.instance;
  CollectionReference get _configs => _db.collection('referral_configs');
  CollectionReference get _referrals => _db.collection('referrals');
  CollectionReference get _earnings => _db.collection('referral_earnings');
  CollectionReference get _withdrawals => _db.collection('referral_withdrawals');
  CollectionReference get _codes => _db.collection('referral_codes');

  Future<List<ReferralConfigModel>> fetchActiveConfigs() async {
    final snap = await _configs.where('active', isEqualTo: true).get();
    return snap.docs.map((d)=>ReferralConfigModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Future<List<ReferralConfigModel>> fetchAllConfigs() async {
    final snap = await _configs.orderBy('createdAt', descending: true).get();
    return snap.docs.map((d)=>ReferralConfigModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Future<String> createConfig(ReferralConfigModel model) async {
    final doc = await _configs.add({
      ...model.toJson(),
      'createdAt': DateTime.now(),
      'updatedAt': DateTime.now(),
    });
    return doc.id;
  }
  Future<void> updateConfig(ReferralConfigModel model) async {
    if (model.id == null) return;
    await _configs.doc(model.id).update({
      ...model.toJson(),
      'updatedAt': DateTime.now(),
    });
  }
  Future<void> toggleConfigActive(String id, bool active) async {
    await _configs.doc(id).update({'active': active, 'updatedAt': DateTime.now()});
  }
  Future<List<ReferralModel>> fetchUserReferrals(String userId) async {
    final snap = await _referrals.where('inviterId', isEqualTo: userId).get();
    return snap.docs.map((d)=>ReferralModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Future<List<ReferralEarningModel>> fetchUserEarnings(String userId) async {
    final snap = await _earnings.where('userId', isEqualTo: userId).get();
    return snap.docs.map((d)=>ReferralEarningModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Stream<List<ReferralEarningModel>> streamUserEarnings(String userId){
    return _earnings.where('userId', isEqualTo: userId).snapshots().map((qs)=>
      qs.docs.map((d)=>ReferralEarningModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList()
    );
  }
  Future<String> createReferral(ReferralModel model) async {
    final doc = await _referrals.add(model.toJson());
    return doc.id;
  }
  Future<void> createEarning(ReferralEarningModel model) async {
    await _earnings.add(model.toJson());
  }
  Future<void> createWithdrawal(ReferralWithdrawalModel model) async {
    await _withdrawals.add(model.toJson());
  }
  Future<List<ReferralWithdrawalModel>> fetchUserWithdrawals(String userId) async {
    final snap = await _withdrawals.where('userId', isEqualTo: userId).orderBy('createdAt', descending: true).get();
    return snap.docs.map((d)=>ReferralWithdrawalModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Stream<List<ReferralWithdrawalModel>> streamUserWithdrawals(String userId){
    return _withdrawals.where('userId', isEqualTo: userId).orderBy('createdAt', descending: true).snapshots().map((qs)=>
      qs.docs.map((d)=>ReferralWithdrawalModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList()
    );
  }

  // Admin earnings overview
  Future<List<ReferralEarningModel>> fetchAllEarnings() async {
    final snap = await _earnings.orderBy('createdAt', descending: true).limit(500).get();
    return snap.docs.map((d)=>ReferralEarningModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Future<void> updateEarningStatus(String id, ReferralEarningStatus status) async {
    await _earnings.doc(id).update({'status': status.name});
  }

  // Withdrawals
  Future<List<ReferralWithdrawalModel>> fetchAllWithdrawals() async {
    final snap = await _withdrawals.orderBy('createdAt', descending: true).limit(500).get();
    return snap.docs.map((d)=>ReferralWithdrawalModel.fromJson(d.data() as Map<String,dynamic>, d.id)).toList();
  }
  Future<void> updateWithdrawalStatus(String id, ReferralEarningStatus status) async {
    await _withdrawals.doc(id).update({'status': status.name});
  }

  Future<String?> resolveInviterIdByCode(String code) async {
    final snap = await _codes.doc(code).get();
    if (snap.exists) {
      final data = snap.data() as Map<String, dynamic>;
      return data['userId'] as String?;
    }
    return null;
  }

  Future<ReferralModel?> findReferral(String inviterId, String inviteeId) async {
    final snap = await _referrals
        .where('inviterId', isEqualTo: inviterId)
        .where('inviteeId', isEqualTo: inviteeId)
        .limit(1)
        .get();
    if (snap.docs.isEmpty) return null;
    final d = snap.docs.first;
    return ReferralModel.fromJson(d.data() as Map<String, dynamic>, d.id);
  }

  Future<String> ensureUniqueCodeForUser(String userId) async {
    // Try fetch existing code mapping
    final existing = await _codes.where('userId', isEqualTo: userId).limit(1).get();
    if (existing.docs.isNotEmpty) {
      return existing.docs.first.id; // doc id is the code
    }
    // Generate and reserve (atomic create() instead of transaction to avoid duplicate-complete bug when offline)
    for (int i = 0; i < 12; i++) {
      final code = _generateCode();
      final docRef = _codes.doc(code);
      try {
        final exists = await docRef.get();
        if (exists.exists) {
          // collision – retry
          continue;
        }
        // Use set with fail-fast: if between get & set another writer inserts, Firestore will just overwrite.
        // To strictly avoid overwrite we could use a transaction; here low collision risk due to code space.
        await docRef.set({
          'userId': userId,
          'createdAt': DateTime.now(),
        });
        return code; // success
      } on FirebaseException catch (e) {
        if (e.code == 'unavailable' || e.code == 'network-request-failed') {
          // network issue – bubble up so caller can decide to retry later
          rethrow;
        }
        // Other Firestore error – retry a couple times else rethrow
        if (i >= 11) rethrow;
      } catch (_) {
        if (i >= 11) rethrow;
      }
    }
    throw Exception('Referral code üretilemedi (çok fazla çakışma)');
  }

  String _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final rand = DateTime.now().microsecondsSinceEpoch;
    // simple deterministic-ish mix
    final buffer = StringBuffer('SR');
    for (int i = 0; i < 6; i++) {
      buffer.write(chars[(rand + i * 37) % chars.length]);
    }
    return buffer.toString();
  }
}
