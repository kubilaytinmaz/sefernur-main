"use client";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouteId } from "@/hooks/useRouteId";
import { getPlaceById, getPlacesByCity } from "@/lib/firebase/domain";
import { getStaticPlaceById, getStaticPlacesByCity, placeSEOKeywords } from "@/lib/places/places-data";
import { placeCityLabels } from "@/types/place";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

/* ────────── Main Page ────────── */

export default function PlaceDetailPage() {
  const placeId = useRouteId();

  // Önce statik veriden bak
  const staticPlace = placeId ? getStaticPlaceById(placeId) : undefined;

  // Statik veri yoksa Firebase'e düş
  const placeQuery = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => getPlaceById(placeId),
    enabled: !!placeId && !staticPlace,
  });

  const place = staticPlace ?? placeQuery.data;

  // İlişkili yerler: Statik veriden çek
  const staticRelated = place
    ? getStaticPlacesByCity(place.city).filter((p) => p.id !== placeId)
    : [];

  // Statik ilişkili yer yoksa Firebase'e düş
  const relatedQuery = useQuery({
    queryKey: ["places", "related", place?.city],
    queryFn: () => getPlacesByCity(place!.city, 10),
    enabled: !!place?.city && staticRelated.length === 0,
  });

  const relatedPlaces =
    staticRelated.length > 0
      ? staticRelated
      : (relatedQuery.data ?? []).filter((p) => p.id !== placeId);

  if (!staticPlace && placeQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState
          title="Yer yükleniyor"
          description="Detaylar getiriliyor..."
        />
      </div>
    );
  }

  if (!staticPlace && placeQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Yer yüklenemedi"
          description="Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onRetry={() => placeQuery.refetch()}
        />
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState
          title="Yer bulunamadı"
          description="Bu yer artık mevcut değil veya kaldırılmış olabilir."
        />
      </div>
    );
  }

  const cityLabel = placeCityLabels[place.city] ?? place.city;
  const isMekke = place.city === "mekke";

  // SEO keywords based on city - statik veriden çek
  const seoKeywords = placeSEOKeywords[place.city] ?? (isMekke
    ? ["Umre", "Hac", "Kabe", "Tavaf", "Harem", "Mekke", "İhram", "Safa Merve"]
    : ["Medine", "Mescid-i Nebevi", "Ravza", "Peygamber", "Uhud", "Kıble", "Ashab"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/places"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-700 transition-all hover:gap-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{cityLabel} Gezilecek Yerler</span>
        </Link>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={place.images} title={place.title} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column — Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Badge */}
            <div className="relative">
              {/* Aurora background for title */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className={`absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br ${isMekke ? 'from-amber-100/40 via-orange-100/20' : 'from-emerald-100/40 via-cyan-100/20'} to-transparent rounded-full blur-3xl`} />
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`${isMekke ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} border gap-1.5 px-3 py-1.5`}>
                  <MapPin className="w-3.5 h-3.5" />
                  {cityLabel}
                </Badge>
                {seoKeywords.slice(0, 3).map((keyword, i) => (
                  <Badge key={i} className="bg-slate-100 text-slate-600 border-slate-200 border text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4 leading-tight">
                {place.title}
              </h1>
              
              {place.shortDescription && (
                <p className="mt-3 text-slate-600 text-lg md:text-xl leading-relaxed border-l-4 border-emerald-500 pl-4 py-2">
                  {place.shortDescription}
                </p>
              )}
            </div>

            {/* Long Description - SEO Enhanced */}
            {place.longDescription && (
              <Card className={`${isMekke ? 'border-amber-100 bg-gradient-to-br from-amber-50/50 to-white' : 'border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white'} shadow-md`}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${isMekke ? 'bg-amber-500' : 'bg-emerald-500'} flex items-center justify-center`}>
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isMekke ? 'Mekke Ziyaret Rehberi' : 'Medine Ziyaret Rehberi'}
                    </h3>
                  </div>
                  <div className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {place.longDescription}
                  </div>
                  
                  {/* SEO Keywords Section */}
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2 font-medium">İlgili Anahtar Kelimeler:</p>
                    <div className="flex flex-wrap gap-2">
                      {seoKeywords.map((keyword, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Images (thumbnail grid) */}
            {place.images.length > 1 && (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5 md:p-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">
                    Fotoğraflar
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {place.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={img}
                          alt={`${place.title} - ${i + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5">
            {/* Location Card - Enhanced */}
            {place.locationUrl && (
              <Card className={`${isMekke ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'} shadow-md`}>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isMekke ? 'text-amber-600' : 'text-emerald-600'}`} />
                    Konum Bilgisi
                  </h3>
                  <a
                    href={place.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${isMekke ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white text-sm font-medium transition-all w-full justify-center shadow-md hover:shadow-lg cursor-pointer`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Haritada Göster
                  </a>
                </CardContent>
              </Card>
            )}

            {/* City Info - Enhanced */}
            <Card className={`${isMekke ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'} shadow-md`}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Compass className={`w-4 h-4 ${isMekke ? 'text-amber-600' : 'text-emerald-600'}`} />
                  {isMekke ? 'Mekke Bilgileri' : 'Medine Bilgileri'}
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Şehir</span>
                    <span className="font-medium text-slate-900">
                      {cityLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tür</span>
                    <span className="font-medium text-slate-900">
                      {isMekke ? 'Kutsal Şehir' : 'Peygamber Şehri'}
                    </span>
                  </div>
                  {place.createdAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Eklenme</span>
                      <span className="text-slate-700">
                        {place.createdAt.toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Keywords Card */}
            <Card className={`${isMekke ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'} shadow-md`}>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${isMekke ? 'text-amber-600' : 'text-emerald-600'}`} />
                  Popüler Aramalar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((keyword, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Explore link */}
            <Card className={`${isMekke ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'} shadow-md`}>
              <CardContent className="p-5">
                <Link
                  href="/places"
                  className={`inline-flex items-center gap-2 text-sm ${isMekke ? 'text-amber-700 hover:text-amber-800' : 'text-emerald-700 hover:text-emerald-800'} font-medium cursor-pointer`}
                >
                  <Compass className="w-4 h-4" />
                  Tüm {cityLabel} Gezilecek Yerleri Gör
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Places - SEO Enhanced */}
      {relatedPlaces.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
          {/* Aurora Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className={`absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br ${isMekke ? 'from-amber-100/30 via-orange-100/20' : 'from-emerald-100/30 via-cyan-100/20'} to-transparent rounded-full blur-3xl`} />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-lg ${isMekke ? 'bg-amber-500' : 'bg-emerald-500'} flex items-center justify-center`}>
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {cityLabel}&apos;de Diğer Gezilecek Yerler
              </h2>
              <p className="text-sm text-slate-600">
                {isMekke ? 'Mekke umre ve hac ziyaretinizde görmeniz gerekenler' : 'Medine peygamber şehrinde ziyaret edilecek yerler'}
              </p>
            </div>
          </div>

          <div
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
          >
            {relatedPlaces.map((rp) => {
              const img = rp.images?.[0];
              return (
                <Link
                  key={rp.id}
                  href={`/places/${rp.id}`}
                  className="relative min-w-[200px] md:min-w-[240px] h-64 rounded-2xl overflow-hidden snap-start shrink-0 group shadow-md hover:shadow-xl transition-all cursor-pointer"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={`${rp.title} - ${cityLabel} gezilecek yer`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${isMekke ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-cyan-600'}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="text-white font-semibold line-clamp-2 drop-shadow-md">
                      {rp.title}
                    </h4>
                    {rp.shortDescription && (
                      <p className="text-white/80 text-xs mt-1 line-clamp-2 drop-shadow-sm">
                        {rp.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ────────── Image Gallery ────────── */

function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = images.length > 0;

  const goTo = useCallback(
    (direction: "prev" | "next") => {
      if (!hasImages) return;
      setCurrentIndex((prev) => {
        if (direction === "prev")
          return prev === 0 ? images.length - 1 : prev - 1;
        return prev === images.length - 1 ? 0 : prev + 1;
      });
    },
    [hasImages, images.length]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-64 sm:h-80 md:h-96">
        {hasImages ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentIndex
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-4 right-4">
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
                {currentIndex + 1} / {images.length}
              </Badge>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-emerald-200 mx-auto" />
              <p className="mt-2 text-sm text-slate-400">
                Görsel henüz eklenmedi
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
