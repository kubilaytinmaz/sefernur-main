/**
 * UpcomingUmrahTours Component
 *
 * UmreDunyasi'dan yaklaşan umre turlarını gösteren widget.
 * SEO dostu: canonical URL, nofollow link, schema markup içerir.
 *
 * Modern tasarım: Featured hero card + compact grid layout
 * Glassmorphism efektleri, holografik shimmer, floating elements
 *
 * @example
 * ```tsx
 * import { UpcomingUmrahTours } from '@/components/tours/UpcomingUmrahTours';
 *
 * export default function ToursPage() {
 *   return (
 *     <div>
 *       <UpcomingUmrahTours limit={6} />
 *     </div>
 *   );
 * }
 * ```
 */

"use client";

import { CompactTourCard } from "@/components/tours/CompactTourCard";
import { useUpcomingTours } from "@/hooks/useUmredunyasiTours";
import "@/styles/animations.css";
import Link from "next/link";
import Script from "next/script";
import { useMemo } from "react";

/**
 * Component props
 */
export interface UpcomingUmrahToursProps {
  /** Getirilecek tur sayısı (varsayılan: 6) */
  limit?: number;
  /** Başlık gösterilsin mi */
  showTitle?: boolean;
  /** "Tümünü Gör" linki gösterilsin mi */
  showViewAll?: boolean;
  /** Özel başlık */
  title?: string;
  /** Özel açıklama */
  description?: string;
  /** CSS class name */
  className?: string;
}

/**
 * Yaklaşan Umre Turları Widget Bileşeni
 */
export function UpcomingUmrahTours({
  limit = 6,
  showTitle = true,
  showViewAll = true,
  title,
  description,
  className = "",
}: UpcomingUmrahToursProps) {
  const { data, isLoading, isError, isFetched } = useUpcomingTours(limit);

  const tours = data?.data || [];

  // Schema.org JSON-LD oluştur
  const schema = useMemo(() => {
    if (tours.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title || "Yaklaşan Umre Turları",
      description:
        description ||
        "UmreDunyasi güvencesiyle yaklaşan umre turları. En uygun fiyatlı umre paketleri.",
      itemListElement: tours.map((tour, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Trip",
          name: tour.title,
          description: tour.description,
          offers: {
            "@type": "Offer",
            price: tour.price,
            priceCurrency: tour.priceCurrency,
            availability: tour.isSoldOut
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
          },
          provider: {
            "@type": "Organization",
            name: tour.firm.name,
          },
          startDate: tour.startDate,
          endDate: tour.endDate,
        },
      })),
    };
  }, [tours, title, description]);

  // Loading state
  if (isLoading) {
    return <LoadingState showTitle={showTitle} className={className} />;
  }

  // Error state - widget'ı gizle (fallback)
  if (isError || !isFetched) {
    return null;
  }

  // Empty state - widget'ı gizle
  if (tours.length === 0) {
    return null;
  }

  return (
    <section className={`py-10 ${className}`}>
      {/* Schema.org JSON-LD */}
      {schema && (
        <Script
          id="umrah-tours-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {/* Header - Modern Design */}
      {showTitle && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Islamic Pattern Accent */}
            <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {title || "Yaklaşan Umre Turları"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {description || "En uygun fiyatlı paketleri keşfedin"}
              </p>
            </div>
          </div>
          {showViewAll && (
            <Link
              href="/tours"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 font-medium text-sm transition-all duration-300 border border-emerald-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10"
            >
              Tümünü Gör
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Tours Layout - 5 Card Horizontal Grid */}
      {tours.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tours.slice(0, 5).map((tour, index) => (
            <CompactTourCard key={tour.id} tour={tour} index={index} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Loading State Bileşeni
 */
function LoadingState({
  showTitle = true,
  className = "",
}: {
  showTitle?: boolean;
  className?: string;
}) {
  return (
    <section className={`py-8 ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-64 animate-pulse" />
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-80 bg-slate-100 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Export default
 */
export default UpcomingUmrahTours;
