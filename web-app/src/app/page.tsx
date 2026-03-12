"use client";

import { CampaignCards } from "@/components/CampaignCards";
import { UpcomingUmrahTours } from "@/components/tours/UpcomingUmrahTours";
import { CompactTransferCard } from "@/components/transfers/CompactTransferCard";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import {
  getActiveCampaigns,
  getActiveGuides,
  getActiveTransfers,
  getPlacesByCity,
  getTopReviews,
} from "@/lib/firebase/domain";
import {
  getCurrentTemp,
  getMedineWeather,
  getMekkeWeather,
  getMonthLabels,
} from "@/lib/weather";
import "@/styles/animations.css";
import type { GuideModel } from "@/types/guide";
import type { PlaceModel } from "@/types/place";
import type { UserReview } from "@/types/review";
import { reviewTypeLabels } from "@/types/review";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Bus,
  Car,
  ChevronLeft,
  ChevronRight,
  Compass,
  Hotel,
  MapPin,
  Plane,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Thermometer,
  UserCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

/* ═══════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════ */

export default function HomePage() {
  /* ── Data Queries ── */
  const campaignsQuery = useQuery({
    queryKey: ["home", "campaigns"],
    queryFn: () => getActiveCampaigns(8),
  });
  const transfersQuery = useQuery({
    queryKey: ["home", "transfers"],
    queryFn: () => getActiveTransfers(6),
  });
  const guidesQuery = useQuery({
    queryKey: ["home", "guides"],
    queryFn: () => getActiveGuides(6),
  });
  const mekkePlacesQuery = useQuery({
    queryKey: ["home", "places", "mekke"],
    queryFn: () => getPlacesByCity("mekke", 8),
  });
  const medinePlacesQuery = useQuery({
    queryKey: ["home", "places", "medine"],
    queryFn: () => getPlacesByCity("medine", 8),
  });

  const reviewsQuery = useQuery({
    queryKey: ["home", "reviews"],
    queryFn: () => getTopReviews(6),
  });

  const topTransfers = useMemo(
    () => (transfersQuery.data ?? []).slice(0, 3),
    [transfersQuery.data]
  );
  const topGuides = useMemo(
    () => (guidesQuery.data ?? []).slice(0, 3),
    [guidesQuery.data]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection />
      <CampaignCards campaigns={campaignsQuery.data ?? []} isLoading={campaignsQuery.isLoading} />
      <TopCategoriesGrid />
      <PlacesSection
        mekkePlaces={mekkePlacesQuery.data ?? []}
        medinePlaces={medinePlacesQuery.data ?? []}
        isLoading={mekkePlacesQuery.isLoading || medinePlacesQuery.isLoading}
      />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <UpcomingUmrahTours limit={6} showTitle={true} />
      </section>
      {/* Modern Transfers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-cyan-500 via-sky-500 to-blue-500" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Öne Çıkan Transferler
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Havalimanı, otel ve kutsal mekanlar arası güvenli transfer
              </p>
            </div>
          </div>
          <Link
            href="/transfers"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-50 to-sky-50 text-cyan-700 hover:from-cyan-100 hover:to-sky-100 font-medium text-sm transition-all duration-300 border border-cyan-200 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/10"
          >
            Tümünü Gör
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Loading State */}
        {transfersQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[300px] rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : null}

        {/* Error State */}
        {transfersQuery.isError ? (
          <Card className="border-red-200 bg-red-50 hover:shadow-none">
            <CardContent className="p-8 text-red-700">
              Transfer verileri alınırken hata oluştu.
            </CardContent>
          </Card>
        ) : null}

        {/* Transfers Grid - 5 Card Horizontal Grid */}
        {!transfersQuery.isLoading && !transfersQuery.isError && topTransfers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topTransfers.slice(0, 5).map((transfer, index) => (
              <CompactTransferCard key={transfer.id} transfer={transfer} index={index} />
            ))}
          </div>
        ) : null}
      </section>
      <DataSection
        title="Öne Çıkan Rehberler"
        href="/guides"
        isLoading={guidesQuery.isLoading}
        isError={guidesQuery.isError}
      >
        <div className="grid md:grid-cols-3 gap-5">
          {topGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </DataSection>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   1. HERO — Full-width image + overlay
   ═══════════════════════════════════════════════════════ */

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/hotels?search=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = "/hotels";
    }
  };

  return (
    <section className="relative min-h-[400px] md:min-h-[480px] overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center py-12">
        {/* Islamic Pattern Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
            Manevi Yolculuğunuz Başlıyor
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-3xl leading-tight tracking-tight mb-4">
          Umre yolculuğunuzu
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mt-1">
            güvenle planlayın
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-slate-300 max-w-xl mb-6 leading-relaxed">
          Tur, transfer, rehber ve otel hizmetlerini tek platformda keşfedin.
        </p>

        {/* Hotel Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mb-6">
          <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="pl-5 pr-3">
              <Hotel className="w-5 h-5 text-emerald-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Otel Bul..."
              className="flex-1 bg-transparent text-white placeholder-white/60 py-4 pr-4 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 flex items-center gap-2"
            >
              <span>Ara</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/hotels"
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-xl shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:-translate-y-1"
          >
            <Hotel className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Otel Bul</span>
            <ArrowUpRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </Link>
          <Link
            href="/transfers"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
          >
            Transferleri Gör
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-6 max-w-xl">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-0.5">500+</div>
            <div className="text-xs text-slate-400">Mutlu Hacı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-teal-400 mb-0.5">24/7</div>
            <div className="text-xs text-slate-400">Destek</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-0.5">%100</div>
            <div className="text-xs text-slate-400">Güvenli</div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-12 md:h-16 fill-slate-50" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,64 C480,120 960,120 1440,64 L1440,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   2. TOP CATEGORIES GRID (6 services, 3x2) - Modern Glassmorphism
   ═══════════════════════════════════════════════════════ */

const CATEGORIES = [
  {
    title: "Turlar",
    description: "Umre & hac paketleri",
    href: "/tours",
    icon: Compass,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
    glowColor: "shadow-emerald-500/20"
  },
  {
    title: "Oteller",
    description: "Mekke & Medine konaklaması",
    href: "/hotels",
    icon: Hotel,
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
    glowColor: "shadow-blue-500/20"
  },
  {
    title: "Transferler",
    description: "Havalimanı & şehir arası",
    href: "/transfers",
    icon: Bus,
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    bgGradient: "from-cyan-500/10 to-sky-500/10",
    glowColor: "shadow-cyan-500/20"
  },
  {
    title: "Rehberler",
    description: "Profesyonel eşlik",
    href: "/guides",
    icon: UserCircle,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-500/10 to-purple-500/10",
    glowColor: "shadow-violet-500/20"
  },
  {
    title: "Araç Kiralama",
    description: "Bağımsız ulaşım",
    href: "/cars",
    icon: Car,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
    glowColor: "shadow-amber-500/20"
  },
  {
    title: "Vize",
    description: "Başvuru & takip",
    href: "/visa",
    icon: Plane,
    gradient: "from-rose-500 via-pink-500 to-red-500",
    bgGradient: "from-rose-500/10 to-pink-500/10",
    glowColor: "shadow-rose-500/20"
  },
] as const;

function TopCategoriesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hizmetlerimiz</h2>
          <p className="text-sm text-slate-500 mt-0.5">Umre yolculuğunuz için ihtiyacınız olan her şey</p>
        </div>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {CATEGORIES.map((cat, index) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Card */}
            <div className={`
              relative overflow-hidden rounded-3xl
              bg-gradient-to-br ${cat.bgGradient}
              backdrop-blur-xl
              border border-white/40
              p-6 md:p-7
              transition-all duration-500 ease-out
              hover:scale-[1.03] hover:-translate-y-1
              hover:shadow-2xl ${cat.glowColor}
              group-hover:border-white/60
            `}>
              {/* Animated gradient background on hover */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${cat.gradient}
                opacity-0 group-hover:opacity-10
                transition-opacity duration-500
              `} />
              
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} rounded-full blur-2xl`} />
              </div>
              
              {/* Icon container */}
              <div className={`
                relative w-14 h-14 md:w-16 md:h-16 rounded-2xl
                bg-gradient-to-br ${cat.gradient}
                flex items-center justify-center
                shadow-lg ${cat.glowColor}
                mb-4
                transition-all duration-500
                group-hover:scale-110 group-hover:rotate-3
              `}>
                <cat.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                
                {/* Icon glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient}
                  blur-xl opacity-50 group-hover:opacity-75 transition-opacity
                `} />
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-700 transition-all">
                  {cat.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className={`
                absolute bottom-4 right-4 w-8 h-8 rounded-full
                bg-gradient-to-br ${cat.gradient}
                flex items-center justify-center
                opacity-0 group-hover:opacity-100
                transform translate-y-2 group-hover:translate-y-0
                transition-all duration-300
              `}>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   4. PLACES — Mekke & Medine — Modern Immersive Cards
   ═══════════════════════════════════════════════════════ */

function PlacesSection({
  mekkePlaces,
  medinePlaces,
  isLoading,
}: {
  mekkePlaces: PlaceModel[];
  medinePlaces: PlaceModel[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 rounded-full bg-slate-200 animate-pulse" />
          <div>
            <div className="w-48 h-7 rounded-lg bg-slate-200 animate-pulse" />
            <div className="w-64 h-4 rounded-lg bg-slate-200 animate-pulse mt-2" />
          </div>
        </div>
        <div className="space-y-10">
          {[1, 2].map((group) => (
            <div key={group}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-200 animate-pulse" />
                <div className="w-24 h-5 rounded-lg bg-slate-200 animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="min-w-[160px] md:min-w-[200px] h-52 md:h-60 rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (mekkePlaces.length === 0 && medinePlaces.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-amber-500 via-emerald-500 to-cyan-500" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gezilecek Yerler</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kutsal topraklardaki mübarek mekanları keşfedin</p>
        </div>
      </div>

      <div className="space-y-10">
        {mekkePlaces.length > 0 && (
          <PlaceCityRow cityLabel="Mekke" places={mekkePlaces} />
        )}
        {medinePlaces.length > 0 && (
          <PlaceCityRow cityLabel="Medine" places={medinePlaces} />
        )}
      </div>
    </section>
  );
}

function PlaceCityRow({ cityLabel, places }: { cityLabel: string; places: PlaceModel[] }) {
  const citySlug = cityLabel.toLowerCase().includes("mekke") ? "mekke" : "medine";
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = dir === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
  }, []);

  const isMekke = citySlug === "mekke";
  
  return (
    <div className="relative" aria-label={cityLabel}>
      {/* City Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* City icon with animated gradient border */}
          <div className="relative">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${isMekke ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'} flex items-center justify-center shadow-lg ${isMekke ? 'shadow-amber-500/25' : 'shadow-emerald-500/25'}`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            {/* Glow */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${isMekke ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-teal-600'} blur-lg opacity-30`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{cityLabel}</h3>
            <p className="text-xs text-slate-500">{isMekke ? 'İslam\'ın en kutsal şehri' : 'Peygamber şehri'}</p>
          </div>
        </div>
        <Link
          href={`/blog?city=${citySlug}`}
          className={`group/link inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
            isMekke
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:shadow-md hover:shadow-amber-500/10'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-500/10'
          }`}
          aria-label={`${cityLabel} için tüm gezilecek yerleri gör`}
        >
          Tümünü Gör
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {/* Cards with navigation */}
      <div className="relative group/nav">
        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 md:p-3 rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl hover:shadow-2xl transition-all opacity-100 md:opacity-0 md:group-hover/nav:opacity-100 cursor-pointer hover:scale-110 ${
            isMekke ? 'border-amber-200/50 hover:border-amber-300' : 'border-emerald-200/50 hover:border-emerald-300'
          }`}
          aria-label="Önceki"
        >
          <ChevronLeft className={`w-5 h-5 ${isMekke ? 'text-amber-700' : 'text-emerald-700'}`} />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-1"
        >
          {places.map((place, index) => {
            const img = place.images?.[0];
            const seoKeywords = isMekke
              ? ["Kabe", "Harem", "Tavaf", "Umre", "İhram"]
              : ["Mescid-i Nebevi", "Peygamber", "Ravza", "Uhud", "Medine"];
            const randomKeyword = seoKeywords[index % seoKeywords.length];
            
            return (
              <Link
                key={place.id}
                href={`/places/${place.id}`}
                className="relative min-w-[160px] md:min-w-[200px] h-52 md:h-60 rounded-2xl overflow-hidden snap-start shrink-0 group cursor-pointer"
                style={{ animationDelay: `${index * 80}ms` }}
                aria-label={`${place.title} - ${randomKeyword} hakkında detaylı bilgi`}
              >
                {/* Image */}
                {img ? (
                  <Image
                    src={img}
                    alt={`${place.title} - ${isMekke ? 'Mekke' : 'Medine'} gezilecek yer`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${isMekke ? 'from-amber-400 via-orange-500 to-red-600' : 'from-emerald-400 via-teal-500 to-cyan-600'}`} />
                )}
                
                {/* Multi-layer gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/5 group-hover:from-black/95 transition-all duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-br ${isMekke ? 'from-amber-900/20' : 'from-emerald-900/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Top accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isMekke ? 'from-amber-400 via-orange-400 to-amber-400' : 'from-emerald-400 via-teal-400 to-emerald-400'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Keyword badge - top left */}
                <div className="absolute top-3 left-3">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
                    isMekke
                      ? 'bg-amber-500/20 border-amber-400/30 group-hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 border-emerald-400/30 group-hover:bg-emerald-500/30'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5 text-white/80" />
                    <span className="text-white/90 text-[10px] font-semibold tracking-wide">
                      {randomKeyword}
                    </span>
                  </div>
                </div>
                
                {/* CTA Button - top right */}
                <div className={`absolute top-3 right-3 w-8 h-8 rounded-xl backdrop-blur-md border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 ${
                  isMekke
                    ? 'bg-amber-500/25 border-amber-400/40 hover:bg-amber-500/40'
                    : 'bg-emerald-500/25 border-emerald-400/40 hover:bg-emerald-500/40'
                }`}>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                </div>
                
                {/* Content - bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 transform group-hover:-translate-y-0.5 transition-transform duration-400">
                  <h4 className="text-white font-bold text-sm md:text-base line-clamp-2 leading-snug mb-1 tracking-tight">
                    {place.title}
                  </h4>
                  {place.shortDescription && (
                    <p className="text-white/80 text-[11px] md:text-xs line-clamp-1 leading-relaxed group-hover:text-white/90 transition-colors">
                      {place.shortDescription}
                    </p>
                  )}
                  
                  {/* Explore indicator */}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <span className={`text-[11px] font-semibold ${isMekke ? 'text-amber-300' : 'text-emerald-300'}`}>Keşfet</span>
                    <ArrowRight className={`w-2.5 h-2.5 ${isMekke ? 'text-amber-300' : 'text-emerald-300'} group-hover:translate-x-1 transition-transform`} />
                  </div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                </div>

                {/* Card shadow/glow on hover */}
                <div className={`absolute inset-0 rounded-2xl transition-shadow duration-500 ${
                  isMekke
                    ? 'group-hover:shadow-[0_8px_40px_-8px_rgba(245,158,11,0.3)]'
                    : 'group-hover:shadow-[0_8px_40px_-8px_rgba(16,185,129,0.3)]'
                }`} />
              </Link>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 md:p-3 rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl hover:shadow-2xl transition-all opacity-100 md:opacity-0 md:group-hover/nav:opacity-100 cursor-pointer hover:scale-110 ${
            isMekke ? 'border-amber-200/50 hover:border-amber-300' : 'border-emerald-200/50 hover:border-emerald-300'
          }`}
          aria-label="Sonraki"
        >
          <ChevronRight className={`w-5 h-5 ${isMekke ? 'text-amber-700' : 'text-emerald-700'}`} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5–6. GUIDE CARDS
   ═══════════════════════════════════════════════════════ */

function GuideCard({ guide }: { guide: GuideModel }) {
  const img = guide.images?.[0];
  return (
    <Link href={`/guides/${guide.id}`} className="group">
      <Card className="border-slate-200 bg-white overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
        <div className="relative h-48 overflow-hidden">
          {img ? (
            <Image src={img} alt={guide.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-violet-400" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{guide.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {guide.specialties.length > 0 ? guide.specialties.join(", ") : "Genel rehber"}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            {guide.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {guide.city}
              </span>
            )}
            {guide.languages.length > 0 && (
              <span>{guide.languages[0]}</span>
            )}
          </div>
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-xs text-slate-400">Günlük ücret</p>
              <p className="text-lg font-bold text-violet-700">
                {formatTlUsdPairFromTl(guide.dailyRate)}
              </p>
            </div>
            {guide.rating > 0 && (
              <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {guide.rating.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


/* ═══════════════════════════════════════════════════════
   9. WEATHER COMPARISON — Mekke vs Medine (12-month bars)
   ═══════════════════════════════════════════════════════ */

function WeatherComparison() {
  const mekke = getMekkeWeather();
  const medine = getMedineWeather();
  const months = getMonthLabels();
  const maxTemp = 48; // max for bar scale

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900">Hava Durumu Karşılaştırması</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">Aylık ortalama sıcaklıklar (°C)</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                Mekke şu an: <span className="text-emerald-700 font-bold">{getCurrentTemp(mekke.monthlyTemps)}°C</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                Medine şu an: <span className="text-blue-700 font-bold">{getCurrentTemp(medine.monthlyTemps)}°C</span>
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Mekke
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-blue-500" /> Medine
          </span>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-2 md:gap-3 h-48 md:h-56">
          {months.map((month, i) => {
            const mekkeH = (mekke.monthlyTemps[i] / maxTemp) * 100;
            const medineH = (medine.monthlyTemps[i] / maxTemp) * 100;
            const isCurrentMonth = i === mekke.currentMonth;

            return (
              <div
                key={month}
                className={`flex-1 flex flex-col items-center gap-1 ${isCurrentMonth ? "opacity-100" : "opacity-70"}`}
              >
                <div className="flex gap-0.5 items-end h-36 md:h-44 w-full">
                  <div
                    className={`flex-1 rounded-t-md transition-all ${isCurrentMonth ? "bg-emerald-500" : "bg-emerald-300"}`}
                    style={{ height: `${mekkeH}%` }}
                    title={`Mekke ${month}: ${mekke.monthlyTemps[i]}°C`}
                  />
                  <div
                    className={`flex-1 rounded-t-md transition-all ${isCurrentMonth ? "bg-blue-500" : "bg-blue-300"}`}
                    style={{ height: `${medineH}%` }}
                    title={`Medine ${month}: ${medine.monthlyTemps[i]}°C`}
                  />
                </div>
                <span className={`text-[10px] md:text-xs ${isCurrentMonth ? "font-bold text-slate-900" : "text-slate-400"}`}>
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   10. TESTIMONIALS — Review cards
   ═══════════════════════════════════════════════════════ */

function TestimonialsSection({
  reviews,
  isLoading,
}: {
  reviews: UserReview[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-1">Kullanıcı Yorumları</h2>
      <p className="text-sm text-slate-500 mb-5">Müşterilerimizin deneyimleri</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="border-slate-200 bg-white hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <Quote className="w-6 h-6 text-emerald-200 mb-2" />
              <p className="text-sm text-slate-700 line-clamp-4 leading-relaxed">
                {review.comment}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                    {reviewTypeLabels[review.serviceType] || review.serviceType}
                  </Badge>
                  <p className="text-xs text-slate-400 mt-1">{review.serviceName}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   11. CTA BANNER
   ═══════════════════════════════════════════════════════ */

function CTABanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />

        <div className="relative z-10 px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Badge className="bg-white/15 border-white/25 text-white mb-4">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Güvenli Rezervasyon
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white max-w-lg leading-tight">
              Planını başlat, süreci birlikte yönetelim.
            </h2>
            <p className="mt-2 text-emerald-100 max-w-md">
              Uzman ekibimizle hızlı geri dönüş ve güvenli ödeme altyapısı.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-lg"
          >
            İletişime Geç <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED — DataSection wrapper
   ═══════════════════════════════════════════════════════ */

function DataSection({
  title,
  description,
  href,
  isLoading,
  isError,
  children,
}: {
  title: string;
  description?: string;
  href: string;
  isLoading: boolean;
  isError: boolean;
  children: ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
        <Link
          href={href}
          className="text-sm text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
        >
          Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <Card className="border-red-200 bg-red-50 hover:shadow-none">
          <CardContent className="p-8 text-red-700">
            Veri alınırken hata oluştu.
          </CardContent>
        </Card>
      ) : (
        children
      )}
    </section>
  );
}
