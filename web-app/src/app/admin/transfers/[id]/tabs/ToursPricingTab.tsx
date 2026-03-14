import { Modal } from "@/components/admin/Modal";
import { Badge } from "@/components/ui/Badge";
import { createPopularService, deletePopularService, getAllPopularServices, updatePopularService } from "@/lib/firebase/admin-domain";
import { emojiCategories, PopularServiceModel, serviceTypeLabels } from "@/types/popular-service";
import { Clock, DollarSign, Edit3, Loader2, MapPin, Plus, Popcorn, Save, Star, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface ToursPricingTabProps {
  transferId: string;
}

// ─── Emoji Picker Component ───────────────────────────────────────────────
interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {emojiCategories.map((category) => (
        <div key={category.name}>
          <p className="mb-1.5 text-xs font-medium text-gray-500">{category.name}</p>
          <div className="flex flex-wrap gap-1">
            {category.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(emoji)}
                className={`h-9 w-9 rounded-lg text-lg transition-colors ${
                  value === emoji
                    ? "bg-emerald-100 ring-2 ring-emerald-500"
                    : "hover:bg-gray-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Service Form Component ───────────────────────────────────────────────
interface ServiceFormProps {
  service?: PopularServiceModel;
  onSave: (data: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

function ServiceForm({ service, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    type: service?.type || "tour" as PopularServiceModel["type"],
    name: service?.name || "",
    description: service?.description || "",
    icon: service?.icon || "🕌",
    durationText: service?.duration.text || "",
    durationHours: service?.duration.hours || 1,
    distanceKm: service?.distance?.km || 0,
    distanceText: service?.distance?.text || "",
    priceDisplay: service?.price.display || "",
    priceBaseAmount: service?.price.baseAmount || 0,
    priceType: service?.price.type || "fixed" as PopularServiceModel["price"]["type"],
    routeFrom: service?.route?.from || "",
    routeTo: service?.route?.to || "",
    routeStops: service?.route?.stops?.join(", ") || "",
    isPopular: service?.isPopular ?? true,
    order: service?.order || 0,
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt"> = {
      type: formData.type,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      duration: {
        text: formData.durationText,
        hours: formData.durationHours,
      },
      distance: formData.distanceKm > 0 ? {
        km: formData.distanceKm,
        text: formData.distanceText,
      } : undefined,
      price: {
        display: formData.priceDisplay,
        baseAmount: formData.priceBaseAmount,
        type: formData.priceType,
      },
      route: formData.routeFrom || formData.routeTo ? {
        from: formData.routeFrom,
        to: formData.routeTo,
        stops: formData.routeStops ? formData.routeStops.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      } : undefined,
      isPopular: formData.isPopular,
      order: formData.order,
    };

    onSave(data);
  };

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Service Type */}
        <div>
          <label className={labelCls}>Hizmet Tipi</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as PopularServiceModel["type"] })}
            className={inputCls}
            required
          >
            <option value="tour">Tur</option>
            <option value="transfer">Transfer</option>
            <option value="guide">Rehber</option>
          </select>
        </div>

        {/* Icon */}
        <div>
          <label className={labelCls}>İkon</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-2xl hover:bg-gray-50"
            >
              {formData.icon}
            </button>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Emoji girin..."
            />
          </div>
        </div>

        {/* Name */}
        <div className="sm:col-span-2">
          <label className={labelCls}>İsim *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputCls}
            placeholder="Mekke Şehir Turu"
            required
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Açıklama *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className={inputCls}
            placeholder="Hizmet açıklaması..."
            required
          />
        </div>
      </div>

      {/* Duration & Distance */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Süre (Metin) *</label>
          <input
            type="text"
            value={formData.durationText}
            onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
            className={inputCls}
            placeholder="4 saat"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Süre (Saat) *</label>
          <input
            type="number"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
            className={inputCls}
            placeholder="4"
            min="0.5"
            step="0.5"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Mesafe (km)</label>
          <input
            type="number"
            value={formData.distanceKm}
            onChange={(e) => setFormData({ ...formData, distanceKm: Number(e.target.value) })}
            className={inputCls}
            placeholder="45"
            min="0"
          />
        </div>
        <div>
          <label className={labelCls}>Mesafe (Metin)</label>
          <input
            type="text"
            value={formData.distanceText}
            onChange={(e) => setFormData({ ...formData, distanceText: e.target.value })}
            className={inputCls}
            placeholder="45 km"
          />
        </div>
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Fiyat Görünüm *</label>
          <input
            type="text"
            value={formData.priceDisplay}
            onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
            className={inputCls}
            placeholder="800₺"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Fiyat (TL) *</label>
          <input
            type="number"
            value={formData.priceBaseAmount}
            onChange={(e) => setFormData({ ...formData, priceBaseAmount: Number(e.target.value) })}
            className={inputCls}
            placeholder="800"
            min="0"
            required
          />
        </div>
        <div>
          <label className={labelCls}>Fiyat Tipi *</label>
          <select
            value={formData.priceType}
            onChange={(e) => setFormData({ ...formData, priceType: e.target.value as PopularServiceModel["price"]["type"] })}
            className={inputCls}
            required
          >
            <option value="fixed">Sabit Fiyat</option>
            <option value="per_person">Kişi Başı</option>
            <option value="per_km">Kilometre Başı</option>
          </select>
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Kalkış Yeri</label>
          <input
            type="text"
            value={formData.routeFrom}
            onChange={(e) => setFormData({ ...formData, routeFrom: e.target.value })}
            className={inputCls}
            placeholder="Mekke Otel"
          />
        </div>
        <div>
          <label className={labelCls}>Varış Yeri</label>
          <input
            type="text"
            value={formData.routeTo}
            onChange={(e) => setFormData({ ...formData, routeTo: e.target.value })}
            className={inputCls}
            placeholder="Mekke Şehir Merkezi"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Ara Duraklar (virgülle ayırın)</label>
          <input
            type="text"
            value={formData.routeStops}
            onChange={(e) => setFormData({ ...formData, routeStops: e.target.value })}
            className={inputCls}
            placeholder="Cebeli Nur, Cebeli Sevr, Mina"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Sıra</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            className={inputCls}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Popüler hizmet olarak işaretle</span>
          </label>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">İkon Seçin</h4>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <EmojiPicker
            value={formData.icon}
            onChange={(emoji) => setFormData({ ...formData, icon: emoji })}
          />
        </div>
      )}

      {/* Actions */}
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

// ─── Main Component ───────────────────────────────────────────────────────
export function ToursPricingTab({ transferId }: ToursPricingTabProps) {
  const [services, setServices] = useState<PopularServiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<PopularServiceModel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const items = await getAllPopularServices();
      setServices(items);
    } catch (err) {
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch = searchTerm === "" || 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || s.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [services, searchTerm, typeFilter]);

  const handleEdit = useCallback((service: PopularServiceModel) => {
    setEditingService(service);
    setShowFormModal(true);
  }, []);

  const handleNew = useCallback(() => {
    setEditingService(null);
    setShowFormModal(true);
  }, []);

  const handleSave = useCallback(async (
    serviceData: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (editingService) {
      await updatePopularService(editingService.id, serviceData);
      setServices((prev) =>
        prev.map((s) => (s.id === editingService.id ? { ...serviceData, id: s.id } : s)),
      );
    } else {
      const newId = await createPopularService(serviceData);
      setServices((prev) => [...prev, { ...serviceData, id: newId }]);
    }
    setShowFormModal(false);
    setEditingService(null);
  }, [editingService]);

  const handleDelete = useCallback(async (service: PopularServiceModel) => {
    if (!confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    await deletePopularService(service.id);
    setServices((prev) => prev.filter((s) => s.id !== service.id));
  }, []);

  const handleTogglePopular = useCallback(async (service: PopularServiceModel) => {
    await updatePopularService(service.id, { isPopular: !service.isPopular });
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, isPopular: !s.isPopular } : s)),
    );
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Popcorn className="h-6 w-6 text-emerald-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Popüler Turlar</h3>
            <p className="text-sm text-gray-500">Transfer sayfasında gösterilen turları yönetin</p>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Yeni Tur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Popcorn className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              <p className="text-xs text-gray-500">Toplam Tur</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.isPopular).length}</p>
              <p className="text-xs text-gray-500">Popüler Turlar</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {services.reduce((sum, s) => sum + s.price.baseAmount, 0).toLocaleString("tr-TR")}₺
              </p>
              <p className="text-xs text-gray-500">Toplam Değer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tur ara..."
          className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all">Tüm Türler</option>
          <option value="tour">Turlar</option>
          <option value="transfer">Transferler</option>
          <option value="guide">Rehberler</option>
        </select>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Popcorn className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-900">Tur bulunamadı</p>
            <p className="text-xs text-gray-500">Yeni tur eklemek için "Yeni Tur" butonuna tıklayın</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-3xl">
                  {service.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900">{service.name}</h4>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {serviceTypeLabels[service.type]}
                        </Badge>
                        {service.isPopular && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                            <Star className="mr-1 h-3 w-3 fill-amber-700" />
                            Popüler
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-1">{service.description}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {service.distance && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{service.distance.text}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{service.duration.text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                      <DollarSign className="h-4 w-4" />
                      <span>{service.price.display}</span>
                    </div>
                    {service.route && (
                      <div className="text-xs text-gray-500">
                        {service.route.from} → {service.route.to}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePopular(service)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.isPopular
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                    }`}
                    title={service.isPopular ? "Popülerlikten kaldır" : "Popüler işaretle"}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                    title="Düzenle"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      <Modal
        open={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingService(null);
        }}
        title={editingService ? "Tur Düzenle" : "Yeni Tur Ekle"}
        maxWidth="xl"
      >
        <ServiceForm
          service={editingService || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowFormModal(false);
            setEditingService(null);
          }}
        />
      </Modal>
    </div>
  );
}
