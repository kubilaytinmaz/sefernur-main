"use client";

import { FavoriteItemType } from "@/components/favorites/FavoriteButton";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";

/* ────────── Types ────────── */

export interface CompareItem {
  id: string;
  type: FavoriteItemType;
  title: string;
  imageUrl?: string;
  price: number;
  rating?: number;
  // Transfer specific
  vehicleType?: string;
  capacity?: number;
  durationMinutes?: number;
  // Guide specific
  specialties?: string[];
  languages?: string[];
  dailyRate?: number;
  // Tour specific
  category?: string;
  durationDays?: number;
  // Hotel specific
  stars?: number;
  location?: string;
  // Place specific
  city?: string;
  // Generic
  [key: string]: any;
}

interface CompareContextType {
  compareItems: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string, type: FavoriteItemType) => void;
  clearCompare: () => void;
  isInCompare: (id: string, type: FavoriteItemType) => boolean;
  compareCount: number;
  maxCompareItems: number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

/* ────────── Provider ────────── */

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);

  const addToCompare = useCallback((item: CompareItem) => {
    setCompareItems((prev) => {
      // Zaten listede mi kontrol et
      const exists = prev.some(
        (i) => i.id === item.id && i.type === item.type
      );
      
      if (exists) {
        // Zaten var, başa taşı
        return prev.filter(
          (i) => !(i.id === item.id && i.type === item.type)
        );
      }

      // Maksimum sayıyı kontrol et
      if (prev.length >= MAX_COMPARE_ITEMS) {
        // İlk öğeyi çıkar, yenisini ekle
        const newItems = prev.slice(1);
        return [...newItems, item];
      }

      return [...prev, item];
    });
  }, []);

  const removeFromCompare = useCallback((id: string, type: FavoriteItemType) => {
    setCompareItems((prev) =>
      prev.filter((item) => !(item.id === id && item.type === type))
    );
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
  }, []);

  const isInCompare = useCallback(
    (id: string, type: FavoriteItemType) => {
      return compareItems.some((item) => item.id === id && item.type === type);
    },
    [compareItems]
  );

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareItems.length,
        maxCompareItems: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

/* ────────── Hook ────────── */

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
}
