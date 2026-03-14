/**
 * Transfer Rezervasyon Sayfası
 * SEO uyumlu Türkçe URL: /transfer-rezervasyon/[slug]/[tourSlug]
 * Çoklu tur desteği: ?extraTours=id1,id2,id3
 */

"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { TourDetailModal } from "@/components/transfers/TourDetailModal";
import { BookingFormCard, MultiTourSummaryCard, PriceSummaryCard, VehicleInfoCard } from "@/components/transfers/booking";
import { usePopularServiceById, usePopularTours } from "@/hooks/usePopularServices";
import { getTransferById } from "@/lib/firebase/domain";
import { parseSlugWithId } from "@/lib/transfers/booking";
import type { PriceBreakdown } from "@/types/booking";
import type { PopularServiceModel } from "@/types/popular-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function BookingPageClient() {
  // Next.js URL hook'ları
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL'den slug'ları ve query param'ları parse et (useMemo ile ilk render'da çalışır)
  const urlData = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    // /transfer-rezervasyon/[slug]/[tourSlug]
    const vehicleSlug = segments.length >= 2 ? segments[1] || "" : "";
    const tourSlug = segments.length >= 3 ? segments[2] || "" : "";
    
    // Query param'dan ek turları al: ?extraTours=id1,id2,id3
    const extraToursParam = searchParams.get("extraTours");
    const extraTourIds = extraToursParam
      ? extraToursParam.split(",").filter(Boolean)
      : [];
    
    return { vehicleSlug, tourSlug, extraTourIds };
  }, [pathname, searchParams]);

  // URL'den ID'leri çıkar
  const { id: transferId } = parseSlugWithId(urlData.vehicleSlug);
  const { id: tourId } = parseSlugWithId(urlData.tourSlug);

  // State
  const [currentPrice, setCurrentPrice] = useState<PriceBreakdown | null>(null);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [selectedTourIndex, setSelectedTourIndex] = useState(0);
  const [passengerCount, setPassengerCount] = useState(1);

  // Transfer verisi
  const transferQuery = useQuery({
    queryKey: ["transfer", transferId],
    queryFn: () => getTransferById(transferId),
    enabled: !!transferId,
  });

  const transfer = transferQuery.data;

  // Ana tur verisi (Local JSON)
  const { data: mainTour } = usePopularServiceById(tourId);

  // Ek turların verileri (Local JSON)
  const { data: allServices } = usePopularTours();
  const extraTours = useMemo(() => {
    if (!allServices) return [];
    return urlData.extraTourIds
      .map(id => allServices.find(s => s.id === id))
      .filter(Boolean) as PopularServiceModel[];
  }, [urlData.extraTourIds, allServices]);

  // Tüm turlar (ana tur + ek turlar)
  const allTours = useMemo(() => {
    if (!mainTour) return extraTours;
    return [mainTour, ...extraTours];
  }, [mainTour, extraTours]);

  // Tur isimleri özeti
  const tourNamesSummary = useMemo(() => {
    if (allTours.length === 0) return "";
    if (allTours.length === 1) return allTours[0].name;
    return allTours.map(t => t.name).join(" + ");
  }, [allTours]);

  // Loading state
  if (transferQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Rezervasyon sayfası yükleniyor" description="Lütfen bekleyin..." />
      </div>
    );
  }

  // Error state
  if (transferQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Bir hata oluştu"
          description="Transfer bilgileri yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
          onRetry={() => transferQuery.refetch()}
        />
      </div>
    );
  }

  // Empty state
  if (!transfer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState
          title="Transfer bulunamadı"
          description="Bu transfer artık mevcut değil veya kaldırılmış olabilir."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/transferler"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Transferlere Dön
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Transfer Rezervasyonu</h1>
              <p className="text-xs text-slate-500">
                {transfer.vehicleName}{tourNamesSummary ? ` + ${tourNamesSummary}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Info */}
            <VehicleInfoCard vehicle={transfer} />

            {/* Tours Info - Çoklu tur gösterimi */}
            {allTours.length > 0 && (
              <MultiTourSummaryCard
                tours={allTours}
                onShowTourDetail={(tour) => {
                  const index = allTours.findIndex(t => t.id === tour.id);
                  setSelectedTourIndex(index);
                  setTourModalOpen(true);
                }}
                passengerCount={passengerCount}
              />
            )}

            {/* Price Summary */}
            {currentPrice && (
              <PriceSummaryCard
                price={currentPrice}
                passengerCount={passengerCount}
                tourName={allTours.length > 1 ? `${allTours.length} Tur Paketi` : tourNamesSummary}
                tourCount={allTours.length}
              />
            )}
          </div>

          {/* Right Column - Booking Form (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingFormCard
                transfer={transfer}
                tour={mainTour ?? undefined}
                extraTours={extraTours}
                onPriceChange={setCurrentPrice}
                onPassengerChange={setPassengerCount}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tour Detail Modal */}
      {allTours.length > 0 && (
        <TourDetailModal
          open={tourModalOpen}
          onClose={() => setTourModalOpen(false)}
          service={allTours[selectedTourIndex]}
        />
      )}
    </div>
  );
}

