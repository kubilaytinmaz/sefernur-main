/**
 * CompactTransferCard - Modern Compact Card for Transfers
 * 
 * Smaller vehicle card for grid layout with glassmorphism effects
 * and smooth hover animations.
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { displayAddress } from "@/types/address";
import { vehicleTypeLabels, type TransferModel } from "@/types/transfer";
import {
  ArrowRight,
  Briefcase,
  Bus,
  Car,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
  Truck,
  Users,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CompactTransferCardProps {
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

export function CompactTransferCard({ transfer, index = 0 }: CompactTransferCardProps) {
  const img = transfer.images?.[0];
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;

  return (
    <Link
      href={`/transfers/${transfer.id}`}
      className="group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-full min-h-[260px] md:min-h-[280px] rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-cyan-900/15">
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
            <VehicleIcon type={transfer.vehicleType} className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-transparent to-sky-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            {/* Vehicle Type Badge */}
            <Badge className="bg-cyan-600/90 backdrop-blur-md text-white border-0 text-[9px] gap-0.5 shadow-md">
              <VehicleIcon type={transfer.vehicleType} className="w-2 h-2" />
              {vehicleLabel}
            </Badge>

            {/* Capacity Badge */}
            <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-[9px] gap-0.5 shadow-md">
              <Users className="w-2 h-2" />
              {transfer.capacity}
            </Badge>
          </div>

          <div className="flex flex-col gap-1 items-end">
            {/* Popular Badge */}
            {transfer.isPopular && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[9px] gap-0.5 shadow-md">
                <Sparkles className="w-2 h-2" />
                Popüler
              </Badge>
            )}

            {/* Rating Badge */}
            {transfer.rating > 0 && (
              <Badge className="bg-white/90 backdrop-blur-md text-slate-800 border-0 text-[9px] gap-0.5 shadow-md">
                <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
                {transfer.rating.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          {/* Vehicle Name */}
          <h3 className="text-xs md:text-sm font-bold text-white mb-1 line-clamp-1 leading-tight tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-cyan-300 group-hover:to-sky-300 transition-all capitalize">
            {transfer.vehicleName || vehicleLabel}
          </h3>

          {/* Route - Simplified */}
          <div className="flex items-center gap-1 mb-1.5">
            <MapPin className="w-2 h-2 text-cyan-300 shrink-0" />
            <span className="text-[9px] text-cyan-100 truncate flex-1">{displayAddress(transfer.fromAddress)}</span>
            <ArrowRight className="w-2 h-2 text-cyan-300/60 shrink-0" />
            <span className="text-[9px] text-cyan-100 truncate flex-1">{displayAddress(transfer.toAddress)}</span>
          </div>

          {/* Specs Row - Compact */}
          <div className="flex items-center gap-1.5 mb-1.5 text-[9px] text-white/60">
            <div className="flex items-center gap-0.5">
              <Users className="w-2 h-2 text-cyan-300" />
              <span>{transfer.capacity}</span>
            </div>
            {transfer.luggageCapacity > 0 && (
              <div className="flex items-center gap-0.5">
                <Briefcase className="w-2 h-2 text-cyan-300" />
                <span>{transfer.luggageCapacity}</span>
              </div>
            )}
            {transfer.durationMinutes > 0 && (
              <div className="flex items-center gap-0.5">
                <Zap className="w-2 h-2 text-cyan-300" />
                <span>{transfer.durationMinutes}dk</span>
              </div>
            )}
          </div>

          {/* Price & CTA */}
          <div className="flex items-end justify-between pt-1.5 border-t border-white/10">
            <div>
              <p className="text-[7px] text-cyan-300 uppercase tracking-wider mb-0.5">
                Fiyat
              </p>
              <p className="text-xs md:text-sm font-bold text-white leading-tight">
                {formatTlUsdPairFromTl(transfer.basePrice)}
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ChevronRight className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-2xl transition-shadow duration-500 group-hover:shadow-[0_8px_40px_-8px_rgba(6,182,212,0.3)]" />
      </div>
    </Link>
  );
}
