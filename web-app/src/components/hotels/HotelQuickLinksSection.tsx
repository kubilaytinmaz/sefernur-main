"use client";

/**
 * Otel Hızlı Arama Bağlantıları Bölümü
 * SEO uyumlu, resimli kategori kartları ile responsive grid layout
 */

import { getSortedQuickLinks, type HotelQuickLinkCategory } from "@/lib/data/hotel-quick-links";
import { cn } from "@/lib/utils";
import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import type { HotelSearchFormParams } from "./HotelSearchForm";

export interface HotelQuickLinksSectionProps {
  onQuickSearch: (params: HotelSearchFormParams) => void;
  className?: string;
}

export function HotelQuickLinksSection({
  onQuickSearch,
  className,
}: HotelQuickLinksSectionProps) {
  const categories = getSortedQuickLinks();

  const handleCategoryClick = useCallback(
    (category: HotelQuickLinkCategory) => {
      const today = new Date();
      const checkIn = today.toISOString().split("T")[0];

      // Uzun süreli konaklama için 7 gün, diğerleri için 3 gün
      const isLongStay = category.id === "uzun-sureli";
      const dayCount = isLongStay ? 7 : 3;
      const checkOut = new Date(today.getTime() + dayCount * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const searchParams: HotelSearchFormParams = {
        cityCode: category.searchParams.cityCode ?? 164,
        countryCode: category.searchParams.countryCode,
        checkIn,
        checkOut,
        rooms: category.searchParams.rooms ?? [
          { adults: 2, children: 0, childAges: [] },
        ],
      };

      onQuickSearch(searchParams);
    },
    [onQuickSearch]
  );

  return (
    <section
      className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12",
        className
      )}
    >
      {/* Başlık */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Search className="w-4 h-4" />
          Hızlı Arama
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Popüler Otel Kategorileri
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          İhtiyacınıza uygun oteli hızlıca bulun. Kategorilere tıklayarak
          özel filtrelenmiş otel araması başlatın.
        </p>
      </div>

      {/* Kategori Grid */}
      <div
        role="list"
        aria-label="Otel arama kategorileri"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
      >
        {categories.map((category) => (
          <QuickLinkCard
            key={category.id}
            category={category}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>

      {/* SEO İçerik Bloğu */}
      <div className="mt-12 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-3">
          Umre Otelleri Hakkında
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Mekke ve Medine&apos;de Harem-i Şerif&apos;e yakın otellerde konaklama imkanı sunuyoruz.
          Ekonomik otel seçeneklerinden 5 yıldızlı lüks otellere, aile odalarından uzun süreli
          konaklama paketlerine kadar geniş bir yelpazede hizmet veriyoruz. Kabe manzaralı odalar,
          çocuk dostu tesisler ve uygun fiyatlı umre otelleri için hemen arama yapabilirsiniz.
          Tüm otellerimiz güvenli rezervasyon garantisi ile sunulmaktadır.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-block text-xs bg-white text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors cursor-default"
            >
              {cat.title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────── Tek Kategori Kartı ────────── */

interface QuickLinkCardProps {
  category: HotelQuickLinkCategory;
  onClick: () => void;
}

function QuickLinkCard({ category, onClick }: QuickLinkCardProps) {
  const Icon = category.icon;

  return (
    <button
      type="button"
      role="listitem"
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl border-2 border-slate-200",
        "hover:border-emerald-400 hover:shadow-2xl",
        "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
        "cursor-pointer overflow-hidden text-left",
        "focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500",
        "h-[200px] md:h-[220px]"
      )}
      aria-label={`${category.title} - ${category.description}`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/20 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-5">
        {/* Icon Badge */}
        <div className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300 shadow-lg">
          <Icon
            className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:scale-110"
            strokeWidth={2}
          />
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-base md:text-lg font-bold text-white leading-tight group-hover:text-emerald-100 transition-colors duration-300">
            {category.title}
          </h3>
          <p className="text-xs md:text-sm text-white/90 line-clamp-2 leading-snug">
            {category.description}
          </p>
        </div>

        {/* Arrow Button */}
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300">
          <span>Ara</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
        </div>
      </div>

      {/* SEO keywords (hidden) */}
      <span className="sr-only">
        {category.seoKeywords.join(", ")}
      </span>
    </button>
  );
}

/* ────────── Skeleton Loading ────────── */

export function HotelQuickLinksSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="h-8 bg-slate-200 rounded-full w-32 mx-auto mb-4 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded-lg w-64 mx-auto mb-3 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-96 mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-100 rounded-2xl h-[200px] md:h-[220px] animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
