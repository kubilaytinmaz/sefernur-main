// Transfer Sıralama Seçenekleri - Compact Button Group
// Fiyat, Kapasite ve Değerlendirme sıralaması

"use client";

import { cn } from "@/lib/utils";
import { ArrowDownAZ, ArrowUpAZ, ChevronDown, ChevronUp, Star, Users } from "lucide-react";
import { useState } from "react";

/* ────────── Types ────────── */

type SortOption = "price-asc" | "price-desc" | "capacity-asc" | "rating-desc";

interface SortOptionsProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/* ────────── Constants ────────── */

const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    value: "price-asc",
    label: "Fiyat (Artan)",
    icon: <ArrowUpAZ className="w-3.5 h-3.5" />,
  },
  {
    value: "price-desc",
    label: "Fiyat (Azalan)",
    icon: <ArrowDownAZ className="w-3.5 h-3.5" />,
  },
  {
    value: "capacity-asc",
    label: "Kapasite",
    icon: <Users className="w-3.5 h-3.5" />,
  },
  {
    value: "rating-desc",
    label: "Değerlendirme",
    icon: <Star className="w-3.5 h-3.5" />,
  },
];

/* ────────── Component ────────── */

export function SortOptions({ value, onChange }: SortOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="space-y-2">
      {/* Header - Collapsible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <ArrowUpAZ className="w-3.5 h-3.5 text-cyan-600" />
          <span>Sıralama</span>
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-1.5 px-2">
          {SORT_OPTIONS.map((option) => {
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer",
                  isSelected
                    ? "bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/30"
                )}
              >
                <span className={cn(isSelected ? "text-cyan-600" : "text-slate-400")}>
                  {option.icon}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Option Display (when collapsed) */}
      {!isExpanded && selectedOption && (
        <div className="px-2 py-1 text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="text-slate-400">{selectedOption.icon}</span>
          <span>{selectedOption.label}</span>
        </div>
      )}
    </div>
  );
}
