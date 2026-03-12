"use client";

import {
  GuestSummaryBar,
  HotelCard,
  HotelFilters,
  HotelSearchForm,
  HotelSortBar,
  type HotelFilters as HotelFiltersType,
  type HotelSearchFormParams,
  type SortDirection,
  type SortField,
  type ViewMode
} from "@/components/hotels";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { calculateTotalGuests } from "@/lib/hotels/capacity-utils";
import { getCityFallbackImage } from "@/lib/hotels/city-images";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

/* ────────── Constants ────────── */

// SVG placeholder for hotels without images (fallback when no city images available)
const HOTEL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%230ea5e9;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1200' height='700'/%3E%3Crect fill='%23f1f5f9' x='400' y='200' width='400' height='300' rx='8'/%3E%3Cpath fill='%2394a3b8' d='M550 280h100v80h-100z'/%3E%3Cpath fill='%2394a3b8' d='M560 300h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Cpath fill='%2394a3b8' d='M560 330h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Ctext fill='%2364748b' font-family='system-ui,-apple-system,sans-serif' font-size='24' font-weight='500' x='600' y='420' text-anchor='middle'%3EOtel Resmi%3C/text%3E%3Ctext fill='%2394a3b8' font-family='system-ui,-apple-system,sans-serif' font-size='16' x='600' y='450' text-anchor='middle'%3EMevcut Değil%3C/text%3E%3C/svg%3E";

/* ────────── Types ────────── */

type NormalizedHotelItem = {
  hotelId: string;
  hotelName: string;
  address: string;
  cityName: string;
  cityCode?: string;
  countryName?: string;
  countryCode?: string;
  stars: string;
  price: string;
  image?: string;
  lat?: string;
  lng?: string;
  rating?: string;
  reviewCount?: number;
  distanceToHolySite?: number;
  holySiteName?: string;
  distanceText?: string;
  checkInTime?: string;
  checkOutTime?: string;
  description?: string;
};

interface HotelSearchResponse {
  success: boolean;
  count: number;
  data?: NormalizedHotelItem[];
}

/* ────────── Constants ────────── */

const DEFAULT_CHECK_IN = format(new Date(), "yyyy-MM-dd"); // Bugün
const DEFAULT_CHECK_OUT = format(
  (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  })(),
  "yyyy-MM-dd",
); // Yarın

/* ────────── Helper Functions ────────── */

function findFirstStringByKeys(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== "object") return null;

  if (Array.isArray(source)) {
    for (const item of source) {
      const result = findFirstStringByKeys(item, keys);
      if (result) return result;
    }
    return null;
  }

  const record = source as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (keys.includes(key.toLowerCase()) && typeof value === "string" && value.trim()) {
      return value;
    }
  }

  for (const value of Object.values(record)) {
    const nested = findFirstStringByKeys(value, keys);
    if (nested) return nested;
  }

  return null;
}

function parsePriceToNumber(rawPrice?: string): number {
  if (!rawPrice) return 0;
  const normalized = rawPrice.replace(/[^\d.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function getHotelImageUrl(hotel: NormalizedHotelItem, cityCode: number): string {
  // Hotel image is already provided by the new API
  // If image exists and is valid, use it
  if (hotel.image) {
    return hotel.image;
  }

  // Fallback: Use city-specific images for Makkah and Madinah
  const cityFallback = getCityFallbackImage(cityCode, hotel.hotelId);
  return cityFallback;
}

/* ────────── Main Page ────────── */

export default function HotelsPageClient() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  // Parse URL search params
  const parseUrlParams = useCallback((): HotelSearchFormParams | null => {
    const cityCode = urlSearchParams.get("cityCode");
    const checkIn = urlSearchParams.get("checkIn");
    const checkOut = urlSearchParams.get("checkOut");
    const roomsParam = urlSearchParams.get("rooms");

    if (!cityCode || !checkIn || !checkOut || !roomsParam) {
      return null;
    }

    try {
      const rooms = JSON.parse(decodeURIComponent(roomsParam));
      return {
        cityCode: parseInt(cityCode),
        checkIn,
        checkOut,
        rooms,
      };
    } catch {
      return null;
    }
  }, [urlSearchParams]);

  // Search params state - initialize from URL or defaults
  const [searchParams, setSearchParams] = useState<HotelSearchFormParams>(() => {
    const urlParams = parseUrlParams();
    if (urlParams) return urlParams;
    
    return {
      cityCode: 164, // Mekke (MAKKAH) default
      checkIn: DEFAULT_CHECK_IN,
      checkOut: DEFAULT_CHECK_OUT,
      rooms: [{ adults: 2, children: 0, childAges: [] }],
    };
  });

  // Check if search has been performed (based on URL params)
  const hasSearched = useMemo(() => {
    return parseUrlParams() !== null;
  }, [parseUrlParams]);

  // Sync state with URL on mount and URL changes
  useEffect(() => {
    const urlParams = parseUrlParams();
    if (urlParams) {
      setSearchParams(urlParams);
    }
  }, [parseUrlParams]);

  // Helper function to get search params for API
  const getSearchParamsForApi = useCallback((params: HotelSearchFormParams) => {
    // Pass params directly - DOTW uses city codes in <city> filter
    return params;
  }, []);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<HotelFiltersType>({});

  // Search query (runs when URL params exist)
  const searchQuery = useQuery({
    queryKey: ["hotels", "search", searchParams],
    queryFn: async () => {
      const apiParams = getSearchParamsForApi(searchParams);
      console.log("[HotelsPage] Search query payload:", apiParams);
      const response = await axios.post<HotelSearchResponse>("/api/hotels/search", apiParams);
      return response.data;
    },
    enabled: hasSearched,
    staleTime: 5 * 60 * 1000, // 5 minutes - keep results fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for back navigation
  });

  // Process and filter hotels
  const processedHotels = useMemo(() => {
    const rawHotels = hasSearched
      ? (searchQuery.data?.data ?? [])
      : [];

    // Convert to card format - new API already returns normalized data
    let hotels = rawHotels.map((hotel) => {
      // Şehir kodunu al (Mekke: 164, Medine: 174)
      const hotelCityCode = searchParams.cityCode || 164;
      
      return {
        id: hotel.hotelId,
        name: hotel.hotelName,
        address: hotel.address,
        cityName: hotel.cityName,
        price: parsePriceToNumber(hotel.price),
        stars: Number(hotel.stars) || 0,
        image: getHotelImageUrl(hotel, hotelCityCode),
        rating: hotel.rating ? parseFloat(hotel.rating) : undefined,
        reviewCount: hotel.reviewCount,
        amenities: [] as string[],
        distance: hotel.distanceToHolySite ? hotel.distanceToHolySite / 1000 : undefined, // meters to km
        distanceText: hotel.distanceText,
        holySiteName: hotel.holySiteName,
        boardBasis: undefined as string | undefined,
      };
    });

    // Apply filters
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      hotels = hotels.filter((h) => h.price >= min && h.price <= max);
    }

    if (filters.stars && filters.stars.length > 0) {
      hotels = hotels.filter((h) => filters.stars!.includes(h.stars));
    }

    if (filters.distance !== undefined) {
      hotels = hotels.filter((h) => {
        if (h.distance === undefined) return true;
        return h.distance <= filters.distance!;
      });
    }

    // Apply sorting
    hotels = [...hotels].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "price":
          comparison = a.price - b.price;
          break;
        case "stars":
          comparison = a.stars - b.stars;
          break;
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case "name":
          comparison = a.name.localeCompare(b.name, "tr");
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return hotels;
  }, [
    searchQuery.data?.data,
    hasSearched,
    filters,
    sortField,
    sortDirection,
    searchParams.cityCode,
  ]);

  // Extract prices for histogram
  const allPrices = useMemo(() => {
    const rawHotels = hasSearched
      ? (searchQuery.data?.data ?? [])
      : [];
    return rawHotels.map(h => parsePriceToNumber(h.price)).filter(p => p > 0);
  }, [searchQuery.data?.data, hasSearched]);

  const activeQuery = hasSearched ? searchQuery : null;

  // Handlers
  const handleSearch = useCallback((params: HotelSearchFormParams) => {
    setSearchParams(params);
    
    // Update URL with search params (use Turkish URL /oteller to avoid redirect loop)
    const searchParamsString = new URLSearchParams({
      cityCode: (params.cityCode ?? 164).toString(),
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      rooms: encodeURIComponent(JSON.stringify(params.rooms)),
    }).toString();
    
    router.push(`/oteller?${searchParamsString}`, { scroll: false });
  }, [router]);

  const handleGuestChange = useCallback((rooms: typeof searchParams.rooms) => {
    setSearchParams(prev => ({ ...prev, rooms }));
    
    // Update URL with new rooms
    const searchParamsString = new URLSearchParams({
      cityCode: (searchParams.cityCode ?? 164).toString(),
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      rooms: encodeURIComponent(JSON.stringify(rooms)),
    }).toString();
    
    router.push(`/oteller?${searchParamsString}`, { scroll: false });
  }, [router, searchParams.cityCode, searchParams.checkIn, searchParams.checkOut]);

  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const totalGuests = calculateTotalGuests(searchParams.rooms).total;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,#dcfce7,#ecfeff_40%,#f8fafc_70%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  Otel Rezervasyonu
                </h1>
                <p className="text-slate-600 mt-1">
                  Mekke ve Medine&apos;de en uygun otelleri keşfedin
                </p>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
              <HotelSearchForm
                onSearch={handleSearch}
                loading={activeQuery?.isFetching ?? false}
                initialParams={searchParams}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <HotelFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={processedHotels.length}
              onClear={handleClearFilters}
              prices={allPrices}
            />
          </aside>

          {/* Results */}
          <main className="lg:col-span-9 space-y-6">
            {/* Guest Summary Bar - Show after search */}
            {hasSearched && (
              <GuestSummaryBar
                rooms={searchParams.rooms}
                onSearch={handleGuestChange}
                loading={activeQuery?.isFetching ?? false}
              />
            )}

            {/* Mobile Filters Toggle */}
            <HotelFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={processedHotels.length}
              onClear={handleClearFilters}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
              prices={allPrices}
            />

            {/* Sort Bar */}
            <HotelSortBar
              sortField={sortField}
              sortDirection={sortDirection}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewModeChange={setViewMode}
              resultsCount={processedHotels.length}
            />

            {/* Loading State */}
            {activeQuery?.isLoading && (
              <LoadingState
                title="Oteller aranıyor"
                description="Kısa süre içinde hazır olacak"
              />
            )}

            {/* Error State */}
            {activeQuery?.isError && (
              <ErrorState
                title="Otel listesi alınamadı"
                description="Bağlantı veya servis yanıtında sorun oluştu."
                onRetry={() => activeQuery?.refetch()}
              />
            )}

            {/* Empty State - show when no search has been made or no results */}
            {!hasSearched && (
              <EmptyState
                title="Otel Arayın"
                description="Yukarıdaki formu kullanarak otel aramaya başlayın."
              />
            )}

            {/* Empty State - show when search returned no results */}
            {hasSearched && !activeQuery?.isLoading && !activeQuery?.isError && processedHotels.length === 0 && (
              <EmptyState
                title="Uygun otel bulunamadı"
                description="Filtreleri değiştirip tekrar deneyin veya farklı tarih seçin."
              />
            )}

            {/* Hotels Grid */}
            {hasSearched && !activeQuery?.isLoading && !activeQuery?.isError && processedHotels.length > 0 && (
              <div
                className={
                  viewMode === "grid"
                    ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {processedHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    checkIn={searchParams.checkIn}
                    checkOut={searchParams.checkOut}
                    adults={searchParams.rooms.reduce((sum, r) => sum + r.adults, 0)}
                    totalGuests={totalGuests}
                    cityCode={searchParams.cityCode || 164} // Mekke default
                    viewMode={viewMode}
                    showDistance={searchParams.cityCode === 164 || searchParams.cityCode === 174} // Mekke ve Medine için mesafe göster
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
