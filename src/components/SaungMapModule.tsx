import React, { useState } from "react";
import { TableSaung, Order, TableStatus, TableType } from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  LayoutGrid,
  Users,
  Clock,
  Receipt,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Plus,
  ArrowRightLeft,
  Utensils,
  ChevronRight,
  Filter,
  Calendar,
  Phone,
  DollarSign,
  FileText,
  Map,
  Grid,
  Merge,
  Split,
  X,
  Check,
  Sparkles,
  Info,
  Crown,
  Trees
} from "lucide-react";

interface SaungMapModuleProps {
  tables: TableSaung[];
  orders: Order[];
  onUpdateTableStatus: (
    tableId: string,
    status: TableStatus,
    customerName?: string,
    reservationInfo?: any
  ) => void;
  onMoveTable: (sourceTableCode: string, targetTableCode: string) => void;
  onMergeTables: (primaryTableCode: string, secondaryTableCodes: string[]) => void;
  onSelectTableForOrder: (tableCode: string, targetView?: "orders" | "pos" | "kds") => void;
  onOpenReceiptForOrder: (order: Order) => void;
}

export const SaungMapModule: React.FC<SaungMapModuleProps> = ({
  tables,
  orders,
  onUpdateTableStatus,
  onMoveTable,
  onMergeTables,
  onSelectTableForOrder,
  onOpenReceiptForOrder
}) => {
  // Layout View Mode: "floorplan" | "grid"
  const [viewLayout, setViewLayout] = useState<"floorplan" | "grid">("floorplan");

  // Filter States
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Selection & Modal States
  const [selectedTable, setSelectedTable] = useState<TableSaung | null>(null);

  // Reservation Modal State
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [resCustomerName, setResCustomerName] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resDate, setResDate] = useState("2026-08-09");
  const [resTime, setResTime] = useState("18:30");
  const [resPax, setResPax] = useState(8);
  const [resDp, setResDp] = useState(200000);
  const [resNotes, setResNotes] = useState("Minta setting Kastrol Nasi Liwet siap saji saat datang");
  const [resTargetTable, setResTargetTable] = useState("");

  // Move Table Modal State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveSourceCode, setMoveSourceCode] = useState("");
  const [moveTargetCode, setMoveTargetCode] = useState("");

  // Merge Table Modal State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [primaryMergeCode, setPrimaryMergeCode] = useState("");
  const [selectedSecondaryCodes, setSelectedSecondaryCodes] = useState<string[]>([]);

  // Filter Tables
  const filteredTables = tables.filter((t) => {
    const matchesType = typeFilter === "All" || t.type === typeFilter;
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case "Available":
        return {
          bg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
          dot: "bg-emerald-400",
          label: "Kosong"
        };
      case "Occupied":
        return {
          bg: "bg-rose-950/80 border-rose-500/40 text-rose-300",
          dot: "bg-rose-500",
          label: "Terisi"
        };
      case "Cooking":
        return {
          bg: "bg-amber-950/80 border-amber-500/40 text-amber-300",
          dot: "bg-amber-400 animate-pulse",
          label: "Dimasak"
        };
      case "BillRequested":
        return {
          bg: "bg-sky-950/80 border-sky-500/40 text-sky-300",
          dot: "bg-sky-400",
          label: "Minta Bill"
        };
      case "Reserved":
        return {
          bg: "bg-purple-950/80 border-purple-500/40 text-purple-300",
          dot: "bg-purple-400",
          label: "Reserved"
        };
      default:
        return {
          bg: "bg-stone-900 border-stone-800 text-stone-300",
          dot: "bg-stone-400",
          label: status
        };
    }
  };

  const getActiveOrderForTable = (tableCode: string) => {
    return orders.find(
      (o) => o.tableCode === tableCode && o.paymentStatus === "Unpaid"
    );
  };

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "Available").length,
    occupied: tables.filter((t) => t.status === "Occupied" || t.status === "Cooking").length,
    billRequested: tables.filter((t) => t.status === "BillRequested").length,
    reserved: tables.filter((t) => t.status === "Reserved").length
  };

  // Group Tables by Area for Visual Floor Plan
  const saungLesehanTables = tables.filter((t) => t.type === "Saung Lesehan");
  const mejaUtamaTables = tables.filter((t) => t.type === "Meja Utama");
  const mejaVipTables = tables.filter((t) => t.type === "Meja VIP");
  const outdoorTables = tables.filter((t) => t.type === "Outdoor");

  // Handlers
  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTargetTable) return;

    const target = tables.find((t) => t.code === resTargetTable);
    if (!target) return;

    onUpdateTableStatus(
      target.id,
      "Reserved",
      resCustomerName || "Rombongan Reservasi",
      {
        customerName: resCustomerName,
        phone: resPhone,
        date: resDate,
        time: resTime,
        pax: resPax,
        dp: resDp,
        notes: resNotes
      }
    );

    setShowReservationModal(false);
    alert(`Reservasi berhasil dibuat untuk ${resCustomerName} di ${resTargetTable}!`);
  };

  const handleExecuteMoveTable = () => {
    if (!moveSourceCode || !moveTargetCode) return;
    onMoveTable(moveSourceCode, moveTargetCode);
    setShowMoveModal(false);
    setMoveSourceCode("");
    setMoveTargetCode("");
    alert(`Berhasil memindahkan pesanan dari ${moveSourceCode} ke ${moveTargetCode}!`);
  };

  const handleExecuteMergeTables = () => {
    if (!primaryMergeCode || selectedSecondaryCodes.length === 0) return;
    onMergeTables(primaryMergeCode, selectedSecondaryCodes);
    setShowMergeModal(false);
    setPrimaryMergeCode("");
    setSelectedSecondaryCodes([]);
    alert(`Berhasil menggabungkan meja ke ${primaryMergeCode}!`);
  };

  const toggleSecondaryTable = (code: string) => {
    setSelectedSecondaryCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Banner & Management Controls */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-bold text-xl text-amber-100">
              Denah Digital & Manajemen Saung Lesehan
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Visualisasi peta area saung, status keterisian real-time, reservasi rombongan, pindah meja, dan gabung bill.
          </p>
        </div>

        {/* Global Action Buttons (Pindah Meja, Gabung Meja, Reservasi) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setShowMoveModal(true)}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl border border-stone-700 flex items-center gap-1.5 transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Pindah Meja</span>
          </button>

          <button
            onClick={() => setShowMergeModal(true)}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl border border-stone-700 flex items-center gap-1.5 transition"
          >
            <Merge className="w-4 h-4 text-sky-400" />
            <span>Gabung Meja</span>
          </button>

          <button
            onClick={() => {
              setResTargetTable(tables.find((t) => t.status === "Available")?.code || tables[0]?.code || "");
              setShowReservationModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl shadow-lg flex items-center gap-1.5 transition"
          >
            <Calendar className="w-4 h-4" />
            <span>+ Buat Reservasi</span>
          </button>
        </div>
      </div>

      {/* KPI Counters & Layout View Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-3.5 rounded-2xl shadow-xl">
        {/* KPI Counter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="bg-stone-950 border border-stone-800 text-stone-300 px-3 py-1.5 rounded-xl">
            Total Meja/Saung: <span className="font-mono font-bold text-amber-300">{stats.total}</span>
          </span>
          <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Kosong: <span className="font-mono font-bold">{stats.available}</span>
          </span>
          <span className="bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Terisi/Masak: <span className="font-mono font-bold">{stats.occupied}</span>
          </span>
          <span className="bg-sky-950/80 border border-sky-500/40 text-sky-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Bill: <span className="font-mono font-bold">{stats.billRequested}</span>
          </span>
          <span className="bg-purple-950/80 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Reserved: <span className="font-mono font-bold">{stats.reserved}</span>
          </span>
        </div>

        {/* Floor Plan vs Grid Toggle */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setViewLayout("floorplan")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              viewLayout === "floorplan"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Denah Interactive</span>
          </button>

          <button
            onClick={() => setViewLayout("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              viewLayout === "grid"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Kartu Grid</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="text-stone-400 font-semibold">Tipe Area:</span>
          {["All", "Saung Lesehan", "Meja Utama", "Meja VIP", "Outdoor"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                typeFilter === t
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-semibold">Status:</span>
          {["All", "Available", "Occupied", "Cooking", "BillRequested", "Reserved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                statusFilter === s
                  ? "bg-stone-200 text-stone-950 font-bold"
                  : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200"
              }`}
            >
              {s === "Available" ? "Kosong" : s === "Occupied" ? "Terisi" : s === "Cooking" ? "Masak" : s === "BillRequested" ? "Bill" : s}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: DENAH FLOOR PLAN VIEW */}
      {viewLayout === "floorplan" && (
        <div className="bg-stone-950 border border-stone-800 p-6 rounded-3xl space-y-8 shadow-2xl relative overflow-hidden">
          {/* Floor Map Decorative Water Mark */}
          <div className="absolute top-4 right-6 text-stone-800/40 font-serif font-extrabold text-2xl pointer-events-none select-none">
            DENAH RM SAUNG PASUNDAN
          </div>

          {/* Area 1: Saung Lesehan Air & Taman */}
          {(typeFilter === "All" || typeFilter === "Saung Lesehan") && (
            <div className="space-y-3 bg-gradient-to-r from-amber-950/20 via-stone-900/60 to-emerald-950/20 p-5 rounded-3xl border border-amber-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Utensils className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-amber-200">
                      Area Saung Lesehan Bambu & Kolam Ikan
                    </h3>
                    <p className="text-[10px] text-stone-400">Atmosfer tradisional dengan pemandangan gemercik air kolam koi</p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-300/80 font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {saungLesehanTables.length} Saung Lesehan
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                {saungLesehanTables.map((t) => renderTableTile(t))}
              </div>
            </div>
          )}

          {/* Area 2: Meja Utama Indoor */}
          {(typeFilter === "All" || typeFilter === "Meja Utama") && (
            <div className="space-y-3 bg-stone-900/80 p-5 rounded-3xl border border-stone-800">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-stone-800 text-stone-300">
                    <Users className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-amber-200">
                      Area Meja Utama Indoor (Non-Lesehan)
                    </h3>
                    <p className="text-[10px] text-stone-400">Ruang makan ber-AC dengan meja & kursi kayu jati masif</p>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 font-mono bg-stone-950 px-2.5 py-0.5 rounded-full border border-stone-800">
                  {mejaUtamaTables.length} Meja
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                {mejaUtamaTables.map((t) => renderTableTile(t))}
              </div>
            </div>
          )}

          {/* Area 3: Meja VIP AC & Rombongan */}
          {(typeFilter === "All" || typeFilter === "Meja VIP") && (
            <div className="space-y-3 bg-gradient-to-r from-purple-950/20 via-stone-900/60 to-amber-950/20 p-5 rounded-3xl border border-purple-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                    <Crown className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-purple-200">
                      Area Meja VIP Private AC & Rombongan Besar
                    </h3>
                    <p className="text-[10px] text-stone-400">Ruangan eksklusif privat untuk rapat keluarga & acara perusahaan</p>
                  </div>
                </div>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {mejaVipTables.length} VIP Suite
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                {mejaVipTables.map((t) => renderTableTile(t))}
              </div>
            </div>
          )}

          {/* Area 4: Outdoor & Taman Gazebo */}
          {(typeFilter === "All" || typeFilter === "Outdoor") && (
            <div className="space-y-3 bg-gradient-to-r from-emerald-950/20 via-stone-900/60 to-stone-900 p-5 rounded-3xl border border-emerald-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Trees className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-emerald-200">
                      Area Outdoor & Gazebo Taman Kebun
                    </h3>
                    <p className="text-[10px] text-stone-400">Area terbuka dengan angin segar & pepohonan hijau</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-300 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {outdoorTables.length} Gazebo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
                {outdoorTables.map((t) => renderTableTile(t))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: STANDARD GRID CARD VIEW */}
      {viewLayout === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map((table) => renderTableTile(table))}
        </div>
      )}

      {/* Selected Table Quick Detail Drawer / Action Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-stone-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-extrabold text-xl text-amber-200">
                    {selectedTable.code}
                  </h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    {selectedTable.type}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Kapasitas Maksimal {selectedTable.capacity} Orang Pelanggan
                </p>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Merged Status Info */}
            {selectedTable.mergedWithTableCode && (
              <div className="bg-sky-950/80 border border-sky-500/40 p-3 rounded-2xl flex items-center gap-2 text-sky-200 text-xs">
                <Merge className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Meja ini digabungkan secara virtual ke <strong>{selectedTable.mergedWithTableCode}</strong>.</span>
              </div>
            )}

            {/* Reservation Info if Reserved */}
            {selectedTable.status === "Reserved" && selectedTable.reservationInfo && (
              <div className="bg-purple-950/80 border border-purple-500/40 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-purple-200">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Reservasi: {selectedTable.reservationInfo.customerName}
                  </span>
                  <span className="font-mono text-amber-300">
                    {selectedTable.reservationInfo.time} WIB
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-stone-300 text-[11px] pt-1 border-t border-purple-800/60">
                  <div>No. HP/WA: {selectedTable.reservationInfo.phone}</div>
                  <div>Rombongan: {selectedTable.reservationInfo.pax} Pax</div>
                  <div>DP Dibayar: {formatRupiah(selectedTable.reservationInfo.dp)}</div>
                  <div>Catatan: {selectedTable.reservationInfo.notes}</div>
                </div>

                <button
                  onClick={() => {
                    onUpdateTableStatus(selectedTable.id, "Occupied", selectedTable.reservationInfo?.customerName);
                    setSelectedTable(null);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-stone-950 font-extrabold rounded-xl transition"
                >
                  Check-in Rombongan Ke Lesehan
                </button>
              </div>
            )}

            {/* Current Active Order Details */}
            {getActiveOrderForTable(selectedTable.code) ? (
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-300">
                    Pesanan Aktif: {getActiveOrderForTable(selectedTable.code)?.orderNumber}
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatRupiah(getActiveOrderForTable(selectedTable.code)?.total || 0)}
                  </span>
                </div>

                <div className="space-y-1 text-xs max-h-36 overflow-y-auto pr-1">
                  {getActiveOrderForTable(selectedTable.code)?.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-stone-300 border-b border-stone-900 pb-1">
                      <span>{it.qty}x {it.menuName}</span>
                      <span className="font-mono text-stone-400">{formatRupiah(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const ord = getActiveOrderForTable(selectedTable.code);
                      if (ord) onOpenReceiptForOrder(ord);
                    }}
                    className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" />
                    Cetak Struk Bill
                  </button>

                  <button
                    onClick={() => {
                      onSelectTableForOrder(selectedTable.code);
                      setSelectedTable(null);
                    }}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Menu Kasir
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <Utensils className="w-8 h-8 text-amber-400/40 mx-auto" />
                <p className="text-xs text-stone-400">Belum ada pesanan aktif di saung ini.</p>
              </div>
            )}

            {/* Quick Status Modifiers */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-2">Ubah Status Saung:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => {
                    onUpdateTableStatus(selectedTable.id, "Available");
                    setSelectedTable(null);
                  }}
                  className="py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold transition"
                >
                  Tandai Kosong
                </button>

                <button
                  onClick={() => {
                    onUpdateTableStatus(selectedTable.id, "BillRequested");
                    setSelectedTable(null);
                  }}
                  className="py-2.5 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/30 rounded-xl font-bold transition"
                >
                  Minta Bill
                </button>

                <button
                  onClick={() => {
                    setResTargetTable(selectedTable.code);
                    setShowReservationModal(true);
                  }}
                  className="py-2.5 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30 rounded-xl font-bold transition"
                >
                  Reservasi
                </button>
              </div>
            </div>

            {/* Direct Order Navigation Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="text-xs font-semibold text-stone-300 block">Aksi Pemesanan & Alur Kerja:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    onSelectTableForOrder(selectedTable.code, "orders");
                    setSelectedTable(null);
                  }}
                  className="py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  <Utensils className="w-4 h-4" />
                  Pesan Makanan
                </button>

                <button
                  onClick={() => {
                    onSelectTableForOrder(selectedTable.code, "pos");
                    setSelectedTable(null);
                  }}
                  className="py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold border border-amber-500/30 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Receipt className="w-4 h-4" />
                  Kasir POS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RESERVASI FORM MODAL */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateReservationSubmit}
            className="bg-stone-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">Reservasi Saung Lesehan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReservationModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Pilih Saung / Meja Target:</label>
                <select
                  value={resTargetTable}
                  onChange={(e) => setResTargetTable(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold rounded-xl p-2.5 outline-none"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.code} ({t.type}) - Cap. {t.capacity} Pax [{t.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Nama Pemesan / Rombongan:</label>
                <input
                  type="text"
                  required
                  value={resCustomerName}
                  onChange={(e) => setResCustomerName(e.target.value)}
                  placeholder="Contoh: Rombongan Bpk. H. Dedi"
                  className="w-full bg-stone-950 border border-stone-700 text-amber-100 rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">No. WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Jumlah Rombongan (Pax):</label>
                  <input
                    type="number"
                    value={resPax}
                    onChange={(e) => setResPax(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Tanggal Kedatangan:</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Jam Kedatangan:</label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-mono font-bold rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Uang Muka / DP (Nominal):</label>
                <input
                  type="number"
                  value={resDp}
                  onChange={(e) => setResDp(Number(e.target.value))}
                  placeholder="200000"
                  className="w-full bg-stone-950 border border-stone-700 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Catatan Khusus Pesanan:</label>
                <textarea
                  rows={2}
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="Contoh: Minta setting Kastrol Nasi Liwet + Gurame Bakar hangat saat rombongan tiba"
                  className="w-full bg-stone-950 border border-stone-700 text-stone-300 rounded-xl p-2 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-xl shadow-lg transition"
              >
                Simpan Reservasi Saung
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: PINDAH MEJA (MOVE TABLE) */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">Pindah Meja / Saung</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-400">
                Pindahkan seluruh pesanan aktif dan status dari meja asal ke meja tujuan:
              </p>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Meja Asal (Yang Ada Pesanan):</label>
                <select
                  value={moveSourceCode}
                  onChange={(e) => setMoveSourceCode(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-rose-300 font-bold rounded-xl p-2.5 outline-none"
                >
                  <option value="">-- Pilih Meja Asal --</option>
                  {tables
                    .filter((t) => t.status === "Occupied" || t.status === "Cooking" || t.status === "BillRequested")
                    .map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.code} ({t.customerName || "Pelanggan"})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Meja Tujuan (Harus Kosong):</label>
                <select
                  value={moveTargetCode}
                  onChange={(e) => setMoveTargetCode(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-emerald-300 font-bold rounded-xl p-2.5 outline-none"
                >
                  <option value="">-- Pilih Meja Tujuan --</option>
                  {tables
                    .filter((t) => t.status === "Available")
                    .map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.code} ({t.type}) - Cap. {t.capacity} Pax
                      </option>
                    ))}
                </select>
              </div>

              {moveSourceCode && getActiveOrderForTable(moveSourceCode) && (
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1 font-mono">
                  <div className="text-amber-300 font-bold">Ringkasan Pesanan Yang Dipindah:</div>
                  <div className="text-stone-300">
                    Order: {getActiveOrderForTable(moveSourceCode)?.orderNumber} ({getActiveOrderForTable(moveSourceCode)?.items.length} Menu)
                  </div>
                  <div className="text-emerald-400 font-bold">
                    Total Bill: {formatRupiah(getActiveOrderForTable(moveSourceCode)?.total || 0)}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleExecuteMoveTable}
                disabled={!moveSourceCode || !moveTargetCode}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-lg transition disabled:opacity-50"
              >
                Konfirmasi Pindah Meja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: GABUNG MEJA (MERGE TABLES) */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-sky-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Merge className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">Gabung Meja / Saung</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMergeModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-400">
                Gabungkan dua atau lebih saung lesehan untuk menampung rombongan besar:
              </p>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Pilih Meja Utama (Host Table):</label>
                <select
                  value={primaryMergeCode}
                  onChange={(e) => setPrimaryMergeCode(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold rounded-xl p-2.5 outline-none"
                >
                  <option value="">-- Pilih Meja Utama --</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.code} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              {primaryMergeCode && (
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">
                    Pilih Meja Sekunder Yang Digabung ke {primaryMergeCode}:
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {tables
                      .filter((t) => t.code !== primaryMergeCode)
                      .map((t) => (
                        <label
                          key={t.id}
                          className="flex items-center justify-between p-2 bg-stone-950 rounded-xl border border-stone-800 cursor-pointer hover:border-amber-500/40"
                        >
                          <span className="font-bold text-stone-200">{t.code} ({t.type})</span>
                          <input
                            type="checkbox"
                            checked={selectedSecondaryCodes.includes(t.code)}
                            onChange={() => toggleSecondaryTable(t.code)}
                            className="accent-amber-500 rounded"
                          />
                        </label>
                      ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleExecuteMergeTables}
                disabled={!primaryMergeCode || selectedSecondaryCodes.length === 0}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50"
              >
                Gabungkan Meja Sekunder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper render function for individual table tile
  function renderTableTile(table: TableSaung) {
    const badge = getStatusBadge(table.status);
    const activeOrder = getActiveOrderForTable(table.code);

    return (
      <div
        key={table.id}
        onClick={() => setSelectedTable(table)}
        className={`relative bg-stone-900 border hover:border-amber-400/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 shadow-xl group ${
          table.status === "Occupied" || table.status === "Cooking"
            ? "border-amber-500/30"
            : table.status === "Reserved"
            ? "border-purple-500/40"
            : "border-stone-800"
        }`}
      >
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
          <span className="font-serif font-extrabold text-sm text-amber-200">
            {table.code}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            {badge.label}
          </span>
        </div>

        {/* Body Info */}
        <div className="my-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
            <Users className="w-3 h-3 text-amber-400" />
            <span>Cap: {table.capacity} Pax</span>
          </div>

          {table.mergedWithTableCode && (
            <span className="inline-block text-[9px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
              🔗 Digabung ke {table.mergedWithTableCode}
            </span>
          )}

          {table.customerName ? (
            <div className="font-bold text-amber-300 text-xs truncate">
              {table.customerName}
            </div>
          ) : (
            <div className="text-[11px] text-stone-500 italic">Lesehan Kosong</div>
          )}

          {table.timeSeated && (
            <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>Duduk: {table.timeSeated}</span>
            </div>
          )}

          {activeOrder && (
            <div className="mt-2 bg-stone-950 p-2 rounded-xl border border-stone-800 text-[10px] space-y-0.5">
              <div className="flex justify-between font-mono font-bold text-emerald-400">
                <span>Total:</span>
                <span>{formatRupiah(activeOrder.total)}</span>
              </div>
              <div className="text-stone-400 truncate">
                {activeOrder.items.length} Menu ({activeOrder.status})
              </div>
            </div>
          )}
        </div>

        {/* Action Prompt */}
        <div className="pt-2 border-t border-stone-800/80 text-[10px] text-amber-400 font-semibold flex items-center justify-between group-hover:text-amber-300">
          <span>Detail & Akses POS</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }
};
