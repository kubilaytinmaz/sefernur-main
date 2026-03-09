import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get/get.dart';

import '../../repositories/favorite/favorite_repository.dart';
import '../auth/auth_service.dart';

class FavoriteEntry {
  final String targetId;
  final String targetType; // hotel|car|transfer|guide|tour|campaign
  final DateTime createdAt;
  final Map<String,dynamic> meta; // cached snapshot fields
  FavoriteEntry({required this.targetId, required this.targetType, required this.createdAt, required this.meta});
}

class FavoriteService extends GetxService {
  late FavoriteRepository _repo;
  late AuthService _auth;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  final all = <FavoriteEntry>[].obs;
  final filtered = <FavoriteEntry>[].obs;
  final activeFilter = 'all'.obs; // all | hotel | car | transfer | guide | tour | campaign
  final error = RxnString();
  StreamSubscription? _sub;
  // Cache for enriched detail metas to avoid repeated network calls
  final Map<String, Map<String,dynamic>> _detailCache = {};
  final fetchingIds = <String>{}.obs; // for UI loading indicators
  /// Favori karta tıklandığında detay sheet açmak yerine direkt ilgili arama sekmesine
  /// yönlendirme opsiyonu. Varsayılan false (sheet açılır). Kullanıcı ayarlarından ileride bağlanabilir.
  final directNavigationEnabled = false.obs;

  Future<FavoriteService> init() async {
    _repo = FavoriteRepository();
    _auth = Get.find<AuthService>();
    _bind();
    return this;
  }

  void _bind() {
    final uid = _auth.getCurrentUserAuthUid();
    if (uid.isEmpty) return;
    _sub?.cancel();
    _sub = _repo.streamUserFavorites(uid).listen((list) {
      all.assignAll(list.map((m){
        final createdRaw = m['createdAt'];
        DateTime created;
        if (createdRaw is String) { created = DateTime.tryParse(createdRaw) ?? DateTime.now(); } else { created = DateTime.now(); }
        final meta = (m['meta'] is Map<String,dynamic>) ? Map<String,dynamic>.from(m['meta']) : <String,dynamic>{};
        return FavoriteEntry(
          targetId: (m['targetId'] ?? '') as String,
            targetType: (m['targetType'] ?? '') as String,
          createdAt: created,
          meta: meta,
        );
      }));
      _applyFilter();
    }, onError: (e) => error.value = e.toString());
  }

  void setFilter(String filter) {
    activeFilter.value = filter;
    _applyFilter();
  }

  void _applyFilter() {
    final f = activeFilter.value;
    filtered.assignAll(f == 'all' ? all : all.where((e) => e.targetType == f));
  }

  bool isFavorite(String type, String targetId) => all.any((e) => e.targetType == type && e.targetId == targetId);

  /// Check if user is authenticated before toggling favorite
  /// Returns false if user is guest (not logged in)
  bool get canToggleFavorite {
    final uid = _auth.getCurrentUserAuthUid();
    return uid.isNotEmpty && !_auth.isGuest.value;
  }

  Future<void> toggle({required String type, required String targetId, Map<String,dynamic>? meta}) async {
    final uid = _auth.getCurrentUserAuthUid();
    if (uid.isEmpty || _auth.isGuest.value) {
      // User is guest, cannot toggle favorites
      return;
    }
    final exists = await _repo.isFavorited(userId: uid, targetType: type, targetId: targetId);
    if (exists) {
      await _repo.removeFavorite(userId: uid, targetType: type, targetId: targetId);
    } else {
      await _repo.addFavorite(userId: uid, targetType: type, targetId: targetId, meta: meta);
    }
  }

  // Backward compatibility (old API signatures still used in UI)
  // ignore: avoid_positional_boolean_parameters
  bool isFavoriteLegacy(String type, String targetId) => isFavorite(type, targetId);
  Future<void> toggleLegacy(String type, String targetId, {Map<String,dynamic>? meta}) => toggle(type: type, targetId: targetId, meta: meta);

  Future<void> refreshMeta({required String type, required String targetId, required Map<String,dynamic> meta}) async {
    final uid = _auth.getCurrentUserAuthUid();
    if (uid.isEmpty) return;
    await _repo.updateMeta(userId: uid, targetType: type, targetId: targetId, meta: meta);
  }

  // --- Helper: Build standardized meta maps per entity (lightweight fields only) ---
  Map<String,dynamic> buildMetaForEntity({required String type, required dynamic model}) {
    try {
      switch (type) {
        case 'tour':
          return {
            'title': model.title ?? '',
            'subtitle': (model.serviceAddresses is List && model.serviceAddresses.isNotEmpty)
                ? (model.serviceAddresses.first.city ?? '')
                : '',
            'imageUrl': (model.images is List && model.images.isNotEmpty) ? model.images.first : '',
            'price': (model.basePrice is num) ? (model.basePrice as num).toDouble() : null,
            'currency': 'TRY',
          }..removeWhere((k,v)=> v==null);
        case 'transfer':
          return {
            'title': '${model.fromShort ?? ''} → ${model.toShort ?? ''}',
            'subtitle': model.vehicleType ?? '',
            'imageUrl': (model.images is List && model.images.isNotEmpty) ? model.images.first : '',
            'price': (model.basePrice is num) ? (model.basePrice as num).toDouble() : null,
            'currency': 'TRY',
          }..removeWhere((k,v)=> v==null);
        case 'guide':
          return {
            'title': model.name ?? '',
            'subtitle': '${model.yearsExperience ?? ''} yıl',
            'imageUrl': (model.images is List && model.images.isNotEmpty) ? model.images.first : '',
            'price': (model.dailyRate is num) ? (model.dailyRate as num).toDouble() : null,
            'currency': 'TRY',
          }..removeWhere((k,v)=> v==null);
        case 'hotel':
          return {
            'title': model.name ?? '',
            'subtitle': model.city ?? '',
            'imageUrl': (model.images is List && model.images.isNotEmpty) ? model.images.first : '',
            'price': (model.minPrice is num) ? (model.minPrice as num).toDouble() : null,
            'currency': 'TRY',
          }..removeWhere((k,v)=> v==null);
        case 'campaign':
          return {
            'title': model.title ?? '',
            'subtitle': model.subtitle ?? '',
            'imageUrl': (model.images is List && model.images.isNotEmpty) ? model.images.first : (model.imageUrl ?? ''),
          }..removeWhere((k,v)=> v==null);
        case 'car':
          return {
            'title': '${model.brand ?? ''} ${model.model ?? ''}'.trim(),
            'subtitle': model.type ?? '',
            'imageUrl': (model.images is List && model.images.isNotEmpty) ? model.images.first : '',
            'price': (model.dailyPrice is num) ? (model.dailyPrice as num).toDouble() : null,
            'currency': 'TRY',
          }..removeWhere((k,v)=> v==null);
        default:
          return {};
      }
    } catch (_) {
      return {};
    }
  }

  // Detect favorites with missing essential meta and allow lazy refresh trigger.
  List<FavoriteEntry> favoritesNeedingMeta() {
    return all.where((e){
      final m = e.meta;
      return !(m.containsKey('title') && (m['title'] as String).isNotEmpty);
    }).toList();
  }

  Future<void> ensureBasicMeta({required String type, required String targetId, required Future<Map<String,dynamic>> Function() fetch}) async {
    final existing = all.firstWhereOrNull((e)=> e.targetType==type && e.targetId==targetId);
    if (existing == null) return; // not in list
    final hasTitle = (existing.meta['title'] ?? '').toString().isNotEmpty;
    if (hasTitle) return; // already fine
    final fresh = await fetch();
    if (fresh.isNotEmpty) {
      await refreshMeta(type: type, targetId: targetId, meta: fresh);
    }
  }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }

  // Build a cache key
  String _key(String type, String id) => '$type::$id';

  /// Fetch extra detail fields (rating, reviewCount, dynamic pricing etc.) from Firestore directly.
  /// Returns a merged meta map (existing meta + enriched fields). Caches result.
  Future<Map<String,dynamic>> getEnrichedMeta(FavoriteEntry entry,{bool forceRefresh = false}) async {
    final k = _key(entry.targetType, entry.targetId);
    if (!forceRefresh && _detailCache.containsKey(k)) {
      return _detailCache[k]!;
    }
    if (fetchingIds.contains(k)) {
      // another fetch in progress – small wait loop
      for (int i=0;i<10;i++) {
        await Future.delayed(const Duration(milliseconds:80));
        if (_detailCache.containsKey(k)) return _detailCache[k]!;
      }
    }
    try {
      fetchingIds.add(k);
      final collection = _collectionNameFor(entry.targetType);
      if (collection == null) return entry.meta; // unknown type
      final doc = await _firestore.collection(collection).doc(entry.targetId).get();
      if (!doc.exists) {
        return entry.meta; // entity removed
      }
      final data = doc.data() ?? {};
      // Minimal normalization across types
      final enriched = Map<String,dynamic>.from(entry.meta);
      void put(String key, dynamic value){ if(value!=null && value.toString().isNotEmpty) enriched[key]=value; }
      // Common fields
      put('rating', data['rating']);
      put('reviewCount', data['reviewCount']);
      // Attempt to hydrate generic title/image if missing
      if (!(enriched.containsKey('title') && (enriched['title']??'').toString().isNotEmpty)) {
        switch(entry.targetType){
          case 'hotel': put('title', data['name']); break;
          case 'tour': put('title', data['title']); break;
          case 'transfer': put('title', '${data['fromShort'] ?? ''} → ${data['toShort'] ?? ''}'.trim()); break;
          case 'guide': put('title', data['name']); break;
          case 'car': put('title', '${data['brand'] ?? ''} ${data['model'] ?? ''}'.trim()); break;
          case 'campaign': put('title', data['title']); break;
        }
      }
      if (!enriched.containsKey('imageUrl') || (enriched['imageUrl']??'').toString().isEmpty) {
        final imgs = data['images'];
        if (imgs is List && imgs.isNotEmpty) {
          put('imageUrl', imgs.first);
        } else {
          // some campaigns may have imageUrl field directly
          put('imageUrl', data['imageUrl']);
        }
      }
      // Type specific augmentations
      switch (entry.targetType) {
        case 'hotel':
          put('city', data['city']);
          put('country', data['country']);
          put('minPrice', data['minPrice']);
          break;
        case 'tour':
          put('duration', data['duration']);
          put('basePrice', data['basePrice']);
          put('durationDays', data['durationDays']);
          break;
        case 'transfer':
          put('vehicleType', data['vehicleType']);
          put('capacity', data['capacity']);
          put('basePrice', data['basePrice']);
          put('fromShort', data['fromShort']);
          put('toShort', data['toShort']);
          break;
        case 'guide':
          put('yearsExperience', data['yearsExperience']);
          put('languages', (data['languages'] is List) ? (data['languages'] as List).join(', ') : data['languages']);
          put('dailyRate', data['dailyRate']);
          break;
        case 'car':
          put('brand', data['brand']);
          put('model', data['model']);
          put('dailyPrice', data['dailyPrice']);
          put('seats', data['seats']);
          break;
        case 'campaign':
          put('subtitle', data['subtitle']);
          break;
      }
      _detailCache[k] = enriched;
      // Optionally persist improved meta (only if title previously missing important stuff)
      final needsUpdate = entry.meta.length < enriched.length;
      if (needsUpdate) {
        unawaited(refreshMeta(type: entry.targetType, targetId: entry.targetId, meta: enriched));
      }
      return enriched;
    } catch (e) {
      error.value = e.toString();
      return entry.meta;
    } finally {
      fetchingIds.remove(k);
    }
  }

  String? _collectionNameFor(String type) {
    switch (type) {
      case 'hotel': return 'hotels';
      case 'tour': return 'tours';
      case 'transfer': return 'transfers';
      case 'guide': return 'guides';
      case 'car': return 'cars';
      case 'campaign': return 'campaigns';
      default: return null;
    }
  }
}
