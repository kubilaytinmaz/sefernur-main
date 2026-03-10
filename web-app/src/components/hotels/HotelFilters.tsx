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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  prices?: number[]; // Tüm otel fiyatları - histogram için
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

/* ────────── Helper Functions ────────── */

/**
 * Akıllı step hesaplama - fiyat aralığına göre hassasiyet ayarlar
 */
function calculateStep(minLimit: number, maxLimit: number): number {
  const range = maxLimit - minLimit;
  
  if (range <= 500) return 5;      // 0-500 arası 5 birim
  if (range <= 2000) return 10;    // 500-2000 arası 10 birim
  if (range <= 5000) return 25;    // 2000-5000 arası 25 birim
  if (range <= 10000) return 50;   // 5000-10000 arası 50 birim
  return 100;                      // 10000+ için 100 birim
}

/**
 * Thumb pozisyonunu hesapla - kenar taşmalarını önle
 */
function clampThumbPosition(percent: number): number {
  return Math.max(0, Math.min(100, percent));
}

/* ────────── Price Range Slider with Histogram ────────── */

function PriceRangeSlider({
  value,
  onChange,
  prices,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  prices?: number[];
}) {
  const [min, max] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  
  // Dinamik limitler - gerçek fiyatlara göre
  const allPrices = prices || [];
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 1000;
  
  // Sabit padding ekle (yüzde yerine sabit değer)
  const paddingAmount = Math.max(50, (maxPrice - minPrice) * 0.05);
  const minLimit = Math.floor(Math.max(0, minPrice - paddingAmount));
  const maxLimit = Math.ceil(maxPrice + paddingAmount);
  
  // Akıllı step hesaplama
  const step = calculateStep(minLimit, maxLimit);

  // Histogram hesaplama - optimize edilmiş versiyon
  const histogramBars = useMemo(() => {
    const barCount = 10;
    const range = maxLimit - minLimit;
    const barWidth = range / barCount;
    
    // Tüm bar'ların count'larını tek döngüde hesapla
    const barCounts = Array.from({ length: barCount }, () => 0);
    
    for (const price of allPrices) {
      const barIndex = Math.min(
        Math.floor((price - minLimit) / barWidth),
        barCount - 1
      );
      barCounts[barIndex]++;
    }
    
    const maxCount = Math.max(...barCounts, 1);
    
    const bars = barCounts.map((count, i) => {
      const barStart = minLimit + (i * barWidth);
      const barEnd = i === barCount - 1 ? maxLimit : barStart + barWidth;
      
      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
      
      // Seçili aralıkta mı? (son bar için <= kullanımı düzeltildi)
      const inRange = min < barEnd && max > barStart;
      
      return { height: Math.max(height, 8), inRange, barStart, barEnd };
    });
    
    return bars;
  }, [allPrices, minLimit, maxLimit, min, max]);

  // Histogram bar tıklama handler'ı
  const handleBarClick = useCallback((barStart: number, barEnd: number) => {
    onChange([Math.round(barStart), Math.round(barEnd)]);
  }, [onChange]);

  const minPercent = clampThumbPosition(((min - minLimit) / (maxLimit - minLimit)) * 100);
  const maxPercent = clampThumbPosition(((max - minLimit) / (maxLimit - minLimit)) * 100);

  // Mouse/Touch event handler'ları
  const handlePointerDown = (thumb: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const clampedPercent = Math.max(0, Math.min(1, percent));
    const newValue = minLimit + clampedPercent * (maxLimit - minLimit);
    
    // Step'e yuvarla
    const steppedValue = Math.round(newValue / step) * step;
    
    if (isDragging === "min") {
      const newMin = Math.min(steppedValue, max - step);
      onChange([newMin, max]);
    } else {
      const newMax = Math.max(steppedValue, min + step);
      onChange([min, newMax]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(null);
  };

  // Fallback input handlers (touch cihazlar için)
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= max - step) {
      onChange([newMin, max]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= min + step) {
      onChange([min, newMax]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span className="text-sm">💰</span>
          <span>Fiyat Aralığı</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-emerald-600">${Math.round(min)}</span>
          <span className="text-slate-400">-</span>
          <span className="font-bold text-emerald-600">${Math.round(max)}</span>
        </div>
      </div>

      {/* Histogram Chart */}
      <div className="relative h-16 flex items-end gap-0.5 px-1 bg-slate-50 rounded-lg p-2 overflow-hidden">
        {histogramBars.map((bar, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleBarClick(bar.barStart, bar.barEnd)}
            className="flex-1 transition-all duration-300 min-h-0 cursor-pointer hover:opacity-80 active:opacity-60"
            style={{ height: `${bar.height}%` }}
            title={`$${Math.round(bar.barStart)} - $${Math.round(bar.barEnd)}`}
          >
            <div
              className={cn(
                "w-full h-full rounded-sm transition-colors duration-300",
                bar.inRange
                  ? "bg-gradient-to-t from-emerald-400 to-emerald-300"
                  : "bg-slate-200"
              )}
            />
          </button>
        ))}
      </div>

      {/* Slider Track */}
      <div 
        ref={trackRef}
        className="relative h-6 flex items-center"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background Track */}
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full top-1/2 -translate-y-1/2" />
        
        {/* Active Range */}
        <div
          className="absolute h-1.5 bg-emerald-500 rounded-full top-1/2 -translate-y-1/2"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        
        {/* Invisible inputs for touch devices */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={min}
          onChange={handleMinChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: isDragging === null ? "auto" : "none" }}
        />
        
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
          style={{ pointerEvents: isDragging === null ? "auto" : "none" }}
        />
        
        {/* Min Thumb */}
        <div
          className={cn(
            "absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md z-20 cursor-grab active:cursor-grabbing transition-transform",
            isDragging === "min" && "scale-125"
          )}
          style={{ 
            left: `calc(${minPercent}% - 8px)`,
            top: "50%",
            transform: "translateY(-50%)"
          }}
          onPointerDown={handlePointerDown("min")}
        />
        
        {/* Max Thumb */}
        <div
          className={cn(
            "absolute w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-md z-20 cursor-grab active:cursor-grabbing transition-transform",
            isDragging === "max" && "scale-125"
          )}
          style={{ 
            left: `calc(${maxPercent}% - 8px)`,
            top: "50%",
            transform: "translateY(-50%)"
          }}
          onPointerDown={handlePointerDown("max")}
        />
      </div>
      
      {/* Range Labels */}
      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>${minLimit}</span>
        <span>${maxLimit}</span>
      </div>
    </div>
  );
}

/* ────────── Compact Star Filter with Visual Rating ────────── */

function StarFilter({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (selected: number[]) => void;
}) {
  const toggleStar = (star: number) => {
    if (selected.includes(star)) {
      onChange(selected.filter((s) => s !== star));
    } else {
      onChange([...selected, star]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Yıldız</span>
      </div>
      <div className="flex gap-1.5">
        {STAR_OPTIONS.map((star) => {
          const isSelected = selected.includes(star);
          return (
            <button
              key={star}
              type="button"
              onClick={() => toggleStar(star)}
              className={cn(
                "flex-1 h-9 rounded-lg border-2 transition-all flex items-center justify-center gap-0.5 group cursor-pointer",
                isSelected
                  ? "border-amber-400 bg-amber-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold transition-colors",
                  isSelected ? "text-amber-600" : "text-slate-500 group-hover:text-amber-500"
                )}
              >
                {star}
              </span>
              <Star
                className={cn(
                  "w-3 h-3 transition-all",
                  isSelected
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-400 group-hover:text-amber-400"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── Compact Distance Filter ────────── */

function DistanceFilter({
  selected,
  onChange,
}: {
  selected?: number;
  onChange: (distance?: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
        <span>Harem'e Uzaklık</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {DISTANCE_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(isSelected ? undefined : option.id)}
              className={cn(
                "h-9 text-xs font-medium rounded-lg border-2 transition-all cursor-pointer",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50"
              )}
            >
              {option.label}
            </button>
          );
        })}
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
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        {icon}
        <span>{label}</span>
      </div>
      <div className="space-y-1">
        {options.map((option) => (
          <label
            key={String(option.id)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => toggleOption(option.id)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
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
      {count} aktif
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
  prices,
}: HotelFiltersProps) {
  const [localFilters, setLocalFilters] = useState<HotelFilters>(filters);
  const ref = useRef<HTMLDivElement>(null);

  // State senkronizasyonu - parent'tan gelen filters değiştiğinde localFilters'ı güncelle
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Dinamik varsayılan fiyat aralığı - fiyatlar geldiğinde otomatik ayarla
  const defaultPriceRange = useMemo(() => {
    if (!prices || prices.length === 0) return [0, 1000] as [number, number];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return [minPrice, maxPrice] as [number, number];
  }, [prices]);

  // İlk yüklemede fiyat aralığı yoksa varsayılanı kullan
  useEffect(() => {
    if (!localFilters.priceRange && prices && prices.length > 0) {
      setLocalFilters(prev => ({
        ...prev,
        priceRange: defaultPriceRange
      }));
    }
  }, [defaultPriceRange, prices, localFilters.priceRange]);

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">Filtreler</h3>
          <ActiveFiltersBadge filters={filters} onClear={onClear} />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Temizle
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
        <span className="font-bold text-slate-900">{resultsCount}</span> otel bulundu
      </div>

      {/* Price Range with Histogram */}
      <PriceRangeSlider
        value={localFilters.priceRange || defaultPriceRange}
        onChange={(value) => updateFilter("priceRange", value)}
        prices={prices}
      />

      {/* Star Rating - Compact */}
      <StarFilter
        selected={localFilters.stars || []}
        onChange={(selected) => updateFilter("stars", selected)}
      />

      {/* Distance - Compact */}
      <DistanceFilter
        selected={localFilters.distance}
        onChange={(distance) => updateFilter("distance", distance)}
      />

      {/* Free Cancellation - Compact Toggle */}
      <div className="space-y-2">
        <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">✅</span>
            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900">
              Ücretsiz İptal
            </span>
          </div>
          <input
            type="checkbox"
            checked={localFilters.freeCancellation || false}
            onChange={(e) => updateFilter("freeCancellation", e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          />
        </label>
      </div>

      {/* Board Basis */}
      <CheckboxFilter
        label="Yemek Durumu"
        options={BOARD_BASIS_OPTIONS}
        selected={localFilters.boardBasis || []}
        onChange={(selected) => updateFilter("boardBasis", selected as string[])}
        icon={<Utensils className="w-3.5 h-3.5 text-emerald-600" />}
      />

      {/* Amenities - Collapsible */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setAmenitiesOpen(!amenitiesOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Olanaklar</span>
          </span>
          {amenitiesOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
        
        {amenitiesOpen && (
          <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg">
            {AMENITY_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-1.5 cursor-pointer group"
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
                  className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                />
                <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                  {option.icon && <span className="mr-0.5">{option.icon}</span>}
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
          className="w-full flex items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-900">Filtreler</span>
            <ActiveFiltersBadge filters={filters} onClear={onClear} />
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
