"use client";

// Popüler Transfer Rotaları Bölümü - Basitleştirilmiş
// Sadece transfer rotaları gösterir, fiyat gösterilmez

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { POPULAR_ROUTES } from "@/lib/transfers/popular-routes";
import { cn } from "@/lib/utils";
import { Clock3, MapPin, Star } from "lucide-react";

export interface PopularRoutesSectionProps {
  onRouteSelect?: (routeId: string) => void;
  selectedRouteId?: string | null;
  className?: string;
}

export function PopularRoutesSection({
  onRouteSelect,
  selectedRouteId,
  className,
}: PopularRoutesSectionProps) {
  return (
    <section className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", className)}>
      {/* Başlık */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Popüler Transfer Rotaları</h2>
        <p className="mt-0.5 text-xs text-slate-500">En çok tercih edilen güzergahlar - Seçim yapın, fiyatları gör</p>
      </div>

      {/* Rota Kartları Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {POPULAR_ROUTES.map((route) => {
          const isSelected = selectedRouteId === route.id;

          return (
            <button
              key={route.id}
              type="button"
              onClick={() => onRouteSelect?.(route.id)}
              className={cn(
                "group h-full text-left transition-all duration-200",
                isSelected
                  ? "scale-[1.02]"
                  : "hover:scale-[1.01]"
              )}
            >
              <Card className={cn(
                "h-full flex flex-col border-slate-200 transition-all cursor-pointer",
                isSelected
                  ? "border-cyan-500 ring-2 ring-cyan-200 shadow-lg bg-cyan-50"
                  : "hover:border-cyan-300 hover:shadow-md bg-white"
              )}>
                <CardContent className="p-3 flex flex-col h-full">
                  {/* Üst kısım: İkon ve Başlık */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                      isSelected ? "bg-cyan-100" : "bg-slate-100 group-hover:bg-cyan-50 transition-colors"
                    )}>
                      {route.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-xs font-semibold leading-tight line-clamp-2 transition-colors",
                        isSelected ? "text-cyan-700" : "text-slate-900 group-hover:text-cyan-700"
                      )}>
                        {route.name}
                      </h3>
                    </div>
                    {route.isPopular && (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0.5 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-500" />
                      </Badge>
                    )}
                  </div>

                  {/* Orta kısım: Detaylar */}
                  <div className="flex-grow space-y-1.5 mb-2">
                    {/* Mesafe ve Süre */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{route.distance.text}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock3 className="w-3 h-3 shrink-0" />
                        <span>{route.duration.text}</span>
                      </div>
                    </div>

                    {/* Lokasyon */}
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <span className="font-medium">{route.from.city}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-medium">{route.to.city}</span>
                    </div>
                  </div>

                  {/* Alt kısım: Seçim göstergesi */}
                  <div className="mt-auto pt-2 border-t border-slate-100">
                    <div className={cn(
                      "text-[10px] font-medium text-center py-1 rounded-md transition-colors",
                      isSelected
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-cyan-100 group-hover:text-cyan-700"
                    )}>
                      {isSelected ? "✓ Seçili" : "Seçmek için tıkla"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
