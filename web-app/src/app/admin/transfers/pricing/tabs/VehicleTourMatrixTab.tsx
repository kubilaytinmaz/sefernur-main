/**
 * VehicleTourMatrixTab Component
 * Araç-Tur fiyatlandırma matrisini yönetme tab'ı
 */

"use client";

import { Modal } from "@/components/admin/Modal";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import {
  getAllPopularServices,
  getAllVehiclePricing,
  updateVehiclePricing,
} from "@/lib/firebase/admin-domain";
import { PopularServiceModel } from "@/types/popular-service";
import { VehicleType, vehicleTypeLabels } from "@/types/transfer";
import {
  VehiclePricingModel,
  vehiclePricingOrder,
} from "@/types/transfer-pricing";
import {
  Car,
  DollarSign,
  Edit3,
  Grid3x3,
  Loader2,
  RefreshCw,
  Save,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface VehicleTourMatrixTabProps {
  onRefresh?: () => void;
}

interface VehicleTourPrice {
  vehicleType: VehicleType;
  tourId: string;
  price: number;
}

export function VehicleTourMatrixTab({ onRefresh }: VehicleTourMatrixTabProps) {
  const [services, setServices] = useState<PopularServiceModel[]>([]);
  const [vehiclePricing, setVehiclePricing] = useState<VehiclePricingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    vehicleType: VehicleType;
    tourId: string;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filtreler
  const [filters, setFilters] = useState({
    search: "",
    vehicleType: "all" as "all" | VehicleType,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [servicesData, pricingData] = await Promise.all([
        getAllPopularServices(),
        getAllVehiclePricing(),
      ]);
      setServices(servicesData.filter((s) => s.isPopular && s.type === "tour").sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setVehiclePricing(pricingData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtreleme
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (
        filters.search &&
        !service.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [services, filters]);

  const filteredVehicleTypes = useMemo(() => {
    if (filters.vehicleType === "all") {
      return vehiclePricingOrder;
    }
    return [filters.vehicleType];
  }, [filters.vehicleType]);

  // Belirli bir araç tipi ve tur için fiyat al
  const getTourPriceForVehicle = useCallback(
    (vehicleType: VehicleType, tourId: string): number => {
      const pricing = vehiclePricing.find((p) => p.vehicleType === vehicleType);
      if (pricing?.tourPrices?.[tourId] !== undefined) {
        return pricing.tourPrices[tourId];
      }
      
      // Varsayılan: Turun kendi base fiyatı
      const service = services.find((s) => s.id === tourId);
      return service?.price.baseAmount || 0;
    },
    [vehiclePricing, services]
  );

  // İstatistikler
  const stats = useMemo(() => {
    const totalCells = vehiclePricingOrder.length * services.length;
    const customizedCells = vehiclePricing.reduce((count, pricing) => {
      return count + (pricing.tourPrices ? Object.keys(pricing.tourPrices).length : 0);
    }, 0);

    const allPrices = vehiclePricingOrder.flatMap((vt) =>
      services.map((service) => getTourPriceForVehicle(vt, service.id))
    );
    const avgPrice = allPrices.length > 0
      ? Math.round(allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length)
      : 0;

    return {
      totalCells,
      customizedCells,
      customizationRate: totalCells > 0 ? Math.round((customizedCells / totalCells) * 100) : 0,
      avgPrice,
    };
  }, [vehiclePricing, services, getTourPriceForVehicle]);

  const handleEditCell = useCallback((vehicleType: VehicleType, tourId: string) => {
    setEditingCell({ vehicleType, tourId });
    setShowEditModal(true);
  }, []);

  const handleSaveCell = useCallback(
    async (vehicleType: VehicleType, tourId: string, price: number) => {
      setSaving(true);
      try {
        const existing = vehiclePricing.find((p) => p.vehicleType === vehicleType);
        const tourPrices = { ...(existing?.tourPrices || {}), [tourId]: price };
        
        await updateVehiclePricing(vehicleType, { tourPrices }, "admin");
        await loadData();
        setShowEditModal(false);
        setEditingCell(null);
        onRefresh?.();
      } catch (error) {
        console.error("Error updating price:", error);
      } finally {
        setSaving(false);
      }
    },
    [vehiclePricing, loadData, onRefresh]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Hücre"
          value={stats.totalCells}
          icon={Grid3x3}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Özelleştirilmiş"
          value={stats.customizedCells}
          icon={Edit3}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Özelleştirme Oranı"
          value={`%${stats.customizationRate}`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Ortalama Fiyat"
          value={`${stats.avgPrice}₺`}
          icon={DollarSign}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            value={filters.search}
            onChange={(value) => setFilters({ ...filters, search: value })}
            placeholder="Tur ara..."
          />
        </div>

        <select
          value={filters.vehicleType}
          onChange={(e) =>
            setFilters({ ...filters, vehicleType: e.target.value as typeof filters.vehicleType })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all">Tüm Araçlar</option>
          {vehiclePricingOrder.map((vt) => (
            <option key={vt} value={vt}>
              {vehicleTypeLabels[vt]}
            </option>
          ))}
        </select>

        <button
          onClick={loadData}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Matrix Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tur / Araç
                </th>
                {filteredVehicleTypes.map((vt) => (
                  <th
                    key={vt}
                    className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Car className="h-4 w-4" />
                      <span>{vehicleTypeLabels[vt]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{service.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Baz: {service.price.display}
                        </p>
                      </div>
                    </div>
                  </td>
                  {filteredVehicleTypes.map((vt) => {
                    const price = getTourPriceForVehicle(vt, service.id);
                    const pricing = vehiclePricing.find((p) => p.vehicleType === vt);
                    const isCustomized = pricing?.tourPrices?.[service.id] !== undefined;

                    return (
                      <td
                        key={vt}
                        className="px-6 py-4 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isCustomized ? "text-emerald-600" : "text-gray-700"
                            }`}
                          >
                            {price}₺
                          </span>
                          {isCustomized && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Özel
                            </span>
                          )}
                          <button
                            onClick={() => handleEditCell(vt, service.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                            title="Düzenle"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">
          <strong>ℹ️ Bilgi:</strong> Bu matris, her araç tipi için tur fiyatlarını gösterir. 
          Özelleştirilmemiş hücreler turun baz fiyatını kullanır. Hücreye tıklayarak özel fiyat belirleyebilirsiniz.
        </p>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingCell && (
        <VehicleTourPriceEditModal
          vehicleType={editingCell.vehicleType}
          service={services.find((s) => s.id === editingCell.tourId)!}
          currentPrice={getTourPriceForVehicle(editingCell.vehicleType, editingCell.tourId)}
          onSave={handleSaveCell}
          onClose={() => {
            setShowEditModal(false);
            setEditingCell(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ─── Edit Modal Component ───────────────────────────────────────────────────

interface VehicleTourPriceEditModalProps {
  vehicleType: VehicleType;
  service: PopularServiceModel;
  currentPrice: number;
  onSave: (vehicleType: VehicleType, tourId: string, price: number) => void;
  onClose: () => void;
  saving: boolean;
}

function VehicleTourPriceEditModal({
  vehicleType,
  service,
  currentPrice,
  onSave,
  onClose,
  saving,
}: VehicleTourPriceEditModalProps) {
  const [price, setPrice] = useState(currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(vehicleType, service.id, price);
  };

  return (
    <Modal open onClose={onClose} title="Araç-Tur Fiyatı Düzenle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle & Service Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Car className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">Araç Tipi</p>
              <p className="font-semibold text-gray-900">
                {vehicleTypeLabels[vehicleType]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
            <span className="text-2xl">{service.icon}</span>
            <div>
              <p className="text-xs text-emerald-600">Tur</p>
              <p className="font-semibold text-gray-900 text-sm">
                {service.name}
              </p>
            </div>
          </div>
        </div>

        {/* Current & Base Price Info */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Turun Baz Fiyatı:</span>
            <span className="font-medium text-gray-900">
              {service.price.display}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mevcut Fiyat:</span>
            <span className="font-medium text-emerald-600">
              {currentPrice}₺
            </span>
          </div>
        </div>

        {/* Price Input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Yeni Fiyat (₺)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Bu araç tipi için {service.name} turunda görünecek fiyat
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={saving}
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
