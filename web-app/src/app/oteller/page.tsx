import type { Metadata } from "next";
import { Suspense } from "react";
import OtellerPageClient from "./_client";

export const metadata: Metadata = {
  title: "Umre Otelleri - Mekke ve Medine Otel Rezervasyonu | Sefernur",
  description: "Mekke ve Medine'de Harem'e yakın oteller. Ekonomik, lüks, aile odaları ve daha fazlası. En uygun fiyatlarla umre otel rezervasyonu yapın. Hemen inceleyin!",
  keywords: [
    "umre oteli",
    "mekke otel",
    "medine otel",
    "harem yakın otel",
    "ekonomik umre oteli",
    "lüks umre oteli",
    "aile odası umre",
    "kabe yakını otel",
    "ravza yakını otel",
    "çocuklu aile otel",
    "harem manzaralı otel",
    "uzun süreli konaklama",
    "umre konaklama",
    "mekke rezervasyon",
    "medine rezervasyon"
  ],
  openGraph: {
    title: "Umre Otelleri - Mekke ve Medine Otel Rezervasyonu",
    description: "Mekke ve Medine'de en uygun otelleri keşfedin. Ekonomik ve lüks seçenekler ile hemen rezervasyon yapın.",
    type: "website",
    locale: "tr_TR",
    siteName: "Sefernur"
  },
  twitter: {
    card: "summary_large_image",
    title: "Umre Otelleri - Mekke ve Medine Otel Rezervasyonu",
    description: "Mekke ve Medine'de en uygun otelleri keşfedin"
  },
  alternates: {
    canonical: "/oteller"
  }
};

export default function OtellerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <OtellerPageClient />
    </Suspense>
  );
}
