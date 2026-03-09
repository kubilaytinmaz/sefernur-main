"use client";

import { DatePicker } from "@/components/transfers/DatePicker";
import { cn } from "@/lib/utils";
import { addDays, differenceInDays, format } from "date-fns";
import {
  Baby,
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

/* ────────── Types ────────── */

export interface Room {
  adults: number;
  children: number;
  childAges: number[];
}

export interface HotelSearchFormParams {
  cityCode?: number;
  countryCode?: number;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
}

interface HotelSearchFormProps {
  onSearch: (params: HotelSearchFormParams) => void;
  loading?: boolean;
  initialParams?: Partial<HotelSearchFormParams>;
}

/* ────────── Constants ────────── */

const CITIES = [
  // Suudi Arabistan - Kutsal Şehirler (DOTW API'den doğrulanmış kodlar)
  { code: 164, name: "Mekke", icon: "🕋", keywords: ["mekke", "makkah", "mecca"] },
  { code: 174, name: "Medine", icon: "🕌", keywords: ["medine", "madinah", "medina"] },
  
  // Suudi Arabistan - Diğer Şehirler (DOTW API'den doğrulanmış)
  { code: 194, name: "Riyad", icon: "🏙️", keywords: ["riyad", "riyadh"] },
  { code: 134, name: "Cidde", icon: "🌊", keywords: ["cidde", "jeddah", "jidda"] },
  { code: 214, name: "Taif", icon: "🏔️", keywords: ["taif", "taef"] },
  { code: 84, name: "Dammam", icon: "🏢", keywords: ["dammam"] },
  
  // Türkiye - Büyük Şehirler (DOTW API'den doğrulanmış kodlar)
  { code: 14214, name: "İstanbul", icon: "🌉", keywords: ["istanbul", "constantinople"] },
  { code: 14124, name: "Ankara", icon: "🏛️", keywords: ["ankara"] },
  { code: 14224, name: "İzmir", icon: "🏖️", keywords: ["izmir", "smyrna"] },
  { code: 14174, name: "Bursa", icon: "🕌", keywords: ["bursa"] },
  { code: 14134, name: "Antalya", icon: "🌴", keywords: ["antalya"] },
  { code: 14344, name: "Konya", icon: "🕌", keywords: ["konya"] },
  { code: 14294, name: "Trabzon", icon: "🌲", keywords: ["trabzon"] },
  { code: 57712, name: "Gaziantep", icon: "🍕", keywords: ["gaziantep", "antep"] },
  { code: 14374, name: "Şanlıurfa", icon: "🕌", keywords: ["sanliurfa", "urfa"] },
  { code: 14364, name: "Diyarbakır", icon: "🌉", keywords: ["diyarbakir", "amida"] },
];

const NIGHT_OPTIONS = [3, 5, 7, 10, 14, 21, 30];


/* ────────── Guest Selector Popover ────────── */

function GuestSelector({
  rooms,
  onChange,
}: {
  rooms: Room[];
  onChange: (rooms: Room[]) => void;
}) {
  const [open, setOpen] = useState(false);
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
    [rooms, onChange],
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
    [rooms, onChange],
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
    [rooms, onChange],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-left text-sm text-slate-900 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>
            {rooms.length} Oda, {totalGuests} Misafir
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-40 p-5 max-h-[70vh] overflow-y-auto">
            {rooms.map((room, roomIndex) => (
              <div
                key={roomIndex}
                className={cn(
                  "pb-4",
                  roomIndex < rooms.length - 1 &&
                    "mb-4 border-b border-slate-100",
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Oda {roomIndex + 1}
                  </h4>
                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(roomIndex)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Kaldır
                    </button>
                  )}
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Yetişkin
                      </p>
                      <p className="text-xs text-slate-400">18+ yaş</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateRoom(roomIndex, "adults", -1)}
                      disabled={room.adults <= 1}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-slate-900">
                      {room.adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRoom(roomIndex, "adults", 1)}
                      disabled={room.adults >= 6}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Çocuk
                      </p>
                      <p className="text-xs text-slate-400">0-17 yaş</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateRoom(roomIndex, "children", -1)}
                      disabled={room.children <= 0}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-slate-900">
                      {room.children}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRoom(roomIndex, "children", 1)}
                      disabled={room.children >= 4}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-30 disabled:hover:border-slate-300 disabled:hover:text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Child Ages */}
                {room.children > 0 && (
                  <div className="mt-2 pl-6">
                    <p className="text-xs text-slate-500 mb-1.5">
                      Çocuk yaşları
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {room.childAges.map((age, childIndex) => (
                        <select
                          key={childIndex}
                          value={age}
                          onChange={(e) =>
                            updateChildAge(
                              roomIndex,
                              childIndex,
                              Number(e.target.value),
                            )
                          }
                          className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
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
            ))}

            {rooms.length < 4 && (
              <button
                type="button"
                onClick={addRoom}
                className="w-full mt-2 py-2.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-dashed border-emerald-300 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                + Oda Ekle
              </button>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full mt-3 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
            >
              Tamam
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── City Selector with Quick Buttons + Autocomplete ────────── */

function CitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (code: number) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mekke ve Medine için hızlı butonlar
  const quickCities = CITIES.filter((c) => c.code === 164 || c.code === 174);
  // Diğer şehirler için arama
  const otherCities = CITIES.filter((c) => c.code !== 164 && c.code !== 174);

  const selectedCity = CITIES.find((c) => c.code === value);

  // Arama sonuçlarını filtrele
  const filteredCities = searchTerm.trim()
    ? otherCities.filter((city) => {
        const term = searchTerm.toLowerCase();
        return (
          city.name.toLowerCase().includes(term) ||
          city.keywords.some((keyword) => keyword.includes(term))
        );
      })
    : otherCities;

  const handleSelectCity = (code: number) => {
    onChange(code);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Hızlı Seçim - Mekke ve Medine */}
      <div className="flex gap-2">
        {quickCities.map((city) => (
          <button
            key={city.code}
            type="button"
            onClick={() => onChange(city.code)}
            className={cn(
              "flex-1 h-10 rounded-lg border-2 flex items-center justify-center gap-2 text-sm font-medium transition-all",
              value === city.code
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50",
            )}
          >
            <span className="text-lg">{city.icon}</span>
            {city.name}
          </button>
        ))}
      </div>

      {/* Diğer Şehirler için Arama */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || (quickCities.find((c) => c.code === value) ? "" : selectedCity?.name || "")}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Diğer şehirler için yazın (örn: Riyad, Taif...)"
          className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl z-40 max-h-80 overflow-y-auto">
              {filteredCities.length > 0 ? (
                <div className="p-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city.code}
                      type="button"
                      onClick={() => handleSelectCity(city.code)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        value === city.code
                          ? "bg-emerald-50 text-emerald-700"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="text-xl">{city.icon}</span>
                      <span className="text-sm font-medium">{city.name}</span>
                      {value === city.code && (
                        <span className="ml-auto text-emerald-600 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">
                  Sonuç bulunamadı
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────── Night Count Selector ────────── */

function NightCountSelector({
  checkInDate,
  checkOutDate,
  onCheckOutChange,
}: {
  checkInDate: Date;
  checkOutDate: Date;
  onCheckOutChange: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentNights = Math.max(1, differenceInDays(checkOutDate, checkInDate));

  const handleSelectNights = (nights: number) => {
    const newCheckOut = addDays(checkInDate, nights);
    onCheckOutChange(newCheckOut);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Gece Sayısı</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 flex items-center justify-between text-sm text-slate-900 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
      >
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">{currentNights} Gece</span>
        </div>
        {isOpen ? (
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-xl z-40 p-2">
            <div className="grid grid-cols-4 gap-1.5">
              {NIGHT_OPTIONS.map((nights) => (
                <button
                  key={nights}
                  type="button"
                  onClick={() => handleSelectNights(nights)}
                  className={cn(
                    "px-3 py-2 rounded-md font-medium text-sm transition-all",
                    currentNights === nights
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700"
                  )}
                >
                  {nights}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 text-center">
                Çıkış tarihi otomatik ayarlanır
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Main Component ────────── */

export function HotelSearchForm({
  onSearch,
  loading,
  initialParams,
}: HotelSearchFormProps) {
  const [cityCode, setCityCode] = useState(
    initialParams?.cityCode ?? 164, // Mekke (MAKKAH) default
  );
  
  // Date objesi olarak state yönetimi
  const [checkInDate, setCheckInDate] = useState(
    initialParams?.checkIn
      ? new Date(initialParams.checkIn)
      : new Date() // Bugün
  );
  const [checkOutDate, setCheckOutDate] = useState(
    initialParams?.checkOut
      ? new Date(initialParams.checkOut)
      : (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow;
        })() // Yarın
  );
  
  const [rooms, setRooms] = useState<Room[]>(
    initialParams?.rooms ?? [{ adults: 2, children: 0, childAges: [] }],
  );

  // Gece sayısı hesaplama
  const nightCount = Math.max(1, differenceInDays(checkOutDate, checkInDate));

  // Check-in değiştiğinde check-out'u otomatik güncelle
  const handleCheckInChange = useCallback((date: Date) => {
    setCheckInDate(date);
    // Eğer check-out, check-in'den önceyse, +1 gün ekle
    if (checkOutDate < date) {
      setCheckOutDate(addDays(date, 1));
    }
  }, [checkOutDate]);

  const handleSubmit = useCallback(() => {
    onSearch({
      cityCode,
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      rooms
    });
  }, [cityCode, checkInDate, checkOutDate, rooms, onSearch]);

  return (
    <div className="space-y-4">
      {/* City Selection with Autocomplete */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" /> Şehir
        </label>
        <CitySelector value={cityCode} onChange={setCityCode} />
      </div>

      {/* Date Selection Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <NightCountSelector
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            onCheckOutChange={setCheckOutDate}
          />
        </div>
        <div>
          <DatePicker
            value={checkInDate}
            onChange={handleCheckInChange}
            minDate={new Date()}
            maxDaysAhead={365}
            label="Giriş Tarihi"
          />
        </div>
        <div>
          <DatePicker
            value={checkOutDate}
            onChange={setCheckOutDate}
            minDate={addDays(checkInDate, 1)}
            maxDaysAhead={365}
            label="Çıkış Tarihi"
          />
        </div>
      </div>

      {/* Guest Selection */}
      <div>
        <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" /> Misafirler
        </label>
        <GuestSelector rooms={rooms} onChange={setRooms} />
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-13 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
      >
        <Search className="w-5 h-5" />
        {loading ? "Oteller aranıyor..." : "Otel Ara"}
      </button>
    </div>
  );
}
