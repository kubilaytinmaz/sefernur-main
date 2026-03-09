/**
 * Guide sorting utilities
 * Rehber sıralama fonksiyonları
 */

import { GuideModel } from "@/types/guide";
import { GuideSortOption } from "./constants";

export function sortGuides(guides: GuideModel[], sortBy: GuideSortOption): GuideModel[] {
  const sorted = [...guides];

  switch (sortBy) {
    case "recommended":
      // Popülerlik, puan, yorum sayısı ve deneyime göre sıralama
      return sorted.sort((a, b) => {
        if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
        if (a.rating !== b.rating) return b.rating - a.rating;
        if (a.reviewCount !== b.reviewCount) return b.reviewCount - a.reviewCount;
        return b.yearsExperience - a.yearsExperience;
      });

    case "rating":
      return sorted.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });

    case "price-asc":
      return sorted.sort((a, b) => a.dailyRate - b.dailyRate);

    case "price-desc":
      return sorted.sort((a, b) => b.dailyRate - a.dailyRate);

    case "reviews":
      return sorted.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        return b.rating - a.rating;
      });

    case "experience":
      return sorted.sort((a, b) => {
        if (b.yearsExperience !== a.yearsExperience) {
          return b.yearsExperience - a.yearsExperience;
        }
        return b.rating - a.rating;
      });

    default:
      return sorted;
  }
}

export function getDefaultSortOption(): GuideSortOption {
  return "recommended";
}
