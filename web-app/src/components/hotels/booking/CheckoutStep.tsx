"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type {
  CheckoutFormData,
  FormError,
  SelectedRoomInfo,
} from "@/types/hotel-booking";
import { calculateNights } from "@/types/hotel-booking";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  Shield,
  ShieldCheck,
  XCircle
} from "lucide-react";

interface CheckoutStepProps {
  hotelName: string;
  hotelImage: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  selectedRoom: SelectedRoomInfo;
  formData: CheckoutFormData;
  onFormDataChange: (data: CheckoutFormData) => void;
  onBack: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
  errors: FormError[];
  bookingError: string | null;
}

export function CheckoutStep({
  hotelName,
  hotelImage,
  checkIn,
  checkOut,
  adults,
  selectedRoom,
  formData,
  onFormDataChange,
  onBack,
  onSubmit,
  isProcessing,
  errors,
  bookingError,
}: CheckoutStepProps) {
  const nightCount = calculateNights(checkIn, checkOut);
  const inputClass =
    "w-full h-11 rounded-xl border border-slate-300 px-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all";

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  const hasFieldError = (field: string): boolean => {
    return errors.some((e) => e.field === field);
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Bilgiler & Ödeme
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          İletişim ve ödeme bilgilerinizi girin
        </p>
      </div>

      {/* Contact Info Section - Modern Design */}
      <div className="space-y-4">
        {/* Name fields in a row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 px-1">Ad</label>
            <input
              className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm placeholder:text-slate-400 outline-none transition-all ${
                hasFieldError("firstName")
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              }`}
              placeholder="Adınız"
              value={formData.guestInfo.firstName}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  guestInfo: {
                    ...formData.guestInfo,
                    firstName: e.target.value.replace(/[0-9]/g, ""),
                  },
                })
              }
            />
            {getFieldError("firstName") && (
              <p className="text-xs text-red-500 px-1">{getFieldError("firstName")}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 px-1">Soyad</label>
            <input
              className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm placeholder:text-slate-400 outline-none transition-all ${
                hasFieldError("lastName")
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              }`}
              placeholder="Soyadınız"
              value={formData.guestInfo.lastName}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  guestInfo: {
                    ...formData.guestInfo,
                    lastName: e.target.value.replace(/[0-9]/g, ""),
                  },
                })
              }
            />
            {getFieldError("lastName") && (
              <p className="text-xs text-red-500 px-1">{getFieldError("lastName")}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 px-1">E-posta</label>
          <input
            type="email"
            className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm placeholder:text-slate-400 outline-none transition-all ${
              hasFieldError("email")
                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            }`}
            placeholder="ornek@email.com"
            value={formData.guestInfo.email}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                guestInfo: {
                  ...formData.guestInfo,
                  email: e.target.value,
                },
              })
            }
          />
          {getFieldError("email") && (
            <p className="text-xs text-red-500 px-1">{getFieldError("email")}</p>
          )}
        </div>

        {/* Phone and TC in a row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 px-1">Telefon</label>
            <input
              className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm placeholder:text-slate-400 outline-none transition-all ${
                hasFieldError("phone")
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              }`}
              placeholder="05XX XXX XX XX"
              value={formData.guestInfo.phone}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  guestInfo: {
                    ...formData.guestInfo,
                    phone: e.target.value,
                  },
                })
              }
            />
            {getFieldError("phone") && (
              <p className="text-xs text-red-500 px-1">{getFieldError("phone")}</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 px-1">Kimlik / Pasaport No</label>
            <input
              className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm placeholder:text-slate-400 outline-none transition-all ${
                hasFieldError("identityTaxNumber")
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              }`}
              style={{ fontFamily: "'SF Mono', monospace" }}
              placeholder="TC / Pasaport"
              maxLength={20}
              value={formData.guestInfo.identityTaxNumber}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  guestInfo: {
                    ...formData.guestInfo,
                    identityTaxNumber: e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
                  },
                })
              }
            />
            {getFieldError("identityTaxNumber") && (
              <p className="text-xs text-red-500 px-1">{getFieldError("identityTaxNumber")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-5">
        {/* Premium Credit Card Visual */}
        <div className="relative perspective-1000">
          <div
            className="relative aspect-[1.586/1] max-w-sm mx-auto rounded-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            {/* Animated gradient overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite'
              }}
            />
            
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
            
            {/* Card content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-5">
              {/* Top row */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-medium">Kredi Kartı</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center">
                      <div className="w-6 h-4 rounded-sm bg-gradient-to-br from-amber-200/50 to-transparent" />
                    </div>
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 opacity-90" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 opacity-90 -ml-2" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-white/70 font-medium">3D Secure</span>
                </div>
              </div>
              
              {/* Card number */}
              <div className="space-y-1">
                <p
                  className="text-white text-xl tracking-[0.25em] font-medium tabular-nums"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
                >
                  {formData.paymentInfo.cardNumber
                    ? formData.paymentInfo.cardNumber.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim()
                    : "••••   ••••   ••••   ••••"}
                </p>
              </div>
              
              {/* Bottom row */}
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">Kart Sahibi</p>
                  <p className="text-white text-sm font-medium uppercase tracking-wide truncate max-w-[180px]">
                    {formData.paymentInfo.cardHolderName || "AD SOYAD"}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">Son Kullanma</p>
                  <p className="text-white text-sm font-medium tracking-wide tabular-nums">
                    {formData.paymentInfo.cardExpireMonth || "MM"}/{formData.paymentInfo.cardExpireYear || "YY"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Input Fields - Clean Design */}
        <div className="space-y-3">
          {/* Card Holder */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 px-1">Kart Üzerindeki İsim</label>
            <input
              className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm placeholder:text-slate-400 outline-none transition-all ${
                hasFieldError("cardHolderName")
                  ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              }`}
              placeholder="AD SOYAD"
              value={formData.paymentInfo.cardHolderName}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  paymentInfo: {
                    ...formData.paymentInfo,
                    cardHolderName: e.target.value.toUpperCase(),
                  },
                })
              }
            />
            {getFieldError("cardHolderName") && (
              <p className="text-xs text-red-500 px-1">{getFieldError("cardHolderName")}</p>
            )}
          </div>

          {/* Card Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 px-1">Kart Numarası</label>
            <div className="relative">
              <input
                className={`w-full h-12 rounded-xl border-2 bg-white px-4 pr-24 text-sm placeholder:text-slate-400 outline-none transition-all ${
                  hasFieldError("cardNumber")
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                }`}
                style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: '0.05em' }}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                value={formData.paymentInfo.cardNumber
                  .replace(/\s/g, "")
                  .replace(/(\d{4})/g, "$1 ")
                  .trim()}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    paymentInfo: {
                      ...formData.paymentInfo,
                      cardNumber: e.target.value.replace(/\s/g, ""),
                    },
                  })
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <div className="w-7 h-5 rounded bg-gradient-to-br from-red-500 to-red-600" />
                <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-400 to-amber-500 -ml-2" />
              </div>
            </div>
            {getFieldError("cardNumber") && (
              <p className="text-xs text-red-500 px-1">{getFieldError("cardNumber")}</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 px-1">Son Kullanma</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={`h-12 rounded-xl border-2 bg-white px-4 text-sm text-center placeholder:text-slate-400 outline-none transition-all ${
                    hasFieldError("cardExpireMonth")
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  }`}
                  style={{ fontFamily: "'SF Mono', monospace" }}
                  placeholder="AA"
                  maxLength={2}
                  value={formData.paymentInfo.cardExpireMonth}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      paymentInfo: {
                        ...formData.paymentInfo,
                        cardExpireMonth: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                />
                <input
                  className={`h-12 rounded-xl border-2 bg-white px-4 text-sm text-center placeholder:text-slate-400 outline-none transition-all ${
                    hasFieldError("cardExpireYear")
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  }`}
                  style={{ fontFamily: "'SF Mono', monospace" }}
                  placeholder="YY"
                  maxLength={2}
                  value={formData.paymentInfo.cardExpireYear}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      paymentInfo: {
                        ...formData.paymentInfo,
                        cardExpireYear: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                />
              </div>
              {(getFieldError("cardExpireMonth") || getFieldError("cardExpireYear")) && (
                <p className="text-xs text-red-500 px-1">
                  {getFieldError("cardExpireMonth") || getFieldError("cardExpireYear")}
                </p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 px-1 flex items-center gap-1">
                CVV
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                className={`w-full h-12 rounded-xl border-2 bg-white px-4 text-sm text-center placeholder:text-slate-400 outline-none transition-all ${
                  hasFieldError("cardCvv")
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                }`}
                style={{ fontFamily: "'SF Mono', monospace", letterSpacing: '0.2em' }}
                placeholder="•••"
                maxLength={4}
                type="password"
                value={formData.paymentInfo.cardCvv}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    paymentInfo: {
                      ...formData.paymentInfo,
                      cardCvv: e.target.value.replace(/\D/g, ""),
                    },
                  })
                }
              />
              {getFieldError("cardCvv") && (
                <p className="text-xs text-red-500 px-1">{getFieldError("cardCvv")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <Lock className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-600">256-bit SSL</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-xs text-slate-600">3D Secure</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-amber-600" />
            </div>
            <span className="text-xs text-slate-600">KuveytTürk</span>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">
            Özel Talepler (Opsiyonel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            rows={3}
            placeholder="Özel taleplerinizi buraya yazın (örn: üst kat, erken check-in vb.)"
            value={formData.specialRequests}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                specialRequests: e.target.value,
              })
            }
          />
        </CardContent>
      </Card>

      {/* Booking Error */}
      {bookingError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{bookingError}</p>
        </div>
      )}

      {/* Security Info */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Shield className="w-4 h-4 text-emerald-600" />
        <span>KuveytTürk 3D Secure ile güvenli ödeme</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Oda Seçimi
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={onSubmit}
          disabled={isProcessing}
          className="flex-1"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          {isProcessing ? "İşleniyor..." : "Ödemeyi Tamamla"}
        </Button>
      </div>
    </div>
  );
}
