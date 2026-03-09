export interface WorkingHours {
  weekdays: string;   // e.g. "09:00 - 18:00"
  saturday: string;   // e.g. "10:00 - 15:00"
  sunday: string;     // e.g. "Kapalı"
}

export interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface SiteSettings {
  /* Contact */
  phone: string;
  whatsapp: string;
  email: string;
  address: string;          // short: "Fatih, İstanbul"
  fullAddress: string;      // full: "Fatih Mah. Hac Yolu Cad. No:42"
  addressDetail: string;    // e.g. "Fatih / İstanbul, Türkiye"
  addressNote: string;      // e.g. "Fatih Camii'nin 200m güneyinde"

  /* Brand */
  brandName: string;        // "Sefernur"
  brandSubtitle: string;    // "Kutsal Topraklara Yolculuk"
  tagline: string;          // "Türkiye'nin Güvenilir Umre Platformu"
  aboutText: string;        // footer about paragraph
  copyrightYear: string;    // "2026"

  /* Working hours */
  workingHours: WorkingHours;

  /* Social */
  socialLinks: SocialLinks;

  /* Map */
  mapCoordinates: MapCoordinates;

  /* Logo (optional image URL — falls back to CSS logo if empty) */
  logoUrl: string;

  /* Timestamps */
  updatedAt?: Date;
}

/** Default values matching current hardcoded content */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phone: "0850 123 45 67",
  whatsapp: "+90 532 123 45 67",
  email: "info@sefernur.com",
  address: "Fatih, İstanbul",
  fullAddress: "Fatih Mah. Hac Yolu Cad. No:42",
  addressDetail: "Fatih / İstanbul, Türkiye",
  addressNote: "Fatih Camii'nin 200m güneyinde",
  brandName: "Sefernur",
  brandSubtitle: "Kutsal Topraklara Yolculuk",
  tagline: "Türkiye'nin Güvenilir Umre Platformu",
  aboutText: "20+ yıldır Umre ve Hac organizasyonunda güvenilir hizmet sunuyoruz.",
  copyrightYear: "2026",
  workingHours: {
    weekdays: "09:00 - 18:00",
    saturday: "10:00 - 15:00",
    sunday: "Kapalı",
  },
  socialLinks: {
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
  },
  mapCoordinates: {
    lat: 41.01,
    lng: 28.946,
  },
  logoUrl: "",
};
