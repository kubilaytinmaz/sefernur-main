/**
 * useGuideFavorites Hook
 * Rehber favorileri yönetimi (localStorage persistence)
 */

"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITES_STORAGE_KEY = "guide_favorites";

function getFavoritesFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(favorites: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage is not available
  }
}

export function useGuideFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(getFavoritesFromStorage());
  }, []);

  const toggleFavorite = useCallback((guideId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(guideId)
        ? prev.filter((id) => id !== guideId)
        : [...prev, guideId];
      saveFavoritesToStorage(newFavorites);
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback(
    (guideId: string) => favorites.includes(guideId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavoritesToStorage([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoriteCount: favorites.length,
  };
}
