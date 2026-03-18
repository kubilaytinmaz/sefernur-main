// Transfer Özellikler Filtresi - Kategorize Edilmiş
// Konfor, Teknoloji ve İkram kategorileri ile düzenlenmiş

"use client";

import { cn } from "@/lib/utils";
import { amenityLabels, VehicleAmenity } from "@/types/transfer";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";

/* ────────── Types ────────── */

interface AmenitiesFilterProps {
  selected: VehicleAmenity[];
  onChange: (selected: VehicleAmenity[]) => void;
}

/* ────────── Constants ────────── */

// Kategorizasyon - amenity'leri gruplara ayır
const AMENITY_CATEGORIES = {
  comfort: {
    label: "Konfor",
    icon: "🛋️",
    items: ["comfort" as VehicleAmenity, "air_condition" as VehicleAmenity],
  },
  technology: {
    label: "Teknoloji",
    icon: "📱",
    items: ["wifi" as VehicleAmenity, "bluetooth" as VehicleAmenity, "usb" as VehicleAmenity, "tv" as VehicleAmenity, "gps" as VehicleAmenity],
  },
  service: {
    label: "İkram & Hizmet",
    icon: "🎁",
    items: ["water" as VehicleAmenity, "snacks" as VehicleAmenity, "insurance" as VehicleAmenity],
  },
};

/* ────────── Component ────────── */

export function AmenitiesFilter({ selected, onChange }: AmenitiesFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleAmenity = (amenity: VehicleAmenity) => {
    if (selected.includes(amenity)) {
      onChange(selected.filter((a) => a !== amenity));
    } else {
      onChange([...selected, amenity]);
    }
  };

  // Seçili özellik sayısı
  const selectedCount = selected.length;

  return (
    <div className="space-y-2">
      {/* Header - Collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          <span>Özellikler</span>
          {selectedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-bold">
              {selectedCount}
            </span>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-3 px-2">
          {Object.entries(AMENITY_CATEGORIES).map(([key, category]) => (
            <div key={key} className="space-y-1.5">
              {/* Category Label */}
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </div>

              {/* Category Items */}
              <div className="grid grid-cols-2 gap-1.5">
                {category.items.map((amenity) => {
                  const isSelected = selected.includes(amenity);
                  return (
                    <label
                      key={amenity}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs",
                        isSelected
                          ? "bg-cyan-50 border border-cyan-200"
                          : "bg-slate-50 border border-transparent hover:border-cyan-200"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-3 h-3 rounded border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
                      />
                      <span
                        className={cn(
                          "text-[11px] font-medium transition-colors",
                          isSelected ? "text-cyan-700" : "text-slate-600"
                        )}
                      >
                        {amenityLabels[amenity]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Clear All Button */}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-xs text-red-600 hover:text-red-700 font-medium py-1.5 px-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Tüm Özellikleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}
