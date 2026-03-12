"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import {
    createTransferLocation,
    createTransferRoute,
    deleteTransferLocation,
    deleteTransferRoute,
    getAllTransferLocations,
    getAllTransferRoutes,
    getTransferLocationStats,
    getTransferRouteStats,
    updateTransferLocation,
    updateTransferRoute
} from "@/lib/firebase/admin-domain";
import {
    locationTypeIcons,
    locationTypeLabels,
    routeCategoryLabels,
    TransferLocationModel,
    TransferLocationType,
    TransferRouteCategory,
    TransferRouteModel
} from "@/types/transfer-location";
import {
    Edit3,
    Filter,
    Loader2,
    MapPin,
    Plus,
    Route,
    Save,
    Trash2,
    X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ─── Types ────────────────────────────────────────────────────────────────
type ActiveTab = "locations" | "routes";

interface LocationFilters {
  search: string;
  type: string;
  city: string;
  isPopular: "all" | "popular" | "not-popular";
}

interface RouteFilters {
  search: string;
  category: string;
  isPopular: "all" | "popular" | "not-popular";
}

const initialLocationFilters: LocationFilters = {
  search: "",
  type: "",
  city: "",
  isPopular: "all",
};

const initialRouteFilters: RouteFilters = {
  search: "",
  category: "",
  isPopular: "all",
};

// ─── Emoji Categories for Locations ───────────────────────────────────────
const locationEmojiCategories = [
  {
    name: "Ulaşım",
    emojis: ["✈️", "🛫", "🛬", "🚂", "🚉", "🚆", "🚇", "🚊", "🚝", "🚄"],
  },
  {
    name: "Konaklama",
    emojis: ["🏨", "🏩", "🏢", "🏛️", "🏰", "🏯"],
  },
  {
    name: "Dini Yerler",
    emojis: ["🕌", "🕋", "⛪", "🛕", "⛩️"],
  },
  {
    name: "Şehir ve Yerler",
    emojis: ["🏙️", "🌆", "🏘️", "🏗️", "🗼", "🏛️", "🏟️", "🌃", "🌇"],
  },
  {
    name: "Diğer",
    emojis: ["📍", "🗺️", "🧭", "🎯", "⭐", "🔶", "🔷", "🔹", "🔸"],
  },
];

// ─── Emoji Picker Component ───────────────────────────────────────────────
interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  onClose: () => void;
  type?: TransferLocationType;
}

function EmojiPicker({ value, onChange, onClose, type }: EmojiPickerProps) {
  // Show suggested emojis based on location type
  const suggestions = type ? locationTypeIcons[type] : [];

  return (
    <div className="space-y-4">
      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-emerald-600">Önerilen İkonlar</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.map((emoji) => (
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
      )}
      {locationEmojiCategories.map((category) => (
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

// ─── Location Form Component ──────────────────────────────────────────────
interface LocationFormProps {
  location?: TransferLocationModel;
  onSave: (data: Omit<TransferLocationModel, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: location?.name || "",
    nameEn: location?.nameEn || "",
    nameTr: location?.nameTr || "",
    type: location?.type || "city" as TransferLocationType,
    city: location?.city || "",
    country: location?.country || "Saudi Arabia",
    address: location?.address || "",
    latitude: location?.coordinates.latitude || 0,
    longitude: location?.coordinates.longitude || 0,
    icon: location?.icon || "📍",
    description: location?.description || "",
    descriptionEn: location?.descriptionEn || "",
    descriptionTr: location?.descriptionTr || "",
    isPopular: location?.isPopular ?? false,
    usageCount: location?.usageCount || 0,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<TransferLocationModel, "id" | "createdAt" | "updatedAt"> = {
      name: formData.name,
      nameEn: formData.nameEn,
      nameTr: formData.nameTr,
      type: formData.type,
      city: formData.city,
      country: formData.country,
      address: formData.address || undefined,
      coordinates: {
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      icon: formData.icon,
      description: formData.description || undefined,
      descriptionEn: formData.descriptionEn || undefined,
      descriptionTr: formData.descriptionTr || undefined,
      isPopular: formData.isPopular,
      usageCount: formData.usageCount,
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Location Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Lokasyon Tipi *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TransferLocationType })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            {Object.entries(locationTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Icon */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İkon *
          </label>
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
              required
            />
          </div>
        </div>

        {/* Name */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İsim (Genel) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="King Abdulaziz International Airport"
            required
          />
        </div>

        {/* Name EN */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İsim (İngilizce) *
          </label>
          <input
            type="text"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Jeddah Airport"
            required
          />
        </div>

        {/* Name TR */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İsim (Türkçe) *
          </label>
          <input
            type="text"
            value={formData.nameTr}
            onChange={(e) => setFormData({ ...formData, nameTr: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Cidde Havalimanı"
            required
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Şehir *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mecca"
            required
          />
        </div>

        {/* Country */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ülke *
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Saudi Arabia"
            required
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Adres
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Tam adres..."
          />
        </div>

        {/* Coordinates */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Enlem (Latitude) *
          </label>
          <input
            type="number"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="21.4225"
            step="0.000001"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Boylam (Longitude) *
          </label>
          <input
            type="number"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="39.8262"
            step="0.000001"
            required
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (Genel)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Lokasyon açıklaması..."
          />
        </div>

        {/* Description EN */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (İngilizce)
          </label>
          <textarea
            value={formData.descriptionEn}
            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Location description..."
          />
        </div>

        {/* Description TR */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (Türkçe)
          </label>
          <textarea
            value={formData.descriptionTr}
            onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Lokasyon açıklaması..."
          />
        </div>

        {/* Is Popular */}
        <div className="flex items-end sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Popüler lokasyon olarak işaretle</span>
          </label>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">İkon Seçin</h4>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <EmojiPicker
            value={formData.icon}
            onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
            onClose={() => setShowEmojiPicker(false)}
            type={formData.type}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </form>
  );
}

// ─── Route Form Component ─────────────────────────────────────────────────
interface RouteFormProps {
  route?: TransferRouteModel;
  locations: TransferLocationModel[];
  onSave: (data: Omit<TransferRouteModel, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

function RouteForm({ route, locations, onSave, onCancel }: RouteFormProps) {
  const [formData, setFormData] = useState({
    fromLocationId: route?.fromLocationId || "",
    toLocationId: route?.toLocationId || "",
    viaLocationIds: route?.viaLocationIds?.join(",") || "",
    category: route?.category || "transfer" as TransferRouteCategory,
    subCategory: route?.subCategory || "",
    distanceKm: route?.distanceKm || 0,
    durationMinutes: route?.durationMinutes || 0,
    icon: route?.icon || "🚗",
    description: route?.description || "",
    descriptionEn: route?.descriptionEn || "",
    descriptionTr: route?.descriptionTr || "",
    isPopular: route?.isPopular ?? false,
    usageCount: route?.usageCount || 0,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<TransferRouteModel, "id" | "createdAt" | "updatedAt"> = {
      fromLocationId: formData.fromLocationId,
      toLocationId: formData.toLocationId,
      viaLocationIds: formData.viaLocationIds
        ? formData.viaLocationIds.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      distanceKm: formData.distanceKm,
      durationMinutes: formData.durationMinutes,
      icon: formData.icon,
      description: formData.description,
      descriptionEn: formData.descriptionEn || undefined,
      descriptionTr: formData.descriptionTr || undefined,
      isPopular: formData.isPopular,
      usageCount: formData.usageCount,
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Kategori *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as TransferRouteCategory })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            {Object.entries(routeCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Icon */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İkon *
          </label>
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
              required
            />
          </div>
        </div>

        {/* From Location */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Kalkış Lokasyonu *
          </label>
          <select
            value={formData.fromLocationId}
            onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            <option value="">Seçin...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.icon} {loc.name} ({loc.city})
              </option>
            ))}
          </select>
        </div>

        {/* To Location */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Varış Lokasyonu *
          </label>
          <select
            value={formData.toLocationId}
            onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            <option value="">Seçin...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.icon} {loc.name} ({loc.city})
              </option>
            ))}
          </select>
        </div>

        {/* Via Locations */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ara Duraklar (Lokasyon ID'leri, virgülle ayırın)
          </label>
          <input
            type="text"
            value={formData.viaLocationIds}
            onChange={(e) => setFormData({ ...formData, viaLocationIds: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="loc1, loc2, loc3"
          />
        </div>

        {/* Distance */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mesafe (km) *
          </label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="45"
            min="0"
            step="0.1"
            required
          />
        </div>

        {/* Duration */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Süre (dakika) *
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="60"
            min="0"
            required
          />
        </div>

        {/* Sub Category */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Alt Kategori
          </label>
          <input
            type="text"
            value={formData.subCategory}
            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Airport Transfer, City Tour, etc."
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (Genel) *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Rota açıklaması..."
            required
          />
        </div>

        {/* Description EN */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (İngilizce)
          </label>
          <textarea
            value={formData.descriptionEn}
            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Route description..."
          />
        </div>

        {/* Description TR */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (Türkçe)
          </label>
          <textarea
            value={formData.descriptionTr}
            onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Rota açıklaması..."
          />
        </div>

        {/* Is Popular */}
        <div className="flex items-end sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Popüler rota olarak işaretle</span>
          </label>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">İkon Seçin</h4>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <EmojiPicker
            value={formData.icon}
            onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function TransferLocationsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("locations");
  const [locations, setLocations] = useState<TransferLocationModel[]>([]);
  const [routes, setRoutes] = useState<TransferRouteModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilters, setLocationFilters] = useState<LocationFilters>(initialLocationFilters);
  const [routeFilters, setRouteFilters] = useState<RouteFilters>(initialRouteFilters);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<TransferLocationModel | null>(null);
  const [editingRoute, setEditingRoute] = useState<TransferRouteModel | null>(null);
  const [locationStats, setLocationStats] = useState<{
    total: number;
    popular: number;
    byType: Record<string, number>;
  }>({ total: 0, popular: 0, byType: {} });
  const [routeStats, setRouteStats] = useState<{
    total: number;
    popular: number;
    byCategory: Record<string, number>;
  }>({ total: 0, popular: 0, byCategory: {} });

  const loadData = async () => {
    setLoading(true);
    try {
      const [locationsData, routesData, locStatsData, routeStatsData] = await Promise.all([
        getAllTransferLocations(),
        getAllTransferRoutes(),
        getTransferLocationStats(),
        getTransferRouteStats(),
      ]);
      setLocations(locationsData);
      setRoutes(routesData);
      setLocationStats(locStatsData);
      setRouteStats(routeStatsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filtered Data ────────────────────────────────────────────────────────
  const filteredLocations = useMemo(() => {
    let items = [...locations];

    if (locationFilters.search) {
      const term = locationFilters.search.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          l.nameEn.toLowerCase().includes(term) ||
          l.nameTr.toLowerCase().includes(term) ||
          l.city.toLowerCase().includes(term),
      );
    }

    if (locationFilters.type) {
      items = items.filter((l) => l.type === locationFilters.type);
    }

    if (locationFilters.city) {
      const cityTerm = locationFilters.city.toLowerCase();
      items = items.filter((l) => l.city.toLowerCase().includes(cityTerm));
    }

    if (locationFilters.isPopular === "popular") {
      items = items.filter((l) => l.isPopular);
    } else if (locationFilters.isPopular === "not-popular") {
      items = items.filter((l) => !l.isPopular);
    }

    return items;
  }, [locations, locationFilters]);

  const filteredRoutes = useMemo(() => {
    let items = [...routes];

    if (routeFilters.search) {
      const term = routeFilters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.description.toLowerCase().includes(term) ||
          r.descriptionEn?.toLowerCase().includes(term) ||
          r.descriptionTr?.toLowerCase().includes(term),
      );
    }

    if (routeFilters.category) {
      items = items.filter((r) => r.category === routeFilters.category);
    }

    if (routeFilters.isPopular === "popular") {
      items = items.filter((r) => r.isPopular);
    } else if (routeFilters.isPopular === "not-popular") {
      items = items.filter((r) => !r.isPopular);
    }

    return items;
  }, [routes, routeFilters]);

  const totalPages =
    activeTab === "locations"
      ? Math.ceil(filteredLocations.length / PAGE_SIZE)
      : Math.ceil(filteredRoutes.length / PAGE_SIZE);

  const paginatedLocations = filteredLocations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const paginatedRoutes = filteredRoutes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [locationFilters, routeFilters, activeTab]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleLocationSave = useCallback(
    async (data: Omit<TransferLocationModel, "id" | "createdAt" | "updatedAt">) => {
      if (editingLocation) {
        await updateTransferLocation(editingLocation.id, data);
        setLocations((prev) =>
          prev.map((l) => (l.id === editingLocation.id ? { ...data, id: l.id } : l)),
        );
      } else {
        const newId = await createTransferLocation(data);
        setLocations((prev) => [...prev, { ...data, id: newId }]);
      }
      setShowLocationForm(false);
      setEditingLocation(null);
      await loadData(); // Refresh stats
    },
    [editingLocation],
  );

  const handleRouteSave = useCallback(
    async (data: Omit<TransferRouteModel, "id" | "createdAt" | "updatedAt">) => {
      if (editingRoute) {
        await updateTransferRoute(editingRoute.id, data);
        setRoutes((prev) => prev.map((r) => (r.id === editingRoute.id ? { ...data, id: r.id } : r)));
      } else {
        const newId = await createTransferRoute(data);
        setRoutes((prev) => [...prev, { ...data, id: newId }]);
      }
      setShowRouteForm(false);
      setEditingRoute(null);
      await loadData(); // Refresh stats
    },
    [editingRoute],
  );

  const handleLocationDelete = useCallback(async (location: TransferLocationModel) => {
    if (!confirm("Bu lokasyonu silmek istediğinize emin misiniz?")) return;
    await deleteTransferLocation(location.id);
    setLocations((prev) => prev.filter((l) => l.id !== location.id));
  }, []);

  const handleRouteDelete = useCallback(async (route: TransferRouteModel) => {
    if (!confirm("Bu rotayı silmek istediğinize emin misiniz?")) return;
    await deleteTransferRoute(route.id);
    setRoutes((prev) => prev.filter((r) => r.id !== route.id));
  }, []);

  // ─── Table Columns ────────────────────────────────────────────────────────
  const locationColumns: Column<TransferLocationModel>[] = [
    {
      key: "icon",
      header: "",
      render: (l) => <span className="text-2xl">{l.icon}</span>,
      className: "w-16",
    },
    {
      key: "name",
      header: "Lokasyon",
      render: (l) => (
        <div className="max-w-[250px]">
          <p className="truncate text-sm font-medium text-gray-900">{l.name}</p>
          <p className="truncate text-xs text-gray-500">
            {l.city}, {l.country}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tip",
      render: (l) => (
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          {locationTypeLabels[l.type]}
        </span>
      ),
    },
    {
      key: "coordinates",
      header: "Koordinatlar",
      render: (l) => (
        <div className="text-xs text-gray-600">
          {l.coordinates.latitude.toFixed(4)}, {l.coordinates.longitude.toFixed(4)}
        </div>
      ),
    },
    {
      key: "usage",
      header: "Kullanım",
      render: (l) => <span className="text-sm text-gray-600">{l.usageCount}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (l) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingLocation(l);
              setShowLocationForm(true);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
            title="Düzenle"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLocationDelete(l);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const routeColumns: Column<TransferRouteModel>[] = [
    {
      key: "icon",
      header: "",
      render: (r) => <span className="text-2xl">{r.icon}</span>,
      className: "w-16",
    },
    {
      key: "route",
      header: "Rota",
      render: (r) => {
        const fromLoc = locations.find((l) => l.id === r.fromLocationId);
        const toLoc = locations.find((l) => l.id === r.toLocationId);
        return (
          <div className="max-w-[300px]">
            <p className="truncate text-sm font-medium text-gray-900">
              {fromLoc?.name || r.fromLocationId} → {toLoc?.name || r.toLocationId}
            </p>
            <p className="truncate text-xs text-gray-500">{r.description}</p>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Kategori",
      render: (r) => (
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {routeCategoryLabels[r.category]}
        </span>
      ),
    },
    {
      key: "distance",
      header: "Mesafe/Süre",
      render: (r) => (
        <div className="text-xs text-gray-600">
          {r.distanceKm} km / {r.durationMinutes} dk
        </div>
      ),
    },
    {
      key: "usage",
      header: "Kullanım",
      render: (r) => <span className="text-sm text-gray-600">{r.usageCount}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingRoute(r);
              setShowRouteForm(true);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
            title="Düzenle"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRouteDelete(r);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
            title="Sil"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lokasyon & Rota Yönetimi</h1>
            <p className="text-sm text-gray-500">Transfer lokasyonları ve rotaları yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === "locations") {
                setEditingLocation(null);
                setShowLocationForm(true);
              } else {
                setEditingRoute(null);
                setShowRouteForm(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            {activeTab === "locations" ? "Yeni Lokasyon" : "Yeni Rota"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("locations")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === "locations"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Lokasyonlar
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {locationStats.total}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("routes")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === "routes"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Rotalar
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {routeStats.total}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      {activeTab === "locations" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Lokasyon"
            value={locationStats.total}
            icon={MapPin}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Popüler Lokasyonlar"
            value={locationStats.popular}
            subtitle={`Toplamın %${Math.round((locationStats.popular / locationStats.total) * 100) || 0}`}
            icon={MapPin}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Havalimanları"
            value={locationStats.byType.airport || 0}
            icon={MapPin}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Oteller"
            value={locationStats.byType.hotel || 0}
            icon={MapPin}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Rota"
            value={routeStats.total}
            icon={Route}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Popüler Rotalar"
            value={routeStats.popular}
            subtitle={`Toplamın %${Math.round((routeStats.popular / routeStats.total) * 100) || 0}`}
            icon={Route}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Transfer Rotaları"
            value={routeStats.byCategory.transfer || 0}
            icon={Route}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Tur Rotaları"
            value={routeStats.byCategory.tour || 0}
            icon={Route}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={activeTab === "locations" ? locationFilters.search : routeFilters.search}
          onChange={(v) =>
            activeTab === "locations"
              ? setLocationFilters({ ...locationFilters, search: v })
              : setRouteFilters({ ...routeFilters, search: v })
          }
          placeholder={
            activeTab === "locations" ? "Lokasyon ara..." : "Rota ara..."
          }
          className="w-full sm:w-72"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtreler
        </button>
        <span className="ml-auto text-sm text-gray-500">
          {activeTab === "locations" ? filteredLocations.length : filteredRoutes.length} sonuç
        </span>
      </div>

      {/* Advanced Filters */}
      {showFilters && activeTab === "locations" && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <button
              onClick={() => setLocationFilters(initialLocationFilters)}
              className="text-sm text-gray-500 hover:text-emerald-600"
            >
              Filtreleri Temizle
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Lokasyon Tipi</label>
              <select
                value={locationFilters.type}
                onChange={(e) => setLocationFilters({ ...locationFilters, type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                {Object.entries(locationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Şehir</label>
              <input
                type="text"
                value={locationFilters.city}
                onChange={(e) => setLocationFilters({ ...locationFilters, city: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Şehir adı..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Popülerlik</label>
              <select
                value={locationFilters.isPopular}
                onChange={(e) =>
                  setLocationFilters({
                    ...locationFilters,
                    isPopular: e.target.value as typeof locationFilters.isPopular,
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tümü</option>
                <option value="popular">Sadece Popüler</option>
                <option value="not-popular">Popüler Olmayan</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showFilters && activeTab === "routes" && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <button
              onClick={() => setRouteFilters(initialRouteFilters)}
              className="text-sm text-gray-500 hover:text-emerald-600"
            >
              Filtreleri Temizle
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Kategori</label>
              <select
                value={routeFilters.category}
                onChange={(e) => setRouteFilters({ ...routeFilters, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                {Object.entries(routeCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Popülerlik</label>
              <select
                value={routeFilters.isPopular}
                onChange={(e) =>
                  setRouteFilters({
                    ...routeFilters,
                    isPopular: e.target.value as typeof routeFilters.isPopular,
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tümü</option>
                <option value="popular">Sadece Popüler</option>
                <option value="not-popular">Popüler Olmayan</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {activeTab === "locations" ? (
            <DataTable
              data={paginatedLocations}
              columns={locationColumns}
              keyExtractor={(l) => l.id}
              emptyMessage="Lokasyon bulunamadı"
            />
          ) : (
            <DataTable
              data={paginatedRoutes}
              columns={routeColumns}
              keyExtractor={(r) => r.id}
              emptyMessage="Rota bulunamadı"
            />
          )}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Location Form Modal */}
      <Modal
        open={showLocationForm}
        onClose={() => {
          setShowLocationForm(false);
          setEditingLocation(null);
        }}
        title={editingLocation ? "Lokasyonu Düzenle" : "Yeni Lokasyon Ekle"}
        maxWidth="xl"
      >
        <LocationForm
          location={editingLocation || undefined}
          onSave={handleLocationSave}
          onCancel={() => {
            setShowLocationForm(false);
            setEditingLocation(null);
          }}
        />
      </Modal>

      {/* Route Form Modal */}
      <Modal
        open={showRouteForm}
        onClose={() => {
          setShowRouteForm(false);
          setEditingRoute(null);
        }}
        title={editingRoute ? "Rotayı Düzenle" : "Yeni Rota Ekle"}
        maxWidth="xl"
      >
        <RouteForm
          route={editingRoute || undefined}
          locations={locations}
          onSave={handleRouteSave}
          onCancel={() => {
            setShowRouteForm(false);
            setEditingRoute(null);
          }}
        />
      </Modal>
    </div>
  );
}
