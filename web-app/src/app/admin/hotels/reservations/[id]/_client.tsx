"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  getAdminUserById,
  getReservationById,
  updateReservationStatus,
} from "@/lib/firebase/admin-domain";
import { ReservationModel, ReservationStatus } from "@/types/reservation";
import { UserModel } from "@/types/user";
import {
  ArrowLeft,
  Bed,
  Building2,
  Calendar,
  CalendarDays,
  CreditCard,
  DoorOpen,
  Globe,
  Loader2,
  Mail,
  Moon,
  Phone,
  Save,
  User,
  Users,
  UtensilsCrossed,
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

const boardBasisLabels: Record<string, string> = {
  BB: "Oda Kahvaltı",
  HB: "Yarım Pansiyon",
  FB: "Tam Pansiyon",
  AI: "Her Şey Dahil",
  RO: "Sadece Oda",
};

interface HotelReservationDetailClientProps {
  reservationId: string;
}

export function HotelReservationDetailClient({
  reservationId,
}: HotelReservationDetailClientProps) {
  const router = useRouter();

  const [reservation, setReservation] = useState<ReservationModel | null>(null);
  const [customer, setCustomer] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const r = await getReservationById(reservationId);
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
  }, [reservationId]);

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    if (!reservation) return;
    setUpdating(true);
    try {
      await updateReservationStatus(
        reservationId,
        newStatus,
        adminNote || undefined
      );
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
      await updateReservationStatus(
        reservationId,
        reservation.status,
        adminNote
      );
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
          href="/admin/hotels/reservations"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Listeye Dön
        </Link>
      </div>
    );
  }

  const availableActions = statusActions.filter(
    (a) => a.from === reservation.status
  );

  const meta = (reservation.meta || {}) as Record<string, unknown>;
  const guestInfo = meta.guestInfo as Record<string, unknown> | undefined;
  const webbedsData = meta.webbedsData as Record<string, unknown> | undefined;

  // Meta alanlarını tip güvenli şekilde çıkar
  const hotelId = meta.hotelId as string | undefined;
  const hotelName = (meta.hotelName as string) || reservation.title;
  const roomName = meta.roomName as string | undefined;
  const roomTypeCode = meta.roomTypeCode as string | undefined;
  const boardBasis = meta.boardBasis as string | undefined;
  const checkInTime = meta.checkInTime as string | undefined;
  const checkOutTime = meta.checkOutTime as string | undefined;
  const adultsCount = meta.adults as string | undefined;
  const childrenCount = meta.children as string | undefined;
  const specialRequests = meta.specialRequests as string | undefined;
  const identityTaxNumber = guestInfo?.identityTaxNumber as string | undefined;
  const bookingReference = webbedsData?.bookingReference as string | undefined;
  const confirmationNumber = webbedsData?.confirmationNumber as string | undefined;
  const rateId = webbedsData?.rateId as string | undefined;

  // Gece sayısı hesaplama
  const nights = Math.round(
    (reservation.endDate.getTime() - reservation.startDate.getTime()) / (1000 * 60 * 60 * 24)
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              {hotelName}
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              Otel Rezervasyonu
            </span>
          </div>
          <p className="text-sm text-gray-500">ID: {reservation.id}</p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sol Taraf - Ana Bilgiler */}
        <div className="space-y-6 lg:col-span-2">
          {/* Rezervasyon Detayları */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              Rezervasyon Detayları
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-gray-500">Rezervasyon ID</dt>
                <dd className="mt-1 text-sm text-gray-900">#{reservation.id?.slice(0, 12)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Fiyat</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  ₺{reservation.price.toLocaleString("tr-TR")}{" "}
                  {reservation.currency}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-green-500" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Check-in Tarihi
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.startDate.toLocaleDateString("tr-TR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                  {checkInTime && (
                    <p className="text-xs text-gray-500">
                      Saat: {checkInTime}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-red-500" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Check-out Tarihi
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.endDate.toLocaleDateString("tr-TR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                  {checkOutTime && (
                    <p className="text-xs text-gray-500">
                      Saat: {checkOutTime}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Moon className="mt-0.5 h-4 w-4 text-indigo-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Konaklama Süresi
                  </dt>
                  <dd className="text-sm text-gray-900">{nights} gece</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Misafir Sayısı
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.people ?? reservation.quantity} kişi
                  </dd>
                  {adultsCount && (
                    <p className="text-xs text-gray-500">
                      Yetişkin: {adultsCount}
                    </p>
                  )}
                  {childrenCount && (
                    <p className="text-xs text-gray-500">
                      Çocuk: {childrenCount}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">Kaynak</dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.source === "web"
                      ? "Web"
                      : reservation.source === "mobile"
                        ? "Mobil"
                        : reservation.source === "admin"
                          ? "Admin"
                          : "Belirtilmemiş"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Otel Bilgileri */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Building2 className="h-5 w-5 text-blue-600" />
              Otel Bilgileri
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hotelId && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500">
                    Otel ID
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-900">
                      {hotelId}
                    </span>
                    <Link
                      href={`/admin/hotels/${hotelId}`}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Otel Detayına Git →
                    </Link>
                  </dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500">
                  Otel Adı
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {hotelName}
                </dd>
              </div>
              {roomName && (
                <div className="flex items-start gap-2">
                  <Bed className="mt-0.5 h-4 w-4 text-purple-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Oda Tipi
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {roomName}
                    </dd>
                    {roomTypeCode && (
                      <p className="text-xs text-gray-500">
                        Kod: {roomTypeCode}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {boardBasis && (
                <div className="flex items-start gap-2">
                  <UtensilsCrossed className="mt-0.5 h-4 w-4 text-orange-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Yemek Planı
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {boardBasisLabels[boardBasis] || boardBasis}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Misafir Bilgileri */}
          {guestInfo && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                <User className="h-5 w-5 text-gray-600" />
                Misafir Bilgileri
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500">Unvan</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {guestInfo.title as string}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500">Ad Soyad</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(guestInfo.firstName as string)} {(guestInfo.lastName as string)}
                  </dd>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">E-posta</dt>
                    <dd className="text-sm text-gray-900">
                      {guestInfo.email as string}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Telefon</dt>
                    <dd className="text-sm text-gray-900">
                      {guestInfo.phone as string}
                    </dd>
                  </div>
                </div>
                {identityTaxNumber && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500">
                      TC Kimlik / Vergi No
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {identityTaxNumber}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* WebBeds Bilgileri */}
          {webbedsData && (bookingReference || confirmationNumber || rateId) && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                <Globe className="h-5 w-5 text-blue-500" />
                WebBeds Rezervasyon Bilgileri
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {bookingReference && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Booking Reference
                    </dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">
                      {bookingReference}
                    </dd>
                  </div>
                )}
                {confirmationNumber && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Confirmation Number
                    </dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">
                      {confirmationNumber}
                    </dd>
                  </div>
                )}
                {rateId && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Rate ID
                    </dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">
                      {rateId}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Ödeme Bilgileri */}
          {(reservation.paymentOrderId || reservation.paymentStatus) && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                <CreditCard className="h-5 w-5 text-gray-600" />
                Ödeme Bilgileri
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {reservation.paymentOrderId && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium text-gray-500">
                      Ödeme ID
                    </dt>
                    <dd className="mt-1 text-sm font-mono text-gray-900">
                      {reservation.paymentOrderId}
                    </dd>
                  </div>
                )}
                {reservation.paymentStatus && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      Ödeme Durumu
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          reservation.paymentStatus === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : reservation.paymentStatus === "failed"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {reservation.paymentStatus === "success"
                          ? "Başarılı"
                          : reservation.paymentStatus === "failed"
                            ? "Başarısız"
                            : "Beklemede"}
                      </span>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-500">Tutar</dt>
                  <dd className="mt-1 text-sm font-bold text-gray-900">
                    ₺{reservation.price.toLocaleString("tr-TR")}{" "}
                    {reservation.currency}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Müşteri Notu */}
          {reservation.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                Müşteri Notu
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {reservation.notes}
              </p>
            </div>
          )}

          {/* Özel İstekler */}
          {specialRequests && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                Özel İstekler
              </h3>
              <p className="text-sm leading-relaxed text-gray-700">
                {specialRequests}
              </p>
            </div>
          )}

          {/* Admin Notu */}
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

          {/* Durum Değiştir */}
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

        {/* Sağ Taraf - Müşteri ve Zaman */}
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <User className="h-5 w-5 text-gray-400" />
              Müşteri Bilgileri
            </h3>
            {customer ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Ad Soyad
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {customer.fullName ||
                      `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
                      "—"}
                  </dd>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium text-gray-500">
                      E-posta
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {customer.email ?? reservation.userEmail ?? "—"}
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
                      {customer.phoneNumber ?? reservation.userPhone ?? "—"}
                    </dd>
                  </div>
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
                {reservation.userEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {reservation.userEmail}
                    </span>
                  </div>
                )}
                {reservation.userPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {reservation.userPhone}
                    </span>
                  </div>
                )}
                {!reservation.userEmail && !reservation.userPhone && (
                  <p className="text-sm text-gray-500">Müşteri bilgisi yok</p>
                )}
              </div>
            )}
          </div>

          {/* Zaman Çizelgesi */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Zaman Çizelgesi
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
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
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    </div>
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
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <DoorOpen className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Check-in
                  </p>
                  <p className="text-xs text-gray-500">
                    {reservation.startDate.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <DoorOpen className="h-3 w-3 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Check-out
                  </p>
                  <p className="text-xs text-gray-500">
                    {reservation.endDate.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Eylemler */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-900">
              Hızlı Eylemler
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/hotels/reservations"
                className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Rezervasyon Listesine Dön
              </Link>
              {hotelId && (
                <Link
                  href={`/admin/hotels/${hotelId}`}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Building2 className="h-4 w-4" />
                  Otel Detayına Git
                </Link>
              )}
              {customer?.id && (
                <Link
                  href={`/admin/users/${customer.id}`}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  Müşteri Profiline Git
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
