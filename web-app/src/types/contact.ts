export type ContactSubject =
  | "reservation"
  | "tour"
  | "transfer"
  | "visa"
  | "complaint"
  | "other"
  | "";

export const contactSubjectLabels: Record<string, string> = {
  reservation: "Rezervasyon",
  tour: "Tur Bilgisi",
  transfer: "Transfer",
  visa: "Vize İşlemleri",
  complaint: "Şikayet / Öneri",
  other: "Diğer",
};

export interface ContactMessageModel {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject;
  message: string;
  isRead: boolean;
  adminNote?: string;
  repliedAt?: Date;
  createdAt: Date;
}
