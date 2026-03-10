/**
 * City-specific fallback images for hotels without their own images
 * Uses locally hosted high-quality images from Unsplash (royalty-free)
 * All images verified for content accuracy (Mecca, Medina, Islamic architecture)
 *
 * For Saudi Arabia cities:
 * - Makkah (164): Uses Kaaba images
 * - Madinah (174, 365): Uses Prophet's Mosque images
 * - Other Saudi cities (Jeddah, Riyadh, etc.): Mixed Kaaba and Mosque images
 */

// Mekke (Makkah) - City Code: 164
const MAKKAH_IMAGES = [
  "/images/hotels/kaaba-1.jpg", // Kaaba view
  "/images/hotels/kaaba-2.jpg", // Kaaba close-up
  "/images/hotels/kaaba-3.jpg", // Kaaba with pilgrims
  "/images/hotels/kaaba-4.jpg", // Kaaba at night
  "/images/hotels/kaaba-5.jpg", // Kaaba wide angle
];

// Medine (Madinah) - City Code: 174 or 365
const MADINAH_IMAGES = [
  "/images/hotels/madinah-1.jpg", // Prophet's Mosque exterior
  "/images/hotels/madinah-2.jpg", // Prophet's Mosque detail
  "/images/hotels/madinah-3.jpg", // Mosque courtyard
  "/images/hotels/madinah-4.jpg", // Mosque at night
  "/images/hotels/madinah-5.jpg", // Mosque wide angle
];

// Generic Islamic architecture fallback for other Saudi cities (Jeddah, Riyadh, Taif, etc.)
// Mixed Kaaba and Mosque images
const GENERIC_IMAGES = [
  "/images/hotels/kaaba-1.jpg", // Kaaba view
  "/images/hotels/madinah-1.jpg", // Mosque exterior
  "/images/hotels/kaaba-3.jpg", // Kaaba with pilgrims
  "/images/hotels/madinah-3.jpg", // Mosque courtyard
  "/images/hotels/kaaba-4.jpg", // Kaaba at night
];

/**
 * Get a city-specific fallback image based on city code and hotel ID
 * Uses hotel ID for deterministic random selection (same hotel always gets same image)
 */
export function getCityFallbackImage(cityCode: number, hotelId: string): string {
  let images: string[];
  
  // Select image pool based on city
  switch (cityCode) {
    case 164: // Makkah
      images = MAKKAH_IMAGES;
      break;
    case 174: // Madinah (old code)
    case 365: // Madinah (new code)
      images = MADINAH_IMAGES;
      break;
    default:
      images = GENERIC_IMAGES;
  }
  
  // Use hotel ID to generate a consistent index
  const hash = hotelId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const index = hash % images.length;
  return images[index];
}

/**
 * Check if a city has specific fallback images
 */
export function hasCityImages(cityCode: number): boolean {
  return cityCode === 164 || cityCode === 174 || cityCode === 365;
}
