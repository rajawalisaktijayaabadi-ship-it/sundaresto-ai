import React, { useState } from "react";
import {
  Supplier,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  SupplierInvoice,
  InventoryItem,
  PurchaseRequestItem,
  PurchaseOrderItem,
  GoodsReceiptItem
} from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  Truck,
  FileText,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Search,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Eye,
  FileSpreadsheet,
  Download,
  Send,
  Building2,
  TrendingUp,
  Receipt
} from "lucide-react";

interface PurchasingModuleProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;

  purchaseRequests: PurchaseRequest[];
  onAddPurchaseRequest: (pr: PurchaseRequest) => void;
  onUpdatePRStatus: (prId: string, status: PurchaseRequest["status"]) => void;

  purchaseOrders: PurchaseOrder[];
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onUpdatePOStatus: (poId: string, status: PurchaseOrder["status"]) => void;

  goodsReceipts: GoodsReceipt[];
  onAddGoodsReceipt: (
    grn: GoodsReceipt,
    updatedStockItems: { itemId: string; qtyReceived: number; batchNumber?: string; expiredDate?: string }[]
  ) => void;

  supplierInvoices: SupplierInvoice[];
  onRecordSupplierPayment: (
    invoiceId: string,
    amountPaid: number,
    paymentMethod: "Transfer Bank BCA" | "Kas Kecil Resto" | "Giro / Cek",
    refNo?: string,
    notes?: string
  ) => void;

  inventory: InventoryItem[];
}

export const PurchasingModule: React.FC<PurchasingModuleProps> = ({
  suppliers,
  onAddSupplier,
  purchaseRequests,
  onAddPurchaseRequest,
  onUpdatePRStatus,
  purchaseOrders,
  onAddPurchaseOrder,
  onUpdatePOStatus,
  goodsReceipts,
  onAddGoodsReceipt,
  supplierInvoices,
  onRecordSupplierPayment,
  inventory
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "supplier" | "pr" | "po" | "grn" | "invoice"
  >("po");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Forms
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [isNewGRNModalOpen, setIsNewGRNModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<SupplierInvoice | null>(null);

  // Selected PO Preview Modal
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Form States: Supplier ---
  const [supName, setSupName] = useState("");
  const [supCategory, setSupCategory] = useState("Bahan Basah & Daging");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supAddress, setSupAddress] = useState("");
  const [supLeadTime, setSupLeadTime] = useState(2);
  const [supTermDays, setSupTermDays] = useState(14);
  const [supBank, setSupBank] = useState("");
  const [supContactPerson, setSupContactPerson] = useState("");

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supName,
      category: supCategory,
      phone: supPhone,
      email: supEmail,
      address: supAddress,
      leadTimeDays: supLeadTime,
      paymentTermDays: supTermDays,
      bankAccount: supBank,
      contactPerson: supContactPerson
    };
    onAddSupplier(newSup);
    showToast(`Supplier ${supName} berhasil ditambahkan!`);
    setIsNewSupplierModalOpen(false);
    // Reset
    setSupName("");
    setSupPhone("");
    setSupEmail("");
  };

  // --- Form States: Purchase Request (PR) ---
  const [prRequestedBy, setPrRequestedBy] = useState("Chef Dadang (Head Chef)");
  const [prDept, setPrDept] = useState<"Dapur Utama" | "Gudang Sembako" | "Bar Minuman">("Dapur Utama");
  const [prPriority, setPrPriority] = useState<"Normal" | "Urgent">("Urgent");
  const [prNotes, setPrNotes] = useState("");
  const [prItems, setPrItems] = useState<{ itemId: string; qtyRequested: number }[]>([
    { itemId: inventory[0]?.id || "inv-1", qtyRequested: 10 }
  ]);

  const handleAddPRItemRow = () => {
    setPrItems([...prItems, { itemId: inventory[0]?.id || "inv-1", qtyRequested: 5 }]);
  };

  const handleRemovePRItemRow = (idx: number) => {
    setPrItems(prItems.filter((_, i) => i !== idx));
  };

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedItems: PurchaseRequestItem[] = prItems.map((p) => {
      const inv = inventory.find((i) => i.id === p.itemId);
      return {
        itemId: p.itemId,
        itemName: inv ? inv.name : "Bahan Raw",
        unit: inv ? inv.unit : "kg",
        qtyRequested: p.qtyRequested,
        estimatedCost: inv ? inv.avgCostPerUnit : 10000
      };
    });

    const totalEstimated = formattedItems.reduce(
      (s, item) => s + item.qtyRequested * item.estimatedCost,
      0
    );

    const newPR: PurchaseRequest = {
      id: `pr-${Date.now()}`,
      prNumber: `PR-202608-0${purchaseRequests.length + 1}`,
      requestedBy: prRequestedBy,
      department: prDept,
      requestDate: new Date().toISOString().split("T")[0],
      priority: prPriority,
      status: "Pending Approval",
      items: formattedItems,
      totalEstimatedAmount: totalEstimated,
      notes: prNotes
    };

    onAddPurchaseRequest(newPR);
    showToast(`Purchase Request ${newPR.prNumber} berhasil dibuat!`);
    setIsNewPRModalOpen(false);
  };

  // Convert Approved PR to PO
  const handleConvertPRtoPO = (pr: PurchaseRequest) => {
    const defaultSup = suppliers[0];
    const poItems: PurchaseOrderItem[] = pr.items.map((item) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      unit: item.unit,
      qtyOrdered: item.qtyRequested,
      pricePerUnit: item.estimatedCost,
      totalPrice: item.qtyRequested * item.estimatedCost
    }));

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-202608-0${purchaseOrders.length + 1}`,
      prNumber: pr.prNumber,
      supplierId: defaultSup?.id || "sup-1",
      supplierName: defaultSup?.name || "Supplier Dapur",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      status: "Sent",
      items: poItems,
      totalAmount: pr.totalEstimatedAmount,
      paymentTerm: `TOP ${defaultSup?.paymentTermDays || 14} Hari`,
      notes: pr.notes
    };

    onAddPurchaseOrder(newPO);
    onUpdatePRStatus(pr.id, "Converted to PO");
    showToast(`Pengajuan ${pr.prNumber} berhasil dikonversi ke PO resmi ${newPO.poNumber}!`);
  };

  // --- Form States: Direct PO ---
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || "sup-1");
  const [poNotes, setPoNotes] = useState("");
  const [poItems, setPoItems] = useState<{ itemId: string; qtyOrdered: number; pricePerUnit: number }[]>([
    { itemId: inventory[0]?.id || "inv-1", qtyOrdered: 10, pricePerUnit: inventory[0]?.avgCostPerUnit || 15000 }
  ]);

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === poSupplierId) || suppliers[0];

    const formattedItems: PurchaseOrderItem[] = poItems.map((p) => {
      const inv = inventory.find((i) => i.id === p.itemId);
      return {
        itemId: p.itemId,
        itemName: inv ? inv.name : "Bahan Raw",
        unit: inv ? inv.unit : "kg",
        qtyOrdered: p.qtyOrdered,
        pricePerUnit: p.pricePerUnit,
        totalPrice: p.qtyOrdered * p.pricePerUnit
      };
    });

    const totalAmt = formattedItems.reduce((s, i) => s + i.totalPrice, 0);

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-202608-0${purchaseOrders.length + 1}`,
      supplierId: sup.id,
      supplierName: sup.name,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + (sup.leadTimeDays || 2) * 86400000).toISOString().split("T")[0],
      status: "Sent",
      items: formattedItems,
      totalAmount: totalAmt,
      paymentTerm: `TOP ${sup.paymentTermDays || 14} Hari`,
      notes: poNotes
    };

    onAddPurchaseOrder(newPO);
    showToast(`Purchase Order ${newPO.poNumber} diterbitkan untuk ${sup.name}!`);
    setIsNewPOModalOpen(false);
  };

  // --- Form States: Goods Receipt (GRN) ---
  const [grnPoId, setGrnPoId] = useState(purchaseOrders[0]?.id || "");
  const [grnSuratJalan, setGrnSuratJalan] = useState("");
  const [grnReceivedBy, setGrnReceivedBy] = useState("Teh Euis (Gudang)");
  const [grnItems, setGrnItems] = useState<
    { itemId: string; itemName: string; unit: string; qtyOrdered: number; qtyReceived: number; pricePerUnit: number; batchNumber: string; expiredDate: string }[]
  >([]);

  // When PO changes in GRN form, load its items
  const handleSelectPOforGRN = (poId: string) => {
    setGrnPoId(poId);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      setGrnItems(
        po.items.map((i) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          unit: i.unit,
          qtyOrdered: i.qtyOrdered,
          qtyReceived: i.qtyOrdered,
          pricePerUnit: i.pricePerUnit,
          batchNumber: `BAT-${i.itemName.substring(0, 3).toUpperCase()}-${new Date().getMonth() + 1}${new Date().getDate()}`,
          expiredDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]
        }))
      );
    }
  };

  const handleSaveGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.id === grnPoId);
    if (!po) return;

    const formattedItems: GoodsReceiptItem[] = grnItems.map((gi) => ({
      itemId: gi.itemId,
      itemName: gi.itemName,
      unit: gi.unit,
      qtyOrdered: gi.qtyOrdered,
      qtyReceived: gi.qtyReceived,
      pricePerUnit: gi.pricePerUnit,
      batchNumber: gi.batchNumber,
      expiredDate: gi.expiredDate
    }));

    const totalReceivedAmt = formattedItems.reduce(
      (s, item) => s + item.qtyReceived * item.pricePerUnit,
      0
    );

    const newGRN: GoodsReceipt = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-202608-0${goodsReceipts.length + 1}`,
      poId: po.id,
      poNumber: po.poNumber,
      supplierName: po.supplierName,
      receiveDate: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) + " WIB",
      receivedBy: grnReceivedBy,
      supplierSuratJalan: grnSuratJalan || `SJ-SUP-${Math.floor(Math.random() * 8999 + 1000)}`,
      items: formattedItems,
      totalAmountReceived: totalReceivedAmt,
      notes: "Penerimaan barang fisik dari supplier"
    };

    const updatedStockItems = formattedItems.map((gi) => ({
      itemId: gi.itemId,
      qtyReceived: gi.qtyReceived,
      batchNumber: gi.batchNumber,
      expiredDate: gi.expiredDate
    }));

    onAddGoodsReceipt(newGRN, updatedStockItems);
    onUpdatePOStatus(po.id, "Completed");
    showToast(`Penerimaan ${newGRN.grnNumber} dicatat! Stok bahan otomatis diupdate.`);
    setIsNewGRNModalOpen(false);
  };

  // --- Form States: Record Supplier Payment ---
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<"Transfer Bank BCA" | "Kas Kecil Resto" | "Giro / Cek">("Transfer Bank BCA");
  const [payRefNo, setPayRefNo] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const handleOpenPaymentModal = (inv: SupplierInvoice) => {
    setSelectedInvoiceForPay(inv);
    setPayAmount(inv.remainingBalance);
    setIsPaymentModalOpen(true);
  };

  const handleSaveSupplierPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPay || payAmount <= 0) return;

    onRecordSupplierPayment(
      selectedInvoiceForPay.id,
      payAmount,
      payMethod,
      payRefNo || `TRX-${Date.now().toString().slice(-6)}`,
      payNotes
    );

    showToast(`Pembayaran hutang Rp ${payAmount.toLocaleString("id-ID")} ke ${selectedInvoiceForPay.supplierName} berhasil dicatat!`);
    setIsPaymentModalOpen(false);
  };

  // Calculations for Accounts Payable (Hutang Supplier)
  const totalHutangAktif = supplierInvoices.reduce((s, inv) => s + inv.remainingBalance, 0);
  const totalJatuhTempo = supplierInvoices
    .filter((inv) => inv.status === "Jatuh Tempo")
    .reduce((s, inv) => s + inv.remainingBalance, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-stone-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Sub-Tabs Navigation */}
      <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-amber-100">
                Manajemen Pengadaan (Purchasing, Supplier & Hutang)
              </h2>
              <p className="text-xs text-stone-400">
                Siklus lengkap: Master Supplier, PR (Permintaan), PO (Order), Penerimaan Barang (GRN) & Hutang Usaha (AP).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewPOModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Buat PO Resmi</span>
            </button>
            <button
              onClick={() => setIsNewGRNModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Penerimaan Barang (GRN)</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 border-t border-stone-800 pt-4 scrollbar-none">
          <button
            onClick={() => setActiveSubTab("po")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === "po"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "bg-stone-950 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Purchase Order (PO)</span>
            <span className="bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
              {purchaseOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("pr")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === "pr"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "bg-stone-950 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Purchase Request (PR)</span>
            <span className="bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
              {purchaseRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("grn")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === "grn"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "bg-stone-950 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Penerimaan Barang (GRN)</span>
            <span className="bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
              {goodsReceipts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("invoice")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === "invoice"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "bg-stone-950 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Invoice & Hutang Supplier (AP)</span>
            {totalJatuhTempo > 0 && (
              <span className="bg-rose-500 text-stone-950 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold animate-pulse">
                Jatuh Tempo!
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("supplier")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === "supplier"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "bg-stone-950 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Master Supplier</span>
            <span className="bg-stone-900 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
              {suppliers.length}
            </span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: PURCHASE ORDER (PO) --- */}
      {activeSubTab === "po" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. PO atau nama supplier..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => setIsNewPOModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat PO Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchaseOrders
              .filter(
                (po) =>
                  po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((po) => (
                <div
                  key={po.id}
                  className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {po.poNumber}
                        </span>
                        <h4 className="font-bold text-sm text-stone-100 mt-1">{po.supplierName}</h4>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${
                          po.status === "Completed"
                            ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
                            : po.status === "Sent"
                            ? "bg-amber-950 border-amber-500/40 text-amber-300"
                            : "bg-stone-950 border-stone-700 text-stone-400"
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Tanggal Order:</span>
                        <span className="font-mono text-stone-200">{po.orderDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimasi Kirim:</span>
                        <span className="font-mono text-stone-200">{po.expectedDelivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Term Pembayaran:</span>
                        <span className="font-mono text-amber-300">{po.paymentTerm || "TOP 14 Hari"}</span>
                      </div>
                    </div>

                    <div className="border-t border-stone-800 pt-2 space-y-1">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">
                        Rincian Barang Order ({po.items.length} item):
                      </span>
                      {po.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-stone-300 font-medium">
                          <span>
                            {item.itemName} ({item.qtyOrdered} {item.unit})
                          </span>
                          <span className="font-mono">{formatRupiah(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-800 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Total Transaksi PO:</span>
                      <strong className="text-emerald-400 font-mono text-base font-extrabold">
                        {formatRupiah(po.totalAmount)}
                      </strong>
                    </div>

                    <button
                      onClick={() => setViewingPO(po)}
                      className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-400 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Cetak/Detail</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: PURCHASE REQUEST (PR) --- */}
      {activeSubTab === "pr" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <h3 className="font-serif font-bold text-sm text-amber-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Daftar Pengajuan Kebutuhan Bahan (Purchase Request)</span>
            </h3>

            <button
              onClick={() => setIsNewPRModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengajuan (PR) Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {purchaseRequests.map((pr) => (
              <div
                key={pr.id}
                className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {pr.prNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        pr.priority === "Urgent"
                          ? "bg-rose-950 text-rose-300 border border-rose-500/30 animate-pulse"
                          : "bg-stone-950 text-stone-400"
                      }`}
                    >
                      {pr.priority}
                    </span>
                    <span className="text-xs text-stone-400">• {pr.department}</span>
                  </div>

                  <h4 className="font-bold text-sm text-stone-100">
                    Diajukan oleh: {pr.requestedBy} ({pr.requestDate})
                  </h4>

                  <div className="flex flex-wrap gap-2 text-xs text-stone-300">
                    {pr.items.map((item, idx) => (
                      <span key={idx} className="bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
                        {item.itemName}: <strong>{item.qtyRequested} {item.unit}</strong> (~{formatRupiah(item.qtyRequested * item.estimatedCost)})
                      </span>
                    ))}
                  </div>

                  {pr.notes && <p className="text-xs text-amber-300/80 italic">"{pr.notes}"</p>}
                </div>

                <div className="text-right space-y-2 shrink-0 border-t md:border-t-0 md:border-l border-stone-800 pt-3 md:pt-0 md:pl-6">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Estimasi Total Biaya:</span>
                    <strong className="text-amber-300 font-mono text-base font-extrabold">
                      {formatRupiah(pr.totalEstimatedAmount)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {pr.status === "Pending Approval" && (
                      <>
                        <button
                          onClick={() => handleConvertPRtoPO(pr)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui & Buat PO</span>
                        </button>
                        <button
                          onClick={() => onUpdatePRStatus(pr.id, "Rejected")}
                          className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}

                    {pr.status === "Approved" && (
                      <button
                        onClick={() => handleConvertPRtoPO(pr)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Terbitkan PO Resmi</span>
                      </button>
                    )}

                    {pr.status === "Converted to PO" && (
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/30">
                        Sudah Jadi PO Resmi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: PENERIMAAN BARANG (GRN) --- */}
      {activeSubTab === "grn" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <h3 className="font-serif font-bold text-sm text-amber-100 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Riwayat Penerimaan Barang Fisik (Goods Receipt Note / GRN)</span>
            </h3>

            <button
              onClick={() => setIsNewGRNModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Input Penerimaan Barang Baru</span>
            </button>
          </div>

          <div className="space-y-3">
            {goodsReceipts.map((grn) => (
              <div
                key={grn.id}
                className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-xl space-y-3"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-3 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-500/30">
                        {grn.grnNumber}
                      </span>
                      <span className="text-xs text-stone-400">
                        Refferensi PO: <strong className="text-amber-300 font-mono">{grn.poNumber}</strong>
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-100 mt-1">
                      Supplier: {grn.supplierName} (Surat Jalan: {grn.supplierSuratJalan || "-"})
                    </h4>
                  </div>

                  <div className="text-right text-xs text-stone-400">
                    <div>Waktu Terima: <strong className="text-stone-200">{grn.receiveDate}</strong></div>
                    <div>Penerima Gudang: <strong className="text-stone-200">{grn.receivedBy}</strong></div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-950 text-stone-400 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Bahan Baku Received</th>
                        <th className="py-2 px-3 text-center">Qty Ordered</th>
                        <th className="py-2 px-3 text-center">Qty Diterima Fisik</th>
                        <th className="py-2 px-3 text-center">Batch Number FIFO</th>
                        <th className="py-2 px-3 text-right">Harga Satuan</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 font-medium">
                      {grn.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-bold text-amber-100">{item.itemName}</td>
                          <td className="py-2 px-3 text-center font-mono">{item.qtyOrdered} {item.unit}</td>
                          <td className="py-2 px-3 text-center font-mono text-emerald-400 font-bold">
                            {item.qtyReceived} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="bg-stone-950 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-stone-800">
                              {item.batchNumber || "BAT-STD"} (Exp: {item.expiredDate || "-"})
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono">{formatRupiah(item.pricePerUnit)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatRupiah(item.qtyReceived * item.pricePerUnit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: INVOICE & HUTANG SUPPLIER (ACCOUNTS PAYABLE / AP) --- */}
      {activeSubTab === "invoice" && (
        <div className="space-y-6">
          {/* Top AP Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-stone-400 font-bold block">Total Belum Terbayar (Hutang Resto):</span>
              <strong className="text-amber-300 font-mono text-2xl font-extrabold block">
                {formatRupiah(totalHutangAktif)}
              </strong>
              <p className="text-[10px] text-stone-500">Saldo kewajiban tagihan ke seluruh supplier.</p>
            </div>

            <div className="bg-stone-900 border border-rose-500/40 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-rose-300 font-bold block flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Hutang Jatuh Tempo (Overdue):
              </span>
              <strong className="text-rose-400 font-mono text-2xl font-extrabold block">
                {formatRupiah(totalJatuhTempo)}
              </strong>
              <p className="text-[10px] text-rose-300/80">Segera lunasi untuk menjaga keandalan pengiriman supplier.</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-xl space-y-1">
              <span className="text-xs text-emerald-400 font-bold block">Jumlah Tagihan Aktif:</span>
              <strong className="text-emerald-400 font-mono text-2xl font-extrabold block">
                {supplierInvoices.length} Invoice Supplier
              </strong>
              <p className="text-[10px] text-stone-500">
                {supplierInvoices.filter((i) => i.status === "Lunas").length} sudah lunas sepenuhnya.
              </p>
            </div>
          </div>

          {/* Invoice List Table */}
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>Rincian Tagihan & Skedul Pembayaran Supplier</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-amber-200 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-3">No. Invoice & Ref Supplier</th>
                    <th className="py-3 px-3">Supplier & Refferensi PO</th>
                    <th className="py-3 px-3">Tgl Invoice</th>
                    <th className="py-3 px-3">Jatuh Tempo</th>
                    <th className="py-3 px-3 text-right">Total Tagihan</th>
                    <th className="py-3 px-3 text-right">Sisa Hutang</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Aksi Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 font-medium">
                  {supplierInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-850/50">
                      <td className="py-3 px-3">
                        <strong className="text-amber-100 block font-mono">{inv.invoiceNumber}</strong>
                        <span className="text-[10px] text-stone-400">{inv.supplierInvoiceRef}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-stone-200">{inv.supplierName}</div>
                        <span className="text-[10px] text-stone-400 font-mono">PO: {inv.poNumber}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-400">{inv.invoiceDate}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">{inv.dueDate}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold">{formatRupiah(inv.totalAmount)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                        {formatRupiah(inv.remainingBalance)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            inv.status === "Lunas"
                              ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
                              : inv.status === "Jatuh Tempo"
                              ? "bg-rose-950 border-rose-500/40 text-rose-300 animate-pulse"
                              : "bg-amber-950 border-amber-500/40 text-amber-300"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {inv.remainingBalance > 0 ? (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1 mx-auto transition"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Bayar Hutang</span>
                          </button>
                        ) : (
                          <span className="text-xs text-stone-500 font-mono">Lunas</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: MASTER SUPPLIER --- */}
      {activeSubTab === "supplier" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-stone-900 border border-stone-800 p-4 rounded-2xl">
            <h3 className="font-serif font-bold text-sm text-amber-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Daftar Supplier Resmi Resto</span>
            </h3>

            <button
              onClick={() => setIsNewSupplierModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Supplier Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-stone-900 border border-stone-800 p-5 rounded-3xl shadow-xl space-y-3 hover:border-amber-500/40 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                      {sup.category}
                    </span>
                    <h4 className="font-bold text-base text-stone-100 mt-1">{sup.name}</h4>
                  </div>
                </div>

                <div className="text-xs text-stone-300 space-y-1.5 border-t border-stone-800 pt-3">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-start gap-2 text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{sup.address}</span>
                  </div>
                </div>

                <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Lead Time Antar:</span>
                    <strong className="text-amber-300 font-mono">{sup.leadTimeDays} Hari</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Term Pembayaran:</span>
                    <strong className="text-emerald-400 font-mono">
                      {sup.paymentTermDays ? `TOP ${sup.paymentTermDays} Hari` : "Cash on Delivery"}
                    </strong>
                  </div>
                  {sup.bankAccount && (
                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                      Rekening: <strong className="text-stone-200">{sup.bankAccount}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: NEW SUPPLIER --- */}
      {isNewSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-amber-200">Tambah Master Supplier Baru</h3>
              <button onClick={() => setIsNewSupplierModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Nama Perusahaan / Supplier:</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="Contoh: PT Pasundan Pangan Segar"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Kategori Bahan:</label>
                <select
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                >
                  <option value="Beras & Sembako">Beras & Sembako</option>
                  <option value="Ayam & Daging">Ayam & Daging</option>
                  <option value="Ikan Segar">Ikan Segar</option>
                  <option value="Sayuran & Bumbu">Sayuran & Bumbu</option>
                  <option value="Kemasan Resto">Kemasan Resto</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Telepon / Whatsapp:</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Lead Time (Hari):</label>
                  <input
                    type="number"
                    value={supLeadTime}
                    onChange={(e) => setSupLeadTime(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Term Pembayaran (Hari TOP):</label>
                <input
                  type="number"
                  value={supTermDays}
                  onChange={(e) => setSupTermDays(Number(e.target.value))}
                  placeholder="14"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nomor Rekening Bank Pembayaran:</label>
                <input
                  type="text"
                  value={supBank}
                  onChange={(e) => setSupBank(e.target.value)}
                  placeholder="BCA 12345678 a.n PT..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl transition"
              >
                Simpan Master Supplier
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW PURCHASE REQUEST (PR) --- */}
      {isNewPRModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-amber-200">Buat Purchase Request (PR) Baru</h3>
              <button onClick={() => setIsNewPRModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePR} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Pengaju:</label>
                  <input
                    type="text"
                    value={prRequestedBy}
                    onChange={(e) => setPrRequestedBy(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Departemen:</label>
                  <select
                    value={prDept}
                    onChange={(e) => setPrDept(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                  >
                    <option value="Dapur Utama">Dapur Utama</option>
                    <option value="Gudang Sembako">Gudang Sembako</option>
                    <option value="Bar Minuman">Bar Minuman</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-stone-400 block">Daftar Bahan Baku Dibutuhkan:</label>
                {prItems.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={row.itemId}
                      onChange={(e) => {
                        const updated = [...prItems];
                        updated[idx].itemId = e.target.value;
                        setPrItems(updated);
                      }}
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-stone-200 outline-none"
                    >
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={row.qtyRequested}
                      onChange={(e) => {
                        const updated = [...prItems];
                        updated[idx].qtyRequested = Number(e.target.value);
                        setPrItems(updated);
                      }}
                      className="w-20 bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-amber-300 font-mono text-center outline-none"
                    />

                    {prItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePRItemRow(idx)}
                        className="text-stone-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddPRItemRow}
                  className="text-amber-400 hover:underline font-bold text-[11px] flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Baris Bahan</span>
                </button>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Catatan Kebutuhan Dapur:</label>
                <textarea
                  value={prNotes}
                  onChange={(e) => setPrNotes(e.target.value)}
                  placeholder="Contoh: Stok cabai rawit tinggal sedikit untuk weekend..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-200 outline-none h-16"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl transition"
              >
                Kirim Pengajuan (PR)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW PURCHASE ORDER (DIRECT PO) --- */}
      {isNewPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-amber-200">Terbitkan Purchase Order (PO) Baru</h3>
              <button onClick={() => setIsNewPOModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Pilih Supplier Resmi:</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-stone-400 block">Item Barang Pesanan PO:</label>
                {poItems.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={row.itemId}
                      onChange={(e) => {
                        const inv = inventory.find((i) => i.id === e.target.value);
                        const updated = [...poItems];
                        updated[idx].itemId = e.target.value;
                        if (inv) updated[idx].pricePerUnit = inv.avgCostPerUnit;
                        setPoItems(updated);
                      }}
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5 text-stone-200 outline-none"
                    >
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={row.qtyOrdered}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].qtyOrdered = Number(e.target.value);
                        setPoItems(updated);
                      }}
                      className="w-16 bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-amber-300 font-mono text-center outline-none"
                    />

                    <input
                      type="number"
                      value={row.pricePerUnit}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].pricePerUnit = Number(e.target.value);
                        setPoItems(updated);
                      }}
                      className="w-24 bg-stone-950 border border-stone-800 rounded-xl px-2 py-1.5 text-emerald-400 font-mono text-right outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl transition"
              >
                Terbitkan Surat Pesanan PO
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW GOODS RECEIPT (GRN) --- */}
      {isNewGRNModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-emerald-300">Form Penerimaan Barang Fisik (GRN)</h3>
              <button onClick={() => setIsNewGRNModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGRN} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Pilih PO Refferensi:</label>
                <select
                  value={grnPoId}
                  onChange={(e) => handleSelectPOforGRN(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                >
                  <option value="">-- Pilih Nomor PO --</option>
                  {purchaseOrders
                    .filter((po) => po.status !== "Completed")
                    .map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} - {po.supplierName} ({formatRupiah(po.totalAmount)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">No. Surat Jalan Supplier:</label>
                  <input
                    type="text"
                    value={grnSuratJalan}
                    onChange={(e) => setGrnSuratJalan(e.target.value)}
                    placeholder="SJ-PAS-8812"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Penerima Gudang:</label>
                  <input
                    type="text"
                    value={grnReceivedBy}
                    onChange={(e) => setGrnReceivedBy(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                  />
                </div>
              </div>

              {grnItems.length > 0 && (
                <div className="space-y-2 border-t border-stone-800 pt-2">
                  <label className="text-stone-300 font-bold block">Verifikasi Qty Diterima Fisik & Batch:</label>
                  {grnItems.map((item, idx) => (
                    <div key={idx} className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 space-y-1">
                      <div className="flex justify-between font-bold text-amber-200">
                        <span>{item.itemName}</span>
                        <span>Diorder: {item.qtyOrdered} {item.unit}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-stone-400 block">Qty Diterima:</label>
                          <input
                            type="number"
                            value={item.qtyReceived}
                            onChange={(e) => {
                              const updated = [...grnItems];
                              updated[idx].qtyReceived = Number(e.target.value);
                              setGrnItems(updated);
                            }}
                            className="w-full bg-stone-900 border border-stone-700 text-emerald-400 font-bold rounded-lg px-2 py-1 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-400 block">Batch No:</label>
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={(e) => {
                              const updated = [...grnItems];
                              updated[idx].batchNumber = e.target.value;
                              setGrnItems(updated);
                            }}
                            className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-lg px-2 py-1 outline-none font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-400 block">Expired Date:</label>
                          <input
                            type="date"
                            value={item.expiredDate}
                            onChange={(e) => {
                              const updated = [...grnItems];
                              updated[idx].expiredDate = e.target.value;
                              setGrnItems(updated);
                            }}
                            className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-lg px-2 py-1 outline-none font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl transition"
              >
                Simpan Penerimaan (Auto Restock Inventori)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: RECORD SUPPLIER PAYMENT --- */}
      {isPaymentModalOpen && selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-emerald-300">Catat Pembayaran Hutang Supplier</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplierPayment} className="space-y-3 text-xs">
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 space-y-1">
                <div className="text-stone-400">Supplier: <strong className="text-stone-200">{selectedInvoiceForPay.supplierName}</strong></div>
                <div className="text-stone-400">Invoice: <strong className="text-amber-300 font-mono">{selectedInvoiceForPay.invoiceNumber}</strong></div>
                <div className="text-stone-400">Sisa Hutang: <strong className="text-rose-400 font-mono">{formatRupiah(selectedInvoiceForPay.remainingBalance)}</strong></div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Nominal Pembayaran (Rp):</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-base outline-none"
                />
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Metode Pembayaran:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none"
                >
                  <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                  <option value="Kas Kecil Resto">Kas Kecil Resto</option>
                  <option value="Giro / Cek">Giro / Cek</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">No. Refferensi Bank / Bukti Bayar:</label>
                <input
                  type="text"
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  placeholder="TRX-BCA-98213"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl transition"
              >
                Konfirmasi Pembayaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: VIEW PO FORMAL DOCUMENT --- */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-amber-200">Dokumen PO Resmi: {viewingPO.poNumber}</h3>
              <button onClick={() => setViewingPO(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-start border-b border-stone-800 pb-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-amber-300">SAWARGA RESTO SUNDA</h4>
                  <p className="text-[10px] text-stone-400">Jl. Ir. H. Juanda No. 128, Dago, Bandung</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-amber-400 font-bold text-sm block">{viewingPO.poNumber}</span>
                  <span className="text-stone-400 text-[10px]">Tanggal: {viewingPO.orderDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-stone-300">
                <div>
                  <span className="text-stone-500 text-[10px] block uppercase">Tujuan Supplier:</span>
                  <strong>{viewingPO.supplierName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 text-[10px] block uppercase">Term Pembayaran:</span>
                  <strong className="text-emerald-400">{viewingPO.paymentTerm}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900 text-stone-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2">Bahan Baku</th>
                    <th className="py-2 px-2 text-center">Qty</th>
                    <th className="py-2 px-2 text-right">Harga</th>
                    <th className="py-2 px-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {viewingPO.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 text-amber-100 font-bold">{item.itemName}</td>
                      <td className="py-2 px-2 text-center font-mono">{item.qtyOrdered} {item.unit}</td>
                      <td className="py-2 px-2 text-right font-mono">{formatRupiah(item.pricePerUnit)}</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-400">{formatRupiah(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-stone-800 pt-2 flex justify-between font-bold text-sm">
                <span className="text-stone-300">Total Nilai Pesanan PO:</span>
                <span className="text-amber-300 font-mono">{formatRupiah(viewingPO.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  showToast("Format WA PO berhasil disalin!");
                  setViewingPO(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Kirim via WA Supplier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
