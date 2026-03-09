"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createGuide, getGuideById, updateGuide } from "@/lib/firebase/admin-domain";
import { GuideModel, languageLabels, specialtyLabels } from "@/types/guide";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  name: string;
  bio: string;
  specialties: string[];
  languages: string[];
  certifications: string;
  yearsExperience: number;
  dailyRate: number;
  company: string;
  phone: string;
  email: string;
  whatsapp: string;
  city: string;
  images: string;
  isActive: boolean;
  isPopular: boolean;
};

const defaultForm: FormData = {
  name: "", bio: "", specialties: [], languages: [], certifications: "",
  yearsExperience: 0, dailyRate: 0, company: "", phone: "", email: "",
  whatsapp: "", city: "", images: "", isActive: true, isPopular: false,
};

const allSpecialties = Object.keys(specialtyLabels);
const allLanguages = Object.keys(languageLabels);

export default function GuideDetailPage() {
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
        const g = await getGuideById(id);
        if (!g) { router.replace("/admin/guides"); return; }
        setForm({
          name: g.name, bio: g.bio || "", specialties: g.specialties,
          languages: g.languages, certifications: (g.certifications || []).join(", "),
          yearsExperience: g.yearsExperience || 0, dailyRate: g.dailyRate,
          company: g.company || "", phone: g.phone || "", email: g.email || "",
          whatsapp: g.whatsapp || "", city: g.city || "",
          images: g.images.join("\n"), isActive: g.isActive, isPopular: g.isPopular,
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.name.trim()) { alert("Rehber adı gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<GuideModel, "id" | "createdAt" | "updatedAt"> = {
        name: form.name.trim(),
        bio: form.bio.trim(),
        specialties: form.specialties,
        languages: form.languages,
        certifications: form.certifications.split(",").map((c) => c.trim()).filter(Boolean),
        yearsExperience: form.yearsExperience,
        dailyRate: form.dailyRate,
        rating: 0, reviewCount: 0,
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        city: form.city.trim(),
        images: form.images.split("\n").map((u) => u.trim()).filter(Boolean),
        serviceAddresses: [],
        isActive: form.isActive,
        isPopular: form.isPopular,
      };
      if (isNew) await createGuide(data);
      else await updateGuide(id, data);
      router.push("/admin/guides");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally { setSaving(false); }
  };

  const set = (key: keyof FormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArrayItem = (key: "specialties" | "languages", item: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(item) ? prev[key].filter((x) => x !== item) : [...prev[key], item],
    }));

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/guides" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni Rehber" : "Rehber Düzenle"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Ad Soyad *</label><input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Şehir</label><input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Biyografi</label><textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Deneyim (Yıl)</label><input type="number" value={form.yearsExperience} onChange={(e) => set("yearsExperience", Number(e.target.value))} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Günlük Ücret (₺)</label><input type="number" value={form.dailyRate} onChange={(e) => set("dailyRate", Number(e.target.value))} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Sertifikalar (virgülle ayırın)</label><input type="text" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Uzmanlık Alanları</h2>
        <div className="flex flex-wrap gap-2">
          {allSpecialties.map((s) => (
            <button key={s} onClick={() => toggleArrayItem("specialties", s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.specialties.includes(s) ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {specialtyLabels[s as keyof typeof specialtyLabels]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Diller</h2>
        <div className="flex flex-wrap gap-2">
          {allLanguages.map((l) => (
            <button key={l} onClick={() => toggleArrayItem("languages", l)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${form.languages.includes(l) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {languageLabels[l as keyof typeof languageLabels]}
            </button>
          ))}
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
