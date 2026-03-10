/**
 * Tur Detay Modal Bileşeni
 * Popüler turlar ve rehberler için detaylı bilgi gösterimi
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { PopularService } from "@/lib/transfers/popular-services-simple";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Route,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface TourDetailModalProps {
  open: boolean;
  onClose: () => void;
  service: PopularService | null;
}

export function TourDetailModal({ open, onClose, service }: TourDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !service) return null;

  const typeColor = getServiceTypeColor(service.type);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-cyan-500 to-sky-600 px-6 py-5">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shrink-0">
                {service.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  {service.isPopular && (
                    <Badge className="bg-amber-400 text-amber-900 border-0 text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Popüler
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{service.name}</h2>
                <p className="text-cyan-100 text-sm mt-1">{service.description}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Tam Açıklama */}
            {service.tourDetails?.fullDescription && (
              <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-4 border border-cyan-100">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {service.tourDetails.fullDescription}
                </p>
              </div>
            )}

            {/* Hızlı Bilgiler */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Süre</p>
                <p className="text-sm font-semibold text-slate-800">{service.duration.text}</p>
              </div>
              {service.distance && (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <MapPin className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Mesafe</p>
                  <p className="text-sm font-semibold text-slate-800">{service.distance.text}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <Info className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Fiyat</p>
                <p className="text-sm font-semibold text-cyan-700">{service.price.display}</p>
              </div>
            </div>

            {/* Güzergah */}
            {service.route && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Route className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Güzergah</h3>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-700">{service.route.from}</span>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="h-0.5 flex-1 bg-slate-300" />
                    <span className="text-xs text-slate-500">→</span>
                    <div className="h-0.5 flex-1 bg-slate-300" />
                  </div>
                  <span className="font-medium text-slate-700">{service.route.to}</span>
                </div>
                {service.route.stops && service.route.stops.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {service.route.stops.map((stop, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-slate-600 border border-slate-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        {stop}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tur Detayları */}
            {service.tourDetails && (
              <>
                {/* Duraklar ve Detaylı Açıklamalar */}
                {service.tourDetails.stopsDescription && service.tourDetails.stopsDescription.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Route className="w-4 h-4 text-cyan-600" />
                      <h3 className="text-sm font-semibold text-slate-800">
                        Tur Rotası ve Detaylar
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {service.tourDetails.stopsDescription.map((stop, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-cyan-200 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 mb-1">
                              {stop.stopName}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {stop.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ziyaret Edilecek Yerler (Kısa Liste) */}
                {service.tourDetails.highlights.length > 0 && !service.tourDetails.stopsDescription && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-cyan-600" />
                      <h3 className="text-sm font-semibold text-slate-800">
                        Ziyaret Edilecek Yerler
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {service.tourDetails.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 bg-cyan-50 rounded-lg border border-cyan-100"
                        >
                          <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-slate-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fiyata Dahil Olanlar */}
                {service.tourDetails.includes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-semibold text-slate-800">
                        Fiyata Dahil Olanlar
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {service.tourDetails.includes.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Katılımcı Bilgisi */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-amber-700" />
                    <h3 className="text-sm font-semibold text-amber-900">
                      Katılımcı Sayısı
                    </h3>
                  </div>
                  <p className="text-sm text-amber-800">
                    Minimum <span className="font-bold">{service.tourDetails.minParticipants}</span> kişi,
                    maksimum <span className="font-bold">{service.tourDetails.maxParticipants}</span> kişi
                  </p>
                </div>
              </>
            )}

            {/* Rezervasyon Notu */}
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Rezervasyon Bilgisi</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Bu tur için rezervasyon yaparak yerinizi ayırtabilirsiniz. Tur tarihleri ve
                    müsaitlik durumu için lütfen iletişime geçin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Toplam Fiyat</p>
                <p className="text-xl font-bold text-cyan-700">{service.price.display}</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getServiceTypeColor(type: string): string {
  const colors: Record<string, string> = {
    transfer: "blue",
    tour: "orange",
    guide: "purple",
  };
  return colors[type] || "blue";
}
