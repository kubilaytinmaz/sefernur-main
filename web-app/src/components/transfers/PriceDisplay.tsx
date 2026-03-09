// Fiyat Gösterim Bileşeni
// Transfer, Rehber ve Tur fiyatlarını gösterir

import { formatTlUsdPairFromTl } from "@/lib/currency";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  price: number;
  priceType: 'per_person' | 'total';
  loading?: boolean;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({
  price,
  priceType,
  loading = false,
  className,
  showLabel = true,
  size = 'md',
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const priceSizeClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-lg font-bold',
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 bg-slate-200 rounded w-20 mb-1" />
        <div className="h-5 bg-slate-200 rounded w-24" />
      </div>
    );
  }

  return (
    <div className={cn("text-right", className)}>
      {showLabel && (
        <p className={cn(
          "text-slate-500 uppercase tracking-wider mb-0.5",
          sizeClasses[size]
        )}>
          {priceType === 'per_person' ? 'Kişi başı' : 'Toplam'}
        </p>
      )}
      <p className={cn(
        "text-cyan-700 leading-tight price-transition",
        priceSizeClasses[size]
      )}>
        {formatTlUsdPairFromTl(price)}
      </p>
    </div>
  );
}
