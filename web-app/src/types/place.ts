export type PlaceCity = "mekke" | "medine";

export interface PlaceModel {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  city: PlaceCity;
  images: string[];
  isActive: boolean;
  createdBy: string;
  locationUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const placeCityLabels: Record<PlaceCity, string> = {
  mekke: "Mekke",
  medine: "Medine",
};
