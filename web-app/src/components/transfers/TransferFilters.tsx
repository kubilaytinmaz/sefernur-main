// Transfer Filtreleme Bileşeni - Oteller sayfasındaki gibi
// Araç tipi, kapasite, fiyat aralığı ve özelliklere göre filtreleme

"use client";

import { amenityLabels, VehicleAmenity, VehicleType, vehicleTypeLabels } from "@/types/transfer";
import {
    Bluetooth,
    Car,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Shield,
    SlidersHorizontal,
    Tv,
    Usb,
    Users,
    Wifi,
    Wind
} from "lucide-react";
import { useState } from "react";

export interface TransferFiltersState {
  vehicleTypes: VehicleType[];
  capacityRange: { min: number; max: number };
  priceRange: { min: number; max: number };
  amenities: VehicleAmenity[];
  sortBy: 'price-asc' | 'price-desc' | 'capacity-asc' | 'rating-desc';
}

interface TransferFiltersProps {
  filters: TransferFiltersState;
  onChange: (filters: TransferFiltersState) => void;
  resultCount: number;
  minPrice?: number;
  maxPrice?: number;
}

const CAPACITY_OPTIONS = [
  { label: '1-3 Kişi', min: 1, max: 3 },
  { label: '4-6 Kişi', min: 4, max: 6 },
  { label: '7-10 Kişi', min: 7, max: 10 },
  { label: '11-20 Kişi', min: 11, max: 20 },
  { label: '20+ Kişi', min: 20, max: 999 },
];

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Fiyat (Artan)' },
  { value: 'price-desc', label: 'Fiyat (Azalan)' },
  { value: 'capacity-asc', label: 'Kapasite (Artan)' },
  { value: 'rating-desc', label: 'Değerlendirme' },
];

const AMENITY_ICONS: Record<VehicleAmenity, React.ReactNode> = {
  insurance: <Shield className="w-4 h-4" />,
  air_condition: <Wind className="w-4 h-4" />,
  wifi: <Wifi className="w-4 h-4" />,
  comfort: <Car className="w-4 h-4" />,
  usb: <Usb className="w-4 h-4" />,
  water: <DollarSign className="w-4 h-4" />,
  snacks: <DollarSign className="w-4 h-4" />,
  tv: <Tv className="w-4 h-4" />,
  bluetooth: <Bluetooth className="w-4 h-4" />,
  gps: <DollarSign className="w-4 h-4" />,
};

export function TransferFilters({
  filters,
  onChange,
  resultCount,
  minPrice = 0,
  maxPrice = 500,
}: TransferFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    vehicleType: true,
    capacity: true,
    price: true,
    amenities: false,
    sort: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleVehicleType = (type: VehicleType) => {
    const newTypes = filters.vehicleTypes.includes(type)
      ? filters.vehicleTypes.filter(t => t !== type)
      : [...filters.vehicleTypes, type];
    onChange({ ...filters, vehicleTypes: newTypes });
  };

  const toggleCapacity = (min: number, max: number) => {
    const isSame = filters.capacityRange.min === min && filters.capacityRange.max === max;
    onChange({
      ...filters,
      capacityRange: isSame ? { min: 0, max: 999 } : { min, max },
    });
  };

  const toggleAmenity = (amenity: VehicleAmenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: newAmenities });
  };

  const clearFilters = () => {
    onChange({
      vehicleTypes: [],
      capacityRange: { min: 0, max: 999 },
      priceRange: { min: minPrice, max: maxPrice },
      amenities: [],
      sortBy: 'price-asc',
    });
  };

  const hasActiveFilters = 
    filters.vehicleTypes.length > 0 ||
    filters.capacityRange.min > 0 ||
    filters.capacityRange.max < 999 ||
    filters.amenities.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-cyan-600" />
          <h3 className="font-semibold text-slate-900">Filtreler</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Sonuç Sayısı */}
      <div className="text-sm text-slate-600">
        {resultCount} araç bulundu
      </div>

      {/* Araç Tipi */}
      <div className="border-b border-slate-100 pb-4">
        <button
          onClick={() => toggleSection('vehicleType')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-slate-700">Araç Tipi</span>
          {expandedSections.vehicleType ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.vehicleType && (
          <div className="space-y-2 mt-2">
            {(Object.entries(vehicleTypeLabels) as [VehicleType, string][]).map(([type, label]) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.vehicleTypes.includes(type)}
                  onChange={() => toggleVehicleType(type)}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Kapasite */}
      <div className="border-b border-slate-100 pb-4">
        <button
          onClick={() => toggleSection('capacity')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-slate-700">Kapasite</span>
          {expandedSections.capacity ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.capacity && (
          <div className="space-y-2 mt-2">
            {CAPACITY_OPTIONS.map((option) => {
              const isSelected = filters.capacityRange.min === option.min && filters.capacityRange.max === option.max;
              return (
                <button
                  key={option.label}
                  onClick={() => toggleCapacity(option.min, option.max)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {option.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fiyat Aralığı */}
      <div className="border-b border-slate-100 pb-4">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-slate-700">Fiyat Aralığı (USD)</span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minPrice}
                max={maxPrice}
                value={filters.priceRange.min}
                onChange={(e) => onChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                placeholder="Min"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                min={minPrice}
                max={maxPrice}
                value={filters.priceRange.max}
                onChange={(e) => onChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                placeholder="Max"
              />
            </div>
            <div className="text-xs text-slate-500">
              ${filters.priceRange.min} - ${filters.priceRange.max}
            </div>
          </div>
        )}
      </div>

      {/* Özellikler */}
      <div className="border-b border-slate-100 pb-4">
        <button
          onClick={() => toggleSection('amenities')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-slate-700">Özellikler</span>
          {expandedSections.amenities ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.amenities && (
          <div className="space-y-2 mt-2">
            {(Object.entries(amenityLabels) as [VehicleAmenity, string][]).map(([amenity, label]) => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sıralama */}
      <div>
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-slate-700">Sıralama</span>
          {expandedSections.sort ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {expandedSections.sort && (
          <div className="space-y-2 mt-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ ...filters, sortBy: option.value as any })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.sortBy === option.value
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                    : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
