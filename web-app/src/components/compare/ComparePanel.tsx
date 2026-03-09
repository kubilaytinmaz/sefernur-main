"use client";

import { FavoriteItemType } from "@/components/favorites/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CompareItem, useCompare } from "@/contexts/CompareContext";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import {
    ArrowRight,
    Clock,
    Star,
    Users,
    X
} from "lucide-react";
import Link from "next/link";

/* ────────── Compare Panel Component ────────── */

export function ComparePanel() {
  const { compareItems, removeFromCompare, clearCompare, maxCompareItems } = useCompare();

  if (compareItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">
              Karşılaştırma ({compareItems.length}/{maxCompareItems})
            </h3>
            <Badge className="bg-emerald-100 text-emerald-700 border-0">
              {compareItems.length} öğe
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/compare">
              <Button size="sm" variant="outline" className="gap-2">
                Detaylı Karşılaştır
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearCompare}
              className="text-slate-500 hover:text-red-600"
            >
              Temizle
            </Button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {compareItems.map((item) => (
            <CompareCard key={`${item.type}-${item.id}`} item={item} onRemove={removeFromCompare} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ────────── Compare Card Component ────────── */

interface CompareCardProps {
  item: CompareItem;
  onRemove: (id: string, type: FavoriteItemType) => void;
}

function CompareCard({ item, onRemove }: CompareCardProps) {
  return (
    <Card className="flex-shrink-0 w-48 border-slate-200 bg-white">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 capitalize">{item.type}</p>
            <h4 className="text-sm font-medium text-slate-900 truncate">{item.title}</h4>
          </div>
          <button
            onClick={() => onRemove(item.id, item.type)}
            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {item.imageUrl && (
          <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100 mb-2">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Fiyat</span>
            <span className="font-semibold text-emerald-700">
              {formatTlUsdPairFromTl(item.price)}
            </span>
          </div>

          {item.rating && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-slate-600">{item.rating.toFixed(1)}</span>
            </div>
          )}

          {item.capacity && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              <span>{item.capacity} kişi</span>
            </div>
          )}

          {item.durationMinutes && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{item.durationMinutes} dk</span>
            </div>
          )}

          {item.durationDays && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{item.durationDays} gün</span>
            </div>
          )}

          {item.stars && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{item.stars} yıldız</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────── Compare Button Component ────────── */

export interface CompareButtonProps {
  item: CompareItem;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function CompareButton({
  item,
  size = "md",
  showLabel = false,
  className = "",
}: CompareButtonProps) {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isComparing = isInCompare(item.id, item.type);

  const handleToggle = () => {
    if (isComparing) {
      removeFromCompare(item.id, item.type);
    } else {
      addToCompare(item);
    }
  };

  const sizeStyles = {
    sm: {
      button: "h-8 px-2 text-xs",
      icon: "w-4 h-4",
    },
    md: {
      button: "h-10 px-3 text-sm",
      icon: "w-5 h-5",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`
        ${currentSize.button}
        ${showLabel ? "flex items-center gap-2" : "inline-flex items-center justify-center"}
        rounded-lg
        font-medium
        transition-all duration-200
        ${isComparing
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
        }
        ${className}
      `}
    >
      <ArrowRight className={`${currentSize.icon} ${isComparing ? "" : "-rotate-45"}`} />
      {showLabel && (
        <span>{isComparing ? "Karşılaştırmada" : "Karşılaştır"}</span>
      )}
    </button>
  );
}

/* ────────── Feature Comparison Component ────────── */

interface FeatureComparisonProps {
  items: CompareItem[];
}

export function FeatureComparison({ items }: FeatureComparisonProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Karşılaştırılacak öğe seçin.</p>
      </div>
    );
  }

  // Özellikleri belirle
  const features = getComparableFeatures(items);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left p-4 font-semibold text-slate-900 bg-slate-50 min-w-[150px]">
              Özellik
            </th>
            {items.map((item) => (
              <th key={`${item.type}-${item.id}`} className="p-4 bg-slate-50 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.key} className="border-b border-slate-100">
              <td className="p-4 font-medium text-slate-700 bg-slate-50">
                {feature.label}
              </td>
              {items.map((item) => (
                <td key={`${item.type}-${item.id}`} className="p-4 text-center">
                  {feature.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ────────── Helper Functions ────────── */

interface Feature {
  key: string;
  label: string;
  render: (item: CompareItem) => React.ReactNode;
}

function getComparableFeatures(items: CompareItem[]): Feature[] {
  const features: Feature[] = [
    {
      key: "price",
      label: "Fiyat",
      render: (item) => (
        <span className="font-semibold text-emerald-700">
          {formatTlUsdPairFromTl(item.price)}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Puan",
      render: (item) =>
        item.rating ? (
          <div className="flex items-center justify-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-medium">{item.rating.toFixed(1)}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  // Transfer özellikleri
  if (items.some((i) => i.type === "transfer")) {
    features.push(
      {
        key: "vehicleType",
        label: "Araç Tipi",
        render: (item) =>
          item.type === "transfer" ? (
            <span className="text-sm">{item.vehicleType || "-"}</span>
          ) : (
            <span className="text-slate-300">-</span>
          ),
      },
      {
        key: "capacity",
        label: "Kapasite",
        render: (item) =>
          item.capacity ? (
            <div className="flex items-center justify-center gap-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{item.capacity} kişi</span>
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
      {
        key: "duration",
        label: "Süre",
        render: (item) =>
          item.durationMinutes ? (
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{item.durationMinutes} dk</span>
            </div>
          ) : item.durationDays ? (
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{item.durationDays} gün</span>
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          ),
      }
    );
  }

  // Rehber özellikleri
  if (items.some((i) => i.type === "guide")) {
    features.push({
      key: "specialties",
      label: "Uzmanlık",
      render: (item) =>
        item.type === "guide" && item.specialties && item.specialties.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {item.specialties.slice(0, 2).map((s, i) => (
              <Badge key={i} className="text-xs bg-violet-100 text-violet-700 border-0">
                {s}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    });
  }

  // Otel özellikleri
  if (items.some((i) => i.type === "hotel")) {
    features.push({
      key: "stars",
      label: "Yıldız",
      render: (item) =>
        item.stars ? (
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: item.stars }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    });
  }

  return features;
}
