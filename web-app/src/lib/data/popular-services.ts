/**
 * Local Popular Services Data Layer
 * API'yi kullanarak popüler servislere erişim sağlar
 */

import type { PopularServiceModel } from "@/types/popular-service";

const API_BASE = "/api/admin/popular-services";

/**
 * Tüm popüler servisleri getir
 */
export async function getPopularServices(options?: {
  type?: "tour" | "transfer" | "guide";
  onlyPopular?: boolean;
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  const params = new URLSearchParams();
  if (options?.type) params.append("type", options.type);
  if (options?.onlyPopular) params.append("onlyPopular", "true");
  if (options?.limitCount) params.append("limit", options.limitCount.toString());

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Popüler servisler getirilemedi");
  }

  const data = await response.json();
  return data.services.map((s: any) => ({
    ...s,
    createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
  }));
}

/**
 * Tüm popüler servisleri getir (alias)
 */
export const getAllPopularServices = getPopularServices;

/**
 * ID'ye göre popüler servis getir
 */
export async function getPopularServiceById(id: string): Promise<PopularServiceModel | null> {
  const services = await getPopularServices();
  return services.find((s) => s.id === id) || null;
}

/**
 * Sadece popüler turları getir
 */
export async function getPopularTours(options?: {
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  return getPopularServices({
    type: "tour",
    onlyPopular: true,
    limitCount: options?.limitCount,
  });
}

/**
 * Sadece popüler transferleri getir
 */
export async function getPopularTransfers(options?: {
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  return getPopularServices({
    type: "transfer",
    onlyPopular: true,
    limitCount: options?.limitCount,
  });
}

/**
 * Sadece popüler rehberleri getir
 */
export async function getPopularGuides(options?: {
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  return getPopularServices({
    type: "guide",
    onlyPopular: true,
    limitCount: options?.limitCount,
  });
}

/**
 * Popüler servis istatistiklerini getir
 */
export async function getPopularServiceStats(): Promise<{
  total: number;
  popular: number;
  byType: Record<string, number>;
}> {
  const all = await getPopularServices({ onlyPopular: false });

  return {
    total: all.length,
    popular: all.filter((s) => s.isPopular).length,
    byType: {
      transfer: all.filter((s) => s.type === "transfer").length,
      tour: all.filter((s) => s.type === "tour").length,
      guide: all.filter((s) => s.type === "guide").length,
    },
  };
}

/**
 * Bir servis için minimum fiyatı hesapla
 * vehiclePrices varsa en düşük fiyatı, yoksa baseAmount'u döndürür
 */
export function getMinPriceForService(service: PopularServiceModel): number {
  if (service.vehiclePrices) {
    const prices = Object.values(service.vehiclePrices).filter((p) => p != null && p > 0);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  return service.price.baseAmount;
}

/**
 * Bir servis için belirli bir araç tipinin fiyatını getir
 */
export function getPriceForVehicle(
  service: PopularServiceModel,
  vehicleType: string
): number | undefined {
  if (service.vehiclePrices && vehicleType in service.vehiclePrices) {
    return service.vehiclePrices[vehicleType as keyof typeof service.vehiclePrices];
  }
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════
// Admin Fonksiyonları (CRUD)
// ═══════════════════════════════════════════════════════════════════

/**
 * Yeni popüler servis ekle
 */
export async function createPopularService(
  data: Omit<PopularServiceModel, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Servis eklenemedi");
  }

  const result = await response.json();
  return result.id;
}

/**
 * Popüler servis güncelle
 */
export async function updatePopularService(
  id: string,
  data: Partial<PopularServiceModel>
): Promise<void> {
  const response = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });

  if (!response.ok) {
    throw new Error("Servis güncellenemedi");
  }
}

/**
 * Popüler servis sil
 */
export async function deletePopularService(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Servis silinemedi");
  }
}

/**
 * Popüler servislerin sırasını güncelle
 */
export async function reorderPopularServices(
  order: { id: string; order: number }[]
): Promise<void> {
  // Her bir servisi sırasıyla güncelle
  await Promise.all(
    order.map((item) =>
      updatePopularService(item.id, { order: item.order })
    )
  );
}
