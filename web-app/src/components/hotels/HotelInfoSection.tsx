"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
    Building2,
    Clock,
    Globe,
    Info,
    MapPin,
    Phone,
    Star
} from "lucide-react";

/* ────────── Types ────────── */

interface HotelInfoSectionProps {
  hotelName: string;
  description?: string;
  address: string;
  stars: number;
  rating?: number;
  reviewCount?: number;
  checkInTime?: string;
  checkOutTime?: string;
  languages?: string[];
  phone?: string;
  cityName?: string;
  countryName?: string;
}

/* ────────── Sub-Components ────────── */

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StarRating({ count, size = "md" }: { count: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < count ? "text-amber-400 fill-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ────────── Main Component ────────── */

export function HotelInfoSection({
  hotelName,
  description,
  address,
  stars,
  rating,
  reviewCount,
  checkInTime = "14:00",
  checkOutTime = "12:00",
  languages = ["Türkçe", "İngilizce", "Arapça"],
  phone,
  cityName,
  countryName,
}: HotelInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Otel Hakkında
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star Rating */}
          {stars > 0 && (
            <div className="flex items-center gap-3">
              <StarRating count={stars} size="lg" />
              <span className="text-sm font-medium text-slate-600">{stars} Yıldız</span>
              {rating && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-emerald-700">{rating.toFixed(1)}</span>
                    <span className="text-xs text-slate-500">
                      {reviewCount ? `(${reviewCount} değerlendirme)` : ""}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed">{description}</p>
            </div>
          )}

          {/* No description fallback */}
          {!description && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50">
              <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600">
                {hotelName} için detaylı açıklama bilgisi mevcut değil.
              </p>
            </div>
          )}

          {/* Location Info */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-slate-900">{address}</p>
                {(cityName || countryName) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {[cityName, countryName].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in/out & Details Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-emerald-600" />
            Giriş & Çıkış
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label="Giriş Saati"
              value={checkInTime}
            />
            <InfoItem
              icon={<Clock className="w-5 h-5" />}
              label="Çıkış Saati"
              value={checkOutTime}
            />
          </div>

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium mb-2">Konuşulan Diller</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phone */}
          {phone && (
            <div className="pt-4 border-t border-slate-100">
              <InfoItem
                icon={<Phone className="w-5 h-5" />}
                label="İletişim"
                value={phone}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Important Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-medium mb-1">Önemli Bilgi</p>
              <p className="text-blue-700">
                Giriş sırasında geçerli kimlik belgesi ve kredi kartı gereklidir. 
                Rezervasyonunuz onaylandıktan sonra otel ile iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
