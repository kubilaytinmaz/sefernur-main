"use client";

import { StatCard } from "@/components/admin/StatCard";
import {
    getAllRoutePricing,
    getAllVehiclePricing,
    getTransferPricingStats,
    updateRoutePricing,
    updateVehiclePricing,
} from "@/lib/firebase/admin-domain";
import {
    calculateTransferPrice,
    isNightTime,
    ROUTE_FIXED_PRICES,
    VEHICLE_PRICING,
} from "@/lib/transfers/pricing";
import { VehicleType, vehicleTypeLabels } from "@/types/transfer";
import {
    RoutePricingModel,
    VehiclePricingModel,
    vehiclePricingOrder
} from "@/types/transfer-pricing";
import {
    Calculator,
    Car,
    Check,
    Edit3,
    Loader2,
    MapPin,
    Plus,
    RefreshCw,
    Route,
    Save,
    Trash2,
    Users
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ─── Tab Types ─────────────────────────────────────────────────────────────
type TabType = "vehicle" | "route" | "simulator";

// ─── Vehicle Pricing Form Component ────────────────────────────────────────
interface VehiclePricingFormProps {
  vehiclePricing: VehiclePricingModel[];
  onSave: (vehicleType: VehicleType, data: Partial<VehiclePricingModel>) => void;
  onCancel: () => void;
  editingVehicleType?: VehicleType;
}

function VehiclePricingForm({
  vehiclePricing,
  onSave,
  onCancel,
  editingVehicleType,
}: VehiclePricingFormProps) {
  const existing = vehiclePricing.find((v) => v.vehicleType === editingVehicleType);

  const [formData, setFormData] = useState({
    basePrice: existing?.basePrice || VEHICLE_PRICING[editingVehicleType || "sedan"]?.basePrice || 0,
    pricePerKm: existing?.pricePerKm || VEHICLE_PRICING[editingVehicleType || "sedan"]?.pricePerKm || 0,
    nightSurcharge: existing?.nightSurcharge || VEHICLE_PRICING[editingVehicleType || "sedan"]?.nightSurcharge || 0,
    waitingFeePerHour: existing?.waitingFeePerHour || VEHICLE_PRICING[editingVehicleType || "sedan"]?.waitingFeePerHour || 0,
    luggageFee: existing?.luggageFee || VEHICLE_PRICING[editingVehicleType || "sedan"]?.luggageFee || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicleType) {
      onSave(editingVehicleType, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingVehicleType ? vehicleTypeLabels[editingVehicleType] : "Yeni Araç Tipi"}
        </h3>
        <p className="text-sm text-gray-500">
          Araç tipine göre fiyatlandırma ayarları
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Baz Fiyat (TL)
          </label>
          <input
            type="number"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            KM Başı Fiyat (TL)
          </label>
          <input
            type="number"
            value={formData.pricePerKm}
            onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Gece Sürşarjı (TL)
          </label>
          <input
            type="number"
            value={formData.nightSurcharge}
            onChange={(e) => setFormData({ ...formData, nightSurcharge: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
          <p className="mt-1 text-xs text-gray-500">00:00 - 06:00 arası ek ücret</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Bekleme Ücreti / Saat (TL)
          </label>
          <input
            type="number"
            value={formData.waitingFeePerHour}
            onChange={(e) => setFormData({ ...formData, waitingFeePerHour: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Fazla Bagaj Ücreti / Adet (TL)
          </label>
          <input
            type="number"
            value={formData.luggageFee}
            onChange={(e) => setFormData({ ...formData, luggageFee: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Standart bagaj kapasitesi üzeri için</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </form>
  );
}

// ─── Route Pricing Form Component ─────────────────────────────────────────
interface RoutePricingFormProps {
  routePricing?: RoutePricingModel;
  onSave: (data: Omit<RoutePricingModel, "id" | "type" | "updatedAt" | "updatedBy">) => void;
  onCancel: () => void;
}

function RoutePricingForm({ routePricing, onSave, onCancel }: RoutePricingFormProps) {
  const [formData, setFormData] = useState({
    routeId: routePricing?.routeId || "",
    routeName: routePricing?.routeName || "",
    fromCity: routePricing?.fromCity || "",
    toCity: routePricing?.toCity || "",
    distanceKm: routePricing?.distanceKm || 0,
    prices: routePricing?.prices || {
      sedan: 0,
      van: 0,
      coster: 0,
      bus: 0,
      vip: 0,
      jeep: 0,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {routePricing ? "Rota Düzenle" : "Yeni Rota Ekle"}
        </h3>
        <p className="text-sm text-gray-500">Rota bazlı sabit fiyatlandırma</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Rota ID *
          </label>
          <input
            type="text"
            value={formData.routeId}
            onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="jeddah-airport-mecca"
            required
            disabled={!!routePricing}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mesafe (km) *
          </label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Kalkış Şehri *
          </label>
          <input
            type="text"
            value={formData.fromCity}
            onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Jeddah Havalimanı"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Varış Şehri *
          </label>
          <input
            type="text"
            value={formData.toCity}
            onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Mekke"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Rota Adı *
          </label>
          <input
            type="text"
            value={formData.routeName}
            onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Jeddah Havalimanı → Mekke"
            required
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Araç Tipine Göre Fiyatlar</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {vehiclePricingOrder.map((vt) => (
            <div key={vt}>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {vehicleTypeLabels[vt]}
              </label>
              <input
                type="number"
                value={formData.prices[vt] || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    prices: { ...formData.prices, [vt]: Number(e.target.value) },
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                min="0"
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Save className="h-4 w-4" />
          Kaydet
        </button>
      </div>
    </form>
  );
}

// ─── Price Simulator Component ─────────────────────────────────────────────
interface PriceSimulatorProps {
  vehiclePricing: VehiclePricingModel[];
  routePricing: RoutePricingModel[];
}

function PriceSimulator({ vehiclePricing, routePricing }: PriceSimulatorProps) {
  const [formData, setFormData] = useState({
    vehicleType: "sedan" as VehicleType,
    routeId: "",
    distanceKm: 50,
    pickupTime: "09:00",
    waitingHours: 0,
    extraLuggage: 0,
    passengerCount: 1,
  });

  const [result, setResult] = useState<{
    breakdown: string[];
    total: number;
  } | null>(null);

  const handleCalculate = () => {
    const calculation = calculateTransferPrice({
      vehicleType: formData.vehicleType,
      routeId: formData.routeId || undefined,
      distanceKm: formData.distanceKm,
      isNightTime: isNightTime(formData.pickupTime),
      waitingHours: formData.waitingHours,
      extraLuggage: formData.extraLuggage,
      passengerCount: formData.passengerCount,
    });

    setResult({
      breakdown: calculation.breakdown,
      total: calculation.total,
    });
  };

  const selectedRoute = routePricing.find((r) => r.routeId === formData.routeId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Vehicle Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Araç Tipi
          </label>
          <select
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {vehiclePricingOrder.map((vt) => (
              <option key={vt} value={vt}>
                {vehicleTypeLabels[vt]}
              </option>
            ))}
          </select>
        </div>

        {/* Route */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Rota (Opsiyonel)
          </label>
          <select
            value={formData.routeId}
            onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Rota Seçin (Mesafe Bazlı)</option>
            {routePricing.map((r) => (
              <option key={r.routeId} value={r.routeId}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>

        {/* Distance */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Mesafe (km)
          </label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            disabled={!!formData.routeId}
          />
          {selectedRoute && (
            <p className="mt-1 text-xs text-gray-500">
              Rota mesafesi: {selectedRoute.distanceKm} km
            </p>
          )}
        </div>

        {/* Pickup Time */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Alış Saati
          </label>
          <input
            type="time"
            value={formData.pickupTime}
            onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {isNightTime(formData.pickupTime) && (
            <p className="mt-1 text-xs text-amber-600">⚠️ Gece sürşarjı uygulanır</p>
          )}
        </div>

        {/* Waiting Hours */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Bekleme Süresi (saat)
          </label>
          <input
            type="number"
            value={formData.waitingHours}
            onChange={(e) => setFormData({ ...formData, waitingHours: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            step="0.5"
          />
        </div>

        {/* Extra Luggage */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Fazla Bagaj (adet)
          </label>
          <input
            type="number"
            value={formData.extraLuggage}
            onChange={(e) => setFormData({ ...formData, extraLuggage: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
          />
        </div>

        {/* Passenger Count */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Yolcu Sayısı
          </label>
          <input
            type="number"
            value={formData.passengerCount}
            onChange={(e) => setFormData({ ...formData, passengerCount: Number(e.target.value) })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="1"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <Calculator className="h-4 w-4" />
        Hesapla
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Fiyat Dökümü</h3>
          <div className="space-y-2">
            {result.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Toplam</span>
              <span className="text-2xl font-bold text-emerald-600">
                {result.total.toLocaleString("tr-TR")} TL
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function TransferPricingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("vehicle");
  const [vehiclePricing, setVehiclePricing] = useState<VehiclePricingModel[]>([]);
  const [routePricing, setRoutePricing] = useState<RoutePricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | undefined>();
  const [editingRoute, setEditingRoute] = useState<RoutePricingModel | undefined>();
  const [stats, setStats] = useState<{ vehicleTypes: number; routes: number }>({
    vehicleTypes: 0,
    routes: 0,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [vData, rData, statsData] = await Promise.all([
        getAllVehiclePricing(),
        getAllRoutePricing(),
        getTransferPricingStats(),
      ]);
      setVehiclePricing(vData);
      setRoutePricing(rData);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading pricing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleEditVehicle = useCallback((vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setShowVehicleForm(true);
  }, []);

  const handleSaveVehicle = useCallback(
    async (vehicleType: VehicleType, data: Partial<VehiclePricingModel>) => {
      await updateVehiclePricing(vehicleType, data, "admin");
      await load();
      setShowVehicleForm(false);
      setEditingVehicleType(undefined);
    },
    [],
  );

  const handleEditRoute = useCallback((route: RoutePricingModel) => {
    setEditingRoute(route);
    setShowRouteForm(true);
  }, []);

  const handleSaveRoute = useCallback(
    async (data: Omit<RoutePricingModel, "id" | "type" | "updatedAt" | "updatedBy">) => {
      if (editingRoute) {
        await updateRoutePricing(editingRoute.routeId, data, "admin");
      } else {
        // Create new route - would need createRoutePricing function
        console.log("Create new route:", data);
      }
      await load();
      setShowRouteForm(false);
      setEditingRoute(undefined);
    },
    [editingRoute],
  );

  const handleNewRoute = useCallback(() => {
    setEditingRoute(undefined);
    setShowRouteForm(true);
  }, []);

  // ─── Tabs ────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "vehicle" as TabType, label: "Araç Tipi Fiyatlandırma", icon: Car },
    { id: "route" as TabType, label: "Rota Bazlı Fiyatlandırma", icon: Route },
    { id: "simulator" as TabType, label: "Fiyat Simülatörü", icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-7 w-7 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transfer Fiyatlandırma</h1>
            <p className="text-sm text-gray-500">Araç ve rota bazlı fiyatları yönetin</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Araç Tipleri"
          value={stats.vehicleTypes}
          icon={Car}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Rota Sayısı"
          value={stats.routes}
          icon={Route}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Varsayılan Fiyatlar"
          value={Object.keys(VEHICLE_PRICING).length}
          icon={MapPin}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Varsayılan Rotalar"
          value={ROUTE_FIXED_PRICES.length}
          icon={Users}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {/* Vehicle Pricing Tab */}
          {activeTab === "vehicle" && (
            <div className="space-y-4">
              {showVehicleForm ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <VehiclePricingForm
                    vehiclePricing={vehiclePricing}
                    editingVehicleType={editingVehicleType}
                    onSave={handleSaveVehicle}
                    onCancel={() => {
                      setShowVehicleForm(false);
                      setEditingVehicleType(undefined);
                    }}
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Araç Tipi
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Baz Fiyat
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          KM Başı
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Gece Sürşarjı
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Bekleme / Saat
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Bagaj Ücreti
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          İşlem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {vehiclePricingOrder.map((vt) => {
                        const pricing = vehiclePricing.find((v) => v.vehicleType === vt);
                        const defaultPricing = VEHICLE_PRICING[vt];
                        const displayPricing = pricing || defaultPricing;

                        return (
                          <tr key={vt} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                <Car className="mr-2 h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {vehicleTypeLabels[vt]}
                                </span>
                                {pricing && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                    <Check className="mr-0.5 h-3 w-3" />
                                    Özelleştirilmiş
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {displayPricing.basePrice.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {displayPricing.pricePerKm} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {displayPricing.nightSurcharge.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {displayPricing.waitingFeePerHour.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {displayPricing.luggageFee.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                              <button
                                onClick={() => handleEditVehicle(vt)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                                title="Düzenle"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Route Pricing Tab */}
          {activeTab === "route" && (
            <div className="space-y-4">
              {showRouteForm ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <RoutePricingForm
                    routePricing={editingRoute}
                    onSave={handleSaveRoute}
                    onCancel={() => {
                      setShowRouteForm(false);
                      setEditingRoute(undefined);
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={handleNewRoute}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                      Yeni Rota Ekle
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Rota
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Mesafe
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Sedan
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Van
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Coster
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            İşlem
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {routePricing.map((route) => (
                          <tr key={route.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Route className="mr-2 h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{route.routeName}</p>
                                  <p className="text-xs text-gray-500">
                                    {route.fromCity} → {route.toCity}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-3.5 w-3.5 text-gray-400" />
                                {route.distanceKm} km
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {route.prices.sedan.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {route.prices.van.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                              {route.prices.coster.toLocaleString("tr-TR")} TL
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditRoute(route)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                                  title="Düzenle"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Bu rotayı silmek istediğinize emin misiniz?")) {
                                      // Delete route - would need deleteRoutePricing function
                                      console.log("Delete route:", route.id);
                                    }
                                  }}
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                  title="Sil"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Simulator Tab */}
          {activeTab === "simulator" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <PriceSimulator vehiclePricing={vehiclePricing} routePricing={routePricing} />
            </div>
          )}
        </>
      )}
    </div>
  );
}