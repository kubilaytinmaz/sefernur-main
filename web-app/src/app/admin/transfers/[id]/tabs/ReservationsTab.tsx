import { Calendar, CheckCircle, Clock, Filter, Search, User, XCircle } from "lucide-react";
import { useState } from "react";

interface ReservationsTabProps {
  transferId: string;
}

// Mock reservation data (gerçek uygulamada Firebase'den gelecek)
interface Reservation {
  id: string;
  userId: string;
  userName: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  price: number;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  createdAt: string;
  specialRequests?: string;
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: "res1",
    userId: "u1",
    userName: "Ahmet Yılmaz",
    status: "confirmed",
    price: 1200,
    pickupDate: "2024-03-15",
    pickupTime: "10:00",
    passengers: 4,
    createdAt: "2024-03-01T10:30:00",
    specialRequests: "Çocuk koltuğu istiyorum",
  },
  {
    id: "res2",
    userId: "u2",
    userName: "Fatma Kaya",
    status: "completed",
    price: 1500,
    pickupDate: "2024-02-20",
    pickupTime: "14:30",
    passengers: 6,
    createdAt: "2024-02-15T14:20:00",
  },
  {
    id: "res3",
    userId: "u3",
    userName: "Mehmet Demir",
    status: "cancelled",
    price: 800,
    pickupDate: "2024-02-10",
    pickupTime: "08:00",
    passengers: 2,
    createdAt: "2024-02-05T09:00:00",
  },
  {
    id: "res4",
    userId: "u4",
    userName: "Zeynep Arslan",
    status: "pending",
    price: 1000,
    pickupDate: "2024-03-20",
    pickupTime: "16:00",
    passengers: 3,
    createdAt: "2024-03-08T11:00:00",
  },
  {
    id: "res5",
    userId: "u5",
    userName: "Ali Öztürk",
    status: "confirmed",
    price: 2000,
    pickupDate: "2024-03-25",
    pickupTime: "09:00",
    passengers: 8,
    createdAt: "2024-03-07T15:30:00",
  },
];

const STATUS_CONFIG = {
  confirmed: {
    label: "Onaylandı",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    icon: CheckCircle,
  },
  pending: {
    label: "Beklemede",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    icon: Clock,
  },
  cancelled: {
    label: "İptal",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    icon: XCircle,
  },
  completed: {
    label: "Tamamlandı",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: CheckCircle,
  },
};

export function ReservationsTab({ transferId }: ReservationsTabProps) {
  const [reservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // İstatistikler
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter((r) => r.status === "confirmed").length;
  const completedReservations = reservations.filter((r) => r.status === "completed").length;
  const cancelledReservations = reservations.filter((r) => r.status === "cancelled").length;
  const totalRevenue = reservations
    .filter((r) => r.status === "confirmed" || r.status === "completed")
    .reduce((sum, r) => sum + r.price, 0);

  // Filtreleme
  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange = matchesDateRange && r.pickupDate >= dateRange.start;
    }
    if (dateRange.end) {
      matchesDateRange = matchesDateRange && r.pickupDate <= dateRange.end;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Toplam Rezervasyon</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalReservations}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Onaylanan</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{confirmedReservations}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Tamamlanan</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{completedReservations}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">İptal</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{cancelledReservations}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₺{totalRevenue.toLocaleString("tr-TR")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="İsim veya rezervasyon no ara..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="confirmed">Onaylandı</option>
              <option value="pending">Beklemede</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rezervasyon No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Müşteri
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tarih
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kişi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fiyat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    Rezervasyon bulunamadı
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => {
                  const statusConfig = STATUS_CONFIG[reservation.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        #{reservation.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                            <User className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {reservation.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(reservation.pickupDate).toLocaleDateString("tr-TR")}
                          </p>
                          <p className="text-xs text-gray-500">{reservation.pickupTime}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {reservation.passengers}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-900">
                          ₺{reservation.price.toLocaleString("tr-TR")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                          Detay
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Toplam <span className="font-bold text-gray-900">{filteredReservations.length}</span>{" "}
            rezervasyon gösteriliyor
          </p>
          <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Dışa Aktar
          </button>
        </div>
      </div>
    </div>
  );
}
