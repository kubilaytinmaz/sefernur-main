"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ExternalLink, MapPin, Maximize2, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

/* ────────── Types ────────── */

interface HotelMiniMapProps {
  hotelName: string;
  address: string;
  lat?: number;
  lng?: number;
  cityCode?: number;
  onExpandMap?: () => void;
}

/* ────────── Holy Sites ────────── */

const HOLY_SITES: Record<number, { lat: number; lng: number; name: string }> = {
  164: { lat: 21.4225, lng: 39.8262, name: "Mescid-i Haram (Kabe)" },
  174: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
  365: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
};

/* ────────── Helper Functions ────────── */

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function getDynamicBBox(
  hotelLat: number,
  hotelLng: number,
  holySiteLat?: number,
  holySiteLng?: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  if (holySiteLat && holySiteLng) {
    const padding = 0.003;
    return {
      minLat: Math.min(hotelLat, holySiteLat) - padding,
      maxLat: Math.max(hotelLat, holySiteLat) + padding,
      minLng: Math.min(hotelLng, holySiteLng) - padding,
      maxLng: Math.max(hotelLng, holySiteLng) + padding,
    };
  }
  return {
    minLat: hotelLat - 0.005,
    maxLat: hotelLat + 0.005,
    minLng: hotelLng - 0.008,
    maxLng: hotelLng + 0.008,
  };
}

/* ────────── Main Component ────────── */

export function HotelMiniMap({
  hotelName,
  address,
  lat,
  lng,
  cityCode,
  onExpandMap,
}: HotelMiniMapProps) {
  const [miniMapLoaded, setMiniMapLoaded] = useState(false);
  const hasCoordinates = lat && lng && lat !== 0 && lng !== 0;

  // Timeout fallback for iframe load
  useEffect(() => {
    if (hasCoordinates && !miniMapLoaded) {
      const timer = setTimeout(() => setMiniMapLoaded(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasCoordinates, miniMapLoaded]);

  // Holy site distance
  let distanceToHolySite: string | null = null;
  let holySiteLabel: string | null = null;
  let holySite: { lat: number; lng: number; name: string } | null = null;

  if (hasCoordinates && cityCode && HOLY_SITES[cityCode]) {
    holySite = HOLY_SITES[cityCode];
    const distance = calculateDistance(lat, lng, holySite.lat, holySite.lng);
    distanceToHolySite = formatDistance(distance);
    holySiteLabel = holySite.name;
  }

  // Map URLs
  const bbox = hasCoordinates
    ? getDynamicBBox(lat!, lng!, holySite?.lat, holySite?.lng)
    : null;

  const mapPreviewUrl = bbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  if (!hasCoordinates || !mapPreviewUrl) {
    return null;
  }

  return (
    <Card className="border-slate-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Holy Site Distance Badge */}
        {distanceToHolySite && holySiteLabel && (
          <div className="px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-800">
              {holySiteLabel}: <span className="font-bold">{distanceToHolySite}</span>
            </span>
          </div>
        )}

        {/* Mini Map */}
        <div
          className="relative group cursor-pointer"
          onClick={onExpandMap}
          role="button"
          tabIndex={0}
          aria-label="Haritayı büyüt"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onExpandMap?.();
            }
          }}
        >
          {/* Skeleton */}
          {!miniMapLoaded && (
            <div className="w-full h-[180px] bg-slate-100 animate-pulse flex items-center justify-center">
              <span className="text-xs text-slate-400">Harita yükleniyor...</span>
            </div>
          )}

          {/* Map iframe */}
          <div
            className="w-full h-[180px] pointer-events-none bg-slate-100"
            style={{ display: miniMapLoaded ? "block" : "none" }}
          >
            <iframe
              src={mapPreviewUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Otel Mini Harita"
              onLoad={() => setMiniMapLoaded(true)}
            />
          </div>

          {/* Hover overlay */}
          {miniMapLoaded && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-medium text-emerald-700">
                <Maximize2 className="w-4 h-4" />
                Haritayı Büyüt
              </div>
            </div>
          )}

          {/* Hotel name badge */}
          {miniMapLoaded && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-emerald-500 text-white border-0 shadow-sm text-xs py-0.5 px-2 gap-1">
                <MapPin className="w-3 h-3" />
                {hotelName.length > 25 ? hotelName.slice(0, 25) + "…" : hotelName}
              </Badge>
            </div>
          )}
        </div>

        {/* Quick action bar */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 border-t border-slate-100">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Navigation className="w-4 h-4" />
            Yol Tarifi Al
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpandMap?.();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Tam Harita
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
