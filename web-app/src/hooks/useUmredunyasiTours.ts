/**
 * useUmredunyasiTours Hook
 *
 * UmreDunyasi turlarını getirmek için React Query hook'u.
 * Otomatik cache, retry ve error handling içerir.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, isLoading, isError } = useUmredunyasiTours(6);
 *
 *   if (isLoading) return <Loading />;
 *   if (isError) return <Error />;
 *   return <TourList tours={data?.data} />;
 * }
 * ```
 */

import { UMREDUNYASI_CONFIG } from "@/lib/umredunyasi";
import { useQuery } from "@tanstack/react-query";

/**
 * UmreDunyasi API response tipi
 */
export interface UmreDunyasiToursResponse {
  success: boolean;
  data: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    priceCurrency: string;
    startDate: string;
    endDate: string;
    duration: number;
    hotelStars: number | null;
    hotelMakkah: string | null;
    hotelMadinah: string | null;
    makkahNights: number | null;
    madinahNights: number | null;
    images: string[];
    firm: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      isVerified: boolean;
    };
    categories: Array<{
      category: {
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        color: string | null;
      };
    }>;
    isFeatured: boolean;
    isSoldOut: boolean;
  }>;
  count: number;
  meta: {
    duration: string;
    cached: boolean;
    source: string;
  };
}

/**
 * Hook options
 */
export interface UseUmredunyasiToursOptions {
  /** Getirilecek tur sayısı (varsayılan: 6) */
  limit?: number;
  /** Öne çıkan turları getir */
  featured?: boolean;
  /** Firma bazlı en iyi turları getir */
  bestByFirm?: boolean;
  /** Ekonomik turları getir */
  economic?: boolean;
  /** Uzun turları getir (14+ gün) */
  long?: boolean;
  /** Otomatik yenileme devre dışı bırak */
  refetchOnWindowFocus?: boolean;
  /** Otomatik yenileme aralığı (ms) */
  refetchInterval?: number | false;
}

/**
 * Hook return tipi
 */
export interface UseUmredunyasiToursResult {
  /** Tur verileri */
  data: UmreDunyasiToursResponse | undefined;
  /** Yükleniyor durumu */
  isLoading: boolean;
  /** Hata durumu */
  isError: boolean;
  /** Hata nesnesi */
  error: Error | null;
  /** Veri var mı */
  isSuccess: boolean;
  /** Manuel yenileme fonksiyonu */
  refetch: () => void;
  /** Veri var mı (loading değilse) */
  isFetched: boolean;
}

/**
 * UmreDunyasi turlarını getiren React Query hook'u
 *
 * @param options - Hook seçenekleri
 * @returns Query sonucu
 *
 * @example
 * ```tsx
 * // Varsayılan: 6 yaklaşan tur
 * const { data, isLoading } = useUmredunyasiTours();
 *
 * // 12 tur getir
 * const { data } = useUmredunyasiTours({ limit: 12 });
 *
 * // Öne çıkan turları getir
 * const { data } = useUmredunyasiTours({ featured: true });
 *
 * // Otomatik yenileme kapalı
 * const { data } = useUmredunyasiTours({ refetchOnWindowFocus: false });
 * ```
 */
export function useUmredunyasiTours(
  options: UseUmredunyasiToursOptions = {}
): UseUmredunyasiToursResult {
  const {
    limit = 6,
    featured = false,
    bestByFirm = false,
    economic = false,
    long = false,
    refetchOnWindowFocus = false,
    refetchInterval = false,
  } = options;

  // Query params oluştur
  const params = new URLSearchParams();
  params.append("limit", limit.toString());

  if (featured) params.append("featured", "true");
  if (bestByFirm) params.append("bestByFirm", "true");
  if (economic) params.append("economic", "true");
  if (long) params.append("long", "true");

  const queryString = params.toString();

  return useQuery({
    queryKey: ["umredunyasi", "tours", queryString],
    queryFn: async (): Promise<UmreDunyasiToursResponse> => {
      const response = await fetch(
        `/api/umredunyasi/tours?${queryString}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: UMREDUNYASI_CONFIG.staleTimeMs, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika (garbage collection time)
    refetchOnWindowFocus,
    refetchInterval,
    retry: 2, // 2 kez dene
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Basitleştirilmiş hook - sadece yaklaşan turlar için
 *
 * @param limit - Getirilecek tur sayısı
 * @returns Query sonucu
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useUpcomingTours(6);
 * ```
 */
export function useUpcomingTours(limit = 6) {
  return useUmredunyasiTours({ limit });
}

/**
 * Öne çıkan turları getiren hook
 *
 * @param limit - Getirilecek tur sayısı
 * @returns Query sonucu
 *
 * @example
 * ```tsx
 * const { data } = useFeaturedTours(4);
 * ```
 */
export function useFeaturedTours(limit = 4) {
  return useUmredunyasiTours({ featured: true, limit });
}

/**
 * Ekonomik turları getiren hook
 *
 * @param limit - Getirilecek tur sayısı
 * @returns Query sonucu
 *
 * @example
 * ```tsx
 * const { data } = useEconomicTours(4);
 * ```
 */
export function useEconomicTours(limit = 4) {
  return useUmredunyasiTours({ economic: true, limit });
}

/**
 * Uzun turları getiren hook (14+ gün)
 *
 * @param limit - Getirilecek tur sayısı
 * @returns Query sonucu
 *
 * @example
 * ```tsx
 * const { data } = useLongTours(4);
 * ```
 */
export function useLongTours(limit = 4) {
  return useUmredunyasiTours({ long: true, limit });
}
