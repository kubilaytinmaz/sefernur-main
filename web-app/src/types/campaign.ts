// Converted from lib/app/data/models/campaign/campaign_model.dart

export type CampaignType = "hotel" | "car" | "transfer" | "tour" | "guide";

export interface CampaignModel {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  type: CampaignType;
  isActive: boolean;
  createdBy: string;
  savedByUserIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const campaignTypeLabels: Record<CampaignType, string> = {
  hotel: "Otel",
  car: "Araç",
  transfer: "Transfer",
  tour: "Tur",
  guide: "Rehber",
};
