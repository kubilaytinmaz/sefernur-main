// Lokasyon Seçim Bileşeni - Kategorize edilmiş dropdown

"use client";

import {
    LOCATIONS,
    LocationType,
    TransferLocation,
    getLocationIcon,
    getLocationTypeLabel
} from "@/lib/transfers/transfer-locations";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LocationSelectorProps {
  value: TransferLocation | null;
  onChange: (location: TransferLocation | null) => void;
  placeholder?: string;
  label?: string;
  availableLocations?: TransferLocation[];
  disabled?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Lokasyon seçin",
  label,
  availableLocations,
  disabled = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dropdown açıldığında arama inputuna focus
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Dışarı tıklamayı dinle
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Kullanılabilir lokasyonlar veya tüm lokasyonlar
  const locations = availableLocations || Object.values(LOCATIONS);

  // Arama filtreleme
  const filteredLocations = locations.filter((loc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query)
    );
  });

  // Tipe göre gruplandır
  const locationsByType: Record<LocationType, TransferLocation[]> = {
    airport: [],
    train_station: [],
    city: [],
    religious_site: [],
    tour_destination: [],
  };

  filteredLocations.forEach((loc) => {
    locationsByType[loc.type].push(loc);
  });

  // Boş olmayan tipleri sırala
  const nonEmptyTypes = (Object.keys(locationsByType) as LocationType[]).filter(
    (type) => locationsByType[type].length > 0
  );

  // Tipler için görüntülenme sırası
  const typeOrder: LocationType[] = ['airport', 'city', 'train_station', 'religious_site', 'tour_destination'];
  const sortedTypes = typeOrder.filter(type => nonEmptyTypes.includes(type));

  const handleSelect = (location: TransferLocation) => {
    onChange(location);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 mb-2 block">
          {label}
        </label>
      )}

      {/* Seçim Kutusu */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full h-11 rounded-lg border bg-white px-3 
          flex items-center justify-between gap-2
          text-left transition-all
          ${disabled 
            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed' 
            : 'border-slate-300 text-slate-900 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500'
          }
          ${isOpen ? 'ring-2 ring-cyan-500 border-cyan-500' : ''}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {value ? (
            <>
              <span className="text-lg">{getLocationIcon(value.type)}</span>
              <span className="truncate font-medium">{value.name}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <div
              onClick={handleClear}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <ChevronDown 
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </button>

      {/* Dropdown Menü */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
          {/* Arama Kutusu */}
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lokasyon ara..."
                className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Lokasyon Listesi */}
          <div className="max-h-80 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Lokasyon bulunamadı
              </div>
            ) : (
              sortedTypes.map((type) => (
                <div key={type}>
                  {/* Kategori Başlığı */}
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <span>{getLocationIcon(type)}</span>
                      <span>{getLocationTypeLabel(type)}</span>
                    </div>
                  </div>

                  {/* Lokasyonlar */}
                  {locationsByType[type].map((location) => {
                    const isSelected = value?.id === location.id;
                    
                    return (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => handleSelect(location)}
                        className={`
                          w-full px-4 py-2.5 flex items-center gap-3
                          text-left transition-colors
                          ${isSelected 
                            ? 'bg-cyan-50 text-cyan-900' 
                            : 'hover:bg-slate-50 text-slate-700'
                          }
                        `}
                      >
                        <span className="text-lg">{getLocationIcon(location.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {location.name}
                          </div>
                          {location.city !== location.name && (
                            <div className="text-xs text-slate-500 truncate">
                              {location.city}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
