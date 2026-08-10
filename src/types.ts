export type LicenseTier = "BASIC" | "PRO" | "ENTERPRISE";

export interface LicenseInfo {
  key: string;
  tier: LicenseTier;
  tierName: string;
  maxOutlets: number;
  maxSaung: number;
  expiryDate: string;
  features: string[];
  ownerName: string;
  isValid: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: "Owner" | "Manager" | "Kasir" | "Koki" | "Waiter";
  email: string;
  outletId: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  username: string;
  passwordHash: string;
  pin?: string;
  role: "DEVELOPER" | "OWNER" | "MANAGER" | "SUPERVISOR" | "CASHIER" | "WAITER" | "KITCHEN";
  outletId: string;
  status: "Aktif" | "Nonaktif";
  email?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Outlet {
  id: string;
  code?: string;
  name: string;
  address: string;
  city: string;
  totalSaung: number;
  totalMeja: number;
  taxRatePct: number; // PB1 e.g. 10%
  serviceChargePct: number; // e.g. 5%
  phone: string;
  status?: "Aktif" | "Renovasi" | "Non-Aktif" | "Dapur Pusat";
  managerName?: string;
  isCentralKitchen?: boolean;
  operatingHours?: string;
  targetMonthlyOmset?: number;
}

export type MenuCategory = 
  | "Paket Menu Komplit"
  | "Nasi Timbel"
  | "Nasi Liwet"
  | "Nasi & Paket Liwet"
  | "Ayam & Bebek"
  | "Olahan Ikan"
  | "Olahan Gurame & Nila"
  | "Pepes Khas Sunda"
  | "Tumisan & Cah"
  | "Sayuran & Sup"
  | "Sambal Khas Sunda"
  | "Lalapan Segar"
  | "Minuman & Es"
  | "Camilan & Penutup";

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  qtyNeeded: number;
  unit: string; // e.g. 'gram', 'ekor', 'porsi', 'ml'
  costPerUnit: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  costHPP: number;
  description: string;
  image: string;
  isAvailable: boolean;
  isPopular?: boolean;
  recipe?: RecipeIngredient[];
}

export type TableType = "Saung Lesehan" | "Meja Utama" | "Meja VIP" | "Outdoor";
export type TableStatus = "Available" | "Occupied" | "Cooking" | "BillRequested" | "Reserved";

export interface TableSaung {
  id: string;
  code: string; // e.g., "Saung 01", "Meja VIP 02"
  type: TableType;
  capacity: number; // capacity persons
  status: TableStatus;
  currentOrderId?: string;
  customerName?: string;
  timeSeated?: string;
  mergedWithTableCode?: string;
  reservationInfo?: {
    customerName: string;
    phone: string;
    date: string;
    time: string;
    pax: number;
    dp: number;
    notes: string;
  };
}

export type OrderStatus = "New" | "InKitchen" | "Ready" | "Served" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";
export type PaymentMethod = "Cash" | "QRIS" | "Debit/Credit Card" | "Transfer Bank" | "Split Payment";
export type OrderType = "Dine-in" | "Takeaway" | "Delivery";

export interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  category: MenuCategory;
  price: number;
  costHPP: number;
  qty: number;
  note?: string;
  kitchenStatus?: "Queued" | "Cooking" | "Ready" | "Served";
  kitchenStation?: "Dapur Bakar/Goreng" | "Dapur Tumis & Nasi" | "Bar Minuman";
}

export interface Order {
  id: string;
  orderNumber: string; // e.g., "SND-20260809-001"
  outletId: string;
  tableCode: string;
  customerName: string;
  paxCount: number;
  orderType?: OrderType;
  items: OrderItem[];
  subtotal: number;
  taxPB1: number;
  serviceCharge: number;
  discount: number;
  discountPercent?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  changeDue?: number;
  createdAt: string;
  createdAtTimestamp?: number;
  priority?: "VIP Saung" | "Mendesak/Tinggi" | "Normal";
  estimatedPrepTimeMins?: number;
  paidAt?: string;
  cashierName: string;
  mergedFromTables?: string[];
  splitBillInfo?: { splitType: "pax" | "custom"; paxCount: number; amountPerPax: number };
}

export interface BatchInfo {
  batchNumber: string;
  qty: number;
  expiredDate: string;
  receivedDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Bahan Basah" | "Bumbu & Rempah" | "Sayuran & Lalapan" | "Beras & Biji" | "Minuman & Es" | "Kemasan";
  currentStock: number;
  minStockAlert: number;
  unit: string;
  avgCostPerUnit: number; // Rp
  lastRestocked: string;
  supplierName: string;
  batchNumber?: string;
  expiredDate?: string;
  batches?: BatchInfo[];
}

export interface StockMovementLog {
  id: string;
  itemId: string;
  itemName: string;
  type: "IN" | "OUT" | "OPNAME";
  qty: number;
  unit: string;
  reason: string;
  batchNumber?: string;
  expiredDate?: string;
  date: string;
  operator: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  leadTimeDays: number;
  paymentTermDays?: number; // e.g. 14 days, 30 days
  bankAccount?: string;
  contactPerson?: string;
}

export interface PurchaseRequestItem {
  itemId: string;
  itemName: string;
  unit: string;
  qtyRequested: number;
  estimatedCost: number;
}

export interface PurchaseRequest {
  id: string;
  prNumber: string;
  requestedBy: string;
  department: "Dapur Utama" | "Gudang Sembako" | "Bar Minuman";
  requestDate: string;
  priority: "Normal" | "Urgent";
  status: "Pending Approval" | "Approved" | "Converted to PO" | "Rejected";
  items: PurchaseRequestItem[];
  totalEstimatedAmount: number;
  notes?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  unit: string;
  qtyOrdered: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prNumber?: string;
  supplierId?: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  status: "Draft" | "Sent" | "Partial Received" | "Received" | "Completed" | "Cancelled";
  items: PurchaseOrderItem[];
  totalAmount: number;
  paymentTerm?: string;
  notes?: string;
}

export interface GoodsReceiptItem {
  itemId: string;
  itemName: string;
  unit: string;
  qtyOrdered: number;
  qtyReceived: number;
  pricePerUnit: number;
  batchNumber?: string;
  expiredDate?: string;
}

export interface GoodsReceipt {
  id: string;
  grnNumber: string;
  poId: string;
  poNumber: string;
  supplierName: string;
  receiveDate: string;
  receivedBy: string;
  supplierSuratJalan?: string;
  items: GoodsReceiptItem[];
  totalAmountReceived: number;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  paymentDate: string;
  amount: number;
  paymentMethod: "Transfer Bank BCA" | "Kas Kecil Resto" | "Giro / Cek";
  referenceNumber?: string;
  notes?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceRef: string;
  poNumber: string;
  grnNumber: string;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: "Belum Lunas" | "Lunas Sebagian" | "Lunas" | "Jatuh Tempo";
  payments: SupplierPayment[];
}

export interface CustomerPreference {
  favoriteSaungType?: string;
  favoriteDish?: string;
  spicinessLevel?: string; // e.g. "Sangat Pedas", "Sedang", "Tidak Pedas"
  dietaryNote?: string; // e.g. "Alergi udang", "Tanpa MSG", "Suka daun kemangi ekstra"
  specialDates?: { label: string; date: string }[]; // e.g. Ulang Tahun, Anniversary
}

export interface CustomerTransactionRecord {
  orderId: string;
  date: string;
  total: number;
  itemsSummary: string;
  pointsEarned: number;
}

export type MembershipTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export type CustomerSegment =
  | "VIP Loyalist"
  | "High Spender"
  | "Frequent Diner"
  | "Big Family Gathering"
  | "Risk of Churn"
  | "New Customer";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  membershipTier: MembershipTier;
  points: number;
  totalSpent: number;
  visitCount: number;
  joinDate: string;
  lastVisit: string;
  segment: CustomerSegment;
  preferences: CustomerPreference;
  transactionHistory: CustomerTransactionRecord[];
  notes?: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  discountType: "Percent" | "FixedAmount" | "FreeItem";
  discountValue: number; // e.g. 15 for 15% or 50000 for Rp 50.000
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  tierRequired: "All" | MembershipTier;
  pointsCost: number; // points needed to redeem
  freeItemName?: string;
  description: string;
  isRedeemed?: boolean;
}

export type ReservationStatus =
  | "Menunggu DP"
  | "Terkonfirmasi (DP Lunas)"
  | "Selesai (Seated)"
  | "Batal";

export interface Reservation {
  id: string;
  reservationNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  saungTableId: string;
  saungTableName: string;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:mm
  guestCount: number;
  depositAmount: number;
  depositStatus: "Belum DP" | "DP Lunas" | "Bebas DP (VIP)";
  depositPaymentMethod?: "QRIS BCA" | "Transfer Bank" | "Kasir Tunai" | "Giro";
  notes?: string;
  specialRequests?: string; // e.g. "Dekorasi Ultah, Kursi Bayi, Menu Pre-order"
  status: ReservationStatus;
  reminderSent: boolean;
  createdAt: string;
}

export type EmployeeRole =
  | "Kasir"
  | "Waiter"
  | "Kitchen"
  | "Supervisor"
  | "Manager"
  | "Owner";

export type EmployeeShiftType =
  | "Shift Pagi (08:00 - 16:00)"
  | "Shift Siang/Sore (12:00 - 20:00)"
  | "Shift Malam (15:00 - 23:00)"
  | "Full Day (09:00 - 21:00)";

export interface EmployeePermissions {
  canAccessPOS: boolean;
  canVoidOrder: boolean;
  canGiveDiscount: boolean;
  canViewReports: boolean;
  canManageStock: boolean;
  canManageEmployees: boolean;
  canChangeMenuPrice: boolean;
  canApprovePO: boolean;
}

export interface Employee {
  id: string;
  nip: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  joinDate: string;
  status: "Aktif" | "Cuti" | "Non-Aktif";
  shift: EmployeeShiftType;
  baseSalary: number;
  commissionRatePercent: number; // e.g. 2% for Sales/Waiter or 1% for Kasir
  pinCode: string; // 4-digit PIN for quick POS switch
  permissions: EmployeePermissions;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm
  clockOut?: string; // HH:mm
  status: "Hadir" | "Terlambat" | "Izin" | "Sakit" | "Alpha";
  workHours?: number;
  notes?: string;
}

export interface CommissionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: EmployeeRole;
  period: string; // e.g. "Agustus 2026"
  totalSalesGenerated: number;
  commissionRate: number; // percentage
  commissionAmount: number;
  tipsAmount: number;
  bonusAmount: number;
  status: "Pending" | "Lunas";
}


export interface KDSOrderCard {
  orderId: string;
  orderNumber: string;
  tableCode: string;
  timeElapsedMins: number;
  items: Array<OrderItem & { isDone?: boolean }>;
}

export interface StockTransferItem {
  itemId: string;
  itemName: string;
  unit: string;
  qty: number;
  costPerUnit: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string; // e.g. "TRF-20260809-001"
  fromOutletId: string;
  fromOutletName: string;
  toOutletId: string;
  toOutletName: string;
  requestDate: string;
  shippedDate?: string;
  receivedDate?: string;
  requestedBy: string;
  status: "Draft" | "Pending" | "In Transit" | "Received" | "Cancelled";
  items: StockTransferItem[];
  totalCost: number;
  driverName?: string;
  notes?: string;
}

export interface OutletAccessControl {
  employeeId: string;
  employeeName: string;
  role: string;
  primaryOutletId: string;
  primaryOutletName: string;
  accessibleOutletIds: string[];
  canCrossOutletTransfer: boolean;
  canViewConsolidatedReports: boolean;
  canManageOutlets: boolean;
}

