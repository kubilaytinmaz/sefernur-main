"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { useRouteId } from "@/hooks/useRouteId";
import {
    getAdminUserById,
    getVisaApplicationById,
    updateVisaStatus,
} from "@/lib/firebase/admin-domain";
import { UserModel } from "@/types/user";
import {
    VisaApplicationModel,
    VisaStatus,
    visaPurposeLabels
} from "@/types/visa";
import {
    ArrowLeft,
    CalendarDays,
    Download,
    FileText,
    Loader2,
    Save,
    User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const statusActions: {
  from: VisaStatus;
  to: VisaStatus;
  label: string;
  color: string;
}[] = [
  {
    from: "received",
    to: "processing",
    label: "İşleme Al",
    color: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  {
    from: "received",
    to: "rejected",
    label: "Reddet",
    color: "bg-red-600 hover:bg-red-700 text-white",
  },
  {
    from: "processing",
    to: "completed",
    label: "Tamamlandı",
    color: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    from: "processing",
    to: "rejected",
    label: "Reddet",
    color: "bg-red-600 hover:bg-red-700 text-white",
  },
];

export default function VisaDetailPage() {
  const id = useRouteId();
  const router = useRouter();

  const [visa, setVisa] = useState<VisaApplicationModel | null>(null);
  const [customer, setCustomer] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const v = await getVisaApplicationById(id);
        if (!v) return;
        setVisa(v);
        setAdminNote(v.adminNote ?? "");
        if (v.userId) {
          const u = await getAdminUserById(v.userId);
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

  const handleStatusChange = async (newStatus: VisaStatus) => {
    if (!visa) return;
    setUpdating(true);
    try {
      await updateVisaStatus(id, newStatus, adminNote || undefined);
      setVisa({ ...visa, status: newStatus, adminNote });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!visa) return;
    setUpdating(true);
    try {
      await updateVisaStatus(id, visa.status, adminNote);
      setVisa({ ...visa, adminNote });
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

  if (!visa) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Vize başvurusu bulunamadı</p>
        <Link
          href="/admin/visa"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Listeye Dön
        </Link>
      </div>
    );
  }

  const availableActions = statusActions.filter(
    (a) => a.from === visa.status,
  );

  const allFiles = [
    ...(visa.requiredFileUrls ?? []),
    ...(visa.additionalFileUrls ?? []),
    ...(visa.paymentReceiptUrl ? [visa.paymentReceiptUrl] : []),
  ];

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
            {visa.firstName} {visa.lastName}
          </h1>
          <p className="text-sm text-gray-500">Vize Başvuru ID: {visa.id}</p>
        </div>
        <StatusBadge status={visa.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Application Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Başvuru Detayları
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-gray-500">
                  Pasaport No
                </dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {visa.passportNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Ülke</dt>
                <dd className="mt-1 text-sm text-gray-900">{visa.country}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Şehir</dt>
                <dd className="mt-1 text-sm text-gray-900">{visa.city}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Amaç</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {visaPurposeLabels[visa.purpose] ?? visa.purpose}
                </dd>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Gidiş Tarihi
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {visa.departureDate.toLocaleDateString("tr-TR")}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Dönüş Tarihi
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {visa.returnDate.toLocaleDateString("tr-TR")}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Ücret</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  ₺{visa.fee.toLocaleString("tr-TR")} {visa.currency}
                </dd>
              </div>
              {visa.maritalStatus && (
                <div>
                  <dt className="text-xs font-medium text-gray-500">
                    Medeni Durum
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {visa.maritalStatus}
                  </dd>
                </div>
              )}
              {visa.address && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500">Adres</dt>
                  <dd className="mt-1 text-sm text-gray-900">{visa.address}</dd>
                </div>
              )}
              {visa.userNote && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-gray-500">
                    Kullanıcı Notu
                  </dt>
                  <dd className="mt-1 text-sm text-gray-700">
                    {visa.userNote}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Documents */}
          {allFiles.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-gray-400" />
                Belgeler ({allFiles.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {allFiles.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="truncate">
                      Belge {idx + 1}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Note */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-base font-semibold text-gray-900">
              Admin Notu
            </h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Vize başvurusu hakkında not ekleyin..."
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <User className="h-5 w-5 text-gray-400" />
              İletişim Bilgileri
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500">E-posta</dt>
                <dd className="text-sm text-gray-900">{visa.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Telefon</dt>
                <dd className="text-sm text-gray-900">{visa.phone}</dd>
              </div>
            </dl>
            {customer && (
              <Link
                href={`/admin/users/${customer.id}`}
                className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Kullanıcı Profiline Git →
              </Link>
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
                    Başvuru Tarihi
                  </p>
                  <p className="text-xs text-gray-500">
                    {visa.createdAt.toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>
              {visa.estimatedCompletion && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Tahmini Tamamlanma
                    </p>
                    <p className="text-xs text-gray-500">
                      {visa.estimatedCompletion.toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                </div>
              )}
              {visa.updatedAt &&
                visa.updatedAt.getTime() !== visa.createdAt.getTime() && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Son Güncelleme
                      </p>
                      <p className="text-xs text-gray-500">
                        {visa.updatedAt.toLocaleString("tr-TR")}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Payment Info */}
          {visa.paymentNote && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                Ödeme Notu
              </h3>
              <p className="text-sm text-gray-700">{visa.paymentNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
