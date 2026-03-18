// Transfer Araç Tipi Filtresi - Görsel Kart Tasarımı
// Her araç tipi için ikon, isim ve kapasite bilgisi

"use client";

import { cn } from "@/lib/utils";
import { VehicleType, vehicleTypeLabels } from "@/types/transfer";
import { Bus, Car, Crown, LucideIcon, Users, Wind } from "lucide-react";

/* ────────── Types ────────── */

interface VehicleTypeFilterProps {
  selected: VehicleType[];
  onChange: (selected: VehicleType[]) => void;
}

/* ────────── Constants ────────── */

// Araç tipi ikonları ve kapasiteleri
const VEHICLE_TYPE_CONFIG: Record<VehicleType, {
  icon: LucideIcon;
  label: string;
  capacity: number;
  color: string;
}> = {
  sedan: {
    icon: Car,
    label: vehicleTypeLabels.sedan,
    capacity: 3,
    color: "text-blue-600",
  },
  van: {
    icon: Users,
    label: vehicleTypeLabels.van,
    capacity: 6,
    color: "text-emerald-600",
  },
  coster: {
    icon: Wind,
    label: vehicleTypeLabels.coster,
    capacity: 12,
    color: "text-purple-600",
  },
  bus: {
    icon: Bus,
    label: vehicleTypeLabels.bus,
    capacity: 45,
    color: "text-orange-600",
  },
  vip: {
    icon: Crown,
    label: vehicleTypeLabels.vip,
    capacity: 6,
    color: "text-amber-600",
  },
  jeep: {
    icon: Car,
    label: vehicleTypeLabels.jeep,
    capacity: 5,
    color: "text-slate-600",
  },
};

/* ────────── Component ────────── */

export function VehicleTypeFilter({ selected, onChange }: VehicleTypeFilterProps) {
  const toggleVehicleType = (type: VehicleType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Car className="w-3.5 h-3.5 text-cyan-600" />
        <span>Araç Tipi</span>
      </div>

      {/* Vehicle Type Grid */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(VEHICLE_TYPE_CONFIG) as [VehicleType, typeof VEHICLE_TYPE_CONFIG[VehicleType]][]).map(
          ([type, config]) => {
            const isSelected = selected.includes(type);
            const Icon = config.icon;

            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleVehicleType(type)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer group",
                  isSelected
                    ? "border-cyan-400 bg-cyan-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/30"
                )}
              >
                {/* Icon */}
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isSelected
                      ? "text-cyan-600"
                      : `${config.color} group-hover:text-cyan-500`
                  )}
                />

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium transition-colors text-center",
                    isSelected
                      ? "text-cyan-700"
                      : "text-slate-600 group-hover:text-cyan-600"
                  )}
                >
                  {config.label}
                </span>

                {/* Capacity Badge */}
                <div
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
                    isSelected
                      ? "bg-cyan-100 text-cyan-700"
                      : "bg-slate-100 text-slate-600 group-hover:bg-cyan-100 group-hover:text-cyan-600"
                  )}
                >
                  <Users className="w-2.5 h-2.5" />
                  <span>{config.capacity}</span>
                </div>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
