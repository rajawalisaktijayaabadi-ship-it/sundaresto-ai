import React, { useState } from "react";
import { InventoryItem, MenuItem, StockMovementLog, Supplier, PurchaseOrder, BatchInfo } from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  Layers,
  AlertTriangle,
  Plus,
  RotateCcw,
  Search,
  BookOpen,
  PieChart,
  CheckCircle,
  TrendingUp,
  Package,
  Calendar,
  Truck,
  FileText,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  Edit,
  Trash2,
  Check,
  X,
  Filter,
  ShieldAlert,
  Building,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface InventoryModuleProps {
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  onAddStock: (itemId: string, qtyToAdd: number) => void;
  onAddNewIngredient: (item: InventoryItem) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  inventory,
  menuItems,
  onAddStock,
  onAddNewIngredient
}) => {
  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    "catalog" | "movements" | "opname" | "expired" | "suppliers" | "po"
  >("catalog");

  // Filter States for Catalog
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRecipeMenu, setSelectedRecipeMenu] = useState<MenuItem | null>(menuItems[0] || null);

  // Modal State for Restock / Stok Masuk
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState<number>(10);
  const [inputBatchNo, setInputBatchNo] = useState<string>("");
  const [inputExpDate, setInputExpDate] = useState<string>("2026-08-25");
  const [inputSupplier, setInputSupplier] = useState<string>("");

  // Modal State for Stok Keluar (Usage / Waste)
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [selectedOutItem, setSelectedOutItem] = useState<InventoryItem | null>(null);
  const [qtyOut, setQtyOut] = useState<number>(1);
  const [outReason, setOutReason] = useState<string>("Penggunaan Dapur Khusus");

  // Modal State for New Ingredient Item
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem["category"]>("Bahan Basah");
  const [newItemStock, setNewItemStock] = useState(20);
  const [newItemMinAlert, setNewItemMinAlert] = useState(5);
  const [newItemUnit, setNewItemUnit] = useState("kg");
  const [newItemCost, setNewItemCost] = useState(25000);
  const [newItemSupplier, setNewItemSupplier] = useState("Pasar Pasundan Dago");
  const [newItemBatch, setNewItemBatch] = useState("BATCH-2026-001");
  const [newItemExp, setNewItemExp] = useState("2026-08-30");

  // Stock Movement History Logs (Mock State)
  const [movementLogs, setMovementLogs] = useState<StockMovementLog[]>([
    {
      id: "log-1",
      itemId: "inv-1",
      itemName: "Beras Cianjur Pandan Wangi",
      type: "IN",
      qty: 50,
      unit: "kg",
      reason: "Pembelian Rutin PO #PO-202608-01",
      batchNumber: "BATCH-RICE-0807",
      expiredDate: "2026-12-31",
      date: "2026-08-07 08:30 WIB",
      operator: "Budi (Gudang)"
    },
    {
      id: "log-2",
      itemId: "inv-2",
      itemName: "Daging Ayam Kampung Segar",
      type: "OUT",
      qty: 12,
      unit: "kg",
      reason: "Penggunaan Masak Dapur Utama",
      batchNumber: "BATCH-CHICK-0808",
      expiredDate: "2026-08-11",
      date: "2026-08-08 11:00 WIB",
      operator: "Chef Kiki"
    },
    {
      id: "log-3",
      itemId: "inv-7",
      itemName: "Cabai Rawit Merah Segar",
      type: "OPNAME",
      qty: -1,
      unit: "kg",
      reason: "Selisih Penyesuaian Stock Opname (Layuk)",
      date: "2026-08-08 17:00 WIB",
      operator: "Siti (Admin Inventory)"
    }
  ]);

  // Stock Opname Form State
  const [opnameItemId, setOpnameItemId] = useState<string>(inventory[0]?.id || "");
  const [opnamePhysicalQty, setOpnamePhysicalQty] = useState<number>(0);
  const [opnameNote, setOpnameNote] = useState<string>("Audit rutin mingguan");

  // Master Suppliers Data
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "sup-1",
      name: "Distributor Beras Priangan",
      category: "Beras & Biji-bijian",
      phone: "0812-3344-5566",
      email: "order@beraspriangan.co.id",
      address: "Jl. Raya Cianjur No. 45, West Java",
      leadTimeDays: 2
    },
    {
      id: "sup-2",
      name: "Peternakan Pasundan Lembang",
      category: "Bahan Basah & Unggas",
      phone: "0819-8877-6655",
      email: "ayamkampung@lembang.id",
      address: "Jl. Maribaya No. 12, Lembang, Bandung",
      leadTimeDays: 1
    },
    {
      id: "sup-3",
      name: "Tambak Gurame Waduk Cirata",
      category: "Ikan Segar & Live Fish",
      phone: "0813-9900-1122",
      email: "gurame.cirata@gmail.com",
      address: "Waduk Cirata Blok B-04, Purwakarta",
      leadTimeDays: 1
    }
  ]);

  // Purchase Orders Data
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: "po-101",
      poNumber: "PO-202608-001",
      supplierName: "Peternakan Pasundan Lembang",
      orderDate: "2026-08-08",
      expectedDelivery: "2026-08-09",
      status: "Sent",
      items: [
        { itemId: "inv-2", itemName: "Daging Ayam Kampung Segar", unit: "kg", qtyOrdered: 30, pricePerUnit: 45000, totalPrice: 1350000 }
      ],
      totalAmount: 1350000,
      notes: "Minta potongan karkas bersih siap racik"
    },
    {
      id: "po-102",
      poNumber: "PO-202608-002",
      supplierName: "Tambak Gurame Waduk Cirata",
      orderDate: "2026-08-07",
      expectedDelivery: "2026-08-08",
      status: "Received",
      items: [
        { itemId: "inv-3", itemName: "Ikan Gurame Hidup (500-700g)", unit: "kg", qtyOrdered: 20, pricePerUnit: 48000, totalPrice: 960000 }
      ],
      totalAmount: 960000,
      notes: "Kondisi ikan segar hidup di kolam penampungan"
    }
  ]);

  // PO Form State
  const [showPoModal, setShowPoModal] = useState(false);
  const [poSupplier, setPoSupplier] = useState<string>("Peternakan Pasundan Lembang");
  const [poExpectedDate, setPoExpectedDate] = useState<string>("2026-08-10");
  const [poNotes, setPoNotes] = useState<string>("");
  const [poSelectedItemId, setPoSelectedItemId] = useState<string>(inventory[0]?.id || "");
  const [poQtyOrdered, setPoQtyOrdered] = useState<number>(10);

  const categories = [
    "All",
    "Bahan Basah",
    "Bumbu & Rempah",
    "Sayuran & Lalapan",
    "Beras & Biji",
    "Minuman & Es",
    "Kemasan"
  ];

  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minStockAlert).length;

  // Handlers
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockModalItem) {
      onAddStock(restockModalItem.id, qtyToAdd);

      // Add Stock Log
      const newLog: StockMovementLog = {
        id: `log-${Date.now()}`,
        itemId: restockModalItem.id,
        itemName: restockModalItem.name,
        type: "IN",
        qty: qtyToAdd,
        unit: restockModalItem.unit,
        reason: `Restok Pembelian (${inputSupplier || restockModalItem.supplierName})`,
        batchNumber: inputBatchNo || `BATCH-${Date.now().toString().slice(-4)}`,
        expiredDate: inputExpDate || "2026-09-01",
        date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        operator: "Kasir/Gudang"
      };

      setMovementLogs((prev) => [newLog, ...prev]);
      setRestockModalItem(null);
      setQtyToAdd(10);
      setInputBatchNo("");
    }
  };

  const handleStockOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutItem || qtyOut <= 0) return;

    onAddStock(selectedOutItem.id, -qtyOut);

    const newLog: StockMovementLog = {
      id: `log-${Date.now()}`,
      itemId: selectedOutItem.id,
      itemName: selectedOutItem.name,
      type: "OUT",
      qty: qtyOut,
      unit: selectedOutItem.unit,
      reason: outReason,
      date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      operator: "Dapur Utama"
    };

    setMovementLogs((prev) => [newLog, ...prev]);
    setShowStockOutModal(false);
    setSelectedOutItem(null);
    setQtyOut(1);
    alert(`Berhasil mencatat stok keluar ${qtyOut} ${selectedOutItem.unit} untuk ${selectedOutItem.name}!`);
  };

  const handleCreateIngredientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const newIng: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      currentStock: newItemStock,
      minStockAlert: newItemMinAlert,
      unit: newItemUnit,
      avgCostPerUnit: newItemCost,
      lastRestocked: new Date().toISOString().slice(0, 10),
      supplierName: newItemSupplier,
      batchNumber: newItemBatch,
      expiredDate: newItemExp
    };

    onAddNewIngredient(newIng);

    // Record initial in log
    setMovementLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        itemId: newIng.id,
        itemName: newIng.name,
        type: "IN",
        qty: newItemStock,
        unit: newItemUnit,
        reason: "Stok Awal pendaftaran bahan baku baru",
        batchNumber: newItemBatch,
        expiredDate: newItemExp,
        date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        operator: "Admin Gudang"
      },
      ...prev
    ]);

    setShowNewModal(false);
    setNewItemName("");
  };

  const handleExecuteOpname = (e: React.FormEvent) => {
    e.preventDefault();
    const target = inventory.find((i) => i.id === opnameItemId);
    if (!target) return;

    const variance = opnamePhysicalQty - target.currentStock;
    onAddStock(target.id, variance);

    const newLog: StockMovementLog = {
      id: `log-${Date.now()}`,
      itemId: target.id,
      itemName: target.name,
      type: "OPNAME",
      qty: variance,
      unit: target.unit,
      reason: `Penyesuaian Audit Opname: ${opnameNote} (Fisik: ${opnamePhysicalQty}, Sistem: ${target.currentStock})`,
      date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      operator: "Auditor Stock Opname"
    };

    setMovementLogs((prev) => [newLog, ...prev]);
    alert(`Opname selesai! Stok ${target.name} diperbarui dari ${target.currentStock} menjadi ${opnamePhysicalQty} ${target.unit}.`);
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find((i) => i.id === poSelectedItemId);
    if (!item) return;

    const newPo: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-202608-${Math.floor(100 + Math.random() * 900)}`,
      supplierName: poSupplier,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDelivery: poExpectedDate,
      status: "Draft",
      items: [
        {
          itemId: item.id,
          itemName: item.name,
          unit: item.unit,
          qtyOrdered: poQtyOrdered,
          pricePerUnit: item.avgCostPerUnit,
          totalPrice: item.avgCostPerUnit * poQtyOrdered
        }
      ],
      totalAmount: item.avgCostPerUnit * poQtyOrdered,
      notes: poNotes
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);
    setShowPoModal(false);
    alert(`Purchase Order ${newPo.poNumber} berhasil dibuat!`);
  };

  const handleUpdatePoStatus = (poId: string, newStatus: PurchaseOrder["status"]) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === poId) {
          if (newStatus === "Received" && po.status !== "Received") {
            // Automatically add stock for PO items
            po.items.forEach((it) => {
              onAddStock(it.itemId, it.qtyOrdered);
              setMovementLogs((logPrev) => [
                {
                  id: `log-${Date.now()}`,
                  itemId: it.itemId,
                  itemName: it.itemName,
                  type: "IN",
                  qty: it.qtyOrdered,
                  unit: it.unit,
                  reason: `Penerimaan PO #${po.poNumber}`,
                  date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
                  operator: "Penerimaan PO"
                },
                ...logPrev
              ]);
            });
          }
          return { ...po, status: newStatus };
        }
        return po;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Main Nav */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-amber-100">
                Sistem Manajemen Inventory & Pembelian (PO)
              </h2>
              <p className="text-xs text-stone-400">
                Pengelolaan bahan baku basah, stok masuk/keluar, stock opname, tanggal kadaluwarsa batch, supplier & PO.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {lowStockCount > 0 && (
              <div className="bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3.5 py-2 rounded-2xl flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{lowStockCount} Bahan Menipis!</span>
              </div>
            )}

            <button
              onClick={() => {
                if (inventory.length > 0) setSelectedOutItem(inventory[0]);
                setShowStockOutModal(true);
              }}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-rose-300 rounded-xl border border-stone-700 flex items-center gap-1.5 transition"
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              <span>Stok Keluar</span>
            </button>

            <button
              onClick={() => setShowPoModal(true)}
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-sky-300 rounded-xl border border-stone-700 flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>+ Buat PO Baru</span>
            </button>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl shadow-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bahan Baku</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-stone-800 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "catalog"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog Bahan & Stok</span>
          </button>

          <button
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "movements"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Stok Masuk / Keluar ({movementLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("opname")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "opname"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Stock Opname (Audit)</span>
          </button>

          <button
            onClick={() => setActiveTab("expired")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "expired"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Expired Date & Batch</span>
          </button>

          <button
            onClick={() => setActiveTab("suppliers")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "suppliers"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Supplier ({suppliers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("po")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === "po"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200 bg-stone-950/60 hover:bg-stone-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Purchase Order PO ({purchaseOrders.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KATALOG BAHAN BAKU & STOK */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inventory List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-auto flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari beras, ikan gurame, cabai rawit..."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-stone-200 outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition ${
                      selectedCategory === c
                        ? "bg-amber-500 text-stone-950 font-bold"
                        : "bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-amber-200 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Nama Bahan</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-center">Stok & Min Alert</th>
                      <th className="py-3 px-4 text-right">Harga / Satuan</th>
                      <th className="py-3 px-4 text-center">Restok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-medium">
                    {filteredInventory.map((item) => {
                      const isLow = item.currentStock <= item.minStockAlert;

                      return (
                        <tr key={item.id} className="hover:bg-stone-850/50 transition">
                          <td className="py-3 px-4 font-bold text-amber-100">
                            {item.name}
                            <span className="block text-[10px] text-stone-500 font-normal">
                              Supplier: {item.supplierName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-400">{item.category}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-full text-[11px] border ${
                                  isLow
                                    ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                                    : "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                                }`}
                              >
                                {isLow && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                                {item.currentStock} {item.unit}
                              </span>
                              <span className="text-[9px] text-stone-500">
                                Minimum: {item.minStockAlert} {item.unit}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400">
                            {formatRupiah(item.avgCostPerUnit)} / {item.unit}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                setRestockModalItem(item);
                                setInputSupplier(item.supplierName);
                              }}
                              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 mx-auto transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restok</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Recipe Costing Breakdown BOM (5 Cols) */}
          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  Resep BOM & Margin HPP Menu
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Pilih menu untuk melihat komposisi bahan baku dan rasio margin keuntungan.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Pilih Menu Sunda:
              </label>
              <select
                value={selectedRecipeMenu?.id || ""}
                onChange={(e) => {
                  const found = menuItems.find((m) => m.id === e.target.value);
                  if (found) setSelectedRecipeMenu(found);
                }}
                className="w-full bg-stone-950 border border-stone-700 text-amber-200 font-bold rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400"
              >
                {menuItems.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({formatRupiah(m.price)})
                  </option>
                ))}
              </select>
            </div>

            {selectedRecipeMenu && (
              <div className="space-y-4">
                {/* Financial Margin Card */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">Harga Jual Menu:</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {formatRupiah(selectedRecipeMenu.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-400">Estimasi HPP (BOM):</span>
                    <span className="font-mono font-bold text-rose-400 text-sm">
                      {formatRupiah(selectedRecipeMenu.costHPP)}
                    </span>
                  </div>
                  <div className="border-t border-stone-800 pt-2 flex justify-between items-center">
                    <span className="font-bold text-xs text-stone-200">Profit Margin Bersih:</span>
                    <span className="font-mono font-extrabold text-base text-emerald-400">
                      {formatRupiah(selectedRecipeMenu.price - selectedRecipeMenu.costHPP)} (
                      {Math.round(
                        ((selectedRecipeMenu.price - selectedRecipeMenu.costHPP) /
                          selectedRecipeMenu.price) *
                          100
                      )}
                      %)
                    </span>
                  </div>
                </div>

                {/* Recipe Ingredients List */}
                <div>
                  <h4 className="text-xs font-bold text-amber-200 mb-2">Komposisi Bahan Baku (BOM):</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedRecipeMenu.recipe && selectedRecipeMenu.recipe.length > 0 ? (
                      selectedRecipeMenu.recipe.map((rec, idx) => (
                        <div
                          key={idx}
                          className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold text-stone-200 block">{rec.name}</span>
                            <span className="text-[10px] text-stone-500">
                              Takaran: {rec.qtyNeeded} {rec.unit}
                            </span>
                          </div>
                          <span className="font-mono text-emerald-400 text-xs font-bold">
                            {formatRupiah(rec.qtyNeeded * rec.costPerUnit)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 bg-stone-950 rounded-xl border border-stone-800 text-stone-500 text-xs">
                        Resep belum dirinci secara otomatis.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT STOK MASUK / KELUAR */}
      {activeTab === "movements" && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Riwayat Transaksi Stok Masuk & Keluar
              </h3>
              <p className="text-xs text-stone-400">
                Audit trail lengkap mutasi bahan baku (pembelian, penggunaan dapur, dan penyesuaian).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-amber-200 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3 px-4">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Nama Bahan</th>
                  <th className="py-3 px-4 text-center">Tipe Transaksi</th>
                  <th className="py-3 px-4 text-center">Jumlah Vol</th>
                  <th className="py-3 px-4">Keterangan / Alasan</th>
                  <th className="py-3 px-4">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 font-medium">
                {movementLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-850/50">
                    <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">{log.date}</td>
                    <td className="py-3 px-4 font-bold text-amber-100">{log.itemName}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          log.type === "IN"
                            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                            : log.type === "OUT"
                            ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                            : "bg-purple-950/80 border-purple-500/40 text-purple-300"
                        }`}
                      >
                        {log.type === "IN" ? (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" /> STOK MASUK
                          </>
                        ) : log.type === "OUT" ? (
                          <>
                            <ArrowDownRight className="w-3 h-3 text-rose-400" /> STOK KELUAR
                          </>
                        ) : (
                          <>
                            <ClipboardList className="w-3 h-3 text-purple-400" /> OPNAME
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      <span className={log.qty > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {log.qty > 0 ? `+${log.qty}` : log.qty} {log.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-300">{log.reason}</td>
                    <td className="py-3 px-4 text-stone-400 text-[11px]">{log.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK OPNAME (AUDIT) */}
      {activeTab === "opname" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="pb-3 border-b border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Form Input Stock Opname (Fisik)
              </h3>
              <p className="text-xs text-stone-400">
                Gunakan form ini untuk menyelaraskan jumlah stok fisik nyata di gudang dengan sistem.
              </p>
            </div>

            <form onSubmit={handleExecuteOpname} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">Pilih Bahan Baku:</label>
                <select
                  value={opnameItemId}
                  onChange={(e) => {
                    setOpnameItemId(e.target.value);
                    const found = inventory.find((i) => i.id === e.target.value);
                    if (found) setOpnamePhysicalQty(found.currentStock);
                  }}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 font-bold rounded-xl p-2.5 outline-none"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Sistem: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">
                  Jumlah Stok Fisik Hasil Penghitungan:
                </label>
                <input
                  type="number"
                  required
                  value={opnamePhysicalQty}
                  onChange={(e) => setOpnamePhysicalQty(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 text-emerald-400 font-mono text-base font-bold rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">Alasan / Catatan Selisih:</label>
                <textarea
                  rows={3}
                  value={opnameNote}
                  onChange={(e) => setOpnameNote(e.target.value)}
                  placeholder="Contoh: Terjadi penyusutan saat penyimpanan / bahan busuk sebagian"
                  className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition"
              >
                Proses Penyesuaian Opname
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-amber-200 pb-3 border-b border-stone-800">
              Pratinjau Selisih Stok Saat Ini
            </h3>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-100 text-sm block">{item.name}</span>
                    <span className="text-[10px] text-stone-500">
                      Kategori: {item.category} | Supplier: {item.supplierName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm block">
                      {item.currentStock} {item.unit}
                    </span>
                    <button
                      onClick={() => {
                        setOpnameItemId(item.id);
                        setOpnamePhysicalQty(item.currentStock);
                      }}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      Audit Item Ini
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPIRED DATE & BATCH LOT */}
      {activeTab === "expired" && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div>
            <h3 className="font-serif font-bold text-lg text-amber-200">
              Pelacakan Tanggal Kadaluwarsa & Nomor Batch
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Monitoring keamanan bahan baku basah & bumbu untuk mencegah penyajian bahan yang kadaluwarsa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventory.map((item) => {
              const expDateStr = item.expiredDate || "2026-08-15";
              const batchStr = item.batchNumber || "BATCH-2026-011";

              return (
                <div
                  key={item.id}
                  className="bg-stone-950 border border-stone-800 p-4 rounded-2xl space-y-2 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-serif font-bold text-amber-200 text-sm">
                      {item.name}
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/20">
                      {batchStr}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-stone-400 pt-1">
                    <div>
                      Stok Tersedia: <strong className="text-emerald-400 font-mono">{item.currentStock} {item.unit}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>Exp Date: <strong className="text-rose-300 font-mono">{expDateStr}</strong></span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Terakhir Restok: {item.lastRestocked}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: SUPPLIER MANAGEMENT */}
      {activeTab === "suppliers" && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Daftar Master Pemasok / Supplier
              </h3>
              <p className="text-xs text-stone-400">
                Data pemasok resmi bahan pangan basah, bumbu, dan kemasan saung.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-bold text-stone-100 text-sm">{sup.name}</h4>
                    <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                      {sup.category}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-stone-300 pt-2 border-t border-stone-900">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    <span>{sup.address}</span>
                  </div>
                  <div className="text-[11px] text-amber-400 font-semibold pt-1">
                    Waktu Pengiriman (Lead Time): {sup.leadTimeDays} Hari
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PURCHASE ORDER (PO) */}
      {activeTab === "po" && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-200">
                Purchase Order (PO) Pembelian Bahan Baku
              </h3>
              <p className="text-xs text-stone-400">
                Penerbitan surat pesanan ke supplier dan konfirmasi penerimaan barang otomatis masuk stok.
              </p>
            </div>

            <button
              onClick={() => setShowPoModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buat PO Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-900 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300 text-sm">{po.poNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          po.status === "Received"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : po.status === "Sent"
                            ? "bg-sky-950 text-sky-300 border-sky-500/40"
                            : "bg-stone-800 text-stone-300 border-stone-700"
                        }`}
                      >
                        {po.status === "Received" ? "Barang Diterima & Masuk Stok" : po.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">Supplier: {po.supplierName}</p>
                  </div>

                  <div className="text-right text-xs font-mono">
                    <span className="text-stone-400 block">Total PO:</span>
                    <span className="text-emerald-400 font-bold text-base">{formatRupiah(po.totalAmount)}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-200">Item Pesanan:</div>
                  {po.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-stone-300">
                      <span>{it.qtyOrdered} {it.unit} x {it.itemName}</span>
                      <span className="font-mono text-stone-400">{formatRupiah(it.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-stone-900 text-xs text-stone-400">
                  <div>Estimasi Datang: <span className="text-stone-200 font-mono">{po.expectedDelivery}</span></div>

                  {po.status !== "Received" && (
                    <button
                      onClick={() => handleUpdatePoStatus(po.id, "Received")}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Konfirmasi Barang Diterima (Masuk Stok)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: RESTOK / STOK MASUK */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleRestockSubmit}
            className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-stone-100 space-y-4"
          >
            <h3 className="font-serif font-bold text-lg text-amber-200">
              Restok Masuk: {restockModalItem.name}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Jumlah Tambahan ({restockModalItem.unit}):</label>
                <input
                  type="number"
                  value={qtyToAdd}
                  onChange={(e) => setQtyToAdd(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-mono text-base font-bold rounded-xl px-3 py-2 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Nomor Batch / Lot:</label>
                <input
                  type="text"
                  value={inputBatchNo}
                  onChange={(e) => setInputBatchNo(e.target.value)}
                  placeholder="BATCH-2026-009"
                  className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Tanggal Kadaluwarsa (Expired):</label>
                <input
                  type="date"
                  value={inputExpDate}
                  onChange={(e) => setInputExpDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalItem(null)}
                className="flex-1 py-2.5 bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-extrabold rounded-xl"
              >
                Simpan Restok
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: STOK KELUAR */}
      {showStockOutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleStockOutSubmit}
            className="bg-stone-900 border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 text-stone-100 space-y-4"
          >
            <h3 className="font-serif font-bold text-lg text-rose-300">Pencatatan Stok Keluar</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Pilih Bahan Baku:</label>
                <select
                  value={selectedOutItem?.id || ""}
                  onChange={(e) => {
                    const found = inventory.find((i) => i.id === e.target.value);
                    if (found) setSelectedOutItem(found);
                  }}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 rounded-xl px-3 py-2 outline-none"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stok: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Jumlah Keluar ({selectedOutItem?.unit}):</label>
                <input
                  type="number"
                  value={qtyOut}
                  onChange={(e) => setQtyOut(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 text-rose-300 font-mono text-base font-bold rounded-xl px-3 py-2 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Alasan Keluar:</label>
                <select
                  value={outReason}
                  onChange={(e) => setOutReason(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="Penggunaan Masak Dapur Utama">Penggunaan Masak Dapur Utama</option>
                  <option value="Bahan Rusak / Busuk (Spoilage)">Bahan Rusak / Busuk (Spoilage)</option>
                  <option value="Kadaluwarsa (Expired Waste)">Kadaluwarsa (Expired Waste)</option>
                  <option value="Uji Coba Resep Baru">Uji Coba Resep Baru</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStockOutModal(false)}
                className="flex-1 py-2.5 bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl"
              >
                Catat Stok Keluar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: BARU ITEM */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateIngredientSubmit}
            className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-stone-100 space-y-4"
          >
            <h3 className="font-serif font-bold text-lg text-amber-200">Tambah Bahan Baku Baru</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Nama Bahan Baku:</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Contoh: Daging Sempur Empal"
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 rounded-xl px-3 py-2 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1">Kategori:</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-2 py-2 outline-none"
                  >
                    <option value="Bahan Basah">Bahan Basah</option>
                    <option value="Bumbu & Rempah">Bumbu & Rempah</option>
                    <option value="Sayuran & Lalapan">Sayuran & Lalapan</option>
                    <option value="Beras & Biji">Beras & Biji</option>
                    <option value="Minuman & Es">Minuman & Es</option>
                    <option value="Kemasan">Kemasan</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Satuan Unit:</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="kg, gram, liter"
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1">Stok Awal:</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-mono rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Min. Alert Stok:</label>
                  <input
                    type="number"
                    value={newItemMinAlert}
                    onChange={(e) => setNewItemMinAlert(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 text-rose-300 font-mono rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1">Harga per Unit (Rp):</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 text-emerald-400 font-mono rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Supplier:</label>
                  <input
                    type="text"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-2.5 bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold text-xs rounded-xl"
              >
                Simpan Bahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: BUAT PO BARU */}
      {showPoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePoSubmit}
            className="bg-stone-900 border border-sky-500/40 rounded-3xl max-w-md w-full p-6 text-stone-100 space-y-4"
          >
            <h3 className="font-serif font-bold text-lg text-amber-200">Buat Purchase Order (PO)</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Pilih Supplier:</label>
                <select
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-amber-200 rounded-xl p-2.5 outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Pilih Bahan Baku Dipesan:</label>
                <select
                  value={poSelectedItemId}
                  onChange={(e) => setPoSelectedItemId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl p-2.5 outline-none"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} - Est. {formatRupiah(i.avgCostPerUnit)} / {i.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-300 block mb-1">Jumlah Dipesan:</label>
                  <input
                    type="number"
                    value={poQtyOrdered}
                    onChange={(e) => setPoQtyOrdered(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 text-amber-300 font-mono font-bold rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1">Estimasi Datang:</label>
                  <input
                    type="date"
                    value={poExpectedDate}
                    onChange={(e) => setPoExpectedDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Catatan Pesanan / Instruksi:</label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Contoh: Minta pengiriman pagi hari sebelum jam 09.00 WIB"
                  className="w-full bg-stone-950 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPoModal(false)}
                className="flex-1 py-2.5 bg-stone-800 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl"
              >
                Terbitkan PO
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
