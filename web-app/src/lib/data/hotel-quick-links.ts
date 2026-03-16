/**
 * Otel Hızlı Arama Bağlantıları
 * SEO uyumlu otel kategori linkleri ve arama parametreleri
 */

import type { HotelSearchFormParams } from "@/components/hotels/HotelSearchForm";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Building2,
  Calendar,
  Eye,
  Home,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

export interface HotelQuickLinkCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string; // Background image URL
  searchParams: Partial<HotelSearchFormParams>;
  seoKeywords: string[];
  gradient: {
    from: string;
    to: string;
  };
  priority: number;
}

export const HOTEL_QUICK_LINKS: HotelQuickLinkCategory[] = [
  {
    id: "mekke-yakin",
    title: "Mekke Yakın Oteller",
    description: "Harem-i Şerif'e yürüme mesafesinde",
    icon: MapPin,
    image: "/images/hotels/kaaba-1.jpg",
    searchParams: {
      cityCode: 164, // Mekke
    },
    seoKeywords: [
      "mekke otel",
      "harem yakın otel",
      "kabe yakını konaklama",
      "mekke merkez otel",
      "harem mesafesinde otel",
    ],
    gradient: {
      from: "emerald-500",
      to: "teal-500",
    },
    priority: 1,
  },
  {
    id: "medine-yakin",
    title: "Medine Yakın Oteller",
    description: "Mescid-i Nebevi yakınında",
    icon: Building2,
    image: "/images/hotels/madinah-1.jpg",
    searchParams: {
      cityCode: 174, // Medine
    },
    seoKeywords: [
      "medine otel",
      "ravza yakın otel",
      "nebevi yakını konaklama",
      "medine merkez otel",
      "mescid-i nebevi yakın",
    ],
    gradient: {
      from: "blue-500",
      to: "indigo-500",
    },
    priority: 2,
  },
  {
    id: "ekonomik",
    title: "Ekonomik Oteller",
    description: "Bütçe dostu konaklama seçenekleri",
    icon: Wallet,
    image: "/images/hotels/kaaba-2.jpg",
    searchParams: {
      cityCode: 164,
    },
    seoKeywords: [
      "ucuz otel",
      "ekonomik konaklama",
      "uygun fiyatlı otel",
      "bütçe dostu otel",
      "hesaplı umre oteli",
    ],
    gradient: {
      from: "green-500",
      to: "emerald-500",
    },
    priority: 3,
  },
  {
    id: "luks",
    title: "Lüks Oteller",
    description: "5 yıldızlı premium konaklama",
    icon: Sparkles,
    image: "/images/hotels/kaaba-4.jpg",
    searchParams: {
      cityCode: 164,
      // Note: stars filter will be applied in the search results page
    },
    seoKeywords: [
      "lüks otel",
      "5 yıldızlı otel",
      "premium konaklama",
      "deluxe hotel",
      "lüks umre oteli",
    ],
    gradient: {
      from: "amber-500",
      to: "orange-500",
    },
    priority: 4,
  },
  {
    id: "aile-odasi",
    title: "Aile Odaları",
    description: "Geniş aile odaları ve süitler",
    icon: Home,
    image: "/images/hotels/kaaba-3.jpg",
    searchParams: {
      cityCode: 164,
      rooms: [{ adults: 4, children: 0, childAges: [] }],
    },
    seoKeywords: [
      "aile odası",
      "geniş oda",
      "family room",
      "süit oda",
      "aile için otel",
    ],
    gradient: {
      from: "purple-500",
      to: "violet-500",
    },
    priority: 5,
  },
  {
    id: "cocuk-uyumlu",
    title: "Çocuk Uyumlu Oteller",
    description: "Çocuklar için uygun tesisler",
    icon: Baby,
    image: "/images/hotels/madinah-2.jpg",
    searchParams: {
      cityCode: 164,
      rooms: [{ adults: 2, children: 2, childAges: [5, 8] }],
    },
    seoKeywords: [
      "çocuklu aile",
      "child friendly",
      "çocuk dostu otel",
      "aile tatili",
      "çocuk odası",
    ],
    gradient: {
      from: "pink-500",
      to: "rose-500",
    },
    priority: 6,
  },
  {
    id: "harem-manzarali",
    title: "Harem Manzaralı",
    description: "Kabe ve Harem manzaralı odalar",
    icon: Eye,
    image: "/images/hotels/kaaba-5.jpg",
    searchParams: {
      cityCode: 164,
    },
    seoKeywords: [
      "harem manzara",
      "kabe view",
      "manzaralı oda",
      "harem görünümlü",
      "kabe manzaralı otel",
    ],
    gradient: {
      from: "sky-500",
      to: "cyan-500",
    },
    priority: 7,
  },
  {
    id: "uzun-sureli",
    title: "Uzun Süreli Konaklama",
    description: "7+ gün konaklama seçenekleri",
    icon: Calendar,
    image: "/images/hotels/madinah-3.jpg",
    searchParams: {
      cityCode: 164,
      // Note: dates will be set with 7+ days duration in the component
    },
    seoKeywords: [
      "uzun dönem",
      "aylık otel",
      "long stay",
      "haftalık konaklama",
      "uzun süreli otel",
    ],
    gradient: {
      from: "indigo-500",
      to: "purple-500",
    },
    priority: 8,
  },
];

/**
 * Kategori ID'sine göre kategori getir
 */
export function getQuickLinkById(id: string): HotelQuickLinkCategory | undefined {
  return HOTEL_QUICK_LINKS.find((link) => link.id === id);
}

/**
 * Önceliğe göre sıralanmış kategoriler
 */
export function getSortedQuickLinks(): HotelQuickLinkCategory[] {
  return [...HOTEL_QUICK_LINKS].sort((a, b) => a.priority - b.priority);
}

/**
 * Belirli bir şehir için kategorileri filtrele
 */
export function getQuickLinksForCity(cityCode: number): HotelQuickLinkCategory[] {
  return HOTEL_QUICK_LINKS.filter(
    (link) => !link.searchParams.cityCode || link.searchParams.cityCode === cityCode
  );
}
