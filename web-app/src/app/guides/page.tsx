"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { getActiveGuides } from "@/lib/firebase/domain";
import { GuideModel } from "@/types/guide";
import { useQuery } from "@tanstack/react-query";
import {
    Award,
    ChevronRight,
    Languages,
    MapPin,
    Search,
    SlidersHorizontal,
    Star,
    User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/* ────────── Filter options ────────── */

const SPECIALTY_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "hac", label: "Hac" },
  { value: "umre", label: "Umre" },
  { value: "vip", label: "VIP" },
  { value: "tarih", label: "Tarih" },
  { value: "kultur", label: "Kültür" },
  { value: "doga", label: "Doğa" },
  { value: "gastro", label: "Gastronomi" },
];

const LANGUAGE_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "İngilizce" },
  { value: "ar", label: "Arapça" },
  { value: "fr", label: "Fransızca" },
  { value: "de", label: "Almanca" },
  { value: "ru", label: "Rusça" },
  { value: "fa", label: "Farsça" },
  { value: "ur", label: "Urduca" },
];

/* ────────── Main Page ────────── */

export default function GuidesPage() {
  const [queryText, setQueryText] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const guidesQuery = useQuery({
    queryKey: ["guides", "active"],
    queryFn: () => getActiveGuides(),
  });

  const filteredGuides = useMemo(() => {
    const normalized = queryText.trim().toLowerCase();
    return (guidesQuery.data ?? []).filter((guide) => {
      // Text search
      if (
        normalized &&
        ![guide.name, guide.bio, guide.city, ...guide.specialties, ...guide.languages]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      ) {
        return false;
      }
      // Specialty filter
      if (
        selectedSpecialty &&
        !guide.specialties
          .map((s) => s.toLowerCase())
          .some((s) => s === selectedSpecialty || s.includes(selectedSpecialty))
      ) {
        return false;
      }
      // Language filter
      if (
        selectedLanguage &&
        !guide.languages
          .map((l) => l.toLowerCase())
          .some((l) => l === selectedLanguage || l.includes(selectedLanguage))
      ) {
        return false;
      }
      return true;
    });
  }, [guidesQuery.data, queryText, selectedSpecialty, selectedLanguage]);

  const hasActiveFilters = selectedSpecialty !== "" || selectedLanguage !== "" || queryText.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,#8b5cf620,transparent_50%),radial-gradient(circle_at_70%_80%,#c084fc20,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <User className="w-5 h-5 text-violet-700" />
            </div>
            <Badge className="bg-violet-50 text-violet-700 border border-violet-200 text-xs font-medium">
              {filteredGuides.length} Rehber Bulundu
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            Rehberler
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl text-lg">
            Dil, uzmanlık ve şehir bilgilerine göre profesyonel rehberleri karşılaştırın.
          </p>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="İsim, şehir veya uzmanlık ara..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-medium">Filtreler</span>
            </div>

            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === "" ? "Tüm Uzmanlıklar" : opt.label}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-10 min-w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === "" ? "Tüm Diller" : opt.label}
                </option>
              ))}
            </select>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQueryText("");
                  setSelectedSpecialty("");
                  setSelectedLanguage("");
                }}
                className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* States */}
        {guidesQuery.isLoading ? (
          <LoadingState title="Rehberler yükleniyor" description="Uygun rehber listesi getiriliyor..." />
        ) : null}

        {guidesQuery.isError ? (
          <ErrorState
            title="Rehber listesi alınamadı"
            description="Lütfen daha sonra tekrar deneyin."
            onRetry={() => guidesQuery.refetch()}
          />
        ) : null}

        {!guidesQuery.isLoading && !guidesQuery.isError && filteredGuides.length === 0 ? (
          <EmptyState
            title="Rehber bulunamadı"
            description="Arama terimini veya filtreleri değiştirerek tekrar deneyebilirsiniz."
          />
        ) : null}

        {/* Guide Cards */}
        {!guidesQuery.isLoading && !guidesQuery.isError && filteredGuides.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ────────── Guide Card ────────── */

function GuideCard({ guide }: { guide: GuideModel }) {
  const hasImage = guide.images.length > 0;

  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-violet-300 transition-colors cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100">
        {hasImage ? (
          <img
            src={guide.images[0]}
            alt={guide.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-violet-50 to-fuchsia-50">
            <User className="w-16 h-16 text-violet-200" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {guide.isPopular ? (
            <Badge className="bg-amber-500 text-white border-0 gap-1 text-xs">
              <Star className="w-3 h-3 fill-white" /> Popüler
            </Badge>
          ) : null}
          {guide.specialties.slice(0, 2).map((sp) => (
            <Badge key={sp} className="bg-white/90 text-violet-700 border-0 backdrop-blur-sm text-xs">
              {sp}
            </Badge>
          ))}
        </div>

        {/* Rating bottom-right */}
        {guide.rating > 0 ? (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm gap-1 text-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {guide.rating.toFixed(1)}
              {guide.reviewCount > 0 ? ` (${guide.reviewCount})` : ""}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">
            {guide.name}
          </h3>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 shrink-0 mt-1 transition-colors" />
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {guide.city ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              <MapPin className="w-3 h-3 text-violet-500" />
              {guide.city}
            </span>
          ) : null}
          {guide.languages.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              <Languages className="w-3 h-3 text-violet-500" />
              {guide.languages.slice(0, 3).join(", ")}
              {guide.languages.length > 3 ? ` +${guide.languages.length - 3}` : ""}
            </span>
          ) : null}
          {guide.yearsExperience > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              <Award className="w-3 h-3 text-violet-500" />
              {guide.yearsExperience} Yıl
            </span>
          ) : null}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Günlük Ücret</p>
            <p className="text-lg font-bold text-violet-700">
              {formatTlUsdPairFromTl(guide.dailyRate)}
            </p>
          </div>
          {guide.certifications.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <Award className="w-3 h-3" />
              Sertifikalı
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}


