/**
 * Guide Sort Bar Component
 * Rehber sıralama çubuğu bileşeni
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filtreler</span>
          {activeFilterCount > 0 && (
            <Badge className="bg-violet-600 text-white border-0 text-xs min-w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </button>

        <span className="text-sm text-slate-500">
          <span className="font-medium text-slate-900">{resultCount}</span> rehber bulundu
        </span>
      </div>

      {/* Right: Sort and View Mode */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="flex-1 sm:flex-none h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
        >
          {GUIDE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange(GUIDE_VIEW_MODES.GRID)}
            className={`p-2 transition-colors cursor-pointer ${
              viewMode === GUIDE_VIEW_MODES.GRID
                ? "bg-violet-50 text-violet-700"
                : "bg-white text-slate-400 hover:text-slate-600"
            }`}
            aria-label="Grid görünümü"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange(GUIDE_VIEW_MODES.LIST)}
            className={`p-2 transition-colors cursor-pointer ${
              viewMode === GUIDE_VIEW_MODES.LIST
                ? "bg-violet-50 text-violet-700"
                : "bg-white text-slate-400 hover:text-slate-600"
            }`}
            aria-label="Liste görünümü"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange(GUIDE_VIEW_MODES.MAP)}
            className={`p-2 transition-colors cursor-pointer ${
              viewMode === GUIDE_VIEW_MODES.MAP
                ? "bg-violet-50 text-violet-700"
                : "bg-white text-slate-400 hover:text-slate-600"
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
