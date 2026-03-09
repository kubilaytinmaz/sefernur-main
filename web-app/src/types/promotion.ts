// Converted from lib/app/data/models/promotion/promotion_model.dart

export type PromotionTargetType = "hotel" | "car" | "transfer" | "tour" | "guide";

export const promotionTargetLabels: Record<PromotionTargetType, string> = {
  hotel: "Otel",
  car: "Araç",
  transfer: "Transfer",
  tour: "Tur",
  guide: "Rehber",
};

export interface PromotionModel {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  targetType: PromotionTargetType;
  discountPercent: number;
  discountCode?: string;
  gradientStartColor: string;
  gradientEndColor: string;
  badgeText?: string;
  badgeColor?: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}
