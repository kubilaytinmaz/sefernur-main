export type BlogCategory = "hazirlik" | "rehber" | "deneyim" | "genel";

export interface BlogModel {
  id: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl: string;
  category: BlogCategory;
  authorName?: string;
  authorImageUrl?: string;
  tags: string[];
  readTimeMinutes?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const blogCategoryLabels: Record<BlogCategory, string> = {
  hazirlik: "Hazırlık",
  rehber: "Rehber",
  deneyim: "Deneyim",
  genel: "Genel",
};
