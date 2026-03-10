/**
 * SEO Slug Generator
 * Türkçe karakterleri destekleyen SEO uyumlu slug oluşturma fonksiyonları
 */

import { STOP_WORDS, TURKISH_CHAR_MAP, URL_LIMITS } from './constants';
import type { SlugOptions } from './types';

/**
 * Türkçe karakterleri İngilizce karşılıklarına dönüştür
 * Örnek: "Çağlayan" -> "Caglayan"
 */
export function turkishToEnglish(text: string): string {
  return text.split('').map(char => TURKISH_CHAR_MAP[char] || char).join('');
}

/**
 * Metni SEO uyumlu slug'a dönüştür
 * 
 * @param text - Slug'a dönüştürülecek metin
 * @param options - Slug oluşturma seçenekleri
 * @returns SEO uyumlu slug
 * 
 * @example
 * createSlug("Mekke Şehir Turu") // "mekke-sehir-turu"
 * createSlug("Çağlayan Hotel", { maxLength: 30 }) // "caglayan-hotel"
 * createSlug("Otel ve Konaklama", { removeStopWords: true }) // "otel-konaklama"
 */
export function createSlug(text: string, options?: SlugOptions): string {
  // Türkçe karakter dönüşümü
  let slug = turkishToEnglish(text);
  
  // Küçük harfe çevir (varsayılan)
  if (options?.lowercase !== false) {
    slug = slug.toLowerCase();
  }
  
  // Trim
  slug = slug.trim();
  
  // Stop words kaldır
  if (options?.removeStopWords) {
    slug = slug.split('-').filter(word => !STOP_WORDS.has(word)).join('-');
  }
  
  // Özel karakterleri kaldır (sadece harf, rakam, tire ve alt çizgi kalır)
  slug = slug.replace(/[^\w\s-]/g, '');
  
  // Boşlukları ve alt çizgileri tireye dönüştür
  slug = slug.replace(/[\s_-]+/g, '-');
  
  // Baştaki ve sondaki tireleri kaldır
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Maksimum uzunluk
  const maxLength = options?.maxLength || URL_LIMITS.maxSlugLength;
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-[^-]*$/, '');
  }
  
  return slug;
}

/**
 * ID'yi slug'a güvenli şekilde ekler
 * 
 * @param text - Slug'a dönüştürülecek metin
 * @param id - Eklenecek ID
 * @param options - Slug oluşturma seçenekleri
 * @returns ID'li slug
 * 
 * @example
 * createSlugWithId("Clock Hotel", "abc123") // "clock-hotel-abc123"
 */
export function createSlugWithId(text: string, id: string, options?: SlugOptions): string {
  const slug = createSlug(text, options);
  return `${slug}-${id}`;
}

/**
 * Slug'dan ID'yi çıkarır
 * 
 * @param slug - ID'li slug
 * @returns ID
 * 
 * @example
 * extractIdFromSlug("clock-hotel-abc123") // "abc123"
 */
export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1] || slug;
}

/**
 * Slug'dan ID'siz temel slug'ı çıkarır
 * 
 * @param slug - ID'li slug
 * @returns ID'siz slug
 * 
 * @example
 * extractBaseSlug("clock-hotel-abc123") // "clock-hotel"
 */
export function extractBaseSlug(slug: string): string {
  const parts = slug.split('-');
  parts.pop(); // ID'yi kaldır
  return parts.join('-');
}

/**
 * Şehir adını slug'a dönüştürür
 * 
 * @param cityName - Şehir adı
 * @returns Şehir slug'ı
 * 
 * @example
 * createCitySlug("Mekke") // "mekke"
 * createCitySlug("Makkah") // "mekke" (İngilizce'den Türkçe'ye)
 */
export function createCitySlug(cityName: string): string {
  // Şehir adı eşlemeleri
  const cityMap: Record<string, string> = {
    'makkah': 'mekke',
    'makka': 'mekke',
    'mecca': 'mekke',
    'madinah': 'medine',
    'medina': 'medine',
    'jeddah': 'cidde',
    'jiddah': 'cidde',
    'taif': 'taif',
    'riyadh': 'riyad',
    'riyad': 'riyad',
  };
  
  const normalized = cityName.toLowerCase().trim();
  
  // Eşleşme varsa kullan
  if (cityMap[normalized]) {
    return cityMap[normalized];
  }
  
  // Yoksa normal slug oluştur
  return createSlug(cityName);
}

/**
 * Kategori adını slug'a dönüştürür
 * 
 * @param categoryName - Kategori adı
 * @returns Kategori slug'ı
 */
export function createCategorySlug(categoryName: string): string {
  const categoryMap: Record<string, string> = {
    'umre rehberi': 'umre-rehberi',
    'hac bilgileri': 'hac-bilgileri',
    'seyahat ipuclari': 'seyahat-ipuclari',
    'seyahat ipuçları': 'seyahat-ipuclari',
    'kutsal yerler': 'kutsal-yerler',
    'vize islemleri': 'vize-islemleri',
    'konaklama': 'konaklama',
    'ulasim': 'ulasim',
  };
  
  const normalized = categoryName.toLowerCase().trim();
  
  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }
  
  return createSlug(categoryName);
}

/**
 * URL'nin SEO uyumlu olup olmadığını kontrol eder
 * 
 * @param url - Kontrol edilecek URL
 * @returns URL SEO uyumlu mu?
 */
export function isValidSeoUrl(url: string): boolean {
  // URL boş olmamalı
  if (!url || url.trim().length === 0) {
    return false;
  }
  
  // URL çok uzun olmamalı
  if (url.length > URL_LIMITS.maxUrlLength) {
    return false;
  }
  
  // URL sadece güvenli karakterler içermeli
  const safeUrlPattern = /^[a-z0-9-_/]+$/;
  if (!safeUrlPattern.test(url.replace(/\//g, ''))) {
    return false;
  }
  
  return true;
}

/**
 * Birden fazla kelimeyi slug'a dönüştürür
 * 
 * @param words - Kelime dizisi
 * @param options - Slug oluşturma seçenekleri
 * @returns Birleştirilmiş slug
 * 
 * @example
 * createSlugFromWords(["Mekke", "Şehir", "Turu"]) // "mekke-sehir-turu"
 */
export function createSlugFromWords(words: string[], options?: SlugOptions): string {
  return createSlug(words.join(' '), options);
}

/**
 * Slug'ı okunabilir formata dönüştürür (başlık için)
 * 
 * @param slug - Slug
 * @returns Okunabilir başlık
 * 
 * @example
 * slugToTitle("mekke-sehir-turu") // "Mekke Şehir Turu"
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Slug'ı normalize eder (duplicate tire'leri temizler)
 * 
 * @param slug - Temizlenecek slug
 * @returns Normalize edilmiş slug
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/-+/g, '-') // Birden fazla tireyi tek tireye
    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
}

/**
 * Benzersiz slug oluşturur (var olan slug'ları kontrol ederek)
 * 
 * @param baseText - Temel metin
 * @param existingSlugs - Mevcut slug'lar
 * @param options - Slug oluşturma seçenekleri
 * @returns Benzersiz slug
 */
export function createUniqueSlug(
  baseText: string,
  existingSlugs: string[],
  options?: SlugOptions
): string {
  let slug = createSlug(baseText, options);
  let counter = 1;
  let uniqueSlug = slug;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
}
