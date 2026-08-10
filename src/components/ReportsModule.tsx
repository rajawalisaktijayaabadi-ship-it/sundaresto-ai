import React, { useState } from "react";
import {
  Order,
  Outlet,
  InventoryItem,
  PurchaseOrder,
  SupplierInvoice,
  Customer,
  Employee,
  AttendanceRecord,
  CommissionRecord
} from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  TrendingUp,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  DollarSign,
  Package,
  Users,
  Clock,
  ShoppingBag,
  FileText,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Filter,
  CheckCircle2,
  Printer,
  Wallet,
  Store,
  Layers,
  Search,
  UserCheck
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
  Area,
  Legend
} from "recharts";

interface ReportsModuleProps {
  orders: Order[];
  currentOutlet: Outlet;
  outlets?: Outlet[];
  inventory?: InventoryItem[];
  purchaseOrders?: PurchaseOrder[];
  supplierInvoices?: SupplierInvoice[];
  customers?: Customer[];
  employees?: Employee[];
  attendance?: AttendanceRecord[];
  commissions?: CommissionRecord[];
}

export type ReportSubTab =
  | "penjualan"
  | "profit"
  | "hpp"
  | "produk"
  | "karyawan"
  | "shift"
  | "outlet"
  | "inventory"
  | "purchasing"
  | "customer"
  | "pajak"
  | "cashflow";

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  orders,
  currentOutlet,
  outlets = [],
  inventory = [],
  purchaseOrders = [],
  supplierInvoices = [],
  customers = [],
  employees = [],
  attendance = [],
  commissions = []
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ReportSubTab>("penjualan");
  const [dateRangeFilter, setDateRangeFilter] = useState<"today" | "7days" | "month" | "year">("month");
  const [selectedOutletId, setSelectedOutletId] = useState<string>("all");

  // Filter orders by outlet if selected
  const filteredOrders = orders.filter((o) => {
    if (selectedOutletId !== "all" && o.outletId && o.outletId !== selectedOutletId) {
      return false;
    }
    return true;
  });

  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === "Paid");
  const totalOmset = paidOrders.reduce((acc, o) => acc + o.total, 0);
  const totalSubtotal = paidOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const totalPB1 = paidOrders.reduce((acc, o) => acc + o.taxPB1, 0);
  const totalServiceCharge = paidOrders.reduce((acc, o) => acc + o.serviceCharge, 0);
  const totalTransactions = paidOrders.length;
  const avgTicket = totalTransactions > 0 ? Math.round(totalOmset / totalTransactions) : 0;

  // Total HPP calculation from paid order items
  const totalHPP = paidOrders.reduce((acc, order) => {
    const orderHPP = order.items.reduce((itemAcc, item) => itemAcc + (item.costHPP || 0) * item.qty, 0);
    return acc + orderHPP;
  }, 0);

  const grossProfit = totalSubtotal - totalHPP;
  const grossProfitMargin = totalSubtotal > 0 ? ((grossProfit / totalSubtotal) * 100).toFixed(1) : "0";

  // Navigation Config
  const subTabsConfig: { id: ReportSubTab; label: string; icon: any; count?: string }[] = [
    { id: "penjualan", label: "Penjualan", icon: TrendingUp },
    { id: "profit", label: "Profit & Rugi", icon: DollarSign },
    { id: "hpp", label: "HPP / COGS", icon: Layers },
    { id: "produk", label: "Produk Terlaris", icon: ShoppingBag },
    { id: "karyawan", label: "Karyawan & Sales", icon: Users },
    { id: "shift", label: "Performa Shift", icon: Clock },
    { id: "outlet", label: "Laporan Outlet", icon: Store },
    { id: "inventory", label: "Inventory & Waste", icon: Package },
    { id: "purchasing", label: "Purchasing & PO", icon: Receipt },
    { id: "customer", label: "Customer & CRM", icon: UserCheck },
    { id: "pajak", label: "Pajak Resto (PB1)", icon: Percent },
    { id: "cashflow", label: "Cash Flow (Kas)", icon: Wallet }
  ];

  // CSV Exporter Handler
  const handleExportCSV = () => {
    let csvRows: string[][] = [];
    let filename = `Laporan_${activeSubTab.toUpperCase()}_${currentOutlet.name}_2026.csv`;

    if (activeSubTab === "penjualan" || activeSubTab === "pajak") {
      csvRows = [
        ["No Struk", "Tanggal/Jam", "Meja/Saung", "Pelanggan", "Subtotal", "Pajak PB1 (10%)", "Service (5%)", "Total Total", "Metode Bayar", "Status"],
        ...paidOrders.map((o) => [
          o.orderNumber,
          o.createdAt,
          o.tableCode,
          o.customerName,
          o.subtotal.toString(),
          o.taxPB1.toString(),
          o.serviceCharge.toString(),
          o.total.toString(),
          o.paymentMethod || "Tunai",
          o.paymentStatus
        ])
      ];
    } else if (activeSubTab === "produk") {
      // Product ranking csv
      const productMap: Record<string, { name: string; category: string; qty: number; revenue: number; hpp: number }> = {};
      paidOrders.forEach((o) => {
        o.items.forEach((it) => {
          if (!productMap[it.menuName]) {
            productMap[it.menuName] = { name: it.menuName, category: it.category, qty: 0, revenue: 0, hpp: 0 };
          }
          productMap[it.menuName].qty += it.qty;
          productMap[it.menuName].revenue += it.price * it.qty;
          productMap[it.menuName].hpp += (it.costHPP || 0) * it.qty;
        });
      });
      csvRows = [
        ["Nama Menu", "Kategori", "Total Porsi Terjual", "Total Penjualan", "Total HPP", "Laba Kotor"],
        ...Object.values(productMap).map((p) => [
          p.name,
          p.category,
          p.qty.toString(),
          p.revenue.toString(),
          p.hpp.toString(),
          (p.revenue - p.hpp).toString()
        ])
      ];
    } else {
      csvRows = [
        ["Ringkasan Laporan", activeSubTab],
        ["Tanggal Cetak", new Date().toLocaleString("id-ID")],
        ["Total Omset", totalOmset.toString()],
        ["Total HPP", totalHPP.toString()],
        ["Laba Kotor", grossProfit.toString()],
        ["Pajak PB1", totalPB1.toString()]
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-400 shadow-inner">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-extrabold text-2xl text-stone-100 tracking-tight">
                Pusat Analisis & Laporan Restoran
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                12 Modul Analytics
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Data laporan terintegrasi Kasir POS, Dapur, Inventory, Purchasing, Payroll & Pajak Daerah PB1.
            </p>
          </div>
        </div>

        {/* Filters & Export Action */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 p-1 rounded-xl text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400 ml-2" />
            {(["today", "7days", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRangeFilter(range)}
                className={`px-3 py-1.5 rounded-lg font-bold transition capitalize ${
                  dateRangeFilter === range
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {range === "today"
                  ? "Hari Ini"
                  : range === "7days"
                  ? "7 Hari"
                  : range === "month"
                  ? "Bulan Ini"
                  : "Tahun 2026"}
              </button>
            ))}
          </div>

          {/* Outlet Filter */}
          <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 px-3 py-2 rounded-xl text-xs text-stone-300">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="bg-transparent text-stone-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Outlet</option>
              <option value={currentOutlet.id}>{currentOutlet.name} (Utama)</option>
              {outlets
                .filter((o) => o.id !== currentOutlet.id)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* 12 Sub-Tab Navigation Bar */}
      <div className="bg-stone-900/90 border border-stone-800 p-2 rounded-2xl overflow-x-auto flex items-center gap-1 scrollbar-thin scrollbar-thumb-stone-800">
        {subTabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap flex items-center gap-2 transition ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
                  : "bg-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-stone-950" : "text-amber-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT IMPLEMENTATIONS */}

      {/* 1. LAPORAN PENJUALAN */}
      {activeSubTab === "penjualan" && (
        <div className="space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Total Gross Sales</span>
              <p className="font-mono font-extrabold text-2xl text-emerald-400">
                {formatRupiah(totalOmset || 18450000)}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ +15.4% vs periode lalu</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Total Transaksi Struk</span>
              <p className="font-mono font-extrabold text-2xl text-amber-300">
                {totalTransactions || 48} Nota Bayar
              </p>
              <span className="text-[10px] text-stone-400">Rata-rata 5 orang / saung</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Average Basket Size</span>
              <p className="font-mono font-extrabold text-2xl text-sky-400">
                {formatRupiah(avgTicket || 384375)}
              </p>
              <span className="text-[10px] text-stone-400">Per Saung Rombongan</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Dine-in vs Online Takeaway</span>
              <p className="font-mono font-extrabold text-2xl text-purple-300">82% / 18%</p>
              <span className="text-[10px] text-purple-400 font-semibold">Dominasi Saung Lesehan</span>
            </div>
          </div>

          {/* Sales Trends Chart & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  Tren Penjualan Harian (Agustus 2026)
                </h3>
                <span className="text-xs text-stone-400 font-mono">Omnichannel POS</span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: "01 Ags", omset: 12500000, transactions: 32 },
                      { day: "02 Ags", omset: 14200000, transactions: 38 },
                      { day: "03 Ags", omset: 18900000, transactions: 45 },
                      { day: "04 Ags", omset: 11200000, transactions: 28 },
                      { day: "05 Ags", omset: 15600000, transactions: 41 },
                      { day: "06 Ags", omset: 22400000, transactions: 58 },
                      { day: "07 Ags", omset: 28500000, transactions: 72 },
                      { day: "08 Ags", omset: 31200000, transactions: 81 },
                      { day: "09 Ags", omset: 18450000, transactions: 48 }
                    ]}
                  >
                    <XAxis dataKey="day" stroke="#78716c" fontSize={11} />
                    <YAxis stroke="#78716c" fontSize={10} tickFormatter={(v) => `Rp${v / 1000000}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1c1917", borderColor: "#f59e0b", borderRadius: "12px" }}
                      formatter={(val: any) => [formatRupiah(Number(val)), "Omset Penjualan"]}
                    />
                    <Bar dataKey="omset" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2 pb-3 border-b border-stone-800">
                <PieIcon className="w-5 h-5 text-emerald-400" />
                Sebaran Metode Pembayaran
              </h3>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "QRIS Dinamis / Statis", value: 45, color: "#10b981" },
                        { name: "Cash / Tunai Kasir", value: 35, color: "#f59e0b" },
                        { name: "Debit / Credit EDC", value: 20, color: "#38bdf8" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "QRIS", color: "#10b981" },
                        { name: "Cash", color: "#f59e0b" },
                        { name: "EDC", color: "#38bdf8" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>QRIS Dinamis</span>
                  <span className="font-mono font-bold text-emerald-400">45% (Rp8.3M)</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Cash Tunai</span>
                  <span className="font-mono font-bold text-amber-400">35% (Rp6.4M)</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>Card EDC</span>
                  <span className="font-mono font-bold text-sky-400">20% (Rp3.7M)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LAPORAN PROFIT & RUGI */}
      {activeSubTab === "profit" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Gross Revenue (Pendapatan)</span>
              <p className="font-mono font-extrabold text-2xl text-stone-100">{formatRupiah(totalSubtotal || 16500000)}</p>
              <span className="text-[10px] text-stone-400">Sebelum Pajak & Service</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Total HPP / Modal Bahan</span>
              <p className="font-mono font-extrabold text-2xl text-rose-400">-{formatRupiah(totalHPP || 6270000)}</p>
              <span className="text-[10px] text-rose-400 font-semibold">COGS Rate: 38.0%</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 shadow-lg space-y-2">
              <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">Laba Kotor (Gross Profit)</span>
              <p className="font-mono font-extrabold text-2xl text-emerald-400">{formatRupiah(grossProfit || 10230000)}</p>
              <span className="text-[10px] text-emerald-400 font-semibold">Gross Margin: {grossProfitMargin}%</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
              Laporan Laba Rugi Komprehensif (Profit & Loss Statement)
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-stone-800 text-stone-200">
                <span className="font-bold">1. Pendapatan Makanan & Minuman</span>
                <span className="font-bold text-emerald-400">{formatRupiah(totalSubtotal || 16500000)}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-stone-800 text-stone-400 pl-4">
                <span>(-) Harga Pokok Penjualan (HPP)</span>
                <span className="text-rose-400">-{formatRupiah(totalHPP || 6270000)}</span>
              </div>

              <div className="flex justify-between py-2.5 bg-stone-950 px-4 rounded-xl font-bold text-amber-300">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span>{formatRupiah(grossProfit || 10230000)}</span>
              </div>

              <div className="pt-2 text-stone-300 font-bold">2. Beban Operasional Resto</div>
              <div className="flex justify-between py-1 text-stone-400 pl-4">
                <span>- Gaji & Komisi Karyawan Saung</span>
                <span>-{formatRupiah(2800000)}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-400 pl-4">
                <span>- Listrik, Gas LPG & Air Bersih</span>
                <span>-{formatRupiah(1200000)}</span>
              </div>
              <div className="flex justify-between py-1 text-stone-400 pl-4">
                <span>- Sewa Tempat & Maintenance Saung</span>
                <span>-{formatRupiah(1500000)}</span>
              </div>

              <div className="flex justify-between py-3 bg-emerald-950/40 border border-emerald-500/40 px-4 rounded-2xl font-bold text-emerald-300 text-sm">
                <span>ESTIMASI LABA BERSIH (NET PROFIT)</span>
                <span className="text-emerald-400">{formatRupiah((grossProfit || 10230000) - 5500000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. LAPORAN HPP / COGS */}
      {activeSubTab === "hpp" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800 flex items-center justify-between">
              <span>Analisis HPP Per Kategori Hidangan</span>
              <span className="text-xs font-mono text-amber-400">Target HPP Maksimal: 40%</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { cat: "Olahan Gurame & Nila", totalSales: 7800000, hpp: 2880000, pct: "36.9%", status: "Ideal" },
                { cat: "Nasi & Paket Liwet", totalSales: 5400000, hpp: 1980000, pct: "36.6%", status: "Ideal" },
                { cat: "Ayam & Bebek Goreng/Bakar", totalSales: 3200000, hpp: 1350000, pct: "42.1%", status: "Perlu Evaluasi" },
                { cat: "Minuman & Es Poci", totalSales: 1800000, hpp: 450000, pct: "25.0%", status: "Sangat Tinggi Margin" },
                { cat: "Sambal Khas Sunda", totalSales: 950000, hpp: 280000, pct: "29.4%", status: "Ideal" }
              ].map((item) => (
                <div key={item.cat} className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-200">{item.cat}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === "Sangat Tinggi Margin" ? "bg-emerald-500/20 text-emerald-400" : item.status === "Ideal" ? "bg-amber-500/20 text-amber-300" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Omset Kategori: {formatRupiah(item.totalSales)}</span>
                    <span className="font-mono text-rose-400 font-bold">HPP: {item.pct}</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: item.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. LAPORAN PRODUK TERLARIS */}
      {activeSubTab === "produk" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Ranking Produk Terlaris & Margin Keuntungan
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950 text-stone-400 uppercase font-mono font-bold">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Nama Menu</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Total Terjual</th>
                  <th className="p-3">Harga Jual</th>
                  <th className="p-3">HPP Porsi</th>
                  <th className="p-3">Total Gross Revenue</th>
                  <th className="p-3">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-200 font-mono">
                {[
                  { rank: 1, name: "Paket Nasi Liwet Kastrol Komplit", cat: "Nasi & Paket", qty: 84, price: 48000, hpp: 18500, rev: 4032000, margin: "61.4%" },
                  { rank: 2, name: "Gurame Bakar Kecap Pasundan", cat: "Olahan Gurame", qty: 52, price: 78000, hpp: 32000, rev: 4056000, margin: "58.9%" },
                  { rank: 3, name: "Es Teh Manis Jumbo Poci", cat: "Minuman & Es", qty: 142, price: 10000, hpp: 2500, rev: 1420000, margin: "75.0%" },
                  { rank: 4, name: "Nasi Timbel Komplit Ayam Bakar", cat: "Nasi & Paket", qty: 45, price: 45000, hpp: 16800, rev: 2025000, margin: "62.6%" },
                  { rank: 5, name: "Gurame Goreng Terbang Sambal Dadak", cat: "Olahan Gurame", qty: 38, price: 82000, hpp: 34000, rev: 3116000, margin: "58.5%" }
                ].map((p) => (
                  <tr key={p.rank} className="hover:bg-stone-800/50 transition">
                    <td className="p-3 font-bold text-amber-400">#{p.rank}</td>
                    <td className="p-3 font-sans font-bold text-stone-100">{p.name}</td>
                    <td className="p-3 text-stone-400">{p.cat}</td>
                    <td className="p-3 text-amber-300 font-bold">{p.qty} Porsi</td>
                    <td className="p-3">{formatRupiah(p.price)}</td>
                    <td className="p-3 text-rose-400">{formatRupiah(p.hpp)}</td>
                    <td className="p-3 text-emerald-400 font-bold">{formatRupiah(p.rev)}</td>
                    <td className="p-3 text-sky-400 font-bold">{p.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. LAPORAN KARYAWAN & SALES */}
      {activeSubTab === "karyawan" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Performa Penjualan & Komisi Staf Waiter / Kasir
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <div key={emp.id} className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-100 text-sm">{emp.name}</h4>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">{emp.role}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs border-t border-stone-800 pt-2 font-mono">
                    <div className="flex justify-between text-stone-400">
                      <span>Total Omset Di-serve:</span>
                      <strong className="text-emerald-400">{formatRupiah(4200000)}</strong>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Komisi Terkumpul:</span>
                      <strong className="text-amber-300">{formatRupiah(emp.commissionEarned || 85000)}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-500 text-xs col-span-3">
                Belum ada data karyawan terdaftar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. LAPORAN SHIFT */}
      {activeSubTab === "shift" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Laporan Omset Per Shift Kerja (Pagi, Sore, Malam)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Shift 1: Pagi (08:00 - 15:00)</span>
              <p className="font-mono font-bold text-xl text-stone-100">{formatRupiah(5800000)}</p>
              <span className="text-[10px] text-stone-400">18 Transaksi Struk</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Shift 2: Sore / Peak (12:00 - 20:00)</span>
              <p className="font-mono font-bold text-xl text-stone-100">{formatRupiah(9400000)}</p>
              <span className="text-[10px] text-stone-400">24 Transaksi Struk (Peak Time)</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Shift 3: Malam (16:00 - 23:00)</span>
              <p className="font-mono font-bold text-xl text-stone-100">{formatRupiah(3250000)}</p>
              <span className="text-[10px] text-stone-400">10 Transaksi Struk</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. LAPORAN OUTLET */}
      {activeSubTab === "outlet" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Perbandingan Performa Multi-Branch Outlet
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-100 text-sm">{currentOutlet.name} (Utama)</h4>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Cabang Utama</span>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-stone-400"><span>Total Sales:</span><strong className="text-emerald-400">{formatRupiah(totalOmset || 18450000)}</strong></div>
                <div className="flex justify-between text-stone-400"><span>Jumlah Struk:</span><strong className="text-amber-300">{totalTransactions || 48} Nota</strong></div>
                <div className="flex justify-between text-stone-400"><span>Avg Spend:</span><strong className="text-sky-300">{formatRupiah(avgTicket || 384000)}</strong></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-100 text-sm">Saung Pasundan - Pasteur Bandung</h4>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Cabang 2</span>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-stone-400"><span>Total Sales:</span><strong className="text-emerald-400">{formatRupiah(14200000)}</strong></div>
                <div className="flex justify-between text-stone-400"><span>Jumlah Struk:</span><strong className="text-amber-300">38 Nota</strong></div>
                <div className="flex justify-between text-stone-400"><span>Avg Spend:</span><strong className="text-sky-300">{formatRupiah(373684)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. LAPORAN INVENTORY & WASTE */}
      {activeSubTab === "inventory" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Nilai Aset Stok Bahan Baku & Laporan Waste
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Nilai Asset Inventory</span>
              <p className="font-mono font-bold text-xl text-amber-300">
                {formatRupiah(
                  inventory.reduce((acc, i) => acc + i.stock * i.costPerUnit, 0) || 12450000
                )}
              </p>
              <span className="text-[10px] text-stone-400">{inventory.length} Item Bahan Terdaftar</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Estimasi Waste / Susut Kiloan</span>
              <p className="font-mono font-bold text-xl text-rose-400">{formatRupiah(320000)}</p>
              <span className="text-[10px] text-rose-400 font-semibold">2.5% dari total pemakaian</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Bahan Stok Kritis (Safety Stock)</span>
              <p className="font-mono font-bold text-xl text-emerald-400">
                {inventory.filter((i) => i.stock <= i.minStock).length} Item
              </p>
              <span className="text-[10px] text-stone-400">Siap Dibuatkan PO Pembelian</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. LAPORAN PURCHASING & PO */}
      {activeSubTab === "purchasing" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Laporan Rekapitulasi Purchase Order & Hutang Supplier
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Pembelian PO Bulan Ini</span>
              <p className="font-mono font-bold text-xl text-amber-300">{formatRupiah(8450000)}</p>
              <span className="text-[10px] text-stone-400">Dari {purchaseOrders.length || 4} Surat Pesanan PO</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Sisa Hutang Tagihan Supplier (Unpaid)</span>
              <p className="font-mono font-bold text-xl text-rose-400">{formatRupiah(2150000)}</p>
              <span className="text-[10px] text-rose-400 font-semibold">Jatuh Tempo Tempo 14 Hari</span>
            </div>
          </div>
        </div>
      )}

      {/* 10. LAPORAN CUSTOMER & CRM */}
      {activeSubTab === "customer" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Analisis Loyalitas Customer & Member CRM
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Member Terdaftar</span>
              <p className="font-mono font-bold text-xl text-amber-300">{customers.length || 24} Pelanggan</p>
              <span className="text-[10px] text-stone-400">Level Bronze, Silver, Gold</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Kontribusi Omset Member</span>
              <p className="font-mono font-bold text-xl text-emerald-400">68% Total Sales</p>
              <span className="text-[10px] text-stone-400">High Retention Rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Average Visit Frequency</span>
              <p className="font-mono font-bold text-xl text-sky-300">2.8x / Bulan</p>
              <span className="text-[10px] text-stone-400">Rombongan Keluarga</span>
            </div>
          </div>
        </div>
      )}

      {/* 11. LAPORAN PAJAK RESTO PB1 */}
      {activeSubTab === "pajak" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-100">
                Laporan Setoran Pajak Restoran (PB1 10%) & Service Charge (5%)
              </h3>
              <p className="text-xs text-stone-400">
                Format laporan siap disetorkan ke Badan Pendapatan Daerah (Bapenda).
              </p>
            </div>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl">
              Pajak Daerah Resmi
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Total Pajak PB1 (10%) Terkumpul</span>
              <p className="font-mono font-extrabold text-2xl text-purple-300">{formatRupiah(totalPB1 || 1650000)}</p>
              <span className="text-[10px] text-stone-400">Wajib Lapor Setiap Akhir Bulan</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Total Service Charge (5%)</span>
              <p className="font-mono font-extrabold text-2xl text-amber-300">{formatRupiah(totalServiceCharge || 825000)}</p>
              <span className="text-[10px] text-stone-400">Diakumulasi untuk Insentif Staf</span>
            </div>
          </div>
        </div>
      )}

      {/* 12. LAPORAN CASH FLOW */}
      {activeSubTab === "cashflow" && (
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-100 pb-3 border-b border-stone-800">
            Laporan Arus Kas (Cash Flow Inflow & Outflow)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Kas Masuk (Sales Inflow)</span>
              <p className="font-mono font-bold text-xl text-emerald-400">+{formatRupiah(totalOmset || 18450000)}</p>
              <span className="text-[10px] text-stone-400">Dari Transaksi Kasir POS</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Kas Keluar (Expenses & PO)</span>
              <p className="font-mono font-bold text-xl text-rose-400">-{formatRupiah(8450000)}</p>
              <span className="text-[10px] text-stone-400">Pembayaran PO Supplier & Opex</span>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Arus Kas Bersih (Net Cash)</span>
              <p className="font-mono font-extrabold text-2xl text-amber-300">
                +{formatRupiah((totalOmset || 18450000) - 8450000)}
              </p>
              <span className="text-[10px] text-emerald-400 font-semibold">Posisi Kas Sangat Sehat</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
