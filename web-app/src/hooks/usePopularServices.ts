/**
 * Popüler Hizmetler için React Query Hooks
 * Local JSON dosyasından popüler turları, transferleri ve rehberleri çeker
 */

import {
  getPopularGuides,
  getPopularServiceById,
  getPopularServices,
  getPopularTours,
  getPopularTransfers,
} from "@/lib/data/popular-services";
import type { PopularServiceModel } from "@/types/popular-service";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

// ─── Genel Popüler Hizmetler Hook ───────────────────────────────────────────────

/**
 * Tüm popüler hizmetleri getir (veya filtrelenmiş)
 */
export function usePopularServices(options?: {
  type?: "tour" | "transfer" | "guide";
  onlyPopular?: boolean;
  limitCount?: number;
}): UseQueryResult<PopularServiceModel[], Error> {
  return useQuery({
    queryKey: ["popularServices", options],
    queryFn: () => getPopularServices(options),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * ID'ye göre popüler hizmet getir
 */
export function usePopularServiceById(
  id: string | null
) {
  return useQuery<PopularServiceModel | null, Error>({
    queryKey: ["popularService", id],
    queryFn: async () => {
      if (!id) return null;
      return await getPopularServiceById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Özelleştirilmiş Hooks ───────────────────────────────────────────────────────────

/**
 * Sadece popüler turları getir
 */
export function usePopularTours(options?: {
  limitCount?: number;
}): UseQueryResult<PopularServiceModel[], Error> {
  return useQuery({
    queryKey: ["popularTours", options],
    queryFn: () => getPopularTours(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Sadece popüler transferleri getir
 */
export function usePopularTransfers(options?: {
  limitCount?: number;
}): UseQueryResult<PopularServiceModel[], Error> {
  return useQuery({
    queryKey: ["popularTransfers", options],
    queryFn: () => getPopularTransfers(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Sadece popüler rehberleri getir
 */
export function usePopularGuides(options?: {
  limitCount?: number;
}): UseQueryResult<PopularServiceModel[], Error> {
  return useQuery({
    queryKey: ["popularGuides", options],
    queryFn: () => getPopularGuides(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Helper Hook ─────────────────────────────────────────────────────────────────────

/**
 * ID'ye göre popüler hizmet getir (client-side fallback ile)
 * Firebase'den veri çekeme başarısızsa hardcoded veriyi kullanır
 */
export function usePopularServiceByIdWithFallback(
  id: string | null,
  fallbackData?: PopularServiceModel[]
) {
  return useQuery<PopularServiceModel | null, Error>({
    queryKey: ["popularService", id],
    queryFn: async () => {
      if (!id) return null;
      
      // Önce Firebase'den dene
      const result = await getPopularServiceById(id);
      if (result) return result;
      
      // Firebase'de yoksa fallback data'dan ara
      if (fallbackData) {
        return fallbackData.find((s) => s.id === id) || null;
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
