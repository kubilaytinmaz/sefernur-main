/**
 * Para Birimi Formatlama ve Dönüşüm
 * 
 * Transfer ve tur fiyatları USD cinsindedir.
 * Bu modül USD → TL dönüşümü ve formatlama sağlar.
 * 
 * Döviz kuru kaynakları (öncelik sırasına göre):
 * 1. NEXT_PUBLIC_USD_TRY_RATE env variable
 * 2. Firestore cache (exchange-rates.ts tarafından güncellenir)
 * 3. Fallback sabit kur
 */

const fallbackUsdTryRate = 38;

function getUsdTryRate(): number {
  const parsed = Number(process.env.NEXT_PUBLIC_USD_TRY_RATE);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallbackUsdTryRate;
}

// ═════════════════════════════════════════════════════════════════
// Formatters
// ═════════════════════════════════════════════════════════════════

const tlFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// ═════════════════════════════════════════════════════════════════
// USD Functions (Yeni)
// ═════════════════════════════════════════════════════════════════

/**
 * TL değerini TL/USD formatında gösterir
 * @param valueTl - TL cinsinden değer
 * @returns "₺2.500 / $66" formatında string
 */
export function formatTlUsdPairFromTl(valueTl: number): string {
  if (!(valueTl > 0)) return "Teklif al";
  const rate = getUsdTryRate();
  const valueUsd = valueTl / rate;
  return `${tlFormatter.format(valueTl)} / ${usdFormatter.format(valueUsd)}`;
}

/**
 * USD değerini TL/USD formatında gösterir
 * @param valueUsd - USD cinsinden değer
 * @returns "₺2.500 / $66" formatında string
 */
export function formatTlUsdPairFromUsd(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Teklif al";
  const rate = getUsdTryRate();
  const valueTl = valueUsd * rate;
  return `${tlFormatter.format(valueTl)} / ${usdFormatter.format(valueUsd)}`;
}

/**
 * TL ve USD değerlerini birlikte formatlar
 * @param valueTl - TL cinsinden değer
 * @param valueUsd - USD cinsinden değer
 * @returns "₺2.500 / $66" formatında string
 */
export function formatTlUsdPair(valueTl: number, valueUsd: number): string {
  if (!(valueTl > 0) || !(valueUsd > 0)) return "Teklif al";
  return `${tlFormatter.format(valueTl)} / ${usdFormatter.format(valueUsd)}`;
}

/**
 * USD değerini TL'ye çevirir
 * @param valueUsd - USD cinsinden değer
 * @returns TL cinsinden değer
 */
export function usdToTry(valueUsd: number): number {
  if (!(valueUsd > 0)) return 0;
  const rate = getUsdTryRate();
  return valueUsd * rate;
}

/**
 * USD değerini TL formatında gösterir
 * @param valueUsd - USD cinsinden değer
 * @returns "2.500₺" formatında string
 */
export function formatUsdAsTry(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Teklif al";
  const valueTl = usdToTry(valueUsd);
  return tlFormatter.format(valueTl);
}

/**
 * USD değerini "$X'den" formatında gösterir
 * @param valueUsd - USD cinsinden değer
 * @returns "$66'den" formatında string
 */
export function formatUsdAsStartingPrice(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Teklif al";
  return `${usdFormatter.format(valueUsd)}'den`;
}

// ═════════════════════════════════════════════════════════════════
// SAR Functions (Deprecated - Geriye dönük uyumluluk için)
// ═════════════════════════════════════════════════════════════════

/**
 * @deprecated USD kullanın. SAR desteği kaldırılacak.
 * SAR değerini TL'ye çevirir
 */
export function sarToTry(valueSar: number): number {
  if (!(valueSar > 0)) return 0;
  // 1 SAR ≈ 0.267 USD (yaklaşık 3.75 SAR = 1 USD)
  const sarToUsdRate = 0.267;
  const valueUsd = valueSar * sarToUsdRate;
  return usdToTry(valueUsd);
}

/**
 * @deprecated USD kullanın. SAR desteği kaldırılacak.
 * SAR değerini TL formatında gösterir
 */
export function formatSarAsTry(valueSar: number): string {
  if (!(valueSar > 0)) return "Teklif al";
  const valueTl = sarToTry(valueSar);
  return tlFormatter.format(valueTl);
}

/**
 * @deprecated formatTlUsdPair kullanın. SAR desteği kaldırılacak.
 * TL/SAR formatında fiyat gösterir
 */
export function formatTlSarPair(valueTl: number, valueSar: number): string {
  if (!(valueTl > 0) || !(valueSar > 0)) return "Teklif al";
  // SAR'ı USD'ye çevirip göster
  const valueUsd = valueSar * 0.267;
  return `${tlFormatter.format(valueTl)} / ${usdFormatter.format(valueUsd)}`;
}

/**
 * @deprecated formatUsdAsStartingPrice kullanın. SAR desteği kaldırılacak.
 * SAR değerini "X SAR'den" formatında gösterir
 */
export function formatSarAsStartingPrice(valueSar: number): string {
  if (!(valueSar > 0)) return "Teklif al";
  // SAR'ı USD'ye çevirip göster
  const valueUsd = valueSar * 0.267;
  return formatUsdAsStartingPrice(valueUsd);
}

/**
 * @deprecated formatUsdAsStartingPrice kullanın. SAR desteği kaldırılacak.
 * USD değerini SAR formatında gösterir
 */
export function formatSarFromUsd(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Teklif al";
  // USD'yi SAR'a çevir (yaklaşık)
  const valueSar = valueUsd * 3.75;
  const sarFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  });
  return sarFormatter.format(valueSar);
}
