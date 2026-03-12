import { TransferDailyAvailability, TransferModel } from "@/types/transfer";
import { Check, DollarSign, X } from "lucide-react";
import { useState } from "react";

interface AvailabilityTabProps {
  transfer: Partial<TransferModel>;
  onUpdate: (updates: Partial<TransferModel>) => void;
}

export function AvailabilityTab({ transfer, onUpdate }: AvailabilityTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"available" | "blocked" | null>(null);
  const [specialPrice, setSpecialPrice] = useState<number | null>(null);

  const availability = transfer.availability || {};
  const capacity = transfer.capacity || 4;

  // Takvim günlerini oluştur
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean } | null> = [];

    // Önceki aydan günler
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Mevcut aydan günler
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Sonraki aydan günler (haftayı tamamlamak için)
    const remainingDays = 42 - days.length; // 6 hafta x 7 gün
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const getDayAvailability = (date: Date): TransferDailyAvailability | null => {
    const key = formatDateKey(date);
    return availability[key] || null;
  };

  const toggleDateAvailability = (date: Date) => {
    const key = formatDateKey(date);
    const current = availability[key];
    const newAvailability: TransferDailyAvailability = current
      ? { ...current, isAvailable: !current.isAvailable }
      : {
          date: key,
          isAvailable: true,
          availableSeats: capacity,
        };

    onUpdate({
      availability: {
        ...availability,
        [key]: newAvailability,
      },
    });
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedDates.size === 0) return;

    const newAvailability = { ...availability };
    selectedDates.forEach((dateKey) => {
      if (bulkAction === "available") {
        newAvailability[dateKey] = {
          date: dateKey,
          isAvailable: true,
          availableSeats: capacity,
          specialPrice: specialPrice || undefined,
        };
      } else {
        newAvailability[dateKey] = {
          date: dateKey,
          isAvailable: false,
          availableSeats: 0,
        };
      }
    });

    onUpdate({ availability: newAvailability });
    setSelectedDates(new Set());
    setBulkAction(null);
    setSpecialPrice(null);
  };

  const clearAllAvailability = () => {
    if (confirm("Tüm müsaitlik verilerini temizlemek istediğinize emin misiniz?")) {
      onUpdate({ availability: {} });
    }
  };

  const calendarDays = getCalendarDays();
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Toplu İşlemler</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedDates.size > 0
              ? `${selectedDates.size} gün seçili`
              : "Takvimden gün seçin"}
          </span>
          {selectedDates.size > 0 && (
            <>
              <button
                onClick={() => setBulkAction("available")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  bulkAction === "available"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <Check className="mr-1 inline h-3 w-3" />
                Müsait Yap
              </button>
              <button
                onClick={() => setBulkAction("blocked")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  bulkAction === "blocked"
                    ? "bg-red-600 text-white"
                    : "border border-red-600 text-red-600 hover:bg-red-50"
                }`}
              >
                <X className="mr-1 inline h-3 w-3" />
                Bloke Et
              </button>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Özel fiyat"
                  value={specialPrice || ""}
                  onChange={(e) => setSpecialPrice(parseFloat(e.target.value) || null)}
                  className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleBulkAction}
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
              >
                Uygula
              </button>
              <button
                onClick={() => {
                  setSelectedDates(new Set());
                  setBulkAction(null);
                  setSpecialPrice(null);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                İptal
              </button>
            </>
          )}
          <button
            onClick={clearAllAvailability}
            className="ml-auto rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Tümünü Temizle
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Month Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            →
          </button>
        </div>

        {/* Week Days */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, index) => {
            if (!dayInfo) return <div key={index} />;

            const { date, isCurrentMonth } = dayInfo;
            const dateKey = formatDateKey(date);
            const dayAvailability = getDayAvailability(date);
            const isSelected = selectedDates.has(dateKey);
            const isToday = dateKey === formatDateKey(new Date());
            const isPast = date.getTime() < new Date().setHours(0, 0, 0, 0);

            let bgClass = "bg-white";
            let textClass = "text-gray-900";
            let borderClass = "border border-gray-200";

            if (!isCurrentMonth) {
              bgClass = "bg-gray-50";
              textClass = "text-gray-400";
            } else if (isPast) {
              bgClass = "bg-gray-100";
              textClass = "text-gray-400";
            } else if (dayAvailability?.isAvailable === false) {
              bgClass = "bg-red-50";
              borderClass = "border-red-200";
            } else if (dayAvailability?.specialPrice) {
              bgClass = "bg-amber-50";
              borderClass = "border-amber-200";
            } else if (dayAvailability?.isAvailable) {
              bgClass = "bg-emerald-50";
              borderClass = "border-emerald-200";
            }

            if (isSelected) {
              borderClass = "ring-2 ring-emerald-500";
            }

            if (isToday) {
              borderClass += " ring-2 ring-blue-500";
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (!isPast && isCurrentMonth) {
                    setSelectedDates((prev) => {
                      const next = new Set(prev);
                      if (next.has(dateKey)) {
                        next.delete(dateKey);
                      } else {
                        next.add(dateKey);
                      }
                      return next;
                    });
                  }
                }}
                disabled={isPast || !isCurrentMonth}
                className={`relative aspect-square rounded-lg ${bgClass} ${borderClass} p-1 text-center transition-colors ${
                  !isPast && isCurrentMonth ? "hover:opacity-80 cursor-pointer" : "cursor-not-allowed"
                }`}
              >
                <span className={`text-xs font-medium ${textClass}`}>
                  {date.getDate()}
                </span>
                {dayAvailability?.specialPrice && (
                  <div className="absolute bottom-0.5 right-0.5 text-[8px] font-bold text-amber-600">
                    ₺
                  </div>
                )}
                {dayAvailability?.isAvailable === false && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <X className="h-3 w-3 text-red-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded border border-emerald-200 bg-emerald-50" />
            <span>Müsait</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded border border-red-200 bg-red-50" />
            <span>Bloke</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded border border-amber-200 bg-amber-50" />
            <span>Özel Fiyat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 rounded border border-gray-200 bg-gray-100" />
            <span>Geçmiş</span>
          </div>
        </div>
      </div>

      {/* Special Prices List */}
      {Object.values(availability).filter((a) => a.specialPrice).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Özel Fiyatlı Tarihler</h3>
          <div className="space-y-2">
            {Object.values(availability)
              .filter((a) => a.specialPrice)
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((a) => (
                <div
                  key={a.date}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2"
                >
                  <span className="text-sm font-medium text-gray-900">{a.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-700">
                      ₺{a.specialPrice?.toLocaleString("tr-TR")}
                    </span>
                    <button
                      onClick={() => {
                        const newAvailability = { ...availability };
                        delete newAvailability[a.date].specialPrice;
                        onUpdate({ availability: newAvailability });
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
