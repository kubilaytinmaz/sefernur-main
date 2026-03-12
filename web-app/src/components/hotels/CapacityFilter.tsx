/**
 * Capacity Filter Component
 * 
 * Filter hotels by capacity (max guests, room count)
 */

import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

/* ────────── Types ────────── */

export interface CapacityFilterProps {
  minCapacity?: number;
  maxCapacity?: number;
  minRooms?: number;
  onChange: (filters: {
    minCapacity?: number;
    maxCapacity?: number;
    minRooms?: number;
  }) => void;
  className?: string;
}

/* ────────── Constants ────────── */

const CAPACITY_OPTIONS = [
  { label: "Tümü", value: undefined },
  { label: "2+ misafir", value: 2 },
  { label: "4+ misafir", value: 4 },
  { label: "6+ misafir", value: 6 },
  { label: "8+ misafir", value: 8 },
  { label: "10+ misafir", value: 10 },
];

const ROOM_OPTIONS = [
  { label: "Tümü", value: undefined },
  { label: "1+ oda", value: 1 },
  { label: "2+ oda", value: 2 },
  { label: "3+ oda", value: 3 },
];

/* ────────── Component ────────── */

export function CapacityFilter({
  minCapacity,
  maxCapacity,
  minRooms,
  onChange,
  className,
}: CapacityFilterProps) {
  const handleCapacityChange = (value: number | undefined) => {
    onChange({
      minCapacity: value,
      maxCapacity,
      minRooms,
    });
  };

  const handleRoomsChange = (value: number | undefined) => {
    onChange({
      minCapacity,
      maxCapacity,
      minRooms: value,
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Capacity Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Kapasite</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {CAPACITY_OPTIONS.map((option) => {
            const isSelected = minCapacity === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => handleCapacityChange(option.value)}
                className={cn(
                  "h-9 text-xs font-medium rounded-lg border-2 transition-all",
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

      {/* Room Count Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span className="text-sm">🏠</span>
          <span>Oda Sayısı</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {ROOM_OPTIONS.map((option) => {
            const isSelected = minRooms === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => handleRoomsChange(option.value)}
                className={cn(
                  "h-9 text-xs font-medium rounded-lg border-2 transition-all",
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
    </div>
  );
}
