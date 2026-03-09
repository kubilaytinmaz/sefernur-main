"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouteId } from "@/hooks/useRouteId";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { getTourById } from "@/lib/firebase/domain";
import { createReservation } from "@/lib/firebase/reservations";
import { useAuthStore } from "@/store/auth";
import { DailyProgram, ServiceType, TourCategory } from "@/types/tour";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Mail,
    MapPin,
    MessageCircle,
    Minus,
    Moon,
    Phone,
    Plane,
    Plus,
    Send,
    Star,
    Users,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";

/* ────────── Label Maps ────────── */

const categoryLabels: Record<TourCategory, string> = {
  umrah: "Umre",
  hajj: "Hac",
  religious: "Dini",
  cultural: "Kültürel",
  historical: "Tarihi",
};

const serviceTypeLabels: Record<ServiceType, string> = {
  with_transport: "Ulaşım Dahil",
  without_transport: "Ulaşımsız",
  flight_included: "Uçak Dahil",
  custom: "Özel Paket",
};

/* ────────── Main Page ────────── */

export default function TourDetailPage() {
  const tourId = useRouteId();

  const tourQuery = useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => getTourById(tourId),
    enabled: !!tourId,
  });

  const tour = tourQuery.data;

  if (tourQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Tur yükleniyor" description="Tur detayları getiriliyor..." />
      </div>
    );
  }

  if (tourQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Tur yüklenemedi"
          description="Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onRetry={() => tourQuery.refetch()}
        />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState title="Tur bulunamadı" description="Bu tur artık mevcut değil veya kaldırılmış olabilir." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Turlar
        </Link>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={tour.images} title={tour.title} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tour Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {tour.isPopular ? (
                  <Badge className="bg-amber-500 text-white border-0 gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" /> Popüler
                  </Badge>
                ) : null}
                {tour.category ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {categoryLabels[tour.category] || tour.category}
                  </Badge>
                ) : null}
                {tour.serviceType ? (
                  <Badge className="bg-sky-50 text-sky-700 border border-sky-200">
                    {serviceTypeLabels[tour.serviceType] || tour.serviceType}
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{tour.title}</h1>
              {tour.company ? (
                <p className="mt-2 flex items-center gap-2 text-slate-500">
                  <Users className="w-4 h-4" />
                  {tour.company}
                </p>
              ) : null}
            </div>

            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-3">
              <InfoChip icon={<Clock3 className="w-4 h-4" />} label="Süre" value={`${tour.durationDays} Gün`} />
              {tour.mekkeNights ? (
                <InfoChip icon={<Moon className="w-4 h-4" />} label="Mekke" value={`${tour.mekkeNights} Gece`} />
              ) : null}
              {tour.medineNights ? (
                <InfoChip icon={<Moon className="w-4 h-4" />} label="Medine" value={`${tour.medineNights} Gece`} />
              ) : null}
              {tour.startDate ? (
                <InfoChip
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Gidiş"
                  value={tour.startDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                />
              ) : null}
              {tour.endDate ? (
                <InfoChip
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Dönüş"
                  value={tour.endDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                />
              ) : null}
              {(tour.rating ?? 0) > 0 ? (
                <InfoChip
                  icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  label="Puan"
                  value={`${(tour.rating ?? 0).toFixed(1)} / 5`}
                />
              ) : null}
            </div>

            {/* Flight Info */}
            {tour.airline || tour.flightDepartureFrom ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-sky-600" />
                    Uçuş Bilgisi
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {tour.airline ? (
                      <div className="flex items-center gap-3">
                        {tour.airlineLogo ? (
                          <img src={tour.airlineLogo} alt={tour.airline} className="w-8 h-8 rounded-md object-contain" />
                        ) : null}
                        <div>
                          <p className="text-xs text-slate-400">Havayolu</p>
                          <p className="text-sm font-medium text-slate-900">{tour.airline}</p>
                        </div>
                      </div>
                    ) : null}
                    {tour.flightDepartureFrom && tour.flightDepartureTo ? (
                      <div>
                        <p className="text-xs text-slate-400">Gidiş</p>
                        <p className="text-sm font-medium text-slate-900">
                          {tour.flightDepartureFrom} → {tour.flightDepartureTo}
                        </p>
                      </div>
                    ) : null}
                    {tour.flightReturnFrom && tour.flightReturnTo ? (
                      <div>
                        <p className="text-xs text-slate-400">Dönüş</p>
                        <p className="text-sm font-medium text-slate-900">
                          {tour.flightReturnFrom} → {tour.flightReturnTo}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Description */}
            {tour.description ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Tur Açıklaması</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{tour.description}</p>
                </CardContent>
              </Card>
            ) : null}

            {/* Daily Program */}
            {tour.program && tour.program.length > 0 ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Günlük Program</h3>
                  <div className="space-y-4">
                    {tour.program.map((day, index) => (
                      <DayCard key={index} program={day} index={index} isLast={index === (tour.program?.length ?? 0) - 1} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Service Addresses */}
            {tour.serviceAddresses && tour.serviceAddresses.length > 0 ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Hizmet Adresleri
                  </h3>
                  <div className="space-y-2">
                    {tour.serviceAddresses.map((address, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {address}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Tags */}
            {tour.tags && tour.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tour.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right Column - Reservation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Price Card */}
              <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-5">
                  <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium">Kişi Başı Fiyat</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-800">
                    {formatTlUsdPairFromTl(tour.basePrice)}
                  </p>
                  {tour.childPrice ? (
                    <p className="mt-1 text-sm text-emerald-600">
                      Çocuk: {formatTlUsdPairFromTl(tour.childPrice)}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              {/* Reservation Form */}
              <ReservationForm tour={tour} />

              {/* Contact Card */}
              {(tour.phone || tour.whatsapp || tour.email) ? (
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">İletişim</h3>
                    {tour.phone ? (
                      <a
                        href={`tel:${tour.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Telefon</p>
                          <p className="text-sm font-medium text-slate-900">{tour.phone}</p>
                        </div>
                      </a>
                    ) : null}
                    {tour.whatsapp ? (
                      <a
                        href={`https://wa.me/${tour.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">WhatsApp</p>
                          <p className="text-sm font-medium text-slate-900">{tour.whatsapp}</p>
                        </div>
                      </a>
                    ) : null}
                    {tour.email ? (
                      <a
                        href={`mailto:${tour.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-sky-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">E-posta</p>
                          <p className="text-sm font-medium text-slate-900">{tour.email}</p>
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
                      className={`w-2 h-2 rounded-full transition-all ${
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
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-emerald-200 mx-auto" />
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
      <span className="text-emerald-600">{icon}</span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
        <p className="text-slate-800 font-medium leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ────────── Day Card ────────── */

function DayCard({ program, index, isLast }: { program: DailyProgram; index: number; isLast: boolean }) {
  return (
    <div className="relative flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
          {program.day || index + 1}
        </div>
        {!isLast ? <div className="w-0.5 flex-1 bg-emerald-100 mt-1" /> : null}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1">
        <h4 className="font-medium text-slate-900 text-sm">{program.title || `${program.day || index + 1}. Gün`}</h4>
        {program.description ? (
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">{program.description}</p>
        ) : null}
        {program.activities && program.activities.length > 0 ? (
          <div className="mt-2 space-y-1">
            {program.activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                {activity}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ────────── Reservation Form ────────── */

function ReservationForm({ tour }: { tour: { id?: string; title: string; basePrice: number; childPrice?: number; images: string[] } }) {
  const user = useAuthStore((state) => state.user);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPrice = adults * tour.basePrice + children * (tour.childPrice ?? tour.basePrice);

  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Giriş yapmanız gerekiyor");
      if (!phone.trim()) throw new Error("Telefon numarası gerekli");

      return createReservation({
        userId: user.id,
        type: "tour",
        itemId: tour.id || "",
        title: tour.title,
        subtitle: `${adults} Yetişkin${children > 0 ? `, ${children} Çocuk` : ""}`,
        imageUrl: tour.images[0] || "",
        startDate: new Date(),
        endDate: new Date(),
        quantity: 1,
        people: adults + children,
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
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-900">Rezervasyon Alındı!</h3>
          <p className="mt-2 text-sm text-emerald-700">
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
          {/* Person Counter */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Yetişkin</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Minus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="w-8 text-center font-semibold text-slate-900">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults((prev) => Math.min(20, prev + 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-xs text-slate-400 ml-auto">× {formatTlUsdPairFromTl(tour.basePrice)}</span>
            </div>
          </div>

          {tour.childPrice ? (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Çocuk</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-500" />
                </button>
                <span className="w-8 text-center font-semibold text-slate-900">{children}</span>
                <button
                  type="button"
                  onClick={() => setChildren((prev) => Math.min(10, prev + 1))}
                  className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-xs text-slate-400 ml-auto">× {formatTlUsdPairFromTl(tour.childPrice)}</span>
              </div>
            </div>
          ) : null}

          {/* Contact Fields */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Telefon *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Not (Opsiyonel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Özel istek veya notlarınız..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">Toplam</span>
              <span className="text-lg font-bold text-emerald-700">{formatTlUsdPairFromTl(totalPrice)}</span>
            </div>

            {errorMessage ? (
              <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-red-50 text-sm text-red-700">
                <XCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium flex items-center justify-center gap-2"
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
                <Link href="/login" className="text-emerald-600 hover:underline">
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
