"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { getActiveTours } from "@/lib/firebase/domain";
import { ServiceType, TourCategory, TourModel } from "@/types/tour";
import { useQuery } from "@tanstack/react-query";
import {
    BookOpen,
    Building2,
    CalendarDays,
    Clock3,
    Heart,
    Landmark,
    Moon,
    Plane,
    Search,
    SlidersHorizontal,
    Star,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const categoryLabels: Record<TourCategory, string> = {
  umrah: "Umre",
  hajj: "Hac",
  religious: "Dini",
  cultural: "Kültürel",
  historical: "Tarihi",
};

const serviceTypeLabels: Record<ServiceType, string> = {
  with_transport: "Ulaşım Dahil",
  without_transport: "Ulaşımsız",
  flight_included: "Uçak Dahil",
  custom: "Özel Paket",
};

const durationOptions = [
  { value: "all", label: "Tüm Süreler" },
  { value: "1-7", label: "1-7 Gün" },
  { value: "8-14", label: "8-14 Gün" },
  { value: "15-21", label: "15-21 Gün" },
  { value: "22+", label: "22+ Gün" },
];

function CategoryIcon({ category, className }: { category: TourCategory; className?: string }) {
  const icons: Record<string, typeof Building2> = {
    umrah: Building2,
    hajj: Building2,
    religious: Heart,
    cultural: Landmark,
    historical: BookOpen,
  };
  const Icon = icons[category] ?? Building2;
  return <Icon className={className} />;
}

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<"all" | TourCategory>("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [serviceType, setServiceType] = useState<"all" | ServiceType>("all");

  const toursQuery = useQuery({
    queryKey: ["tours", "active"],
    queryFn: () => getActiveTours(),
  });

  const filteredTours = useMemo(() => {
    const items = toursQuery.data ?? [];
    const normalized = searchQuery.trim().toLowerCase();

    return items.filter((tour) => {
      // Category filter
      if (category !== "all" && tour.category !== category) return false;

      // Service type filter
      if (serviceType !== "all" && tour.serviceType !== serviceType) return false;

      // Duration filter
      if (durationFilter !== "all") {
        const days = tour.durationDays ?? 0;
        if (durationFilter === "1-7" && (days < 1 || days > 7)) return false;
        if (durationFilter === "8-14" && (days < 8 || days > 14)) return false;
        if (durationFilter === "15-21" && (days < 15 || days > 21)) return false;
        if (durationFilter === "22+" && days < 22) return false;
      }

      // Text search
      if (normalized) {
        return [tour.title, tour.description, tour.company]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      }

      return true;
    });
  }, [category, durationFilter, searchQuery, serviceType, toursQuery.data]);

  const hasActiveFilters = category !== "all" || durationFilter !== "all" || serviceType !== "all" || searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,#065f4620,transparent_50%),radial-gradient(circle_at_80%_20%,#0891b220,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              {filteredTours.length} Tur Bulundu
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            Umre & Hac Turları
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl text-lg">
            Huzur dolu bir yolculuk için en uygun tur paketlerini keşfedin.
          </p>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tur adı, firma veya açıklama ara..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              value={category}
              onChange={(event) => setCategory(event.target.value as "all" | TourCategory)}
              className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Tüm Kategoriler</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value as "all" | ServiceType)}
              className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Hizmet Tipi</option>
              {Object.entries(serviceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={durationFilter}
              onChange={(event) => setDurationFilter(event.target.value)}
              className="h-10 min-w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCategory("all");
                  setDurationFilter("all");
                  setServiceType("all");
                }}
                className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* Tour Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {toursQuery.isLoading ? (
          <LoadingState title="Turlar yükleniyor" description="Aktif tur kayıtları getiriliyor..." />
        ) : null}

        {toursQuery.isError ? (
          <ErrorState
            title="Turlar alınamadı"
            description="Lütfen bağlantınızı kontrol edip tekrar deneyin."
            onRetry={() => toursQuery.refetch()}
          />
        ) : null}

        {!toursQuery.isLoading && !toursQuery.isError && filteredTours.length === 0 ? (
          <EmptyState
            title="Sonuç bulunamadı"
            description="Arama kriterlerinizi değiştirip tekrar deneyebilirsiniz."
          />
        ) : null}

        {!toursQuery.isLoading && !toursQuery.isError && filteredTours.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTours.map((tour: TourModel) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ────────── Tour Card ────────── */

function TourCard({ tour }: { tour: TourModel }) {
  const firstImage = tour.images?.[0];
  const totalNights = (tour.mekkeNights ?? 0) + (tour.medineNights ?? 0);

  return (
    <Link href={`/tours/${tour.id}`}>
      <Card className="group overflow-hidden border-slate-200 bg-white hover:border-emerald-300 transition-colors duration-200 cursor-pointer h-full">
        {/* Image Section */}
        <div className="relative h-52 overflow-hidden bg-slate-100">
          {firstImage ? (
            <img
              src={firstImage}
              alt={tour.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50">
              <Building2 className="w-12 h-12 text-emerald-300" />
            </div>
          )}

          {/* Overlay Badges */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {/* Top badges row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-1.5">
              {tour.isPopular ? (
                <Badge className="bg-amber-500 text-white border-0 text-[11px] gap-1">
                  <Star className="w-3 h-3 fill-white" /> Popüler
                </Badge>
              ) : null}
              {tour.category ? (
                <Badge className="bg-white/90 text-slate-800 border-0 text-[11px] backdrop-blur-sm gap-1">
                  <CategoryIcon category={tour.category} className="w-3 h-3" />
                  {categoryLabels[tour.category]}
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Bottom - Nights Badge */}
          {totalNights > 0 ? (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-emerald-600 text-white border-0 text-[11px] gap-1">
                <Moon className="w-3 h-3" />
                {tour.mekkeNights ? `Mekke ${tour.mekkeNights}` : ""}
                {tour.mekkeNights && tour.medineNights ? " · " : ""}
                {tour.medineNights ? `Medine ${tour.medineNights}` : ""}
                {" "}Gece
              </Badge>
            </div>
          ) : null}

          {/* Bottom right - Duration */}
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-white/90 text-slate-800 border-0 text-[11px] backdrop-blur-sm gap-1">
              <Clock3 className="w-3 h-3" /> {tour.durationDays || 0} Gün
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {tour.title}
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 min-h-10">
            {tour.description || "Tur detayları için tıklayın."}
          </p>

          {/* Info Row */}
          <div className="mt-3 flex flex-wrap gap-2">
            {tour.company ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {tour.company}
              </div>
            ) : null}
            {tour.startDate ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                {tour.startDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </div>
            ) : null}
            {tour.airline ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Plane className="w-3.5 h-3.5 text-slate-400" />
                {tour.airline}
              </div>
            ) : null}
          </div>

          {/* Rating + Price Row */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
            <div className="flex items-center gap-1">
              {(tour.rating ?? 0) > 0 ? (
                <>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {(tour.rating ?? 0).toFixed(1)}
                  </span>
                  {(tour.reviewCount ?? 0) > 0 ? (
                    <span className="text-xs text-slate-400">({tour.reviewCount})</span>
                  ) : null}
                </>
              ) : (
                <span className="text-xs text-slate-400">Yeni</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Başlangıç</p>
              <p className="text-lg font-bold text-emerald-700 leading-tight">
                {formatTlUsdPairFromTl(tour.basePrice)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
