"use client";

import { cn } from "@/lib/utils";
import {
    ArrowDownNarrowWide,
    Grid3X3,
    List,
    Star,
    TrendingDown,
    TrendingUp
} from "lucide-react";

/* ────────── Types ────────── */

export type SortField = "price" | "stars" | "rating" | "name";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list";

export interface SortOption {
  field: SortField;
  direction: SortDirection;
  label: string;
  icon: React.ReactNode;
}

interface HotelSortBarProps {
  sortField: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onViewModeChange: (mode: ViewMode) => void;
  resultsCount: number;
}

/* ────────── Constants ────────── */

const SORT_OPTIONS: SortOption[] = [
  {
    field: "price",
    direction: "asc",
    label: "Fiyat (Düşük)",
    icon: <TrendingDown className="w-4 h-4" />,
  },
  {
    field: "price",
    direction: "desc",
    label: "Fiyat (Yüksek)",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    field: "stars",
    direction: "desc",
    label: "Yıldız (Yüksek)",
    icon: <Star className="w-4 h-4" />,
  },
  {
    field: "rating",
    direction: "desc",
    label: "Puan (Yüksek)",
    icon: <Star className="w-4 h-4" />,
  },
  {
    field: "name",
    direction: "asc",
    label: "İsim (A-Z)",
    icon: <ArrowDownNarrowWide className="w-4 h-4" />,
  },
];

/* ────────── Main Component ────────── */

export function HotelSortBar({
  sortField,
  sortDirection,
  viewMode,
  onSortChange,
  onViewModeChange,
  resultsCount,
}: HotelSortBarProps) {
  const currentSortLabel = SORT_OPTIONS.find(
    (o) => o.field === sortField && o.direction === sortDirection,
  )?.label || "Sırala";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl">
      {/* Results Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{resultsCount}</span>{" "}
          otel bulundu
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Sort Select */}
        <div className="flex-1 sm:flex-initial">
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-") as [
                SortField,
                SortDirection,
              ];
              onSortChange(field, direction);
            }}
            className="w-full sm:w-auto h-10 rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option
                key={`${option.field}-${option.direction}`}
                value={`${option.field}-${option.direction}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "grid"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-white text-slate-400 hover:text-slate-600",
            )}
            title="Grid görünümü"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2.5 transition-colors",
              viewMode === "list"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-white text-slate-400 hover:text-slate-600",
            )}
            title="Liste görünümü"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
