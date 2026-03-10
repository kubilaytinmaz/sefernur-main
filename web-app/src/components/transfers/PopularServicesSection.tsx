"use client";

// Popüler Hizmetler Bölümü - Turlar
// Çoklu seçim destekli, detaylı bilgi modal ile gösterimli

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  POPULAR_SERVICES,
  type PopularService,
} from "@/lib/transfers/popular-services-simple";
import { cn } from "@/lib/utils";
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
  onServiceSelect?: (serviceIds: string[]) => void;
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
  const [showWarning, setShowWarning] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<PopularService | null>(null);

  // Her tur için başlayan fiyatı hesapla (müsait araçlardan en ucuz)
  const getStartingPrice = useCallback((service: PopularService): string => {
    if (availableVehicles.length === 0) {
      return service.price.display;
    }

    // Müsait araçlardan en ucuz fiyatı bul
    const minPrice = Math.min(...availableVehicles.map(v => v.basePrice));
    return `${minPrice}₺'den başlayan fiyatlar`;
  }, [availableVehicles]);

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

      onServiceSelect?.(newIds);
    },
    [selectedServiceIds, onServiceSelect]
  );

  // Seçili hizmetlerin toplam süresini hesapla
  const totalHours = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = POPULAR_SERVICES.find((s) => s.id === id);
      return sum + (svc?.duration.hours ?? 0);
    }, 0);
  }, [selectedServiceIds]);

  // Seçili hizmetlerin toplam fiyatını hesapla
  const totalPrice = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = POPULAR_SERVICES.find((s) => s.id === id);
      return sum + (svc?.price.baseAmount ?? 0);
    }, 0);
  }, [selectedServiceIds]);

  // Seçili hizmetlerin toplam km'sini hesapla
  const totalKm = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = POPULAR_SERVICES.find((s) => s.id === id);
      return sum + (svc?.distance?.km ?? 0);
    }, 0);
  }, [selectedServiceIds]);

  const selectionCount = selectedServiceIds.length;

  return (
    <section
      className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", className)}
    >
      {/* Başlık + Seçim Sayacı */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Popüler Turlar
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            En çok tercih edilen turlar — Birden fazla seçebilirsiniz
          </p>
        </div>
        {selectionCount > 0 && (
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 text-xs px-2.5 py-1 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {selectionCount} seçili
            </Badge>
          </div>
        )}
      </div>

      {/* Çoklu seçim uyarısı */}
      {showWarning && (
        <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 flex-1">
            <span className="font-semibold">{selectionCount} tur</span>{" "}
            seçtiniz. Fazla seçim toplam süreyi ve maliyeti artırır. Lütfen
            programınıza uygun sayıda tur seçin.
          </p>
          <button
            type="button"
            onClick={() => setShowWarning(false)}
            className="text-amber-600 hover:text-amber-800 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hizmet Kartları - Yatay Kaydırma */}
      <div className="flex gap-3 overflow-x-auto py-2 px-1 -mx-1 scrollbar-hide">
        {POPULAR_SERVICES.map((service) => (
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
            startingPrice={getStartingPrice(service)}
          />
        ))}
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
          totalHours={totalHours}
          totalPrice={totalPrice}
          totalKm={totalKm}
          onRemove={(id) => handleToggle(id)}
          onClearAll={() => onServiceSelect?.([])}
        />
      )}
    </section>
  );
}

/* ────────── Tek Hizmet Kartı ────────── */

interface ServiceCardProps {
  service: PopularService;
  isSelected: boolean;
  selectionIndex: number; // -1 ise seçili değil
  onToggle: (id: string) => void;
  onShowDetail: () => void;
  startingPrice: string;
}

function ServiceCard({
  service,
  isSelected,
  selectionIndex,
  onToggle,
  onShowDetail,
  startingPrice,
}: ServiceCardProps) {

  return (
    <button
      type="button"
      onClick={() => onToggle(service.id)}
      className={cn(
        "flex-shrink-0 w-56 text-left transition-all duration-200",
        isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
      )}
    >
      <Card
        className={cn(
          "h-full flex flex-col border-slate-200 transition-all cursor-pointer relative",
          isSelected
            ? "border-cyan-500 ring-2 ring-cyan-200 shadow-lg bg-cyan-50"
            : "hover:border-cyan-300 hover:shadow-md bg-white"
        )}
      >
        {/* Seçim numarası badge'i */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-10">
            {selectionIndex + 1}
          </div>
        )}

        <CardContent className="p-3 flex flex-col h-full">
          {/* Üst kısım: İkon ve Başlık */}
          <div className="flex items-start gap-2 mb-2">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                isSelected
                  ? "bg-cyan-100"
                  : "bg-slate-100 hover:bg-cyan-50 transition-colors"
              )}
            >
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-xs font-semibold leading-tight line-clamp-2 transition-colors",
                  isSelected
                    ? "text-cyan-700"
                    : "text-slate-900 hover:text-cyan-700"
                )}
              >
                {service.name}
              </h3>
              {/* Kısa açıklama */}
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {service.description}
              </p>
            </div>
            {service.isPopular && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0.5 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-500" />
              </Badge>
            )}
          </div>

          {/* Orta kısım: Detaylar */}
          <div className="flex-grow space-y-1.5 mb-2">
            {/* Mesafe ve Süre */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {service.distance && (
                <div className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                  <span>{service.distance.text}</span>
                </div>
              )}
              <div className="flex items-center gap-0.5">
                <Clock3 className="w-3 h-3 shrink-0 text-slate-400" />
                <span>{service.duration.text}</span>
              </div>
            </div>

            {/* Fiyat */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-400 uppercase">Başlayan Fiyatlar</span>
              <span className="text-[11px] font-bold text-cyan-700">
                {startingPrice}
              </span>
            </div>
          </div>

          {/* Alt kısım: Butonlar */}
          <div className="mt-auto pt-2 border-t border-slate-100 space-y-1.5">
            {/* Tur bilgisi butonu */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowDetail();
              }}
              className="w-full text-[9px] font-medium text-center py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 transition-colors flex items-center justify-center gap-1"
            >
              <Info className="w-3 h-3" />
              Tur bilgisi için tıklayınız
            </button>
            
            {/* Seçim butonu - Daha belirgin */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(service.id);
              }}
              className={cn(
                "w-full text-[10px] font-semibold text-center py-2 rounded-lg transition-all cursor-pointer shadow-sm",
                isSelected
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600 shadow-md hover:shadow-lg"
              )}
            >
              {isSelected ? "✓ Seçili" : "Seçmek için tıklayınız"}
            </button>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

/* ────────── Seçim Özeti ────────── */

interface SelectionSummaryProps {
  selectedIds: string[];
  totalHours: number;
  totalPrice: number;
  totalKm: number;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

function SelectionSummary({
  selectedIds,
  totalHours,
  totalPrice,
  totalKm,
  onRemove,
  onClearAll,
}: SelectionSummaryProps) {
  const selectedServices = useMemo(
    () =>
      selectedIds
        .map((id) => POPULAR_SERVICES.find((s) => s.id === id))
        .filter(Boolean) as PopularService[],
    [selectedIds]
  );

  return (
    <div className="mt-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl border border-cyan-200 p-4 shadow-sm">
      {/* Başlık satırı */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-600" />
          <h3 className="text-sm font-semibold text-cyan-900">
            Seçili Turlar ({selectedIds.length})
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Toplam bilgiler */}
          <div className="flex items-center gap-3 text-xs text-cyan-700">
            {totalKm > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {totalKm} km
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              {totalHours} saat
            </span>
            <span className="font-bold text-cyan-800">{totalPrice}₺</span>
          </div>
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] text-cyan-600 hover:text-red-600 font-medium px-2 py-1 rounded-lg bg-white/50 hover:bg-red-50 border border-cyan-200 hover:border-red-200 transition-colors"
          >
            Tümünü Kaldır
          </button>
        </div>
      </div>

      {/* Seçili tur listesi */}
      <div className="flex flex-wrap gap-2">
        {selectedServices.map((svc, idx) => (
          <div
            key={svc.id}
            className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 border border-cyan-200 text-xs"
          >
            <span className="w-4 h-4 bg-cyan-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0">
              {idx + 1}
            </span>
            <span className="text-xl leading-none">{svc.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium text-slate-800 text-[11px]">
                {svc.name}
              </span>
              <span className="text-[9px] text-slate-500">
                {svc.duration.text}
                {svc.distance ? ` • ${svc.distance.text}` : ""}
                {" • "}
                {svc.price.display}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(svc.id);
              }}
              className="ml-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Uyarı - fazla seçim varsa */}
      {selectedIds.length > SELECTION_WARNING_THRESHOLD && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-[10px] text-amber-800">
            Toplam <span className="font-bold">{totalHours} saat</span> ve{" "}
            <span className="font-bold">{totalPrice}₺</span> tutarında seçim
            yaptınız. Gün içinde yeterli zaman olduğundan emin olun.
          </p>
        </div>
      )}
    </div>
  );
}
