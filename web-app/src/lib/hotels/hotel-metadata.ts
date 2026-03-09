/**
 * Hotel metadata for properties where WebBeds API doesn't provide complete information.
 * This includes check-in/out times, Turkish descriptions, and hotel names for key hotels.
 *
 * WebBeds API limitations:
 * - checkInTime/checkOutTime: Not provided by API (book.webbeds.com has this data but API doesn't)
 * - description1: Not provided by API in most responses
 * - hotelName: NOT provided in Phase 1 (priced search) or Phase 2 (noPrice with fields returns error 26)
 * - hotelName: Available in getrooms response as @_name, but not in search results
 */

export interface HotelMetadata {
  /** Check-in time in HH:MM format (e.g., "14:00") */
  checkInTime: string;
  /** Check-out time in HH:MM format (e.g., "12:00") */
  checkOutTime: string;
  /** Turkish description (fallback if API doesn't provide one) */
  descriptionTR?: string;
  /** Hotel name (fallback if API doesn't provide one) */
  hotelName?: string;
  /** Hotel image URL from WebBeds/DOTW (fallback if API doesn't provide one) */
  imageUrl?: string;
}

/**
 * Metadata for important hotels.
 * Add entries here when you need to override API defaults or provide missing data.
 */
export const HOTEL_METADATA: Record<string, HotelMetadata> = {
  // Makkah Hotels
  "5897375": { checkInTime: "16:00", checkOutTime: "12:00", hotelName: "Masar Al Aziziyah Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/58/5897375/PaNcAmmN_86723dbdab9df31b87cd4d249f4dab13.png" },
  "5897385": { checkInTime: "16:00", checkOutTime: "12:00", hotelName: "Al Zaereen Hotel 2", imageUrl: "https://us.dotwconnect.com/poze_hotel/58/5897385/6tGxvcCG_f4d01949f87c2597efd961356790a2d8.png" },
  "2520775": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Park Inn By Radisson Makkah Aziziyah", imageUrl: "https://static-images.webbeds.com/0/image/ff87e275-9b09-4be7-a9c2-9fb76b7f81bb.jpg" },
  "2236075": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Makkah al Aziziah EX (Holiday Inn Makkah Al Aziziah)", imageUrl: "https://static-images.webbeds.com/0/image/55eef1ee-eafe-44ea-bbc0-2501ebd6cb0d.jpg" },
  "5671245": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Courtyard Makkah", imageUrl: "https://static-images.webbeds.com/0/image/55cb6b1f-99af-4331-b5c2-3b920daffa72.jpg" },
  "4498005": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Snaf Inn", imageUrl: "https://us.dotwconnect.com/poze_hotel/44/4498005/dpW8cp71_6bade8110601de30c47dd51084ffc663.JPG" },
  "2589625": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Violet Al Azizia Hotel", imageUrl: "https://static-images.webbeds.com/0/image/e3b1a582-e3ae-48a6-b80b-6e98779bdbab.jpg" },
  "5419125": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Nawazi Tower Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/54/5419125/1tzLc4Qk_ce344efe102b58ab62fac9b86c4f6d50.jpg" },
  "5945425": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Rotana Jabal Omar Makkah", imageUrl: "https://us.dotwconnect.com/poze_hotel/59/5945425/OV3AjUgB_7290ed495d1470a6f1f973681fc42ad4.jpg" },
  "22074": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Elaf Ajyad Hotel", imageUrl: "https://static-images.webbeds.com/0/image/7f1928e9-ce58-465b-beb5-6dbd41ba4007.jpg" },
  "5657805": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Diar AlKhalidiya Hotel", imageUrl: "https://static-images.webbeds.com/0/image/01594008-81f3-48c9-96e3-0e3688a89396.jpg" },
  "5725595": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "OYO 687 Sunday jeddah Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/57/5725595/mnDDzEtX_4a47a0db6e60853dedfcfdf08a5ca249.png" },
  "2367055": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Batoul Ajyad Hotel", imageUrl: "https://static-images.webbeds.com/0/image/9ca1b739-758c-4d94-abe3-d622570fa065.jpg" },
  "5876505": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Nasamat Makkah Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/58/5876505/uPdVZYlW_2205c904584f56af06382dba60706841.jpeg" },
  "4650535": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Montana Al Azizia Hotel" },
  "4935665": { checkInTime: "16:00", checkOutTime: "13:00", hotelName: "Hotel 21 Makkah", imageUrl: "https://us.dotwconnect.com/poze_hotel/49/4935665/FH5gzQEq_160839a268760f375f7de7aeafb17ea4.jpg" },
  "4481055": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Mira Ajyad", imageUrl: "https://us.dotwconnect.com/poze_hotel/44/4481055/9CQbBfYz_d2b5ca33bd970f64a6301fa75ae2eb22.png" },
  "5898805": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Cent Al Azizia Hotel Makkah", imageUrl: "https://us.dotwconnect.com/poze_hotel/58/5898805/Dk8Yd0wE_3aa457266aa9df7946fe4f909144bac0.png" },
  "5336075": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Qasr Al sahab Makkah", imageUrl: "https://us.dotwconnect.com/poze_hotel/53/5336075/R2m0FWTy_c0c8b4f76bbb35a5650cc4685d433443.jpeg" },
  "5657425": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Mahd Al Resala 3 Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/56/5657425/mGZSBhBn_32310ab5b000424e8f18b30ada7aef3b.jpg" },
  "5215365": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "alkiram hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/52/5215365/xDXDkiqX_c4eb60f3b1b6765bc49617bf8d44b645.jpg" },
  "5898815": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Cent Al Khair Hotel Makkah", imageUrl: "https://us.dotwconnect.com/poze_hotel/58/5898815/XHLvd3vx_d6a08e513a31ba88028ba98497834f83.png" },
  "5282665": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "EMAAR INTERNATIONAL", imageUrl: "https://us.dotwconnect.com/poze_hotel/52/5282665/V52DTK99_421556c539e7a51c64bf268d209d3c88.png" },
  "5415495": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Emaar Al Khalil", imageUrl: "https://static-images.webbeds.com/0/image/4f39183e-f998-4980-ae4d-585ee921d990.jpg" },
  "5434475": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Worth Elite Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/54/5434475/SiSdVpuR_491bcc5753ca0208c2636c129c0917c7.jpg" },
  "5162045": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Grand Al MASSA HOTEL", imageUrl: "https://us.dotwconnect.com/poze_hotel/51/5162045/beIXFTZt_81308c1317ace39c987079b3bab55ba3.jpg" },
  "2367035": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Al Massa Bader Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/23/2367035/PyjYNmc1_59c236ff4923ac37903727997750f28e.jpg" },
  "1967505": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Manarat Gaza Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/19/1967505/hgfBU6m3_f3ccdd27d2000e3f9255a7e3e2c48800.jpg" },
  "1511998": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Jabal Omar Hyatt Regency Makkah", imageUrl: "https://static-images.webbeds.com/0/image/c300331b-cfd1-4d45-b5ab-bb7ec14675b3.jpg" },
  "5190075": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Maysan Al Maqam Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/51/5190075/m6PFQZkU_44d1017addbd1c112d7e592d38e4f51e.jpg" },
  "4557745": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Makarim Al Bait Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/45/4557745/Kx2b3IkP_d5fdf79fb1ba1699b8f64bc998731b17.GIF" },
  "5164585": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Maysan Al-Mashaer ex (Rayanah Grand Plaza)", imageUrl: "https://us.dotwconnect.com/poze_hotel/51/5164585/zka5qmvh_39eb959882d730f6a519a8ab32d9326f.jpg" },
  "5928135": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Durrat Al Jewar Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/59/5928135/LwTlYMvM_8d14576872c22f9cfc3a19a86493e29b.png" },
  "4555405": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Mira Al Rawda Hotel Makkah", imageUrl: "https://us.dotwconnect.com/poze_hotel/45/4555405/htvKvC0e_c5838e0b341c635d5958f91bd236bd8.GIF" },
  "69444": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Pullman ZamZam Makkah", imageUrl: "https://static-images.webbeds.com/0/image/3b2a768e-57b3-4b0a-861b-533da3425496.jpg" },
  "2142665": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Park Inn by Radisson Makkah Al Naseem", imageUrl: "https://static-images.webbeds.com/0/image/713ed5c6-1baa-4344-bf94-81f73efc8b1a.jpg" },
  "2366695": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Emaar Al Noor", imageUrl: "https://static-images.webbeds.com/0/image/9193052a-ad91-41d8-853c-09f0abcd411f.jpg" },
  "597065": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Paradise Nice Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/59/5970655/ofduBnXS_a724dda9dec377a52ccc6469d5b41f01.jpg" },
  "4469965": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Danat Al Diafa", imageUrl: "https://us.dotwconnect.com/poze_hotel/44/4469965/8a4qXLie_d2b5ca33bd970f64a6301fa75ae2eb22.png" },
  "5434365": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "ABRAJ ALMISK HOTEL", imageUrl: "https://us.dotwconnect.com/poze_hotel/54/5434365/Zzwj1mC8_61e6b049339ef0995598def365b43016.jpg" },

  // Medina Hotels
  "2525075": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Al Eairy Furnished Apartments Al Madinah 9", imageUrl: "https://us.dotwconnect.com/poze_hotel/25/2525075/io1QROad_d2b5ca33bd970f64a6301fa75ae2eb22.png" },
  "2527015": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Al Eairy Furnished Apt Al Madinah 3", imageUrl: "https://us.dotwconnect.com/poze_hotel/25/2527015/jV47OVnY_e50086daac60a125a82e443653f523a4.png" },
  "2491355": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Tulip Inn Al Dar Rawafed", imageUrl: "https://static-images.webbeds.com/0/image/ef8adf5e-194e-41f4-868b-1ff19df62330.jpg" },
  "2367535": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Al Mukhtara Al Gharbi", imageUrl: "https://us.dotwconnect.com/poze_hotel/23/2367535/v0DrDZ9f_cd63eb89c2a87a321f400df82ef51221.jpg" },
  "1940985": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "PULLMAN ZAMZAM MADINA", imageUrl: "https://static-images.webbeds.com/0/image/05198cf8-5003-4507-bcea-8809d0bf5459.jpg" },
  "5316155": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Nusk Alhijra Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/53/5316155/4SeaByK3_876288088c1d5ab5913faed657e9c039.jpg" },
  "5570745": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Al Manakha Rotana Madinah", imageUrl: "https://us.dotwconnect.com/poze_hotel/55/5570745/yGFVgwST_f3ccdd27d2000e3f9255a7e3e2c48800.jpg" },
  "5645655": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Sedra Global Hotel", imageUrl: "https://static-images.webbeds.com/0/image/9b58b306-c90f-43f3-9693-41da1a8fa3f1.jpg" },
  "5434485": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Emaar Taibah Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/54/5434485/0yb0OTIo_8705790ea09df53e1b745203e0076527.png" },
  "5913165": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Lafif Hotel Al-Khaldia", imageUrl: "https://us.dotwconnect.com/poze_hotel/59/5913165/Lafif Hotel Al-Khaldia.jpg" },
  "4731135": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Sky View Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/47/4731135/z1gGgFlY_b3c0952601e7f83cfd9a57614019e1fb.jpg" },
  "5430365": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Rua international Hotel", imageUrl: "https://us.dotwconnect.com/poze_hotel/54/5430365/JTknhKiV_1186dc2ed9de85370188e76ee49ba27b.png" },
  "5910475": { checkInTime: "14:00", checkOutTime: "12:00", hotelName: "Jiwar Al Saha Hotel", imageUrl: "https://static-images.webbeds.com/0/image/602d097b-3362-49db-8cdc-0219fd9eefce.jpg" },

  // Default fallback for hotels not in this list will be:
  // checkInTime: "14:00", checkOutTime: "12:00"
};

/**
 * Get metadata for a specific hotel.
 * @param hotelId - The WebBeds hotel ID
 * @returns Hotel metadata if available, undefined otherwise
 */
export function getHotelMetadata(hotelId: string): HotelMetadata | undefined {
  return HOTEL_METADATA[hotelId];
}

/**
 * Get check-in time for a hotel, with fallback to default.
 * @param hotelId - The WebBeds hotel ID
 * @param apiValue - Value from API (if available)
 * @returns Check-in time in HH:MM format
 */
export function getCheckInTime(hotelId: string, apiValue?: string): string {
  const metadata = getHotelMetadata(hotelId);
  return metadata?.checkInTime || apiValue || "14:00";
}

/**
 * Get check-out time for a hotel, with fallback to default.
 * @param hotelId - The WebBeds hotel ID
 * @param apiValue - Value from API (if available)
 * @returns Check-out time in HH:MM format
 */
export function getCheckOutTime(hotelId: string, apiValue?: string): string {
  const metadata = getHotelMetadata(hotelId);
  return metadata?.checkOutTime || apiValue || "12:00";
}

/**
 * Get Turkish description for a hotel, with fallback to API value.
 * @param hotelId - The WebBeds hotel ID
 * @param apiValue - Value from API (if available)
 * @returns Turkish description if available
 */
export function getHotelDescription(hotelId: string, apiValue?: string): string | undefined {
  const metadata = getHotelMetadata(hotelId);
  return apiValue || metadata?.descriptionTR;
}

/**
 * Get hotel name for a hotel, with fallback to API value or metadata.
 * @param hotelId - The WebBeds hotel ID
 * @param apiValue - Value from API (if available)
 * @returns Hotel name if available
 */
export function getHotelName(hotelId: string, apiValue?: string): string | undefined {
  const metadata = getHotelMetadata(hotelId);
  return apiValue || metadata?.hotelName;
}
