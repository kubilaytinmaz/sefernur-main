/**
 * Tur Detay Modal Bileşeni
 * Popüler turlar ve rehberler için detaylı bilgi gösterimi
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import type { PopularServiceModel } from "@/types/popular-service";
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
  service: PopularServiceModel | null;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-cyan-500 via-sky-500 to-cyan-600 px-8 py-6">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110"
              aria-label="Kapat"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-4xl shrink-0 shadow-lg">
                {service.icon}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-2">
                  {service.isPopular && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0 text-sm gap-1.5 px-3 py-1 shadow-md">
                      <CheckCircle2 className="w-4 h-4" /> Popüler
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{service.name}</h2>
                <p className="text-cyan-50 text-base leading-relaxed">{service.description}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Tam Açıklama */}
            {service.tourDetails?.fullDescription && (
              <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-50 rounded-2xl p-5 border-2 border-cyan-100 shadow-sm">
                <p className="text-base text-slate-700 leading-relaxed">
                  {service.tourDetails.fullDescription}
                </p>
              </div>
            )}

            {/* Hızlı Bilgiler */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition-shadow">
                <Clock className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Süre</p>
                <p className="text-base font-bold text-slate-900 mt-1">{service.duration.text}</p>
              </div>
              {service.distance && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition-shadow">
                  <MapPin className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Mesafe</p>
                  <p className="text-base font-bold text-slate-900 mt-1">{service.distance.text}</p>
                </div>
              )}
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-4 text-center border-2 border-cyan-200 hover:shadow-md transition-shadow">
                <Info className="w-6 h-6 text-cyan-700 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Fiyat</p>
                <p className="text-base font-bold text-cyan-700 mt-1">{service.price.display}</p>
              </div>
            </div>

            {/* Güzergah */}
            {service.route && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center">
                    <Route className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Güzergah</h3>
                </div>
                <div className="flex items-center gap-3 text-base mb-4">
                  <span className="font-semibold text-slate-800 bg-white px-4 py-2 rounded-lg border-2 border-slate-200">{service.route.from}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full" />
                    <span className="text-xl text-cyan-600">→</span>
                    <div className="h-1 flex-1 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full" />
                  </div>
                  <span className="font-semibold text-slate-800 bg-white px-4 py-2 rounded-lg border-2 border-slate-200">{service.route.to}</span>
                </div>
                {service.route.stops && service.route.stops.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.route.stops.map((stop, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 border-2 border-slate-200 hover:border-cyan-300 transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" />
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
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
                        <Route className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Tur Rotası ve Detaylar
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {service.tourDetails.stopsDescription.map((stop, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 text-white flex items-center justify-center text-base font-bold shadow-md">
                              {idx + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-slate-900 mb-2">
                              {stop.stopName}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
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
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Ziyaret Edilecek Yerler
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {service.tourDetails.highlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border-2 border-cyan-100 hover:border-cyan-300 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-sky-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fiyata Dahil Olanlar */}
                {service.tourDetails.includes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">
                        Fiyata Dahil Olanlar
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {service.tourDetails.includes.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 font-medium rounded-xl text-sm border-2 border-emerald-200 hover:border-emerald-300 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Katılımcı Bilgisi */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-amber-900">
                      Katılımcı Sayısı
                    </h3>
                  </div>
                  <p className="text-base text-amber-800">
                    Minimum <span className="font-bold text-amber-900">{service.tourDetails.minParticipants}</span> kişi,
                    maksimum <span className="font-bold text-amber-900">{service.tourDetails.maxParticipants}</span> kişi
                  </p>
                </div>
              </>
            )}

            {/* Rezervasyon Notu */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-800 mb-2">Rezervasyon Bilgisi</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Bu tur için rezervasyon yaparak yerinizi ayırtabilirsiniz. Tur tarihleri ve
                    müsaitlik durumu için lütfen iletişime geçin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Toplam Fiyat</p>
                <p className="text-2xl font-bold text-cyan-700 mt-1">{service.price.display}</p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl text-base"
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
