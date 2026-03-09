import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';

import '../../../utils/deep_link/deep_link_helper.dart';
import '../../models/referral/referral_models.dart';
import '../../models/user/user_model.dart';
import '../../repositories/referral/referral_repository.dart';
import '../../repositories/user/user_repository.dart';
import '../storage/stroge_service.dart';

class ReferralService extends GetxService {
  late ReferralRepository repository;

  final referrals = <ReferralModel>[].obs; // user invites
  final configs = <ReferralConfigModel>[].obs; // active configs
  final allConfigs = <ReferralConfigModel>[].obs; // admin view
  final earnings = <ReferralEarningModel>[].obs; // earnings per event
  final adminEarnings = <ReferralEarningModel>[].obs; // all earnings (admin)
  final withdrawals = <ReferralWithdrawalModel>[].obs; // user withdrawals (admin view)
  final userWithdrawals = <ReferralWithdrawalModel>[].obs; // current user own withdrawals
  final userCache = <String, UserModel>{}.obs; // minimal user info cache for admin display

  String? currentUserId;

  Future<ReferralService> init() async {
    repository = ReferralRepository();
  // Initialize custom deep link listener (uni_links)
  await DeepLinkHelper().init();
    return this;
  }

  Future<void> bootstrap(String userId) async {
    currentUserId = userId;
    await ensureUserReferralCode(userId);
    // If there is a pending invite code captured pre-auth, consume it now (first session only)
    final storage = Get.find<StorageService>();
    final pending = storage.getPendingInviteCode();
    if (pending != null) {
      // TODO: create referral record linking inviter (by code) and this user once user creation done.
      // Placeholder: we'll implement repository lookup by code in next iteration.
      await storage.clearPendingInviteCode();
    }
    await Future.wait([
      loadConfigs(),
      loadUserReferrals(userId),
      loadUserEarnings(userId),
  loadUserWithdrawals(userId),
    ]);
  // Realtime listeners (dispose not handled yet; service lives app-wide)
  repository.streamUserEarnings(userId).listen((data){ earnings.assignAll(data); });
  repository.streamUserWithdrawals(userId).listen((data){ userWithdrawals.assignAll(data); });
  }

  Future<String?> ensureUserReferralCode(String userId) async {
    try {
      final code = await repository.ensureUniqueCodeForUser(userId);
      return code;
    } catch (_) {
      return null;
    }
  }

  Future<void> loadConfigs() async {
    final data = await repository.fetchActiveConfigs();
    configs.assignAll(data);
  }
  Future<void> loadAllConfigs() async {
    try {
      final data = await repository.fetchAllConfigs();
      allConfigs.assignAll(data);
    } catch (_) {}
  }

  // Admin ops
  Future<String?> adminCreateConfig({
    required String name,
    double signupReward = 0,
    double bookingRewardPercent = 0,
    double bookingRewardFixed = 0,
    bool active = true,
  }) async {
    try {
      final model = ReferralConfigModel(
        name: name,
        active: active,
        signupReward: signupReward,
        bookingRewardPercent: bookingRewardPercent,
        bookingRewardFixed: bookingRewardFixed,
      );
      final id = await repository.createConfig(model);
      await Future.wait([loadConfigs(), loadAllConfigs()]);
      return id;
    } catch (_) { return null; }
  }

  Future<bool> adminUpdateConfig(ReferralConfigModel model) async {
    try {
      await repository.updateConfig(model);
      await Future.wait([loadConfigs(), loadAllConfigs()]);
      return true;
    } catch (_) { return false; }
  }

  Future<void> adminToggleActive(String id, bool active) async {
    try {
      await repository.toggleConfigActive(id, active);
    } catch (_) {}
    await Future.wait([loadConfigs(), loadAllConfigs()]);
  }

  Future<void> loadUserReferrals(String userId) async {
    final data = await repository.fetchUserReferrals(userId);
    referrals.assignAll(data);
  }

  Future<void> loadUserEarnings(String userId) async {
    final data = await repository.fetchUserEarnings(userId);
    earnings.assignAll(data);
  }
  Future<void> loadUserWithdrawals(String userId) async {
    try { userWithdrawals.assignAll(await repository.fetchUserWithdrawals(userId)); } catch(_){ }
  }

  Future<String> generateShareLink({required String code}) async {
    final uri = DeepLinkHelper().buildReferralUri(code);
    return uri.toString();
  }

  Future<void> shareReferral({required String code}) async {
    final link = await generateShareLink(code: code);
    await Share.share('Sefernur uygulamasına katıl, ödül kazan! Kodum: $code\n$link');
  }

  Future<String> createReferral(String inviterId, String inviteeId, {String? code}) async {
    final model = ReferralModel(
        id: null,
        inviterId: inviterId,
        inviteeId: inviteeId,
        code: code,
        createdAt: DateTime.now(),
        status: ReferralStatus.registered);
  final id = await repository.createReferral(model);
  // ignore: avoid_print
  print('[REFERRAL] referral created id=$id inviter=$inviterId invitee=$inviteeId code=$code');
  return id;
  }

  Future<void> recordEarning({
    required String referralId,
    required String userId,
    required double amount,
    required ReferralEarningType type,
  }) async {
    final earn = ReferralEarningModel(
      id: null,
      referralId: referralId,
      userId: userId,
      amount: amount,
      type: type,
      createdAt: DateTime.now(),
      status: ReferralEarningStatus.pending,
    );
    await repository.createEarning(earn);
  }

  double get totalEarnings => earnings.fold(0, (p, e) => p + (e.status == ReferralEarningStatus.approved ? e.amount : 0));
  double get pendingEarnings => earnings.fold(0, (p, e) => p + (e.status == ReferralEarningStatus.pending ? e.amount : 0));
  // User-specific withdrawal aggregates (use userWithdrawals, not global admin withdrawals)
  double get totalWithdrawnApproved => userWithdrawals.fold(0, (p,w)=> p + (w.status == ReferralEarningStatus.approved ? w.amount : 0));
  double get totalWithdrawPending => userWithdrawals.fold(0, (p,w)=> p + (w.status == ReferralEarningStatus.pending ? w.amount : 0));
  double get availableBalance => totalEarnings - totalWithdrawnApproved - totalWithdrawPending; // net spendable for current user

  Future<void> grantSignupEarningIfConfigured({required String inviterId, required String referralId}) async {
    if (configs.isEmpty) await loadConfigs();
    final active = configs.firstWhereOrNull((c) => c.active);
    if (active == null) return;
    if (active.signupReward <= 0) return;
    await recordEarning(
      referralId: referralId,
      userId: inviterId,
      amount: active.signupReward,
      type: ReferralEarningType.signup,
    );
  // ignore: avoid_print
  print('[REFERRAL] signup earning granted inviter=$inviterId amount=${active.signupReward} referral=$referralId');
    // Reload earnings cache
    if (currentUserId != null && inviterId == currentUserId) {
      await loadUserEarnings(inviterId);
  await loadUserWithdrawals(inviterId);
    }
  }

  Future<bool> requestWithdrawal({required String userId, required double amount, required String iban}) async {
  if (amount <= 0) return false;
  // Business rules: single pending, min threshold 100, sufficient available balance, IBAN required
  const minAmount = 100.0;
  if (userWithdrawals.any((w) => w.status == ReferralEarningStatus.pending)) return false;
  if (availableBalance < amount) return false;
  if (availableBalance < minAmount || amount < minAmount) return false;
  if (iban.isEmpty) return false;
    try {
      final model = ReferralWithdrawalModel(
        userId: userId,
        amount: amount,
        ibanOrAccount: iban,
        createdAt: DateTime.now(),
      );
      await repository.createWithdrawal(model);
      await loadUserWithdrawals(userId);
      await loadWithdrawals(); // refresh admin view
      return true;
    } catch (_) { return false; }
  }

  // Admin monitoring
  Future<void> loadAdminEarnings() async {
    try { adminEarnings.assignAll(await repository.fetchAllEarnings()); } catch(_){ }
  }
  Future<void> loadWithdrawals() async {
    try {
      final list = await repository.fetchAllWithdrawals();
      withdrawals.assignAll(list);
      // Preload user info for distinct userIds (admin list)
      final ids = list.map((e)=>e.userId).toSet();
      await _ensureUsersLoaded(ids);
    } catch(_){ }
  }
  Future<void> adminSetEarningStatus(String id, ReferralEarningStatus status) async {
    try { await repository.updateEarningStatus(id, status); await loadAdminEarnings(); } catch(_){ }
  }
  Future<void> adminSetWithdrawalStatus(String id, ReferralEarningStatus status) async {
    try { await repository.updateWithdrawalStatus(id, status); await loadWithdrawals(); } catch(_){ }
  }

  Future<void> _ensureUsersLoaded(Set<String> ids) async {
    final repo = Get.isRegistered<UserRepository>() ? Get.find<UserRepository>() : null;
    if (repo == null) return; // user repo not ready
    final missing = ids.where((id)=> !userCache.containsKey(id)).toList();
    if (missing.isEmpty) return;
    // Fetch sequentially (could optimize with batch if custom API exists)
    for (final uid in missing){
      try {
        final res = await repo.readUserData(uid).run();
        res.match((_)=>null, (u){ if(u!=null) userCache[uid]=u;});
      } catch(_){ }
    }
  }

}
