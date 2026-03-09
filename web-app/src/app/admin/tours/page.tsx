"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deleteTour, getAllTours, updateTour } from "@/lib/firebase/admin-domain";
import { TourModel } from "@/types/tour";
import { Compass, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

const categoryLabels: Record<string, string> = {
  umrah: "Umre",
  hajj: "Hac",
  religious: "Dini",
  cultural: "Kültürel",
  historical: "Tarihi",
};

export default function AdminToursPage() {
  const [data, setData] = useState<TourModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllTours();
      setData(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let items = data;
    if (categoryFilter) items = items.filter((t) => t.category === categoryFilter);
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.company?.toLowerCase().includes(term) ||
        t.id?.toLowerCase().includes(term),
    );
  }, [data, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter]);

  const handleToggleActive = async (tour: TourModel) => {
    if (!tour.id) return;
    await updateTour(tour.id, { isActive: !tour.isActive });
    setData((prev) => prev.map((t) => (t.id === tour.id ? { ...t, isActive: !t.isActive } : t)));
  };

  const handleDelete = async (tour: TourModel) => {
    if (!tour.id || !confirm("Bu turu silmek istediğinize emin misiniz?")) return;
    await deleteTour(tour.id);
    setData((prev) => prev.filter((t) => t.id !== tour.id));
  };

  const columns: Column<TourModel>[] = [
    {
      key: "title",
      header: "Tur Adı",
      sortable: true,
      sortValue: (t) => t.title,
      render: (t) => (
        <div className="max-w-[220px]">
          <p className="truncate font-medium text-gray-900">{t.title}</p>
          <p className="text-xs text-gray-500">{t.company || "—"}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (t) => (
        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {categoryLabels[t.category || ""] || t.category || "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Fiyat",
      sortable: true,
      sortValue: (t) => t.basePrice,
      render: (t) => (
        <span className="font-medium">₺{t.basePrice.toLocaleString("tr-TR")}</span>
      ),
    },
    {
      key: "duration",
      header: "Süre",
      render: (t) => <span className="text-sm text-gray-600">{t.durationDays} gün</span>,
    },
    {
      key: "status",
      header: "Durum",
      render: (t) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(t); }}
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
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (t) => t.createdAt?.getTime() ?? 0,
      render: (t) => (
        <span className="text-xs text-gray-500">
          {t.createdAt?.toLocaleDateString("tr-TR") ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (t) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/tours/${t.id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Düzenle
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(t); }}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Turlar</h1>
            <p className="text-sm text-gray-500">Tur paketlerini yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/tours/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Tur
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Tur adı veya firma ara..." className="w-full sm:w-72" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tüm Kategoriler</option>
          {Object.entries(categoryLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500">{filtered.length} sonuç</span>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <DataTable data={paged} columns={columns} keyExtractor={(t) => t.id ?? ""} emptyMessage="Tur bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
