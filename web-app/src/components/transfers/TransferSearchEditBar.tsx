/**
 * Transfer Search Edit Bar Component
 *
 * Kompakt arama çubuğu bileşeni - Transfer sonuçları sayfasında
 * lokasyon, tarih, saat ve yolcu detaylarını hızlıca değiştirmek için.
 */

"use client";

import { DatePicker } from "@/components/transfers/DatePicker";
import { LOCATIONS, getDestinationsByFromLocation } from "@/lib/transfers/transfer-locations";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    MapPin,
    Minus,
    Plus,
    Search,
    Users,
    X
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

/* ────────── Types ────────── */

export interface TransferSearchEditBarProps {
  fromLocationId: string;
  toLocationId: string;
  date: string;
  time: string;
  passengers: number;
  onSearch: (params: {
    fromLocationId: string;
    toLocationId: string;
    date: string;
    time: string;
    passengers: number;
  }) => void;
  loading?: boolean;
  className?: string;
}

/* ────────── Sub-Components ────────── */

// Nereden Lokasyon Seçici - Kompakt Dropdown
function FromLocationSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (locationId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLocation = LOCATIONS[value];

  // Tüm lokasyonları filtrele
  const filteredLocations = Object.values(LOCATIONS).filter((loc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-400 hover:from-emerald-100 hover:to-white transition-all shadow-sm"
      >
        <span className="text-lg">📍</span>
        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
          {selectedLocation?.name || "Nereden"}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 w-72 mt-2 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-emerald-100 shadow-2xl z-[9999] max-h-[420px] overflow-hidden">
            <div className="p-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Nereden
              </div>
              
              {/* Arama Kutusu */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lokasyon ara..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      onChange(location.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                      value === location.id
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50"
                        : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/50 text-slate-700"
                    )}
                  >
                    <span className="text-lg filter drop-shadow-sm">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {location.name}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {location.city}
                      </div>
                    </div>
                    {value === location.id && (
                      <span className="text-white flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Nereye Lokasyon Seçici - Kompakt Dropdown
function ToLocationSelector({
  value,
  onChange,
  fromLocationId,
}: {
  value: string;
  onChange: (locationId: string) => void;
  fromLocationId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLocation = LOCATIONS[value];
  const fromLocation = LOCATIONS[fromLocationId];

  // Nereden'e göre uygun varış lokasyonlarını al
  const availableDestinations = fromLocation 
    ? getDestinationsByFromLocation(fromLocation.id)
    : Object.values(LOCATIONS);

  // Arama filtreleme
  const filteredLocations = availableDestinations.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 to-white hover:border-cyan-400 hover:from-cyan-100 hover:to-white transition-all shadow-sm"
      >
        <span className="text-lg">🎯</span>
        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
          {selectedLocation?.name || "Nereye"}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 w-72 mt-2 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-cyan-100 shadow-2xl z-[9999] max-h-[420px] overflow-hidden">
            <div className="p-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                Nereye
              </div>
              
              {/* Arama Kutusu */}
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lokasyon ara..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredLocations.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">
                    Önce nereden seçin
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => {
                        onChange(location.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                        value === location.id
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-200/50"
                          : "hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100/50 text-slate-700"
                      )}
                    >
                      <span className="text-lg filter drop-shadow-sm">🎯</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {location.name}
                        </div>
                        <div className="text-xs opacity-70 truncate">
                          {location.city}
                        </div>
                      </div>
                      {value === location.id && (
                        <span className="text-white flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Tarih Seçici - Kompakt
function DateSelector({
  date,
  onDateChange,
}: {
  date: Date;
  onDateChange: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return format(date, "d MMM");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-white hover:border-amber-400 hover:from-amber-100 hover:to-white transition-all shadow-sm"
      >
        <Calendar className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-slate-700">
          {formatDate(date)}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-amber-100 shadow-2xl z-[110] p-4 w-80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Tarih Seçin
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DatePicker
              value={date}
              onChange={(newDate) => {
                onDateChange(newDate);
                setIsOpen(false);
              }}
              minDate={new Date()}
              maxDaysAhead={365}
              label="Transfer Tarihi"
            />
          </div>
        </>
      )}
    </div>
  );
}

// Saat Seçici - Kompakt
function TimeSelector({
  time,
  onTimeChange,
}: {
  time: string;
  onTimeChange: (time: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const timeOptions = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00',
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const isNightTime = (timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    return hour >= 0 && hour < 6;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-white hover:border-violet-400 hover:from-violet-100 hover:to-white transition-all shadow-sm"
      >
        <Clock className="w-4 h-4 text-violet-600" />
        <span className="text-sm font-medium text-slate-700">
          {time}
        </span>
        {isNightTime(time) && <span className="text-sm">🌙</span>}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-violet-100 shadow-2xl z-[110] p-4 w-72">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Saat Seçin
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {timeOptions.map((timeOption) => {
                const isSelected = timeOption === time;
                const isNight = isNightTime(timeOption);
                return (
                  <button
                    key={timeOption}
                    type="button"
                    onClick={() => {
                      onTimeChange(timeOption);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-2 py-2 rounded text-xs font-medium transition-all",
                      isSelected
                        ? "bg-violet-600 text-white"
                        : isNight
                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {timeOption}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Yolcu Seçici - Kompakt Dropdown
function PassengerSelector({
  passengers,
  onChange,
}: {
  passengers: number;
  onChange: (passengers: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 bg-gradient-to-r from-rose-50 to-white hover:border-rose-400 hover:from-rose-100 hover:to-white transition-all shadow-sm"
      >
        <Users className="w-4 h-4 text-rose-600" />
        <span className="text-sm font-medium text-slate-700">
          {passengers} Kişi
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-3 w-72 bg-white/95 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-2xl z-[110] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Yolcu Sayısı
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Hızlı Seçim Butonları */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      onChange(num);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      passengers === num
                        ? "bg-rose-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Manuel Giriş */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onChange(Math.max(1, passengers - 1))}
                  disabled={passengers <= 1}
                  className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:border-rose-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:border-slate-300 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-bold text-slate-900">{passengers}</span>
                  <p className="text-xs text-slate-500">Yolcu</p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(Math.min(49, passengers + 1))}
                  disabled={passengers >= 49}
                  className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:border-rose-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:border-slate-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Main Component ────────── */

export function TransferSearchEditBar({
  fromLocationId,
  toLocationId,
  date,
  time,
  passengers,
  onSearch,
  loading = false,
  className,
}: TransferSearchEditBarProps) {
  const [localFromLocationId, setLocalFromLocationId] = useState(fromLocationId);
  const [localToLocationId, setLocalToLocationId] = useState(toLocationId);
  const [localDate, setLocalDate] = useState(new Date(date));
  const [localTime, setLocalTime] = useState(time);
  const [localPassengers, setLocalPassengers] = useState(passengers);

  const handleSearch = useCallback(() => {
    onSearch({
      fromLocationId: localFromLocationId,
      toLocationId: localToLocationId,
      date: format(localDate, "yyyy-MM-dd"),
      time: localTime,
      passengers: localPassengers,
    });
  }, [localFromLocationId, localToLocationId, localDate, localTime, localPassengers, onSearch]);

  const hasChanges =
    localFromLocationId !== fromLocationId ||
    localToLocationId !== toLocationId ||
    format(localDate, "yyyy-MM-dd") !== date ||
    localTime !== time ||
    localPassengers !== passengers;

  return (
    <div className={cn(
      "relative rounded-xl p-4 shadow-lg",
      "bg-gradient-to-br from-emerald-50 via-white to-cyan-50",
      "border border-emerald-100",
      className
    )}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-400 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex flex-col xl:flex-row xl:items-center gap-4">
        {/* Nereden Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 xl:mb-0">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Nereden
            </span>
          </div>
          <FromLocationSelector 
            value={localFromLocationId} 
            onChange={setLocalFromLocationId} 
          />
        </div>

        <div className="hidden xl:block w-px h-12 bg-slate-200" />

        {/* Nereye Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 xl:mb-0">
            <MapPin className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">
              Nereye
            </span>
          </div>
          <ToLocationSelector 
            value={localToLocationId} 
            onChange={setLocalToLocationId}
            fromLocationId={localFromLocationId}
          />
        </div>

        <div className="hidden xl:block w-px h-12 bg-slate-200" />

        {/* Tarih Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 xl:mb-0">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Tarih
            </span>
          </div>
          <DateSelector
            date={localDate}
            onDateChange={setLocalDate}
          />
        </div>

        <div className="hidden xl:block w-px h-12 bg-slate-200" />

        {/* Saat Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 xl:mb-0">
            <Clock className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
              Saat
            </span>
          </div>
          <TimeSelector
            time={localTime}
            onTimeChange={setLocalTime}
          />
        </div>

        <div className="hidden xl:block w-px h-12 bg-slate-200" />

        {/* Yolcu Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 xl:mb-0">
            <Users className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">
              Yolcu
            </span>
          </div>
          <PassengerSelector 
            passengers={localPassengers} 
            onChange={setLocalPassengers} 
          />
        </div>

        {/* Ara Butonu */}
        <div className="flex-shrink-0 xl:ml-auto">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !hasChanges}
            className={cn(
              "w-full xl:w-auto h-12 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
              hasChanges
                ? "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            <Search className="w-5 h-5" />
            {loading ? "Aranıyor..." : hasChanges ? "Yeni Ara" : "Ara"}
          </button>
        </div>
      </div>
    </div>
  );
}
