/**
 * SEO Constants
 * SEO sistemi için sabitler ve anahtar kelimeler
 */

import type { SiteInfo, UrlLimits } from './types';

// Site bilgileri
export const SITE_INFO: SiteInfo = {
  name: 'Sefernur',
  title: 'Sefernur - Umre ve Hac Seyahat Platformu',
  description: 'Umre ve Hac seyahatleriniz için otel, tur, transfer, rehber ve araç kiralama hizmetleri. Mekke ve Medine\'de konforlu seyahat deneyimi.',
  url: 'https://sefernur.com',
  ogImage: '/og-image.jpg',
  twitterHandle: '@sefernur',
};

// URL limitleri
export const URL_LIMITS: UrlLimits = {
  maxSlugLength: 60,
  maxUrlLength: 200,
  maxTitleLength: 60,
  maxDescriptionLength: 160,
};

// Stop words (gereksiz kelimeler - SEO slug'larında kaldırılacak)
export const STOP_WORDS = new Set([
  // Türkçe
  've', 'veya', 'ile', 'için', 'üzerinde', 'altinda', 'ama', 'fakat',
  'ya', 'yahut', 'ki', 'de', 'da', 'mi', 'mu', 'mü', 'mı',
  // İngilizce
  'the', 'and', 'or', 'for', 'with', 'on', 'in', 'at', 'to', 'a', 'an',
]);

// Türkçe karakter haritası
export const TURKISH_CHAR_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'C',
  'ğ': 'g', 'Ğ': 'G',
  'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O',
  'ş': 's', 'Ş': 'S',
  'ü': 'u', 'Ü': 'U',
};

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
    'kutsal yerler',
    'suudi arabistan',
    'umre ziyareti',
    'hac ziyareti',
  ],
  
  // Mekke anahtar kelimeleri
  mekke: [
    'mekke otelleri',
    'mekke konaklama',
    'kabe yakını oteller',
    'mescid-i haram yakını',
    'taif kapısı otel',
    'fahita kapısı otel',
    'salam kapısı otel',
    'mekke gezilecek yerler',
    'mekke ziyaret yerleri',
    'cebeli nur',
    'hira magarasi',
    'sevr magarasi',
    'arafat',
    'mina',
    'muzdelife',
    'cemerat',
  ],
  
  // Medine anahtar kelimeleri
  medine: [
    'medine otelleri',
    'medine konaklama',
    'mescid-i nebevi yakını oteller',
    'ravza yakını oteller',
    'kuba camii yakını',
    'medine gezilecek yerler',
    'medine ziyaret yerleri',
    'kuba camii',
    'kıbleteyn camii',
    'uhud dagi',
    'sehitler mezarligi',
    'hura bahcesi',
    'medine hurmasi',
  ],
  
  // Otel anahtar kelimeleri
  otel: [
    'umre otel rezervasyonu',
    'hac otel rezervasyonu',
    'mekke otel',
    'medine otel',
    'kutsal yerler otel',
    '5 yıldızlı otel',
    'lüks konaklama',
    'ekonomik otel',
    'aileler için otel',
    'kabe manzaralı otel',
    'mescid yakını otel',
  ],
  
  // Transfer anahtar kelimeleri
  transfer: [
    'cemalan transferi',
    'havalimanı transfer',
    'mekke medine transfer',
    'vip transfer',
    'özel transfer',
    'grup transferi',
    'lüks araç kiralama',
    'şoförlü araç',
    'havalimanı karşılama',
    'otel transfer',
  ],
  
  // Rehber anahtar kelimeleri
  rehber: [
    'profesyonel rehber',
    'sertifikalı rehber',
    'türk rehber',
    'arapça rehber',
    'deneyimli rehber',
    'özel rehber',
    'grup rehberi',
    'aileler için rehber',
    'kutsal yerler rehberi',
    'tarihi yerler rehberi',
  ],
  
  // Tur anahtar kelimeleri
  tur: [
    'umre turu paketleri',
    'hac turu paketleri',
    'ekonomik umre turu',
    'lüks umre turu',
    '21 günlük umre turu',
    '30 günlük hac turu',
    'aileler için umre turu',
    'ramazan umresi',
    'ekonomik hac paketi',
    'her şey dahil umre',
    'mekke medine turu',
    'kutsal yerler turu',
  ],
} as const;

// Tur SEO anahtar kelimeleri (mevcut seo-slugs.ts'den)
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

// Araç tipleri SEO anahtar kelimeleri (mevcut seo-slugs.ts'den)
export const VEHICLE_SEO_KEYWORDS: Record<string, string[]> = {
  'sedan': ['sedan arac', 'ozel arac transfer', 'vip transfer', 'konforlu transfer'],
  'vito': ['mercedes vito', 'vito transfer', 'vito vip', 'luks vito'],
  'minibus': ['minibus transfer', 'grup transferi', 'kalabalik grup transferi'],
  'bus': ['otobus transfer', 'buyuk grup transferi', 'tur otobusu'],
};

// Meta description şablonları
export const META_TEMPLATES = {
  hotel: (name: string, city: string, stars?: number) => 
    `${name} - ${city} ${stars ? stars + ' yıldızlı' : ''} otel. Umre ve hac için konforlu konaklama, detaylı bilgi ve fiyatlar.`,
  
  guide: (name: string, specialties?: string[]) => 
    `${name} ile umre ve hac yolculuğunuzda profesyonel rehberlik hizmeti${specialties?.length ? '. ' + specialties.join(', ') : ''}. Sertifikalı rehber.`,
  
  tour: (name: string, duration?: number) => 
    `${name} - ${duration ? duration + ' günlük' : ''} umre hac turu. Konforlu seyahat, her şey dahil paket.`,
  
  place: (name: string, city: string) => 
    `${name} - ${city} gezilecek yerler. Kutsal yerler rehberi, detaylı bilgi ve ziyaret saatleri.`,
  
  transfer: (from: string, to: string, vehicleType?: string) => 
    `${from} - ${to} ${vehicleType || 'VIP'} transfer hizmeti. Güvenli, konforlu ve ekonomik transfer rezervasyonu.`,
  
  blog: (title: string, category?: string) => 
    `${title}${category ? ' | ' + category : ''} - Sefernur blog. Umre ve hac hakkında bilgilendirici yazılar.`,
  
  campaign: (name: string) => 
    `${name} - Sefernur kampanyaları. Umre ve hac turlarında özel indirim fırsatları.`,
  
  visa: (country: string) => 
    `${country} vize başvurusu. Hızlı, kolay ve güvenli vize işlemleri. Online başvuru.`,
} as const;

// Sayfa başlıkları şablonları
export const TITLE_TEMPLATES = {
  hotel: (name: string, city: string) => `${name} - ${city} Oteli | Sefernur`,
  guide: (name: string) => `${name} - Umre Hac Rehberi | Sefernur`,
  tour: (name: string) => `${name} - Umre Hac Turu | Sefernur`,
  place: (name: string, city: string) => `${name} - ${city} | Sefernur`,
  transfer: (from: string, to: string) => `${from} - ${to} Transfer | Sefernur`,
  blog: (title: string) => `${title} | Sefernur Blog`,
  campaign: (name: string) => `${name} | Sefernur Kampanyaları`,
  visa: (country: string) => `${country} Vize Başvurusu | Sefernur`,
} as const;

// Şehir slug'ları
export const CITY_SLUGS: Record<string, string> = {
  'Mekke': 'mekke',
  'Medine': 'medine',
  'Cidde': 'cidde',
  'Taif': 'taif',
  'Riyad': 'riyad',
  'Makkah': 'mekke',
  'Madinah': 'medine',
  'Jeddah': 'cidde',
  'Riyadh': 'riyad',
};

// Kategori slug'ları
export const CATEGORY_SLUGS: Record<string, string> = {
  'Umre Rehberi': 'umre-rehberi',
  'Hac Bilgileri': 'hac-bilgileri',
  'Seyahat İpuçları': 'seyahat-ipuclari',
  'Kutsal Yerler': 'kutsal-yerler',
  'Vize İşlemleri': 'vize-islemleri',
  'Konaklama': 'konaklama',
  'Ulaşım': 'ulasim',
};

// Schema.org yapılandırması için base URL'ler
export const SCHEMA_BASE_URL = 'https://sefernur.com';
export const SCHEMA_LOGO_URL = 'https://sefernur.com/logo.png';
export const SCHEMA_ORG_NAME = 'Sefernur';
export const SCHEMA_ORG_DESCRIPTION = 'Umre ve Hac seyahat platformu';

// Open Graph varsayılan görsel boyutları
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

// Twitter Card varsayılan tipi
export const TWITTER_CARD_TYPE = 'summary_large_image';
