"use client";

import {
    getSiteSettings,
    updateSiteSettings,
    uploadSiteLogo,
} from "@/lib/firebase/admin-domain";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/types/site-settings";
import {
    Facebook,
    Globe,
    ImagePlus,
    Instagram,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Palette,
    Phone,
    Save,
    Settings,
    Trash2,
    Twitter,
    Youtube,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const tabs = [
  { id: "contact", label: "İletişim", icon: Phone },
  { id: "social", label: "Sosyal Medya", icon: Globe },
  { id: "appearance", label: "Görünüm", icon: Palette },
  { id: "map", label: "Harita & Adres", icon: MapPin },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("contact");

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Settings save error:", err);
      alert("Ayarlar kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-600" />
            Site Ayarları
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            İletişim bilgileri, sosyal medya, logo ve harita ayarlarını yönetin.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✓ Ayarlar başarıyla kaydedildi.
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {activeTab === "contact" && (
          <ContactTab settings={settings} update={update} />
        )}
        {activeTab === "social" && (
          <SocialTab settings={settings} update={update} />
        )}
        {activeTab === "appearance" && (
          <AppearanceTab settings={settings} update={update} />
        )}
        {activeTab === "map" && (
          <MapTab settings={settings} update={update} />
        )}
      </div>
    </div>
  );
}

// ─── Contact Tab ────────────────────────────────────────────────────────
function ContactTab({
  settings,
  update,
}: {
  settings: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">İletişim Bilgileri</h2>
      <p className="text-sm text-gray-500">
        Header, footer ve iletişim sayfasında görünen bilgiler.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Telefon" icon={<Phone className="h-4 w-4" />}>
          <input
            className={inputCls}
            value={settings.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="0850 123 45 67"
          />
        </Field>
        <Field label="WhatsApp" icon={<MessageCircle className="h-4 w-4" />}>
          <input
            className={inputCls}
            value={settings.whatsapp}
            onChange={(e) => update("whatsapp", e.target.value)}
            placeholder="+90 532 123 45 67"
          />
        </Field>
        <Field label="E-posta" icon={<Mail className="h-4 w-4" />}>
          <input
            type="email"
            className={inputCls}
            value={settings.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="info@sefernur.com"
          />
        </Field>
      </div>

      <hr className="border-gray-100" />
      <h3 className="text-base font-medium text-gray-900">Çalışma Saatleri</h3>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Hafta İçi">
          <input
            className={inputCls}
            value={settings.workingHours.weekdays}
            onChange={(e) =>
              update("workingHours", { ...settings.workingHours, weekdays: e.target.value })
            }
            placeholder="09:00 - 18:00"
          />
        </Field>
        <Field label="Cumartesi">
          <input
            className={inputCls}
            value={settings.workingHours.saturday}
            onChange={(e) =>
              update("workingHours", { ...settings.workingHours, saturday: e.target.value })
            }
            placeholder="10:00 - 15:00"
          />
        </Field>
        <Field label="Pazar">
          <input
            className={inputCls}
            value={settings.workingHours.sunday}
            onChange={(e) =>
              update("workingHours", { ...settings.workingHours, sunday: e.target.value })
            }
            placeholder="Kapalı"
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Social Media Tab ───────────────────────────────────────────────────
function SocialTab({
  settings,
  update,
}: {
  settings: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  const s = settings.socialLinks;
  const set = (key: keyof typeof s, value: string) =>
    update("socialLinks", { ...s, [key]: value });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Sosyal Medya Bağlantıları</h2>
      <p className="text-sm text-gray-500">
        Footer&apos;da görünen sosyal medya ikonlarının bağlantıları.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Facebook" icon={<Facebook className="h-4 w-4" />}>
          <input
            className={inputCls}
            value={s.facebook}
            onChange={(e) => set("facebook", e.target.value)}
            placeholder="https://facebook.com/sefernur"
          />
        </Field>
        <Field label="Twitter / X" icon={<Twitter className="h-4 w-4" />}>
          <input
            className={inputCls}
            value={s.twitter}
            onChange={(e) => set("twitter", e.target.value)}
            placeholder="https://twitter.com/sefernur"
          />
        </Field>
        <Field label="Instagram" icon={<Instagram className="h-4 w-4" />}>
          <input
            className={inputCls}
            value={s.instagram}
            onChange={(e) => set("instagram", e.target.value)}
            placeholder="https://instagram.com/sefernur"
          />
        </Field>
        <Field label="YouTube" icon={<Youtube className="h-4 w-4" />}>
          <input
            className={inputCls}
            value={s.youtube}
            onChange={(e) => set("youtube", e.target.value)}
            placeholder="https://youtube.com/@sefernur"
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Appearance Tab ─────────────────────────────────────────────────────
function AppearanceTab({
  settings,
  update,
}: {
  settings: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      alert("Lütfen PNG, JPEG, WebP veya SVG formatında bir görsel seçin.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Dosya boyutu en fazla 2 MB olmalıdır.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadSiteLogo(file);
      update("logoUrl", url);
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Logo yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Görünüm & Marka</h2>
      <p className="text-sm text-gray-500">
        Logo, marka adı ve slogan bilgileri.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Marka Adı">
          <input
            className={inputCls}
            value={settings.brandName}
            onChange={(e) => update("brandName", e.target.value)}
            placeholder="Sefernur"
          />
        </Field>
        <Field label="Alt Başlık">
          <input
            className={inputCls}
            value={settings.brandSubtitle}
            onChange={(e) => update("brandSubtitle", e.target.value)}
            placeholder="Kutsal Topraklara Yolculuk"
          />
        </Field>
        <Field label="Slogan (Header Üst Bar)">
          <input
            className={inputCls}
            value={settings.tagline}
            onChange={(e) => update("tagline", e.target.value)}
            placeholder="Türkiye'nin Güvenilir Umre Platformu"
          />
        </Field>
        <Field label="Copyright Yılı">
          <input
            className={inputCls}
            value={settings.copyrightYear}
            onChange={(e) => update("copyrightYear", e.target.value)}
            placeholder="2026"
          />
        </Field>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
          Logo
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Görsel yükleyerek veya URL girerek logo belirleyebilirsiniz. Boş bırakılırsa varsayılan logo kullanılır.
        </p>

        {settings.logoUrl ? (
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoUrl}
              alt="Logo önizleme"
              className="h-20 w-20 rounded-xl border border-gray-200 object-contain bg-gray-50 p-1"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                {uploading ? "Yükleniyor..." : "Değiştir"}
              </button>
              <button
                type="button"
                onClick={() => update("logoUrl", "")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Kaldır
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full max-w-sm items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-sm text-gray-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
            {uploading ? "Yükleniyor..." : "Logo Yükle"}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* URL fallback */}
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1">veya doğrudan URL girin:</p>
          <input
            className={inputCls}
            value={settings.logoUrl}
            onChange={(e) => update("logoUrl", e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>

      <Field label="Footer Hakkımızda Metni">
        <textarea
          rows={3}
          className={inputCls + " resize-none"}
          value={settings.aboutText}
          onChange={(e) => update("aboutText", e.target.value)}
          placeholder="20+ yıldır Umre ve Hac organizasyonunda güvenilir hizmet sunuyoruz."
        />
      </Field>
    </div>
  );
}

// ─── Map / Address Tab ──────────────────────────────────────────────────
function MapTab({
  settings,
  update,
}: {
  settings: SiteSettings;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Adres & Harita</h2>
      <p className="text-sm text-gray-500">
        İletişim sayfası ve footer&apos;da görünen adres ve harita bilgileri.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Kısa Adres (Footer)">
          <input
            className={inputCls}
            value={settings.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Fatih, İstanbul"
          />
        </Field>
        <Field label="Tam Adres (Satır 1)">
          <input
            className={inputCls}
            value={settings.fullAddress}
            onChange={(e) => update("fullAddress", e.target.value)}
            placeholder="Fatih Mah. Hac Yolu Cad. No:42"
          />
        </Field>
        <Field label="Adres Detay (Satır 2)">
          <input
            className={inputCls}
            value={settings.addressDetail}
            onChange={(e) => update("addressDetail", e.target.value)}
            placeholder="Fatih / İstanbul, Türkiye"
          />
        </Field>
        <Field label="Adres Notu">
          <input
            className={inputCls}
            value={settings.addressNote}
            onChange={(e) => update("addressNote", e.target.value)}
            placeholder="Fatih Camii'nin 200m güneyinde"
          />
        </Field>
      </div>

      <hr className="border-gray-100" />
      <h3 className="text-base font-medium text-gray-900">Harita Koordinatları</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Enlem (Latitude)">
          <input
            type="number"
            step="0.0001"
            className={inputCls}
            value={settings.mapCoordinates.lat}
            onChange={(e) =>
              update("mapCoordinates", {
                ...settings.mapCoordinates,
                lat: parseFloat(e.target.value) || 0,
              })
            }
          />
        </Field>
        <Field label="Boylam (Longitude)">
          <input
            type="number"
            step="0.0001"
            className={inputCls}
            value={settings.mapCoordinates.lng}
            onChange={(e) =>
              update("mapCoordinates", {
                ...settings.mapCoordinates,
                lng: parseFloat(e.target.value) || 0,
              })
            }
          />
        </Field>
      </div>

      {/* Map preview */}
      <div className="rounded-xl overflow-hidden border border-gray-200 h-48">
        <iframe
          title="Harita Önizleme"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${settings.mapCoordinates.lng - 0.008}%2C${settings.mapCoordinates.lat - 0.005}%2C${settings.mapCoordinates.lng + 0.008}%2C${settings.mapCoordinates.lat + 0.005}&layer=mapnik&marker=${settings.mapCoordinates.lat}%2C${settings.mapCoordinates.lng}`}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ─── Shared Field component ─────────────────────────────────────────────
function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
