/**
 * VehicleShowcaseCard - Modern Showcase Card for Transfers
 * 
 * Large, featured vehicle card with glassmorphism effects,
 * spec highlights, amenity badges, and smooth hover animations.
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { displayAddress } from "@/types/address";
import { amenityLabels, vehicleTypeLabels, type TransferModel, type VehicleAmenity } from "@/types/transfer";
import {
  ArrowRight,
  Briefcase,
  Bus,
  Car,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  Wifi,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface VehicleShowcaseCardProps {
  transfer: TransferModel;
  index?: number;
}

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "bus":
    case "coster":
      return <Bus className={className} />;
    case "van":
      return <Truck className={className} />;
    default:
      return <Car className={className} />;
  }
}

function AmenityIcon({ amenity, className }: { amenity: string; className?: string }) {
  switch (amenity) {
    case "wifi":
      return <Wifi className={className} />;
    case "insurance":
      return <ShieldCheck className={className} />;
    default:
      return <Zap className={className} />;
  }
}

export function VehicleShowcaseCard({ transfer, index = 0 }: VehicleShowcaseCardProps) {
  const img = transfer.images?.[0];
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;
  const topAmenities = (transfer.amenities || []).slice(0, 4);

  return (
    <Link
      href={`/transfers/${transfer.id}`}
      className="group block"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-full min-h-[400px] md:min-h-[450px] rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-900/20">
        {/* Background Image */}
        {img ? (
          <Image
            src={img}
            alt={transfer.vehicleName || vehicleLabel}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center">
            <VehicleIcon type={transfer.vehicleType} className="w-24 h-24 text-white/20" />
          </div>
        )}

        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-transparent to-sky-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {/* Vehicle Type Badge */}
            <Badge className="bg-cyan-600/90 backdrop-blur-md text-white border-0 text-xs gap-1.5 shadow-lg">
              <VehicleIcon type={transfer.vehicleType} className="w-3.5 h-3.5" />
              {vehicleLabel}
            </Badge>

            {/* Capacity Badge */}
            <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-xs gap-1.5 shadow-lg">
              <Users className="w-3 h-3" />
              {transfer.capacity} Kişi
            </Badge>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* Popular Badge */}
            {transfer.isPopular && (
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 blur-lg opacity-50 animate-pulse" />
                <Badge className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  Popüler
                </Badge>
              </div>
            )}

            {/* Rating Badge */}
            {transfer.rating > 0 && (
              <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-xs gap-1.5 shadow-md">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {transfer.rating.toFixed(1)}
                {transfer.reviewCount > 0 && (
                  <span className="text-slate-500">({transfer.reviewCount})</span>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-10">
          {/* Vehicle Name */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-1 leading-tight tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-cyan-300 group-hover:to-sky-300 transition-all capitalize">
            {transfer.vehicleName || vehicleLabel}
          </h3>

          {/* Route */}
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-xs text-cyan-100 truncate flex-1">{displayAddress(transfer.fromAddress)}</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-300/60 shrink-0" />
            <span className="text-xs text-cyan-100 truncate flex-1">{displayAddress(transfer.toAddress)}</span>
          </div>

          {/* Specs Row */}
          <div className="flex items-center gap-3 mb-3 text-xs text-white/70">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-300" />
              <span>{transfer.capacity}</span>
            </div>
            {transfer.luggageCapacity > 0 && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
                <span>{transfer.luggageCapacity} Bagaj</span>
              </div>
            )}
            {transfer.durationMinutes > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span>{transfer.durationMinutes}dk</span>
              </div>
            )}
          </div>

          {/* Amenities - Compact */}
          {topAmenities.length > 0 && (
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {topAmenities.slice(0, 3).map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 text-[10px] text-cyan-100"
                >
                  <AmenityIcon amenity={amenity} className="w-2.5 h-2.5" />
                  {amenityLabels[amenity as VehicleAmenity] || amenity}
                </div>
              ))}
            </div>
          )}

          {/* Company - Compact */}
          {transfer.company && (
            <div className="mb-3 p-2 bg-cyan-950/50 backdrop-blur-md rounded-lg border border-cyan-500/30">
              <p className="text-[10px] text-cyan-200 leading-tight flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-cyan-300" />
                <strong className="text-cyan-100">{transfer.company}</strong>
              </p>
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-end justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-[10px] text-cyan-300 uppercase tracking-wider mb-0.5">
                Fiyat
              </p>
              <p className="text-lg md:text-xl font-bold text-white leading-tight">
                {formatTlUsdPairFromTl(transfer.basePrice)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-cyan-500/50 transition-all">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-3xl transition-shadow duration-500 group-hover:shadow-[0_8px_60px_-8px_rgba(6,182,212,0.4)]" />
      </div>
    </Link>
  );
}
