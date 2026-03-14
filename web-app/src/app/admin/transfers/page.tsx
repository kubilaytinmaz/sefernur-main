"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import { formatTlSarPair, sarToTry } from "@/lib/currency";
import { deleteTransfer, getAllTransfers, updateTransfer } from "@/lib/firebase/admin-domain";
import { displayAddress } from "@/types/address";
import { TransferModel, amenityLabels, vehicleTypeLabels } from "@/types/transfer";
import {
  Activity,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Filter,
  Loader2,
  MapPin,
  Plane,
  Plus,
  Popcorn,
  Power,
  Star,
  Trash2,
  TrendingUp,
  X
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ─── Filter Types ─────────────────────────────────────────────────────────
type CapacityRange = "all" | "1-4" | "5-8" | "9-15" | "16+";
type PriceRange = "all" | "0-1000" | "1000-3000" | "3000-5000" | "5000+";
type PopularFilter = "all" | "popular" | "not-popular";
type ActiveFilter = "all" | "active" | "inactive";
type SortField = "price" | "capacity" | "name" | "rating" | "createdAt";
type SortDirection = "asc" | "desc";

interface TransferFilters {
  search: string;
  vehicleType: string;
  capacityRange: CapacityRange;
  priceRange: PriceRange;
  fromCity: string;
  toCity: string;
  popularFilter: PopularFilter;
  activeFilter: ActiveFilter;
  company: string;
}

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const initialFilters: TransferFilters = {
  search: "",
  vehicleType: "",
  capacityRange: "all",
  priceRange: "all",
  fromCity: "",
  toCity: "",
  popularFilter: "all",
  activeFilter: "all",
  company: "",
};

const initialSort: SortConfig = {
  field: "createdAt",
  direction: "desc",
};

// ─── Helper Functions ─────────────────────────────────────────────────────
function getCapacityRange(capacity: number): CapacityRange {
  if (capacity <= 4) return "1-4";
  if (capacity <= 8) return "5-8";
  if (capacity <= 15) return "9-15";
  return "16+";
}

function getPriceRange(price: number): PriceRange {
  if (price < 1000) return "0-1000";
  if (price < 3000) return "1000-3000";
  if (price < 5000) return "3000-5000";
  return "5000+";
}

function extractCity(address: string): string {
  const parts = address.split(",").map((p) => p.trim().toLowerCase());
  return parts.find((p) => p.length > 2 && p.length < 20) || "";
}

function exportToCSV(transfers: TransferModel[]) {
  const headers = [
    "ID",
    "Güzergah",
    "Araç Tipi",
    "Araç Adı",
    "Kapasite",
    "Fiyat",
    "Firma",
    "Puan",
    "Aktif",
    "Popüler",
  ];

  const rows = transfers.map((t) => [
    t.id,
    `${displayAddress(t.fromAddress)} → ${displayAddress(t.toAddress)}`,
    vehicleTypeLabels[t.vehicleType] || t.vehicleType,
    t.vehicleName,
    t.capacity.toString(),
    t.basePrice.toString(),
    t.company,
    t.rating.toString(),
    t.isActive ? "Evet" : "Hayır",
    t.isPopular ? "Evet" : "Hayır",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transferler-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function AdminTransfersPage() {
  const [data, setData] = useState<TransferModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransferFilters>(initialFilters);
  const [sort, setSort] = useState<SortConfig>(initialSort);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewTransfer, setPreviewTransfer] = useState<TransferModel | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      console.log("📋 Loading transfers from Firebase...");
      const items = await getAllTransfers();
      console.log("📦 Loaded transfers:", items.length);
      console.log("🔑 Transfer IDs:", items.map(t => ({ id: t.id, name: t.vehicleName })));
      setData(items);
    } catch (err) {
      console.error("❌ Error loading transfers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Computed Values ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    return {
      total: data.length,
      active: data.filter((t) => t.isActive).length,
      popular: data.filter((t) => t.isPopular).length,
      avgPrice: data.length > 0
        ? Math.round(data.reduce((sum, t) => sum + t.basePrice, 0) / data.length)
        : 0,
      avgRating: data.length > 0
        ? (data.reduce((sum, t) => sum + t.rating, 0) / data.length).toFixed(1)
        : "0.0",
    };
  }, [data]);

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    data.forEach((t) => {
      const from = extractCity(displayAddress(t.fromAddress));
      const to = extractCity(displayAddress(t.toAddress));
      if (from) cities.add(from);
      if (to) cities.add(to);
    });
    return Array.from(cities).sort();
  }, [data]);

  const uniqueCompanies = useMemo(() => {
    const companies = new Set(data.map((t) => t.company));
    return Array.from(companies).sort();
  }, [data]);

  // ─── Filtering & Sorting ─────────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let items = [...data];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (t) =>
          t.vehicleName.toLowerCase().includes(term) ||
          t.company.toLowerCase().includes(term) ||
          displayAddress(t.fromAddress).toLowerCase().includes(term) ||
          displayAddress(t.toAddress).toLowerCase().includes(term),
      );
    }

    // Vehicle type filter
    if (filters.vehicleType) {
      items = items.filter((t) => t.vehicleType === filters.vehicleType);
    }

    // Capacity range filter
    if (filters.capacityRange !== "all") {
      items = items.filter((t) => getCapacityRange(t.capacity) === filters.capacityRange);
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      items = items.filter((t) => getPriceRange(t.basePrice) === filters.priceRange);
    }

    // City filters
    if (filters.fromCity) {
      items = items.filter((t) =>
        extractCity(displayAddress(t.fromAddress)).includes(filters.fromCity.toLowerCase()),
      );
    }
    if (filters.toCity) {
      items = items.filter((t) =>
        extractCity(displayAddress(t.toAddress)).includes(filters.toCity.toLowerCase()),
      );
    }

    // Popular filter
    if (filters.popularFilter === "popular") {
      items = items.filter((t) => t.isPopular);
    } else if (filters.popularFilter === "not-popular") {
      items = items.filter((t) => !t.isPopular);
    }

    // Active filter
    if (filters.activeFilter === "active") {
      items = items.filter((t) => t.isActive);
    } else if (filters.activeFilter === "inactive") {
      items = items.filter((t) => !t.isActive);
    }

    // Company filter
    if (filters.company) {
      items = items.filter((t) => t.company === filters.company);
    }

    // Sorting
    items.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case "price":
          comparison = a.basePrice - b.basePrice;
          break;
        case "capacity":
          comparison = a.capacity - b.capacity;
          break;
        case "name":
          comparison = a.vehicleName.localeCompare(b.vehicleName, "tr");
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "createdAt":
          const aTime = a.createdAt?.getTime() ?? 0;
          const bTime = b.createdAt?.getTime() ?? 0;
          comparison = aTime - bTime;
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
  const updateFilter = useCallback(<K extends keyof TransferFilters>(
    key: K,
    value: TransferFilters[K],
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

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((t) => t.id)));
    }
  }, [selectedIds.size, paginated]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleActive = useCallback(async (transfer: TransferModel) => {
    await updateTransfer(transfer.id, { isActive: !transfer.isActive });
    setData((prev) =>
      prev.map((t) => (t.id === transfer.id ? { ...t, isActive: !t.isActive } : t)),
    );
  }, []);

  const handleTogglePopular = useCallback(async (transfer: TransferModel) => {
    await updateTransfer(transfer.id, { isPopular: !transfer.isPopular });
    setData((prev) =>
      prev.map((t) => (t.id === transfer.id ? { ...t, isPopular: !t.isPopular } : t)),
    );
  }, []);

  const handleDelete = useCallback(async (transfer: TransferModel) => {
    if (!confirm("Bu transferi silmek istediğinize emin misiniz?")) return;
    await deleteTransfer(transfer.id);
    setData((prev) => prev.filter((t) => t.id !== transfer.id));
  }, []);

  // ─── Bulk Actions ────────────────────────────────────────────────────────
  const bulkSetActive = useCallback(async (active: boolean) => {
    for (const id of selectedIds) {
      await updateTransfer(id, { isActive: active });
    }
    setData((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, isActive: active } : t)),
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkSetPopular = useCallback(async (popular: boolean) => {
    for (const id of selectedIds) {
      await updateTransfer(id, { isPopular: popular });
    }
    setData((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, isPopular: popular } : t)),
    );
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkDelete = useCallback(async () => {
    if (!confirm(`${selectedIds.size} transferi silmek istediğinize emin misiniz?`)) return;
    for (const id of selectedIds) {
      await deleteTransfer(id);
    }
    setData((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkExport = useCallback(() => {
    const selectedTransfers = data.filter((t) => selectedIds.has(t.id));
    if (selectedTransfers.length === 0) return;
    exportToCSV(selectedTransfers);
  }, [data, selectedIds]);

  // ─── Table Columns ───────────────────────────────────────────────────────
  const columns: Column<TransferModel>[] = [
    {
      key: "select",
      header: "",
      render: (t) => (
        <input
          type="checkbox"
          checked={selectedIds.has(t.id)}
          onChange={() => toggleSelectOne(t.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
      ),
      className: "w-12",
    },
    {
      key: "route",
      header: "Güzergah",
      render: (t) => (
        <div className="max-w-[200px]">
          <p className="truncate text-sm font-medium text-gray-900">{displayAddress(t.fromAddress)}</p>
          <p className="truncate text-xs text-gray-500">→ {displayAddress(t.toAddress)}</p>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Araç",
      render: (t) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{t.vehicleName}</p>
          <p className="text-xs text-gray-500">{vehicleTypeLabels[t.vehicleType] ?? t.vehicleType}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Fiyat",
      render: (t) => {
        // TL'ye çevir ve SAR ile birlikte göster
        const priceTl = sarToTry(t.basePrice);
        return <span className="font-medium">{formatTlSarPair(priceTl, t.basePrice)}</span>;
      },
    },
    {
      key: "capacity",
      header: "Kapasite",
      render: (t) => <span className="text-sm text-gray-600">{t.capacity} kişi</span>,
    },
    {
      key: "rating",
      header: "Puan",
      render: (t) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{t.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({t.reviewCount})</span>
        </div>
      ),
    },
    {
      key: "badges",
      header: "Rozetler",
      render: (t) => (
        <div className="flex gap-1">
          {t.isPopular && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Popcorn className="mr-0.5 h-3 w-3" />
              Popüler
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Durum",
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(t);
          }}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            t.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {t.isActive ? "Aktif" : "Pasif"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (t) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePopular(t);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              t.isPopular
                ? "text-amber-500 hover:bg-amber-50"
                : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
            }`}
            title={t.isPopular ? "Popülerlikten kaldır" : "Popüler işaretle"}
          >
            <Popcorn className="h-4 w-4" />
          </button>
          <Link
            href={`/admin/transfers/${t.id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Düzenle
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(t);
            }}
            className="text-gray-400 hover:text-red-600"
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
          <Plane className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transferler</h1>
            <p className="text-sm text-gray-500">Transfer hizmetlerini yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/transfers/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Transfer
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Toplam Transfer"
          value={stats.total}
          icon={Plane}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Aktif Transfer"
          value={stats.active}
          subtitle={`Toplamın %${Math.round((stats.active / stats.total) * 100) || 0}`}
          icon={Activity}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Popüler Transfer"
          value={stats.popular}
          icon={Popcorn}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Ortalama Fiyat"
          value={`₺${stats.avgPrice.toLocaleString("tr-TR")}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Ortalama Puan"
          value={stats.avgRating}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Quick Navigation */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <Link
          href="/admin/transfers/popular-services"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <Popcorn className="h-4 w-4 text-amber-500" />
          Popüler Hizmetler
        </Link>
        <Link
          href="/admin/transfers/pricing"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <TrendingUp className="h-4 w-4 text-purple-500" />
          Fiyatlandırma
        </Link>
        <Link
          href="/admin/transfers/locations"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <MapPin className="h-4 w-4 text-red-500" />
          Lokasyonlar
        </Link>
        <Link
          href="/admin/transfers/reports"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          Raporlar
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
          placeholder="Güzergah, araç veya firma ara..."
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
          {(filters.vehicleType ||
            filters.capacityRange !== "all" ||
            filters.priceRange !== "all" ||
            filters.fromCity ||
            filters.toCity ||
            filters.popularFilter !== "all" ||
            filters.activeFilter !== "all" ||
            filters.company) && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
              {[filters.vehicleType, filters.capacityRange !== "all", filters.priceRange !== "all", filters.fromCity, filters.toCity, filters.popularFilter !== "all", filters.activeFilter !== "all", filters.company].filter(Boolean).length}
            </span>
          )}
        </button>
        {selectedIds.size === 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Tümünü Seç
          </button>
        )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Vehicle Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Araç Tipi</label>
              <select
                value={filters.vehicleType}
                onChange={(e) => updateFilter("vehicleType", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                {Object.entries(vehicleTypeLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Range */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Kapasite Aralığı</label>
              <select
                value={filters.capacityRange}
                onChange={(e) => updateFilter("capacityRange", e.target.value as CapacityRange)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tümü</option>
                <option value="1-4">1-4 Kişi</option>
                <option value="5-8">5-8 Kişi</option>
                <option value="9-15">9-15 Kişi</option>
                <option value="16+">16+ Kişi</option>
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
                <option value="0-1000">₺0 - ₺1.000</option>
                <option value="1000-3000">₺1.000 - ₺3.000</option>
                <option value="3000-5000">₺3.000 - ₺5.000</option>
                <option value="5000+">₺5.000+</option>
              </select>
            </div>

            {/* From City */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Kalkış Şehri</label>
              <select
                value={filters.fromCity}
                onChange={(e) => updateFilter("fromCity", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* To City */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Varış Şehri</label>
              <select
                value={filters.toCity}
                onChange={(e) => updateFilter("toCity", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}
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

            {/* Active Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Durum</label>
              <select
                value={filters.activeFilter}
                onChange={(e) => updateFilter("activeFilter", e.target.value as ActiveFilter)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Tümü</option>
                <option value="active">Sadece Aktif</option>
                <option value="inactive">Sadece Pasif</option>
              </select>
            </div>

            {/* Company Filter */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Firma</label>
              <select
                value={filters.company}
                onChange={(e) => updateFilter("company", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Tümü</option>
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 border-t border-gray-200 pt-4">
            <label className="mb-2 block text-xs font-medium text-gray-500">Sıralama</label>
            <div className="flex flex-wrap gap-2">
              {[
                { field: "price" as SortField, label: "Fiyat" },
                { field: "capacity" as SortField, label: "Kapasite" },
                { field: "name" as SortField, label: "İsim" },
                { field: "rating" as SortField, label: "Puan" },
                { field: "createdAt" as SortField, label: "Tarih" },
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">
              {selectedIds.size} transfer seçildi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkSetActive(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Power className="h-4 w-4 text-emerald-500" />
              Aktif Yap
            </button>
            <button
              onClick={() => bulkSetActive(false)}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Power className="h-4 w-4 text-gray-400" />
              Pasif Yap
            </button>
            <button
              onClick={() => bulkSetPopular(true)}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Popcorn className="h-4 w-4 text-amber-500" />
              Popüler İşaretle
            </button>
            <button
              onClick={bulkExport}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 text-blue-500" />
              Dışa Aktar
            </button>
            <button
              onClick={bulkDelete}
              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Sil
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-2 rounded-lg p-2 text-gray-400 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
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
            keyExtractor={(t) => t.id}
            emptyMessage="Transfer bulunamadı"
            onRowClick={setPreviewTransfer}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Preview Modal */}
      {previewTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewTransfer(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Transfer Önizleme</h2>
              <button
                onClick={() => setPreviewTransfer(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              {previewTransfer.images.length > 0 && (
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={previewTransfer.images[0]}
                    alt={previewTransfer.vehicleName}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}

              {/* Route */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500">Kalkış</p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayAddress(previewTransfer.fromAddress)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Plane className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs font-medium text-gray-500">Varış</p>
                    <p className="text-sm font-medium text-gray-900">
                      {displayAddress(previewTransfer.toAddress)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Araç Adı</p>
                  <p className="text-sm font-semibold text-gray-900">{previewTransfer.vehicleName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Araç Tipi</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {vehicleTypeLabels[previewTransfer.vehicleType]}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Kapasite</p>
                  <p className="text-sm font-semibold text-gray-900">{previewTransfer.capacity} kişi</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Bagaj Kapasitesi</p>
                  <p className="text-sm font-semibold text-gray-900">{previewTransfer.luggageCapacity} adet</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Fiyat</p>
                  <p className="text-lg font-bold text-emerald-600">
                    ₺{previewTransfer.basePrice.toLocaleString("tr-TR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Puan</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{previewTransfer.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({previewTransfer.reviewCount} değerlendirme)</span>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <p className="mb-2 text-xs font-medium text-gray-500">Firma Bilgileri</p>
                <div className="rounded-lg border border-gray-200 p-3 space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{previewTransfer.company}</p>
                  {previewTransfer.phone && (
                    <p className="text-xs text-gray-600">Tel: {previewTransfer.phone}</p>
                  )}
                  {previewTransfer.email && (
                    <p className="text-xs text-gray-600">E-posta: {previewTransfer.email}</p>
                  )}
                  {previewTransfer.whatsapp && (
                    <p className="text-xs text-gray-600">WhatsApp: {previewTransfer.whatsapp}</p>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {previewTransfer.amenities.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">Özellikler</p>
                  <div className="flex flex-wrap gap-2">
                    {previewTransfer.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        {amenityLabels[amenity] || amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    previewTransfer.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {previewTransfer.isActive ? "✓ Aktif" : "✗ Pasif"}
                </span>
                {previewTransfer.isPopular && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                    ⭐ Popüler
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <Link
                  href={`/admin/transfers/${previewTransfer.id}`}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => setPreviewTransfer(null)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
