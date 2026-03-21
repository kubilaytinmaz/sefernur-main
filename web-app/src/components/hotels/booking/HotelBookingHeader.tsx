"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HotelBookingHeaderProps {
  hotelName: string;
  subtitle?: string;
  backUrl?: string;
}

export function HotelBookingHeader({
  hotelName,
  subtitle,
  backUrl = "/oteller",
}: HotelBookingHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              Otel Rezervasyonu
            </h1>
            {(hotelName || subtitle) && (
              <p className="text-xs text-slate-500 truncate">
                {hotelName}
                {subtitle ? ` — ${subtitle}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
