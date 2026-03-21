"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTlUsdPairFromTl, formatTlUsdPairFromUsd } from "@/lib/currency";
import type { NormalizedRoom } from "@/lib/webbeds/types";
import type { HotelSearchParams } from "@/types/hotel-booking";
import { calculateNights } from "@/types/hotel-booking";
import {
    BedDouble,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Users,
    Utensils,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface RoomSelectionStepProps {
  rooms: NormalizedRoom[];
  selectedRateId: string;
  onSelectRoom: (room: NormalizedRoom) => void;
  searchParams: HotelSearchParams;
}

export function RoomSelectionStep({
  rooms,
  selectedRateId,
  onSelectRoom,
  searchParams,
}: RoomSelectionStepProps) {
  const [showAll, setShowAll] = useState(false);
  const nightCount = calculateNights(searchParams.checkIn, searchParams.checkOut);
  const visibleRooms = showAll ? rooms : rooms.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Oda Seçimi</h2>
        <p className="text-sm text-slate-500 mt-1">
          {rooms.length} oda seçeneği bulundu — birini seçerek devam edin
        </p>
      </div>

      {/* Room cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {visibleRooms.map((room, index) => (
          <RoomCard
            key={`${room.rateId || "rate"}-${index}`}
            room={room}
            nightCount={nightCount}
            isSelected={selectedRateId === (room.rateId || "")}
            onSelect={() => onSelectRoom(room)}
          />
        ))}
      </div>

      {/* Show more / less */}
      {rooms.length > 6 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" /> Daha az göster
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Tümünü göster ({rooms.length}{" "}
              oda)
            </>
          )}
        </button>
      )}
    </div>
  );
}

/* ────────── Room Card ────────── */

function RoomCard({
  room,
  nightCount,
  isSelected,
  onSelect,
}: {
  room: NormalizedRoom;
  nightCount: number;
  isSelected: boolean;
  onSelect: () => void;
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
  const currency = room.currency || "USD";

  const formattedPrice = useMemo(() => {
    return currency === "USD"
      ? formatTlUsdPairFromUsd(priceNumber)
      : formatTlUsdPairFromTl(priceNumber);
  }, [priceNumber, currency]);

  const formattedPerNight = useMemo(() => {
    return currency === "USD"
      ? formatTlUsdPairFromUsd(perNight)
      : formatTlUsdPairFromTl(perNight);
  }, [perNight, currency]);

  return (
    <div
      className={`group border-2 rounded-2xl p-5 transition-all duration-200 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-100"
          : "border-slate-200 hover:border-emerald-300 hover:shadow-sm bg-white"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <BedDouble
              className={`w-5 h-5 shrink-0 ${
                isSelected ? "text-emerald-600" : "text-slate-400"
              }`}
            />
            <h4 className="font-semibold text-slate-900 truncate">
              {roomName}
            </h4>
          </div>

          {/* Board basis & capacity */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[11px] gap-1">
              <Utensils className="w-3 h-3" /> {boardBasis}
            </Badge>
            {maxAdults && (
              <Badge variant="secondary" className="text-[11px] gap-1">
                <Users className="w-3 h-3" /> {maxAdults} yetişkin
                {maxChildren && Number(maxChildren) > 0
                  ? ` + ${maxChildren} çocuk`
                  : ""}
              </Badge>
            )}
          </div>

          {/* Refund & availability */}
          <div className="flex flex-wrap items-center gap-3 mt-2.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                refundable ? "text-emerald-600" : "text-orange-600"
              }`}
            >
              {refundable ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {refundable ? "Ücretsiz iptal" : "İade kısıtlı"}
            </span>
            {leftNum > 0 && leftNum <= 5 && (
              <span className="text-xs font-medium text-red-500">
                Son {leftNum} oda!
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500 mb-0.5">{nightCount} gece</p>
          <p className="text-lg font-bold text-emerald-700">{formattedPrice}</p>
          {nightCount > 1 && (
            <p className="text-xs text-slate-500">
              {formattedPerNight} / gece
            </p>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {isSelected ? (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
              <Check className="w-4 h-4" /> Bu oda seçildi
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={onSelect}
              className="text-xs px-4 py-2"
            >
              Devam Et →
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onSelect}
            className="w-full text-sm"
          >
            <BedDouble className="w-4 h-4 mr-2" />
            Seç ve Devam Et
          </Button>
        )}
      </div>
    </div>
  );
}

/* ────────── Helpers ────────── */

function parsePriceToNumber(rawPrice?: string): number {
  if (!rawPrice) return 0;
  const normalized = rawPrice.replace(/[^\d.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

function translateRoomName(roomName: string): string {
  const fullTranslations: Record<string, string> = {
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
    "Deluxe Room": "Deluxe Oda",
    "Deluxe King": "Deluxe King Yataklı Oda",
    "Deluxe Twin": "Deluxe İki Yataklı Oda",
    "Deluxe Double": "Deluxe Çift Kişilik Oda",
    "Deluxe Suite": "Deluxe Suite",
    "Superior Room": "Superior Oda",
    "Superior King": "Superior King Yataklı Oda",
    "Superior Twin": "Superior İki Yataklı Oda",
    "Executive Room": "Executive Oda",
    "Executive Suite": "Executive Suite",
    "Family Room": "Aile Odası",
    "Family Suite": "Aile Suite",
    Suite: "Suite",
    "Junior Suite": "Junior Suite",
  };

  if (fullTranslations[roomName]) {
    return fullTranslations[roomName];
  }

  const safeWords: Record<string, string> = {
    "Sea View": "Deniz Manzaralı",
    "City View": "Şehir Manzaralı",
    "Garden View": "Bahçe Manzaralı",
    "with Balcony": "Balkonlu",
    Quadruple: "Dört Kişilik",
    Triple: "Üç Yataklı",
    Double: "Çift Kişilik",
    Twin: "İki Yataklı",
    Single: "Tek Kişilik",
    Standard: "Standart",
    Room: "Oda",
    Suite: "Suite",
  };

  let translated = roomName;
  const sortedKeys = Object.keys(safeWords).sort(
    (a, b) => b.length - a.length
  );
  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    translated = translated.replace(regex, safeWords[key]);
  }
  return translated;
}

function translateBoardBasis(boardBasis: string): string {
  const translations: Record<string, string> = {
    "Room Only": "Sadece Oda",
    "Bed and Breakfast": "Kahvaltı Dahil",
    "Half Board": "Yarım Pansiyon",
    "Full Board": "Tam Pansiyon",
    "All Inclusive": "Her Şey Dahil",
    "Ultra All Inclusive": "Ultra Her Şey Dahil",
    "Self Catering": "Kendi Yemeğini Kendin Yap",
  };
  return translations[boardBasis] || boardBasis;
}
