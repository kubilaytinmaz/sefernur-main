import { XMLParser } from "fast-xml-parser";
import type { CancellationRule, HotelFullAddress, NormalizedHotel, NormalizedRoom, XmlObject } from "./types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

// ============================================================================
// Helper Functions
// ============================================================================

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function asObject(value: unknown): XmlObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as XmlObject;
}

function getString(source: unknown, keys: string[]): string | undefined {
  const object = asObject(source);
  if (!object) return undefined;

  for (const key of keys) {
    const direct = object[key];
    if (direct !== undefined && direct !== null && direct !== "" && typeof direct !== "object") {
      const str = String(direct).trim();
      if (str) return str;
    }

    const matchedKey = Object.keys(object).find((item) => item.toLowerCase() === key.toLowerCase());
    if (!matchedKey) continue;
    const value = object[matchedKey];
    if (value !== undefined && value !== null && value !== "" && typeof value !== "object") {
      const str = String(value).trim();
      if (str) return str;
    }
  }

  return undefined;
}

/**
 * Map DOTW internal rating codes to star counts.
 * Known codes: 561=3star, 562=4star, 563=5star, 48055=apartment
 */
function dotwRatingToStars(rating: string | undefined): string | undefined {
  if (!rating) return undefined;
  const code = Number(rating);
  if (code >= 559 && code <= 565) return String(code - 558); // 559=1, 560=2, 561=3, 562=4, 563=5
  if (code >= 1 && code <= 5) return rating; // already stars
  return undefined;
}

/**
 * Extract ALL image URLs from hotel data.
 * Returns an array of all valid image URLs found.
 */
function extractAllImages(hotel: XmlObject): string[] {
  const VALID_IMAGE_DOMAINS = [
    "dotwconnect.com",
    "webbeds.com",
    "static-images.webbeds.com",
    "us.dotwconnect.com",
    "eu.dotwconnect.com",
  ];
  
  const seenUrls = new Set<string>();
  const images: string[] = [];
  
  function isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    const lowerUrl = url.toLowerCase().trim();
    if (!lowerUrl.startsWith("http")) return false;
    
    try {
      const urlObj = new URL(lowerUrl);
      const hostname = urlObj.hostname.toLowerCase();
      return VALID_IMAGE_DOMAINS.some(domain => hostname.includes(domain));
    } catch {
      return false;
    }
  }
  
  function addImage(url: string | undefined) {
    if (!url || !isValidImageUrl(url)) return;
    const trimmed = url.trim();
    if (!seenUrls.has(trimmed)) {
      seenUrls.add(trimmed);
      images.push(trimmed);
    }
  }
  
  // Check hotelImages object
  const hotelImages = asObject(hotel["hotelImages"] ?? hotel["HotelImages"]);
  if (hotelImages) {
    // Try thumb field
    const thumb = getString(hotelImages, ["thumb", "Thumb", "@_thumb", "@_Thumb"]);
    addImage(thumb);
    
    // Try image array - get ALL images
    const imageArray = asArray(hotelImages["image"] ?? hotelImages["Image"]);
    for (const img of imageArray) {
      if (typeof img === "string") {
        addImage(img);
      } else {
        const imgObj = asObject(img);
        if (imgObj) {
          // Try url attribute
          const url = getString(imgObj, ["url", "Url", "@_url", "@_Url"]);
          addImage(url);
          // Also try #text content (for CDATA wrapped URLs)
          const textContent = imgObj["#text"];
          if (typeof textContent === "string") {
            addImage(textContent.trim());
          }
        }
      }
    }
  }
  
  // Check direct image fields
  const directImage = getString(hotel, [
    "@_Image",
    "@_image",
    "@_mainimage",
    "@_MainImage",
    "image",
    "Image",
    "mainimage",
    "MainImage",
  ]);
  addImage(directImage);
  
  return images;
}

/**
 * Extract single image URL from hotel data (for backwards compatibility).
 * Only checks known image fields to avoid picking up random URLs.
 */
function extractImageUrl(hotel: XmlObject): string | undefined {
  const images = extractAllImages(hotel);
  return images.length > 0 ? images[0] : undefined;
}

/**
 * Extract a flat address string from V4 hotel data.
 */
function extractAddress(hotel: XmlObject): string | undefined {
  // Try simple string fields first
  const simple = getString(hotel, ["@_Address", "address", "@_FullAddress"]);
  if (simple) return simple;

  // V4: fullAddress is an object
  const fa = hotel["fullAddress"] ?? hotel["FullAddress"];
  if (fa && typeof fa === "object" && !Array.isArray(fa)) {
    const obj = fa as Record<string, unknown>;
    const parts = [
      obj["hotelStreetAddress"] ?? obj["HotelStreetAddress"],
      obj["hotelCity"] ?? obj["HotelCity"],
      obj["hotelCountry"] ?? obj["HotelCountry"],
    ]
      .filter((p) => typeof p === "string" && p.trim())
      .map((p) => String(p).trim());
    if (parts.length > 0) return parts.join(", ");
  }

  return undefined;
}

/**
 * Extract city name from fullAddress object.
 */
function extractCityOnly(hotel: XmlObject): string | undefined {
  const fa = hotel["fullAddress"] ?? hotel["FullAddress"];
  if (fa && typeof fa === "object" && !Array.isArray(fa)) {
    const obj = fa as Record<string, unknown>;
    const city = obj["hotelCity"] ?? obj["HotelCity"];
    if (typeof city === "string" && city.trim()) {
      return city.trim();
    }
  }
  // Fallback to cityName field
  return getString(hotel, ["@_CityName", "cityName", "city", "@_cityname"]);
}

/**
 * Get minimum price from dynamic hotel structure (V4 searchhotels response).
 * Path: hotel > rooms > room > roomType > rateBases > rateBasis > total
 */
function getMinPriceFromDynamicHotel(hotel: XmlObject): string | undefined {
  let minPrice: number | null = null;

  function extractPrice(totalRaw: unknown) {
    const raw = String(totalRaw ?? "").replace(/[^\d.]/g, "");
    const total = Number(raw);
    if (Number.isFinite(total) && total > 0 && (minPrice === null || total < minPrice)) {
      minPrice = total;
    }
  }

  // V4 path: hotel > rooms > room > roomType > rateBases > rateBasis > total
  const roomsWrapper = hotel["rooms"] as XmlObject | undefined;
  const rooms = asArray(roomsWrapper?.["room"]);
  for (const room of rooms) {
    const roomObj = asObject(room);
    if (!roomObj) continue;

    const roomTypes = asArray(roomObj["roomType"]);
    for (const rt of roomTypes) {
      const rtObj = asObject(rt);
      if (!rtObj) continue;

      const rateBasesWrapper = rtObj["rateBases"] as XmlObject | undefined;
      const rateBases = asArray(rateBasesWrapper?.["rateBasis"]);
      for (const rb of rateBases) {
        const rbObj = asObject(rb);
        extractPrice(rbObj?.["total"]);
      }
      
      // Also try direct rateBasis (without rateBases wrapper)
      const directRateBases = asArray(rtObj["rateBasis"]);
      for (const rb of directRateBases) {
        const rbObj = asObject(rb);
        extractPrice(rbObj?.["total"]);
      }
    }
  }

  return minPrice === null ? undefined : String(minPrice);
}

/**
 * Get text content from a language object.
 * Handles both direct text and CDATA wrapped content.
 */
function getDescriptionText(language: unknown): string | undefined {
  const langObj = asObject(language);
  if (!langObj) return undefined;
  
  // Try #text first (CDATA content)
  const textContent = langObj["#text"];
  if (typeof textContent === "string" && textContent.trim()) {
    return textContent.trim();
  }
  
  // Try direct string value
  if (typeof language === "string" && language.trim()) {
    return language.trim();
  }
  
  return undefined;
}

/**
 * Extract description from description1/description2 fields.
 * These fields contain language objects with text content.
 *
 * Structure: description1 > language[id, name, #text]
 *
 * Priority:
 * 1. Turkish (id=2) if available
 * 2. English (id=1) as fallback
 * 3. First available language
 */
function extractDescription(hotel: XmlObject): string | undefined {
  const descKeys = ["description1", "description2"];
  
  for (const key of descKeys) {
    const descNode = hotel[key];
    if (!descNode || typeof descNode !== "object" || Array.isArray(descNode)) continue;
    
    const descObj = descNode as XmlObject;
    const languages = asArray(descObj["language"]);
    
    if (languages.length === 0) continue;
    
    // Try Turkish first (id="2")
    const turkish = languages.find((lang: unknown) => {
      const langObj = asObject(lang);
      const id = langObj?.["@_id"];
      return id === "2" || id === 2;
    });
    if (turkish) {
      const text = getDescriptionText(turkish);
      if (text) return text;
    }
    
    // Fallback to English (id="1")
    const english = languages.find((lang: unknown) => {
      const langObj = asObject(lang);
      const id = langObj?.["@_id"];
      return id === "1" || id === 1;
    });
    if (english) {
      const text = getDescriptionText(english);
      if (text) return text;
    }
    
    // Last resort: first available language
    const first = languages[0];
    const text = getDescriptionText(first);
    if (text) return text;
  }
  
  return undefined;
}

// ============================================================================
// Hotel Normalization
// ============================================================================

/**
 * Normalize a V4 hotel node from searchhotels response.
 * 
 * V4 searchhotels response structure (without fields):
 * result > hotels > hotel[@hotelid] > rooms > room > roomType > rateBases > rateBasis > total
 * 
 * V4 searchhotels response structure (with fields + noPrice):
 * result > hotels > hotel[@hotelid] > hotelName, address, fullAddress, rating, hotelImages, geoPoint, etc.
 */
function normalizeHotelNode(rawHotel: unknown): NormalizedHotel {
  const hotel = asObject(rawHotel) ?? {};

  // Hotel ID - always present
  const hotelId = getString(hotel, ["@_HotelId", "@_hotelid", "hotelid"]) || "";

  // Hotel name - from various possible sources
  // @_name comes from getRooms response, hotelName from search with fields
  const hotelName = getString(hotel, ["@_name", "hotelName", "name"]) || `Otel #${hotelId}`;
  
  // Address
  const address = extractAddress(hotel) || "Adres bilgisi bulunamadı";
  const cityName = extractCityOnly(hotel) || "";
  
  // Extract fullAddress object
  const fullAddress = extractFullAddressObject(hotel);
  
  // Rating/Stars
  const rawRating = getString(hotel, ["@_Stars", "rating", "stars"]);
  const stars = dotwRatingToStars(rawRating) || "";
  
  // Price
  const directPrice = getString(hotel, ["@_Price", "price"]);
  const fallbackMinPrice = getMinPriceFromDynamicHotel(hotel);
  
  // Images - extract ALL images
  const allImages = extractAllImages(hotel);
  const imageUrl = allImages.length > 0 ? allImages[0] : undefined;
  
  // GeoPoint
  const geoPoint = asObject(hotel["geoPoint"]);
  const lat = getString(geoPoint ?? {}, ["lat", "@_lat"]);
  const lng = getString(geoPoint ?? {}, ["lng", "@_lng"]);
  
  // Check-in/out times
  const checkInTime = getString(hotel, ["checkInTime", "checkintime", "@_checkintime"]);
  const checkOutTime = getString(hotel, ["checkOutTime", "checkouttime", "@_checkouttime"]);
  
  // Description - extract from description1/description2 language objects
  const description = extractDescription(hotel) || getString(hotel, ["description"]);
  
  // City/Country codes
  const cityCode = getString(hotel, ["@_CityCode", "cityCode"]);
  const countryCode = getString(hotel, ["@_CountryCode", "countryCode"]);
  const countryName = getString(hotel, ["@_CountryName", "countryName"]);

  return {
    hotelId,
    hotelName,
    address,
    fullAddress,
    cityName,
    cityCode,
    countryName,
    countryCode,
    stars,
    price: directPrice || fallbackMinPrice || "0",
    image: imageUrl,
    images: allImages.length > 0 ? allImages : undefined,
    lat,
    lng,
    checkInTime,
    checkOutTime,
    description,
  };
}

/**
 * Extract fullAddress object from hotel data
 */
function extractFullAddressObject(hotel: XmlObject): HotelFullAddress | undefined {
  const fa = hotel["fullAddress"] ?? hotel["FullAddress"];
  if (fa && typeof fa === "object" && !Array.isArray(fa)) {
    const obj = fa as Record<string, unknown>;
    const streetAddress = getString(obj, ["hotelStreetAddress", "HotelStreetAddress"]);
    const city = getString(obj, ["hotelCity", "HotelCity"]);
    const country = getString(obj, ["hotelCountry", "HotelCountry"]);
    
    if (streetAddress || city || country) {
      return {
        hotelStreetAddress: streetAddress,
        hotelCity: city,
        hotelCountry: country,
      };
    }
  }
  return undefined;
}

// ============================================================================
// Main Export Functions
// ============================================================================

export function parseWebBedsXML(xmlString: string): XmlObject {
  try {
    return parser.parse(xmlString) as XmlObject;
  } catch (error) {
    console.error("XML parsing error:", error);
    throw error;
  }
}

/**
 * Extract hotels from V4 searchhotels response.
 * 
 * V4 Response paths:
 * - result > hotels > hotel (array or single)
 * - result > hotel (single hotel, e.g., from getRooms)
 */
export function extractHotelsFromSearchResponse(parsedXML: XmlObject): NormalizedHotel[] {
  try {
    const result = parsedXML["result"] as XmlObject | undefined;
    
    if (!result) {
      console.log("[extractHotels] No 'result' node found");
      return [];
    }

    // Try V4 format: result > hotels > hotel
    const hotelsNode = result["hotels"] as XmlObject | undefined;
    if (hotelsNode) {
      const hotelNode = hotelsNode["hotel"];
      if (hotelNode) {
        return asArray(hotelNode).map(normalizeHotelNode);
      }
    }

    // Try single hotel format: result > hotel (from getRooms)
    const singleHotel = result["hotel"];
    if (singleHotel) {
      return [normalizeHotelNode(singleHotel)];
    }

    console.log("[extractHotels] No hotels found in response");
    return [];
  } catch (error) {
    console.error("Error extracting hotels:", error);
    return [];
  }
}

// ============================================================================
// Room Parsing
// ============================================================================

/**
 * Normalize a V4 roomType + rateBasis into a flat selectable room item.
 */
function normalizeRoomItem(
  roomType: XmlObject,
  rateBasis: XmlObject,
): NormalizedRoom {
  const roomName = getString(roomType, ["name", "@_name"]) || "Oda";
  const roomTypeCode = getString(roomType, ["@_roomtypecode", "code", "@_code"]) || "";
  const description = getString(roomType, ["description"]) || "";
  const leftToSell = getString(roomType, ["leftToSell"]) || "";

  // roomInfo
  const roomInfo = asObject(roomType["roomInfo"]);
  const maxAdults = getString(roomInfo ?? {}, ["maxAdults"]) || "";
  const maxChildren = getString(roomInfo ?? {}, ["maxChildren"]) || "";
  const maxOccupancy = getString(roomInfo ?? {}, ["maxOccupancy"]) || "";

  // rateBasis fields
  const rawRateId = getString(rateBasis, ["@_id", "id"]) || "0";
  const rateId = `${roomTypeCode}_${rawRateId}`;
  
  // Board basis from rateType description
  const rateType = asObject(rateBasis["rateType"]);
  const boardBasis = getString(rateType ?? {}, ["@_description", "name", "description"]) || "Standart";

  // Price from total element
  let price = "0";
  const totalRaw = rateBasis["total"];
  if (totalRaw !== undefined && totalRaw !== null) {
    if (typeof totalRaw === "object" && !Array.isArray(totalRaw)) {
      const formatted = getString(totalRaw as XmlObject, ["formatted", "#text"]);
      if (formatted) {
        price = formatted.replace(/[^\d.]/g, "");
      }
    } else {
      price = String(totalRaw).replace(/[^\d.]/g, "");
    }
  }

  // Minimum selling price
  let minSellingPrice = "";
  const mspRaw = rateBasis["totalMinimumSelling"];
  if (mspRaw !== undefined && mspRaw !== null) {
    if (typeof mspRaw === "object" && !Array.isArray(mspRaw)) {
      const formatted = getString(mspRaw as XmlObject, ["formatted", "#text"]);
      if (formatted) minSellingPrice = formatted.replace(/[^\d.]/g, "");
    } else {
      minSellingPrice = String(mspRaw).replace(/[^\d.]/g, "");
    }
  }

  // Currency from rateType element
  const currency = getString(rateType ?? {}, ["@_currencyshort", "currencyshort", "currency"]) || "USD";

  // Refundable
  const nonRefundable = getString(rateType ?? {}, ["@_nonrefundable", "nonrefundable"]);
  const refundable = nonRefundable === "yes" ? false : true;

  // Allocation details
  const allocationDetails = getString(rateBasis, ["allocationDetails"]) || "";

  // Status
  const status = getString(rateBasis, ["status"]) || "";

  // Cancellation rules
  const cancellationRulesNode = rateBasis["cancellationRules"];
  let cancellationRules: CancellationRule[] = [];
  
  if (cancellationRulesNode && typeof cancellationRulesNode === "object") {
    const rulesObj = asObject(cancellationRulesNode);
    if (rulesObj) {
      const rulesArray = asArray(rulesObj["rule"]);
      cancellationRules = rulesArray.map((rule: unknown) => {
        const r = asObject(rule);
        return {
          fromDate: getString(r, ["fromDate"]),
          toDate: getString(r, ["toDate"]),
          amendCharge: getString(r, ["amendCharge"]),
          cancelCharge: getString(r, ["cancelCharge"]),
          charge: getString(r, ["charge"]),
          amendRestricted: getString(r, ["amendRestricted"]),
          cancelRestricted: getString(r, ["cancelRestricted"]),
          noShowPolicy: getString(r, ["noShowPolicy"]),
        };
      });
    }
  }

  return {
    rateId,
    roomName,
    roomTypeCode,
    boardBasis,
    price,
    minSellingPrice,
    currency,
    refundable,
    description,
    leftToSell,
    maxAdults,
    maxChildren,
    maxOccupancy,
    allocationDetails,
    status,
    cancellationRules,
  };
}

/**
 * Extract rooms from V4 getRooms response.
 * 
 * V4 Response path:
 * result > hotel > rooms > room > roomType > rateBases > rateBasis
 */
export function extractRoomsFromResponse(parsedXML: XmlObject): NormalizedRoom[] {
  try {
    const items: NormalizedRoom[] = [];

    // V4 DOTW format: result > hotel > rooms > room > roomType
    const result = parsedXML["result"] as XmlObject | undefined;
    if (!result) return [];

    const v4Hotel = asObject(result["hotel"]);
    if (!v4Hotel) return [];

    // Check allowBook
    const allowBook = getString(v4Hotel, ["allowBook"]);
    if (allowBook === "no") {
      console.warn("[extractRooms] Hotel does not allow booking");
      return [];
    }

    // V4 path: hotel > rooms > room > roomType
    const roomsWrapper = v4Hotel["rooms"] as XmlObject | undefined;
    const rooms = asArray(roomsWrapper?.["room"]);
    for (const room of rooms) {
      const roomObj = asObject(room);
      if (!roomObj) continue;

      const roomTypes = asArray(roomObj["roomType"]);
      for (const rt of roomTypes) {
        const rtObj = asObject(rt);
        if (!rtObj) continue;

        const rateBasesWrapper = rtObj["rateBases"] as XmlObject | undefined;
        const rateBases = asArray(rateBasesWrapper?.["rateBasis"]);
        if (rateBases.length > 0) {
          for (const rb of rateBases) {
            const rbObj = asObject(rb);
            if (rbObj) items.push(normalizeRoomItem(rtObj, rbObj));
          }
        } else {
          // Try direct rateBasis (without rateBases wrapper)
          const directRateBases = asArray(rtObj["rateBasis"]);
          for (const rb of directRateBases) {
            const rbObj = asObject(rb);
            if (rbObj) items.push(normalizeRoomItem(rtObj, rbObj));
          }
        }
      }
    }

    return items;
  } catch (error) {
    console.error("Error extracting rooms:", error);
    return [];
  }
}

/**
 * Extract hotel info from getRooms response.
 * Returns hotel name, check-in/out times, description.
 */
export function extractHotelInfoFromGetRooms(parsedXML: XmlObject): {
  hotelId: string;
  hotelName: string;
  checkInTime: string;
  checkOutTime: string;
  description?: string;
} {
  const result = parsedXML["result"] as XmlObject | undefined;
  const hotel = result?.["hotel"] as XmlObject | undefined;
  
  if (!hotel) {
    return {
      hotelId: "",
      hotelName: "",
      checkInTime: "14:00",
      checkOutTime: "12:00",
    };
  }

  return {
    hotelId: getString(hotel, ["@_hotelid", "@_HotelId"]) || "",
    hotelName: getString(hotel, ["@_name", "hotelName", "name"]) || "",
    checkInTime: getString(hotel, ["checkInTime", "checkintime"]) || "14:00",
    checkOutTime: getString(hotel, ["checkOutTime", "checkouttime"]) || "12:00",
    description: extractDescription(hotel) || getString(hotel, ["description"]),
  };
}
