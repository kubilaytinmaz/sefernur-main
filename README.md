# Sefernur - Umre ve Hac Seyahat Platformu

**Sefernur**, Türk Müslümanların Umre ve Hac gibi dini seyahatlerini planlamalarına yardımcı olan kapsamlı bir dijital seyahat platformudur. Otel rezervasyonundan tur paketlerine, transferlerden vize hizmetlerine kadar her şeyi tek bir uygulamada sunar.

---

## 📱 Genel Bakış

Sefernur, WebBeds (DOTWconnect) XML API entegrasyonu ile 25.000+ otele erişim sağlayan, KuveytTürk Sanal POS ile güvenli ödeme alan ve Firebase tabanlı modern bir B2C seyahat platformudur.

### 🎯 Temel Özellikler

- **🏨 Otel Rezervasyonu**: WebBeds entegrasyonu ile Mekke, Medine ve diğer şehirlerde 25.000+ otel
- **✈️ Umre ve Hac Paketleri**: Ekonomik, Standart ve Lüks kategorilerde hazır tur paketleri
- **🚗 Transfer Hizmetleri**: Havalimanı transferleri ve şehirler arası ulaşım
- **👨‍🏫 Rehber Hizmetleri**: Türkçe konuşan profesyonel tur ve dini rehberler
- **🚙 Araç Kiralama**: Günlük ve haftalık araç kiralama seçenekleri
- **📋 Vize Hizmetleri**: Vize başvuru desteği ve doküman takibi
- **💳 Güvenli Ödeme**: KuveytTürk 3D Secure ile güvenli ödeme altyapısı
- **📱 Çok Platformlu**: iOS, Android ve Web desteği
- **🔔 Anlık Bildirimler**: Firebase Cloud Messaging ile kampanya ve rezervasyon bildirimleri
- **⭐ Favoriler ve Değerlendirmeler**: Kullanıcı yorumları ve favori sistemi
- **🌙 Karanlık Mod**: Tam tema desteği (açık/koyu)
- **🌍 Çoklu Dil**: Türkçe ve İngilizce

---

## 🏗️ Teknoloji Stack

### 📱 Mobil Uygulama (Flutter)

#### Framework & State Management

- **Flutter SDK**: >=3.16.0
- **Dart SDK**: ^3.8.1
- **State Management**: GetX 4.7.2 (reaktif state, navigasyon, dependency injection)
- **Mimari**: Clean Architecture + GetX pattern

#### Firebase Entegrasyonları

- `firebase_core` 4.2.1 - Firebase projesi: `sefernur-app`
- `firebase_auth` 6.1.2 - Telefon, Google, Apple kimlik doğrulama
- `cloud_firestore` 6.1.0 - NoSQL veritabanı
- `firebase_storage` 13.0.4 - Dosya depolama
- `firebase_messaging` 16.0.4 - Push notifications
- `firebase_analytics` 12.0.4 - Analitik
- `firebase_remote_config` 6.1.1 - Uzaktan konfigürasyon
- `firebase_database` 12.0.4 - Realtime database
- `cloud_functions` 6.0.4 - Cloud functions client

#### Networking & API

- **Dio** 5.9.0 - HTTP client
- **connectivity_plus** 7.0.0 - Ağ bağlantısı izleme
- **WebBeds XML API** - Özel XML parser/builder ile otel rezervasyonları

#### Yerel Depolama

- **get_storage** 2.1.1 - Hafif key-value storage
- **cached_network_image** 3.4.1 - Görüntü önbellekleme

#### UI & Tasarım

- **flutter_screenutil** 5.9.3 - Responsive boyutlandırma
- **google_fonts** 6.3.2 - Tipografi
- **lottie** 3.3.2 - Animasyonlar
- **flutter_svg** 2.2.2 - SVG desteği
- **animated_bottom_navigation_bar** 1.4.0 - Alt navigasyon animasyonu

#### Kimlik Doğrulama

- **google_sign_in** 7.2.0 - Google ile giriş
- **sign_in_with_apple** 7.0.1 - Apple ile giriş (iOS)
- **Firebase Phone Auth** - Telefon numarası ile doğrulama

#### Ödeme Entegrasyonu

- **KuveytTürk Sanal POS** - 3D Secure ödeme gateway
- WebView tabanlı 3D Secure sayfaları

#### Harita & Konum

- **flutter_map** 8.2.2 - OpenStreetMap
- **geolocator** 14.0.2 - GPS konum
- **latlong2** 0.9.1 - Koordinat işleme

#### Chat

- **flutter_firebase_chat_core** 1.6.8 - Firebase tabanlı chat
- **flutter_chat_types** 3.6.2 - Chat UI tipleri

#### Yerelleştirme

- **flutter_localizations** (SDK)
- **intl** 0.20.2 - Tarih/sayı formatlama
- **Desteklenen Diller**: Türkçe (tr_TR), İngilizce (en_US)

#### Form & Validasyon

- **flutter_form_builder** 10.2.0
- **country_code_picker** 3.4.1
- **pinput** 5.0.2 - OTP girişi
- **validators** 3.0.0

#### Code Generation

- **freezed** 3.2.3 + **json_serializable** 6.11.1
- **build_runner** 2.10.1

#### Diğer Önemli Paketler

- `package_info_plus` 8.3.1 - Uygulama sürüm bilgisi
- `url_launcher` 6.3.1 - Deep links
- `share_plus` 12.0.1 - Paylaşım
- `app_links` 6.4.1 - Deep link yönetimi
- `permission_handler` 12.0.1 - İzinler
- `image_picker` 1.2.0 + `file_picker` 10.3.3
- `easy_date_timeline` 2.0.9 - Tarih seçimi
- `smooth_page_indicator` 1.2.0 - Sayfa göstergeleri
- `uuid` 4.5.1 - Benzersiz ID'ler

### 🌐 Web Uygulaması (Next.js)

`web-app/` dizininde:

#### Framework

- **Next.js** 16.1.6 (App Router)
- **React** 19.2.3
- **TypeScript** ^5

#### State Management

- **Zustand** 5.0.11 - Hafif state management
- **TanStack React Query** 5.90.20 - Server state

#### API Entegrasyonu

- **axios** 1.13.4 - HTTP client
- **fast-xml-parser** 5.3.4 - WebBeds XML parsing
- **crypto-js** 4.2.0 - Ödeme şifreleme

#### Firebase

- **firebase** 12.8.0 - Web SDK

#### Stil

- **Tailwind CSS** 4.x
- **lucide-react** 0.563.0 - İkonlar

#### Validasyon

- **zod** 4.3.6 - Schema validasyon

### 🎨 Landing Page (React + Vite)

`landing/` dizininde:

- **React** 18.3.1 with Vite
- **Radix UI** components
- **shadcn/ui** component patterns

### ☁️ Backend (Firebase Cloud Functions)

`functions/` dizininde:

- **Node.js** 20
- **firebase-functions** 6.0.1 (v2)
- **firebase-admin** 12.6.0
- **Region**: europe-west1
- **Max instances**: 10

**Cloud Functions:**

- Bildirim tetikleyicileri (kampanya, yorum, blog)
- Push notification toplu gönderimi (500 token/batch)

---

## 📂 Proje Yapısı

### Flutter Uygulama Yapısı (`lib/`)

```
lib/
├── firebase_options.dart          # Firebase konfigürasyonu
├── main.dart                      # Uygulama giriş noktası
└── app/
    ├── bindings/                  # GetX dependency injection
    │   ├── auth/
    │   ├── main/
    │   ├── admin/
    │   ├── splash/
    │   ├── onboarding/
    │   ├── notification/
    │   └── referrals/
    ├── controllers/               # GetX controllers (sunum mantığı)
    │   ├── auth/
    │   ├── main/
    │   ├── booking/
    │   ├── notification/
    │   └── ...
    ├── data/                      # Data layer
    │   ├── adapters/              # Data adaptörleri
    │   ├── enums/                 # Enumerations
    │   ├── error/                 # Hata yönetimi
    │   ├── models/                # Data modelleri
    │   │   ├── user/
    │   │   ├── hotel/
    │   │   ├── tour/
    │   │   ├── webbeds/           # WebBeds XML modelleri
    │   │   ├── payment/           # KuveytTürk ödeme modelleri
    │   │   └── reservation/
    │   ├── providers/             # API providers
    │   │   ├── dio/               # REST API
    │   │   ├── firebase/          # Firestore, Storage
    │   │   ├── webbeds/           # WebBeds XML API
    │   │   └── payment/           # KuveytTürk ödeme
    │   ├── repositories/          # Repository pattern
    │   │   ├── auth/
    │   │   ├── hotel/
    │   │   ├── webbeds/
    │   │   └── user/
    │   └── services/              # Business logic (GetxService)
    │       ├── auth/              # AuthService (1083 satır)
    │       ├── webbeds/           # WebBedsService (568 satır)
    │       ├── payment/           # KuveytTurkService (384 satır)
    │       ├── starter/           # Firebase init
    │       ├── theme/             # ThemeService
    │       ├── language/          # LanguageService
    │       ├── currency/          # CurrencyService
    │       ├── favorite/          # FavoriteService
    │       ├── reservation/       # ReservationService
    │       └── notification/      # NotificationService
    ├── routes/                    # Uygulama routing
    │   ├── app_pages.dart         # Route tanımları
    │   └── routes.dart            # Route sabitleri
    ├── translation/               # Yerelleştirme
    │   ├── app_translation.dart
    │   ├── en_us/
    │   └── tr_tr/
    ├── utils/                     # Utility fonksiyonlar
    ├── dev_utils/                 # Geliştirme araçları
    └── view/                      # Sunum katmanı
        ├── pages/                 # Ekranlar
        │   ├── splash/
        │   ├── onboarding/
        │   ├── auth/
        │   ├── main/              # Alt navigasyonlu ana sayfa
        │   ├── home/
        │   ├── search/
        │   ├── hotels/
        │   ├── booking/           # WebBeds rezervasyon sihirbazı
        │   ├── tours/
        │   ├── transfers/
        │   ├── guides/
        │   ├── car_rental/
        │   ├── visa/
        │   ├── profile/
        │   ├── admin/
        │   ├── referrals/
        │   ├── notification/
        │   └── payment/           # KuveytTürk ödeme WebView
        ├── widgets/               # Yeniden kullanılabilir widget'lar
        └── themes/                # Tema konfigürasyonu
```

### Mimari Pattern

**Clean Architecture** + GetX:

- **Repository Pattern**: Veri kaynaklarını soyutlar
- **Service Layer**: İş mantığı, önbellekleme, hata yönetimi
- **Provider Pattern**: API client'ları (Dio, Firebase, WebBeds)
- **Adapter Pattern**: Harici API'ları dahili modellere dönüştürür
- **Observer Pattern**: GetX reaktif state (`.obs`, `Obx`)
- **Dependency Injection**: Route bazında GetX bindings

### Data Flow

```
View (Pages/Widgets)
  ↓ Kullanıcı Eylemi
Controller (GetX)
  ↓ İş Mantığı
Service (GetxService)
  ↓ Data Dönüşümü
Repository
  ↓ API Çağrısı
Provider (Dio/Firebase/WebBeds)
  ↓ Network
Harici API (Firebase/WebBeds/KuveytTürk)
```

---

## 🚀 Kurulum

### Önkoşullar

1. **Flutter SDK** >= 3.16.0

   ```bash
   flutter --version
   ```

2. **Dart SDK** ^3.8.1 (Flutter ile birlikte gelir)

3. **Firebase CLI** (Cloud Functions için)

   ```bash
   npm install -g firebase-tools
   ```

4. **Node.js** 20+ (Cloud Functions ve web projeler için)

5. **CocoaPods** (iOS için)
   ```bash
   sudo gem install cocoapods
   ```

### Adım 1: Depoyu Klonlayın

```bash
git clone <repository-url>
cd sefernur
```

### Adım 2: Flutter Bağımlılıklarını Yükleyin

```bash
flutter pub get
```

### Adım 3: Code Generation

Freezed ve JSON serializable için kod üretin:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Adım 4: Firebase Konfigürasyonu

#### 4.1 Firebase Projesi Oluşturun

1. [Firebase Console](https://console.firebase.google.com/) üzerinden `sefernur-app` projesine erişin
2. **Blaze (Pay-as-you-go)** planına geçin (telefon doğrulama için SMS gereklidir)

#### 4.2 iOS Konfigürasyonu

1. **iOS uygulaması ekleyin**:
   - Bundle ID: `com.eyexapp.sefernur`
   - `GoogleService-Info.plist` dosyasını `ios/Runner/` dizinine yerleştirin

2. **APNs (Push Notifications) Konfigürasyonu**:
   - Apple Developer hesabından `.p8` key dosyası oluşturun
   - Firebase Console > Project Settings > Cloud Messaging > iOS app configuration
   - APNs Authentication Key yükleyin (Key ID ve Team ID gerekli)
   - **Detaylı rehber**: [docs/PHONE_AUTH_SETUP.md](docs/PHONE_AUTH_SETUP.md)

3. **CocoaPods yükleyin**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

#### 4.3 Android Konfigürasyonu

1. **Android uygulaması ekleyin**:
   - Package name: `com.eyexapp.sefernur`
   - `google-services.json` dosyasını `android/app/` dizinine yerleştirin

2. **SHA Fingerprints ekleyin**:

   **Debug fingerprint** (geliştirme için):

   ```bash
   cd android
   ./gradlew signingReport
   ```

   **Release fingerprint** (keystore oluşturduktan sonra):

   ```bash
   keytool -list -v -keystore ~/keystore.jks -alias key
   ```

   Firebase Console > Project Settings > General > Your apps > Android app
   - SHA-1 ve SHA-256 fingerprint'leri ekleyin

#### 4.4 Firebase Servisleri Etkinleştirin

Firebase Console'da şunları etkinleştirin:

1. **Authentication**:
   - Phone (SMS doğrulama)
   - Google
   - Apple (iOS için)
   - Test telefon numaraları ekleyin (opsiyonel)

2. **Firestore Database**:
   - Production mode'da oluşturun
   - Güvenlik kurallarını ayarlayın

3. **Storage**:
   - Bucket: `sefernur-app.appspot.com`
   - Güvenlik kurallarını ayarlayın

4. **Cloud Messaging**:
   - iOS için APNs konfigürasyonu (yukarıda yapıldı)

5. **Analytics** (otomatik etkin)

6. **Remote Config** (opsiyonel)

### Adım 5: API Credentials Konfigürasyonu

#### 5.1 WebBeds (DOTWconnect) Credentials

`lib/app/data/providers/webbeds/webbeds_config.dart` dosyasını düzenleyin:

```dart
class WebBedsConfig {
  static const String username = 'YOUR_WEBBEDS_USERNAME';
  static const String password = 'YOUR_WEBBEDS_PASSWORD'; // MD5 encrypted
  static const String merchantId = 'YOUR_MERCHANT_ID';
  static const String baseUrl = 'https://us.dotwconnect.com/gatewayV4.dotw'; // Production
  // Test için: 'https://xmldev.dotwconnect.com/gatewayV4.dotw'
}
```

**Test Credentials** (geliştirme için):

- Username: `birlikgrup`
- Company Code: `2285355`
- Password: MD5 şifreleme gerekli
- Base URL: `https://xmldev.dotwconnect.com/gatewayV4.dotw`

**Detaylı WebBeds Dokümantasyonu**:

- [docs/dotwconnect.com.md](docs/dotwconnect.com.md) - API kullanım rehberi (Türkçe)
- [docs/Best Practice Notes.md](docs/Best%20Practice%20Notes.md) - En iyi pratikler
- API dökümanı 11,617+ satır

#### 5.2 KuveytTürk Sanal POS Credentials

`lib/app/data/services/payment/kuveyt_turk_service.dart` dosyasını düzenleyin:

```dart
class KuveytTurkService extends GetxService {
  static const String merchantId = 'YOUR_MERCHANT_ID';
  static const String userName = 'YOUR_USERNAME';
  static const String password = 'YOUR_PASSWORD';
  static const String customerId = 'YOUR_CUSTOMER_ID';
  // ...
}
```

**Önemli**: KuveytTürk test ortamı için banka ile iletişime geçin.

**3D Secure Dokümantasyonu**: [docs/koveyturk_pos/](docs/koveyturk_pos/)

### Adım 6: Android Release Build Konfigürasyonu

#### 6.1 Keystore Oluşturun

```bash
keytool -genkey -v -keystore ~/keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
```

#### 6.2 key.properties Dosyası Oluşturun

`android/key.properties` dosyası oluşturun (`.gitignore`'da olmalı):

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=key
storeFile=/Users/yourusername/keystore.jks
```

**Not**: `android/key.properties.txt` şablonunu referans alın.

### Adım 7: iOS Release Build Konfigürasyonu

1. **Xcode ile açın**:

   ```bash
   open ios/Runner.xcworkspace
   ```

2. **Bundle Identifier**: `com.eyexapp.sefernur`

3. **Signing & Capabilities**:
   - Team seçin
   - Provisioning profile ayarlayın
   - **Push Notifications** capability'sini ekleyin

4. **APNs Key** Firebase'e yüklendiğinden emin olun

### Adım 8: Web App Konfigürasyonu (Opsiyonel)

`web-app/` dizininde:

#### 8.1 Bağımlılıkları Yükleyin

```bash
cd web-app
npm install
```

#### 8.2 Environment Variables

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sefernur-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sefernur-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sefernur-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key

# WebBeds Credentials
WEBBEDS_USERNAME=your_username
WEBBEDS_PASSWORD=your_password_md5
WEBBEDS_MERCHANT_ID=your_merchant_id

# KuveytTürk Credentials
KUVEYTTURK_MERCHANT_ID=your_merchant_id
KUVEYTTURK_USERNAME=your_username
KUVEYTTURK_PASSWORD=your_password
```

**Firebase Web Setup**: [web-app/FIREBASE_SETUP.md](web-app/FIREBASE_SETUP.md)

#### 8.3 Development Server

```bash
npm run dev
```

### Adım 9: Cloud Functions Deploy (Opsiyonel)

```bash
cd functions
npm install
firebase login
firebase deploy --only functions
```

### Adım 10: Landing Page Deploy (Opsiyonel)

```bash
cd landing
npm install
npm run build
firebase deploy --only hosting
```

---

## 🏃 Uygulamayı Çalıştırma

### Debug Mode

**iOS Simulator**:

```bash
flutter run -d iphone
```

**Android Emulator**:

```bash
flutter run -d emulator-5554
```

**Chrome (Web)**:

```bash
flutter run -d chrome
```

**Cihaz listesini görmek için**:

```bash
flutter devices
```

### Release Mode

**iOS (cihazda test)**:

```bash
flutter run --release -d <device-id>
```

**Android APK**:

```bash
flutter build apk --release
```

**Android App Bundle (Google Play için)**:

```bash
flutter build appbundle --release
```

**iOS Archive (App Store için)**:

```bash
flutter build ipa
```

---

## 🔧 Geliştirme Notları

### State Management (GetX)

**Controller Oluşturma**:

```dart
class MyController extends GetxController {
  var count = 0.obs; // Observable

  void increment() => count++;

  @override
  void onInit() {
    super.onInit();
    // Initialize
  }
}
```

**View'de Kullanım**:

```dart
class MyPage extends GetView<MyController> {
  @override
  Widget build(BuildContext context) {
    return Obx(() => Text('Count: ${controller.count}'));
  }
}
```

**Binding**:

```dart
class MyBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MyController>(() => MyController());
  }
}
```

### WebBeds Entegrasyonu

**Otel Arama**:

```dart
final result = await Get.find<WebBedsService>().searchHotels(
  cityId: 'MCT',
  checkIn: DateTime.now(),
  checkOut: DateTime.now().add(Duration(days: 3)),
  rooms: [RoomInfo(adults: 2, children: [])],
);
```

**Rezervasyon Akışı**:

1. `searchHotels` - Otel ara
2. `getRooms` - Oda ve fiyat bilgilerini getir
3. `getRooms(withBlocking: true)` - Fiyatı 3 dakika blokla
4. `confirmBooking` - Rezervasyonu tamamla

**Önemli**: [docs/Best Practice Notes.md](docs/Best%20Practice%20Notes.md) dosyasını okuyun!

### Dark Mode

Tema değiştirme:

```dart
Get.find<ThemeService>().switchTheme();
```

**Dark Mode Tasarım Rehberi**: [docs/DARK_MODE_GUIDE.md](docs/DARK_MODE_GUIDE.md)

### Çoklu Dil Desteği

Dil değiştirme:

```dart
Get.updateLocale(Locale('tr', 'TR')); // Türkçe
Get.updateLocale(Locale('en', 'US')); // İngilizce
```

Çeviri kullanımı:

```dart
Text('key'.tr) // GetX translation
```

---

## 🔐 Güvenlik

### Hassas Bilgilerin Yönetimi

**Asla repository'ye eklemeyin**:

- ❌ `android/key.properties`
- ❌ `android/app/google-services.json`
- ❌ `ios/Runner/GoogleService-Info.plist`
- ❌ `.env.local` (web-app)
- ❌ API credentials (WebBeds, KuveytTürk)

**Environment Variables Kullanın**:

- Production'da ortam değişkenleri kullanın
- Firebase Remote Config ile runtime'da çekin
- Keystore'ları güvenli yerlerde saklayın

### Firebase Security Rules

**Firestore**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Storage**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📊 Testing

### Unit Tests

```bash
flutter test
```

### Widget Tests

```bash
flutter test test/widget_test.dart
```

### Integration Tests

```bash
flutter test integration_test/app_test.dart
```

---

## 🚀 Deployment

### Pre-Deployment Checklist

#### Firebase

- [ ] Firebase Blaze planına geçildi
- [ ] Authentication providers etkinleştirildi (Phone, Google, Apple)
- [ ] iOS için APNs .p8 key yüklendi
- [ ] Android SHA-1/SHA-256 fingerprints eklendi
- [ ] Firestore güvenlik kuralları ayarlandı
- [ ] Storage güvenlik kuralları ayarlandı
- [ ] Cloud Functions deploy edildi

#### API Credentials

- [ ] WebBeds production credentials alındı
- [ ] KuveytTürk merchant credentials alındı
- [ ] reCAPTCHA site key konfigüre edildi (web)

#### Mobile App

- [ ] Android keystore oluşturuldu
- [ ] iOS provisioning profiles ve certificates hazır
- [ ] App Store Connect / Google Play Console kuruldu
- [ ] App icons ve splash screens hazır
- [ ] Version number güncellendi (`pubspec.yaml`)

#### Web App

- [ ] Next.js app deploy edildi (Vercel önerilir)
- [ ] Environment variables ayarlandı
- [ ] Custom domain konfigüre edildi

#### Landing Page

- [ ] Landing page build edildi
- [ ] Firebase Hosting'e deploy edildi

### Android Release

1. **Build App Bundle**:

   ```bash
   flutter build appbundle --release
   ```

2. **APK Build**:

   ```bash
   flutter build apk --release --split-per-abi
   ```

3. **Google Play Console'a yükleyin**:
   - `build/app/outputs/bundle/release/app-release.aab`

### iOS Release

1. **Archive Build**:

   ```bash
   flutter build ipa
   ```

2. **Xcode ile Archive**:

   ```bash
   open ios/Runner.xcworkspace
   ```

   - Product > Archive
   - Distribute App > App Store Connect

3. **TestFlight** veya **App Store** üzerinden yayınlayın

### Web Deployment

#### Next.js App (Vercel)

```bash
cd web-app
vercel --prod
```

Veya GitHub entegrasyonu ile otomatik deployment.

#### Landing Page (Firebase Hosting)

```bash
cd landing
npm run build
firebase deploy --only hosting
```

### Cloud Functions

```bash
cd functions
firebase deploy --only functions
```

---

## 📱 Platform Desteği

| Platform | Durum             | Notlar                                  |
| -------- | ----------------- | --------------------------------------- |
| Android  | ✅ Destekleniyor  | Min SDK 21 (Android 5.0), Target SDK 36 |
| iOS      | ✅ Destekleniyor  | iOS 12.0+, APNs gerekli                 |
| Web      | ✅ Destekleniyor  | Flutter Web + Next.js ayrı web app      |
| macOS    | ❌ Desteklenmiyor | Firebase konfigürasyonu yok             |
| Windows  | ❌ Desteklenmiyor | Firebase konfigürasyonu yok             |
| Linux    | ❌ Desteklenmiyor | Firebase konfigürasyonu yok             |

---

## 📚 Dokümantasyon

Detaylı dokümantasyon `docs/` dizininde:

- **[PHONE_AUTH_SETUP.md](docs/PHONE_AUTH_SETUP.md)** - Telefon doğrulama kurulumu (250 satır)
- **[DARK_MODE_GUIDE.md](docs/DARK_MODE_GUIDE.md)** - Dark mode tasarım rehberi (337 satır)
- **[dotwconnect.com.md](docs/dotwconnect.com.md)** - WebBeds API dökümanı (11,617 satır!)
- **[Best Practice Notes.md](docs/Best%20Practice%20Notes.md)** - WebBeds en iyi pratikler
- **[FIREBASE_SETUP.md](web-app/FIREBASE_SETUP.md)** - Firebase web kurulumu
- **[koveyturk_pos/](docs/koveyturk_pos/)** - KuveytTürk POS entegrasyonu

---

## 🐛 Bilinen Sorunlar

### iOS Phone Auth

**Sorun**: `internal-error` veya SMS gelmiyor

**Çözüm**:

1. APNs .p8 key yüklenmiş mi kontrol edin
2. Push Notifications capability aktif mi?
3. Test telefonu Firebase Console'a ekleyin
4. Detaylar: [docs/PHONE_AUTH_SETUP.md](docs/PHONE_AUTH_SETUP.md)

### Android Phone Auth

**Sorun**: `QUOTA_EXCEEDED` veya doğrulama başarısız

**Çözüm**:

1. SHA-1 ve SHA-256 fingerprints Firebase'e eklendi mi?
2. `google-services.json` güncel mi?
3. Firebase Blaze planı aktif mi?

### WebBeds Timeout

**Sorun**: `searchHotels` çok uzun sürüyor

**Çözüm**:

1. Maks 50 otel/request kullanın
2. Static data cache kullanın (weekly update)
3. En iyi pratikler: [docs/Best Practice Notes.md](docs/Best%20Practice%20Notes.md)

---

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Lisans

Bu proje özel bir lisans altındadır. Detaylar için lütfen proje sahibi ile iletişime geçin.

---

## 👥 İletişim

**Proje Sahibi**: Eyex App

**Firebase Projesi**: `sefernur-app`

**Web**: [Firebase Hosting](https://sefernur-app.firebaseapp.com)

---

## 🙏 Teşekkürler

- **Firebase** - Backend altyapısı
- **WebBeds (DOTWconnect)** - Otel rezervasyon API
- **KuveytTürk** - Ödeme gateway
- **GetX** - Flutter state management
- **Flutter Community** - Açık kaynak paketler

---

## 📊 Proje İstatistikleri

- **Toplam Kod Satırı**: 50,000+ (tahmin)
- **Flutter Paketleri**: 80+
- **API Entegrasyonları**: 3 (Firebase, WebBeds, KuveytTürk)
- **Desteklenen Diller**: 2 (TR, EN)
- **Platformlar**: 3 (iOS, Android, Web)
- **Cloud Functions**: 5+
- **Dokümantasyon**: 13,000+ satır

---

**Son Güncelleme**: 3 Şubat 2026

**Versiyon**: 0.1.0+10
