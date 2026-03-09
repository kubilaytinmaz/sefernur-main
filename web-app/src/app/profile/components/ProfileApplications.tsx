"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getUserVisaApplications } from "@/lib/firebase/domain";
import { useAuthStore } from "@/store/auth";
import {
    VisaPurpose,
    VisaStatus,
    visaPurposeLabels,
    visaStatusColors,
    visaStatusLabels,
} from "@/types/visa";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileText, Filter, Globe } from "lucide-react";
import { useState } from "react";

type StatusFilter = "all" | VisaStatus;

export default function ProfileApplications() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const applicationsQuery = useQuery({
    queryKey: ["visa-applications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getUserVisaApplications(user?.id ?? ""),
  });

  const applications = applicationsQuery.data ?? [];

  const filtered =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  if (applicationsQuery.isLoading) {
    return <LoadingState title="Başvurular yükleniyor" description="Vize başvurularınız hazırlanıyor..." />;
  }

  if (applicationsQuery.isError) {
    return (
      <ErrorState
        title="Başvurular alınamadı"
        description="Lütfen tekrar deneyin."
        onRetry={() => applicationsQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      {applications.length > 0 && (
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Durum:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { value: "all", label: "Tümü" },
                    { value: "received", label: "Alındı" },
                    { value: "processing", label: "İşleniyor" },
                    { value: "completed", label: "Tamamlandı" },
                    { value: "rejected", label: "Reddedildi" },
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Başvuru bulunamadı"
          description={
            statusFilter !== "all"
              ? "Bu durumda başvuru bulunmuyor."
              : "Henüz vize başvurunuz yok. Vize sayfasından başvurabilirsiniz."
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((app) => {
            const statusColor = visaStatusColors[app.status] ?? {
              bg: "bg-gray-50",
              text: "text-gray-700",
              border: "border-gray-200",
            };

            return (
              <Card
                key={app.id}
                className={`border-l-4 ${statusColor.border} border-gray-100`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-semibold text-gray-900">
                          {app.firstName} {app.lastName}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                        >
                          {visaStatusLabels[app.status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-amber-500" />
                          {app.country} — {visaPurposeLabels[app.purpose as VisaPurpose] ?? app.purpose}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-emerald-600" />
                          {app.departureDate.toLocaleDateString("tr-TR")} —{" "}
                          {app.returnDate.toLocaleDateString("tr-TR")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {app.passportNumber}
                        </span>
                      </div>

                      {app.estimatedCompletion && (
                        <p className="text-xs text-gray-500">
                          Tahmini tamamlanma:{" "}
                          {app.estimatedCompletion.toLocaleDateString("tr-TR")}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge variant="secondary">
                        {app.fee} {app.currency}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {app.createdAt.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center pt-2">
          Toplam {filtered.length} başvuru gösteriliyor
        </p>
      )}
    </div>
  );
}
