"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { getAllUsers, type UserFilters } from "@/lib/firebase/admin-domain";
import { RoleType, UserModel } from "@/types/user";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 15;

const roleOptions: { value: RoleType | ""; label: string }[] = [
  { value: "", label: "Tüm Roller" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderatör" },
  { value: "agent", label: "Acente" },
  { value: "user", label: "Kullanıcı" },
];

export default function AdminUsersPage() {
  const [data, setData] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: UserFilters = {};
        if (roleFilter) filters.role = roleFilter as RoleType;
        const items = await getAllUsers(filters);
        setData(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roleFilter]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.phoneNumber?.includes(term) ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const columns: Column<UserModel>[] = [
    {
      key: "name",
      header: "Kullanıcı",
      sortable: true,
      sortValue: (u) => u.fullName ?? u.firstName ?? "",
      render: (u) => (
        <div className="flex items-center gap-3">
          {u.imageUrl ? (
            <img
              src={u.imageUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              {(u.fullName ?? u.firstName ?? u.email ?? "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {u.fullName ||
                `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                "İsimsiz"}
            </p>
            <p className="text-xs text-gray-500">{u.email ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telefon",
      render: (u) => (
        <span className="text-sm text-gray-600">
          {u.phoneNumber ?? "—"}
        </span>
      ),
    },
    {
      key: "roles",
      header: "Roller",
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map((r) => (
            <span
              key={r}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                r === "admin"
                  ? "bg-red-50 text-red-700"
                  : r === "moderator"
                    ? "bg-purple-50 text-purple-700"
                    : r === "agent"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Kayıt Tarihi",
      sortable: true,
      sortValue: (u) => u.createdAt.getTime(),
      render: (u) => (
        <span className="text-xs text-gray-500">
          {u.createdAt.toLocaleDateString("tr-TR")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <Link
          href={`/admin/users/${u.id}`}
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
        <Users className="h-7 w-7 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-sm text-gray-500">
            Kayıtlı kullanıcıları görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Ad, e-posta veya telefon ara..."
          className="w-full sm:w-72"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white pl-3 pr-10 py-2.5 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} kullanıcı
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
            keyExtractor={(u) => u.id}
            emptyMessage="Kullanıcı bulunamadı"
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
