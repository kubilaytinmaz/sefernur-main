"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createHotel, getHotelById, updateHotel } from "@/lib/firebase/admin-domain";
import { HotelCategory, HotelModel } from "@/types/hotel";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const categoryOptions: { value: HotelCategory; label: string }[] = [
  { value: "budget", label: "Bütçe" },
  { value: "standard", label: "Standart" },
  { value: "luxury", label: "Lüks" },
  { value: "boutique", label: "Butik" },
];

type FormData = {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  images: string;
  amenities: string;
  isActive: boolean;
  isPopular: boolean;
  addressCity: string;
  addressCountry: string;
  addressState: string;
  addressAddress: string;
};

const defaultForm: FormData = {
  name: "", description: "", category: "standard",
  phone: "", email: "", website: "", whatsapp: "",
  images: "", amenities: "",
  isActive: true, isPopular: false,
  addressCity: "", addressCountry: "", addressState: "", addressAddress: "",
};

export default function HotelDetailPage() {
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
        const hotel = await getHotelById(id);
        if (!hotel) { router.replace("/admin/hotels"); return; }
        setForm({
          name: hotel.name,
          description: hotel.description || "",
          category: hotel.category || "standard",
          phone: hotel.phone || "",
          email: hotel.email || "",
          website: hotel.website || "",
          whatsapp: hotel.whatsapp || "",
          images: hotel.images.join("\n"),
          amenities: hotel.amenities?.join(", ") || "",
          isActive: hotel.isActive,
          isPopular: hotel.isPopular || false,
          addressCity: hotel.addressModel?.city || "",
          addressCountry: hotel.addressModel?.country || "",
          addressState: hotel.addressModel?.state || "",
          addressAddress: hotel.addressModel?.address || "",
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Otel adı gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<HotelModel, "id" | "createdAt" | "updatedAt"> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category as HotelCategory,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
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
        await createHotel(data);
      } else {
        await updateHotel(id, data);
      }
      router.push("/admin/hotels");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/hotels" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni Otel" : "Otel Düzenle"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Otel Adı *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Olanaklar (virgülle)</label>
            <input type="text" value={form.amenities} onChange={(e) => set("amenities", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="wifi, havuz, spa" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Adres</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Adres</label>
            <input type="text" value={form.addressAddress} onChange={(e) => set("addressAddress", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Şehir</label>
            <input type="text" value={form.addressCity} onChange={(e) => set("addressCity", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ülke</label>
            <input type="text" value={form.addressCountry} onChange={(e) => set("addressCountry", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">İletişim</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label><input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">E-posta</label><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Website</label><input type="text" value={form.website} onChange={(e) => set("website", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label><input type="text" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Görseller & Ayarlar</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL'leri (her satıra bir URL)</label>
            <textarea rows={4} value={form.images} onChange={(e) => set("images", e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
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
