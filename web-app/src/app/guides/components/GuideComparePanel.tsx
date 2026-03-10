/**
 * Guide Compare Panel Component
 * Rehber karşılaştırma paneli bileşeni
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { GuideModel } from "@/types/guide";
import { Award, Languages, MapPin, Star, XCircle } from "lucide-react";
import Link from "next/link";

interface GuideComparePanelProps {
  guides: GuideModel[];
  onRemove: (guideId: string) => void;
  onClear: () => void;
}

export function GuideComparePanel({ guides, onRemove, onClear }: GuideComparePanelProps) {
  if (guides.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Karşılaştırma ({guides.length}/3)</h3>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            Tümünü Temizle
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {guides.map((guide) => (
            <CompareCard key={guide.id} guide={guide} onRemove={() => onRemove(guide.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareCard({ guide, onRemove }: { guide: GuideModel; onRemove: () => void }) {
  return (
    <Card className="shrink-0 w-72 border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{guide.name}</h4>
            {guide.city && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-violet-500" />
                {guide.city}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Karşılaştırmadan çıkar"
          >
            <XCircle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Rating */}
        {guide.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-slate-900">{guide.rating.toFixed(1)}</span>
            {guide.reviewCount > 0 && (
              <span className="text-xs text-slate-400">({guide.reviewCount})</span>
            )}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Languages className="w-3 h-3 text-violet-500" />
            <span className="truncate">{guide.languages.slice(0, 2).join(", ")}</span>
          </div>
          {guide.yearsExperience > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Award className="w-3 h-3 text-violet-500" />
              <span>{guide.yearsExperience} yıl deneyim</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {guide.specialties.slice(0, 2).map((sp) => (
            <Badge key={sp} className="bg-violet-50 text-violet-700 border-0 text-xs">
              {sp}
            </Badge>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Günlük</p>
            <p className="text-sm font-bold text-violet-700">{formatTlUsdPairFromTl(guide.dailyRate)}</p>
          </div>
          <Link
            href={`/guides/${guide.id}`}
            className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors cursor-pointer"
          >
            Detay
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
