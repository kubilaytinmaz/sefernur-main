"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
// ─── Popular Services (Tours) imports ─────────────────────────
import {
  createPopularService,
  deletePopularService,
  getAllPopularServices,
  getPopularServiceStats,
  updatePopularService
} from "@/lib/data/popular-services-data";
// ─── Popular Transfer Routes imports ─────────────────────────
import {
  createPopularTransferRoute,
  deletePopularTransferRoute,
  getAllRoutesWithLocations,
  getPopularTransferRouteStats,
  updatePopularTransferRoute,
} from "@/lib/data/popular-transfer-routes-data";
import { getAllTransferLocations } from "@/lib/data/transfer-locations-data";
import {
  emojiCategories,
  PopularServiceModel,
  serviceTypeColors,
  serviceTypeLabels
} from "@/types/popular-service";
import type { PopularTransferRouteWithLocations } from "@/types/popular-transfer-route";
import { formatRoutePriceRange } from "@/types/popular-transfer-route";
import type { TransferLocationModel } from "@/types/transfer-location";
import { useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  DollarSign,
  Download,
  Edit3,
  Filter,
  GripVertical,
  Loader2,
  MapPin,
  Plane,
  Plus,
  Popcorn,
  Save,
  Star,
  Trash2,
  Users,
  X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ═══════════════════════════════════════════════════════════════
// TAB TYPES
// ═══════════════════════════════════════════════════════════════
type ActiveTab = "routes" | "tours";

// ═══════════════════════════════════════════════════════════════
// TOURS TAB - Filter Types & Helpers
// ═══════════════════════════════════════════════════════════════
type TourPriceRange = "all" | "0-500" | "500-1000" | "1000-2000" | "2000+";
type TourPopularFilter = "all" | "popular" | "not-popular";
type TourSortField = "name" | "price" | "duration" | "order";
type TourSortDirection = "asc" | "desc";

interface TourFilters {
  search: string;
  priceRange: TourPriceRange;
  popularFilter: TourPopularFilter;
}

interface TourSortConfig {
  field: TourSortField;
  direction: TourSortDirection;
}

const initialTourFilters: TourFilters = {
  search: "",
  priceRange: "all",
  popularFilter: "all",
};

const initialTourSort: TourSortConfig = {
  field: "order",
  direction: "asc",
};

function getTourPriceRange(price: number): TourPriceRange {
  if (price < 500) return "0-500";
  if (price < 1000) return "500-1000";
  if (price < 2000) return "1000-2000";
  return "2000+";
}

function exportToursCSV(services: PopularServiceModel[]) {
  const headers = [
    "ID",
    "Tip",
    "İsim",
    "Açıklama",
    "İkon",
    "Süre",
    "Fiyat",
    "Popüler",
    "Sıra",
  ];

  const rows = services.map((s) => [
    s.id,
    serviceTypeLabels[s.type],
    s.name,
    s.description,
    s.icon,
    s.duration.text,
    s.price.display,
    s.isPopular ? "Evet" : "Hayır",
    (s.order ?? 0).toString(),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `populer-turlar-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ═══════════════════════════════════════════════════════════════
// ROUTES TAB - Filter Types & Helpers
// ═══════════════════════════════════════════════════════════════
type RouteSortField = "name" | "from" | "to" | "order";
type RouteSortDirection = "asc" | "desc";

interface RouteFilters {
  search: string;
  fromCity: string;
  toCity: string;
  isPopular: boolean | null;
}

interface RouteSortConfig {
  field: RouteSortField;
  direction: RouteSortDirection;
}

const initialRouteFilters: RouteFilters = {
  search: "",
  fromCity: "",
  toCity: "",
  isPopular: null,
};

const initialRouteSort: RouteSortConfig = {
  field: "order",
  direction: "asc",
};

function exportRoutesCSV(routes: PopularTransferRouteWithLocations[]) {
  const headers = [
    "ID",
    "Ad",
    "Ad (EN)",
    "Nereden",
    "Nereye",
    "İkon",
    "Mesafe (km)",
    "Süre (dk)",
    "Popüler",
    "Aktif",
    "Sıra",
  ];

  const rows = routes.map((r) => [
    r.id,
    r.name,
    r.nameEn || "",
    r.fromLocation?.name || "",
    r.toLocation?.name || "",
    r.icon,
    r.distanceKm?.toString() || "",
    r.durationMinutes?.toString() || "",
    r.isPopular ? "Evet" : "Hayır",
    r.isActive ? "Evet" : "Hayır",
    r.order.toString(),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `populer-rotalar-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ═══════════════════════════════════════════════════════════════
// EMOJI PICKER COMPONENT
// ═══════════════════════════════════════════════════════════════
interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  onClose: () => void;
}

function EmojiPicker({ value, onChange, onClose }: EmojiPickerProps) {
  return (
    <div className="space-y-4">
      {emojiCategories.map((category) => (
        <div key={category.name}>
          <p className="mb-2 text-xs font-medium text-gray-500">{category.name}</p>
          <div className="flex flex-wrap gap-1">
            {category.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  onClose();
                }}
                className={`h-10 w-10 rounded-lg text-xl transition-colors ${
                  value === emoji
                    ? "bg-emerald-100 ring-2 ring-emerald-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SERVICE FORM COMPONENT (For Tours Tab)
// ═══════════════════════════════════════════════════════════════
interface ServiceFormProps {
  service?: PopularServiceModel;
  onSave: (data: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    type: service?.type || "tour" as PopularServiceModel["type"],
    name: service?.name || "",
    nameEn: service?.nameEn || "",
    nameTr: service?.nameTr || "",
    description: service?.description || "",
    descriptionEn: service?.descriptionEn || "",
    descriptionTr: service?.descriptionTr || "",
    icon: service?.icon || "🕌",
    durationText: service?.duration.text || "",
    durationHours: service?.duration.hours || 1,
    distanceKm: service?.distance?.km || 0,
    distanceText: service?.distance?.text || "",
    priceDisplay: service?.price.display || "",
    priceBaseAmount: service?.price.baseAmount || 0,
    priceType: service?.price.type || "fixed" as PopularServiceModel["price"]["type"],
    routeFrom: service?.route?.from || "",
    routeTo: service?.route?.to || "",
    routeStops: service?.route?.stops?.join(", ") || "",
    isPopular: service?.isPopular ?? true,
    order: service?.order || 0,
    sedanPrice: service?.vehiclePrices?.sedan || 0,
    vanPrice: service?.vehiclePrices?.van || 0,
    busPrice: service?.vehiclePrices?.bus || 0,
    vipPrice: service?.vehiclePrices?.vip || 0,
    jeepPrice: service?.vehiclePrices?.jeep || 0,
    costerPrice: service?.vehiclePrices?.coster || 0,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt"> = {
      type: formData.type,
      name: formData.name,
      nameEn: formData.nameEn || undefined,
      nameTr: formData.nameTr || undefined,
      description: formData.description,
      descriptionEn: formData.descriptionEn || undefined,
      descriptionTr: formData.descriptionTr || undefined,
      icon: formData.icon,
      duration: {
        text: formData.durationText,
        hours: formData.durationHours,
      },
      distance: formData.distanceKm > 0 ? {
        km: formData.distanceKm,
        text: formData.distanceText,
      } : undefined,
      price: {
        display: formData.priceDisplay,
        baseAmount: formData.priceBaseAmount,
        type: formData.priceType,
      },
      route: formData.routeFrom || formData.routeTo ? {
        from: formData.routeFrom,
        to: formData.routeTo,
        stops: formData.routeStops ? formData.routeStops.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      } : undefined,
      isPopular: formData.isPopular,
      order: formData.order,
      vehiclePrices: {
        sedan: formData.sedanPrice || undefined,
        van: formData.vanPrice || undefined,
        bus: formData.busPrice || undefined,
        vip: formData.vipPrice || undefined,
        jeep: formData.jeepPrice || undefined,
        coster: formData.costerPrice || undefined,
      },
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Hizmet Tipi</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as PopularServiceModel["type"] })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            <option value="tour">Tur</option>
            <option value="transfer">Transfer</option>
            <option value="guide">Rehber</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">İkon</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-2xl hover:bg-gray-50"
            >
              {formData.icon}
            </button>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Emoji girin..."
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">İsim (Türkçe) *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mekke Şehir Turu"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">İsim (İngilizce)</label>
          <input
            type="text"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mecca City Tour"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">İsim (Alternatif TR)</label>
          <input
            type="text"
            value={formData.nameTr}
            onChange={(e) => setFormData({ ...formData, nameTr: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Alternatif isim"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Açıklama (Türkçe) *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Hizmet açıklaması..."
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Açıklama (İngilizce)</label>
          <textarea
            value={formData.descriptionEn}
            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Service description..."
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Açıklama (Alternatif TR)</label>
          <textarea
            value={formData.descriptionTr}
            onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Alternatif açıklama"
          />
        </div>
      </div>

      {/* Duration & Distance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Süre (Metin) *</label>
          <input type="text" value={formData.durationText} onChange={(e) => setFormData({ ...formData, durationText: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="4 saat" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Süre (Saat) *</label>
          <input type="number" value={formData.durationHours} onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="4" min="0.5" step="0.5" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Mesafe (km)</label>
          <input type="number" value={formData.distanceKm} onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="45" min="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Mesafe (Metin)</label>
          <input type="text" value={formData.distanceText} onChange={(e) => setFormData({ ...formData, distanceText: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="45 km" />
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Fiyat Görünüm *</label>
          <input type="text" value={formData.priceDisplay} onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="$250" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Fiyat (USD) *</label>
          <input type="number" value={formData.priceBaseAmount} onChange={(e) => setFormData({ ...formData, priceBaseAmount: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="250" min="0" required />
          <p className="mt-1 text-xs text-gray-500">Kullanıcı tarafında otomatik TL&apos;ye çevrilir</p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Fiyat Tipi *</label>
          <select value={formData.priceType} onChange={(e) => setFormData({ ...formData, priceType: e.target.value as PopularServiceModel["price"]["type"] })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required>
            <option value="fixed">Sabit Fiyat</option>
            <option value="per_person">Kişi Başı</option>
            <option value="per_km">Kilometre Başı</option>
          </select>
        </div>
      </div>

      {/* Vehicle Prices */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Araç Bazlı Fiyatlar (USD)</h3>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-xs text-gray-600">Her araç tipi için bu turun fiyatını belirleyin (USD cinsinden). Boş bırakılan alanlar varsayılan fiyatı kullanır.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {(["sedan", "van", "bus", "vip", "jeep", "coster"] as const).map((vt) => (
              <div key={vt}>
                <label className="mb-1 block text-xs font-medium text-gray-700">{vt.charAt(0).toUpperCase() + vt.slice(1)}</label>
                <input
                  type="number"
                  value={formData[`${vt}Price` as keyof typeof formData] as number}
                  onChange={(e) => setFormData({ ...formData, [`${vt}Price`]: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Kalkış Yeri</label>
          <input type="text" value={formData.routeFrom} onChange={(e) => setFormData({ ...formData, routeFrom: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Mekke Otel" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Varış Yeri</label>
          <input type="text" value={formData.routeTo} onChange={(e) => setFormData({ ...formData, routeTo: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Mekke Şehir Merkezi" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Ara Duraklar (virgülle ayırın)</label>
          <input type="text" value={formData.routeStops} onChange={(e) => setFormData({ ...formData, routeStops: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Cebeli Nur, Cebeli Sevr, Mina" />
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Sıra</label>
          <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="0" min="0" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isPopular} onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Popüler hizmet olarak işaretle</span>
          </label>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">İkon Seçin</h4>
            <button type="button" onClick={() => setShowEmojiPicker(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <EmojiPicker value={formData.icon} onChange={(emoji) => setFormData({ ...formData, icon: emoji })} onClose={() => setShowEmojiPicker(false)} />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
        <button type="submit" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROUTE FORM COMPONENT (For Routes Tab)
// ═══════════════════════════════════════════════════════════════
interface RouteFormProps {
  route?: PopularTransferRouteWithLocations;
  locations: TransferLocationModel[];
  onSave: (data: Omit<PopularTransferRouteWithLocations, "id" | "createdAt" | "updatedAt" | "fromLocation" | "toLocation">) => void;
  onCancel: () => void;
}

function RouteForm({ route, locations, onSave, onCancel }: RouteFormProps) {
  const [formData, setFormData] = useState({
    name: route?.name || "",
    nameEn: route?.nameEn || "",
    fromLocationId: route?.fromLocationId || "",
    toLocationId: route?.toLocationId || "",
    icon: route?.icon || "✈️",
    isActive: route?.isActive ?? true,
    isPopular: route?.isPopular ?? true,
    order: route?.order || 0,
    distanceKm: route?.distanceKm || 0,
    durationMinutes: route?.durationMinutes || 0,
    pricingEnabled: route?.pricingEnabled ?? true,
    sedanPrice: route?.prices?.sedan || 0,
    vanPrice: route?.prices?.van || 0,
    costerPrice: route?.prices?.coster || 0,
    busPrice: route?.prices?.bus || 0,
    vipPrice: route?.prices?.vip || 0,
    jeepPrice: route?.prices?.jeep || 0,
  });

  const locationsByCity = useMemo(() => {
    const grouped: Record<string, TransferLocationModel[]> = {};
    locations.forEach((loc) => {
      if (!grouped[loc.city]) grouped[loc.city] = [];
      grouped[loc.city].push(loc);
    });
    return grouped;
  }, [locations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasAnyPrice = formData.sedanPrice > 0 || formData.vanPrice > 0 ||
                       formData.costerPrice > 0 || formData.busPrice > 0 ||
                       formData.vipPrice > 0 || formData.jeepPrice > 0;
    
    const prices = formData.pricingEnabled && hasAnyPrice ? {
      sedan: formData.sedanPrice || undefined,
      van: formData.vanPrice || undefined,
      coster: formData.costerPrice || undefined,
      bus: formData.busPrice || undefined,
      vip: formData.vipPrice || undefined,
      jeep: formData.jeepPrice || undefined,
    } : undefined;

    const data = {
      name: formData.name,
      nameEn: formData.nameEn || undefined,
      fromLocationId: formData.fromLocationId,
      toLocationId: formData.toLocationId,
      icon: formData.icon,
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      order: formData.order,
      distanceKm: formData.distanceKm || undefined,
      durationMinutes: formData.durationMinutes || undefined,
      pricingEnabled: formData.pricingEnabled,
      prices,
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Rota Adı (Türkçe) *</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Cidde Havalimanı → Mekke" required />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Rota Adı (İngilizce)</label>
          <input type="text" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Jeddah Airport → Mecca" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nereden *</label>
          <select value={formData.fromLocationId} onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required>
            <option value="">Seçin</option>
            {Object.entries(locationsByCity).map(([city, locs]) => (
              <optgroup key={city} label={city}>
                {locs.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.icon} {loc.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nereye *</label>
          <select value={formData.toLocationId} onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" required>
            <option value="">Seçin</option>
            {Object.entries(locationsByCity).map(([city, locs]) => (
              <optgroup key={city} label={city}>
                {locs.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.icon} {loc.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">İkon *</label>
          <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="✈️" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Sıra</label>
          <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="0" min="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Mesafe (km)</label>
          <input type="number" value={formData.distanceKm} onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="75" min="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Süre (dakika)</label>
          <input type="number" value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="75" min="0" />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Aktif</span>
          </label>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isPopular} onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Popüler (Ana sayfada göster)</span>
          </label>
        </div>
      </div>

      {/* Vehicle Prices Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Araç Bazlı Fiyatlar (USD)</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.pricingEnabled} onChange={(e) => setFormData({ ...formData, pricingEnabled: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-xs font-medium text-gray-600">Fiyat yönetimi aktif</span>
          </label>
        </div>
        <p className="mb-3 text-xs text-gray-500">Her araç tipi için bu rotanın fiyatını belirleyin (USD cinsinden). Boş bırakılan alanlar için varsayılan fiyatlar kullanılır.</p>
        {formData.pricingEnabled && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {(["sedan", "van", "coster", "bus", "vip", "jeep"] as const).map((vt) => (
              <div key={vt}>
                <label className="mb-1 block text-xs font-medium text-gray-700">{vt.charAt(0).toUpperCase() + vt.slice(1)}</label>
                <input
                  type="number"
                  value={formData[`${vt}Price` as keyof typeof formData] as number}
                  onChange={(e) => setFormData({ ...formData, [`${vt}Price`]: Number(e.target.value) })}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0"
                  min="0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">İptal</button>
        <button type="submit" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT - Birleşik Rotalar ve Transferler Sayfası
// ═══════════════════════════════════════════════════════════════
export default function RoutesAndTransfersPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const tabParam = searchParams.get("tab");
    return tabParam === "tours" || tabParam === "routes" ? tabParam : "routes";
  });
  const [loading, setLoading] = useState(true);

  // ─── Routes Tab State ────────────────────────────────────────
  const [routesData, setRoutesData] = useState<PopularTransferRouteWithLocations[]>([]);
  const [locations, setLocations] = useState<TransferLocationModel[]>([]);
  const [routeFilters, setRouteFilters] = useState<RouteFilters>(initialRouteFilters);
  const [routeSort, setRouteSort] = useState<RouteSortConfig>(initialRouteSort);
  const [routePage, setRoutePage] = useState(1);
  const [showRouteFilters, setShowRouteFilters] = useState(false);
  const [showRouteFormModal, setShowRouteFormModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<PopularTransferRouteWithLocations | null>(null);
  const [routeStats, setRouteStats] = useState({ total: 0, active: 0, popular: 0 });

  // ─── Tours Tab State ─────────────────────────────────────────
  const [toursData, setToursData] = useState<PopularServiceModel[]>([]);
  const [tourFilters, setTourFilters] = useState<TourFilters>(initialTourFilters);
  const [tourSort, setTourSort] = useState<TourSortConfig>(initialTourSort);
  const [tourPage, setTourPage] = useState(1);
  const [showTourFilters, setShowTourFilters] = useState(false);
  const [showTourFormModal, setShowTourFormModal] = useState(false);
  const [editingService, setEditingService] = useState<PopularServiceModel | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [tourStats, setTourStats] = useState<{ total: number; popular: number; byType: Record<string, number> }>({
    total: 0, popular: 0, byType: { transfer: 0, tour: 0, guide: 0 },
  });

  // ─── Data Loading ────────────────────────────────────────────
  const loadAll = async () => {
    setLoading(true);
    try {
      const [routesResult, locationsResult, routeStatsResult, toursResult, tourStatsResult] = await Promise.all([
        getAllRoutesWithLocations(),
        getAllTransferLocations(),
        getPopularTransferRouteStats(),
        getAllPopularServices(),
        getPopularServiceStats(),
      ]);
      setRoutesData(routesResult);
      setLocations(locationsResult);
      setRouteStats(routeStatsResult);
      setToursData(toursResult);
      setTourStats(tourStatsResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ─── Tab değiştiğinde URL'yi güncelle ─────────────────────────
  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ROUTES TAB - Computed Values & Handlers
  // ═══════════════════════════════════════════════════════════════
  const filteredRoutes = useMemo(() => {
    let items = [...routesData];
    if (routeFilters.search) {
      const term = routeFilters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.nameEn?.toLowerCase().includes(term) ||
          r.fromLocation?.name.toLowerCase().includes(term) ||
          r.toLocation?.name.toLowerCase().includes(term)
      );
    }
    if (routeFilters.fromCity) {
      items = items.filter((r) => r.fromLocation?.city === routeFilters.fromCity);
    }
    if (routeFilters.toCity) {
      items = items.filter((r) => r.toLocation?.city === routeFilters.toCity);
    }
    if (routeFilters.isPopular !== null) {
      items = items.filter((r) => r.isPopular === routeFilters.isPopular);
    }
    items.sort((a, b) => {
      let comparison = 0;
      switch (routeSort.field) {
        case "name": comparison = a.name.localeCompare(b.name, "tr"); break;
        case "from": comparison = (a.fromLocation?.name || "").localeCompare(b.fromLocation?.name || "", "tr"); break;
        case "to": comparison = (a.toLocation?.name || "").localeCompare(b.toLocation?.name || "", "tr"); break;
        case "order": comparison = a.order - b.order; break;
      }
      return routeSort.direction === "asc" ? comparison : -comparison;
    });
    return items;
  }, [routesData, routeFilters, routeSort]);

  const routeTotalPages = Math.ceil(filteredRoutes.length / PAGE_SIZE);
  const paginatedRoutes = filteredRoutes.slice((routePage - 1) * PAGE_SIZE, routePage * PAGE_SIZE);

  useEffect(() => { setRoutePage(1); }, [routeFilters, routeSort]);

  const uniqueRouteCities = useMemo(() => {
    const cities = new Set<string>();
    routesData.forEach((r) => {
      if (r.fromLocation?.city) cities.add(r.fromLocation.city);
      if (r.toLocation?.city) cities.add(r.toLocation.city);
    });
    return Array.from(cities).sort();
  }, [routesData]);

  const updateRouteFilter = useCallback(<K extends keyof RouteFilters>(key: K, value: RouteFilters[K]) => {
    setRouteFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetRouteFilters = useCallback(() => {
    setRouteFilters(initialRouteFilters);
    setRouteSort(initialRouteSort);
  }, []);

  const toggleRouteSort = useCallback((field: RouteSortField) => {
    setRouteSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleRouteToggleActive = useCallback(async (route: PopularTransferRouteWithLocations) => {
    await updatePopularTransferRoute(route.id, { isActive: !route.isActive });
    setRoutesData((prev) => prev.map((r) => (r.id === route.id ? { ...r, isActive: !route.isActive } : r)));
    queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
  }, [queryClient]);

  const handleRouteTogglePopular = useCallback(async (route: PopularTransferRouteWithLocations) => {
    await updatePopularTransferRoute(route.id, { isPopular: !route.isPopular });
    setRoutesData((prev) => prev.map((r) => (r.id === route.id ? { ...r, isPopular: !route.isPopular } : r)));
    queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
  }, [queryClient]);

  const handleRouteDelete = useCallback(async (route: PopularTransferRouteWithLocations) => {
    if (!confirm("Bu rotayı silmek istediğinize emin misiniz?")) return;
    await deletePopularTransferRoute(route.id);
    setRoutesData((prev) => prev.filter((r) => r.id !== route.id));
    queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
  }, [queryClient]);

  const handleRouteEdit = useCallback((route: PopularTransferRouteWithLocations) => {
    setEditingRoute(route);
    setShowRouteFormModal(true);
  }, []);

  const handleRouteNew = useCallback(() => {
    setEditingRoute(null);
    setShowRouteFormModal(true);
  }, []);

  const handleRouteSave = useCallback(async (
    routeData: Omit<PopularTransferRouteWithLocations, "id" | "createdAt" | "updatedAt" | "fromLocation" | "toLocation">
  ) => {
    const now = new Date();
    if (editingRoute) {
      await updatePopularTransferRoute(editingRoute.id, routeData);
      setRoutesData((prev) => prev.map((r) => (r.id === editingRoute.id ? { ...routeData, id: r.id, updatedAt: now } : r)));
    } else {
      const newId = await createPopularTransferRoute(routeData);
      setRoutesData((prev) => [...prev, { ...routeData, id: newId, createdAt: now, updatedAt: now }]);
    }
    queryClient.invalidateQueries({ queryKey: ["popularTransferRoutes"] });
    setShowRouteFormModal(false);
    setEditingRoute(null);
  }, [editingRoute, queryClient]);

  const handleRoutesExport = useCallback(() => {
    exportRoutesCSV(filteredRoutes);
  }, [filteredRoutes]);

  // ─── Routes Table Columns ─────────────────────────────────────
  const routeColumns: Column<PopularTransferRouteWithLocations>[] = [
    {
      key: "icon",
      header: "",
      render: (r) => <span className="text-2xl">{r.icon}</span>,
      className: "w-16",
    },
    {
      key: "name",
      header: "Rota Adı",
      render: (r) => (
        <div className="max-w-[200px]">
          <p className="truncate text-sm font-medium text-gray-900">{r.name}</p>
          {r.nameEn && <p className="truncate text-xs text-gray-500">{r.nameEn}</p>}
        </div>
      ),
    },
    {
      key: "route",
      header: "Rota",
      render: (r) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{r.fromLocation?.name || "?"}</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-900 font-medium">{r.toLocation?.name || "?"}</span>
        </div>
      ),
    },
    {
      key: "distance",
      header: "Mesafe",
      render: (r) => <span className="text-xs text-gray-500">{r.distanceKm ? `${r.distanceKm} km` : "-"}</span>,
    },
    {
      key: "duration",
      header: "Süre",
      render: (r) => <span className="text-xs text-gray-500">{r.durationMinutes ? `${r.durationMinutes} dk` : "-"}</span>,
    },
    {
      key: "price",
      header: "Fiyat",
      render: (r) => {
        if (!r.pricingEnabled || !r.prices) {
          return <span className="text-xs text-gray-400">Varsayılan</span>;
        }
        const priceRange = formatRoutePriceRange(r.prices);
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">{priceRange}</span>
          </div>
        );
      },
    },
    {
      key: "badges",
      header: "Rozetler",
      render: (r) => (
        <div className="flex gap-1">
          {r.isPopular && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Star className="mr-0.5 h-3 w-3" />
              Popüler
            </span>
          )}
        </div>
      ),
    },
    {
      key: "order",
      header: "Sıra",
      render: (r) => <span className="text-sm font-medium text-gray-600">#{r.order}</span>,
    },
    {
      key: "status",
      header: "Durum",
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleRouteToggleActive(r); }}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          {r.isActive ? "Aktif" : "Pasif"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleRouteTogglePopular(r); }} className={`p-1.5 rounded-lg transition-colors ${r.isPopular ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"}`} title={r.isPopular ? "Popülerlikten kaldır" : "Popüler işaretle"}>
            <Star className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleRouteEdit(r); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600" title="Düzenle">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleRouteDelete(r); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" title="Sil">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // TOURS TAB - Computed Values & Handlers
  // ═══════════════════════════════════════════════════════════════
  const filteredTours = useMemo(() => {
    let items = [...toursData];
    items = items.filter((s) => s.type === "tour");
    if (tourFilters.search) {
      const term = tourFilters.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.nameEn?.toLowerCase().includes(term) ||
          s.nameTr?.toLowerCase().includes(term),
      );
    }
    if (tourFilters.priceRange !== "all") {
      items = items.filter((s) => getTourPriceRange(s.price.baseAmount) === tourFilters.priceRange);
    }
    if (tourFilters.popularFilter === "popular") {
      items = items.filter((s) => s.isPopular);
    } else if (tourFilters.popularFilter === "not-popular") {
      items = items.filter((s) => !s.isPopular);
    }
    items.sort((a, b) => {
      let comparison = 0;
      switch (tourSort.field) {
        case "name": comparison = a.name.localeCompare(b.name, "tr"); break;
        case "price": comparison = a.price.baseAmount - b.price.baseAmount; break;
        case "duration": comparison = a.duration.hours - b.duration.hours; break;
        case "order": comparison = (a.order ?? 0) - (b.order ?? 0); break;
      }
      return tourSort.direction === "asc" ? comparison : -comparison;
    });
    return items;
  }, [toursData, tourFilters, tourSort]);

  const tourTotalPages = Math.ceil(filteredTours.length / PAGE_SIZE);
  const paginatedTours = filteredTours.slice((tourPage - 1) * PAGE_SIZE, tourPage * PAGE_SIZE);

  useEffect(() => { setTourPage(1); }, [tourFilters, tourSort]);

  const updateTourFilter = useCallback(<K extends keyof TourFilters>(key: K, value: TourFilters[K]) => {
    setTourFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetTourFilters = useCallback(() => {
    setTourFilters(initialTourFilters);
    setTourSort(initialTourSort);
  }, []);

  const toggleTourSort = useCallback((field: TourSortField) => {
    setTourSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleTourTogglePopular = useCallback(async (service: PopularServiceModel) => {
    await updatePopularService(service.id, { isPopular: !service.isPopular });
    setToursData((prev) => prev.map((s) => (s.id === service.id ? { ...s, isPopular: !s.isPopular } : s)));
    queryClient.invalidateQueries({ queryKey: ["popularServices"] });
    queryClient.invalidateQueries({ queryKey: ["popularTours"] });
  }, [queryClient]);

  const handleTourDelete = useCallback(async (service: PopularServiceModel) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    await deletePopularService(service.id);
    setToursData((prev) => prev.filter((s) => s.id !== service.id));
    queryClient.invalidateQueries({ queryKey: ["popularServices"] });
    queryClient.invalidateQueries({ queryKey: ["popularTours"] });
    queryClient.invalidateQueries({ queryKey: ["popularTransfers"] });
    queryClient.invalidateQueries({ queryKey: ["popularGuides"] });
    queryClient.invalidateQueries({ queryKey: ["popularService"] });
  }, [queryClient]);

  const handleTourEdit = useCallback((service: PopularServiceModel) => {
    setEditingService(service);
    setShowTourFormModal(true);
  }, []);

  const handleTourNew = useCallback(() => {
    setEditingService(null);
    setShowTourFormModal(true);
  }, []);

  const handleTourSave = useCallback(async (
    serviceData: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingService) {
      await updatePopularService(editingService.id, serviceData);
      setToursData((prev) => prev.map((s) => (s.id === editingService.id ? { ...serviceData, id: s.id } : s)));
    } else {
      const newId = await createPopularService(serviceData);
      setToursData((prev) => [...prev, { ...serviceData, id: newId }]);
    }
    queryClient.invalidateQueries({ queryKey: ["popularServices"] });
    queryClient.invalidateQueries({ queryKey: ["popularTours"] });
    queryClient.invalidateQueries({ queryKey: ["popularTransfers"] });
    queryClient.invalidateQueries({ queryKey: ["popularGuides"] });
    queryClient.invalidateQueries({ queryKey: ["popularService"] });
    setShowTourFormModal(false);
    setEditingService(null);
  }, [editingService, queryClient]);

  const handleToursExport = useCallback(() => {
    exportToursCSV(filteredTours);
  }, [filteredTours]);

  // ─── Tour Reordering ─────────────────────────────────────────
  const handleTourMoveUp = useCallback(async (service: PopularServiceModel) => {
    const currentIndex = filteredTours.findIndex((s) => s.id === service.id);
    if (currentIndex === 0) return;
    const prevService = filteredTours[currentIndex - 1];
    const newOrder = prevService.order;
    await updatePopularService(service.id, { order: newOrder });
    await updatePopularService(prevService.id, { order: service.order });
    setToursData((prev) =>
      prev.map((s) => {
        if (s.id === service.id) return { ...s, order: newOrder };
        if (s.id === prevService.id) return { ...s, order: service.order };
        return s;
      }),
    );
    queryClient.invalidateQueries({ queryKey: ["popularServices"] });
    queryClient.invalidateQueries({ queryKey: ["popularTours"] });
  }, [filteredTours, queryClient]);

  const handleTourMoveDown = useCallback(async (service: PopularServiceModel) => {
    const currentIndex = filteredTours.findIndex((s) => s.id === service.id);
    if (currentIndex === filteredTours.length - 1) return;
    const nextService = filteredTours[currentIndex + 1];
    const newOrder = nextService.order;
    await updatePopularService(service.id, { order: newOrder });
    await updatePopularService(nextService.id, { order: service.order });
    setToursData((prev) =>
      prev.map((s) => {
        if (s.id === service.id) return { ...s, order: newOrder };
        if (s.id === nextService.id) return { ...s, order: service.order };
        return s;
      }),
    );
    queryClient.invalidateQueries({ queryKey: ["popularServices"] });
    queryClient.invalidateQueries({ queryKey: ["popularTours"] });
  }, [filteredTours, queryClient]);

  // ─── Tours Table Columns ─────────────────────────────────────
  const tourColumns: Column<PopularServiceModel>[] = [
    {
      key: "icon",
      header: "",
      render: (s) => <span className="text-2xl">{s.icon}</span>,
      className: "w-16",
    },
    {
      key: "name",
      header: "Hizmet",
      render: (s) => (
        <div className="max-w-[200px]">
          <p className="truncate text-sm font-medium text-gray-900">{s.name}</p>
          <p className="truncate text-xs text-gray-500">{s.description}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tip",
      render: (s) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${serviceTypeColors[s.type].bg} ${serviceTypeColors[s.type].text} ${serviceTypeColors[s.type].border} border`}>
          {serviceTypeLabels[s.type]}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Süre",
      render: (s) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-3.5 w-3.5" />
          {s.duration.text}
        </div>
      ),
    },
    {
      key: "price",
      header: "Araç Fiyatları",
      render: (s) => {
        const vp = s.vehiclePrices;
        if (!vp) {
          return (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-gray-900">{s.price.display}</span>
              <span className="text-xs text-gray-400">(tek fiyat)</span>
            </div>
          );
        }
        const prices = Object.values(vp).filter((p): p is number => p != null && p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : s.price.baseAmount;
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-bold text-emerald-700">${minPrice}</span>
              <span className="text-xs text-gray-400">&apos;den başlayan</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              {vp.sedan != null && vp.sedan > 0 && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-center font-medium">Sedan ${vp.sedan}</span>}
              {vp.van != null && vp.van > 0 && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-center font-medium">Van ${vp.van}</span>}
              {vp.bus != null && vp.bus > 0 && <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-center font-medium">Bus ${vp.bus}</span>}
              {vp.vip != null && vp.vip > 0 && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-center font-medium">VIP ${vp.vip}</span>}
              {vp.jeep != null && vp.jeep > 0 && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-center font-medium">Jeep ${vp.jeep}</span>}
              {vp.coster != null && vp.coster > 0 && <span className="bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded text-center font-medium">Coster ${vp.coster}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: "badges",
      header: "Rozetler",
      render: (s) => (
        <div className="flex gap-1">
          {s.isPopular && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Popcorn className="mr-0.5 h-3 w-3" />
              Popüler
            </span>
          )}
        </div>
      ),
    },
    {
      key: "order",
      header: "Sıra",
      render: (s) => <span className="text-sm font-medium text-gray-600">#{s.order}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <div className="flex items-center gap-2">
          {isReordering ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleTourMoveUp(s); }} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Yukarı taşı">↑</button>
              <button onClick={(e) => { e.stopPropagation(); handleTourMoveDown(s); }} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Aşağı taşı">↓</button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleTourTogglePopular(s); }} className={`p-1.5 rounded-lg transition-colors ${s.isPopular ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"}`} title={s.isPopular ? "Popülerlikten kaldır" : "Popüler işaretle"}>
                <Popcorn className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleTourEdit(s); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600" title="Düzenle">
                <Edit3 className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleTourDelete(s); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600" title="Sil">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
      className: "text-right",
    },
  ];

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rotalar ve Transferler</h1>
            <p className="text-sm text-gray-500">Popüler transfer rotalarını ve turları yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "tours" && (
            <button
              onClick={() => setIsReordering(!isReordering)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                isReordering
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <GripVertical className="h-4 w-4" />
              {isReordering ? "Sıralama Tamam" : "Sırala"}
            </button>
          )}
          <button
            onClick={activeTab === "routes" ? handleRoutesExport : handleToursExport}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
          <button
            onClick={activeTab === "routes" ? handleRouteNew : handleTourNew}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "routes" ? "Yeni Rota" : "Yeni Tur"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Toplam Rota"
          value={routeStats.total}
          icon={MapPin}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Aktif Rota"
          value={routeStats.active}
          subtitle={`Toplamın %${Math.round((routeStats.active / routeStats.total) * 100) || 0}`}
          icon={Plane}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Popüler Rota"
          value={routeStats.popular}
          icon={Star}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Toplam Tur"
          value={tourStats.byType.tour || 0}
          icon={Popcorn}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <StatCard
          title="Rehberler"
          value={tourStats.byType.guide || 0}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          <button
            onClick={() => handleTabChange("routes")}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "routes"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <Plane className="h-4 w-4" />
            Transfer Rotaları ve Fiyatlar
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === "routes" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
              {routeStats.total}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("tours")}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "tours"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}

          >
            <Popcorn className="h-4 w-4" />
            Tur Rotaları ve Fiyatlar
            <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${activeTab === "tours" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
              {tourStats.byType.tour || 0}
            </span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ROUTES TAB CONTENT */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === "routes" && (
        <>
          {/* Search and Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={routeFilters.search}
              onChange={(v) => updateRouteFilter("search", v)}
              placeholder="Rota adı veya lokasyon ara..."
              className="w-full sm:w-72"
            />
            <button
              onClick={() => setShowRouteFilters(!showRouteFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                showRouteFilters
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtreler
              {(routeFilters.fromCity || routeFilters.toCity || routeFilters.isPopular !== null) && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                  {[routeFilters.fromCity, routeFilters.toCity, routeFilters.isPopular !== null].filter(Boolean).length}
                </span>
              )}
            </button>
            <span className="ml-auto text-sm text-gray-500">{filteredRoutes.length} sonuç</span>
          </div>

          {/* Advanced Filters */}
          {showRouteFilters && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Gelişmiş Filtreler</h3>
                <button onClick={resetRouteFilters} className="text-sm text-gray-500 hover:text-emerald-600">Filtreleri Temizle</button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Kalkış Şehri</label>
                  <select value={routeFilters.fromCity} onChange={(e) => updateRouteFilter("fromCity", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Tümü</option>
                    {uniqueRouteCities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Varış Şehri</label>
                  <select value={routeFilters.toCity} onChange={(e) => updateRouteFilter("toCity", e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Tümü</option>
                    {uniqueRouteCities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Popülerlik</label>
                  <select value={routeFilters.isPopular === null ? "" : routeFilters.isPopular.toString()} onChange={(e) => updateRouteFilter("isPopular", e.target.value === "" ? null : e.target.value === "true")} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">Tümü</option>
                    <option value="true">Sadece Popüler</option>
                    <option value="false">Popüler Olmayan</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className="mb-2 block text-xs font-medium text-gray-500">Sıralama</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { field: "order" as RouteSortField, label: "Sıra" },
                    { field: "name" as RouteSortField, label: "İsim" },
                    { field: "from" as RouteSortField, label: "Kalkış" },
                    { field: "to" as RouteSortField, label: "Varış" },
                  ]).map((sortOption) => (
                    <button
                      key={sortOption.field}
                      onClick={() => toggleRouteSort(sortOption.field)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        routeSort.field === sortOption.field
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {sortOption.label}
                      {routeSort.field === sortOption.field && (
                        <span className="text-[10px]">{routeSort.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Routes Data Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              <DataTable
                data={paginatedRoutes}
                columns={routeColumns}
                keyExtractor={(r) => r.id}
                emptyMessage="Rota bulunamadı"
              />
              <Pagination currentPage={routePage} totalPages={routeTotalPages} onPageChange={setRoutePage} />
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TOURS TAB CONTENT */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab === "tours" && (
        <>
          {/* Search and Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={tourFilters.search}
              onChange={(v) => updateTourFilter("search", v)}
              placeholder="Hizmet adı veya açıklama ara..."
              className="w-full sm:w-72"
            />
            <button
              onClick={() => setShowTourFilters(!showTourFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                showTourFilters
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtreler
              {(tourFilters.priceRange !== "all" || tourFilters.popularFilter !== "all") && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                  {[tourFilters.priceRange !== "all", tourFilters.popularFilter !== "all"].filter(Boolean).length}
                </span>
              )}
            </button>
            <span className="ml-auto text-sm text-gray-500">{filteredTours.length} sonuç</span>
          </div>

          {/* Advanced Filters */}
          {showTourFilters && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Gelişmiş Filtreler</h3>
                <button onClick={resetTourFilters} className="text-sm text-gray-500 hover:text-emerald-600">Filtreleri Temizle</button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Fiyat Aralığı</label>
                  <select value={tourFilters.priceRange} onChange={(e) => updateTourFilter("priceRange", e.target.value as TourPriceRange)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="all">Tümü</option>
                    <option value="0-500">$0 - $500</option>
                    <option value="500-1000">$500 - $1.000</option>
                    <option value="1000-2000">$1.000 - $2.000</option>
                    <option value="2000+">$2.000+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">Popülerlik</label>
                  <select value={tourFilters.popularFilter} onChange={(e) => updateTourFilter("popularFilter", e.target.value as TourPopularFilter)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="all">Tümü</option>
                    <option value="popular">Sadece Popüler</option>
                    <option value="not-popular">Popüler Olmayan</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <label className="mb-2 block text-xs font-medium text-gray-500">Sıralama</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { field: "order" as TourSortField, label: "Sıra" },
                    { field: "name" as TourSortField, label: "İsim" },
                    { field: "price" as TourSortField, label: "Fiyat" },
                    { field: "duration" as TourSortField, label: "Süre" },
                  ]).map((sortOption) => (
                    <button
                      key={sortOption.field}
                      onClick={() => toggleTourSort(sortOption.field)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        tourSort.field === sortOption.field
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {sortOption.label}
                      {tourSort.field === sortOption.field && (
                        <span className="text-[10px]">{tourSort.direction === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tours Data Table */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              <DataTable
                data={paginatedTours}
                columns={tourColumns}
                keyExtractor={(s) => s.id}
                emptyMessage="Popüler hizmet bulunamadı"
              />
              <Pagination currentPage={tourPage} totalPages={tourTotalPages} onPageChange={setTourPage} />
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODALS */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Route Form Modal */}
      <Modal
        open={showRouteFormModal}
        onClose={() => { setShowRouteFormModal(false); setEditingRoute(null); }}
        title={editingRoute ? "Rotayı Düzenle" : "Yeni Rota Ekle"}
        maxWidth="lg"
      >
        <RouteForm
          route={editingRoute || undefined}
          locations={locations}
          onSave={handleRouteSave}
          onCancel={() => { setShowRouteFormModal(false); setEditingRoute(null); }}
        />
      </Modal>

      {/* Tour Form Modal */}
      <Modal
        open={showTourFormModal}
        onClose={() => { setShowTourFormModal(false); setEditingService(null); }}
        title={editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
        maxWidth="xl"
      >
        <ServiceForm
          service={editingService || undefined}
          onSave={handleTourSave}
          onCancel={() => { setShowTourFormModal(false); setEditingService(null); }}
        />
      </Modal>
    </div>
  );
}
