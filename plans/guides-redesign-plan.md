# Rehber Kiralama Sistemi - Yeniden Tasarım Planı

## Proje Özeti
Bu plan, mevcut rehber kiralama sisteminin kullanıcı deneyimini, görsel tasarımını ve teknik altyapısını kapsamlı bir şekilde iyileştirmeyi amaçlamaktadır.

---

## Mevcut Durum Analizi

### Mevcut Dosyalar
| Dosya | Açıklama |
|-------|----------|
| `web-app/src/app/guides/page.tsx` | Rehber listesi sayfası |
| `web-app/src/app/guides/[guideId]/_client.tsx` | Rehber detay sayfası |
| `web-app/src/app/admin/guides/page.tsx` | Admin liste sayfası |
| `web-app/src/app/admin/guides/[id]/_client.tsx` | Admin detay/düzenleme |
| `web-app/src/types/guide.ts` | Veri modeli |

### Mevcut Özellikler
- Temel rehber listesi ve filtreleme (uzmanlık, dil)
- Rehber detay sayfası
- Rezervasyon formu
- Admin paneli (CRUD işlemleri)
- Müsaitlik takvimi (veri modelinde mevcut)

### Tespit Edilen Eksiklikler
1. Sınırlı sıralama seçenekleri
2. Karşılaştırma özelliği yok
3. Harita görünümü yok
4. İnceleme sistemi yetersiz
5. Görsel tasarım modern standartların altında
6. Mobil deneyim iyileştirilebilir

---

## Yeniden Tasarım Hedefleri

### 1. Kullanıcı Deneyimi İyileştirmeleri

#### 1.1 Gelişmiş Filtreleme
- Çoklu filtre kombinasyonu
- Filtre presetleri (Hac için, Umre için, VIP vb.)
- Konum bazlı filtreleme (yakınımdaki rehberler)
- Fiyat aralığı slider
- Müsaitlik filtresi

#### 1.2 Sıralama Seçenekleri
- Önerilen (varsayılan)
- En yüksek puan
- En düşük fiyat
- En yüksek fiyat
- En çok yorum alan
- Deneyim yılına göre

#### 1.3 Rehber Karşılaştırma
- Yan yana kart karşılaştırma
- Özellik tablosu
- Fark vurgulama
- Maksimum 3 rehber karşılaştırma

#### 1.4 Harita Görünümü
- Rehberlerin harita üzerinde gösterimi
- Cluster işaretleme
- Konuma göre filtreleme
- Harita ve liste görünümü geçişi

### 2. Görsel Tasarım Yenilemeleri

#### 2.1 Kart Tasarımı
- Glassmorphism efektleri
- Yumuşak gölgeler ve border'lar
- Hover animasyonları
- Daha büyük görseller
- Öne çıkan bilgilerin vurgulanması

#### 2.2 Renk Paleti
- Ana renk: Mor/Menekşe (violet-600, violet-700)
- Vurgu renkleri: Amber (popüler), Emerald (sertifikalı)
- Nötr arka planlar: Slate tonları
- Gradient kullanımı

#### 2.3 Tipografi
- Okunabilir font boyutları
- Hiyerarşik başlık yapısı
- Yeterli boşluk kullanımı

### 3. Yeni Özellikler

#### 3.1 İnceleme Sistemi
- Yorum ekleme
- Yorum listesi
- Puan dağılımı grafiği
- Fotoğraflı yorumlar

#### 3.2 Video Tanıtım
- Video galeri
- Video oynatıcı
- Kapak görseli

#### 3.3 Benzer Rehberler
- Aynı uzmanlık alanı
- Aynı şehir
- Aynı dil
- Fiyat benzerliği

#### 3.4 Sosyal Özellikler
- Favorilere ekleme
- Paylaşım butonları
- WhatsApp ile iletişim

### 4. Teknik İyileştirmeler

#### 4.1 Performans
- Image lazy loading
- Virtual scrolling (uzun listeler için)
- Code splitting
- Cache stratejisi

#### 4.2 SEO
- Meta tag optimizasyonu
- Schema.org markup
- Canonical URL'ler
- Sitemap güncellemesi

#### 4.3 Erişilebilirlik
- ARIA etiketleri
- Klavye navigasyonu
- Ekran okuyucu desteği
- Renk kontrastı

---

## Dosya Yapısı

### Yeni Dosyalar
```
web-app/src/app/guides/
├── components/
│   ├── GuideFilters.tsx          # Gelişmiş filtre paneli
│   ├── GuideSortBar.tsx          # Sıralama çubuğu
│   ├── GuideComparePanel.tsx     # Karşılaştırma paneli
│   ├── GuideMap.tsx              # Harita görünümü
│   ├── GuideReviews.tsx          # Yorumlar bölümü
│   ├── GuideCalendar.tsx         # Müsaitlik takvimi
│   ├── SimilarGuides.tsx         # Benzer rehberler
│   ├── VideoGallery.tsx          # Video galeri
│   └── ShareButtons.tsx          # Paylaşım butonları
├── hooks/
│   ├── useGuideFilters.ts        # Filtre mantığı
│   ├── useGuideSort.ts           # Sıralama mantığı
│   └── useGuideCompare.ts        # Karşılaştırma mantığı
└── [guideId]/
    └── components/
        ├── GuideDetailHeader.tsx # Detay sayfası header
        ├── GuideInfoCards.tsx    # Bilgi kartları
        └── GuideBookingForm.tsx  # Rezervasyon formu

web-app/src/lib/guides/
├── sorting.ts                    # Sıralama fonksiyonları
├── filtering.ts                  # Filtreleme fonksiyonları
├── comparison.ts                 # Karşılaştırma fonksiyonları
└── constants.ts                  # Sabitler
```

### Güncellenecek Dosyalar
- `web-app/src/app/guides/page.tsx`
- `web-app/src/app/guides/[guideId]/_client.tsx`
- `web-app/src/types/guide.ts`
- `web-app/src/lib/firebase/domain.ts`

---

## Veri Modeli Genişletmeleri

### GuideModel'e Eklenecek Alanlar
```typescript
interface GuideModel {
  // Mevcut alanlar...
  
  // Yeni alanlar
  videoUrls?: string[];              // Video tanıtımlar
  totalReviews?: number;             // Toplam yorum sayısı
  averageRating?: number;            // Ortalama puan
  responseRate?: number;             // Mesaj yanıt oranı
  responseTime?: string;             // Ortalama yanıt süresi
  lastActive?: Date;                 // Son aktiflik tarihi
  verifiedAt?: Date;                 // Doğrulama tarihi
  profileViews?: number;             // Profil görüntülenme sayısı
  bookingCount?: number;             // Toplam rezervasyon sayısı
}
```

### Yeni Review Modeli
```typescript
interface GuideReview {
  id: string;
  guideId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;                 // Doğrulanmış rezervasyon
  response?: {
    comment: string;
    createdAt: Date;
  };
}
```

---

## UI/UX Taslakları

### Liste Sayfası Düzeni
```
┌─────────────────────────────────────────────────────────┐
│  Hero Section                                           │
│  - Başlık, açıklama, arama kutusu                        │
└─────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────┐
│          │  Sıralama: [Önerilen ▼]  [Görünüm: ⊞ ⊡]    │
│ Filtreler ├──────────────────────────────────────────────┤
│          │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│ □ Uzmanlık│ │ Kart│ │ Kart│ │ Kart│ │ Kart│           │
│ □ Dil     │ │     │ │     │ │     │ │     │           │
│ □ Şehir   │ │     │ │     │ │     │ │     │           │
│ □ Fiyat   │ └─────┘ └─────┘ └─────┘ └─────┘           │
│ □ Müsait  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│          │  │ Kart│ │ Kart│ │ Kart│ │ Kart│           │
│ [Temizle] │  │     │ │     │ │     │ │     │           │
│          │  └─────┘ └─────┘ └─────┘ └─────┘           │
└──────────┴──────────────────────────────────────────────┘
```

### Detay Sayfası Düzeni
```
┌─────────────────────────────────────────────────────────┐
│  ← Geri                                                 │
├─────────────────────────────────────────────────────────┤
│  Görsel Galeri                                          │
│  [◄] Ana Görsel [►]                                    │
├─────────────────────────────────────────────────────────┤
│  İsim | Rozetler | Puan                                 │
│  Şehir | Diller | Deneyim                              │
├──────────────┬──────────────────────────────────────────┤
│              │  Fiyat Kartı                             │
│ Hakkında     │  ┌──────────────────┐                   │
│              │  │ Günlük: ₺X,XXX   │                   │
│ Biyografi    │  │ [Rezervasyon Yap]│                   │
│              │  └──────────────────┘                   │
│ Sertifikalar │                                          │
│              │  Rezervasyon Formu                       │
│ Hizmet       │  ┌──────────────────┐                   │
│ Bölgeleri    │  │ Tarih Seçimi     │                   │
│              │  │ Gün Sayısı       │                   │
│              │  │ Kişi Sayısı      │                   │
│              │  │ İletişim         │                   │
│              │  └──────────────────┘                   │
├──────────────┴──────────────────────────────────────────┤
│  Yorumlar (X)                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Kullanıcı | ★★★★★ | Tarih                      │   │
│  │ Yorum metni...                                  │   │
│  └──────────────────────────────────────────��──────┘   │
├─────────────────────────────────────────────────────────┤
│  Benzer Rehberler                                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│  │ Kart│ │ Kart│ │ Kart│ │ Kart│                     │
│  └─────┘ └─────┘ └─────┘ └─────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Uygulama Sırası

### Faz 1: Temel İyileştirmeler
1. Liste sayfası UI yenileme
2. Kart tasarımı güncelleme
3. Sıralama özelliği ekleme
4. Filtre paneli iyileştirme

### Faz 2: Yeni Özellikler
1. Karşılaştırma paneli
2. Benzer rehberler
3. Favorilere ekleme
4. Paylaşım butonları

### Faz 3: İçerik Zenginleştirme
1. İnceleme sistemi
2. Video galeri
3. Müsaitlik takvimi UI

### Faz 4: İleri Özellikler
1. Harita entegrasyonu
2. Gerçek zamanlı müsaitlik
3. Admin paneli iyileştirmeleri

---

## Teknik Notlar

### Kullanılacak Teknolojiler
- **Harita**: Leaflet veya Google Maps
- **Video**: React Player
- **Form**: React Hook Form + Zod
- **State**: Zustand (mevcut) + Context API
- **Animation**: Framer Motion (opsiyonel)

### Performans Stratejisi
- React.memo ile bileşen optimizasyonu
- useMemo/useCallback ile hesaplama optimizasyonu
- Image optimization (Next.js Image)
- Virtual scrolling (react-window)

### SEO Stratejisi
- Dinamik meta tags
- Open Graph tags
- JSON-LD schema markup
- Sitemap güncellemesi

---

## Başarı Kriterleri

### KPI'ler
- Sayfa yükleme süresi < 2 saniye
- Mobil kullanılabilirlik skoru > 90
- SEO skoru > 85
- Erişilebilirlik skoru > 80

### Kullanıcı Hedefleri
- Arama süresinde %30 azalma
- Rezervasyon tamamlama oranında %20 artış
- Sayfada kalma süresinde %25 artış
- Tekrarlayan rezervasyonlarda %15 artış
