/**
 * Guides Page - Modern Redesign
 * Rehber listesi sayfası - modern yeniden tasarım
 */

"use client";

import { EmptyState, ErrorState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { getActiveGuides } from "@/lib/firebase/domain";
import {
  GUIDE_FILTER_PRESETS,
  GUIDE_VIEW_MODES,
  type GuideSortOption,
  type GuideViewMode,
} from "@/lib/guides/constants";
import { filterGuides, getActiveFilterCount, type GuideFilters as GuideFiltersType } from "@/lib/guides/filtering";
import { sortGuides } from "@/lib/guides/sorting";
import { useQuery } from "@tanstack/react-query";
import { Award, Map, Star, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { getComparisonData, useGuideCompare } from "@/hooks/guides/useGuideCompare";
import { useGuideFavorites } from "@/hooks/guides/useGuideFavorites";
import { GuideCard } from "./components/GuideCard";
import { GuideComparePanel } from "./components/GuideComparePanel";
import {
  ClearFiltersButton,
  ExperienceFilter,
  FilterPresetButtons,
  FilterSection,
  GuideFilters,
  LanguageFilters,
  PriceRangeFilter,
  RatingFilter,
  SpecialtyFilters,
} from "./components/GuideFilters";
import { GuideHero } from "./components/GuideHero";
import { GuideSortBar } from "./components/GuideSortBar";
import { GuideGridSkeleton, GuideListViewSkeleton } from "./components/skeletons/GuideCardSkeleton";

/* ═══════════════════════════════════════════
    GUIDES PAGE
    ═══════════════════════════════════════════ */

export default function GuidesPage() {
  /* ── State ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<GuideSortOption>("recommended");
  const [viewMode, setViewMode] = useState<GuideViewMode>(GUIDE_VIEW_MODES.GRID);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [experienceRange, setExperienceRange] = useState<{ min?: number; max?: number }>({});
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [popularOnly, setPopularOnly] = useState(false);

  // Custom hooks
  const { toggleFavorite, isFavorite } = useGuideFavorites();
  const { compareIds, toggleCompare, isComparing, clearCompare, removeFromCompare } = useGuideCompare();

  /* ── Data ── */
  const guidesQuery = useQuery({
    queryKey: ["guides", "active"],
    queryFn: () => getActiveGuides(),
  });

  /* ── Build filters object ── */
  const filters = useMemo<GuideFiltersType>(
    () => ({
      searchQuery,
      specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
      languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
      priceMin: priceRange.min,
      priceMax: priceRange.max !== Infinity ? priceRange.max : undefined,
      experienceMin: experienceRange.min,
      experienceMax: experienceRange.max !== Infinity ? experienceRange.max : undefined,
      minRating,
      certified: certifiedOnly || undefined,
      popular: popularOnly || undefined,
    }),
    [
      searchQuery,
      selectedSpecialties,
      selectedLanguages,
      priceRange,
      experienceRange,
      minRating,
      certifiedOnly,
      popularOnly,
    ]
  );

  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  /* ── Processed data ── */
  const processedGuides = useMemo(() => {
    const allGuides = guidesQuery.data ?? [];
    const filtered = filterGuides(allGuides, filters);
    return sortGuides(filtered, sortBy);
  }, [guidesQuery.data, filters, sortBy]);

  /* ── Comparison data ── */
  const comparisonGuides = useMemo(() => {
    return getComparisonData(processedGuides, compareIds);
  }, [processedGuides, compareIds]);

  /* ── Preset handler ── */
  const applyPreset = useCallback(
    (preset: typeof GUIDE_FILTER_PRESETS[number]) => {
      if (preset.filters.specialties) {
        setSelectedSpecialties([...preset.filters.specialties]);
      }
      if (preset.filters.languages) {
        setSelectedLanguages([...preset.filters.languages]);
      }
      if (preset.filters.minRating !== undefined) {
        setMinRating(preset.filters.minRating);
      }
    },
    []
  );

  /* ── Clear all filters ── */
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedSpecialties([]);
    setSelectedLanguages([]);
    setPriceRange({});
    setExperienceRange({});
    setMinRating(undefined);
    setCertifiedOnly(false);
    setPopularOnly(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ Hero Section ═══ */}
      <GuideHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPresetApply={applyPreset}
        totalGuides={guidesQuery.data?.length ?? 0}
      />

      {/* ═══ Content ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sort Bar */}
        <GuideSortBar
          sortBy={sortBy}
          viewMode={viewMode}
          resultCount={processedGuides.length}
          onSortChange={setSortBy}
          onViewModeChange={setViewMode}
          onFilterToggle={() => setFiltersOpen(!filtersOpen)}
          activeFilterCount={activeFilterCount}
        />

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-slate-500">Aktif filtreler:</span>
            {selectedSpecialties.map((s) => (
              <Badge
                key={s}
                className="bg-violet-50 text-violet-700 border-violet-200 gap-1 cursor-pointer hover:bg-violet-100 transition-colors"
                onClick={() => setSelectedSpecialties((prev) => prev.filter((sp) => sp !== s))}
              >
                {s}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            {selectedLanguages.map((l) => (
              <Badge
                key={l}
                className="bg-blue-50 text-blue-700 border-blue-200 gap-1 cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => setSelectedLanguages((prev) => prev.filter((lang) => lang !== l))}
              >
                {l}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            {minRating !== undefined && (
              <Badge
                className="bg-amber-50 text-amber-700 border-amber-200 gap-1 cursor-pointer hover:bg-amber-100 transition-colors"
                onClick={() => setMinRating(undefined)}
              >
                <Star className="w-3 h-3" /> {minRating}+
                <X className="w-3 h-3" />
              </Badge>
            )}
            {certifiedOnly && (
              <Badge
                className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 cursor-pointer hover:bg-emerald-100 transition-colors"
                onClick={() => setCertifiedOnly(false)}
              >
                <Award className="w-3 h-3" /> Sertifikalı
                <X className="w-3 h-3" />
              </Badge>
            )}
            {(priceRange.min !== undefined || priceRange.max !== undefined) && (
              <Badge
                className="bg-slate-100 text-slate-700 border-slate-200 gap-1 cursor-pointer hover:bg-slate-200 transition-colors"
                onClick={() => setPriceRange({})}
              >
                Fiyat aralığı
                <X className="w-3 h-3" />
              </Badge>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-violet-600 hover:text-violet-700 font-medium cursor-pointer underline transition-colors"
            >
              Tümünü Temizle
            </button>
          </div>
        )}

        {/* Main Layout: Filters + Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <GuideFilters isOpen={filtersOpen} onClose={() => setFiltersOpen(false)}>
            {/* Quick Presets */}
            <FilterPresetButtons presets={GUIDE_FILTER_PRESETS} onSelectPreset={applyPreset} />

            {/* Specialty Filter */}
            <FilterSection title="Uzmanlık Alanları" defaultOpen icon={<Map className="w-4 h-4" />}>
              <SpecialtyFilters selected={selectedSpecialties} onChange={setSelectedSpecialties} />
            </FilterSection>

            {/* Language Filter */}
            <FilterSection title="Diller" defaultOpen icon={<Map className="w-4 h-4" />}>
              <LanguageFilters selected={selectedLanguages} onChange={setSelectedLanguages} />
            </FilterSection>

            {/* Price Filter */}
            <FilterSection title="Günlük Ücret" defaultOpen={false} icon={<Award className="w-4 h-4" />}>
              <PriceRangeFilter value={priceRange} onChange={setPriceRange} />
            </FilterSection>

            {/* Experience Filter */}
            <FilterSection title="Deneyim" defaultOpen={false} icon={<Award className="w-4 h-4" />}>
              <ExperienceFilter value={experienceRange} onChange={setExperienceRange} />
            </FilterSection>

            {/* Rating Filter */}
            <FilterSection title="Minimum Puan" defaultOpen={false} icon={<Star className="w-4 h-4" />}>
              <RatingFilter value={minRating} onChange={setMinRating} />
            </FilterSection>

            {/* Quick Toggles */}
            <FilterSection title="Diğer" defaultOpen={false}>
              <div className="space-y-2">
                <label className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-violet-50/50 cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    checked={certifiedOnly}
                    onChange={(e) => setCertifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 transition-colors"
                  />
                  <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Sadece Sertifikalı</span>
                </label>
                <label className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-violet-50/50 cursor-pointer transition-colors group">
                  <input
                    type="checkbox"
                    checked={popularOnly}
                    onChange={(e) => setPopularOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 transition-colors"
                  />
                  <span className="flex-1 text-sm text-slate-700 group-hover:text-slate-900 transition-colors">Sadece Popüler</span>
                </label>
              </div>
            </FilterSection>

            {/* Clear Filters */}
            <ClearFiltersButton onClick={clearAllFilters} disabled={activeFilterCount === 0} />
          </GuideFilters>

          {/* Content Area */}
          <div className="flex-1 min-w-0 pb-20">
            {/* Loading */}
            {guidesQuery.isLoading && (
              <>
                {viewMode === GUIDE_VIEW_MODES.GRID ? (
                  <GuideGridSkeleton count={6} />
                ) : (
                  <GuideListViewSkeleton count={6} />
                )}
              </>
            )}

            {/* Error */}
            {guidesQuery.isError && (
              <ErrorState
                title="Rehber listesi alınamadı"
                description="Lütfen daha sonra tekrar deneyin."
                onRetry={() => guidesQuery.refetch()}
              />
            )}

            {/* Empty State */}
            {!guidesQuery.isLoading && !guidesQuery.isError && processedGuides.length === 0 && (
              <EmptyState
                title="Rehber bulunamadı"
                description={
                  activeFilterCount > 0
                    ? "Filtrelerinizi değiştirerek tekrar deneyebilirsiniz."
                    : "Henüz aktif rehber bulunmuyor."
                }
              />
            )}

            {/* Map View (placeholder) */}
            {viewMode === GUIDE_VIEW_MODES.MAP &&
              !guidesQuery.isLoading &&
              !guidesQuery.isError &&
              processedGuides.length > 0 && (
                <div className="h-96 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Map className="w-12 h-12 text-violet-200 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">Harita Görünümü</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Harita özelliği yakında aktif olacaktır.
                    </p>
                  </div>
                </div>
              )}

            {/* Grid View */}
            {viewMode === GUIDE_VIEW_MODES.GRID &&
              !guidesQuery.isLoading &&
              !guidesQuery.isError &&
              processedGuides.length > 0 && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {processedGuides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      viewMode="grid"
                      onFavoriteToggle={toggleFavorite}
                      onCompareToggle={toggleCompare}
                      isFavorite={isFavorite(guide.id)}
                      isComparing={isComparing(guide.id)}
                    />
                  ))}
                </div>
              )}

            {/* List View */}
            {viewMode === GUIDE_VIEW_MODES.LIST &&
              !guidesQuery.isLoading &&
              !guidesQuery.isError &&
              processedGuides.length > 0 && (
                <div className="space-y-4">
                  {processedGuides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      viewMode="list"
                      onFavoriteToggle={toggleFavorite}
                      onCompareToggle={toggleCompare}
                      isFavorite={isFavorite(guide.id)}
                      isComparing={isComparing(guide.id)}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Compare Panel */}
      {comparisonGuides.length > 0 && (
        <GuideComparePanel
          guides={comparisonGuides}
          onRemove={removeFromCompare}
          onClear={clearCompare}
        />
      )}
    </div>
  );
}
