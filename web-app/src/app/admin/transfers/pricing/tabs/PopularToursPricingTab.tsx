/**
 * PopularToursPricingTab Component
 * Popüler turların fiyatlarını yönetme tab'ı
 */

"use client";

import { Modal } from "@/components/admin/Modal";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatCard } from "@/components/admin/StatCard";
import {
  getAllPopularServices,
  updatePopularService,
} from "@/lib/firebase/admin-domain";
import {
  PopularServiceModel,
  serviceTypeColors,
  serviceTypeLabels,
} from "@/types/popular-service";
import {
  Calculator,
  DollarSign,
  Edit3,
  Loader2,
  Popcorn,
  RefreshCw,
  Save,
  Star
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PopularToursPricingTabProps {
  onRefresh?: () => void;
}

export function PopularToursPricingTab({ onRefresh }: PopularToursPricingTabProps) {
  const [services, setServices] = useState<PopularServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<PopularServiceModel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filtreler
  const [filters, setFilters] = useState({
    search: "",
    type: "all" as "all" | "tour" | "guide" | "transfer",
    sortBy: "order" as "order" | "name" | "price",
  });

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPopularServices();
      setServices(data.filter((s) => s.isPopular).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (error) {
      console.error("Error loading popular services:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Filtreleme mantığı
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        // Search filter
        if (
          filters.search &&
          !service.name.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        // Type filter
        if (filters.type !== "all" && service.type !== filters.type) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting
        switch (filters.sortBy) {
          case "name":
            return a.name.localeCompare(b.name, "tr");
          case "price":
            return a.price.baseAmount - b.price.baseAmount;
          case "order":
          default:
            return (a.order ?? 0) - (b.order ?? 0);
        }
      });
  }, [services, filters]);

  // İstatistikler
  const stats = useMemo(() => {
    if (services.length === 0) return { total: 0, active: 0, avgPrice: 0, maxPrice: 0 };
    return {
      total: services.length,
      active: services.filter((s) => s.isPopular).length,
      avgPrice: Math.round(
        services.reduce((sum, s) => sum + s.price.baseAmount, 0) / services.length
      ),
      maxPrice: Math.max(...services.map((s) => s.price.baseAmount)),
    };
  }, [services]);

  const handleEdit = useCallback((service: PopularServiceModel) => {
    setEditingService(service);
    setShowEditModal(true);
  }, []);

  const handleSave = useCallback(
    async (id: string, updates: Partial<PopularServiceModel>) => {
      setSaving(true);
      try {
        await updatePopularService(id, updates);
        await loadServices();
        setShowEditModal(false);
        setEditingService(null);
        onRefresh?.();
      } catch (error) {
        console.error("Error updating service:", error);
      } finally {
        setSaving(false);
      }
    },
    [loadServices, onRefresh]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Turlar"
          value={stats.total}
          icon={Popcorn}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Aktif Turlar"
          value={stats.active}
          icon={Star}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Ortalama Fiyat"
          value={`${stats.avgPrice}₺`}
          icon={Calculator}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="En Pahalı"
          value={`${stats.maxPrice}₺`}
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
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value as typeof filters.type })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all">Tüm Türler</option>
          <option value="tour">Turlar</option>
          <option value="guide">Rehberler</option>
          <option value="transfer">Transferler</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters({ ...filters, sortBy: e.target.value as typeof filters.sortBy })
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="order">Sıralama (Varsayılan)</option>
          <option value="name">İsme Göre</option>
          <option value="price">Fiyata Göre</option>
        </select>

        <button
          onClick={loadServices}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tür
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Süre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Mesafe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredServices.map((service, index) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-xl">{service.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        serviceTypeColors[service.type]
                      }`}
                    >
                      {serviceTypeLabels[service.type]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {service.duration.text}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {service.distance?.text || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-emerald-600">
                      {service.price.display}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleEdit(service)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                      title="Düzenle"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingService && (
        <PopularTourEditModal
          service={editingService}
          onSave={handleSave}
          onClose={() => {
            setShowEditModal(false);
            setEditingService(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

// ─── Edit Modal Component ───────────────────────────────────────────────────

interface PopularTourEditModalProps {
  service: PopularServiceModel;
  onSave: (id: string, updates: Partial<PopularServiceModel>) => void;
  onClose: () => void;
  saving: boolean;
}

function PopularTourEditModal({
  service,
  onSave,
  onClose,
  saving,
}: PopularTourEditModalProps) {
  const [formData, setFormData] = useState({
    price: {
      display: service.price.display,
      baseAmount: service.price.baseAmount,
      type: service.price.type,
    },
    isPopular: service.isPopular,
    order: service.order,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(service.id, formData);
  };

  return (
    <Modal open onClose={onClose} title="Tur Fiyatlandırma Düzenle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Service Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">{service.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.description}</p>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Fiyat (₺)
          </label>
          <input
            type="number"
            value={formData.price.baseAmount}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: {
                  ...formData.price,
                  baseAmount: Number(e.target.value),
                  display: `${Number(e.target.value)}₺`,
                },
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            min="0"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Görüntülenen: {formData.price.display}
          </p>
        </div>

        {/* Popularity */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) =>
                setFormData({ ...formData, isPopular: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">
              Popüler turlar bölümünde göster
            </span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Sıralama:
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              min="1"
              max="100"
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>ℹ️ Bilgi:</strong> Bu fiyat, müsait araçlar sayfasında
            gösterilecektir (araç fiyatı dahil değil).
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
