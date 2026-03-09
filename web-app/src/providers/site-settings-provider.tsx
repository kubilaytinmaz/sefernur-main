"use client";

import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/firestore";
import { DEFAULT_SITE_SETTINGS, SiteSettings } from "@/types/site-settings";
import { doc, onSnapshot } from "firebase/firestore";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS);

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.SITE_SETTINGS, "main"),
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        setSettings({
          phone: d.phone ?? DEFAULT_SITE_SETTINGS.phone,
          whatsapp: d.whatsapp ?? DEFAULT_SITE_SETTINGS.whatsapp,
          email: d.email ?? DEFAULT_SITE_SETTINGS.email,
          address: d.address ?? DEFAULT_SITE_SETTINGS.address,
          fullAddress: d.fullAddress ?? DEFAULT_SITE_SETTINGS.fullAddress,
          addressDetail: d.addressDetail ?? DEFAULT_SITE_SETTINGS.addressDetail,
          addressNote: d.addressNote ?? DEFAULT_SITE_SETTINGS.addressNote,
          brandName: d.brandName ?? DEFAULT_SITE_SETTINGS.brandName,
          brandSubtitle: d.brandSubtitle ?? DEFAULT_SITE_SETTINGS.brandSubtitle,
          tagline: d.tagline ?? DEFAULT_SITE_SETTINGS.tagline,
          aboutText: d.aboutText ?? DEFAULT_SITE_SETTINGS.aboutText,
          copyrightYear: d.copyrightYear ?? DEFAULT_SITE_SETTINGS.copyrightYear,
          workingHours: {
            weekdays: d.workingHours?.weekdays ?? DEFAULT_SITE_SETTINGS.workingHours.weekdays,
            saturday: d.workingHours?.saturday ?? DEFAULT_SITE_SETTINGS.workingHours.saturday,
            sunday: d.workingHours?.sunday ?? DEFAULT_SITE_SETTINGS.workingHours.sunday,
          },
          socialLinks: {
            facebook: d.socialLinks?.facebook ?? "",
            twitter: d.socialLinks?.twitter ?? "",
            instagram: d.socialLinks?.instagram ?? "",
            youtube: d.socialLinks?.youtube ?? "",
          },
          mapCoordinates: {
            lat: d.mapCoordinates?.lat ?? DEFAULT_SITE_SETTINGS.mapCoordinates.lat,
            lng: d.mapCoordinates?.lng ?? DEFAULT_SITE_SETTINGS.mapCoordinates.lng,
          },
          logoUrl: d.logoUrl ?? "",
        });
      },
      (err) => {
        console.error("SiteSettings snapshot error:", err);
      },
    );
    return unsub;
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
