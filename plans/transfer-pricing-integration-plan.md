# Transfer Fiyat Entegrasyon Planı

## Resimden Çıkarılan Fiyat Verileri (SAR)

### Jeddah Havalimanı (JED) → Mekke
- Sedan: 150 SAR
- Van GMC: 200 SAR
- Toyota Hiace: 250 SAR

### Jeddah Havalimanı (JED) → Medine
- Sedan: 350 SAR
- Van GMC: 400 SAR
- Toyota Hiace: 450 SAR

### Mekke → Medine
- Sedan: 250 SAR
- Van GMC: 300 SAR
- Toyota Hiace: 350 SAR

### Mekke → Jeddah Havalimanı (JED)
- Sedan: 150 SAR
- Van GMC: 200 SAR
- Toyota Hiace: 250 SAR

### Medine → Jeddah Havalimanı (JED)
- Sedan: 350 SAR
- Van GMC: 400 SAR
- Toyota Hiace: 450 SAR

### Medine → Mekke
- Sedan: 250 SAR
- Van GMC: 300 SAR
- Toyota Hiace: 350 SAR

## SAR → TL Dönüşüm Oranı
- 1 SAR ≈ 9.5 TL (güncel kur varsayımı)

## Güncellenmiş Fiyatlar (TL)

### Jeddah Havalimanı (JED) ↔ Mekke
- Sedan: 1.425 TL (150 SAR)
- Van GMC: 1.900 TL (200 SAR)
- Toyota Hiace: 2.375 TL (250 SAR)

### Jeddah Havalimanı (JED) ↔ Medine
- Sedan: 3.325 TL (350 SAR)
- Van GMC: 3.800 TL (400 SAR)
- Toyota Hiace: 4.275 TL (450 SAR)

### Mekke ↔ Medine
- Sedan: 2.375 TL (250 SAR)
- Van GMC: 2.850 TL (300 SAR)
- Toyota Hiace: 3.325 TL (350 SAR)

## Eksik Veriler (Tahmin Edilen)

### Medine Havalimanı (MED) → Mekke
- Mesafe: ~450 km
- Sedan: 3.500 TL (tahmin)
- Van GMC: 4.000 TL (tahmin)
- Toyota Hiace: 4.500 TL (tahmin)

### Medine Havalimanı (MED) → Medine Şehir
- Mesafe: ~15 km
- Sedan: 300 TL (tahmin)
- Van GMC: 400 TL (tahmin)
- Toyota Hiace: 500 TL (tahmin)

### Mekke Şehir İçi Transferler
- Mesafe: 5-20 km
- Sedan: 200-400 TL
- Van GMC: 300-500 TL
- Toyota Hiace: 400-600 TL

### Medine Şehir İçi Transferler
- Mesafe: 5-20 km
- Sedan: 200-400 TL
- Van GMC: 300-500 TL
- Toyota Hiace: 400-600 TL

## Araç Kapasite Bilgileri

### Sedan
- Kapasite: 1-4 yolcu
- Bagaj: 2 büyük + 1 küçük
- Örnek: Toyota Camry, Hyundai Sonata

### Van GMC
- Kapasite: 5-7 yolcu
- Bagaj: 4-5 büyük
- Örnek: GMC Savana

### Toyota Hiace
- Kapasite: 8-12 yolcu
- Bagaj: 6-8 büyük
- Örnek: Toyota Hiace Commuter

## Entegrasyon Adımları

### 1. Pricing Sistemi Güncellemesi
- `web-app/src/lib/transfers/pricing.ts` dosyasını güncelle
- Araç tiplerine göre fiyat çarpanlarını ekle
- Mesafe bazlı fiyat hesaplamasını düzelt

### 2. Transfer Routes Güncellemesi
- `web-app/src/lib/transfers/transfer-locations.ts` dosyasını güncelle
- Gerçek mesafeleri ekle
- Yeni rotaları ekle (MED havalimanı vb.)

### 3. Popular Routes Güncellemesi
- `web-app/src/lib/transfers/popular-routes.ts` dosyasını güncelle
- Gerçek fiyatları ekle
- Yeni rotaları ekle

### 4. Firestore Veri Ekleme
- Transfer araçlarını Firestore'a ekle
- Her araç için doğru fiyatları kullan

### 5. Frontend Test
- Transfer sayfasını test et
- Fiyat hesaplamalarını doğrula
- Rezervasyon akışını test et

## Dosya Değişiklikleri

1. `web-app/src/lib/transfers/pricing.ts` - Fiyat hesaplama mantığı
2. `web-app/src/lib/transfers/transfer-locations.ts` - Rota ve lokasyon verileri
3. `web-app/src/lib/transfers/popular-routes.ts` - Popüler rotalar
4. `web-app/src/lib/transfers/popular-services-simple.ts` - Popüler hizmetler
5. Firestore - Transfer araçları koleksiyonu

## Fiyatlandırma Stratejisi

### Baz Fiyatlar (TL)
- Sedan: 1.425 - 3.500 TL
- Van GMC: 1.900 - 4.500 TL
- Toyota Hiace: 2.375 - 5.000 TL

### Ek Ücretler
- Gece sürşarjı (22:00-06:00): %20
- Bekleme ücreti: 100 TL/saat
- Fazla bagaj: 50 TL/bagaj
- Çocuk koltuğu: 50 TL

### İndirimler
- Erken rezervasyon (7+ gün): %5
- Grup indirimi (10+ kişi): %10
- Dönüş transferi: %10
