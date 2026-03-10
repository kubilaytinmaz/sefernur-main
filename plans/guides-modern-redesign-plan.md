# Rehber Kiralama Sistemi - Modern Yeniden Tasarım Planı

## Proje Özeti
Bu plan, mevcut "Rehber Kiralama" (Guides) bölümünün modern, kullanıcı dostu ve görsel olarak etkileyici bir tasarımla yeniden tasarlanmasını kapsamaktadır. Mevcut sistem işlevsel olsa da, modern UI/UX standartlarına, erişilebilirlik ilkelerine ve performans optimizasyonlarına göre iyileştirilecektir.

---

## Mevcut Durum Analizi

### Mevcut Dosya Yapısı
```
web-app/src/app/guides/
├── page.tsx                          # Ana liste sayfası
├── [guideId]/
│   ├── _client.tsx                   # Detay sayfası
│   └── page.tsx                      # Detay sayfası wrapper
└── components/
    ├── GuideCard.tsx                 # Rehber kartı
    ├── GuideFilters.tsx              # Filtre paneli
    └── GuideSortBar.tsx              # Sıralama çubuğu

web-app/src/lib/guides/
├── sorting.ts                        # Sıralama mantığı
├── filtering.ts                      # Filtreleme mantığı
└── constants.ts                      # Sabitler

web-app/src/types/guide.ts            # Veri modeli
```

### Mevcut Güçlü Yönler
- Temiz kod yapısı ve bileşen ayrımı
- React Query ile veri yönetimi
- Responsive tasarım temelleri
- Filtreleme ve sıralama işlevselliği
- Rezervasyon formu

### Tespit Edilen İyileştirme Alanları

#### Görsel Tasarım
- Hero bölümü daha etkileyici hale getirilmeli
- Kart tasarımı modern glassmorphism efektleriyle zenginleştirilmeli
- Renk paleti daha tutarlı hale getirilmeli
- Animasyonlar ve geçişler yumuşatılmalı
- Dark mode desteği eklenmeli

#### Kullanıcı Deneyimi
- Filtre paneli daha kullanıcı dostu hale getirilmeli
- Karşılaştırma özelliği eklenmeli
- Favorilere ekleme özelliği eklenmeli
- Daha iyi boş durum (empty state) tasarımları
- Yükleme durumları iyileştirilmeli

#### Performans
- Görsel optimizasyonu (Next.js Image)
- Lazy loading implementasyonu
- Virtual scrolling (büyük listeler için)
- Code splitting

#### Erişilebilirlik
- ARIA etiketleri eksiklikleri giderilmeli
- Klavye navigasyonu iyileştirilmeli
- Renk kontrastı standartlara uygun hale getirilmeli
- Ekran okuyucu desteği

---

## Yeniden Tasarım Hedefleri

### 1. Görsel Tasarım Sistemi

#### 1.1 Renk Paleti
Modern ve tutarlı bir renk paleti:

```css
/* Ana Renkler */
--primary-50: #f5f3ff;
--primary-100: #ede9fe;
--primary-200: #ddd6fe;
--primary-300: #c4b5fd;
--primary-400: #a78bfa;
--primary-500: #8b5cf6;
--primary-600: #7c3aed;
--primary-700: #6d28d9;
--primary-800: #5b21b6;
--primary-900: #4c1d95;

/* Vurgu Renkleri */
--accent-amber: #f59e0b;
--accent-emerald: #10b981;
--accent-rose: #f43f5e;
--accent-sky: #0ea5e9;

/* Nötr Renkler */
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
```

#### 1.2 Tipografi
```css
/* Font Boyutları */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

#### 1.3 Spacing Sistemi
```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
```

#### 1.4 Border Radius
```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

#### 1.5 Shadow Sistemi
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

/* Colored Shadows */
--shadow-primary: 0 10px 15px -3px rgb(124 58 237 / 0.3);
--shadow-primary-lg: 0 20px 25px -5px rgb(124 58 237 / 0.4);
```

---

### 2. Bileşen Yeniden Tasarımları

#### 2.1 Hero Bölümü Yeniden Tasarımı

Mevcut hero bölümü daha modern ve etkileyici hale getirilecek:

```tsx
// Yeni Hero Özellikleri:
- Daha büyük ve etkileyici başlık
- Animasyonlu arka plan efektleri
- İnteraktif arama deneyimi
- Hızlı filtre presetleri
- İstatistik kartları
- Parallax scroll efekti
```

**Tasarım Detayları:**
- Gradient arka plan: `from-slate-900 via-violet-950 to-slate-900`
- Animasyonlu blob efektleri
- Glassmorphism arama kutusu
- Hover efektli preset butonları
- Animasyonlu sayaçlar

#### 2.2 GuideCard Yeniden Tasarımı

Modern kart tasarımı özellikleri:

```tsx
// Yeni Kart Özellikleri:
- Daha büyük görsel alanı (aspect-ratio: 4/3)
- Glassmorphism badge'ler
- Smooth hover animasyonları
- Gradient overlay
- Mikro-interaksiyonlar
- Favorilere ekleme butonu
- Hızlı karşılaştırma butonu
```

**Grid View Kart Yapısı:**
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │         Görsel Alanı             │ │
│ │  [Badges]              [Rating]  │ │
│ │                                 │ │
│ │  [Hover: Detay Gör Butonu]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│  Rehber Adı                         │
│  📍 Şehir                           │
│                                     │
│  [🌍 Dil] [🏆 Deneyim] [💰 Fiyat]   │
│                                     │
│  [❤️] [⚖️]        [Detay →]        │
└─────────────────────────────────────┘
```

#### 2.3 GuideFilters Yeniden Tasarımı

Daha kullanıcı dostu filtre paneli:

```tsx
// Yeni Filtre Özellikleri:
- Accordion style collapsible sections
- Range slider'lar (fiyat, deneyim)
- Checkbox grupları
- Seçili filtre sayısı gösterimi
- Hızlı preset butonları
- Mobil drawer deneyimi
- Filtre kombinasyonu önerileri
```

**Filtre Kategorileri:**
1. **Hızlı Filtreler** (Presets)
   - Hac için Rehber
   - Umre için Rehber
   - VIP Rehberlik
   - Kültür Turu

2. **Uzmanlık Alanları**
   - Checkbox chips
   - Görsel ikonlar

3. **Diller**
   - Checkbox listesi
   - Bayrak ikonları

4. **Fiyat Aralığı**
   - Dual range slider
   - Önceden tanımlı aralıklar

5. **Deneyim**
   - Range slider
   - Yıl aralıkları

6. **Puan**
   - Star rating selector
   - Minimum puan

7. **Diğer**
   - Sertifikalı only
   - Popüler only
   - Müsaitlik durumu

#### 2.4 GuideSortBar Yeniden Tasarımı

Modern sıralama çubuğu:

```tsx
// Yeni Sıralama Özellikleri:
- Daha kompakt tasarım
- İkonlu sıralama seçenekleri
- Active filter count badge
- View mode toggle (grid/list/map)
- Sticky positioning
```

#### 2.5 Detay Sayfası Yeniden Tasarımı

Zenginleştirilmiş detay sayfası:

```tsx
// Yeni Detay Sayfası Özellikleri:
- Full-width görsel galeri
- Sticky rezervasyon widget'ı
- Rehber hakkında timeline
- Sertifika gösterimi
- Hizmet bölgeleri haritası
- Benzer rehberler önerileri
- Yorumlar bölümü
- Paylaşım butonları
```

**Detay Sayfası Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ← Geri                                                 │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │           Görsel Galeri (Full Width)            │   │
│  │  [◄] Ana Görsel [►]                            │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌───────────────────────────┐ │
│  │ Rehber Bilgileri    │ │ Fiyat Kartı (Sticky)      │ │
│  │                     │ │ ┌─────────────────────┐   │ │
│  │ [Badges]            │ │ │ Günlük: ₺X,XXX      │   │ │
│  │ İsim                │ │ │ [Rezervasyon Yap]   │   │ │
│  │ Şehir | Dil | Puan  │ │ └─────────────────────┘   │ │
│  │                     │ │                           │ │
│  │ Hakkında            │ │ Rezervasyon Formu        │ │
│  │ Biyografi           │ │ ┌─────────────────────┐   │ │
│  │                     │ │ │ Tarih Seçimi        │   │ │
│  │ Sertifikalar        │ │ │ Gün Sayısı          │   │ │
│  │ [Liste]             │ │ │ Kişi Sayısı         │   │ │
│  │                     │ │ │ İletişim            │   │ │
│  │ Hizmet Bölgeleri    │ │ └─────────────────────┘   │ │
│  │ [Kartlar]           │ │                           │ │
│  │                     │ │ İletişim                 │ │
│  │                     │ │ [Telefon] [WhatsApp]     │ │
│  └─────────────────────┘ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  Yorumlar & Değerlendirmeler                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Puan Dağılımı | Ortalama | Toplam Yorum         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Kullanıcı | ★★★★★ | Tarih                      │   │
│  │ Yorum metni...                                  │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Benzer Rehberler                                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│  │ Kart│ │ Kart│ │ Kart│ │ Kart│                     │
│  └─────┘ └─────┘ └─────┘ └─────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Yeni Özellikler

#### 3.1 Favorilere Ekleme
```tsx
// Özellikler:
- Kalp ikonu ile favorilere ekleme
- LocalStorage persistence
- Kullanıcı girişiyle sync
- Favoriler sayfası
- Hızlı erişim
```

#### 3.2 Karşılaştırma Özelliği
```tsx
// Özellikler:
- Maksimum 3 rehber karşılaştırma
- Yan yana kart görünümü
- Özellik tablosu
- Fark vurgulama
- Karşılaştırma paneli (sticky bottom sheet)
```

#### 3.3 Gelişmiş Arama
```tsx
// Özellikler:
- Debounced arama
- Arama önerileri
- Son aramalar
- Popüler aramalar
- Fuzzy search
```

#### 3.4 Yorumlar Sistemi
```tsx
// Özellikler:
- Yorum listesi
- Puan dağılımı grafiği
- Fotoğraflı yorumlar
- Rehber yanıtları
- Yorum ekleme formu
- Yorum moderasyonu
```

#### 3.5 Paylaşım Butonları
```tsx
// Özellikler:
- WhatsApp paylaşım
- Facebook paylaşım
- Twitter paylaşım
- Link kopyalama
- QR kod oluşturma
```

---

### 4. Animasyonlar ve Mikro-İnteraksiyonlar

#### 4.1 Sayfa Geçişleri
```tsx
// Animasyonlar:
- Fade in/out
- Slide up/down
- Scale effects
- Stagger animations
```

#### 4.2 Kart Hover Efektleri
```tsx
// Efektler:
- Yumuşak scale (1.02)
- Shadow artışı
- Border color değişimi
- Gradient overlay fade-in
- Action button appearance
```

#### 4.3 Yükleme Animasyonları
```tsx
// Skeleton Screens:
- Kart skeleton
- Liste skeleton
- Detay skeleton
- Shimmer effect
```

#### 4.4 Mikro-İnteraksiyonlar
```tsx
// Efektler:
- Button ripple effect
- Checkbox animation
- Toggle switch
- Heart animation (favori)
- Star rating animation
```

---

### 5. Responsive Tasarım

#### 5.1 Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

#### 5.2 Mobil Optimizasyonları
```tsx
// Mobil Özellikler:
- Bottom navigation (opsiyonel)
- Swipe gestures
- Pull to refresh
- Infinite scroll
- Mobile-first approach
```

#### 5.3 Tablet Optimizasyonları
```tsx
// Tablet Özellikler:
- 2-column grid
- Side-by-side layout
- Touch-friendly targets
- Adaptive spacing
```

---

### 6. Erişilebilirlik

#### 6.1 ARIA Etiketleri
```tsx
// Gerekli ARIA etiketleri:
- aria-label for icon buttons
- aria-describedby for form fields
- aria-expanded for collapsible
- aria-selected for tabs
- aria-live for dynamic content
```

#### 6.2 Klavye Navigasyonu
```tsx
// Klavye desteği:
- Tab order
- Enter/Space for actions
- Escape for modals
- Arrow keys for lists
- Focus visible states
```

#### 6.3 Renk Kontrastı
```css
/* WCAG AA Standartları:
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1
*/
```

#### 6.4 Ekran Okuyucu
```tsx
// Destek:
- Semantic HTML
- Alt text for images
- Screen reader only text
- Skip links
- Landmark regions
```

---

### 7. Performans Optimizasyonları

#### 7.1 Görsel Optimizasyonu
```tsx
// Next.js Image kullanımı:
- WebP format
- Responsive sizes
- Lazy loading
- Priority loading
- Blur placeholder
```

#### 7.2 Code Splitting
```tsx
// Dynamic imports:
- Route-based splitting
- Component-based splitting
- Vendor splitting
```

#### 7.3 Memoization
```tsx
// React optimizasyonları:
- React.memo for components
- useMemo for calculations
- useCallback for functions
- Virtual scrolling
```

#### 7.4 Cache Stratejisi
```tsx
// React Query cache:
- Stale time
- Cache time
- Refetch on window focus
- Background refetch
```

---

## Dosya Yapısı (Yeni)

```
web-app/src/app/guides/
├── page.tsx                          # Ana liste sayfası
├── [guideId]/
│   ├── _client.tsx                   # Detay sayfası
│   └── page.tsx                      # Detay sayfası wrapper
└── components/
    ├── GuideCard.tsx                 # Rehber kartı
    ├── GuideCard.grid.tsx            # Grid view kart
    ├── GuideCard.list.tsx            # List view kart
    ├── GuideFilters.tsx              # Filtre paneli
    ├── GuideSortBar.tsx              # Sıralama çubuğu
    ├── GuideHero.tsx                 # Hero bölümü
    ├── GuideSearch.tsx               # Arama kutusu
    ├── GuideComparePanel.tsx         # Karşılaştırma paneli (YENİ)
    ├── GuideFavoriteButton.tsx       # Favori butonu (YENİ)
    ├── GuideShareButtons.tsx         # Paylaşım butonları (YENİ)
    ├── GuideReviews.tsx              # Yorumlar bölümü (YENİ)
    ├── SimilarGuides.tsx             # Benzer rehberler (YENİ)
    └── skeletons/
        ├── GuideCardSkeleton.tsx     # Kart skeleton (YENİ)
        ├── GuideListSkeleton.tsx     # Liste skeleton (YENİ)
        └── GuideDetailSkeleton.tsx   # Detay skeleton (YENİ)

web-app/src/app/guides/[guideId]/components/
├── GuideDetailHeader.tsx             # Detay header (YENİ)
├── GuideInfoCards.tsx                # Bilgi kartları (YENİ)
├── GuideBookingForm.tsx              # Rezervasyon formu (YENİ)
├── GuideImageGallery.tsx             # Görsel galeri (YENİ)
└── GuideContactCard.tsx              # İletişim kartı (YENİ)

web-app/src/lib/guides/
├── sorting.ts                        # Sıralama mantığı
├── filtering.ts                      # Filtreleme mantığı
├── comparison.ts                     # Karşılaştırma mantığı (YENİ)
├── favorites.ts                      # Favori mantığı (YENİ)
└── constants.ts                      # Sabitler

web-app/src/hooks/guides/
├── useGuideFilters.ts                # Filtre hook (YENİ)
├── useGuideSort.ts                   # Sıralama hook (YENİ)
├── useGuideCompare.ts                # Karşılaştırma hook (YENİ)
├── useGuideFavorites.ts              # Favori hook (YENİ)
└── useGuideSearch.ts                 # Arama hook (YENİ)

web-app/src/store/
└── guideStore.ts                     # Guide state store (YENİ)

web-app/src/types/guide.ts            # Veri modeli (genişletilecek)
```

---

## Uygulama Sırası

### Faz 1: Temel UI Yenileme
1. [ ] Hero bölümü yeniden tasarımı
2. [ ] GuideCard modernizasyonu
3. [ ] GuideFilters iyileştirmesi
4. [ ] GuideSortBar güncellemesi
5. [ ] Skeleton ekranları ekleme

### Faz 2: Yeni Özellikler
1. [ ] Favorilere ekleme özelliği
2. [ ] Karşılaştırma paneli
3. [ ] Paylaşım butonları
4. [ ] Gelişmiş arama

### Faz 3: Detay Sayfası
1. [ ] Görsel galeri iyileştirmesi
2. [ ] Rezervasyon formu modernizasyonu
3. [ ] Yorumlar bölümü
4. [ ] Benzer rehberler önerisi

### Faz 4: İleri Özellikler
1. [ ] Harita görünümü
2. [ ] Animasyonlar
3. [ ] Dark mode desteği
4. [ ] PWA optimizasyonları

---

## Teknik Notlar

### Kullanılacak Teknolojiler
- **Framework**: Next.js 14 (App Router)
- **State**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion (opsiyonel)
- **Maps**: Leaflet veya Google Maps

### Performans Hedefleri
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Lighthouse Score > 90

### SEO Hedefleri
- Meta tag optimizasyonu
- Open Graph tags
- JSON-LD schema markup
- Canonical URL'ler
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

---

## Taslaklar ve Mockups

### Liste Sayfası Taslağı
```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │           HERO SECTION                          │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  🔍 Arama: Rehber adı, uzmanlık...      │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │  [Hac] [Umre] [VIP] [Kültür]                   │   │
│  │  📊 150+ Rehber | 8+ Dil | 4.8★               │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────────────────────────────────────┐
│  │          │ 🔽 [Önerilen] 🔲 ☰ [150 sonuç]         │
│  │ Filtreler ├──────────────────────────────────────────┤
│  │          │ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ ☑ Uzmanlık│ │ Kart 1 │ │ Kart 2 │ │ Kart 3 │        │
│  │ ☑ Dil     │ │        │ │        │ │        │        │
│  │ ☑ Şehir   │ │ [❤️]  │ │ [❤️]  │ │ [❤️]  │        │
│  │ ☑ Fiyat   │ │        │ │        │ │        │        │
│  │ ☑ Puan    │ └────────┘ └────────┘ └────────┘        │
│  │          │ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ [Temizle] │ │ Kart 4 │ │ Kart 5 │ │ Kart 6 │        │
│  │          │ │        │ │        │ │        │        │
│  │          │ │ [❤️]  │ │ [❤️]  │ │ [❤️]  │        │
│  │          │ │        │ │        │ │        │        │
│  │          │ └────────┘ └────────┘ └────────┘        │
│  └──────────┴──────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

### Detay Sayfası Taslağı
```
┌─────────────────────────────────────────────────────────┐
│  ← Rehberler                                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │           GÖRSEL GALERİ                         │   │
│  │  [◄] Ana Görsel [►]                            │   │
│  │  • • • •                                        │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌───────────────────────────┐ │
│  │ ⭐ Popüler           │ │ 💰 Günlük Ücret          │ │
│  │ [Hac] [Umre]        │ │ ₺1,500 / $50            │ │
│  │                     │ │ [Rezervasyon Yap]        │ │
│  │ Ahmed Abdullah      │ │                           │ │
│  │ 📍 Mekke            │ │ ┌─────────────────────┐   │ │
│  │ 🌍 TR, AR, EN       │ │ │ 📅 Tarih Seçimi     │   │ │
│  │ 🏆 10+ Yıl          │ │ │ 👥 Kişi Sayısı      │   │ │
│  │ ⭐ 4.9 (128)        │ │ │ 📞 İletişim        │   │ │
│  │                     │ │ └─────────────────────┘   │ │
│  │ 👤 Hakkında          │ │                           │ │
│  │ Biyografi metni...  │ │ 📱 +966 50 123 4567      │ │
│  │                     │ │ 💬 WhatsApp              │ │
│  │ 🏆 Sertifikalar      │ │ ✉️ email@example.com     │ │
│  │ ✓ Hac Rehberi       │ │                           │ │
│  │ ✓ Umre Rehberi      │ │ [❤️] [⚖️] [📤]           │ │
│  │                     │ │                           │ │
│  │ 🌍 Hizmet Bölgeleri  │ │                           │ │
│  │ 📍 Mekke, Medine    │ │                           │ │
│  └─────────────────────┘ └───────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  💬 Yorumlar & Değerlendirmeler (128)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⭐ 4.9 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ │   │
│  │ ██████████ 85% | ████ 12% | ██ 2% | █ 1% | 0%   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 Mehmet Y. | ⭐⭐⭐⭐��� | 2 gün önce            │   │
│  │ Mükemmel bir rehber, Hac sırasında çok yardımcı │   │
│  │ oldu. Kesinlikle tavsiye ederim!                │   │
│  │ ┌───┐ ┌───┐ ┌───┐                              │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  👥 Benzer Rehberler                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ Kart 1 │ │ Kart 2 │ │ Kart 3 │ │ Kart 4 │         │
│  └────────┘ └────────┘ └────────┘ └────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

## Sonraki Adımlar

Bu plan onaylandıktan sonra:
1. Code moduna geçiş yapılacak
2. Faz 1 ile başlanacak (Temel UI Yenileme)
3. Her faz tamamlandıktan sonra test edilecek
4. Kullanıcı geri bildirimleri alınacak
5. İteratif iyileştirmeler yapılacak
