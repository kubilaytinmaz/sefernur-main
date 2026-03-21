"use client";

/**
 * Otel Rezervasyon Sayfası - 2 Aşamalı Akış
 * Adım 1: Oda Seçimi
 * Adım 2: Bilgiler & Ödeme (tek ekran)
 */

import {
  BookingStepper,
  BookingSummaryCard,
  CheckoutStep,
  HotelBookingHeader,
  RoomSelectionStep,
} from "@/components/hotels/booking";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { createReservation } from "@/lib/firebase/reservations";
import { getCityFallbackImage } from "@/lib/hotels/city-images";
import type { NormalizedRoom } from "@/lib/webbeds/types";
import { useAuthStore } from "@/store/auth";
import type {
  BookingStep,
  CheckoutFormData,
  FormError,
  HotelBasicInfo,
  HotelSearchParams,
  SelectedRoomInfo
} from "@/types/hotel-booking";
import {
  calculateNights,
  normalizedRoomToSelectedRoom,
  validateCheckoutForm,
} from "@/types/hotel-booking";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

// Default dates
const DEFAULT_CHECK_IN = format(new Date(), "yyyy-MM-dd");
const DEFAULT_CHECK_OUT = format(
  (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  })(),
  "yyyy-MM-dd"
);

/* ────────── Helpers ────────── */

function parsePriceToNumber(rawPrice?: string): number {
  if (!rawPrice) return 0;
  const normalized = rawPrice.replace(/[^\d.]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
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

/* ────────── Main Component ────────── */

export default function HotelBookingClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  // Parse URL parameters
  const urlData = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const hotelSlug = segments.length >= 2 ? segments[1] || "" : "";

    // Extract hotel ID from slug (format: hotel-name-12345)
    const slugParts = hotelSlug.split("-");
    const hotelId = slugParts.length > 1 ? slugParts[slugParts.length - 1] : "";

    return {
      hotelSlug,
      hotelId,
      checkIn: searchParams.get("checkIn") || DEFAULT_CHECK_IN,
      checkOut: searchParams.get("checkOut") || DEFAULT_CHECK_OUT,
      adults: Number(searchParams.get("adults") || "2"),
      cityCode: Number(searchParams.get("cityCode") || "164"),
      hotelName: searchParams.get("hotelName") || "",
      hotelImage: searchParams.get("hotelImage") || "",
      hotelAddress: searchParams.get("hotelAddress") || "",
      stars: Number(searchParams.get("stars") || "0"),
      preselectRoom: searchParams.get("preselectRoom") || "",
    };
  }, [pathname, searchParams]);

  // State - Eğer oda ön-seçili gelirse direkt checkout adımından başla
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    urlData.preselectRoom ? "checkout" : "room"
  );
  const [selectedRateId, setSelectedRateId] = useState(urlData.preselectRoom);
  const [formData, setFormData] = useState<CheckoutFormData>({
    guestInfo: {
      title: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      identityTaxNumber: "",
    },
    paymentInfo: {
      cardHolderName: "",
      cardNumber: "",
      cardExpireMonth: "",
      cardExpireYear: "",
      cardCvv: "",
    },
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  // Hotel info
  const hotelInfo: HotelBasicInfo = useMemo(() => ({
    hotelId: urlData.hotelId,
    hotelName: urlData.hotelName,
    hotelImage: urlData.hotelImage || getCityFallbackImage(urlData.cityCode, urlData.hotelId),
    address: urlData.hotelAddress,
    stars: urlData.stars,
    cityCode: urlData.cityCode,
  }), [urlData]);

  // Search params
  const searchParamsData: HotelSearchParams = useMemo(() => ({
    checkIn: urlData.checkIn,
    checkOut: urlData.checkOut,
    adults: urlData.adults,
    cityCode: urlData.cityCode,
  }), [urlData]);

  // Fetch hotel details
  const hotelDetailQuery = useQuery({
    queryKey: ["hotelDetail", urlData.hotelId],
    enabled: Boolean(urlData.hotelId),
    queryFn: async () => {
      const response = await axios.get(`/api/hotels/${urlData.hotelId}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch rooms
  const roomsQuery = useQuery({
    queryKey: ["hotelRooms", urlData.hotelId, urlData.checkIn, urlData.checkOut, urlData.adults],
    enabled: Boolean(urlData.hotelId),
    queryFn: async () => {
      const response = await axios.post(`/api/hotels/${urlData.hotelId}/rooms`, {
        checkIn: urlData.checkIn,
        checkOut: urlData.checkOut,
        rooms: [{ adults: urlData.adults, children: 0, childAges: [] }],
        nationality: 5,
        currency: 520,
      });
      return response.data;
    },
  });

  // Derived data
  const rooms = useMemo(() => roomsQuery.data?.data?.rooms ?? [], [roomsQuery.data]);
  const selectedRoom = useMemo(
    () => rooms.find((r: NormalizedRoom) => r.rateId === selectedRateId) || null,
    [rooms, selectedRateId]
  );
  const selectedRoomInfo: SelectedRoomInfo | null = useMemo(
    () => (selectedRoom ? normalizedRoomToSelectedRoom(selectedRoom) : null),
    [selectedRoom]
  );
  const nightCount = useMemo(
    () => calculateNights(urlData.checkIn, urlData.checkOut),
    [urlData.checkIn, urlData.checkOut]
  );

  // Update hotel info from API
  const updatedHotelInfo: HotelBasicInfo = useMemo(() => {
    const apiData = hotelDetailQuery.data?.data;
    if (apiData) {
      return {
        ...hotelInfo,
        hotelName: apiData.hotelName || hotelInfo.hotelName,
        hotelImage: apiData.images?.[0] || hotelInfo.hotelImage,
        address: apiData.address || apiData.fullAddress?.hotelStreetAddress || hotelInfo.address,
        stars: Number(apiData.stars) || hotelInfo.stars,
        cityName: apiData.cityName,
      };
    }
    return hotelInfo;
  }, [hotelDetailQuery.data, hotelInfo]);

  // Handlers
  const handleSelectRoom = useCallback((room: NormalizedRoom) => {
    setSelectedRateId(room.rateId || "");
    setFormErrors([]);
    setBookingError(null);
    // Auto-advance to checkout step
    setCurrentStep("checkout");
  }, []);

  const handleBackToRoomSelection = useCallback(() => {
    setCurrentStep("room");
  }, []);

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRoom || !selectedRoomInfo) {
        throw new Error("Lütfen bir oda seçin.");
      }

      // Validate form
      const errors = validateCheckoutForm(formData);
      if (errors.length > 0) {
        setFormErrors(errors);
        throw new Error("Lütfen form hatalarını düzeltin.");
      }

      const amount = parsePriceToNumber(selectedRoom.price);
      const currency = selectedRoom.currency || "USD";
      const roomTypeCode = selectedRoom.roomTypeCode || "";
      const allocationDetails = selectedRoom.allocationDetails || "";

      // Extract raw rate basis ID from composite rateId
      const compositeId = selectedRoom.rateId || "";
      const rawRateBasis = roomTypeCode && compositeId.startsWith(roomTypeCode + "_")
        ? compositeId.slice(roomTypeCode.length + 1)
        : compositeId;

      if (amount <= 0) {
        throw new Error("Ödeme tutarı hesaplanamadı. Lütfen farklı bir oda seçin.");
      }

      if (!roomTypeCode || !allocationDetails) {
        throw new Error("Oda bilgileri eksik. Lütfen farklı bir oda seçin.");
      }

      setBookingError(null);
      setBookingMessage("Oda bloklanıyor...");

      // Step 1: Block the room
      const blockResponse = await axios.post(`/api/hotels/${urlData.hotelId}/block`, {
        checkIn: urlData.checkIn,
        checkOut: urlData.checkOut,
        rooms: [{ adults: urlData.adults, children: 0, childAges: [] }],
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

      setBookingMessage("Rezervasyon oluşturuluyor...");

      // Step 2: Confirm booking
      const salutationMap: Record<string, number> = { Mr: 1, Mrs: 2, Ms: 3, Miss: 4 };
      const paymentOrderId = generatePaymentOrderId();

      const bookingResponse = await axios.post(`/api/hotels/${urlData.hotelId}/booking`, {
        checkIn: urlData.checkIn,
        checkOut: urlData.checkOut,
        currency: 520,
        customerReference: paymentOrderId,
        roomTypeCode,
        selectedRateBasis: rawRateBasis,
        allocationDetails,
        adults: urlData.adults,
        childrenAges: [],
        leadPassenger: {
          title: formData.guestInfo.title,
          salutation: salutationMap[formData.guestInfo.title] ?? 1,
          firstName: formData.guestInfo.firstName,
          lastName: formData.guestInfo.lastName,
          email: formData.guestInfo.email,
          phone: formData.guestInfo.phone,
        },
      });

      // Save reservation to Firebase
      if (isAuthenticated && user?.id) {
        await createReservation({
          userId: user.id,
          type: "hotel",
          itemId: urlData.hotelId,
          title: `Otel Rezervasyonu - ${updatedHotelInfo.hotelName}`,
          subtitle: `${urlData.checkIn} - ${urlData.checkOut}`,
          imageUrl: updatedHotelInfo.hotelImage,
          startDate: new Date(urlData.checkIn),
          endDate: new Date(urlData.checkOut),
          quantity: 1,
          people: urlData.adults,
          price: amount,
          currency: currency as "TRY" | "USD",
          status: "pending",
          paymentOrderId,
          paymentStatus: "initiated",
          userPhone: formData.guestInfo.phone,
          userEmail: formData.guestInfo.email,
          notes: formData.specialRequests || undefined,
          meta: {
            blockId,
            rateId: selectedRateId,
            bookingResponse: bookingResponse.data,
            hotelName: updatedHotelInfo.hotelName,
            hotelAddress: updatedHotelInfo.address,
          },
        });
      }

      setBookingMessage("Ödeme başlatılıyor...");

      // Step 3: Initiate payment
      const paymentResponse = await axios.post("/api/payment/kuveytturk/initiate", {
        merchantOrderId: paymentOrderId,
        amount,
        currency,
        identityTaxNumber: formData.guestInfo.identityTaxNumber,
        email: formData.guestInfo.email,
        phoneNumber: formData.guestInfo.phone,
        card: {
          cardHolderName: formData.paymentInfo.cardHolderName,
          cardNumber: formData.paymentInfo.cardNumber,
          cardExpireMonth: formData.paymentInfo.cardExpireMonth,
          cardExpireYear: formData.paymentInfo.cardExpireYear,
          cardCvv: formData.paymentInfo.cardCvv,
        },
      });

      return paymentResponse.data as { success: boolean; paymentHtml: string; orderId: string };
    },
    onSuccess: (data) => {
      setBookingError(null);
      setBookingMessage("3D Secure ödeme penceresi açılıyor...");

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

  const handleSubmitBooking = useCallback(() => {
    setFormErrors([]);
    bookingMutation.mutate();
  }, [bookingMutation]);

  // Loading state
  if (roomsQuery.isLoading || hotelDetailQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Rezervasyon hazırlanıyor" description="Oda seçenekleri yükleniyor..." />
      </div>
    );
  }

  // Error state
  if (roomsQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Oda bilgileri alınamadı"
          description="Lütfen tekrar deneyin veya farklı tarih seçin."
          onRetry={() => roomsQuery.refetch()}
        />
      </div>
    );
  }

  // Empty state
  if (!roomsQuery.isLoading && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState
          title="Uygun oda bulunamadı"
          description="Seçtiğiniz tarihlerde uygun oda kalmamış olabilir."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <HotelBookingHeader
        hotelName={updatedHotelInfo.hotelName}
        backUrl={`/hotels/${urlData.hotelId}?checkIn=${urlData.checkIn}&checkOut=${urlData.checkOut}&adults=${urlData.adults}&cityCode=${urlData.cityCode}`}
      />

      {/* Stepper */}
      <BookingStepper
        currentStep={currentStep}
        onStepClick={(step: BookingStep) => {
          if (step === "room") {
            setCurrentStep("room");
          }
        }}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Step Content */}
          <div className="lg:col-span-2">
            {currentStep === "room" && (
              <RoomSelectionStep
                rooms={rooms}
                selectedRateId={selectedRateId}
                onSelectRoom={handleSelectRoom}
                searchParams={searchParamsData}
              />
            )}

            {currentStep === "checkout" && selectedRoomInfo && (
              <CheckoutStep
                hotelName={updatedHotelInfo.hotelName}
                hotelImage={updatedHotelInfo.hotelImage}
                checkIn={urlData.checkIn}
                checkOut={urlData.checkOut}
                adults={urlData.adults}
                selectedRoom={selectedRoomInfo}
                formData={formData}
                onFormDataChange={setFormData}
                onBack={handleBackToRoomSelection}
                onSubmit={handleSubmitBooking}
                isProcessing={bookingMutation.isPending}
                errors={formErrors}
                bookingError={bookingError}
              />
            )}
          </div>

          {/* Right Column - Summary Card (Sticky) */}
          <div className="lg:col-span-1">
            <BookingSummaryCard
              hotel={updatedHotelInfo}
              searchParams={searchParamsData}
              selectedRoom={selectedRoomInfo}
              showTrustBadges={currentStep === "checkout"}
              showPriceBreakdown={currentStep === "checkout"}
            />
          </div>
        </div>
      </div>

      {/* Success Message Toast */}
      {bookingMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-lg max-w-sm">
            <p className="text-sm text-emerald-700">{bookingMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
