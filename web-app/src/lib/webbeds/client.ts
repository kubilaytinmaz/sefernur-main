/**
 * WebBeds V4 API Client
 * 
 * Centralized client for all WebBeds API interactions.
 * Handles XML building, HTTP requests, and response parsing.
 */

import axios, { AxiosError } from "axios";
import { WEBBEDS_CONFIG } from "./config";
import type {
  BlockRoomParams,
  GetAllHotelsParams,
  GetHotelsByIdsParams,
  GetRoomsParams,
  HotelListResponse,
  NormalizedHotel,
  RoomsResponse,
  SearchByCityParams
} from "./types";
import {
  buildBlockRoomXML,
  buildGetRoomsXML,
  buildSearchByIdsWithPriceXML,
  buildSearchByIdsXML,
  buildSearchHotelsXML,
} from "./xml-builder";
import {
  extractHotelInfoFromGetRooms,
  extractHotelsFromSearchResponse,
  extractRoomsFromResponse,
  parseWebBedsXML,
} from "./xml-parser";

const V4_HEADERS: Record<string, string> = {
  "Content-Type": "text/xml; charset=utf-8",
  "Accept": "text/xml",
  "Accept-Encoding": "gzip, deflate",
};

// ============================================================================
// WebBeds Client Class
// ============================================================================

export class WebBedsClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = WEBBEDS_CONFIG.baseUrl;
  }

  /**
   * Search hotels by city with pricing.
   * 
   * Phase 1: Get hotel IDs + pricing (fast)
   * Note: This does NOT return hotel names, addresses, images etc.
   * Use getHotelsByIds() or getAllHotelsInCity() for full details.
   */
  async searchByCity(params: SearchByCityParams): Promise<HotelListResponse> {
    try {
      const xml = buildSearchHotelsXML({
        cityCode: params.cityCode,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        rooms: params.rooms,
        nationality: params.nationality ?? 5,
        currency: params.currency ?? 520,
      });

      const response = await axios.post(this.baseUrl, xml, {
        headers: V4_HEADERS,
        timeout: 60000,
      });

      const parsed = parseWebBedsXML(response.data);
      const hotels = extractHotelsFromSearchResponse(parsed);

      console.log(`[WebBedsClient] searchByCity: found ${hotels.length} hotels with pricing`);

      return {
        success: true,
        data: hotels,
        count: hotels.length,
      };
    } catch (error) {
      console.error("[WebBedsClient] searchByCity error:", error);
      return this.handleError(error);
    }
  }

  /**
   * Get ALL hotels in a city with full details (no pricing).
   * 
   * This performs a two-step process:
   * 1. Search with noPrice to get hotel IDs
   * 2. Batch query by IDs (max 50 per request) with fields to get details
   */
  async getAllHotelsInCity(params: GetAllHotelsParams): Promise<HotelListResponse> {
    try {
      // Step 1: Get hotel IDs with noPrice
      const searchXml = buildSearchHotelsXML({
        cityCode: params.cityCode,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        rooms: [{ adults: 2, children: 0 }],
        nationality: params.nationality ?? 5,
        currency: params.currency ?? 520,
      });

      // Add noPrice filter manually (not in builder to keep it clean)
      const noPriceXml = searchXml.replace(
        /<filters xmlns:/,
        `<filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition"><noPrice>true</noPrice><filters xmlns:`
      ).replace(
        /<\/filters>/,
        "</filters></filters>"
      );

      const searchResponse = await axios.post(this.baseUrl, noPriceXml, {
        headers: V4_HEADERS,
        timeout: 60000,
      });

      const searchParsed = parseWebBedsXML(searchResponse.data);
      const hotelsWithIds = extractHotelsFromSearchResponse(searchParsed);

      if (hotelsWithIds.length === 0) {
        return {
          success: true,
          data: [],
          count: 0,
        };
      }

      // Step 2: Get details by IDs (max 50 per batch)
      const hotelIds = hotelsWithIds.map((h) => h.hotelId).filter(Boolean);
      const detailedHotels = await this.getHotelsByIds({
        hotelIds,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nationality: params.nationality,
        currency: params.currency,
      });

      console.log(`[WebBedsClient] getAllHotelsInCity: found ${detailedHotels.length} hotels with details`);

      return {
        success: true,
        cityCode: params.cityCode,
        data: detailedHotels,
        count: detailedHotels.length,
      };
    } catch (error) {
      console.error("[WebBedsClient] getAllHotelsInCity error:", error);
      return this.handleError(error);
    }
  }

  /**
   * Get hotel details by IDs (with noPrice + fields).
   * Max 50 hotel IDs per request as per DOTW recommendation.
   * Automatically batches if more than 50 IDs provided.
   */
  async getHotelsByIds(params: GetHotelsByIdsParams): Promise<NormalizedHotel[]> {
    const results: NormalizedHotel[] = [];
    
    // Process in batches of 50
    for (let i = 0; i < params.hotelIds.length; i += 50) {
      const batch = params.hotelIds.slice(i, i + 50);
      
      try {
        const xml = buildSearchByIdsXML({
          hotelIds: batch,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          currency: params.currency ?? 520,
          nationality: params.nationality ?? 5,
        });

        console.log(`[WebBedsClient] getHotelsByIds batch XML:\n`, xml);

        const response = await axios.post(this.baseUrl, xml, {
          headers: V4_HEADERS,
          timeout: 60000,
        });

        console.log(`[WebBedsClient] getHotelsByIds batch response:\n`, response.data);

        const parsed = parseWebBedsXML(response.data);
        console.log(`[WebBedsClient] getHotelsByIds parsed:\n`, JSON.stringify(parsed, null, 2));

        const hotels = extractHotelsFromSearchResponse(parsed);
        
        results.push(...hotels);
      } catch (error) {
        console.error(`[WebBedsClient] getHotelsByIds batch ${i / 50 + 1} error:`, error);
        // Continue with next batch even if this one fails
      }
    }

    console.log(`[WebBedsClient] getHotelsByIds: fetched ${results.length} hotels`);
    return results;
  }

  /**
   * Get hotel details by IDs WITH pricing.
   * Use this when you need both availability and pricing for specific hotels.
   */
  async getHotelsByIdsWithPrice(params: GetHotelsByIdsParams & { rooms: Array<{ adults: number; children: number; childAges?: number[] }> }): Promise<NormalizedHotel[]> {
    const results: NormalizedHotel[] = [];
    
    for (let i = 0; i < params.hotelIds.length; i += 50) {
      const batch = params.hotelIds.slice(i, i + 50);
      
      try {
        const xml = buildSearchByIdsWithPriceXML({
          hotelIds: batch,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          rooms: params.rooms,
          currency: params.currency ?? 520,
          nationality: params.nationality ?? 5,
        });

        const response = await axios.post(this.baseUrl, xml, {
          headers: V4_HEADERS,
          timeout: 60000,
        });

        const parsed = parseWebBedsXML(response.data);
        const hotels = extractHotelsFromSearchResponse(parsed);
        
        results.push(...hotels);
      } catch (error) {
        console.error(`[WebBedsClient] getHotelsByIdsWithPrice batch ${i / 50 + 1} error:`, error);
      }
    }

    return results;
  }

  /**
   * Get rooms and pricing for a specific hotel.
   * 
   * V4 requires getRooms to be called after searchhotels to get:
   * - Cancellation policies
   * - allocationDetails (required for booking)
   * - All rate options
   */
  async getRooms(params: GetRoomsParams): Promise<RoomsResponse> {
    try {
      const xml = buildGetRoomsXML({
        hotelId: params.hotelId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        rooms: params.rooms,
        nationality: params.nationality ?? 5,
        currency: params.currency ?? 520,
      });

      const response = await axios.post(this.baseUrl, xml, {
        headers: V4_HEADERS,
        timeout: 60000,
      });

      const parsed = parseWebBedsXML(response.data);
      const rooms = extractRoomsFromResponse(parsed);
      const hotelInfo = extractHotelInfoFromGetRooms(parsed);

      console.log(`[WebBedsClient] getRooms: hotel ${params.hotelId}, found ${rooms.length} room options`);

      return {
        success: true,
        data: {
          hotel: hotelInfo,
          rooms,
        },
      };
    } catch (error) {
      console.error("[WebBedsClient] getRooms error:", error);
      return this.handleError(error);
    }
  }

  /**
   * Block a room (pre-booking validation).
   * 
   * V4 requires blocking before booking to:
   * - Validate price and availability
   * - Get allocationDetails token
   * - Hold inventory for 3 minutes
   * 
   * Response must contain <status>checked</status> before proceeding to booking.
   */
  async blockRoom(params: BlockRoomParams): Promise<RoomsResponse> {
    try {
      const xml = buildBlockRoomXML({
        hotelId: params.hotelId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        rooms: params.rooms,
        roomTypeCode: params.roomTypeCode,
        selectedRateBasis: params.selectedRateBasis,
        allocationDetails: params.allocationDetails,
        nationality: params.nationality ?? 5,
        currency: params.currency ?? 520,
      });

      const response = await axios.post(this.baseUrl, xml, {
        headers: V4_HEADERS,
        timeout: 60000,
      });

      const parsed = parseWebBedsXML(response.data);
      const rooms = extractRoomsFromResponse(parsed);
      const hotelInfo = extractHotelInfoFromGetRooms(parsed);

      // Check if blocking was successful
      const firstRoom = rooms[0];
      if (firstRoom?.status !== "checked") {
        console.warn(`[WebBedsClient] blockRoom: status is '${firstRoom?.status}', expected 'checked'`);
      }

      console.log(`[WebBedsClient] blockRoom: hotel ${params.hotelId}, status: ${firstRoom?.status}`);

      return {
        success: true,
        data: {
          hotel: hotelInfo,
          rooms,
        },
      };
    } catch (error) {
      console.error("[WebBedsClient] blockRoom error:", error);
      return this.handleError(error);
    }
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(error: unknown): any {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      
      // Try to extract error from XML response
      if (axiosError.response?.data) {
        try {
          const parsed = parseWebBedsXML(axiosError.response.data) as Record<string, unknown>;
          const result = parsed?.result as Record<string, unknown> | undefined;
          const request = result?.request as Record<string, unknown> | undefined;
          const requestError = request?.error as Record<string, unknown> | undefined;
          
          if (requestError) {
            return {
              success: false,
              error: String(requestError.details || requestError.class || "WebBeds API error"),
              message: String(requestError.extraDetails || requestError.details || ""),
            };
          }
        } catch {
          // Ignore parse errors, fall through to default
        }
      }

      return {
        success: false,
        error: axiosError.message,
        message: axiosError.code || "Network error",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "",
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const webBedsClient = new WebBedsClient();
