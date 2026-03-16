# Otel Hızlı Arama Bağlantıları - SEO Uyumlu Tasarım Planı

## Proje Özeti
`/oteller` sayfasının alt kısmına SEO uyumlu, kullanıcı dostu otel kategori hızlı arama bağlantıları bölümü eklenecek. Kullanıcılar "Mekke yakın otel", "ekonomik otel" gibi kategorilere tıklayarak otel arama formunu otomatik doldurabilecek.

---

## 1. Otel Kategorileri ve SEO Anahtar Kelimeleri

### 1.1 Kategori Yapısı

```typescript
interface HotelQuickLinkCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // SVG path veya emoji
  searchParams: Partial<HotelSearchFormParams>;
  seoKeywords: string[];
  color: string; // Gradient renk
  priority: number; // Sıralama için
}
```

### 1.2 Kategori Listesi

| ID | Başlık | Açıklama | Arama Parametreleri | SEO Anahtar Kelimeler | Renk |
|----|--------|----------|---------------------|---------------------|------|
| `mekke-yakin` | Mekke Yakın Oteller | Harem-i Şerif'e yürüme mesafesinde | `cityCode: 164` | mekke otel, harem yakın, kabe yakın | from-emerald-500 to-teal-500 |
| `medine-yakin` | Medine Yakın Oteller | Mescid-i Nebevi yakını | `cityCode: 174` | medine otel, ravza yakın, nebevi yakını | from-blue-500 to-indigo-500 |
| `ekonomik` | Ekonomik Oteller | Bütçe dostu konaklama | `cityCode: 164` | ucuz otel, ekonomik konaklama, uygun fiyatlı | from-green-500 to-emerald-500 |
| `luks` | Lüks Oteller | 5 yıldızlı premium oteller | `cityCode: 164, stars: [5]` | lüks otel, 5 yıldızlı, premium konaklama | from-amber-500 to-orange-500 |
| `aile-odasi` | Aile Odaları | Geniş aile odaları | `rooms: [{adults: 4, children: 0}]` | aile odası, geniş oda, family room | from-purple-500 to-violet-500 |
| `cocuk-uyumlu` | Çocuk Uyumlu Oteller | Çocuklar için uygun | `rooms: [{adults: 2, children: 2, childAges: [5,8]}]` | çocuklu aile, child friendly | from-pink-500 to-rose-500 |
| `harem-manzarali` | Harem Manzaralı | Kabe manzaralı odalar | `cityCode: 164` | harem manzara, kabe view, manzaralı oda | from-sky-500 to-cyan-500 |
| `uzun-sureli` | Uzun Süreli Konaklama | 7+ gün konaklama | `cityCode: 164` | uzun dönem, aylık otel, long stay | from-indigo-500 to-purple-500 |

---

## 2. Bileşen Tasarımı

### 2.1 HotelQuickLinksSection Bileşeni

**Dosya:** `web-app/src/components/hotels/HotelQuickLinksSection.tsx`

#### Özellikler:
- Responsive grid layout (mobil: 2 sütun, tablet: 3 sütun, desktop: 4 sütun)
- Her kategori kartı: ikon, başlık, açıklama, tıklanabilir alan
- Hover efektleri: scale, shadow, gradient animasyon
- SEO-friendly: semantic HTML, aria-labels
- Loading state: skeleton loading
- Error state: fallback UI

#### Görsel Tasarım:
```tsx
// Kart yapısı
<div className="group relative bg-white rounded-2xl border-2 border-slate-200 
            hover:border-emerald-400 hover:shadow-xl transition-all duration-300 
            hover:scale-[1.02] cursor-pointer overflow-hidden">
  
  {/* Gradient overlay on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
  {/* Icon container */}
  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 
                  group-hover:from-emerald-500 group-hover:to-teal-500 
                  flex items-center justify-center transition-all duration-300">
    <Icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
  </div>
  
  {/* Content */}
  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700">Başlık</h3>
  <p className="text-sm text-slate-600">Açıklama</p>
  
  {/* SEO keywords (hidden but accessible) */}
  <div className="sr-only">
    {seoKeywords.join(', ')}
  </div>
</div>
```

### 2.2 Kategori Veri Dosyası

**Dosya:** `web-app/src/lib/data/hotel-quick-links.ts`

```typescript
export const HOTEL_QUICK_LINKS: HotelQuickLinkCategory[] = [
  {
    id: 'mekke-yakin',
    title: 'Mekke Yakın Oteller',
    description: 'Harem-i Şerif\'e yürüme mesafesinde',
    icon: 'kaaba',
    searchParams: { cityCode: 164 },
    seoKeywords: ['mekke otel', 'harem yakın otel', 'kabe yakını konaklama'],
    color: 'from-emerald-500 to-teal-500',
    priority: 1
  },
  // ... diğer kategoriler
];
```

---

## 3. Sayfa Entegrasyonu

### 3.1 Oteller Sayfası Güncellemesi

**Dosya:** `web-app/src/app/oteller/_client.tsx`

```tsx
import { HotelQuickLinksSection } from "@/components/hotels/HotelQuickLinksSection";

// Info Section'dan SONRA, sayfa sonuna ekle
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <HotelQuickLinksSection onQuickSearch={handleQuickSearch} />
</section>
```

### 3.2 Arama Parametrelerini İşleme

```typescript
const handleQuickSearch = useCallback((params: HotelSearchFormParams) => {
  // Varsayılan tarihleri ekle
  const searchParams: HotelSearchFormParams = {
    ...params,
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    rooms: params.rooms || [{ adults: 2, children: 0, childAges: [] }]
  };
  
  // Arama formunu güncelle ve sonuçlar sayfasına yönlendir
  handleSearch(searchParams);
}, [handleSearch]);
```

---

## 4. SEO Optimizasyonu

### 4.1 Metadata Güncellemesi

**Dosya:** `web-app/src/app/oteller/page.tsx`

```typescript
export const metadata = {
  title: 'Umre Otelleri - Mekke ve Medine Otel Rezervasyonu | Sefernur',
  description: 'Mekke ve Medine\'de Harem\'e yakın oteller. Ekonomik, lüks, aile odaları ve daha fazlası. En uygun fiyatlarla umre otel rezervasyonu.',
  keywords: [
    'umre oteli', 'mekke otel', 'medine otel', 'harem yakın otel',
    'ekonomik umre oteli', 'lüks umre oteli', 'aile odası umre',
    'kabe yakını otel', 'ravza yakını otel'
  ],
  openGraph: {
    title: 'Umre Otelleri - Mekke ve Medine Otel Rezervasyonu',
    description: 'Mekke ve Medine\'de en uygun otelleri keşfedin',
    images: ['/og-oteller.jpg']
  }
};
```

### 4.2 Schema.org Yapılandırması

**Dosya:** `web-app/src/lib/seo/schema-generator.ts` (yeni fonksiyon)

```typescript
export function createHotelQuickLinksSchema(categories: HotelQuickLinkCategory[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Umre Otel Kategorileri',
    description: 'Mekke ve Medine otel arama kategorileri',
    itemListElement: categories.map((cat, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: cat.title,
        description: cat.description,
        keywords: cat.seoKeywords.join(', ')
      }
    }))
  };
}
```

---

## 5. Tasarım Detayları

### 5.1 Renk Paleti

| Kategori | Gradient | Hover Gradient |
|----------|----------|---------------|
| Mekke Yakın | from-emerald-100 to-teal-100 | from-emerald-500 to-teal-500 |
| Medine Yakın | from-blue-100 to-indigo-100 | from-blue-500 to-indigo-500 |
| Ekonomik | from-green-100 to-emerald-100 | from-green-500 to-emerald-500 |
| Lüks | from-amber-100 to-orange-100 | from-amber-500 to-orange-500 |
| Aile Odası | from-purple-100 to-violet-100 | from-purple-500 to-violet-500 |
| Çocuk Uyumlu | from-pink-100 to-rose-100 | from-pink-500 to-rose-500 |
| Harem Manzaralı | from-sky-100 to-cyan-100 | from-sky-500 to-cyan-500 |
| Uzun Süreli | from-indigo-100 to-purple-100 | from-indigo-500 to-purple-500 |

### 5.2 İkonlar

SVG ikonlar kullanılacak (emoji değil):
- Kaabe ikonu (Mekke için)
- Cami ikonu (Medine için)
- Cüzdan/Para ikonu (Ekonomik için)
- Yıldız ikonu (Lüks için)
- Kullanıcı grubu (Aile için)
- Bebek/Çocuk ikonu (Çocuk için)
- Göz/Manzara ikonu (Manzaralı için)
- Takvim ikonu (Uzun süreli için)

### 5.3 Animasyonlar

```css
/* Hover animasyonları */
@keyframes card-hover {
  0% { transform: scale(1); }
  100% { transform: scale(1.02); }
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.quick-link-card {
  animation: card-hover 0.3s ease-out;
}

.quick-link-card:hover .icon-container {
  animation: icon-pulse 0.6s ease-in-out infinite;
}
```

---

## 6. Responsive Tasarım

```tsx
// Grid yapısı
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  {/* Kartlar */}
</div>

// Mobil optimizasyon
<div className="px-4 sm:px-6 lg:px-8">
  {/* İçerik */}
</div>
```

### Breakpoints:
- Mobile (< 640px): 2 sütun
- Tablet (640px - 1024px): 3 sütun
- Desktop (> 1024px): 4 sütun

---

## 7. Erişilebilirlik

### 7.1 ARIA Etiketleri

```tsx
<button
  aria-label="Mekke yakın otelleri ara"
  aria-describedby="mekke-yakin-desc"
>
  {/* İçerik */}
</button>
<span id="mekke-yakin-desc" className="sr-only">
  Harem-i Şerif'e yürüme mesafesinde otelleri göster
</span>
```

### 7.2 Klavye Navigasyonu

- Tab tuşu ile kartlar arasında gezinme
- Enter/Space ile seçim
- Focus ring görünürlüğü

### 7.3 Ekran Okuyucu Desteği

```tsx
<div role="list" aria-label="Otel kategorileri">
  {categories.map(cat => (
    <div role="listitem" key={cat.id}>
      {/* Kart içeriği */}
    </div>
  ))}
</div>
```

---

## 8. Performans Optimizasyonu

### 8.1 Lazy Loading

```tsx
import dynamic from 'next/dynamic';

const HotelQuickLinksSection = dynamic(
  () => import('@/components/hotels/HotelQuickLinksSection'),
  { 
    loading: () => <QuickLinksSkeleton />,
    ssr: true // SEO için SSR açık
  }
);
```

### 8.2 İkon Optimizasyonu

- SVG ikonlar inline olarak kullanılacak
- Icon set: Lucide React (mevcut proje kullanıyor)
- Boyut: 24x24 viewBox

---

## 9. Test Senaryoları

### 9.1 Fonksiyonel Testler
- [ ] Kategoriye tıklandığında doğru arama parametreleri gönderiliyor
- [ ] Tüm kategoriler çalışıyor
- [ ] Mobilde tıklama alanları yeterli büyüklükte (44x44px min)
- [ ] Form validasyonu çalışıyor

### 9.2 SEO Testleri
- [ ] Meta keywords doğru
- [ ] Schema.org markup geçerli
- [ ] Semantic HTML kullanımı
- [ ] Alt text'ler mevcut

### 9.3 Responsive Testler
- [ ] 375px (iPhone SE)
- [ ] 768px (iPad)
- [ ] 1024px (Desktop)
- [ ] 1440px (Large Desktop)

---

## 10. Dosya Yapısı

```
web-app/src/
├── components/
│   └── hotels/
│       ├── HotelQuickLinksSection.tsx (YENİ)
│       └── index.ts (export ekle)
├── lib/
│   └── data/
│       └── hotel-quick-links.ts (YENİ)
├── app/
│   └── oteller/
│       ├── page.tsx (metadata güncelle)
│       └── _client.tsx (bileşen ekle)
└── lib/
    └── seo/
        └── schema-generator.ts (yeni fonksiyon)
```

---

## 11. Implementasyon Sırası

1. **Veri Yapısı**: `hotel-quick-links.ts` dosyasını oluştur
2. **Bileşen**: `HotelQuickLinksSection.tsx` bileşenini kodla
3. **Entegrasyon**: `_client.tsx`'e bileşeni ekle
4. **SEO**: Metadata ve schema.org ekle
5. **Test**: Tüm senaryoları test et
6. **Deploy**: Production'a gönder

---

## 12. Gelecek Geliştirmeler

- [ ] Kullanıcı davranışına göre kategori sıralaması
- [ ] Popüler arama terimlerini öne çıkarma
- [ ] Kişiselleştirilmiş öneriler
- [ ] Filtre kombinasyonları (örn: "Mekke + Ekonomik")
- [ ] Analytics entegrasyonu (tıklama takibi)
