// Converted from lib/app/data/models/reservation/reservation_model.dart

export type ReservationType = "hotel" | "car" | "transfer" | "guide" | "tour" | "transfer_tour";
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface ReservationModel {
  id?: string;
  userId: string;
  type: ReservationType;
  itemId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
  people?: number;
  price: number;
  currency: string;
  status: ReservationStatus;
  paymentOrderId?: string;
  paymentStatus?: "initiated" | "success" | "failed";
  meta?: Record<string, unknown>;
  userPhone?: string;
  userEmail?: string;
  notes?: string;
  source?: "web" | "mobile" | "admin";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
