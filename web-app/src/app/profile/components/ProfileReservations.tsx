"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTlUsdPairFromTl, formatTlUsdPairFromUsd } from "@/lib/currency";
import { getUserReservations } from "@/lib/firebase/reservations";
import { useAuthStore } from "@/store/auth";
import { ReservationType } from "@/types/reservation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Filter, ReceiptText, Users } from "lucide-react";
import { useState } from "react";

const reservationStatusLabel = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  cancelled: "İptal",
  completed: "Tamamlandı",
} as const;

const paymentStatusLabel = {
  initiated: "Başlatıldı",
  success: "Başarılı",
  failed: "Başarısız",
} as const;

const typeLabels: Record<ReservationType, string> = {
  hotel: "Otel",
  car: "Araç",
  transfer: "Transfer",
  transfer_tour: "Transfer + Tur",
  guide: "Rehber",
  tour: "Tur",
};

function reservationBadgeVariant(
  status: keyof typeof reservationStatusLabel
): "info" | "warning" | "success" | "error" {
  if (status === "pending") return "warning";
  if (status === "confirmed" || status === "completed") return "success";
  return "error";
}

function paymentBadgeVariant(
  status: keyof typeof paymentStatusLabel
): "info" | "warning" | "success" | "error" {
  if (status === "initiated") return "info";
  if (status === "success") return "success";
  return "error";
}

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled" | "completed";
type TypeFilter = "all" | ReservationType;

export default function ProfileReservations() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const reservationsQuery = useQuery({
    queryKey: ["reservations", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getUserReservations(user?.id ?? ""),
  });

  const reservations = reservationsQuery.data ?? [];

  const filtered = reservations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  if (reservationsQuery.isLoading) {
    return <LoadingState title="Rezervasyonlar yükleniyor" description="Kayıtlarınız hazırlanıyor..." />;
  }

  if (reservationsQuery.isError) {
    return (
      <ErrorState
        title="Rezervasyonlar alınamadı"
        description="Lütfen tekrar deneyin."
        onRetry={() => reservationsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card className="border-gray-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtrele:</span>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { value: "all", label: "Tümü" },
                  { value: "pending", label: "Beklemede" },
                  { value: "confirmed", label: "Onaylı" },
                  { value: "completed", label: "Tamamlanan" },
                  { value: "cancelled", label: "İptal" },
                ] as { value: StatusFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Type Filters */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { value: "all", label: "Tüm Tipler" },
                  ...Object.entries(typeLabels).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ] as { value: TypeFilter; label: string }[]
              ).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    typeFilter === f.value
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Rezervasyon bulunamadı"
          description={
            statusFilter !== "all" || typeFilter !== "all"
              ? "Filtreleri değiştirmeyi deneyin."
              : "Henüz rezervasyonunuz bulunmuyor."
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden border-gray-100">
              <div className="grid md:grid-cols-[200px_1fr]">
                <div className="h-40 md:h-full">
                  <img
                    src={reservation.imageUrl || "/placeholder-hotel.jpg"}
                    alt={reservation.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-hotel.jpg";
                    }}
                  />
                </div>
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <CardTitle className="text-base text-gray-900">
                        {reservation.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {reservation.type && (
                          <Badge variant="secondary">
                            {typeLabels[reservation.type] ?? reservation.type}
                          </Badge>
                        )}
                        <Badge
                          variant={reservationBadgeVariant(reservation.status)}
                        >
                          {reservationStatusLabel[reservation.status]}
                        </Badge>
                        {reservation.paymentStatus && (
                          <Badge
                            variant={paymentBadgeVariant(
                              reservation.paymentStatus
                            )}
                          >
                            Ödeme:{" "}
                            {paymentStatusLabel[reservation.paymentStatus]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700 space-y-1.5">
                    <p className="text-gray-500">{reservation.subtitle || "-"}</p>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-emerald-600" />
                        {reservation.startDate.toLocaleDateString("tr-TR")} -{" "}
                        {reservation.endDate.toLocaleDateString("tr-TR")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        {reservation.people || 1} kişi
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ReceiptText className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">
                          {reservation.currency?.toUpperCase() === "USD"
                            ? formatTlUsdPairFromUsd(reservation.price)
                            : formatTlUsdPairFromTl(reservation.price)}
                        </span>
                      </span>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Count Label */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          Toplam {filtered.length} rezervasyon gösteriliyor
          {(statusFilter !== "all" || typeFilter !== "all") &&
            ` (${reservations.length} toplam)`}
        </p>
      )}
    </div>
  );
}
