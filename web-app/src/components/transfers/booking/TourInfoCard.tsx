/**
 * TourInfoCard Component
 * Seçili tur bilgilerini gösteren kart bileşeni
 */

"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { PopularServiceModel } from "@/types/popular-service";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Route,
  Users,
} from "lucide-react";

interface TourInfoCardProps {
  tour: PopularServiceModel;
  onShowDetail: () => void;
}

export function TourInfoCard({ tour, onShowDetail }: TourInfoCardProps) {
  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-3xl shrink-0 shadow-sm">
            {tour.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-200 text-orange-800 border-0 text-xs">
                Seçili Tur
              </Badge>
              {tour.isPopular && (
                <Badge className="bg-amber-500 text-white border-0 text-xs gap-1">
                  <CheckCircle2 className="w-3 h-3 fill-white" /> Popüler
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{tour.name}</h3>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{tour.description}</p>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Süre</p>
            <p className="text-sm font-semibold text-slate-800">{tour.duration.text}</p>
          </div>
          {tour.distance && (
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <MapPin className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Mesafe</p>
              <p className="text-sm font-semibold text-slate-800">{tour.distance.text}</p>
            </div>
          )}
          {tour.tourDetails && (
            <div className="bg-white rounded-lg p-3 text-center shadow-sm">
              <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Kişi</p>
              <p className="text-sm font-semibold text-slate-800">
                {tour.tourDetails.minParticipants}-{tour.tourDetails.maxParticipants}
              </p>
            </div>
          )}
        </div>

        {/* Route */}
        {tour.route && (
          <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Route className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-slate-800">Güzergah</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">{tour.route.from}</span>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-0.5 flex-1 bg-orange-200" />
                <span className="text-xs text-orange-600">→</span>
                <div className="h-0.5 flex-1 bg-orange-200" />
              </div>
              <span className="font-medium text-slate-700">{tour.route.to}</span>
            </div>
            {tour.route.stops && tour.route.stops.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tour.route.stops.slice(0, 3).map((stop, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-md text-xs text-slate-600 border border-orange-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {stop}
                  </span>
                ))}
                {tour.route.stops.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-50 rounded-md text-xs text-orange-600 border border-orange-200">
                    +{tour.route.stops.length - 3} durak
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Includes */}
        {tour.tourDetails?.includes && tour.tourDetails.includes.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">Fiyata Dahil Olanlar</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tour.tourDetails.includes.slice(0, 4).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item}
                </span>
              ))}
              {tour.tourDetails.includes.length > 4 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200">
                  +{tour.tourDetails.includes.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Tur Fiyatı</p>
              <p className="text-lg font-bold text-orange-700">
                {tour.price.display}
                {tour.price.type === "per_person" && (
                  <span className="text-xs font-normal text-slate-500"> / kişi</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Fiyat Tipi</p>
              <p className="text-sm font-medium text-slate-700">
                {tour.price.type === "per_person" ? "Kişi Başı" : "Sabit Fiyat"}
              </p>
            </div>
          </div>
        </div>

        {/* Detail Button */}
        <Button
          variant="outline"
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400"
          onClick={onShowDetail}
        >
          <Info className="w-4 h-4 mr-2" />
          Tur Detaylarını Gör
        </Button>

        {/* Date Info */}
        <div className="mt-4 flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-orange-200">
          <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
          <p className="text-xs text-slate-600">
            Tur tarihi rezervasyon sonrası belirlenecektir. Müsaitlik durumu için iletişime geçebilirsiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
