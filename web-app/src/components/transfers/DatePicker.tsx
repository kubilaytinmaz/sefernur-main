// Kompakt Tarih Seçici Bileşeni - Bugün/Yarın butonları + küçük takvim

"use client";

import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Portal ile dropdown'ı body'ye render et
const DatePickerDropdown = ({
  isOpen,
  onClose,
  children,
  triggerRef
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.min(Math.max(rect.width, 300), 400),
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      {children}
    </div>,
    document.body
  );
};

export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDaysAhead?: number;
  label?: string;
  className?: string;
}

// Hızlı seçim seçenekleri - sadece Bugün ve Yarın
const quickSelections = [
  { label: "Bugün", offset: 0 },
  { label: "Yarın", offset: 1 },
] as const;

export function DatePicker({
  value,
  onChange,
  minDate = new Date(),
  maxDaysAhead = 90,
  label = "Tarih",
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value.getMonth());
  const [currentYear, setCurrentYear] = useState(value.getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('[role="dialog"][aria-label="Tarih seçici takvimi"]');
      const trigger = dropdownRef.current;
      
      if (dropdown && trigger &&
          !dropdown.contains(event.target as Node) &&
          !trigger.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Tarih formatla
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("tr-TR", { month: "short" });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString("tr-TR", { weekday: "short" });
    return `${day} ${month} ${year} • ${weekday}`;
  };

  // Hızlı seçim handler
  const handleQuickSelect = (offset: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newDate = new Date(today);
    newDate.setDate(today.getDate() + offset);

    onChange(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  // Yarın tarihini kontrol et
  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Ay değiştirme
  const changeMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Takvim günlerini oluştur
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);

    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; isDisabled: boolean }> = [];

    // Önceki ayın son günleri
    const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = startDay; i > 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i + 1);
      days.push({ date, isCurrentMonth: false, isDisabled: true });
    }

    // Bu ayın günleri
    const maxDate = new Date(minDate);
    maxDate.setDate(minDate.getDate() + maxDaysAhead);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isDisabled = date < minDate || date > maxDate;
      days.push({ date, isCurrentMonth: true, isDisabled });
    }

    // Sonraki ayın ilk günleri (42 gün = 6 hafta)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({ date, isCurrentMonth: false, isDisabled: true });
    }

    return days;
  };

  // Gün seçimi
  const handleDayClick = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;
    onChange(date);
    setIsOpen(false);
  };

  // Bugünü kontrol et
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Seçili günü kontrol et
  const isSelected = (date: Date) => {
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const calendarDays = generateCalendarDays();
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: isOpen ? 50 : 'auto' }}>
      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${label} seçin: ${formatDate(value)}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 flex items-center justify-between text-sm text-slate-900 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-600" aria-hidden="true" />
          <span className="truncate">{formatDate(value)}</span>
        </div>
        <div className="flex items-center gap-1">
          {isToday(value) && (
            <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded font-medium">
              Bugün
            </span>
          )}
          {isOpen && (
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* Dropdown - Portal ile body'ye render edilir */}
      <DatePickerDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={dropdownRef}
      >
        <div
          role="dialog"
          aria-label="Tarih seçici takvimi"
          className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden"
        >
          {/* Hızlı Seçimler - Bugün ve Yarın */}
          <div className="p-2 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
            <div className="grid grid-cols-2 gap-1.5">
              {quickSelections.map((quick) => (
                <button
                  key={quick.label}
                  type="button"
                  onClick={() => handleQuickSelect(quick.offset)}
                  className={`px-3 py-2 rounded-md font-medium text-sm transition-all ${
                    (quick.offset === 0 && isToday(value)) ||
                    (quick.offset === 1 && isTomorrow(value))
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white hover:bg-cyan-100 border border-cyan-200 text-slate-700'
                  }`}
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kompakt Takvim */}
          <div className="p-2">
            {/* Ay Seçici */}
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => changeMonth("prev")}
                aria-label="Önceki ay"
                className="p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              </button>
              
              <h3 className="text-xs font-bold text-slate-800 capitalize" aria-live="polite">
                {monthName}
              </h3>
              
              <button
                type="button"
                onClick={() => changeMonth("next")}
                aria-label="Sonraki ay"
                className="p-1 rounded hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              </button>
            </div>

            {/* Hafta Günleri */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-semibold text-slate-500 py-0.5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Günler */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, idx) => {
                const isTodayDate = isToday(day.date);
                const isSelectedDate = isSelected(day.date);
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                 
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDayClick(day.date, day.isDisabled)}
                    disabled={day.isDisabled}
                    aria-label={`${day.date.toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}${isSelectedDate ? " - Seçili" : ""}${isTodayDate ? " - Bugün" : ""}`}
                    aria-pressed={isSelectedDate}
                    className={`
                      aspect-square p-0.5 rounded text-[10px] font-medium transition-all relative
                      ${!day.isCurrentMonth ? "opacity-20" : "opacity-100"}
                      ${day.isDisabled ? "cursor-not-allowed opacity-30" : "cursor-pointer"}
                      ${
                        isSelectedDate
                          ? "bg-cyan-600 text-white"
                          : isTodayDate
                          ? "bg-cyan-100 text-cyan-900 ring-1 ring-cyan-400"
                          : isWeekend
                          ? "bg-amber-50 text-amber-900 hover:bg-amber-100"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    <span>{day.date.getDate()}</span>
                    {isTodayDate && !isSelectedDate && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-cyan-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Alt Bilgi - Kompakt */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-cyan-100 ring-1 ring-cyan-400" />
                    <span>Bugün</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-amber-50" />
                    <span>Hafta Sonu</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    onChange(today);
                    setCurrentMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                  }}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                  aria-label="Bugünün tarihine dön"
                >
                  Bugün
                </button>
              </div>
            </div>
          </div>
        </div>
      </DatePickerDropdown>
    </div>
  );
}

// Display name for debugging
DatePicker.displayName = "DatePicker";
