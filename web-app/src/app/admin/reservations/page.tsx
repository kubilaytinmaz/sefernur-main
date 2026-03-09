"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
    getAllReservations,
    type ReservationFilters,
} from "@/lib/firebase/admin-domain";
import {
    ReservationModel,
    ReservationStatus,
    ReservationType,
} from "@/types/reservation";
import { CalendarCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

const typeLabels: Record<ReservationType, string> = {
  hotel: "Otel",
  tour: "Tur",
  transfer: "Transfer",
  guide: "Rehber",
  car: "Araç",
};

const statusOptions: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "pending", label: "Beklemede" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "cancelled", label: "İptal" },
  { value: "completed", label: "Tamamlandı" },
];

const typeOptions: { value: ReservationType | ""; label: string }[] = [
  { value: "", label: "Tüm Tipler" },
  { value: "hotel", label: "Otel" },
  { value: "tour", label: "Tur" },
  { value: "transfer", label: "Transfer" },
  { value: "guide", label: "Rehber" },
  { value: "car", label: "Araç" },
];

const sourceOptions: { value: string; label: string }[] = [
  { value: "", label: "Tüm Kaynaklar" },
  { value: "web", label: "Web" },
  { value: "mobile", label: "Mobil" },
  { value: "admin", label: "Admin" },
];

export default function AdminReservationsPage() {
  const [data, setData] = useState<ReservationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: ReservationFilters = {};
        if (statusFilter)
          filters.status = statusFilter as ReservationStatus;
        if (typeFilter) filters.type = typeFilter as ReservationType;
        if (sourceFilter)
          filters.source = sourceFilter as "web" | "mobile" | "admin";
        const items = await getAllReservations(filters);
        setData(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter, typeFilter, sourceFilter]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.id?.toLowerCase().includes(term) ||
        r.userEmail?.toLowerCase().includes(term) ||
        r.userPhone?.includes(term),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, sourceFilter]);

  const columns: Column<ReservationModel>[] = [
    {
      key: "title",
      header: "Başlık",
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <div className="max-w-[200px]">
          <p className="truncate font-medium text-gray-900">{r.title}</p>
          <p className="text-xs text-gray-500">{r.id?.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tip",
      render: (r) => (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {typeLabels[r.type] ?? r.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Durum",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "price",
      header: "Fiyat",
      sortable: true,
      sortValue: (r) => r.price,
      render: (r) => (
        <span className="font-medium">
          ₺{r.price.toLocaleString("tr-TR")}
        </span>
      ),
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
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (r) => r.createdAt.getTime(),
      render: (r) => (
        <span className="text-xs text-gray-500">
          {r.createdAt.toLocaleDateString("tr-TR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Link
          href={`/admin/reservations/${r.id}`}
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
      <div className="flex items-center gap-3">
        <CalendarCheck className="h-7 w-7 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlar</h1>
          <p className="text-sm text-gray-500">
            Tüm rezervasyonları görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Başlık, ID veya e-posta ara..."
          className="w-full sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {sourceOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} sonuç
        </span>
      </div>

      {/* Table */}
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
