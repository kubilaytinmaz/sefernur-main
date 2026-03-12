"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import {
    createPopularService,
    deletePopularService,
    getAllPopularServices,
    getPopularServiceStats,
    updatePopularService
} from "@/lib/firebase/admin-domain";
import {
    emojiCategories,
    PopularServiceModel,
    serviceTypeColors,
    serviceTypeLabels
} from "@/types/popular-service";
import {
    Activity,
    Clock,
    DollarSign,
    Download,
    Edit3,
    Filter,
    GripVertical,
    Loader2,
    MapPin,
    Plus,
    Popcorn,
    Save,
    Star,
    Trash2,
    Users,
    X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ─── Filter Types ─────────────────────────────────────────────────────────
type PriceRange = "all" | "0-500" | "500-1000" | "1000-2000" | "2000+";
type PopularFilter = "all" | "popular" | "not-popular";
type SortField = "name" | "price" | "duration" | "order";
type SortDirection = "asc" | "desc";

interface ServiceFilters {
  search: string;
  type: string;
  priceRange: PriceRange;
  popularFilter: PopularFilter;
}

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const initialFilters: ServiceFilters = {
  search: "",
  type: "",
  priceRange: "all",
  popularFilter: "all",
};

const initialSort: SortConfig = {
  field: "order",
  direction: "asc",
};

// ─── Helper Functions ─────────────────────────────────────────────────────
function getPriceRange(price: number): PriceRange {
  if (price < 500) return "0-500";
  if (price < 1000) return "500-1000";
  if (price < 2000) return "1000-2000";
  return "2000+";
}

function exportToCSV(services: PopularServiceModel[]) {
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
    s.order.toString(),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `populer-hizmetler-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ─── Emoji Picker Component ───────────────────────────────────────────────
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

// ─── Service Form Component ───────────────────────────────────────────────
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
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Service Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Hizmet Tipi
          </label>
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

        {/* Icon */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İkon
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
            />
          </div>
        </div>

        {/* Name */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İsim (Türkçe) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mekke Şehir Turu"
            required
          />
        </div>

        {/* Name EN */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İsim (İngilizce)
          </label>
          <input
            type="text"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mecca City Tour"
          />
        </div>

        {/* Name TR (Alternative) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            İsim (Alternatif TR)
          </label>
          <input
            type="text"
            value={formData.nameTr}
            onChange={(e) => setFormData({ ...formData, nameTr: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Alternatif isim"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (Türkçe) *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Hizmet açıklaması..."
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
            placeholder="Service description..."
          />
        </div>

        {/* Description TR (Alternative) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Açıklama (Alternatif TR)
          </label>
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
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Süre (Metin) *
          </label>
          <input
            type="text"
            value={formData.durationText}
            onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="4 saat"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Süre (Saat) *
          </label>
          <input
            type="number"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="4"
            min="0.5"
            step="0.5"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mesafe (km)
          </label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="45"
            min="0"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mesafe (Metin)
          </label>
          <input
            type="text"
            value={formData.distanceText}
            onChange={(e) => setFormData({ ...formData, distanceText: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="45 km"
          />
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Fiyat Görünüm *
          </label>
          <input
            type="text"
            value={formData.priceDisplay}
            onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="800₺"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Fiyat (TL) *
          </label>
          <input
            type="number"
            value={formData.priceBaseAmount}
            onChange={(e) => setFormData({ ...formData, priceBaseAmount: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="800"
            min="0"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Fiyat Tipi *
          </label>
          <select
            value={formData.priceType}
            onChange={(e) => setFormData({ ...formData, priceType: e.target.value as PopularServiceModel["price"]["type"] })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          >
            <option value="fixed">Sabit Fiyat</option>
            <option value="per_person">Kişi Başı</option>
            <option value="per_km">Kilometre Başı</option>
          </select>
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Kalkış Yeri
          </label>
          <input
            type="text"
            value={formData.routeFrom}
            onChange={(e) => setFormData({ ...formData, routeFrom: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mekke Otel"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Varış Yeri
          </label>
          <input
            type="text"
            value={formData.routeTo}
            onChange={(e) => setFormData({ ...formData, routeTo: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mekke Şehir Merkezi"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ara Duraklar (virgülle ayırın)
          </label>
          <input
            type="text"
            value={formData.routeStops}
            onChange={(e) => setFormData({ ...formData, routeStops: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Cebeli Nur, Cebeli Sevr, Mina"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Sıra
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="0"
            min="0"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Popüler hizmet olarak işaretle</span>
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
export default function PopularServicesPage() {
  const [data, setData] = useState<PopularServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ServiceFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<PopularServiceModel | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [stats, setStats] = useState<{ total: number; popular: number; byType: Record<string, number> }>({
    total: 0,
    popular: 0,
    byType: { transfer: 0, tour: 0, guide: 0 },
  });

  const load = async () => {
    setLoading(true);
    try {
      const [items, statsData] = await Promise.all([
        getAllPopularServices(),
        getPopularServiceStats(),
      ]);
      setData(items);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Computed Values ─────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let items = [...data];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.nameEn?.toLowerCase().includes(term) ||
          s.nameTr?.toLowerCase().includes(term),
      );
    }

    // Type filter
    if (filters.type) {
      items = items.filter((s) => s.type === filters.type);
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      items = items.filter((s) => getPriceRange(s.price.baseAmount) === filters.priceRange);
    }

    // Popular filter
    if (filters.popularFilter === "popular") {
      items = items.filter((s) => s.isPopular);
    } else if (filters.popularFilter === "not-popular") {
      items = items.filter((s) => !s.isPopular);
    }

    // Sorting
    items.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name, "tr");
          break;
        case "price":
          comparison = a.price.baseAmount - b.price.baseAmount;
          break;
        case "duration":
          comparison = a.duration.hours - b.duration.hours;
          break;
        case "order":
          comparison = a.order - b.order;
          break;
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });

    return items;
  }, [data, filters, sort]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter/sort change
  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const updateFilter = useCallback(<K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSort(initialSort);
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleTogglePopular = useCallback(async (service: PopularServiceModel) => {
    await updatePopularService(service.id, { isPopular: !service.isPopular });
    setData((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isPopular: !s.isPopular } : s)),
    );
  }, []);

  const handleDelete = useCallback(async (service: PopularServiceModel) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    await deletePopularService(service.id);
    setData((prev) => prev.filter((s) => s.id !== service.id));
  }, []);

  const handleEdit = useCallback((service: PopularServiceModel) => {
    setEditingService(service);
    setShowFormModal(true);
  }, []);

  const handleNew = useCallback(() => {
    setEditingService(null);
    setShowFormModal(true);
  }, []);

  const handleSave = useCallback(async (
    serviceData: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingService) {
      await updatePopularService(editingService.id, serviceData);
      setData((prev) =>
        prev.map((s) => (s.id === editingService.id ? { ...serviceData, id: s.id } : s)),
      );
    } else {
      const newId = await createPopularService(serviceData);
      setData((prev) => [...prev, { ...serviceData, id: newId }]);
    }
    setShowFormModal(false);
    setEditingService(null);
  }, [editingService]);

  const handleExport = useCallback(() => {
    exportToCSV(filteredAndSorted);
  }, [filteredAndSorted]);

  // ─── Reordering Handlers ─────────────────────────────────────────────────
  const handleMoveUp = useCallback(async (service: PopularServiceModel) => {
    const currentIndex = filteredAndSorted.findIndex((s) => s.id === service.id);
    if (currentIndex === 0) return;

    const prevService = filteredAndSorted[currentIndex - 1];
    const newOrder = prevService.order;

    await updatePopularService(service.id, { order: newOrder });
    await updatePopularService(prevService.id, { order: service.order });

    setData((prev) =>
      prev.map((s) => {
        if (s.id === service.id) return { ...s, order: newOrder };
        if (s.id === prevService.id) return { ...s, order: service.order };
        return s;
      }),
    );
  }, [filteredAndSorted]);

  const handleMoveDown = useCallback(async (service: PopularServiceModel) => {
    const currentIndex = filteredAndSorted.findIndex((s) => s.id === service.id);
    if (currentIndex === filteredAndSorted.length - 1) return;

    const nextService = filteredAndSorted[currentIndex + 1];
    const newOrder = nextService.order;

    await updatePopularService(service.id, { order: newOrder });
    await updatePopularService(nextService.id, { order: service.order });

    setData((prev) =>
      prev.map((s) => {
        if (s.id === service.id) return { ...s, order: newOrder };
        if (s.id === nextService.id) return { ...s, order: service.order };
        return s;
      }),
    );
  }, [filteredAndSorted]);

  // ─── Table Columns ───────────────────────────────────────────────────────
  const columns: Column<PopularServiceModel>[] = [
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
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            serviceTypeColors[s.type].bg
          } ${serviceTypeColors[s.type].text} ${serviceTypeColors[s.type].border} border`}
        >
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
      header: "Fiyat",
      render: (s) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium text-gray-900">{s.price.display}</span>
        </div>
      ),
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
      render: (s) => (
        <span className="text-sm font-medium text-gray-600">#{s.order}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <div className="flex items-center gap-2">
          {isReordering ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveUp(s);
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Yukarı taşı"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveDown(s);
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Aşağı taşı"
              >
                ↓
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePopular(s);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  s.isPopular
                    ? "text-amber-500 hover:bg-amber-50"
                    : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                }`}
                title={s.isPopular ? "Popülerlikten kaldır" : "Popüler işaretle"}
              >
                <Popcorn className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(s);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                title="Düzenle"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(s);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
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
          <Popcorn className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Popüler Hizmetler</h1>
            <p className="text-sm text-gray-500">Transfer, tur ve rehber hizmetlerini yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
          <button
            onClick={handleNew}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Yeni Hizmet
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Toplam Hizmet"
          value={stats.total}
          icon={Popcorn}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Popüler Hizmetler"
          value={stats.popular}
          subtitle={`Toplamın %${Math.round((stats.popular / stats.total) * 100) || 0}`}
          icon={Star}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Turlar"
          value={stats.byType.tour}
          icon={MapPin}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <StatCard
          title="Transferler"
          value={stats.byType.transfer}
          icon={Activity}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Rehberler"
          value={stats.byType.guide}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
          placeholder="Hizmet adı veya açıklama ara..."
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
          {(filters.type ||
            filters.priceRange !== "all" ||
            filters.popularFilter !== "all") && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
              {[
                filters.type,
                filters.priceRange !== "all",
                filters.popularFilter !== "all",
              ].filter(Boolean).length}
            </span>
          )}
        </button>
        <span className="ml-auto text-sm text-gray-500">{filteredAndSorted.length} sonuç</span>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-emerald-600"
            >
              Filtreleri Temizle
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Service Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Hizmet Tipi</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter("type", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                <option value="tour">Turlar</option>
                <option value="transfer">Transferler</option>
                <option value="guide">Rehberler</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Fiyat Aralığı</label>
              <select
                value={filters.priceRange}
                onChange={(e) => updateFilter("priceRange", e.target.value as PriceRange)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tümü</option>
                <option value="0-500">₺0 - ₺500</option>
                <option value="500-1000">₺500 - ₺1.000</option>
                <option value="1000-2000">₺1.000 - ₺2.000</option>
                <option value="2000+">₺2.000+</option>
              </select>
            </div>

            {/* Popular Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Popülerlik</label>
              <select
                value={filters.popularFilter}
                onChange={(e) => updateFilter("popularFilter", e.target.value as PopularFilter)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tümü</option>
                <option value="popular">Sadece Popüler</option>
                <option value="not-popular">Popüler Olmayan</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <label className="mb-2 block text-xs font-medium text-gray-500">Sıralama</label>
            <div className="flex flex-wrap gap-2">
              {[
                { field: "order" as SortField, label: "Sıra" },
                { field: "name" as SortField, label: "İsim" },
                { field: "price" as SortField, label: "Fiyat" },
                { field: "duration" as SortField, label: "Süre" },
              ].map((sortOption) => (
                <button
                  key={sortOption.field}
                  onClick={() => toggleSort(sortOption.field)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort.field === sortOption.field
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sortOption.label}
                  {sort.field === sortOption.field && (
                    <span className="text-[10px]">
                      {sort.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
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
          <DataTable
            data={paginated}
            columns={columns}
            keyExtractor={(s) => s.id}
            emptyMessage="Popüler hizmet bulunamadı"
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Form Modal */}
      <Modal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingService(null);
        }}
        title={editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
        maxWidth="xl"
      >
        <ServiceForm
          service={editingService || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowFormModal(false);
            setEditingService(null);
          }}
        />
      </Modal>
    </div>
  );
}
