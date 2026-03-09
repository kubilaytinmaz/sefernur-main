import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

type XmlObject = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function asObject(value: unknown): XmlObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as XmlObject;
}

function getByPath(source: unknown, path: string[]): unknown {
  let current: unknown = source;

  for (const segment of path) {
    const object = asObject(current);
    if (!object) return undefined;

    const direct = object[segment];
    if (direct !== undefined) {
      current = direct;
      continue;
    }

    const lowerSegment = segment.toLowerCase();
    const matchedKey = Object.keys(object).find((key) => key.toLowerCase() === lowerSegment);
    if (!matchedKey) return undefined;
    current = object[matchedKey];
  }

  return current;
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

function findFirstHttpUrl(source: unknown): string | undefined {
  if (typeof source === "string") {
    const value = source.trim();
    return value.startsWith("http") ? value : undefined;
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findFirstHttpUrl(item);
      if (found) return found;
    }
    return undefined;
  }

  const object = asObject(source);
  if (!object) return undefined;

  const directUrl = getString(object, ["@_url", "url", "@_image", "image"]);
  if (directUrl && directUrl.startsWith("http")) return directUrl;

  for (const value of Object.values(object)) {
    const found = findFirstHttpUrl(value);
    if (found) return found;
  }

  return undefined;
}

function getMinPriceFromDynamicHotel(hotel: XmlObject): string | undefined {
  let minPrice: number | null = null;

  function extractPrice(totalRaw: unknown) {
    // V4 API returns standard decimal format like "1035.8778"
    const raw = String(totalRaw ?? "").replace(/[^\d.]/g, "");
    const total = Number(raw);
    if (Number.isFinite(total) && total > 0 && (minPrice === null || total < minPrice)) {
      minPrice = total;
    }
  }

  // V4 path: hotel > rooms > room > roomType > rateBases > rateBasis > total
  const rooms = asArray(getByPath(hotel, ["rooms", "room"]));
  for (const room of rooms) {
    const roomTypes = asArray(getByPath(room, ["roomType"]));
    for (const roomType of roomTypes) {
      const rateBases = asArray(getByPath(roomType, ["rateBases", "rateBasis"]));
      for (const rateBasis of rateBases) {
        extractPrice(getByPath(rateBasis, ["total"]));
      }
      // Also try direct rateBasis (without rateBases wrapper)
      const directRateBases = asArray(getByPath(roomType, ["rateBasis"]));
      for (const rateBasis of directRateBases) {
        extractPrice(getByPath(rateBasis, ["total"]));
      }
    }
  }

  // Fallback: direct roomType path (non-V4 / flat structure)
  const directRoomTypes = asArray(getByPath(hotel, ["roomType"]));
  for (const roomType of directRoomTypes) {
    const rateBases = asArray(getByPath(roomType, ["rateBasis"]));
    for (const rateBasis of rateBases) {
      extractPrice(getByPath(rateBasis, ["total"]));
    }
  }

  return minPrice === null ? undefined : String(minPrice);
}

/**
 * Extract a flat address string from V4 hotel data.
 * V4 returns <address> as a plain string, but <fullAddress> as a complex object
 * with sub-elements like hotelStreetAddress, hotelCity, hotelCountry.
 */
function extractAddress(hotel: XmlObject): string | undefined {
  // Try simple string fields first
  const simple = getString(hotel, ["@_Address", "address", "@_FullAddress"]);
  if (simple) return simple;

  // V4: fullAddress is an object — extract and combine sub-fields
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
 * Extract city name from fullAddress object for display purposes.
 * Returns just the city name without street address or country.
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
 * Extract guest rating from API response.
 * WebBeds may return a guest rating (0-10 scale) separate from star rating.
 */
function extractGuestRating(hotel: XmlObject): number | undefined {
  // Try to find guest rating in various possible fields
  const ratingStr = getString(hotel, [
    "guestRating",
    "guestRatingValue",
    "ratingValue",
    "tripAdvisorRating",
    "reviewScore"
  ]);
  
  if (ratingStr) {
    const rating = parseFloat(ratingStr.replace(/[^\d.]/g, ""));
    if (!isNaN(rating) && rating > 0 && rating <= 10) {
      return rating;
    }
  }
  
  // Check for rating object with value
  const ratingObj = asObject(hotel["rating"] ?? hotel["Rating"]);
  if (ratingObj) {
    const value = getString(ratingObj, ["value", "ratingValue", "score"]);
    if (value) {
      const rating = parseFloat(value.replace(/[^\d.]/g, ""));
      if (!isNaN(rating) && rating > 0 && rating <= 10) {
        return rating;
      }
    }
  }
  
  return undefined;
}

function normalizeHotelNode(rawHotel: unknown): XmlObject {
  const hotel = asObject(rawHotel) ?? {};

  const hotelId = getString(hotel, ["@_HotelId", "@_hotelid", "hotelid", "hotelId"]);

  // V4 with <fields>: hotel details come as child elements (hotelName, address, etc.)
  // Also check @_name which is used in some API responses (like getrooms)
  const hotelName = getString(hotel, ["@_HotelName", "hotelName", "name", "@_name"]) || `Otel #${hotelId ?? ""}`.trim();
  const address = extractAddress(hotel) ?? "Adres bilgisi bulunamadı";
  const cityOnly = extractCityOnly(hotel);
  const cityName = cityOnly || getString(hotel, ["@_CityName", "cityName", "city", "@_cityname"]);
  const rawRating = getString(hotel, ["@_Stars", "rating", "stars"]);
  const stars = dotwRatingToStars(rawRating);
  const guestRating = extractGuestRating(hotel);

  const directPrice = getString(hotel, ["@_Price", "price", "minPrice"]);
  const fallbackMinPrice = getMinPriceFromDynamicHotel(hotel);

  const imageUrl =
    findFirstHttpUrl(getByPath(hotel, ["hotelImages"])) ||
    findFirstHttpUrl(getByPath(hotel, ["images"])) ||
    findFirstHttpUrl(hotel);

  // Extract geoPoint (lat/lng)
  const geoPoint = asObject(hotel["geoPoint"]);
  const lat = getString(geoPoint ?? {}, ["lat", "@_lat"]);
  const lng = getString(geoPoint ?? {}, ["lng", "@_lng"]);

  // Extract check-in/out times
  const checkInTime = getString(hotel, ["checkInTime", "checkintime", "@_checkintime", "checkIn"]);
  const checkOutTime = getString(hotel, ["checkOutTime", "checkouttime", "@_checkouttime", "checkOut"]);

  const normalized: XmlObject = {
    ...hotel,
    "@_HotelId": hotelId ?? "",
    "@_HotelName": hotelName,
    "@_Address": address,
  };

  if (cityName) normalized["@_CityName"] = cityName;
  if (stars) normalized["@_Stars"] = stars;
  if (guestRating) normalized["@_GuestRating"] = String(guestRating);
  if (directPrice || fallbackMinPrice) normalized["@_Price"] = directPrice ?? fallbackMinPrice ?? "0";
  if (imageUrl) normalized["@_Image"] = imageUrl;
  if (lat) normalized["@_Lat"] = lat;
  if (lng) normalized["@_Lng"] = lng;
  if (checkInTime) normalized["checkInTime"] = checkInTime;
  if (checkOutTime) normalized["checkOutTime"] = checkOutTime;

  return normalized;
}

export function parseWebBedsXML(xmlString: string): XmlObject {
  try {
    return parser.parse(xmlString) as XmlObject;
  } catch (error) {
    console.error("XML parsing error:", error);
    throw error;
  }
}

export function extractHotelsFromSearchResponse(parsedXML: XmlObject): XmlObject[] {
  try {
    const gatewayHotelNode = getByPath(parsedXML, ["Response", "Body", "SearchHotelsResponse", "Hotels", "Hotel"]);
    const dotwHotelNode = getByPath(parsedXML, ["result", "hotels", "hotel"]);
    const hotelNode = gatewayHotelNode ?? dotwHotelNode;

    console.log("[extractHotels] gatewayHotelNode:", gatewayHotelNode ? "found" : "not found");
    console.log("[extractHotels] dotwHotelNode:", dotwHotelNode ? "found" : "not found");
    console.log("[extractHotels] parsedXML keys:", Object.keys(parsedXML));

    return asArray(hotelNode).map(normalizeHotelNode);
  } catch (error) {
    console.error("Error extracting hotels:", error);
    return [];
  }
}

/**
 * Normalize a V4 roomType + rateBasis into a flat selectable room item.
 * Each roomType may have multiple rateBases — each one becomes a separate item.
 */
function normalizeRoomItem(
  roomType: XmlObject,
  rateBasis: XmlObject,
): XmlObject {
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
  const rateId = `${roomTypeCode}_${rawRateId}`; // Composite key to avoid collisions
  const boardBasis = getString(rateBasis, ["@_description", "name", "description"]) || "Standart";

  // Price from total element (may be nested object or direct value)
  let price = "0";
  const totalRaw = rateBasis["total"];
  if (totalRaw !== undefined && totalRaw !== null) {
    if (typeof totalRaw === "object" && !Array.isArray(totalRaw)) {
      // total may have a formatted sub-element or just inner text
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
  const rateType = asObject(rateBasis["rateType"]);
  const currency = getString(rateType ?? {}, ["@_currencyshort", "currencyshort", "currency"]) || "USD";

  // Refundable
  const nonRefundable = getString(rateType ?? {}, ["@_nonrefundable", "nonrefundable"]);
  const refundable = nonRefundable === "yes" ? "false" : "true";

  // Allocation details (needed for blocking)
  const allocationDetails = getString(rateBasis, ["allocationDetails"]) || "";

  // Status
  const status = getString(rateBasis, ["status"]) || "";

  // Cancellation rules
  const cancellationRules = rateBasis["cancellationRules"];

  // Specials
  const specials = rateBasis["specials"];

  return {
    "@_RateId": rateId,
    "@_RoomName": roomName,
    "@_RoomTypeCode": roomTypeCode,
    "@_BoardBasis": boardBasis,
    "@_Price": price,
    "@_MinSellingPrice": minSellingPrice,
    "@_Currency": currency,
    "@_Refundable": refundable,
    "@_Description": description,
    "@_LeftToSell": leftToSell,
    "@_MaxAdults": maxAdults,
    "@_MaxChildren": maxChildren,
    "@_MaxOccupancy": maxOccupancy,
    "@_AllocationDetails": allocationDetails,
    "@_Status": status,
    cancellationRules,
    specials,
  };
}

export function extractRoomsFromResponse(parsedXML: XmlObject): XmlObject[] {
  try {
    const items: XmlObject[] = [];

    // V4 DOTW format: result > hotel > rooms > room[] > roomType[] > rateBases > rateBasis[]
    const v4Hotel = asObject(getByPath(parsedXML, ["result", "hotel"]));
    if (v4Hotel) {
      // Check allowBook
      const allowBook = getString(v4Hotel, ["allowBook"]);
      if (allowBook === "no") {
        console.warn("[extractRooms] Hotel does not allow booking");
        return [];
      }

      // V4 path: hotel > rooms > room > roomType
      const rooms = asArray(getByPath(v4Hotel, ["rooms", "room"]));
      for (const room of rooms) {
        const roomObj = asObject(room);
        if (!roomObj) continue;

        const roomTypes = asArray(roomObj["roomType"]);
        for (const rt of roomTypes) {
          const rtObj = asObject(rt);
          if (!rtObj) continue;

          const rateBases = asArray(getByPath(rtObj, ["rateBases", "rateBasis"]));
          if (rateBases.length === 0) {
            // Try direct rateBasis (without rateBases wrapper)
            const directRateBases = asArray(rtObj["rateBasis"]);
            for (const rb of directRateBases) {
              const rbObj = asObject(rb);
              if (rbObj) items.push(normalizeRoomItem(rtObj, rbObj));
            }
          } else {
            for (const rb of rateBases) {
              const rbObj = asObject(rb);
              if (rbObj) items.push(normalizeRoomItem(rtObj, rbObj));
            }
          }
        }
      }

      // Also try direct roomType under hotel (flat V4 variant)
      if (items.length === 0) {
        const directRoomTypes = asArray(v4Hotel["roomType"]);
        for (const rt of directRoomTypes) {
          const rtObj = asObject(rt);
          if (!rtObj) continue;

          const rateBases = asArray(getByPath(rtObj, ["rateBases", "rateBasis"]));
          for (const rb of rateBases) {
            const rbObj = asObject(rb);
            if (rbObj) items.push(normalizeRoomItem(rtObj, rbObj));
          }
        }
      }

      if (items.length > 0) return items;
    }

    // Legacy gateway format fallback
    const legacyRoomNode = getByPath(parsedXML, ["Response", "Body", "RoomsResponse", "Rooms", "Room"]);
    if (legacyRoomNode) return asArray(legacyRoomNode) as XmlObject[];

    return [];
  } catch (error) {
    console.error("Error extracting rooms:", error);
    return [];
  }
}
