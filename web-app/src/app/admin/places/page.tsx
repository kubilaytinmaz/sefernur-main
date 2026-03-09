"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deletePlace, getAllPlaces, updatePlace } from "@/lib/firebase/admin-domain";
import { PlaceModel, placeCityLabels } from "@/types/place";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

export default function AdminPlacesPage() {
  const [data, setData] = useState<PlaceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllPlaces();
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
    if (cityFilter) items = items.filter((p) => p.city === cityFilter);
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term),
    );
  }, [data, search, cityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, cityFilter]);

  const handleToggleActive = async (place: PlaceModel) => {
    await updatePlace(place.id, { isActive: !place.isActive });
    setData((prev) => prev.map((p) => (p.id === place.id ? { ...p, isActive: !p.isActive } : p)));
  };

  const handleDelete = async (place: PlaceModel) => {
    if (!confirm("Bu yeri silmek istediğinize emin misiniz?")) return;
    await deletePlace(place.id);
    setData((prev) => prev.filter((p) => p.id !== place.id));
  };

  const columns: Column<PlaceModel>[] = [
    {
      key: "title",
      header: "Yer Adı",
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <div className="max-w-[250px]">
          <p className="truncate font-medium text-gray-900">{p.title}</p>
          <p className="truncate text-xs text-gray-500">{p.shortDescription}</p>
        </div>
      ),
    },
    {
      key: "city",
      header: "Şehir",
      render: (p) => (
        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
          {placeCityLabels[p.city] ?? p.city}
        </span>
      ),
    },
    {
      key: "images",
      header: "Görsel",
      render: (p) => <span className="text-sm text-gray-600">{p.images.length} adet</span>,
    },
    {
      key: "status",
      header: "Durum",
      render: (p) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(p); }}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            p.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {p.isActive ? "Aktif" : "Pasif"}
        </button>
      ),
    },
    {
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (p) => p.createdAt?.getTime() ?? 0,
      render: (p) => (
        <span className="text-xs text-gray-500">
          {p.createdAt?.toLocaleDateString("tr-TR") ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/places/${p.id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Düzenle
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
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
          <MapPin className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gezilecek Yerler</h1>
            <p className="text-sm text-gray-500">Mekke ve Medine'deki önemli yerleri yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/places/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Yer
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Yer adı ara..." className="w-full sm:w-72" />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tüm Şehirler</option>
          {Object.entries(placeCityLabels).map(([v, l]) => (
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
          <DataTable data={paged} columns={columns} keyExtractor={(p) => p.id} emptyMessage="Gezilecek yer bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
