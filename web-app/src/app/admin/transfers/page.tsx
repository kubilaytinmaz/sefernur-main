"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { deleteTransfer, getAllTransfers, updateTransfer } from "@/lib/firebase/admin-domain";
import { displayAddress } from "@/types/address";
import { TransferModel, vehicleTypeLabels } from "@/types/transfer";
import { Loader2, Plane, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

export default function AdminTransfersPage() {
  const [data, setData] = useState<TransferModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllTransfers();
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
    if (vehicleFilter) items = items.filter((t) => t.vehicleType === vehicleFilter);
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(
      (t) =>
        t.vehicleName.toLowerCase().includes(term) ||
        t.company.toLowerCase().includes(term) ||
        displayAddress(t.fromAddress).toLowerCase().includes(term) ||
        displayAddress(t.toAddress).toLowerCase().includes(term),
    );
  }, [data, search, vehicleFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, vehicleFilter]);

  const handleToggleActive = async (transfer: TransferModel) => {
    await updateTransfer(transfer.id, { isActive: !transfer.isActive });
    setData((prev) => prev.map((t) => (t.id === transfer.id ? { ...t, isActive: !t.isActive } : t)));
  };

  const handleDelete = async (transfer: TransferModel) => {
    if (!confirm("Bu transferi silmek istediğinize emin misiniz?")) return;
    await deleteTransfer(transfer.id);
    setData((prev) => prev.filter((t) => t.id !== transfer.id));
  };

  const columns: Column<TransferModel>[] = [
    {
      key: "route",
      header: "Güzergah",
      render: (t) => (
        <div className="max-w-[250px]">
          <p className="truncate text-sm font-medium text-gray-900">{displayAddress(t.fromAddress)}</p>
          <p className="truncate text-xs text-gray-500">→ {displayAddress(t.toAddress)}</p>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Araç",
      render: (t) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{t.vehicleName}</p>
          <p className="text-xs text-gray-500">{vehicleTypeLabels[t.vehicleType] ?? t.vehicleType}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Fiyat",
      sortable: true,
      sortValue: (t) => t.basePrice,
      render: (t) => <span className="font-medium">₺{t.basePrice.toLocaleString("tr-TR")}</span>,
    },
    {
      key: "capacity",
      header: "Kapasite",
      render: (t) => <span className="text-sm text-gray-600">{t.capacity} kişi</span>,
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
      key: "actions",
      header: "",
      render: (t) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/transfers/${t.id}`}
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
          <Plane className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transferler</h1>
            <p className="text-sm text-gray-500">Transfer hizmetlerini yönetin</p>
          </div>
        </div>
        <Link
          href="/admin/transfers/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Yeni Transfer
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Güzergah, araç veya firma ara..." className="w-full sm:w-72" />
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tüm Araç Tipleri</option>
          {Object.entries(vehicleTypeLabels).map(([v, l]) => (
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
          <DataTable data={paged} columns={columns} keyExtractor={(t) => t.id} emptyMessage="Transfer bulunamadı" />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
