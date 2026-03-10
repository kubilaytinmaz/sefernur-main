/**
 * SEO Metadata Generator
 * Tüm sayfa türleri için meta tag ve Open Graph oluşturma fonksiyonları
 */

import type { Metadata } from 'next';
import { META_TEMPLATES, SITE_INFO, TITLE_TEMPLATES } from './constants';
import type {
    BlogMetadataParams,
    GuideMetadataParams,
    HotelMetadataParams,
    PlaceMetadataParams,
    TourMetadataParams,
    TransferMetadataParams,
} from './types';

// ═══════════════════════════════════════════════════════
//  Ana Sayfa Metadata
// ═══════════════════════════════════════════════════════

/**
 * Ana sayfa için metadata oluşturur
 */
export function getHomeMetadata(): Metadata {
  return {
    title: SITE_INFO.title,
    description: SITE_INFO.description,
    keywords: [
      'umre',
      'hac',
      'otel',
      'tur',
      'transfer',
      'mekke',
      'medine',
      'seyahat',
      'konaklama',
      'rehber',
    ],
    authors: [{ name: SITE_INFO.name }],
    creator: SITE_INFO.name,
    publisher: SITE_INFO.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: SITE_INFO.url,
      title: SITE_INFO.title,
      description: SITE_INFO.description,
      siteName: SITE_INFO.name,
      images: [
        {
          url: SITE_INFO.ogImage,
          width: 1200,
          height: 630,
          alt: SITE_INFO.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_INFO.title,
      description: SITE_INFO.description,
      images: [SITE_INFO.ogImage],
      creator: SITE_INFO.twitterHandle,
    },
    alternates: {
      canonical: SITE_INFO.url,
    },
  };
}

// ═══════════════════════════════════════════════════════
//  Dinamik Sayfa Metadata
// ═══════════════════════════════════════════════════════

/**
 * Otel sayfası için metadata oluşturur
 */
export function getHotelMetadata(params: HotelMetadataParams): Metadata {
  const title = TITLE_TEMPLATES.hotel(params.hotelName, params.cityName);
  const description = params.description || 
    META_TEMPLATES.hotel(params.hotelName, params.cityName, params.stars);
  
  const keywords = [
    params.hotelName,
    `${params.cityName} otel`,
    `${params.cityName} konaklama`,
    'umre oteli',
    'hac oteli',
    `${params.stars || 5} yıldızlı otel`,
  ];
  
  if (params.stars) {
    keywords.push(`${params.stars} yıldız`);
  }
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Rehber sayfası için metadata oluşturur
 */
export function getGuideMetadata(params: GuideMetadataParams): Metadata {
  const title = TITLE_TEMPLATES.guide(params.guideName);
  const description = META_TEMPLATES.guide(params.guideName, params.specialties);
  
  const keywords = [
    params.guideName,
    'umre rehberi',
    'hac rehberi',
    'profesyonel rehber',
    'sertifikalı rehber',
    ...(params.specialties || []),
    ...(params.languages?.map(l => `${l} rehber`) || []),
  ];
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/**
 * Tur sayfası için metadata oluşturur
 */
export function getTourMetadata(params: TourMetadataParams): Metadata {
  const title = TITLE_TEMPLATES.tour(params.tourName);
  const description = params.description || 
    META_TEMPLATES.tour(params.tourName, params.duration);
  
  const keywords = [
    params.tourName,
    'umre turu',
    'hac turu',
    params.category || '',
    `${params.duration || ''} günlük tur`,
    'umre paketi',
    'hac paketi',
  ].filter(Boolean);
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Gezilecek yer sayfası için metadata oluşturur
 */
export function getPlaceMetadata(params: PlaceMetadataParams): Metadata {
  const title = TITLE_TEMPLATES.place(params.placeName, params.cityName);
  const description = params.shortDescription || 
    META_TEMPLATES.place(params.placeName, params.cityName);
  
  const keywords = [
    params.placeName,
    `${params.cityName} gezilecek yerler`,
    `${params.cityName} ziyaret yerleri`,
    'umre ziyaret',
    'hac ziyaret',
    'kutsal yerler',
    params.category || '',
  ].filter(Boolean);
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Transfer sayfası için metadata oluşturur
 */
export function getTransferMetadata(params: TransferMetadataParams): Metadata {
  const title = TITLE_TEMPLATES.transfer(params.from, params.to);
  const description = META_TEMPLATES.transfer(params.from, params.to, params.vehicleType);
  
  const keywords = [
    `${params.from} ${params.to} transfer`,
    'umre transferi',
    'hac transferi',
    params.vehicleType || 'VIP transfer',
    'havalimanı transfer',
    'otel transfer',
    'özel transfer',
  ];
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/**
 * Blog yazısı için metadata oluşturur
 */
export function getBlogMetadata(params: BlogMetadataParams): Metadata {
  const title = TITLE_TEMPLATES.blog(params.title);
  const description = params.excerpt || 
    META_TEMPLATES.blog(params.title, params.category);
  
  const keywords = [
    'umre rehberi',
    'hac bilgileri',
    params.category || '',
    'seyahat ipuçları',
  ].filter(Boolean);
  
  return {
    title,
    description,
    keywords,
    authors: params.author ? [{ name: params.author }] : [{ name: SITE_INFO.name }],
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'tr_TR',
      publishedTime: params.publishDate,
      authors: params.author ? [params.author] : [SITE_INFO.name],
      images: params.image ? [params.image] : [SITE_INFO.ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Kampanya sayfası için metadata oluşturur
 */
export function getCampaignMetadata(campaignName: string, description?: string): Metadata {
  const title = TITLE_TEMPLATES.campaign(campaignName);
  const campaignDescription = description || 
    META_TEMPLATES.campaign(campaignName);
  
  return {
    title,
    description: campaignDescription,
    keywords: [
      campaignName,
      'umre indirimi',
      'hac indirimi',
      'kampanya',
      'fırsat',
      'indirim',
    ],
    openGraph: {
      title,
      description: campaignDescription,
      type: 'website',
      locale: 'tr_TR',
    },
  };
}

/**
 * Vize sayfası için metadata oluşturur
 */
export function getVisaMetadata(country: string = 'Suudi Arabistan'): Metadata {
  const title = TITLE_TEMPLATES.visa(country);
  const description = META_TEMPLATES.visa(country);
  
  return {
    title,
    description,
    keywords: [
      `${country} vizesi`,
      'umre vizesi',
      'hac vizesi',
      'vize başvurusu',
      'online vize',
      'elektronik vize',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
    },
  };
}

// ═══════════════════════════════════════════════════════
//  Statik Sayfa Metadata
// ═══════════════════════════════════════════════════════

/**
 * Hakkımızda sayfası metadata
 */
export function getAboutMetadata(): Metadata {
  return {
    title: 'Hakkımızda | Sefernur',
    description: 'Sefernur olarak umre ve hac yolculuklarınızda size en iyi hizmeti sunmak için çalışıyoruz. Hikayemiz, vizyonumuz ve değerlerimiz hakkında bilgi alın.',
    keywords: ['sefernur', 'hakkımızda', 'umre', 'hac', 'seyahat acentesi'],
  };
}

/**
 * İletişim sayfası metadata
 */
export function getContactMetadata(): Metadata {
  return {
    title: 'İletişim | Sefernur',
    description: 'Sefernur ile iletişime geçin. Umre ve hac seyahatleriniz için destek ve danışmanlık alın. 7/24 hizmet.',
    keywords: ['iletişim', 'telefon', 'adres', 'e-posta', 'destek'],
  };
}

/**
 * Sıkça sorulan sorular metadata
 */
export function getFaqMetadata(): Metadata {
  return {
    title: 'Sıkça Sorulan Sorular | Sefernur',
    description: 'Umre ve hac hakkında sıkça sorulan sorular ve cevaplar. Rezervasyon, iptal, ödeme ve seyahat süreçleri hakkında detaylı bilgi.',
    keywords: ['sıkça sorulanlar', 'sss', 'faq', 'yardım', 'destek'],
  };
}

/**
 * Gizlilik politikası metadata
 */
export function getPrivacyMetadata(): Metadata {
  return {
    title: 'Gizlilik Politikası | Sefernur',
    description: 'Kişisel verilerinizin güvenliği ve gizliliği konusunda politikamız. KVKK uyumlu gizlilik politikası.',
    keywords: ['gizlilik', 'kvkk', 'kişisel veriler', 'veri güvenliği'],
  };
}

/**
 * Kullanım koşulları metadata
 */
export function getTermsMetadata(): Metadata {
  return {
    title: 'Kullanım Koşulları | Sefernur',
    description: 'Sefernur web sitesini kullanırken uymanız gereken koşullar. Hizmetler, rezervasyon ve ödeme koşulları.',
    keywords: ['kullanım koşulları', 'hizmet koşulları', 'üyelik', 'rezervasyon'],
  };
}

/**
 * KVKK aydınlatma metni metadata
 */
export function getKvkkMetadata(): Metadata {
  return {
    title: 'KVKK Aydınlatma Metni | Sefernur',
    description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni. Verilerinizin işlenmesi hakkında bilgi.',
    keywords: ['kvkk', 'aydınlatma metni', 'kişisel veriler', '6698'],
  };
}

/**
 * İptal ve iade politikası metadata
 */
export function getCancellationMetadata(): Metadata {
  return {
    title: 'İptal ve İade Politikası | Sefernur',
    description: 'Rezervasyon iptal ve iade koşulları. Umre ve hac turları için iptal politikası ve iade süreci.',
    keywords: ['iptal', 'iade', 'politika', 'koşullar', 'değişiklik'],
  };
}

/**
 * Çerez politikası metadata
 */
export function getCookiesMetadata(): Metadata {
  return {
    title: 'Çerez Politikası | Sefernur',
    description: 'Web sitemizde çerez kullanımı hakkında bilgi. Çerez politikası ve ayarlarınız.',
    keywords: ['çerez', 'cookies', 'gizlilik', 'tracking'],
  };
}

/**
 * Listing sayfası metadata (filtreli)
 */
export function getListingMetadata(
  type: 'hotels' | 'tours' | 'transfers' | 'guides',
  filters?: Record<string, string>
): Metadata {
  const typeLabels: Record<typeof type, string> = {
    hotels: 'Oteller',
    tours: 'Turlar',
    transfers: 'Transferler',
    guides: 'Rehberler',
  };
  
  const title = `${typeLabels[type]} | Sefernur`;
  const description = `${typeLabels[type]} listesi. En uygun fiyatlarla umre ve hac hizmetleri.`;
  
  return {
    title,
    description,
    keywords: [typeLabels[type].toLowerCase(), 'liste', 'arama', 'filtrele'],
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

/**
 * Arama sonuçları sayfası metadata
 */
export function getSearchResultsMetadata(query: string): Metadata {
  const title = `"${query}" Arama Sonuçları | Sefernur`;
  const description = `"${query}" için arama sonuçları. En uygun umre ve hac hizmetlerini bulun.`;
  
  return {
    title,
    description,
    keywords: ['arama', 'sonuçlar', query],
    robots: {
      index: false,
      follow: true,
    },
  };
}

/**
 * Hata sayfası metadata
 */
export function getErrorMetadata(statusCode: number = 404): Metadata {
  const titles: Record<number, string> = {
    400: 'Hatalı İstek',
    401: 'Yetkisiz Erişim',
    403: 'Yasaklı Erişim',
    404: 'Sayfa Bulunamadı',
    500: 'Sunucu Hatası',
    503: 'Hizmet Kullanılamaz',
  };
  
  const descriptions: Record<number, string> = {
    404: 'Aradığınız sayfa bulunamadı. Lütfen URL\'i kontrol edin veya ana sayfaya gidin.',
    500: 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    503: 'Hizmet geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
  };
  
  return {
    title: `${titles[statusCode]} | Sefernur`,
    description: descriptions[statusCode] || 'Bir hata oluştu.',
    robots: {
      index: false,
      follow: false,
    },
  };
}
