"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createTransfer, getTransferById, updateTransfer } from "@/lib/firebase/admin-domain";
import { amenityLabels, TransferModel, VehicleAmenity, VehicleType, vehicleTypeLabels } from "@/types/transfer";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  fromCity: string; fromCountry: string; fromState: string; fromAddress: string;
  toCity: string; toCountry: string; toState: string; toAddress: string;
  vehicleType: string;
  vehicleName: string;
  capacity: number;
  luggageCapacity: number;
  childSeatCount: number;
  amenities: string[];
  basePrice: number;
  durationMinutes: number;
  company: string;
  phone: string;
  email: string;
  whatsapp: string;
  images: string;
  isActive: boolean;
  isPopular: boolean;
};

const defaultForm: FormData = {
  fromCity: "", fromCountry: "", fromState: "", fromAddress: "",
  toCity: "", toCountry: "", toState: "", toAddress: "",
  vehicleType: "sedan", vehicleName: "", capacity: 4,
  luggageCapacity: 2, childSeatCount: 0, amenities: [],
  basePrice: 0, durationMinutes: 60,
  company: "", phone: "", email: "", whatsapp: "",
  images: "", isActive: true, isPopular: false,
};

const allAmenities = Object.keys(amenityLabels) as VehicleAmenity[];

export default function TransferDetailPage() {
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
        const t = await getTransferById(id);
        if (!t) { router.replace("/admin/transfers"); return; }
        setForm({
          fromCity: t.fromAddress.city || "", fromCountry: t.fromAddress.country || "",
          fromState: t.fromAddress.state || "", fromAddress: t.fromAddress.address || "",
          toCity: t.toAddress.city || "", toCountry: t.toAddress.country || "",
          toState: t.toAddress.state || "", toAddress: t.toAddress.address || "",
          vehicleType: t.vehicleType, vehicleName: t.vehicleName,
          capacity: t.capacity, luggageCapacity: t.luggageCapacity,
          childSeatCount: t.childSeatCount, amenities: [...t.amenities],
          basePrice: t.basePrice, durationMinutes: t.durationMinutes,
          company: t.company, phone: t.phone || "", email: t.email || "",
          whatsapp: t.whatsapp || "", images: t.images.join("\n"),
          isActive: t.isActive, isPopular: t.isPopular,
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.vehicleName.trim()) { alert("Araç adı gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<TransferModel, "id" | "createdAt" | "updatedAt"> = {
        fromAddress: { city: form.fromCity, country: form.fromCountry, state: form.fromState, address: form.fromAddress },
        toAddress: { city: form.toCity, country: form.toCountry, state: form.toState, address: form.toAddress },
        vehicleType: form.vehicleType as VehicleType,
        vehicleName: form.vehicleName.trim(),
        capacity: form.capacity,
        luggageCapacity: form.luggageCapacity,
        childSeatCount: form.childSeatCount,
        amenities: form.amenities as VehicleAmenity[],
        basePrice: form.basePrice,
        durationMinutes: form.durationMinutes,
        company: form.company.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        rating: 0, reviewCount: 0,
        images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
        isActive: form.isActive,
        isPopular: form.isPopular,
      };
      if (isNew) {
        await createTransfer(data);
      } else {
        await updateTransfer(id, data);
      }
      router.push("/admin/transfers");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | number | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (a: VehicleAmenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const selectCls = "w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/transfers" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni Transfer" : "Transfer Düzenle"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      {/* From Address */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Kalkış Adresi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Adres</label><input type="text" value={form.fromAddress} onChange={(e) => set("fromAddress", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Şehir</label><input type="text" value={form.fromCity} onChange={(e) => set("fromCity", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Ülke</label><input type="text" value={form.fromCountry} onChange={(e) => set("fromCountry", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      {/* To Address */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Varış Adresi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Adres</label><input type="text" value={form.toAddress} onChange={(e) => set("toAddress", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Şehir</label><input type="text" value={form.toCity} onChange={(e) => set("toCity", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Ülke</label><input type="text" value={form.toCountry} onChange={(e) => set("toCountry", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      {/* Vehicle */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Araç Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Araç Adı *</label><input type="text" value={form.vehicleName} onChange={(e) => set("vehicleName", e.target.value)} className={inputCls} /></div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Araç Tipi</label>
            <select value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} className={selectCls}>
              {Object.entries(vehicleTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Kapasite (kişi)</label><input type="number" value={form.capacity} onChange={(e) => set("capacity", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Bagaj Kapasitesi</label><input type="number" value={form.luggageCapacity} onChange={(e) => set("luggageCapacity", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Çocuk Koltuğu</label><input type="number" value={form.childSeatCount} onChange={(e) => set("childSeatCount", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Fiyat (₺)</label><input type="number" value={form.basePrice} onChange={(e) => set("basePrice", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Süre (dakika)</label><input type="number" value={form.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} className={inputCls} /></div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Olanaklar</label>
          <div className="flex flex-wrap gap-2">
            {allAmenities.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  form.amenities.includes(a)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {amenityLabels[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">İletişim & Firma</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Firma</label><input type="text" value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label><input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">E-posta</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label><input type="text" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      {/* Images & Settings */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Görseller & Ayarlar</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL'leri (her satıra bir URL)</label>
            <textarea rows={4} value={form.images} onChange={(e) => set("images", e.target.value)} className={`${inputCls} font-mono`} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm font-medium text-gray-700">Aktif</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPopular} onChange={(e) => set("isPopular", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm font-medium text-gray-700">Popüler</span></label>
          </div>
        </div>
      </div>
    </div>
  );
}
