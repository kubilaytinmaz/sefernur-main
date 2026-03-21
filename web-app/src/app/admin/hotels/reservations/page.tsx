"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
    getHotelReservations,
    getHotelReservationStats,
    type HotelReservationFilters as ApiFilters,
} from "@/lib/firebase/admin-domain";
import { ReservationModel, ReservationStatus } from "@/types/reservation";
import {
    Activity,
    Building2,
    Calendar,
    CalendarCheck,
    DollarSign,
    Download,
    Filter,
    Loader2,
    Moon,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ─── Filter Types ─────────────────────────────────────────────────────────
type SourceFilter = "all" | "web" | "mobile" | "admin";

interface Filters {
  search: string;
  status: ReservationStatus | "";
  source: SourceFilter;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
}

const initialFilters: Filters = {
  search: "",
  status: "",
  source: "all",
  dateFrom: "",
  dateTo: "",
  priceMin: "",
  priceMax: "",
};

const statusOptions: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "pending", label: "Beklemede" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "cancelled", label: "İptal" },
  { value: "completed", label: "Tamamlandı" },
];

const sourceOptions: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Tüm Kaynaklar" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobil" },
  { value: "admin", label: "Admin" },
];

// ─── Helper Functions ─────────────────────────────────────────────────────
function calculateNights(startDate: Date, endDate: Date): number {
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function exportToCSV(reservations: ReservationModel[]) {
  const headers = [
    "ID",
    "Müşteri",
    "E-posta",
    "Telefon",
    "Otel",
    "Oda Tipi",
    "Giriş Tarihi",
    "Çıkış Tarihi",
    "Gece",
    "Kişi",
    "Fiyat",
    "Durum",
    "Kaynak",
    "Oluşturma",
  ];

  const rows = reservations.map((r) => {
    const meta = (r.meta || {}) as Record<string, unknown>;
    const nights = calculateNights(r.startDate, r.endDate);
    return [
      r.id,
      (meta.customerName as string) || (meta.guestInfo as Record<string, unknown>)?.firstName
        ? `${(meta.guestInfo as Record<string, unknown>)?.firstName ?? ""} ${(meta.guestInfo as Record<string, unknown>)?.lastName ?? ""}`
        : "—",
      r.userEmail || "—",
      r.userPhone || "—",
      (meta.hotelName as string) || r.title || "—",
      (meta.roomName as string) || "—",
      r.startDate.toLocaleDateString("tr-TR"),
      r.endDate.toLocaleDateString("tr-TR"),
      nights.toString(),
      r.people?.toString() || r.quantity.toString(),
      `${r.price} ${r.currency}`,
      r.status,
      r.source || "—",
      r.createdAt.toLocaleDateString("tr-TR"),
    ];
  });

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `otel-rezervasyonlar-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function HotelReservationsPage() {
  const [data, setData] = useState<ReservationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    todayCheckins: 0,
    totalRevenue: 0,
    averagePrice: 0,
    averageNights: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters: ApiFilters = {};

      if (filters.status) apiFilters.status = filters.status;
      if (filters.source !== "all") apiFilters.source = filters.source as "web" | "mobile" | "admin";

      const [items, statsData] = await Promise.all([
        getHotelReservations(apiFilters),
        getHotelReservationStats(),
      ]);

      setData(items);
      setStats({
        total: statsData.total,
        pending: statsData.pending,
        todayCheckins: statsData.todayCheckins,
        totalRevenue: statsData.totalRevenue,
        averagePrice: statsData.averagePrice,
        averageNights: statsData.averageNights,
      });
    } catch (err) {
      console.error("❌ Error loading hotel reservations:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.source]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Filtering & Sorting ─────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let items = [...data];

    // Search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.id?.toLowerCase().includes(term) ||
          r.userEmail?.toLowerCase().includes(term) ||
          r.userPhone?.includes(term) ||
          ((r.meta?.customerName as string)?.toLowerCase().includes(term)) ||
          ((r.meta?.hotelName as string)?.toLowerCase().includes(term)) ||
          ((r.meta?.guestInfo as Record<string, unknown>)?.firstName as string)?.toLowerCase().includes(term) ||
          ((r.meta?.guestInfo as Record<string, unknown>)?.lastName as string)?.toLowerCase().includes(term)
      );
    }

    // Date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      items = items.filter((r) => r.startDate >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      items = items.filter((r) => r.startDate <= toDate);
    }

    // Price filters
    if (filters.priceMin) {
      const min = parseFloat(filters.priceMin);
      items = items.filter((r) => r.price >= min);
    }
    if (filters.priceMax) {
      const max = parseFloat(filters.priceMax);
      items = items.filter((r) => r.price <= max);
    }

    return items;
  }, [data, filters]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paged = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const updateFilter = useCallback(<K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(filteredData);
  }, [filteredData]);

  // ─── Table Columns ───────────────────────────────────────────────────────
  const columns: Column<ReservationModel>[] = [
    {
      key: "id",
      header: "Rezervasyon No",
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            #{r.id?.slice(0, 8)}
          </p>
          <p className="text-xs text-gray-500">Otel</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Müşteri",
      render: (r) => {
        const meta = (r.meta || {}) as Record<string, unknown>;
        const guestInfo = meta.guestInfo as Record<string, unknown> | undefined;
        const customerName = guestInfo
          ? `${guestInfo.firstName ?? ""} ${guestInfo.lastName ?? ""}`.trim()
          : (meta.customerName as string) || r.userEmail?.split("@")[0] || "—";
        return (
          <div>
            <p className="text-sm font-medium text-gray-900">{customerName}</p>
            <p className="text-xs text-gray-500">{r.userEmail || r.userPhone}</p>
          </div>
        );
      },
    },
    {
      key: "hotel",
      header: "Otel",
      render: (r) => {
        const meta = (r.meta || {}) as Record<string, unknown>;
        const hotelName = (meta.hotelName as string) || r.title;
        const roomName = meta.roomName as string | undefined;
        return (
          <div className="max-w-[220px]">
            <p className="truncate text-sm font-medium text-gray-900">
              {hotelName}
            </p>
            {roomName && (
              <p className="truncate text-xs text-gray-500">
                {roomName}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "checkin",
      header: "Giriş",
      sortable: true,
      sortValue: (r) => r.startDate.getTime(),
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {r.startDate.toLocaleDateString("tr-TR")}
          </p>
          <p className="text-xs text-gray-500">
            {r.startDate.toLocaleDateString("tr-TR", { weekday: "short" })}
          </p>
        </div>
      ),
    },
    {
      key: "checkout",
      header: "Çıkış",
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {r.endDate.toLocaleDateString("tr-TR")}
          </p>
          <p className="text-xs text-gray-500">
            {r.endDate.toLocaleDateString("tr-TR", { weekday: "short" })}
          </p>
        </div>
      ),
    },
    {
      key: "nights",
      header: "Gece",
      render: (r) => {
        const nights = calculateNights(r.startDate, r.endDate);
        return (
          <div className="flex items-center gap-1">
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-sm font-medium text-gray-700">{nights}</span>
          </div>
        );
      },
    },
    {
      key: "price",
      header: "Fiyat",
      sortable: true,
      sortValue: (r) => r.price,
      render: (r) => (
        <div>
          <p className="text-sm font-bold text-gray-900">
            ₺{r.price.toLocaleString("tr-TR")}
          </p>
          <p className="text-xs text-gray-500">{r.currency}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Durum",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "source",
      header: "Kaynak",
      render: (r) => (
        <span className="text-xs text-gray-500">
          {r.source === "web"
            ? "Web"
            : r.source === "mobile"
              ? "Mobil"
              : r.source === "admin"
                ? "Admin"
                : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Link
          href={`/admin/hotels/reservations/${r.id}`}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          onClick={(e) => e.stopPropagation()}
        >
          Detay
        </Link>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Otel Rezervasyonları
            </h1>
            <p className="text-sm text-gray-500">
              Otel konaklama rezervasyonlarını görüntüleyin ve yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          title="Toplam Rezervasyon"
          value={stats.total}
          icon={CalendarCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Bekleyen"
          value={stats.pending}
          subtitle={`Toplamın %${Math.round((stats.pending / stats.total) * 100) || 0}`}
          icon={Activity}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Bugünkü Girişler"
          value={stats.todayCheckins}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Toplam Gelir"
          value={`₺${Math.round(stats.totalRevenue).toLocaleString("tr-TR")}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Ortalama Fiyat"
          value={`₺${Math.round(stats.averagePrice).toLocaleString("tr-TR")}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Ort. Gece"
          value={stats.averageNights.toFixed(1)}
          icon={Moon}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
          placeholder="Rezervasyon, müşteri, otel adı veya e-posta ara..."
          className="w-full sm:w-80"
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
          {(filters.status ||
            filters.source !== "all" ||
            filters.dateFrom ||
            filters.dateTo ||
            filters.priceMin ||
            filters.priceMax) && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
              {[
                filters.status,
                filters.source !== "all",
                filters.dateFrom,
                filters.dateTo,
                filters.priceMin,
                filters.priceMax,
              ].filter(Boolean).length}
            </span>
          )}
        </button>
        <button
          onClick={handleExport}
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Dışa Aktar
        </button>
        <span className="ml-auto text-sm text-gray-500">
          {filteredData.length} sonuç
        </span>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Gelişmiş Filtreler
            </h3>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-emerald-600"
            >
              Filtreleri Temizle
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  updateFilter("status", e.target.value as ReservationStatus | "")
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Kaynak
              </label>
              <select
                value={filters.source}
                onChange={(e) =>
                  updateFilter("source", e.target.value as SourceFilter)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {sourceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Giriş Tarihi (Başlangıç)
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Giriş Tarihi (Bitiş)
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Price Min */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Min Fiyat (₺)
              </label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => updateFilter("priceMin", e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Max Fiyat (₺)
              </label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => updateFilter("priceMax", e.target.value)}
                placeholder="999999"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
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
            data={paged}
            columns={columns}
            keyExtractor={(r) => r.id ?? ""}
            emptyMessage="Otel rezervasyonu bulunamadı"
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
