"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { useRouteId } from "@/hooks/useRouteId";
import {
    getAdminUserById,
    getAllReservations,
    getAllVisaApplications,
    updateUserRole,
} from "@/lib/firebase/admin-domain";
import { ReservationModel } from "@/types/reservation";
import { RoleType, UserModel } from "@/types/user";
import { VisaApplicationModel } from "@/types/visa";
import {
    ArrowLeft,
    CalendarDays,
    Loader2,
    Mail,
    Phone,
    Save,
    Shield,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ALL_ROLES: { value: RoleType; label: string }[] = [
  { value: "user", label: "Kullanıcı" },
  { value: "agent", label: "Acente" },
  { value: "moderator", label: "Moderatör" },
  { value: "admin", label: "Admin" },
];

const typeLabels: Record<string, string> = {
  hotel: "Otel",
  tour: "Tur",
  transfer: "Transfer",
  guide: "Rehber",
  car: "Araç",
};

export default function UserDetailPage() {
  const userId = useRouteId();
  const router = useRouter();

  const [user, setUser] = useState<UserModel | null>(null);
  const [reservations, setReservations] = useState<ReservationModel[]>([]);
  const [visaApps, setVisaApps] = useState<VisaApplicationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [u, allR, allV] = await Promise.all([
          getAdminUserById(userId),
          getAllReservations(),
          getAllVisaApplications(),
        ]);
        if (u) {
          setUser(u);
          setSelectedRoles(u.roles);
        }
        setReservations(allR.filter((r) => r.userId === userId));
        setVisaApps(allV.filter((v) => v.userId === userId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleRoleToggle = (role: RoleType) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSaveRoles = async () => {
    if (!user || selectedRoles.length === 0) return;
    setSaving(true);
    try {
      await updateUserRole(userId, selectedRoles);
      setUser({ ...user, roles: selectedRoles });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Kullanıcı bulunamadı</p>
        <Link
          href="/admin/users"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Listeye Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {user.fullName ||
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
              "İsimsiz Kullanıcı"}
          </h1>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* User Info Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <User className="h-5 w-5 text-gray-400" />
              Kullanıcı Bilgileri
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    E-posta
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {user.email ?? "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Telefon
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {user.phoneNumber ?? "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Kayıt Tarihi
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {user.createdAt.toLocaleString("tr-TR")}
                  </dd>
                </div>
              </div>
              {user.lastSeen && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Son Görülme
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {user.lastSeen.toLocaleString("tr-TR")}
                  </dd>
                </div>
              )}
              {user.referralCode && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Referans Kodu
                  </dt>
                  <dd className="text-sm font-mono text-gray-900">
                    {user.referralCode}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Reservations */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                Rezervasyonları ({reservations.length})
              </h3>
            </div>
            {reservations.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Rezervasyon bulunamadı
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {reservations.slice(0, 10).map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/reservations/${r.id}`}
                    className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeLabels[r.type] ?? r.type} · ₺
                        {r.price.toLocaleString("tr-TR")} ·{" "}
                        {r.createdAt.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Visa Applications */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">
                Vize Başvuruları ({visaApps.length})
              </h3>
            </div>
            {visaApps.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Vize başvurusu bulunamadı
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {visaApps.slice(0, 10).map((v) => (
                  <Link
                    key={v.id}
                    href={`/admin/visa/${v.id}`}
                    className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {v.firstName} {v.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {v.country} · {v.createdAt.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <StatusBadge status={v.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar – Role Management */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Shield className="h-5 w-5 text-gray-400" />
              Rol Yönetimi
            </h3>
            <div className="space-y-2">
              {ALL_ROLES.map((role) => (
                <label
                  key={role.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => handleRoleToggle(role.value)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {role.label}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSaveRoles}
              disabled={saving || selectedRoles.length === 0}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Rolleri Kaydet
            </button>
          </div>

          {/* Profile Image */}
          {user.imageUrl && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                Profil Fotoğrafı
              </h3>
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "Profil"}
                className="h-32 w-32 rounded-xl object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
