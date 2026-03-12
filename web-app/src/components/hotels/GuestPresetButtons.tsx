/**
 * Guest Preset Buttons Component
 * 
 * Quick selection buttons for common guest configurations:
 * - Couple (2 adults)
 * - Family (2 adults, 2 children)
 * - Group (2 rooms, 5 guests)
 * - Large Group (3 rooms, 8 guests)
 */

import { GUEST_PRESETS } from "@/lib/hotels/capacity-utils";
import { cn } from "@/lib/utils";
import type { Room } from "./HotelSearchForm";

/* ────────── Types ────────── */

export interface GuestPresetButtonsProps {
  onSelect: (rooms: Room[]) => void;
  currentRooms: Room[];
  disabled?: boolean;
}

/* ────────── Component ────────── */

export function GuestPresetButtons({
  onSelect,
  currentRooms,
  disabled = false,
}: GuestPresetButtonsProps) {
  // Check if a preset matches current configuration
  const isPresetActive = (presetRooms: Room[]): boolean => {
    if (presetRooms.length !== currentRooms.length) return false;

    return presetRooms.every((room, index) => {
      const current = currentRooms[index];
      return (
        room.adults === current.adults &&
        room.children === current.children &&
        room.childAges.length === current.childAges.length &&
        room.childAges.every((age, i) => age === current.childAges[i])
      );
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600">Hızlı Seçim</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GUEST_PRESETS.map((preset) => {
          const isActive = isPresetActive(preset.rooms);

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelect(preset.rooms)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                isActive
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="text-2xl">{preset.icon}</span>
              <span
                className={cn(
                  "text-xs font-semibold",
                  isActive ? "text-emerald-700" : "text-slate-700"
                )}
              >
                {preset.label}
              </span>
              <span className="text-[10px] text-slate-500">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
