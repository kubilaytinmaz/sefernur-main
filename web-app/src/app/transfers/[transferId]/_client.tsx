"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouteId } from "@/hooks/useRouteId";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { getTransferById } from "@/lib/firebase/domain";
import { createReservation } from "@/lib/firebase/reservations";
import { useAuthStore } from "@/store/auth";
import { displayAddress } from "@/types/address";
import { amenityLabels, TransferModel, VehicleAmenity, vehicleTypeLabels } from "@/types/transfer";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    ArrowRight,
    Baby,
    Briefcase,
    Car,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Minus,
    Phone,
    Plus,
    Send,
    Star,
    Truck,
    Users,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";

/* ────────── Vehicle Icon ────────── */

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "bus":
    case "coster":
      return <Truck className={className} />;
    default:
      return <Car className={className} />;
  }
}

/* ────────── Main Page ────────── */

export default function TransferDetailPage() {
  const transferId = useRouteId();

  const transferQuery = useQuery({
    queryKey: ["transfer", transferId],
    queryFn: () => getTransferById(transferId),
    enabled: !!transferId,
  });

  const transfer = transferQuery.data;

  if (transferQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Transfer yükleniyor" description="Transfer detayları getiriliyor..." />
      </div>
    );
  }

  if (transferQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Transfer yüklenemedi"
          description="Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onRetry={() => transferQuery.refetch()}
        />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState title="Transfer bulunamadı" description="Bu transfer artık mevcut değil veya kaldırılmış olabilir." />
      </div>
    );
  }

  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/transfers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Transferler
        </Link>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={transfer.images} title={transfer.vehicleName || vehicleLabel} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Transfer Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {transfer.isPopular ? (
                  <Badge className="bg-amber-500 text-white border-0 gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" /> Popüler
                  </Badge>
                ) : null}
                <Badge className="bg-cyan-50 text-cyan-700 border border-cyan-200 gap-1">
                  <VehicleIcon type={transfer.vehicleType} className="w-3.5 h-3.5" />
                  {vehicleLabel}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {transfer.vehicleName || vehicleLabel}
              </h1>
              {transfer.company ? (
                <p className="mt-2 flex items-center gap-2 text-slate-500">
                  <Briefcase className="w-4 h-4" />
                  {transfer.company}
                </p>
              ) : null}
            </div>

            {/* Route Card */}
            <Card className="border-slate-200 bg-white">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  Güzergah
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Nereden</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{displayAddress(transfer.fromAddress)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Nereye</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{displayAddress(transfer.toAddress)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-3">
              <InfoChip icon={<Users className="w-4 h-4" />} label="Kapasite" value={`${transfer.capacity} Kişi`} />
              {transfer.durationMinutes > 0 ? (
                <InfoChip icon={<Clock3 className="w-4 h-4" />} label="Süre" value={`${transfer.durationMinutes} dk`} />
              ) : null}
              {transfer.luggageCapacity > 0 ? (
                <InfoChip icon={<Briefcase className="w-4 h-4" />} label="Bagaj" value={`${transfer.luggageCapacity} Adet`} />
              ) : null}
              {transfer.childSeatCount > 0 ? (
                <InfoChip icon={<Baby className="w-4 h-4" />} label="Çocuk Koltuğu" value={`${transfer.childSeatCount} Adet`} />
              ) : null}
              {transfer.rating > 0 ? (
                <InfoChip
                  icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  label="Puan"
                  value={`${transfer.rating.toFixed(1)} / 5`}
                />
              ) : null}
            </div>

            {/* Amenities */}
            {transfer.amenities.length > 0 ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Araç Özellikleri</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {transfer.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-cyan-500 shrink-0" />
                        {amenityLabels[amenity as VehicleAmenity] || amenity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Right Column - Reservation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Price Card */}
              <Card className="border-cyan-200 bg-linear-to-br from-cyan-50 to-sky-50">
                <CardContent className="p-5">
                  <p className="text-xs text-cyan-600 uppercase tracking-wider font-medium">Transfer Ücreti</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-800">
                    {formatTlUsdPairFromTl(transfer.basePrice)}
                  </p>
                </CardContent>
              </Card>

              {/* Reservation Form */}
              <ReservationForm transfer={transfer} />

              {/* Contact Card */}
              {(transfer.phone || transfer.whatsapp || transfer.email) ? (
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">İletişim</h3>
                    {transfer.phone ? (
                      <a
                        href={`tel:${transfer.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-cyan-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Telefon</p>
                          <p className="text-sm font-medium text-slate-900">{transfer.phone}</p>
                        </div>
                      </a>
                    ) : null}
                    {transfer.whatsapp ? (
                      <a
                        href={`https://wa.me/${transfer.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">WhatsApp</p>
                          <p className="text-sm font-medium text-slate-900">{transfer.whatsapp}</p>
                        </div>
                      </a>
                    ) : null}
                    {transfer.email ? (
                      <a
                        href={`mailto:${transfer.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-sky-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">E-posta</p>
                          <p className="text-sm font-medium text-slate-900">{transfer.email}</p>
                        </div>
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Image Gallery ────────── */

function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = images.length > 0;

  const goTo = useCallback(
    (direction: "prev" | "next") => {
      if (!hasImages) return;
      setCurrentIndex((prev) => {
        if (direction === "prev") return prev === 0 ? images.length - 1 : prev - 1;
        return prev === images.length - 1 ? 0 : prev + 1;
      });
    },
    [hasImages, images.length],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-2xl overflow-hidden bg-slate-100 h-64 sm:h-80 md:h-96">
        {hasImages ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => goTo("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        i === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : null}

            <div className="absolute bottom-4 right-4">
              <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
                {currentIndex + 1} / {images.length}
              </Badge>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-cyan-50 to-sky-50">
            <div className="text-center">
              <Car className="w-16 h-16 text-cyan-200 mx-auto" />
              <p className="mt-2 text-sm text-slate-400">Görsel henüz eklenmedi</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────── Info Chip ────────── */

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm">
      <span className="text-cyan-600">{icon}</span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
        <p className="text-slate-800 font-medium leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ────────── Reservation Form ────────── */

function ReservationForm({ transfer }: { transfer: TransferModel }) {
  const user = useAuthStore((state) => state.user);
  const vehicleLabel = vehicleTypeLabels[transfer.vehicleType] || transfer.vehicleType;

  const [passengers, setPassengers] = useState(1);
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPrice = passengers * transfer.basePrice;

  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Giriş yapmanız gerekiyor");
      if (!phone.trim()) throw new Error("Telefon numarası gerekli");

      return createReservation({
        userId: user.id,
        type: "transfer",
        itemId: transfer.id || "",
        title: transfer.vehicleName || vehicleLabel,
        subtitle: `${displayAddress(transfer.fromAddress)} → ${displayAddress(transfer.toAddress)} · ${passengers} Yolcu`,
        imageUrl: transfer.images[0] || "",
        startDate: new Date(),
        endDate: new Date(),
        quantity: 1,
        people: passengers,
        price: totalPrice,
        currency: "TRY",
        status: "pending",
        userPhone: phone,
        userEmail: email,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      setErrorMessage("");
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setErrorMessage("");
      reservationMutation.mutate();
    },
    [reservationMutation],
  );

  if (success) {
    return (
      <Card className="border-cyan-200 bg-cyan-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-cyan-900">Rezervasyon Alındı!</h3>
          <p className="mt-2 text-sm text-cyan-700">
            Talebiniz başarıyla oluşturuldu. En kısa sürede sizinle iletişime geçilecektir.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Rezervasyon Talebi</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passenger Counter */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Yolcu Sayısı</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPassengers((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="w-8 text-center font-semibold text-slate-900">{passengers}</span>
              <button
                type="button"
                onClick={() => setPassengers((prev) => Math.min(transfer.capacity, prev + 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-xs text-slate-400 ml-auto">max {transfer.capacity}</span>
            </div>
          </div>

          {/* Contact Fields */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Telefon *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Not (Opsiyonel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Özel istek veya notlarınız..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">Toplam</span>
              <span className="text-lg font-bold text-cyan-700">{formatTlUsdPairFromTl(totalPrice)}</span>
            </div>

            {errorMessage ? (
              <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-red-50 text-sm text-red-700">
                <XCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer"
              disabled={reservationMutation.isPending || !user}
            >
              {reservationMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {!user ? "Giriş Yapın" : reservationMutation.isPending ? "Gönderiliyor..." : "Rezervasyon Talebi Gönder"}
            </Button>

            {!user ? (
              <p className="mt-2 text-xs text-center text-slate-400">
                Rezervasyon için{" "}
                <Link href="/login" className="text-cyan-600 hover:underline">
                  giriş yapmanız
                </Link>{" "}
                gerekiyor.
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
