# Çoklu Tur Rezervasyon Sayfası Tasarım Planı

## Mevcut Durum Analizi

### Sorunlar
1. **Tur kartları ayrı ayrı gösteriliyor** - Her tur için ayrı [`TourInfoCard`](web-app/src/components/transfers/booking/TourInfoCard.tsx:27) kullanılıyor, çoklu seçimde yer kaplıyor
2. **Fiyat özeti karmaşık** - [`PriceSummaryCard`](web-app/src/components/transfers/booking/PriceSummaryCard.tsx:21) tek tur için tasarlanmış
3. **Tur ekleme/çıkarma yok** - Kullanıcı rezervasyon sayfasında tur ekleyip çıkaramıyor
4. **Görsel hiyerarşi eksik** - Hangi turların seçildiği net görünmüyor

## Tasarım Hedefleri

1. **Kompakt çoklu tur gösterimi** - Tüm turları tek kartta göster
2. **Net fiyat ayrıntısı** - Her turun fiyatını ayrı ayrı göster
3. **İnteraktif tur yönetimi** - Tur ekleme/çıkarma özelliği
4. **Mobil uyumlu** - Responsive tasarım

## Yeni Bileşen Tasarımı

### 1. MultiTourSummaryCard (Yeni)

```typescript
interface MultiTourSummaryCardProps {
  tours: PopularService[];
  onRemoveTour?: (tourId: string) => void;
  onAddTour?: () => void;
  transferPrice: number;
}
```

**Özellikler:**
- Tüm turları liste halinde göster (compact)
- Her tur için: İkon, İsim, Fiyat, Kaldır butonu
- Toplam tur fiyatı özeti
- "Tur Ekle" butonu
- Accordion ile detayları gizle/göster

### 2. Güncellenmiş PriceSummaryCard

**Değişiklikler:**
- Çoklu tur için fiyat ayrıntısı
- Her turun fiyatını ayrı satırda göster
- Alt toplam ve genel toplam
- Görsel fiyat ayrımı (Transfer vs Turlar)

## Sayfa Düzeni

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Transfer Rezervasyonu + Tur İsimleri                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  VehicleInfoCard (Araç Bilgileri)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MultiTourSummaryCard (YENİ)                        │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ ✓ Mekke Şehir Turu          800₺   [Kaldır] │   │    │
│  │  │ ✓ Arafat-Mina-Müzdelife     850₺   [Kaldır] │   │    │
│  │  │ + Tur Ekle                                  │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │  Toplam Tur Ücreti: 1.650₺                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PriceSummaryCard (Güncellenmiş)                    │    │
│  │  Transfer Ücreti:              500₺                 │    │
│  │  Turlar (2 adet):              1.650₺               │    │
│  │  ─────────────────────────────────────────          │    │
│  │  Toplam:                        2.150₺              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  BookingFormCard (Rezervasyon Formu)                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Mobil Düzen

```
┌─────────────────────────┐
│  Header                 │
├─────────────────────────┤
│  VehicleInfoCard        │
│  (resim galerisi)        │
├─────────────────────────┤
│  Turlar (2) ▼           │
│  • Mekke Şehir Turu     │
│    800₺ [x]             │
│  • Arafat-Mina...        │
│    850₺ [x]             │
│  + Tur Ekle             │
├─────────────────────────┤
│  Fiyat Özeti ▼          │
│  Transfer: 500₺         │
│  Turlar: 1.650₺        │
│  Toplam: 2.150₺        │
├─────────────────────────┤
│  Rezervasyon Formu      │
│  [Tarih] [Saat]         │
│  [Yolcu] [İletişim]     │
│  [Rezervasyon Yap]      │
└─────────────────────────┘
```

## Renk Paleti

- **Transfer**: Mavi tonları (cyan-600)
- **Turlar**: Turuncu tonları (orange-600)
- **Fiyat**: Yeşil tonları (emerald-600)
- **Uyarı**: Kırmızı tonları (red-600)

## Implementasyon Sırası

1. ✅ TransferCard - Çoklu tur fiyat hesaplama
2. ✅ PopularServicesSection - Başlayan fiyatlar
3. ✅ BookingFormCard - Çoklu tur desteği
4. ✅ Rezervasyon sayfası - URL parsing
5. ⏳ **MultiTourSummaryCard** - Yeni bileşen
6. ⏳ PriceSummaryCard - Çoklu tur güncellemesi
7. ⏳ Tur ekleme modal/dialog
8. ⏳ Mobil responsive test

## Kullanıcı Akışı

1. Kullanıcı transfer sayfasında 2+ tur seçer
2. Araç kartında toplam fiyat görünür
3. Rezervasyon sayfasına tıklar
4. Tüm turlar özet kartında listelenir
5. Kullanıcı tur kaldırabilir veya yeni tur ekleyebilir
6. Fiyat otomatik güncellenir
7. Rezervasyon formunu doldurur
