"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deletePromotion, getAllPromotions, updatePromotion } from "@/lib/firebase/admin-domain";
import { PromotionModel, promotionTargetLabels } from "@/types/promotion";
import { Loader2, Percent, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

export default function AdminPromotionsPage() {
  const [data, setData] = useState<PromotionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllPromotions();
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
    if (targetFilter) items = items.filter((p) => p.targetType === targetFilter);
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.subtitle.toLowerCase().includes(term) ||
        p.discountCode?.toLowerCase().includes(term),
    );
  }, [data, search, targetFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, targetFilter]);

  const handleToggleActive = async (promo: PromotionModel) => {
    await updatePromotion(promo.id, { isActive: !promo.isActive });
    setData((prev) => prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p)));
  };

  const handleDelete = async (promo: PromotionModel) => {
    if (!confirm("Bu indirimi silmek istediğinize emin misiniz?")) return;
    await deletePromotion(promo.id);
    setData((prev) => prev.filter((p) => p.id !== promo.id));
  };

  const columns: Column<PromotionModel>[] = [
    {
      key: "title",
      header: "Başlık",
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <div className="max-w-[220px]">
          <p className="truncate font-medium text-gray-900">{p.title}</p>
          <p className="truncate text-xs text-gray-500">{p.subtitle}</p>
        </div>
      ),
    },
    {
      key: "target",
      header: "Hedef",
      render: (p) => (
        <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
          {promotionTargetLabels[p.targetType] ?? p.targetType}
        </span>
      ),
    },
    {
      key: "discount",
      header: "İndirim",
      sortable: true,
      sortValue: (p) => p.discountPercent,
      render: (p) => (
        <span className="font-semibold text-emerald-700">%{p.discountPercent}</span>
      ),
    },
    {
      key: "code",
      header: "Kod",
      render: (p) => (
        p.discountCode ? (
          <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">{p.discountCode}</code>
        ) : <span className="text-xs text-gray-400">—</span>
      ),
    },
    {
      key: "priority",
      header: "Öncelik",
      sortable: true,
      sortValue: (p) => p.priority,
      render: (p) => <span className="text-sm text-gray-600">{p.priority}</span>,
    },
    {
      key: "preview",
      header: "Önizleme",
      render: (p) => (
        <div
          className="h-6 w-16 rounded"
          style={{ background: `linear-gradient(135deg, ${p.gradientStartColor}, ${p.gradientEndColor})` }}
        />
      ),
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
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/promotions/${p.id}`}
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
          <Percent className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İndirimler</h1>
            <p className="text-sm text-gray-500">Promosyon ve indirimleri yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/promotions/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni İndirim
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Başlık veya indirim kodu ara..." className="w-full sm:w-72" />
        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tüm Hedefler</option>
          {Object.entries(promotionTargetLabels).map(([v, l]) => (
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
          <DataTable data={paged} columns={columns} keyExtractor={(p) => p.id} emptyMessage="İndirim bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
