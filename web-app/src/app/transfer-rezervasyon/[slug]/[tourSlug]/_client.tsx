/**
 * Transfer Rezervasyon Sayfası
 * SEO uyumlu Türkçe URL: /transfer-rezervasyon/[slug]/[tourSlug]
 */

"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { TourDetailModal } from "@/components/transfers/TourDetailModal";
import { BookingFormCard, PriceSummaryCard, TourInfoCard, VehicleInfoCard } from "@/components/transfers/booking";
import { getTransferById } from "@/lib/firebase/domain";
import { parseSlugWithId } from "@/lib/transfers/booking";
import { getServiceById } from "@/lib/transfers/popular-services-simple";
import type { PriceBreakdown } from "@/types/booking";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BookingPageClient() {
  // URL'den slug'ları al
  const [vehicleSlug, setVehicleSlug] = useState("");
  const [tourSlug, setTourSlug] = useState("");

  // URL'den ID'leri çıkar
  const { id: transferId } = parseSlugWithId(vehicleSlug);
  const { id: tourId } = parseSlugWithId(tourSlug);

  // State
  const [currentPrice, setCurrentPrice] = useState<PriceBreakdown | null>(null);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  // URL'den slug'ları oku
  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    // /transfer-rezervasyon/[slug]/[tourSlug]
    if (segments.length >= 3 && segments[0] === "transfer-rezervasyon") {
      setVehicleSlug(segments[1] || "");
      setTourSlug(segments[2] || "");
    }
  }, []);

  // Transfer verisi
  const transferQuery = useQuery({
    queryKey: ["transfer", transferId],
    queryFn: () => getTransferById(transferId),
    enabled: !!transferId,
  });

  const transfer = transferQuery.data;

  // Tur verisi (client-side)
  const tour = tourId ? getServiceById(tourId) : undefined;

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
                {transfer.vehicleName} {tour ? `+ ${tour.name}` : ""}
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

            {/* Tour Info */}
            {tour && <TourInfoCard tour={tour} onShowDetail={() => setTourModalOpen(true)} />}

            {/* Price Summary */}
            {currentPrice && (
              <PriceSummaryCard
                price={currentPrice}
                passengerCount={1}
                tourName={tour?.name}
              />
            )}
          </div>

          {/* Right Column - Booking Form (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingFormCard
                transfer={transfer}
                tour={tour}
                onPriceChange={setCurrentPrice}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tour Detail Modal */}
      {tour && (
        <TourDetailModal
          open={tourModalOpen}
          onClose={() => setTourModalOpen(false)}
          service={tour}
        />
      )}
    </div>
  );
}

