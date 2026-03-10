/**
 * Guide Detail Skeleton Component
 * Rehber detay sayfası yüklenirken gösterilecek skeleton
 */

"use client";

export function GuideDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
      </div>

      {/* Image Gallery Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-64 sm:h-80 md:h-96 animate-pulse" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Badges */}
            <div className="animate-pulse">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="h-6 bg-slate-200 rounded-full w-20" />
                <div className="h-6 bg-slate-200 rounded-full w-16" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/3" />
            </div>

            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl w-32" />
              ))}
            </div>

            {/* Cards */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-5/6" />
                  <div className="h-4 bg-slate-100 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Price Card */}
              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 animate-pulse">
                <div className="h-3 bg-violet-200 rounded w-20 mb-2" />
                <div className="h-8 bg-violet-200 rounded w-32" />
              </div>

              {/* Reservation Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                      <div className="h-10 bg-slate-100 rounded" />
                    </div>
                  ))}
                  <div className="h-11 bg-violet-200 rounded-xl" />
                </div>
              </div>

              {/* Contact Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
