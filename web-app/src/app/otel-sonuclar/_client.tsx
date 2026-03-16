"use client";

import {
    GuestSummaryBar,
    HotelCard,
    HotelFilters,
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
import { ArrowLeft, Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

/* ────────── Helper Functions ────────── */

function parsePriceToNumber(rawPrice?: string): number {
  if (!rawPrice) return 0;
  const normalized = rawPrice.replace(/[^\d.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function getHotelImageUrl(hotel: NormalizedHotelItem, cityCode: number): string {
  if (hotel.image) {
    return hotel.image;
  }
  const cityFallback = getCityFallbackImage(cityCode, hotel.hotelId);
  return cityFallback;
}

/* ────────── Main Page ────────── */

export default function OtelSonuclarPageClient() {
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

  // Search params state - initialize from URL
  const [searchParams, setSearchParams] = useState<HotelSearchFormParams>(() => {
    const urlParams = parseUrlParams();
    if (urlParams) return urlParams;
    
    // Default values if no params
    return {
      cityCode: 164,
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      rooms: [{ adults: 2, children: 0, childAges: [] }],
    };
  });

  // Redirect to main page if no search params
  useEffect(() => {
    if (!parseUrlParams()) {
      router.push("/oteller");
    }
  }, [parseUrlParams, router]);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<HotelFiltersType>({});

  // Search query
  const searchQuery = useQuery({
    queryKey: ["hotels", "search", searchParams],
    queryFn: async () => {
      const response = await axios.post<HotelSearchResponse>("/api/hotels/search", searchParams);
      return response.data;
    },
    enabled: !!parseUrlParams(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Process and filter hotels
  const processedHotels = useMemo(() => {
    const rawHotels = searchQuery.data?.data ?? [];

    let hotels = rawHotels.map((hotel) => {
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
        distance: hotel.distanceToHolySite ? hotel.distanceToHolySite / 1000 : undefined,
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
    filters,
    sortField,
    sortDirection,
    searchParams.cityCode,
  ]);

  // Extract prices for histogram
  const allPrices = useMemo(() => {
    const rawHotels = searchQuery.data?.data ?? [];
    return rawHotels.map(h => parsePriceToNumber(h.price)).filter(p => p > 0);
  }, [searchQuery.data?.data]);

  // Handlers
  const handleGuestChange = useCallback((rooms: typeof searchParams.rooms) => {
    setSearchParams(prev => ({ ...prev, rooms }));
    
    const searchParamsString = new URLSearchParams({
      cityCode: (searchParams.cityCode ?? 164).toString(),
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      rooms: encodeURIComponent(JSON.stringify(rooms)),
    }).toString();
    
    router.push(`/otel-sonuclar?${searchParamsString}`, { scroll: false });
  }, [router, searchParams]);

  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const totalGuests = calculateTotalGuests(searchParams.rooms).total;

  // Show loading while checking params
  if (!parseUrlParams()) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState
          title="Yönlendiriliyorsunuz"
          description="Otel arama sayfasına gidiliyor..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/oteller")}
              className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Yeni Arama</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Otel Arama Sonuçları</h1>
                <p className="text-xs text-slate-500">
                  {searchParams.checkIn} - {searchParams.checkOut} • {totalGuests} misafir
                </p>
              </div>
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
            {/* Guest Summary Bar */}
            <GuestSummaryBar
              rooms={searchParams.rooms}
              onSearch={handleGuestChange}
              loading={searchQuery.isFetching}
            />

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
            {searchQuery.isLoading && (
              <LoadingState
                title="Oteller aranıyor"
                description="Kısa süre içinde hazır olacak"
              />
            )}

            {/* Error State */}
            {searchQuery.isError && (
              <ErrorState
                title="Otel listesi alınamadı"
                description="Bağlantı veya servis yanıtında sorun oluştu."
                onRetry={() => searchQuery.refetch()}
              />
            )}

            {/* Empty State - no results */}
            {!searchQuery.isLoading && !searchQuery.isError && processedHotels.length === 0 && (
              <EmptyState
                title="Uygun otel bulunamadı"
                description="Filtreleri değiştirip tekrar deneyin veya farklı tarih seçin."
              />
            )}

            {/* Hotels Grid */}
            {!searchQuery.isLoading && !searchQuery.isError && processedHotels.length > 0 && (
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
                    cityCode={searchParams.cityCode || 164}
                    viewMode={viewMode}
                    showDistance={searchParams.cityCode === 164 || searchParams.cityCode === 174}
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
