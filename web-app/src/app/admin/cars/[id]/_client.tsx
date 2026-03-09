"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createCar, getCarById, updateCar } from "@/lib/firebase/admin-domain";
import { CarModel, CarType, FuelType, TransmissionType, carTypeLabels, fuelTypeLabels, transmissionLabels } from "@/types/car";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  brand: string;
  model: string;
  type: string;
  transmission: string;
  fuelType: string;
  seats: number;
  company: string;
  phone: string;
  email: string;
  whatsapp: string;
  dailyPrice: number;
  discountedDailyPrice: number;
  images: string;
  isActive: boolean;
  isPopular: boolean;
  addressCity: string;
  addressCountry: string;
  addressState: string;
  addressAddress: string;
};

const defaultForm: FormData = {
  brand: "", model: "", type: "economy",
  transmission: "automatic", fuelType: "petrol", seats: 5,
  company: "", phone: "", email: "", whatsapp: "",
  dailyPrice: 0, discountedDailyPrice: 0,
  images: "", isActive: true, isPopular: false,
  addressCity: "", addressCountry: "", addressState: "", addressAddress: "",
};

export default function CarDetailPage() {
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
        const car = await getCarById(id);
        if (!car) { router.replace("/admin/cars"); return; }
        setForm({
          brand: car.brand, model: car.model, type: car.type,
          transmission: car.transmission, fuelType: car.fuelType, seats: car.seats,
          company: car.company, phone: car.phone || "", email: car.email || "",
          whatsapp: car.whatsapp || "", dailyPrice: car.dailyPrice,
          discountedDailyPrice: car.discountedDailyPrice || 0,
          images: car.images.join("\n"), isActive: car.isActive, isPopular: car.isPopular,
          addressCity: car.addressModel?.city || "", addressCountry: car.addressModel?.country || "",
          addressState: car.addressModel?.state || "", addressAddress: car.addressModel?.address || "",
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim()) { alert("Marka ve model gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<CarModel, "id" | "createdAt" | "updatedAt"> = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        type: form.type as CarType,
        transmission: form.transmission as TransmissionType,
        fuelType: form.fuelType as FuelType,
        seats: form.seats,
        company: form.company.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        dailyPrice: form.dailyPrice,
        discountedDailyPrice: form.discountedDailyPrice || undefined,
        rating: 0, reviewCount: 0,
        images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
        isActive: form.isActive,
        isPopular: form.isPopular,
        addressModel: (form.addressCity || form.addressAddress) ? {
          city: form.addressCity.trim(),
          country: form.addressCountry.trim(),
          state: form.addressState.trim(),
          address: form.addressAddress.trim(),
        } : undefined,
      };
      if (isNew) {
        await createCar(data);
      } else {
        await updateCar(id, data);
      }
      router.push("/admin/cars");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const selectCls = "w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cars" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni Araç" : "Araç Düzenle"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Araç Bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Marka *</label><input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Model *</label><input type="text" value={form.model} onChange={(e) => set("model", e.target.value)} className={inputCls} /></div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tip</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={selectCls}>
              {Object.entries(carTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Vites</label>
            <select value={form.transmission} onChange={(e) => set("transmission", e.target.value)} className={selectCls}>
              {Object.entries(transmissionLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Yakıt</label>
            <select value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)} className={selectCls}>
              {Object.entries(fuelTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Koltuk Sayısı</label><input type="number" value={form.seats} onChange={(e) => set("seats", Number(e.target.value))} className={inputCls} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Fiyatlandırma</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Günlük Fiyat (₺)</label><input type="number" value={form.dailyPrice} onChange={(e) => set("dailyPrice", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">İndirimli Fiyat (₺)</label><input type="number" value={form.discountedDailyPrice} onChange={(e) => set("discountedDailyPrice", Number(e.target.value))} className={inputCls} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Adres</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Adres</label><input type="text" value={form.addressAddress} onChange={(e) => set("addressAddress", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Şehir</label><input type="text" value={form.addressCity} onChange={(e) => set("addressCity", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Ülke</label><input type="text" value={form.addressCountry} onChange={(e) => set("addressCountry", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">İletişim & Firma</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Firma</label><input type="text" value={form.company} onChange={(e) => set("company", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label><input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">E-posta</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label><input type="text" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Görseller & Ayarlar</h2>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL'leri (her satıra bir URL)</label><textarea rows={4} value={form.images} onChange={(e) => set("images", e.target.value)} className={`${inputCls} font-mono`} /></div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm font-medium text-gray-700">Aktif</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPopular} onChange={(e) => set("isPopular", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm font-medium text-gray-700">Popüler</span></label>
          </div>
        </div>
      </div>
    </div>
  );
}
