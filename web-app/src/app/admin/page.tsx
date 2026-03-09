"use client";

import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
    getDashboardStats,
    getMonthlyReservationTrend,
    getRecentMessages,
    getRecentReservations,
    type DashboardStats,
    type MonthlyDataPoint,
} from "@/lib/firebase/admin-domain";
import { ContactMessageModel } from "@/types/contact";
import { ReservationModel } from "@/types/reservation";
import {
    Building2,
    CalendarCheck,
    Car,
    Compass,
    Loader2,
    Mail,
    MapPin,
    Megaphone,
    Percent,
    Plane,
    TrendingUp,
    UserCheck,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<MonthlyDataPoint[]>([]);
  const [recentReservations, setRecentReservations] = useState<
    ReservationModel[]
  >([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessageModel[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, t, rr, rm] = await Promise.all([
          getDashboardStats(),
          getMonthlyReservationTrend(6),
          getRecentReservations(5),
          getRecentMessages(5),
        ]);
        setStats(s);
        setTrend(t);
        setRecentReservations(rr);
        setRecentMessages(rm);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        İstatistikler yüklenemedi.
      </div>
    );
  }

  const reservationTypeLabels: Record<string, string> = {
    hotel: "Otel",
    tour: "Tur",
    transfer: "Transfer",
    guide: "Rehber",
    car: "Araç",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sistemin genel durumunu görüntüleyin
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Rezervasyon"
          value={stats.reservations.total}
          subtitle={`${stats.reservations.pending} beklemede`}
          icon={CalendarCheck}
        />
        <StatCard
          title="Toplam Gelir"
          value={`₺${stats.reservations.totalRevenue.toLocaleString("tr-TR")}`}
          subtitle="Onaylanan + Tamamlanan"
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Kullanıcılar"
          value={stats.userCount}
          subtitle={`${stats.newUsersThisMonth} bu ay yeni`}
          icon={Users}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          title="Okunmamış Mesajlar"
          value={stats.unreadMessages}
          subtitle={`${stats.visaProcessing} vize işlemde`}
          icon={Mail}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Content Stats */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">İçerik Durumu</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <Link href="/admin/tours" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Compass className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
            <p className="text-xl font-bold text-gray-900">{stats.tourCount}</p>
            <p className="text-xs text-gray-500">Turlar</p>
          </Link>
          <Link href="/admin/hotels" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Building2 className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <p className="text-xl font-bold text-gray-900">{stats.hotelCount}</p>
            <p className="text-xs text-gray-500">Oteller</p>
          </Link>
          <Link href="/admin/transfers" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Plane className="mx-auto mb-2 h-6 w-6 text-sky-600" />
            <p className="text-xl font-bold text-gray-900">{stats.transferCount}</p>
            <p className="text-xs text-gray-500">Transferler</p>
          </Link>
          <Link href="/admin/cars" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Car className="mx-auto mb-2 h-6 w-6 text-orange-600" />
            <p className="text-xl font-bold text-gray-900">{stats.carCount}</p>
            <p className="text-xs text-gray-500">Araçlar</p>
          </Link>
          <Link href="/admin/guides" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <UserCheck className="mx-auto mb-2 h-6 w-6 text-violet-600" />
            <p className="text-xl font-bold text-gray-900">{stats.guideCount}</p>
            <p className="text-xs text-gray-500">Rehberler</p>
          </Link>
          <Link href="/admin/places" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <MapPin className="mx-auto mb-2 h-6 w-6 text-rose-600" />
            <p className="text-xl font-bold text-gray-900">{stats.placeCount}</p>
            <p className="text-xs text-gray-500">Mekanlar</p>
          </Link>
          <Link href="/admin/campaigns" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Megaphone className="mx-auto mb-2 h-6 w-6 text-teal-600" />
            <p className="text-xl font-bold text-gray-900">{stats.campaignCount}</p>
            <p className="text-xs text-gray-500">Kampanyalar</p>
          </Link>
          <Link href="/admin/promotions" className="rounded-xl border border-gray-200 bg-white p-4 text-center transition-shadow hover:shadow-md">
            <Percent className="mx-auto mb-2 h-6 w-6 text-pink-600" />
            <p className="text-xl font-bold text-gray-900">{stats.promotionCount}</p>
            <p className="text-xs text-gray-500">İndirimler</p>
          </Link>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reservation Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Aylık Rezervasyon Trendi
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="#1d6b3c"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="#1d6b3c"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [value, "Rezervasyon"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#1d6b3c"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Aylık Gelir
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [
                    `₺${Number(value).toLocaleString("tr-TR")}`,
                    "Gelir",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#1d6b3c"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tables Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Reservations */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">
              Son Rezervasyonlar
            </h3>
            <Link
              href="/admin/reservations"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentReservations.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Henüz rezervasyon yok
              </p>
            ) : (
              recentReservations.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/reservations/${r.id}`}
                  className="flex items-center justify-between px-6 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {r.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reservationTypeLabels[r.type] ?? r.type} · ₺
                      {r.price.toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">
              Son Mesajlar
            </h3>
            <Link
              href="/admin/messages"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMessages.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Henüz mesaj yok
              </p>
            ) : (
              recentMessages.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 px-6 py-3"
                >
                  <div
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      m.isRead ? "bg-gray-300" : "bg-emerald-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {m.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {m.message}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {m.createdAt.toLocaleDateString("tr-TR")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reservation Status Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-base font-semibold text-gray-900">
          Rezervasyon Durumları
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              {
                label: "Beklemede",
                value: stats.reservations.pending,
                color: "bg-amber-500",
              },
              {
                label: "Onaylandı",
                value: stats.reservations.confirmed,
                color: "bg-emerald-500",
              },
              {
                label: "Tamamlandı",
                value: stats.reservations.completed,
                color: "bg-blue-500",
              },
              {
                label: "İptal",
                value: stats.reservations.cancelled,
                color: "bg-red-500",
              },
            ] as const
          ).map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${item.color}`} />
              <div>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
