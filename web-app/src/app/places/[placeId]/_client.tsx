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
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  MapPin,
  Sparkles,
  Star
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
    <div className="min-h-screen bg-slate-50">
      {/* Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/places"
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" />
          <span className="text-sm font-medium text-slate-700">{cityLabel} Yerleri</span>
        </Link>
      </div>

      {/* Hero Image Gallery */}
      <ImageGallery images={place.images} title={place.title} isMekke={isMekke} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column — Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section with Glass Effect */}
            <div className="relative">
              {/* Aurora background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className={`absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br ${isMekke ? 'from-amber-200/40 via-orange-200/20' : 'from-emerald-200/40 via-cyan-200/20'} to-transparent rounded-full blur-3xl animate-pulse`} />
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={`${isMekke ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-emerald-500 to-cyan-600'} text-white border-0 gap-1.5 px-4 py-2 shadow-md`}>
                  <MapPin className="w-3.5 h-3.5" />
                  {cityLabel}
                </Badge>
                {seoKeywords.slice(0, 3).map((keyword, i) => (
                  <Badge key={i} className="bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition-all cursor-pointer text-xs px-3 py-1.5 shadow-sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-4 leading-tight">
                {place.title}
              </h1>
              
              {place.shortDescription && (
                <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-l-2xl" />
                  <p className="text-slate-700 text-lg leading-relaxed pl-4">
                    {place.shortDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Long Description - Modern Card */}
            {place.longDescription && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${isMekke ? 'from-amber-500 via-orange-500 to-amber-500' : 'from-emerald-500 via-cyan-500 to-emerald-500'}`} />
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl ${isMekke ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-cyan-600'} flex items-center justify-center shadow-lg`}>
                      <Compass className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {isMekke ? 'Mekke Ziyaret Rehberi' : 'Medine Ziyaret Rehberi'}
                      </h3>
                      <p className="text-sm text-slate-500">Detaylı bilgi ve tarihi arka plan</p>
                    </div>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                    {place.longDescription}
                  </div>
                  
                  {/* SEO Keywords Section */}
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm font-semibold text-slate-700">İlgili Anahtar Kelimeler</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {seoKeywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Gallery Grid */}
            {place.images.length > 1 && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Fotoğraf Galerisi</h3>
                      <p className="text-sm text-slate-500">{place.images.length} görsel</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {place.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer shadow-md hover:shadow-xl transition-all"
                      >
                        <Image
                          src={img}
                          alt={`${place.title} - ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm font-medium">Görsel {i + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5">
            {/* Location Card - Glass Effect */}
            {place.locationUrl && (
              <Card className={`${isMekke ? 'border-amber-200' : 'border-emerald-200'} shadow-xl overflow-hidden group`}>
                <div className={`h-1.5 bg-gradient-to-r ${isMekke ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-cyan-500'} group-hover:scale-x-105 transition-transform origin-left`} />
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${isMekke ? 'bg-amber-100' : 'bg-emerald-100'} flex items-center justify-center`}>
                      <MapPin className={`w-5 h-5 ${isMekke ? 'text-amber-600' : 'text-emerald-600'}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Konum</h3>
                  </div>
                  <a
                    href={place.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl ${isMekke ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700'} text-white font-medium transition-all shadow-lg hover:shadow-xl cursor-pointer`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Haritada Göster
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Quick Info Card */}
            <Card className={`${isMekke ? 'border-amber-200' : 'border-emerald-200'} shadow-xl overflow-hidden`}>
              <div className={`h-1.5 bg-gradient-to-r ${isMekke ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-cyan-500'}`} />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className={`w-10 h-10 rounded-xl ${isMekke ? 'bg-amber-100' : 'bg-emerald-100'} flex items-center justify-center`}>
                    <Compass className={`w-5 h-5 ${isMekke ? 'text-amber-600' : 'text-emerald-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Hızlı Bilgi</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Şehir</span>
                    </div>
                    <span className="font-semibold text-slate-900">{cityLabel}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Tür</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {isMekke ? 'Kutsal Şehir' : 'Peygamber Şehri'}
                    </span>
                  </div>
                  {place.createdAt && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Eklenme</span>
                      </div>
                      <span className="text-sm text-slate-700">
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

            {/* Popular Searches Card */}
            <Card className={`${isMekke ? 'border-amber-200' : 'border-emerald-200'} shadow-xl overflow-hidden`}>
              <div className={`h-1.5 bg-gradient-to-r ${isMekke ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-cyan-500'}`} />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${isMekke ? 'bg-amber-100' : 'bg-emerald-100'} flex items-center justify-center`}>
                    <Sparkles className={`w-5 h-5 ${isMekke ? 'text-amber-600' : 'text-emerald-600'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Popüler Aramalar</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Explore More Card */}
            <Card className={`${isMekke ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'} shadow-xl overflow-hidden`}>
              <CardContent className="p-6">
                <Link
                  href="/places"
                  className={`flex items-center gap-3 p-4 rounded-xl ${isMekke ? 'bg-amber-100 hover:bg-amber-200' : 'bg-emerald-100 hover:bg-emerald-200'} transition-colors cursor-pointer group`}
                >
                  <div className={`w-12 h-12 rounded-xl ${isMekke ? 'bg-amber-500' : 'bg-emerald-500'} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Tüm Yerleri Keşfet</p>
                    <p className="text-sm text-slate-600">{cityLabel}&apos;deki tüm gezilecek yerler</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Related Places - Modern Horizontal Scroll */}
      {relatedPlaces.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br ${isMekke ? 'from-amber-100/40 via-orange-100/20' : 'from-emerald-100/40 via-cyan-100/20'} to-transparent rounded-full blur-3xl`} />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${isMekke ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-cyan-500'} rounded-2xl blur-lg opacity-50`} />
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${isMekke ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-cyan-600'} flex items-center justify-center shadow-xl`}>
                <Compass className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                {cityLabel}&apos;de Diğer Yerler
              </h2>
              <p className="text-sm text-slate-600">
                {isMekke ? 'Mekke umre ve hac ziyaretinizde görmeniz gerekenler' : 'Medine peygamber şehrinde ziyaret edilecek yerler'}
              </p>
            </div>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {relatedPlaces.map((rp) => {
              const img = rp.images?.[0];
              return (
                <Link
                  key={rp.id}
                  href={`/places/${rp.id}`}
                  className="relative min-w-[240px] md:min-w-[280px] h-72 rounded-3xl overflow-hidden snap-start shrink-0 group shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={`${rp.title} - ${cityLabel} gezilecek yer`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${isMekke ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-cyan-600'}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${isMekke ? 'bg-amber-500' : 'bg-emerald-500'} text-white border-0 shadow-lg`}>
                      {placeCityLabels[rp.city]}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h4 className="text-white font-bold text-lg line-clamp-2 drop-shadow-md mb-2">
                      {rp.title}
                    </h4>
                    {rp.shortDescription && (
                      <p className="text-white/80 text-sm line-clamp-2 drop-shadow-sm">
                        {rp.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-white/90 text-sm font-medium">
                      <span>Detaylar</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
  isMekke,
}: {
  images: string[];
  title: string;
  isMekke: boolean;
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
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {hasImages ? (
        <>
          <img
            src={images[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo("prev")}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer border border-white/30 hover:scale-110 group"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => goTo("next")}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all cursor-pointer border border-white/30 hover:scale-110 group"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? `w-8 bg-gradient-to-r ${isMekke ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-cyan-500'}`
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Image counter badge */}
          <div className="absolute top-6 right-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg line-clamp-2">
              {title}
            </h1>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${isMekke ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-cyan-500'} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <p className="text-slate-500 font-medium">Görsel yakında eklenecek</p>
          </div>
        </div>
      )}
    </div>
  );
}
