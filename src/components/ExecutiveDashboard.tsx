import React, { useState } from "react";
import { Order, InventoryItem, Outlet, MenuItem, TableSaung } from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PieChart as PieIcon,
  Clock,
  AlertTriangle,
  CreditCard,
  Building2,
  Sparkles,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart3,
  Bot,
  Zap,
  ChevronRight,
  CheckCircle2,
  Users,
  Flame,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

interface ExecutiveDashboardProps {
  orders: Order[];
  inventory: InventoryItem[];
  outlets: Outlet[];
  currentOutlet: Outlet;
  menuItems: MenuItem[];
  tables: TableSaung[];
  onSelectTab: (tab: any) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  orders,
  inventory,
  outlets,
  currentOutlet,
  menuItems,
  tables,
  onSelectTab
}) => {
  const [selectedOutletFilter, setSelectedOutletFilter] = useState<string>("All");
  const [timeRange, setTimeRange] = useState<"Today" | "ThisWeek" | "ThisMonth">("Today");

  // AI Insight Generator State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Calculations: Omzet Hari Ini & Transaksi
  const paidOrders = orders.filter((o) => o.paymentStatus === "Paid");
  const unpaidOrders = orders.filter((o) => o.paymentStatus === "Unpaid");

  const todayOmset = paidOrders.reduce((acc, o) => acc + o.total, 0);
  const baseDemoOmset = todayOmset > 0 ? todayOmset : 18450000;
  const transactionCount = paidOrders.length > 0 ? paidOrders.length : 52;
  const avgTicket = transactionCount > 0 ? Math.round(baseDemoOmset / transactionCount) : 355000;

  // 2. Calculations: Laba Estimasi (Estimated Profit based on HPP)
  // Calculate total estimated HPP
  const totalHPP = paidOrders.reduce((acc, o) => {
    const orderHPP = o.items.reduce((itemAcc, item) => itemAcc + (item.costHPP * item.qty), 0);
    return acc + orderHPP;
  }, 0);
  const baseDemoHPP = totalHPP > 0 ? totalHPP : Math.round(baseDemoOmset * 0.38); // ~38% HPP
  const grossProfit = baseDemoOmset - baseDemoHPP;
  const profitMarginPct = Math.round((grossProfit / baseDemoOmset) * 100) || 62;

  // 3. Top Selling Products (Produk Terlaris)
  const productSalesMap: { [key: string]: { name: string; qty: number; revenue: number; image?: string; category?: string } } = {};
  
  if (paidOrders.length > 0) {
    paidOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!productSalesMap[it.menuName]) {
          productSalesMap[it.menuName] = { name: it.menuName, qty: 0, revenue: 0, category: it.category };
        }
        productSalesMap[it.menuName].qty += it.qty;
        productSalesMap[it.menuName].revenue += it.price * it.qty;
      });
    });
  }

  const topProductsList = Object.values(productSalesMap).length > 0
    ? Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5)
    : [
        { name: "Gurame Bakar Kecap Pasundan", qty: 48, revenue: 4560000, category: "Olahan Gurame & Nila" },
        { name: "Nasi Liwet Kastrol Rombongan", qty: 36, revenue: 3240000, category: "Nasi & Paket Liwet" },
        { name: "Ayam Goreng Lengkuas Kampung", qty: 30, revenue: 1050000, category: "Ayam & Bebek" },
        { name: "Es Kelapa Batok Muda", qty: 65, revenue: 1625000, category: "Minuman & Es" },
        { name: "Sambal Dadak Terasi Limau", qty: 55, revenue: 440000, category: "Sambal Khas Sunda" }
      ];

  // 4. Peak Hours (Jam Ramai) Chart Data
  const hourlyData = [
    { hour: "10:00", sales: 850000, orders: 3 },
    { hour: "11:00", sales: 2100000, orders: 7 },
    { hour: "12:00", sales: 5400000, orders: 16 },
    { hour: "13:00", sales: 4800000, orders: 14 },
    { hour: "14:00", sales: 1900000, orders: 5 },
    { hour: "15:00", sales: 1100000, orders: 4 },
    { hour: "16:00", sales: 800000, orders: 3 },
    { hour: "17:00", sales: 1600000, orders: 5 },
    { hour: "18:00", sales: 4200000, orders: 12 },
    { hour: "19:00", sales: 3600000, orders: 10 },
    { hour: "20:00", sales: 1800000, orders: 5 }
  ];

  // 5. Low Stock Alert (Stok Menipis)
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minStockAlert);

  // 6. Receivables / Unpaid Saung Bills (Hutang / Piutang)
  const unpaidTotal = unpaidOrders.reduce((acc, o) => acc + o.total, 0);
  const baseUnpaidTotal = unpaidTotal > 0 ? unpaidTotal : 1850000;
  
  // Pending Accounts Payable (Hutang Supplier Bahan)
  const supplierPayableTotal = 4250000; // Demowise accounts payable to local suppliers

  // 7. Multi-Outlet Performance Comparison (Performa Outlet)
  const outletPerformance = outlets.map((o, idx) => {
    const factor = idx === 0 ? 1 : idx === 1 ? 0.85 : 0.72;
    const omset = Math.round(baseDemoOmset * factor);
    const orderCnt = Math.round(transactionCount * factor);
    return {
      id: o.id,
      name: o.name,
      city: o.city,
      omset,
      orders: orderCnt,
      status: o.status,
      occupancyPct: idx === 0 ? 88 : idx === 1 ? 75 : 64
    };
  });

  // 8. AI Executive Insight Handler
  const handleGenerateAiInsight = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "operations",
          prompt: "Analisis performa eksekutif hari ini: berikan rekomendasi omset, kontrol HPP bahan baku, dan strategi cabang.",
          context: {
            omset: baseDemoOmset,
            profitMarginPct,
            topSelling: topProductsList[0]?.name,
            lowStockCount: lowStockItems.length
          }
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data.summary || data.data.title || "Rekomendasi Eksekutif AI Berhasil Dihasilkan.");
      }
    } catch {
      setAiAnalysis(
        "★ REKOMENDASI EKSEKUTIF AI:\n1. Omset cabang utama menunjukkan tren positif (+14.2%).\n2. Dorong penjualan Paket Liwet Kastrol Rombongan di jam peak 12:00-13:00 untuk memaksimalkan kapasitas saung.\n3. Segera amankan stok Ikan Gurame & Cabe Rawit karena proyeksi weekend mengalami peningkatan lonjakan pengunjung hingga 30%."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border border-amber-500/40 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-stone-950 font-bold shadow-xl">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Business Command Center</span>
            </div>
            <h2 className="font-serif font-bold text-2xl text-amber-100">
              Dashboard Eksekutif RM Saung Pasundan
            </h2>
            <p className="text-xs text-stone-300 max-w-xl mt-0.5">
              Ringkasan performa bisnis real-time seluruh cabang, laba estimasi, arus kas, stok kritis, dan prediksi AI.
            </p>
          </div>
        </div>

        {/* Time Filter & Refresh */}
        <div className="flex items-center gap-2 text-xs">
          {(["Today", "ThisWeek", "ThisMonth"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-2 rounded-xl font-bold transition ${
                timeRange === range
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800"
              }`}
            >
              {range === "Today" ? "Hari Ini" : range === "ThisWeek" ? "Minggu Ini" : "Bulan Ini"}
            </button>
          ))}

          <button
            onClick={handleGenerateAiInsight}
            disabled={isAiLoading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-stone-950 font-extrabold rounded-xl shadow-lg flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Bot className="w-4 h-4" />
            <span>{isAiLoading ? "AI Analisis..." : "AI Business Insight"}</span>
          </button>
        </div>
      </div>

      {/* AI Business Insight Alert Banner */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-stone-900 to-amber-950/90 border border-emerald-500/40 p-5 rounded-3xl shadow-xl space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-sm text-amber-200">
                AI Executive Business Insight & Actionable Advice
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-400/30">
              Gemini 3.6 Flash Verified
            </span>
          </div>
          <p className="text-xs text-stone-200 whitespace-pre-wrap leading-relaxed">
            {aiAnalysis}
          </p>
        </div>
      )}

      {/* 1 - 3. Core Metric KPI Cards (Omzet, Transaksi, Laba Estimasi, Piutang) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-amber-500/30 transition">
          <div className="flex justify-between items-center text-stone-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">1. Omzet Penjualan</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-emerald-400">
            {formatRupiah(baseDemoOmset)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800/80">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% YoY
            </span>
            <span className="text-stone-400 font-mono">
              Target: {formatRupiah(20000000)}
            </span>
          </div>
        </div>

        {/* Transaksi Count */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-amber-500/30 transition">
          <div className="flex justify-between items-center text-stone-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">2. Total Transaksi</span>
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-amber-300">
            {transactionCount} Struk Terbayar
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800/80">
            <span className="text-stone-300">Avg Ticket / Struk:</span>
            <span className="font-mono font-bold text-sky-300">{formatRupiah(avgTicket)}</span>
          </div>
        </div>

        {/* Laba Estimasi */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-amber-500/30 transition">
          <div className="flex justify-between items-center text-stone-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">3. Laba Estimasi (Profit)</span>
            <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-sky-400">
            {formatRupiah(grossProfit)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800/80">
            <span className="text-stone-400">Profit Margin:</span>
            <span className="font-mono font-extrabold text-emerald-400">{profitMarginPct}% Gross</span>
          </div>
        </div>

        {/* Hutang / Piutang */}
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-2 shadow-xl hover:border-amber-500/30 transition">
          <div className="flex justify-between items-center text-stone-400 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px]">4. Hutang & Piutang Saung</span>
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono font-extrabold text-2xl text-purple-300">
            {formatRupiah(baseUnpaidTotal)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800/80">
            <span className="text-stone-400">Tagihan Saung Aktif:</span>
            <span className="font-mono font-bold text-rose-400">{unpaidOrders.length || 3} Meja</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Deep Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Jam Ramai & Produk Terlaris (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Jam Ramai (Peak Hours Chart) */}
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-base text-amber-200">
                    5. Analisis Jam Ramai (Peak Hours)
                  </h3>
                  <p className="text-[11px] text-stone-400">Grafik omset dan jumlah transaksi pengunjung per jam</p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-mono font-bold">
                Puncak: 12:00 - 13:00 & 18:00
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#78716c" fontSize={11} />
                  <YAxis stroke="#78716c" fontSize={10} tickFormatter={(v) => `Rp${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1c1917", borderColor: "#f59e0b", borderRadius: "12px" }}
                    formatter={(value: any) => [formatRupiah(Number(value)), "Omset Jam Ini"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Produk Terlaris (Top Selling Menu) */}
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  4. Produk & Menu Terlaris (Top Sellers)
                </h3>
              </div>
              <button
                onClick={() => onSelectTab("inventory")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Kelola Menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {topProductsList.map((item, index) => (
                <div
                  key={item.name}
                  className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl font-mono font-bold flex items-center justify-center text-xs ${
                      index === 0
                        ? "bg-amber-500 text-stone-950"
                        : index === 1
                        ? "bg-stone-300 text-stone-950"
                        : index === 2
                        ? "bg-amber-800 text-amber-100"
                        : "bg-stone-900 text-stone-400 border border-stone-800"
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-amber-100">{item.name}</h4>
                      <span className="text-[10px] text-stone-400">{item.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">{formatRupiah(item.revenue)}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{item.qty} Porsi Terjual</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Stok Menipis, Hutang/Piutang & Performa Outlet (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Stok Menipis (Low Stock Alert) */}
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  6. Peringatan Stok Bahan Menipis
                </h3>
              </div>
              <span className="bg-rose-950/80 text-rose-300 border border-rose-500/40 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                {lowStockItems.length} Bahan Kritis
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((stk) => (
                  <div
                    key={stk.id}
                    className="bg-stone-950 p-3 rounded-2xl border border-rose-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-rose-200 block">{stk.name}</span>
                      <span className="text-[10px] text-stone-500">Supplier: {stk.supplierName}</span>
                    </div>
                    <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-xl border border-rose-500/20 text-xs">
                      {stk.currentStock} {stk.unit}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-stone-950 rounded-2xl border border-stone-800 text-stone-500 text-xs">
                  Semua stok bahan baku dapur dalam kondisi aman.
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectTab("inventory")}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold text-xs rounded-xl border border-stone-700 transition"
            >
              Restok Bahan Sekarang
            </button>
          </div>

          {/* Hutang / Piutang Detailed Table */}
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  7. Status Hutang & Piutang Resto
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between font-bold text-amber-200">
                  <span>Piutang Saung (Pelanggan Belum Bayar):</span>
                  <span className="font-mono text-purple-300">{formatRupiah(baseUnpaidTotal)}</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Tagihan berjalan di saung yang belum dicetak kasir.
                </p>
              </div>

              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1">
                <div className="flex justify-between font-bold text-amber-200">
                  <span>Hutang Supplier (Bahan Baku):</span>
                  <span className="font-mono text-rose-400">{formatRupiah(supplierPayableTotal)}</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Jatuh tempo pembayaran supplier bahan basah & ikan.
                </p>
              </div>
            </div>
          </div>

          {/* Performa Outlet (Multi-Outlet Performance) */}
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  8. Performa Antar Cabang Outlet
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {outletPerformance.map((out) => (
                <div
                  key={out.id}
                  className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-stone-100">{out.name}</h4>
                      <span className="text-[10px] text-stone-400">{out.city}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {formatRupiah(out.omset)}
                    </span>
                  </div>

                  <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${out.occupancyPct}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>{out.orders} Transaksi</span>
                    <span>Okupansi Saung: {out.occupancyPct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
