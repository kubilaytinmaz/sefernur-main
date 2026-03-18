/**
 * Hotel Search Edit Bar Component
 *
 * Kompakt arama çubuğu bileşeni - Otel sonuçları sayfasında
 * tarih, konum ve misafir detaylarını hızlıca değiştirmek için.
 */

"use client";

import { DatePicker } from "@/components/transfers/DatePicker";
import { cn } from "@/lib/utils";
import { addDays, differenceInDays, format } from "date-fns";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  Minus,
  Moon,
  Plus,
  Search,
  Users,
  X
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { Room } from "./HotelSearchForm";

/* ────────── Types ────────── */

export interface HotelSearchEditBarProps {
  cityCode: number;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  onSearch: (params: {
    cityCode: number;
    checkIn: string;
    checkOut: string;
    rooms: Room[];
  }) => void;
  loading?: boolean;
  className?: string;
}

/* ────────── Constants ────────── */

const CITIES = [
  // Suudi Arabistan - Kutsal Şehirler
  { code: 164, name: "Mekke", icon: "🕋" },
  { code: 174, name: "Medine", icon: "🕌" },
  // Suudi Arabistan - Diğer Şehirler
  { code: 194, name: "Riyad", icon: "🏙️" },
  { code: 134, name: "Cidde", icon: "🌊" },
  { code: 214, name: "Taif", icon: "🏔️" },
  // Türkiye - Büyük Şehirler
  { code: 14214, name: "İstanbul", icon: "🌉" },
  { code: 14124, name: "Ankara", icon: "🏛️" },
  { code: 14224, name: "İzmir", icon: "🏖️" },
  { code: 14134, name: "Antalya", icon: "🌴" },
];

/* ────────── Sub-Components ────────── */

// Şehir Seçici - Kompakt Dropdown
function CitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (code: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedCity = CITIES.find((c) => c.code === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white hover:border-emerald-400 hover:from-emerald-100 hover:to-white transition-all shadow-sm"
      >
        <span className="text-lg">{selectedCity?.icon || "🏨"}</span>
        <span className="text-sm font-medium text-slate-700">
          {selectedCity?.name || "Şehir Seçin"}
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
          <div className="absolute top-full left-0 w-56 mt-2 bg-white/98 backdrop-blur-md rounded-2xl border-2 border-emerald-100 shadow-2xl z-[9999] max-h-[420px] overflow-hidden">
            <div className="p-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Şehir Seçin
              </div>
              <div className="space-y-1 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
                {CITIES.map((city) => (
                  <button
                    key={city.code}
                    type="button"
                    onClick={() => {
                      onChange(city.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                      value === city.code
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200/50"
                        : "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/50 text-slate-700"
                    )}
                  >
                    <span className="text-xl filter drop-shadow-sm">{city.icon}</span>
                    <span className="text-sm font-semibold flex-1">{city.name}</span>
                    {value === city.code && (
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

// Misafir Seçici - Kompakt Dropdown
function GuestSelector({
  rooms,
  onChange,
}: {
  rooms: Room[];
  onChange: (rooms: Room[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalAdults = rooms.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = rooms.reduce((sum, r) => sum + r.children, 0);
  const totalGuests = totalAdults + totalChildren;

  const updateRoom = useCallback(
    (index: number, field: "adults" | "children", delta: number) => {
      const newRooms = [...rooms];
      const room = { ...newRooms[index] };

      if (field === "adults") {
        room.adults = Math.max(1, Math.min(6, room.adults + delta));
      } else {
        const newChildCount = Math.max(0, Math.min(4, room.children + delta));
        if (newChildCount > room.children) {
          room.childAges = [...room.childAges, 5];
        } else if (newChildCount < room.children) {
          room.childAges = room.childAges.slice(0, newChildCount);
        }
        room.children = newChildCount;
      }

      newRooms[index] = room;
      onChange(newRooms);
    },
    [rooms, onChange]
  );

  const updateChildAge = useCallback(
    (roomIndex: number, childIndex: number, age: number) => {
      const newRooms = [...rooms];
      const room = { ...newRooms[roomIndex] };
      room.childAges = [...room.childAges];
      room.childAges[childIndex] = age;
      newRooms[roomIndex] = room;
      onChange(newRooms);
    },
    [rooms, onChange]
  );

  const addRoom = useCallback(() => {
    if (rooms.length >= 4) return;
    onChange([...rooms, { adults: 2, children: 0, childAges: [] }]);
  }, [rooms, onChange]);

  const removeRoom = useCallback(
    (index: number) => {
      if (rooms.length <= 1) return;
      onChange(rooms.filter((_, i) => i !== index));
    },
    [rooms, onChange]
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 to-white hover:border-cyan-400 hover:from-cyan-100 hover:to-white transition-all shadow-sm"
      >
        <Users className="w-4 h-4 text-cyan-600" />
        <span className="text-sm font-medium text-slate-700">
          {rooms.length} Oda, {totalGuests} Misafir
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
          <div className="absolute top-full right-0 mt-3 w-80 max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-sm rounded-2xl border border-cyan-100 shadow-2xl z-[110] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Misafir Sayısı
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
              {rooms.map((room, roomIndex) => (
                <div
                  key={roomIndex}
                  className="p-4 bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Oda {roomIndex + 1}
                    </span>
                    {rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(roomIndex)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Kaldır
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Yetişkin */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Yetişkin</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIndex, "adults", -1)}
                          disabled={room.adults <= 1}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {room.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIndex, "adults", 1)}
                          disabled={room.adults >= 6}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Çocuk */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Çocuk</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIndex, "children", -1)}
                          disabled={room.children <= 0}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {room.children}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateRoom(roomIndex, "children", 1)}
                          disabled={room.children >= 4}
                          className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Çocuk Yaşları */}
                    {room.children > 0 && (
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-[10px] text-slate-500 mb-1.5">
                          Çocuk yaşları
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {room.childAges.map((age, childIndex) => (
                            <select
                              key={childIndex}
                              value={age}
                              onChange={(e) =>
                                updateChildAge(
                                  roomIndex,
                                  childIndex,
                                  Number(e.target.value)
                                )
                              }
                              className="h-7 rounded border border-slate-200 px-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            >
                              {Array.from({ length: 18 }, (_, i) => (
                                <option key={i} value={i}>
                                  {i} yaş
                                </option>
                              ))}
                            </select>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {rooms.length < 4 && (
                <button
                  type="button"
                  onClick={addRoom}
                  className="w-full py-2.5 text-xs font-medium text-emerald-600 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  + Oda Ekle
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Tarih Seçici - Kompakt
function DateSelector({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: {
  checkIn: Date;
  checkOut: Date;
  onCheckInChange: (date: Date) => void;
  onCheckOutChange: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const nightCount = Math.max(1, differenceInDays(checkOut, checkIn));

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
          {formatDate(checkIn)} - {formatDate(checkOut)}
        </span>
        <span className="text-xs text-slate-500">({nightCount} gece)</span>
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

            <div className="space-y-3">
              <DatePicker
                value={checkIn}
                onChange={(date) => {
                  onCheckInChange(date);
                  if (checkOut < date) {
                    onCheckOutChange(addDays(date, 1));
                  }
                }}
                minDate={new Date()}
                maxDaysAhead={365}
                label="Giriş Tarihi"
              />
              <DatePicker
                value={checkOut}
                onChange={onCheckOutChange}
                minDate={addDays(checkIn, 1)}
                maxDaysAhead={365}
                label="Çıkış Tarihi"
              />
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <Moon className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{nightCount} Gece</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Main Component ────────── */

export function HotelSearchEditBar({
  cityCode,
  checkIn,
  checkOut,
  rooms,
  onSearch,
  loading = false,
  className,
}: HotelSearchEditBarProps) {
  const [localCityCode, setLocalCityCode] = useState(cityCode);
  const [localCheckIn, setLocalCheckIn] = useState(new Date(checkIn));
  const [localCheckOut, setLocalCheckOut] = useState(new Date(checkOut));
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);

  const handleSearch = useCallback(() => {
    onSearch({
      cityCode: localCityCode,
      checkIn: format(localCheckIn, "yyyy-MM-dd"),
      checkOut: format(localCheckOut, "yyyy-MM-dd"),
      rooms: localRooms,
    });
  }, [localCityCode, localCheckIn, localCheckOut, localRooms, onSearch]);

  const hasChanges =
    localCityCode !== cityCode ||
    format(localCheckIn, "yyyy-MM-dd") !== checkIn ||
    format(localCheckOut, "yyyy-MM-dd") !== checkOut ||
    JSON.stringify(localRooms) !== JSON.stringify(rooms);

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
      
      <div className="relative flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Şehir Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 lg:mb-0">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              Konum
            </span>
          </div>
          <CitySelector value={localCityCode} onChange={setLocalCityCode} />
        </div>

        <div className="hidden lg:block w-px h-12 bg-slate-200" />

        {/* Tarih Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 lg:mb-0">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Tarihler
            </span>
          </div>
          <DateSelector
            checkIn={localCheckIn}
            checkOut={localCheckOut}
            onCheckInChange={setLocalCheckIn}
            onCheckOutChange={setLocalCheckOut}
          />
        </div>

        <div className="hidden lg:block w-px h-12 bg-slate-200" />

        {/* Misafir Seçici */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2 lg:mb-0">
            <Users className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">
              Misafirler
            </span>
          </div>
          <GuestSelector rooms={localRooms} onChange={setLocalRooms} />
        </div>

        {/* Ara Butonu */}
        <div className="flex-shrink-0 lg:ml-auto">
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !hasChanges}
            className={cn(
              "w-full lg:w-auto h-12 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
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
