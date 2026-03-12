# UmreDunyasi Entegrasyonu - SEO Analizi

## 🔴 Potansiyel SEO Riskleri

### 1. Duplicate Content (Kopya İçerik) Riski

**Risk:** Google, aynı içeriğin farklı domain'lerde görünmesini "duplicate content" olarak algılayabilir.

**Senaryo:**
- UmreDunyasi'da tur detay sayfası var
- Sefernur'da aynı tur için önizleme kartı gösteriliyor
- Google her iki sayfayı da indexleyebilir

**Çözüm:**
```html
<!-- Sefernur'da önizleme kartı için -->
<link rel="canonical" href="https://umredunyasi.com/tours/{slug}" />
```

### 2. External Link Juice (Link Değeri) Kaybı

**Risk:** Kullanıcıları detay için UmreDunyasi'ye yönlendirmek, Sefernur'un "page authority" sini UmreDunyasi'ye transfer eder.

**Etki:**
- Sefernur: Link değerini kaybeder
- UmreDunyasi: Link değerini kazanır

**Çözüm:**
```html
<!-- Nofollow ekleyerek link değerini koru -->
<a href="https://umredunyasi.com/tours/{slug}" 
   rel="nofollow noopener noreferrer">
  Detayları Gör
</a>
```

### 3. Thin Content (İnce İçerik) Riski

**Risk:** Sefernur'un turlar sayfası sadece "önizleme kartları" içeriyorsa, Google bunu "thin content" olarak algılayabilir.

**Çözüm:**
- Her tur için en az 150 kelime özgün açıklama
- Sefernur'a özel değer katma (karşılaştırma, yorum, vs.)

## 🟢 SEO Faydaları

### 1. Fresh Content (Taze İçerik) Sinyali

**Fayda:** Günlük güncellenen tur listeleri, Google'a "bu site aktif" sinyali verir.

**Etki:**
- Crawl frequency artar
- Indexing hızlanır

### 2. User Engagement Sinyalleri

**Fayda:** Kullanıcıların sayfada kalma süresi artarsa, SEO'ya pozitif etki eder.

**Metrikler:**
- Dwell time (sayfada kalma süresi)
- Bounce rate (hemen çıkma oranı)
- Page depth (ziyaret edilen sayfa sayısı)

### 3. Internal Linking Opportunities

**Fayda:** Tur kategorileri, blog yazıları ve diğer sayfalara internal link vererek site yapısını güçlendirin.

## 📋 SEO İyileştirme Stratejileri

### Strateji 1: Canonical URL Kullanımı

```typescript
// web-app/src/components/tours/UpcomingUmrahTours.tsx
export function UpcomingTourCard({ tour }: { tour: any }) {
  return (
    <>
      {/* Canonical link - duplicate content önleme */}
      <link 
        rel="canonical" 
        href={`https://umredunyasi.com/tours/${tour.slug}`} 
      />
      
      <Link 
        href={`https://umredunyasi.com/tours/${tour.slug}`}
        rel="nofollow noopener noreferrer"
      >
        {/* ... */}
      </Link>
    </>
  );
}
```

### Strateji 2: Meta Tags Optimizasyonu

```typescript
// web-app/src/app/tours/page.tsx
export const metadata = {
  title: 'Umre Turları | Sefernur - Yaklaşan Turlar',
  description: 'Sefernur ile UmreDunyasi güvencesinde yaklaşan umre turlarını keşfedin. En uygun fiyatlı umre paketleri, konforlu oteller ve profesyonel rehberlik hizmeti.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
  openGraph: {
    title: 'Umre Turları | Sefernur',
    description: 'Yaklaşan umre turlarını inceleyin',
    url: 'https://sefernur.com/turlar',
    siteName: 'Sefernur',
    locale: 'tr_TR',
    type: 'website',
  },
};
```

### Strateji 3: Schema Markup (JSON-LD)

```typescript
// web-app/src/components/tours/UpcomingUmrahTours.tsx
import Script from 'next/script';

export function UpcomingUmrahTours({ tours }: { tours: any[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Yaklaşan Umre Turları',
    description: 'UmreDunyasi güvencesiyle yaklaşan umre turları',
    itemListElement: tours.map((tour, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Trip',
        name: tour.title,
        description: tour.description,
        offers: {
          '@type': 'Offer',
          price: tour.price,
          priceCurrency: tour.priceCurrency,
          availability: 'https://schema.org/InStock',
        },
        provider: {
          '@type': 'Organization',
          name: tour.firm.name,
          url: `https://umredunyasi.com/firms/${tour.firm.slug}`,
        },
      },
    })),
  };

  return (
    <>
      <Script
        id="umrah-tours-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* ... */}
    </>
  );
}
```

### Strateji 4: Özgün İçerik Ekleme

```typescript
// Her tur kartına Sefernur'a özel değer katın
export function UpcomingTourCard({ tour }: { tour: any }) {
  const sefernurNote = getSefernurNote(tour);
  
  return (
    <Card>
      {/* ... */}
      {sefernurNote && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-800">
            <strong>Sefernur Notu:</strong> {sefernurNote}
          </p>
        </div>
      )}
    </Card>
  );
}

function getSefernurNote(tour: any): string | null {
  // Tur özelliklerine göre Sefernur'a özel notlar
  if (tour.duration >= 21) {
    return "21+ günlük uzun turlarda daha fazla ibadat vakti. Vize işlemleri için erken başvurun.";
  }
  if (tour.hotelStars >= 5) {
    return "Lüks otellerde konforlu konaklama. Harem manzaralı odalar için erken rezervasyon önerilir.";
  }
  if (tour.makkahNights && tour.makkahNights <= 3) {
    return "Kısa Mekke konaklaması. Tavaf için ekstra zaman ayırın.";
  }
  return null;
}
```

### Strateji 5: Sitemap Güncelleme

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://sefernur.com/turlar</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Strateji 6: Robots.txt

```
# public/robots.txt
User-agent: *
Allow: /turlar

# UmreDunyasi turları için özel directive
Allow: /api/umredunyasi/tours

Sitemap: https://sefernur.com/sitemap.xml
```

## 🎯 Final SEO Kararları

### Yapılacaklar (SEO-Friendly)

| Eylem | SEO Etkisi | Öncelik |
|-------|-----------|---------|
| `rel="nofollow"` ekleyin | Link değerini korur | 🔴 Yüksek |
| Canonical URL belirtin | Duplicate content önler | 🔴 Yüksek |
| Schema markup ekleyin | Rich snippets şansı | 🟡 Orta |
| Özgün içerik ekleyin | Thin content riskini azaltır | 🟡 Orta |
| Meta tags optimize edin | CTR artırır | 🟡 Orta |

### Yapılmayacaklar (SEO Riskli)

| Eylem | Neden |
|-------|-------|
| Tam tur içeriğini kopyalamak | Duplicate content |
| `rel="dofollow"` link vermek | Link juice kaybı |
| UmreDunyasi URL'lerini indexlemek | Kanibalizasyon riski |

## 📊 SEO Impact Skoru

| Faktör | Skor | Açıklama |
|--------|------|----------|
| Content Quality | 7/10 | Özgün içerik ile yükseltilebilir |
| Technical SEO | 9/10 | Canonical ve schema ile güçlü |
| User Experience | 8/10 | External link net |
| Authority | 6/10 | Nofollow ile korunabilir |
| Overall | **7.5/10** | **SEO dostu implementasyon** |

## 💡 Ek SEO İpuçları

1. **Blog Entegrasyonu:** Her tur için ilgili blog yazılarına link verin
2. **FAQ Schema:** Tur hakkında sık sorulan soruları ekleyin
3. **Breadcrumb:** Schema.org breadcrumb markup kullanın
4. **Image Alt:** Tüm görsellere açıklayıcı alt text ekleyin
5. **Page Speed:** Lazy loading ve image optimization kullanın

## 🔍 Google Search Console Kontrolü

Implementasyondan sonra GSC'de şunları kontrol edin:

- Coverage report (indexlenen sayfalar)
- Duplicate content warnings
- Mobile usability
- Core Web Vitals
- Manual actions (penalties)
