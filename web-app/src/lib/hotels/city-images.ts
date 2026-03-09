/**
 * City-specific fallback images for hotels without their own images
 * Uses high-quality royalty-free images from Pexels
 */

// Mekke (Makkah) - City Code: 164
const MAKKAH_IMAGES = [
  "https://images.pexels.com/photos/4049991/pexels-photo-4049991.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6045264/pexels-photo-6045264.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/4049992/pexels-photo-4049992.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3152124/pexels-photo-3152124.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/11375435/pexels-photo-11375435.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

// Medine (Madinah) - City Code: 174 or 365
const MADINAH_IMAGES = [
  "https://images.pexels.com/photos/11375417/pexels-photo-11375417.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/11375437/pexels-photo-11375437.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/6045227/pexels-photo-6045227.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/13870436/pexels-photo-13870436.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/10024597/pexels-photo-10024597.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

// Generic Islamic architecture fallback
const GENERIC_IMAGES = [
  "https://images.pexels.com/photos/3152121/pexels-photo-3152121.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2403209/pexels-photo-2403209.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3243090/pexels-photo-3243090.jpeg?auto=compress&cs=tinysrgb&w=1200",
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
