"use client";

import { useAuthStore } from "@/store/auth";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/* ────────── Types ────────── */

export type FavoriteItemType = "transfer" | "guide" | "tour" | "hotel" | "place";

export interface FavoriteButtonProps {
  itemId: string;
  itemType: FavoriteItemType;
  title: string;
  imageUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

/* ────────── Helper Functions ────────── */

// LocalStorage'dan favorileri getir
function getStoredFavorites(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const key = `favorites_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

// LocalStorage'a favorileri kaydet
function saveStoredFavorites(userId: string, favorites: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    const key = `favorites_${userId}`;
    localStorage.setItem(key, JSON.stringify([...favorites]));
  } catch {
    // Silent fail
  }
}

// Favori anahtarı oluştur
function getFavoriteKey(itemId: string, itemType: FavoriteItemType): string {
  return `${itemType}:${itemId}`;
}

/* ────────── Component ────────── */

export function FavoriteButton({
  itemId,
  itemType,
  title,
  imageUrl,
  className = "",
  size = "md",
  showLabel = false,
  onToggle,
}: FavoriteButtonProps) {
  const user = useAuthStore((state) => state.user);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Kullanıcı giriş yaptığında favorileri yükle
  useEffect(() => {
    if (user?.id) {
      const favorites = getStoredFavorites(user.id);
      const key = getFavoriteKey(itemId, itemType);
      setIsFavorite(favorites.has(key));
    } else {
      setIsFavorite(false);
    }
  }, [user?.id, itemId, itemType]);

  // Favori durumunu değiştir
  const toggleFavorite = useCallback(async () => {
    if (!user?.id) {
      // Giriş yapmamış kullanıcıya giriş sayfasına yönlendir
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    const key = getFavoriteKey(itemId, itemType);
    const favorites = getStoredFavorites(user.id);
    const newState = !isFavorite;

    try {
      if (newState) {
        // Favoriye ekle
        favorites.add(key);
        
        // TODO: Firebase'e kaydet
        // await addFavorite({
        //   userId: user.id,
        //   type: itemType,
        //   itemId,
        //   title,
        //   imageUrl,
        // });
      } else {
        // Favoriden çıkar
        favorites.delete(key);
        
        // TODO: Firebase'den sil
        // await removeFavorite(user.id, key);
      }

      saveStoredFavorites(user.id, favorites);
      setIsFavorite(newState);
      onToggle?.(newState);
    } catch (error) {
      console.error("Favori güncellenirken hata:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, itemId, itemType, isFavorite, title, imageUrl, onToggle]);

  // Boyutlara göre stil
  const sizeStyles = {
    sm: {
      button: "w-8 h-8",
      icon: "w-4 h-4",
    },
    md: {
      button: "w-10 h-10",
      icon: "w-5 h-5",
    },
    lg: {
      button: "w-12 h-12",
      icon: "w-6 h-6",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`
        ${currentSize.button}
        ${showLabel ? "flex items-center gap-2 px-3" : ""}
        rounded-full
        flex items-center justify-center
        transition-all duration-200
        ${isFavorite 
          ? "bg-red-50 hover:bg-red-100 text-red-600" 
          : "bg-white hover:bg-slate-50 text-slate-400 hover:text-red-500"
        }
        border ${isFavorite ? "border-red-200" : "border-slate-200"}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      <Heart 
        className={`${currentSize.icon} ${isFavorite ? "fill-current" : ""} transition-all duration-200`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorite ? "Favorilerde" : "Favoriye Ekle"}
        </span>
      )}
    </button>
  );
}

/* ────────── Hook: Favori Kontrolü ────────── */

export function useFavorite(itemId: string, itemType: FavoriteItemType) {
  const user = useAuthStore((state) => state.user);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const favorites = getStoredFavorites(user.id);
      const key = getFavoriteKey(itemId, itemType);
      setIsFavorite(favorites.has(key));
    } else {
      setIsFavorite(false);
    }
  }, [user?.id, itemId, itemType]);

  return isFavorite;
}

/* ────────── Hook: Tüm Favoriler ────────── */

export function useFavorites() {
  const user = useAuthStore((state) => state.user);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.id) {
      setFavorites(getStoredFavorites(user.id));
    } else {
      setFavorites(new Set());
    }
  }, [user?.id]);

  const addFavorite = useCallback((itemId: string, itemType: FavoriteItemType) => {
    if (!user?.id) return false;
    const key = getFavoriteKey(itemId, itemType);
    const newFavorites = new Set(favorites);
    newFavorites.add(key);
    saveStoredFavorites(user.id, newFavorites);
    setFavorites(newFavorites);
    return true;
  }, [user?.id, favorites]);

  const removeFavorite = useCallback((itemId: string, itemType: FavoriteItemType) => {
    if (!user?.id) return false;
    const key = getFavoriteKey(itemId, itemType);
    const newFavorites = new Set(favorites);
    newFavorites.delete(key);
    saveStoredFavorites(user.id, newFavorites);
    setFavorites(newFavorites);
    return true;
  }, [user?.id, favorites]);

  const isFavorite = useCallback((itemId: string, itemType: FavoriteItemType) => {
    const key = getFavoriteKey(itemId, itemType);
    return favorites.has(key);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    count: favorites.size,
  };
}
