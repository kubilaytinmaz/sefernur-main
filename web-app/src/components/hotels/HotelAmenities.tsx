"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
    Baby,
    Car,
    Clock,
    Coffee,
    ConciergeBell,
    Dumbbell,
    Fan,
    HeartPulse,
    Home,
    MapPin,
    ParkingCircle,
    Phone,
    Plane,
    Shield,
    Snowflake,
    Sparkles,
    Tv,
    Users,
    Utensils,
    Wifi
} from "lucide-react";

/* ────────── Types ────────── */

interface AmenityItem {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

interface AmenityCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: AmenityItem[];
}

interface HotelAmenitiesProps {
  amenities?: string[];
  customAmenities?: AmenityCategory[];
}

/* ────────── Icon Mapping ────────── */

const ICON_MAP: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-5 h-5" />,
  "free-wifi": <Wifi className="w-5 h-5" />,
  internet: <Wifi className="w-5 h-5" />,
  parking: <ParkingCircle className="w-5 h-5" />,
  "free-parking": <ParkingCircle className="w-5 h-5" />,
  "car-park": <Car className="w-5 h-5" />,
  pool: <Home className="w-5 h-5" />,
  "swimming-pool": <Home className="w-5 h-5" />,
  "indoor-pool": <Home className="w-5 h-5" />,
  "outdoor-pool": <Home className="w-5 h-5" />,
  gym: <Dumbbell className="w-5 h-5" />,
  fitness: <Dumbbell className="w-5 h-5" />,
  "fitness-center": <Dumbbell className="w-5 h-5" />,
  restaurant: <Utensils className="w-5 h-5" />,
  breakfast: <Coffee className="w-5 h-5" />,
  "breakfast-included": <Coffee className="w-5 h-5" />,
  "free-breakfast": <Coffee className="w-5 h-5" />,
  bar: <Coffee className="w-5 h-5" />,
  "24-hour-front-desk": <Clock className="w-5 h-5" />,
  "front-desk": <ConciergeBell className="w-5 h-5" />,
  reception: <ConciergeBell className="w-5 h-5" />,
  "room-service": <ConciergeBell className="w-5 h-5" />,
  concierge: <ConciergeBell className="w-5 h-5" />,
  "air-conditioning": <Snowflake className="w-5 h-5" />,
  ac: <Fan className="w-5 h-5" />,
  heating: <Fan className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  "cable-tv": <Tv className="w-5 h-5" />,
  "satellite-tv": <Tv className="w-5 h-5" />,
  "flat-screen-tv": <Tv className="w-5 h-5" />,
  elevator: <Users className="w-5 h-5" />,
  lift: <Users className="w-5 h-5" />,
  "wheelchair-accessible": <Users className="w-5 h-5" />,
  accessible: <Users className="w-5 h-5" />,
  "disabled-access": <Users className="w-5 h-5" />,
  laundry: <Home className="w-5 h-5" />,
  "laundry-service": <Home className="w-5 h-5" />,
  "dry-cleaning": <Home className="w-5 h-5" />,
  "airport-shuttle": <Plane className="w-5 h-5" />,
  shuttle: <Car className="w-5 h-5" />,
  "airport-transfer": <Plane className="w-5 h-5" />,
  "spa-services": <Sparkles className="w-5 h-5" />,
  spa: <HeartPulse className="w-5 h-5" />,
  massage: <HeartPulse className="w-5 h-5" />,
  "business-center": <Users className="w-5 h-5" />,
  "meeting-rooms": <Users className="w-5 h-5" />,
  "conference-room": <Users className="w-5 h-5" />,
  "safe-deposit": <Shield className="w-5 h-5" />,
  safety: <Shield className="w-5 h-5" />,
  "security-guard": <Shield className="w-5 h-5" />,
  "24-hour-security": <Shield className="w-5 h-5" />,
  "baby-sitting": <Baby className="w-5 h-5" />,
  childcare: <Baby className="w-5 h-5" />,
  "family-rooms": <Users className="w-5 h-5" />,
  "connecting-rooms": <Home className="w-5 h-5" />,
  "non-smoking": <Shield className="w-5 h-5" />,
  "smoking-area": <Home className="w-5 h-5" />,
  "pet-friendly": <Home className="w-5 h-5" />,
  pets: <Home className="w-5 h-5" />,
  "car-rental": <Car className="w-5 h-5" />,
  "bike-rental": <Car className="w-5 h-5" />,
  "tour-desk": <MapPin className="w-5 h-5" />,
  "ticket-service": <MapPin className="w-5 h-5" />,
  atm: <Phone className="w-5 h-5" />,
  "currency-exchange": <Phone className="w-5 h-5" />,
  "vip-room": <Sparkles className="w-5 h-5" />,
  "private-beach": <Home className="w-5 h-5" />,
  beach: <Home className="w-5 h-5" />,
  "golf-course": <Home className="w-5 h-5" />,
  tennis: <Home className="w-5 h-5" />,
  "water-sports": <Home className="w-5 h-5" />,
  "garden": <Home className="w-5 h-5" />,
  terrace: <Home className="w-5 h-5" />,
  balcony: <Home className="w-5 h-5" />,
  "kitchen-facilities": <Utensils className="w-5 h-5" />,
  kitchen: <Utensils className="w-5 h-5" />,
  "mini-bar": <Coffee className="w-5 h-5" />,
  refrigerator: <Fan className="w-5 h-5" />,
  "coffee-maker": <Coffee className="w-5 h-5" />,
  "ironing-service": <Home className="w-5 h-5" />,
  "daily-housekeeping": <Sparkles className="w-5 h-5" />,
  housekeeping: <Sparkles className="w-5 h-5" />,
  "wake-up-service": <Clock className="w-5 h-5" />,
  "shuttle-service": <Car className="w-5 h-5" />,
  "valet-parking": <Car className="w-5 h-5" />,
  "self-parking": <ParkingCircle className="w-5 h-5" />,
  "express-check-in": <Clock className="w-5 h-5" />,
  "express-check-out": <Clock className="w-5 h-5" />,
  "designated-smoking-area": <Home className="w-5 h-5" />,
  "soundproof-rooms": <Shield className="w-5 h-5" />,
  "heating-facilities": <Fan className="w-5 h-5" />,
  "allergy-free-room": <Sparkles className="w-5 h-5" />,
  "vip-check-in": <ConciergeBell className="w-5 h-5" />,
  "private-check-in": <ConciergeBell className="w-5 h-5" />,
  "24-hour-check-in": <Clock className="w-5 h-5" />,
};

/* ────────── Default Amenities by Category ────────── */

const DEFAULT_AMENITIES: AmenityCategory[] = [
  {
    id: "general",
    name: "Genel Özellikler",
    icon: <Home className="w-5 h-5" />,
    items: [
      { id: "wifi", name: "Ücretsiz WiFi", icon: "wifi", available: true },
      { id: "parking", name: "Otopark", icon: "parking", available: true },
      { id: "reception", name: "24/7 Resepsiyon", icon: "24-hour-front-desk", available: true },
      { id: "elevator", name: "Asansör", icon: "elevator", available: true },
      { id: "ac", name: "Klima", icon: "air-conditioning", available: true },
      { id: "heating", name: "Isıtma", icon: "heating", available: true },
    ],
  },
  {
    id: "room",
    name: "Oda Özellikleri",
    icon: <Home className="w-5 h-5" />,
    items: [
      { id: "tv", name: "TV / Uydu", icon: "tv", available: true },
      { id: "safe", name: "Kasa", icon: "safe-deposit", available: true },
      { id: "mini-bar", name: "Mini Bar", icon: "mini-bar", available: false },
      { id: "balcony", name: "Balkon", icon: "balcony", available: false },
      { id: "kitchen", name: "Mutfak", icon: "kitchen", available: false },
    ],
  },
  {
    id: "services",
    name: "Hizmetler",
    icon: <ConciergeBell className="w-5 h-5" />,
    items: [
      { id: "room-service", name: "Oda Servisi", icon: "room-service", available: true },
      { id: "laundry", name: "Çamaşırhane", icon: "laundry", available: true },
      { id: "breakfast", name: "Kahvaltı", icon: "breakfast", available: true },
      { id: "restaurant", name: "Restoran", icon: "restaurant", available: true },
      { id: "shuttle", name: "Havalimanı Servisi", icon: "airport-shuttle", available: false },
    ],
  },
  {
    id: "wellness",
    name: "Spor & Eğlence",
    icon: <HeartPulse className="w-5 h-5" />,
    items: [
      { id: "gym", name: "Fitness Merkezi", icon: "gym", available: false },
      { id: "pool", name: "Havuz", icon: "pool", available: false },
      { id: "spa", name: "SPA / Masaj", icon: "spa", available: false },
      { id: "sauna", name: "Sauna", icon: "spa", available: false },
    ],
  },
];

/* ────────── Helpers ────────── */

function normalizeAmenityName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
}

function getIconForAmenity(name: string): React.ReactNode {
  const normalizedName = normalizeAmenityName(name);
  return ICON_MAP[normalizedName] || <Home className="w-5 h-5" />;
}

function parseAmenitiesToList(amenities: string[]): AmenityCategory[] {
  // Group amenities by category (simple heuristic)
  const general: AmenityItem[] = [];
  const room: AmenityItem[] = [];
  const services: AmenityItem[] = [];
  const wellness: AmenityItem[] = [];

  for (const amenity of amenities) {
    const item: AmenityItem = {
      id: normalizeAmenityName(amenity),
      name: amenity,
      icon: normalizeAmenityName(amenity),
      available: true,
    };

    const normalizedName = normalizeAmenityName(amenity);

    // Categorize based on keywords
    if (
      normalizedName.includes("wifi") ||
      normalizedName.includes("internet") ||
      normalizedName.includes("parking") ||
      normalizedName.includes("reception") ||
      normalizedName.includes("front-desk") ||
      normalizedName.includes("elevator") ||
      normalizedName.includes("lift") ||
      normalizedName.includes("ac") ||
      normalizedName.includes("air-conditioning") ||
      normalizedName.includes("heating")
    ) {
      general.push(item);
    } else if (
      normalizedName.includes("tv") ||
      normalizedName.includes("safe") ||
      normalizedName.includes("mini-bar") ||
      normalizedName.includes("balcony") ||
      normalizedName.includes("kitchen")
    ) {
      room.push(item);
    } else if (
      normalizedName.includes("room-service") ||
      normalizedName.includes("laundry") ||
      normalizedName.includes("breakfast") ||
      normalizedName.includes("restaurant") ||
      normalizedName.includes("shuttle")
    ) {
      services.push(item);
    } else if (
      normalizedName.includes("gym") ||
      normalizedName.includes("fitness") ||
      normalizedName.includes("pool") ||
      normalizedName.includes("spa") ||
      normalizedName.includes("sauna")
    ) {
      wellness.push(item);
    } else {
      general.push(item); // Default to general
    }
  }

  const categories: AmenityCategory[] = [];

  if (general.length > 0) {
    categories.push({
      id: "general",
      name: "Genel Özellikler",
      icon: <Home className="w-5 h-5" />,
      items: general,
    });
  }

  if (room.length > 0) {
    categories.push({
      id: "room",
      name: "Oda Özellikleri",
      icon: <Home className="w-5 h-5" />,
      items: room,
    });
  }

  if (services.length > 0) {
    categories.push({
      id: "services",
      name: "Hizmetler",
      icon: <ConciergeBell className="w-5 h-5" />,
      items: services,
    });
  }

  if (wellness.length > 0) {
    categories.push({
      id: "wellness",
      name: "Spor & Eğlence",
      icon: <HeartPulse className="w-5 h-5" />,
      items: wellness,
    });
  }

  return categories.length > 0 ? categories : DEFAULT_AMENITIES;
}

/* ────────── Sub-Components ────────── */

interface AmenityCardProps {
  category: AmenityCategory;
}

function AmenityCard({ category }: AmenityCardProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
          {category.icon}
        </div>
        <h3 className="font-semibold text-slate-900">{category.name}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {category.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 text-sm ${
              item.available ? "text-slate-700" : "text-slate-400"
            }`}
          >
            <span className={item.available ? "text-emerald-600" : "text-slate-300"}>
              {getIconForAmenity(item.icon)}
            </span>
            <span className={item.available ? "" : "line-through"}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── Main Component ────────── */

export function HotelAmenities({
  amenities,
  customAmenities,
}: HotelAmenitiesProps) {
  const categories = customAmenities || (amenities ? parseAmenitiesToList(amenities) : DEFAULT_AMENITIES);

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          Otel Olanakları
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <AmenityCard key={category.id} category={category} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
