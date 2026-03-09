"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deleteGuide, getAllGuides, updateGuide } from "@/lib/firebase/admin-domain";
import { GuideModel, languageLabels, specialtyLabels } from "@/types/guide";
import { Loader2, Plus, Star, Trash2, UserCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

export default function AdminGuidesPage() {
  const [data, setData] = useState<GuideModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllGuides();
      setData(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.company?.toLowerCase().includes(term) ||
        g.city?.toLowerCase().includes(term),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  const handleToggleActive = async (guide: GuideModel) => {
    await updateGuide(guide.id, { isActive: !guide.isActive });
    setData((prev) => prev.map((g) => (g.id === guide.id ? { ...g, isActive: !g.isActive } : g)));
  };

  const handleDelete = async (guide: GuideModel) => {
    if (!confirm("Bu rehberi silmek istediğinize emin misiniz?")) return;
    await deleteGuide(guide.id);
    setData((prev) => prev.filter((g) => g.id !== guide.id));
  };

  const columns: Column<GuideModel>[] = [
    {
      key: "name",
      header: "Rehber Adı",
      sortable: true,
      sortValue: (g) => g.name,
      render: (g) => (
        <div className="max-w-[220px]">
          <p className="truncate font-medium text-gray-900">{g.name}</p>
          <p className="text-xs text-gray-500">{g.company || g.city || "—"}</p>
        </div>
      ),
    },
    {
      key: "specialties",
      header: "Uzmanlıklar",
      render: (g) => (
        <div className="flex flex-wrap gap-1">
          {g.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
              {specialtyLabels[s as keyof typeof specialtyLabels] || s}
            </span>
          ))}
          {g.specialties.length > 3 && (
            <span className="text-[10px] text-gray-400">+{g.specialties.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "languages",
      header: "Diller",
      render: (g) => (
        <span className="text-xs text-gray-600">
          {g.languages.map((l) => languageLabels[l] || l).join(", ")}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Puan",
      sortable: true,
      sortValue: (g) => g.rating,
      render: (g) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{g.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "rate",
      header: "Günlük Ücret",
      sortable: true,
      sortValue: (g) => g.dailyRate,
      render: (g) => <span className="font-medium">₺{g.dailyRate.toLocaleString("tr-TR")}</span>,
    },
    {
      key: "status",
      header: "Durum",
      render: (g) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(g); }}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            g.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {g.isActive ? "Aktif" : "Pasif"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (g) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/guides/${g.id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Düzenle
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(g); }}
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
          <UserCheck className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rehberler</h1>
            <p className="text-sm text-gray-500">Rehberleri yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/guides/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Rehber
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Rehber adı, firma veya şehir ara..." className="w-full sm:w-72" />
        <span className="ml-auto text-sm text-gray-500">{filtered.length} sonuç</span>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <DataTable data={paged} columns={columns} keyExtractor={(g) => g.id} emptyMessage="Rehber bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
