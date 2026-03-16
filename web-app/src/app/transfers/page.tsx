"use client";

import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { PopularServicesSection } from "@/components/transfers";
import { TransferSearchForm } from "@/components/transfers/TransferSearchForm";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromUsd, usdToTry } from "@/lib/currency";
import { getPopularServices } from "@/lib/data/popular-services-data";
import { getActiveTransfers } from "@/lib/data/transfers-data";
import { calculateAllHourlyRates, calculateTransferPrice } from "@/lib/transfers/pricing";
import { createSlug } from "@/lib/transfers/seo-slugs";
import { displayAddress } from "@/types/address";
import type { PopularServiceModel } from "@/types/popular-service";
import { TransferModel, VehicleType, vehicleTypeLabels } from "@/types/transfer";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Car,
  Clock3,
  MapPin,
  Star,
  Truck,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [selectedServices, setSelectedServices] = useState<PopularServiceModel[]>([]);
  
  // Saatlik kiralama süresi seçimi
  const [selectedHours, setSelectedHours] = useState<number>(1);

  const transfersQuery = useQuery({
    queryKey: ["transfers", "active"],
    queryFn: () => getActiveTransfers(),
  });

  // Tüm popüler turları saatlik fiyat hesaplaması için çek
  const popularToursQuery = useQuery({
    queryKey: ["popularServices", "all"],
    queryFn: () => getPopularServices({ type: "tour" }),
  });

  const transfers = transfersQuery.data ?? [];
  const allTours = popularToursQuery.data ?? [];

  const router = useRouter();
  
  // Arama formu gönderildiğinde sonuçlar sayfasına yönlendir
  const handleSearch = (params: {
    routeId?: string;
    fromCity: string;
    toCity: string;
    fromLocationId?: string;
    toLocationId?: string;
    pickupDate: Date;
    pickupTime: string;
    passengerCount: number;
    luggageCount: number;
    vehicleType?: VehicleType;
  }) => {
    // URL parametreleri oluştur
    const searchParams = new URLSearchParams();
    if (params.fromLocationId) searchParams.set('from', params.fromLocationId);
    if (params.toLocationId) searchParams.set('to', params.toLocationId);
    searchParams.set('date', params.pickupDate.toISOString().split('T')[0]);
    searchParams.set('time', params.pickupTime);
    searchParams.set('passengers', params.passengerCount.toString());
    if (params.vehicleType) searchParams.set('vehicleType', params.vehicleType);
    if (params.routeId) searchParams.set('routeId', params.routeId);

    router.push(`/transfer-sonuclar?${searchParams.toString()}`);
  };

  // Popüler hizmet seçimi (çoklu seçim toggle) - PopularServicesSection'dan gelen servisleri kullan
  const handleServiceSelect = (serviceIds: string[], services: PopularServiceModel[]) => {
    setSelectedServiceIds(serviceIds);
    setSelectedServices(services);
  };

  // Tüm araç tipleri için saatlik fiyatları hesapla (SAR cinsinden)
  // TÜM turları kullanarak hesapla, sadece seçili olanları değil
  const hourlyRates = useMemo(() => {
    return calculateAllHourlyRates(allTours);
  }, [allTours]);

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
            {[...transfers].sort((a, b) => a.basePrice - b.basePrice).map((transfer) => (
              <TransferCard
                key={transfer.id}
                transfer={transfer}
                selectedServices={selectedServices}
                hourlyRates={hourlyRates}
                selectedHours={selectedHours}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ────────── Transfer Card ────────── */

interface TransferCardProps {
  transfer: TransferModel;
  selectedServices: PopularServiceModel[];
  hourlyRates: Record<VehicleType, number | null>;
  selectedHours: number;
}

function TransferCard({
  transfer,
  selectedServices,
  hourlyRates,
  selectedHours,
}: TransferCardProps) {
  const firstImage = transfer.images?.[0];
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;

  // Seçili hizmetlere göre toplam fiyat hesaplama (çoklu seçim destekli)
  const displayPrice = useMemo(() => {
    if (selectedServices.length === 0) {
      // Seçili tur yoksa, saatlik fiyatı göster (TL cinsinden)
      // Seçili saate göre fiyat hesapla
      const hourlyRateUsd = hourlyRates[transfer.vehicleType];
      if (hourlyRateUsd) {
        // Seçili saat sayısına göre fiyat hesapla
        const totalPriceUsd = hourlyRateUsd * selectedHours;
        return usdToTry(totalPriceUsd);
      }
      return transfer.basePrice * selectedHours;
    }

    // Sadece seçili turların toplam fiyatını göster
    let totalPriceTl = 0;

    // Her seçili hizmetin fiyatını ekle (USD → TL çevir)
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
          totalPriceTl += usdToTry(priceCalc.total);
        } else {
          // vehiclePrices kullan, yoksa baseAmount
          const servicePriceUsd = service.vehiclePrices?.[transfer.vehicleType] ?? service.price.baseAmount;
          totalPriceTl += usdToTry(servicePriceUsd);
        }
      } else {
        // Tur/Rehber: vehiclePrices varsa onu kullan, yoksa baseAmount (USD cinsinden)
        const servicePriceUsd = service.vehiclePrices?.[transfer.vehicleType] ?? service.price.baseAmount;
        totalPriceTl += usdToTry(servicePriceUsd);
      }
    }

    return totalPriceTl;
  }, [selectedServices, transfer, hourlyRates]);

  // Fiyat değişim göstergesi - çoklu seçim destekli
  const priceLabel = useMemo(() => {
    if (selectedServices.length === 0) {
      return selectedHours === 24 ? 'Günlük' : `${selectedHours} Saatlik`;
    }
    if (selectedServices.length === 1) {
      const svc = selectedServices[0];
      if (svc.type === 'transfer') return 'Seçili Rota';
      return 'Transfer + ' + (svc.type === 'tour' ? 'Tur' : 'Rehber');
    }
    // Çoklu seçim
    return `Transfer + ${selectedServices.length} Hizmet`;
  }, [selectedServices, selectedHours]);

  // Fiyat alt açıklaması (USD/saat veya tur özeti)
  const priceSubtext = useMemo(() => {
    if (selectedServices.length === 0) {
      const hourlyRateUsd = hourlyRates[transfer.vehicleType];
      if (hourlyRateUsd) {
        return `${hourlyRateUsd} USD/saat`;
      }
      return null;
    }
    if (selectedServices.length === 1) return selectedServices[0].name;
    return selectedServices.map(s => s.name).join(' + ');
  }, [selectedServices, transfer, hourlyRates]);

  // TL/USD formatında fiyat gösterimi
  const formattedPrice = useMemo(() => {
    if (selectedServices.length === 0) {
      const hourlyRateUsd = hourlyRates[transfer.vehicleType];
      if (hourlyRateUsd) {
        // Seçili saat sayısına göre toplam USD fiyatı hesapla
        const totalUsd = hourlyRateUsd * selectedHours;
        return formatTlUsdPairFromUsd(totalUsd);
      }
      return formatTlUsdPairFromUsd(displayPrice / 38); // TL'yi USD'ye çevir (fallback)
    }
    // Seçili tur varsa, tur fiyatını TL/USD formatında göster
    // vehiclePrices kullanarak USD değerini hesapla
    const totalUsd = selectedServices.reduce((sum, service) => {
      if (service.type === 'transfer') {
        const distanceKm = service.distance?.km || 0;
        if (distanceKm > 0) {
          // Mesafe bazlı fiyatlamada calculateTransferPrice'dan USD değerini al
          const priceCalc = calculateTransferPrice({
            vehicleType: transfer.vehicleType,
            distanceKm,
            isNightTime: false,
            waitingHours: 0,
            extraLuggage: 0,
            passengerCount: 1,
          });
          return sum + priceCalc.total;
        }
        return sum + (service.vehiclePrices?.[transfer.vehicleType] ?? service.price.baseAmount);
      }
      // Tur için vehiclePrices kullan (USD cinsinden)
      return sum + (service.vehiclePrices?.[transfer.vehicleType] ?? service.price.baseAmount);
    }, 0);
    return formatTlUsdPairFromUsd(totalUsd);
  }, [selectedServices, transfer, hourlyRates, displayPrice]);

  // Rota gösterimi - seçili tur yoksa "Saatlik Kiralama", varsa tur rotası
  const routeDisplay = useMemo(() => {
    if (selectedServices.length === 0) {
      return "Saatlik Kiralama";
    }
    // İlk seçili turun rotasını göster
    const firstService = selectedServices[0];
    if (firstService.route) {
      return `${displayAddress(firstService.route.from)} → ${displayAddress(firstService.route.to)}`;
    }
    return firstService.name;
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
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-200">
          {firstImage ? (
            <img
              src={firstImage}
              alt={transfer.vehicleName || vehicleLabel}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-sky-50">
              <VehicleIcon type={transfer.vehicleType} className="w-12 h-12 text-cyan-300" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

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
            <span className="truncate">{routeDisplay}</span>
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
                {formattedPrice}
              </p>
              {priceSubtext && (
                <p className="text-[9px] text-slate-400 mt-0.5 max-w-[140px] line-clamp-2 text-right">
                  {priceSubtext}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
