// Hizmet Kartı Bileşeni
// Transfer, Rehber ve Tur kartları (aynı yükseklik)

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { PopularService } from "@/lib/transfers/popular-services";
import { calculateServicePrice } from "@/lib/transfers/service-pricing";
import { cn } from "@/lib/utils";
import type { VehicleType } from "@/types/transfer";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";

export interface ServiceCardProps {
  service: PopularService;
  vehicleType?: VehicleType; // Transfer için
  passengerCount: number;
  luggageCount?: number; // Transfer için
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ServiceCard({
  service,
  vehicleType = 'sedan',
  passengerCount,
  luggageCount = 2,
  isActive = false,
  onClick,
  className,
}: ServiceCardProps) {
  // Fiyat hesapla
  const priceResult = calculateServicePrice(service, {
    vehicleType,
    passengerCount,
    luggageCount,
  });

  // Öne çıkan özelliklerden ilk 2-3 tanesini göster
  const displayHighlights = service.highlights.slice(0, 3);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group h-full cursor-pointer transition-all duration-200",
        onClick && "hover:scale-[1.02]",
        className
      )}
    >
      <Card className={cn(
        "h-full flex flex-col border-slate-200 transition-all",
        isActive
          ? "border-cyan-500 ring-2 ring-cyan-200 shadow-lg"
          : "hover:border-cyan-300 hover:shadow-md"
      )}>
        <CardContent className="p-4 flex flex-col h-full">
          {/* Üst kısım: İkon, Başlık, Kategori */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
              isActive ? "bg-cyan-100" : "bg-slate-100 group-hover:bg-cyan-50 transition-colors"
            )}>
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold leading-tight line-clamp-2 transition-colors",
                isActive ? "text-cyan-700" : "text-slate-900 group-hover:text-cyan-700"
              )}>
                {service.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {service.description}
              </p>
            </div>
            {service.isPopular && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0.5 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-500" />
              </Badge>
            )}
          </div>

          {/* Orta kısım: Detaylar ve Öne Çıkanlar */}
          <div className="flex-grow space-y-2 mb-3">
            {/* Süre ve Mesafe */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{service.duration.text}</span>
              </div>
              {service.distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{service.distance.text}</span>
                </div>
              )}
            </div>

            {/* Lokasyon */}
            {service.to && (
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span className="font-medium">{service.from.city}</span>
                <span className="text-slate-400">→</span>
                <span className="font-medium">{service.to.city}</span>
              </div>
            )}

            {/* Öne Çıkan Özellikler */}
            {displayHighlights.length > 0 && (
              <div className="space-y-1">
                {displayHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
                    <span className="line-clamp-1">{highlight}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Dil bilgisi (Rehber/Tur için) */}
            {service.type !== 'transfer' && service.languages.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-3 h-3 shrink-0" />
                <span>{service.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Alt kısım: Fiyat (mt-auto ile alta yapışır) */}
          <div className="pt-3 mt-auto border-t border-slate-100">
            <PriceDisplay
              price={priceResult.total}
              priceType={priceResult.priceType}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
