/**
 * Guide filtering utilities
 * Rehber filtreleme fonksiyonları
 */

import { GuideModel } from "@/types/guide";

export interface GuideFilters {
  searchQuery?: string;
  specialties?: string[];
  languages?: string[];
  cities?: string[];
  priceMin?: number;
  priceMax?: number;
  experienceMin?: number;
  experienceMax?: number;
  minRating?: number;
  hasAvailability?: boolean;
  certified?: boolean;
  popular?: boolean;
}

export function filterGuides(guides: GuideModel[], filters: GuideFilters): GuideModel[] {
  return guides.filter((guide) => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase().trim();
      const searchableText = [
        guide.name,
        guide.bio,
        guide.city,
        guide.company,
        ...guide.specialties,
        ...guide.languages,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Specialties
    if (filters.specialties && filters.specialties.length > 0) {
      const hasMatchingSpecialty = filters.specialties.some((s) =>
        guide.specialties.some((gs) => gs.toLowerCase() === s.toLowerCase())
      );
      if (!hasMatchingSpecialty) return false;
    }

    // Languages
    if (filters.languages && filters.languages.length > 0) {
      const hasMatchingLanguage = filters.languages.some((l) =>
        guide.languages.some((gl) => gl.toLowerCase() === l.toLowerCase())
      );
      if (!hasMatchingLanguage) return false;
    }

    // Cities
    if (filters.cities && filters.cities.length > 0) {
      if (!filters.cities.some((c) => guide.city?.toLowerCase() === c.toLowerCase())) {
        return false;
      }
    }

    // Price range
    if (filters.priceMin !== undefined && guide.dailyRate < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== undefined && guide.dailyRate > filters.priceMax) {
      return false;
    }

    // Experience range
    if (filters.experienceMin !== undefined && guide.yearsExperience < filters.experienceMin) {
      return false;
    }
    if (filters.experienceMax !== undefined && guide.yearsExperience > filters.experienceMax) {
      return false;
    }

    // Minimum rating
    if (filters.minRating !== undefined && guide.rating < filters.minRating) {
      return false;
    }

    // Has availability (future implementation)
    if (filters.hasAvailability) {
      // TODO: Check guide availability calendar
    }

    // Certified
    if (filters.certified && (!guide.certifications || guide.certifications.length === 0)) {
      return false;
    }

    // Popular
    if (filters.popular && !guide.isPopular) {
      return false;
    }

    return true;
  });
}

export function getActiveFilterCount(filters: GuideFilters): number {
  let count = 0;

  if (filters.searchQuery) count++;
  if (filters.specialties && filters.specialties.length > 0) count++;
  if (filters.languages && filters.languages.length > 0) count++;
  if (filters.cities && filters.cities.length > 0) count++;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
  if (filters.experienceMin !== undefined || filters.experienceMax !== undefined) count++;
  if (filters.minRating !== undefined) count++;
  if (filters.hasAvailability) count++;
  if (filters.certified) count++;
  if (filters.popular) count++;

  return count;
}

export function clearFilters(): GuideFilters {
  return {};
}
