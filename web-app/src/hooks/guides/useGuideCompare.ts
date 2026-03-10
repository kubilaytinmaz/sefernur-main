/**
 * useGuideCompare Hook
 * Rehber karşılaştırma yönetimi
 */

"use client";

import { MAX_COMPARE_GUIDES } from "@/lib/guides/constants";
import { GuideModel } from "@/types/guide";
import { useCallback, useState } from "react";

export function useGuideCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompare = useCallback((guideId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(guideId)) {
        return prev.filter((id) => id !== guideId);
      }
      if (prev.length >= MAX_COMPARE_GUIDES) {
        return prev; // Don't add more than max
      }
      return [...prev, guideId];
    });
  }, []);

  const isComparing = useCallback(
    (guideId: string) => compareIds.includes(guideId),
    [compareIds]
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const removeFromCompare = useCallback((guideId: string) => {
    setCompareIds((prev) => prev.filter((id) => id !== guideId));
  }, []);

  const canAddMore = compareIds.length < MAX_COMPARE_GUIDES;

  return {
    compareIds,
    toggleCompare,
    isComparing,
    clearCompare,
    removeFromCompare,
    canAddMore,
    compareCount: compareIds.length,
  };
}

/**
 * Karşılaştırma için rehber verilerini formatlar
 */
export function getComparisonData(guides: GuideModel[], compareIds: string[]) {
  return compareIds
    .map((id) => guides.find((g) => g.id === id))
    .filter(Boolean) as GuideModel[];
}
