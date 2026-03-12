import { TransferModel } from "@/types/transfer";
import { Clock, Gauge, MapPin, Plane } from "lucide-react";

interface RouteTabProps {
  transfer: Partial<TransferModel>;
  onUpdate: (updates: Partial<TransferModel>) => void;
}

// Popüler rotalar
const POPULAR_ROUTES = [
  { id: "jeddah-makkah", from: "Cidde Havalimanı", to: "Mekke", distance: 80, duration: 90 },
  { id: "jeddah-madinah", from: "Cidde Havalimanı", to: "Medine", distance: 420, duration: 300 },
  { id: "makkah-madinah", from: "Mekke", to: "Medine", distance: 350, duration: 270 },
  { id: "makkah-jeddah", from: "Mekke", to: "Cidde", distance: 75, duration: 75 },
  { id: "madinah-jeddah", from: "Medine", to: "Cidde", distance: 420, duration: 300 },
];

export function RouteTab({ transfer, onUpdate }: RouteTabProps) {
  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700";

  const handlePopularRouteSelect = (routeId: string) => {
    const route = POPULAR_ROUTES.find((r) => r.id === routeId);
    if (route) {
      onUpdate({
        fromAddress: {
          ...transfer.fromAddress,
          address: route.from,
          city: route.from.split(" ").pop() || "",
          country: "Suudi Arabistan",
        },
        toAddress: {
          ...transfer.toAddress,
          address: route.to,
          city: route.to,
          country: "Suudi Arabistan",
        },
        durationMinutes: route.duration,
      });
    }
  };

  const fromCity = transfer.fromAddress?.city || "";
  const toCity = transfer.toAddress?.city || "";
  const distance = calculateDistance(fromCity, toCity);

  return (
    <div className="space-y-6">
      {/* Popular Routes */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Popüler Rotalar</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => handlePopularRouteSelect(route.id)}
              className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Plane className="h-4 w-4 text-emerald-600" />
                {route.from}
              </div>
              <div className="my-2 flex items-center gap-2 text-gray-400">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs">→</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <MapPin className="h-4 w-4 text-red-500" />
                {route.to}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  {route.distance} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(route.duration / 60)}s {route.duration % 60}dk
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* From Address */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Kalkış Adresi</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Adres</label>
            <input
              type="text"
              value={transfer.fromAddress?.address || ""}
              onChange={(e) =>
                onUpdate({
                  fromAddress: { ...transfer.fromAddress, address: e.target.value },
                })
              }
              className={inputCls}
              placeholder="Örn: Cidde Havalimanı, Terminal 1"
            />
          </div>
          <div>
            <label className={labelCls}>Şehir</label>
            <input
              type="text"
              value={transfer.fromAddress?.city || ""}
              onChange={(e) =>
                onUpdate({
                  fromAddress: { ...transfer.fromAddress, city: e.target.value },
                })
              }
              className={inputCls}
              placeholder="Örn: Cidde"
            />
          </div>
          <div>
            <label className={labelCls}>Ülke</label>
            <input
              type="text"
              value={transfer.fromAddress?.country || ""}
              onChange={(e) =>
                onUpdate({
                  fromAddress: { ...transfer.fromAddress, country: e.target.value },
                })
              }
              className={inputCls}
              placeholder="Örn: Suudi Arabistan"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Koordinatlar (Opsiyonel)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={(transfer.fromAddress as any)?.latitude || ""}
                onChange={(e) =>
                  onUpdate({
                    fromAddress: { ...transfer.fromAddress, latitude: e.target.value } as any,
                  })
                }
                className={inputCls}
                placeholder="Enlem (Latitude)"
              />
              <input
                type="text"
                value={(transfer.fromAddress as any)?.longitude || ""}
                onChange={(e) =>
                  onUpdate({
                    fromAddress: { ...transfer.fromAddress, longitude: e.target.value } as any,
                  })
                }
                className={inputCls}
                placeholder="Boylam (Longitude)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* To Address */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Varış Adresi</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Adres</label>
            <input
              type="text"
              value={transfer.toAddress?.address || ""}
              onChange={(e) =>
                onUpdate({
                  toAddress: { ...transfer.toAddress, address: e.target.value },
                })
              }
              className={inputCls}
              placeholder="Örn: Mekke, Otel civarı"
            />
          </div>
          <div>
            <label className={labelCls}>Şehir</label>
            <input
              type="text"
              value={transfer.toAddress?.city || ""}
              onChange={(e) =>
                onUpdate({
                  toAddress: { ...transfer.toAddress, city: e.target.value },
                })
              }
              className={inputCls}
              placeholder="Örn: Mekke"
            />
          </div>
          <div>
            <label className={labelCls}>Ülke</label>
            <input
              type="text"
              value={transfer.toAddress?.country || ""}
              onChange={(e) =>
                onUpdate({
                  toAddress: { ...transfer.toAddress, country: e.target.value },
                })
              }
              className={inputCls}
              placeholder="Örn: Suudi Arabistan"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Koordinatlar (Opsiyonel)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={(transfer.toAddress as any)?.latitude || ""}
                onChange={(e) =>
                  onUpdate({
                    toAddress: { ...transfer.toAddress, latitude: e.target.value } as any,
                  })
                }
                className={inputCls}
                placeholder="Enlem (Latitude)"
              />
              <input
                type="text"
                value={(transfer.toAddress as any)?.longitude || ""}
                onChange={(e) =>
                  onUpdate({
                    toAddress: { ...transfer.toAddress, longitude: e.target.value } as any,
                  })
                }
                className={inputCls}
                placeholder="Boylam (Longitude)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Route Summary */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Rota Özeti</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Gauge className="h-4 w-4" />
              Tahmini Mesafe
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {distance > 0 ? `${distance} km` : "-"}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Clock className="h-4 w-4" />
              Tahmini Süre
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {transfer.durationMinutes
                ? `${Math.floor(transfer.durationMinutes / 60)}s ${transfer.durationMinutes % 60}dk`
                : "-"}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Plane className="h-4 w-4" />
              Rota Tipi
            </div>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {fromCity && toCity ? `${fromCity} → ${toCity}` : "Belirtilmedi"}
            </p>
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Harita Önizleme</h3>
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-8 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-500">
            Koordinatlar girildiğinde harita gösterilecek
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Google Maps API entegrasyonu planlanıyor
          </p>
        </div>
      </div>
    </div>
  );
}

// Basit mesafe hesaplama (gerçek API olmadan)
function calculateDistance(fromCity: string, toCity: string): number {
  const distances: Record<string, number> = {
    "Cidde-Mekke": 80,
    "Cidde-Medine": 420,
    "Mekke-Medine": 350,
    "Mekke-Cidde": 75,
    "Medine-Cidde": 420,
    "Medine-Mekke": 350,
  };

  const key = `${fromCity}-${toCity}`;
  return distances[key] || 0;
}
