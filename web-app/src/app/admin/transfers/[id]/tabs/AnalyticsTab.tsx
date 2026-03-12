import { BarChart3, Calendar, Clock, DollarSign, Eye, MousePointer, TrendingUp, Users } from "lucide-react";

interface AnalyticsTabProps {
  transferId: string;
}

// Mock analytics data (gerçek uygulamada Firebase Analytics'ten gelecek)
const MOCK_ANALYTICS = {
  performance: {
    views: 1250,
    clicks: 340,
    conversions: 45,
    conversionRate: 13.2,
    avgTimeToBook: 2.5,
    returnCustomerRate: 28,
  },
  revenue: {
    total: 67500,
    byMonth: [
      { month: "Ocak", revenue: 12000 },
      { month: "Şubat", revenue: 18500 },
      { month: "Mart", revenue: 37000 },
    ],
  },
  customerBehavior: {
    mostBookedDays: ["Cuma", "Cumartesi", "Perşembe"],
    mostBookedHours: ["10:00", "14:00", "09:00"],
    avgPartySize: 4.2,
    cancellationRate: 8.5,
  },
  monthlyTrend: [
    { month: "Ocak", bookings: 12 },
    { month: "Şubat", bookings: 18 },
    { month: "Mart", bookings: 15 },
  ],
};

export function AnalyticsTab({ transferId }: AnalyticsTabProps) {
  const analytics = MOCK_ANALYTICS;

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Performans Metrikleri</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Görüntülenme</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {analytics.performance.views.toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tıklama</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {analytics.performance.clicks.toLocaleString("tr-TR")}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rezervasyon</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {analytics.performance.conversions}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Dönüşüm Oranı</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  %{analytics.performance.conversionRate}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ort. Rezervasyon Süresi</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {analytics.performance.avgTimeToBook} gün
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tekrar Müşteri Oranı</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  %{analytics.performance.returnCustomerRate}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Analysis */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Gelir Analizi</h3>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                ₺{analytics.revenue.total.toLocaleString("tr-TR")}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-emerald-600" />
          </div>

          <div className="space-y-3">
            {analytics.revenue.byMonth.map((item, index) => {
              const maxRevenue = Math.max(...analytics.revenue.byMonth.map((m) => m.revenue));
              const percentage = (item.revenue / maxRevenue) * 100;

              return (
                <div key={index}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.month}</span>
                    <span className="font-bold text-gray-900">
                      ₺{item.revenue.toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Booking Trend */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Aylık Rezervasyon Trendi</h3>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-end justify-around gap-4" style={{ height: "200px" }}>
            {analytics.monthlyTrend.map((item, index) => {
              const maxBookings = Math.max(...analytics.monthlyTrend.map((m) => m.bookings));
              const heightPercentage = (item.bookings / maxBookings) * 100;

              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full" style={{ height: `${heightPercentage}%` }}>
                    <div className="h-full w-full rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-600">
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm font-bold text-white">{item.bookings}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{item.month}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Behavior */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Müşteri Davranışı</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <p className="font-medium text-gray-900">En Çok Rezervasyon Yapılan Günler</p>
            </div>
            <div className="space-y-2">
              {analytics.customerBehavior.mostBookedDays.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-indigo-900">
                    {index + 1}. {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <p className="font-medium text-gray-900">En Çok Rezervasyon Yapılan Saatler</p>
            </div>
            <div className="space-y-2">
              {analytics.customerBehavior.mostBookedHours.map((hour, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-amber-900">
                    {index + 1}. {hour}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <p className="font-medium text-gray-900">Ortalama Grup Büyüklüğü</p>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {analytics.customerBehavior.avgPartySize} kişi
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <p className="font-medium text-gray-900">İptal Oranı</p>
            </div>
            <p className="text-3xl font-bold text-red-700">
              %{analytics.customerBehavior.cancellationRate}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-blue-900">📊 Analitik Bilgilendirme</h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>• Görüntülenme: Transfer sayfasının kaç kez görüntülendiği</li>
          <li>• Tıklama: Transfer detayına kaç kez tıklandığı</li>
          <li>• Dönüşüm Oranı: Tıklamalardan kaçının rezervasyona dönüştüğü</li>
          <li>• Veriler gerçek zamanlı güncellenir</li>
          <li>• Son 90 günlük veri gösterilmektedir</li>
        </ul>
      </div>
    </div>
  );
}
