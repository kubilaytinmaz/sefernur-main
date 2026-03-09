export type FavoriteTargetType = "hotel" | "car" | "transfer" | "guide" | "tour" | "campaign";

export interface FavoriteMeta {
  title?: string;
  image?: string;
  subtitle?: string;
  rating?: number;
  price?: number;
  currency?: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  targetType: FavoriteTargetType;
  targetId: string;
  createdAt: Date;
  meta: FavoriteMeta;
}

export const favoriteTypeLabels: Record<FavoriteTargetType, string> = {
  hotel: "Otel",
  car: "Araç",
  transfer: "Transfer",
  guide: "Rehber",
  tour: "Tur",
  campaign: "Kampanya",
};
