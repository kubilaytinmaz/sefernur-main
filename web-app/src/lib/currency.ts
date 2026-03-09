const fallbackUsdTryRate = 38;
const fallbackUsdSarRate = 3.75; // 1 USD = 3.75 SAR

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
