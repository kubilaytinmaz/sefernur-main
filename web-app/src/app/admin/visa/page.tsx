"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
    getAllVisaApplications,
    type VisaFilters,
} from "@/lib/firebase/admin-domain";
import { VisaApplicationModel, VisaStatus, visaPurposeLabels } from "@/types/visa";
import { Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

const statusOptions: { value: VisaStatus | ""; label: string }[] = [
  { value: "", label: "Tüm Durumlar" },
  { value: "received", label: "Alındı" },
  { value: "processing", label: "İşleniyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "rejected", label: "Reddedildi" },
];

export default function AdminVisaPage() {
  const [data, setData] = useState<VisaApplicationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: VisaFilters = {};
        if (statusFilter) filters.status = statusFilter as VisaStatus;
        const items = await getAllVisaApplications(filters);
        setData(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(
      (v) =>
        v.firstName.toLowerCase().includes(term) ||
        v.lastName.toLowerCase().includes(term) ||
        v.email.toLowerCase().includes(term) ||
        v.passportNumber.toLowerCase().includes(term) ||
        v.phone.includes(term),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const columns: Column<VisaApplicationModel>[] = [
    {
      key: "name",
      header: "Başvuran",
      sortable: true,
      sortValue: (v) => `${v.firstName} ${v.lastName}`,
      render: (v) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {v.firstName} {v.lastName}
          </p>
          <p className="text-xs text-gray-500">{v.email}</p>
        </div>
      ),
    },
    {
      key: "country",
      header: "Ülke",
      render: (v) => (
        <span className="text-sm text-gray-700">{v.country}</span>
      ),
    },
    {
      key: "purpose",
      header: "Amaç",
      render: (v) => (
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {visaPurposeLabels[v.purpose] ?? v.purpose}
        </span>
      ),
    },
    {
      key: "status",
      header: "Durum",
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: "fee",
      header: "Ücret",
      sortable: true,
      sortValue: (v) => v.fee,
      render: (v) => (
        <span className="font-medium">
          ₺{v.fee.toLocaleString("tr-TR")}
        </span>
      ),
    },
    {
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (v) => v.createdAt.getTime(),
      render: (v) => (
        <span className="text-xs text-gray-500">
          {v.createdAt.toLocaleDateString("tr-TR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (v) => (
        <Link
          href={`/admin/visa/${v.id}`}
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
        <Globe className="h-7 w-7 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vize Başvuruları
          </h1>
          <p className="text-sm text-gray-500">
            Vize başvurularını görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="İsim, e-posta veya pasaport no ara..."
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
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} başvuru
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
            keyExtractor={(v) => v.id ?? ""}
            emptyMessage="Vize başvurusu bulunamadı"
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
