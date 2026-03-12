"use client";

import { StatCard } from "@/components/admin/StatCard";
import {
    getTransferReports,
    type TransferReportData,
    type TransferReportFilters,
} from "@/lib/firebase/admin-domain";
import { vehicleTypeLabels, type VehicleType } from "@/types/transfer";
import {
    ArrowLeft,
    BarChart3,
    Calendar,
    Clock,
    DollarSign,
    Download,
    FileSpreadsheet,
    Loader2,
    Map,
    Percent,
    PieChart,
    RefreshCw,
    Star,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

// ─── Tab Types ────────────────────────────────────────────────────────────
type TabType = "charts" | "reports" | "export";

// ─── Pie Chart Colors ─────────────────────────────────────────────────────
const PIE_COLORS = ["#059669", "#0284c7", "#7c3aed", "#dc2626", "#d97706", "#0891b2"];

// ─── Export Types ─────────────────────────────────────────────────────────
type ExportFormat = "csv" | "excel" | "pdf";
type ExportReportType = "reservations" | "revenue" | "performance" | "customers";

// ─── Helper: Currency Format ──────────────────────────────────────────────
function formatCurrency(value: number): string {
  return `₺${value.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`;
}

// ─── Helper: Export CSV ───────────────────────────────────────────────────
function exportReportCSV(data: TransferReportData, reportType: ExportReportType) {
  let csvContent = "";
  const bom = "\ufeff";

  switch (reportType) {
    case "reservations": {
      csvContent = [
        "Ay;Rezervasyon Sayısı;Gelir (₺)",
        ...data.monthlyTrend.map((m) => `${m.label} (${m.month});${m.reservations};${m.revenue}`),
      ].join("\n");
      break;
    }
    case "revenue": {
      const vehicleRows = data.revenueByVehicleType.map((v) => `Araç Tipi: ${v.label};${v.revenue}`);
      const routeRows = data.revenueByRoute.map((r) => `Rota: ${r.route};${r.revenue}`);
      csvContent = ["Kaynak;Gelir (₺)", ...vehicleRows, ...routeRows].join("\n");
      break;
    }
    case "performance": {
      csvContent = [
        "Transfer;Rezervasyon Sayısı;Gelir (₺)",
        ...data.topPerformingTransfers.map((t) => `${t.name};${t.count};${t.revenue}`),
      ].join("\n");
      break;
    }
    case "customers": {
      csvContent = [
        "Metrik;Değer",
        `Toplam Müşteri;${data.customerStats.totalCustomers}`,
        `Tekrar Müşteri;${data.customerStats.returningCustomers}`,
        `Müşteri Başına Ortalama Değer;${data.customerStats.avgValuePerCustomer.toFixed(0)}`,
      ].join("\n");
      break;
    }
  }

  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `transfer-rapor-${reportType}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <p className="mb-1.5 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} className="text-xs text-gray-600" style={{ color: item.color }}>
          {item.name}: {item.name.includes("Gelir") ? formatCurrency(item.value) : item.value}
        </p>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

export default function TransferReportsPage() {
  const [reportData, setReportData] = useState<TransferReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("charts");

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | "">("");

  // Export
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportReportType, setExportReportType] = useState<ExportReportType>("reservations");
  const [exporting, setExporting] = useState(false);

  // ─── Load data ──────────────────────────────────────────────────────────
  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const filters: TransferReportFilters = {};
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      if (vehicleTypeFilter) filters.vehicleType = vehicleTypeFilter;

      const data = await getTransferReports(filters);
      setReportData(data);
    } catch (err) {
      console.error("Report load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, vehicleTypeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Export handler ─────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!reportData) return;
    setExporting(true);

    try {
      if (exportFormat === "csv" || exportFormat === "excel") {
        exportReportCSV(reportData, exportReportType);
      } else {
        // PDF - download as text for now
        exportReportCSV(reportData, exportReportType);
      }
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  }, [reportData, exportFormat, exportReportType]);

  // ─── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        Rapor verileri yüklenemedi.
      </div>
    );
  }

  const { summary } = reportData;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/transfers"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Raporlar & Analitik</h1>
              <p className="text-sm text-gray-500">Transfer performans raporlarını görüntüleyin</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Yenileniyor..." : "Yenile"}
        </button>
      </div>

      {/* ── Date Filters ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Başlangıç Tarihi</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Bitiş Tarihi</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500">Araç Tipi</label>
          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value as VehicleType | "")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Tümü</option>
            {Object.entries(vehicleTypeLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {(startDate || endDate || vehicleTypeFilter) && (
          <button
            onClick={() => { setStartDate(""); setEndDate(""); setVehicleTypeFilter(""); }}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-red-500"
          >
            <XCircle className="h-4 w-4" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* ── Summary Statistics ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Toplam Rezervasyon"
          value={summary.totalReservations}
          icon={Calendar}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Toplam Gelir"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Ort. Rezervasyon Değeri"
          value={formatCurrency(summary.avgBookingValue)}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Ortalama Puan"
          value={summary.avgRating.toFixed(1)}
          icon={Star}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Dönüşüm Oranı"
          value={`%${summary.conversionRate.toFixed(1)}`}
          icon={Percent}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="İptal Oranı"
          value={`%${summary.cancellationRate.toFixed(1)}`}
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {[
            { id: "charts" as TabType, label: "Grafikler", icon: BarChart3 },
            { id: "reports" as TabType, label: "Detaylı Raporlar", icon: FileSpreadsheet },
            { id: "export" as TabType, label: "Dışa Aktar", icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      {activeTab === "charts" && <ChartsTab data={reportData} />}
      {activeTab === "reports" && <DetailedReportsTab data={reportData} />}
      {activeTab === "export" && (
        <ExportTab
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          exportReportType={exportReportType}
          setExportReportType={setExportReportType}
          exporting={exporting}
          onExport={handleExport}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── CHARTS TAB ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function ChartsTab({ data }: { data: TransferReportData }) {
  return (
    <div className="space-y-6">
      {/* Row 1: Monthly trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Reservation Trend (Line/Area) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Aylık Rezervasyon Trendi
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlyTrend}>
              <defs>
                <linearGradient id="gradientReservations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="reservations"
                name="Rezervasyon"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#gradientReservations)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Revenue Trend (Bar) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Aylık Gelir Trendi
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Gelir" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Vehicle type & Popular routes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vehicle Type Usage (Pie) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <PieChart className="h-5 w-5 text-purple-600" />
            Araç Tipi Kullanım Oranları
          </h3>
          {data.vehicleTypeUsage.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPieChart>
                <Pie
                  data={data.vehicleTypeUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="label"
                  label={(entry: any) => `${entry.payload.label} %${entry.payload.percentage.toFixed(0)}`}
                >
                  {data.vehicleTypeUsage.map((_entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, "Adet"]} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
              Henüz veri bulunmuyor
            </div>
          )}
        </div>

        {/* Popular Routes (Horizontal Bar) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Map className="h-5 w-5 text-red-600" />
            Popüler Rotalar
          </h3>
          {data.popularRoutes.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.popularRoutes.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis
                  dataKey="route"
                  type="category"
                  width={150}
                  tick={{ fontSize: 10 }}
                  stroke="#9ca3af"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Rezervasyon" fill="#dc2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-gray-400">
              Henüz veri bulunmuyor
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Daily & Hourly Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Günlük Rezervasyon Dağılımı
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dailyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Rezervasyon" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-amber-600" />
            Saatlik Rezervasyon Dağılımı
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9ca3af" interval={2} />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Rezervasyon" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── DETAILED REPORTS TAB ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function DetailedReportsTab({ data }: { data: TransferReportData }) {
  const [reportSection, setReportSection] = useState<"revenue" | "performance" | "customer" | "cancellation">("revenue");

  return (
    <div className="space-y-6">
      {/* Report Section Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "revenue" as const, label: "Gelir Raporu", icon: DollarSign },
          { id: "performance" as const, label: "Performans Raporu", icon: TrendingUp },
          { id: "customer" as const, label: "Müşteri Raporu", icon: Users },
          { id: "cancellation" as const, label: "İptal Raporu", icon: XCircle },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setReportSection(section.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              reportSection === section.id
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Revenue Report */}
      {reportSection === "revenue" && (
        <div className="space-y-6">
          {/* Revenue by Vehicle Type */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Araç Tipine Göre Gelir</h3>
            </div>
            <div className="p-6">
              {data.revenueByVehicleType.length > 0 ? (
                <div className="space-y-3">
                  {data.revenueByVehicleType
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((item) => {
                      const maxRevenue = Math.max(...data.revenueByVehicleType.map((r) => r.revenue));
                      const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      return (
                        <div key={item.type}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{item.label}</span>
                            <span className="font-bold text-gray-900">{formatCurrency(item.revenue)}</span>
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
              ) : (
                <p className="text-center text-sm text-gray-400">Henüz gelir verisi bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Revenue by Route */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Rotaya Göre Gelir</h3>
            </div>
            <div className="p-6">
              {data.revenueByRoute.length > 0 ? (
                <div className="space-y-3">
                  {data.revenueByRoute.map((item, idx) => {
                    const maxRevenue = Math.max(...data.revenueByRoute.map((r) => r.revenue));
                    const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="max-w-[70%] truncate font-medium text-gray-700">{item.route}</span>
                          <span className="font-bold text-gray-900">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400">Henüz rota verisi bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Monthly Revenue Table */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">Aylık Gelir Tablosu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Ay</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Rezervasyon</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Gelir</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Ort. Değer</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyTrend.map((m, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{m.label} ({m.month})</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">{m.reservations}</td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(m.revenue)}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">
                        {m.reservations > 0 ? formatCurrency(m.revenue / m.reservations) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50">
                    <td className="px-6 py-3 text-sm font-bold text-emerald-900">Toplam</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-emerald-900">
                      {data.monthlyTrend.reduce((sum, m) => sum + m.reservations, 0)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-emerald-900">
                      {formatCurrency(data.monthlyTrend.reduce((sum, m) => sum + m.revenue, 0))}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-emerald-900">
                      {data.monthlyTrend.reduce((sum, m) => sum + m.reservations, 0) > 0
                        ? formatCurrency(
                            data.monthlyTrend.reduce((sum, m) => sum + m.revenue, 0) /
                            data.monthlyTrend.reduce((sum, m) => sum + m.reservations, 0),
                          )
                        : "-"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Report */}
      {reportSection === "performance" && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">En İyi Performans Gösteren Transferler</h3>
            <p className="mt-1 text-xs text-gray-500">Gelire göre sıralanmıştır</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Transfer Adı</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Rezervasyon</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Gelir</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">Ort. Değer</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformingTransfers.length > 0 ? (
                  data.topPerformingTransfers.map((t, idx) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/transfers/${t.id}`}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          {t.name}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">{t.count}</td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(t.revenue)}</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-600">
                        {t.count > 0 ? formatCurrency(t.revenue / t.count) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                      Henüz performans verisi bulunmuyor
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Report */}
      {reportSection === "customer" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{data.customerStats.totalCustomers}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tekrar Gelen Müşteri</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{data.customerStats.returningCustomers}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {data.customerStats.totalCustomers > 0
                      ? `%${((data.customerStats.returningCustomers / data.customerStats.totalCustomers) * 100).toFixed(1)}`
                      : "%0"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Müşteri Başına Ort. Değer</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {formatCurrency(data.customerStats.avgValuePerCustomer)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-blue-900">Müşteri Bilgilendirme</h4>
            <p className="text-xs text-blue-800">
              Tekrar gelen müşteri oranı, müşteri memnuniyetinin ve hizmet kalitesinin bir göstergesidir.
              Bu oranı artırmak için müşteri deneyimini iyileştirmeye ve sadakat programları oluşturmaya
              odaklanabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation Report */}
      {reportSection === "cancellation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam İptal</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    {data.cancellationReasons.reduce((sum, c) => sum + c.count, 0)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">İptal Oranı</p>
                  <p className="mt-2 text-3xl font-bold text-red-600">
                    %{data.summary.cancellationRate.toFixed(1)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <Percent className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Reasons */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-semibold text-gray-900">İptal Nedenleri</h3>
            </div>
            <div className="p-6">
              {data.cancellationReasons.length > 0 ? (
                <div className="space-y-3">
                  {data.cancellationReasons.map((item, idx) => (
                    <div key={idx}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.reason}</span>
                        <span className="font-bold text-gray-900">{item.count} (%{item.percentage.toFixed(1)})</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400">Henüz iptal verisi bulunmuyor</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── EXPORT TAB ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function ExportTab({
  exportFormat,
  setExportFormat,
  exportReportType,
  setExportReportType,
  exporting,
  onExport,
  startDate,
  endDate,
}: {
  exportFormat: ExportFormat;
  setExportFormat: (f: ExportFormat) => void;
  exportReportType: ExportReportType;
  setExportReportType: (r: ExportReportType) => void;
  exporting: boolean;
  onExport: () => void;
  startDate: string;
  endDate: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-900">Rapor Dışa Aktarma</h3>

        {/* Date Range Info */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Tarih Aralığı:</span>{" "}
            {startDate && endDate
              ? `${new Date(startDate).toLocaleDateString("tr-TR")} - ${new Date(endDate).toLocaleDateString("tr-TR")}`
              : startDate
              ? `${new Date(startDate).toLocaleDateString("tr-TR")} - Bugün`
              : endDate
              ? `Başlangıç - ${new Date(endDate).toLocaleDateString("tr-TR")}`
              : "Tüm zamanlar"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Tarih aralığını değiştirmek için sayfanın üstündeki filtreleri kullanın.
          </p>
        </div>

        {/* Report Type */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">Rapor Tipi</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "reservations" as ExportReportType, label: "Rezervasyon Raporu", desc: "Aylık rezervasyon ve gelir verileri" },
              { id: "revenue" as ExportReportType, label: "Gelir Raporu", desc: "Araç tipi ve rota bazlı gelir" },
              { id: "performance" as ExportReportType, label: "Performans Raporu", desc: "En iyi transfer performansları" },
              { id: "customers" as ExportReportType, label: "Müşteri Raporu", desc: "Müşteri istatistikleri" },
            ].map((rt) => (
              <button
                key={rt.id}
                onClick={() => setExportReportType(rt.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  exportReportType === rt.id
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{rt.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{rt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">Format</label>
          <div className="flex gap-3">
            {[
              { id: "csv" as ExportFormat, label: "CSV", desc: "Virgülle ayrılmış" },
              { id: "excel" as ExportFormat, label: "Excel", desc: "XLSX formatı" },
              { id: "pdf" as ExportFormat, label: "PDF", desc: "Yazdırmaya uygun" },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setExportFormat(fmt.id)}
                className={`flex-1 rounded-lg border p-3 text-center transition-colors ${
                  exportFormat === fmt.id
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{fmt.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{fmt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={exporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Dışa aktarılıyor...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Raporu İndir
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-blue-900">Rapor Bilgilendirme</h4>
        <p className="text-xs text-blue-800">
          Raporlar mevcut filtre ayarlarınıza göre oluşturulur. CSV ve Excel formatları
          tablo verilerini içerirken, PDF formatı grafikleri de içerecek şekilde tasarlanmıştır.
          Büyük veri setlerinde export işlemi birkaç saniye sürebilir.
        </p>
      </div>
    </div>
  );
}
