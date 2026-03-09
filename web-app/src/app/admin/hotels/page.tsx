"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deleteHotel, getAllHotels, updateHotel } from "@/lib/firebase/admin-domain";
import { HotelModel } from "@/types/hotel";
import { Building2, Loader2, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

const categoryLabels: Record<string, string> = {
  budget: "Bütçe",
  standard: "Standart",
  luxury: "Lüks",
  boutique: "Butik",
};

export default function AdminHotelsPage() {
  const [data, setData] = useState<HotelModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllHotels();
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
    if (categoryFilter) items = items.filter((h) => h.category === categoryFilter);
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        h.id?.toLowerCase().includes(term),
    );
  }, [data, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryFilter]);

  const handleToggleActive = async (hotel: HotelModel) => {
    if (!hotel.id) return;
    await updateHotel(hotel.id, { isActive: !hotel.isActive });
    setData((prev) => prev.map((h) => (h.id === hotel.id ? { ...h, isActive: !h.isActive } : h)));
  };

  const handleDelete = async (hotel: HotelModel) => {
    if (!hotel.id || !confirm("Bu oteli silmek istediğinize emin misiniz?")) return;
    await deleteHotel(hotel.id);
    setData((prev) => prev.filter((h) => h.id !== hotel.id));
  };

  const columns: Column<HotelModel>[] = [
    {
      key: "name",
      header: "Otel Adı",
      sortable: true,
      sortValue: (h) => h.name,
      render: (h) => (
        <div className="max-w-[220px]">
          <p className="truncate font-medium text-gray-900">{h.name}</p>
          {h.addressModel?.city && <p className="text-xs text-gray-500">{h.addressModel.city}</p>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (h) => (
        <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
          {categoryLabels[h.category || ""] || h.category || "—"}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Puan",
      sortable: true,
      sortValue: (h) => h.rating ?? 0,
      render: (h) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{h.rating?.toFixed(1) ?? "—"}</span>
          <span className="text-xs text-gray-400">({h.reviewCount ?? 0})</span>
        </div>
      ),
    },
    {
      key: "rooms",
      header: "Oda Tipleri",
      render: (h) => <span className="text-sm text-gray-600">{h.roomTypes?.length ?? 0} tip</span>,
    },
    {
      key: "status",
      header: "Durum",
      render: (h) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(h); }}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            h.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {h.isActive ? "Aktif" : "Pasif"}
        </button>
      ),
    },
    {
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (h) => h.createdAt?.getTime() ?? 0,
      render: (h) => (
        <span className="text-xs text-gray-500">
          {h.createdAt?.toLocaleDateString("tr-TR") ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (h) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/hotels/${h.id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Düzenle
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(h); }}
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
          <Building2 className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Oteller</h1>
            <p className="text-sm text-gray-500">Otel ve konaklama yerlerini yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/hotels/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Otel
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Otel adı ara..." className="w-full sm:w-72" />
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
          <DataTable data={paged} columns={columns} keyExtractor={(h) => h.id ?? ""} emptyMessage="Otel bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
