"use client";

/**
 * TourInfoBanner - Transfer sayfası için tur seçimi bilgilendirme bileşeni
 * Kullanıcıya tur seçimi hakkında bilgi verir
 */

import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface TourInfoBannerProps {
  tourCount?: number;
  className?: string;
}

export function TourInfoBanner({
  tourCount = 0,
  className,
}: TourInfoBannerProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Tur Seçimi Bilgilendirme */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border-2 border-amber-200 animate-in slide-in-from-top-2 duration-300">
        <p className="text-xs text-amber-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="font-medium">
            Aşağıdaki rehberli turlardan seçim yapın, fiyatlar otomatik güncellenecek
          </span>
          {tourCount > 0 && (
            <span className="ml-auto bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-xs font-bold">
              {tourCount} seçili
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * @deprecated Use TourInfoBanner instead
 * Bu bileşen geriye dönük uyumluluk için tutulmuştur
 */
export type TransferMode = "tour";

export function ModeToggle(props: any) {
  return <TourInfoBanner tourCount={props.tourCount} className={props.className} />;
}
