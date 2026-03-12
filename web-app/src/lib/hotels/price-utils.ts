/**
 * Hotel Price Utilities
 * 
 * Helper functions for price calculations, per-person pricing,
 * and price comparisons.
 */

import type { Room } from "@/components/hotels";

/* ────────── Types ────────── */

export interface PriceBreakdown {
  totalPrice: number;
  pricePerNight: number;
  pricePerPerson: number;
  pricePerPersonPerNight: number;
  nights: number;
  guests: number;
}

export interface PriceComparisonResult {
  cheapest: boolean;
  savingsPercent?: number;
  savingsAmount?: number;
}

/* ────────── Price Calculations ────────── */

/**
 * Calculate price per person from total price and guest count
 */
export function calculatePricePerPerson(
  totalPrice: number,
  rooms: Room[]
): number {
  const totalGuests = rooms.reduce(
    (sum, r) => sum + r.adults + r.children,
    0
  );

  if (totalGuests === 0) return totalPrice;

  return totalPrice / totalGuests;
}

/**
 * Calculate price per night from total price and night count
 */
export function calculatePricePerNight(
  totalPrice: number,
  checkIn: string,
  checkOut: string
): number {
  const nights = calculateNights(checkIn, checkOut);
  if (nights === 0) return totalPrice;

  return totalPrice / nights;
}

/**
 * Calculate comprehensive price breakdown
 */
export function calculatePriceBreakdown(
  totalPrice: number,
  checkIn: string,
  checkOut: string,
  rooms: Room[]
): PriceBreakdown {
  const nights = calculateNights(checkIn, checkOut);
  const guests = rooms.reduce((sum, r) => sum + r.adults + r.children, 0);

  const pricePerNight = nights > 0 ? totalPrice / nights : totalPrice;
  const pricePerPerson = guests > 0 ? totalPrice / guests : totalPrice;
  const pricePerPersonPerNight =
    nights > 0 && guests > 0 ? totalPrice / (nights * guests) : totalPrice;

  return {
    totalPrice,
    pricePerNight,
    pricePerPerson,
    pricePerPersonPerNight,
    nights,
    guests,
  };
}

/**
 * Calculate night count between two dates
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

/* ────────── Price Comparison ────────── */

/**
 * Compare price against average price in list
 */
export function comparePriceToAverage(
  price: number,
  allPrices: number[]
): PriceComparisonResult {
  if (allPrices.length === 0) {
    return { cheapest: false };
  }

  const average = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;
  const minPrice = Math.min(...allPrices);

  const cheapest = price === minPrice;
  const savingsAmount = average - price;
  const savingsPercent = average > 0 ? (savingsAmount / average) * 100 : 0;

  return {
    cheapest,
    savingsAmount: savingsAmount > 0 ? savingsAmount : undefined,
    savingsPercent: savingsPercent > 0 ? savingsPercent : undefined,
  };
}

/**
 * Find price percentile in list (0-100)
 */
export function getPricePercentile(
  price: number,
  allPrices: number[]
): number {
  if (allPrices.length === 0) return 50;

  const sorted = [...allPrices].sort((a, b) => a - b);
  const index = sorted.findIndex((p) => p >= price);

  if (index === -1) return 100;
  if (index === 0) return 0;

  return (index / sorted.length) * 100;
}

/* ────────── Price Formatting ────────── */

/**
 * Get price label for display (Ekonomik, Orta, Lüks)
 */
export function getPriceLabel(
  price: number,
  allPrices: number[]
): {
  label: string;
  color: string;
  description: string;
} {
  const percentile = getPricePercentile(price, allPrices);

  if (percentile <= 33) {
    return {
      label: "Ekonomik",
      color: "emerald",
      description: "Bütçe dostu seçenek",
    };
  }

  if (percentile <= 66) {
    return {
      label: "Orta Segment",
      color: "blue",
      description: "Fiyat/performans dengesi",
    };
  }

  return {
    label: "Lüks",
    color: "purple",
    description: "Premium hizmet",
  };
}

/**
 * Format price with appropriate suffix
 */
export function formatPriceWithSuffix(
  price: number,
  type: "total" | "night" | "person"
): string {
  const formatted = `$${Math.round(price)}`;

  switch (type) {
    case "night":
      return `${formatted}/gece`;
    case "person":
      return `${formatted}/kişi`;
    case "total":
    default:
      return formatted;
  }
}

/* ────────── Price Range Utilities ────────── */

/**
 * Calculate suggested price range from prices
 */
export function calculateSuggestedPriceRange(
  prices: number[]
): [number, number] {
  if (prices.length === 0) return [0, 1000];

  const sorted = [...prices].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  // Add 5% padding
  const padding = (max - min) * 0.05;
  const paddedMin = Math.max(0, Math.floor(min - padding));
  const paddedMax = Math.ceil(max + padding);

  return [paddedMin, paddedMax];
}

/**
 * Check if price is within range
 */
export function isPriceInRange(
  price: number,
  range: [number, number]
): boolean {
  return price >= range[0] && price <= range[1];
}

/**
 * Get price distribution statistics
 */
export function getPriceStatistics(prices: number[]): {
  min: number;
  max: number;
  average: number;
  median: number;
  count: number;
} {
  if (prices.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0, count: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  return {
    min,
    max,
    average,
    median,
    count: prices.length,
  };
}

/* ────────── Discount Calculations ────────── */

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice === 0) return 0;
  return ((originalPrice - discountedPrice) / originalPrice) * 100;
}

/**
 * Apply discount to price
 */
export function applyDiscount(
  price: number,
  discountPercent: number
): number {
  return price * (1 - discountPercent / 100);
}

/**
 * Check if discount is significant (>= 10%)
 */
export function hasSignificantDiscount(
  originalPrice: number,
  discountedPrice: number
): boolean {
  const percent = calculateDiscountPercent(originalPrice, discountedPrice);
  return percent >= 10;
}
