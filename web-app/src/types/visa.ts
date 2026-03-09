// Converted from lib/app/data/models/visa/visa_application_model.dart

export type VisaStatus = "received" | "processing" | "completed" | "rejected";
export type VisaPurpose =
  | "umre"
  | "hac"
  | "turizm"
  | "business"
  | "education"
  | "medical"
  | "visit";

export const visaStatusLabels: Record<VisaStatus, string> = {
  received: "Alındı",
  processing: "İşleniyor",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

export const visaStatusColors: Record<VisaStatus, { bg: string; text: string; border: string }> = {
  received: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  processing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export const visaPurposeLabels: Record<VisaPurpose, string> = {
  umre: "Umre",
  hac: "Hac",
  turizm: "Turizm",
  business: "İş",
  education: "Eğitim",
  medical: "Sağlık",
  visit: "Ziyaret",
};

export interface VisaApplicationModel {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  phone: string;
  email: string;
  address?: string;
  country: string;
  city: string;
  purpose: VisaPurpose;
  departureDate: Date;
  returnDate: Date;
  fee: number;
  currency: string;
  status: VisaStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  requiredFileUrls: string[]; // passport, photo, id
  additionalFileUrls?: string[];
  paymentReceiptUrl?: string;
  paymentNote?: string;
  adminNote?: string;
  userNote?: string;
  maritalStatus?: string;
}
