"use client";

import { Modal } from "@/components/admin/Modal";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
    addMessageAdminNote,
    getAllContactMessages,
    markMessageAsRead,
} from "@/lib/firebase/admin-domain";
import { ContactMessageModel, contactSubjectLabels } from "@/types/contact";
import { Loader2, Mail, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

export default function AdminMessagesPage() {
  const [data, setData] = useState<ContactMessageModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<"" | "read" | "unread">("");
  const [page, setPage] = useState(1);

  // Modal state
  const [selected, setSelected] = useState<ContactMessageModel | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: { isRead?: boolean } = {};
        if (readFilter === "read") filters.isRead = true;
        if (readFilter === "unread") filters.isRead = false;
        const items = await getAllContactMessages(filters);
        setData(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [readFilter]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, readFilter]);

  const handleOpen = async (msg: ContactMessageModel) => {
    setSelected(msg);
    setAdminNote(msg.adminNote ?? "");
    if (!msg.isRead) {
      try {
        await markMessageAsRead(msg.id);
        setData((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)),
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await addMessageAdminNote(selected.id, adminNote);
      setData((prev) =>
        prev.map((m) =>
          m.id === selected.id ? { ...m, adminNote, repliedAt: new Date() } : m,
        ),
      );
      setSelected(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mail className="h-7 w-7 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            İletişim Mesajları
          </h1>
          <p className="text-sm text-gray-500">
            Web sitesinden gelen mesajları yönetin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="İsim, e-posta veya mesaj ara..."
          className="w-full sm:w-72"
        />
        <select
          value={readFilter}
          onChange={(e) =>
            setReadFilter(e.target.value as "" | "read" | "unread")
          }
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Tümü</option>
          <option value="unread">Okunmamış</option>
          <option value="read">Okunmuş</option>
        </select>
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} mesaj
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : paged.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Mesaj bulunamadı
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleOpen(msg)}
              className="flex w-full items-start gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <div
                className={`mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                  msg.isRead ? "bg-gray-300" : "bg-emerald-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`truncate text-sm ${
                      msg.isRead
                        ? "font-medium text-gray-700"
                        : "font-semibold text-gray-900"
                    }`}
                  >
                    {msg.name}
                  </p>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {msg.createdAt.toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-gray-500">{msg.email}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                    {contactSubjectLabels[msg.subject] ?? msg.subject}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">
                  {msg.message}
                </p>
              </div>
              <StatusBadge status={msg.isRead ? "read" : "unread"} />
            </button>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Mesaj Detayı"
        maxWidth="lg"
      >
        {selected && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-gray-500">Gönderen</dt>
                <dd className="text-gray-900">{selected.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">E-posta</dt>
                <dd className="text-gray-900">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Telefon</dt>
                <dd className="text-gray-900">{selected.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Konu</dt>
                <dd className="text-gray-900">
                  {contactSubjectLabels[selected.subject] ?? selected.subject}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Tarih</dt>
                <dd className="text-gray-900">
                  {selected.createdAt.toLocaleString("tr-TR")}
                </dd>
              </div>
            </dl>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Mesaj</p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {selected.message}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Admin Notu / Yanıt
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Not veya yanıt yazın..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Kapat
              </button>
              <button
                onClick={handleSaveNote}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Kaydet
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
