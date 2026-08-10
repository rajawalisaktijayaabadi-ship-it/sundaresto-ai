import React, { useState } from "react";
import { RbacRole } from "./utils/rbac";
import {
  INITIAL_LICENSE,
  INITIAL_OUTLETS,
  INITIAL_MENU,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_SUPPLIER_INVOICES,
  INITIAL_CUSTOMERS,
  INITIAL_VOUCHERS,
  INITIAL_RESERVATIONS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_COMMISSIONS,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_OUTLET_ACCESS,
  INITIAL_USER_ACCOUNTS
} from "./data/mockData";
import {
  LicenseInfo,
  Outlet,
  MenuItem,
  TableSaung,
  Order,
  OrderStatus,
  PaymentStatus,
  InventoryItem,
  Supplier,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceipt,
  SupplierInvoice,
  Customer,
  Voucher,
  Reservation,
  ReservationStatus,
  Employee,
  AttendanceRecord,
  CommissionRecord,
  TableStatus,
  StockTransfer,
  OutletAccessControl,
  UserAccount
} from "./types";
import { LandingPage } from "./components/LandingPage";
import { AuthAndLicenseModal } from "./components/AuthAndLicenseModal";
import { OnboardingFlowModal } from "./components/OnboardingFlowModal";
import { HeaderNav, ActiveTab } from "./components/HeaderNav";
import { PosModule } from "./components/PosModule";
import { OrdersModule } from "./components/OrdersModule";
import { SaungMapModule } from "./components/SaungMapModule";
import { KdsModule } from "./components/KdsModule";
import { InventoryModule } from "./components/InventoryModule";
import { RecipeHppModule } from "./components/RecipeHppModule";
import { PurchasingModule } from "./components/PurchasingModule";
import { CrmModule } from "./components/CrmModule";
import { ReservationModule } from "./components/ReservationModule";
import { EmployeeModule } from "./components/EmployeeModule";
import { MultiOutletModule } from "./components/MultiOutletModule";
import { AiPilotModule } from "./components/AiPilotModule";

import { ReportsModule } from "./components/ReportsModule";
import { LicenseModule } from "./components/LicenseModule";
import { SettingsModule } from "./components/SettingsModule";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";
import { ReceiptModal } from "./components/ReceiptModal";

export default function App() {
  const [viewMode, setViewMode] = useState<"landing" | "app">("landing");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Application Global State
  const [license, setLicense] = useState<LicenseInfo>(INITIAL_LICENSE);
  const [outlets, setOutlets] = useState<Outlet[]>(INITIAL_OUTLETS);
  const [currentOutlet, setCurrentOutlet] = useState<Outlet>(INITIAL_OUTLETS[0]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(INITIAL_STOCK_TRANSFERS);
  const [outletAccessControls, setOutletAccessControls] = useState<OutletAccessControl[]>(INITIAL_OUTLET_ACCESS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [tables, setTables] = useState<TableSaung[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);

  // Purchasing Module States
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(INITIAL_PURCHASE_REQUESTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(INITIAL_GOODS_RECEIPTS);
  const [supplierInvoices, setSupplierInvoices] = useState<SupplierInvoice[]>(INITIAL_SUPPLIER_INVOICES);

  // CRM Module States
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);

  // Reservation Module States
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);

  // Employee & HR Module States
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [commissions, setCommissions] = useState<CommissionRecord[]>(INITIAL_COMMISSIONS);

  // User Accounts & Authentication States (Username & Password)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);

  const handleAddUserAccount = (acc: UserAccount) => {
    setUserAccounts((prev) => [acc, ...prev]);
  };

  const handleUpdateUserAccount = (updatedAcc: UserAccount) => {
    setUserAccounts((prev) =>
      prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a))
    );
  };

  const handleDeleteUserAccount = (id: string) => {
    setUserAccounts((prev) => prev.filter((a) => a.id !== id));
  };


  // Active Tab & Modal States
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [currentRole, setCurrentRole] = useState<RbacRole>("OWNER");
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<string>("Saung 01");

  // Quick Demo Access from Landing Page
  const handleQuickDemo = (tier: "BASIC" | "PRO" | "ENTERPRISE") => {
    setLicense({
      ...INITIAL_LICENSE,
      tier,
      tierName: tier === "ENTERPRISE" ? "SundaResto AI Enterprise Multi-Outlet" : "SundaResto AI Pro (Multi-Saung)"
    });
    setViewMode("app");
    setActiveTab("dashboard");
  };

  // License Validated Handler
  const handleLicenseValidated = (info: LicenseInfo) => {
    setLicense(info);
    setViewMode("app");
    setActiveTab("dashboard");
  };

  // Order Handlers
  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update table status to Cooking
    setTables((prev) =>
      prev.map((t) => {
        if (t.code === newOrder.tableCode) {
          return {
            ...t,
            status: "Cooking",
            currentOrderId: newOrder.id,
            customerName: newOrder.customerName,
            timeSeated: newOrder.createdAt
          };
        }
        return t;
      })
    );

    // Auto Deduct Ingredient Inventory based on BOM
    newOrder.items.forEach((item) => {
      const menu = menuItems.find((m) => m.id === item.menuId);
      if (menu && menu.recipe) {
        menu.recipe.forEach((rec) => {
          const qtyNeededTotal = (rec.qtyNeeded / 1000) * item.qty; // conversion for kg
          setInventory((prevInv) =>
            prevInv.map((inv) => {
              if (inv.id === rec.ingredientId) {
                return {
                  ...inv,
                  currentStock: Math.max(0, Math.round((inv.currentStock - qtyNeededTotal) * 10) / 10)
                };
              }
              return inv;
            })
          );
        });
      }
    });
  };

  // Update Order Handler (for POS billing & existing order payment)
  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );

    // If order was paid, update table status to Available
    if (updatedOrder.paymentStatus === "Paid") {
      setTables((prev) =>
        prev.map((t) => {
          if (t.code === updatedOrder.tableCode) {
            return {
              ...t,
              status: "Available",
              customerName: undefined,
              timeSeated: undefined,
              currentOrderId: undefined
            };
          }
          return t;
        })
      );
    }
  };

  // Add New Menu Item (from AI Resep Sunda Generator or Manual Add)
  const handleAddNewMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
  };

  // Move Table (Pindah Meja)
  const handleMoveTable = (sourceTableCode: string, targetTableCode: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.tableCode === sourceTableCode && o.paymentStatus === "Unpaid" ? { ...o, tableCode: targetTableCode } : o))
    );

    setTables((prev) => {
      const sourceTable = prev.find((t) => t.code === sourceTableCode);
      return prev.map((t) => {
        if (t.code === sourceTableCode) {
          return { ...t, status: "Available", customerName: undefined, timeSeated: undefined, currentOrderId: undefined };
        }
        if (t.code === targetTableCode) {
          return {
            ...t,
            status: sourceTable?.status || "Occupied",
            customerName: sourceTable?.customerName,
            timeSeated: sourceTable?.timeSeated || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
          };
        }
        return t;
      });
    });
  };

  // Merge Tables (Gabung Meja)
  const handleMergeTables = (primaryTableCode: string, secondaryTableCodes: string[]) => {
    setTables((prev) =>
      prev.map((t) => {
        if (secondaryTableCodes.includes(t.code)) {
          return {
            ...t,
            status: "Occupied",
            mergedWithTableCode: primaryTableCode,
            customerName: `Digabung ke ${primaryTableCode}`
          };
        }
        return t;
      })
    );
  };

  // Table Status Updater
  const handleUpdateTableStatus = (
    tableId: string,
    status: TableStatus,
    customerName?: string,
    reservationInfo?: any
  ) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status,
            customerName: customerName !== undefined ? customerName : t.customerName,
            timeSeated: status === "Available" ? undefined : t.timeSeated,
            reservationInfo: reservationInfo || t.reservationInfo
          };
        }
        return t;
      })
    );
  };

  // Select Table for Order shortcut (POS, Orders, or KDS)
  const handleSelectTableForOrder = (
    tableCode: string,
    targetView: ActiveTab = "orders"
  ) => {
    setSelectedTableForOrder(tableCode);
    setActiveTab(targetView);
  };

  // KDS Item Status Updater
  const handleUpdateItemKitchenStatus = (
    orderId: string,
    itemId: string,
    status: "Queued" | "Cooking" | "Ready" | "Served"
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((it) =>
            it.id === itemId ? { ...it, kitchenStatus: status } : it
          );

          // Determine overall order status based on item statuses
          const allServed = updatedItems.every((it) => it.kitchenStatus === "Served");
          const allReadyOrServed = updatedItems.every(
            (it) => it.kitchenStatus === "Ready" || it.kitchenStatus === "Served"
          );
          const anyCooking = updatedItems.some((it) => it.kitchenStatus === "Cooking");

          let newOrderStatus = o.status;
          if (allServed) {
            newOrderStatus = "Served";
          } else if (allReadyOrServed) {
            newOrderStatus = "Ready";
          } else if (anyCooking) {
            newOrderStatus = "InKitchen";
          }

          return {
            ...o,
            status: newOrderStatus,
            items: updatedItems
          };
        }
        return o;
      })
    );
  };

  // Update Order Status Handler
  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    paymentStatus?: PaymentStatus
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              paymentStatus: paymentStatus || o.paymentStatus
            }
          : o
      )
    );
  };

  // KDS Simulate New Real-time Order
  const handleSimulateNewOrder = () => {
    const tableCodes = ["Saung 03", "Saung 05", "Meja VIP 02", "Outdoor 02"];
    const randomTable = tableCodes[Math.floor(Math.random() * tableCodes.length)];
    const randomOrderNum = `SND-20260809-${(orders.length + 1).toString().padStart(3, "0")}`;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      orderNumber: randomOrderNum,
      outletId: "out-1",
      tableCode: randomTable,
      customerName: "Tamu Real-time " + Math.floor(Math.random() * 90 + 10),
      paxCount: 4,
      priority: Math.random() > 0.6 ? "VIP Saung" : "Normal",
      estimatedPrepTimeMins: 15,
      createdAtTimestamp: Date.now(),
      items: [
        {
          id: `oi-${Date.now()}-1`,
          menuId: "m-1",
          menuName: "Paket Nasi Liwet Kastrol Komplit",
          category: "Nasi & Paket Liwet",
          price: 48000,
          costHPP: 18500,
          qty: 2,
          note: "Pete digoreng renyah",
          kitchenStatus: "Queued",
          kitchenStation: "Dapur Tumis & Nasi"
        },
        {
          id: `oi-${Date.now()}-2`,
          menuId: "m-3",
          menuName: "Gurame Bakar Kecap Pasundan (600g)",
          category: "Olahan Gurame & Nila",
          price: 78000,
          costHPP: 32000,
          qty: 1,
          note: "Bakar kecap pedas gurih",
          kitchenStatus: "Queued",
          kitchenStation: "Dapur Bakar/Goreng"
        },
        {
          id: `oi-${Date.now()}-3`,
          menuId: "m-12",
          menuName: "Es Teh Manis Jumbo Poci",
          category: "Minuman & Es",
          price: 10000,
          costHPP: 2500,
          qty: 4,
          note: "Manis segar",
          kitchenStatus: "Queued",
          kitchenStation: "Bar Minuman"
        }
      ],
      subtotal: 214000,
      taxPB1: 2140,
      serviceCharge: 10700,
      discount: 0,
      total: 246100,
      status: "InKitchen",
      paymentStatus: "Unpaid",
      createdAt: new Date().toTimeString().substring(0, 5) + " WIB",
      cashierName: "Siti Rahma"
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update table status
    setTables((prev) =>
      prev.map((t) =>
        t.code === randomTable
          ? { ...t, status: "Cooking", currentOrderId: newOrder.id, customerName: newOrder.customerName }
          : t
      )
    );
  };

  // KDS Complete Order
  const handleCompleteOrderKitchen = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "Served",
            items: o.items.map((it) => ({ ...it, kitchenStatus: "Served" }))
          };
        }
        return o;
      })
    );

    // Update table status to Occupied
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      setTables((prev) =>
        prev.map((t) => (t.code === targetOrder.tableCode ? { ...t, status: "Occupied" } : t))
      );
    }
  };

  // Add Stock Handler
  const handleAddStock = (itemId: string, qtyToAdd: number) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              currentStock: i.currentStock + qtyToAdd,
              lastRestocked: new Date().toISOString().slice(0, 10)
            }
          : i
      )
    );
  };

  // Add New Ingredient Handler
  const handleAddNewIngredient = (newItem: InventoryItem) => {
    setInventory((prev) => [...prev, newItem]);
  };

  // Update Menu Item Price & HPP Handler
  const handleUpdateMenuItemPrice = (menuId: string, newPrice: number, newHpp?: number) => {
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === menuId
          ? {
              ...m,
              price: newPrice,
              costHPP: newHpp !== undefined ? newHpp : m.costHPP
            }
          : m
      )
    );
  };

  // Update Recipe BOM Handler
  const handleUpdateRecipe = (menuId: string, updatedRecipe: any[], newHpp: number) => {
    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === menuId
          ? {
              ...m,
              recipe: updatedRecipe,
              costHPP: newHpp
            }
          : m
      )
    );
  };

  // --- Purchasing Module Handlers ---
  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers((prev) => [newSup, ...prev]);
  };

  const handleAddPurchaseRequest = (newPR: PurchaseRequest) => {
    setPurchaseRequests((prev) => [newPR, ...prev]);
  };

  const handleUpdatePRStatus = (prId: string, status: PurchaseRequest["status"]) => {
    setPurchaseRequests((prev) =>
      prev.map((p) => (p.id === prId ? { ...p, status } : p))
    );
  };

  const handleAddPurchaseOrder = (newPO: PurchaseOrder) => {
    setPurchaseOrders((prev) => [newPO, ...prev]);
  };

  const handleUpdatePOStatus = (poId: string, status: PurchaseOrder["status"]) => {
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === poId ? { ...p, status } : p))
    );
  };

  const handleAddGoodsReceipt = (
    grn: GoodsReceipt,
    updatedStockItems: { itemId: string; qtyReceived: number; batchNumber?: string; expiredDate?: string }[]
  ) => {
    setGoodsReceipts((prev) => [grn, ...prev]);

    // 1. Auto Update Inventory Stock
    setInventory((prev) =>
      prev.map((inv) => {
        const received = updatedStockItems.find((u) => u.itemId === inv.id);
        if (received) {
          const newStock = inv.currentStock + received.qtyReceived;
          const newBatch = received.batchNumber
            ? {
                batchNumber: received.batchNumber,
                qty: received.qtyReceived,
                expiredDate: received.expiredDate || "2026-12-31",
                receivedDate: new Date().toISOString().split("T")[0]
              }
            : undefined;

          return {
            ...inv,
            currentStock: newStock,
            lastRestocked: new Date().toISOString().split("T")[0],
            batches: newBatch ? [...(inv.batches || []), newBatch] : inv.batches
          };
        }
        return inv;
      })
    );

    // 2. Auto Create Accounts Payable Invoice for Supplier
    const sup = suppliers.find((s) => s.name === grn.supplierName);
    const termDays = sup?.paymentTermDays || 14;

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + termDays);

    const newInvoice: SupplierInvoice = {
      id: `inv-sp-${Date.now()}`,
      invoiceNumber: `INV-SUP-202608-0${supplierInvoices.length + 1}`,
      supplierInvoiceRef: grn.supplierSuratJalan || `SJ-${grn.grnNumber}`,
      poNumber: grn.poNumber,
      grnNumber: grn.grnNumber,
      supplierId: sup?.id || "sup-1",
      supplierName: grn.supplierName,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: dueDateObj.toISOString().split("T")[0],
      totalAmount: grn.totalAmountReceived,
      paidAmount: 0,
      remainingBalance: grn.totalAmountReceived,
      status: "Belum Lunas",
      payments: []
    };

    setSupplierInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleRecordSupplierPayment = (
    invoiceId: string,
    amountPaid: number,
    paymentMethod: "Transfer Bank BCA" | "Kas Kecil Resto" | "Giro / Cek",
    refNo?: string,
    notes?: string
  ) => {
    setSupplierInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + amountPaid;
          const newRemaining = Math.max(0, inv.totalAmount - newPaid);
          const newStatus =
            newRemaining === 0
              ? "Lunas"
              : newPaid > 0
              ? "Lunas Sebagian"
              : inv.status;

          const newPaymentRecord = {
            id: `pay-${Date.now()}`,
            paymentDate: new Date().toISOString().split("T")[0],
            amount: amountPaid,
            paymentMethod,
            referenceNumber: refNo,
            notes
          };

          return {
            ...inv,
            paidAmount: newPaid,
            remainingBalance: newRemaining,
            status: newStatus as any,
            payments: [newPaymentRecord, ...inv.payments]
          };
        }
        return inv;
      })
    );
  };

  // --- CRM Module Handlers ---
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
  };

  const handleAddVoucher = (newVoucher: Voucher) => {
    setVouchers((prev) => [newVoucher, ...prev]);
  };

  const handleRedeemPoints = (customerId: string, voucher: Voucher): boolean => {
    let success = false;
    setCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === customerId) {
          if (cust.points >= voucher.pointsCost) {
            success = true;
            return {
              ...cust,
              points: cust.points - voucher.pointsCost
            };
          }
        }
        return cust;
      })
    );
    return success;
  };

  const handleAddReservation = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
  };

  const handleUpdateReservationStatus = (
    id: string,
    status: ReservationStatus,
    depositStatus?: "Belum DP" | "DP Lunas" | "Bebas DP (VIP)"
  ) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            depositStatus: depositStatus || r.depositStatus
          };
        }
        return r;
      })
    );
  };

  const handleSendReminder = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reminderSent: true } : r))
    );
  };

  // --- Employee & HR Handlers ---
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
    );
  };

  const handleClockIn = (employeeId: string, pin: string, notes?: string): boolean => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return false;
    if (emp.pinCode !== pin) return false;

    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role,
      date: new Date().toISOString().substring(0, 10),
      clockIn: new Date().toTimeString().substring(0, 5),
      status: "Hadir",
      workHours: 8,
      notes: notes || "Clock In via PIN"
    };

    setAttendance((prev) => [newAtt, ...prev]);
    return true;
  };

  const handleClockOut = (attendanceId: string) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.id === attendanceId
          ? { ...a, clockOut: new Date().toTimeString().substring(0, 5) }
          : a
      )
    );
  };

  const handlePayCommission = (commissionId: string) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === commissionId ? { ...c, status: "Lunas" } : c))
    );
  };

  // Multi Outlet Handlers
  const handleAddOutlet = (newOutlet: Outlet) => {
    setOutlets((prev) => [...prev, newOutlet]);
  };

  const handleUpdateOutlet = (updatedOutlet: Outlet) => {
    setOutlets((prev) =>
      prev.map((o) => (o.id === updatedOutlet.id ? updatedOutlet : o))
    );
    if (currentOutlet.id === updatedOutlet.id) {
      setCurrentOutlet(updatedOutlet);
    }
  };

  const handleAddStockTransfer = (transfer: StockTransfer) => {
    setStockTransfers((prev) => [transfer, ...prev]);
  };

  const handleUpdateTransferStatus = (
    transferId: string,
    newStatus: StockTransfer["status"]
  ) => {
    setStockTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          const updated: StockTransfer = { ...t, status: newStatus };
          if (newStatus === "Received") {
            updated.receivedDate = new Date().toLocaleString("id-ID", {
              dateStyle: "short",
              timeStyle: "short"
            });
            // Automatically adjust target inventory stock if applicable
            t.items.forEach((item) => {
              setInventory((invList) =>
                invList.map((inv) =>
                  inv.id === item.itemId
                    ? { ...inv, currentStock: inv.currentStock + item.qty }
                    : inv
                )
              );
            });
          }
          return updated;
        }
        return t;
      })
    );
  };

  const handleUpdateOutletAccess = (access: OutletAccessControl) => {
    setOutletAccessControls((prev) =>
      prev.map((a) => (a.employeeId === access.employeeId ? access : a))
    );
  };


  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* 1. Landing Page View */}
      {viewMode === "landing" ? (
        <LandingPage
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onQuickDemo={handleQuickDemo}
        />
      ) : (
        /* 2. Main App Application View */
        <HeaderNav
          license={license}
          outlets={outlets}
          currentOutlet={currentOutlet}
          onSelectOutlet={(o) => setCurrentOutlet(o)}
          activeTab={activeTab}
          onChangeTab={(t) => setActiveTab(t)}
          onLogoutToLanding={() => setViewMode("landing")}
          currentRole={currentRole}
          onChangeRole={(r) => setCurrentRole(r)}
        >
          <div className="p-4 sm:p-6">
            {activeTab === "dashboard" && (
              <ExecutiveDashboard
                orders={orders}
                inventory={inventory}
                outlets={outlets}
                currentOutlet={currentOutlet}
                menuItems={menuItems}
                tables={tables}
                onSelectTab={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === "pos" && (
              <PosModule
                menuItems={menuItems}
                tables={tables}
                currentOutlet={currentOutlet}
                orders={orders}
                onCreateOrder={handleCreateOrder}
                onUpdateOrder={handleUpdateOrder}
                onOpenReceipt={(ord) => setReceiptOrder(ord)}
                preselectedTableCode={selectedTableForOrder}
              />
            )}

            {activeTab === "orders" && (
              <OrdersModule
                menuItems={menuItems}
                tables={tables}
                orders={orders}
                currentOutlet={currentOutlet}
                onCreateOrder={handleCreateOrder}
                onOpenReceipt={(ord) => setReceiptOrder(ord)}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                preselectedTableCode={selectedTableForOrder}
              />
            )}

            {activeTab === "saung" && (
              <SaungMapModule
                tables={tables}
                orders={orders}
                onUpdateTableStatus={handleUpdateTableStatus}
                onMoveTable={handleMoveTable}
                onMergeTables={handleMergeTables}
                onSelectTableForOrder={handleSelectTableForOrder}
                onOpenReceiptForOrder={(ord) => setReceiptOrder(ord)}
              />
            )}

            {activeTab === "kds" && (
              <KdsModule
                orders={orders}
                onUpdateItemKitchenStatus={handleUpdateItemKitchenStatus}
                onCompleteOrderKitchen={handleCompleteOrderKitchen}
                onSimulateNewOrder={handleSimulateNewOrder}
              />
            )}

            {activeTab === "inventory" && (
              <InventoryModule
                inventory={inventory}
                menuItems={menuItems}
                onAddStock={handleAddStock}
                onAddNewIngredient={handleAddNewIngredient}
              />
            )}

            {activeTab === "recipe" && (
              <RecipeHppModule
                menuItems={menuItems}
                inventory={inventory}
                onUpdateMenuItemPrice={handleUpdateMenuItemPrice}
                onUpdateRecipe={handleUpdateRecipe}
                onAddNewMenuItem={handleAddNewMenuItem}
              />
            )}

            {activeTab === "purchasing" && (
              <PurchasingModule
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                purchaseRequests={purchaseRequests}
                onAddPurchaseRequest={handleAddPurchaseRequest}
                onUpdatePRStatus={handleUpdatePRStatus}
                purchaseOrders={purchaseOrders}
                onAddPurchaseOrder={handleAddPurchaseOrder}
                onUpdatePOStatus={handleUpdatePOStatus}
                goodsReceipts={goodsReceipts}
                onAddGoodsReceipt={handleAddGoodsReceipt}
                supplierInvoices={supplierInvoices}
                onRecordSupplierPayment={handleRecordSupplierPayment}
                inventory={inventory}
              />
            )}

            {activeTab === "crm" && (
              <CrmModule
                customers={customers}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                vouchers={vouchers}
                onAddVoucher={handleAddVoucher}
                onRedeemPoints={handleRedeemPoints}
              />
            )}

            {activeTab === "reservation" && (
              <ReservationModule
                reservations={reservations}
                onAddReservation={handleAddReservation}
                onUpdateReservationStatus={handleUpdateReservationStatus}
                onSendReminder={handleSendReminder}
                tables={tables}
                customers={customers}
              />
            )}

            {activeTab === "employee" && (
              <EmployeeModule
                employees={employees}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                attendance={attendance}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                commissions={commissions}
                onPayCommission={handlePayCommission}
              />
            )}

            {activeTab === "outlet" && (
              <MultiOutletModule
                outlets={outlets}
                onAddOutlet={handleAddOutlet}
                onUpdateOutlet={handleUpdateOutlet}
                currentOutlet={currentOutlet}
                onSelectOutlet={(out) => setCurrentOutlet(out)}
                stockTransfers={stockTransfers}
                onAddStockTransfer={handleAddStockTransfer}
                onUpdateTransferStatus={handleUpdateTransferStatus}
                outletAccessControls={outletAccessControls}
                onUpdateOutletAccess={handleUpdateOutletAccess}
                inventory={inventory}
                orders={orders}
                employees={employees}
              />
            )}

            {activeTab === "aipilot" && (
              <AiPilotModule
                orders={orders}
                inventory={inventory}
                menuItems={menuItems}
                outlets={outlets}
                currentOutlet={currentOutlet}
                customers={customers}
                employees={employees}
                reservations={reservations}
                stockTransfers={stockTransfers}
              />
            )}

            {activeTab === "reports" && (
              <ReportsModule
                orders={orders}
                currentOutlet={currentOutlet}
                outlets={outlets}
                inventory={inventory}
                purchaseOrders={purchaseOrders}
                supplierInvoices={supplierInvoices}
                customers={customers}
                employees={employees}
                attendance={attendance}
                commissions={commissions}
              />
            )}

            {(activeTab === "license" || activeTab === "settings") && (
              <SettingsModule
                license={license}
                onUpdateLicense={(lic) => setLicense(lic)}
                userAccounts={userAccounts}
                onAddUserAccount={handleAddUserAccount}
                onUpdateUserAccount={handleUpdateUserAccount}
                onDeleteUserAccount={handleDeleteUserAccount}
                outlets={outlets}
                currentOutlet={currentOutlet}
                onUpdateOutlet={handleUpdateOutlet}
              />
            )}
          </div>
        </HeaderNav>
      )}

      {/* Global Modals */}
      <AuthAndLicenseModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLicenseValidated={handleLicenseValidated}
        onStartOnboarding={() => setIsOnboardingModalOpen(true)}
      />

      <OnboardingFlowModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={(data) => {
          console.log("Onboarding Complete:", data);
          setViewMode("app");
          setActiveTab("dashboard");
        }}
      />

      <ReceiptModal
        order={receiptOrder}
        outlet={currentOutlet}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
