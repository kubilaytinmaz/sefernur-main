"use client";

import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { PopularServicesSection } from "@/components/transfers";
import { TransferSearchForm } from "@/components/transfers/TransferSearchForm";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { getActiveTransfers } from "@/lib/firebase/domain";
import { POPULAR_SERVICES, type PopularService } from "@/lib/transfers/popular-services-simple";
import { calculateTransferPrice } from "@/lib/transfers/pricing";
import { createSlug } from "@/lib/transfers/seo-slugs";
import { displayAddress } from "@/types/address";
import { TransferModel, VehicleType, vehicleTypeLabels } from "@/types/transfer";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  Car,
  Clock3,
  MapPin,
  Star,
  Truck,
  Users
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

/* ────────── Vehicle Icon ────────── */

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "bus":
    case "coster":
      return <Truck className={className} />;
    default:
      return <Car className={className} />;
  }
}

/* ────────── Capacity Filter Options ────────── */

const capacityOptions = [
  { value: "all", label: "Tüm Kapasiteler" },
  { value: "1-4", label: "1-4 Kişi" },
  { value: "5-8", label: "5-8 Kişi" },
  { value: "9-15", label: "9-15 Kişi" },
  { value: "16+", label: "16+ Kişi" },
];

/* ────────── Main Page ────────── */

export default function TransfersPage() {
  // Seçili popüler hizmetler - çoklu seçim destekli
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const transfersQuery = useQuery({
    queryKey: ["transfers", "active"],
    queryFn: () => getActiveTransfers(),
  });

  const transfers = transfersQuery.data ?? [];

  // Arama formu gönderildiğinde (şimdilik sadece log)
  const handleSearch = (params: {
    routeId?: string;
    fromCity: string;
    toCity: string;
    pickupDate: Date;
    pickupTime: string;
    passengerCount: number;
    luggageCount: number;
    vehicleType?: VehicleType;
  }) => {
    console.log("Arama:", params);
  };

  // Popüler hizmet seçimi (çoklu seçim toggle)
  const handleServiceSelect = (serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds);
  };

  // Seçili hizmetleri al
  const selectedServices: PopularService[] = useMemo(
    () => selectedServiceIds
      .map(id => POPULAR_SERVICES.find(s => s.id === id))
      .filter(Boolean) as PopularService[],
    [selectedServiceIds]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Ortalanmış ve Küçültülmüş */}
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,#dcfce7,#ecfeff_40%,#f8fafc_70%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Car className="w-6 h-6 text-cyan-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                    Transfer Hizmetleri
                  </h1>
                  <Badge className="bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-medium">
                    {transfers.length} Transfer
                  </Badge>
                </div>
                <p className="text-slate-600 mt-1 text-sm md:text-base">
                  Havalimanı, otel ve kutsal mekanlar arası güvenli ve konforlu transfer seçenekleri.
                </p>
              </div>
            </div>

            {/* Arama Formu - Beyaz Kart İçinde */}
            <div className="mt-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
                <TransferSearchForm onSearch={handleSearch} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popüler Transferler ve Hizmetler */}
      <PopularServicesSection
        onServiceSelect={handleServiceSelect}
        selectedServiceIds={selectedServiceIds}
        availableVehicles={transfers.map(t => ({
          vehicleType: t.vehicleType,
          basePrice: t.basePrice,
        }))}
      />

      {/* Transfer Vehicles Section Title */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <h2 className="text-lg font-bold text-slate-900">Müsait Araçlar</h2>
        <p className="text-xs text-slate-500 mt-0.5">Size uygun transfer aracını seçin</p>
      </section>

      {/* Transfer Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {transfersQuery.isLoading ? (
          <LoadingState title="Transferler yükleniyor" description="Aktif transfer verileri getiriliyor..." />
        ) : null}

        {transfersQuery.isError ? (
          <ErrorState
            title="Transferler alınamadı"
            description="Lütfen daha sonra tekrar deneyin."
            onRetry={() => transfersQuery.refetch()}
          />
        ) : null}

        {!transfersQuery.isLoading && !transfersQuery.isError && transfers.length === 0 ? (
          <EmptyState title="Uygun transfer bulunamadı" description="Daha sonra tekrar deneyin." />
        ) : null}

        {!transfersQuery.isLoading && !transfersQuery.isError && transfers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {transfers.map((transfer) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                selectedServices={selectedServices}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ────────── Transfer Card ────────── */

function TransferCard({
  transfer,
  selectedServices
}: {
  transfer: TransferModel;
  selectedServices: PopularService[];
}) {
  const firstImage = transfer.images?.[0];
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;
  
  // Seçili hizmetlere göre toplam fiyat hesaplama (çoklu seçim destekli)
  const displayPrice = useMemo(() => {
    if (selectedServices.length === 0) {
      return transfer.basePrice;
    }

    // Baz transfer fiyatı her zaman dahil
    let totalPrice = transfer.basePrice;

    // Her seçili hizmetin fiyatını ekle
    for (const service of selectedServices) {
      if (service.type === 'transfer') {
        // Transfer hizmeti: Mesafe bazlı fiyat hesaplama
        const distanceKm = service.distance?.km || 0;
        if (distanceKm > 0) {
          const priceCalc = calculateTransferPrice({
            vehicleType: transfer.vehicleType,
            distanceKm,
            isNightTime: false,
            waitingHours: 0,
            extraLuggage: 0,
            passengerCount: 1,
          });
          // Transfer seçildiğinde, baz fiyatı çıkarıp mesafe bazlı fiyat koy
          totalPrice = totalPrice - transfer.basePrice + priceCalc.total;
        } else {
          totalPrice = totalPrice - transfer.basePrice + service.price.baseAmount;
        }
      } else {
        // Tur/Rehber: Hizmet ücretini ekle
        totalPrice += service.price.baseAmount;
      }
    }

    return totalPrice;
  }, [selectedServices, transfer]);

  // Fiyat değişim göstergesi - çoklu seçim destekli
  const priceLabel = useMemo(() => {
    if (selectedServices.length === 0) return 'Başlangıç';
    if (selectedServices.length === 1) {
      const svc = selectedServices[0];
      if (svc.type === 'transfer') return 'Seçili Rota';
      return 'Transfer + ' + (svc.type === 'tour' ? 'Tur' : 'Rehber');
    }
    // Çoklu seçim
    return `Transfer + ${selectedServices.length} Hizmet`;
  }, [selectedServices]);

  // Seçili hizmet isimleri özeti
  const servicesSummary = useMemo(() => {
    if (selectedServices.length === 0) return null;
    if (selectedServices.length === 1) return selectedServices[0].name;
    return selectedServices.map(s => s.name).join(' + ');
  }, [selectedServices]);

  // SEO uyumlu Türkçe URL oluştur
  const vehicleName = transfer.vehicleName || vehicleLabel;
  const vehicleSlug = `${createSlug(vehicleName)}-${transfer.id}`;
  
  // Booking URL: İlk seçili tur veya tursuz
  // Çoklu tur seçiminde tüm turları query param olarak gönder
  const bookingUrl = useMemo(() => {
    if (selectedServices.length === 0) {
      return `/transfer-rezervasyon/${vehicleSlug}/tursuz`;
    }
    // İlk turu slug olarak kullan
    const firstService = selectedServices[0];
    const tourSlug = `${createSlug(firstService.name)}-${firstService.id}`;
    const baseUrl = `/transfer-rezervasyon/${vehicleSlug}/${tourSlug}`;
    
    // Birden fazla tur seçilmişse, ek turları query param olarak ekle
    if (selectedServices.length > 1) {
      const extraTourIds = selectedServices.slice(1).map(s => s.id).join(',');
      return `${baseUrl}?extraTours=${extraTourIds}`;
    }
    return baseUrl;
  }, [selectedServices, vehicleSlug]);

  return (
    <Link href={bookingUrl}>
      <Card className="group overflow-hidden border-slate-200 bg-white hover:border-cyan-300 transition-colors duration-200 cursor-pointer h-full">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {firstImage ? (
            <img
              src={firstImage}
              alt={transfer.vehicleName || vehicleLabel}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-cyan-50 to-sky-50">
              <VehicleIcon type={transfer.vehicleType} className="w-12 h-12 text-cyan-300" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex gap-1.5">
              {transfer.isPopular ? (
                <Badge className="bg-amber-500 text-white border-0 text-[11px] gap-1">
                  <Star className="w-3 h-3 fill-white" /> Popüler
                </Badge>
              ) : null}
              <Badge className="bg-white/90 text-slate-800 border-0 text-[11px] backdrop-blur-sm gap-1">
                <VehicleIcon type={transfer.vehicleType} className="w-3 h-3" />
                {vehicleLabel}
              </Badge>
            </div>
            
            {/* Favorite Button */}
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton
                itemId={transfer.id}
                itemType="transfer"
                title={transfer.vehicleName || vehicleLabel}
                imageUrl={firstImage}
                size="sm"
              />
            </div>
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <Badge className="bg-cyan-600 text-white border-0 text-[11px] gap-1">
              <Users className="w-3 h-3" /> {transfer.capacity} Kişi
            </Badge>
            {transfer.durationMinutes > 0 ? (
              <Badge className="bg-white/90 text-slate-800 border-0 text-[11px] backdrop-blur-sm gap-1">
                <Clock3 className="w-3 h-3" /> {transfer.durationMinutes} dk
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Vehicle Title */}
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-cyan-700 transition-colors">
            {transfer.vehicleName || vehicleLabel}
          </h3>

          {/* Route */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{displayAddress(transfer.fromAddress)}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{displayAddress(transfer.toAddress)}</span>
          </div>

          {/* Info Row */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {transfer.company ? (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {transfer.company}
              </div>
            ) : null}
            {transfer.luggageCapacity > 0 ? (
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Briefcase className="w-3 h-3 text-slate-400" />
                {transfer.luggageCapacity} Bagaj
              </div>
            ) : null}
          </div>

          {/* Rating + Price Row */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-end justify-between">
            <div className="flex items-center gap-1">
              {transfer.rating > 0 ? (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-slate-700">
                    {transfer.rating.toFixed(1)}
                  </span>
                  {transfer.reviewCount > 0 ? (
                    <span className="text-[10px] text-slate-400">({transfer.reviewCount})</span>
                  ) : null}
                </>
              ) : (
                <span className="text-[10px] text-slate-400">Yeni</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                {priceLabel}
              </p>
              <p className="text-base font-bold text-cyan-700 leading-tight">
                {formatTlUsdPairFromTl(displayPrice)}
              </p>
              {servicesSummary && (
                <p className="text-[9px] text-slate-400 mt-0.5 max-w-[140px] line-clamp-2 text-right">
                  {servicesSummary}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
