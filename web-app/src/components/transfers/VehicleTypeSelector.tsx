// Araç Tipi Seçici Bileşeni
// Transferler için araç tipi seçimi

import { cn } from "@/lib/utils";
import { vehicleTypeLabels, type VehicleType } from "@/types/transfer";
import { Bus, Car, Crown, Mountain, Truck } from "lucide-react";

export interface VehicleTypeSelectorProps {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

const vehicleIcons: Record<VehicleType, React.ComponentType<{ className?: string }>> = {
  sedan: Car,
  van: Car,
  vip: Crown,
  bus: Bus,
  jeep: Mountain,
  coster: Truck,
};

const vehicleDescriptions: Record<VehicleType, string> = {
  sedan: '1-4 Kişi',
  van: '5-8 Kişi',
  vip: '1-4 Kişi (Lüks)',
  bus: '16+ Kişi',
  jeep: '1-5 Kişi',
  coster: '9-15 Kişi',
};

export function VehicleTypeSelector({
  value,
  onChange,
  disabled = false,
  className,
  size = 'md',
}: VehicleTypeSelectorProps) {
  const sizeClasses = {
    sm: 'h-9 px-2.5 text-xs',
    md: 'h-10 px-3 text-sm',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as VehicleType)}
      disabled={disabled}
      className={cn(
        "rounded-lg border border-slate-200 bg-white text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500",
        "cursor-pointer hover:border-slate-300 transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        className
      )}
    >
      {Object.entries(vehicleTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>
          {label} ({vehicleDescriptions[type as VehicleType]})
        </option>
      ))}
    </select>
  );
}

// Buton gruplu araç seçici (alternatif UI)
export function VehicleTypeButtonGroup({
  value,
  onChange,
  disabled = false,
  className,
}: Omit<VehicleTypeSelectorProps, 'size'>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Object.entries(vehicleTypeLabels).map(([type, label]) => {
        const Icon = vehicleIcons[type as VehicleType];
        const isActive = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type as VehicleType)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all",
              "text-xs font-medium whitespace-nowrap",
              isActive
                ? "border-cyan-500 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
