import { getAllStaticPlaces, getStaticPlaceById, placeSEOKeywords } from "@/lib/places/places-data";
import { Metadata } from "next";
import PlaceDetailPage from "./_client";

// Geliştirme modunda dinamik routing için
export const dynamic = "force-dynamic";

// Statik params - tüm statik place ID'lerini oluştur
export function generateStaticParams() {
  const places = getAllStaticPlaces();
  return places.map((place) => ({
    placeId: place.id,
  }));
}

// Dinamik metadata oluşturma - Next.js 15 Promise params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ placeId: string }>;
}): Promise<Metadata> {
  const { placeId } = await params;
  const place = getStaticPlaceById(placeId);

  if (!place) {
    return {
      title: "Yer Bulunamadı",
      description: "Aradığınız yer bulunamadı.",
    };
  }

  const cityLabel = place.city === "mekke" ? "Mekke" : "Medine";
  const keywords = placeSEOKeywords[place.city] ?? [];

  return {
    title: `${place.title} - ${cityLabel} Gezilecek Yerler`,
    description: place.shortDescription || place.longDescription?.slice(0, 160),
    keywords: [
      ...keywords,
      cityLabel,
      "gezilecek yerler",
      "ziyaret",
      "umre",
      "hac",
    ],
    openGraph: {
      title: `${place.title} - ${cityLabel} Gezilecek Yerler`,
      description: place.shortDescription || place.longDescription?.slice(0, 160),
      type: "article",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${place.title} - ${cityLabel} Gezilecek Yerler`,
      description: place.shortDescription || place.longDescription?.slice(0, 160),
    },
    alternates: {
      canonical: `/places/${place.id}`,
    },
  };
}

export default function Page() {
  return <PlaceDetailPage />;
}
