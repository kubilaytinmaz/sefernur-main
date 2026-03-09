"use client";

import type { CampaignModel } from "@/types/campaign";
import { campaignTypeLabels } from "@/types/campaign";
import { ArrowRight, Gift, Percent, Sparkles, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════
   KAMPANYA KARTLARI - Firebase Campaign verileriyle çalışır
   Aurora UI stili ile premium görünüm
   ═══════════════════════════════════════════════════════ */

interface CampaignCardsProps {
  campaigns: CampaignModel[];
  isLoading?: boolean;
}

// Aurora UI Gradient şemaları - daha canlı ve akıcı
const TYPE_GRADIENTS: Record<string, string> = {
  tour: "from-emerald-400 via-cyan-500 to-blue-500",
  hotel: "from-blue-400 via-indigo-500 to-purple-500",
  transfer: "from-violet-400 via-purple-500 to-pink-500",
  car: "from-amber-400 via-orange-500 to-red-500",
  guide: "from-rose-400 via-fuchsia-500 to-orange-400",
};

const FALLBACK_GRADIENTS = [
  "from-rose-400 via-fuchsia-500 to-orange-400",
  "from-emerald-400 via-cyan-500 to-blue-500",
  "from-violet-400 via-purple-500 to-pink-500",
  "from-blue-400 via-indigo-500 to-purple-500",
  "from-amber-400 via-orange-500 to-red-500",
] as const;

// Aurora glow efektleri
const AURORA_GLOWS = [
  "from-rose-300/40 via-fuchsia-300/30 to-orange-200/20",
  "from-emerald-300/40 via-cyan-300/30 to-blue-200/20",
  "from-violet-300/40 via-purple-300/30 to-pink-200/20",
  "from-blue-300/40 via-indigo-300/30 to-purple-200/20",
  "from-amber-300/40 via-orange-300/30 to-red-200/20",
] as const;

export function CampaignCards({ campaigns, isLoading }: CampaignCardsProps) {
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="h-8 w-64 bg-slate-200 animate-pulse mx-auto rounded-lg mb-4" />
          <div className="h-6 w-96 bg-slate-200 animate-pulse mx-auto rounded-lg" />
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-h-[320px] rounded-3xl bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  // En fazla 3 kampanya göster
  const displayCampaigns = campaigns.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200/30 via-fuchsia-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/30 via-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Özel Kampanyalar
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {displayCampaigns.map((campaign, index) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            index={index}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      {campaigns.length > 3 && (
        <div className="mt-12 text-center">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white font-semibold hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all hover:gap-3 shadow-lg hover:shadow-xl cursor-pointer"
          >
            Tüm Kampanyaları Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   KAMPANYA KARTI
   ═══════════════════════════════════════════════════════ */

interface CampaignCardProps {
  campaign: CampaignModel;
  index: number;
}

function CampaignCard({ campaign, index }: CampaignCardProps) {
  const gradient =
    TYPE_GRADIENTS[campaign.type] ||
    FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  const auroraGlow = AURORA_GLOWS[index % AURORA_GLOWS.length];
  const typeLabel = campaignTypeLabels[campaign.type] ?? campaign.type;

  return (
    <Link
      href={`/campaigns`}
      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block cursor-pointer"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 pointer-events-none">
        {campaign.imageUrl ? (
          <Image
            src={campaign.imageUrl}
            alt={campaign.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            draggable={false}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
      </div>

      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} ${
          campaign.imageUrl ? "opacity-85" : "opacity-100"
        } group-hover:opacity-90 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Aurora Glow Effect - Premium Look */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className={`absolute inset-0 bg-gradient-to-br ${auroraGlow} mix-blend-overlay opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none`} />

      {/* Animated Aurora Border */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${auroraGlow} blur-xl`} />
      </div>

      {/* Decorative Elements - Enhanced */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-24 -translate-x-24 group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />
      
      {/* Floating Particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full blur-sm group-hover:animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
      <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-white/40 rounded-full blur-sm group-hover:animate-ping pointer-events-none" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />

      {/* Content */}
      <div className="relative z-10 p-6 h-full min-h-[320px] flex flex-col">
        {/* Badge - Enhanced */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white text-xs font-semibold shadow-lg">
            <Gift className="w-3.5 h-3.5" />
            {typeLabel} Kampanyası
          </span>
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-white/80" />
            <Tag className="w-4 h-4 text-white/60" />
          </div>
        </div>

        {/* Icon area - Enhanced */}
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl" />
          <div className="relative w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight line-clamp-2 drop-shadow-md">
            {campaign.title}
          </h3>
          <p className="text-white/95 text-sm leading-relaxed line-clamp-3 drop-shadow-sm">
            {campaign.shortDescription}
          </p>
        </div>

        {/* CTA Button - Enhanced */}
        <div className="mt-4 pt-4 border-t border-white/25">
          <div className="flex items-center justify-between group-hover:gap-2 transition-all">
            <span className="text-white font-semibold text-base drop-shadow-sm">
              Detayları Gör
            </span>
            <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-white/35 group-hover:scale-110 transition-all shadow-lg">
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect - Enhanced Shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      </div>

      {/* Focus Ring for Accessibility */}
      <div className="absolute inset-0 rounded-3xl ring-2 ring-white/50 ring-offset-2 ring-offset-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
    </Link>
  );
}
