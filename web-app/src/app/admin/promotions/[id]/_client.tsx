"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createPromotion, getPromotionById, updatePromotion } from "@/lib/firebase/admin-domain";
import { PromotionModel, PromotionTargetType, promotionTargetLabels } from "@/types/promotion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FormData = {
  title: string;
  subtitle: string;
  description: string;
  targetType: string;
  discountPercent: number;
  discountCode: string;
  gradientStartColor: string;
  gradientEndColor: string;
  badgeText: string;
  badgeColor: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  priority: number;
};

const defaultForm: FormData = {
  title: "", subtitle: "", description: "",
  targetType: "tour", discountPercent: 0, discountCode: "",
  gradientStartColor: "#10b981", gradientEndColor: "#059669",
  badgeText: "", badgeColor: "#ffffff",
  isActive: true, startDate: "", endDate: "", priority: 0,
};

export default function PromotionDetailPage() {
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
        const p = await getPromotionById(id);
        if (!p) { router.replace("/admin/promotions"); return; }
        setForm({
          title: p.title, subtitle: p.subtitle || "", description: p.description || "",
          targetType: p.targetType, discountPercent: p.discountPercent,
          discountCode: p.discountCode || "",
          gradientStartColor: p.gradientStartColor || "#10b981",
          gradientEndColor: p.gradientEndColor || "#059669",
          badgeText: p.badgeText || "", badgeColor: p.badgeColor || "#ffffff",
          isActive: p.isActive,
          startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : "",
          endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : "",
          priority: p.priority || 0,
        });
      } finally { setLoading(false); }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!form.title.trim()) { alert("Başlık gereklidir"); return; }
    setSaving(true);
    try {
      const data: Omit<PromotionModel, "id" | "createdAt" | "updatedAt"> = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim() || undefined,
        targetType: form.targetType as PromotionTargetType,
        discountPercent: form.discountPercent,
        discountCode: form.discountCode.trim() || undefined,
        gradientStartColor: form.gradientStartColor,
        gradientEndColor: form.gradientEndColor,
        badgeText: form.badgeText.trim() || undefined,
        badgeColor: form.badgeColor || undefined,
        isActive: form.isActive,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        priority: form.priority,
      };
      if (isNew) await createPromotion(data);
      else await updatePromotion(id, data);
      router.push("/admin/promotions");
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
          <Link href="/admin/promotions" className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Yeni İndirim" : "İndirim Düzenle"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">İndirim Bilgileri</h2>
        <div className="grid gap-4">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Başlık *</label><input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Alt Başlık</label><input type="text" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Açıklama</label><textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Hedef Tip</label>
              <select value={form.targetType} onChange={(e) => set("targetType", e.target.value)} className={selectCls}>
                {Object.entries(promotionTargetLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">İndirim (%)</label><input type="number" min={0} max={100} value={form.discountPercent} onChange={(e) => set("discountPercent", Number(e.target.value))} className={inputCls} /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">İndirim Kodu</label><input type="text" value={form.discountCode} onChange={(e) => set("discountCode", e.target.value)} className={inputCls} placeholder="UMRE2024" /></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Görünüm</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gradient Başlangıç</label>
            <div className="flex gap-2">
              <input type="color" value={form.gradientStartColor} onChange={(e) => set("gradientStartColor", e.target.value)} className="h-10 w-12 cursor-pointer rounded border" />
              <input type="text" value={form.gradientStartColor} onChange={(e) => set("gradientStartColor", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gradient Bitiş</label>
            <div className="flex gap-2">
              <input type="color" value={form.gradientEndColor} onChange={(e) => set("gradientEndColor", e.target.value)} className="h-10 w-12 cursor-pointer rounded border" />
              <input type="text" value={form.gradientEndColor} onChange={(e) => set("gradientEndColor", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Badge Metni</label><input type="text" value={form.badgeText} onChange={(e) => set("badgeText", e.target.value)} className={inputCls} placeholder="Yeni" /></div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Badge Rengi</label>
            <div className="flex gap-2">
              <input type="color" value={form.badgeColor} onChange={(e) => set("badgeColor", e.target.value)} className="h-10 w-12 cursor-pointer rounded border" />
              <input type="text" value={form.badgeColor} onChange={(e) => set("badgeColor", e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm text-gray-500">Önizleme:</p>
          <div className="flex h-20 items-center justify-center rounded-xl px-6" style={{ background: `linear-gradient(135deg, ${form.gradientStartColor}, ${form.gradientEndColor})` }}>
            <span className="text-lg font-bold text-white">{form.title || "İndirim Başlığı"}</span>
            {form.badgeText && (
              <span className="ml-3 rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: form.badgeColor, color: form.gradientStartColor }}>{form.badgeText}</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Tarih & Öncelik</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Başlangıç Tarihi</label><input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Bitiş Tarihi</label><input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Öncelik</label><input type="number" min={0} value={form.priority} onChange={(e) => set("priority", Number(e.target.value))} className={inputCls} /></div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Ayarlar</h2>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" /><span className="text-sm font-medium text-gray-700">Aktif</span></label>
      </div>
    </div>
  );
}
