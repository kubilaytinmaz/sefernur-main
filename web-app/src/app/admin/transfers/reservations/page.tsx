"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
    getTransferReservations,
    getTransferReservationStats,
    type TransferReservationFilters,
} from "@/lib/firebase/admin-domain";
import { ReservationModel, ReservationStatus } from "@/types/reservation";
import {
    Activity,
    Calendar,
    CalendarCheck,
    DollarSign,
    Download,
    Filter,
    Loader2,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

// ─── Filter Types ─────────────────────────────────────────────────────────
type ReservationTypeFilter = "all" | "transfer" | "transfer_tour";
type SourceFilter = "all" | "web" | "mobile" | "admin";

interface Filters {
  search: string;
  status: ReservationStatus | "";
  type: ReservationTypeFilter;
  source: SourceFilter;
  dateFrom: string;
  dateTo: string;
  priceMin: string;
  priceMax: string;
}

const initialFilters: Filters = {
  search: "",
  status: "",
  type: "all",
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

const typeOptions: { value: ReservationTypeFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "transfer", label: "Sadece Transfer" },
  { value: "transfer_tour", label: "Transfer + Tur" },
];

const sourceOptions: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Tüm Kaynaklar" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobil" },
  { value: "admin", label: "Admin" },
];

// ─── Helper Functions ─────────────────────────────────────────────────────
function exportToCSV(reservations: ReservationModel[]) {
  const headers = [
    "ID",
    "Müşteri",
    "E-posta",
    "Telefon",
    "Tip",
    "Başlık",
    "Tarih",
    "Kişi",
    "Fiyat",
    "Durum",
    "Kaynak",
    "Oluşturma",
  ];

  const rows = reservations.map((r) => [
    r.id,
    r.meta?.customerName || "—",
    r.userEmail || "—",
    r.userPhone || "—",
    r.type === "transfer" ? "Transfer" : "Transfer+Tur",
    r.title,
    r.startDate.toLocaleDateString("tr-TR"),
    r.people?.toString() || r.quantity.toString(),
    `${r.price} ${r.currency}`,
    r.status,
    r.source || "—",
    r.createdAt.toLocaleDateString("tr-TR"),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transfer-rezervasyonlar-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function TransferReservationsPage() {
  const [data, setData] = useState<ReservationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    todayReservations: 0,
    totalRevenue: 0,
    averagePrice: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters: TransferReservationFilters = {};

      if (filters.status) apiFilters.status = filters.status;
      if (filters.source !== "all") apiFilters.source = filters.source as any;
      if (filters.type === "transfer") apiFilters.includeTours = false;
      if (filters.type === "transfer_tour") apiFilters.includeTours = true;

      const [items, statsData] = await Promise.all([
        getTransferReservations(apiFilters),
        getTransferReservationStats(),
      ]);

      setData(items);
      setStats(statsData);
    } catch (err) {
      console.error("❌ Error loading reservations:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.source, filters.type]);

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
          (r.meta?.customerName as string)?.toLowerCase().includes(term)
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
          <p className="text-xs text-gray-500">
            {r.type === "transfer" ? "Transfer" : "Transfer+Tur"}
          </p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Müşteri",
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {(r.meta?.customerName as string) || r.userEmail?.split("@")[0] || "—"}
          </p>
          <p className="text-xs text-gray-500">{r.userEmail || r.userPhone}</p>
        </div>
      ),
    },
    {
      key: "title",
      header: "Transfer/Tur",
      render: (r) => (
        <div className="max-w-[250px]">
          <p className="truncate text-sm font-medium text-gray-900">{r.title}</p>
          {r.subtitle && (
            <p className="truncate text-xs text-gray-500">{r.subtitle}</p>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (r) => r.startDate.getTime(),
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {r.startDate.toLocaleDateString("tr-TR")}
          </p>
          <p className="text-xs text-gray-500">
            {r.startDate.toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "people",
      header: "Kişi",
      render: (r) => (
        <span className="text-sm text-gray-600">
          {r.people || r.quantity} kişi
        </span>
      ),
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
          href={`/admin/transfers/reservations/${r.id}`}
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
          <CalendarCheck className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transfer Rezervasyonları
            </h1>
            <p className="text-sm text-gray-500">
              Transfer ve tur rezervasyonlarını görüntüleyin ve yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          title="Bugünkü"
          value={stats.todayReservations}
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
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={filters.search}
          onChange={(v) => updateFilter("search", v)}
          placeholder="Rezervasyon, müşteri veya e-posta ara..."
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
          {(filters.status ||
            filters.type !== "all" ||
            filters.source !== "all" ||
            filters.dateFrom ||
            filters.dateTo ||
            filters.priceMin ||
            filters.priceMax) && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
              {[
                filters.status,
                filters.type !== "all",
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
                  updateFilter("status", e.target.value as any)
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

            {/* Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Tip
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  updateFilter("type", e.target.value as ReservationTypeFilter)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {typeOptions.map((o) => (
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
                Başlangıç Tarihi
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
                Bitiş Tarihi
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
            emptyMessage="Rezervasyon bulunamadı"
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
