/**
 * Popüler Rotalar için React Query Hooks
 * Firebase'den popüler transfer rotalarını çeker
 */

import {
    getPopularRouteById,
    getPopularRoutes,
    getPopularRoutesByCategory,
    getRoutesBetweenCities,
} from "@/lib/firebase/transfers-public";
import type { PopularRouteModel } from "@/types/popular-route";
import { useQuery } from "@tanstack/react-query";

// ─── Genel Popüler Rotalar Hook ───────────────────────────────────────────────────────

/**
 * Tüm popüler rotaları getir
 */
export function usePopularRoutes(options?: {
  onlyPopular?: boolean;
  limitCount?: number;
}) {
  return useQuery<PopularRouteModel[], Error>({
    queryKey: ["popularRoutes", options],
    queryFn: () => getPopularRoutes(options),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * ID'ye göre popüler rota getir
 */
export function usePopularRouteById(id: string | null) {
  return useQuery<PopularRouteModel | null, Error>({
    queryKey: ["popularRoute", id],
    queryFn: async () => {
      if (!id) return null;
      return await getPopularRouteById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Kategoriye göre popüler rotaları getir
 */
export function usePopularRoutesByCategory(
  category: "airport" | "intercity" | "local" | null
) {
  return useQuery<PopularRouteModel[], Error>({
    queryKey: ["popularRoutes", "category", category],
    queryFn: () => {
      if (!category) return [];
      return getPopularRoutesByCategory(category);
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Şehirler arası rotaları getir
 */
export function useRoutesBetweenCities(fromCity: string | null, toCity: string | null) {
  return useQuery<PopularRouteModel[], Error>({
    queryKey: ["popularRoutes", "between", fromCity, toCity],
    queryFn: () => {
      if (!fromCity || !toCity) return [];
      return getRoutesBetweenCities(fromCity, toCity);
    },
    enabled: !!fromCity && !!toCity,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Helper Hook ─────────────────────────────────────────────────────────────────────

/**
 * ID'ye göre popüler rota getir (client-side fallback ile)
 * Firebase'den veri çekeme başarısızsa hardcoded veriyi kullanır
 */
export function usePopularRouteByIdWithFallback(
  id: string | null,
  fallbackData?: PopularRouteModel[]
) {
  return useQuery<PopularRouteModel | null, Error>({
    queryKey: ["popularRoute", id],
    queryFn: async () => {
      if (!id) return null;
      
      // Önce Firebase'den dene
      const result = await getPopularRouteById(id);
      if (result) return result;
      
      // Firebase'de yoksa fallback data'dan ara
      if (fallbackData) {
        return fallbackData.find((r) => r.id === id) || null;
      }
      
      return null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
