export type ReviewServiceType = "hotel" | "car" | "transfer" | "guide" | "tour";

export interface UserReview {
  id: string;
  userId: string;
  serviceId: string;
  serviceType: ReviewServiceType;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const reviewTypeLabels: Record<ReviewServiceType, string> = {
  hotel: "Otel",
  car: "Araç",
  transfer: "Transfer",
  guide: "Rehber",
  tour: "Tur",
};
