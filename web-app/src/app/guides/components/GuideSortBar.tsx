/**
 * Guide Sort Bar Component
 * Modern sıralama çubuğu bileşeni
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { GUIDE_SORT_OPTIONS, GUIDE_VIEW_MODES, type GuideSortOption, type GuideViewMode } from "@/lib/guides/constants";
import { Grid3X3, List, Map, SlidersHorizontal } from "lucide-react";
import { useCallback } from "react";

interface GuideSortBarProps {
  sortBy: GuideSortOption;
  viewMode: GuideViewMode;
  resultCount: number;
  onSortChange: (value: GuideSortOption) => void;
  onViewModeChange: (mode: GuideViewMode) => void;
  onFilterToggle: () => void;
  activeFilterCount?: number;
}

export function GuideSortBar({
  sortBy,
  viewMode,
  resultCount,
  onSortChange,
  onViewModeChange,
  onFilterToggle,
  activeFilterCount = 0,
}: GuideSortBarProps) {
  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSortChange(e.target.value as GuideSortOption);
    },
    [onSortChange]
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      {/* Left: Results count and Filter button */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onFilterToggle}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-md hover:shadow-violet-100 transition-all cursor-pointer group"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-600 group-hover:text-violet-600 transition-colors" />
          <span className="text-sm font-medium text-slate-700 group-hover:text-violet-700 transition-colors">
            Filtreler
          </span>
          {activeFilterCount > 0 && (
            <Badge className="bg-gradient-to-r from-violet-600 to-violet-700 text-white border-0 text-xs min-w-5 h-5 flex items-center justify-center shadow-sm shadow-violet-200">
              {activeFilterCount}
            </Badge>
          )}
        </button>

        <span className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{resultCount}</span> rehber bulundu
        </span>
      </div>

      {/* Right: Sort and View Mode */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="appearance-none h-10 pl-4 pr-10 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer hover:border-violet-200 transition-all shadow-sm"
          >
            {GUIDE_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-slate-200/80 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange(GUIDE_VIEW_MODES.GRID)}
            className={`p-2.5 transition-all cursor-pointer ${
              viewMode === GUIDE_VIEW_MODES.GRID
                ? "bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700"
                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            aria-label="Grid görünümü"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange(GUIDE_VIEW_MODES.LIST)}
            className={`p-2.5 transition-all cursor-pointer ${
              viewMode === GUIDE_VIEW_MODES.LIST
                ? "bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700"
                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            aria-label="Liste görünümü"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange(GUIDE_VIEW_MODES.MAP)}
            className={`p-2.5 transition-all cursor-pointer ${
              viewMode === GUIDE_VIEW_MODES.MAP
                ? "bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700"
                : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            aria-label="Harita görünümü"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
