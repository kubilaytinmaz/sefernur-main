"use client";

import {
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
import { formatHotelAddress } from "@/lib/hotels/address-formatter";
import { getCityFallbackImage } from "@/lib/hotels/city-images";
import { getHotelMetadata, getHotelName } from "@/lib/hotels/hotel-metadata";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Building2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

/* ────────── Constants ────────── */

// SVG placeholder for hotels without images (fallback when no city images available)
const HOTEL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%230ea5e9;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1200' height='700'/%3E%3Crect fill='%23f1f5f9' x='400' y='200' width='400' height='300' rx='8'/%3E%3Cpath fill='%2394a3b8' d='M550 280h100v80h-100z'/%3E%3Cpath fill='%2394a3b8' d='M560 300h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Cpath fill='%2394a3b8' d='M560 330h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Ctext fill='%2364748b' font-family='system-ui,-apple-system,sans-serif' font-size='24' font-weight='500' x='600' y='420' text-anchor='middle'%3EOtel Resmi%3C/text%3E%3Ctext fill='%2394a3b8' font-family='system-ui,-apple-system,sans-serif' font-size='16' x='600' y='450' text-anchor='middle'%3EMevcut Değil%3C/text%3E%3C/svg%3E";

/* ────────── Types ────────── */

type WebBedsHotelItem = {
  "@_HotelId"?: string;
  "@_HotelName"?: string;
  "@_Address"?: string;
  "@_CityName"?: string;
  "@_Price"?: string;
  "@_Stars"?: string;
  name?: string;
  address?: string;
  [key: string]: unknown;
};

interface HotelSearchResponse {
  success: boolean;
  count: number;
  data?: WebBedsHotelItem[];
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

function getHotelImageUrl(hotel: WebBedsHotelItem, cityCode: number): string {
  const hotelName = hotel["@_HotelName"] || hotel.name || "Unknown";
  const hotelId = String(hotel["@_HotelId"] || "");
  
  // Önce direkt olarak @_Image key'ini kontrol et (WebBeds XML parser'ın kullandığı key)
  const directImage = hotel["@_Image" as keyof WebBedsHotelItem];
  if (typeof directImage === "string" && directImage.startsWith("http")) {
    console.log(`[getHotelImageUrl] ${hotelName}: Using @_Image`);
    return directImage;
  }

  // HotelImages objesinden resim ara
  const hotelImages = hotel["hotelImages" as keyof WebBedsHotelItem];
  if (hotelImages && typeof hotelImages === "object") {
    // Thumb resmi dene
    const thumb = (hotelImages as any).thumb;
    if (typeof thumb === "string" && thumb.startsWith("http")) {
      console.log(`[getHotelImageUrl] ${hotelName}: Using hotelImages.thumb`);
      return thumb;
    }
    
    // Image array'inden ilkini dene
    const imageArray = (hotelImages as any).image;
    if (Array.isArray(imageArray) && imageArray.length > 0) {
      const firstImage = imageArray[0];
      if (typeof firstImage === "object" && firstImage.url && typeof firstImage.url === "string") {
        console.log(`[getHotelImageUrl] ${hotelName}: Using hotelImages.image[0].url`);
        return firstImage.url;
      }
      if (typeof firstImage === "string" && firstImage.startsWith("http")) {
        console.log(`[getHotelImageUrl] ${hotelName}: Using hotelImages.image[0]`);
        return firstImage;
      }
    }
  }

  // Diğer olası key'leri ara
  const fromKnown = findFirstStringByKeys(hotel, [
    "@_image",        // küçük harf variant
    "@_mainimage",
    "mainimage",
    "image",
    "@_imageurl",
    "imageurl",
    "@_thumbnail",
    "thumbnail",
    "@_photo",
    "photo",
    "@_hotelimage",
    "hotelimage",
  ]);

  if (fromKnown && fromKnown.startsWith("http")) {
    console.log(`[getHotelImageUrl] ${hotelName}: Using fromKnown (${fromKnown.substring(0, 50)}...)`);
    return fromKnown;
  }

  // Try metadata image URL
  const metadata = getHotelMetadata(hotelId);
  if (metadata?.imageUrl && metadata.imageUrl.startsWith("http")) {
    console.log(`[getHotelImageUrl] ${hotelName}: Using metadata image`);
    return metadata.imageUrl;
  }

  // Fallback: Use city-specific images for Makkah and Madinah
  const cityFallback = getCityFallbackImage(cityCode, hotelId);
  console.log(`[getHotelImageUrl] ${hotelName}: Using city fallback for city ${cityCode}`);
  return cityFallback;
}

function hotelName(hotel: WebBedsHotelItem): string {
  const apiName = hotel["@_HotelName"] || hotel.name;
  const hotelId = String(hotel["@_HotelId"] || "");
  
  // If API name exists and is not a fallback (doesn't start with "Otel #"), use it
  if (apiName && typeof apiName === "string" && !apiName.startsWith("Otel #")) {
    return apiName;
  }
  
  // Try to get from metadata
  const metadataName = getHotelName(hotelId);
  if (metadataName) {
    return metadataName;
  }
  
  // Last resort: use fallback
  return apiName || "Otel";
}

function hotelAddress(hotel: WebBedsHotelItem, cityCode: number): string {
  // Önce ham adresi al
  const rawAddress = String(hotel["@_Address"] || hotel.address || "");
  const cityName = String(hotel["@_CityName"] || hotel["@_cityname"] || "");
  
  // Eğer sadece şehir adı varsa (örn: "MAKKAH"), formatla
  if (!rawAddress && cityName) {
    return formatHotelAddress(cityName, cityCode).displayAddress;
  }
  
  // Adres varsa formatla - Türkçe bölge isimleriyle
  if (rawAddress) {
    return formatHotelAddress(rawAddress, cityCode).displayAddress;
  }
  
  return "Adres bilgisi bulunamadı";
}

function hotelGuestRating(hotel: WebBedsHotelItem): number | undefined {
  const ratingStr = hotel["@_GuestRating"] || hotel["guestRating"];
  if (ratingStr) {
    const rating = parseFloat(String(ratingStr));
    if (!isNaN(rating) && rating > 0) return rating;
  }
  return undefined;
}

/* ────────── Main Page ────────── */

export default function HotelsPage() {
  // Search params state
  const [searchParams, setSearchParams] = useState<HotelSearchFormParams>({
    cityCode: 164, // Mekke (MAKKAH) default
    checkIn: DEFAULT_CHECK_IN,
    checkOut: DEFAULT_CHECK_OUT,
    rooms: [{ adults: 2, children: 0, childAges: [] }],
  });

  // Helper function to get search params for API
  const getSearchParamsForApi = useCallback((params: HotelSearchFormParams) => {
    // Pass params directly - DOTW uses city codes in <city> filter
    return params;
  }, []);

  // UI state
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<HotelFiltersType>({});

  // Featured hotels query (always runs)
  const featuredQuery = useQuery({
    queryKey: ["hotels", "featured", searchParams.cityCode, searchParams.countryCode],
    queryFn: async () => {
      const apiParams = getSearchParamsForApi(searchParams);
      const payload = {
        ...apiParams,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        rooms: [{ adults: 2, children: 0, childAges: [] }],
      };
      console.log("[HotelsPage] Featured query payload:", payload);
      const response = await axios.post<HotelSearchResponse>("/api/webbeds/search", payload);
      return response.data;
    },
  });

  // Search query (runs only after search)
  const searchQuery = useQuery({
    queryKey: ["hotels", "searched", searchParams],
    queryFn: async () => {
      const apiParams = getSearchParamsForApi(searchParams);
      console.log("[HotelsPage] Search query payload:", apiParams);
      const response = await axios.post<HotelSearchResponse>("/api/webbeds/search", apiParams);
      return response.data;
    },
    enabled: hasSearched,
  });

  // Process and filter hotels
  const processedHotels = useMemo(() => {
    const rawHotels = hasSearched
      ? (searchQuery.data?.data ?? [])
      : (featuredQuery.data?.data ?? []);

    // Convert to card format
    let hotels = rawHotels.map((hotel) => {
      // Parse Google rating if available
      const guestRating = hotelGuestRating(hotel);
      const reviewCountStr = String(hotel["@_ReviewCount"] || "");
      const reviewCount = reviewCountStr ? parseInt(reviewCountStr, 10) : undefined;
      
      // Şehir kodunu al (Mekke: 164, Medine: 174)
      const hotelCityCode = searchParams.cityCode || 164;
      
      return {
        id: String(hotel["@_HotelId"] || ""),
        name: hotelName(hotel),
        address: hotelAddress(hotel, hotelCityCode),
        cityName: String(hotel["@_CityName"] || hotel["@_cityname"] || ""),
        price: parsePriceToNumber(hotel["@_Price"]),
        stars: Number(hotel["@_Stars"] || 0),
        image: getHotelImageUrl(hotel, hotelCityCode),
        rating: guestRating,
        reviewCount: (reviewCount && !isNaN(reviewCount) && reviewCount > 0) ? reviewCount : undefined,
        amenities: [] as string[],
        distance: hotel["@_DistanceToHolySite"] ? Number(hotel["@_DistanceToHolySite"]) / 1000 : undefined, // meters to km
        distanceText: String(hotel["@_DistanceText"] || "") || undefined,
        holySiteName: String(hotel["@_HolySiteName"] || "") || undefined,
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
    featuredQuery.data?.data,
    searchQuery.data?.data,
    hasSearched,
    filters,
    sortField,
    sortDirection,
  ]);

  const activeQuery = hasSearched ? searchQuery : featuredQuery;

  // Handlers
  const handleSearch = useCallback((params: HotelSearchFormParams) => {
    setSearchParams(params);
    setHasSearched(true);
  }, []);

  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const totalAdults = searchParams.rooms.reduce((sum, r) => sum + r.adults, 0);

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
                loading={activeQuery.isFetching}
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
            />
          </aside>

          {/* Results */}
          <main className="lg:col-span-9 space-y-6">
            {/* Mobile Filters Toggle */}
            <HotelFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultsCount={processedHotels.length}
              onClear={handleClearFilters}
              isOpen={filtersOpen}
              onToggle={() => setFiltersOpen(!filtersOpen)}
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
            {activeQuery.isLoading && (
              <LoadingState
                title={hasSearched ? "Oteller aranıyor" : "Öne çıkan oteller yükleniyor"}
                description="Kısa süre içinde hazır olacak"
              />
            )}

            {/* Error State */}
            {activeQuery.isError && (
              <ErrorState
                title={hasSearched ? "Otel listesi alınamadı" : "Öne çıkan oteller alınamadı"}
                description="Bağlantı veya servis yanıtında sorun oluştu."
                onRetry={() => activeQuery.refetch()}
              />
            )}

            {/* Empty State */}
            {!activeQuery.isLoading && !activeQuery.isError && processedHotels.length === 0 && (
              <EmptyState
                title="Uygun otel bulunamadı"
                description="Filtreleri değiştirip tekrar deneyin veya farklı tarih seçin."
              />
            )}

            {/* Hotels Grid */}
            {!activeQuery.isLoading && !activeQuery.isError && processedHotels.length > 0 && (
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
                    adults={totalAdults}
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
