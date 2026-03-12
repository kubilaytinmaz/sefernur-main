import { amenityLabels, TransferModel, VehicleAmenity, VehicleType, vehicleTypeLabels } from "@/types/transfer";

interface BasicInfoTabProps {
  transfer: Partial<TransferModel>;
  onUpdate: (updates: Partial<TransferModel>) => void;
}

export function BasicInfoTab({ transfer, onUpdate }: BasicInfoTabProps) {
  const toggleAmenity = (amenity: VehicleAmenity) => {
    const currentAmenities = transfer.amenities || [];
    const updated = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    onUpdate({ amenities: updated });
  };

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const selectCls = "w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="space-y-6">
      {/* Vehicle Information */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Araç Bilgileri</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelCls}>Araç Adı *</label>
            <input
              type="text"
              value={transfer.vehicleName || ""}
              onChange={(e) => onUpdate({ vehicleName: e.target.value })}
              className={inputCls}
              placeholder="Örn: Mercedes Vito"
            />
          </div>
          <div>
            <label className={labelCls}>Araç Tipi</label>
            <select
              value={transfer.vehicleType || "sedan"}
              onChange={(e) => onUpdate({ vehicleType: e.target.value as VehicleType })}
              className={selectCls}
            >
              {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Kapasite (Kişi)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={transfer.capacity || 4}
              onChange={(e) => onUpdate({ capacity: parseInt(e.target.value) || 4 })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Bagaj Kapasitesi</label>
            <input
              type="number"
              min="0"
              max="20"
              value={transfer.luggageCapacity || 2}
              onChange={(e) => onUpdate({ luggageCapacity: parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Çocuk Koltuğu</label>
            <input
              type="number"
              min="0"
              max="5"
              value={transfer.childSeatCount || 0}
              onChange={(e) => onUpdate({ childSeatCount: parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <label className={labelCls}>Araç Özellikleri</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(amenityLabels) as VehicleAmenity[]).map((amenity) => {
              const isSelected = (transfer.amenities || []).includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {amenityLabels[amenity]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Firma Bilgileri</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Firma Adı *</label>
            <input
              type="text"
              value={transfer.company || ""}
              onChange={(e) => onUpdate({ company: e.target.value })}
              className={inputCls}
              placeholder="Örn: ABC Transfer"
            />
          </div>
          <div>
            <label className={labelCls}>Telefon</label>
            <input
              type="tel"
              value={transfer.phone || ""}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              className={inputCls}
              placeholder="+966XXXXXXXXX"
            />
          </div>
          <div>
            <label className={labelCls}>E-posta</label>
            <input
              type="email"
              value={transfer.email || ""}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className={inputCls}
              placeholder="info@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input
              type="tel"
              value={transfer.whatsapp || ""}
              onChange={(e) => onUpdate({ whatsapp: e.target.value })}
              className={inputCls}
              placeholder="+966XXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Status Settings */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Durum Ayarları</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={transfer.isActive ?? true}
              onChange={(e) => onUpdate({ isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Aktif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={transfer.isPopular ?? false}
              onChange={(e) => onUpdate({ isPopular: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">Popüler</span>
          </label>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Açıklama</h3>
        <textarea
          rows={4}
          value={(transfer as any).description || ""}
          onChange={(e) => onUpdate({ description: e.target.value } as any)}
          className={inputCls}
          placeholder="Transfer hakkında açıklama ekleyin..."
        />
      </div>
    </div>
  );
}
