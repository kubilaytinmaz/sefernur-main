"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { useRouteId } from "@/hooks/useRouteId";
import {
    getAdminUserById,
    getReservationById,
    updateReservationStatus,
} from "@/lib/firebase/admin-domain";
import { ReservationModel, ReservationStatus } from "@/types/reservation";
import { UserModel } from "@/types/user";
import {
    ArrowLeft,
    CalendarDays,
    CreditCard,
    Loader2,
    Save,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statusActions: {
  from: ReservationStatus;
  to: ReservationStatus;
  label: string;
  color: string;
}[] = [
  {
    from: "pending",
    to: "confirmed",
    label: "Onayla",
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    from: "pending",
    to: "cancelled",
    label: "İptal Et",
    color: "bg-red-600 hover:bg-red-700 text-white",
  },
  {
    from: "confirmed",
    to: "completed",
    label: "Tamamlandı",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    from: "confirmed",
    to: "cancelled",
    label: "İptal Et",
    color: "bg-red-600 hover:bg-red-700 text-white",
  },
];

const typeLabels: Record<string, string> = {
  hotel: "Otel",
  tour: "Tur",
  transfer: "Transfer",
  guide: "Rehber",
  car: "Araç",
};

export default function ReservationDetailPage() {
  const id = useRouteId();
  const router = useRouter();

  const [reservation, setReservation] = useState<ReservationModel | null>(null);
  const [customer, setCustomer] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const r = await getReservationById(id);
        if (!r) return;
        setReservation(r);
        setAdminNote(r.adminNote ?? "");
        if (r.userId) {
          const u = await getAdminUserById(r.userId);
          setCustomer(u);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (!reservation) return;
    setUpdating(true);
    try {
      await updateReservationStatus(id, newStatus, adminNote || undefined);
      setReservation({ ...reservation, status: newStatus, adminNote });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!reservation) return;
    setUpdating(true);
    try {
      await updateReservationStatus(id, reservation.status, adminNote);
      setReservation({ ...reservation, adminNote });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Rezervasyon bulunamadı</p>
        <Link
          href="/admin/reservations"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Listeye Dön
        </Link>
      </div>
    );
  }

  const availableActions = statusActions.filter(
    (a) => a.from === reservation.status,
  );

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
            {reservation.title}
          </h1>
          <p className="text-sm text-gray-500">ID: {reservation.id}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Details Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Rezervasyon Detayları
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-gray-500">Tip</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeLabels[reservation.type] ?? reservation.type}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Fiyat</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  ₺{reservation.price.toLocaleString("tr-TR")}{" "}
                  {reservation.currency}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Başlangıç
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.startDate.toLocaleDateString("tr-TR")}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">Bitiş</dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.endDate.toLocaleDateString("tr-TR")}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Kaynak</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {reservation.source === "web"
                    ? "Web"
                    : reservation.source === "mobile"
                      ? "Mobil"
                      : reservation.source === "admin"
                        ? "Admin"
                        : "Belirtilmemiş"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Kişi Sayısı
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {reservation.people ?? reservation.quantity}
                </dd>
              </div>
              {reservation.paymentOrderId && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <CreditCard className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Ödeme ID
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {reservation.paymentOrderId}
                    </dd>
                  </div>
                </div>
              )}
              {reservation.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500">
                    Müşteri Notu
                  </dt>
                  <dd className="mt-1 text-sm text-gray-700">
                    {reservation.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Admin Note */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-900">
              Admin Notu
            </h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Rezervasyon hakkında not ekleyin..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={handleSaveNote}
              disabled={updating}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Notu Kaydet
            </button>
          </div>

          {/* Status Actions */}
          {availableActions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                Durum Değiştir
              </h3>
              <div className="flex flex-wrap gap-3">
                {availableActions.map((action) => (
                  <button
                    key={action.to}
                    onClick={() => handleStatusChange(action.to)}
                    disabled={updating}
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${action.color}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar – Customer Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <User className="h-5 w-5 text-gray-400" />
              Müşteri Bilgileri
            </h3>
            {customer ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Ad Soyad</dt>
                  <dd className="text-sm text-gray-900">
                    {customer.fullName ||
                      `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">E-posta</dt>
                  <dd className="text-sm text-gray-900">
                    {customer.email ?? reservation.userEmail ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Telefon</dt>
                  <dd className="text-sm text-gray-900">
                    {customer.phoneNumber ?? reservation.userPhone ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Roller</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {customer.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                      >
                        {r}
                      </span>
                    ))}
                  </dd>
                </div>
                <Link
                  href={`/admin/users/${customer.id}`}
                  className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Kullanıcı Profiline Git →
                </Link>
              </dl>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {reservation.userEmail ?? reservation.userPhone ?? "Bilgi yok"}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Zaman Çizelgesi
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Oluşturulma
                  </p>
                  <p className="text-xs text-gray-500">
                    {reservation.createdAt.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              {reservation.updatedAt &&
                reservation.updatedAt.getTime() !==
                  reservation.createdAt.getTime() && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Son Güncelleme
                      </p>
                      <p className="text-xs text-gray-500">
                        {reservation.updatedAt.toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
