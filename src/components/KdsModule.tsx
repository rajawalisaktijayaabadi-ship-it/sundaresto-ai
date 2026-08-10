import React, { useState, useEffect } from "react";
import { Order, OrderItem } from "../types";
import {
  ChefHat,
  Flame,
  Coffee,
  CheckCircle2,
  Clock,
  Volume2,
  Filter,
  Check,
  AlertTriangle,
  Play,
  Bell,
  Utensils,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown,
  Search,
  CheckCheck,
  Zap,
  Timer,
  AlertCircle
} from "lucide-react";

interface KdsModuleProps {
  orders: Order[];
  onUpdateItemKitchenStatus: (
    orderId: string,
    itemId: string,
    status: "Queued" | "Cooking" | "Ready" | "Served"
  ) => void;
  onCompleteOrderKitchen: (orderId: string) => void;
  onSimulateNewOrder?: () => void;
}

export const KdsModule: React.FC<KdsModuleProps> = ({
  orders,
  onUpdateItemKitchenStatus,
  onCompleteOrderKitchen,
  onSimulateNewOrder
}) => {
  // Real-time ticker state for live elapsed timers
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());
  const [activeTabStatus, setActiveTabStatus] = useState<
    "All" | "Queued" | "Cooking" | "Ready" | "Served"
  >("All");
  const [stationFilter, setStationFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"fifo" | "priority" | "table">("fifo");
  const [viewMode, setViewMode] = useState<"tickets" | "aggregated">("tickets");
  const [searchQuery, setSearchQuery] = useState("");

  // Update timer every second for accurate live counters
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const playChimeSound = () => {
    try {
      const audio = new Audio(
        "https://actions.google.com/sounds/v1/cartoon/clong.ogg"
      );
      audio.play().catch(() => {});
    } catch (e) {
      // Audio fallback
    }
  };

  // Helper to calculate elapsed time in minutes and seconds
  const getElapsedTimeInfo = (order: Order) => {
    let startMs = order.createdAtTimestamp;
    if (!startMs) {
      // Fallback parse "HH:mm WIB"
      const parts = order.createdAt.split(" ")[0].split(":");
      if (parts.length === 2) {
        const d = new Date();
        d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
        startMs = d.getTime();
      } else {
        startMs = Date.now() - 10 * 60 * 1000;
      }
    }

    const elapsedMs = Math.max(0, nowTimestamp - startMs);
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;

    const formattedTime = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;

    const isOverdue = mins >= (order.estimatedPrepTimeMins || 15);
    const isWarning = mins >= 10 && mins < (order.estimatedPrepTimeMins || 15);

    return { mins, secs, formattedTime, isOverdue, isWarning };
  };

  const getStationIcon = (station?: string) => {
    switch (station) {
      case "Dapur Bakar/Goreng":
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case "Bar Minuman":
        return <Coffee className="w-3.5 h-3.5 text-sky-400" />;
      case "Dapur Tumis & Nasi":
        return <Utensils className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <ChefHat className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // Active tickets filter
  const activeOrders = orders.filter((o) => {
    if (activeTabStatus === "Served") {
      return o.status === "Served";
    }
    return o.status !== "Completed" && o.status !== "Cancelled";
  });

  // Filtered orders
  const filteredOrders = activeOrders.filter((order) => {
    // Search filter
    const matchesSearch =
      order.tableCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) =>
        i.menuName.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    // Status tab filter
    if (activeTabStatus === "Queued") {
      const hasQueued = order.items.some(
        (i) => !i.kitchenStatus || i.kitchenStatus === "Queued"
      );
      if (!hasQueued) return false;
    } else if (activeTabStatus === "Cooking") {
      const hasCooking = order.items.some((i) => i.kitchenStatus === "Cooking");
      if (!hasCooking) return false;
    } else if (activeTabStatus === "Ready") {
      const hasReady = order.items.some((i) => i.kitchenStatus === "Ready");
      if (!hasReady) return false;
    }

    // Priority filter
    if (priorityFilter === "VIP") {
      if (order.priority !== "VIP Saung") return false;
    } else if (priorityFilter === "High") {
      const { isOverdue } = getElapsedTimeInfo(order);
      if (order.priority !== "Mendesak/Tinggi" && !isOverdue) return false;
    }

    // Station filter check
    if (stationFilter !== "All") {
      const hasStationItem = order.items.some(
        (i) => i.kitchenStation === stationFilter
      );
      if (!hasStationItem) return false;
    }

    return true;
  });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "priority") {
      const pMap = { "VIP Saung": 3, "Mendesak/Tinggi": 2, Normal: 1 };
      const pA = pMap[a.priority || "Normal"] || 1;
      const pB = pMap[b.priority || "Normal"] || 1;
      if (pB !== pA) return pB - pA;
    } else if (sortBy === "table") {
      return a.tableCode.localeCompare(b.tableCode);
    }

    // FIFO Default (Terlama dulu)
    const timeA = a.createdAtTimestamp || 0;
    const timeB = b.createdAtTimestamp || 0;
    return timeA - timeB;
  });

  // Aggregated Queue calculation across all active tickets
  const aggregatedQueueMap: Record<
    string,
    {
      menuName: string;
      category: string;
      station: string;
      totalQty: number;
      queuedQty: number;
      cookingQty: number;
      readyQty: number;
      tables: string[];
    }
  > = {};

  activeOrders.forEach((order) => {
    if (order.status === "Served") return;
    order.items.forEach((item) => {
      const st = item.kitchenStation || "Dapur Utama";
      if (stationFilter !== "All" && st !== stationFilter) return;

      const key = item.menuName;
      if (!aggregatedQueueMap[key]) {
        aggregatedQueueMap[key] = {
          menuName: item.menuName,
          category: item.category,
          station: st,
          totalQty: 0,
          queuedQty: 0,
          cookingQty: 0,
          readyQty: 0,
          tables: []
        };
      }

      aggregatedQueueMap[key].totalQty += item.qty;
      const kStatus = item.kitchenStatus || "Queued";
      if (kStatus === "Queued") aggregatedQueueMap[key].queuedQty += item.qty;
      if (kStatus === "Cooking") aggregatedQueueMap[key].cookingQty += item.qty;
      if (kStatus === "Ready") aggregatedQueueMap[key].readyQty += item.qty;

      if (!aggregatedQueueMap[key].tables.includes(order.tableCode)) {
        aggregatedQueueMap[key].tables.push(order.tableCode);
      }
    });
  });

  const aggregatedList = Object.values(aggregatedQueueMap).sort(
    (a, b) => b.totalQty - a.totalQty
  );

  // KPI Calculations
  const activeCount = orders.filter(
    (o) => o.status === "InKitchen" || o.status === "New"
  ).length;

  let totalQueuedItems = 0;
  let totalCookingItems = 0;
  let totalReadyItems = 0;
  let overdueCount = 0;

  activeOrders.forEach((o) => {
    if (o.status === "Served") return;
    const { isOverdue } = getElapsedTimeInfo(o);
    if (isOverdue) overdueCount++;

    o.items.forEach((i) => {
      const st = i.kitchenStatus || "Queued";
      if (st === "Queued") totalQueuedItems += i.qty;
      if (st === "Cooking") totalCookingItems += i.qty;
      if (st === "Ready") totalReadyItems += i.qty;
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-400 shadow-inner">
            <ChefHat className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-extrabold text-2xl text-stone-100 tracking-tight">
                Kitchen Display System (KDS Dapur & Bar)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Real-time
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Antrean pesanan masakan Saung Pasundan • Target SLA Penyajian: 15 Menit • Alert Suara Bell
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          {onSimulateNewOrder && (
            <button
              onClick={() => {
                playChimeSound();
                onSimulateNewOrder();
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Simulasi Order Masuk Real-time</span>
            </button>
          )}

          <button
            onClick={playChimeSound}
            className="px-3.5 py-2.5 bg-stone-950 hover:bg-stone-800 border border-stone-800 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-md"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Tes Bell Dapur</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>Antrean Order</span>
            <ChefHat className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">{activeCount} Tiket</p>
          <span className="text-[10px] text-amber-400 mt-0.5 block font-semibold">
            {totalQueuedItems} porsi menunggu
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>Sedang Dimasak</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{totalCookingItems} Porsi</p>
          <span className="text-[10px] text-stone-400 mt-0.5 block">Di kompor & pembakaran</span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>Siap Saji (Ready)</span>
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{totalReadyItems} Porsi</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block font-semibold">
            Siap Diantar Waiter
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>SLA Overdue (&gt;15m)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <p
            className={`text-2xl font-bold ${
              overdueCount > 0 ? "text-rose-500" : "text-stone-300"
            }`}
          >
            {overdueCount} Order
          </p>
          <span className="text-[10px] text-rose-400 mt-0.5 block font-semibold">
            {overdueCount > 0 ? "Perlu Prioritas Koki!" : "Semua Tepat Waktu"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-md col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>Rata-rata Waktu</span>
            <Timer className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-stone-100">11.8 Menit</p>
          <span className="text-[10px] text-emerald-400 mt-0.5 block font-semibold">
            SLA On-time: 94.2%
          </span>
        </div>
      </div>

      {/* Control Toolbar & Filters */}
      <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800 space-y-4 shadow-lg">
        {/* Row 1: Search & View Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
            <input
              type="text"
              placeholder="Cari Meja Saung, No. Order, Nama Tamu, atau Menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-stone-950 p-1 rounded-xl border border-stone-800 flex items-center text-xs">
              <button
                onClick={() => setViewMode("tickets")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "tickets"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Tiket KDS Per Meja ({sortedOrders.length})</span>
              </button>

              <button
                onClick={() => setViewMode("aggregated")}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "aggregated"
                    ? "bg-amber-500 text-stone-950 shadow-sm"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Antrean Masakan per Menu ({aggregatedList.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-950 px-3 py-2 rounded-xl border border-stone-800 text-xs text-stone-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Urut:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-stone-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="fifo">Terlama Dulu (FIFO)</option>
                <option value="priority">Prioritas VIP First</option>
                <option value="table">Nomor Meja Saung</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Status & Station Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-stone-800/80">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-stone-400 font-bold whitespace-nowrap mr-1">Status:</span>
            {[
              { id: "All", label: "Semua Order" },
              { id: "Queued", label: "Queue / Antrean" },
              { id: "Cooking", label: "Sedang Dimasak" },
              { id: "Ready", label: "Siap Saji (Ready)" },
              { id: "Served", label: "Sudah Disajikan" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  activeTabStatus === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20"
                    : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Station Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-stone-400 font-bold whitespace-nowrap mr-1">Stasiun:</span>
            {[
              "All",
              "Dapur Bakar/Goreng",
              "Dapur Tumis & Nasi",
              "Bar Minuman"
            ].map((st) => (
              <button
                key={st}
                onClick={() => setStationFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap border transition ${
                  stationFilter === st
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                {st === "All" ? "Semua Stasiun" : st}
              </button>
            ))}

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 font-semibold focus:outline-none"
            >
              <option value="All">Semua Prioritas</option>
              <option value="VIP">★ VIP Saung Only</option>
              <option value="High">⚠️ Overdue & Tinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INDIVIDUAL TICKET CARDS */}
      {viewMode === "tickets" && (
        <>
          {sortedOrders.length === 0 ? (
            <div className="text-center py-20 bg-stone-900 border border-stone-800 rounded-3xl space-y-3">
              <ChefHat className="w-12 h-12 text-stone-600 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Tidak Ada Antrean Pesanan Dapur
              </h3>
              <p className="text-xs text-stone-400">
                Semua hidangan saung telah selesai diproses dan disajikan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedOrders.map((order) => {
                const { mins, secs, formattedTime, isOverdue, isWarning } =
                  getElapsedTimeInfo(order);

                // Station filter items
                const itemsForStation = order.items.filter((item) => {
                  if (stationFilter === "All") return true;
                  return item.kitchenStation === stationFilter;
                });

                if (itemsForStation.length === 0) return null;

                const allReady = itemsForStation.every(
                  (i) =>
                    i.kitchenStatus === "Ready" || i.kitchenStatus === "Served"
                );
                const allServed = itemsForStation.every(
                  (i) => i.kitchenStatus === "Served"
                );

                return (
                  <div
                    key={order.id}
                    className={`bg-stone-900 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4 border-2 transition relative ${
                      isOverdue
                        ? "border-rose-500 shadow-rose-950/30 animate-pulse"
                        : order.priority === "VIP Saung"
                        ? "border-amber-500 shadow-amber-950/40"
                        : isWarning
                        ? "border-amber-500/60"
                        : "border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    {/* Priority Banner if VIP */}
                    {order.priority === "VIP Saung" && (
                      <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[10px] font-black px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 fill-stone-950" />
                        <span>VIP Saung Prioritas</span>
                      </div>
                    )}

                    {/* Header Ticket */}
                    <div className="flex items-start justify-between pb-3 border-b border-stone-800 pt-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-extrabold text-xl text-stone-100">
                            {order.tableCode}
                          </span>

                          {order.priority === "Mendesak/Tinggi" && (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                          #{order.orderNumber} • {order.customerName} ({order.paxCount} Pax)
                        </div>
                      </div>

                      {/* Live SLA Timer Badge */}
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={`px-3 py-1 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 shadow-md ${
                            isOverdue
                              ? "bg-rose-500 text-white animate-bounce"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-stone-950 text-emerald-400 border border-stone-800"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedTime}</span>
                        </div>

                        <span className="text-[9px] text-stone-500">
                          Order: {order.createdAt}
                        </span>
                      </div>
                    </div>

                    {/* Quick Batch Advance Toolbar */}
                    <div className="flex items-center justify-between text-[11px] bg-stone-950/80 p-2 rounded-xl border border-stone-800">
                      <span className="text-stone-400 font-semibold">
                        Aksi Cepat Dapur:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            itemsForStation.forEach((i) =>
                              onUpdateItemKitchenStatus(
                                order.id,
                                i.id,
                                "Cooking"
                              )
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold transition flex items-center gap-1"
                        >
                          <Flame className="w-3 h-3" />
                          <span>Masak Semua</span>
                        </button>

                        <button
                          onClick={() => {
                            itemsForStation.forEach((i) =>
                              onUpdateItemKitchenStatus(order.id, i.id, "Ready")
                            );
                            playChimeSound();
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition flex items-center gap-1"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Siap Semua</span>
                        </button>
                      </div>
                    </div>

                    {/* Items Checklist */}
                    <div className="space-y-2.5 my-1">
                      {itemsForStation.map((item) => {
                        const kStatus = item.kitchenStatus || "Queued";
                        const isQueued = kStatus === "Queued";
                        const isCooking = kStatus === "Cooking";
                        const isReady = kStatus === "Ready";
                        const isServed = kStatus === "Served";

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border transition flex items-start justify-between gap-3 ${
                              isServed
                                ? "bg-stone-950/50 border-stone-800/80 text-stone-500 line-through opacity-60"
                                : isReady
                                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100 shadow-sm shadow-emerald-950/20"
                                : isCooking
                                ? "bg-amber-950/30 border-amber-500/40 text-amber-100"
                                : "bg-stone-950 border-stone-800 text-stone-100"
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                <span
                                  className={`w-6 h-6 rounded-lg font-mono flex items-center justify-center text-xs font-black ${
                                    isReady
                                      ? "bg-emerald-500 text-stone-950"
                                      : isCooking
                                      ? "bg-amber-500 text-stone-950"
                                      : "bg-stone-800 text-amber-300"
                                  }`}
                                >
                                  {item.qty}x
                                </span>
                                <span>{item.menuName}</span>
                              </div>

                              {item.note && (
                                <p className="text-[10px] text-amber-400 font-medium italic pl-8">
                                  ★ Catatan: {item.note}
                                </p>
                              )}

                              <div className="flex items-center gap-2 pl-8 text-[10px]">
                                <div className="flex items-center gap-1 text-stone-400">
                                  {getStationIcon(item.kitchenStation)}
                                  <span>
                                    {item.kitchenStation || "Dapur Utama"}
                                  </span>
                                </div>

                                {/* Status Tag */}
                                <span
                                  className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                                    isServed
                                      ? "bg-stone-800 text-stone-400"
                                      : isReady
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                      : isCooking
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                      : "bg-stone-800 text-stone-400"
                                  }`}
                                >
                                  {isServed
                                    ? "Disajikan"
                                    : isReady
                                    ? "Siap Saji"
                                    : isCooking
                                    ? "Cooking..."
                                    : "Queue"}
                                </span>
                              </div>
                            </div>

                            {/* Single Step Status Cycle Button */}
                            <button
                              onClick={() => {
                                let nextStatus:
                                  | "Queued"
                                  | "Cooking"
                                  | "Ready"
                                  | "Served" = "Cooking";
                                if (isQueued) nextStatus = "Cooking";
                                else if (isCooking) {
                                  nextStatus = "Ready";
                                  playChimeSound();
                                } else if (isReady) nextStatus = "Served";
                                else if (isServed) nextStatus = "Queued";

                                onUpdateItemKitchenStatus(
                                  order.id,
                                  item.id,
                                  nextStatus
                                );
                              }}
                              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center transition shadow-md ${
                                isReady
                                  ? "bg-emerald-500 text-stone-950 border-emerald-400 hover:bg-emerald-400"
                                  : isCooking
                                  ? "bg-amber-500 text-stone-950 border-amber-400 hover:bg-amber-400"
                                  : isServed
                                  ? "bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200"
                                  : "bg-stone-900 text-amber-400 border-stone-700 hover:bg-stone-800"
                              }`}
                              title="Klik untuk lanjut status masakan"
                            >
                              {isQueued && <Flame className="w-4 h-4" />}
                              {isCooking && <Bell className="w-4 h-4" />}
                              {isReady && <Check className="w-4 h-4" />}
                              {isServed && <RotateCcw className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Order Complete Action */}
                    <button
                      onClick={() => {
                        onCompleteOrderKitchen(order.id);
                        playChimeSound();
                      }}
                      disabled={!allReady && !allServed}
                      className={`w-full py-3 font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition ${
                        allServed
                          ? "bg-stone-800 text-emerald-400 border border-stone-700"
                          : allReady
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 shadow-emerald-500/20"
                          : "bg-stone-950 text-stone-500 border border-stone-800 cursor-not-allowed"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {allServed
                          ? "✓ Hidangan Lengkap Disajikan"
                          : allReady
                          ? "Panggil Waiter / Selesaikan Tiket"
                          : "Selesaikan Semua Item Dapur"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW MODE 2: AGGREGATED MENU QUEUE (Antrean Masakan per Menu) */}
      {viewMode === "aggregated" && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-stone-900/90 border border-stone-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Ringkasan Antrean Masakan Massal (Batch Cooking)
                </h3>
                <p className="text-xs text-stone-400">
                  Memudahkan Koki memasak sekaligus porsi besar (misal: menggoreng 5 Gurame bersamaan).
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                {aggregatedList.length} Jenis Menu Diantrekan
              </span>
            </div>

            {aggregatedList.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                Tidak ada antrean masakan aktif untuk stasiun terpilih.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aggregatedList.map((agg) => (
                  <div
                    key={agg.menuName}
                    className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                          {agg.category}
                        </span>
                        <h4 className="font-bold text-stone-100 text-sm">
                          {agg.menuName}
                        </h4>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xl flex items-center justify-center font-mono">
                        {agg.totalQty}x
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs pt-2 border-t border-stone-800">
                      <span className="px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-400">
                        Queue: <strong className="text-stone-200">{agg.queuedQty}</strong>
                      </span>
                      <span className="px-2 py-1 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300">
                        Cooking: <strong>{agg.cookingQty}</strong>
                      </span>
                      <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                        Ready: <strong>{agg.readyQty}</strong>
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-400 pt-1">
                      <span className="text-stone-500">Nomor Meja: </span>
                      <span className="font-semibold text-amber-300">
                        {agg.tables.join(", ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
