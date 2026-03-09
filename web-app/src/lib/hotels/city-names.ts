/**
 * Şehir isimleri Türkçeleştirme
 * 
 * WebBeds API'den gelen şehir isimlerini Türkçe formatına dönüştürür.
 */

/**
 * Türkçe şehir isimleri
 */
export const CITY_NAMES_TR: Record<number, string> = {
  164: 'Mekke',
  174: 'Medine',
  // Diğer şehirler için genişletilebilir
  1: 'İstanbul',
  2: 'Ankara',
  3: 'İzmir',
};

/**
 * İngilizce şehir isimleri (orijinal)
 */
export const CITY_NAMES_EN: Record<number, string> = {
  164: 'Makkah',
  174: 'Madinah',
  1: 'Istanbul',
  2: 'Ankara',
  3: 'Izmir',
};

/**
 * Şehir isimleri eşleştirme tablosu (isim bazlı)
 */
export const CITY_NAME_MAPPING: Record<string, string> = {
  // Mekke varyasyonları
  'makkah': 'Mekke',
  'mecca': 'Mekke',
  'makkah al mukarramah': 'Mekke',
  
  // Medine varyasyonları
  'madinah': 'Medine',
  'medina': 'Medine',
  'al madinah al munawwarah': 'Medine',
  
  // Diğer şehirler
  'istanbul': 'İstanbul',
  'ankara': 'Ankara',
  'izmir': 'İzmir',
};

/**
 * Şehir kodundan isim al
 */
export function getCityName(cityCode: number, locale: 'tr' | 'en' = 'tr'): string {
  const map = locale === 'tr' ? CITY_NAMES_TR : CITY_NAMES_EN;
  return map[cityCode] || 'Bilinmeyen Şehir';
}

/**
 * Şehir ismini Türkçeleştir
 */
export function turkishifyCityName(cityName: string): string {
  if (!cityName) return cityName;
  
  const normalized = cityName.toLowerCase().trim();
  
  // Eşleştirme tablosundan kontrol et
  if (CITY_NAME_MAPPING[normalized]) {
    return CITY_NAME_MAPPING[normalized];
  }
  
  // Varsayılan: İlk harfi büyüt
  return cityName.charAt(0).toUpperCase() + cityName.slice(1);
}

/**
 * Şehir kodu biliniyorsa direkt Türkçe isim döndür
 */
export function formatCityName(cityName: string, cityCode?: number): string {
  // Önce şehir kodundan kontrol et
  if (cityCode && CITY_NAMES_TR[cityCode]) {
    return CITY_NAMES_TR[cityCode];
  }
  
  // Yoksa isimden Türkçeleştir
  return turkishifyCityName(cityName);
}
