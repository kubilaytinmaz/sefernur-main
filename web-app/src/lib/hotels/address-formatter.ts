/**
 * Otel adresi formatlama modülü
 * 
 * WebBeds API'den gelen ham adresleri kullanıcı dostu,
 * Türkçe ve bilinir bölge isimleriyle formatlar.
 * 
 * Kullanıcı Tercihi: "Ajyad Mekke" (virgülsüz, basit format)
 * 
 * @see plans/hotel-address-localization-plan.md
 */

import { formatCityName, getCityName } from './city-names';
import { findRegionInAddress } from './location-mapping';

/* ────────── Types ────────── */

export interface FormattedAddress {
  /** Gösterilecek kısa adres */
  displayAddress: string;
  /** Bölge adı (varsa) */
  region?: string;
  /** Şehir adı Türkçe */
  city: string;
  /** Tam adres (tooltip için) */
  fullAddress: string;
}

/* ────────── Temizleme Kuralları ────────── */

/** Kaldırılacak gereksiz bilgiler */
const REMOVE_PATTERNS = [
  // Google Plus kodları (9VX9+MJ9 gibi)
  /\b[A-Z0-9]{4,}\+[A-Z0-9]+\b/gi,
  // Adres numaraları (başta veya tek başına duran 3-5 haneli sayılar)
  /^\d{3,5}\s+/,
  // Posta kodları (5 haneli sayılar)
  /\b\d{5}(\s+\d{4})?\b/g,
  // Ülke adları
  /\b(saudi arabia|saudi|ksa)\b/gi,
  // Şehir adları (tüm pozisyonlarda)
  /\b(makkah|madinah|mecca|medina)\b/gi,
];

/* ────────── Helper Functions ────────── */

/**
 * Adres metnini temizle - posta kodu, ülke vb. kaldır
 */
function cleanAddress(address: string): string {
  let cleaned = address;
  
  // Kaldırma desenlerini uygula
  for (const pattern of REMOVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Fazla virgülleri temizle
  cleaned = cleaned.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
  
  // Fazla boşlukları temizle
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Cadde/sokak isimlerini temizle (çeviri yapmadan)
 */
function cleanStreetName(street: string): string {
  // Sadece fazla boşlukları temizle
  return street.replace(/\s+/g, ' ').trim();
}

/**
 * Adres parçalarını analiz et ve bölge/cadde/şehir ayır
 */
function parseAddressParts(address: string, cityCode: number): {
  street?: string;
  region?: string;
  city: string;
} {
  const cleaned = cleanAddress(address);
  const region = findRegionInAddress(cleaned, cityCode);
  
  // Bölge bulunduysa - sadece bölge adını döndür, artıkları at
  if (region) {
    return {
      region: region.displayName,
      city: getCityName(cityCode, 'tr'),
    };
  }
  
  // Bölge bulunamadıysa, temizlenmiş adresi kullan
  const streetPart = cleanStreetName(cleaned);
  
  // Eğer sadece şehir adı kaldıysa, boş street döndür
  if (streetPart.toLowerCase() === 'makkah' ||
      streetPart.toLowerCase() === 'madinah' ||
      streetPart.toLowerCase() === 'mecca' ||
      streetPart.toLowerCase() === 'medina') {
    return {
      city: getCityName(cityCode, 'tr'),
    };
  }
  
  return {
    street: streetPart,
    city: getCityName(cityCode, 'tr'),
  };
}

/**
 * Formatlanmış adres oluştur
 *
 * Öncelik sırası (Kullanıcı Tercihi: Virgülsüz):
 * 1. "Bölge Şehir" - en basit ve anlaşılır
 * 2. "Cadde Şehir" - bölge yoksa ve cadde varsa
 * 3. "Şehir" - sadece şehir bilgisi varsa
 */
function buildDisplayAddress(
  street: string | undefined,
  region: string | undefined,
  city: string
): string {
  // Bölge varsa, sadece bölge + şehir döndür
  if (region) {
    return `${region} ${city}`;
  }
  
  // Bölge yoksa, cadde + şehir döndür
  if (street && street.length > 3 && street !== city) {
    return `${street} ${city}`;
  }
  
  // Sadece şehir döndür
  return city;
}

/* ────────── Main Export ────────── */

/**
 * API'den gelen adresi kullanıcı dostu formata çevirir
 * 
 * @example
 * formatHotelAddress("Ajyad, Makkah 24231, Saudi Arabia", 164)
 * // { displayAddress: "Ajyad Mekke", region: "Ajyad", city: "Mekke", fullAddress: "Ajyad, Makkah 24231, Saudi Arabia" }
 *
 * @example
 * formatHotelAddress("Al Masjid Al Haram Rd. Al Aziziah, Makkah", 164)
 * // { displayAddress: "Al Masjid Al Haram Rd. Alaziziyyah Mekke", region: "Alaziziyyah", city: "Mekke", ... }
 *
 * @example
 * formatHotelAddress("MAKKAH", 164)
 * // { displayAddress: "Mekke", city: "Mekke", fullAddress: "MAKKAH" }
 */
export function formatHotelAddress(
  rawAddress: string,
  cityCode: number
): FormattedAddress {
  // Boş adres kontrolü
  if (!rawAddress || rawAddress.trim() === '') {
    return {
      displayAddress: getCityName(cityCode, 'tr'),
      city: getCityName(cityCode, 'tr'),
      fullAddress: '',
    };
  }
  
  // Sadece şehir adı mı kontrol et (örn: "MAKKAH")
  const upperAddress = rawAddress.toUpperCase().trim();
  if (upperAddress === 'MAKKAH' || upperAddress === 'MADINAH' || 
      upperAddress === 'MECCA' || upperAddress === 'MEDINA') {
    const cityName = formatCityName(rawAddress, cityCode);
    return {
      displayAddress: cityName,
      city: cityName,
      fullAddress: rawAddress,
    };
  }
  
  // Adres parçalarını analiz et
  const { street, region, city } = parseAddressParts(rawAddress, cityCode);
  
  // Formatlanmış adres oluştur
  const displayAddress = buildDisplayAddress(street, region, city);
  
  return {
    displayAddress,
    region,
    city,
    fullAddress: rawAddress,
  };
}

/**
 * Basit adres formatı - sadece bölge + şehir
 * 
 * @example
 * formatSimpleAddress("Ajyad, Makkah 24231, Saudi Arabia", 164)
 * // "Ajyad Mekke"
 */
export function formatSimpleAddress(rawAddress: string, cityCode: number): string {
  const formatted = formatHotelAddress(rawAddress, cityCode);
  return formatted.displayAddress;
}

/**
 * Şehir adını Türkçe formatla
 * 
 * @example
 * formatCityOnly("MAKKAH", 164) // "Mekke"
 * formatCityOnly("Makkah", 164) // "Mekke"
 */
export function formatCityOnly(cityName: string, cityCode?: number): string {
  return formatCityName(cityName, cityCode);
}
