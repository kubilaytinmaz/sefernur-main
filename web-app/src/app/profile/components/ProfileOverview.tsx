"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { formatTlUsdPairFromTl, formatTlUsdPairFromUsd } from "@/lib/currency";
import { getUserFavorites, getUserReviews, getUserVisaApplications } from "@/lib/firebase/domain";
import { getUserReservations } from "@/lib/firebase/reservations";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import {
    CalendarDays,
    ClipboardList,
    FileText,
    Heart,
    Star,
    TrendingUp,
} from "lucide-react";

interface ProfileOverviewProps {
  onNavigate: (tab: string) => void;
}

export default function ProfileOverview({ onNavigate }: ProfileOverviewProps) {
  const { user } = useAuthStore();
  const userId = user?.id ?? "";

  const reservationsQuery = useQuery({
    queryKey: ["reservations", userId],
    enabled: Boolean(userId),
    queryFn: () => getUserReservations(userId),
  });

  const favoritesQuery = useQuery({
    queryKey: ["favorites", userId],
    enabled: Boolean(userId),
    queryFn: () => getUserFavorites(userId),
  });

  const applicationsQuery = useQuery({
    queryKey: ["visa-applications", userId],
    enabled: Boolean(userId),
    queryFn: () => getUserVisaApplications(userId),
  });

  const reviewsQuery = useQuery({
    queryKey: ["reviews", userId],
    enabled: Boolean(userId),
    queryFn: () => getUserReviews(userId),
  });

  const reservations = reservationsQuery.data ?? [];
  const favorites = favoritesQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];

  const isLoading =
    reservationsQuery.isLoading ||
    favoritesQuery.isLoading ||
    applicationsQuery.isLoading ||
    reviewsQuery.isLoading;

  const stats = [
    {
      label: "Rezervasyonlar",
      value: reservations.length,
      icon: CalendarDays,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      tab: "reservations",
    },
    {
      label: "Favoriler",
      value: favorites.length,
      icon: Heart,
      color: "text-rose-500",
      bg: "bg-rose-50",
      tab: "favorites",
    },
    {
      label: "Vize Başvuruları",
      value: applications.length,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
      tab: "applications",
    },
    {
      label: "Yorumlar",
      value: reviews.length,
      icon: Star,
      color: "text-violet-600",
      bg: "bg-violet-50",
      tab: "reviews",
    },
  ];

  const activeReservations = reservations.filter(
    (r) => r.status === "pending" || r.status === "confirmed"
  );

  const recentReservations = reservations.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.tab}
            onClick={() => onNavigate(stat.tab)}
            className="text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Card className="border-gray-100 hover:border-emerald-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  {isLoading ? (
                    <div className="w-8 h-6 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Quick Info Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Active Reservations Summary */}
        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Aktif Rezervasyonlar
              </h3>
              <Badge variant="default">{activeReservations.length} aktif</Badge>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activeReservations.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Aktif rezervasyonunuz bulunmuyor.
              </p>
            ) : (
              <div className="space-y-2.5">
                {activeReservations.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-emerald-50 transition-colors cursor-pointer"
                    onClick={() => onNavigate("reservations")}
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.startDate.toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge
                      variant={r.status === "confirmed" ? "success" : "warning"}
                    >
                      {r.status === "confirmed" ? "Onaylandı" : "Beklemede"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                Son Aktiviteler
              </h3>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentReservations.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Henüz aktiviteniz bulunmuyor.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentReservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={r.imageUrl || "/placeholder-hotel.jpg"}
                        alt={r.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-hotel.jpg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.currency?.toUpperCase() === "USD"
                          ? formatTlUsdPairFromUsd(r.price)
                          : formatTlUsdPairFromTl(r.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
