/**
 * Guide Hero Component
 * Modern hero bölümü bileşeni
 */

"use client";

import { GUIDE_FILTER_PRESETS } from "@/lib/guides/constants";
import { Search, Sparkles, Star, X } from "lucide-react";
import { useCallback } from "react";

interface GuideHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPresetApply: (preset: typeof GUIDE_FILTER_PRESETS[number]) => void;
  totalGuides: number;
}

export function GuideHero({ searchQuery, onSearchChange, onPresetApply, totalGuides }: GuideHeroProps) {
  const handleClearSearch = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Animated Gradient Blobs */}
      <div
        className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "4s" }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "6s", animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: "8s", animationDelay: "1s" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Badge */}
        <div className="flex items-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold text-violet-300 tracking-wide uppercase">
              Profesyonel Rehberlik Hizmeti
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          Rehber
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-purple-400 mt-2">
            Kiralama
          </span>
        </h1>

        {/* Description */}
        <p className="mt-4 text-violet-200/80 max-w-2xl text-lg leading-relaxed mb-8">
          Deneyimli ve sertifikalı rehberler ile umre ve hac yolculuğunuzu daha anlamlı kılın.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-2xl">
          <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:shadow-violet-500/10 hover:border-white/30 transition-all">
            <div className="pl-5 pr-3">
              <Search className="w-5 h-5 text-violet-300" />
            </div>
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rehber adı, uzmanlık veya şehir ara..."
              className="flex-1 bg-transparent text-white placeholder-white/60 py-4 pr-4 outline-none text-base"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="pr-4 text-white/60 hover:text-white cursor-pointer transition-colors"
                aria-label="Aramayı temizle"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div className="mt-6 flex flex-wrap gap-2">
          {GUIDE_FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetApply(preset)}
              className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-violet-200 hover:bg-white/20 hover:text-white hover:border-white/20 transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
          <StatCard value={totalGuides} label="Aktif Rehber" color="violet" />
          <StatCard value="8+" label="Dil Seçeneği" color="fuchsia" />
          <StatCard value="4.8" label="Ortalama Puan" color="purple" icon={<Star className="w-4 h-4 fill-amber-400 text-amber-400" />} />
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 md:h-16 fill-slate-50"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path d="M0,64 C480,120 960,120 1440,64 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}

interface StatCardProps {
  value: number | string;
  label: string;
  color: "violet" | "fuchsia" | "purple";
  icon?: React.ReactNode;
}

function StatCard({ value, label, color, icon }: StatCardProps) {
  const colorClasses = {
    violet: "text-violet-400",
    fuchsia: "text-fuchsia-400",
    purple: "text-purple-400",
  };

  return (
    <div className="text-center group">
      <div className={`text-2xl md:text-3xl font-bold ${colorClasses[color]} mb-1 group-hover:scale-110 transition-transform`}>
        {icon || value}
      </div>
      <div className="text-xs text-violet-300/70">{label}</div>
    </div>
  );
}
