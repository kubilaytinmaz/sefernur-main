"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createPlace, getPlaceById, updatePlace } from "@/lib/firebase/admin-domain";
import { PlaceCity, placeCityLabels, PlaceModel } from "@/types/place";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  title: string;
  shortDescription: string;
  longDescription: string;
  city: string;
  locationUrl: string;
  images: string;
  isActive: boolean;
  createdBy: string;
};

const defaultForm: FormData = {
  title: "", shortDescription: "", longDescription: "",
  city: "mekke", locationUrl: "", images: "",
  isActive: true, createdBy: "",
};

export default function PlaceDetailPage() {
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
        const p = await getPlaceById(id);
        if (!p) { router.replace("/admin/places"); return; }
        setForm({
          title: p.title, shortDescription: p.shortDescription || "",
          longDescription: p.longDescription || "", city: p.city,
          locationUrl: p.locationUrl || "", images: p.images.join("\n"),
          isActive: p.isActive, createdBy: p.createdBy || "",
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("Başlık gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<PlaceModel, "id" | "createdAt" | "updatedAt"> = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        longDescription: form.longDescription.trim(),
        city: form.city as PlaceCity,
        locationUrl: form.locationUrl.trim() || undefined,
        images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
        isActive: form.isActive,
        createdBy: form.createdBy.trim(),
      };
      if (isNew) await createPlace(data);
      else await updatePlace(id, data);
      router.push("/admin/places");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const selectCls = "w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/places" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni Mekan" : "Mekan Düzenle"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
        <div className="grid gap-4">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Başlık *</label><input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Kısa Açıklama</label><input type="text" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Detaylı Açıklama</label><textarea rows={5} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} className={inputCls} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Şehir</label>
              <select value={form.city} onChange={(e) => set("city", e.target.value)} className={selectCls}>
                {Object.entries(placeCityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Harita Linki</label><input type="url" value={form.locationUrl} onChange={(e) => set("locationUrl", e.target.value)} className={inputCls} placeholder="https://maps.google.com/..." /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Oluşturan</label><input type="text" value={form.createdBy} onChange={(e) => set("createdBy", e.target.value)} className={inputCls} placeholder="Kullanıcı ID" /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Görseller & Ayarlar</h2>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Görsel URL'leri (her satıra bir URL)</label><textarea rows={4} value={form.images} onChange={(e) => set("images", e.target.value)} className={`${inputCls} font-mono`} /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm font-medium text-gray-700">Aktif</span></label>
        </div>
      </div>
    </div>
  );
}
