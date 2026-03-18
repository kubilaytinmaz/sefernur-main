// Transfer Filtreleme Bileşeni - Modern Tasarım
// Araç tipi, kapasite, fiyat aralığı ve özelliklere göre filtreleme
// Otel filtreleri ile tutarlı, modern ve kullanıcı dostu tasarım

"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { VehicleAmenity, VehicleType } from "@/types/transfer";
import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Alt bileşenler
import { AmenitiesFilter } from "./filters/AmenitiesFilter";
import { CapacityFilter } from "./filters/CapacityFilter";
import { PriceRangeSlider } from "./filters/PriceRangeSlider";
import { SortOptions } from "./filters/SortOptions";
import { VehicleTypeFilter } from "./filters/VehicleTypeFilter";

/* ────────── Types ────────── */

export interface TransferFiltersState {
  vehicleTypes: VehicleType[];
  capacityRange: { min: number; max: number };
  priceRange: { min: number; max: number };
  amenities: VehicleAmenity[];
  sortBy: 'price-asc' | 'price-desc' | 'capacity-asc' | 'rating-desc';
}

interface TransferFiltersProps {
  filters: TransferFiltersState;
  onChange: (filters: TransferFiltersState) => void;
  resultCount: number;
  minPrice?: number;
  maxPrice?: number;
  prices?: number[]; // Tüm fiyatlar - histogram için
  passengerCount?: number; // URL'den gelen yolcu sayısı
  isOpen?: boolean; // Mobile için
  onToggle?: () => void;
}

/* ────────── Helper Functions ────────── */

/**
 * Yolcu sayısına göre varsayılan kapasite aralığı
 */
function getCapacityRangeForPassengers(passengers: number): { min: number; max: number } {
  if (passengers <= 3) return { min: 1, max: 999 };
  if (passengers <= 6) return { min: 4, max: 999 };
  if (passengers <= 10) return { min: 7, max: 999 };
  if (passengers <= 20) return { min: 11, max: 999 };
  return { min: 20, max: 999 };
}

/* ────────── Active Filters Badge ────────── */

function ActiveFiltersBadge({
  filters,
  passengerCount = 1,
}: {
  filters: TransferFiltersState;
  passengerCount?: number;
}) {
  const defaultCapacity = getCapacityRangeForPassengers(passengerCount);
  
  const count = [
    filters.vehicleTypes.length > 0,
    filters.capacityRange.min !== defaultCapacity.min || filters.capacityRange.max !== defaultCapacity.max,
    filters.priceRange.min > 0,
    filters.amenities.length > 0,
  ].filter(Boolean).length;

  if (count === 0) return null;

  return (
    <Badge className="bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-medium">
      {count} aktif
    </Badge>
  );
}

/* ────────── Main Component ────────── */

export function TransferFilters({
  filters,
  onChange,
  resultCount,
  minPrice = 0,
  maxPrice = 500,
  prices = [],
  passengerCount = 1,
  isOpen,
  onToggle,
}: TransferFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TransferFiltersState>(filters);
  const ref = useRef<HTMLDivElement>(null);

  // State senkronizasyonu - parent'tan gelen filters değiştiğinde localFilters'ı güncelle
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Dinamik varsayılan fiyat aralığı
  const defaultPriceRange = useMemo(() => {
    if (prices.length === 0) return [minPrice, maxPrice] as [number, number];
    const actualMin = Math.min(...prices);
    const actualMax = Math.max(...prices);
    return [actualMin, actualMax] as [number, number];
  }, [prices, minPrice, maxPrice]);

  // İlk yüklemede fiyat aralığı yoksa varsayılanı kullan
  useEffect(() => {
    if (prices.length > 0 && localFilters.priceRange.min === 0 && localFilters.priceRange.max === 500) {
      setLocalFilters(prev => ({
        ...prev,
        priceRange: { min: defaultPriceRange[0], max: defaultPriceRange[1] }
      }));
    }
  }, [defaultPriceRange, prices, localFilters.priceRange]);

  const updateFilter = useCallback(
    <K extends keyof TransferFiltersState>(key: K, value: TransferFiltersState[K]) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
      onChange(newFilters);
    },
    [localFilters, onChange],
  );

  const clearFilters = useCallback(() => {
    const cleared: TransferFiltersState = {
      vehicleTypes: [],
      capacityRange: getCapacityRangeForPassengers(passengerCount),
      priceRange: { min: defaultPriceRange[0], max: defaultPriceRange[1] },
      amenities: [],
      sortBy: 'price-asc',
    };
    setLocalFilters(cleared);
    onChange(cleared);
  }, [onChange, defaultPriceRange, passengerCount]);

  const hasActiveFilters = useMemo(() => {
    const defaultCapacity = getCapacityRangeForPassengers(passengerCount);
    return (
      localFilters.vehicleTypes.length > 0 ||
      localFilters.capacityRange.min !== defaultCapacity.min ||
      localFilters.capacityRange.max !== defaultCapacity.max ||
      localFilters.amenities.length > 0
    );
  }, [localFilters, passengerCount]);

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
          <h3 className="text-sm font-semibold text-slate-900">Filtreler</h3>
          <ActiveFiltersBadge filters={localFilters} passengerCount={passengerCount} />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Temizle
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
        <span className="font-bold text-slate-900">{resultCount}</span> araç bulundu
      </div>

      {/* Price Range with Histogram */}
      <PriceRangeSlider
        value={[localFilters.priceRange.min, localFilters.priceRange.max]}
        onChange={(value) => updateFilter("priceRange", { min: value[0], max: value[1] })}
        prices={prices}
      />

      {/* Vehicle Type - Grid Cards */}
      <VehicleTypeFilter
        selected={localFilters.vehicleTypes}
        onChange={(value) => updateFilter("vehicleTypes", value)}
      />

      {/* Capacity - Smart Range */}
      <CapacityFilter
        value={localFilters.capacityRange}
        onChange={(value) => updateFilter("capacityRange", value)}
        passengerCount={passengerCount}
      />

      {/* Amenities - Categorized */}
      <AmenitiesFilter
        selected={localFilters.amenities}
        onChange={(value) => updateFilter("amenities", value)}
      />

      {/* Sort Options */}
      <SortOptions
        value={localFilters.sortBy}
        onChange={(value) => updateFilter("sortBy", value)}
      />
    </div>
  );

  // Mobile: Collapsible
  if (isOpen !== undefined) {
    return (
      <div className="lg:hidden" ref={ref}>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-between gap-3 p-3.5 bg-white border rounded-xl transition-colors cursor-pointer",
            hasActiveFilters ? "border-cyan-300 shadow-sm" : "border-slate-200 hover:border-cyan-300"
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-slate-900">Filtreler</span>
            <ActiveFiltersBadge filters={localFilters} passengerCount={passengerCount} />
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-400 rotate-180" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isOpen && (
          <div className="mt-3 p-4 bg-white border border-slate-200 rounded-xl">
            {content}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Always visible - Compact Design
  return (
    <div className="hidden lg:block p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
      {content}
    </div>
  );
}
