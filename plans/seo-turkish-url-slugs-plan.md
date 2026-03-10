# SEO Uyumlu Türkçe URL Slug Sistemi - Kapsamlı Plan

## 📊 Mevcut Durum Analizi

### Tespit Edilen Sorunlar

1. **URL Yapısı Sorunları**
   - Oteller: `/hotels/[hotelId]` - Sadece ID kullanılıyor, SEO dostu değil
   - Rehberler: `/guides/[guideId]` - Sadece ID kullanılıyor
   - Yerler: `/places/[placeId]` - Sadece ID kullanılıyor
   - Turlar: `/tours/[tourId]` - Sadece ID kullanılıyor
   - Transferler: `/transfers/[transferId]` - Sadece ID kullanılıyor
   - Blog: `/blog/[id]` - Sadece ID kullanılıyor
   - Vize: `/visa/[application.id]` - Sadece ID kullanılıyor
   - Transfer Rezervasyon: `/transfer-rezervasyon/[slug]/[tourSlug]` - Kısmen Türkçe slug kullanılıyor

2. **Mevcut SEO Slug Sistemi**
   - `web-app/src/lib/transfers/seo-slugs.ts` dosyasında kısmi bir sistem mevcut
   - Sadece transfer ve turlar için kullanılıyor
   - Türkçe karakter dönüşümü var ama tüm sayfalara uygulanmıyor

3. **Meta Tag Durumu**
   - Ana sayfa ve bazı sayfalarda metadata var
   - Dinamik sayfalar için generateMetadata kullanımı sınırlı
   - Schema.org yapılandırması yok

4. **Sitemap ve Robots.txt**
   - Proje içinde sitemap.ts veya robots.txt dosyası bulunamadı

---

## 🎯 Hedefler

1. Tüm sayfa türleri için SEO uyumlu Türkçe URL slug sistemi
2. Dinamik meta tag ve schema.org yapılandırması
3. Sitemap ve robots.txt oluşturma
4. Canonical URL yönetimi
5. Eski URL'lerden yeni URL'lere redirect stratejisi

---

## 🏗️ Önerilen URL Yapısı

### 1. Oteller (Hotels)
```
Mevcut: /hotels/[hotelId]
Önerilen: /oteller/[sehir-slug]/[otel-slug]-[hotelId]

Örnekler:
- /oteller/mekke/clock-hotel-taif-kapisi-abc123
- /oteller/mekke/haram-view-hotel-def456
- /oteller/medine/prophet-mosque-hotel-ghi789
```

### 2. Rehberler (Guides)
```
Mevcut: /guides/[guideId]
Önerilen: /rehberler/[rehber-slug]-[guideId]

Örnekler:
- /rehberler/ahmet-yilmaz-umre-rehberi-abc123
- /rehberler/fatma-demir-profesyonel-rehber-def456
```

### 3. Yerler (Places)
```
Mevcut: /places/[placeId]
Önerilen: /gezilecek-yerler/[sehir-slug]/[yer-slug]-[placeId]

Örnekler:
- /gezilecek-yerler/mekke/kabe-mescid-i-haram-abc123
- /gezilecek-yerler/mekke/safa-merve-def456
- /gezilecek-yerler/medine/mescid-i-nebevi-ghi789
```

### 4. Turlar (Tours)
```
Mevcut: /tours/[tourId]
Önerilen: /turlar/[tur-slug]-[tourId]

Örnekler:
- /turlar/umre-turu-luks-21-gun-abc123
- /turlar/hac-turu-ekonomik-25-gun-def456
```

### 5. Transferler (Transfers)
```
Mevcut: /transfers/[transferId]
Önerilen: /transferler/[transfer-slug]-[transferId]

Örnekler:
- /transferler/mekke-havalimani-otel-vip-transfer-abc123
- /transferler/medine-mekke-ozel-transfer-def456
```

### 6. Blog Yazıları
```
Mevcut: /blog/[id]
Önerilen: /blog/[kategori-slug]/[yazi-slug]-[id]

Örnekler:
- /blog/umre-rehberi/umre-turlarinda-nelere-dikkat-edilmeli-abc123
- /blog/hac-bilgileri/hac-vazifeleri-nelerdir-def456
```

### 7. Vize Başvuruları
```
Mevcut: /visa/[application.id]
Önerilen: /vize-basvuru/[basvuru-slug]-[application.id]

Örnekler:
- /vize-basvuru-suudi-arabistan-vize-basvurusu-abc123
```

### 8. Kampanyalar
```
Mevcut: /campaigns
Önerilen: /kampanyalar/[kampanya-slug]-[id]

Örnekler:
- /kampanyalar/erken-rezervasyon-indirimi-abc123
- /kampanyalar-grup-indirimi-def456
```

### 9. Statik Sayfalar (Türkçe URL'ler)
```
Mevcut: /about, /contact, /faq, /privacy, /terms
Önerilen:
- /hakkimizda
- /iletisim
- /sikca-sorulanlar-sorular
- /gizlilik-politikasi
- /kullanim-kosullari
- /kvkk-aydinlatma-metni
- /cerez-politikasi
- /iptal-iade-politikasi
```

---

## 📁 Merkezi SEO Kütüphanesi

### Dosya Yapısı
```
web-app/src/lib/seo/
├── index.ts                    # Ana export
├── slug-generator.ts          # Slug oluşturma fonksiyonları
├── url-builder.ts             # URL oluşturma fonksiyonları
├── metadata-generator.ts      # Meta tag oluşturma
├── schema-generator.ts        # Schema.org JSON-LD
├── constants.ts               # SEO sabitleri
└── types.ts                   # TypeScript tipleri
```

### Slug Generator (slug-generator.ts)
```typescript
/**
 * Türkçe karakterleri İngilizce karşılıklarına dönüştür
 * SEO uyumlu slug oluştur
 */

// Türkçe karakter haritası
const TURKISH_CHARS: Record<string, string> = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
};

// Stop words (gereksiz kelimeler)
const STOP_WORDS = new Set([
  've', 'veya', 'ile', 'için', 'üzerinde', 'altinda',
  'the', 'and', 'or', 'for', 'with', 'on'
]);

export function createSlug(text: string, options?: {
  maxLength?: number;
  removeStopWords?: boolean;
  lowercase?: boolean;
}): string {
  // Türkçe karakter dönüşümü
  let slug = text.split('').map(char => TURKISH_CHARS[char] || char).join('');
  
  // Küçük harfe çevir
  slug = slug.toLowerCase();
  
  // Stop words kaldır
  if (options?.removeStopWords) {
    slug = slug.split('-').filter(word => !STOP_WORDS.has(word)).join('-');
  }
  
  // Özel karakterleri kaldır
  slug = slug.replace(/[^\w\s-]/g, '');
  
  // Boşlukları tireye çevir
  slug = slug.replace(/[\s_]+/g, '-');
  
  // Baştaki ve sondaki tireleri kaldır
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Maksimum uzunluk
  if (options?.maxLength && slug.length > options.maxLength) {
    slug = slug.substring(0, options.maxLength).replace(/-[^-]*$/, '');
  }
  
  return slug;
}

// ID'yi slug'a güvenli şekilde ekle
export function createSlugWithId(text: string, id: string, options?: {
  maxLength?: number;
  removeStopWords?: boolean;
}): string {
  const slug = createSlug(text, options);
  return `${slug}-${id}`;
}

// Slug'dan ID çıkar
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
}
```

### URL Builder (url-builder.ts)
```typescript
import { createSlug, createSlugWithId } from './slug-generator';

// Oteller için URL
export function createHotelUrl(params: {
  hotelName: string;
  hotelId: string;
  cityName?: string;
}): string {
  const hotelSlug = createSlugWithId(params.hotelName, params.hotelId);
  
  if (params.cityName) {
    const citySlug = createSlug(params.cityName);
    return `/oteller/${citySlug}/${hotelSlug}`;
  }
  
  return `/oteller/${hotelSlug}`;
}

// Rehberler için URL
export function createGuideUrl(params: {
  guideName: string;
  guideId: string;
}): string {
  const slug = createSlugWithId(params.guideName, params.guideId);
  return `/rehberler/${slug}`;
}

// Yerler için URL
export function createPlaceUrl(params: {
  placeName: string;
  placeId: string;
  cityName?: string;
}): string {
  const placeSlug = createSlugWithId(params.placeName, params.placeId);
  
  if (params.cityName) {
    const citySlug = createSlug(params.cityName);
    return `/gezilecek-yerler/${citySlug}/${placeSlug}`;
  }
  
  return `/gezilecek-yerler/${placeSlug}`;
}

// Turlar için URL
export function createTourUrl(params: {
  tourName: string;
  tourId: string;
}): string {
  const slug = createSlugWithId(params.tourName, params.tourId);
  return `/turlar/${slug}`;
}

// Transferler için URL
export function createTransferUrl(params: {
  transferName: string;
  transferId: string;
}): string {
  const slug = createSlugWithId(params.transferName, params.transferId);
  return `/transferler/${slug}`;
}

// Blog için URL
export function createBlogUrl(params: {
  title: string;
  id: string;
  category?: string;
}): string {
  const postSlug = createSlugWithId(params.title, params.id);
  
  if (params.category) {
    const categorySlug = createSlug(params.category);
    return `/blog/${categorySlug}/${postSlug}`;
  }
  
  return `/blog/${postSlug}`;
}

// Vize için URL
export function createVisaUrl(params: {
  applicantName?: string;
  applicationId: string;
}): string {
  const baseSlug = params.applicantName 
    ? createSlug(params.applicantName)
    : 'basvuru';
  return `/vize-basvuru/${baseSlug}-${params.applicationId}`;
}

// Kampanyalar için URL
export function createCampaignUrl(params: {
  campaignName: string;
  campaignId: string;
}): string {
  const slug = createSlugWithId(params.campaignName, params.campaignId);
  return `/kampanyalar/${slug}`;
}
```

### Metadata Generator (metadata-generator.ts)
```typescript
import type { Metadata } from 'next';

// Site bilgileri
const SITE_INFO = {
  name: 'Sefernur',
  title: 'Sefernur - Umre ve Hac Seyahat Platformu',
  description: 'Umre ve Hac seyahatleriniz için otel, tur, transfer, rehber ve araç kiralama hizmetleri. Mekke ve Medine\'de konforlu seyahat deneyimi.',
  url: 'https://sefernur.com',
  ogImage: '/og-image.jpg',
};

// Ana sayfa metadata
export function getHomeMetadata(): Metadata {
  return {
    title: SITE_INFO.title,
    description: SITE_INFO.description,
    keywords: ['umre', 'hac', 'otel', 'tur', 'transfer', 'mekke', 'medine', 'seyahat'],
    openGraph: {
      title: SITE_INFO.title,
      description: SITE_INFO.description,
      url: SITE_INFO.url,
      siteName: SITE_INFO.name,
      type: 'website',
      images: [{ url: SITE_INFO.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_INFO.title,
      description: SITE_INFO.description,
      images: [SITE_INFO.ogImage],
    },
    alternates: {
      canonical: SITE_INFO.url,
    },
  };
}

// Otel sayfası metadata
export function getHotelMetadata(params: {
  hotelName: string;
  cityName: string;
  stars?: number;
  description?: string;
}): Metadata {
  const title = `${params.hotelName} - ${params.cityName} Oteli`;
  const description = params.description || 
    `${params.hotelName} hakkında detaylı bilgi. ${params.cityName}'de ${params.stars || 5} yıldızlı konaklama.`;
  
  return {
    title,
    description,
    keywords: [
      params.hotelName,
      `${params.cityName} otel`,
      `${params.cityName} konaklama`,
      'umre oteli',
      'hac oteli',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// Rehber sayfası metadata
export function getGuideMetadata(params: {
  guideName: string;
  specialties?: string[];
  languages?: string[];
}): Metadata {
  const title = `${params.guideName} - Umre Hac Rehberi`;
  const specialties = params.specialties?.join(', ') || '';
  const description = `${params.guideName} ile ${specialties} alanında profesyonel rehberlik hizmeti.`;
  
  return {
    title,
    description,
    keywords: [
      params.guideName,
      'umre rehberi',
      'hac rehberi',
      'profesyonel rehber',
      ...(params.specialties || []),
    ],
  };
}

// Tur sayfası metadata
export function getTourMetadata(params: {
  tourName: string;
  category?: string;
  duration?: number;
  description?: string;
}): Metadata {
  const title = `${params.tourName} - Umre Hac Turu`;
  const description = params.description || 
    `${params.tourName} ile unutulmaz bir umre/hac deneyimi. ${params.duration || ''} günlük profesyonel tur.`;
  
  return {
    title,
    description,
    keywords: [
      params.tourName,
      'umre turu',
      'hac turu',
      params.category || '',
    ].filter(Boolean),
  };
}

// Yer sayfası metadata
export function getPlaceMetadata(params: {
  placeName: string;
  cityName: string;
  shortDescription?: string;
}): Metadata {
  const title = `${params.placeName} - ${params.cityName}`;
  const description = params.shortDescription || 
    `${params.placeName} hakkında detaylı bilgi. ${params.cityName}'de ziyaret edilecek kutsal yerler.`;
  
  return {
    title,
    description,
    keywords: [
      params.placeName,
      `${params.cityName} gezilecek yerler`,
      'umre ziyaret',
      'hac ziyaret',
    ],
  };
}

// Blog yazısı metadata
export function getBlogMetadata(params: {
  title: string;
  excerpt?: string;
  category?: string;
  publishDate?: string;
}): Metadata {
  const title = params.title;
  const description = params.excerpt || 
    `${params.title} - Sefernur blog yazısı.`;
  
  return {
    title,
    description,
    keywords: [
      'umre rehberi',
      'hac bilgileri',
      params.category || '',
    ].filter(Boolean),
    openGraph: {
      type: 'article',
      publishedTime: params.publishDate,
    },
  };
}
```

### Schema Generator (schema-generator.ts)
```typescript
import { Hotel, Place, Tour, Guide, Organization, Article } from 'schema-dts';

// Organizasyon schema
export function getOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    name: 'Sefernur',
    url: 'https://sefernur.com',
    logo: 'https://sefernur.com/logo.png',
    description: 'Umre ve Hac seyahat platformu',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-XXX-XXX-XXXX',
      contactType: 'customer service',
    },
    sameAs: [
      'https://facebook.com/sefernur',
      'https://instagram.com/sefernur',
      'https://twitter.com/sefernur',
    ],
  };
}

// Otel schema
export function getHotelSchema(params: {
  name: string;
  description: string;
  address: string;
  stars?: number;
  priceRange?: string;
  aggregateRating?: number;
  reviewCount?: number;
}): Hotel {
  return {
    '@type': 'Hotel',
    name: params.name,
    description: params.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressCountry: 'SA',
    },
    starRating: {
      '@type': 'Rating',
      ratingValue: params.stars || 5,
    },
    priceRange: params.priceRange || '$$',
    aggregateRating: params.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: params.aggregateRating,
      reviewCount: params.reviewCount || 0,
    } : undefined,
  };
}

// Tur schema
export function getTourSchema(params: {
  name: string;
  description: string;
  duration?: string;
  price?: string;
}): Tour {
  return {
    '@type': 'TouristTrip',
    name: params.name,
    description: params.description,
    touristType: ['CulturalTrip', 'ReligiousTrip'],
    duration: params.duration,
    offers: params.price ? {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: 'TRY',
    } : undefined,
  };
}

// Yer schema
export function getPlaceSchema(params: {
  name: string;
  description: string;
  address: string;
}): Place {
  return {
    '@type': 'Place',
    name: params.name,
    description: params.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressCountry: 'SA',
    },
  };
}

// Rehber schema
export function getGuideSchema(params: {
  name: string;
  description?: string;
  languages?: string[];
}): Guide {
  return {
    '@type': 'Person',
    name: params.name,
    description: params.description,
    knowsLanguage: params.languages || ['tr', 'ar'],
    jobTitle: 'Umre Hac Rehberi',
  };
}

// Blog schema
export function getArticleSchema(params: {
  title: string;
  description: string;
  publishDate: string;
  author: string;
  image?: string;
}): Article {
  return {
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    datePublished: params.publishDate,
    author: {
      '@type': 'Person',
      name: params.author,
    },
    image: params.image,
    publisher: {
      '@type': 'Organization',
      name: 'Sefernur',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sefernur.com/logo.png',
      },
    },
  };
}
```

### Constants (constants.ts)
```typescript
// SEO anahtar kelimeleri
export const SEO_KEYWORDS = {
  // Genel anahtar kelimeler
  general: [
    'umre',
    'hac',
    'umre turu',
    'hac turu',
    'mekke',
    'medine',
    'kabe',
    'mescid-i haram',
    'mescid-i nebevi',
    'umre oteli',
    'hac oteli',
    'umre transferi',
    'hac transferi',
    'umre rehberi',
    'hac rehberi',
  ],
  
  // Şehir anahtar kelimeleri
  mekke: [
    'mekke otelleri',
    'mekke konaklama',
    'kabe yakını oteller',
    'mescid-i haram yakını',
    'taif kapısı otel',
    'fahita kapısı otel',
    'salam kapısı otel',
  ],
  
  medine: [
    'medine otelleri',
    'medine konaklama',
    'mescid-i nebevi yakını oteller',
    'ravza yakını oteller',
    'kuba camii yakını',
  ],
  
  // Hizmet anahtar kelimeleri
  otel: [
    'umre otel rezervasyonu',
    'hac otel rezervasyonu',
    'mekke otel',
    'medine otel',
    'kutsal yerler otel',
  ],
  
  transfer: [
    'cemalan transferi',
    'havalimanı transfer',
    'mekke medine transfer',
    'vip transfer',
    'özel transfer',
  ],
  
  rehber: [
    'profesyonel rehber',
    'sertifikalı rehber',
    'türk rehber',
    'arapça rehber',
  ],
  
  tur: [
    'umre turu paketleri',
    'hac turu paketleri',
    'ekonomik umre turu',
    'lüks umre turu',
    '21 günlük umre turu',
    '30 günlük hac turu',
  ],
} as const;

// Meta description şablonları
export const META_TEMPLATES = {
  hotel: (name: string, city: string) => 
    `${name} - ${city} oteli hakkında detaylı bilgi, fiyatlar ve rezervasyon. Umre ve hac için konforlu konaklama.`,
  
  guide: (name: string) => 
    `${name} ile umre ve hac yolculuğunuzda profesyonel rehberlik hizmeti. Sertifikalı rehber.`,
  
  tour: (name: string) => 
    `${name} - Umre ve hac turu paketleri. Konforlu seyahat deneyimi.`,
  
  place: (name: string, city: string) => 
    `${name} - ${city} ziyaret yerleri hakkında detaylı bilgi. Kutsal yerler rehberi.`,
  
  transfer: (from: string, to: string) => 
    `${from} - ${to} transfer hizmeti. VIP ve özel transfer seçenekleri.`,
  
  blog: (title: string) => 
    `${title} - Sefernur blog. Umre ve hac hakkında bilgilendirici yazılar.`,
} as const;

// URL uzunluk sınırları
export const URL_LIMITS = {
  maxSlugLength: 60,
  maxUrlLength: 200,
  maxTitleLength: 60,
  maxDescriptionLength: 160,
} as const;
```

---

## 🗺️ Sitemap ve Robots.txt

### Sitemap Oluşturma (app/sitemap.ts)
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sefernur.com';
  
  // Statik sayfalar
  const staticPages = [
    { url: baseUrl, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/oteller`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/turlar`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/transferler`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/rehberler`, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/gezilecek-yerler`, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/kampanyalar`, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/vize`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/hakkimizda`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/iletisim`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/sikca-sorulanlar-sorular`, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];
  
  return staticPages;
}
```

### Dinamik Sitemap (app/sitemap-[type].ts)
```typescript
// Oteller için dinamik sitemap
// app/sitemap-hotels.ts
import { MetadataRoute } from 'next';
import { getAllHotels } from '@/lib/firebase/domain';

export default async function sitemapHotels(): Promise<MetadataRoute.Sitemap> {
  const hotels = await getAllHotels();
  const baseUrl = 'https://sefernur.com';
  
  return hotels.map((hotel) => ({
    url: `${baseUrl}/oteller/${hotel.citySlug}/${hotel.slug}`,
    lastModified: hotel.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}

// Blog için dinamik sitemap
// app/sitemap-blog.ts
import { MetadataRoute } from 'next';
import { getAllPublishedPosts } from '@/lib/firebase/domain';

export default async function sitemapBlog(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPublishedPosts();
  const baseUrl = 'https://sefernur.com';
  
  return posts.map((post) => ({
    url: `${baseUrl}/blog/${post.categorySlug}/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
}
```

### Robots.txt (app/robots.ts)
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/profile/',
          '/reservations/',
          '/favorites/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: 'https://sefernur.com/sitemap.xml',
    host: 'https://sefernur.com',
  };
}
```

---

## 🔄 Redirect Stratejisi

### Next.js Middleware ile Redirect (middleware.ts)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddleware } from 'next-intl/middleware';

// Eski URL'den yeni URL'ye redirect haritası
const REDIRECT_MAP: Record<string, string> = {
  // İngilizce sayfa isimlerinden Türkçeye
  '/hotels': '/oteller',
  '/tours': '/turlar',
  '/transfers': '/transferler',
  '/guides': '/rehberler',
  '/places': '/gezilecek-yerler',
  '/visa': '/vize',
  '/blog': '/blog',
  '/campaigns': '/kampanyalar',
  '/about': '/hakkimizda',
  '/contact': '/iletisim',
  '/faq': '/sikca-sorulanlar-sorular',
  '/privacy': '/gizlilik-politikasi',
  '/terms': '/kullanim-kosullari',
  '/kvkk': '/kvkk-aydinlatma-metni',
  '/cancellation': '/iptal-iade-politikasi',
  '/cookies': '/cerez-politikasi',
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Ana redirect kontrolü
  if (REDIRECT_MAP[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = REDIRECT_MAP[pathname];
    return NextResponse.redirect(url, 301);
  }
  
  // Dinamik sayfa redirect kontrolü
  // /hotels/abc123 -> /oteller/mekke/hotel-name-abc123
  if (pathname.match(/^\/hotels\/[^/]+$/)) {
    const hotelId = pathname.split('/')[2];
    // Firebase'den otel bilgisi al ve yeni URL'ye redirect
    // Bu işlem API route üzerinden yapılmalı
    const url = request.nextUrl.clone();
    url.pathname = `/api/redirect/hotel/${hotelId}`;
    return NextResponse.rewrite(url);
  }
  
  // Benzer şekilde diğer sayfalar için...
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### API Route ile Dinamik Redirect (app/api/redirect/hotel/[id]/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getHotelById } from '@/lib/firebase/domain';
import { createHotelUrl } from '@/lib/seo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  
  if (!hotel) {
    return NextResponse.next();
  }
  
  const newUrl = createHotelUrl({
    hotelName: hotel.name,
    hotelId: hotel.id,
    cityName: hotel.cityName,
  });
  
  return NextResponse.redirect(new URL(newUrl, request.url), 301);
}
```

---

## 📋 Uygulama Adımları

### Adım 1: Merkezi SEO Kütüphanesini Oluştur
- [ ] `web-app/src/lib/seo/` dizinini oluştur
- [ ] `slug-generator.ts` dosyasını oluştur
- [ ] `url-builder.ts` dosyasını oluştur
- [ ] `metadata-generator.ts` dosyasını oluştur
- [ ] `schema-generator.ts` dosyasını oluştur
- [ ] `constants.ts` dosyasını oluştur
- [ ] `index.ts` dosyasından tüm exportları yap

### Adım 2: Sayfa Yollarını Güncelle
- [ ] Oteller için yeni route yapısı: `/oteller/[sehir]/[otel-slug]-[id]`
- [ ] Rehberler için yeni route yapısı: `/rehberler/[rehber-slug]-[id]`
- [ ] Yerler için yeni route yapısı: `/gezilecek-yerler/[sehir]/[yer-slug]-[id]`
- [ ] Turlar için yeni route yapısı: `/turlar/[tur-slug]-[id]`
- [ ] Transferler için yeni route yapısı: `/transferler/[transfer-slug]-[id]`
- [ ] Blog için yeni route yapısı: `/blog/[kategori]/[yazi-slug]-[id]`
- [ ] Vize için yeni route yapısı: `/vize-basvuru/[basvuru-slug]-[id]`
- [ ] Kampanyalar için yeni route yapısı: `/kampanyalar/[kampanya-slug]-[id]`

### Adım 3: Statik Sayfa Yollarını Türkçeleştir
- [ ] `/about` -> `/hakkimizda`
- [ ] `/contact` -> `/iletisim`
- [ ] `/faq` -> `/sikca-sorulanlar-sorular`
- [ ] `/privacy` -> `/gizlilik-politikasi`
- [ ] `/terms` -> `/kullanim-kosullari`
- [ ] `/kvkk` -> `/kvkk-aydinlatma-metni`
- [ ] `/cancellation` -> `/iptal-iade-politikasi`
- [ ] `/cookies` -> `/cerez-politikasi`

### Adım 4: Metadata ve Schema Entegrasyonu
- [ ] Her dinamik sayfa için generateMetadata fonksiyonu ekle
- [ ] Schema.org JSON-LD bileşenlerini oluştur
- [ ] Open Graph ve Twitter Card meta taglerini ekle

### Adım 5: Sitemap ve Robots.txt
- [ ] `app/sitemap.ts` dosyasını oluştur
- [ ] Dinamik sitemap dosyalarını oluştur
- [ ] `app/robots.ts` dosyasını oluştur

### Adım 6: Redirect Sistemi
- [ ] Middleware ile redirect kurallarını tanımla
- [ ] Dinamik redirect API route'larını oluştur
- [ ] Eski URL'lerden yeni URL'lere 301 redirect oluştur

### Adım 7: İç Linkleri Güncelle
- [ ] Header navigasyon linklerini güncelle
- [ ] Footer linklerini güncelle
- [ ] İçerik içindeki tüm linkleri güncelle
- [ ] Breadcumb bileşenlerini güncelle

### Adım 8: Test ve Doğrulama
- [ ] Tüm sayfaların URL'lerini test et
- [ ] Redirect'leri doğrula
- [ ] Meta tag'leri kontrol et
- [ ] Schema.org yapılandırmasını test et
- [ ] Sitemap'i doğrula
- [ ] Robots.txt'i kontrol et

---

## 🔧 Teknik Notlar

### Route Yapısı Değişiklikleri
Next.js App Router'da dinamik route parametreleri için yeni yapı:

```typescript
// Önce: app/hotels/[hotelId]/page.tsx
// Sonra: app/oteller/[sehir]/[slug]/page.tsx

// page.tsx içinde params'den değerleri al
export async function generateMetadata({ params }: {
  params: Promise<{ sehir: string; slug: string }>
}) {
  const { sehir, slug } = await params;
  const hotelId = extractIdFromSlug(slug);
  // ...
}
```

### Veritabanı Güncellemeleri
Mevcut verilerde slug alanı eklemek için migration:

```typescript
// Firebase'de her doküman için slug alanı ekle
interface HotelModel {
  // ... mevcut alanlar
  slug: string;  // Otomatik oluşturulacak
  citySlug: string;  // Şehir slug'ı
}

// Slug oluşturma fonksiyonu
function generateHotelSlug(hotel: HotelModel): string {
  return createSlugWithId(hotel.name, hotel.id);
}
```

---

## 📊 Başarı Metrikleri

### SEO İyileştirmeleri
- URL'lerin Türkçe ve anlamlı olması
- Meta description ve title optimizasyonu
- Schema.org ile zengin snippet'ler
- Sitemap ile indeksleme kolaylığı
- Canonical URL ile duplicate içerik önleme

### Kullanıcı Deneyimi
- Anlaşılır ve güven veren URL'ler
- Türkçe içerik ile uyumlu linkler
- Breadcumb ile kolay navigasyon

---

## 🚀 Sonraki Adımlar

Bu planın uygulanması için Code moduna geçilmesi önerilir. Code modunda:
1. Merkezi SEO kütüphanesi oluşturulacak
2. Route yapıları güncellenecek
3