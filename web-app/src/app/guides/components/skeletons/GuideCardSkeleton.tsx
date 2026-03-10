/**
 * Guide Card Skeleton Component
 * Rehber kartı yüklenirken gösterilecek skeleton
 */

"use client";

export function GuideCardSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return <GuideListSkeleton />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200" />

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Name and Location */}
        <div>
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>

        {/* Info Chips */}
        <div className="flex flex-wrap gap-1.5">
          <div className="h-6 bg-slate-100 rounded-lg w-20" />
          <div className="h-6 bg-slate-100 rounded-lg w-16" />
        </div>

        {/* Price and Certification */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="h-3 bg-slate-100 rounded w-12 mb-1" />
            <div className="h-6 bg-slate-200 rounded w-24" />
          </div>
          <div className="h-6 bg-slate-100 rounded-full w-20" />
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

function GuideListSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse">
      {/* Image */}
      <div className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-12" />
        </div>

        <div className="h-10 bg-slate-100 rounded" />

        <div className="flex flex-wrap gap-1.5">
          <div className="h-6 bg-slate-100 rounded-full w-16" />
          <div className="h-6 bg-slate-100 rounded-full w-20" />
          <div className="h-6 bg-slate-100 rounded-full w-16" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-3 bg-slate-100 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-16" />
          </div>
          <div className="h-5 bg-slate-200 rounded w-24" />
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function GuideGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <GuideCardSkeleton key={i} viewMode="grid" />
      ))}
    </div>
  );
}

export function GuideListViewSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <GuideCardSkeleton key={i} viewMode="list" />
      ))}
    </div>
  );
}
