# Web Readiness Checklist (Pre-Deploy)

Son güncelleme: 26 Şubat 2026

## 1) Build/Lint Durumu

- [x] `npm run lint` başarılı
- [x] `npm run build` doğrulaması

## 2) Navigasyon Rotaları (Header/Footer/Auth)

### Ana modüller
- [x] `/hotels`
- [x] `/tours`
- [x] `/transfers`
- [x] `/cars`
- [x] `/guides`
- [x] `/visa`

### Kullanıcı alanı
- [x] `/auth`
- [x] `/profile`
- [x] `/reservations`
- [x] `/favorites`

### Kurumsal/İçerik
- [x] `/about`
- [x] `/contact`
- [x] `/campaigns`
- [x] `/blog`
- [x] `/careers`
- [x] `/faq`

### Yasal
- [x] `/privacy`
- [x] `/terms`
- [x] `/kvkk`
- [x] `/cancellation`
- [x] `/cookies`

## 3) Ödeme ve Rezervasyon Akışı

- [x] Otel listesi -> otel detay -> oda seçimi
- [x] WebBeds `block` -> `booking` akışı
- [x] KuveytTürk ödeme başlatma endpointi: `/api/payment/kuveytturk/initiate`
- [x] KuveytTürk callback endpointi: `/api/payment/kuveytturk/callback`
- [x] Sonuç ekranı: `/payment/kuveytturk/result`
- [x] Ödeme sonrası rezervasyon durum güncellemesi (callable üzerinden)

## 4) API Kapsamı

### WebBeds
- [x] `/api/webbeds/search`
- [x] `/api/webbeds/rooms`
- [x] `/api/webbeds/block`
- [x] `/api/webbeds/booking`

### Payment
- [x] `/api/payment/kuveytturk/initiate`
- [x] `/api/payment/kuveytturk/callback`

## 5) Modül Durumu Özeti

- **Hotels**: Arama + detay + oda + rezervasyon + ödeme entegrasyonu hazır.
- **Tours**: Listeleme/filtreleme arayüzü hazır.
- **Transfers**: Listeleme/filtreleme arayüzü hazır.
- **Cars**: Listeleme/filtreleme arayüzü hazır.
- **Guides**: Listeleme/arama arayüzü hazır.
- **Visa**: Başvuru durum izleme ekranı hazır (auth bağlı).
- **Reservations**: Kullanıcı rezervasyon listeleme + ödeme durum etiketleri hazır.

## 6) Deploy Öncesi Son 3 Kontrol

1. `npm run build` çalıştır.
2. `.env` / Firebase config değerlerini production için doğrula.
3. KuveytTürk callback URL’lerinin domain ile uyumunu kontrol et.

## 7) Canlı Smoke Test Senaryoları

### Auth
- [ ] `/auth` telefon girişi ekranı açılıyor
- [ ] OTP gönderme/geri dönüş hata mesajları doğru çalışıyor

### Hotels / Booking
- [ ] `/hotels` arama sonucu listeleniyor
- [ ] Otel detayına geçiş (`/hotels/[hotelId]`) çalışıyor
- [ ] Oda seçimi + rezervasyon formu submit ediliyor

### Payment (KuveytTürk)
- [ ] `/api/payment/kuveytturk/initiate` 200 + `paymentHtml` dönüyor
- [ ] Callback sonrası `/payment/kuveytturk/result` ekranı doğru parametrelerle açılıyor
- [ ] Başarılı/başarısız durumda rezervasyon payment status güncelleniyor

### User Area
- [ ] `/reservations` listeleme çalışıyor
- [ ] `/profile` ve `/favorites` erişilebilir

## 8) Release Gate (Go / No-Go)

- [x] Lint: PASS
- [x] Build: PASS
- [x] Route coverage: PASS
- [x] API coverage: PASS
- [ ] Smoke test: PASS (tamamlanınca işaretle)

> **Karar:** Smoke test tamamlanmadan production açılışı yapma.

## 9) İzleme ve Geri Dönüş

- [ ] Deploy sonrası ilk 30 dk için ödeme callback loglarını izle
- [ ] `/api/webbeds/*` hata oranını kontrol et
- [ ] Kritik hata durumunda son stabil release'e rollback planını hazır tut
