/**
 * Guide Card Component
 * Modern glassmorphism tasarım ile rehber kartı
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { GuideModel } from "@/types/guide";
import { Award, ChevronRight, Languages, MapPin, Star, User } from "lucide-react";
import Link from "next/link";

interface GuideCardProps {
  guide: GuideModel;
  viewMode?: "grid" | "list";
}

export function GuideCard({ guide, viewMode = "grid" }: GuideCardProps) {
  const hasImage = guide.images.length > 0;
  const imageUrl = hasImage ? guide.images[0] : undefined;

  if (viewMode === "list") {
    return <GuideListView guide={guide} imageUrl={imageUrl} />;
  }

  return <GuideGridView guide={guide} imageUrl={imageUrl} />;
}

function GuideGridView({ guide, imageUrl }: { guide: GuideModel; imageUrl?: string }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group relative"
      aria-label={`${guide.name} rehber detaylarını gör`}
    >
      {/* Card Container with Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={guide.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-violet-200" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {guide.isPopular && (
              <Badge className="bg-amber-500 text-white border-0 gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-white" /> Popüler
              </Badge>
            )}
            {guide.specialties.slice(0, 2).map((sp) => (
              <Badge
                key={sp}
                className="bg-white/90 backdrop-blur-sm text-violet-700 border-0 shadow-sm"
              >
                {sp}
              </Badge>
            ))}
          </div>

          {/* Rating Badge */}
          {guide.rating > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-white/95 backdrop-blur-sm text-slate-900 border-0 shadow-lg gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {guide.rating.toFixed(1)}
                {guide.reviewCount > 0 && <span className="text-slate-500">({guide.reviewCount})</span>}
              </Badge>
            </div>
          )}

          {/* Hover Action Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
              <ChevronRight className="w-5 h-5 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Name and Location */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1">
              {guide.name}
            </h3>
            {guide.city && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-violet-500" />
                {guide.city}
              </p>
            )}
          </div>

          {/* Info Chips */}
          <div className="flex flex-wrap gap-1.5">
            {guide.languages.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs">
                <Languages className="w-3 h-3" />
                {guide.languages.slice(0, 2).join(", ")}
                {guide.languages.length > 2 && <span>+{guide.languages.length - 2}</span>}
              </span>
            )}
            {guide.yearsExperience > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs">
                <Award className="w-3 h-3" />
                {guide.yearsExperience} yıl
              </span>
            )}
          </div>

          {/* Price and Certification */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Günlük</p>
              <p className="text-lg font-bold text-violet-700">{formatTlUsdPairFromTl(guide.dailyRate)}</p>
            </div>
            {guide.certifications.length > 0 && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                Sertifikalı
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function GuideListView({ guide, imageUrl }: { guide: GuideModel; imageUrl?: string }) {
  return (
    <Link
      href={`/guides/${guide.id}`}
      className="group block"
      aria-label={`${guide.name} rehber detaylarını gör`}
    >
      <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300">
        {/* Image */}
        <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={guide.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-10 h-10 text-violet-200" />
            </div>
          )}
          {guide.isPopular && (
            <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-0 text-xs">
              <Star className="w-3 h-3 fill-white" />
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1">
                {guide.name}
              </h3>
              {guide.city && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-violet-500" />
                  {guide.city}
                </p>
              )}
            </div>
            {guide.rating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-slate-900">{guide.rating.toFixed(1)}</span>
                {guide.reviewCount > 0 && (
                  <span className="text-xs text-slate-400">({guide.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 line-clamp-2">{guide.bio}</p>

          <div className="flex flex-wrap gap-1.5">
            {guide.specialties.slice(0, 3).map((sp) => (
              <Badge key={sp} className="bg-violet-50 text-violet-700 border-0 text-xs">
                {sp}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {guide.languages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Languages className="w-3 h-3 text-violet-500" />
                  {guide.languages.slice(0, 2).join(", ")}
                </span>
              )}
              {guide.yearsExperience > 0 && (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-violet-500" />
                  {guide.yearsExperience} yıl
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-violet-700">
              {formatTlUsdPairFromTl(guide.dailyRate)}
              <span className="text-xs font-normal text-slate-400">/gün</span>
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-violet-600" />
          </div>
        </div>
      </div>
    </Link>
  );
}
