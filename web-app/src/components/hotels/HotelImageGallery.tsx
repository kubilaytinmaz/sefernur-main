"use client";

import { getCityFallbackImage } from "@/lib/hotels/city-images";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useCallback, useState } from "react";

/* ────────── Constants ────────── */

const HOTEL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%230ea5e9;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1200' height='700'/%3E%3Crect fill='%23f1f5f9' x='400' y='200' width='400' height='300' rx='8'/%3E%3Cpath fill='%2394a3b8' d='M550 280h100v80h-100z'/%3E%3Cpath fill='%2394a3b8' d='M560 300h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Cpath fill='%2394a3b8' d='M560 330h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Ctext fill='%2364748b' font-family='system-ui,-apple-system,sans-serif' font-size='24' font-weight='500' x='600' y='420' text-anchor='middle'%3EOtel Resmi%3C/text%3E%3Ctext fill='%2394a3b8' font-family='system-ui,-apple-system,sans-serif' font-size='16' x='600' y='450' text-anchor='middle'%3EMevcut Değil%3C/text%3E%3C/svg%3E";

/* ────────── Types ────────── */

interface HotelImageGalleryProps {
  images?: string[];
  hotelName: string;
  cityCode: number;
  hotelId: string;
}

interface ImageItem {
  url: string;
  alt: string;
}

/* ────────── Helpers ────────── */

function normalizeImages(
  images: string[] | undefined,
  cityCode: number,
  hotelId: string,
  hotelName: string
): ImageItem[] {
  if (!images || images.length === 0) {
    // Use city fallback image
    const fallbackUrl = getCityFallbackImage(cityCode, hotelId);
    return [{ url: fallbackUrl, alt: `${hotelName} - Otel Resmi` }];
  }

  // Filter out invalid URLs and normalize
  const validImages = images
    .filter((img) => img && (img.startsWith("http") || img.startsWith("data:")))
    .map((url) => ({ url, alt: `${hotelName} - Otel Resmi` }));

  if (validImages.length === 0) {
    const fallbackUrl = getCityFallbackImage(cityCode, hotelId);
    return [{ url: fallbackUrl, alt: `${hotelName} - Otel Resmi` }];
  }

  return validImages;
}

/* ────────── Lightbox Component ────────── */

interface LightboxProps {
  images: ImageItem[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function Lightbox({ images, currentIndex, onClose, onNext, onPrevious }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
    },
    [onClose, onNext, onPrevious]
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 z-10"
        aria-label="Kapat"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows - Fixed to screen edges */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 z-20"
            aria-label="Önceki resim"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-200 hover:scale-110 z-20"
            aria-label="Sonraki resim"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative max-w-7xl max-h-[90vh] px-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].alt}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            e.currentTarget.src = HOTEL_PLACEHOLDER;
          }}
        />

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold shadow-lg">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────── Main Component ────────── */

export function HotelImageGallery({
  images,
  hotelName,
  cityCode,
  hotelId,
}: HotelImageGalleryProps) {
  const normalizedImages = normalizeImages(images, cityCode, hotelId, hotelName);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = () =>
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % normalizedImages.length));
  const previousImage = () =>
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + normalizedImages.length) % normalizedImages.length
    );

  // If only one image, show simple layout
  if (normalizedImages.length === 1) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
        <img
          src={normalizedImages[0].url}
          alt={normalizedImages[0].alt}
          className="w-full h-80 sm:h-96 object-cover"
          onError={(e) => {
            e.currentTarget.src = HOTEL_PLACEHOLDER;
          }}
        />
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors group"
          aria-label="Resmi büyüt"
        >
          <div className="w-14 h-14 rounded-full bg-white/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-xl">
            <ZoomIn className="w-6 h-6 text-slate-700" />
          </div>
        </button>
        {lightboxIndex === 0 && (
          <Lightbox
            images={normalizedImages}
            currentIndex={0}
            onClose={closeLightbox}
            onNext={nextImage}
            onPrevious={previousImage}
          />
        )}
      </div>
    );
  }

  // Multiple images - Airbnb-style grid layout
  const mainImage = normalizedImages[0];
  const sideImages = normalizedImages.slice(1, 5); // Max 4 side images
  const remainingCount = normalizedImages.length - 5;

  return (
    <div className="space-y-3">
      {/* Main image + side images grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[480px]">
        {/* Main image (spans 2 columns and 2 rows - left side) */}
        <div
          className="relative rounded-l-xl overflow-hidden bg-slate-100 cursor-pointer group col-span-2 row-span-2 shadow-md"
          onClick={() => openLightbox(0)}
        >
          <img
            src={mainImage.url}
            alt={mainImage.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = HOTEL_PLACEHOLDER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
              <ZoomIn className="w-5 h-5" />
              <span className="text-sm font-medium">Büyüt</span>
            </div>
          </div>
        </div>

        {/* Side images (right side - 2x2 grid) */}
        {sideImages.map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden bg-slate-100 cursor-pointer group shadow-sm ${
              index === sideImages.length - 1 && remainingCount === 0
                ? 'rounded-tr-xl'
                : index === sideImages.length - 1
                ? 'rounded-r-xl'
                : ''
            }`}
            onClick={() => openLightbox(index + 1)}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = HOTEL_PLACEHOLDER;
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200" />
          </div>
        ))}

        {/* Fill empty slots with placeholders if less than 4 side images */}
        {sideImages.length < 4 &&
          Array.from({ length: 4 - sideImages.length }).map((_, index) => {
            const placeholderIndex = sideImages.length + index;
            const isLastSlot = placeholderIndex === 3;
            
            // If this is the last slot and there are remaining images, show "+X more"
            if (isLastSlot && remainingCount > 0) {
              return (
                <div
                  key={`placeholder-${index}`}
                  className="relative rounded-br-xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 cursor-pointer group shadow-sm flex items-center justify-center"
                  onClick={() => openLightbox(0)}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200" />
                  <div className="relative z-10 text-center">
                    <ZoomIn className="w-7 h-7 mx-auto mb-1.5 text-slate-700" />
                    <p className="text-xs font-semibold text-slate-700">+{remainingCount} resim</p>
                  </div>
                </div>
              );
            }
            
            // Otherwise show a subtle placeholder
            return (
              <div
                key={`placeholder-${index}`}
                className={`relative overflow-hidden bg-slate-100 ${
                  isLastSlot ? 'rounded-br-xl' : ''
                }`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 text-2xl">·</span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Photo count indicator */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500 font-medium">
          {normalizedImages.length} fotoğraf
        </span>
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Tümünü gör →
        </button>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={normalizedImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrevious={previousImage}
        />
      )}
    </div>
  );
}
