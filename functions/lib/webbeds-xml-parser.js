const { XMLParser } = require("fast-xml-parser");

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value;
}

function getByPath(source, path) {
  let current = source;
  for (const segment of path) {
    const obj = asObject(current);
    if (!obj) return undefined;
    const direct = obj[segment];
    if (direct !== undefined) { current = direct; continue; }
    const lowerSegment = segment.toLowerCase();
    const matchedKey = Object.keys(obj).find((k) => k.toLowerCase() === lowerSegment);
    if (!matchedKey) return undefined;
    current = obj[matchedKey];
  }
  return current;
}

function getString(source, keys) {
  const obj = asObject(source);
  if (!obj) return undefined;
  for (const key of keys) {
    const direct = obj[key];
    if (direct !== undefined && direct !== null && direct !== "" && typeof direct !== "object") {
      const str = String(direct).trim();
      if (str) return str;
    }
    const matchedKey = Object.keys(obj).find((item) => item.toLowerCase() === key.toLowerCase());
    if (!matchedKey) continue;
    const value = obj[matchedKey];
    if (value !== undefined && value !== null && value !== "" && typeof value !== "object") {
      const str = String(value).trim();
      if (str) return str;
    }
  }
  return undefined;
}

function dotwRatingToStars(rating) {
  if (!rating) return undefined;
  const code = Number(rating);
  if (code >= 559 && code <= 565) return String(code - 558);
  if (code >= 1 && code <= 5) return rating;
  return undefined;
}

function findFirstHttpUrl(source) {
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
  const obj = asObject(source);
  if (!obj) return undefined;
  const directUrl = getString(obj, ["@_url", "url", "@_image", "image"]);
  if (directUrl && directUrl.startsWith("http")) return directUrl;
  for (const value of Object.values(obj)) {
    const found = findFirstHttpUrl(value);
    if (found) return found;
  }
  return undefined;
}

function getMinPriceFromDynamicHotel(hotel) {
  let minPrice = null;
  function extractPrice(totalRaw) {
    const raw = String(totalRaw || "").replace(/[^\d.]/g, "");
    const total = Number(raw);
    if (Number.isFinite(total) && total > 0 && (minPrice === null || total < minPrice)) {
      minPrice = total;
    }
  }
  const rooms = asArray(getByPath(hotel, ["rooms", "room"]));
  for (const room of rooms) {
    const roomTypes = asArray(getByPath(room, ["roomType"]));
    for (const roomType of roomTypes) {
      const rateBases = asArray(getByPath(roomType, ["rateBases", "rateBasis"]));
      for (const rb of rateBases) extractPrice(getByPath(rb, ["total"]));
      const directRateBases = asArray(getByPath(roomType, ["rateBasis"]));
      for (const rb of directRateBases) extractPrice(getByPath(rb, ["total"]));
    }
  }
  const directRoomTypes = asArray(getByPath(hotel, ["roomType"]));
  for (const roomType of directRoomTypes) {
    const rateBases = asArray(getByPath(roomType, ["rateBasis"]));
    for (const rb of rateBases) extractPrice(getByPath(rb, ["total"]));
  }
  return minPrice === null ? undefined : String(minPrice);
}

function extractAddress(hotel) {
  const simple = getString(hotel, ["@_Address", "address", "@_FullAddress"]);
  if (simple) return simple;
  const fa = hotel["fullAddress"] || hotel["FullAddress"];
  if (fa && typeof fa === "object" && !Array.isArray(fa)) {
    const parts = [
      fa["hotelStreetAddress"] || fa["HotelStreetAddress"],
      fa["hotelCity"] || fa["HotelCity"],
      fa["hotelCountry"] || fa["HotelCountry"],
    ]
      .filter((p) => typeof p === "string" && p.trim())
      .map((p) => String(p).trim());
    if (parts.length > 0) return parts.join(", ");
  }
  return undefined;
}

function normalizeHotelNode(rawHotel) {
  const hotel = asObject(rawHotel) || {};
  const hotelId = getString(hotel, ["@_HotelId", "@_hotelid", "hotelid", "hotelId"]);
  const hotelName = getString(hotel, ["@_HotelName", "hotelName", "name"]) || `Otel #${hotelId || ""}`.trim();
  const address = extractAddress(hotel) || "Adres bilgisi bulunamadı";
  const cityName = getString(hotel, ["@_CityName", "cityName", "city", "@_cityname"]);
  const rawRating = getString(hotel, ["@_Stars", "rating", "stars"]);
  const stars = dotwRatingToStars(rawRating);
  const directPrice = getString(hotel, ["@_Price", "price", "minPrice"]);
  const fallbackMinPrice = getMinPriceFromDynamicHotel(hotel);
  const imageUrl =
    findFirstHttpUrl(getByPath(hotel, ["hotelImages"])) ||
    findFirstHttpUrl(getByPath(hotel, ["images"])) ||
    findFirstHttpUrl(hotel);

  const normalized = {
    ...hotel,
    "@_HotelId": hotelId || "",
    "@_HotelName": hotelName,
    "@_Address": address,
  };
  if (cityName) normalized["@_CityName"] = cityName;
  if (stars) normalized["@_Stars"] = stars;
  if (directPrice || fallbackMinPrice) normalized["@_Price"] = directPrice || fallbackMinPrice || "0";
  if (imageUrl) normalized["@_Image"] = imageUrl;
  return normalized;
}

function parseWebBedsXML(xmlString) {
  try {
    return parser.parse(xmlString);
  } catch (error) {
    console.error("XML parsing error:", error);
    throw error;
  }
}

function extractHotelsFromSearchResponse(parsedXML) {
  try {
    const gatewayHotelNode = getByPath(parsedXML, ["Response", "Body", "SearchHotelsResponse", "Hotels", "Hotel"]);
    const dotwHotelNode = getByPath(parsedXML, ["result", "hotels", "hotel"]);
    const hotelNode = gatewayHotelNode || dotwHotelNode;
    return asArray(hotelNode).map(normalizeHotelNode);
  } catch (error) {
    console.error("Error extracting hotels:", error);
    return [];
  }
}

function normalizeRoomItem(roomType, rateBasis) {
  const roomName = getString(roomType, ["name", "@_name"]) || "Oda";
  const roomTypeCode = getString(roomType, ["@_roomtypecode", "code", "@_code"]) || "";
  const description = getString(roomType, ["description"]) || "";
  const leftToSell = getString(roomType, ["leftToSell"]) || "";
  const roomInfo = asObject(roomType["roomInfo"]);
  const maxAdults = getString(roomInfo || {}, ["maxAdults"]) || "";
  const maxChildren = getString(roomInfo || {}, ["maxChildren"]) || "";
  const maxOccupancy = getString(roomInfo || {}, ["maxOccupancy"]) || "";
  const rawRateId = getString(rateBasis, ["@_id", "id"]) || "0";
  const rateId = `${roomTypeCode}_${rawRateId}`;
  const boardBasis = getString(rateBasis, ["@_description", "name", "description"]) || "Standart";

  let price = "0";
  const totalRaw = rateBasis["total"];
  if (totalRaw !== undefined && totalRaw !== null) {
    if (typeof totalRaw === "object" && !Array.isArray(totalRaw)) {
      const formatted = getString(totalRaw, ["formatted", "#text"]);
      if (formatted) price = formatted.replace(/[^\d.]/g, "");
    } else {
      price = String(totalRaw).replace(/[^\d.]/g, "");
    }
  }

  let minSellingPrice = "";
  const mspRaw = rateBasis["totalMinimumSelling"];
  if (mspRaw !== undefined && mspRaw !== null) {
    if (typeof mspRaw === "object" && !Array.isArray(mspRaw)) {
      const formatted = getString(mspRaw, ["formatted", "#text"]);
      if (formatted) minSellingPrice = formatted.replace(/[^\d.]/g, "");
    } else {
      minSellingPrice = String(mspRaw).replace(/[^\d.]/g, "");
    }
  }

  const rateType = asObject(rateBasis["rateType"]);
  const currency = getString(rateType || {}, ["@_currencyshort", "currencyshort", "currency"]) || "USD";
  const nonRefundable = getString(rateType || {}, ["@_nonrefundable", "nonrefundable"]);
  const refundable = nonRefundable === "yes" ? "false" : "true";
  const allocationDetails = getString(rateBasis, ["allocationDetails"]) || "";
  const status = getString(rateBasis, ["status"]) || "";
  const cancellationRules = rateBasis["cancellationRules"];
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

function extractRoomsFromResponse(parsedXML) {
  try {
    const items = [];
    const v4Hotel = asObject(getByPath(parsedXML, ["result", "hotel"]));
    if (v4Hotel) {
      const allowBook = getString(v4Hotel, ["allowBook"]);
      if (allowBook === "no") {
        console.warn("[extractRooms] Hotel does not allow booking");
        return [];
      }
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
    const legacyRoomNode = getByPath(parsedXML, ["Response", "Body", "RoomsResponse", "Rooms", "Room"]);
    if (legacyRoomNode) return asArray(legacyRoomNode);
    return [];
  } catch (error) {
    console.error("Error extracting rooms:", error);
    return [];
  }
}

module.exports = { parseWebBedsXML, extractHotelsFromSearchResponse, extractRoomsFromResponse };
