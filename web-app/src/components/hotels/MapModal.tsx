"use client";

import { Badge } from "@/components/ui/Badge";
import { AlertCircle, ExternalLink, Loader2, MapPin, Minus, Navigation, Plus, Share2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ────────── Types ────────── */

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  hotelName: string;
  address: string;
  cityCode?: number;
  holySiteName?: string;
  holySiteDistance?: string;
}

/* ────────── Holy Sites ────────── */

const HOLY_SITES: Record<number, { lat: number; lng: number; name: string }> = {
  164: { lat: 21.4225, lng: 39.8262, name: "Mescid-i Haram (Kabe)" },
  174: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
  365: { lat: 24.4672, lng: 39.6157, name: "Mescid-i Nebevi" },
};

// Zoom seviyeleri - bbox padding değerleri
const ZOOM_LEVELS = [
  0.002,  // Çok yakın (zoom 18)
  0.005,  // Yakın (zoom 16)
  0.01,   // Orta (zoom 14)
  0.02,   // Uzak (zoom 12)
  0.05,   // Çok uzak (zoom 10)
];

/* ────────── Main Component ────────── */

export function MapModal({
  isOpen,
  onClose,
  lat,
  lng,
  hotelName,
  address,
  cityCode,
  holySiteName,
  holySiteDistance,
}: MapModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2); // Orta zoom başlangıç

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Reset states when modal opens
      setIsMapLoaded(false);
      setMapError(false);
      setZoomLevel(2); // Orta zoom
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Get holy site info
  const holySite = cityCode ? HOLY_SITES[cityCode] : null;
  const displayHolySiteName = holySiteName || holySite?.name;
  const displayHolySiteDistance = holySiteDistance;

  // Zoom in/out handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.max(0, prev - 1));
    setIsMapLoaded(false);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.min(ZOOM_LEVELS.length - 1, prev + 1));
    setIsMapLoaded(false);
  }, []);

  // Calculate bbox based on zoom level
  const bbox = useMemo(() => {
    const padding = ZOOM_LEVELS[zoomLevel];
    return {
      minLat: lat - padding,
      maxLat: lat + padding,
      minLng: lng - padding * 1.5, // 1.5x for wider view
      maxLng: lng + padding * 1.5,
    };
  }, [lat, lng, zoomLevel]);

  // OpenStreetMap embed URL for full map with marker
  const mapEmbedUrl = useMemo(() => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${lat},${lng}`;
  }, [bbox, lat, lng]);

  // Google Maps directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Google Maps view URL
  const mapsViewUrl = `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=16`;

  // Share location
  const handleShare = useCallback(async () => {
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
  }, [hotelName, address, mapsViewUrl]);

  // Handle map error
  const handleMapError = () => {
    setMapError(true);
    setIsMapLoaded(true);
  };

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm map-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden map-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent">
          <div className="text-white">
            <h2 id="map-modal-title" className="text-lg font-bold truncate max-w-[300px] sm:max-w-md">
              {hotelName}
            </h2>
            <p className="text-sm text-white/80 truncate max-w-[300px] sm:max-w-md">
              {address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[60vh] sm:h-[70vh] bg-slate-100">
          {/* Loading State */}
          {!isMapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-sm text-slate-600">Harita yükleniyor...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {mapError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-20 p-6">
              <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-lg font-medium text-slate-700 mb-2">Harita yüklenemedi</p>
              <p className="text-sm text-slate-500 mb-4 text-center">
                Bağlantınızı kontrol edin veya Google Maps&apos;i kullanın
              </p>
              <a
                href={mapsViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Google Maps&apos;te Aç
              </a>
            </div>
          )}

          {/* Map iframe */}
          {!mapError && (
            <iframe
              key={mapEmbedUrl} // Key değişince iframe yeniden yüklenir
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              title="Otel Konumu"
              className="absolute inset-0"
              onLoad={() => setIsMapLoaded(true)}
              onError={handleMapError}
            />
          )}

          {/* Zoom Controls */}
          {!mapError && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel === 0}
                className="w-10 h-10 rounded-lg bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Yakınlaştır"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel === ZOOM_LEVELS.length - 1}
                className="w-10 h-10 rounded-lg bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Uzaklaştır"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Holy Site Distance Badge */}
          {isMapLoaded && !mapError && displayHolySiteName && displayHolySiteDistance && (
            <div className="absolute top-20 left-4 z-10">
              <Badge className="bg-emerald-500 text-white border-0 shadow-lg px-3 py-1.5 text-sm font-medium">
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                {displayHolySiteName}&apos;e {displayHolySiteDistance}
              </Badge>
            </div>
          )}

          {/* Hotel Marker Badge */}
          {isMapLoaded && !mapError && (
            <div className="absolute bottom-4 left-4 z-10">
              <Badge className="bg-emerald-600 text-white border-0 shadow-lg px-3 py-1.5 text-sm font-medium gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {hotelName}
              </Badge>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            {/* Address */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{hotelName}</p>
                <p className="text-xs text-slate-500 truncate">{address}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Yol Tarifi
              </a>
              <a
                href={mapsViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Google Maps</span>
                <span className="sm:hidden">Aç</span>
              </a>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Konumu Paylaş"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render in portal
  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }

  return null;
}
