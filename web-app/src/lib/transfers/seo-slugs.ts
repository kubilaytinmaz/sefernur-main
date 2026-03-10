/**
 * SEO Uyumlu Türkçe URL Slug Oluşturma
 * Transfer ve Tur sayfaları için Türkçe, arama motoru dostu URL'ler
 */

/**
 * Türkçe karakterleri İngilizce karşılıklarına dönüştür
 */
function turkishToEnglish(text: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return text.split('').map(char => turkishMap[char] || char).join('');
}

/**
 * Metni SEO uyumlu slug'a dönüştür
 * Örnek: "Mekke Şehir Turu" -> "mekke-sehir-turu"
 */
export function createSlug(text: string): string {
  return turkishToEnglish(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tireye dönüştür
    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
}

/**
 * Transfer için SEO uyumlu URL oluştur
 * Örnek: /transferler/vito-vip-araci
 */
export function createTransferUrl(vehicleName: string, vehicleId: string): string {
  const slug = createSlug(vehicleName);
  return `/transferler/${slug}-${vehicleId}`;
}

/**
 * Tur için SEO uyumlu URL oluştur
 * Örnek: /turlar/mekke-sehir-turu
 */
export function createTourUrl(tourName: string, tourId: string): string {
  const slug = createSlug(tourName);
  return `/turlar/${slug}-${tourId}`;
}

/**
 * Booking sayfası için SEO uyumlu URL oluştur
 * Örnek: /transfer-rezervasyon/vito-vip-araci/mekke-sehir-turu
 */
export function createBookingUrl(
  vehicleName: string,
  vehicleId: string,
  tourName?: string,
  tourId?: string
): string {
  const vehicleSlug = createSlug(vehicleName);
  
  if (tourName && tourId) {
    const tourSlug = createSlug(tourName);
    return `/transfer-rezervasyon/${vehicleSlug}-${vehicleId}/${tourSlug}-${tourId}`;
  }
  
  return `/transfer-rezervasyon/${vehicleSlug}-${vehicleId}`;
}

/**
 * URL'den ID'yi çıkar
 * Örnek: "vito-vip-araci-abc123" -> "abc123"
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
}

/**
 * Popüler turlar için SEO anahtar kelimeleri
 */
export const TOUR_SEO_KEYWORDS: Record<string, string[]> = {
  'tour-mecca-city': ['mekke turu', 'mekke gezisi', 'mekke ziyaret', 'kabe turu', 'hira magarasi'],
  'guide-cebeli-nur': ['cebeli nur', 'hira magarasi', 'ilk vahiy', 'mekke dag turu'],
  'tour-arafat-mina': ['arafat turu', 'mina ziyareti', 'muzdelife', 'hac yerleri'],
  'tour-medina-city': ['medine turu', 'medine gezisi', 'mescidi nebevi', 'uhud turu'],
  'tour-date-gardens': ['hura bahcesi', 'medine hurmasi', 'hura tadimi'],
  'guide-uhud-mountain': ['uhud dagi', 'uhud savasi', 'sehitler mezarligi', 'hz hamza'],
  'tour-taif': ['taif turu', 'taif gezisi', 'gul bahceleri', 'taif kalesi'],
  'tour-jeddah-coast': ['cidde turu', 'kizildeniz', 'cidde cesmesi', 'al balad'],
};

/**
 * Araç tipleri için SEO anahtar kelimeleri
 */
export const VEHICLE_SEO_KEYWORDS: Record<string, string[]> = {
  'sedan': ['sedan arac', 'ozel arac transfer', 'vip transfer', 'konforlu transfer'],
  'vito': ['mercedes vito', 'vito transfer', 'vito vip', 'luks vito'],
  'minibus': ['minibus transfer', 'grup transferi', 'kalabalik grup transferi'],
  'bus': ['otobus transfer', 'buyuk grup transferi', 'tur otobusu'],
};

/**
 * Meta description oluştur
 */
export function createMetaDescription(
  type: 'transfer' | 'tour' | 'booking',
  details?: {
    from?: string;
    to?: string;
    vehicle?: string;
    tour?: string;
  }
): string {
  const baseSite = 'Sefernur - Umre ve Hac Transfer Hizmetleri';
  
  if (type === 'transfer' && details) {
    return `${details.from || 'Mekke'} - ${details.to || 'Medine'} ${details.vehicle || 'VIP'} transferi. ${baseSite} ile güvenli, konforlu transfer rezervasyonu yapın.`;
  }
  
  if (type === 'tour' && details?.tour) {
    return `${details.tour} - Rehberli tur rezervasyonu. ${baseSite} ile kutsal yerleri keşfedin.`;
  }
  
  if (type === 'booking' && details) {
    const parts = [details.vehicle, details.tour].filter(Boolean).join(' + ');
    return `${parts} rezervasyonu. ${baseSite} ile hemen rezervasyon yapın, güvenli transfer ve tur hizmeti alın.`;
  }
  
  return `${baseSite} - Mekke, Medine ve diğer kutsal yerlere güvenli transfer ve rehberli tur hizmetleri.`;
}

/**
 * Meta keywords oluştur
 */
export function createMetaKeywords(
  vehicleType?: string,
  tourId?: string
): string {
  const keywords: string[] = [
    'umre transferi',
    'hac transferi',
    'mekke transferi',
    'medine transferi',
    'vip transfer',
    'ozel surucu',
  ];

  if (vehicleType && VEHICLE_SEO_KEYWORDS[vehicleType]) {
    keywords.push(...VEHICLE_SEO_KEYWORDS[vehicleType]);
  }

  if (tourId && TOUR_SEO_KEYWORDS[tourId]) {
    keywords.push(...TOUR_SEO_KEYWORDS[tourId]);
  }

  return keywords.join(', ');
}
