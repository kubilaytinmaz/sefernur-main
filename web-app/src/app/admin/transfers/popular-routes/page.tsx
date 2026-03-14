"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import {
    createPopularRoute,
    deletePopularRoute,
    getAllPopularRoutes,
    reorderPopularRoutes,
    updatePopularRoute
} from "@/lib/firebase/admin-domain";
import {
    PopularRouteModel,
    popularRouteCategoryColors,
    popularRouteCategoryLabels,
} from "@/types/popular-route";
import {
    Activity,
    Clock,
    Download,
    Edit3,
    GripVertical,
    Loader2,
    MapPin,
    Plus,
    Save,
    Star,
    Trash2,
    X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ─── Filter Types ─────────────────────────────────────────────────────────
type DistanceRange = "all" | "0-50" | "50-100" | "100-200" | "200+";
type PopularFilter = "all" | "popular" | "not-popular";
type SortField = "name" | "distance" | "duration" | "order";
type SortDirection = "asc" | "desc";

interface RouteFilters {
  search: string;
  category: string;
  distanceRange: DistanceRange;
  popularFilter: PopularFilter;
}

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const initialFilters: RouteFilters = {
  search: "",
  category: "",
  distanceRange: "all",
  popularFilter: "all",
};

const initialSort: SortConfig = {
  field: "order",
  direction: "asc",
};

// ─── Helper Functions ─────────────────────────────────────────────────────
function getDistanceRange(distance: number): DistanceRange {
  if (distance < 50) return "0-50";
  if (distance < 100) return "50-100";
  if (distance < 200) return "100-200";
  return "200+";
}

function exportToCSV(routes: PopularRouteModel[]) {
  const headers = [
    "ID",
    "İsim",
    "İkon",
    "Kategori",
    "Nereden",
    "Nereye",
    "Mesafe",
    "Süre",
    "Popüler",
    "Sıra",
  ];

  const rows = routes.map((r) => [
    r.id,
    r.name,
    r.icon,
    r.category || "-",
    `${r.from.city} (${r.from.name})`,
    `${r.to.city} (${r.to.name})`,
    `${r.distance.km} km`,
    r.duration.text,
    r.isPopular ? "Evet" : "Hayır",
    r.order.toString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `popular-routes-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ─── Emoji Picker Component ───────────────────────────────────────────────
interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  onClose: () => void;
}

const routeEmojiCategories = [
  { name: "Ulaşım", emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "✈️", "🚁", "🛩️"] },
  { name: "Yerler", emojis: ["🕌", "⛪", "🏛️", "🏰", "🏯", "⛩️", "🕍", "🗼", "🗽"] },
  { name: "Konum", emojis: ["📍", "🏙️", "🏨", "🏪", "🏢", "🏠", "🏘️", "🏝️"] },
];

function EmojiPicker({ value, onChange, onClose }: EmojiPickerProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">İkon Seç</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {routeEmojiCategories.map((category) => (
            <div key={category.name} className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                {category.name}
              </p>
              <div className="grid grid-cols-8 gap-2">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onChange(emoji);
                      onClose();
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                      value === emoji
                        ? "bg-cyan-100 ring-2 ring-cyan-500"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Route Form Component ───────────────────────────────────────────────────
interface RouteFormProps {
  route: PopularRouteModel | null;
  onSave: (data: Omit<PopularRouteModel, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

function RouteForm({ route, onSave, onCancel }: RouteFormProps) {
  const [formData, setFormData] = useState({
    name: route?.name || "",
    icon: route?.icon || "🚗",
    category: (route?.category || "local") as PopularRouteModel["category"],
    fromCity: route?.from.city || "",
    fromName: route?.from.name || "",
    toCity: route?.to.city || "",
    toName: route?.to.name || "",
    distanceKm: route?.distance.km || 0,
    distanceText: route?.distance.text || "",
    durationMinutes: route?.duration.minutes || 0,
    durationText: route?.duration.text || "",
    isPopular: route?.isPopular || false,
    order: route?.order || 0,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<PopularRouteModel, "id" | "createdAt" | "updatedAt"> = {
      name: formData.name,
      icon: formData.icon,
      from: {
        city: formData.fromCity,
        name: formData.fromName,
      },
      to: {
        city: formData.toCity,
        name: formData.toName,
      },
      distance: {
        km: formData.distanceKm,
        text: formData.distanceText,
      },
      duration: {
        minutes: formData.durationMinutes,
        text: formData.durationText,
      },
      category: formData.category,
      isPopular: formData.isPopular,
      order: formData.order,
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* İkon ve İsim */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İkon
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(true)}
              className="w-16 h-16 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-3xl transition-colors"
            >
              {formData.icon}
            </button>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm"
              placeholder="Emoji girin..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rota Adı
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="Örn: Havalimanı - Mekke"
            required
          />
        </div>
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategori
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as PopularRouteModel["category"],
            })
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          {Object.entries(popularRouteCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Nereden ve Nereye */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nereden (Şehir)
          </label>
          <input
            type="text"
            value={formData.fromCity}
            onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="Örn: Jeddah"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nereden (Konum)
          </label>
          <input
            type="text"
            value={formData.fromName}
            onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="Örn: Kral Abdulaziz Havalimanı"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nereye (Şehir)
          </label>
          <input
            type="text"
            value={formData.toCity}
            onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="Örn: Mekke"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nereye (Konum)
          </label>
          <input
            type="text"
            value={formData.toName}
            onChange={(e) => setFormData({ ...formData, toName: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="Örn: Mescid-i Haram"
            required
          />
        </div>
      </div>

      {/* Mesafe ve Süre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mesafe (km)
          </label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) =>
              setFormData({ ...formData, distanceKm: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="85"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mesafe (Metin)
          </label>
          <input
            type="text"
            value={formData.distanceText}
            onChange={(e) => setFormData({ ...formData, distanceText: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="85 km"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Süre (dakika)
          </label>
          <input
            type="number"
            value={formData.durationMinutes}
            onChange={(e) =>
              setFormData({ ...formData, durationMinutes: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="60"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Süre (Metin)
          </label>
          <input
            type="text"
            value={formData.durationText}
            onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            placeholder="1 saat"
            required
          />
        </div>
      </div>

      {/* Sıra ve Popüler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sıra
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
            required
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-gray-700">Popüler rota</span>
          </label>
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold hover:from-cyan-600 hover:to-sky-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Kaydet
        </button>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <EmojiPicker
          value={formData.icon}
          onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </form>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────
export default function PopularRoutesPage() {
  const [data, setData] = useState<PopularRouteModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<PopularRouteModel | null>(null);
  const [filters, setFilters] = useState<RouteFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getAllPopularRoutes();
      setData(items);
    } catch (error) {
      console.error("Failed to load popular routes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAndSorted = useMemo(() => {
    let items = [...data];

    // Filter
    if (filters.search) {
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.from.city.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.to.city.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.category) {
      items = items.filter((r) => r.category === filters.category);
    }
    if (filters.distanceRange !== "all") {
      items = items.filter((r) => getDistanceRange(r.distance.km) === filters.distanceRange);
    }
    if (filters.popularFilter !== "all") {
      items = items.filter((r) =>
        filters.popularFilter === "popular" ? r.isPopular : !r.isPopular
      );
    }

    // Sort
    items.sort((a, b) => {
      const modifier = sort.direction === "asc" ? 1 : -1;
      switch (sort.field) {
        case "name":
          return a.name.localeCompare(b.name) * modifier;
        case "distance":
          return (a.distance.km - b.distance.km) * modifier;
        case "duration":
          return (a.duration.minutes - b.duration.minutes) * modifier;
        case "order":
          return (a.order - b.order) * modifier;
        default:
          return 0;
      }
    });

    return items;
  }, [data, filters, sort]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / PAGE_SIZE);

  const updateFilter = useCallback(<K extends keyof RouteFilters>(
    key: K,
    value: RouteFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSort(initialSort);
    setCurrentPage(1);
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleTogglePopular = useCallback(async (route: PopularRouteModel) => {
    try {
      await updatePopularRoute(route.id, { isPopular: !route.isPopular });
      loadData();
    } catch (error) {
      console.error("Failed to toggle popular:", error);
    }
  }, [loadData]);

  const handleDelete = useCallback(async (route: PopularRouteModel) => {
    if (!confirm(`"${route.name}" rotasını silmek istediğinizden emin misiniz?`)) return;
    try {
      await deletePopularRoute(route.id);
      loadData();
    } catch (error) {
      console.error("Failed to delete route:", error);
    }
  }, [loadData]);

  const handleEdit = useCallback((route: PopularRouteModel) => {
    setEditingRoute(route);
    setShowForm(true);
  }, []);

  const handleNew = useCallback(() => {
    setEditingRoute(null);
    setShowForm(true);
  }, []);

  const handleSave = useCallback(
    async (
      data: Omit<PopularRouteModel, "id" | "createdAt" | "updatedAt">
    ) => {
      try {
        if (editingRoute) {
          await updatePopularRoute(editingRoute.id, data);
        } else {
          await createPopularRoute(data);
        }
        setShowForm(false);
        setEditingRoute(null);
        loadData();
      } catch (error) {
        console.error("Failed to save route:", error);
      }
    },
    [editingRoute, loadData]
  );

  const handleMoveUp = useCallback(
    async (route: PopularRouteModel) => {
      const currentIndex = filteredAndSorted.findIndex((r) => r.id === route.id);
      if (currentIndex === 0) return;

      const prevRoute = filteredAndSorted[currentIndex - 1];
      const updates = [
        { id: route.id, order: prevRoute.order },
        { id: prevRoute.id, order: route.order },
      ];

      await reorderPopularRoutes(updates);
      setData((prev) =>
        prev.map((r) => {
          if (r.id === route.id) return { ...r, order: prevRoute.order };
          if (r.id === prevRoute.id) return { ...r, order: route.order };
          return r;
        })
      );
    },
    [filteredAndSorted]
  );

  const handleMoveDown = useCallback(
    async (route: PopularRouteModel) => {
      const currentIndex = filteredAndSorted.findIndex((r) => r.id === route.id);
      if (currentIndex === filteredAndSorted.length - 1) return;

      const nextRoute = filteredAndSorted[currentIndex + 1];
      const updates = [
        { id: route.id, order: nextRoute.order },
        { id: nextRoute.id, order: route.order },
      ];

      await reorderPopularRoutes(updates);
      setData((prev) =>
        prev.map((r) => {
          if (r.id === route.id) return { ...r, order: nextRoute.order };
          if (r.id === nextRoute.id) return { ...r, order: route.order };
          return r;
        })
      );
    },
    [filteredAndSorted]
  );

  const columns: Column<PopularRouteModel>[] = [
    {
      key: "order",
      header: "",
      render: () => <GripVertical className="w-4 h-4 text-gray-400" />,
      className: "w-8",
    },
    {
      key: "icon",
      header: "İkon",
      render: (r) => <span className="text-2xl">{r.icon}</span>,
    },
    {
      key: "name",
      header: "Rota Adı",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.name}</p>
          <p className="text-xs text-gray-500">
            {r.from.city} → {r.to.city}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (r) => {
        const category = r.category || "local";
        const colors = popularRouteCategoryColors[category as keyof typeof popularRouteCategoryColors];
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
          >
            {popularRouteCategoryLabels[category]}
          </span>
        );
      },
    },
    {
      key: "distance",
      header: "Mesafe",
      render: (r) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3" />
          {r.distance.text}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Süre",
      render: (r) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="w-3 h-3" />
          {r.duration.text}
        </div>
      ),
    },
    {
      key: "isPopular",
      header: "Popüler",
      render: (r) => (
        <button
          type="button"
          onClick={() => handleTogglePopular(r)}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
            r.isPopular
              ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
              : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200"
          }`}
        >
          {r.isPopular ? <Star className="w-3 h-3 fill-amber-500" /> : "-"}
        </button>
      ),
    },
    {
      key: "order",
      header: "Sıra",
      render: (r) => <span className="text-sm font-medium text-gray-900">{r.order}</span>,
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleMoveUp(r)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Yukarı taşı"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleMoveDown(r)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Aşağı taşı"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleEdit(r)}
            className="p-1.5 rounded-lg hover:bg-cyan-50 text-cyan-600 hover:text-cyan-700 transition-colors"
            title="Düzenle"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(r)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Popüler Rotalar</h1>
          <p className="text-sm text-gray-600 mt-1">
            Transfer sayfasında gösterilen popüler rotaları yönetin
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-semibold hover:from-cyan-600 hover:to-sky-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Rota
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Rota"
          value={data.length}
          icon={Activity}
        />
        <StatCard
          title="Popüler Rotalar"
          value={data.filter((r) => r.isPopular).length}
          icon={Star}
        />
        <StatCard
          title="Ort. Mesafe"
          value={`${Math.round(data.reduce((sum, r) => sum + r.distance.km, 0) / (data.length || 1))} km`}
          icon={MapPin}
        />
        <StatCard
          title="Ort. Süre"
          value={`${Math.round(data.reduce((sum, r) => sum + r.duration.minutes, 0) / (data.length || 1))} dk`}
          icon={Clock}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
          placeholder="Rota ara..."
          className="flex-1 min-w-[200px]"
        />

        <select
          value={filters.category}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="">Tüm Kategoriler</option>
          {Object.entries(popularRouteCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.distanceRange}
          onChange={(e) => updateFilter("distanceRange", e.target.value as DistanceRange)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="all">Tüm Mesafeler</option>
          <option value="0-50">0-50 km</option>
          <option value="50-100">50-100 km</option>
          <option value="100-200">100-200 km</option>
          <option value="200+">200+ km</option>
        </select>

        <select
          value={filters.popularFilter}
          onChange={(e) => updateFilter("popularFilter", e.target.value as PopularFilter)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
        >
          <option value="all">Tümü</option>
          <option value="popular">Sadece Popüler</option>
          <option value="not-popular">Popüler Olmayan</option>
        </select>

        <button
          type="button"
          onClick={() => exportToCSV(filteredAndSorted)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Dışa Aktar
        </button>

        {(filters.search ||
          filters.category ||
          filters.distanceRange !== "all" ||
          filters.popularFilter !== "all") && (
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
        </div>
      ) : (
        <>
          <DataTable
            data={paginatedData}
            columns={columns}
            keyExtractor={(r) => r.id}
            emptyMessage="Popüler rota bulunamadı."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingRoute(null);
          }}
          title={editingRoute ? "Rota Düzenle" : "Yeni Rota"}
        >
          <RouteForm
            route={editingRoute}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingRoute(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
