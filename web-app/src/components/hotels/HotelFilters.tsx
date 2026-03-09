"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Filter,
  MapPin,
  SlidersHorizontal,
  Star,
  Utensils,
  X
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

/* ────────── Types ────────── */

export interface HotelFilters {
  priceRange?: [number, number];
  stars?: number[];
  amenities?: string[];
  distance?: number; // max km
  boardBasis?: string[];
  freeCancellation?: boolean;
}

interface HotelFiltersProps {
  filters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
  resultsCount: number;
  onClear: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

/* ────────── Constants ────────── */

const STAR_OPTIONS = [5, 4, 3, 2, 1];

const AMENITY_OPTIONS = [
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "parking", label: "Otopark", icon: "🅿️" },
  { id: "prayer", label: "Mescit", icon: "🕌" },
  { id: "prayer_hall", label: "Namaz Alanı", icon: "🕌" },
  { id: "qibla", label: "Kıble Yönü", icon: "🧭" },
  { id: "restaurant", label: "Restoran", icon: "🍽️" },
  { id: "halal_food", label: "Helal Yemek", icon: "🍖" },
  { id: "ac", label: "Klima", icon: "❄️" },
  { id: "elevator", label: "Asansör", icon: "🛗" },
  { id: "shuttle", label: "Harem Servisi", icon: "🚐" },
  { id: "family_rooms", label: "Aile Odaları", icon: "👨‍👩‍👧‍👦" },
  { id: "disabled_access", label: "Engelli Erişimi", icon: "♿" },
];

const BOARD_BASIS_OPTIONS = [
  { id: "meals_included", label: "Yemek Dahil", icon: "🍽️" },
  { id: "room_only", label: "Yemek Dahil Değil", icon: "🏠" },
];

const DISTANCE_OPTIONS = [
  { id: 0.5, label: "500m" },
  { id: 1, label: "1km" },
  { id: 2, label: "2km" },
  { id: 5, label: "5km" },
  { id: 10, label: "10km+" },
];

/* ────────── Price Range Slider ────────── */

function PriceRangeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [min, max] = value;
  const minLimit = 0;
  const maxLimit = 5000;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= max) {
      onChange([newMin, max]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= min) {
      onChange([min, newMax]);
    }
  };

  const minPercent = (min / maxLimit) * 100;
  const maxPercent = (max / maxLimit) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span>💰</span>
        <span>Fiyat Aralığı (USD)</span>
      </div>
      
      {/* Price Display Boxes */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
          <p className="text-[10px] text-slate-400 uppercase">Min</p>
          <p className="text-sm font-bold text-emerald-700">${min}</p>
        </div>
        <div className="w-4 h-px bg-slate-300" />
        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
          <p className="text-[10px] text-slate-400 uppercase">Max</p>
          <p className="text-sm font-bold text-emerald-700">${max}</p>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-emerald-500 rounded-full"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={50}
          value={min}
          onChange={handleMinChange}
          className="absolute w-full h-6 opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: "auto" }}
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={50}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-6 opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: "auto" }}
        />
        {/* Thumb indicators */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-sm z-10 pointer-events-none"
          style={{ left: `calc(${minPercent}% - 8px)` }}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-sm z-10 pointer-events-none"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
        />
      </div>
    </div>
  );
}

/* ────────── Checkbox Filter ────────── */

function CheckboxFilter({
  label,
  options,
  selected,
  onChange,
  icon,
}: {
  label: string;
  options: Array<{ id: string | number; label: string; icon?: string }>;
  selected: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  icon?: React.ReactNode;
}) {
  const toggleOption = (id: string | number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {icon}
        <span>{label}</span>
      </div>
      <div className="space-y-1.5">
        {options.map((option) => (
          <label
            key={String(option.id)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => toggleOption(option.id)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ────────── Active Filters Badge ────────── */

function ActiveFiltersBadge({
  filters,
  onClear,
}: {
  filters: HotelFilters;
  onClear: () => void;
}) {
  const count = [
    filters.priceRange,
    filters.stars?.length,
    filters.amenities?.length,
    filters.distance,
    filters.boardBasis?.length,
    filters.freeCancellation,
  ].filter(Boolean).length;

  if (count === 0) return null;

  return (
    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium">
      {count} filtre aktif
    </Badge>
  );
}

/* ────────── Main Component ────────── */

export function HotelFilters({
  filters,
  onFiltersChange,
  resultsCount,
  onClear,
  isOpen,
  onToggle,
}: HotelFiltersProps) {
  const [localFilters, setLocalFilters] = useState<HotelFilters>(filters);
  const ref = useRef<HTMLDivElement>(null);

  const updateFilter = useCallback(
    <K extends keyof HotelFilters>(key: K, value: HotelFilters[K]) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [localFilters, onFiltersChange],
  );

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof HotelFilters] !== undefined &&
      (Array.isArray(filters[key as keyof HotelFilters])
        ? (filters[key as keyof HotelFilters] as any[]).length > 0
        : true),
  );

  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-slate-900">Filtreler</h3>
          <ActiveFiltersBadge filters={filters} onClear={onClear} />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Temizle
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{resultsCount}</span> otel
        bulundu
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <PriceRangeSlider
          value={localFilters.priceRange || [0, 5000]}
          onChange={(value) => updateFilter("priceRange", value)}
        />
      </div>

      {/* Star Rating */}
      <CheckboxFilter
        label="Yıldız Ratingi"
        options={STAR_OPTIONS.map((star) => ({
          id: star,
          label: `${star} Yıldız`,
          icon: "⭐",
        }))}
        selected={localFilters.stars || []}
        onChange={(selected) => updateFilter("stars", selected as number[])}
        icon={<Star className="w-4 h-4 text-amber-500" />}
      />

      {/* Free Cancellation - Under Stars */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span>✅</span>
          <span>İptal Koşulları</span>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer group pl-1">
          <input
            type="checkbox"
            checked={localFilters.freeCancellation || false}
            onChange={(e) => updateFilter("freeCancellation", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
            Ücretsiz İptal Edilebilir
          </span>
        </label>
      </div>

      {/* Distance */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Harem'e Uzaklık</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => updateFilter("distance", option.id)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg border transition-all",
                localFilters.distance === option.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Board Basis */}
      <CheckboxFilter
        label="Yemek Durumu"
        options={BOARD_BASIS_OPTIONS}
        selected={localFilters.boardBasis || []}
        onChange={(selected) => updateFilter("boardBasis", selected as string[])}
        icon={<Utensils className="w-4 h-4 text-emerald-600" />}
      />

      {/* Amenities - Collapsible */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setAmenitiesOpen(!amenitiesOpen)}
          className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Olanaklar</span>
          </span>
          {amenitiesOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {amenitiesOpen && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg">
            {AMENITY_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={(localFilters.amenities || []).includes(option.id)}
                  onChange={(e) => {
                    const current = localFilters.amenities || [];
                    if (e.target.checked) {
                      updateFilter("amenities", [...current, option.id] as string[]);
                    } else {
                      updateFilter("amenities", current.filter((id) => id !== option.id) as string[]);
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  {option.icon && <span className="mr-1">{option.icon}</span>}
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile: Collapsible
  if (isOpen !== undefined) {
    return (
      <div className="lg:hidden" ref={ref}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-900">Filtreler</span>
            <ActiveFiltersBadge filters={filters} onClear={onClear} />
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-slate-400 rotate-180" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="mt-3 p-5 bg-white border border-slate-200 rounded-xl">
            {content}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Always visible
  return (
    <div className="hidden lg:block p-5 bg-white border border-slate-200 rounded-xl">
      {content}
    </div>
  );
}
