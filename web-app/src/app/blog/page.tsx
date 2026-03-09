"use client";

import {
    EmptyState,
    ErrorState,
    LoadingState,
} from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getActivePlaces } from "@/lib/firebase/domain";
import {
    placeCityLabels,
    type PlaceCity,
    type PlaceModel,
} from "@/types/place";
import { useQuery } from "@tanstack/react-query";
import { Compass, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const CITY_FILTERS: { value: "all" | PlaceCity; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "mekke", label: "Mekke" },
  { value: "medine", label: "Medine" },
];

export default function PlacesPage() {
  const [cityFilter, setCityFilter] = useState<"all" | PlaceCity>("all");

  const {
    data: places,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["places-all"],
    queryFn: () => getActivePlaces(100),
  });

  const filtered = useMemo(() => {
    if (!places) return [];
    if (cityFilter === "all") return places;
    return places.filter((p) => p.city === cityFilter);
  }, [places, cityFilter]);

  const mekkePlaces = useMemo(
    () => (places ?? []).filter((p) => p.city === "mekke"),
    [places]
  );
  const medinePlaces = useMemo(
    () => (places ?? []).filter((p) => p.city === "medine"),
    [places]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <Badge className="bg-white/15 border-white/25 text-white mb-4">
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            Keşfet
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight">
            Gezilecek Yerler
          </h1>
          <p className="mt-3 text-emerald-100 max-w-xl text-lg">
            Mekke ve Medine&apos;deki kutsal mekanları, tarihi yerleri ve
            ziyaret noktalarını keşfedin.
          </p>

          {/* Stats */}
          {places && places.length > 0 && (
            <div className="mt-6 flex gap-6">
              <div>
                <span className="text-2xl font-bold">{mekkePlaces.length}</span>
                <span className="text-emerald-200 text-sm ml-1.5">
                  Mekke noktası
                </span>
              </div>
              <div>
                <span className="text-2xl font-bold">
                  {medinePlaces.length}
                </span>
                <span className="text-emerald-200 text-sm ml-1.5">
                  Medine noktası
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* City Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="flex gap-2">
          {CITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCityFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                cityFilter === f.value
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
              {f.value !== "all" && places && (
                <span className="ml-1.5 opacity-70">
                  (
                  {f.value === "mekke"
                    ? mekkePlaces.length
                    : medinePlaces.length}
                  )
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {isLoading ? (
          <LoadingState title="Yerler yükleniyor" />
        ) : error ? (
          <ErrorState title="Yerler yüklenemedi" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Henüz yer eklenmemiş"
            description="Yakında Mekke ve Medine'deki ziyaret noktaları burada listelenecektir."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PlaceCard({ place }: { place: PlaceModel }) {
  const cityLabel = placeCityLabels[place.city] ?? place.city;
  const imgSrc = place.images?.[0];

  return (
    <Link href={`/places/${place.id}`} className="block">
      <Card className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow group h-full">
        <div className="relative h-52 bg-slate-200">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={place.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
              <MapPin className="w-10 h-10 text-emerald-400" />
            </div>
          )}
          <Badge className="absolute top-3 left-3 bg-white/90 text-slate-800 border-0 text-xs shadow">
            <MapPin className="w-3 h-3 mr-1" />
            {cityLabel}
          </Badge>
        </div>

        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">
            {place.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-3">
            {place.shortDescription}
          </p>

          {place.locationUrl && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Detayları Gör
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
