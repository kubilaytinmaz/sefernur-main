/**
 * Guest Summary Bar Component
 * 
 * Displays current guest configuration and allows quick modification
 * after search results are shown.
 */

import { Button } from "@/components/ui/Button";
import { getRoomConfigDetails, getRoomConfigSummary } from "@/lib/hotels/capacity-utils";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronUp,
    Minus,
    Pencil,
    Plus,
    Search,
    Users,
    X,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Room } from "./HotelSearchForm";

/* ────────── Types ────────── */

export interface GuestSummaryBarProps {
  rooms: Room[];
  onSearch: (rooms: Room[]) => void;
  loading?: boolean;
  className?: string;
}

/* ────────── Main Component ────────── */

export function GuestSummaryBar({
  rooms,
  onSearch,
  loading = false,
  className,
}: GuestSummaryBarProps) {
  const [open, setOpen] = useState(false);
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
  const ref = useRef<HTMLDivElement>(null);

  const summary = getRoomConfigSummary(rooms);
  const details = getRoomConfigDetails(rooms);

  const updateRoom = (
    index: number,
    field: "adults" | "children",
    delta: number
  ) => {
    const newRooms = [...localRooms];
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
    setLocalRooms(newRooms);
  };

  const updateChildAge = (roomIndex: number, childIndex: number, age: number) => {
    const newRooms = [...localRooms];
    const room = { ...newRooms[roomIndex] };
    room.childAges = [...room.childAges];
    room.childAges[childIndex] = age;
    newRooms[roomIndex] = room;
    setLocalRooms(newRooms);
  };

  const addRoom = () => {
    if (localRooms.length >= 4) return;
    setLocalRooms([...localRooms, { adults: 2, children: 0, childAges: [] }]);
  };

  const removeRoom = (index: number) => {
    if (localRooms.length <= 1) return;
    setLocalRooms(localRooms.filter((_, i) => i !== index));
  };

  const handleSearch = () => {
    onSearch(localRooms);
    setOpen(false);
  };

  const handleToggle = () => {
    if (!open) {
      setLocalRooms(rooms); // Reset to current when opening
    }
    setOpen(!open);
  };

  const totalGuests = localRooms.reduce(
    (sum, r) => sum + r.adults + r.children,
    0
  );

  return (
    <div className={cn("relative", className)} ref={ref}>
      {/* Summary Bar */}
      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{summary}</p>
            <p className="text-xs text-slate-500">{details.join(" • ")}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Düzenle
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Edit Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Misafir Sayısını Düzenle
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {localRooms.map((room, roomIndex) => (
                <div
                  key={roomIndex}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Oda {roomIndex + 1}
                    </span>
                    {localRooms.length > 1 && (
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
                    {/* Adults */}
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

                    {/* Children */}
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

                    {/* Child Ages */}
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
                                updateChildAge(roomIndex, childIndex, Number(e.target.value))
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

              {/* Add Room Button */}
              {localRooms.length < 4 && (
                <button
                  type="button"
                  onClick={addRoom}
                  className="w-full py-2.5 text-xs font-medium text-emerald-600 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  + Oda Ekle
                </button>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <Search className="w-4 h-4 mr-2" />
              {loading ? "Aranıyor..." : `Yeni Ara (${totalGuests} misafir)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
