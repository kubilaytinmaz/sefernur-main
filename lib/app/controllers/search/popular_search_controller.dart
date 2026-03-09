import 'dart:async';

import 'package:get/get.dart';
import 'package:latlong2/latlong.dart';

import '../../data/models/address/address_model.dart';
import '../../data/models/search/popular_search_model.dart';
import '../../data/repositories/search/popular_search_repository.dart';

class PopularSearchController extends GetxController {
  final PopularSearchRepository _repository = PopularSearchRepository();
  StreamSubscription? _sub;

  final RxList<PopularSearchModel> activeItems = <PopularSearchModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    _sub = _repository.streamActive().listen((items) {
      activeItems.assignAll(items);
    });
  }

  @override
  void onClose() {
    _sub?.cancel();
    super.onClose();
  }

  List<PopularSearchModel> byModule(PopularSearchModule module) {
    final list = activeItems.where((e) => e.module == module).toList();
    if (list.isNotEmpty) return list;
    return _fallback(module);
  }

  List<PopularSearchModel> transferBySegment(PopularSearchSegment segment) {
    final fromDb = byModule(PopularSearchModule.transfer)
        .where((e) => e.segment == segment)
        .toList();
    if (fromDb.isNotEmpty) return fromDb;
    return _fallback(PopularSearchModule.transfer)
        .where((e) => e.segment == segment)
        .toList();
  }

  List<PopularSearchModel> _fallback(PopularSearchModule module) {
    final now = DateTime.now();
    if (module == PopularSearchModule.hotel) {
      return [
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Mekke Oteller',
          city: 'Mekke',
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Kabeye Yakın Oteller',
          city: 'Mekke',
          keywords: const ['kabe', 'yakın'],
          sortOrder: 2,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Medine Oteller',
          city: 'Medine',
          sortOrder: 3,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Mescid-i Nebevi Yakın Oteller',
          city: 'Medine',
          keywords: const ['mescidi nebevi', 'yakın'],
          sortOrder: 4,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Kabeye Maximum 2km Oteller',
          city: 'Mekke',
          keywords: const ['kabe', '2km'],
          sortOrder: 5,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Şişe Bölgesi',
          city: 'Mekke',
          keywords: const ['şişe'],
          sortOrder: 6,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.hotel,
          title: 'Mahbes Bölgesi',
          city: 'Mekke',
          keywords: const ['mahbes'],
          sortOrder: 7,
          createdAt: now,
          updatedAt: now,
        ),
      ];
    }

    if (module == PopularSearchModule.tour) {
      return [
        PopularSearchModel(
          module: PopularSearchModule.tour,
          title: 'Ocak Turları',
          tags: const ['ocak'],
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.tour,
          title: 'Şubat Turları',
          tags: const ['şubat'],
          sortOrder: 2,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.tour,
          title: 'Sömestir Turları',
          tags: const ['sömestir'],
          sortOrder: 3,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.tour,
          title: 'Ramazan Turları',
          tags: const ['ramazan'],
          sortOrder: 4,
          createdAt: now,
          updatedAt: now,
        ),
        PopularSearchModel(
          module: PopularSearchModule.tour,
          title: 'Şevval Ayı Turları',
          tags: const ['şevval'],
          sortOrder: 5,
          createdAt: now,
          updatedAt: now,
        ),
      ];
    }

    return [
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Mekke → Cidde Airport',
        fromCity: 'Mekke',
        toCity: 'Cidde',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Mekke → Medine',
        fromCity: 'Mekke',
        toCity: 'Medine',
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Mekke → Taif Havalimanı',
        fromCity: 'Mekke',
        toCity: 'Taif',
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Mekke → Mekke Tren İstasyonu',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        keywords: const ['tren'],
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Cidde Airport → Mekke',
        fromCity: 'Cidde',
        toCity: 'Mekke',
        sortOrder: 5,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Medine → Mekke',
        fromCity: 'Medine',
        toCity: 'Mekke',
        sortOrder: 6,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Taif Havalimanı → Mekke',
        fromCity: 'Taif',
        toCity: 'Mekke',
        sortOrder: 7,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Mekke Tren İstasyonu → Mekke',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        keywords: const ['tren'],
        sortOrder: 8,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Medine → Medine Havalimanı',
        fromCity: 'Medine',
        toCity: 'Medine',
        keywords: const ['havalimanı'],
        sortOrder: 9,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Medine → Medine Tren İstasyonu',
        fromCity: 'Medine',
        toCity: 'Medine',
        keywords: const ['tren'],
        sortOrder: 10,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Medine → Cidde Airport',
        fromCity: 'Medine',
        toCity: 'Cidde',
        sortOrder: 11,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Medine Havalimanı → Medine',
        fromCity: 'Medine',
        toCity: 'Medine',
        keywords: const ['havalimanı'],
        sortOrder: 12,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Medine Tren İstasyonu → Medine',
        fromCity: 'Medine',
        toCity: 'Medine',
        keywords: const ['tren'],
        sortOrder: 13,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.transfer,
        title: 'Cidde Airport → Medine',
        fromCity: 'Cidde',
        toCity: 'Medine',
        sortOrder: 14,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Bedir → Medine (Tur)',
        fromCity: 'Mekke',
        toCity: 'Medine',
        sortOrder: 15,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke Çevre Ziyareti',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        sortOrder: 16,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Taif (Tur)',
        fromCity: 'Mekke',
        toCity: 'Taif',
        sortOrder: 17,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Cidde (Tur)',
        fromCity: 'Mekke',
        toCity: 'Cidde',
        sortOrder: 18,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Hudeybiye (Umre Ziyareti)',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        keywords: const ['hudeybiye'],
        sortOrder: 19,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Cirane (Umre Ziyareti)',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        keywords: const ['cirane'],
        sortOrder: 20,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Aişe Tenim (Umre Ziyareti)',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        keywords: const ['tenim'],
        sortOrder: 21,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Cebeli Nur (Ziyaret)',
        fromCity: 'Mekke',
        toCity: 'Mekke',
        keywords: const ['cebeli nur'],
        sortOrder: 22,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Mekke → Medine Tam Paket',
        fromCity: 'Mekke',
        toCity: 'Medine',
        sortOrder: 23,
        createdAt: now,
        updatedAt: now,
      ),
      PopularSearchModel(
        module: PopularSearchModule.transfer,
        segment: PopularSearchSegment.visit,
        title: 'Medine Çevre Ziyareti',
        fromCity: 'Medine',
        toCity: 'Medine',
        sortOrder: 24,
        createdAt: now,
        updatedAt: now,
      ),
    ];
  }

  AddressModel addressFromCity(String city) {
    final normalized = city.toLowerCase().trim();

    if (normalized.contains('mekke') || normalized.contains('mecca')) {
      return AddressModel(
        address: 'Mekke, Suudi Arabistan',
        city: 'Mekke',
        state: 'Mekke',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        location: const LatLng(21.4225, 39.8262),
      );
    }
    if (normalized.contains('medine') || normalized.contains('medina')) {
      return AddressModel(
        address: 'Medine, Suudi Arabistan',
        city: 'Medine',
        state: 'Medine',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        location: const LatLng(24.4539, 39.6142),
      );
    }
    if (normalized.contains('cidde') || normalized.contains('jeddah')) {
      return AddressModel(
        address: 'Cidde, Suudi Arabistan',
        city: 'Cidde',
        state: 'Mekke',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        location: const LatLng(21.5433, 39.1728),
      );
    }
    if (normalized.contains('taif')) {
      return AddressModel(
        address: 'Taif, Suudi Arabistan',
        city: 'Taif',
        state: 'Mekke',
        country: 'Suudi Arabistan',
        countryCode: 'SA',
        location: const LatLng(21.2703, 40.4158),
      );
    }

    return AddressModel(
      address: city,
      city: city,
      country: 'Suudi Arabistan',
      countryCode: 'SA',
    );
  }
}
