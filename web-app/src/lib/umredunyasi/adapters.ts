/**
 * UmreDunyasi Data Adapters
 *
 * UmreDunyasi API verilerini Sefernur formatına dönüştürür
 * ve yardımcı fonksiyonları sağlar.
 */

import { UMREDUNYASI_CONFIG } from "./constants";
import type {
    SefernurTourPreview,
    UmreDunyasiCategory,
    UmreDunyasiTour,
} from "./types";

/**
 * UmreDunyasi tur verisini Sefernur önizleme formatına dönüştürür
 *
 * @param udTour - UmreDunyasi API'den gelen tur verisi
 * @returns Sefernur'da kullanılacak basitleştirilmiş tur verisi
 */
export function toSefernurTourPreview(
  udTour: UmreDunyasiTour
): SefernurTourPreview {
  return {
    id: udTour.id,
    slug: udTour.slug,
    title: udTour.title,
    description: udTour.description,
    price: Number(udTour.price),
    priceCurrency: udTour.priceCurrency,
    startDate: new Date(udTour.startDate),
    endDate: new Date(udTour.endDate),
    duration: udTour.duration,
    hotelStars: udTour.hotelStars,
    hotelMakkah: udTour.hotelMakkah,
    hotelMadinah: udTour.hotelMadinah,
    makkahNights: udTour.makkahNights,
    madinahNights: udTour.madinahNights,
    images: udTour.images,
    firm: udTour.firm,
    categories: udTour.categories.map((tc) => tc.category),
    isFeatured: udTour.isFeatured,
    isSoldOut: udTour.isSoldOut,
  };
}

/**
 * UmreDunyasi tur slug'ından tam URL oluşturur
 *
 * @param slug - Tur slug'ı
 * @returns UmreDunyasi'deki tur detay sayfası URL'i
 *
 * @example
 * getTourUrl('ekonomik-umre-2026-mart')
 * // => 'https://umredunyasi.com/tours/ekonomik-umre-2026-mart'
 */
export function getTourUrl(slug: string): string {
  return `${UMREDUNYASI_CONFIG.siteURL}/tours/${slug}`;
}

/**
 * UmreDunyasi firma slug'ından tam URL oluşturur
 *
 * @param slug - Firma slug'ı
 * @returns UmreDunyasi'deki firma sayfası URL'i
 */
export function getFirmUrl(slug: string): string {
  return `${UMREDUNYASI_CONFIG.siteURL}/firms/${slug}`;
}

/**
 * Tur özelliklerine göre Sefernur'a özel not oluşturur
 * SEO için özgün içerik sağlar
 *
 * @param tour - Tur verisi
 * @returns Sefernur notı (varsa), yoksa null
 */
export function getSefernurNote(tour: SefernurTourPreview): string | null {
  // 21+ günlük uzun turlar
  if (tour.duration >= 21) {
    return "21+ günlük uzun turlarda daha fazla ibadet vakti. Vize işlemleri için erken başvurun.";
  }

  // Lüks oteller (5 yıldız)
  if (tour.hotelStars && tour.hotelStars >= 5) {
    return "Lüks otellerde konforlu konaklama. Harem manzaralı odalar için erken rezervasyon önerilir.";
  }

  // Kısa Mekke konaklaması (≤3 gece)
  if (tour.makkahNights && tour.makkahNights <= 3) {
    return "Kısa Mekke konaklaması. Tavaf ve ibadetler için zamanlama önemli.";
  }

  // Ekonomik turlar (düşük fiyat)
  if (tour.price < 50000) {
    // TRY cinsinden 50k altı
    return "Ekonomik fiyatlı tur. Öğle yemekleri dahil olmayabilir, ayrıntılar için kontrol edin.";
  }

  // Sold out turlar
  if (tour.isSoldOut) {
    return "Bu tur tükendi. Benzer turlar için liste kontrol edin.";
  }

  // Varsayılan: Not yok
  return null;
}

/**
 * Tura ait toplam gece sayısını hesaplar
 *
 * @param tour - Tur verisi
 * @returns Toplam gece sayısı
 */
export function getTotalNights(tour: SefernurTourPreview): number {
  return (tour.makkahNights ?? 0) + (tour.madinahNights ?? 0);
}

/**
 * Tur kategorilerini düz string array'e dönüştürür
 *
 * @param categories - Kategori listesi
 * @returns Kategori isimleri
 */
export function getCategoryNames(
  categories: UmreDunyasiCategory[]
): string[] {
  return categories.map((c) => c.name);
}

/**
 * İlk resim URL'ini alır, yoksa placeholder döner
 *
 * @param images - Resim URL'leri
 * @returns İlk resim veya placeholder
 */
export function getFirstImageOrPlaceholder(images: string[]): string {
  return images[0] || "/placeholder-tour.jpg";
}

/**
 * Tarihi Türkçe formatta string'e çevirir
 *
 * @param date - Date nesnesi
 * @returns Türkçe tarih string'i (örn: "15 Mar 2026")
 */
export function formatTurkishDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Kısa Türkçe tarih formatı (gün + ay)
 *
 * @param date - Date nesnesi veya ISO string
 * @returns Kısa tarih (örn: "15 Mar")
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}
