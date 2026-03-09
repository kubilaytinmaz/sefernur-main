"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MapPin, Navigation } from "lucide-react";

/* ────────── Types ────────── */

interface HotelLocationProps {
  address: string;
  cityName?: string;
  countryName?: string;
  lat?: number;
  lng?: number;
  holySiteName?: string;
  holySiteDistance?: string;
  cityCode?: number;
}

/* ────────── Holy Sites ────────── */

const HOLY_SITES: Record<number, { lat: number; lng: number; name: string }> = {
  164: { lat: 21.4225, lng: 39.8262, name: "Mescid-i Haram (Kabe)" },
  174: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
  365: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
};

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

/* ────────── Main Component ────────── */

export function HotelLocation({
  address,
  cityName,
  countryName,
  lat,
  lng,
  holySiteName,
  holySiteDistance,
  cityCode,
}: HotelLocationProps) {
  const hasCoordinates = lat && lng && lat !== 0 && lng !== 0;

  // Calculate distance to holy site
  let distanceToHolySite: string | null = null;
  let holySiteLabel: string | null = null;

  if (hasCoordinates && cityCode && HOLY_SITES[cityCode]) {
    const holySite = HOLY_SITES[cityCode];
    const distance = calculateDistance(lat, lng, holySite.lat, holySite.lng);
    distanceToHolySite = formatDistance(distance);
    holySiteLabel = holySite.name;
  } else if (holySiteName && holySiteDistance) {
    distanceToHolySite = holySiteDistance;
    holySiteLabel = holySiteName;
  }

  // Google Maps embed URL
  const mapEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""}&q=${lat},${lng}&zoom=15&language=tr`
    : null;

  // Google Maps directions URL
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Konum
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Holy Site Distance - Prominent Display */}
        {distanceToHolySite && holySiteLabel && (
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">{holySiteLabel}</p>
                <p className="text-2xl font-bold text-emerald-900">{distanceToHolySite}</p>
                <p className="text-xs text-emerald-600">uzaklıkta</p>
              </div>
            </div>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-slate-900">{address}</p>
            {(cityName || countryName) && (
              <p className="text-xs text-slate-500 mt-1">
                {[cityName, countryName].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Map Embed */}
        {mapEmbedUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Otel Konumu"
              className="w-full"
            />
          </div>
        )}

        {/* No coordinates fallback - static map image */}
        {!mapEmbedUrl && (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-8 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Harita gösterilemiyor</p>
            <p className="text-xs text-slate-400 mt-1">Koordinat bilgisi mevcut değil</p>
          </div>
        )}

        {/* Directions Button */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          Google Maps ile Yol Tarifi Al
        </a>

        {/* Nearby Info */}
        {cityCode && HOLY_SITES[cityCode] && (
          <div className="rounded-lg bg-amber-50 border border-amber-200/60 p-3">
            <p className="text-xs text-amber-800 font-medium mb-1">Yakın Önemli Noktalar</p>
            <div className="space-y-1.5">
              {cityCode === 164 && (
                <>
                  <p className="text-xs text-amber-700">Mescid-i Haram (Kabe)</p>
                  <p className="text-xs text-amber-700">Safa - Merve</p>
                  <p className="text-xs text-amber-700">Abraj Al-Bait Kulesi</p>
                </>
              )}
              {(cityCode === 174 || cityCode === 365) && (
                <>
                  <p className="text-xs text-amber-700">Mescid-i Nebevi</p>
                  <p className="text-xs text-amber-700">Ravza-i Mutahhara</p>
                  <p className="text-xs text-amber-700">Cennetül Baki Kabristanı</p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
