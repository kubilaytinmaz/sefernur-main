/**
 * Price Per Person Component
 * 
 * Displays price per person calculation with breakdown
 */

import { formatTlUsdPairFromUsd } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

/* ────────── Types ────────── */

export interface PricePerPersonProps {
  totalPrice: number;
  guestCount: number;
  currency?: "USD" | "TRY" | "SAR";
  variant?: "compact" | "detailed";
  showIcon?: boolean;
  className?: string;
}

/* ────────── Component ────────── */

export function PricePerPerson({
  totalPrice,
  guestCount,
  currency = "USD",
  variant = "compact",
  showIcon = true,
  className,
}: PricePerPersonProps) {
  if (guestCount === 0) return null;

  const pricePerPerson = totalPrice / guestCount;

  // Compact variant - single line
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-slate-600",
          className
        )}
      >
        {showIcon && <Users className="w-3 h-3" />}
        <span>
          {formatTlUsdPairFromUsd(pricePerPerson)}/kişi
        </span>
      </div>
    );
  }

  // Detailed variant - with breakdown
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center gap-1">
          {showIcon && <Users className="w-3 h-3" />}
          <span>Kişi Başı</span>
        </span>
        <span className="font-semibold text-emerald-700">
          {formatTlUsdPairFromUsd(pricePerPerson)}
        </span>
      </div>
      <div className="text-[10px] text-slate-400">
        {guestCount} misafir için toplam {formatTlUsdPairFromUsd(totalPrice)}
      </div>
    </div>
  );
}
