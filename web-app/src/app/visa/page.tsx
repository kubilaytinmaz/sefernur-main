"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { getUserVisaApplications } from "@/lib/firebase/domain";
import { useAuthStore } from "@/store/auth";
import {
    VisaApplicationModel,
    VisaPurpose,
    VisaStatus,
    visaPurposeLabels,
    visaStatusColors,
    visaStatusLabels,
} from "@/types/visa";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar,
    ChevronRight,
    Clock,
    FileCheck,
    FileText,
    Globe,
    LogIn,
    MapPin,
    Plus,
    Search,
    ShieldCheck,
    SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import VisaApplicationForm from "./VisaApplicationForm";

/* ────────── Status Icon ────────── */

function StatusIcon({ status, className }: { status: VisaStatus; className?: string }) {
  switch (status) {
    case "completed":
      return <FileCheck className={className} />;
    case "processing":
      return <Clock className={className} />;
    case "rejected":
      return <ShieldCheck className={className} />;
    default:
      return <FileText className={className} />;
  }
}

/* ────────── Main Page ────────── */

export default function VisaPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VisaStatus>("all");
  const [purposeFilter, setPurposeFilter] = useState<"all" | VisaPurpose>("all");
  const [showForm, setShowForm] = useState(false);

  const visaQuery = useQuery({
    queryKey: ["visaApplications", user?.id],
    queryFn: () => getUserVisaApplications(user?.id || ""),
    enabled: Boolean(user?.id),
  });

  const filteredApplications = useMemo(() => {
    const items = visaQuery.data ?? [];
    const normalized = searchQuery.trim().toLowerCase();

    return items.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (purposeFilter !== "all" && app.purpose !== purposeFilter) return false;

      if (normalized) {
        return [
          app.firstName,
          app.lastName,
          app.passportNumber,
          app.country,
          app.city,
          visaPurposeLabels[app.purpose],
          visaStatusLabels[app.status],
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      }

      return true;
    });
  }, [searchQuery, statusFilter, purposeFilter, visaQuery.data]);

  const hasActiveFilters =
    statusFilter !== "all" || purposeFilter !== "all" || searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,#f59e0b20,transparent_50%),radial-gradient(circle_at_70%_80%,#d9731520,transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-700" />
            </div>
            {isAuthenticated ? (
              <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
                {filteredApplications.length} Başvuru
              </Badge>
            ) : null}
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
                Vize İşlemleri
              </h1>
              <p className="mt-3 text-slate-600 max-w-2xl text-lg">
                Umre, hac ve ziyaret vizeleriniz için başvuru sürecinizi tek panelden takip edin.
              </p>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-amber-600 text-sm font-medium text-white hover:bg-amber-700 transition-colors cursor-pointer shrink-0 mt-1"
              >
                <Plus className="w-4 h-4" />
                Yeni Başvuru
              </button>
            ) : null}
          </div>

          {/* Search Bar — only when authenticated */}
          {isAuthenticated ? (
            <>
              <div className="mt-8">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İsim, pasaport numarası veya şehir ara..."
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Bar */}
              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="font-medium">Filtreler</span>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | VisaStatus)}
                  className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">Tüm Durumlar</option>
                  {Object.entries(visaStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value as "all" | VisaPurpose)}
                  className="h-10 min-w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">Tüm Amaçlar</option>
                  {Object.entries(visaPurposeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setPurposeFilter("all");
                    }}
                    className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    Filtreleri Temizle
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest / Unauthenticated State */}
        {!isAuthenticated ? (
          <div className="space-y-6">
            {/* Process Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <ProcessCard
                icon={<FileText className="w-5 h-5 text-amber-600" />}
                title="1. Bilgilerinizi İletin"
                description="Kişisel bilgilerinizi ve pasaport detaylarınızı güvenle paylaşın."
              />
              <ProcessCard
                icon={<FileCheck className="w-5 h-5 text-amber-600" />}
                title="2. Evrakları Yükleyin"
                description="Gerekli belgeleri hesabınız üzerinden yükleyin ve eksikleri tamamlayın."
              />
              <ProcessCard
                icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
                title="3. Durumu Takip Edin"
                description="Başvurunuzun her aşamasını panelden canlı olarak izleyin."
              />
            </div>

            {/* Login CTA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                <LogIn className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Başvurularınızı görmek için giriş yapın
              </h2>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Oturum açtığınızda geçmiş ve aktif vize başvurularınız burada listelenir.
                Durum geçişleri: Alındı → İşleniyor → Tamamlandı / Reddedildi.
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap ve Başvur
              </Link>
            </div>
          </div>
        ) : null}

        {/* Authenticated States */}
        {isAuthenticated && visaQuery.isLoading ? (
          <LoadingState
            title="Başvurularınız yükleniyor"
            description="Vize kayıtlarınız hazırlanıyor..."
          />
        ) : null}

        {isAuthenticated && visaQuery.isError ? (
          <ErrorState
            title="Vize başvuruları alınamadı"
            description="Lütfen tekrar deneyin."
            onRetry={() => visaQuery.refetch()}
          />
        ) : null}

        {isAuthenticated &&
        !visaQuery.isLoading &&
        !visaQuery.isError &&
        filteredApplications.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? "Filtrelere uygun başvuru bulunamadı"
                : "Henüz vize başvurunuz yok"
            }
            description={
              hasActiveFilters
                ? "Arama terimini veya filtreleri değiştirerek tekrar deneyebilirsiniz."
                : "İlk başvurunuz oluşturulduğunda bu alanda durum kartı görünecek."
            }
          />
        ) : null}

        {/* Application Cards */}
        {isAuthenticated &&
        !visaQuery.isLoading &&
        !visaQuery.isError &&
        filteredApplications.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredApplications.map((app) => (
              <VisaCard key={app.id} application={app} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Visa Application Form Modal */}
      {showForm ? <VisaApplicationForm onClose={() => setShowForm(false)} /> : null}
    </div>
  );
}

/* ────────── Process Info Card (for guests) ────────── */

function ProcessCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

/* ────────── Visa Application Card ────────── */

function VisaCard({ application }: { application: VisaApplicationModel }) {
  const statusColor = visaStatusColors[application.status];

  return (
    <Link
      href={`/visa/${application.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-amber-300 transition-colors cursor-pointer"
    >
      {/* Status Header Bar */}
      <div className={`px-4 py-3 ${statusColor.bg} border-b ${statusColor.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon status={application.status} className={`w-4 h-4 ${statusColor.text}`} />
            <span className={`text-sm font-medium ${statusColor.text}`}>
              {visaStatusLabels[application.status]}
            </span>
          </div>
          <Badge className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border} text-xs`}>
            {visaPurposeLabels[application.purpose]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
            {application.firstName} {application.lastName}
          </h3>
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 shrink-0 mt-1 transition-colors" />
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {application.passportNumber ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              <FileText className="w-3 h-3 text-amber-500" />
              {application.passportNumber}
            </span>
          ) : null}
          {application.country ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
              <MapPin className="w-3 h-3 text-amber-500" />
              {application.country}
              {application.city ? `, ${application.city}` : ""}
            </span>
          ) : null}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 text-amber-500" />
            {application.departureDate.toLocaleDateString("tr-TR")}
          </span>
          <span className="text-slate-300">→</span>
          <span>{application.returnDate.toLocaleDateString("tr-TR")}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ücret</p>
            <p className="text-lg font-bold text-amber-700">
              {application.fee > 0
                ? `${application.fee.toLocaleString("tr-TR")} ${application.currency}`
                : "Bilgi bekleniyor"}
            </p>
          </div>
          {application.estimatedCompletion ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <Clock className="w-3 h-3" />
              {application.estimatedCompletion.toLocaleDateString("tr-TR")}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
