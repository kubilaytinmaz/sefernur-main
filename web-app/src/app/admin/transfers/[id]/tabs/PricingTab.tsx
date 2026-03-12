import { TransferModel, VehicleType, vehicleTypeLabels } from "@/types/transfer";
import { Calculator, Clock, Luggage, Moon } from "lucide-react";
import { useState } from "react";

interface PricingTabProps {
  transfer: Partial<TransferModel>;
  onUpdate: (updates: Partial<TransferModel>) => void;
}

// Araç tipine göre önerilen fiyat aralıkları
const VEHICLE_PRICE_SUGGESTIONS: Record<VehicleType, { min: number; max: number; suggested: number }> = {
  sedan: { min: 200, max: 1500, suggested: 500 },
  van: { min: 400, max: 3000, suggested: 1000 },
  coster: { min: 800, max: 5000, suggested: 2000 },
  bus: { min: 1500, max: 8000, suggested: 3500 },
  vip: { min: 500, max: 4000, suggested: 1200 },
  jeep: { min: 300, max: 2000, suggested: 700 },
};

export function PricingTab({ transfer, onUpdate }: PricingTabProps) {
  const [simulatorValues, setSimulatorValues] = useState({
    passengerCount: transfer.capacity || 4,
    luggageCount: transfer.luggageCapacity || 2,
    pickupHour: 10,
    waitingHours: 0,
    extraLuggage: 0,
  });

  const vehicleType = (transfer.vehicleType || "sedan") as VehicleType;
  const suggestion = VEHICLE_PRICE_SUGGESTIONS[vehicleType];

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";

  // Fiyat hesaplama simülatörü
  const calculatePrice = () => {
    let price = transfer.basePrice || 0;
    const nightSurcharge = (transfer as any).nightSurcharge || 0;
    const waitingFee = (transfer as any).waitingFeePerHour || 0;
    const luggageFee = (transfer as any).luggageFee || 0;

    // Gece sürşarjı (22:00 - 06:00)
    if (simulatorValues.pickupHour >= 22 || simulatorValues.pickupHour < 6) {
      price += nightSurcharge;
    }

    // Bekleme ücreti
    if (simulatorValues.waitingHours > 0) {
      price += simulatorValues.waitingHours * waitingFee;
    }

    // Fazla bagaj ücreti
    if (simulatorValues.extraLuggage > 0) {
      price += simulatorValues.extraLuggage * luggageFee;
    }

    return price;
  };

  const isNightTime = simulatorValues.pickupHour >= 22 || simulatorValues.pickupHour < 6;

  return (
    <div className="space-y-6">
      {/* Base Price */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Temel Fiyat</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Baz Fiyat (TL) *</label>
            <input
              type="number"
              min="0"
              value={transfer.basePrice || 0}
              onChange={(e) => onUpdate({ basePrice: parseFloat(e.target.value) || 0 })}
              className={inputCls}
            />
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">
              {vehicleTypeLabels[vehicleType]} Fiyat Önerisi
            </p>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <p className="text-xs text-emerald-600">Minimum</p>
                <p className="text-lg font-bold text-emerald-700">₺{suggestion.min}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Önerilen</p>
                <p className="text-lg font-bold text-emerald-700">₺{suggestion.suggested}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Maksimum</p>
                <p className="text-lg font-bold text-emerald-700">₺{suggestion.max}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ basePrice: suggestion.suggested })}
              className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Önerilen fiyatı uygula
            </button>
          </div>
        </div>
      </div>

      {/* Surcharges */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Ek Ücretler</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                Gece Sürşarjı (TL)
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={(transfer as any).nightSurcharge || 0}
              onChange={(e) => onUpdate({ nightSurcharge: parseFloat(e.target.value) || 0 } as any)}
              className={inputCls}
              placeholder="22:00 - 06:00 arası ek ücret"
            />
            <p className="mt-1 text-xs text-gray-500">22:00 - 06:00 arası uygulanır</p>
          </div>
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Bekleme Ücreti (TL/saat)
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={(transfer as any).waitingFeePerHour || 0}
              onChange={(e) => onUpdate({ waitingFeePerHour: parseFloat(e.target.value) || 0 } as any)}
              className={inputCls}
              placeholder="Saat başı bekleme ücreti"
            />
          </div>
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-2">
                <Luggage className="h-4 w-4 text-orange-500" />
                Fazla Bagaj Ücreti (TL/adet)
              </span>
            </label>
            <input
              type="number"
              min="0"
              value={(transfer as any).luggageFee || 0}
              onChange={(e) => onUpdate({ luggageFee: parseFloat(e.target.value) || 0 } as any)}
              className={inputCls}
              placeholder="Fazla bagaj başına ücret"
            />
          </div>
        </div>
      </div>

      {/* Price Simulator */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Calculator className="h-5 w-5 text-emerald-600" />
          Fiyat Hesaplama Simülatörü
        </h3>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Yolcu Sayısı</label>
              <input
                type="number"
                min="1"
                max={transfer.capacity || 50}
                value={simulatorValues.passengerCount}
                onChange={(e) =>
                  setSimulatorValues((prev) => ({
                    ...prev,
                    passengerCount: parseInt(e.target.value) || 1,
                  }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Alış Saati</label>
              <select
                value={simulatorValues.pickupHour}
                onChange={(e) =>
                  setSimulatorValues((prev) => ({
                    ...prev,
                    pickupHour: parseInt(e.target.value),
                  }))
                }
                className={inputCls}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, "0")}:00 {i >= 22 || i < 6 ? "(Gece)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Bekleme (Saat)</label>
              <input
                type="number"
                min="0"
                max="24"
                value={simulatorValues.waitingHours}
                onChange={(e) =>
                  setSimulatorValues((prev) => ({
                    ...prev,
                    waitingHours: parseInt(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Fazla Bagaj</label>
              <input
                type="number"
                min="0"
                max="10"
                value={simulatorValues.extraLuggage}
                onChange={(e) =>
                  setSimulatorValues((prev) => ({
                    ...prev,
                    extraLuggage: parseInt(e.target.value) || 0,
                  }))
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Result */}
          <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hesaplanan Toplam Fiyat</p>
                <p className="text-3xl font-bold text-emerald-700">
                  ₺{calculatePrice().toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="space-y-1 text-right text-xs text-gray-500">
                <p>Baz fiyat: ₺{(transfer.basePrice || 0).toLocaleString("tr-TR")}</p>
                {isNightTime && (transfer as any).nightSurcharge > 0 && (
                  <p className="text-indigo-600">
                    + Gece sürşarjı: ₺{((transfer as any).nightSurcharge || 0).toLocaleString("tr-TR")}
                  </p>
                )}
                {simulatorValues.waitingHours > 0 && (transfer as any).waitingFeePerHour > 0 && (
                  <p className="text-blue-600">
                    + Bekleme ({simulatorValues.waitingHours}s): ₺
                    {(simulatorValues.waitingHours * ((transfer as any).waitingFeePerHour || 0)).toLocaleString("tr-TR")}
                  </p>
                )}
                {simulatorValues.extraLuggage > 0 && (transfer as any).luggageFee > 0 && (
                  <p className="text-orange-600">
                    + Bagaj ({simulatorValues.extraLuggage}): ₺
                    {(simulatorValues.extraLuggage * ((transfer as any).luggageFee || 0)).toLocaleString("tr-TR")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
