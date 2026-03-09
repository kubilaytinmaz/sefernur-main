"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { useRouteId } from "@/hooks/useRouteId";
import { getVisaApplicationById } from "@/lib/firebase/domain";
import { useAuthStore } from "@/store/auth";
import {
    VisaStatus,
    visaPurposeLabels,
    visaStatusColors,
    visaStatusLabels
} from "@/types/visa";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileCheck,
    FileText,
    Globe,
    LogIn,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    ShieldCheck,
    User,
    XCircle,
} from "lucide-react";
import Link from "next/link";

/* ────────── Status Steps ────────── */

const STATUS_STEPS: { key: VisaStatus; label: string }[] = [
  { key: "received", label: "Alındı" },
  { key: "processing", label: "İşleniyor" },
  { key: "completed", label: "Tamamlandı" },
];

function getStepIndex(status: VisaStatus): number {
  if (status === "rejected") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

/* ────────── Main Page ────────── */

export default function VisaDetailPage() {
  const visaId = useRouteId();
  const { isAuthenticated } = useAuthStore();

  const visaQuery = useQuery({
    queryKey: ["visa", visaId],
    queryFn: () => getVisaApplicationById(visaId),
    enabled: !!visaId,
  });

  const application = visaQuery.data;

  if (visaQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Başvuru yükleniyor" description="Vize başvuru detayları getiriliyor..." />
      </div>
    );
  }

  if (visaQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Başvuru yüklenemedi"
          description="Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onRetry={() => visaQuery.refetch()}
        />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState
          title="Başvuru bulunamadı"
          description="Bu başvuru artık mevcut değil veya kaldırılmış olabilir."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center">
            <LogIn className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Giriş yapmanız gerekiyor</h2>
          <p className="text-slate-500 max-w-sm">
            Bu başvuru detayını görüntülemek için giriş yapın.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = visaStatusColors[application.status];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/visa"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Vize İşlemleri
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Left Column ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={`${statusColor.bg} ${statusColor.text} border ${statusColor.border} gap-1`}>
                  {visaStatusLabels[application.status]}
                </Badge>
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 gap-1">
                  <Globe className="w-3 h-3" />
                  {visaPurposeLabels[application.purpose]}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {application.firstName} {application.lastName}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Başvuru No: {application.id}
              </p>
            </div>

            {/* Status Timeline */}
            <StatusTimeline status={application.status} />

            {/* Personal Information */}
            <DetailSection
              icon={<User className="w-4 h-4 text-amber-600" />}
              title="Kişisel Bilgiler"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Ad Soyad" value={`${application.firstName} ${application.lastName}`} />
                <InfoRow label="Pasaport No" value={application.passportNumber || "-"} />
                <InfoRow label="Medeni Durum" value={application.maritalStatus || "-"} />
                <InfoRow label="Ülke / Şehir" value={`${application.country}${application.city ? ` / ${application.city}` : ""}`} />
                {application.address ? (
                  <div className="sm:col-span-2">
                    <InfoRow label="Adres" value={application.address} />
                  </div>
                ) : null}
              </div>
            </DetailSection>

            {/* Travel Details */}
            <DetailSection
              icon={<Calendar className="w-4 h-4 text-amber-600" />}
              title="Seyahat Bilgileri"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Amaç" value={visaPurposeLabels[application.purpose]} />
                <InfoRow
                  label="Çıkış Tarihi"
                  value={application.departureDate.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                <InfoRow
                  label="Dönüş Tarihi"
                  value={application.returnDate.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
                {application.estimatedCompletion ? (
                  <InfoRow
                    label="Tahmini Tamamlanma"
                    value={application.estimatedCompletion.toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                ) : null}
              </div>
            </DetailSection>

            {/* Documents */}
            <DetailSection
              icon={<FileCheck className="w-4 h-4 text-amber-600" />}
              title="Belgeler"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                    Zorunlu Belgeler ({application.requiredFileUrls.length})
                  </p>
                  {application.requiredFileUrls.length > 0 ? (
                    <div className="space-y-2">
                      {application.requiredFileUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="truncate">Belge {i + 1}</span>
                          <Check className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Henüz belge yüklenmedi.</p>
                  )}
                </div>

                {(application.additionalFileUrls ?? []).length > 0 ? (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                      Ek Belgeler ({application.additionalFileUrls!.length})
                    </p>
                    <div className="space-y-2">
                      {application.additionalFileUrls!.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">Ek Belge {i + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </DetailSection>

            {/* Notes */}
            {application.userNote || application.adminNote ? (
              <DetailSection
                icon={<MessageSquare className="w-4 h-4 text-amber-600" />}
                title="Notlar"
              >
                <div className="space-y-3">
                  {application.userNote ? (
                    <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs text-amber-600 font-medium mb-1">Sizin Notunuz</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {application.userNote}
                      </p>
                    </div>
                  ) : null}
                  {application.adminNote ? (
                    <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Yetkili Notu</p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {application.adminNote}
                      </p>
                    </div>
                  ) : null}
                </div>
              </DetailSection>
            ) : null}
          </div>

          {/* ─── Right Column — Sidebar ─── */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Fee Card */}
              <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-5">
                <p className="text-xs text-amber-600 uppercase tracking-wider font-medium">
                  Başvuru Ücreti
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-800">
                  {application.fee > 0
                    ? `${application.fee.toLocaleString("tr-TR")} ${application.currency}`
                    : "Bilgi bekleniyor"}
                </p>
                {application.paymentReceiptUrl ? (
                  <a
                    href={application.paymentReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    Ödeme Makbuzu
                  </a>
                ) : null}
                {application.paymentNote ? (
                  <p className="mt-2 text-xs text-amber-600/80">{application.paymentNote}</p>
                ) : null}
              </div>

              {/* Dates Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Tarihler</h3>
                <div className="space-y-2">
                  <DateRow
                    icon={<Calendar className="w-4 h-4 text-amber-500" />}
                    label="Başvuru Tarihi"
                    date={application.createdAt}
                  />
                  <DateRow
                    icon={<Clock className="w-4 h-4 text-amber-500" />}
                    label="Son Güncelleme"
                    date={application.updatedAt}
                  />
                  <DateRow
                    icon={<MapPin className="w-4 h-4 text-amber-500" />}
                    label="Çıkış"
                    date={application.departureDate}
                  />
                  <DateRow
                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                    label="Dönüş"
                    date={application.returnDate}
                  />
                  {application.estimatedCompletion ? (
                    <DateRow
                      icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      label="Tahmini Tamamlanma"
                      date={application.estimatedCompletion}
                    />
                  ) : null}
                </div>
              </div>

              {/* Contact Card */}
              {application.phone || application.email ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">İletişim</h3>
                  {application.phone ? (
                    <a
                      href={`tel:${application.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Telefon</p>
                        <p className="text-sm font-medium text-slate-900">{application.phone}</p>
                      </div>
                    </a>
                  ) : null}
                  {application.email ? (
                    <a
                      href={`mailto:${application.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">E-posta</p>
                        <p className="text-sm font-medium text-slate-900">{application.email}</p>
                      </div>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Status Timeline ────────── */

function StatusTimeline({ status }: { status: VisaStatus }) {
  const isRejected = status === "rejected";
  const currentIdx = getStepIndex(status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-600" />
        Başvuru Durumu
      </h3>

      {isRejected ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Başvuru Reddedildi</p>
            <p className="text-xs text-red-500 mt-1">
              Detaylı bilgi için lütfen yetkili ile iletişime geçin.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {STATUS_STEPS.map((step, i) => {
            const isDone = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isDone
                        ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-white border-slate-200 text-slate-300"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent ? "text-amber-700" : isDone ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 ? (
                  <div
                    className={`h-0.5 flex-1 -mt-5 ${
                      i < currentIdx ? "bg-amber-500" : "bg-slate-200"
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────── Detail Section ────────── */

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ────────── Info Row ────────── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

/* ────────── Date Row ────────── */

function DateRow({
  icon,
  label,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  date: Date;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
      {icon}
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900">
          {date.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
