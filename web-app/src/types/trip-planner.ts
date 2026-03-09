// Sefer Planlayıcı Tip Tanımları

export type ActivityType = 
  | "transport"
  | "visit"
  | "prayer"
  | "meal"
  | "rest"
  | "shopping"
  | "other";

export interface ActivityLocation {
  name: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TripActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  location: ActivityLocation;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  notes?: string;
  cost?: number;
  isBooked?: boolean;
}

export interface TripDay {
  id: string;
  date: Date;
  dayNumber: number;
  title?: string;
  activities: TripActivity[];
  totalCost: number;
  notes?: string;
}

export interface TripPlan {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  destination: string; // Mekke, Medine, etc.
  startDate: Date;
  endDate: Date;
  days: TripDay[];
  travelers: number;
  totalBudget?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const activityTypeLabels: Record<ActivityType, string> = {
  transport: "Ulaşım",
  visit: "Ziyaret",
  prayer: "İbadet",
  meal: "Yemek",
  rest: "Dinlenme",
  shopping: "Alışveriş",
  other: "Diğer",
};

export const activityTypeIcons: Record<ActivityType, string> = {
  transport: "🚗",
  visit: "📍",
  prayer: "🕌",
  meal: "🍽️",
  rest: "🛏️",
  shopping: "🛍️",
  other: "📌",
};

// Mekke ve Medine için popüler aktiviteler
export interface SuggestedActivity {
  type: ActivityType;
  title: string;
  description: string;
  location: ActivityLocation;
  estimatedDuration: number; // minutes
  estimatedCost?: number;
  bestTime?: string; // "morning", "afternoon", "evening", "night"
  destination: "mekke" | "medine";
}

export const SUGGESTED_ACTIVITIES: SuggestedActivity[] = [
  {
    type: "prayer",
    title: "Mescid-i Haram Ziyareti",
    description: "Kabe'yi tavaf ve namaz",
    location: {
      name: "Mescid-i Haram",
      address: "Mekke, Suudi Arabistan",
      coordinates: { lat: 21.4225, lng: 39.8262 },
    },
    estimatedDuration: 180,
    destination: "mekke",
    bestTime: "morning",
  },
  {
    type: "visit",
    title: "Arafat Dağı",
    description: "Kutsal Arafat Dağı ziyareti",
    location: {
      name: "Arafat Dağı",
      address: "Mekke, Suudi Arabistan",
      coordinates: { lat: 21.3549, lng: 39.9835 },
    },
    estimatedDuration: 240,
    estimatedCost: 50,
    destination: "mekke",
  },
  {
    type: "visit",
    title: "Sevr Mağarası",
    description: "Hz. Peygamber'in saklandığı mağara",
    location: {
      name: "Sevr Mağarası",
      address: "Mekke, Suudi Arabistan",
      coordinates: { lat: 21.3809, lng: 39.8295 },
    },
    estimatedDuration: 120,
    estimatedCost: 30,
    destination: "mekke",
  },
  {
    type: "prayer",
    title: "Mescid-i Nebevi Ziyareti",
    description: "Hz. Peygamber'in Mescidi ve kabrini ziyaret",
    location: {
      name: "Mescid-i Nebevi",
      address: "Medine, Suudi Arabistan",
      coordinates: { lat: 24.4672, lng: 39.6113 },
    },
    estimatedDuration: 180,
    destination: "medine",
    bestTime: "morning",
  },
  {
    type: "visit",
    title: "Kuba Camii",
    description: "İslam'ın ilk camii ziyareti",
    location: {
      name: "Kuba Camii",
      address: "Medine, Suudi Arabistan",
      coordinates: { lat: 24.4436, lng: 39.6171 },
    },
    estimatedDuration: 90,
    estimatedCost: 20,
    destination: "medine",
  },
  {
    type: "visit",
    title: "Uhud Dağı",
    description: "Uhud Savaşı'nın yapıldığı dağ ve şehitlik",
    location: {
      name: "Uhud Dağı",
      address: "Medine, Suudi Arabistan",
      coordinates: { lat: 24.4958, lng: 39.6133 },
    },
    estimatedDuration: 120,
    estimatedCost: 25,
    destination: "medine",
  },
  {
    type: "meal",
    title: "Yerel Restoran",
    description: "Geleneksel Suudi mutfağı",
    location: {
      name: "Restoran",
    },
    estimatedDuration: 60,
    estimatedCost: 100,
    destination: "mekke",
  },
  {
    type: "shopping",
    title: "Alışveriş Merkezi",
    description: "Hediye ve ihtiyaç alışverişi",
    location: {
      name: "AVM",
    },
    estimatedDuration: 120,
    estimatedCost: 200,
    destination: "mekke",
  },
];
