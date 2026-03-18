// Transfer Kapasite Filtresi - Akıllı Aralık Seçimi
// Yolcu sayısına göre varsayılan aralık ve hızlı seçim butonları

"use client";

import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { useCallback, useMemo } from "react";

/* ────────── Types ────────── */

interface CapacityFilterProps {
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  passengerCount?: number; // URL'den gelen yolcu sayısı
}

/* ────────── Constants ────────── */

const CAPACITY_OPTIONS = [
  { label: "1-3 Kişi", min: 1, max: 3, icon: "👤" },
  { label: "4-6 Kişi", min: 4, max: 6, icon: "👥" },
  { label: "7-10 Kişi", min: 7, max: 10, icon: "👥" },
  { label: "11-20 Kişi", min: 11, max: 20, icon: "👥" },
  { label: "20+ Kişi", min: 20, max: 999, icon: "🚌" },
];

/* ────────── Helper Functions ────────── */

/**
 * Yolcu sayısına göre varsayılan kapasite aralığı hesapla
 */
function getCapacityRangeForPassengers(passengers: number): { min: number; max: number } {
  if (passengers <= 3) return { min: 1, max: 999 };
  if (passengers <= 6) return { min: 4, max: 999 };
  if (passengers <= 10) return { min: 7, max: 999 };
  if (passengers <= 20) return { min: 11, max: 999 };
  return { min: 20, max: 999 };
}

/* ────────── Component ────────── */

export function CapacityFilter({
  value,
  onChange,
  passengerCount = 1,
}: CapacityFilterProps) {
  // Varsayılan aralık - yolcu sayısına göre
  const defaultRange = useMemo(
    () => getCapacityRangeForPassengers(passengerCount),
    [passengerCount]
  );

  // Seçili butonun index'ini bul
  const selectedIndex = useMemo(() => {
    return CAPACITY_OPTIONS.findIndex(
      (opt) => value.min === opt.min && value.max === opt.max
    );
  }, [value]);

  // Hızlı seçim butonu tıklama
  const handleQuickSelect = useCallback(
    (min: number, max: number) => {
      const isSame = value.min === min && value.max === max;
      // Aynı butona tekrar tıklanırsa varsayılan aralığa dön
      onChange(isSame ? defaultRange : { min, max });
    },
    [value, onChange, defaultRange]
  );

  // Custom range değişikliği
  const handleCustomChange = useCallback(
    (field: "min" | "max", newValue: number) => {
      if (field === "min") {
        onChange({ min: Math.max(1, newValue), max: Math.max(newValue + 1, value.max) });
      } else {
        onChange({ min: value.min, max: Math.max(value.min + 1, newValue) });
      }
    },
    [value, onChange]
  );

  // Varsayılan aralıkta mı kontrolü
  const isDefaultRange =
    value.min === defaultRange.min && value.max === defaultRange.max;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Users className="w-3.5 h-3.5 text-cyan-600" />
        <span>Kapasite</span>
      </div>

      {/* Quick Select Buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {CAPACITY_OPTIONS.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isDefault =
            defaultRange.min === option.min && defaultRange.max === option.max;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => handleQuickSelect(option.min, option.max)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 h-14 rounded-lg border-2 transition-all cursor-pointer",
                isSelected
                  ? "border-cyan-400 bg-cyan-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/30"
              )}
            >
              {/* Icon */}
              <span className="text-lg">{option.icon}</span>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isSelected
                    ? "text-cyan-700"
                    : "text-slate-600 group-hover:text-cyan-600"
                )}
              >
                {option.label}
              </span>

              {/* Default Indicator */}
              {isDefault && !isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Range Input */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1">
          <label className="text-[10px] text-slate-500 mb-1 block">Min</label>
          <input
            type="number"
            min={1}
            max={value.max - 1}
            value={value.min}
            onChange={(e) => handleCustomChange("min", Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
          />
        </div>

        <span className="text-slate-400 mt-4">-</span>

        <div className="flex-1">
          <label className="text-[10px] text-slate-500 mb-1 block">Max</label>
          <input
            type="number"
            min={value.min + 1}
            max={999}
            value={value.max === 999 ? "" : value.max}
            onChange={(e) =>
              handleCustomChange("max", e.target.value ? Number(e.target.value) : 999)
            }
            placeholder="∞"
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Reset to Default Button */}
      {!isDefaultRange && (
        <button
          type="button"
          onClick={() => onChange(defaultRange)}
          className="w-full text-xs text-cyan-600 hover:text-cyan-700 font-medium py-1.5 px-2 rounded-lg hover:bg-cyan-50 transition-colors"
        >
          Varsayılana Dön ({passengerCount} yolcu)
        </button>
      )}
    </div>
  );
}
