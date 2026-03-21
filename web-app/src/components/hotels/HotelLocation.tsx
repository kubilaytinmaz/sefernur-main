"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, ExternalLink, MapPin, Maximize2, Navigation, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MapModal } from "./MapModal";

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
  hotelName?: string;
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

// Dinamik zoom seviyesi - mesafeye göre
function getDynamicBBox(
  hotelLat: number,
  hotelLng: number,
  holySiteLat?: number,
  holySiteLng?: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  if (holySiteLat && holySiteLng) {
    // Her iki noktayı da gösterecek şekilde bbox hesapla
    const padding = 0.003; // %10 padding
    const minLat = Math.min(hotelLat, holySiteLat) - padding;
    const maxLat = Math.max(hotelLat, holySiteLat) + padding;
    const minLng = Math.min(hotelLng, holySiteLng) - padding;
    const maxLng = Math.max(hotelLng, holySiteLng) + padding;
    return { minLat, maxLat, minLng, maxLng };
  }

  // Sadece otel için standart zoom
  return {
    minLat: hotelLat - 0.005,
    maxLat: hotelLat + 0.005,
    minLng: hotelLng - 0.008,
    maxLng: hotelLng + 0.008,
  };
}

/* ────────── Skeleton Loader ────────── */

function MapSkeleton() {
  return (
    <div className="w-full h-[280px] bg-slate-100 rounded-xl overflow-hidden relative animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
      <div className="absolute top-3 left-3">
        <div className="h-7 w-32 bg-slate-300 rounded-lg" />
      </div>
      <div className="absolute top-3 right-3">
        <div className="h-7 w-24 bg-slate-300 rounded-lg" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Harita yükleniyor...</span>
        </div>
      </div>
    </div>
  );
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
  hotelName = "Otel",
}: HotelLocationProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const hasCoordinates = lat && lng && lat !== 0 && lng !== 0;

  // Timeout fallback - iframe onLoad bazen tetiklenmez
  useEffect(() => {
    if (hasCoordinates && !isMapLoaded && !mapError) {
      const timer = setTimeout(() => {
        setIsMapLoaded(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasCoordinates, isMapLoaded, mapError]);

  // Calculate distance to holy site
  let distanceToHolySite: string | null = null;
  let holySiteLabel: string | null = null;
  let holySite: { lat: number; lng: number; name: string } | null = null;

  if (hasCoordinates && cityCode && HOLY_SITES[cityCode]) {
    holySite = HOLY_SITES[cityCode];
    const distance = calculateDistance(lat, lng, holySite.lat, holySite.lng);
    distanceToHolySite = formatDistance(distance);
    holySiteLabel = holySite.name;
  } else if (holySiteName && holySiteDistance) {
    distanceToHolySite = holySiteDistance;
    holySiteLabel = holySiteName;
  }

  // Dinamik bbox hesaplama
  const bbox = hasCoordinates
    ? getDynamicBBox(lat!, lng!, holySite?.lat, holySite?.lng)
    : null;

  // OpenStreetMap embed URL for preview (no API key needed)
  const mapPreviewUrl = bbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${lat},${lng}`
    : null;

  // Google Maps directions URL
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Google Maps view URL
  const mapsViewUrl = hasCoordinates
    ? `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=16`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Share location
  const handleShare = async () => {
    const shareData = {
      title: hotelName,
      text: `${hotelName} - ${address}`,
      url: mapsViewUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(mapsViewUrl);
    }
  };

  // Handle map error
  const handleMapError = () => {
    setMapError(true);
    setIsMapLoaded(true);
  };

  return (
    <>
      <Card className="border-slate-200 overflow-hidden">
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
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Navigation className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="min-w-0 flex-1">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 break-words">{address}</p>
              {(cityName || countryName) && (
                <p className="text-xs text-slate-500 mt-1">
                  {[cityName, countryName].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Map Preview - Clickable with OpenStreetMap iframe */}
          {mapPreviewUrl ? (
            <div
              className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-slate-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100"
              onClick={() => !mapError && setIsMapModalOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Haritayı büyüt"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (!mapError) setIsMapModalOpen(true);
                }
              }}
            >
              {/* Skeleton Loader */}
              {!isMapLoaded && <MapSkeleton />}

              {/* Map Error Fallback */}
              {mapError ? (
                <div className="w-full h-[280px] bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Harita yüklenemedi</p>
                    <p className="text-xs text-slate-500 mt-1">Google Maps'te açmayı deneyin</p>
                  </div>
                  <a
                    href={mapsViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Google Maps'te Aç
                  </a>
                </div>
              ) : (
                <>
                  {/* Map iframe - pointer-events disabled to allow click through */}
                  <div
                    className="w-full h-[280px] pointer-events-none bg-slate-100"
                    style={{ display: isMapLoaded ? "block" : "none" }}
                  >
                    <iframe
                      src={mapPreviewUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="Otel Konumu"
                      className="group-hover:brightness-105 transition-all duration-300"
                      onLoad={() => setIsMapLoaded(true)}
                      onError={handleMapError}
                    />
                  </div>

                  {/* Overlay with Expand Button */}
                  {isMapLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white rounded-xl px-6 py-3 shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">Haritayı Büyüt</span>
                      </div>
                    </div>
                  )}

                  {/* Hotel Badge */}
                  {isMapLoaded && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-emerald-500 text-white border-0 shadow-md gap-1.5">
                        <MapPin className="w-3 h-3" />
                        {hotelName}
                      </Badge>
                    </div>
                  )}

                  {/* Holy Site Distance Badge */}
                  {isMapLoaded && distanceToHolySite && holySiteLabel && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-amber-500 text-white border-0 shadow-md">
                        🕋 {distanceToHolySite}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* No coordinates fallback */
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-8 text-center">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Harita gösterilemiyor</p>
              <p className="text-xs text-slate-400 mt-1">Koordinat bilgisi mevcut değil</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Yol Tarifi Al
            </a>
            <a
              href={mapsViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Google Maps
            </a>
            <button
              onClick={handleShare}
              className="p-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Konumu Paylaş"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

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

      {/* Map Modal */}
      {hasCoordinates && (
        <MapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          lat={lat!}
          lng={lng!}
          hotelName={hotelName}
          address={address}
          cityCode={cityCode}
          holySiteName={holySiteLabel || undefined}
          holySiteDistance={distanceToHolySite || undefined}
        />
      )}
    </>
  );
}
