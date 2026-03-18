"use client";

/**
 * SelectionSummaryCard - Seçili turların özetini gösteren bileşen
 * Sadece seçim varsa görünür
 */

import { formatTlUsdPairFromUsd } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { PopularServiceModel } from "@/types/popular-service";
import { AlertTriangle, Clock3, MapPin, Trash2, X } from "lucide-react";

interface SelectionSummaryCardProps {
  selectedServices: PopularServiceModel[];
  totalHours: number;
  totalPrice: number;
  totalKm: number;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function SelectionSummaryCard({
  selectedServices,
  totalHours,
  totalPrice,
  totalKm,
  onRemove,
  onClearAll,
  className,
}: SelectionSummaryCardProps) {
  // Seçim yoksa gösterme
  if (selectedServices.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl border-2 border-cyan-200 p-5 shadow-lg animate-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      {/* Başlık Satırı */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
            <Clock3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-cyan-900">
              Seçili Turlar ({selectedServices.length})
            </h3>
            <p className="text-xs text-cyan-700">
              Rezervasyon için hazırlanıyor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toplam Bilgiler */}
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
              {Math.round(totalPrice).toLocaleString('tr-TR')}₺
            </span>
          </div>

          {/* Tümünü Kaldır Butonu */}
          {selectedServices.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-2 rounded-lg bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tümünü Kaldır
            </button>
          )}
        </div>
      </div>

      {/* Seçili Tur Listesi */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selectedServices.map((svc, idx) => (
            <div
              key={svc.id}
              className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border-2 border-cyan-200 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 50}ms` }}
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
                  <span className="font-medium text-cyan-700">
                    {formatTlUsdPairFromUsd(svc.price.baseAmount)}
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(svc.id);
                }}
                className="ml-1 w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center shrink-0 active:scale-90"
                aria-label={`${svc.name} seçimini kaldır`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Çoklu Seçim Uyarısı */}
      {selectedServices.length > 3 && (
        <div className="mt-4 flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl px-4 py-3 animate-in fade-in duration-300">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Dikkat: Çoklu Tur Seçimi
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Toplam <span className="font-bold">{totalHours} saat</span> süre ve{" "}
              <span className="font-bold">{Math.round(totalPrice).toLocaleString('tr-TR')}₺</span> tutarında seçim yaptınız.
              Gün içinde yeterli zaman olduğundan ve programınızın uygun olduğundan emin olun.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
