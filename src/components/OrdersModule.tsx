import React, { useState } from "react";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  Outlet,
  MenuItem,
  TableSaung,
  OrderItem,
  OrderType,
  MenuCategory
} from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  Search,
  Receipt,
  Filter,
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingBag,
  Truck,
  Printer,
  Eye,
  XCircle,
  User,
  ShieldAlert,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ChefHat,
  Send
} from "lucide-react";

interface OrdersModuleProps {
  menuItems: MenuItem[];
  tables: TableSaung[];
  orders: Order[];
  currentOutlet: Outlet;
  onCreateOrder?: (order: Order) => void;
  onOpenReceipt: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => void;
  preselectedTableCode?: string;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({
  menuItems,
  tables,
  orders,
  currentOutlet,
  onCreateOrder,
  onOpenReceipt,
  onUpdateOrderStatus,
  preselectedTableCode
}) => {
  // Navigation Sub-tab: "menu" | "order_form" | "incoming_orders"
  const [activeSubTab, setActiveSubTab] = useState<"menu" | "order_form" | "incoming_orders">("order_form");

  // Success message toast
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 1. MENU MAKANAN STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>("All");

  const categoriesList = [
    "All",
    "Paket Menu Komplit",
    "Nasi & Paket Liwet",
    "Ayam & Bebek",
    "Olahan Gurame & Nila",
    "Tumisan & Cah",
    "Sambal Khas Sunda",
    "Minuman & Es"
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = menuCategoryFilter === "All" || item.category === menuCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ---------------------------------------------------------------------------
  // 2. PESAN MAKANAN (FORM & KERANJANG ORDER) STATE
  // ---------------------------------------------------------------------------
  const [selectedTable, setSelectedTable] = useState<string>(preselectedTableCode || tables[0]?.code || "Saung 01");

  React.useEffect(() => {
    if (preselectedTableCode) {
      setSelectedTable(preselectedTableCode);
    }
  }, [preselectedTableCode]);
  const [customerName, setCustomerName] = useState("");
  const [paxCount, setPaxCount] = useState(2);
  const [orderType, setOrderType] = useState<OrderType>("Dine-in");
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<string>("All");
  const [orderItemSearch, setOrderItemSearch] = useState("");

  // AI Voice Order Assistant State
  const [aiText, setAiText] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const filteredOrderMenu = menuItems.filter((item) => {
    const matchesCategory = orderCategoryFilter === "All" || item.category === orderCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(orderItemSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(orderItemSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (menu: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuId === menu.id);
      if (existing) {
        return prev.map((i) => (i.menuId === menu.id ? { ...i, qty: i.qty + 1 } : i));
      } else {
        const station =
          menu.category === "Minuman & Es"
            ? "Bar Minuman"
            : menu.category === "Tumisan & Cah" || menu.category === "Sayuran & Sup" || menu.category === "Sambal Khas Sunda" || menu.category === "Lalapan Segar"
            ? "Dapur Tumis & Nasi"
            : "Dapur Bakar/Goreng";

        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random()}`,
            menuId: menu.id,
            menuName: menu.name,
            category: menu.category as MenuCategory,
            price: menu.price,
            costHPP: menu.costHPP,
            qty: 1,
            note: "",
            kitchenStatus: "Queued",
            kitchenStation: station
          }
        ];
      }
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const updateCartNote = (id: string, note: string) => {
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, note } : item)));
  };

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations for Order Form
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPB1 = Math.round(subtotal * (currentOutlet.taxRatePct / 100));
  const serviceCharge = Math.round(subtotal * (currentOutlet.serviceChargePct / 100));
  const grandTotal = subtotal + taxPB1 + serviceCharge;

  // AI Voice order handler simulation
  const handleAiParseOrder = (text: string) => {
    if (!text.trim()) return;
    setIsAiProcessing(true);
    setAiResponse("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      let addedCount = 0;

      menuItems.forEach((menu) => {
        if (lower.includes(menu.name.toLowerCase())) {
          addToCart(menu);
          addedCount++;
        }
      });

      // Match common table phrases
      if (lower.includes("saung 01") || lower.includes("saung 1")) setSelectedTable("Saung 01");
      if (lower.includes("saung 02") || lower.includes("saung 2")) setSelectedTable("Saung 02");
      if (lower.includes("saung 03") || lower.includes("saung 3")) setSelectedTable("Saung 03");
      if (lower.includes("saung 04") || lower.includes("saung 4")) setSelectedTable("Saung 04");
      if (lower.includes("saung 05") || lower.includes("saung 5")) setSelectedTable("Saung 05");

      setIsAiProcessing(false);
      setAiResponse(
        addedCount > 0
          ? `✓ AI berhasil menambahkan ${addedCount} menu ke keranjang pesanan!`
          : "✓ AI selesai mendengarkan. Silakan pilih menu di katalog."
      );
    }, 800);
  };

  // Submit Order to POS & Kitchen
  const handleSubmitOrderToPosAndKitchen = () => {
    if (cartItems.length === 0) {
      alert("Keranjang pesanan masih kosong! Pilih menu makanan terlebih dahulu.");
      return;
    }

    const orderNum = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      outletId: currentOutlet.id,
      tableCode: orderType === "Dine-in" ? selectedTable : orderType,
      customerName: customerName.trim() || "Pelanggan Lesehan",
      paxCount: paxCount || 2,
      orderType,
      items: cartItems,
      subtotal,
      taxPB1,
      serviceCharge,
      discount: 0,
      total: grandTotal,
      status: "InKitchen",
      paymentStatus: "Unpaid",
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      cashierName: "Waiter Application"
    };

    if (onCreateOrder) {
      onCreateOrder(newOrder);
    }

    // Reset Form
    setCartItems([]);
    setCustomerName("");
    setAiText("");
    setAiResponse("");

    // Show Success Toast and Switch to Incoming Orders Sub-Tab
    setSuccessMessage(`Pesanan ${orderNum} Berhasil Dibuat! Otomatis terkirim ke Kasir POS & Dapur (KDS).`);
    setActiveSubTab("incoming_orders");

    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // ---------------------------------------------------------------------------
  // 3. PESANAN MASUK (POS & KITCHEN FEED) STATE & FILTERS
  // ---------------------------------------------------------------------------
  const [incomingSearch, setIncomingSearch] = useState("");
  const [incomingStatusFilter, setIncomingStatusFilter] = useState<string>("All");
  const [incomingTypeFilter, setIncomingTypeFilter] = useState<string>("All");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Void Modal State
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTargetOrder, setVoidTargetOrder] = useState<Order | null>(null);
  const [supervisorPin, setSupervisorPin] = useState("");
  const [voidReason, setVoidReason] = useState("Salah Pesan / Pembatalan Pelanggan");
  const [voidError, setVoidError] = useState("");

  const filteredIncomingOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(incomingSearch.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(incomingSearch.toLowerCase()) ||
      ord.tableCode.toLowerCase().includes(incomingSearch.toLowerCase());

    const matchesStatus =
      incomingStatusFilter === "All"
        ? true
        : incomingStatusFilter === "InKitchen"
        ? ord.status === "InKitchen" || ord.status === "New"
        : incomingStatusFilter === "Ready"
        ? ord.status === "Ready" || ord.status === "Served"
        : incomingStatusFilter === "Completed"
        ? ord.status === "Completed"
        : incomingStatusFilter === "Paid"
        ? ord.paymentStatus === "Paid"
        : incomingStatusFilter === "Unpaid"
        ? ord.paymentStatus === "Unpaid"
        : incomingStatusFilter === "Cancelled"
        ? ord.status === "Cancelled"
        : true;

    const matchesType = incomingTypeFilter === "All" ? true : ord.orderType === incomingTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalOrdersCount = orders.length;
  const activeKitchenCount = orders.filter(
    (o) => (o.status === "New" || o.status === "InKitchen") && o.status !== "Cancelled"
  ).length;
  const readyServedCount = orders.filter(
    (o) => (o.status === "Ready" || o.status === "Served") && o.status !== "Cancelled"
  ).length;
  const totalOmsetPaid = orders
    .filter((o) => o.paymentStatus === "Paid" && o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const handleOpenVoidModal = (order: Order) => {
    setVoidTargetOrder(order);
    setSupervisorPin("");
    setVoidReason("Salah Pesan / Pembatalan Pelanggan");
    setVoidError("");
    setShowVoidModal(true);
  };

  const handleConfirmVoid = () => {
    if (supervisorPin !== "1234" && supervisorPin !== "8888") {
      setVoidError("PIN Supervisor Salah! Gunakan PIN 1234 atau 8888");
      return;
    }

    if (voidTargetOrder && onUpdateOrderStatus) {
      onUpdateOrderStatus(voidTargetOrder.id, "Cancelled", "Refunded");
      setShowVoidModal(false);
      setVoidTargetOrder(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SUCCESS TOAST ALERT */}
      {successMessage && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 p-4 rounded-2xl flex items-center justify-between text-emerald-200 shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-100 p-1 rounded-lg"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* HEADER BANNER & SUB-TAB NAVIGATION */}
      <div className="bg-stone-900/90 border border-stone-800 p-6 rounded-3xl backdrop-blur-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-serif font-bold text-amber-100">Modul Order & Transaksi Kuliner</h1>
            </div>
            <p className="text-xs text-stone-400">
              Kelola katalog menu makanan, input pemesanan waiter, dan pantau arus order masuk ke POS Kasir & Dapur KDS ({currentOutlet.name})
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="bg-stone-950 px-3 py-2 rounded-2xl border border-stone-800 text-stone-300">
              <span className="text-stone-500 text-[10px] block">TOTAL ORDER</span>
              <span className="font-bold text-amber-400 text-sm">{totalOrdersCount} Order</span>
            </div>
            <div className="bg-amber-950/40 px-3 py-2 rounded-2xl border border-amber-500/30 text-amber-300">
              <span className="text-amber-500/80 text-[10px] block">PROSES DAPUR</span>
              <span className="font-bold text-amber-300 text-sm">{activeKitchenCount} Active</span>
            </div>
          </div>
        </div>

        {/* 3 CORE SUB-TAB BUTTONS REQUESTED BY USER */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveSubTab("menu")}
            className={`p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition border ${
              activeSubTab === "menu"
                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/40 hover:text-amber-300"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>1. Menu Makanan (Katalog)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("order_form")}
            className={`p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition border ${
              activeSubTab === "order_form"
                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/40 hover:text-amber-300"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>2. Pesan Makanan (Form Order)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("incoming_orders")}
            className={`p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition border relative ${
              activeSubTab === "incoming_orders"
                ? "bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/20"
                : "bg-stone-950 text-stone-300 border-stone-800 hover:border-amber-500/40 hover:text-amber-300"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>3. Pesanan Masuk (POS & Kitchen)</span>
            {activeKitchenCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] rounded-full bg-rose-500 text-white font-mono animate-pulse">
                {activeKitchenCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          SUB-TAB 1: MENU MAKANAN (KATALOG MENU & HPP)
          ===================================================================== */}
      {activeSubTab === "menu" && (
        <div className="space-y-6">
          {/* Menu Header Filter */}
          <div className="bg-stone-900 p-4 rounded-3xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Cari menu makanan, ikan, atau minuman..."
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-100 focus:border-amber-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMenuCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
                    menuCategoryFilter === cat
                      ? "bg-amber-500 text-stone-950 font-bold"
                      : "bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800"
                  }`}
                >
                  {cat === "All" ? "Semua Kategori" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMenuItems.map((item) => {
              const grossProfit = item.price - item.costHPP;
              const marginPct = Math.round((grossProfit / item.price) * 100);

              return (
                <div
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-3xl p-4 flex flex-col justify-between transition group shadow-lg hover:shadow-2xl"
                >
                  <div>
                    <div className="relative h-32 w-full bg-stone-950 rounded-2xl overflow-hidden mb-3 border border-stone-800/80">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur-md text-amber-300 font-bold text-[9px] px-2 py-0.5 rounded-lg border border-amber-500/30">
                        {item.category}
                      </div>

                      {item.isPopular && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-stone-950 font-bold text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-1 shadow">
                          <Sparkles className="w-2.5 h-2.5" /> Favorite
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-stone-100 text-sm group-hover:text-amber-300 transition">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Harga Jual</span>
                        <span className="font-bold text-emerald-400 text-sm">{formatRupiah(item.price)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block">Estimasi HPP</span>
                        <span className="text-stone-300">{formatRupiah(item.costHPP)} ({marginPct}% Margin)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(item);
                        setActiveSubTab("order_form");
                      }}
                      className="w-full py-2 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Pesan Menu Ini
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: PESAN MAKANAN (FORM & KERANJANG ORDER WAITER/PELANGGAN)
          ===================================================================== */}
      {activeSubTab === "order_form" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Menu Selection & AI Voice Input */}
          <div className="lg:col-span-7 space-y-4">
            {/* AI Voice Assistant Box */}
            <div className="bg-stone-900 border border-amber-500/30 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-amber-100">AI Voice & Quick Order Assistant</span>
                </div>
                <span className="text-[10px] text-stone-400">Ketik/Bicara untuk pesan otomatis</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Contoh: Pesan Gurame Bakar 2 Saung 03, Nasi Liwet 2, Es Kelapa 2..."
                  className="flex-1 bg-stone-950 border border-stone-800 rounded-2xl px-3.5 py-2 text-xs text-stone-100 focus:border-amber-400 outline-none"
                />
                <button
                  onClick={() => handleAiParseOrder(aiText)}
                  disabled={isAiProcessing}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Parse
                </button>
              </div>

              {aiResponse && (
                <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                  {aiResponse}
                </div>
              )}
            </div>

            {/* Order Form Menu Selector Filter */}
            <div className="bg-stone-900 p-4 rounded-3xl border border-stone-800 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={orderItemSearch}
                    onChange={(e) => setOrderItemSearch(e.target.value)}
                    placeholder="Cari makanan & minuman..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={orderCategoryFilter}
                  onChange={(e) => setOrderCategoryFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-2xl px-3 py-2 text-xs text-stone-200 outline-none focus:border-amber-400"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "Semua Kategori" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Grid for Order Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredOrderMenu.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => addToCart(menu)}
                    className="bg-stone-950 hover:bg-stone-850 p-3 rounded-2xl border border-stone-800 cursor-pointer transition flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] text-amber-400 font-semibold block">{menu.category}</span>
                      <h4 className="font-bold text-stone-100 text-xs group-hover:text-amber-300 transition line-clamp-1">
                        {menu.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-800/80">
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        {formatRupiah(menu.price)}
                      </span>
                      <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Info & Cart Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-stone-100 text-base">Keranjang & Detail Order</h3>
              </div>

              {/* Table / Customer Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Saung / Meja</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-amber-300 font-bold outline-none"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.code} ({t.zone}) - {t.capacity} orang
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Tipe Pesanan</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as OrderType)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-stone-200 outline-none"
                  >
                    <option value="Dine-in">Dine-in (Lesehan Saung)</option>
                    <option value="Takeaway">Takeaway (Bungkus)</option>
                    <option value="Delivery">Delivery / Pesan Antar</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Nama Pelanggan</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Kang Asep"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Jumlah Orang (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={paxCount}
                    onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="p-8 text-center bg-stone-950 rounded-2xl border border-dashed border-stone-800 text-stone-500 text-xs">
                    Keranjang pesanan kosong. Klik item menu di sebelah kiri untuk menambah pesanan.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-100 block">{item.menuName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {formatRupiah(item.price)} / porsi
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="p-1 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-amber-300 px-1">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-1 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeCartItem(item.id)}
                            className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.note || ""}
                        onChange={(e) => updateCartNote(item.id, e.target.value)}
                        placeholder="Catatan khusus (misal: Pedas sedang, tanpa timun)..."
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-[11px] text-stone-300 outline-none"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Totals Summary */}
              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal Menu:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Pajak Resto PB1 (10%):</span>
                  <span>{formatRupiah(taxPB1)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Service Charge (5%):</span>
                  <span>{formatRupiah(serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-amber-300 font-bold text-sm pt-2 border-t border-stone-800">
                  <span>TOTAL PESANAN:</span>
                  <span>{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Button to POS & Kitchen */}
              <button
                onClick={handleSubmitOrderToPosAndKitchen}
                disabled={cartItems.length === 0}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
              >
                <ChefHat className="w-4 h-4" /> Kirim Pesanan (Masuk ke POS & Dapur)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: PESANAN MASUK (POS & KITCHEN FEED - LIVE ORDER LIST)
          ===================================================================== */}
      {activeSubTab === "incoming_orders" && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800 text-left">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Total Order</span>
              <span className="text-lg font-bold font-mono text-stone-100">{totalOrdersCount}</span>
            </div>

            <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/30 text-left">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">Proses Dapur</span>
              <span className="text-lg font-bold font-mono text-amber-400">{activeKitchenCount} Active</span>
            </div>

            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 text-left">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Siap / Disajikan</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{readyServedCount} Ready</span>
            </div>

            <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800 text-left">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Omset Lunas</span>
              <span className="text-sm font-bold font-mono text-emerald-400 truncate block">
                {formatRupiah(totalOmsetPaid)}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-stone-900 p-4 rounded-3xl border border-stone-800 space-y-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={incomingSearch}
                  onChange={(e) => setIncomingSearch(e.target.value)}
                  placeholder="Cari No. Order, Nama Pelanggan, atau Saung..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-100 focus:border-amber-400 outline-none"
                />
              </div>

              <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-2xl border border-stone-800 overflow-x-auto w-full lg:w-auto text-xs">
                {[
                  { id: "All", label: "Semua" },
                  { id: "InKitchen", label: "Dapur Process" },
                  { id: "Ready", label: "Ready / Disajikan" },
                  { id: "Completed", label: "Selesai" },
                  { id: "Unpaid", label: "Belum Lunas" },
                  { id: "Paid", label: "Lunas" },
                  { id: "Cancelled", label: "Batal / Void" }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setIncomingStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition ${
                      incomingStatusFilter === st.id
                        ? "bg-amber-500 text-stone-950 font-bold shadow"
                        : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end lg:self-auto">
                <Filter className="w-4 h-4 text-stone-400" />
                <select
                  value={incomingTypeFilter}
                  onChange={(e) => setIncomingTypeFilter(e.target.value)}
                  className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-400"
                >
                  <option value="All">Semua Tipe Order</option>
                  <option value="Dine-in">Dine-in (Lesehan Saung)</option>
                  <option value="Takeaway">Takeaway (Bungkus)</option>
                  <option value="Delivery">Delivery / Pesan Antar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 font-bold uppercase border-b border-stone-800 text-[11px]">
                  <tr>
                    <th className="p-4">No. Order & Waktu</th>
                    <th className="p-4">Saung / Pelanggan</th>
                    <th className="p-4">Tipe Order</th>
                    <th className="p-4">Ringkasan Item Pesanan</th>
                    <th className="p-4 text-center">Status Dapur</th>
                    <th className="p-4 text-center">Pembayaran POS</th>
                    <th className="p-4 text-right">Total (Rp)</th>
                    <th className="p-4 text-center">Aksi Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {filteredIncomingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500">
                        Tidak ada data order transaksi yang sesuai kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredIncomingOrders.map((ord) => {
                      const isPaid = ord.paymentStatus === "Paid";
                      const isCancelled = ord.status === "Cancelled";

                      return (
                        <tr key={ord.id} className="hover:bg-stone-850/60 transition group">
                          {/* Order Number & Time */}
                          <td className="p-4 font-mono">
                            <span className="font-bold text-amber-300 block">{ord.orderNumber}</span>
                            <span className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-stone-500" /> {ord.createdAt}
                            </span>
                          </td>

                          {/* Saung & Customer */}
                          <td className="p-4">
                            <span className="font-bold text-stone-100 block">{ord.tableCode}</span>
                            <span className="text-[11px] text-stone-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-amber-400" /> {ord.customerName} ({ord.paxCount} Pax)
                            </span>
                          </td>

                          {/* Order Type */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                ord.orderType === "Dine-in"
                                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                  : ord.orderType === "Takeaway"
                                  ? "bg-sky-500/10 text-sky-300 border border-sky-500/30"
                                  : "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                              }`}
                            >
                              {ord.orderType === "Dine-in" ? (
                                <Utensils className="w-3 h-3" />
                              ) : ord.orderType === "Takeaway" ? (
                                <ShoppingBag className="w-3 h-3" />
                              ) : (
                                <Truck className="w-3 h-3" />
                              )}
                              {ord.orderType || "Dine-in"}
                            </span>
                          </td>

                          {/* Item Summary */}
                          <td className="p-4 max-w-xs">
                            <div className="space-y-0.5">
                              {ord.items.slice(0, 2).map((it, idx) => (
                                <span key={idx} className="block text-stone-200 text-[11px] truncate">
                                  • <span className="font-bold text-amber-300">{it.qty}x</span> {it.menuName}
                                </span>
                              ))}
                              {ord.items.length > 2 && (
                                <span className="text-[10px] text-stone-500 italic">
                                  +{ord.items.length - 2} menu lainnya...
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Kitchen Status */}
                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                                ord.status === "InKitchen" || ord.status === "New"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                                  : ord.status === "Ready"
                                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                  : ord.status === "Served" || ord.status === "Completed"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              }`}
                            >
                              {ord.status === "InKitchen" || ord.status === "New" ? (
                                <>
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>Dapur Masak</span>
                                </>
                              ) : ord.status === "Ready" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-sky-400" />
                                  <span>Siap Saji</span>
                                </>
                              ) : ord.status === "Served" || ord.status === "Completed" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Disajikan</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-400" />
                                  <span>Void / Batal</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Payment Status POS */}
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] font-mono ${
                                  isPaid
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                                    : "bg-amber-950 text-amber-300 border border-amber-500/30"
                                }`}
                              >
                                {isPaid ? "LUNAS (POS)" : "BELUM LUNAS"}
                              </span>
                              {ord.paymentMethod && (
                                <span className="text-[9px] text-stone-400 font-mono">
                                  {ord.paymentMethod}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="p-4 text-right font-mono font-bold text-emerald-400">
                            {formatRupiah(ord.total)}
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onOpenReceipt(ord)}
                                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition flex items-center gap-1 text-[11px] font-bold"
                                title="Cetak / Lihat Struk Kasir"
                              >
                                <Printer className="w-3.5 h-3.5" /> Struk
                              </button>

                              <button
                                onClick={() => setSelectedOrderDetail(ord)}
                                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                                title="Detail Pesanan Lengkap"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {!isCancelled && (
                                <button
                                  onClick={() => handleOpenVoidModal(ord)}
                                  className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/60 transition"
                                  title="Void / Batalkan Order"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL ORDER MODAL */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-stone-100 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-1.5 rounded-xl hover:bg-stone-800 transition"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <Receipt className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-serif font-bold text-lg text-amber-100">
                  Detail Order {selectedOrderDetail.orderNumber}
                </h3>
                <p className="text-xs text-stone-400">
                  {selectedOrderDetail.tableCode} • Pelanggan: {selectedOrderDetail.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedOrderDetail.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-100 block">{it.menuName}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {it.qty} x {formatRupiah(it.price)} {it.note && `(${it.note})`}
                    </span>
                  </div>
                  <span className="font-bold text-amber-300 font-mono">
                    {formatRupiah(it.qty * it.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal Menu:</span>
                <span>{formatRupiah(selectedOrderDetail.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Pajak Resto PB1 (10%):</span>
                <span>{formatRupiah(selectedOrderDetail.taxPB1)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Service Charge (5%):</span>
                <span>{formatRupiah(selectedOrderDetail.serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-amber-300 font-bold text-sm pt-2 border-t border-stone-800">
                <span>TOTAL AKHIR:</span>
                <span>{formatRupiah(selectedOrderDetail.total)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenReceipt(selectedOrderDetail);
                  setSelectedOrderDetail(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Cetak Struk Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOID ORDER MODAL WITH SUPERVISOR PIN */}
      {showVoidModal && voidTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 text-stone-100 relative shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base">Otorisasi Void / Batal Transaksi</h3>
            </div>

            <p className="text-xs text-stone-300">
              Membatalkan order <span className="font-mono text-amber-300 font-bold">{voidTargetOrder.orderNumber}</span> memerlukan PIN Otorisasi Supervisor / Manager.
            </p>

            {voidError && (
              <div className="p-3 bg-rose-950 text-rose-300 text-xs rounded-xl border border-rose-500/40">
                {voidError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Alasan Pembatalan</label>
              <select
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none"
              >
                <option value="Salah Pesan / Pembatalan Pelanggan">Salah Pesan / Pembatalan Pelanggan</option>
                <option value="Bahan Baku Dapur Habis">Bahan Baku Dapur Habis</option>
                <option value="Kesalahan Entry Kasir">Kesalahan Entry Kasir</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">PIN Supervisor (Default: 1234 atau 8888)</label>
              <input
                type="password"
                maxLength={6}
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-stone-950 border border-rose-500/40 rounded-xl p-3 text-center text-lg font-mono tracking-widest text-rose-300 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowVoidModal(false)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs transition"
              >
                Batal
              </button>

              <button
                onClick={handleConfirmVoid}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
              >
                Konfirmasi Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
