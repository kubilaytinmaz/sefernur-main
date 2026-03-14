"use client";

// Popüler Hizmetler Bölümü - Turlar
// Çoklu seçim destekli, detaylı bilgi modal ile gösterimli
// Local JSON dosyasından veri çeker

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { usePopularTours } from "@/hooks/usePopularServices";
import { formatSarAsTry } from "@/lib/currency";
import { getMinPriceForService } from "@/lib/data/popular-services";
import { cn } from "@/lib/utils";
import type { PopularServiceModel } from "@/types/popular-service";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  Star,
  X
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { TourDetailModal } from "./TourDetailModal";

/** Çoklu seçim uyarı eşiği - Bu sayıyı aşınca uyarı gösterilir */
const SELECTION_WARNING_THRESHOLD = 3;

export interface PopularServicesSectionProps {
  onServiceSelect?: (serviceIds: string[], services: PopularServiceModel[]) => void;
  selectedServiceIds?: string[];
  className?: string;
  availableVehicles?: Array<{ vehicleType: string; basePrice: number }>;
}

export function PopularServicesSection({
  onServiceSelect,
  selectedServiceIds = [],
  className,
  availableVehicles = [],
}: PopularServicesSectionProps) {
  // Local JSON'dan veri çek
  const { data: services = [], isLoading, error } = usePopularTours();

  const [showWarning, setShowWarning] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PopularServiceModel | null>(null);

  // Her tur için SAR fiyatını döndür
  const getMinSarPrice = useCallback((service: PopularServiceModel): number => {
    return getMinPriceForService(service);
  }, []);

  // Seçim toggle işlemi
  const handleToggle = useCallback(
    (serviceId: string) => {
      const isCurrentlySelected = selectedServiceIds.includes(serviceId);
      let newIds: string[];

      if (isCurrentlySelected) {
        newIds = selectedServiceIds.filter((id) => id !== serviceId);
      } else {
        newIds = [...selectedServiceIds, serviceId];
      }

      // Eşik aşıldığında uyarı göster
      if (newIds.length > SELECTION_WARNING_THRESHOLD && !isCurrentlySelected) {
        setShowWarning(true);
        // 4 saniye sonra uyarıyı gizle
        setTimeout(() => setShowWarning(false), 4000);
      }

      // Seçili servislerin tamamını parent'a gönder
      const selectedServices = newIds
        .map(id => services.find(s => s.id === id))
        .filter(Boolean) as PopularServiceModel[];
      
      onServiceSelect?.(newIds, selectedServices);
    },
    [selectedServiceIds, onServiceSelect, services]
  );

  // Seçili hizmetlerin toplam süresini hesapla
  const totalHours = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = services.find((s) => s.id === id);
      return sum + (svc?.duration.hours ?? 0);
    }, 0);
  }, [selectedServiceIds, services]);

  // Seçili hizmetlerin toplam fiyatını hesapla
  const totalPrice = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = services.find((s) => s.id === id);
      return sum + (svc?.price.baseAmount ?? 0);
    }, 0);
  }, [selectedServiceIds, services]);

  // Seçili hizmetlerin toplam km'sini hesapla
  const totalKm = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = services.find((s) => s.id === id);
      return sum + (svc?.distance?.km ?? 0);
    }, 0);
  }, [selectedServiceIds, services]);

  const selectionCount = selectedServiceIds.length;

  // Loading state
  if (isLoading) {
    return (
      <section className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-600">Popüler turlar yükleniyor...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state - Fallback to static data
  if (error && services.length === 0) {
    return (
      <section className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Turlar yüklenirken sorun oluştu</h3>
            <p className="text-sm text-slate-600">
              Statik turlar gösteriliyor. Admin panelden yeni turlar ekleyebilirsiniz.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (services.length === 0) {
    return (
      <section className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Star className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Henüz popüler tur yok</h3>
            <p className="text-sm text-slate-600">
              Yakında burada popüler turları görebileceksiniz.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}
    >
      {/* Başlık + Seçim Sayacı */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </span>
            Popüler Turlar
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            En çok tercih edilen turlar — Birden fazla seçebilirsiniz
          </p>
        </div>
        {selectionCount > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-gradient-to-r from-cyan-500 to-sky-500 text-white border-0 text-sm px-4 py-2 gap-2 shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              {selectionCount} seçili
            </Badge>
          </div>
        )}
      </div>

      {/* Çoklu seçim uyarısı */}
      {showWarning && (
        <div className="mb-4 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-900 flex-1 font-medium">
            <span className="font-bold">{selectionCount} tur</span>{" "}
            seçtiniz. Fazla seçim toplam süreyi ve maliyeti artırır. Lütfen
            programınıza uygun sayıda tur seçin.
          </p>
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 hover:text-amber-900 transition-colors flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hizmet Kartları - Yatay Kaydırma */}
      <div className="relative group -mx-8 px-8">
        {/* Sol Ok - Kartın solunda */}
        <button
          type="button"
          onClick={() => {
            const container = document.getElementById('tours-scroll-container');
            if (container) {
              container.scrollBy({ left: -300, behavior: 'smooth' });
            }
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 w-12 h-12 rounded-full bg-white shadow-xl shadow-slate-300/50 border-2 border-slate-200 flex items-center justify-center text-slate-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-sky-500 hover:text-white hover:border-cyan-500 hover:shadow-cyan-500/30 transition-all duration-300 z-20 hover:scale-110 active:scale-95"
          aria-label="Sola kaydır"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scroll container */}
        <div
          id="tours-scroll-container"
          className="flex gap-4 overflow-x-auto py-3 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={selectedServiceIds.includes(service.id)}
              selectionIndex={selectedServiceIds.indexOf(service.id)}
              onToggle={handleToggle}
              onShowDetail={() => {
                setSelectedService(service);
                setDetailModalOpen(true);
              }}
              minSarPrice={getMinSarPrice(service)}
            />
          ))}
        </div>

        {/* Sağ Ok - Kartın sağında */}
        <button
          type="button"
          onClick={() => {
            const container = document.getElementById('tours-scroll-container');
            if (container) {
              container.scrollBy({ left: 300, behavior: 'smooth' });
            }
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 w-12 h-12 rounded-full bg-white shadow-xl shadow-slate-300/50 border-2 border-slate-200 flex items-center justify-center text-slate-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-sky-500 hover:text-white hover:border-cyan-500 hover:shadow-cyan-500/30 transition-all duration-300 z-20 hover:scale-110 active:scale-95"
          aria-label="Sağa kaydır"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tur Detay Modal */}
      <TourDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />

      {/* Seçim Özeti */}
      {selectionCount > 0 && (
        <SelectionSummary
          selectedIds={selectedServiceIds}
          services={services}
          totalHours={totalHours}
          totalPrice={totalPrice}
          totalKm={totalKm}
          onRemove={(id) => handleToggle(id)}
          onClearAll={() => onServiceSelect?.([], [])}
        />
      )}
    </section>
  );
}

/* ────────── Tek Hizmet Kartı ────────── */

interface ServiceCardProps {
  service: PopularServiceModel;
  isSelected: boolean;
  selectionIndex: number; // -1 ise seçili değil
  onToggle: (id: string) => void;
  onShowDetail: () => void;
  minSarPrice: number;
}

function ServiceCard({
  service,
  isSelected,
  selectionIndex,
  onToggle,
  onShowDetail,
  minSarPrice,
}: ServiceCardProps) {
  const priceTl = formatSarAsTry(minSarPrice);

  return (
    <div
      className={cn(
        "flex-shrink-0 w-56 snap-start"
      )}
    >
      <Card
        className={cn(
          "h-full flex flex-col border-2 transition-all relative cursor-pointer overflow-hidden",
          isSelected
            ? "border-cyan-500 ring-4 ring-cyan-200 shadow-xl bg-cyan-50/50 scale-[1.02]"
            : "border-slate-200 hover:border-cyan-400 hover:shadow-xl bg-white hover:scale-[1.01]"
        )}
        onClick={() => onToggle(service.id)}
      >
        {/* Seçim numarası badge'i */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10 border-2 border-white">
            {selectionIndex + 1}
          </div>
        )}

        <CardContent className="p-3 flex flex-col h-full gap-2">
          {/* Üst kısım: İkon ve Başlık */}
          <div className="flex items-start gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0",
                isSelected
                  ? "bg-gradient-to-br from-cyan-100 to-cyan-200"
                  : "bg-gradient-to-br from-slate-100 to-slate-200"
              )}
            >
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h3
                  className={cn(
                    "text-xs font-bold leading-tight line-clamp-2 transition-colors",
                    isSelected
                      ? "text-cyan-800"
                      : "text-slate-900"
                  )}
                >
                  {service.name}
                </h3>
                {service.isPopular && (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 text-[9px] px-1.5 py-0 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-white mr-0.5" />
                    Popüler
                  </Badge>
                )}
              </div>
              {/* Kısa açıklama */}
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-snug h-7">
                {service.description}
              </p>
            </div>
          </div>

          {/* Orta kısım: Detaylar */}
          <div className="space-y-1.5">
            {/* Mesafe ve Süre */}
            <div className="flex items-center gap-2 text-[11px] text-slate-600 h-4">
              {service.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0 text-cyan-600" />
                  <span className="font-medium">{service.distance.text}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock3 className="w-3 h-3 shrink-0 text-cyan-600" />
                <span className="font-medium">{service.duration.text}</span>
              </div>
            </div>

            {/* Fiyat */}
            <div className={cn(
              "rounded-md px-2 py-1.5 border min-h-[44px] flex flex-col justify-center",
              isSelected
                ? "bg-white border-cyan-200"
                : "bg-slate-50 border-slate-200"
            )}>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-cyan-700">{priceTl}</span>
                <span className="text-[10px] text-slate-400">/ {minSarPrice} SAR</span>
              </div>
              <span className="text-[10px] text-slate-500">başlayan fiyatlarla</span>
            </div>
          </div>

          {/* Alt kısım: Butonlar */}
          <div className="mt-auto pt-2 border-t border-slate-200 flex gap-1.5">
            {/* Detay butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail();
              }}
              className={cn(
                "flex-1 text-[11px] font-semibold text-center py-1.5 rounded-md transition-all flex items-center justify-center gap-1",
                isSelected
                  ? "bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50"
                  : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
              )}
            >
              <Info className="w-3 h-3" />
              Detay
            </button>
            
            {/* Seçim butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(service.id);
              }}
              className={cn(
                "flex-1 text-[11px] font-bold text-center py-1.5 rounded-md transition-all shadow-sm hover:shadow-md active:scale-95",
                isSelected
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                  : "bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600"
              )}
            >
              {isSelected ? (
                <span className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Seçili
                </span>
              ) : (
                "Seç"
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ────────── Seçim Özeti ────────── */

interface SelectionSummaryProps {
  selectedIds: string[];
  services: PopularServiceModel[];
  totalHours: number;
  totalPrice: number;
  totalKm: number;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

function SelectionSummary({
  selectedIds,
  services,
  totalHours,
  totalPrice,
  totalKm,
  onRemove,
  onClearAll,
}: SelectionSummaryProps) {
  const selectedServices = useMemo(
    () =>
      selectedIds
        .map((id) => services.find((s) => s.id === id))
        .filter(Boolean) as PopularServiceModel[],
    [selectedIds, services]
  );

  return (
    <div className="mt-5 bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl border-2 border-cyan-200 p-5 shadow-lg">
      {/* Başlık satırı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cyan-900">
              Seçili Turlar ({selectedIds.length})
            </h3>
            <p className="text-xs text-cyan-700">Rezervasyon için hazırlanıyor</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Toplam bilgiler */}
          <div className="flex items-center gap-3 text-sm">
            {totalKm > 0 && (
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-cyan-200 text-cyan-700 font-medium">
                <MapPin className="w-4 h-4" />
                {totalKm} km
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-cyan-200 text-cyan-700 font-medium">
              <Clock3 className="w-4 h-4" />
              {totalHours} saat
            </span>
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-1.5 rounded-lg text-white font-bold">
              {totalPrice}₺
            </span>
          </div>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-2 rounded-lg bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all active:scale-95"
          >
            Tümünü Kaldır
          </button>
        </div>
      </div>

      {/* Seçili tur listesi */}
      <div className="flex flex-wrap gap-3">
        {selectedServices.map((svc, idx) => (
          <div
            key={svc.id}
            className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border-2 border-cyan-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-sky-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              {idx + 1}
            </span>
            <span className="text-2xl leading-none">{svc.icon}</span>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 text-sm">
                {svc.name}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock3 className="w-3 h-3" />
                {svc.duration.text}
                {svc.distance ? (
                  <span className="flex items-center gap-1">
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    {svc.distance.text}
                  </span>
                ) : null}
                <span>•</span>
                <span className="font-medium text-cyan-700">{svc.price.display}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(svc.id);
              }}
              className="ml-1 w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center shrink-0 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Uyarı - fazla seçim varsa */}
      {selectedIds.length > SELECTION_WARNING_THRESHOLD && (
        <div className="mt-4 flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Dikkat: Çoklu Tur Seçimi
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Toplam <span className="font-bold">{totalHours} saat</span> süre ve{" "}
              <span className="font-bold">{totalPrice}₺</span> tutarında seçim yaptınız.
              Gün içinde yeterli zaman olduğundan ve programınızın uygun olduğundan emin olun.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
