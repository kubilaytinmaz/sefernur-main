// Transfer Fiyat Aralığı Slider - Histogram ile
// Otel filtrelerindeki PriceRangeSlider'dan esinlenilmiştir

"use client";

import { cn } from "@/lib/utils";
import { useCallback, useMemo, useRef, useState } from "react";

/* ────────── Types ────────── */

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  prices?: number[];
  currency?: string;
}

/* ────────── Helper Functions ────────── */

/**
 * Akıllı step hesaplama - fiyat aralığına göre hassasiyet ayarlar
 */
function calculateStep(minLimit: number, maxLimit: number): number {
  const range = maxLimit - minLimit;
  
  if (range <= 100) return 5;       // 0-100 arası 5 birim
  if (range <= 500) return 10;      // 100-500 arası 10 birim
  if (range <= 1000) return 25;     // 500-1000 arası 25 birim
  if (range <= 5000) return 50;     // 1000-5000 arası 50 birim
  return 100;                       // 5000+ için 100 birim
}

/**
 * Thumb pozisyonunu hesapla - kenar taşmalarını önle
 */
function clampThumbPosition(percent: number): number {
  return Math.max(0, Math.min(100, percent));
}

/* ────────── Component ────────── */

export function PriceRangeSlider({
  value,
  onChange,
  prices = [],
  currency = "$",
}: PriceRangeSliderProps) {
  const [min, max] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  
  // Dinamik limitler - gerçek fiyatlara göre
  const allPrices = prices;
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 500;
  
  // Sabit padding ekle
  const paddingAmount = Math.max(20, (maxPrice - minPrice) * 0.1);
  const minLimit = Math.floor(Math.max(0, minPrice - paddingAmount));
  const maxLimit = Math.ceil(maxPrice + paddingAmount);
  
  // Akıllı step hesaplama
  const step = calculateStep(minLimit, maxLimit);

  // Histogram hesaplama
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
      
      // Seçili aralıkta mı?
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

  const handlePointerUp = () => {
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
          <span className="font-bold text-cyan-600">{currency}{Math.round(min)}</span>
          <span className="text-slate-400">-</span>
          <span className="font-bold text-cyan-600">{currency}{Math.round(max)}</span>
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
            title={`${currency}${Math.round(bar.barStart)} - ${currency}${Math.round(bar.barEnd)}`}
          >
            <div
              className={cn(
                "w-full h-full rounded-sm transition-colors duration-300",
                bar.inRange
                  ? "bg-gradient-to-t from-cyan-400 to-cyan-300"
                  : "bg-slate-200"
              )}
            />
          </button>
        ))}
      </div>

      {/* Slider Track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center isolate"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Background Track */}
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full top-1/2 -translate-y-1/2 z-0" />
        
        {/* Active Range */}
        <div
          className="absolute h-1.5 bg-cyan-500 rounded-full top-1/2 -translate-y-1/2 z-0"
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
          className="absolute w-full h-full opacity-0 cursor-pointer z-0"
          style={{ pointerEvents: isDragging === null ? "auto" : "none" }}
        />
        
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          step={step}
          value={max}
          onChange={handleMaxChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-0"
          style={{ pointerEvents: isDragging === null ? "auto" : "none" }}
        />
        
        {/* Min Thumb */}
        <div
          className={cn(
            "absolute w-4 h-4 bg-white border-2 border-cyan-500 rounded-full shadow-md z-[1] cursor-grab active:cursor-grabbing transition-transform",
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
            "absolute w-4 h-4 bg-white border-2 border-cyan-500 rounded-full shadow-md z-[1] cursor-grab active:cursor-grabbing transition-transform",
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
        <span>{currency}{minLimit}</span>
        <span>{currency}{maxLimit}</span>
      </div>
    </div>
  );
}
