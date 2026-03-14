"use client";

import { useRouteId } from "@/hooks/useRouteId";
import { createTransfer, getTransferById, updateTransfer } from "@/lib/firebase/admin-domain";
import { TransferModel } from "@/types/transfer";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { AvailabilityTab } from "./tabs/AvailabilityTab";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { ImagesTab } from "./tabs/ImagesTab";
import { PricingTab } from "./tabs/PricingTab";
import { ReservationsTab } from "./tabs/ReservationsTab";
import { ReviewsTab } from "./tabs/ReviewsTab";
import { RouteTab } from "./tabs/RouteTab";
import { ToursPricingTab } from "./tabs/ToursPricingTab";

type TabId = "basic" | "route" | "pricing" | "tours-pricing" | "availability" | "images" | "reviews" | "reservations" | "analytics";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "basic", label: "Temel Bilgiler", icon: "📋" },
  { id: "route", label: "Güzergah", icon: "🗺️" },
  { id: "pricing", label: "Fiyatlandırma", icon: "💰" },
  { id: "tours-pricing", label: "Tur Fiyatlandırması", icon: "🎫" },
  { id: "availability", label: "Müsaitlik", icon: "📅" },
  { id: "images", label: "Görseller", icon: "🖼️" },
  { id: "reviews", label: "Değerlendirmeler", icon: "⭐" },
  { id: "reservations", label: "Rezervasyonlar", icon: "📝" },
  { id: "analytics", label: "Analitikler", icon: "📊" },
];

export default function TransferDetailPage() {
  const id = useRouteId(2); // /admin/transfers/[id] → index 2
  const router = useRouter();
  const isNew = id === "new";

  const [transfer, setTransfer] = useState<Partial<TransferModel> | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isNew) {
      setTransfer({
        vehicleType: "sedan",
        vehicleName: "",
        capacity: 4,
        luggageCapacity: 2,
        childSeatCount: 0,
        amenities: [],
        basePrice: 0,
        durationMinutes: 60,
        company: "",
        rating: 0,
        reviewCount: 0,
        images: [],
        isActive: true,
        isPopular: false,
        fromAddress: { address: "", city: "", country: "" },
        toAddress: { address: "", city: "", country: "" },
      });
      return;
    }

    (async () => {
      try {
        const t = await getTransferById(id);
        if (!t) {
          router.replace("/admin/transfers");
          return;
        }
        setTransfer(t);
      } catch (error) {
        console.error("Error fetching transfer:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew, router]);

  const handleSave = async () => {
    if (!transfer || !transfer.vehicleName?.trim()) {
      alert("Araç adı gereklidir");
      return;
    }

    setSaving(true);
    try {
      const data: Omit<TransferModel, "id" | "createdAt" | "updatedAt"> = {
        fromAddress: transfer.fromAddress || { address: "", city: "", country: "" },
        toAddress: transfer.toAddress || { address: "", city: "", country: "" },
        vehicleType: transfer.vehicleType || "sedan",
        vehicleName: transfer.vehicleName.trim(),
        capacity: transfer.capacity || 4,
        luggageCapacity: transfer.luggageCapacity || 2,
        childSeatCount: transfer.childSeatCount || 0,
        amenities: transfer.amenities || [],
        basePrice: transfer.basePrice || 0,
        durationMinutes: transfer.durationMinutes || 60,
        company: transfer.company?.trim() || "",
        phone: transfer.phone?.trim() || undefined,
        email: transfer.email?.trim() || undefined,
        whatsapp: transfer.whatsapp?.trim() || undefined,
        rating: transfer.rating || 0,
        reviewCount: transfer.reviewCount || 0,
        images: transfer.images || [],
        availability: transfer.availability,
        isActive: transfer.isActive ?? true,
        isPopular: transfer.isPopular ?? false,
        favoriteUserIds: transfer.favoriteUserIds,
      };

      if (isNew) {
        await createTransfer(data);
      } else {
        await updateTransfer(id, data);
      }

      setHasChanges(false);
      router.push("/admin/transfers");
    } catch (err) {
      console.error(err);
      alert("Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  };

  const updateTransferData = (updates: Partial<TransferModel>) => {
    setTransfer((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Transfer bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/transfers"
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? "Yeni Transfer" : "Transfer Düzenle"}
            </h1>
            {!isNew && transfer.vehicleName && (
              <p className="text-sm text-gray-500">{transfer.vehicleName}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isNew ? "Oluştur" : "Kaydet"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-b-xl border border-t-0 border-gray-200 bg-white p-6">
        {activeTab === "basic" && (
          <BasicInfoTab transfer={transfer} onUpdate={updateTransferData} />
        )}
        {activeTab === "route" && (
          <RouteTab transfer={transfer} onUpdate={updateTransferData} />
        )}
        {activeTab === "pricing" && (
          <PricingTab transfer={transfer} onUpdate={updateTransferData} />
        )}
        {activeTab === "tours-pricing" && (
          <ToursPricingTab transferId={id} />
        )}
        {activeTab === "availability" && (
          <AvailabilityTab transfer={transfer} onUpdate={updateTransferData} />
        )}
        {activeTab === "images" && (
          <ImagesTab transfer={transfer} onUpdate={updateTransferData} />
        )}
        {activeTab === "reviews" && !isNew && (
          <ReviewsTab transferId={id} />
        )}
        {activeTab === "reservations" && !isNew && (
          <ReservationsTab transferId={id} />
        )}
        {activeTab === "analytics" && !isNew && (
          <AnalyticsTab transferId={id} />
        )}
        {isNew && (activeTab === "reviews" || activeTab === "reservations" || activeTab === "analytics") && (
          <div className="py-12 text-center">
            <p className="text-gray-500">Bu sekme yeni transfer için henüz kullanılamaz</p>
            <p className="text-sm text-gray-400 mt-1">Önce transferi oluşturun</p>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-medium text-amber-800">
            Kaydedilmemiş değişiklikler var
          </p>
        </div>
      )}
    </div>
  );
}
