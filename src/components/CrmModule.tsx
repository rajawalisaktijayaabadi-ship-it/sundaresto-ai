import React, { useState } from "react";
import {
  Users,
  Award,
  Gift,
  Search,
  Plus,
  Crown,
  Heart,
  History,
  TrendingUp,
  Tag,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Edit,
  Sliders,
  Percent,
  Check,
  X
} from "lucide-react";
import {
  Customer,
  Voucher,
  MembershipTier,
  CustomerSegment,
  CustomerPreference
} from "../types";

interface CrmModuleProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  vouchers: Voucher[];
  onAddVoucher: (voucher: Voucher) => void;
  onRedeemPoints: (customerId: string, voucher: Voucher) => boolean;
}

export const CrmModule: React.FC<CrmModuleProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  vouchers,
  onAddVoucher,
  onRedeemPoints
}) => {
  const [activeTab, setActiveTab] = useState<"database" | "membership" | "vouchers" | "segmentation">("database");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("All");
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [isPointAdjustOpen, setIsPointAdjustOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [pointAmount, setPointAmount] = useState<number>(50);
  const [pointReason, setPointReason] = useState<string>("Bonus Apresiasi Ulang Tahun");
  const [pointAction, setPointAction] = useState<"add" | "deduct">("add");

  // Form New Customer
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustTier, setNewCustTier] = useState<MembershipTier>("Bronze");
  const [newCustFavSaung, setNewCustFavSaung] = useState("Saung Lesehan");
  const [newCustFavDish, setNewCustFavDish] = useState("Paket Gurame Cobek");
  const [newCustSpiciness, setNewCustSpiciness] = useState("Sedang");
  const [newCustDietary, setNewCustDietary] = useState("");
  const [newCustBirthday, setNewCustBirthday] = useState("");

  // Form New Voucher
  const [vouchCode, setVouchCode] = useState("");
  const [vouchTitle, setVouchTitle] = useState("");
  const [vouchType, setVouchType] = useState<"Percent" | "FixedAmount" | "FreeItem">("Percent");
  const [vouchVal, setVouchVal] = useState<number>(10);
  const [vouchMinSpend, setVouchMinSpend] = useState<number>(200000);
  const [vouchValidUntil, setVouchValidUntil] = useState("2026-12-31");
  const [vouchTier, setVouchTier] = useState<"All" | MembershipTier>("All");
  const [vouchPoints, setVouchPoints] = useState<number>(100);
  const [vouchFreeItem, setVouchFreeItem] = useState("");
  const [vouchDesc, setVouchDesc] = useState("");

  // Filtered Customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSegment = selectedSegment === "All" || cust.segment === selectedSegment;
    const matchesTier = selectedTier === "All" || cust.membershipTier === selectedTier;

    return matchesSearch && matchesSegment && matchesTier;
  });

  // Calculate CRM Stats
  const totalCustomers = customers.length;
  const totalPlatinumGold = customers.filter(
    (c) => c.membershipTier === "Platinum" || c.membershipTier === "Gold"
  ).length;
  const avgSpendPerCust =
    customers.reduce((acc, curr) => acc + curr.totalSpent, 0) / (totalCustomers || 1);
  const totalPointsIssued = customers.reduce((acc, curr) => acc + curr.points, 0);

  // Tier color mapping
  const getTierBadge = (tier: MembershipTier) => {
    switch (tier) {
      case "Platinum":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 border border-purple-400/30">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            PLATINUM VIP
          </span>
        );
      case "Gold":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md shadow-amber-500/20 border border-amber-300/40">
            <Award className="w-3.5 h-3.5" />
            GOLD MEMBER
          </span>
        );
      case "Silver":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-700 text-stone-200 border border-stone-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-300" />
            SILVER MEMBER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
            BRONZE MEMBER
          </span>
        );
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      membershipTier: newCustTier,
      points: 100, // Bonus pendaftaran
      totalSpent: 0,
      visitCount: 1,
      joinDate: new Date().toISOString().split("T")[0],
      lastVisit: new Date().toISOString().split("T")[0],
      segment: "New Customer",
      preferences: {
        favoriteSaungType: newCustFavSaung,
        favoriteDish: newCustFavDish,
        spicinessLevel: newCustSpiciness,
        dietaryNote: newCustDietary,
        specialDates: newCustBirthday ? [{ label: "Ulang Tahun", date: newCustBirthday }] : []
      },
      transactionHistory: []
    };

    onAddCustomer(newCustomer);
    setSelectedCustomer(newCustomer);
    setIsAddCustomerOpen(false);
    resetCustomerForm();
  };

  const resetCustomerForm = () => {
    setNewCustName("");
    setNewCustPhone("");
    setNewCustEmail("");
    setNewCustTier("Bronze");
    setNewCustFavSaung("Saung Lesehan");
    setNewCustFavDish("Paket Gurame Cobek");
    setNewCustSpiciness("Sedang");
    setNewCustDietary("");
    setNewCustBirthday("");
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vouchCode || !vouchTitle) return;

    const newVoucher: Voucher = {
      id: `vouch-${Date.now()}`,
      code: vouchCode.toUpperCase().trim(),
      title: vouchTitle,
      discountType: vouchType,
      discountValue: Number(vouchVal),
      minSpend: Number(vouchMinSpend),
      validUntil: vouchValidUntil,
      tierRequired: vouchTier,
      pointsCost: Number(vouchPoints),
      freeItemName: vouchType === "FreeItem" ? vouchFreeItem : undefined,
      description: vouchDesc || `Voucher ${vouchTitle} khusus pelanggan saung.`
    };

    onAddVoucher(newVoucher);
    setIsAddVoucherOpen(false);
    setVouchCode("");
    setVouchTitle("");
    setVouchDesc("");
  };

  const handlePointAdjust = () => {
    if (!selectedCustomer) return;
    const change = pointAction === "add" ? pointAmount : -pointAmount;
    const newPoints = Math.max(0, selectedCustomer.points + change);

    const updated = {
      ...selectedCustomer,
      points: newPoints
    };

    onUpdateCustomer(updated);
    setSelectedCustomer(updated);
    setIsPointAdjustOpen(false);
  };

  const handleRedeemVoucherForCustomer = (v: Voucher) => {
    if (!selectedCustomer) return;
    if (selectedCustomer.points < v.pointsCost) {
      alert(`Poin ${selectedCustomer.name} tidak cukup (${selectedCustomer.points} poin). Dibutuhkan ${v.pointsCost} poin.`);
      return;
    }

    const success = onRedeemPoints(selectedCustomer.id, v);
    if (success) {
      const updated = {
        ...selectedCustomer,
        points: selectedCustomer.points - v.pointsCost
      };
      setSelectedCustomer(updated);
      alert(`Berhasil menukarkan Voucher ${v.title} untuk ${selectedCustomer.name}! Kode: ${v.code}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900/90 to-amber-950/40 border border-stone-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-100 font-serif tracking-tight">
                CRM & Loyalty Pelanggan Saung
              </h1>
              <p className="text-xs text-stone-400">
                Database Pelanggan, Tier Membership, Poin Reward, Voucher Promo & Segmentasi Preferensi Sunda
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          <button
            onClick={() => setIsAddVoucherOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-sm font-semibold transition shadow-md"
          >
            <Gift className="w-4 h-4 text-emerald-400" />
            <span>Buat Voucher Promo</span>
          </button>
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Pelanggan Baru</span>
          </button>
        </div>
      </div>

      {/* Top CRM Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800/80 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Total Pelanggan Terdaftar</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">{totalCustomers} Member</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +12% bulan ini
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800/80 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Member VIP (Gold & Platinum)</span>
            <Crown className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">{totalPlatinumGold} VIP Member</p>
          <span className="text-[11px] text-purple-300 mt-1 block">
            {(totalCustomers > 0 ? (totalPlatinumGold / totalCustomers) * 100 : 0).toFixed(0)}% dari total database
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800/80 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Rata-Rata Total Belanja</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">
            Rp {avgSpendPerCust.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[11px] text-stone-400 mt-1 block">per akun terdaftar</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800/80 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Total Poin Beredar</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{totalPointsIssued.toLocaleString("id-ID")} Poin</p>
          <span className="text-[11px] text-stone-400 mt-1 block">Siap ditukarkan voucher</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === "database"
              ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Database Pelanggan</span>
        </button>

        <button
          onClick={() => setActiveTab("membership")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === "membership"
              ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Tier Membership & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === "vouchers"
              ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Katalog Voucher ({vouchers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("segmentation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition whitespace-nowrap ${
            activeTab === "segmentation"
              ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Segmentasi & Promo Blast</span>
        </button>
      </div>

      {/* TAB 1: DATABASE PELANGGAN & DETAIL PROFIL */}
      {activeTab === "database" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Customer List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="text"
                  placeholder="Cari Nama, No HP, atau Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-500 mb-1 block font-medium">Segmentasi</label>
                  <select
                    value={selectedSegment}
                    onChange={(e) => setSelectedSegment(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="All">Semua Segment</option>
                    <option value="VIP Loyalist">VIP Loyalist</option>
                    <option value="High Spender">High Spender</option>
                    <option value="Frequent Diner">Frequent Diner</option>
                    <option value="Big Family Gathering">Big Family Gathering</option>
                    <option value="Risk of Churn">Risk of Churn</option>
                    <option value="New Customer">New Customer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-500 mb-1 block font-medium">Tier Membership</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
                  >
                    <option value="All">Semua Tier</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Tidak ada pelanggan yang cocok dengan filter.</p>
                </div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-gradient-to-r from-stone-900 to-stone-800 border-amber-500/80 shadow-lg"
                          : "bg-stone-900/80 border-stone-800/80 hover:border-stone-700 hover:bg-stone-800/40"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                      )}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-stone-100 text-sm">{cust.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-500" />
                              {cust.phone}
                            </span>
                          </div>
                        </div>
                        <div>{getTierBadge(cust.membershipTier)}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-800/60 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 block">Poin</span>
                          <span className="font-semibold text-amber-400">{cust.points} Poin</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-500 block">Total Belanja</span>
                          <span className="font-semibold text-stone-200">
                            Rp {(cust.totalSpent / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">Kunjungan</span>
                          <span className="font-semibold text-stone-200">{cust.visitCount}x</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Customer Detailed Card */}
          <div className="lg:col-span-7">
            {selectedCustomer ? (
              <div className="space-y-5">
                {/* Profile Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-900/90 border border-stone-800 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold text-xl font-serif shadow-lg shadow-amber-500/20">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-stone-100 font-serif">
                            {selectedCustomer.name}
                          </h2>
                          {getTierBadge(selectedCustomer.membershipTier)}
                        </div>
                        <p className="text-xs text-stone-400 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-stone-500" />
                            {selectedCustomer.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-stone-500" />
                            {selectedCustomer.email}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPointAdjustOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Penyesuaian Poin</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80">
                    <div>
                      <span className="text-[11px] text-stone-500 block">Saldo Poin</span>
                      <span className="text-lg font-bold text-amber-400">
                        {selectedCustomer.points} Poin
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">Total Belanja</span>
                      <span className="text-lg font-bold text-stone-200">
                        Rp {selectedCustomer.totalSpent.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">Kunjungan</span>
                      <span className="text-lg font-bold text-stone-200">
                        {selectedCustomer.visitCount} Kali
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block">Kunjungan Terakhir</span>
                      <span className="text-sm font-semibold text-stone-300 mt-0.5 block">
                        {selectedCustomer.lastVisit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Preferensi Kuliner Sunda & Tanggal Spesial */}
                <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-stone-100 text-base flex items-center gap-2 font-serif">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Preferensi Pelanggan (Sunda Dining Style)
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-amber-400 font-medium">
                      Segment: {selectedCustomer.segment}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <Utensils className="w-3.5 h-3.5 text-amber-400" />
                        <span>Area Saung Favorit:</span>
                        <strong className="text-stone-200">
                          {selectedCustomer.preferences.favoriteSaungType || "Saung Lesehan"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hidangan Khas Favorit:</span>
                        <strong className="text-stone-200">
                          {selectedCustomer.preferences.favoriteDish || "Gurame Cobek"}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tingkat Kepedasan:</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[11px]">
                          {selectedCustomer.preferences.spicinessLevel || "Sedang"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800/60 space-y-2">
                      <div className="text-xs text-stone-400">
                        <span className="block mb-1 text-stone-500 font-medium">Catatan Khusus / Alergi:</span>
                        <p className="text-stone-300 italic bg-stone-900/80 p-2 rounded-xl border border-stone-800 text-[11px]">
                          "{selectedCustomer.preferences.dietaryNote || "Tidak ada catatan alergi khusus."}"
                        </p>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] text-stone-500 block mb-1">Tanggal Penting:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCustomer.preferences.specialDates && selectedCustomer.preferences.specialDates.length > 0 ? (
                            selectedCustomer.preferences.specialDates.map((sd, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium"
                              >
                                <Calendar className="w-3 h-3" />
                                {sd.label}: {sd.date}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-stone-500 italic">Belum ada tanggal ulang tahun terdaftar</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.notes && (
                    <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90">
                      <strong>Catatan Manager:</strong> {selectedCustomer.notes}
                    </div>
                  )}
                </div>

                {/* Section 3: Tukarkan Voucher Poin Langsung */}
                <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
                  <h3 className="font-bold text-stone-100 text-base flex items-center gap-2 font-serif">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    Penukaran Voucher Poin untuk Member Ini
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vouchers.map((v) => {
                      const canRedeem = selectedCustomer.points >= v.pointsCost;
                      return (
                        <div
                          key={v.id}
                          className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                            canRedeem
                              ? "bg-stone-950/80 border-stone-800"
                              : "bg-stone-950/40 border-stone-900 opacity-60"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-amber-400">{v.code}</span>
                              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {v.pointsCost} Poin
                              </span>
                            </div>
                            <h4 className="font-bold text-stone-200 text-xs mt-1">{v.title}</h4>
                            <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{v.description}</p>
                          </div>

                          <button
                            disabled={!canRedeem}
                            onClick={() => handleRedeemVoucherForCustomer(v)}
                            className={`w-full mt-2 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                              canRedeem
                                ? "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/10"
                                : "bg-stone-800 text-stone-500 cursor-not-allowed"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{canRedeem ? "Tukarkan Poin Sekarang" : "Poin Tidak Cukup"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: Riwayat Transaksi */}
                <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
                  <h3 className="font-bold text-stone-100 text-base flex items-center gap-2 font-serif">
                    <History className="w-4 h-4 text-indigo-400" />
                    Riwayat Transaksi Terakhir
                  </h3>

                  {selectedCustomer.transactionHistory.length === 0 ? (
                    <p className="text-xs text-stone-500 italic text-center py-4">Belum ada riwayat transaksi tercatat.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedCustomer.transactionHistory.map((tx, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-400">{tx.orderId}</span>
                              <span className="text-stone-500">• {tx.date}</span>
                            </div>
                            <p className="text-stone-300 mt-1">{tx.itemsSummary}</p>
                          </div>
                          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                            <span className="font-bold text-emerald-400 text-sm block">
                              Rp {tx.total.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                              +{tx.pointsEarned} Poin Didapat
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-stone-900/50 border border-stone-800/80 text-stone-500">
                Pilih pelanggan di sebelah kiri untuk melihat detail profil.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TIER MEMBERSHIP & ATURAN POIN */}
      {activeTab === "membership" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Bronze Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-800/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 tracking-wider">TIER 1</span>
                <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-bold border border-amber-800">
                  BRONZE
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-100 font-serif">Member Biasa</h3>
                <p className="text-xs text-stone-400 mt-1">Syarat: Pendaftaran Awal (0 - Rp 2 Juta)</p>
              </div>
              <div className="space-y-2 pt-3 border-t border-stone-800 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dapat 1 Poin per Kelipatan Rp 10.000</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bonus 100 Poin Pendaftaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Akses Voucher Diskon Reguler</span>
                </div>
              </div>
            </div>

            {/* Silver Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-800/80 via-stone-900 to-stone-900 border border-stone-600/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-300 tracking-wider">TIER 2</span>
                <span className="px-2.5 py-1 rounded-full bg-stone-700 text-stone-200 text-xs font-bold border border-stone-500">
                  SILVER
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-100 font-serif">Member Setia</h3>
                <p className="text-xs text-stone-400 mt-1">Syarat: Belanja Kumulatif &gt; Rp 2.000.000</p>
              </div>
              <div className="space-y-2 pt-3 border-t border-stone-800 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span>Dapat 1.2x Multiplier Poin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span>Gratis Es Teh Manis / Poci saat Ultah</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span>Prioritas List Saung saat Weekend</span>
                </div>
              </div>
            </div>

            {/* Gold Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-stone-900 border border-amber-500/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 tracking-wider">TIER 3</span>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 text-xs font-bold shadow-md">
                  GOLD
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-100 font-serif">Member Prioritas</h3>
                <p className="text-xs text-stone-400 mt-1">Syarat: Belanja Kumulatif &gt; Rp 7.500.000</p>
              </div>
              <div className="space-y-2 pt-3 border-t border-stone-800 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dapat 1.5x Multiplier Poin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Diskon Ulang Tahun 10% (1 Bulan)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bebas Pilih Saung Lesehan Favorit</span>
                </div>
              </div>
            </div>

            {/* Platinum Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/60 via-stone-900 to-indigo-950/40 border border-purple-500/50 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 tracking-wider">TIER VIP</span>
                <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md">
                  PLATINUM
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-100 font-serif">Sunda Sultan VIP</h3>
                <p className="text-xs text-stone-400 mt-1">Syarat: Belanja Kumulatif &gt; Rp 15.000.000</p>
              </div>
              <div className="space-y-2 pt-3 border-t border-stone-800 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Dapat 2.0x Double Multiplier Poin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Bebas Deposit / DP Booking Saung VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Personal Manager Contact Line</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <h3 className="font-bold text-stone-100 text-lg font-serif">Aturan & Mekanisme Poin Loyalty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300">
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
                <h4 className="font-bold text-amber-400 text-sm mb-1">1. Perhitungan Perolehan Poin</h4>
                <p className="text-stone-400 leading-relaxed">
                  Setiap transaksi kasir otomatis memberikan <strong className="text-stone-200">1 Poin per Rp 10.000</strong>. Multiplier tier berlaku otomatis pada invoice kasir POS.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
                <h4 className="font-bold text-amber-400 text-sm mb-1">2. Masa Berlaku Poin</h4>
                <p className="text-stone-400 leading-relaxed">
                  Poin berlaku selama <strong className="text-stone-200">12 Bulan</strong> sejak perolehan. Poin yang tidak digunakan akan hangus secara bergulir di akhir tahun.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
                <h4 className="font-bold text-amber-400 text-sm mb-1">3. Penukaran Voucher</h4>
                <p className="text-stone-400 leading-relaxed">
                  Pelanggan dapat menukarkan poin dengan Voucher Makanan (Gurame, Kangkung) atau Potongan Belanja melalui aplikasi kasir / WhatsApp CRM.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KATALOG VOUCHER */}
      {activeTab === "vouchers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-100 font-serif">Daftar Voucher Promo & Loyalty</h2>
              <p className="text-xs text-stone-400">Voucher promo aktif yang dapat di-redeem dengan Poin Member</p>
            </div>
            <button
              onClick={() => setIsAddVoucherOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Voucher Promo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-900/80 border border-stone-800 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {v.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {v.pointsCost} Poin
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-100 text-base">{v.title}</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">{v.description}</p>
                </div>

                <div className="pt-3 border-t border-stone-800/80 text-xs text-stone-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Min. Belanja:</span>
                    <strong className="text-stone-200">Rp {v.minSpend.toLocaleString("id-ID")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Syarat Tier:</span>
                    <strong className="text-amber-300">{v.tierRequired} Member</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Berlaku S.d:</span>
                    <strong className="text-stone-300">{v.validUntil}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SEGMENTASI & PROMO BLAST */}
      {activeTab === "segmentation" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-100 font-serif">Segmentasi & Campaign Targeted Blast</h2>
              <p className="text-xs text-stone-400">
                Kirim pesan penawaran promo khusus melalui WhatsApp / SMS sesuai perilaku makan pelanggan
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Segment 1 */}
              <div
                onClick={() => {
                  setSelectedSegment("VIP Loyalist");
                  setIsBroadcastOpen(true);
                  setBroadcastMessage(
                    "Sampurasun Bpk/Ibu VIP! Nikmati Diskon Khusus 15% untuk reservasi Saung Lesehan VIP akhir pekan ini di Resto Saung Parahyangan. Balas YA untuk booking."
                  );
                }}
                className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    VIP Loyalist
                  </span>
                  <Send className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition" />
                </div>
                <h3 className="font-bold text-stone-100 text-sm">
                  {customers.filter((c) => c.segment === "VIP Loyalist").length} Member VIP
                </h3>
                <p className="text-xs text-stone-400">
                  Pelanggan langganan dengan belanja di atas Rp 10 Juta &amp; frekuensi sering.
                </p>
              </div>

              {/* Segment 2 */}
              <div
                onClick={() => {
                  setSelectedSegment("Risk of Churn");
                  setIsBroadcastOpen(true);
                  setBroadcastMessage(
                    "Kami Rindu Kehadiran Anda! Dapatkan Voucher Gratis Tumis Kangkung Oncom + Bonus 100 Poin untuk kunjungan Anda minggu ini di Saung Parahyangan."
                  );
                }}
                className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    Risk of Churn (&gt; 90 Hari)
                  </span>
                  <Send className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition" />
                </div>
                <h3 className="font-bold text-stone-100 text-sm">
                  {customers.filter((c) => c.segment === "Risk of Churn").length} Member Pasif
                </h3>
                <p className="text-xs text-stone-400">
                  Pelanggan yang sudah lama tidak berkunjung. Cocok untuk campaign Win-back.
                </p>
              </div>

              {/* Segment 3 */}
              <div
                onClick={() => {
                  setSelectedSegment("Big Family Gathering");
                  setIsBroadcastOpen(true);
                  setBroadcastMessage(
                    "Rencanakan Momen Kumpul Keluarga Anda! Pesan Paket Nasi Liwet Castrol Komplit Saung Besar dengan Diskon Rp 100.000!"
                  );
                }}
                className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 cursor-pointer transition space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Big Family Gathering
                  </span>
                  <Send className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition" />
                </div>
                <h3 className="font-bold text-stone-100 text-sm">
                  {customers.filter((c) => c.segment === "Big Family Gathering").length} Keluarga
                </h3>
                <p className="text-xs text-stone-400">
                  Pelanggan yang suka membawa rombongan besar &amp; pesan liwet castrol.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH PELANGGAN BARU */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Pendaftaran Member Pelanggan Baru
              </h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibu Hj. Nunung"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Initial Tier</label>
                  <select
                    value={newCustTier}
                    onChange={(e) => setNewCustTier(e.target.value as MembershipTier)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bronze">Bronze (Standard)</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum VIP</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3">
                <h4 className="font-bold text-amber-400 text-xs font-serif">Preferensi Kuliner Sunda</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-stone-500 mb-1 block">Saung Favorit</label>
                    <input
                      type="text"
                      placeholder="e.g. Saung Lesehan 02"
                      value={newCustFavSaung}
                      onChange={(e) => setNewCustFavSaung(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 mb-1 block">Menu Favorit</label>
                    <input
                      type="text"
                      placeholder="e.g. Gurame Cobek"
                      value={newCustFavDish}
                      onChange={(e) => setNewCustFavDish(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 mb-1 block">Pedas</label>
                    <select
                      value={newCustSpiciness}
                      onChange={(e) => setNewCustSpiciness(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1.5 text-stone-200"
                    >
                      <option value="Sangat Pedas">Sangat Pedas</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Tidak Pedas">Tidak Pedas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-stone-500 mb-1 block">Tanggal Ulang Tahun</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Oktober"
                      value={newCustBirthday}
                      onChange={(e) => setNewCustBirthday(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 mb-1 block">Catatan Alergi / Pantangan</label>
                    <input
                      type="text"
                      placeholder="e.g. Alergi Udang"
                      value={newCustDietary}
                      onChange={(e) => setNewCustDietary(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Simpan &amp; Beri 100 Bonus Poin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BUAT VOUCHER PROMO */}
      {isAddVoucherOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-lg font-serif flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" />
                Buat Kode Voucher Promo Baru
              </h3>
              <button
                onClick={() => setIsAddVoucherOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Kode Voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUNDA-GURAME20"
                    value={vouchCode}
                    onChange={(e) => setVouchCode(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Judul Promo *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gratis 1 Gurame Cobek"
                    value={vouchTitle}
                    onChange={(e) => setVouchTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Tipe Promo</label>
                  <select
                    value={vouchType}
                    onChange={(e) => setVouchType(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-2 text-stone-200"
                  >
                    <option value="Percent">Diskon Persen (%)</option>
                    <option value="FixedAmount">Potongan Tunai (Rp)</option>
                    <option value="FreeItem">Gratis Menu Makanan</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Nilai Promo</label>
                  <input
                    type="number"
                    value={vouchVal}
                    onChange={(e) => setVouchVal(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Harga Poin</label>
                  <input
                    type="number"
                    value={vouchPoints}
                    onChange={(e) => setVouchPoints(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-amber-400 font-bold"
                  />
                </div>
              </div>

              {vouchType === "FreeItem" && (
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Nama Menu Gratis</label>
                  <input
                    type="text"
                    placeholder="e.g. Gurame Terbang Bumbu Cobek"
                    value={vouchFreeItem}
                    onChange={(e) => setVouchFreeItem(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Min. Belanja (Rp)</label>
                  <input
                    type="number"
                    value={vouchMinSpend}
                    onChange={(e) => setVouchMinSpend(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block font-medium">Syarat Member Tier</label>
                  <select
                    value={vouchTier}
                    onChange={(e) => setVouchTier(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-2 text-stone-200"
                  >
                    <option value="All">Semua Member</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-stone-400 mb-1 block font-medium">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat voucher..."
                  value={vouchDesc}
                  onChange={(e) => setVouchDesc(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-200 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddVoucherOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Terbitkan Voucher Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENYESUAIAN POIN MANUAL */}
      {isPointAdjustOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-base font-serif flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Penyesuaian Poin: {selectedCustomer.name}
              </h3>
              <button
                onClick={() => setIsPointAdjustOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-400">
                Saldo Poin Saat Ini: <strong className="text-amber-400">{selectedCustomer.points} Poin</strong>
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPointAction("add")}
                  className={`flex-1 py-2 rounded-xl font-bold transition border ${
                    pointAction === "add"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-stone-950 border-stone-800 text-stone-500"
                  }`}
                >
                  + Tambah Poin
                </button>
                <button
                  type="button"
                  onClick={() => setPointAction("deduct")}
                  className={`flex-1 py-2 rounded-xl font-bold transition border ${
                    pointAction === "deduct"
                      ? "bg-rose-500/20 border-rose-500 text-rose-300"
                      : "bg-stone-950 border-stone-800 text-stone-500"
                  }`}
                >
                  - Kurangi Poin
                </button>
              </div>

              <div>
                <label className="text-stone-400 mb-1 block">Jumlah Poin</label>
                <input
                  type="number"
                  value={pointAmount}
                  onChange={(e) => setPointAmount(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-stone-400 mb-1 block">Alasan / Catatan</label>
                <input
                  type="text"
                  value={pointReason}
                  onChange={(e) => setPointReason(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsPointAdjustOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={handlePointAdjust}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
                >
                  Simpan Perubahan Poin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SIMULASI BROADCAST PROMO */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100 text-base font-serif flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                Simulasi Broadcast WhatsApp Campaign
              </h3>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-stone-500 block mb-1">Target Segmentasi:</span>
                <strong className="text-amber-400 text-sm">{selectedSegment}</strong>
              </div>

              <div>
                <label className="text-stone-400 mb-1 block">Pesan WhatsApp Promo</label>
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-200 font-sans text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Pesan ini siap dikirim ke {customers.filter((c) => selectedSegment === "All" || c.segment === selectedSegment).length} kontak member melalui API WhatsApp Gateway Resto.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    alert(`Kampanye WhatsApp Promo berhasil dikirim ke segmen ${selectedSegment}!`);
                    setIsBroadcastOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Broadcast Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
