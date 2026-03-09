// Transfer Arama Formu - Sabit (her zaman açık) LocationSelector entegrasyonu

"use client";

import { DatePicker } from "@/components/transfers/DatePicker";
import { LocationSelector } from "@/components/transfers/LocationSelector";
import { Button } from "@/components/ui/Button";
import { POPULAR_ROUTES, type PopularRoute } from "@/lib/transfers/popular-routes";
import { estimateRoutePrice, isNightTime } from "@/lib/transfers/pricing";
import {
  getDestinationsByFromLocation,
  getRoutesByLocations,
  LOCATIONS,
  TransferLocation
} from "@/lib/transfers/transfer-locations";
import type { VehicleType } from "@/types/transfer";
import { vehicleTypeLabels } from "@/types/transfer";
import { Car, ChevronDown, Clock, Info, MapPin, Minus, Plus, Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";

export interface TransferSearchParams {
  routeId?: string;
  fromCity: string;
  toCity: string;
  pickupDate: Date;
  pickupTime: string;
  passengerCount: number;
  luggageCount: number;
  vehicleType?: VehicleType;
  childSeat?: boolean;
}

interface TransferSearchFormProps {
  onSearch: (params: TransferSearchParams) => void;
  loading?: boolean;
}

export function TransferSearchForm({ 
  onSearch, 
  loading = false
}: TransferSearchFormProps) {
  const [fromLocation, setFromLocation] = useState<TransferLocation | null>(null);
  const [toLocation, setToLocation] = useState<TransferLocation | null>(null);
  const [pickupDate, setPickupDate] = useState<Date>(new Date());
  const [pickupTime, setPickupTime] = useState<string>('09:00');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [vehicleType, setVehicleType] = useState<VehicleType | undefined>(undefined);

  // Popüler rota seçimi
  const [selectedPopularRoute, setSelectedPopularRoute] = useState<PopularRoute | null>(null);

  // Dropdown state'leri
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const passengerDropdownRef = useRef<HTMLDivElement>(null);

  // Nereden lokasyonu seçildiğinde nereye için uyumlu lokasyonları hesapla
  const availableDestinations = useMemo(() => {
    if (!fromLocation) return undefined;
    return getDestinationsByFromLocation(fromLocation.id);
  }, [fromLocation]);

  // Nereden değiştiğinde nereye'yi sıfırla
  const handleFromLocationChange = (location: TransferLocation | null) => {
    setFromLocation(location);
    if (toLocation && location) {
      const destinations = getDestinationsByFromLocation(location.id);
      if (!destinations.find(d => d.id === toLocation.id)) {
        setToLocation(null);
      }
    }
  };

  // Popüler rota seçimi
  const handlePopularRouteSelect = (route: PopularRoute) => {
    setSelectedPopularRoute(route);
    const from = Object.values(LOCATIONS).find(
      loc => loc.city === route.from.city || loc.name.includes(route.from.city)
    );
    const to = Object.values(LOCATIONS).find(
      loc => loc.city === route.to.city || loc.name.includes(route.to.city)
    );
    
    if (from) setFromLocation(from);
    if (to) setToLocation(to);
  };

  // Arama yap
  const handleSubmit = () => {
    if (!fromLocation || !toLocation) {
      alert('Lütfen nereden ve nereye lokasyonlarını seçin.');
      return;
    }

    const routes = getRoutesByLocations(fromLocation.id, toLocation.id);
    const routeId = routes[0]?.id;

    onSearch({
      routeId,
      fromCity: fromLocation.city,
      toCity: toLocation.city,
      pickupDate,
      pickupTime,
      passengerCount,
      luggageCount: 1,
      vehicleType,
    });
  };

  // Tahmini fiyat hesapla
  const priceEstimate = useMemo(() => {
    if (!fromLocation || !toLocation) return null;
    
    const routes = getRoutesByLocations(fromLocation.id, toLocation.id);
    if (routes.length === 0 || !routes[0].distance) return null;

    return estimateRoutePrice(
      routes[0].distance.km,
      vehicleType || 'sedan',
      pickupTime
    );
  }, [fromLocation, toLocation, vehicleType, pickupTime]);


  // Saat seçenekleri
  const timeOptions = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00',
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  return (
    <>
      {/* Popüler Rotalar - Kompakt */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-cyan-600" />
            Popüler Rotalar
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_ROUTES.filter(r => r.isPopular).map((route) => (
              <button
                key={route.id}
                onClick={() => handlePopularRouteSelect(route)}
                className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedPopularRoute?.id === route.id
                    ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-200'
                    : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm shrink-0">{route.icon}</span>
                <span className="text-xs font-medium text-slate-900">
                  {route.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detaylı Arama */}
        <div className="space-y-4">
          {/* Nereden ve Nereye */}
          <div className="grid md:grid-cols-2 gap-4">
            <LocationSelector
              value={fromLocation}
              onChange={handleFromLocationChange}
              label="📍 Nereden"
              placeholder="Başlangıç lokasyonu seçin"
            />

            <LocationSelector
              value={toLocation}
              onChange={setToLocation}
              label="📍 Nereye"
              placeholder="Varış lokasyonu seçin"
              availableLocations={availableDestinations}
              disabled={!fromLocation}
            />
          </div>

          {/* Tarih, Saat, Yolcu - 3 Sütun Yan Yana */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Kompakt Tarih Seçici */}
            <DatePicker
              value={pickupDate}
              onChange={setPickupDate}
              minDate={new Date()}
              maxDaysAhead={90}
              label="Tarih"
            />

            {/* Saat Seçici */}
            <div className="relative" ref={timeDropdownRef}>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Saat
              </label>
              <button
                type="button"
                onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 flex items-center justify-between text-sm text-slate-900 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span>{pickupTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  {isNightTime(pickupTime) && <span className="text-sm">🌙</span>}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${timeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {timeDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
                  <div className="max-h-64 overflow-y-auto p-2">
                    <div className="grid grid-cols-4 gap-1">
                      {timeOptions.map((time) => {
                        const isSelected = time === pickupTime;
                        const isNight = isNightTime(time);
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setPickupTime(time);
                              setTimeDropdownOpen(false);
                            }}
                            className={`px-2 py-2 rounded text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-cyan-600 text-white'
                                : isNight
                                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Yolcu Sayısı - Gruplu Dropdown + Input */}
            <div className="relative" ref={passengerDropdownRef}>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Yolcu
              </label>
              <div className="h-10 rounded-lg border border-slate-300 bg-white px-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPassengerDropdownOpen(!passengerDropdownOpen)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <Users className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span className="text-sm text-slate-900">{passengerCount} Kişi</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPassengerCount(Math.max(1, passengerCount - 1));
                    }}
                    disabled={passengerCount <= 1}
                    className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPassengerCount(Math.min(49, passengerCount + 1));
                    }}
                    disabled={passengerCount >= 49}
                    className="w-7 h-7 rounded-md bg-cyan-100 hover:bg-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 text-cyan-600" />
                  </button>
                </div>
              </div>

              {passengerDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
                  <div className="p-2">
                    {/* Gruplu seçim - Yan yana kutular */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(1);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount === 1
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(2);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount === 2
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        2
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(3);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount === 3
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        3
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(4);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount === 4
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        4
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(5);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount >= 5 && passengerCount <= 7
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        5-7
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(8);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount >= 8 && passengerCount <= 16
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        8-16
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPassengerCount(16);
                          setPassengerDropdownOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-center text-sm font-medium transition-all ${
                          passengerCount >= 16
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        16-49
                      </button>
                      <input
                        type="number"
                        min={16}
                        max={49}
                        value={passengerCount >= 16 ? passengerCount : ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 16;
                          setPassengerCount(Math.min(49, Math.max(16, val)));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="col-span-2 px-3 py-2 rounded text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Yolcu sayısı girin"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Araç Tipi */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Araç Tipi (Opsiyonel)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setVehicleType(undefined)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !vehicleType
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tümü
              </button>
              {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVehicleType(value as VehicleType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    vehicleType === value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fiyat Tahmini */}
          {fromLocation && toLocation && priceEstimate && (
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-900">
                    Tahmini Fiyat: {priceEstimate.min.toLocaleString('tr-TR')} TL - {priceEstimate.max.toLocaleString('tr-TR')} TL
                  </p>
                  <p className="text-xs text-cyan-700 mt-0.5">
                    Araç tipine, yolcu sayısına ve saate göre fiyat değişebilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ara Butonu */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !fromLocation || !toLocation}
            className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 animate-spin" />
                Transferler aranıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Transfer Ara
              </span>
            )}
          </Button>
      </div>
    </>
  );
}
