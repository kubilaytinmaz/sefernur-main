/**
 * BookingFormCard Component
 * Rezervasyon formu - Tarih, yolcu, iletişim, adres ve ödeme bölümleri
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { createReservation } from "@/lib/firebase/reservations";
import {
  calculateBookingPrice,
  createReservationSubtitle,
  createReservationTitle,
  getDefaultContact,
  getDefaultDateTime,
  getDefaultPassengers,
  getReservationType,
  getTotalPassengers,
  validateBookingForm,
} from "@/lib/transfers/booking";
import type { PopularService } from "@/lib/transfers/popular-services-simple";
import { useAuthStore } from "@/store/auth";
import type {
  AddressInfo,
  ContactInfo,
  DateTimeInfo,
  FlightInfo,
  FormError,
  PassengerInfo,
  PriceBreakdown,
} from "@/types/booking";
import type { TransferModel } from "@/types/transfer";
import { vehicleTypeLabels } from "@/types/transfer";
import { useMutation } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plane,
  Plus,
  Send,
  User,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

/* ────────── Types ────────── */

interface BookingFormCardProps {
  transfer: TransferModel;
  tour?: PopularService;
  extraTours?: PopularService[];
  onPriceChange?: (price: PriceBreakdown) => void;
  onPassengerChange?: (count: number) => void;
}

/* ────────── Section Toggle ────────── */

function SectionHeader({
  title,
  icon,
  isOpen,
  onToggle,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span className="text-cyan-600">{icon}</span>
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        {badge && (
          <Badge className="bg-cyan-100 text-cyan-700 border-0 text-xs">{badge}</Badge>
        )}
      </div>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-slate-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

/* ────────── Field Error ────────── */

function FieldError({ errors, field }: { errors: FormError[]; field: string }) {
  const error = errors.find((e) => e.field === field);
  if (!error) return null;
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <XCircle className="w-3 h-3" />
      {error.message}
    </p>
  );
}

/* ────────── Main Form ────────── */

export function BookingFormCard({ transfer, tour, extraTours = [], onPriceChange, onPassengerChange }: BookingFormCardProps) {
  const user = useAuthStore((state) => state.user);
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;

  // ── Form State ──
  const [dateTime, setDateTime] = useState<DateTimeInfo>(getDefaultDateTime());
  const [passengers, setPassengers] = useState<PassengerInfo>(getDefaultPassengers());
  const [luggageCount, setLuggageCount] = useState(1);
  const [childSeatNeeded, setChildSeatNeeded] = useState(false);
  const [contact, setContact] = useState<ContactInfo>(
    getDefaultContact(user ? { name: user.fullName || user.firstName || "", phone: user.phoneNumber || "", email: user.email || "" } : undefined)
  );
  const [addresses, setAddresses] = useState<AddressInfo>({ pickup: "", dropoff: "" });
  const [flightInfo, setFlightInfo] = useState<FlightInfo | undefined>();
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");

  // ── Section Toggles ──
  const [openSections, setOpenSections] = useState({
    dateTime: true,
    passengers: true,
    contact: true,
    address: false,
    flight: false,
    notes: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ── Form Validation ──
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitErrorMsg, setSubmitErrorMsg] = useState("");

  // Tüm turları birleştir (ana tur + ek turlar)
  const allTours = useMemo(() => {
    const tours: PopularService[] = [];
    if (tour) tours.push(tour);
    tours.push(...extraTours);
    return tours;
  }, [tour, extraTours]);

  // ── Price Calculation ── (çoklu tur desteği)
  const priceResult = useMemo(() => {
    // Ana tur ile temel fiyat hesapla
    const baseResult = calculateBookingPrice({
      transfer,
      tour,
      dateTime,
      passengers,
      luggageCount,
      childSeatNeeded,
      couponCode: couponCode.trim() || undefined,
    });

    // Ek turların fiyatlarını topla
    if (extraTours.length > 0) {
      let extraTourTotal = 0;
      for (const extraTour of extraTours) {
        if (extraTour.price.type === "per_person") {
          extraTourTotal += extraTour.price.baseAmount * getTotalPassengers(passengers);
        } else {
          extraTourTotal += extraTour.price.baseAmount;
        }
      }

      // Ek tur fiyatlarını mevcut sonuca ekle
      baseResult.price.tourPrice += extraTourTotal;
      baseResult.price.subtotal += extraTourTotal;
      baseResult.price.total += extraTourTotal;

      // Breakdown'a ek turları ekle
      for (const extraTour of extraTours) {
        const price = extraTour.price.type === "per_person"
          ? extraTour.price.baseAmount * getTotalPassengers(passengers)
          : extraTour.price.baseAmount;
        baseResult.price.breakdown.push(`Ek tur (${extraTour.name}): ${price}₺`);
      }
    }

    return baseResult;
  }, [transfer, tour, extraTours, dateTime, passengers, luggageCount, childSeatNeeded, couponCode]);

  useEffect(() => {
    onPriceChange?.(priceResult.price);
  }, [priceResult.price, onPriceChange]);

  const totalPassengers = getTotalPassengers(passengers);

  // Yolcu sayısı değiştiğinde parent'a bildir
  useEffect(() => {
    onPassengerChange?.(totalPassengers);
  }, [totalPassengers, onPassengerChange]);

  // ── Mutation ──
  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Giriş yapmanız gerekiyor");
      if (!contact.phone.trim()) throw new Error("Telefon numarası gerekli");
      if (!contact.name.trim()) throw new Error("Ad soyad gerekli");

      return createReservation({
        userId: user.id,
        type: getReservationType(tour || extraTours[0]),
        itemId: transfer.id || "",
        title: allTours.length > 1
          ? `${transfer.vehicleName || vehicleLabel} + ${allTours.length} Tur`
          : createReservationTitle(transfer, tour),
        subtitle: allTours.length > 1
          ? `${allTours.map(t => t.name).join(' + ')} • ${dateTime.pickupDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} • ${getTotalPassengers(passengers)} Yolcu`
          : createReservationSubtitle(transfer, tour, passengers, dateTime),
        imageUrl: transfer.images[0] || "",
        startDate: dateTime.pickupDate,
        endDate: dateTime.returnDate || dateTime.pickupDate,
        quantity: 1,
        people: totalPassengers,
        price: priceResult.price.total,
        currency: "TRY",
        status: "pending",
        userPhone: contact.phone,
        userEmail: contact.email,
        notes: [
          notes.trim(),
          allTours.length > 0 ? `Turlar: ${allTours.map(t => t.name).join(', ')}` : "",
          addresses.pickup ? `Alış: ${addresses.pickup}` : "",
          addresses.dropoff ? `Bırakış: ${addresses.dropoff}` : "",
          flightInfo?.flightNumber ? `Uçuş: ${flightInfo.flightNumber}` : "",
          `Saat: ${dateTime.pickupTime}`,
          `Yolcular: ${passengers.adults} yetişkin, ${passengers.children} çocuk, ${passengers.infants} bebek`,
          `Bagaj: ${luggageCount}`,
          childSeatNeeded ? "Çocuk koltuğu istendi" : "",
        ]
          .filter(Boolean)
          .join(" | "),
      });
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      setSubmitErrorMsg("");
    },
    onError: (error: Error) => {
      setSubmitErrorMsg(error.message);
    },
  });

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setSubmitErrorMsg("");

      const validation = validateBookingForm({
        formData: {
          transferId: transfer.id,
          transfer,
          tourId: tour?.id,
          tour,
          dateTime,
          passengers,
          luggageCount,
          childSeatNeeded,
          contact,
          addresses,
          flightInfo,
          notes,
          couponCode: couponCode.trim() || undefined,
          price: priceResult.price,
        },
      });

      if (!validation.isValid) {
        setFormErrors(validation.errors);
        return;
      }

      setFormErrors([]);
      reservationMutation.mutate();
    },
    [transfer, tour, dateTime, passengers, luggageCount, childSeatNeeded, contact, addresses, flightInfo, notes, couponCode, priceResult.price, reservationMutation]
  );

  // ── Success State ──
  if (submitSuccess) {
    return (
      <Card className="border-cyan-200 bg-cyan-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-cyan-900 mb-2">Rezervasyon Talebiniz Alındı!</h3>
          <p className="text-sm text-cyan-700 mb-4">
            Talebiniz başarıyla oluşturuldu. En kısa sürede sizinle iletişime geçilecektir.
          </p>
          <div className="bg-white rounded-xl p-4 text-left space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Araç</span>
              <span className="font-medium text-slate-900">{vehicleLabel}</span>
            </div>
            {allTours.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{allTours.length > 1 ? 'Turlar' : 'Tur'}</span>
                <span className="font-medium text-slate-900">{allTours.map(t => t.name).join(' + ')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tarih</span>
              <span className="font-medium text-slate-900">
                {dateTime.pickupDate.toLocaleDateString("tr-TR")} - {dateTime.pickupTime}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Yolcu</span>
              <span className="font-medium text-slate-900">{totalPassengers} kişi</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-semibold">Toplam</span>
              <span className="font-bold text-cyan-700">
                {formatTlUsdPairFromTl(priceResult.price.total)}
              </span>
            </div>
          </div>
          <Link
            href="/transferler"
            className="inline-flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-800 font-medium"
          >
            Transferlere Dön
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <h3 className="text-base font-bold text-slate-900 mb-1">Rezervasyon Bilgileri</h3>
        <p className="text-xs text-slate-500 mb-4">Aşağıdaki bilgileri doldurarak rezervasyon talebinizi gönderin.</p>

        <form onSubmit={handleSubmit} className="space-y-1">
          {/* ═══════ Tarih ve Saat ═══════ */}
          <div className="border-b border-slate-100">
            <SectionHeader
              title="Tarih ve Saat"
              icon={<Calendar className="w-4 h-4" />}
              isOpen={openSections.dateTime}
              onToggle={() => toggleSection("dateTime")}
              badge={`${dateTime.pickupDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} ${dateTime.pickupTime}`}
            />
            {openSections.dateTime && (
              <div className="pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                      Alış Tarihi *
                    </label>
                    <input
                      type="date"
                      value={dateTime.pickupDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setDateTime((prev) => ({
                          ...prev,
                          pickupDate: new Date(e.target.value),
                        }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                    <FieldError errors={formErrors} field="dateTime.pickupDate" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                      Alış Saati *
                    </label>
                    <input
                      type="time"
                      value={dateTime.pickupTime}
                      onChange={(e) =>
                        setDateTime((prev) => ({ ...prev, pickupTime: e.target.value }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                    <FieldError errors={formErrors} field="dateTime.pickupTime" />
                  </div>
                </div>
                {/* Night warning */}
                {parseInt(dateTime.pickupTime.split(":")[0]) >= 22 ||
                parseInt(dateTime.pickupTime.split(":")[0]) < 6 ? (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Gece transferi seçtiniz (22:00-06:00). Ek gece ücreti uygulanacaktır.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* ═══════ Yolcu Bilgileri ═══════ */}
          <div className="border-b border-slate-100">
            <SectionHeader
              title="Yolcu ve Bagaj"
              icon={<Users className="w-4 h-4" />}
              isOpen={openSections.passengers}
              onToggle={() => toggleSection("passengers")}
              badge={`${totalPassengers} kişi`}
            />
            {openSections.passengers && (
              <div className="pb-4 space-y-4">
                {/* Adults */}
                <CounterField
                  label="Yetişkin"
                  sublabel="13+ yaş"
                  value={passengers.adults}
                  min={1}
                  max={transfer.capacity}
                  onChange={(v) => setPassengers((prev) => ({ ...prev, adults: v }))}
                />
                {/* Children */}
                <CounterField
                  label="Çocuk"
                  sublabel="2-12 yaş"
                  value={passengers.children}
                  min={0}
                  max={Math.max(0, transfer.capacity - passengers.adults)}
                  onChange={(v) => setPassengers((prev) => ({ ...prev, children: v }))}
                />
                {/* Infants */}
                <CounterField
                  label="Bebek"
                  sublabel="0-2 yaş"
                  value={passengers.infants}
                  min={0}
                  max={2}
                  onChange={(v) => setPassengers((prev) => ({ ...prev, infants: v }))}
                />

                <div className="border-t border-slate-100 pt-4">
                  {/* Luggage */}
                  <CounterField
                    label="Bagaj Sayısı"
                    sublabel={`Max ${transfer.luggageCapacity} standart`}
                    value={luggageCount}
                    min={0}
                    max={transfer.luggageCapacity + 2}
                    onChange={setLuggageCount}
                  />
                </div>

                {/* Child Seat */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildSeatNeeded(!childSeatNeeded)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                      childSeatNeeded
                        ? "bg-cyan-600 border-cyan-600"
                        : "border-slate-300 hover:border-cyan-400"
                    }`}
                  >
                    {childSeatNeeded && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                  <div>
                    <p className="text-sm text-slate-800">Çocuk koltuğu</p>
                    <p className="text-xs text-slate-500">
                      {transfer.childSeatCount > 0
                        ? `${transfer.childSeatCount} adet mevcut`
                        : "Talep üzerine temin edilir"}
                    </p>
                  </div>
                </div>

                {/* Capacity Warning */}
                {totalPassengers > transfer.capacity && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      Bu araç maksimum {transfer.capacity} kişi kapasitelidir.
                    </p>
                  </div>
                )}

                <FieldError errors={formErrors} field="passengers" />
              </div>
            )}
          </div>

          {/* ═══════ İletişim Bilgileri ═══════ */}
          <div className="border-b border-slate-100">
            <SectionHeader
              title="İletişim Bilgileri"
              icon={<User className="w-4 h-4" />}
              isOpen={openSections.contact}
              onToggle={() => toggleSection("contact")}
            />
            {openSections.contact && (
              <div className="pb-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Adınız ve soyadınız"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                  <FieldError errors={formErrors} field="contact.name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Telefon *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <FieldError errors={formErrors} field="contact.phone" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    E-posta
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="ornek@email.com"
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <FieldError errors={formErrors} field="contact.email" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    WhatsApp (Opsiyonel)
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={contact.whatsapp || ""}
                      onChange={(e) =>
                        setContact((prev) => ({ ...prev, whatsapp: e.target.value }))
                      }
                      placeholder="WhatsApp numaranız"
                      className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══════ Adres Bilgileri ═══════ */}
          <div className="border-b border-slate-100">
            <SectionHeader
              title="Adres Bilgileri"
              icon={<MapPin className="w-4 h-4" />}
              isOpen={openSections.address}
              onToggle={() => toggleSection("address")}
            />
            {openSections.address && (
              <div className="pb-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Alış Adresi / Otel Adı
                  </label>
                  <textarea
                    value={addresses.pickup}
                    onChange={(e) =>
                      setAddresses((prev) => ({ ...prev, pickup: e.target.value }))
                    }
                    placeholder="Otel adı veya detaylı adres..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                  <FieldError errors={formErrors} field="addresses.pickup" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Bırakış Adresi / Otel Adı
                  </label>
                  <textarea
                    value={addresses.dropoff}
                    onChange={(e) =>
                      setAddresses((prev) => ({ ...prev, dropoff: e.target.value }))
                    }
                    placeholder="Hedef otel adı veya adres..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  />
                  <FieldError errors={formErrors} field="addresses.dropoff" />
                </div>
              </div>
            )}
          </div>

          {/* ═══════ Uçuş Bilgisi ═══════ */}
          <div className="border-b border-slate-100">
            <SectionHeader
              title="Uçuş Bilgisi"
              icon={<Plane className="w-4 h-4" />}
              isOpen={openSections.flight}
              onToggle={() => toggleSection("flight")}
              badge="Opsiyonel"
            />
            {openSections.flight && (
              <div className="pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                      Uçuş Numarası
                    </label>
                    <input
                      type="text"
                      value={flightInfo?.flightNumber || ""}
                      onChange={(e) =>
                        setFlightInfo((prev) => ({
                          flightNumber: e.target.value,
                          arrivalTime: prev?.arrivalTime || "",
                          airline: prev?.airline,
                        }))
                      }
                      placeholder="TK1234"
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                      Varış Saati
                    </label>
                    <input
                      type="time"
                      value={flightInfo?.arrivalTime || ""}
                      onChange={(e) =>
                        setFlightInfo((prev) => ({
                          flightNumber: prev?.flightNumber || "",
                          arrivalTime: e.target.value,
                          airline: prev?.airline,
                        }))
                      }
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Uçuş bilgisi girerek gecikmeler durumunda şoförünüzün sizi beklemesini sağlayabilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* ═══════ Notlar ═══════ */}
          <div className="border-b border-slate-100">
            <SectionHeader
              title="Özel Notlar"
              icon={<FileText className="w-4 h-4" />}
              isOpen={openSections.notes}
              onToggle={() => toggleSection("notes")}
              badge="Opsiyonel"
            />
            {openSections.notes && (
              <div className="pb-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Özel istek veya notlarınız (örn: engelli erişimi, ek bekleme talebi, vb.)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>

          {/* ═══════ Fiyat ve Gönder ═══════ */}
          <div className="pt-4 space-y-4">
            {/* Price Summary */}
            <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-4 border border-cyan-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Transfer</span>
                  <span className="font-medium text-slate-900">
                    {formatTlUsdPairFromTl(priceResult.price.transferTotal)}
                  </span>
                </div>
                {priceResult.price.tourPrice > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {allTours.length > 1
                        ? `Turlar (${allTours.length} adet)`
                        : `Tur (${tour?.name || allTours[0]?.name})`
                      }
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatTlUsdPairFromTl(priceResult.price.tourPrice)}
                    </span>
                  </div>
                )}
                {priceResult.price.earlyBirdDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Erken rezervasyon indirimi</span>
                    <span className="font-medium text-red-600">
                      -{formatTlUsdPairFromTl(priceResult.price.earlyBirdDiscount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-2 border-t border-cyan-200">
                  <span className="font-semibold text-slate-900">Toplam</span>
                  <span className="font-bold text-cyan-700 text-lg">
                    {formatTlUsdPairFromTl(priceResult.price.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {priceResult.warnings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                {priceResult.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">{w}</p>
                ))}
              </div>
            )}

            {/* Error Message */}
            {submitErrorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <XCircle className="w-4 h-4 shrink-0" />
                {submitErrorMsg}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/30 hover:shadow-xl"
              disabled={reservationMutation.isPending || !user || totalPassengers > transfer.capacity}
            >
              {reservationMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {!user
                ? "Giriş Yapın"
                : reservationMutation.isPending
                  ? "Gönderiliyor..."
                  : "Rezervasyon Talebi Gönder"}
            </Button>

            {!user && (
              <p className="text-xs text-center text-slate-400">
                Rezervasyon için{" "}
                <Link href="/login" className="text-cyan-600 hover:underline">
                  giriş yapmanız
                </Link>{" "}
                gerekiyor.
              </p>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Güvenli
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Ücretsiz İptal
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                7/24 Destek
              </span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ────────── Counter Field ────────── */

function CounterField({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="w-4 h-4 text-slate-500" />
        </button>
        <span className="w-8 text-center font-semibold text-slate-900 text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
