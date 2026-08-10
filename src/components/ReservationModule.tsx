import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Home,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  DollarSign,
  Phone,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
  CreditCard,
  QrCode,
  Sparkles,
  UtensilsCrossed,
  MessageSquare
} from "lucide-react";
import {
  Reservation,
  ReservationStatus,
  TableSaung,
  Customer
} from "../types";

interface ReservationModuleProps {
  reservations: Reservation[];
  onAddReservation: (newReservation: Reservation) => void;
  onUpdateReservationStatus: (id: string, status: ReservationStatus, depositStatus?: "Belum DP" | "DP Lunas" | "Bebas DP (VIP)") => void;
  onSendReminder: (id: string) => void;
  tables: TableSaung[];
  customers: Customer[];
}

export const ReservationModule: React.FC<ReservationModuleProps> = ({
  reservations,
  onAddReservation,
  onUpdateReservationStatus,
  onSendReminder,
  tables,
  customers
}) => {
  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "dp_rules">("calendar");
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-09");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedReservationForReminder, setSelectedReservationForReminder] = useState<Reservation | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [resDate, setResDate] = useState("2026-08-09");
  const [resTime, setResTime] = useState("12:00");
  const [selectedSaungId, setSelectedSaungId] = useState(tables[0]?.id || "");
  const [guestCount, setGuestCount] = useState<number>(6);
  const [depositAmt, setDepositAmt] = useState<number>(150000);
  const [depositStat, setDepositStat] = useState<"Belum DP" | "DP Lunas" | "Bebas DP (VIP)">("DP Lunas");
  const [depositPayMethod, setDepositPayMethod] = useState<"QRIS BCA" | "Transfer Bank" | "Kasir Tunai">("QRIS BCA");
  const [specialReq, setSpecialReq] = useState("");
  const [notes, setNotes] = useState("");

  // Auto-fill customer details when selecting existing customer
  const handleSelectCustomer = (cId: string) => {
    setSelectedCustomerId(cId);
    if (!cId) {
      setCustName("");
      setCustPhone("");
      setCustEmail("");
      return;
    }

    const found = customers.find((c) => c.id === cId);
    if (found) {
      setCustName(found.name);
      setCustPhone(found.phone);
      setCustEmail(found.email);
      if (found.membershipTier === "Platinum" || found.membershipTier === "Gold") {
        setDepositStat("Bebas DP (VIP)");
        setDepositAmt(0);
      }
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((res) => {
    const matchesDate = activeTab === "calendar" ? res.reservationDate === selectedDate : true;
    const matchesSearch =
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery) ||
      res.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.saungTableName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === "All" || res.status === selectedStatusFilter;

    return matchesDate && matchesSearch && matchesStatus;
  });

  // Calculate daily KPIs
  const reservationsToday = reservations.filter((r) => r.reservationDate === selectedDate);
  const confirmedCount = reservationsToday.filter((r) => r.status === "Terkonfirmasi (DP Lunas)").length;
  const totalGuestsToday = reservationsToday.reduce((sum, r) => sum + r.guestCount, 0);
  const totalDepositCollected = reservationsToday.reduce((sum, r) => sum + r.depositAmount, 0);

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !selectedSaungId) return;

    const saungObj = tables.find((t) => t.id === selectedSaungId);

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      reservationNumber: `RSV-202608-${(reservations.length + 1).toString().padStart(3, "0")}`,
      customerId: selectedCustomerId || undefined,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail || undefined,
      saungTableId: selectedSaungId,
      saungTableName: saungObj ? saungObj.name : "Saung Lesehan",
      reservationDate: resDate,
      reservationTime: resTime,
      guestCount: Number(guestCount),
      depositAmount: Number(depositAmt),
      depositStatus: depositStat,
      depositPaymentMethod: depositStat === "Belum DP" ? undefined : depositPayMethod,
      specialRequests: specialReq,
      notes: notes,
      status: depositStat === "Belum DP" ? "Menunggu DP" : "Terkonfirmasi (DP Lunas)",
      reminderSent: false,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    onAddReservation(newRes);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setCustName("");
    setCustPhone("");
    setCustEmail("");
    setGuestCount(6);
    setDepositAmt(150000);
    setDepositStat("DP Lunas");
    setSpecialReq("");
    setNotes("");
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case "Terkonfirmasi (DP Lunas)":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            DP Lunas / Confirm
          </span>
        );
      case "Menunggu DP":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Menunggu DP
          </span>
        );
      case "Selesai (Seated)":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Users className="w-3.5 h-3.5" />
            Sudah Datang (Seated)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            Dibatalkan
          </span>
        );
    }
  };

  // Generate WhatsApp Message Text
  const getWhatsAppMessage = (res: Reservation) => {
    return `Sampurasun Kak ${res.customerName}! 🙏\n\nKami dari *RM Saung Pasundan Utama* mengonfirmasi reservasi meja/saung Anda:\n\n📌 *Nomor Reservasi:* ${res.reservationNumber}\n📅 *Tanggal:* ${res.reservationDate}\n⏰ *Jam:* ${res.reservationTime} WIB\n🏡 *Saung/Meja:* ${res.saungTableName}\n👥 *Jumlah Tamu:* ${res.guestCount} Orang\n💰 *Status DP:* ${res.depositStatus} (Rp ${res.depositAmount.toLocaleString("id-ID")})\n${res.specialRequests ? `✨ *Catatan Khusus:* ${res.specialRequests}\n` : ""}\nLokasi Saung: Jl. Dago Pakar No. 88, Bandung.\nHaturnuhun pisan & kami tunggu kehadirannya! 😊`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-100 font-serif tracking-tight">
                Sistem Reservasi & Booking Saung
              </h1>
              <p className="text-xs text-stone-400">
                Jadwal Kalender, Down Payment (DP), Integrasi Customer CRM & Automated WhatsApp Reminder
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Reservasi Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Booking Hari Ini</span>
            <CalendarIcon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">{reservationsToday.length} Reservasi</p>
          <span className="text-[11px] text-stone-400 mt-1 block">Tanggal: {selectedDate}</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>DP Terkonfirmasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{confirmedCount} Reservasi</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">DP Siap Ditempati</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Total Pax / Tamu</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">{totalGuestsToday} Orang</p>
          <span className="text-[11px] text-stone-400 mt-1 block">Estimasi kapasitas saung</span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-lg">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Total DP Diterima</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400">
            Rp {totalDepositCollected.toLocaleString("id-ID")}
          </p>
          <span className="text-[11px] text-stone-400 mt-1 block">Keuangan Kasir</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "calendar"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Jadwal Kalender & Timeline Saung</span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "list"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Semua Data Booking ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("dp_rules")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === "dp_rules"
                ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Ketentuan Down Payment (DP)</span>
          </button>
        </div>

        {/* Date Selector Quick Bar */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-400 font-medium">Pilih Tanggal:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: KALENDER & TIMELINE SAUNG */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          {/* Saung Availability Timeline View */}
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-100 font-serif">
                  Status Okupansi Saung Lesehan ({selectedDate})
                </h2>
                <p className="text-xs text-stone-400">
                  Visualisasi jam pemesanan tiap saung lesehan untuk menghindari bentrok / double-booking
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-stone-300">Terkonfirmasi</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-stone-300">Menunggu DP</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-stone-700" />
                  <span className="text-stone-400">Kosong</span>
                </span>
              </div>
            </div>

            {/* Tables Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {tables.map((table) => {
                const bookedRes = reservationsToday.filter((r) => r.saungTableId === table.id && r.status !== "Batal");
                return (
                  <div
                    key={table.id}
                    className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-amber-400" />
                        <h3 className="font-bold text-stone-200 text-sm">{table.name}</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                        Kapasitas {table.capacity} pax
                      </span>
                    </div>

                    {bookedRes.length === 0 ? (
                      <div className="p-3 rounded-xl bg-stone-900/50 border border-stone-800/50 text-center text-xs text-emerald-400 font-medium">
                        ✓ Saung Kosong / Bebas Booking Jam Berapapun
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {bookedRes.map((r) => (
                          <div
                            key={r.id}
                            className={`p-3 rounded-xl border text-xs flex flex-col gap-1 ${
                              r.status === "Terkonfirmasi (DP Lunas)"
                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                                : "bg-amber-950/20 border-amber-500/30 text-amber-200"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {r.reservationTime} WIB
                              </span>
                              <span>{r.guestCount} Pax</span>
                            </div>
                            <div className="font-semibold text-stone-100">{r.customerName}</div>
                            <div className="text-[11px] opacity-80 flex items-center justify-between">
                              <span>DP: Rp {r.depositAmount.toLocaleString("id-ID")}</span>
                              <span>{r.reservationNumber}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Reservations on Selected Date */}
          <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4">
            <h3 className="font-bold text-stone-100 text-base font-serif">
              Daftar Reservasi Khusus Tanggal {selectedDate}
            </h3>

            {reservationsToday.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-sm">
                Belum ada reservasi tercatat untuk tanggal ini.
              </div>
            ) : (
              <div className="space-y-3">
                {reservationsToday.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {res.reservationNumber}
                        </span>
                        <h4 className="font-bold text-stone-100 text-sm">{res.customerName}</h4>
                        {getStatusBadge(res.status)}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-stone-400 flex-wrap pt-1">
                        <span className="flex items-center gap-1 text-stone-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Jam {res.reservationTime} WIB
                        </span>
                        <span className="flex items-center gap-1 text-stone-300">
                          <Home className="w-3.5 h-3.5 text-amber-400" />
                          {res.saungTableName}
                        </span>
                        <span className="flex items-center gap-1 text-stone-300">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          {res.guestCount} Pax
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-500" />
                          {res.customerPhone}
                        </span>
                      </div>

                      {res.specialRequests && (
                        <p className="text-xs text-amber-300/90 italic bg-amber-950/20 p-2 rounded-lg border border-amber-900/30 mt-2">
                          <strong>Permintaan Khusus:</strong> {res.specialRequests}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-800">
                      <button
                        onClick={() => {
                          setSelectedReservationForReminder(res);
                          setIsReminderModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </button>

                      {res.status === "Menunggu DP" && (
                        <button
                          onClick={() => onUpdateReservationStatus(res.id, "Terkonfirmasi (DP Lunas)", "DP Lunas")}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition"
                        >
                          Tandai DP Lunas
                        </button>
                      )}

                      {res.status === "Terkonfirmasi (DP Lunas)" && (
                        <button
                          onClick={() => onUpdateReservationStatus(res.id, "Selesai (Seated)")}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 text-xs font-bold transition"
                        >
                          Tamu Datang (Seated)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEMUA DATA BOOKING (LIST VIEW) */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
              <input
                type="text"
                placeholder="Cari No. Reservasi, Nama Tamu, No HP, atau Saung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500"
              >
                <option value="All">Semua Status</option>
                <option value="Terkonfirmasi (DP Lunas)">Terkonfirmasi (DP Lunas)</option>
                <option value="Menunggu DP">Menunggu DP</option>
                <option value="Selesai (Seated)">Selesai (Seated)</option>
                <option value="Batal">Batal</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-stone-900/90 border border-stone-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 uppercase font-semibold border-b border-stone-800">
                  <tr>
                    <th className="p-4">No. Booking & Waktu</th>
                    <th className="p-4">Nama Pelanggan</th>
                    <th className="p-4">Saung & Pax</th>
                    <th className="p-4">Setoran DP</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-500">
                        Tidak ada data reservasi yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-stone-800/40 transition">
                        <td className="p-4">
                          <div className="font-mono font-bold text-amber-400">{res.reservationNumber}</div>
                          <div className="text-stone-300 font-semibold mt-0.5">
                            {res.reservationDate} ({res.reservationTime} WIB)
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-stone-100">{res.customerName}</div>
                          <div className="text-[11px] text-stone-400">{res.customerPhone}</div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-stone-200">{res.saungTableName}</div>
                          <div className="text-[11px] text-stone-400">{res.guestCount} Orang / Pax</div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-emerald-400">
                            Rp {res.depositAmount.toLocaleString("id-ID")}
                          </div>
                          <span className="text-[10px] text-stone-400">Status: {res.depositStatus}</span>
                        </td>

                        <td className="p-4">{getStatusBadge(res.status)}</td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedReservationForReminder(res);
                                setIsReminderModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                              title="Kirim Reminder WA"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            {res.status === "Menunggu DP" && (
                              <button
                                onClick={() => onUpdateReservationStatus(res.id, "Terkonfirmasi (DP Lunas)", "DP Lunas")}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                              >
                                Acc DP
                              </button>
                            )}

                            {res.status !== "Batal" && (
                              <button
                                onClick={() => onUpdateReservationStatus(res.id, "Batal")}
                                className="p-2 rounded-lg bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition"
                                title="Batalkan Reservasi"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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

      {/* TAB 3: KETENTUAN DP & SIMULATOR */}
      {activeTab === "dp_rules" && (
        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-100 font-serif">Kebijakan Down Payment (DP) & Reservasi Saung</h2>
            <p className="text-xs text-stone-400">Standar Operasional Prosedur penentuan DP untuk menjaga okupansi saung</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <h3 className="font-bold text-amber-400 text-sm">1. Standar Minimal DP</h3>
              <p className="text-stone-300 leading-relaxed">
                Reservasi reguler dikenakan minimal <strong className="text-stone-100">Rp 25.000 per pax</strong> atau minimal <strong className="text-stone-100">Rp 100.000 per saung</strong>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <h3 className="font-bold text-amber-400 text-sm">2. Pembebasan DP VIP</h3>
              <p className="text-stone-300 leading-relaxed">
                Member tier <strong className="text-purple-300">Platinum</strong> dan <strong className="text-amber-300">Gold</strong> mendapatkan fasilitas bebas DP otomatis saat booking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
              <h3 className="font-bold text-amber-400 text-sm">3. Potongan di Kasir</h3>
              <p className="text-stone-300 leading-relaxed">
                Uang muka / DP yang sudah dibayarkan otomatis memotong total billing transaksi saat cetak struk kasir POS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: FORM REFRESH / RESERVASI BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-stone-100 font-serif">Buat Reservasi Saung Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              {/* Select Existing Customer */}
              <div>
                <label className="text-stone-400 font-medium block mb-1">
                  Pilih Pelanggan dari Database CRM (Opsional)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Input Pelanggan Baru / Walk-in Guest --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.membershipTier} - {c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Nama Pemesan *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Contoh: Bpk. Haji Ahmad"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-400 font-medium block mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">Jam Kedatangan *</label>
                  <input
                    type="time"
                    required
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-stone-400 font-medium block mb-1">Jumlah Orang (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-medium block mb-1">Pilih Saung / Meja Lesehan *</label>
                <select
                  value={selectedSaungId}
                  onChange={(e) => setSelectedSaungId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Kapasitas: {t.capacity} pax)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs">Ketentuan Setoran Down Payment (DP)</span>
                  <select
                    value={depositStat}
                    onChange={(e) => setDepositStat(e.target.value as any)}
                    className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-[11px] text-stone-200 font-semibold"
                  >
                    <option value="DP Lunas">DP Lunas / Terbayar</option>
                    <option value="Belum DP">Belum DP (Pending)</option>
                    <option value="Bebas DP (VIP)">Bebas DP (Privilese VIP)</option>
                  </select>
                </div>

                {depositStat !== "Bebas DP (VIP)" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-500 block mb-1">Nominal DP (Rp)</label>
                      <input
                        type="number"
                        value={depositAmt}
                        onChange={(e) => setDepositAmt(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-emerald-400 font-bold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-stone-500 block mb-1">Metode Bayar DP</label>
                      <select
                        value={depositPayMethod}
                        onChange={(e) => setDepositPayMethod(e.target.value as any)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-stone-200"
                      >
                        <option value="QRIS BCA">QRIS BCA</option>
                        <option value="Transfer Bank">Transfer Bank</option>
                        <option value="Kasir Tunai">Kasir Tunai</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-stone-400 font-medium block mb-1">Pre-order Menu & Special Request</label>
                <textarea
                  rows={2}
                  value={specialReq}
                  onChange={(e) => setSpecialReq(e.target.value)}
                  placeholder="Contoh: Pre-order Gurame Cobek 2x, Minta saung dekat kolam, bawa kue ultah."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  Simpan Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WHATSAPP REMINDER SIMULATOR */}
      {isReminderModalOpen && selectedReservationForReminder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-stone-100 font-serif">Simulasi WhatsApp Reminder</h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Penerima: {selectedReservationForReminder.customerName}</span>
                <span>{selectedReservationForReminder.customerPhone}</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-stone-300 whitespace-pre-wrap leading-relaxed">
                {getWhatsAppMessage(selectedReservationForReminder)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  onSendReminder(selectedReservationForReminder.id);
                  const msg = encodeURIComponent(getWhatsAppMessage(selectedReservationForReminder));
                  const cleanPhone = selectedReservationForReminder.customerPhone.replace(/[^0-9]/g, "");
                  const waUrl = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.substring(1) : cleanPhone}?text=${msg}`;
                  window.open(waUrl, "_blank");
                  setIsReminderModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka WhatsApp Web & Kirim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
