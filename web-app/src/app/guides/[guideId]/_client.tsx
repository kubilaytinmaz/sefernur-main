"use client";

import { EmptyState, ErrorState, LoadingState } from "@/components/states/AsyncStates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouteId } from "@/hooks/useRouteId";
import { formatTlUsdPairFromTl } from "@/lib/currency";
import { getGuideById } from "@/lib/firebase/domain";
import { createReservation } from "@/lib/firebase/reservations";
import { useAuthStore } from "@/store/auth";
import { GuideDailyAvailability, GuideModel } from "@/types/guide";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Languages,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Send,
  Star,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";

/* ────────── Main Page ────────── */

export default function GuideDetailPage() {
  const guideId = useRouteId();

  const guideQuery = useQuery({
    queryKey: ["guide", guideId],
    queryFn: () => getGuideById(guideId),
    enabled: !!guideId,
  });

  const guide = guideQuery.data;

  if (guideQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState title="Rehber yükleniyor" description="Rehber detayları getiriliyor..." />
      </div>
    );
  }

  if (guideQuery.isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <ErrorState
          title="Rehber yüklenemedi"
          description="Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onRetry={() => guideQuery.refetch()}
        />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState
          title="Rehber bulunamadı"
          description="Bu rehber artık mevcut değil veya kaldırılmış olabilir."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Rehberler
        </Link>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={guide.images} name={guide.name} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Guide Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {guide.isPopular ? (
                  <Badge className="bg-amber-500 text-white border-0 gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" /> Popüler
                  </Badge>
                ) : null}
                {guide.specialties.map((sp) => (
                  <Badge key={sp} className="bg-violet-50 text-violet-700 border border-violet-200 gap-1">
                    {sp}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{guide.name}</h1>
              {guide.company ? (
                <p className="mt-2 flex items-center gap-2 text-slate-500">
                  <Briefcase className="w-4 h-4" />
                  {guide.company}
                </p>
              ) : null}
            </div>

            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-3">
              {guide.city ? (
                <InfoChip icon={<MapPin className="w-4 h-4" />} label="Şehir" value={guide.city} />
              ) : null}
              {guide.languages.length > 0 ? (
                <InfoChip
                  icon={<Languages className="w-4 h-4" />}
                  label="Diller"
                  value={guide.languages.join(", ")}
                />
              ) : null}
              {guide.yearsExperience > 0 ? (
                <InfoChip
                  icon={<Calendar className="w-4 h-4" />}
                  label="Deneyim"
                  value={`${guide.yearsExperience} Yıl`}
                />
              ) : null}
              {guide.rating > 0 ? (
                <InfoChip
                  icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  label="Puan"
                  value={`${guide.rating.toFixed(1)} / 5${guide.reviewCount > 0 ? ` (${guide.reviewCount})` : ""}`}
                />
              ) : null}
            </div>

            {/* Bio / About */}
            {guide.bio ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-violet-600" />
                    Hakkında
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {guide.bio}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {/* Certifications */}
            {guide.certifications.length > 0 ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-600" />
                    Sertifikalar
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {guide.certifications.map((cert) => (
                      <div key={cert} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-violet-500 shrink-0" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Service Addresses */}
            {guide.serviceAddresses.length > 0 ? (
              <Card className="border-slate-200 bg-white">
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-600" />
                    Hizmet Bölgeleri
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {guide.serviceAddresses.map((addr, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700"
                      >
                        <MapPin className="w-4 h-4 text-violet-500 shrink-0" />
                        <span>
                          {[addr.city, addr.state, addr.country]
                            .filter(Boolean)
                            .join(", ") || addr.address || "Bölge"}
                        </span>
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
              <Card className="border-violet-200 bg-linear-to-br from-violet-50 to-fuchsia-50">
                <CardContent className="p-5">
                  <p className="text-xs text-violet-600 uppercase tracking-wider font-medium">
                    Günlük Ücret
                  </p>
                  <p className="mt-1 text-2xl font-bold text-violet-800">
                    {formatTlUsdPairFromTl(guide.dailyRate)}
                  </p>
                </CardContent>
              </Card>

              {/* Reservation Form */}
              <ReservationForm guide={guide} />

              {/* Contact Card */}
              {guide.phone || guide.whatsapp || guide.email ? (
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">İletişim</h3>
                    {guide.phone ? (
                      <a
                        href={`tel:${guide.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-violet-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Telefon</p>
                          <p className="text-sm font-medium text-slate-900">{guide.phone}</p>
                        </div>
                      </a>
                    ) : null}
                    {guide.whatsapp ? (
                      <a
                        href={`https://wa.me/${guide.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-green-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">WhatsApp</p>
                          <p className="text-sm font-medium text-slate-900">{guide.whatsapp}</p>
                        </div>
                      </a>
                    ) : null}
                    {guide.email ? (
                      <a
                        href={`mailto:${guide.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-sky-700" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">E-posta</p>
                          <p className="text-sm font-medium text-slate-900">{guide.email}</p>
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

function ImageGallery({ images, name }: { images: string[]; name: string }) {
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
              alt={`${name} - ${currentIndex + 1}`}
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
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-violet-50 to-fuchsia-50">
            <div className="text-center">
              <User className="w-16 h-16 text-violet-200 mx-auto" />
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
      <span className="text-violet-600">{icon}</span>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-tight">{label}</p>
        <p className="text-slate-800 font-medium leading-tight">{value}</p>
      </div>
    </div>
  );
}

/* ────────── Reservation Form ────────── */

function ReservationForm({ guide }: { guide: GuideModel }) {
  const user = useAuthStore((state) => state.user);

  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPrice = days * guide.dailyRate;
  const minBookingDays = guide.minBookingDays || 1;
  const maxGroupSize = guide.maxGroupSize || 20;

  // Tarih müsaitlik kontrolü
  const checkAvailability = (date: Date): GuideDailyAvailability | undefined => {
    if (!guide.availability) return undefined;
    const dateStr = date.toISOString().split('T')[0];
    return guide.availability.find(a => a.date === dateStr);
  };

  const selectedAvailability = startDate ? checkAvailability(startDate) : undefined;
  const isDateUnavailable = selectedAvailability?.status === 'unavailable' || selectedAvailability?.status === 'busy';

  const reservationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Giriş yapmanız gerekiyor");
      if (!phone.trim()) throw new Error("Telefon numarası gerekli");
      if (!startDate) throw new Error("Başlangıç tarihi seçiniz");
      if (days < minBookingDays) throw new Error(`Minimum ${minBookingDays} gün rezervasyon gereklidir`);
      if (peopleCount > maxGroupSize) throw new Error(`Maksimum ${maxGroupSize} kişi rezervasyon yapabilirsiniz`);
      if (isDateUnavailable) throw new Error("Seçilen tarihte rehber müsait değil");

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);

      return createReservation({
        userId: user.id,
        type: "guide",
        itemId: guide.id || "",
        title: guide.name,
        subtitle: `${guide.specialties.join(", ")} · ${days} Gün`,
        imageUrl: guide.images[0] || "",
        startDate,
        endDate,
        quantity: 1,
        people: peopleCount,
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

  // Minimum tarih (bugün)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Takvim için tarih oluşturma (sonraki 30 gün)
  const generateCalendarDays = () => {
    const days: Date[] = [];
    const current = new Date(today);
    for (let i = 0; i < 30; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  if (success) {
    return (
      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-violet-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-violet-900">Rezervasyon Alındı!</h3>
          <p className="mt-2 text-sm text-violet-700">
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
          {/* Tarih Seçici */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              min={today.toISOString().split('T')[0]}
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
                setStartDate(date);
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
            {selectedAvailability && (
              <div className={`mt-2 flex items-center gap-1.5 text-xs ${isDateUnavailable ? 'text-red-600' : 'text-green-600'}`}>
                {isDateUnavailable ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    {selectedAvailability.notes || 'Bu tarihte müsait değil'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Müsait
                  </>
                )}
              </div>
            )}
          </div>

          {/* Day Counter */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Gün Sayısı</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDays((prev) => Math.max(minBookingDays, prev - 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="w-8 text-center font-semibold text-slate-900">{days}</span>
              <button
                type="button"
                onClick={() => setDays((prev) => Math.min(30, prev + 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-xs text-slate-400 ml-auto">min {minBookingDays} gün</span>
            </div>
          </div>

          {/* Kişi Sayısı */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Kişi Sayısı
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPeopleCount((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="w-8 text-center font-semibold text-slate-900">{peopleCount}</span>
              <button
                type="button"
                onClick={() => setPeopleCount((prev) => Math.min(maxGroupSize, prev + 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-xs text-slate-400 ml-auto">max {maxGroupSize} kişi</span>
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
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Not (Opsiyonel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Özel istek veya notlarınız..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">
                Toplam ({days} gün × {peopleCount} kişi)
              </span>
              <span className="text-lg font-bold text-violet-700">
                {formatTlUsdPairFromTl(totalPrice)}
              </span>
            </div>

            {startDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' '} - {days} gün
                </span>
              </div>
            )}

            {errorMessage ? (
              <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-red-50 text-sm text-red-700">
                <XCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 cursor-pointer"
              disabled={reservationMutation.isPending || !user}
            >
              {reservationMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {!user
                ? "Giriş Yapın"
                : reservationMutation.isPending
                  ? "Gönderiliyor..."
                  : "Rezervasyon Talebi Gönder"}
            </Button>

            {!user ? (
              <p className="mt-2 text-xs text-center text-slate-400">
                Rezervasyon için{" "}
                <Link href="/login" className="text-violet-600 hover:underline">
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
