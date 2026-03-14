/**
 * Transfer Sistemi - Public API Fonksiyonları
 * Kullanıcı tarafı için Firebase veri erişim fonksiyonları
 */

import type { PopularRouteModel } from "@/types/popular-route";
import type { PopularServiceModel } from "@/types/popular-service";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./firestore";

// ─── Helper Functions ───────────────────────────────────────────────────────

function asDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

// ─── Popüler Hizmetler ───────────────────────────────────────────────────────────

/**
 * Tüm popüler hizmetleri getir (aktif ve popüler olanlar)
 */
export async function getPopularServices(options?: {
  type?: "tour" | "transfer" | "guide";
  onlyPopular?: boolean;
  limitCount?: number;
}): Promise<PopularServiceModel[]> {
  const constraints: any[] = [];
  
  // Sadece popüler olanları getir
  if (options?.onlyPopular !== false) {
    constraints.push(where("isPopular", "==", true));
  }
  
  // Tipe göre filtrele
  if (options?.type) {
    constraints.push(where("type", "==", options.type));
  }
  
  // Sıralama
  constraints.push(orderBy("order", "asc"));
  
  // Limit
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }
  
  const q = query(collection(db, COLLECTIONS.POPULAR_SERVICES), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: asDate(data.createdAt),
      updatedAt: asDate(data.updatedAt),
    } as PopularServiceModel;
  });
}

/**
 * ID'ye göre popüler hizmet getir
 */
export async function getPopularServiceById(
  id: string
): Promise<PopularServiceModel | null> {
  const docRef = doc(db, COLLECTIONS.POPULAR_SERVICES, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  } as PopularServiceModel;
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

// ─── Popüler Rotalar ─────────────────────────────────────────────────────────────

/**
 * Tüm popüler rotaları getir
 */
export async function getPopularRoutes(options?: {
  onlyPopular?: boolean;
  limitCount?: number;
}): Promise<PopularRouteModel[]> {
  const constraints: any[] = [];
  
  // Sadece popüler olanları getir
  if (options?.onlyPopular !== false) {
    constraints.push(where("isPopular", "==", true));
  }
  
  // Sıralama
  constraints.push(orderBy("order", "asc"));
  
  // Limit
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }
  
  const q = query(collection(db, COLLECTIONS.POPULAR_ROUTES), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: asDate(data.createdAt),
      updatedAt: asDate(data.updatedAt),
    } as PopularRouteModel;
  });
}

/**
 * ID'ye göre popüler rota getir
 */
export async function getPopularRouteById(
  id: string
): Promise<PopularRouteModel | null> {
  const docRef = doc(db, COLLECTIONS.POPULAR_ROUTES, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  } as PopularRouteModel;
}

/**
 * Kategoriye göre popüler rotaları getir
 */
export async function getPopularRoutesByCategory(
  category: "airport" | "intercity" | "local"
): Promise<PopularRouteModel[]> {
  const q = query(
    collection(db, COLLECTIONS.POPULAR_ROUTES),
    where("category", "==", category),
    where("isPopular", "==", true),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: asDate(data.createdAt),
      updatedAt: asDate(data.updatedAt),
    } as PopularRouteModel;
  });
}

/**
 * Şehirler arası rotaları getir
 */
export async function getRoutesBetweenCities(
  fromCity: string,
  toCity: string
): Promise<PopularRouteModel[]> {
  const q = query(
    collection(db, COLLECTIONS.POPULAR_ROUTES),
    where("isPopular", "==", true)
  );
  const snapshot = await getDocs(q);
  
  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: asDate(data.createdAt),
        updatedAt: asDate(data.updatedAt),
      } as PopularRouteModel;
    })
    .filter(
      (route) =>
        route.from.city.toLowerCase() === fromCity.toLowerCase() &&
        route.to.city.toLowerCase() === toCity.toLowerCase()
    );
}
