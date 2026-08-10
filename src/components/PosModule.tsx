import React, { useState } from "react";
import {
  MenuItem,
  Order,
  OrderItem,
  TableSaung,
  Outlet,
  MenuCategory,
  PaymentMethod,
  OrderType
} from "../types";
import { formatRupiah, generateOrderNumber } from "../utils/formatters";
import {
  Search,
  Sparkles,
  Mic,
  MicOff,
  Plus,
  Minus,
  Trash2,
  Receipt,
  QrCode,
  CreditCard,
  Banknote,
  Send,
  User,
  Users,
  CheckCircle,
  Clock,
  Utensils,
  ShoppingBag,
  Truck,
  Split,
  Merge,
  Percent,
  History,
  Printer,
  X,
  Building,
  Check,
  Copy,
  ArrowRight
} from "lucide-react";

interface PosModuleProps {
  menuItems: MenuItem[];
  tables: TableSaung[];
  currentOutlet: Outlet;
  orders: Order[];
  onCreateOrder: (order: Order) => void;
  onUpdateOrder?: (order: Order) => void;
  onOpenReceipt: (order: Order) => void;
  preselectedTableCode?: string;
}

export const PosModule: React.FC<PosModuleProps> = ({
  menuItems,
  tables,
  currentOutlet,
  orders,
  onCreateOrder,
  onUpdateOrder,
  onOpenReceipt,
  preselectedTableCode
}) => {
  // Order Configuration State
  const [orderType, setOrderType] = useState<OrderType>("Dine-in");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<string>(preselectedTableCode || tables[0]?.code || "Saung 01");
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);

  // Active Unpaid Order for currently selected table
  const activeUnpaidOrder = orders.find(
    (o) => o.tableCode === selectedTable && o.paymentStatus === "Unpaid"
  );

  const handleLoadOrderToCart = (ord: Order) => {
    setCartItems(ord.items);
    setCustomerName(ord.customerName);
    setPaxCount(ord.paxCount || 2);
    if (ord.orderType) setOrderType(ord.orderType);
    if (ord.discount) setDiscountValue(ord.discount);
    setLoadedOrderId(ord.id);
  };

  const handleUnloadOrderFromCart = () => {
    setCartItems([]);
    setLoadedOrderId(null);
    setCustomerName("Pelanggan Lesehan");
    setDiscountValue(0);
  };

  React.useEffect(() => {
    if (preselectedTableCode) {
      setSelectedTable(preselectedTableCode);
    }
  }, [preselectedTableCode]);

  // Auto-load active unpaid order when selectedTable changes or when active order updates
  React.useEffect(() => {
    const activeOrd = orders.find(
      (o) => o.tableCode === selectedTable && o.paymentStatus === "Unpaid"
    );
    if (activeOrd) {
      if (loadedOrderId !== activeOrd.id) {
        handleLoadOrderToCart(activeOrd);
      }
    } else {
      if (loadedOrderId) {
        const loadedOrd = orders.find((o) => o.id === loadedOrderId);
        if (loadedOrd && (loadedOrd.tableCode !== selectedTable || loadedOrd.paymentStatus === "Paid")) {
          setLoadedOrderId(null);
          setCartItems([]);
        }
      }
    }
  }, [selectedTable, orders]);

  const [customerName, setCustomerName] = useState("Pelanggan Lesehan");
  const [paxCount, setPaxCount] = useState<number>(4);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Discount State
  const [discountType, setDiscountType] = useState<"nominal" | "percent">("nominal");
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Tax & Service Charge Toggle
  const [applyTax, setApplyTax] = useState(true);
  const [applyService, setApplyService] = useState(true);

  // AI Voice & Text Order Parser State
  const [aiInputText, setAiInputText] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  // Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Modifier & Level Pedas Modal State
  const [showModifierModal, setShowModifierModal] = useState(false);
  const [activeMenuForCustom, setActiveMenuForCustom] = useState<MenuItem | null>(null);
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState("Level 1 - Sedang");
  const [selectedToppings, setSelectedToppings] = useState<{ name: string; price: number }[]>([]);
  const [customNoteText, setCustomNoteText] = useState("");

  // Payment Details State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [edcRefNumber, setEdcRefNumber] = useState("");
  const [bankTarget, setBankTarget] = useState("BCA");
  const [copiedVa, setCopiedVa] = useState(false);

  // Split Bill State
  const [splitPax, setSplitPax] = useState<number>(2);

  // Merge Bill State
  const [sourceTableMerge, setSourceTableMerge] = useState<string>("");

  // History Search State
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"All" | "Paid" | "Unpaid">("All");

  const categories: string[] = [
    "All",
    "Paket Menu Komplit",
    "Nasi Timbel",
    "Nasi Liwet",
    "Ayam & Bebek",
    "Olahan Ikan",
    "Pepes Khas Sunda",
    "Tumisan & Cah",
    "Sayuran & Sup",
    "Sambal Khas Sunda",
    "Lalapan Segar",
    "Minuman & Es",
    "Camilan & Penutup"
  ];

  const availableToppings = [
    { name: "Pete Goreng / Bakar", price: 5000 },
    { name: "Jengkol Balado", price: 7000 },
    { name: "Kremes Serundeng Lengkuas", price: 3000 },
    { name: "Tahu & Tempe Bacem", price: 5000 },
    { name: "Telur Dadar Sunda", price: 6000 },
    { name: "Extra Sambal Dadak Limau", price: 4000 },
    { name: "Kerupuk Aci Blelek", price: 3000 },
    { name: "Oncom Tutug Sangrai", price: 5000 }
  ];

  const spiceLevels = [
    "Level 0 - Tidak Pedas",
    "Level 1 - Sedang",
    "Level 2 - Pedas Mantap",
    "Level 3 - Pedas Jalabitung (Extrem)"
  ];

  const handleOpenModifierModal = (menu: MenuItem) => {
    setActiveMenuForCustom(menu);
    setSelectedSpiceLevel("Level 1 - Sedang");
    setSelectedToppings([]);
    setCustomNoteText("");
    setShowModifierModal(true);
  };

  const handleAddCustomizedToCart = () => {
    if (!activeMenuForCustom) return;

    const toppingTotalPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const finalPrice = activeMenuForCustom.price + toppingTotalPrice;
    const toppingNames = selectedToppings.map((t) => t.name).join(", ");
    
    const combinedNote = [
      `[${selectedSpiceLevel}]`,
      toppingNames ? `Topping: ${toppingNames}` : "",
      customNoteText ? `Ket: ${customNoteText}` : ""
    ]
      .filter(Boolean)
      .join(" | ");

    const station =
      activeMenuForCustom.category === "Minuman & Es"
        ? "Bar Minuman"
        : activeMenuForCustom.category === "Tumisan & Cah" || activeMenuForCustom.category === "Nasi Liwet" || activeMenuForCustom.category === "Nasi Timbel"
        ? "Dapur Tumis & Nasi"
        : "Dapur Bakar/Goreng";

    setCartItems((prev) => [
      ...prev,
      {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuId: activeMenuForCustom.id,
        menuName: activeMenuForCustom.name,
        category: activeMenuForCustom.category as MenuCategory,
        price: finalPrice,
        costHPP: activeMenuForCustom.costHPP,
        qty: 1,
        note: combinedNote,
        kitchenStatus: "Queued",
        kitchenStation: station
      }
    ]);

    setShowModifierModal(false);
    setActiveMenuForCustom(null);
  };

  const filteredMenu = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (menu: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menuId === menu.id);
      if (existing) {
        return prev.map((i) =>
          i.menuId === menu.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        const station =
          menu.category === "Minuman & Es"
            ? "Bar Minuman"
            : menu.category === "Tumisan & Cah" || menu.category === "Nasi & Paket Liwet" || menu.category === "Lalapan Segar"
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
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const removeCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const calculatedDiscount =
    discountType === "percent"
      ? Math.round((subtotal * Math.min(100, discountValue)) / 100)
      : Math.min(subtotal, discountValue);

  const taxableSubtotal = Math.max(0, subtotal - calculatedDiscount);
  const taxPB1 = applyTax ? Math.round(taxableSubtotal * (currentOutlet.taxRatePct / 100)) : 0;
  const serviceCharge = applyService ? Math.round(taxableSubtotal * (currentOutlet.serviceChargePct / 100)) : 0;
  const grandTotal = Math.max(0, taxableSubtotal + taxPB1 + serviceCharge);

  // AI Voice / Text Order Parser Handler
  const handleAiParseOrder = async (promptText?: string) => {
    const textToProcess = promptText || aiInputText;
    if (!textToProcess.trim()) return;

    setIsAiProcessing(true);
    setAiMessage("");

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "order_parser",
          prompt: textToProcess,
          context: { outlet: currentOutlet.name }
        })
      });
      const result = await res.json();

      if (result.success && result.data) {
        const data = result.data;
        if (data.saung) setSelectedTable(data.saung);
        if (data.customerName) setCustomerName(data.customerName);

        if (Array.isArray(data.items) && data.items.length > 0) {
          data.items.forEach((parsedItem: any) => {
            const matchedMenu = menuItems.find(
              (m) =>
                m.name.toLowerCase().includes((parsedItem.name || "").toLowerCase()) ||
                (parsedItem.name || "").toLowerCase().includes(m.name.toLowerCase())
            );

            if (matchedMenu) {
              addToCart(matchedMenu);
            } else {
              setCartItems((prev) => [
                ...prev,
                {
                  id: `cart-ai-${Date.now()}-${Math.random()}`,
                  menuId: `m-custom-${Date.now()}`,
                  menuName: parsedItem.name || "Pesanan Khusus AI",
                  category: "Nasi & Paket Liwet",
                  price: parsedItem.price || 35000,
                  costHPP: 12000,
                  qty: parsedItem.qty || 1,
                  note: parsedItem.note || "Suara AI",
                  kitchenStatus: "Queued",
                  kitchenStation: "Dapur Bakar/Goreng"
                }
              ]);
            }
          });

          setAiMessage(`✓ AI Berhasil Memproses Pesanan! ${data.upsellRecommendation || ""}`);
        } else {
          setAiMessage("AI telah mendengarkan, tapi belum mengenali nama menu secara spesifik.");
        }
      }
    } catch {
      setAiMessage("Gagal menghubungkan AI, mencoba parse offline...");
    } finally {
      setIsAiProcessing(false);
      setAiInputText("");
    }
  };

  const handleSimulateVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setAiInputText("Merekam suara kasir/pelanggan...");
      setTimeout(() => {
        const sampleVoices = [
          "Pesan Nasi Liwet Kastrol 2 porsi Saung 04, Gurame Bakar Kecap 1 pedas sedang, Es Kelapa Batok 3",
          "Tolong catat Saung 02: Ayam Goreng Lengkuas 2, Sayur Asem 1, Sambal Dadak 1, Es Teh Manis 4",
          "Saung 01 minta Paket Nasi Timbel 3, Gurame Terbang 1 garing, Sambal Goang 2 porsi"
        ];
        const randomVoice = sampleVoices[Math.floor(Math.random() * sampleVoices.length)];
        setAiInputText(randomVoice);
        setIsListening(false);
        handleAiParseOrder(randomVoice);
      }, 1800);
    }
  };

  // Merge Bill Handler
  const handleMergeBill = () => {
    if (!sourceTableMerge) return;
    const sourceOrder = orders.find(
      (o) => o.tableCode === sourceTableMerge && o.paymentStatus === "Unpaid"
    );

    if (sourceOrder && sourceOrder.items.length > 0) {
      setCartItems((prev) => [...prev, ...sourceOrder.items]);
      setCustomerName((prev) => `${prev} & ${sourceOrder.customerName}`);
      setShowMergeModal(false);
      alert(`Berhasil menggabungkan pesanan dari ${sourceTableMerge} ke keranjang aktif!`);
    } else {
      alert(`Tidak ditemukan pesanan aktif yang belum dibayar di ${sourceTableMerge}.`);
    }
  };

  // Order Submission
  const handleCompleteOrder = (status: "Paid" | "Unpaid") => {
    if (cartItems.length === 0) return;

    // Check if we are settling an existing loaded unpaid order
    const existingOrder =
      (loadedOrderId ? orders.find((o) => o.id === loadedOrderId) : null) ||
      orders.find((o) => o.tableCode === selectedTable && o.paymentStatus === "Unpaid");

    if (existingOrder) {
      const updatedOrder: Order = {
        ...existingOrder,
        tableCode: orderType === "Dine-in" ? selectedTable : orderType,
        customerName: customerName || existingOrder.customerName,
        paxCount: paxCount || existingOrder.paxCount,
        orderType,
        items: cartItems,
        subtotal,
        taxPB1,
        serviceCharge,
        discount: calculatedDiscount,
        discountPercent: discountType === "percent" ? discountValue : undefined,
        total: grandTotal,
        status: status === "Paid" ? "Served" : existingOrder.status,
        paymentStatus: status,
        paymentMethod: status === "Paid" ? paymentMethod : existingOrder.paymentMethod,
        amountPaid:
          status === "Paid"
            ? paymentMethod === "Cash"
              ? cashGiven || grandTotal
              : grandTotal
            : existingOrder.amountPaid,
        changeDue:
          status === "Paid" && paymentMethod === "Cash"
            ? Math.max(0, (cashGiven || grandTotal) - grandTotal)
            : existingOrder.changeDue,
        paidAt:
          status === "Paid"
            ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
            : existingOrder.paidAt,
        cashierName: "Siti Rahma"
      };

      if (onUpdateOrder) {
        onUpdateOrder(updatedOrder);
      } else {
        onCreateOrder(updatedOrder);
      }

      setShowPaymentModal(false);
      setCartItems([]);
      setLoadedOrderId(null);
      setDiscountValue(0);
      setCashGiven(0);
      onOpenReceipt(updatedOrder);
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      outletId: currentOutlet.id,
      tableCode: orderType === "Dine-in" ? selectedTable : orderType,
      customerName: customerName || "Pelanggan Lesehan",
      paxCount: paxCount || 2,
      orderType,
      items: cartItems,
      subtotal,
      taxPB1,
      serviceCharge,
      discount: calculatedDiscount,
      discountPercent: discountType === "percent" ? discountValue : undefined,
      total: grandTotal,
      status: "InKitchen",
      paymentStatus: status,
      paymentMethod: status === "Paid" ? paymentMethod : undefined,
      amountPaid:
        status === "Paid"
          ? paymentMethod === "Cash"
            ? cashGiven || grandTotal
            : grandTotal
          : undefined,
      changeDue:
        status === "Paid" && paymentMethod === "Cash"
          ? Math.max(0, (cashGiven || grandTotal) - grandTotal)
          : 0,
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      paidAt: status === "Paid" ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : undefined,
      cashierName: "Siti Rahma"
    };

    onCreateOrder(newOrder);
    setShowPaymentModal(false);
    setCartItems([]);
    setLoadedOrderId(null);
    setDiscountValue(0);
    setCashGiven(0);
    onOpenReceipt(newOrder);
  };

  // Filtered Orders for History Modal
  const filteredHistoryOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
      o.tableCode.toLowerCase().includes(historySearch.toLowerCase());

    const matchesStatus =
      historyStatusFilter === "All" || o.paymentStatus === historyStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Menu Catalog & AI Voice Order (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        {/* Quick Unpaid Bills Selector Bar */}
        {orders.filter((o) => o.paymentStatus === "Unpaid").length > 0 && (
          <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border border-amber-500/40 p-3 rounded-2xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>
                  {orders.filter((o) => o.paymentStatus === "Unpaid").length} Tagihan Belum Dibayar (Siap Diproses Kasir):
                </span>
              </div>
              <span className="text-[10px] text-stone-400">Klik saung untuk muat bill</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {orders
                .filter((o) => o.paymentStatus === "Unpaid")
                .map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setOrderType(ord.orderType || "Dine-in");
                      setSelectedTable(ord.tableCode);
                      handleLoadOrderToCart(ord);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap border transition ${
                      selectedTable === ord.tableCode
                        ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-105"
                        : "bg-stone-950 text-stone-200 border-stone-800 hover:border-amber-500/50"
                    }`}
                  >
                    <span>{ord.tableCode}</span>
                    <span className="text-[10px] opacity-80">({ord.customerName})</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-900 text-emerald-300 border border-emerald-500/30">
                      {formatRupiah(ord.total)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Order Type Tabs & History Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-2.5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setOrderType("Dine-in")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                orderType === "Dine-in"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dine-in (Makan di Tempat)</span>
            </button>

            <button
              onClick={() => setOrderType("Takeaway")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                orderType === "Takeaway"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway (Bawa Pulang)</span>
            </button>

            <button
              onClick={() => setOrderType("Delivery")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                orderType === "Delivery"
                  ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20"
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery (Kirim)</span>
            </button>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="w-full sm:w-auto px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-amber-300 font-bold text-xs rounded-xl border border-stone-700 flex items-center justify-center gap-1.5 transition"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Riwayat Transaksi</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px]">
              {orders.length}
            </span>
          </button>
        </div>

        {/* Smart AI Voice Order Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 p-4 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-amber-200">AI Voice & Order Input</h3>
            </div>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-400/30">
              Gemini 3.6 Flash Powered
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              placeholder="Contoh: Pesan 2 Liwet Saung 04, 1 Gurame Bakar pedas sedang..."
              className="flex-1 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-amber-100 placeholder-stone-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAiParseOrder()}
            />

            <button
              onClick={handleSimulateVoiceInput}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition ${
                isListening
                  ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                  : "bg-amber-500 hover:bg-amber-600 text-stone-950 border-amber-400"
              }`}
              title="Bicara via Mikrofon"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleAiParseOrder()}
              disabled={isAiProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isAiProcessing ? "AI..." : "Parse AI"}
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {aiMessage && (
            <div className="text-[11px] p-2 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{aiMessage}</span>
            </div>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nasi Liwet, Gurame Bakar, Sambal Dadak..."
              className="w-full bg-stone-900 border border-stone-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-200 placeholder-stone-500 outline-none shadow-inner"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 rounded-xl text-xs whitespace-nowrap font-semibold transition min-h-[44px] flex items-center justify-center ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 active:bg-stone-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenModifierModal(item)}
              className="bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 group shadow-lg"
            >
              <div>
                <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-stone-950">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.isPopular && (
                    <span className="absolute top-1.5 left-1.5 bg-amber-500 text-stone-950 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase shadow">
                      Terlaris
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-stone-950/80 backdrop-blur-md text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    HPP {formatRupiah(item.costHPP)}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-amber-100 group-hover:text-amber-300 line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-800/80">
                <span className="font-mono font-bold text-xs text-amber-400">
                  {formatRupiah(item.price)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModifierModal(item);
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition"
                  >
                    Custom
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center transition"
                    title="Tambah Langsung"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Active Order Cart & Billing Controls (5 cols) */}
      <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
        <div>
          {/* Header & Table / Customer Info */}
          <div className="pb-3 border-b border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  Keranjang Kasir
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowMergeModal(true)}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg border border-stone-700 text-[10px] font-bold flex items-center gap-1 transition"
                  title="Gabung Tagihan Meja Lain"
                >
                  <Merge className="w-3 h-3 text-sky-400" />
                  Gabung Bill
                </button>
                <button
                  onClick={() => setShowSplitModal(true)}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg border border-stone-700 text-[10px] font-bold flex items-center gap-1 transition"
                  title="Bagi Tagihan Per Pax / Item"
                >
                  <Split className="w-3 h-3 text-purple-400" />
                  Split Bill
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-stone-400 font-semibold block mb-1">
                  Nomor Meja / Saung:
                </label>
                {orderType === "Dine-in" ? (
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.code} ({t.type}) - {t.status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={orderType === "Takeaway" ? "TAKEAWAY (Bawa Pulang)" : "DELIVERY (Pengiriman)"}
                    className="w-full bg-stone-950/60 border border-stone-800 text-amber-400/80 font-bold rounded-xl px-3 py-2 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="text-[10px] text-stone-400 font-semibold block mb-1">
                  Nama Pelanggan:
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl pl-8 pr-2 py-1.5 text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Active Order Banner Card */}
            {activeUnpaidOrder && (
              <div className="mt-2 bg-gradient-to-r from-amber-950/90 via-stone-950 to-amber-950/70 p-3 rounded-2xl border border-amber-500/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span className="font-serif font-bold text-xs text-amber-200">
                      Tagihan Aktif #{activeUnpaidOrder.orderNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeUnpaidOrder.status === "Served"
                      ? "Selesai Disajikan"
                      : activeUnpaidOrder.status === "Ready"
                      ? "Siap Disajikan"
                      : "Sedang Dimasak"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span>
                    Pemesan: <strong className="text-amber-100">{activeUnpaidOrder.customerName}</strong> ({activeUnpaidOrder.items.length} Menu)
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatRupiah(activeUnpaidOrder.total)}
                  </span>
                </div>

                {loadedOrderId === activeUnpaidOrder.id ? (
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-amber-500/20">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Struk / Item Saung Ini Terpasang di Kasir
                    </span>
                    <button
                      type="button"
                      onClick={handleUnloadOrderFromCart}
                      className="text-stone-400 hover:text-rose-400 underline text-[10px] font-semibold"
                    >
                      Reset / Pesanan Baru
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleLoadOrderToCart(activeUnpaidOrder)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Muat Pesanan Saung Ini ke Keranjang Kasir
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="my-3 space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-stone-500">
                <Receipt className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-xs">Keranjang pesanan masih kosong.</p>
                <p className="text-[10px] text-stone-600">Klik menu di sebelah kiri atau gunakan Voice AI.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-amber-100">
                    <span>{item.menuName}</span>
                    <span className="font-mono text-emerald-400">
                      {formatRupiah(item.price * item.qty)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Catatan (e.g. Pedes sedang, pete terpisah)"
                      value={item.note || ""}
                      onChange={(e) => updateCartNote(item.id, e.target.value)}
                      className="bg-stone-900 text-[10px] text-stone-300 placeholder-stone-600 px-2 py-1 rounded border border-stone-800 w-3/5 outline-none focus:border-amber-500/50"
                    />

                    <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs px-1 text-amber-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="p-1 hover:bg-stone-800 text-stone-400 hover:text-white rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-950/50 rounded ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Billing Calculation Footer */}
        <div className="pt-3 border-t border-stone-800 space-y-2 text-xs">
          <div className="flex justify-between text-stone-400">
            <span>Subtotal Menu:</span>
            <span className="font-mono text-stone-200">{formatRupiah(subtotal)}</span>
          </div>

          {/* Discount Controls */}
          <div className="flex justify-between items-center text-stone-400 gap-2">
            <div className="flex items-center gap-1">
              <span>Diskon:</span>
              <button
                type="button"
                onClick={() => setDiscountType((prev) => (prev === "nominal" ? "percent" : "nominal"))}
                className="px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 font-mono text-[10px] border border-stone-700"
              >
                {discountType === "nominal" ? "Rp" : "%"}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={discountValue || ""}
                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                placeholder={discountType === "nominal" ? "0" : "0%"}
                className="w-20 bg-stone-950 border border-stone-800 rounded text-right px-2 py-0.5 text-xs text-rose-400 font-mono outline-none"
              />
              <span className="text-rose-400 font-mono text-[11px]">
                (-{formatRupiah(calculatedDiscount)})
              </span>
            </div>
          </div>

          {/* Quick Discount Presets */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { label: "Member 10%", pct: 10 },
              { label: "Promo 15%", pct: 15 },
              { label: "VIP 20%", pct: 20 },
              { label: "Clear", pct: 0 }
            ].map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => {
                  setDiscountType("percent");
                  setDiscountValue(d.pct);
                }}
                className="px-2 py-0.5 bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-amber-300 rounded border border-stone-800 text-[10px]"
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Tax PB1 & Service Charge Toggles */}
          <div className="flex justify-between items-center text-stone-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={applyTax}
                onChange={(e) => setApplyTax(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Pajak Resto (PB1 {currentOutlet.taxRatePct}%):</span>
            </label>
            <span className="font-mono text-stone-200">{formatRupiah(taxPB1)}</span>
          </div>

          <div className="flex justify-between items-center text-stone-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={applyService}
                onChange={(e) => setApplyService(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Service Charge ({currentOutlet.serviceChargePct}%):</span>
            </label>
            <span className="font-mono text-stone-200">{formatRupiah(serviceCharge)}</span>
          </div>

          <div className="border-t border-stone-800 pt-2 flex justify-between items-center">
            <span className="font-bold text-sm text-amber-200">TOTAL BILL:</span>
            <span className="font-mono font-extrabold text-lg text-emerald-400">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleCompleteOrder("Unpaid")}
              disabled={cartItems.length === 0}
              className="py-3 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold text-xs rounded-xl border border-stone-700 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              Simpan Tagihan Saung
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cartItems.length === 0}
              className="py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Banknote className="w-4 h-4" />
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-200">Pembayaran Kasir</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-center space-y-1">
              <span className="text-xs text-stone-400 uppercase">
                Total Tagihan ({orderType === "Dine-in" ? selectedTable : orderType})
              </span>
              <div className="font-mono font-extrabold text-2xl text-emerald-400">
                {formatRupiah(grandTotal)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-2">
                Pilih Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    paymentMethod === "Cash"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px]">Tunai</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("QRIS")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    paymentMethod === "QRIS"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px]">QRIS Dynamic</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Debit/Credit Card")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    paymentMethod === "Debit/Credit Card"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span className="text-[11px]">Kartu EDC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("Transfer Bank")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    paymentMethod === "Transfer Bank"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  <Building className="w-4 h-4 text-purple-400" />
                  <span className="text-[11px]">Transfer VA</span>
                </button>
              </div>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === "Cash" && (
              <div className="space-y-2 text-xs">
                <label className="text-stone-300 font-semibold block">Uang Diterima Pelanggan:</label>
                <input
                  type="number"
                  value={cashGiven || ""}
                  onChange={(e) => setCashGiven(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-mono text-base font-bold rounded-xl px-4 py-2.5 outline-none focus:border-amber-400"
                />
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[grandTotal, 50000, 100000, 200000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCashGiven(preset)}
                      className="text-[10px] font-mono bg-stone-800 hover:bg-stone-700 text-stone-300 px-2 py-1 rounded-lg border border-stone-700 whitespace-nowrap"
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center p-3 bg-stone-950 rounded-xl border border-stone-800 pt-2 font-mono">
                  <span className="text-stone-400 text-xs">Kembalian:</span>
                  <span className="font-extrabold text-emerald-400 text-base">
                    {formatRupiah(Math.max(0, (cashGiven || grandTotal) - grandTotal))}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS Dynamic Details */}
            {paymentMethod === "QRIS" && (
              <div className="text-center py-4 space-y-2 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`QRIS-SUNDARESTO-${grandTotal}`)}`}
                  alt="QRIS Code"
                  className="w-36 h-36 mx-auto rounded-xl p-2 bg-white shadow-lg"
                />
                <div className="font-mono font-bold text-amber-300 text-sm">
                  Nominal: {formatRupiah(grandTotal)}
                </div>
                <p className="text-[11px] text-stone-400">
                  Scan QRIS menggunakan GoPay, OVO, ShopeePay, BCA, atau Mobile Banking lainnya.
                </p>
              </div>
            )}

            {/* EDC Card Details */}
            {paymentMethod === "Debit/Credit Card" && (
              <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
                <div>
                  <label className="text-stone-400 font-semibold block mb-1">Nomor Referensi EDC / Struk:</label>
                  <input
                    type="text"
                    value={edcRefNumber}
                    onChange={(e) => setEdcRefNumber(e.target.value)}
                    placeholder="Contoh: EDC-8849201"
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer VA Details */}
            {paymentMethod === "Transfer Bank" && (
              <div className="space-y-3 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 font-semibold">Pilih Bank VA:</span>
                  <div className="flex gap-1">
                    {["BCA", "Mandiri", "BRI"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBankTarget(b)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bankTarget === b ? "bg-amber-500 text-stone-950" : "bg-stone-900 text-stone-400"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-center space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase">Virtual Account {bankTarget}</span>
                  <div className="font-mono font-bold text-amber-300 text-base flex items-center justify-center gap-2">
                    <span>880918290311</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCopiedVa(true);
                        setTimeout(() => setCopiedVa(false), 2000);
                      }}
                      className="text-stone-400 hover:text-amber-300"
                    >
                      {copiedVa ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => handleCompleteOrder("Paid")}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-amber-600 text-stone-950 font-extrabold text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Proses Pembayaran & Cetak Struk
            </button>
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Split className="w-5 h-5 text-purple-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">Split Bill (Bagi Tagihan)</h3>
              </div>
              <button onClick={() => setShowSplitModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Jumlah Orang / Pax:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSplitPax((p) => Math.max(2, p - 1))}
                    className="p-2 bg-stone-800 rounded-xl border border-stone-700 text-amber-300 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-base font-bold text-amber-200 px-4">{splitPax} Orang</span>
                  <button
                    onClick={() => setSplitPax((p) => p + 1)}
                    className="p-2 bg-stone-800 rounded-xl border border-stone-700 text-amber-300 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex justify-between text-stone-400">
                  <span>Total Tagihan Saung:</span>
                  <span className="font-mono text-stone-200">{formatRupiah(grandTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-2 border-t border-stone-800">
                  <span>Nominal Per Orang ({splitPax} Pax):</span>
                  <span className="font-mono text-base">{formatRupiah(Math.round(grandTotal / splitPax))}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSplitModal(false);
                  setShowPaymentModal(true);
                }}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                Bayar Bagian Pertama ({formatRupiah(Math.round(grandTotal / splitPax))})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Bill Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-sky-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Merge className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">Gabung Tagihan Saung</h3>
              </div>
              <button onClick={() => setShowMergeModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-400">
                Pilih saung / meja asal yang ingin digabungkan pesanan aktifnya ke keranjang kasir saat ini:
              </p>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Pilih Saung / Meja Asal:</label>
                <select
                  value={sourceTableMerge}
                  onChange={(e) => setSourceTableMerge(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-bold rounded-xl p-2.5 outline-none"
                >
                  <option value="">-- Pilih Saung / Meja --</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.code} ({t.type}) - {t.status}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleMergeBill}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                Gabungkan Bill Meja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-stone-100 space-y-4 max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-amber-200">Riwayat Transaksi Kasir</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari No. Struk atau Nama Pelanggan..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-200 outline-none"
                />
              </div>

              <div className="flex gap-1">
                {(["All", "Paid", "Unpaid"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setHistoryStatusFilter(st)}
                    className={`px-3 py-2 rounded-xl font-bold transition ${
                      historyStatusFilter === st
                        ? "bg-amber-500 text-stone-950"
                        : "bg-stone-950 text-stone-400 border border-stone-800"
                    }`}
                  >
                    {st === "All" ? "Semua" : st === "Paid" ? "Terbayar" : "Belum Bayar"}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
              {filteredHistoryOrders.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-xs">
                  Tidak ada transaksi yang cocok.
                </div>
              ) : (
                filteredHistoryOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300">{ord.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.paymentStatus === "Paid"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-950 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {ord.paymentStatus === "Paid" ? "LUNAS" : "PENDING"}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {ord.tableCode} • {ord.customerName} • {ord.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-emerald-400 text-sm">
                        {formatRupiah(ord.total)}
                      </span>
                      <button
                        onClick={() => {
                          setShowHistoryModal(false);
                          onOpenReceipt(ord);
                        }}
                        className="p-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl border border-stone-700 flex items-center gap-1 transition"
                        title="Cetak Ulang Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Struk</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL MODIFIER / LEVEL PEDAS & TOPPING CUSTOMIZER */}
      {showModifierModal && activeMenuForCustom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl text-stone-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-base text-amber-200">
                    Kustomisasi {activeMenuForCustom.name}
                  </h3>
                  <p className="text-[10px] text-stone-400">Pilih level pedas & topping khas Sunda</p>
                </div>
              </div>
              <button
                onClick={() => setShowModifierModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Level Pedas */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-amber-300 block">Level Pedas / Sambal:</label>
              <div className="grid grid-cols-2 gap-2">
                {spiceLevels.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedSpiceLevel(lvl)}
                    className={`p-2 rounded-xl text-left font-bold transition border text-[11px] ${
                      selectedSpiceLevel === lvl
                        ? "bg-amber-500 text-stone-950 border-amber-400 shadow-md"
                        : "bg-stone-950 text-stone-300 border border-stone-800 hover:bg-stone-800"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Topping / Extra Add-ons */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-amber-300 block">Tambahan Topping & Extra Bumbu:</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableToppings.map((top) => {
                  const isSelected = selectedToppings.some((t) => t.name === top.name);
                  return (
                    <div
                      key={top.name}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedToppings((prev) => prev.filter((t) => t.name !== top.name));
                        } else {
                          setSelectedToppings((prev) => [...prev, top]);
                        }
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                        isSelected
                          ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200 font-bold"
                          : "bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? "bg-emerald-500 border-emerald-400 text-stone-950" : "border-stone-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{top.name}</span>
                      </div>
                      <span className="font-mono text-emerald-400">+ {formatRupiah(top.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Note */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-stone-300 block">Catatan Khusus Pesanan:</label>
              <input
                type="text"
                value={customNoteText}
                onChange={(e) => setCustomNoteText(e.target.value)}
                placeholder="Contoh: Bumbu dipisah, nasi hangat, tidak pakai mentimun"
                className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400"
              />
            </div>

            {/* Total Summary & Add Button */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-stone-400">Harga Total Porsi:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {formatRupiah(
                    activeMenuForCustom.price +
                      selectedToppings.reduce((sum, t) => sum + t.price, 0)
                  )}
                </span>
              </div>

              <button
                onClick={handleAddCustomizedToCart}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Tambah ke Keranjang Kasir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
