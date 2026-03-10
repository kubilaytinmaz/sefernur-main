/**
 * SEO URL Builder
 * Tüm sayfa türleri için SEO uyumlu URL oluşturma fonksiyonları
 */

import { createCategorySlug, createCitySlug, createSlug, createSlugWithId } from './slug-generator';
import type {
    BlogUrlParams,
    CampaignUrlParams,
    GuideUrlParams,
    HotelUrlParams,
    PlaceUrlParams,
    TourUrlParams,
    TransferUrlParams,
    VisaUrlParams,
} from './types';

// ═══════════════════════════════════════════════════════
//  Dinamik Sayfa URL Oluşturucular
// ═══════════════════════════════════════════════════════

/**
 * Otel sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createHotelUrl({ hotelName: "Clock Tower", hotelId: "abc123", cityName: "Mekke" })
 * // "/oteller/mekke/clock-tower-abc123"
 */
export function createHotelUrl(params: HotelUrlParams): string {
  const hotelSlug = createSlugWithId(params.hotelName, params.hotelId);
  
  if (params.cityName) {
    const citySlug = createCitySlug(params.cityName);
    return `/oteller/${citySlug}/${hotelSlug}`;
  }
  
  return `/oteller/${hotelSlug}`;
}

/**
 * Rehber sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createGuideUrl({ guideName: "Ahmet Yılmaz", guideId: "def456" })
 * // "/rehberler/ahmet-yilmaz-def456"
 */
export function createGuideUrl(params: GuideUrlParams): string {
  const slug = createSlugWithId(params.guideName, params.guideId);
  return `/rehberler/${slug}`;
}

/**
 * Gezilecek yer sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createPlaceUrl({ placeName: "Mescid-i Haram", placeId: "ghi789", cityName: "Mekke" })
 * // "/gezilecek-yerler/mekke/mescid-i-haram-ghi789"
 */
export function createPlaceUrl(params: PlaceUrlParams): string {
  const placeSlug = createSlugWithId(params.placeName, params.placeId);
  
  if (params.cityName) {
    const citySlug = createCitySlug(params.cityName);
    return `/gezilecek-yerler/${citySlug}/${placeSlug}`;
  }
  
  return `/gezilecek-yerler/${placeSlug}`;
}

/**
 * Tur sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createTourUrl({ tourName: "Mekke Şehir Turu", tourId: "jkl012" })
 * // "/turlar/mekke-sehir-turu-jkl012"
 */
export function createTourUrl(params: TourUrlParams): string {
  const slug = createSlugWithId(params.tourName, params.tourId);
  return `/turlar/${slug}`;
}

/**
 * Transfer sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createTransferUrl({ transferName: "VIP Mercedes Vito", transferId: "mno345" })
 * // "/transferler/vip-mercedes-vito-mno345"
 */
export function createTransferUrl(params: TransferUrlParams): string {
  const slug = createSlugWithId(params.transferName, params.transferId);
  return `/transferler/${slug}`;
}

/**
 * Blog yazısı sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createBlogUrl({ title: "Umre Turlarında Dikkat Edilmesi Gerekenler", id: "pqr678", category: "Umre Rehberi" })
 * // "/blog/umre-rehberi/umre-turlarinda-dikkat-edilmesi-gerekenler-pqr678"
 */
export function createBlogUrl(params: BlogUrlParams): string {
  const postSlug = createSlugWithId(params.title, params.id);
  
  if (params.category) {
    const categorySlug = createCategorySlug(params.category);
    return `/blog/${categorySlug}/${postSlug}`;
  }
  
  return `/blog/${postSlug}`;
}

/**
 * Vize başvuru sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createVisaUrl({ applicationId: "stu901" })
 * // "/vize-basvuru/basvuru-stu901"
 */
export function createVisaUrl(params: VisaUrlParams): string {
  const baseSlug = params.applicantName 
    ? createSlug(params.applicantName)
    : 'basvuru';
  return `/vize-basvuru/${baseSlug}-${params.applicationId}`;
}

/**
 * Kampanya sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createCampaignUrl({ campaignName: "Erken Rezervasyon İndirimi", campaignId: "vwx234" })
 * // "/kampanyalar/erken-rezervasyon-indirimi-vwx234"
 */
export function createCampaignUrl(params: CampaignUrlParams): string {
  const slug = createSlugWithId(params.campaignName, params.campaignId);
  return `/kampanyalar/${slug}`;
}

/**
 * Transfer rezervasyon sayfası için SEO uyumlu URL oluştur
 * 
 * @example
 * createBookingUrl("VIP Vito", "abc123", "Mekke Şehir Turu", "def456")
 * // "/transfer-rezervasyon/vip-vito-abc123/mekke-sehir-turu-def456"
 */
export function createBookingUrl(
  vehicleName: string,
  vehicleId: string,
  tourName?: string,
  tourId?: string
): string {
  const vehicleSlug = createSlugWithId(vehicleName, vehicleId);
  
  if (tourName && tourId) {
    const tourSlug = createSlugWithId(tourName, tourId);
    return `/transfer-rezervasyon/${vehicleSlug}/${tourSlug}`;
  }
  
  return `/transfer-rezervasyon/${vehicleSlug}`;
}

// ═══════════════════════════════════════════════════════
//  Statik Sayfa URL'leri
// ═══════════════════════════════════════════════════════

/**
 * Statik sayfa URL eşlemeleri
 * Tüm statik sayfalar için Türkçe URL'ler
 */
export const STATIC_PAGE_URLS = {
  // Ana sayfalar
  home: '/',
  hotels: '/oteller',
  tours: '/turlar',
  transfers: '/transferler',
  guides: '/rehberler',
  places: '/gezilecek-yerler',
  campaigns: '/kampanyalar',
  blog: '/blog',
  visa: '/vize',
  cars: '/arac-kiralama',
  planner: '/seyahat-planlayici',
  
  // Bilgi sayfaları
  about: '/hakkimizda',
  contact: '/iletisim',
  faq: '/sikca-sorulan-sorular',
  privacy: '/gizlilik-politikasi',
  terms: '/kullanim-kosullari',
  kvkk: '/kvkk-aydinlatma-metni',
  cancellation: '/iptal-iade-politikasi',
  cookies: '/cerez-politikasi',
  
  // Kullanıcı sayfaları
  profile: '/profil',
  reservations: '/rezervasyonlar',
  favorites: '/favoriler',
  
  // Auth sayfaları
  login: '/giris',
  register: '/kayit',
} as const;

/**
 * Eski URL'den yeni URL'ye eşleme (redirect için)
 */
export const URL_REDIRECT_MAP: Record<string, string> = {
  // İngilizce -> Türkçe yönlendirmeler
  '/hotels': '/oteller',
  '/tours': '/turlar',
  '/transfers': '/transferler',
  '/guides': '/rehberler',
  '/places': '/gezilecek-yerler',
  '/campaigns': '/kampanyalar',
  '/visa': '/vize',
  '/cars': '/arac-kiralama',
  '/planner': '/seyahat-planlayici',
  '/about': '/hakkimizda',
  '/contact': '/iletisim',
  '/faq': '/sikca-sorulan-sorular',
  '/privacy': '/gizlilik-politikasi',
  '/terms': '/kullanim-kosullari',
  '/kvkk': '/kvkk-aydinlatma-metni',
  '/cancellation': '/iptal-iade-politikasi',
  '/cookies': '/cerez-politikasi',
  '/profile': '/profil',
  '/reservations': '/rezervasyonlar',
  '/favorites': '/favoriler',
};

/**
 * Canonical URL oluşturur (tam URL)
 * 
 * @param path - Sayfa yolu
 * @returns Tam canonical URL
 */
export function createCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sefernur.com';
  // Trailing slash ekle (next.config.ts trailingSlash: true ile uyumlu)
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Breadcrumb verisi oluşturur
 * 
 * @param items - Breadcrumb öğeleri
 * @returns Schema.org uyumlu breadcrumb verisi
 */
export function createBreadcrumb(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: createCanonicalUrl(item.url),
    })),
  };
}

/**
 * Listing sayfası URL'i oluşturur (filtreli)
 * 
 * @example
 * createListingUrl('/oteller', { city: 'mekke', stars: '5' })
 * // "/oteller?city=mekke&stars=5"
 */
export function createListingUrl(basePath: string, filters?: Record<string, string>): string {
  if (!filters || Object.keys(filters).length === 0) {
    return basePath;
  }
  
  const params = new URLSearchParams(filters);
  return `${basePath}?${params.toString()}`;
}
