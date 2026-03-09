import 'package:get/get.dart';

import '../../data/services/weather/weather_service.dart';

class HighlightItem {
  final String id;
  final String title;
  final String subtitle;
  final String image;
  final String description;
  HighlightItem({required this.id, required this.title, required this.subtitle, required this.image, required this.description});
}


class WeatherData {
  final String month;
  final int avgHigh;
  final int avgLow;
  WeatherData({required this.month, required this.avgHigh, required this.avgLow});
}

class TourItem {
  final String id;
  final String title;
  final String tag;
  final String image;
  final double price;
  TourItem({required this.id, required this.title, required this.tag, required this.image, required this.price});
}

class Testimonial {
  final String id;
  final String user;
  final String comment;
  final int rating;
  Testimonial({required this.id, required this.user, required this.comment, required this.rating});
}

class HomeController extends GetxController {
  // Greeting campaign count
  final RxInt pendingCampaignCount = 3.obs; // dummy value

  // Eskiden dummy kampanyalar vardı; dinamik sisteme geçildiği için kaldırıldı.
  // UI artık CampaignService.campaigns üzerinden beslenecek.
  final campaigns = <Campaign>[].obs; // backward compatibility (artık boş tutuluyor)

  // Categories (top shortcuts)
  final categories = [
    {'icon': 'hotel', 'label': 'Oteller', 'route': '/hotels'},
    {'icon': 'directions_car', 'label': 'Taxi', 'route': '/car-rental'},
    {'icon': 'airport_shuttle', 'label': 'Transfer', 'route': '/transfers'},
    {'icon': 'tour', 'label': 'Turlar', 'route': '/tours'},
    {'icon': 'map', 'label': 'Rehberler', 'route': '/guides'},
    {'icon': 'workspace_premium', 'label': 'Vize', 'route': '/visa'},
  ];

  // Highlights for Mekke & Medine
  final mekkahHighlights = <HighlightItem>[
    HighlightItem(
      id: 'mekke_1',
      title: 'Cin Mescidi',
      subtitle: 'Tarihi mekan',
      image: 'assets/images/onboarding_1.jpg',
      description: 'Mekke yakınlarında önemli ziyaret noktalarından biridir.',
    ),
    HighlightItem(
      id: 'mekke_2',
      title: 'Nur Dağı',
      subtitle: 'Hira Mağarası',
      image: 'assets/images/onboarding_2.jpg',
      description: 'İlk vahyin indirildiği mağaraya ev sahipliği yapar.',
    ),
  ].obs;

  final medinaHighlights = <HighlightItem>[
    HighlightItem(
      id: 'medine_1',
      title: 'Uhud',
      subtitle: 'Uhud Dağı',
      image: 'assets/images/onboarding_3.jpg',
      description: 'Uhud Savaşı\'nın gerçekleştiği tarihi alan.',
    ),
    HighlightItem(
      id: 'medine_2',
      title: 'Kuba Mescidi',
      subtitle: 'İlk mescid',
      image: 'assets/images/onboarding_1.jpg',
      description: 'İslam tarihinde yapılan ilk mescid kabul edilir.',
    ),
  ].obs;

  // Bloglar dinamik BlogService üzerinden alınacak (dummy kaldırıldı)

  // Weather data (dummy monthly averages)
  final mekkahWeather = <WeatherData>[].obs;
  final medinaWeather = <WeatherData>[].obs;
  final RxBool weatherLoading = false.obs;
  final RxString weatherError = ''.obs;

  final _weatherService = WeatherService();

  // Tours
  final tours = <TourItem>[
    TourItem(id: 'tour_1', title: 'Ekonomik Umre Paketi', tag: 'En Uygun', image: 'assets/images/onboarding_2.jpg', price: 899.0),
    TourItem(id: 'tour_2', title: 'Ramazan Özel Tur', tag: 'Özel Gün', image: 'assets/images/onboarding_3.jpg', price: 1499.0),
    TourItem(id: 'tour_3', title: 'Tavsiye Edilen Tur', tag: 'Tavsiye', image: 'assets/images/onboarding_1.jpg', price: 1199.0),
  ].obs;

  // Testimonials
  final testimonials = <Testimonial>[
    Testimonial(id: 'test_1', user: 'Ahmet K.', comment: 'Harika organize edilmiş bir umre deneyimi yaşadım.', rating: 5),
    Testimonial(id: 'test_2', user: 'Fatma Y.', comment: 'Rehberler çok ilgili ve bilgilendiriciydi.', rating: 5),
    Testimonial(id: 'test_3', user: 'Mehmet D.', comment: 'Transfer ve otel hizmetleri kusursuzdu.', rating: 4),
  ].obs;

  @override
  void onInit() {
    super.onInit();
    loadWeather();
  }

  Future<void> loadWeather() async {
    try {
      weatherLoading.value = true;
      weatherError.value = '';
      // Coordinates: Makkah (21.4225, 39.8262), Medina (24.4672, 39.6111)
      final results = await Future.wait([
        _weatherService.fetchMonthlyAverages(latitude: 21.4225, longitude: 39.8262),
        _weatherService.fetchMonthlyAverages(latitude: 24.4672, longitude: 39.6111),
      ]);
      mekkahWeather.assignAll(results[0]);
      medinaWeather.assignAll(results[1]);
      if (mekkahWeather.isEmpty && medinaWeather.isEmpty) {
        weatherError.value = 'Veri bulunamadı';
      }
    } catch (e) {
      // Fallback dummy (so grafik alanı tamamen boş kalmasın)
      if (mekkahWeather.isEmpty) {
        mekkahWeather.assignAll([
          WeatherData(month: 'Oca', avgHigh: 31, avgLow: 19),
          WeatherData(month: 'Şub', avgHigh: 32, avgLow: 20),
        ]);
      }
      if (medinaWeather.isEmpty) {
        medinaWeather.assignAll([
          WeatherData(month: 'Oca', avgHigh: 29, avgLow: 15),
          WeatherData(month: 'Şub', avgHigh: 31, avgLow: 16),
        ]);
      }
      weatherError.value = 'Hava durumu alınamadı: $e';
    } finally {
      weatherLoading.value = false;
    }
  }
}

class Campaign {
  final String id;
  final String title;
  final String description;
  final String image;
  final String? tag;
  Campaign({required this.id, required this.title, required this.description, required this.image, this.tag});
}
