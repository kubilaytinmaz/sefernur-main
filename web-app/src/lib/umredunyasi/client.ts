/**
 * UmreDunyasi API Client
 *
 * UmreDunyasi.com API'sine HTTP istekleri için client sınıfı.
 * Next.js fetch API'si kullanır, timeout ve error handling içerir.
 *
 * API Endpoints:
 * - GET /api/tours - Tüm turlar (query params ile filtreleme)
 * - GET /api/tours/featured - Öne çıkan turlar
 * - GET /api/tours/best-by-firm - Firma bazlı en iyi turlar
 * - GET /api/tours/economic - Ekonomik turlar
 * - GET /api/tours/long - Uzun turlar (14+ gün)
 * - GET /api/tours/:slug - Slug ile tur detayı
 */

import { UMREDUNYASI_CONFIG } from "./constants";
import type {
    UmreDunyasiErrorResponse,
    UmreDunyasiResponse,
    UmreDunyasiTour,
    UmreDunyasiToursQuery,
} from "./types";

/**
 * UmreDunyasi API Client sınıfı
 *
 * @example
 * ```ts
 * const client = new UmreDunyasiClient();
 * const tours = await client.getUpcomingTours(6);
 * ```
 */
export class UmreDunyasiClient {
  private baseURL: string;
  private timeout: number;

  constructor(config = UMREDUNYASI_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  /**
   * Yaklaşan (gelecek) aktif turları getirir
   *
   * @param limit - Getirilecek tur sayısı (varsayılan: 6)
   * @returns Tur listesi
   *
   * @example
   * ```ts
   * const tours = await client.getUpcomingTours(6);
   * ```
   */
  async getUpcomingTours(limit = 6): Promise<UmreDunyasiTour[]> {
    const params: UmreDunyasiToursQuery = {
      isActive: true,
      limit,
      sortBy: "date",
      sortOrder: "asc",
    };

    const response = await this.fetchTours(params);
    return response.data;
  }

  /**
   * Öne çıkan turları getirir
   *
   * @param limit - Getirilecek tur sayısı (varsayılan: 4)
   * @returns Tur listesi
   */
  async getFeaturedTours(limit = 4): Promise<UmreDunyasiTour[]> {
    const response = await this.fetch(`/tours/featured?limit=${limit}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Firma bazlı en iyi turları getirir
   *
   * @param limit - Getirilecek tur sayısı (varsayılan: 8)
   * @returns Tur listesi
   */
  async getBestToursByFirm(limit = 8): Promise<UmreDunyasiTour[]> {
    const response = await this.fetch(`/tours/best-by-firm?limit=${limit}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Ekonomik turları getirir
   *
   * @param limit - Getirilecek tur sayısı (varsayılan: 4)
   * @returns Tur listesi
   */
  async getEconomicTours(limit = 4): Promise<UmreDunyasiTour[]> {
    const response = await this.fetch(`/tours/economic?limit=${limit}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Uzun turları getirir (14+ gün)
   *
   * @param limit - Getirilecek tur sayısı (varsayılan: 4)
   * @returns Tur listesi
   */
  async getLongTours(limit = 4): Promise<UmreDunyasiTour[]> {
    const response = await this.fetch(`/tours/long?limit=${limit}`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * Slug ile tur detayını getirir
   *
   * @param slug - Tur slug'ı
   * @returns Tur detayı veya null
   */
  async getTourBySlug(slug: string): Promise<UmreDunyasiTour | null> {
    try {
      const response = await this.fetch(`/tours/${slug}`);
      const data = await response.json();
      return data.data || null;
    } catch {
      return null;
    }
  }

  /**
   * Genel tur sorgusu yapar (query params ile filtreleme)
   *
   * @param query - Sorgu parametreleri
   * @returns API response
   */
  async getTours(query: UmreDunyasiToursQuery): Promise<UmreDunyasiResponse> {
    return this.fetchTours(query);
  }

  /**
   * Query params ile tur listesi fetch eder
   *
   * @param query - Sorgu parametreleri
   * @returns API response
   */
  private async fetchTours(
    query: UmreDunyasiToursQuery
  ): Promise<UmreDunyasiResponse> {
    const params = new URLSearchParams();

    if (query.isActive !== undefined) {
      params.append("isActive", query.isActive.toString());
    }
    if (query.limit) {
      params.append("limit", query.limit.toString());
    }
    if (query.page) {
      params.append("page", query.page.toString());
    }
    if (query.sortBy) {
      params.append("sortBy", query.sortBy);
    }
    if (query.sortOrder) {
      params.append("sortOrder", query.sortOrder);
    }
    if (query.categoryId) {
      params.append("categoryId", query.categoryId);
    }
    if (query.firmId) {
      params.append("firmId", query.firmId);
    }
    if (query.minPrice) {
      params.append("minPrice", query.minPrice.toString());
    }
    if (query.maxPrice) {
      params.append("maxPrice", query.maxPrice.toString());
    }
    if (query.duration) {
      params.append("duration", query.duration.toString());
    }
    if (query.hotelStars) {
      params.append("hotelStars", query.hotelStars.toString());
    }
    if (query.flightType) {
      params.append("flightType", query.flightType);
    }
    if (query.search) {
      params.append("search", query.search);
    }
    if (query.month) {
      params.append("month", query.month.toString());
    }
    if (query.year) {
      params.append("year", query.year.toString());
    }

    const queryString = params.toString();
    const response = await this.fetch(
      queryString ? `/tours?${queryString}` : "/tours"
    );
    const data = await response.json();

    return data as UmreDunyasiResponse;
  }

  /**
   * HTTP fetch işlemi yapar
   *
   * @param path - API path (query string dahil)
   * @returns Fetch response
   * @throws Error on timeout or non-OK response
   */
  private async fetch(path: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseURL}${path}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          // User agent ekleyerek API'ye tanıtım
          "User-Agent": "Sefernur-Bot/1.0",
        },
        // Next.js cache kontrolü
        next: {
          revalidate: UMREDUNYASI_CONFIG.revalidateSeconds,
        },
      });

      if (!response.ok) {
        throw new Error(
          `UmreDunyasi API Error: HTTP ${response.status} - ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      // Timeout hatası
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `UmreDunyasi API timeout after ${this.timeout}ms`
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Singleton instance
 *
 * Tüm uygulama boyunca tek bir client instance kullanılır.
 *
 * @example
 * ```ts
 * import { umredunyasiClient } from '@/lib/umredunyasi/client';
 *
 * const tours = await umredunyasiClient.getUpcomingTours(6);
 * ```
 */
export const umredunyasiClient = new UmreDunyasiClient();

/**
 * Error type for UmreDunyasi API errors
 */
export class UmreDunyasiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "UmreDunyasiError";
  }
}

/**
 * API error response'unu UmreDunyasiError'a dönüştürür
 *
 * @param response - Error response
 * @returns UmreDunyasiError instance
 */
export function toUmreDunyasiError(
  response: UmreDunyasiErrorResponse
): UmreDunyasiError {
  return new UmreDunyasiError(
    response.message || response.error || "Unknown error",
    response.error,
    response.statusCode
  );
}
