const fallbackUsdTryRate = 38;
const fallbackUsdSarRate = 3.75; // 1 USD = 3.75 SAR
const fallbackSarTryRate = 10; // 1 SAR = 10 TL

function getUsdTryRate(): number {
  const parsed = Number(process.env.NEXT_PUBLIC_USD_TRY_RATE);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallbackUsdTryRate;
}

function getUsdSarRate(): number {
  const parsed = Number(process.env.NEXT_PUBLIC_USD_SAR_RATE);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallbackUsdSarRate;
}

function getSarTryRate(): number {
  const parsed = Number(process.env.NEXT_PUBLIC_SAR_TRY_RATE);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallbackSarTryRate;
}

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

const sarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

export function formatTlUsdPairFromTl(valueTl: number): string {
  if (!(valueTl > 0)) return "Teklif al";
  const rate = getUsdTryRate();
  const valueUsd = valueTl / rate;
  return `${tlFormatter.format(valueTl)} / ${usdFormatter.format(valueUsd)}`;
}

export function formatTlUsdPairFromUsd(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Teklif al";
  const rate = getUsdTryRate();
  const valueTl = valueUsd * rate;
  return `${tlFormatter.format(valueTl)} / ${usdFormatter.format(valueUsd)}`;
}

export function formatSarFromUsd(valueUsd: number): string {
  if (!(valueUsd > 0)) return "Teklif al";
  const rate = getUsdSarRate();
  const valueSar = valueUsd * rate;
  return sarFormatter.format(valueSar);
}

/**
 * SAR değerini TL'ye çevirir
 * @param valueSar - SAR cinsinden değer
 * @returns TL cinsinden değer
 */
export function sarToTry(valueSar: number): number {
  if (!(valueSar > 0)) return 0;
  const rate = getSarTryRate();
  return valueSar * rate;
}

/**
 * SAR değerini TL formatında gösterir
 * @param valueSar - SAR cinsinden değer
 * @returns "2.500₺" formatında string
 */
export function formatSarAsTry(valueSar: number): string {
  if (!(valueSar > 0)) return "Teklif al";
  const valueTl = sarToTry(valueSar);
  return tlFormatter.format(valueTl);
}

/**
 * TL/SAR formatında fiyat gösterir (Popüler Turlar formatı)
 * @param valueTl - TL cinsinden değer
 * @param valueSar - SAR cinsinden değer
 * @returns "₺2.500 / 250 SAR" formatında string
 */
export function formatTlSarPair(valueTl: number, valueSar: number): string {
  if (!(valueTl > 0) || !(valueSar > 0)) return "Teklif al";
  return `${tlFormatter.format(valueTl)} / ${sarFormatter.format(valueSar)}`;
}

/**
 * SAR değerini "X SAR'den" formatında gösterir
 * @param valueSar - SAR cinsinden değer
 * @returns "230 SAR'den" formatında string
 */
export function formatSarAsStartingPrice(valueSar: number): string {
  if (!(valueSar > 0)) return "Teklif al";
  return `${sarFormatter.format(valueSar)}'den`;
}
