import React, { useState } from "react";
import {
  Building2,
  ArrowRightLeft,
  BarChart3,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Store,
  MapPin,
  Phone,
  UserCheck,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Edit,
  Trash2,
  ChevronRight,
  Filter,
  Check,
  X,
  PieChart
} from "lucide-react";
import {
  Outlet,
  StockTransfer,
  StockTransferItem,
  OutletAccessControl,
  InventoryItem,
  Order,
  Employee
} from "../types";

interface MultiOutletModuleProps {
  outlets: Outlet[];
  onAddOutlet: (newOutlet: Outlet) => void;
  onUpdateOutlet: (updatedOutlet: Outlet) => void;
  currentOutlet: Outlet;
  onSelectOutlet: (outlet: Outlet) => void;
  stockTransfers: StockTransfer[];
  onAddStockTransfer: (transfer: StockTransfer) => void;
  onUpdateTransferStatus: (transferId: string, newStatus: StockTransfer["status"]) => void;
  outletAccessControls: OutletAccessControl[];
  onUpdateOutletAccess: (access: OutletAccessControl) => void;
  inventory: InventoryItem[];
  orders: Order[];
  employees: Employee[];
}

export const MultiOutletModule: React.FC<MultiOutletModuleProps> = ({
  outlets,
  onAddOutlet,
  onUpdateOutlet,
  currentOutlet,
  onSelectOutlet,
  stockTransfers,
  onAddStockTransfer,
  onUpdateTransferStatus,
  outletAccessControls,
  onUpdateOutletAccess,
  inventory,
  orders,
  employees
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "consolidated" | "outlets" | "transfer" | "comparison" | "access"
  >("consolidated");

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals State
  const [isAddOutletModalOpen, setIsAddOutletModalOpen] = useState(false);
  const [isEditOutletModalOpen, setIsEditOutletModalOpen] = useState(false);
  const [selectedOutletToEdit, setSelectedOutletToEdit] = useState<Outlet | null>(null);

  const [isNewTransferModalOpen, setIsNewTransferModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [selectedAccessToEdit, setSelectedAccessToEdit] = useState<OutletAccessControl | null>(null);

  // New Outlet Form State
  const [newOutletForm, setNewOutletForm] = useState<Partial<Outlet>>({
    code: "OUT-NEW",
    name: "",
    city: "Bandung",
    address: "",
    phone: "",
    managerName: "",
    totalSaung: 10,
    totalMeja: 8,
    taxRatePct: 10,
    serviceChargePct: 5,
    status: "Aktif",
    operatingHours: "10:00 - 22:00",
    targetMonthlyOmset: 150000000
  });

  // New Transfer Form State
  const [transferForm, setTransferForm] = useState({
    fromOutletId: outlets.find((o) => o.isCentralKitchen)?.id || outlets[0]?.id || "out-1",
    toOutletId: outlets.find((o) => !o.isCentralKitchen)?.id || outlets[1]?.id || "out-2",
    requestedBy: "Asep Sunandar (Manager)",
    driverName: "Mang Ujang (L300 Box)",
    notes: "Pengiriman persediaan bumbu & bahan baku utama",
    items: [
      { itemId: inventory[0]?.id || "inv-1", itemName: inventory[0]?.name || "Bahan Utama", unit: inventory[0]?.unit || "kg", qty: 20, costPerUnit: inventory[0]?.avgCostPerUnit || 35000 }
    ] as StockTransferItem[]
  });

  // Calculate Consolidated Performance Metrics
  const mockBranchSalesData = [
    {
      outletId: "out-1",
      name: "Branch Dago",
      city: "Bandung",
      todaySales: 18450000,
      monthlySales: 162500000,
      targetSales: 180000000,
      transactions: 142,
      avgBasket: 130000,
      topItem: "Nasi Timbel Komplit Gurame",
      hppMarginPct: 32
    },
    {
      outletId: "out-2",
      name: "Branch Bogor Lesehan",
      city: "Bogor",
      todaySales: 22800000,
      monthlySales: 205000000,
      targetSales: 220000000,
      transactions: 188,
      avgBasket: 121000,
      topItem: "Paket Ayam Bakar Saung",
      hppMarginPct: 29
    },
    {
      outletId: "out-3",
      name: "Branch Serpong",
      city: "Tangerang Selatan",
      todaySales: 14200000,
      monthlySales: 138000000,
      targetSales: 160000000,
      transactions: 105,
      avgBasket: 135000,
      topItem: "Gurame Cobek Hijau",
      hppMarginPct: 31
    },
    {
      outletId: "out-4",
      name: "Central Kitchen Gedebage",
      city: "Bandung",
      todaySales: 8600000, // internal transfers cost
      monthlySales: 94000000,
      targetSales: 100000000,
      transactions: 45,
      avgBasket: 191000,
      topItem: "Bumbu Ungkep & Samber",
      hppMarginPct: 22
    }
  ];

  const totalConsolidatedToday = mockBranchSalesData.reduce((acc, curr) => acc + curr.todaySales, 0);
  const totalConsolidatedMonthly = mockBranchSalesData.reduce((acc, curr) => acc + curr.monthlySales, 0);
  const totalTransactions = mockBranchSalesData.reduce((acc, curr) => acc + curr.transactions, 0);

  // Filter transfers
  const filteredTransfers = stockTransfers.filter((t) => {
    const matchesSearch =
      t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromOutletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toOutletName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Add Outlet Submit
  const handleCreateOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutletForm.name || !newOutletForm.city) return;

    const created: Outlet = {
      id: `out-${Date.now()}`,
      code: newOutletForm.code || `OUT-${outlets.length + 1}`,
      name: newOutletForm.name,
      city: newOutletForm.city,
      address: newOutletForm.address || "Jl. Terusan Pasundan",
      phone: newOutletForm.phone || "022-8000900",
      totalSaung: Number(newOutletForm.totalSaung) || 10,
      totalMeja: Number(newOutletForm.totalMeja) || 6,
      taxRatePct: Number(newOutletForm.taxRatePct) || 10,
      serviceChargePct: Number(newOutletForm.serviceChargePct) || 5,
      status: newOutletForm.status as any || "Aktif",
      managerName: newOutletForm.managerName || "Manajer Baru",
      operatingHours: newOutletForm.operatingHours || "10:00 - 22:00",
      targetMonthlyOmset: Number(newOutletForm.targetMonthlyOmset) || 150000000
    };

    onAddOutlet(created);
    setIsAddOutletModalOpen(false);
    setNewOutletForm({
      code: "OUT-NEW",
      name: "",
      city: "Bandung",
      address: "",
      phone: "",
      managerName: "",
      totalSaung: 10,
      totalMeja: 8,
      taxRatePct: 10,
      serviceChargePct: 5,
      status: "Aktif"
    });
  };

  // Handle Edit Outlet Submit
  const handleSaveEditOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutletToEdit) return;
    onUpdateOutlet(selectedOutletToEdit);
    setIsEditOutletModalOpen(false);
    setSelectedOutletToEdit(null);
  };

  // Handle Create Transfer Submit
  const handleCreateTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fromOutlet = outlets.find((o) => o.id === transferForm.fromOutletId);
    const toOutlet = outlets.find((o) => o.id === transferForm.toOutletId);

    const totalCost = transferForm.items.reduce((sum, item) => sum + item.qty * item.costPerUnit, 0);

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNumber: `TRF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 899 + 100)}`,
      fromOutletId: transferForm.fromOutletId,
      fromOutletName: fromOutlet?.name || "Dapur Pusat",
      toOutletId: transferForm.toOutletId,
      toOutletName: toOutlet?.name || "Cabang Tujuan",
      requestDate: new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
      requestedBy: transferForm.requestedBy,
      driverName: transferForm.driverName,
      status: "In Transit",
      shippedDate: new Date().toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }),
      notes: transferForm.notes,
      items: transferForm.items,
      totalCost
    };

    onAddStockTransfer(newTransfer);
    setIsNewTransferModalOpen(false);
  };

  // Add Item Row to Transfer Form
  const handleAddItemToTransfer = () => {
    const defaultItem = inventory[0];
    if (!defaultItem) return;
    setTransferForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: defaultItem.id,
          itemName: defaultItem.name,
          unit: defaultItem.unit,
          qty: 10,
          costPerUnit: defaultItem.avgCostPerUnit || 25000
        }
      ]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Title & Sub-Tab Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-amber-200">
                Multi Outlet & Multi Cabang
              </h1>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
                {outlets.length} Cabang Terdaftar
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Kelola stok inter-cabang, perbandingan omset outlet, hak akses karyawan & dashboard konsolidasi
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOutletModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang Baru</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800">
        <button
          onClick={() => setActiveSubTab("consolidated")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === "consolidated"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>Dashboard Konsolidasi</span>
        </button>

        <button
          onClick={() => setActiveSubTab("outlets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === "outlets"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          }`}
        >
          <Store className="w-4 h-4 text-emerald-400" />
          <span>Daftar Cabang Resto</span>
        </button>

        <button
          onClick={() => setActiveSubTab("transfer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === "transfer"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
          <span>Transfer Stok Inter-Cabang</span>
          {stockTransfers.filter((t) => t.status === "In Transit" || t.status === "Pending").length > 0 && (
            <span className="bg-amber-500 text-stone-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
              {stockTransfers.filter((t) => t.status === "In Transit" || t.status === "Pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("comparison")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === "comparison"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          }`}
        >
          <PieChart className="w-4 h-4 text-indigo-400" />
          <span>Perbandingan Omset Outlet</span>
        </button>

        <button
          onClick={() => setActiveSubTab("access")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === "access"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>Hak Akses Per Outlet</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. TAB: CONSOLIDATED DASHBOARD */}
      {/* ========================================================= */}
      {activeSubTab === "consolidated" && (
        <div className="space-y-6">
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">Total Omset Konsolidasi Hari Ini</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-300 mt-2">
                Rp {totalConsolidatedToday.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% dibanding kemarin</span>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">Total Omset Bulan Ini (Agustus)</span>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold font-mono text-amber-300 mt-2">
                Rp {totalConsolidatedMonthly.toLocaleString("id-ID")}
              </p>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Target Konsolidasi: Rp 660.000.000 (77.2% Terpenuhi)
              </span>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">Total Nota Struk Kasir</span>
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold font-mono text-stone-100 mt-2">
                {totalTransactions} Struk Nota
              </p>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Rata-rata Basket: Rp {(totalConsolidatedToday / (totalTransactions || 1)).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">Cabang & Central Kitchen</span>
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-bold font-mono text-stone-100 mt-2">
                {outlets.length} Unit Operasional
              </p>
              <span className="text-[11px] text-purple-300 mt-2 block">
                3 Restaurant Saung + 1 Dapur Pusat
              </span>
            </div>
          </div>

          {/* Active Inter-Branch Transfer Alert Banner */}
          {stockTransfers.some((t) => t.status === "In Transit") && (
            <div className="bg-gradient-to-r from-amber-950/80 to-stone-900 border border-amber-500/40 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl font-bold animate-pulse">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-200">
                    Pengiriman Transfer Stok Sedang Berlangsung!
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {stockTransfers.filter((t) => t.status === "In Transit").length} transfer stok sedang dalam perjalanan driver antar cabang.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubTab("transfer")}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <span>Lihat Status Pengiriman</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Branch Performance Comparison Cards */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-100 font-serif">
                  Kinerja Omset & Pencapaian Target Per Cabang
                </h3>
                <p className="text-xs text-stone-400">
                  Perbandingan performa penjualan restaurant Saung Pasundan hari ini & target bulanan
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab("comparison")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Lihat Analisis Detail</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {mockBranchSalesData.map((branch, idx) => {
                const targetPct = Math.round((branch.monthlySales / branch.targetSales) * 100);
                const isCurrent = currentOutlet.id === branch.outletId;

                return (
                  <div
                    key={branch.outletId}
                    className={`bg-stone-950 border rounded-2xl p-4 transition relative flex flex-col justify-between ${
                      isCurrent ? "border-amber-500/60 shadow-lg shadow-amber-500/10" : "border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Rank #{idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Cabang Aktif Saat Ini
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-stone-100">{branch.name}</h4>
                      <p className="text-[11px] text-stone-400">{branch.city}</p>

                      <div className="mt-3 space-y-1">
                        <span className="text-[11px] text-stone-400 block">Omset Hari Ini</span>
                        <p className="text-base font-bold font-mono text-emerald-400">
                          Rp {branch.todaySales.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400">Pencapaian Target</span>
                          <span className="font-bold text-amber-300">{targetPct}%</span>
                        </div>
                        <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              targetPct >= 80
                                ? "bg-emerald-500"
                                : targetPct >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(targetPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 block text-right">
                          Target: Rp {(branch.targetSales / 1000000).toFixed(0)} Juta
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-stone-400">Menu Terlaris:</span>
                      <span className="font-semibold text-stone-200 truncate max-w-[120px]" title={branch.topItem}>
                        {branch.topItem}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const outObj = outlets.find((o) => o.id === branch.outletId);
                        if (outObj) onSelectOutlet(outObj);
                      }}
                      className="mt-3 w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-200 text-xs font-semibold rounded-xl border border-stone-800 transition"
                    >
                      Beralih Kasir Ke Cabang Ini
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB: BANYAK CABANG (OUTLET MANAGEMENT) */}
      {/* ========================================================= */}
      {activeSubTab === "outlets" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-base font-bold text-stone-100 font-serif">
              Master Data Cabang & Dapur Pusat
            </h2>
            <button
              onClick={() => setIsAddOutletModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Registrasi Cabang Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {outlets.map((outlet) => {
              const isSelected = currentOutlet.id === outlet.id;

              return (
                <div
                  key={outlet.id}
                  className={`bg-stone-900 border rounded-2xl p-5 space-y-4 transition ${
                    isSelected
                      ? "border-amber-500/70 shadow-xl shadow-amber-500/10 bg-gradient-to-b from-stone-900 to-stone-900/90"
                      : "border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          outlet.isCentralKitchen
                            ? "bg-purple-950 text-purple-300 border border-purple-500/40"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {outlet.isCentralKitchen ? <Building2 className="w-6 h-6" /> : <Store className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            {outlet.code || "OUT-01"}
                          </span>
                          <h3 className="text-base font-bold text-stone-100">{outlet.name}</h3>
                        </div>
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-500" />
                          <span>{outlet.address}, {outlet.city}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        outlet.isCentralKitchen
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                          : outlet.status === "Aktif" || !outlet.status
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      }`}
                    >
                      {outlet.status || "Aktif"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs">
                    <div>
                      <span className="text-stone-400 text-[10px] block">Manajer Cabang</span>
                      <span className="font-semibold text-stone-200">{outlet.managerName || "Belum Set"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Telepon / Hotline</span>
                      <span className="font-semibold text-stone-200">{outlet.phone || "-"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Jam Operasional</span>
                      <span className="font-semibold text-amber-300">{outlet.operatingHours || "10:00 - 22:00"}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Jumlah Saung Lesehan</span>
                      <span className="font-semibold text-emerald-400">{outlet.totalSaung} Saung</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Pajak PB1 & Service</span>
                      <span className="font-semibold text-stone-200">
                        {outlet.taxRatePct}% PB1 + {outlet.serviceChargePct}% Serv
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Target Omset/Bln</span>
                      <span className="font-semibold font-mono text-amber-400">
                        Rp {((outlet.targetMonthlyOmset || 150000000) / 1000000).toFixed(0)} Juta
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800/80">
                    <button
                      onClick={() => {
                        setSelectedOutletToEdit(outlet);
                        setIsEditOutletModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Info Cabang</span>
                    </button>

                    {isSelected ? (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        <span>Cabang Terpilih Saat Ini</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectOutlet(outlet)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Pilih Cabang Ini</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB: TRANSFER STOK (INTER-BRANCH TRANSFERS) */}
      {/* ========================================================= */}
      {activeSubTab === "transfer" && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari no. transfer, cabang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Semua Status Transfer</option>
                <option value="Pending">Pending (Menunggu)</option>
                <option value="In Transit">In Transit (Dalam Pengiriman)</option>
                <option value="Received">Received (Selesai Diterima)</option>
                <option value="Cancelled">Dibatalkan</option>
              </select>
            </div>

            <button
              onClick={() => setIsNewTransferModalOpen(true)}
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Buat Permintaan Transfer Stok Baru</span>
            </button>
          </div>

          {/* Transfers Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-950/80 text-stone-400 text-[11px] font-bold uppercase tracking-wider border-b border-stone-800">
                    <th className="p-3.5">No. Transfer</th>
                    <th className="p-3.5">Cabang Asal (Pengirim)</th>
                    <th className="p-3.5">Cabang Tujuan (Penerima)</th>
                    <th className="p-3.5">Detail Bahan / Item</th>
                    <th className="p-3.5">Nilai Biaya</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi Workflow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-xs">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-500">
                        Tidak ada riwayat transfer stok yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((trf) => (
                      <tr key={trf.id} className="hover:bg-stone-800/50 transition">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-amber-300 block">
                            {trf.transferNumber}
                          </span>
                          <span className="text-[10px] text-stone-400">{trf.requestDate}</span>
                        </td>

                        <td className="p-3.5 font-medium text-stone-200">
                          {trf.fromOutletName}
                        </td>

                        <td className="p-3.5 font-medium text-amber-200">
                          {trf.toOutletName}
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-1 max-w-xs">
                            {trf.items.map((it, i) => (
                              <div key={i} className="text-[11px] flex items-center justify-between gap-2">
                                <span className="text-stone-300 font-medium truncate">• {it.itemName}</span>
                                <span className="text-amber-400 font-mono font-semibold">
                                  {it.qty} {it.unit}
                                </span>
                              </div>
                            ))}
                            {trf.notes && (
                              <span className="text-[10px] text-stone-400 italic block mt-1">
                                "{trf.notes}"
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-stone-100">
                          Rp {trf.totalCost.toLocaleString("id-ID")}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              trf.status === "Received"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : trf.status === "In Transit"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                                : trf.status === "Pending"
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            }`}
                          >
                            {trf.status === "In Transit" && <Truck className="w-3 h-3" />}
                            {trf.status === "Received" && <CheckCircle2 className="w-3 h-3" />}
                            {trf.status === "Pending" && <Clock className="w-3 h-3" />}
                            <span>{trf.status}</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          {trf.status === "Pending" && (
                            <button
                              onClick={() => onUpdateTransferStatus(trf.id, "In Transit")}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition"
                            >
                              Kirim Stok Now
                            </button>
                          )}

                          {trf.status === "In Transit" && (
                            <button
                              onClick={() => onUpdateTransferStatus(trf.id, "Received")}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg text-xs transition flex items-center gap-1 ml-auto"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Konfirmasi Terima Stok</span>
                            </button>
                          )}

                          {trf.status === "Received" && (
                            <span className="text-[11px] text-stone-500 font-medium">
                              Sudah Masuk Inventori
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB: PERBANDINGAN OUTLET (BRANCH COMPARISON) */}
      {/* ========================================================= */}
      {activeSubTab === "comparison" && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
            <h2 className="text-base font-bold text-stone-100 font-serif mb-1">
              Matriks Perbandingan Performa Outlet
            </h2>
            <p className="text-xs text-stone-400 mb-4">
              Komparasi penjualan, nota transaksi, basket size, dan margin HPP antar cabang
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-950 text-stone-400 text-[11px] font-bold uppercase tracking-wider border-b border-stone-800">
                    <th className="p-3.5">Nama Cabang / Unit</th>
                    <th className="p-3.5">Kota</th>
                    <th className="p-3.5">Omset Hari Ini</th>
                    <th className="p-3.5">Omset Bulan Ini</th>
                    <th className="p-3.5">Target Bulan Ini</th>
                    <th className="p-3.5">Pencapaian %</th>
                    <th className="p-3.5">Trans. Struk</th>
                    <th className="p-3.5">Avg Basket</th>
                    <th className="p-3.5">Margin HPP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-xs">
                  {mockBranchSalesData.map((data) => {
                    const targetPct = Math.round((data.monthlySales / data.targetSales) * 100);

                    return (
                      <tr key={data.outletId} className="hover:bg-stone-800/40 transition">
                        <td className="p-3.5 font-bold text-stone-100 flex items-center gap-2">
                          <Store className="w-4 h-4 text-amber-400" />
                          <span>{data.name}</span>
                        </td>
                        <td className="p-3.5 text-stone-400">{data.city}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          Rp {data.todaySales.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-amber-300">
                          Rp {data.monthlySales.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono text-stone-400">
                          Rp {data.targetSales.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              targetPct >= 80
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {targetPct}%
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-stone-200">{data.transactions} Nota</td>
                        <td className="p-3.5 font-mono text-stone-300">
                          Rp {data.avgBasket.toLocaleString("id-ID")}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-purple-300">
                          {data.hppMarginPct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB: HAK AKSES PER OUTLET */}
      {/* ========================================================= */}
      {activeSubTab === "access" && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-stone-100 font-serif">
                  Pengaturan Otoritas & Hak Akses Cabang
                </h2>
                <p className="text-xs text-stone-400">
                  Tentukan cabang mana saja yang dapat diakses oleh manajer, kasir, atau koki
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-950 text-stone-400 text-[11px] font-bold uppercase tracking-wider border-b border-stone-800">
                    <th className="p-3.5">Nama Karyawan</th>
                    <th className="p-3.5">Jabatan / Role</th>
                    <th className="p-3.5">Cabang Utama</th>
                    <th className="p-3.5">Akses Cabang Terbuka</th>
                    <th className="p-3.5">Otoritas Transfer Stok</th>
                    <th className="p-3.5">Laporan Konsolidasi</th>
                    <th className="p-3.5 text-right">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-xs">
                  {outletAccessControls.map((acc) => (
                    <tr key={acc.employeeId} className="hover:bg-stone-800/40 transition">
                      <td className="p-3.5 font-bold text-stone-100 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>{acc.employeeName}</span>
                      </td>

                      <td className="p-3.5 text-stone-300">
                        <span className="bg-stone-800 px-2.5 py-1 rounded-full text-[11px] font-medium border border-stone-700">
                          {acc.role}
                        </span>
                      </td>

                      <td className="p-3.5 font-semibold text-amber-300">
                        {acc.primaryOutletName}
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {acc.accessibleOutletIds.map((id) => {
                            const outName = outlets.find((o) => o.id === id)?.name || id;
                            return (
                              <span
                                key={id}
                                className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-md"
                              >
                                {outName}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {acc.canCrossOutletTransfer ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Ya
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Tidak
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {acc.canViewConsolidatedReports ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Ya
                          </span>
                        ) : (
                          <span className="text-stone-500 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Tidak
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedAccessToEdit(acc);
                            setIsAccessModalOpen(true);
                          }}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition"
                        >
                          Ubah Hak Akses
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD OUTLET MODAL */}
      {/* ========================================================= */}
      {isAddOutletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Registrasi Cabang / Dapur Pusat Baru</span>
              </h3>
              <button
                onClick={() => setIsAddOutletModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOutlet} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Kode Cabang</label>
                  <input
                    type="text"
                    required
                    value={newOutletForm.code}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, code: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Status Operational</label>
                  <select
                    value={newOutletForm.status}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, status: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Dapur Pusat">Dapur Pusat (Central Kitchen)</option>
                    <option value="Renovasi">Renovasi</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nama Cabang Resto</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: RM Saung Pasundan - Branch Pasteur"
                  value={newOutletForm.name}
                  onChange={(e) => setNewOutletForm({ ...newOutletForm, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Kota</label>
                  <input
                    type="text"
                    required
                    value={newOutletForm.city}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, city: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Manajer Cabang</label>
                  <input
                    type="text"
                    value={newOutletForm.managerName}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, managerName: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={newOutletForm.address}
                  onChange={(e) => setNewOutletForm({ ...newOutletForm, address: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Jumlah Saung</label>
                  <input
                    type="number"
                    value={newOutletForm.totalSaung}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, totalSaung: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Jumlah Meja</label>
                  <input
                    type="number"
                    value={newOutletForm.totalMeja}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, totalMeja: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Target Omset (Rp)</label>
                  <input
                    type="number"
                    value={newOutletForm.targetMonthlyOmset}
                    onChange={(e) => setNewOutletForm({ ...newOutletForm, targetMonthlyOmset: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddOutletModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Simpan Cabang Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT OUTLET MODAL */}
      {/* ========================================================= */}
      {isEditOutletModalOpen && selectedOutletToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                <span>Edit Informasi Cabang: {selectedOutletToEdit.name}</span>
              </h3>
              <button
                onClick={() => setIsEditOutletModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOutlet} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Nama Cabang</label>
                  <input
                    type="text"
                    value={selectedOutletToEdit.name}
                    onChange={(e) => setSelectedOutletToEdit({ ...selectedOutletToEdit, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Manajer Cabang</label>
                  <input
                    type="text"
                    value={selectedOutletToEdit.managerName || ""}
                    onChange={(e) => setSelectedOutletToEdit({ ...selectedOutletToEdit, managerName: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Nomor Telepon Hotline</label>
                  <input
                    type="text"
                    value={selectedOutletToEdit.phone}
                    onChange={(e) => setSelectedOutletToEdit({ ...selectedOutletToEdit, phone: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Target Monthly Omset (Rp)</label>
                  <input
                    type="number"
                    value={selectedOutletToEdit.targetMonthlyOmset || 150000000}
                    onChange={(e) => setSelectedOutletToEdit({ ...selectedOutletToEdit, targetMonthlyOmset: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditOutletModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: NEW STOCK TRANSFER MODAL */}
      {/* ========================================================= */}
      {isNewTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <span>Buat Pengiriman / Transfer Stok Inter-Cabang</span>
              </h3>
              <button
                onClick={() => setIsNewTransferModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransferSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div>
                  <label className="text-stone-400 block mb-1">Cabang Asal (Pengirim)</label>
                  <select
                    value={transferForm.fromOutletId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromOutletId: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Cabang Tujuan (Penerima)</label>
                  <select
                    value={transferForm.toOutletId}
                    onChange={(e) => setTransferForm({ ...transferForm, toOutletId: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Nama Driver / Kurir</label>
                  <input
                    type="text"
                    value={transferForm.driverName}
                    onChange={(e) => setTransferForm({ ...transferForm, driverName: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="text-stone-400 block mb-1">Pemohon / Penanggung Jawab</label>
                  <input
                    type="text"
                    value={transferForm.requestedBy}
                    onChange={(e) => setTransferForm({ ...transferForm, requestedBy: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-stone-300 font-bold block">Daftar Bahan / Barang Yang Dikirim</label>
                  <button
                    type="button"
                    onClick={handleAddItemToTransfer}
                    className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Bahan</span>
                  </button>
                </div>

                {transferForm.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <select
                      value={item.itemId}
                      onChange={(e) => {
                        const invObj = inventory.find((i) => i.id === e.target.value);
                        if (!invObj) return;
                        const newItems = [...transferForm.items];
                        newItems[idx] = {
                          itemId: invObj.id,
                          itemName: invObj.name,
                          unit: invObj.unit,
                          qty: newItems[idx].qty,
                          costPerUnit: invObj.avgCostPerUnit || 25000
                        };
                        setTransferForm({ ...transferForm, items: newItems });
                      }}
                      className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-100 text-xs"
                    >
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} (Stok: {inv.currentStock} {inv.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => {
                        const newItems = [...transferForm.items];
                        newItems[idx].qty = Number(e.target.value);
                        setTransferForm({ ...transferForm, items: newItems });
                      }}
                      className="w-20 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-100 text-xs text-center"
                    />

                    <span className="text-stone-400 font-mono text-xs w-12">{item.unit}</span>

                    <button
                      type="button"
                      onClick={() => {
                        const newItems = transferForm.items.filter((_, i) => i !== idx);
                        setTransferForm({ ...transferForm, items: newItems });
                      }}
                      className="text-stone-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengiriman darurat persediaan weekend"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsNewTransferModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Kirim Permintaan Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: EDIT ACCESS CONTROL MODAL */}
      {/* ========================================================= */}
      {isAccessModalOpen && selectedAccessToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <span>Hak Akses Cabang: {selectedAccessToEdit.employeeName}</span>
              </h3>
              <button
                onClick={() => setIsAccessModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Pilih Cabang Terbuka yang Boleh Diakses:</label>
                <div className="space-y-2 bg-stone-950 p-3 rounded-xl border border-stone-800">
                  {outlets.map((o) => {
                    const hasAccess = selectedAccessToEdit.accessibleOutletIds.includes(o.id);

                    return (
                      <label key={o.id} className="flex items-center justify-between p-2 rounded hover:bg-stone-900 cursor-pointer">
                        <span className="text-stone-200 font-medium">{o.name} ({o.city})</span>
                        <input
                          type="checkbox"
                          checked={hasAccess}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...selectedAccessToEdit.accessibleOutletIds, o.id]
                              : selectedAccessToEdit.accessibleOutletIds.filter((id) => id !== o.id);
                            setSelectedAccessToEdit({
                              ...selectedAccessToEdit,
                              accessibleOutletIds: newIds
                            });
                          }}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-800 cursor-pointer">
                  <span className="text-stone-200 font-medium">Izin Buat Transfer Stok Inter-Cabang</span>
                  <input
                    type="checkbox"
                    checked={selectedAccessToEdit.canCrossOutletTransfer}
                    onChange={(e) =>
                      setSelectedAccessToEdit({
                        ...selectedAccessToEdit,
                        canCrossOutletTransfer: e.target.checked
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-800 cursor-pointer">
                  <span className="text-stone-200 font-medium">Akses Laporan Konsolidasi Semua Cabang</span>
                  <input
                    type="checkbox"
                    checked={selectedAccessToEdit.canViewConsolidatedReports}
                    onChange={(e) =>
                      setSelectedAccessToEdit({
                        ...selectedAccessToEdit,
                        canViewConsolidatedReports: e.target.checked
                      })
                    }
                    className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOutletAccess(selectedAccessToEdit);
                    setIsAccessModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl"
                >
                  Simpan Hak Akses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
