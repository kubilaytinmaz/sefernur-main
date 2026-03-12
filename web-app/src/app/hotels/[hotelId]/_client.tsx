"use client";

import {
  HotelAmenities,
  HotelImageGallery,
  HotelInfoSection,
  HotelLocation,
  HotelReviews,
  SimilarHotels
} from "@/components/hotels";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useRouteId } from "@/hooks/useRouteId";
import { formatTlUsdPairFromTl, formatTlUsdPairFromUsd } from "@/lib/currency";
import { createReservation } from "@/lib/firebase/reservations";
import { getCityFallbackImage } from "@/lib/hotels/city-images";
import type { NormalizedRoom } from "@/lib/webbeds/types";
import { useAuthStore } from "@/store/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Shield,
  Star,
  Users,
  Utensils,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useMemo, useRef, useState } from "react";

/* ────────── Constants ────────── */

// Default dates for hotel search (today and tomorrow)
const DEFAULT_CHECK_IN = format(new Date(), "yyyy-MM-dd"); // Bugün
const DEFAULT_CHECK_OUT = format(
  (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  })(),
  "yyyy-MM-dd",
); // Yarın

// SVG placeholder for hotels without images (fallback when no city images available)
const HOTEL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='700' viewBox='0 0 1200 700'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:0.1' /%3E%3Cstop offset='100%25' style='stop-color:%230ea5e9;stop-opacity:0.1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='1200' height='700'/%3E%3Crect fill='%23f1f5f9' x='400' y='200' width='400' height='300' rx='8'/%3E%3Cpath fill='%2394a3b8' d='M550 280h100v80h-100z'/%3E%3Cpath fill='%2394a3b8' d='M560 300h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Cpath fill='%2394a3b8' d='M560 330h20v20h-20zm30 0h20v20h-20zm30 0h20v20h-20z'/%3E%3Ctext fill='%2364748b' font-family='system-ui,-apple-system,sans-serif' font-size='24' font-weight='500' x='600' y='420' text-anchor='middle'%3EOtel Resmi%3C/text%3E%3Ctext fill='%2394a3b8' font-family='system-ui,-apple-system,sans-serif' font-size='16' x='600' y='450' text-anchor='middle'%3EMevcut Değil%3C/text%3E%3C/svg%3E";

/* ────────── Types ────────── */

interface RoomsResponse {
  success: boolean;
  data?: {
    hotel: {
      hotelId: string;
      hotelName: string;
      checkInTime: string;
      checkOutTime: string;
      description?: string;
    };
    rooms: NormalizedRoom[];
  };
  count?: number;
}

interface HotelDetailResponse {
  success: boolean;
  data?: {
    hotelId: string;
    hotelName: string;
    description?: string;
    address: string;
    fullAddress?: {
      hotelStreetAddress?: string;
      hotelCity?: string;
      hotelCountry?: string;
    };
    stars: string;
    rating?: string;
    images: string[];
    geoPoint?: {
      lat: string;
      lng: string;
    };
    cityName: string;
    cityCode?: string;
    countryName?: string;
    countryCode?: string;
    checkInTime: string;
    checkOutTime: string;
  };
  error?: string;
}

interface BookingPayload {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  identityTaxNumber: string;
  cardHolderName: string;
  cardNumber: string;
  cardExpireMonth: string;
  cardExpireYear: string;
  cardCvv: string;
  specialRequests: string;
}

/* ────────── Helpers ────────── */

function parsePriceToNumber(rawPrice?: string): number {
  if (!rawPrice) return 0;
  const normalized = rawPrice.replace(/[^\d.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

// Room name translations (English to Turkish)
function translateRoomName(roomName: string): string {
  // Önce tam eşleşmeleri kontrol et - en spesifikten en genele
  const fullTranslations: Record<string, string> = {
    // Complete room names
    "Quadruple Room": "Dört Kişilik Oda",
    "Triple Room": "Üç Yataklı Oda",
    "Double Room": "Çift Kişilik Oda",
    "Twin Room": "İki Yataklı Oda",
    "Single Room": "Tek Kişilik Oda",
    "Standard Room": "Standart Oda",
    "Standard King": "Standart King Yataklı Oda",
    "Standard Queen": "Standart Queen Yataklı Oda",
    "Standard Twin": "Standart İki Yataklı Oda",
    "Standard Double": "Standart Çift Kişilik Oda",
    "Standard Single": "Standart Tek Kişilik Oda",
    "Standard Triple": "Standart Üç Yataklı Oda",
    "Standard Quad": "Standart Dört Kişilik Oda",
    "Standard Quadruple": "Standart Dört Kişilik Oda",
    "Deluxe Room": "Deluxe Oda",
    "Deluxe King": "Deluxe King Yataklı Oda",
    "Deluxe Queen": "Deluxe Queen Yataklı Oda",
    "Deluxe Twin": "Deluxe İki Yataklı Oda",
    "Deluxe Double": "Deluxe Çift Kişilik Oda",
    "Deluxe Triple": "Deluxe Üç Yataklı Oda",
    "Deluxe Quadruple": "Deluxe Dört Kişilik Oda",
    "Deluxe Suite": "Deluxe Suite",
    "Superior Room": "Superior Oda",
    "Superior King": "Superior King Yataklı Oda",
    "Superior Twin": "Superior İki Yataklı Oda",
    "Superior Double": "Superior Çift Kişilik Oda",
    "Superior Triple": "Superior Üç Yataklı Oda",
    "Superior Quadruple": "Superior Dört Kişilik Oda",
    "Executive Room": "Executive Oda",
    "Executive Suite": "Executive Suite",
    "Family Room": "Aile Odası",
    "Family Suite": "Aile Suite",
    "Suite": "Suite",
    "Junior Suite": "Junior Suite",
    "Presidential Suite": "Presidential Suite",
    "Royal Suite": "Royal Suite",
    "Penthouse Suite": "Penthouse Suite",
    "Studio": "Stüdyo Daire",
    "Apartment": "Apartman",
    "One Bedroom Apartment": "Bir Yatak Odalı Apartman",
    "Two Bedroom Apartment": "İki Yatak Odalı Apartman",
    "Three Bedroom Apartment": "Üç Yatak Odalı Apartman",
    "Connecting Room": "Bağlantılı Oda",
    "Adjoining Room": "Bitişik Oda",
  };

  // Tam eşleşme varsa direkt dön
  if (fullTranslations[roomName]) {
    return fullTranslations[roomName];
  }

  // Tam eşleşme yoksa, kelime kelime çevir (sadece güvenli kelimeler için)
  // Uzun eşleşmelerden başla ki "Sea View" gibi birleşik ifadeler bozulmasın
  const safeWordTranslations: Record<string, string> = {
    // Multi-word phrases first (longest to shortest)
    "with Sea View": "Deniz Manzaralı",
    "with City View": "Şehir Manzaralı",
    "with Garden View": "Bahçe Manzaralı",
    "with Mountain View": "Dağ Manzaralı",
    "with Pool View": "Havuz Manzaralı",
    "with Ocean View": "Okyanus Manzaralı",
    "Sea View": "Deniz Manzaralı",
    "City View": "Şehir Manzaralı",
    "Garden View": "Bahçe Manzaralı",
    "Mountain View": "Dağ Manzaralı",
    "Pool View": "Havuz Manzaralı",
    "Ocean View": "Okyanus Manzaralı",
    "with View": "Manzaralı",
    "with Balcony": "Balkonlu",
    "with Terrace": "Teraslı",
    // Single words - ONLY at word boundaries
    "Quadruple": "Dört Kişilik",
    "Triple": "Üç Yataklı",
    "Double": "Çift Kişilik",
    "Twin": "İki Yataklı",
    "Single": "Tek Kişilik",
    "Standard": "Standart",
    "Deluxe": "Deluxe",
    "Superior": "Superior",
    "Executive": "Executive",
    "Family": "Aile",
    "King": "King",
    "Queen": "Queen",
    "Room": "Oda",
    "Suite": "Suite",
    "Balcony": "Balkonlu",
    "Terrace": "Teraslı",
  };

  let translated = roomName;
  
  // Önce uzun ifadeleri çevir
  const sortedKeys = Object.keys(safeWordTranslations)
    .sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    // Kelime sınırlarını kullan - "Quad" kelimesi "Quadruple" içinde geçse bile değişmesin
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    translated = translated.replace(regex, safeWordTranslations[key]);
  }

  return translated;
}

// Board basis translations
function translateBoardBasis(boardBasis: string): string {
  const translations: Record<string, string> = {
    "Room Only": "Sadece Oda",
    "Bed and Breakfast": "Kahvaltı Dahil",
    "Half Board": "Yarım Pansiyon",
    "Full Board": "Tam Pansiyon",
    "All Inclusive": "Her Şey Dahil",
    "Ultra All Inclusive": "Ultra Her Şey Dahil",
    "Self Catering": "Kendi Yemeğini Kendin Yap",
    "Continental Breakfast": "Kıtasal Kahvaltı",
    "American Breakfast": "Amerikan Kahvaltısı",
    "Buffet Breakfast": "Açık Büfe Kahvaltı",
  };

  return translations[boardBasis] || boardBasis;
}

function findFirstStringByKeys(source: unknown, keys: string[]): string | null {
  if (source === null || source === undefined) return null;
  if (typeof source === "string") return null;
  if (typeof source !== "object") return null;

  if (Array.isArray(source)) {
    for (const item of source) {
      const result = findFirstStringByKeys(item, keys);
      if (result) return result;
    }
    return null;
  }

  const record = source as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (keys.includes(key.toLowerCase()) && typeof value === "string" && value.trim()) {
      return value;
    }
  }

  for (const value of Object.values(record)) {
    const nested = findFirstStringByKeys(value, keys);
    if (nested) return nested;
  }

  return null;
}

function generatePaymentOrderId(): string {
  return `SEFWEB-${Date.now()}`;
}

function formatPrice(room: NormalizedRoom): string {
  const price = parsePriceToNumber(room.price);
  const currency = room.currency || "USD";
  return currency === "USD" ? formatTlUsdPairFromUsd(price) : formatTlUsdPairFromTl(price);
}

function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getLowestPrice(rooms: NormalizedRoom[]): number {
  let min = Infinity;
  for (const r of rooms) {
    const p = parsePriceToNumber(r.price);
    if (p > 0 && p < min) min = p;
  }
  return min === Infinity ? 0 : min;
}

/* ────────── Sub-Components ────────── */

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

function RoomCard({
  room,
  index,
  isSelected,
  onSelect,
  nightCount,
}: {
  room: NormalizedRoom;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  nightCount: number;
}) {
  const rateId = room.rateId || "";
  const roomName = translateRoomName(room.roomName || "Oda");
  const boardBasis = translateBoardBasis(room.boardBasis || "Standart");
  const priceNumber = parsePriceToNumber(room.price);
  const refundable = room.refundable;
  const maxAdults = room.maxAdults || "";
  const maxChildren = room.maxChildren || "";
  const leftToSell = room.leftToSell || "";
  const leftNum = Number(leftToSell);
  const perNight = nightCount > 0 ? priceNumber / nightCount : priceNumber;

  return (
    <button
      key={`${rateId || "rate"}-${index}`}
      type="button"
      onClick={onSelect}
      className={`group w-full text-left border-2 rounded-2xl p-5 transition-all duration-200 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-100"
          : "border-slate-200 hover:border-emerald-300 hover:shadow-sm bg-white"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BedDouble className={`w-5 h-5 shrink-0 ${isSelected ? "text-emerald-600" : "text-slate-400"}`} />
            <h4 className="font-semibold text-slate-900 truncate">{roomName}</h4>
          </div>

          {/* Board basis & capacity */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[11px] gap-1">
              <Utensils className="w-3 h-3" /> {boardBasis}
            </Badge>
            {maxAdults && (
              <Badge variant="secondary" className="text-[11px] gap-1">
                <Users className="w-3 h-3" /> {maxAdults} yetişkin{maxChildren && Number(maxChildren) > 0 ? ` + ${maxChildren} çocuk` : ""}
              </Badge>
            )}
          </div>

          {/* Refund & availability */}
          <div className="flex flex-wrap items-center gap-3 mt-2.5">
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${refundable ? "text-emerald-600" : "text-orange-600"}`}>
              {refundable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {refundable ? "Ücretsiz iptal" : "İade kısıtlı"}
            </span>
            {leftNum > 0 && leftNum <= 5 && (
              <span className="text-xs font-medium text-red-500">Son {leftNum} oda!</span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500 mb-0.5">{nightCount} gece toplam</p>
          <p className="text-lg font-bold text-emerald-700">{formatPrice(room)}</p>
          {nightCount > 1 && (
            <p className="text-xs text-slate-500">{formatTlUsdPairFromUsd(perNight)} / gece</p>
          )}
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-emerald-200 text-sm text-emerald-700 font-medium">
          <Check className="w-4 h-4" /> Bu oda seçildi
        </div>
      )}
    </button>
  );
}

function BookingFormSection({
  form,
  setForm,
  submitBooking,
  bookingMutation,
  bookingError,
  bookingMessage,
  selectedRoom,
  nightCount,
}: {
  form: BookingPayload;
  setForm: React.Dispatch<React.SetStateAction<BookingPayload>>;
  submitBooking: (e: FormEvent<HTMLFormElement>) => void;
  bookingMutation: { isPending: boolean };
  bookingError: string | null;
  bookingMessage: string | null;
  selectedRoom: NormalizedRoom | undefined;
  nightCount: number;
}) {
  const inputClass =
    "w-full h-11 rounded-xl border border-slate-300 px-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all";

  return (
    <form className="space-y-4" onSubmit={submitBooking}>
      {/* Price summary */}
      {selectedRoom && (
        <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-emerald-100/50 p-4">
          <p className="text-xs font-medium text-emerald-600 mb-1">Seçilen Oda</p>
          <p className="font-semibold text-slate-900 text-sm">{selectedRoom.roomName || "Oda"}</p>
          <p className="text-xs text-slate-600 mt-0.5">{selectedRoom.boardBasis || "Standart"}</p>
          <div className="mt-2 pt-2 border-t border-emerald-200/60">
            <p className="text-xs text-slate-500">{nightCount} gece toplam</p>
            <p className="text-xl font-bold text-emerald-700">{formatPrice(selectedRoom)}</p>
          </div>
        </div>
      )}

      {/* Passenger info */}
      <div>
        <p className="text-sm font-semibold text-slate-800 mb-2">Yolcu Bilgileri</p>
        <div className="space-y-2.5">
          <div className="grid grid-cols-4 gap-2">
            <select
              className="h-11 rounded-xl border border-slate-300 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            >
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
            </select>
            <input
              className={`col-span-3 ${inputClass}`}
              placeholder="Ad"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
            />
          </div>
          <input
            className={inputClass}
            placeholder="Soyad"
            value={form.lastName}
            onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
          />
          <input
            type="email"
            className={inputClass}
            placeholder="E-posta"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="TC Kimlik / Vergi No"
            value={form.identityTaxNumber}
            onChange={(e) => setForm((p) => ({ ...p, identityTaxNumber: e.target.value }))}
          />
        </div>
      </div>

      {/* Card info */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-500" /> Kart Bilgileri
        </p>
        <div className="space-y-2.5">
          <input
            className={inputClass}
            placeholder="Kart Üzerindeki İsim"
            value={form.cardHolderName}
            onChange={(e) => setForm((p) => ({ ...p, cardHolderName: e.target.value }))}
          />
          <input
            className={inputClass}
            placeholder="Kart Numarası"
            maxLength={19}
            value={form.cardNumber}
            onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className={inputClass}
              placeholder="Ay (MM)"
              maxLength={2}
              value={form.cardExpireMonth}
              onChange={(e) => setForm((p) => ({ ...p, cardExpireMonth: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="Yıl (YY)"
              maxLength={2}
              value={form.cardExpireYear}
              onChange={(e) => setForm((p) => ({ ...p, cardExpireYear: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="CVV"
              maxLength={4}
              type="password"
              value={form.cardCvv}
              onChange={(e) => setForm((p) => ({ ...p, cardCvv: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Special requests */}
      <textarea
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
        rows={3}
        placeholder="Özel talepler (opsiyonel)"
        value={form.specialRequests}
        onChange={(e) => setForm((p) => ({ ...p, specialRequests: e.target.value }))}
      />

      {bookingError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{bookingError}</p>
        </div>
      )}
      {bookingMessage && (
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-700">{bookingMessage}</p>
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={bookingMutation.isPending}>
        <CreditCard className="w-5 h-5 mr-2" />
        {bookingMutation.isPending ? "İşleniyor..." : "Ödeme Adımına Geç"}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield className="w-3.5 h-3.5" />
        <span>KuveytTürk 3D Secure ile güvenli ödeme</span>
      </div>
    </form>
  );
}

/* ────────── Main Page ────────── */

export default function HotelDetailPage() {
  const hotelId = useRouteId();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const bookingRef = useRef<HTMLDivElement>(null);
  const checkIn = searchParams.get("checkIn") || DEFAULT_CHECK_IN;
  const checkOut = searchParams.get("checkOut") || DEFAULT_CHECK_OUT;
  const adults = Number(searchParams.get("adults") || "2");
  const cityCode = Number(searchParams.get("cityCode") || "164"); // Mekke default
  const hotelNameFromUrl = searchParams.get("hotelName") || "";
  const hotelAddressFromUrl = searchParams.get("hotelAddress") || "";
  // Validate image URL - reject Unsplash URLs, accept data URLs
  const rawImageParam = searchParams.get("image");
  const isValidImageUrl = rawImageParam &&
    (rawImageParam.startsWith("http") || rawImageParam.startsWith("data:")) &&
    !rawImageParam.includes("source.unsplash.com") &&
    !rawImageParam.includes("unsplash.com");
  
  // Use city fallback image if no valid image provided
  const hotelImage = isValidImageUrl
    ? rawImageParam
    : getCityFallbackImage(cityCode, hotelId);
  const starsFromUrl = Number(searchParams.get("stars") || "0");

  const [selectedRateId, setSelectedRateId] = useState("");
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showAllRooms, setShowAllRooms] = useState(false);

  const [form, setForm] = useState<BookingPayload>({
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    identityTaxNumber: "",
    cardHolderName: "",
    cardNumber: "",
    cardExpireMonth: "",
    cardExpireYear: "",
    cardCvv: "",
    specialRequests: "",
  });

  // Fetch hotel details including all images
  const hotelDetailQuery = useQuery({
    queryKey: ["hotelDetail", hotelId],
    enabled: Boolean(hotelId),
    queryFn: async () => {
      const response = await axios.get<HotelDetailResponse>(
        `/api/hotels/${hotelId}`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get unique images from API or fallback to URL param image
  const hotelImages = useMemo(() => {
    const apiImages = hotelDetailQuery.data?.data?.images || [];
    if (apiImages.length > 0) {
      return apiImages;
    }
    // Fallback to single image from URL params
    return [hotelImage];
  }, [hotelDetailQuery.data, hotelImage]);

  // Use API data for hotel details, fallback to URL params
  const hotelName = useMemo(() => {
    const apiName = hotelDetailQuery.data?.data?.hotelName;
    if (apiName && apiName.trim() && !apiName.startsWith("Otel #")) {
      return apiName;
    }
    // Only use URL param if it's not empty and not the hotel ID
    if (hotelNameFromUrl && hotelNameFromUrl !== hotelId) {
      return hotelNameFromUrl;
    }
    // If API is loading, return empty to show skeleton
    return "";
  }, [hotelDetailQuery.data, hotelNameFromUrl, hotelId]);

  const hotelAddress = useMemo(() => {
    const apiAddress = hotelDetailQuery.data?.data?.address || hotelDetailQuery.data?.data?.fullAddress?.hotelStreetAddress;
    if (apiAddress && apiAddress.trim()) {
      return apiAddress;
    }
    // Only use URL param if it's not empty
    if (hotelAddressFromUrl && hotelAddressFromUrl.trim()) {
      return hotelAddressFromUrl;
    }
    // If API is loading, return empty to show skeleton
    return "";
  }, [hotelDetailQuery.data, hotelAddressFromUrl]);

  const stars = useMemo(() => {
    const apiStars = hotelDetailQuery.data?.data?.stars;
    if (apiStars && Number(apiStars) > 0) {
      return Number(apiStars);
    }
    // Only use URL param if it's valid
    if (starsFromUrl > 0) {
      return starsFromUrl;
    }
    // If API is loading, return 0 to hide stars
    return 0;
  }, [hotelDetailQuery.data, starsFromUrl]);

  const nightCount = useMemo(() => {
    if (checkIn && checkOut) {
      return calculateNights(checkIn, checkOut);
    }
    // Default to 1 night if dates not provided
    return 1;
  }, [checkIn, checkOut]);

  const cityName = useMemo(() => {
    return hotelDetailQuery.data?.data?.cityName || searchParams.get("cityName") || "";
  }, [hotelDetailQuery.data, searchParams]);

  const countryName = useMemo(() => {
    return hotelDetailQuery.data?.data?.countryName || searchParams.get("countryName") || "";
  }, [hotelDetailQuery.data, searchParams]);

  const geoPoint = useMemo(() => {
    return hotelDetailQuery.data?.data?.geoPoint || undefined;
  }, [hotelDetailQuery.data]);

  const checkInTime = useMemo(() => {
    return hotelDetailQuery.data?.data?.checkInTime || "";
  }, [hotelDetailQuery.data]);

  const checkOutTime = useMemo(() => {
    return hotelDetailQuery.data?.data?.checkOutTime || "";
  }, [hotelDetailQuery.data]);

  const description = useMemo(() => {
    return hotelDetailQuery.data?.data?.description || "";
  }, [hotelDetailQuery.data]);

  const roomsQuery = useQuery({
    queryKey: ["hotelRooms", hotelId, checkIn, checkOut, adults, cityCode],
    enabled: Boolean(hotelId),
    queryFn: async () => {
      const response = await axios.post<RoomsResponse>(
        `/api/hotels/${hotelId}/rooms`,
        {
          checkIn,
          checkOut,
          rooms: [{ adults, children: 0, childAges: [] }],
          nationality: 5,
          currency: 520,
        }
      );
      return response.data;
    },
  });

  const roomItems = useMemo(() => roomsQuery.data?.data?.rooms ?? [], [roomsQuery.data]);

  const selectedRoom = useMemo(
    () => roomItems.find((item) => item.rateId === selectedRateId),
    [roomItems, selectedRateId],
  );
  const lowestPrice = useMemo(() => getLowestPrice(roomItems), [roomItems]);
  const visibleRooms = showAllRooms ? roomItems : roomItems.slice(0, 6);

  const handleSelectRoom = useCallback(
    (rateId: string) => {
      setSelectedRateId(rateId);
      setBookingError(null);
      // On mobile, scroll to booking form
      if (window.innerWidth < 1280) {
        setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    },
    [],
  );

  const bookingMutation = useMutation({
    mutationFn: async () => {
      const selected = roomItems.find((item) => item.rateId === selectedRateId);
      const amount = parsePriceToNumber(selected?.price);
      const currency = selected?.currency || "USD";
      const roomTypeCode = selected?.roomTypeCode || "";
      const allocationDetails = selected?.allocationDetails || "";

      // Extract raw rate basis ID from composite rateId (format: "roomTypeCode_rateBasisId")
      const compositeId = selected?.rateId || "";
      const rawRateBasis = roomTypeCode && compositeId.startsWith(roomTypeCode + "_")
        ? compositeId.slice(roomTypeCode.length + 1)
        : compositeId;

      if (amount <= 0) {
        throw new Error("Ödeme tutarı hesaplanamadı. Lütfen farklı bir oda seçin.");
      }

      if (!roomTypeCode || !allocationDetails) {
        throw new Error("Oda bilgileri eksik. Lütfen farklı bir oda seçin.");
      }

      // Step 1: Block the room (15-minute hold via V4 getrooms with roomTypeSelected)
      const blockResponse = await axios.post(`/api/hotels/${hotelId}/block`, {
        checkIn,
        checkOut,
        rooms: [{ adults, children: 0, childAges: [] }],
        roomTypeCode,
        selectedRateBasis: rawRateBasis,
        allocationDetails,
        nationality: 5,
        currency: 520,
      });

      const blockId = findFirstStringByKeys(blockResponse.data, [
        "blockid",
        "@_blockid",
        "block_id",
      ]);

      if (!blockId) {
        throw new Error("Block ID alınamadı. Lütfen farklı bir oda seçin.");
      }

      // Step 2: Confirm booking with V4 confirmbooking command
      const salutationMap: Record<string, number> = { Mr: 1, Mrs: 2, Ms: 3, Miss: 4 };
      const paymentOrderId = generatePaymentOrderId();

      const bookingResponse = await axios.post(`/api/hotels/${hotelId}/booking`, {
        checkIn,
        checkOut,
        currency: 520,
        customerReference: paymentOrderId,
        roomTypeCode,
        selectedRateBasis: rawRateBasis,
        allocationDetails,
        adults,
        childrenAges: [],
        leadPassenger: {
          title: form.title,
          salutation: salutationMap[form.title] ?? 1,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        },
      });

      if (isAuthenticated && user?.id) {
        await createReservation({
          userId: user.id,
          type: "hotel",
          itemId: hotelId,
          title: `Otel Rezervasyonu - ${hotelName}`,
          subtitle: `${checkIn} - ${checkOut}`,
          imageUrl: hotelImage,
          startDate: new Date(checkIn),
          endDate: new Date(checkOut),
          quantity: 1,
          people: adults,
          price: amount,
          currency,
          status: "pending",
          paymentOrderId,
          paymentStatus: "initiated",
          userPhone: form.phone,
          userEmail: form.email,
          notes: form.specialRequests || undefined,
          meta: {
            blockId,
            rateId: selectedRateId,
            bookingResponse: bookingResponse.data,
            hotelName,
            hotelAddress,
          },
        });
      }

      const paymentResponse = await axios.post("/api/payment/kuveytturk/initiate", {
        merchantOrderId: paymentOrderId,
        amount,
        currency,
        identityTaxNumber: form.identityTaxNumber,
        email: form.email,
        phoneNumber: form.phone,
        card: {
          cardHolderName: form.cardHolderName,
          cardNumber: form.cardNumber,
          cardExpireMonth: form.cardExpireMonth,
          cardExpireYear: form.cardExpireYear,
          cardCvv: form.cardCvv,
        },
      });

      return paymentResponse.data as { success: boolean; paymentHtml: string; orderId: string };
    },
    onSuccess: (data) => {
      setBookingError(null);
      const paymentWindow = window.open("", "_blank");
      if (!paymentWindow) {
        setBookingError("Ödeme penceresi açılamadı. Lütfen popup engelleyiciyi kapatıp tekrar deneyin.");
        return;
      }
      paymentWindow.document.open();
      paymentWindow.document.write(data.paymentHtml);
      paymentWindow.document.close();
      setBookingMessage("3D Secure ödeme penceresi açıldı. Ödeme sonrası sonuç ekranına yönlendirileceksiniz.");
    },
    onError: (error) => {
      setBookingMessage(null);
      setBookingError(error instanceof Error ? error.message : "Rezervasyon işlemi tamamlanamadı.");
    },
  });

  const submitBooking = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedRateId) {
        setBookingError("Lütfen bir oda seçin.");
        return;
      }
      if (!form.firstName || !form.lastName || !form.email || !form.phone) {
        setBookingError("Lütfen yolcu bilgilerini eksiksiz doldurun.");
        return;
      }
      if (
        !form.identityTaxNumber ||
        !form.cardHolderName ||
        !form.cardNumber ||
        !form.cardExpireMonth ||
        !form.cardExpireYear ||
        !form.cardCvv
      ) {
        setBookingError("Lütfen ödeme bilgilerini eksiksiz doldurun.");
        return;
      }
      bookingMutation.mutate();
    },
    [selectedRateId, form, bookingMutation],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ───── Hero / Image Section ───── */}
      <section className="relative bg-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={hotelImage}
            alt={hotelName}
            className="w-full h-full object-cover opacity-40 blur-sm scale-105"
            onError={(e) => { e.currentTarget.src = HOTEL_PLACEHOLDER; }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
          <Link
            href="/hotels"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Otel listesine dön
          </Link>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Image Gallery - Interactive */}
            <div className="lg:col-span-3">
              <HotelImageGallery
                images={hotelImages}
                hotelName={hotelName}
                cityCode={cityCode}
                hotelId={hotelId}
              />
            </div>

            {/* Hotel Info Card */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white">
                {/* Loading Skeleton for Hotel Name */}
                {hotelDetailQuery.isLoading && !hotelName ? (
                  <div className="space-y-3 mb-3">
                    <div className="h-8 bg-white/20 rounded-lg animate-pulse w-3/4" />
                    <div className="h-4 bg-white/20 rounded animate-pulse w-1/2" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
                      {hotelName || "Otel yükleniyor..."}
                    </h1>
                    {stars > 0 && <div className="mb-3"><StarRating count={stars} /></div>}
                  </>
                )}
                <div className="flex items-start gap-2 text-white/80 text-sm mb-4">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{hotelAddress || "Adres yükleniyor..."}</span>
                </div>

                {/* Check-in/out info */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-white/50 mb-0.5">Giriş</p>
                    <p className="font-semibold text-sm">{checkIn || "Tarih seçin"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-0.5">Çıkış</p>
                    <p className="font-semibold text-sm">{checkOut || "Tarih seçin"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-0.5">Süre</p>
                    <p className="font-semibold text-sm">{nightCount} gece</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-0.5">Misafir</p>
                    <p className="font-semibold text-sm">{adults} yetişkin</p>
                  </div>
                </div>

                {/* Lowest price */}
                {lowestPrice > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50">Başlangıç fiyatı</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatTlUsdPairFromUsd(lowestPrice)}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">{nightCount} gece toplam</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Quick Info Bar ───── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 py-3 overflow-x-auto text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <CalendarDays className="w-4 h-4 text-emerald-600" /> {checkIn} → {checkOut}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Users className="w-4 h-4 text-emerald-600" /> {adults} Yetişkin
            </span>
            {roomItems.length > 0 && (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <BedDouble className="w-4 h-4 text-emerald-600" /> {roomItems.length} oda seçeneği
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ───── Main Content ───── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {roomsQuery.isLoading && (
          <LoadingState title="Odalar yükleniyor" description="Uygun oda seçenekleri hazırlanıyor..." />
        )}

        {/* Error */}
        {roomsQuery.isError && (
          <ErrorState
            title="Oda bilgisi alınamadı"
            description="Lütfen tekrar deneyin veya farklı tarih seçin."
            onRetry={() => roomsQuery.refetch()}
          />
        )}

        {/* Empty */}
        {!roomsQuery.isLoading && !roomsQuery.isError && roomItems.length === 0 && (
          <EmptyState title="Uygun oda bulunamadı" description="Seçtiğiniz tarihlerde uygun oda kalmamış olabilir. Farklı tarih veya otel deneyin." />
        )}

        {/* Hotel Details Content */}
        {!roomsQuery.isLoading && !roomsQuery.isError && roomItems.length > 0 && (
          <div className="space-y-8">
            {/* Hotel Info & Amenities Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              <HotelInfoSection
                hotelName={hotelName}
                address={hotelAddress}
                stars={stars}
                description={description}
                checkInTime={checkInTime}
                checkOutTime={checkOutTime}
                cityName={cityName || undefined}
                countryName={countryName || undefined}
              />
              <HotelAmenities />
            </div>

            {/* Rooms + Booking Section */}
            <div className="grid xl:grid-cols-3 gap-8">
              {/* Left: Room List */}
              <div className="xl:col-span-2 space-y-6">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Oda Seçenekleri</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {roomItems.length} farklı seçenek bulundu — birini seçerek rezervasyona geçin
                    </p>
                  </div>
                </div>

                {/* Room cards */}
                <div className="space-y-3">
                  {visibleRooms.map((room, index) => (
                    <RoomCard
                      key={`${room.rateId || "rate"}-${index}`}
                      room={room}
                      index={index}
                      isSelected={selectedRateId === (room.rateId || "")}
                      onSelect={() => handleSelectRoom(room.rateId || "")}
                      nightCount={nightCount}
                    />
                  ))}
                </div>

                {/* Show more / less */}
                {roomItems.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllRooms((v) => !v)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    {showAllRooms ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Daha az göster
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Tümünü göster ({roomItems.length} oda)
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Right: Sticky Booking Form */}
              <div ref={bookingRef} className="xl:col-span-1">
                <div className="xl:sticky xl:top-6">
                  <Card className="border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-slate-900">Rezervasyon & Ödeme</CardTitle>
                      <p className="text-xs text-slate-500">Bilgileri doldurup güvenli ödeme adımına geçin</p>
                    </CardHeader>
                    <CardContent>
                      <BookingFormSection
                        form={form}
                        setForm={setForm}
                        submitBooking={submitBooking}
                        bookingMutation={bookingMutation}
                        bookingError={bookingError}
                        bookingMessage={bookingMessage}
                        selectedRoom={selectedRoom}
                        nightCount={nightCount}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Location */}
            <HotelLocation
              address={hotelAddress}
              cityCode={cityCode}
              lat={geoPoint?.lat ? parseFloat(geoPoint.lat) : undefined}
              lng={geoPoint?.lng ? parseFloat(geoPoint.lng) : undefined}
            />

            {/* Reviews */}
            <HotelReviews
              hotelId={hotelId}
              hotelName={hotelName}
              googleRating={parseFloat(searchParams.get("googleRating") || "0") || undefined}
              googleReviewCount={parseInt(searchParams.get("googleReviewCount") || "0") || undefined}
              googlePlaceId={searchParams.get("googlePlaceId") || undefined}
            />

            {/* Similar Hotels */}
            <SimilarHotels
              hotels={[]}
              cityCode={cityCode}
              checkIn={checkIn}
              checkOut={checkOut}
              adults={adults}
              currentHotelId={hotelId}
            />
          </div>
        )}
      </section>
    </div>
  );
}
