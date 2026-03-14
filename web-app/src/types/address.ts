// Converted from lib/app/data/models/address_model.dart

import { translateAddress, translateCity } from "@/lib/transfers/address-translator";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface AddressModel {
  location?: LatLng;
  address?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  neighborhood?: string;
}

/** Display an AddressModel as a readable string (Arapça → Türkçe çeviri destekli) */
export function displayAddress(addr: AddressModel | string | undefined): string {
  if (!addr) return "-";
  if (typeof addr === "string") {
    const result = addr || "-";
    return result === "-" ? result : translateAddress(result);
  }
  const raw = addr.address || addr.city || addr.state || addr.country || "-";
  return raw === "-" ? raw : translateAddress(raw);
}

/** Display city name with Turkish translation */
export function displayCity(addr: AddressModel | string | undefined): string {
  if (!addr) return "-";
  if (typeof addr === "string") return translateCity(addr) || "-";
  const city = addr.city || addr.state || "-";
  return city === "-" ? city : translateCity(city);
}
