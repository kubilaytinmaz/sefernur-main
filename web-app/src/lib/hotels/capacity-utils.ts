/**
 * Hotel Capacity Utilities
 * 
 * Helper functions for calculating hotel capacity, room requirements,
 * and guest accommodation validation.
 */

import type { Room } from "@/components/hotels";

/* ────────── Types ────────── */

export interface HotelCapacity {
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  availableRooms: number;
  canAccommodate: boolean;
  requiredRooms: number;
  roomTypes: RoomTypeCapacity[];
}

export interface RoomTypeCapacity {
  roomTypeCode: string;
  name: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  price: number;
}

export interface CapacityValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/* ────────── Constants ────────── */

const MAX_ROOMS = 4;
const MAX_ADULTS_PER_ROOM = 6;
const MAX_CHILDREN_PER_ROOM = 4;
const MAX_TOTAL_GUESTS = 20;

/* ────────── Guest Configuration Validation ────────── */

/**
 * Validate guest configuration against limits
 */
export function validateGuestConfig(rooms: Room[]): CapacityValidationResult {
  const totalRooms = rooms.length;
  const totalAdults = rooms.reduce((sum, r) => sum + r.adults, 0);
  const totalChildren = rooms.reduce((sum, r) => sum + r.children, 0);
  const totalGuests = totalAdults + totalChildren;

  // Check room count
  if (totalRooms > MAX_ROOMS) {
    return {
      valid: false,
      error: `Maksimum ${MAX_ROOMS} oda seçebilirsiniz`,
    };
  }

  if (totalRooms === 0) {
    return {
      valid: false,
      error: "En az 1 oda seçmelisiniz",
    };
  }

  // Check total guests
  if (totalGuests > MAX_TOTAL_GUESTS) {
    return {
      valid: false,
      error: `Maksimum ${MAX_TOTAL_GUESTS} misafir için arama yapabilirsiniz`,
    };
  }

  // Check individual room limits
  const warnings: string[] = [];
  
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];

    if (room.adults < 1) {
      return {
        valid: false,
        error: `Oda ${i + 1}'de en az 1 yetişkin olmalı`,
      };
    }

    if (room.adults > MAX_ADULTS_PER_ROOM) {
      return {
        valid: false,
        error: `Oda ${i + 1}'de maksimum ${MAX_ADULTS_PER_ROOM} yetişkin olabilir`,
      };
    }

    if (room.children > MAX_CHILDREN_PER_ROOM) {
      return {
        valid: false,
        error: `Oda ${i + 1}'de maksimum ${MAX_CHILDREN_PER_ROOM} çocuk olabilir`,
      };
    }

    // Check child ages
    if (room.children > 0 && (!room.childAges || room.childAges.length !== room.children)) {
      warnings.push(`Oda ${i + 1} için tüm çocuk yaşları belirtilmeli`);
    }

    // Check if child ages are valid
    if (room.childAges) {
      const invalidAges = room.childAges.filter(age => age < 0 || age > 17);
      if (invalidAges.length > 0) {
        return {
          valid: false,
          error: `Oda ${i + 1} için çocuk yaşları 0-17 arasında olmalı`,
        };
      }
    }
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/* ────────── Capacity Calculation ────────── */

/**
 * Calculate total guest count from room configuration
 */
export function calculateTotalGuests(rooms: Room[]): {
  adults: number;
  children: number;
  total: number;
} {
  const adults = rooms.reduce((sum, r) => sum + r.adults, 0);
  const children = rooms.reduce((sum, r) => sum + r.children, 0);
  return { adults, children, total: adults + children };
}

/**
 * Calculate required rooms based on guest count and room capacity
 */
export function calculateRequiredRooms(
  guests: { adults: number; children: number },
  maxOccupancyPerRoom: number
): number {
  const totalGuests = guests.adults + guests.children;
  return Math.ceil(totalGuests / maxOccupancyPerRoom);
}

/**
 * Check if hotel can accommodate the given room configuration
 */
export function canAccommodate(
  hotelCapacity: HotelCapacity,
  requestedRooms: Room[]
): boolean {
  const totalGuests = calculateTotalGuests(requestedRooms);
  
  // Check if total occupancy is within limits
  if (totalGuests.total > hotelCapacity.maxOccupancy) {
    return false;
  }

  // Check if we have enough rooms
  if (requestedRooms.length > hotelCapacity.availableRooms) {
    return false;
  }

  // Check individual room capacity
  for (const room of requestedRooms) {
    const roomTotal = room.adults + room.children;
    
    // Find a room type that can accommodate this room
    const suitableRoomType = hotelCapacity.roomTypes.find(
      rt => rt.maxAdults >= room.adults && rt.maxOccupancy >= roomTotal
    );

    if (!suitableRoomType) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate hotel capacity from room types
 */
export function calculateHotelCapacity(
  roomTypes: RoomTypeCapacity[],
  availableRooms: number = 999
): HotelCapacity {
  // Find maximum values across all room types
  const maxAdults = Math.max(...roomTypes.map(rt => rt.maxAdults), 0);
  const maxChildren = Math.max(...roomTypes.map(rt => rt.maxChildren), 0);
  const maxOccupancy = Math.max(...roomTypes.map(rt => rt.maxOccupancy), 0);

  // Calculate required rooms for different group sizes
  const requiredRooms = calculateRequiredRooms(
    { adults: maxAdults, children: maxChildren },
    maxOccupancy
  );

  return {
    maxAdults,
    maxChildren,
    maxOccupancy,
    availableRooms,
    canAccommodate: true, // Will be calculated dynamically
    requiredRooms,
    roomTypes,
  };
}

/* ────────── Capacity Badge Utilities ────────── */

/**
 * Get capacity status for display
 */
export function getCapacityStatus(
  hotelCapacity: HotelCapacity,
  requestedGuests: number
): {
  status: "suitable" | "limited" | "insufficient";
  message: string;
  color: "emerald" | "amber" | "red";
} {
  if (requestedGuests <= hotelCapacity.maxOccupancy) {
    return {
      status: "suitable",
      message: `Maksimum ${hotelCapacity.maxOccupancy} misafir`,
      color: "emerald",
    };
  }

  if (requestedGuests <= hotelCapacity.maxOccupancy * 1.5) {
    return {
      status: "limited",
      message: "Sınırlı kapasite - ek oda gerekli",
      color: "amber",
    };
  }

  return {
    status: "insufficient",
    message: "Yetersiz kapasite",
    color: "red",
  };
}

/**
 * Get room configuration summary text
 */
export function getRoomConfigSummary(rooms: Room[]): string {
  const totalGuests = calculateTotalGuests(rooms);
  return `${rooms.length} Oda, ${totalGuests.total} Misafir`;
}

/**
 * Get detailed room configuration text
 */
export function getRoomConfigDetails(rooms: Room[]): string[] {
  return rooms.map((room, index) => {
    const parts = [`Oda ${index + 1}`];
    parts.push(`${room.adults} yetişkin`);
    
    if (room.children > 0) {
      parts.push(`${room.children} çocuk`);
      
      if (room.childAges && room.childAges.length > 0) {
        const ages = room.childAges.map(age => `${age} yaş`).join(", ");
        parts.push(`(${ages})`);
      }
    }
    
    return parts.join(" • ");
  });
}

/* ────────── Guest Presets ────────── */

export interface GuestPreset {
  label: string;
  description: string;
  icon: string;
  rooms: Room[];
}

export const GUEST_PRESETS: GuestPreset[] = [
  {
    label: "Çift",
    description: "2 yetişkin",
    icon: "👫",
    rooms: [{ adults: 2, children: 0, childAges: [] }],
  },
  {
    label: "Aile",
    description: "2 yetişkin, 2 çocuk",
    icon: "👨‍👩‍👧‍👦",
    rooms: [{ adults: 2, children: 2, childAges: [5, 8] }],
  },
  {
    label: "Grup",
    description: "2 oda, 5 misafir",
    icon: "👥",
    rooms: [
      { adults: 2, children: 0, childAges: [] },
      { adults: 2, children: 1, childAges: [10] },
    ],
  },
  {
    label: "Büyük Grup",
    description: "3 oda, 8 misafir",
    icon: "👨‍👩‍👧‍👦‍👨‍👩‍👧",
    rooms: [
      { adults: 2, children: 0, childAges: [] },
      { adults: 2, children: 0, childAges: [] },
      { adults: 2, children: 2, childAges: [5, 8] },
    ],
  },
];
