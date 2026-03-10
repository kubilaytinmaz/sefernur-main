/**
 * VehicleInfoCard Component
 * Araç bilgilerini gösteren kart bileşeni
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { amenityLabels, TransferModel, vehicleTypeLabels } from "@/types/transfer";
import {
    Baby,
    Briefcase,
    Car,
    Check,
    ChevronLeft,
    ChevronRight,
    Star,
    Users,
} from "lucide-react";
import { useCallback, useState } from "react";

interface VehicleInfoCardProps {
  vehicle: TransferModel;
}

export function VehicleInfoCard({ vehicle }: VehicleInfoCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasImages = vehicle.images.length > 0;

  const vehicleLabel = vehicleTypeLabels[vehicle.vehicleType] || vehicle.vehicleType;

  const goToImage = useCallback(
    (direction: "prev" | "next") => {
      if (!hasImages) return;
      setCurrentImageIndex((prev) => {
        if (direction === "prev") return prev === 0 ? vehicle.images.length - 1 : prev - 1;
        return prev === vehicle.images.length - 1 ? 0 : prev + 1;
      });
    },
    [hasImages, vehicle.images.length]
  );

  return (
    <Card className="border-slate-200 bg-white overflow-hidden">
      {/* Image Gallery */}
      <div className="relative h-64 bg-slate-100">
        {hasImages ? (
          <>
            <img
              src={vehicle.images[currentImageIndex]}
              alt={`${vehicleLabel} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {vehicle.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToImage("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => goToImage("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {vehicle.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        i === currentImageIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                      }`}
                      aria-label={`Görsel ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-4 right-4">
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
                {currentImageIndex + 1} / {vehicle.images.length}
              </Badge>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-sky-50">
            <div className="text-center">
              <Car className="w-16 h-16 text-cyan-200 mx-auto" />
              <p className="mt-2 text-sm text-slate-400">Görsel yakında eklenecek</p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        {/* Title & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {vehicle.isPopular && (
            <Badge className="bg-amber-500 text-white border-0 gap-1">
              <Star className="w-3.5 h-3.5 fill-white" /> Popüler
            </Badge>
          )}
          <Badge className="bg-sky-50 text-sky-700 border-sky-200">
            {vehicleLabel}
          </Badge>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">
          {vehicle.vehicleName || vehicleLabel}
        </h2>

        {vehicle.company && (
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-4">
            <Briefcase className="w-4 h-4" />
            {vehicle.company}
          </p>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Kapasite</p>
            <p className="text-sm font-semibold text-slate-800">{vehicle.capacity} Kişi</p>
          </div>
          {vehicle.luggageCapacity > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <Briefcase className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Bagaj</p>
              <p className="text-sm font-semibold text-slate-800">{vehicle.luggageCapacity} Adet</p>
            </div>
          )}
          {vehicle.childSeatCount > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <Baby className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Çocuk Koltuğu</p>
              <p className="text-sm font-semibold text-slate-800">{vehicle.childSeatCount} Adet</p>
            </div>
          )}
        </div>

        {/* Rating */}
        {vehicle.rating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(vehicle.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">{vehicle.rating.toFixed(1)}</span>
            {vehicle.reviewCount > 0 && (
              <span className="text-xs text-slate-400">({vehicle.reviewCount} değerlendirme)</span>
            )}
          </div>
        )}

        {/* Amenities */}
        {vehicle.amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-600" />
              Araç Özellikleri
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {vehicle.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  {amenityLabels[amenity] || amenity}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
