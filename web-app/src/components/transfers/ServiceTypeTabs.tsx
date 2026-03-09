// Hizmet Tipi Sekmeleri Bileşeni
// Transferler, Rehberler, Turlar sekmeleri

import type { ServiceType } from "@/lib/transfers/popular-services";
import { getServiceTypeLabel } from "@/lib/transfers/popular-services";
import { cn } from "@/lib/utils";
import { Car, Map, UserRound } from "lucide-react";

export interface ServiceTypeTabsProps {
  activeType: ServiceType;
  onTypeChange: (type: ServiceType) => void;
  counts: Record<ServiceType, number>;
  className?: string;
}

const serviceIcons: Record<ServiceType, React.ComponentType<{ className?: string }>> = {
  transfer: Car,
  guide: UserRound,
  tour: Map,
};

export function ServiceTypeTabs({
  activeType,
  onTypeChange,
  counts,
  className,
}: ServiceTypeTabsProps) {
  const types: ServiceType[] = ['transfer', 'guide', 'tour'];

  return (
    <div className={cn("flex items-center gap-1 bg-slate-100 p-1 rounded-lg", className)}>
      {types.map((type) => {
        const Icon = serviceIcons[type];
        const isActive = activeType === type;
        const count = counts[type] || 0;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              isActive
                ? "bg-white text-cyan-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{getServiceTypeLabel(type)}</span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full",
              isActive
                ? "bg-cyan-100 text-cyan-700"
                : "bg-slate-200 text-slate-600"
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
