/**
 * Guide Filters Component
 * Rehber filtre paneli bileşeni
 */

"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { GUIDE_EXPERIENCE_RANGES, GUIDE_FILTER_PRESETS, GUIDE_PRICE_RANGES } from "@/lib/guides/constants";
import { languageLabels, specialtyLabels } from "@/types/guide";
import { Award, ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface GuideFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function GuideFilters({ isOpen, onClose, children }: GuideFiltersProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Filters Panel */}
      <aside
        className={`
          fixed lg:sticky top-20 left-0 z-50 lg:z-10
          h-[calc(100vh-5rem)] lg:h-auto
          w-80 lg:w-72
          bg-white lg:bg-transparent
          border-r lg:border-0 border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Filtreler"
      >
        <div className="h-full overflow-y-auto p-4 lg:p-0">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-violet-600" />
              <h2 className="text-lg font-semibold text-slate-900">Filtreler</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Filtreleri kapat"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {children}
        </div>
      </aside>
    </>
  );
}

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="border-slate-200 bg-white mb-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isOpen && <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>}
    </Card>
  );
}

interface CheckboxFilterProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}

export function CheckboxFilter({ label, checked, onChange, count }: CheckboxFilterProps) {
  return (
    <label className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
      />
      <span className="flex-1 text-sm text-slate-700">{label}</span>
      {count !== undefined && <span className="text-xs text-slate-400">({count})</span>}
    </label>
  );
}

interface SpecialtyFiltersProps {
  selected: string[];
  onChange: (specialties: string[]) => void;
}

export function SpecialtyFilters({ selected, onChange }: SpecialtyFiltersProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(specialtyLabels).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => toggle(key)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer
            ${
              selected.includes(key)
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface LanguageFiltersProps {
  selected: string[];
  onChange: (languages: string[]) => void;
}

export function LanguageFilters({ selected, onChange }: LanguageFiltersProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((l) => l !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1">
      {Object.entries(languageLabels).map(([key, label]) => (
        <CheckboxFilter
          key={key}
          label={label}
          checked={selected.includes(key)}
          onChange={(checked) => {
            if (checked) {
              onChange([...selected, key]);
            } else {
              onChange(selected.filter((l) => l !== key));
            }
          }}
        />
      ))}
    </div>
  );
}

interface PriceRangeFilterProps {
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
}

export function PriceRangeFilter({ value, onChange }: PriceRangeFilterProps) {
  const selectedRange = GUIDE_PRICE_RANGES.find(
    (r) => r.min === value.min && r.max === value.max
  );

  return (
    <div className="space-y-2">
      {GUIDE_PRICE_RANGES.map((range) => (
        <button
          key={`${range.min}-${range.max}`}
          type="button"
          onClick={() => onChange({ min: range.min, max: range.max })}
          className={`
            w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
            ${
              selectedRange?.min === range.min && selectedRange?.max === range.max
                ? "bg-violet-50 text-violet-700 border border-violet-200 font-medium"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

interface ExperienceFilterProps {
  value: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
}

export function ExperienceFilter({ value, onChange }: ExperienceFilterProps) {
  const selectedRange = GUIDE_EXPERIENCE_RANGES.find(
    (r) => r.min === value.min && r.max === value.max
  );

  return (
    <div className="space-y-2">
      {GUIDE_EXPERIENCE_RANGES.map((range) => (
        <button
          key={`${range.min}-${range.max}`}
          type="button"
          onClick={() => onChange({ min: range.min, max: range.max })}
          className={`
            w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
            ${
              selectedRange?.min === range.min && selectedRange?.max === range.max
                ? "bg-violet-50 text-violet-700 border border-violet-200 font-medium"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
            }
          `}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

interface RatingFilterProps {
  value: number | undefined;
  onChange: (rating: number | undefined) => void;
}

export function RatingFilter({ value, onChange }: RatingFilterProps) {
  const ratings = [4.5, 4.0, 3.5, 3.0];

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={`
          w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
          ${
            value === undefined
              ? "bg-violet-50 text-violet-700 border border-violet-200 font-medium"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
          }
        `}
      >
        Tüm puanlar
      </button>
      {ratings.map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className={`
            w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer flex items-center gap-2
            ${
              value === rating
                ? "bg-violet-50 text-violet-700 border border-violet-200 font-medium"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent"
            }
          `}
        >
          <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
          {rating}+ puan
        </button>
      ))}
    </div>
  );
}

interface FilterPresetButtonsProps {
  onSelectPreset: (preset: typeof GUIDE_FILTER_PRESETS[number]) => void;
}

export function FilterPresetButtons({ onSelectPreset }: FilterPresetButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {GUIDE_FILTER_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelectPreset(preset)}
          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 text-xs font-medium border border-violet-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

interface ClearFiltersButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function ClearFiltersButton({ onClick, disabled }: ClearFiltersButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      className="w-full mt-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Filtreleri Temizle
    </Button>
  );
}
