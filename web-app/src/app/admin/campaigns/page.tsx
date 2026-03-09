"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deleteCampaign, getAllCampaigns, updateCampaign } from "@/lib/firebase/admin-domain";
import { CampaignModel, campaignTypeLabels } from "@/types/campaign";
import { Loader2, Megaphone, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

export default function AdminCampaignsPage() {
  const [data, setData] = useState<CampaignModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllCampaigns();
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
    if (typeFilter) items = items.filter((c) => c.type === typeFilter);
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.shortDescription.toLowerCase().includes(term),
    );
  }, [data, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, typeFilter]);

  const handleToggleActive = async (campaign: CampaignModel) => {
    await updateCampaign(campaign.id, { isActive: !campaign.isActive });
    setData((prev) => prev.map((c) => (c.id === campaign.id ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleDelete = async (campaign: CampaignModel) => {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    await deleteCampaign(campaign.id);
    setData((prev) => prev.filter((c) => c.id !== campaign.id));
  };

  const columns: Column<CampaignModel>[] = [
    {
      key: "title",
      header: "Kampanya",
      sortable: true,
      sortValue: (c) => c.title,
      render: (c) => (
        <div className="max-w-[250px]">
          <p className="truncate font-medium text-gray-900">{c.title}</p>
          <p className="truncate text-xs text-gray-500">{c.shortDescription}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tip",
      render: (c) => (
        <span className="rounded bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-700">
          {campaignTypeLabels[c.type] ?? c.type}
        </span>
      ),
    },
    {
      key: "image",
      header: "Görsel",
      render: (c) => (
        c.imageUrl ? (
          <img src={c.imageUrl} alt="" className="h-8 w-12 rounded object-cover" />
        ) : (
          <span className="text-xs text-gray-400">Yok</span>
        )
      ),
    },
    {
      key: "status",
      header: "Durum",
      render: (c) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(c); }}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            c.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {c.isActive ? "Aktif" : "Pasif"}
        </button>
      ),
    },
    {
      key: "saved",
      header: "Kaydeden",
      render: (c) => <span className="text-sm text-gray-600">{c.savedByUserIds?.length ?? 0} kişi</span>,
    },
    {
      key: "date",
      header: "Tarih",
      sortable: true,
      sortValue: (c) => c.createdAt?.getTime() ?? 0,
      render: (c) => (
        <span className="text-xs text-gray-500">
          {c.createdAt?.toLocaleDateString("tr-TR") ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/campaigns/${c.id}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            onClick={(e) => e.stopPropagation()}
          >
            Düzenle
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(c); }}
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
          <Megaphone className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
            <p className="text-sm text-gray-500">Kampanyaları yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Kampanya
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Kampanya ara..." className="w-full sm:w-72" />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tüm Tipler</option>
          {Object.entries(campaignTypeLabels).map(([v, l]) => (
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
          <DataTable data={paged} columns={columns} keyExtractor={(c) => c.id} emptyMessage="Kampanya bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
