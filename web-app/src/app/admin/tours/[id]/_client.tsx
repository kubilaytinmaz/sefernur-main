"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createTour, getTourById, updateTour } from "@/lib/firebase/admin-domain";
import { TourCategory, TourModel } from "@/types/tour";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const categoryOptions: { value: TourCategory; label: string }[] = [
  { value: "umrah", label: "Umre" },
  { value: "hajj", label: "Hac" },
  { value: "religious", label: "Dini" },
  { value: "cultural", label: "Kültürel" },
  { value: "historical", label: "Tarihi" },
];

const serviceTypeOptions = [
  { value: "with_transport", label: "Ulaşımlı" },
  { value: "without_transport", label: "Ulaşımsız" },
  { value: "flight_included", label: "Uçak Dahil" },
  { value: "custom", label: "Özel" },
];

type FormData = {
  title: string;
  description: string;
  category: string;
  tags: string;
  durationDays: number;
  basePrice: number;
  childPrice: number;
  company: string;
  phone: string;
  email: string;
  whatsapp: string;
  images: string;
  isActive: boolean;
  isPopular: boolean;
  serviceType: string;
  mekkeNights: number;
  medineNights: number;
  airline: string;
  airlineLogo: string;
  flightDepartureFrom: string;
  flightDepartureTo: string;
  flightReturnFrom: string;
  flightReturnTo: string;
  startDate: string;
  endDate: string;
};

const defaultForm: FormData = {
  title: "", description: "", category: "umrah", tags: "",
  durationDays: 7, basePrice: 0, childPrice: 0,
  company: "", phone: "", email: "", whatsapp: "",
  images: "", isActive: true, isPopular: false,
  serviceType: "with_transport", mekkeNights: 0, medineNights: 0,
  airline: "", airlineLogo: "",
  flightDepartureFrom: "", flightDepartureTo: "",
  flightReturnFrom: "", flightReturnTo: "",
  startDate: "", endDate: "",
};

function dateToInput(d?: Date): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

export default function TourDetailPage() {
  const id = useRouteId();
  const router = useRouter();
  const isNew = id === "new";

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const tour = await getTourById(id);
        if (!tour) { router.replace("/admin/tours"); return; }
        setForm({
          title: tour.title,
          description: tour.description || "",
          category: tour.category || "umrah",
          tags: tour.tags?.join(", ") || "",
          durationDays: tour.durationDays,
          basePrice: tour.basePrice,
          childPrice: tour.childPrice || 0,
          company: tour.company || "",
          phone: tour.phone || "",
          email: tour.email || "",
          whatsapp: tour.whatsapp || "",
          images: tour.images.join("\n"),
          isActive: tour.isActive,
          isPopular: tour.isPopular || false,
          serviceType: tour.serviceType || "with_transport",
          mekkeNights: tour.mekkeNights || 0,
          medineNights: tour.medineNights || 0,
          airline: tour.airline || "",
          airlineLogo: tour.airlineLogo || "",
          flightDepartureFrom: tour.flightDepartureFrom || "",
          flightDepartureTo: tour.flightDepartureTo || "",
          flightReturnFrom: tour.flightReturnFrom || "",
          flightReturnTo: tour.flightReturnTo || "",
          startDate: dateToInput(tour.startDate),
          endDate: dateToInput(tour.endDate),
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("Tur adı gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<TourModel, "id" | "createdAt" | "updatedAt"> = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category as TourCategory,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        durationDays: form.durationDays,
        basePrice: form.basePrice,
        childPrice: form.childPrice || undefined,
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
        isActive: form.isActive,
        isPopular: form.isPopular,
        serviceType: form.serviceType as TourModel["serviceType"],
        mekkeNights: form.mekkeNights || undefined,
        medineNights: form.medineNights || undefined,
        airline: form.airline.trim() || undefined,
        airlineLogo: form.airlineLogo.trim() || undefined,
        flightDepartureFrom: form.flightDepartureFrom.trim() || undefined,
        flightDepartureTo: form.flightDepartureTo.trim() || undefined,
        flightReturnFrom: form.flightReturnFrom.trim() || undefined,
        flightReturnTo: form.flightReturnTo.trim() || undefined,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
      };
      if (isNew) {
        await createTour(data);
      } else {
        await updateTour(id, data);
      }
      router.push("/admin/tours");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/tours" className="rounded-lg p-2 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni Tur" : "Tur Düzenle"}</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Tur Adı *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Servis Tipi</label>
            <select value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)} className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              {serviceTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Süre (gün)</label>
            <input type="number" value={form.durationDays} onChange={(e) => set("durationDays", Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Etiketler (virgülle ayırın)</label>
            <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="umre, mekke, medine" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Fiyatlandırma & Tarihler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Yetişkin Fiyatı (₺)</label>
            <input type="number" value={form.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Çocuk Fiyatı (₺)</label>
            <input type="number" value={form.childPrice} onChange={(e) => set("childPrice", Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mekke Geceleri</label>
            <input type="number" value={form.mekkeNights} onChange={(e) => set("mekkeNights", Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Medine Geceleri</label>
            <input type="number" value={form.medineNights} onChange={(e) => set("medineNights", Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>
      </div>

      {/* Flight Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Uçuş Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Havayolu</label>
            <input type="text" value={form.airline} onChange={(e) => set("airline", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Havayolu Logo URL</label>
            <input type="text" value={form.airlineLogo} onChange={(e) => set("airlineLogo", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gidiş Kalkış</label>
            <input type="text" value={form.flightDepartureFrom} onChange={(e) => set("flightDepartureFrom", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="İstanbul" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gidiş Varış</label>
            <input type="text" value={form.flightDepartureTo} onChange={(e) => set("flightDepartureTo", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Cidde" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dönüş Kalkış</label>
            <input type="text" value={form.flightReturnFrom} onChange={(e) => set("flightReturnFrom", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Medine" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dönüş Varış</label>
            <input type="text" value={form.flightReturnTo} onChange={(e) => set("flightReturnTo", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="İstanbul" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">İletişim & Firma</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Firma</label>
            <input type="text" value={form.company} onChange={(e) => set("company", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
            <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">E-posta</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
            <input type="text" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>
      </div>

      {/* Images & Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Görseller & Ayarlar</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL'leri (her satıra bir URL)</label>
            <textarea rows={4} value={form.images} onChange={(e) => set("images", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => set("isPopular", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm font-medium text-gray-700">Popüler</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
