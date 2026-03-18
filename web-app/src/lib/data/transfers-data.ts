/**
 * Transfers - Hardcoded Local Data
 * Firebase bağlantısız, sadece local veri
 * 
 * Bu veriler transfer araçlarını içerir
 */

import type { TransferModel } from "@/types/transfer";

export const TRANSFERS: TransferModel[] = [
  {
    id: "transfer-sedan-001",
    fromAddress: {
      address: "Kral Abdulaziz Havalimanı",
      city: "Cidde",
      country: "Suudi Arabistan"
    },
    toAddress: {
      address: "Şehir Merkezi",
      city: "Mekke",
      country: "Suudi Arabistan"
    },
    vehicleType: "sedan",
    vehicleName: "Toyota Camry",
    capacity: 3,
    luggageCapacity: 2,
    childSeatCount: 1,
    amenities: ["air_condition", "wifi", "water", "usb"],
    basePrice: 67, // 250 SAR → $67 (güncel fiyat)
    durationMinutes: 90,
    company: "Sefernur Transfer",
    phone: "+966500000001",
    email: "transfer@sefernur.com",
    whatsapp: "+966500000001",
    rating: 4.8,
    reviewCount: 120,
    images: ["/images/transfers/sedan_camry.jpg"],
    isActive: true,
    isPopular: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-14T00:00:00.000Z")
  },
  {
    id: "transfer-van-001",
    fromAddress: {
      address: "Kral Abdulaziz Havalimanı",
      city: "Cidde",
      country: "Suudi Arabistan"
    },
    toAddress: {
      address: "Şehir Merkezi",
      city: "Mekke",
      country: "Suudi Arabistan"
    },
    vehicleType: "van",
    vehicleName: "Kia Carnival",
    capacity: 6,
    luggageCapacity: 6,
    childSeatCount: 2,
    amenities: ["air_condition", "wifi", "water", "usb", "bluetooth"],
    basePrice: 80, // 300 SAR → $80 (güncel fiyat)
    durationMinutes: 90,
    company: "Sefernur Transfer",
    phone: "+966500000002",
    email: "transfer@sefernur.com",
    whatsapp: "+966500000002",
    rating: 4.9,
    reviewCount: 85,
    images: ["/images/transfers/van_white_1.jpg"],
    isActive: true,
    isPopular: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-14T00:00:00.000Z")
  },
  {
    id: "transfer-bus-001",
    fromAddress: {
      address: "Kral Abdulaziz Havalimanı",
      city: "Cidde",
      country: "Suudi Arabistan"
    },
    toAddress: {
      address: "Şehir Merkezi",
      city: "Mekke",
      country: "Suudi Arabistan"
    },
    vehicleType: "bus",
    vehicleName: "Lüks Otobüs",
    capacity: 45,
    luggageCapacity: 50,
    childSeatCount: 0,
    amenities: ["air_condition", "wifi", "water", "tv", "usb"],
    basePrice: 267, // 1000 SAR → $267 (güncel fiyat)
    durationMinutes: 120,
    company: "Sefernur Transfer",
    phone: "+966500000003",
    email: "transfer@sefernur.com",
    whatsapp: "+966500000003",
    rating: 4.7,
    reviewCount: 45,
    images: ["/images/transfers/bus_white_1.jpg"],
    isActive: true,
    isPopular: false,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-14T00:00:00.000Z")
  },
  {
    id: "transfer-vip-001",
    fromAddress: {
      address: "Kral Abdulaziz Havalimanı",
      city: "Cidde",
      country: "Suudi Arabistan"
    },
    toAddress: {
      address: "Şehir Merkezi",
      city: "Mekke",
      country: "Suudi Arabistan"
    },
    vehicleType: "vip",
    vehicleName: "GMC Yukon",
    capacity: 6,
    luggageCapacity: 4,
    childSeatCount: 1,
    amenities: ["air_condition", "wifi", "water", "usb", "bluetooth", "snacks", "comfort"],
    basePrice: 133, // 500 SAR → $133 (güncel fiyat)
    durationMinutes: 90,
    company: "Sefernur VIP Transfer",
    phone: "+966500000004",
    email: "vip@sefernur.com",
    whatsapp: "+966500000004",
    rating: 5.0,
    reviewCount: 32,
    images: ["/images/transfers/vip_suv_luxury.jpg"],
    isActive: true,
    isPopular: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-14T00:00:00.000Z")
  },
  {
    id: "transfer-coster-001",
    fromAddress: {
      address: "Prens Muhammed Bin Abdulaziz Havalimanı",
      city: "Medine",
      country: "Suudi Arabistan"
    },
    toAddress: {
      address: "Şehir Merkezi",
      city: "Mekke",
      country: "Suudi Arabistan"
    },
    vehicleType: "coster",
    vehicleName: "Toyota Haice",
    capacity: 12,
    luggageCapacity: 10,
    childSeatCount: 2,
    amenities: ["air_condition", "wifi", "water", "usb"],
    basePrice: 120, // 450 SAR → $120 (güncel fiyat)
    durationMinutes: 180,
    company: "Sefernur Transfer",
    phone: "+966500000005",
    email: "transfer@sefernur.com",
    whatsapp: "+966500000005",
    rating: 4.6,
    reviewCount: 28,
    images: ["/images/transfers/van_white_2.jpg"],
    isActive: true,
    isPopular: false,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-14T00:00:00.000Z")
  },
  {
    id: "transfer-van-002",
    fromAddress: {
      address: "Kral Abdulaziz Havalimanı",
      city: "Cidde",
      country: "Suudi Arabistan"
    },
    toAddress: {
      address: "Şehir Merkezi",
      city: "Mekke",
      country: "Suudi Arabistan"
    },
    vehicleType: "van",
    vehicleName: "Hyundai Staria",
    capacity: 8,
    luggageCapacity: 8,
    childSeatCount: 2,
    amenities: ["air_condition", "wifi", "water", "usb", "bluetooth"],
    basePrice: 93, // 350 SAR → $93 (güncel fiyat - Staria)
    durationMinutes: 90,
    company: "Sefernur Transfer",
    phone: "+966500000007",
    email: "transfer@sefernur.com",
    whatsapp: "+966500000007",
    rating: 4.9,
    reviewCount: 65,
    images: ["/images/transfers/van_white_2.jpg"],
    isActive: true,
    isPopular: false,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-03-14T00:00:00.000Z")
  }
];

// ═══════════════════════════════════════════════════════════════════
// Public Fonksiyonlar (Firebase yerine local data kullanır)
// ═══════════════════════════════════════════════════════════════════

/**
 * Aktif transferleri getir
 */
export async function getActiveTransfers(options?: {
  maxResults?: number;
  onlyPopular?: boolean;
}): Promise<TransferModel[]> {
  let result = [...TRANSFERS];

  if (options?.onlyPopular) {
    result = result.filter(t => t.isPopular);
  }

  result.sort((a, b) => a.basePrice - b.basePrice);

  if (options?.maxResults) {
    result = result.slice(0, options.maxResults);
  }

  return result;
}

/**
 * ID'ye göre transfer getir
 */
export async function getTransferById(id: string): Promise<TransferModel | null> {
  return TRANSFERS.find(t => t.id === id) || null;
}

/**
 * Tüm transferleri getir (admin)
 */
export async function getAllTransfers(options?: {
  maxResults?: number;
  onlyActive?: boolean;
  onlyPopular?: boolean;
}): Promise<TransferModel[]> {
  let result = [...TRANSFERS];

  if (options?.onlyActive) {
    result = result.filter(t => t.isActive);
  }
  if (options?.onlyPopular) {
    result = result.filter(t => t.isPopular);
  }

  result.sort((a, b) => a.basePrice - b.basePrice);

  if (options?.maxResults) {
    result = result.slice(0, options.maxResults);
  }

  return result;
}

/**
 * Transfer istatistiklerini getir
 */
export async function getTransferStats(): Promise<{
  total: number;
  active: number;
  popular: number;
  avgPrice: number;
  avgRating: string;
}> {
  const all = TRANSFERS;
  return {
    total: all.length,
    active: all.filter(t => t.isActive).length,
    popular: all.filter(t => t.isPopular).length,
    avgPrice: all.length > 0
      ? Math.round(all.reduce((sum, t) => sum + t.basePrice, 0) / all.length)
      : 0,
    avgRating: all.length > 0
      ? (all.reduce((sum, t) => sum + t.rating, 0) / all.length).toFixed(1)
      : "0.0"
  };
}

// ═══════════════════════════════════════════════════════════════════
// Admin Fonksiyonları (Local CRUD - bellekte güncelleme)
// ═══════════════════════════════════════════════════════════════════

/**
 * Yeni transfer ekle (bellekte)
 */
export async function createTransfer(
  data: Omit<TransferModel, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const id = `transfer-${Date.now()}`;
  const now = new Date();
  TRANSFERS.push({
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

/**
 * Transfer güncelle (bellekte)
 */
export async function updateTransfer(
  id: string,
  data: Partial<TransferModel>
): Promise<void> {
  const index = TRANSFERS.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Transfer bulunamadı");
  TRANSFERS[index] = {
    ...TRANSFERS[index],
    ...data,
    id, // ID değişmemeli
    updatedAt: new Date(),
  };
}

/**
 * Transfer sil (bellekte)
 */
export async function deleteTransfer(id: string): Promise<void> {
  const index = TRANSFERS.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Transfer bulunamadı");
  TRANSFERS.splice(index, 1);
}
