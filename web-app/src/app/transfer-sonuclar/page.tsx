// Transfer Sonuçları Sayfası
// Arama kriterlerine göre uygun araçları listeler ve filtreleme yapar

"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { TransferFilters, TransferFiltersState } from "@/components/transfers/TransferFilters";
import { TransferResultCard } from "@/components/transfers/TransferResultCard";
import { getActiveTransfers } from "@/lib/data/transfers-data";
import { getRouteFixedPrice } from "@/lib/transfers/pricing-v2";
import { LOCATIONS, getRoutesByLocations } from "@/lib/transfers/transfer-locations";
import { TransferModel, VehicleType } from "@/types/transfer";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Yardımcı fonksiyon - yolcu sayısına göre kapasite aralığı
function getCapacityRangeForPassengers(passengers: number) {
  if (passengers <= 3) return { min: 1, max: 999 };
  if (passengers <= 6) return { min: 4, max: 999 };
  if (passengers <= 10) return { min: 7, max: 999 };
  if (passengers <= 20) return { min: 11, max: 999 };
  return { min: 20, max: 999 };
}

export default function TransferResultsPage() {
  const searchParams = useSearchParams();
  
  // URL parametrelerini al
  const fromLocationId = searchParams.get('from');
  const toLocationId = searchParams.get('to');
  const dateStr = searchParams.get('date');
  const time = searchParams.get('time') || '09:00';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const vehicleTypeParam = searchParams.get('vehicleType') as VehicleType | null;
  const routeIdParam = searchParams.get('routeId');

  // Lokasyon bilgileri
  const fromLocation = fromLocationId ? LOCATIONS[fromLocationId] : null;
  const toLocation = toLocationId ? LOCATIONS[toLocationId] : null;
  
  // Rota bilgisi
  const routes = useMemo(() => {
    if (!fromLocationId || !toLocationId) return [];
    return getRoutesByLocations(fromLocationId, toLocationId);
  }, [fromLocationId, toLocationId]);
  
  const routeId = routeIdParam || routes[0]?.id;

  // Tüm transferleri çek
  const transfersQuery = useQuery({
    queryKey: ["transfers", "active"],
    queryFn: () => getActiveTransfers(),
  });

  // Rota bazlı fiyatları cache'le (async)
  const [routePrices, setRoutePrices] = useState<Map<string, Map<VehicleType, number>>>(new Map());

  // Rota fiyatlarını async olarak çek
  useEffect(() => {
    if (!routeId || !transfersQuery.data) return;

    const fetchRoutePrices = async () => {
      const pricesMap = new Map<VehicleType, number>();
      const vehicleTypes: VehicleType[] = ['sedan', 'van', 'coster', 'bus', 'vip', 'jeep'];
      
      for (const vehicleType of vehicleTypes) {
        const price = await getRouteFixedPrice(routeId, vehicleType);
        if (price !== null) {
          pricesMap.set(vehicleType, price);
        }
      }
      
      setRoutePrices(prev => new Map(prev).set(routeId, pricesMap));
    };

    fetchRoutePrices();
  }, [routeId, transfersQuery.data]);

  // Filtre state - Kapasite aralığını yolcu sayısına göre ayarla
  const [filters, setFilters] = useState<TransferFiltersState>({
    vehicleTypes: vehicleTypeParam ? [vehicleTypeParam] : [],
    capacityRange: getCapacityRangeForPassengers(passengers),
    priceRange: { min: 0, max: 500 },
    amenities: [],
    sortBy: 'price-asc',
  });

  // Mobile filtre toggle state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Yardımcı fonksiyonlar - useCallback ile
  const isNightTimeCheck = useCallback((timeStr: string) => {
    const hour = parseInt(timeStr.split(':')[0], 10);
    return hour >= 0 && hour < 6;
  }, []);

  const getPrice = useCallback((transfer: TransferModel) => {
    let price = transfer.basePrice;
    
    // Önce admin paneldeki rota fiyatlarını kontrol et
    if (routeId && routePrices.has(routeId)) {
      const pricesMap = routePrices.get(routeId);
      if (pricesMap?.has(transfer.vehicleType)) {
        price = pricesMap.get(transfer.vehicleType)!;
      }
    }
    
    const isNight = isNightTimeCheck(time);
    if (isNight) price = Math.round(price * 1.2);
    return price;
  }, [routeId, routePrices, time, isNightTimeCheck]);

  // Filtrelenmiş ve sıralanmış transferler
  const filteredTransfers = useMemo(() => {
    if (!transfersQuery.data) return [];

    let results = transfersQuery.data.filter((transfer) => {
      // Kapasite kontrolü
      if (transfer.capacity < passengers) return false;

      // Araç tipi filtresi
      if (filters.vehicleTypes.length > 0 && !filters.vehicleTypes.includes(transfer.vehicleType)) {
        return false;
      }

      // Kapasite aralığı filtresi
      if (transfer.capacity < filters.capacityRange.min || transfer.capacity > filters.capacityRange.max) {
        return false;
      }

      // Özellik filtresi
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => 
          transfer.amenities?.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Fiyat hesapla ve filtrele
      let price = transfer.basePrice;
      
      // Önce admin paneldeki rota fiyatlarını kontrol et
      if (routeId && routePrices.has(routeId)) {
        const pricesMap = routePrices.get(routeId);
        if (pricesMap?.has(transfer.vehicleType)) {
          price = pricesMap.get(transfer.vehicleType)!;
        }
      }
      
      const isNight = isNightTimeCheck(time);
      if (isNight) price = Math.round(price * 1.2);

      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      return true;
    });

    // Sıralama
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return getPrice(a) - getPrice(b);
        case 'price-desc':
          return getPrice(b) - getPrice(a);
        case 'capacity-asc':
          return a.capacity - b.capacity;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return results;
  }, [transfersQuery.data, filters, passengers, routeId, time, getPrice, isNightTimeCheck]);

  // Fiyat aralığı ve tüm fiyatlar (histogram için)
  const { priceRange, allPrices } = useMemo(() => {
    if (!transfersQuery.data) return { priceRange: { min: 0, max: 500 }, allPrices: [] };
    
    const prices = transfersQuery.data
      .filter(t => t.capacity >= passengers)
      .map(t => getPrice(t));
    
    if (prices.length === 0) return { priceRange: { min: 0, max: 500 }, allPrices: [] };
    
    return {
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      allPrices: prices,
    };
  }, [transfersQuery.data, passengers, getPrice]);

  // Yükleniyor durumu
  if (transfersQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState 
          title="Transferler aranıyor" 
          description="Size uygun araçları listeliyoruz..." 
        />
      </div>
    );
  }

  // Hata durumu
  if (transfersQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <ErrorState
          title="Transferler alınamadı"
          description="Lütfen daha sonra tekrar deneyin."
          onRetry={() => transfersQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Arama Özeti */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/transferler"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Transfer Sonuçları
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                  {fromLocation && toLocation && (
                    <>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                        {fromLocation.name} → {toLocation.name}
                      </span>
                      <span className="text-slate-300">|</span>
                    </>
                  )}
                  {dateStr && (
                    <>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        {new Date(dateStr).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="text-slate-300">|</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    {time}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-600" />
                    {passengers} Yolcu
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-cyan-600">{filteredTransfers.length}</span> araç bulundu
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <TransferFilters
                filters={filters}
                onChange={setFilters}
                resultCount={filteredTransfers.length}
                minPrice={Math.floor(priceRange.min)}
                maxPrice={Math.ceil(priceRange.max)}
                prices={allPrices}
                passengerCount={passengers}
              />
            </div>
          </aside>

          {/* Results Grid */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <TransferFilters
                filters={filters}
                onChange={setFilters}
                resultCount={filteredTransfers.length}
                minPrice={Math.floor(priceRange.min)}
                maxPrice={Math.ceil(priceRange.max)}
                prices={allPrices}
                passengerCount={passengers}
                isOpen={mobileFiltersOpen}
                onToggle={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              />
            </div>

            {/* Results */}
            {filteredTransfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <EmptyState
                  title="Uygun transfer bulunamadı"
                  description="Arama kriterlerinizi değiştirerek tekrar deneyin."
                />
                <button
                  onClick={() => setFilters({
                    vehicleTypes: [],
                    capacityRange: getCapacityRangeForPassengers(passengers),
                    priceRange: { min: Math.floor(priceRange.min), max: Math.ceil(priceRange.max) },
                    amenities: [],
                    sortBy: 'price-asc',
                  })}
                  className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTransfers.map((transfer) => (
                  <TransferResultCard
                    key={transfer.id}
                    transfer={transfer}
                    routeId={routeId}
                    passengerCount={passengers}
                    pickupTime={time}
                    isNightTime={isNightTimeCheck(time)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
