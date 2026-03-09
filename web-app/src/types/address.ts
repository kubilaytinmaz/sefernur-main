// Converted from lib/app/data/models/address_model.dart

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

/** Display an AddressModel as a readable string */
export function displayAddress(addr: AddressModel | string | undefined): string {
  if (!addr) return "-";
  if (typeof addr === "string") return addr || "-";
  return addr.address || addr.city || addr.state || addr.country || "-";
}
