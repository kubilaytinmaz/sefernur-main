/**
 * Capacity Badge Component
 * 
 * Displays hotel capacity information with visual indicators:
 * - Maximum occupancy
 * - Suitability for guest count
 * - Room availability
 */

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { HotelCapacity } from "@/types/hotel";
import { AlertCircle, CheckCircle2, Users } from "lucide-react";

/* ────────── Types ────────── */

export interface CapacityBadgeProps {
  capacity: HotelCapacity;
  requestedGuests: number;
  requestedRooms: number;
  variant?: "compact" | "detailed";
  className?: string;
}

/* ────────── Helper Functions ────────── */

function getCapacityStatus(
  capacity: HotelCapacity,
  requestedGuests: number
): {
  status: "suitable" | "limited" | "insufficient";
  color: "emerald" | "amber" | "red";
  icon: React.ReactNode;
  message: string;
} {
  if (requestedGuests <= capacity.maxOccupancy) {
    return {
      status: "suitable",
      color: "emerald",
      icon: <CheckCircle2 className="w-3 h-3" />,
      message: `Maksimum ${capacity.maxOccupancy} misafir`,
    };
  }

  if (requestedGuests <= capacity.maxOccupancy * 1.5) {
    return {
      status: "limited",
      color: "amber",
      icon: <AlertCircle className="w-3 h-3" />,
      message: "Sınırlı kapasite",
    };
  }

  return {
  status: "insufficient",
  color: "red",
  icon: <AlertCircle className="w-3 h-3" />,
  message: "Yetersiz kapasite",
};
}

/* ────────── Compact Variant ────────── */

function CompactCapacityBadge({
  capacity,
  requestedGuests,
  className,
}: Omit<CapacityBadgeProps, "variant">) {
  const { status, color, icon, message } = getCapacityStatus(
    capacity,
    requestedGuests
  );

  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Badge
      className={cn(
        "text-xs font-medium gap-1.5",
        colorClasses[color],
        className
      )}
    >
      {icon}
      <span>{message}</span>
    </Badge>
  );
}

/* ────────── Detailed Variant ────────── */

function DetailedCapacityBadge({
  capacity,
  requestedGuests,
  requestedRooms,
  className,
}: Omit<CapacityBadgeProps, "variant">) {
  const { status, color, icon, message } = getCapacityStatus(
    capacity,
    requestedGuests
  );

  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  const canAccommodate = requestedGuests <= capacity.maxOccupancy;
  const hasEnoughRooms = requestedRooms <= capacity.availableRooms;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold">{message}</span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>
            {requestedGuests} / {capacity.maxOccupancy}
          </span>
        </div>

        {canAccommodate && hasEnoughRooms && (
          <span className="text-[10px] opacity-75">
            • {capacity.availableRooms} oda mevcut
          </span>
        )}
      </div>
    </div>
  );
}

/* ────────── Main Component ────────── */

export function CapacityBadge({
  variant = "compact",
  ...props
}: CapacityBadgeProps) {
  if (variant === "detailed") {
    return <DetailedCapacityBadge {...props} />;
  }

  return <CompactCapacityBadge {...props} />;
}
