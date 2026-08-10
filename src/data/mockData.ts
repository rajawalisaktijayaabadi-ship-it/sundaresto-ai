import { MenuItem, Outlet, TableSaung, InventoryItem, LicenseInfo, Order, Customer, Voucher, Supplier, PurchaseRequest, PurchaseOrder, GoodsReceipt, SupplierInvoice, Reservation, Employee, AttendanceRecord, CommissionRecord, StockTransfer, OutletAccessControl, UserAccount } from "../types";

export const INITIAL_LICENSE: LicenseInfo = {
  key: "SUNDA-PRO-2026-X9A",
  tier: "PRO",
  tierName: "SundaResto AI Pro (Multi-Saung)",
  maxOutlets: 3,
  maxSaung: 50,
  expiryDate: "2027-12-31",
  features: [
    "AI Voice POS Order Input",
    "Realtime Digital Saung & Table Map",
    "Kitchen Display System (KDS)",
    "HPP & Inventory Recipe Costing (BOM)",
    "AI Menu Engineer & Marketing Copywriter",
    "Thermal Receipt Print & QRIS Support"
  ],
  ownerName: "RM Saung Pasundan Utama",
  isValid: true
};

export const INITIAL_OUTLETS: Outlet[] = [
  {
    id: "out-1",
    code: "OUT-DAGO",
    name: "RM Saung Pasundan - Branch Dago",
    address: "Jl. Ir. H. Juanda No. 128, Dago",
    city: "Bandung",
    totalSaung: 12,
    totalMeja: 8,
    taxRatePct: 10,
    serviceChargePct: 5,
    phone: "022-2501234",
    status: "Aktif",
    managerName: "Asep Sunandar",
    operatingHours: "10:00 - 22:00",
    targetMonthlyOmset: 180000000
  },
  {
    id: "out-2",
    code: "OUT-BGR",
    name: "RM Saung Pasundan - Branch Bogor Lesehan",
    address: "Jl. Pajajaran No. 45",
    city: "Bogor",
    totalSaung: 15,
    totalMeja: 10,
    taxRatePct: 10,
    serviceChargePct: 5,
    phone: "0251-8329988",
    status: "Aktif",
    managerName: "Dewi Lestari",
    operatingHours: "10:00 - 22:00",
    targetMonthlyOmset: 220000000
  },
  {
    id: "out-3",
    code: "OUT-SRP",
    name: "RM Saung Pasundan - Branch Serpong",
    address: "Jl. Boulevard Gading Serpong",
    city: "Tangerang Selatan",
    totalSaung: 10,
    totalMeja: 6,
    taxRatePct: 10,
    serviceChargePct: 5,
    phone: "021-54218899",
    status: "Aktif",
    managerName: "Budi Santoso",
    operatingHours: "10:00 - 22:00",
    targetMonthlyOmset: 160000000
  },
  {
    id: "out-4",
    code: "OUT-CK",
    name: "Central Kitchen Gedebage (Dapur Pusat)",
    address: "Kawasan Industri Gedebage Blok C2",
    city: "Bandung",
    totalSaung: 0,
    totalMeja: 0,
    taxRatePct: 0,
    serviceChargePct: 0,
    phone: "022-7890123",
    status: "Dapur Pusat",
    managerName: "Chef Cecep Buncit",
    isCentralKitchen: true,
    operatingHours: "06:00 - 18:00",
    targetMonthlyOmset: 0
  }
];

export const INITIAL_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: "trf-1",
    transferNumber: "TRF-20260809-001",
    fromOutletId: "out-4",
    fromOutletName: "Central Kitchen Gedebage",
    toOutletId: "out-1",
    toOutletName: "Branch Dago",
    requestDate: "2026-08-09 08:30",
    shippedDate: "2026-08-09 09:15",
    requestedBy: "Asep Sunandar",
    status: "In Transit",
    driverName: "Mang Ujang (Kurir L300)",
    totalCost: 3250000,
    notes: "Pengiriman bumbu ungkep ayam kampung & ikan gurame hidup segar",
    items: [
      { itemId: "inv-1", itemName: "Ikan Gurame Hidup", unit: "kg", qty: 25, costPerUnit: 45000 },
      { itemId: "inv-2", itemName: "Beras Pandanwangi Super", unit: "kg", qty: 100, costPerUnit: 14000 },
      { itemId: "inv-3", itemName: "Bumbu Ungkep Ayam Sunda", unit: "kg", qty: 15, costPerUnit: 48000 }
    ]
  },
  {
    id: "trf-2",
    transferNumber: "TRF-20260808-002",
    fromOutletId: "out-4",
    fromOutletName: "Central Kitchen Gedebage",
    toOutletId: "out-2",
    toOutletName: "Branch Bogor Lesehan",
    requestDate: "2026-08-08 10:00",
    shippedDate: "2026-08-08 11:00",
    receivedDate: "2026-08-08 15:30",
    requestedBy: "Dewi Lestari",
    status: "Received",
    driverName: "Asep Ekspedisi Box",
    totalCost: 4800000,
    notes: "Stok mingguan bumbu racik & teh poci khas sunda",
    items: [
      { itemId: "inv-4", itemName: "Sambal Terasi Sunda Racik", unit: "kg", qty: 30, costPerUnit: 35000 },
      { itemId: "inv-5", itemName: "Teh Cap Botol Poci", unit: "pack", qty: 50, costPerUnit: 25000 },
      { itemId: "inv-6", itemName: "Minyak Goreng Kelapa", unit: "liter", qty: 100, costPerUnit: 25000 }
    ]
  },
  {
    id: "trf-3",
    transferNumber: "TRF-20260809-003",
    fromOutletId: "out-1",
    fromOutletName: "Branch Dago",
    toOutletId: "out-3",
    toOutletName: "Branch Serpong",
    requestDate: "2026-08-09 11:00",
    requestedBy: "Budi Santoso",
    status: "Pending",
    totalCost: 1200000,
    notes: "Permintaan transfer darurat daun pisang & arang briket karena lonjakan event",
    items: [
      { itemId: "inv-7", itemName: "Daun Pisang Batu Segar", unit: "ikat", qty: 40, costPerUnit: 15000 },
      { itemId: "inv-8", itemName: "Arang Batok Kelapa", unit: "karung", qty: 10, costPerUnit: 60000 }
    ]
  }
];

export const INITIAL_OUTLET_ACCESS: OutletAccessControl[] = [
  {
    employeeId: "emp-1",
    employeeName: "Pak H. Mulyana",
    role: "Owner",
    primaryOutletId: "out-1",
    primaryOutletName: "Branch Dago",
    accessibleOutletIds: ["out-1", "out-2", "out-3", "out-4"],
    canCrossOutletTransfer: true,
    canViewConsolidatedReports: true,
    canManageOutlets: true
  },
  {
    employeeId: "emp-2",
    employeeName: "Asep Sunandar",
    role: "Manager",
    primaryOutletId: "out-1",
    primaryOutletName: "Branch Dago",
    accessibleOutletIds: ["out-1", "out-4"],
    canCrossOutletTransfer: true,
    canViewConsolidatedReports: false,
    canManageOutlets: false
  },
  {
    employeeId: "emp-3",
    employeeName: "Siti Rahma",
    role: "Kasir",
    primaryOutletId: "out-1",
    primaryOutletName: "Branch Dago",
    accessibleOutletIds: ["out-1"],
    canCrossOutletTransfer: false,
    canViewConsolidatedReports: false,
    canManageOutlets: false
  },
  {
    employeeId: "emp-4",
    employeeName: "Dewi Lestari",
    role: "Manager",
    primaryOutletId: "out-2",
    primaryOutletName: "Branch Bogor Lesehan",
    accessibleOutletIds: ["out-2", "out-4"],
    canCrossOutletTransfer: true,
    canViewConsolidatedReports: false,
    canManageOutlets: false
  },
  {
    employeeId: "emp-5",
    employeeName: "Chef Cecep Buncit",
    role: "Manager",
    primaryOutletId: "out-4",
    primaryOutletName: "Central Kitchen Gedebage",
    accessibleOutletIds: ["out-1", "out-2", "out-3", "out-4"],
    canCrossOutletTransfer: true,
    canViewConsolidatedReports: true,
    canManageOutlets: false
  }
];

export const INITIAL_MENU: MenuItem[] = [
  {
    id: "m-1",
    name: "Paket Nasi Liwet Kastrol Komplit",
    category: "Nasi Liwet",
    price: 48000,
    costHPP: 18500,
    description: "Nasi liwet gurih khas Sunda dengan campuran teri medan, pete goreng, tahu & tempe bacem, serta ayam goreng lengkuas dan lalapan segar.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true,
    recipe: [
      { ingredientId: "inv-1", name: "Beras Cianjur", qtyNeeded: 150, unit: "gram", costPerUnit: 15 },
      { ingredientId: "inv-4", name: "Teri Medan", qtyNeeded: 25, unit: "gram", costPerUnit: 80 },
      { ingredientId: "inv-5", name: "Pete Segar", qtyNeeded: 20, unit: "gram", costPerUnit: 100 },
      { ingredientId: "inv-2", name: "Daging Ayam Segar", qtyNeeded: 180, unit: "gram", costPerUnit: 45 }
    ]
  },
  {
    id: "m-2",
    name: "Nasi Timbel Komplit Ayam Bakar",
    category: "Nasi Timbel",
    price: 45000,
    costHPP: 16800,
    description: "Nasi hangat dibungkus daun pisang beraroma wangi, disajikan dengan ayam bakar kecap, empal sapi, sayur asem, tahu tempe, dan sambal terasi.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true,
    recipe: [
      { ingredientId: "inv-1", name: "Beras Cianjur", qtyNeeded: 150, unit: "gram", costPerUnit: 15 },
      { ingredientId: "inv-6", name: "Daun Pisang", qtyNeeded: 1, unit: "lembar", costPerUnit: 500 },
      { ingredientId: "inv-2", name: "Daging Ayam Segar", qtyNeeded: 180, unit: "gram", costPerUnit: 45 }
    ]
  },
  {
    id: "m-2b",
    name: "Nasi Timbel Tutug Oncom Tasik",
    category: "Nasi Timbel",
    price: 38000,
    costHPP: 14000,
    description: "Nasi timbel dibakar daun pisang dicampur dengan oncom sangrai harum kencur, disajikan dengan ayam goreng renyah dan sambal terasi.",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: false
  },
  {
    id: "m-3",
    name: "Gurame Bakar Kecap Pasundan (600g)",
    category: "Olahan Ikan",
    price: 78000,
    costHPP: 32000,
    description: "Ikan gurame hidup pilihan dibakar dengan bumbu kecap rempah asam manis khas Sunda, disajikan dengan sambal kecap cabai rawit dan jeruk limau.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true,
    recipe: [
      { ingredientId: "inv-3", name: "Ikan Gurame Segar", qtyNeeded: 600, unit: "gram", costPerUnit: 48 }
    ]
  },
  {
    id: "m-4",
    name: "Gurame Goreng Terbang Sambal Dadak",
    category: "Olahan Ikan",
    price: 82000,
    costHPP: 34000,
    description: "Ikan gurame segar dipotong gaya mekar terbang, digoreng garing renyah sampai tulang, disajikan dadakan bersama sambal terasi ulek segar.",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true,
    recipe: [
      { ingredientId: "inv-3", name: "Ikan Gurame Segar", qtyNeeded: 600, unit: "gram", costPerUnit: 48 }
    ]
  },
  {
    id: "m-4b",
    name: "Ikan Nila Cobek Hijau Parahyangan",
    category: "Olahan Ikan",
    price: 36000,
    costHPP: 14500,
    description: "Ikan nila goreng garing disiram bumbu cobek cabai hijau ulek kencur dan jeruk purut yang menyegarkan.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-5",
    name: "Ayam Goreng Lengkuas Kampung",
    category: "Ayam & Bebek",
    price: 32000,
    costHPP: 13500,
    description: "Ayam kampung muda diungkep bumbu kuning dan kremes renyah serundeng lengkuas khas Parahyangan.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    recipe: [
      { ingredientId: "inv-2", name: "Daging Ayam Segar", qtyNeeded: 200, unit: "gram", costPerUnit: 45 }
    ]
  },
  {
    id: "m-5b",
    name: "Ayam Bakar Bekakak Utuh (1 Ekor)",
    category: "Ayam & Bebek",
    price: 95000,
    costHPP: 42000,
    description: "Ayam utuh bekakak dibakar bumbu rempah manis gurih khas hajatan Sunda, porsi besar untuk 3-4 orang.",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true
  },
  {
    id: "m-6",
    name: "Bebek Goreng Sambal Goang Hijau",
    category: "Ayam & Bebek",
    price: 42000,
    costHPP: 17800,
    description: "Daging bebek ungkep empuk gurih dengan lapisan renyah luar, disiram sambal goang cabai hijau ulek pedas menyegarkan.",
    image: "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-pepes1",
    name: "Pepes Ikan Mas Duri Lunak",
    category: "Pepes Khas Sunda",
    price: 35000,
    costHPP: 15000,
    description: "Ikan mas dipepes dengan bumbu kemiri, kunyit, daun kemangi, dan serai di dalam bungkus daun pisang, dikukus hingga durinya lunak.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true
  },
  {
    id: "m-pepes2",
    name: "Pepes Tahu Jamur Daun Kemangi",
    category: "Pepes Khas Sunda",
    price: 18000,
    costHPP: 6000,
    description: "Tahu sutera dan jamur merang ditumbuk bumbu rempah dan kemangi wangi, dibakar harum di atas arang.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-7",
    name: "Tumis Kangkung Oncom Bumbu Terasi",
    category: "Tumisan & Cah",
    price: 22000,
    costHPP: 7200,
    description: "Kangkung segar ditumis cepat dengan potongan oncom Bandung pedas beraroma terasi bakar harum.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-7b",
    name: "Tumis Genjer Oncom Pedas",
    category: "Tumisan & Cah",
    price: 20000,
    costHPP: 6500,
    description: "Sayur genjer segar garing ditumis dengan bumbu oncom halus dan cabai rawit.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-8",
    name: "Sayur Asem Pasundan Mangkok",
    category: "Sayuran & Sup",
    price: 18000,
    costHPP: 5500,
    description: "Sayur asem manis hangat beraroma asam jawa segar dengan jagung manis, labu siam, daun melinjo, dan kacang tanah.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-8b",
    name: "Sop Buntut Sapi Kuah Bening",
    category: "Sayuran & Sup",
    price: 65000,
    costHPP: 28000,
    description: "Buntut sapi empuk dipadu kuah bening kaya pala dan cengkeh harum, disajikan dengan wortel, kentang, dan emping garing.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-9",
    name: "Sambal Dadak Terasi Limau",
    category: "Sambal Khas Sunda",
    price: 12000,
    costHPP: 3200,
    description: "Sambal mentah diulek dadakan saat ada pesanan dari cabai rawit merah segar, terasi bakar, dan perasan jeruk limau segar.",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true
  },
  {
    id: "m-10",
    name: "Sambal Leunca Oncom Bakar (Ulukutek)",
    category: "Sambal Khas Sunda",
    price: 14000,
    costHPP: 4000,
    description: "Sambal Ulukutek leunca segar ditumbuk bersama oncom sangrai harum dan kencur aromatik.",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-lalapan",
    name: "Paket Lalapan Segar Parahyangan",
    category: "Lalapan Segar",
    price: 15000,
    costHPP: 4500,
    description: "Aneka lalap mentah segar lengkap: Daun popohan, kemangi, terong bulat, timun lokal, kacang panjang, dan pete segar.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true
  },
  {
    id: "m-paket1",
    name: "Paket Sawarga Rombongan (4 Pax)",
    category: "Paket Menu Komplit",
    price: 245000,
    costHPP: 98000,
    description: "1 Kastrol Nasi Liwet, 1 Gurame Bakar, 4 Ayam Goreng Lengkuas, 1 Sayur Asem, 1 Sambal Dadak, 1 Cobek Lalap, & 4 Es Teh Jumbo.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true
  },
  {
    id: "m-11",
    name: "Es Kelapa Muda Batok Utuh",
    category: "Minuman & Es",
    price: 25000,
    costHPP: 9000,
    description: "Kelapa muda segar disajikan utuh di dalam batoknya, manis alami disajikan dengan es batu kristal dan sirup gula merah.",
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    isPopular: true
  },
  {
    id: "m-12",
    name: "Es Teh Manis Jumbo Poci",
    category: "Minuman & Es",
    price: 10000,
    costHPP: 2500,
    description: "Teh tubruk harum melati seduhan poci tanah liat tradisional disajikan dalam gelas jumbo dingin menyegarkan.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  },
  {
    id: "m-13",
    name: "Surabi Kencana Kuah Kinca Duren",
    category: "Camilan & Penutup",
    price: 24000,
    costHPP: 8500,
    description: "Kue surabi hangat lembut berbahan tepung beras dan santan gurih dipanggang di atas cetakan gerabah, disiram saus kinca durian asli.",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80",
    isAvailable: true
  }
];

export const INITIAL_TABLES: TableSaung[] = [
  { id: "s-1", code: "Saung 01", type: "Saung Lesehan", capacity: 8, status: "Occupied", currentOrderId: "ORD-001", customerName: "Kel. Bpk. Agus", timeSeated: "12:15 WIB" },
  { id: "s-2", code: "Saung 02", type: "Saung Lesehan", capacity: 6, status: "Cooking", currentOrderId: "ORD-002", customerName: "Rombongan Ibu Rina", timeSeated: "12:30 WIB" },
  { id: "s-3", code: "Saung 03", type: "Saung Lesehan", capacity: 10, status: "Available" },
  { id: "s-4", code: "Saung 04", type: "Saung Lesehan", capacity: 8, status: "BillRequested", currentOrderId: "ORD-003", customerName: "Pak Hendra (Kantor)", timeSeated: "11:45 WIB" },
  { id: "s-5", code: "Saung 05", type: "Saung Lesehan", capacity: 12, status: "Reserved", customerName: "Acara Reuni SMA 3", timeSeated: "14:00 WIB" },
  { id: "s-6", code: "Saung 06", type: "Saung Lesehan", capacity: 6, status: "Available" },
  { id: "m-1", code: "Meja VIP 01", type: "Meja VIP", capacity: 4, status: "Occupied", currentOrderId: "ORD-004", customerName: "Bpk. Direktur Ahmad", timeSeated: "12:40 WIB" },
  { id: "m-2", code: "Meja VIP 02", type: "Meja VIP", capacity: 4, status: "Available" },
  { id: "t-1", code: "Meja Lesehan 01", type: "Meja Utama", capacity: 4, status: "Available" },
  { id: "t-2", code: "Meja Lesehan 02", type: "Meja Utama", capacity: 4, status: "Available" },
  { id: "out-1", code: "Outdoor 01", type: "Outdoor", capacity: 6, status: "Available" },
  { id: "out-2", code: "Outdoor 02", type: "Outdoor", capacity: 6, status: "Available" }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-001",
    orderNumber: "SND-20260809-001",
    outletId: "out-1",
    tableCode: "Saung 01",
    customerName: "Kel. Bpk. Agus",
    paxCount: 6,
    priority: "Normal",
    estimatedPrepTimeMins: 15,
    createdAtTimestamp: Date.now() - 35 * 60 * 1000, // 35 min ago
    items: [
      { id: "oi-1", menuId: "m-1", menuName: "Paket Nasi Liwet Kastrol Komplit", category: "Nasi & Paket Liwet", price: 48000, costHPP: 18500, qty: 2, note: "Pedes sedang, pete terpisah", kitchenStatus: "Served", kitchenStation: "Dapur Tumis & Nasi" },
      { id: "oi-2", menuId: "m-3", menuName: "Gurame Bakar Kecap Pasundan (600g)", category: "Olahan Gurame & Nila", price: 78000, costHPP: 32000, qty: 1, note: "Ekstra bumbu olesan", kitchenStatus: "Served", kitchenStation: "Dapur Bakar/Goreng" },
      { id: "oi-3", menuId: "m-11", menuName: "Es Kelapa Muda Batok Utuh", category: "Minuman & Es", price: 25000, costHPP: 9000, qty: 4, note: "Gula merah terpisah", kitchenStatus: "Served", kitchenStation: "Bar Minuman" }
    ],
    subtotal: 274000,
    taxPB1: 27400,
    serviceCharge: 13700,
    discount: 0,
    total: 315100,
    status: "Served",
    paymentStatus: "Unpaid",
    createdAt: "12:15 WIB",
    cashierName: "Siti Rahma"
  },
  {
    id: "ORD-002",
    orderNumber: "SND-20260809-002",
    outletId: "out-1",
    tableCode: "Saung 02",
    customerName: "Rombongan Ibu Rina",
    paxCount: 5,
    priority: "Mendesak/Tinggi",
    estimatedPrepTimeMins: 15,
    createdAtTimestamp: Date.now() - 18 * 60 * 1000, // 18 min ago (warning/overdue)
    items: [
      { id: "oi-4", menuId: "m-2", menuName: "Nasi Timbel Komplit Ayam Bakar", category: "Nasi & Paket Liwet", price: 45000, costHPP: 16800, qty: 3, note: "Nasi hangat pulen", kitchenStatus: "Cooking", kitchenStation: "Dapur Tumis & Nasi" },
      { id: "oi-5", menuId: "m-4", menuName: "Gurame Goreng Terbang Sambal Dadak", category: "Olahan Gurame & Nila", price: 82000, costHPP: 34000, qty: 1, note: "Garing renyah banget", kitchenStatus: "Cooking", kitchenStation: "Dapur Bakar/Goreng" },
      { id: "oi-6", menuId: "m-12", menuName: "Es Teh Manis Jumbo Poci", category: "Minuman & Es", price: 10000, costHPP: 2500, qty: 5, note: "Es sedikit", kitchenStatus: "Ready", kitchenStation: "Bar Minuman" }
    ],
    subtotal: 267000,
    taxPB1: 26700,
    serviceCharge: 13350,
    discount: 0,
    total: 307050,
    status: "InKitchen",
    paymentStatus: "Unpaid",
    createdAt: "12:30 WIB",
    cashierName: "Asep Sunandar"
  },
  {
    id: "ORD-003",
    orderNumber: "SND-20260809-003",
    outletId: "out-1",
    tableCode: "Meja VIP 01",
    customerName: "Bpk. Direktur Ahmad (VIP)",
    paxCount: 4,
    priority: "VIP Saung",
    estimatedPrepTimeMins: 12,
    createdAtTimestamp: Date.now() - 8 * 60 * 1000, // 8 min ago
    items: [
      { id: "oi-7", menuId: "m-paket1", menuName: "Paket Sawarga Rombongan (4 Pax)", category: "Paket Menu Komplit", price: 245000, costHPP: 98000, qty: 1, note: "Sambal dadak super pedas, kastrol liwet panas", kitchenStatus: "Cooking", kitchenStation: "Dapur Tumis & Nasi" },
      { id: "oi-8", menuId: "m-13", menuName: "Surabi Kencana Kuah Kinca Duren", category: "Camilan & Penutup", price: 24000, costHPP: 8500, qty: 2, note: "Servis setelah makan utama", kitchenStatus: "Queued", kitchenStation: "Bar Minuman" },
      { id: "oi-9", menuId: "m-11", menuName: "Es Kelapa Muda Batok Utuh", category: "Minuman & Es", price: 25000, costHPP: 9000, qty: 4, note: "Kelapa muda kerok halus", kitchenStatus: "Ready", kitchenStation: "Bar Minuman" }
    ],
    subtotal: 319000,
    taxPB1: 31900,
    serviceCharge: 15950,
    discount: 0,
    total: 366850,
    status: "InKitchen",
    paymentStatus: "Unpaid",
    createdAt: "12:40 WIB",
    cashierName: "Siti Rahma"
  },
  {
    id: "ORD-004",
    orderNumber: "SND-20260809-004",
    outletId: "out-1",
    tableCode: "Saung 04",
    customerName: "Pak Hendra (Kantor)",
    paxCount: 8,
    priority: "Normal",
    estimatedPrepTimeMins: 15,
    createdAtTimestamp: Date.now() - 3 * 60 * 1000, // 3 min ago (Queue)
    items: [
      { id: "oi-10", menuId: "m-3", menuName: "Gurame Bakar Kecap Pasundan (600g)", category: "Olahan Gurame & Nila", price: 78000, costHPP: 32000, qty: 2, note: "1 manis kecap, 1 rica pedas", kitchenStatus: "Queued", kitchenStation: "Dapur Bakar/Goreng" },
      { id: "oi-11", menuId: "m-5", menuName: "Ayam Goreng Lengkuas Kampung", category: "Ayam & Bebek", price: 32000, costHPP: 13500, qty: 4, note: "Banyakin serundeng lengkuas", kitchenStatus: "Queued", kitchenStation: "Dapur Bakar/Goreng" },
      { id: "oi-12", menuId: "m-10", menuName: "Sambal Leunca Oncom Bakar (Ulukutek)", category: "Sambal Khas Sunda", price: 14000, costHPP: 4000, qty: 2, note: "Level pedas 3", kitchenStatus: "Queued", kitchenStation: "Dapur Tumis & Nasi" }
    ],
    subtotal: 312000,
    taxPB1: 31200,
    serviceCharge: 15600,
    discount: 0,
    total: 358800,
    status: "InKitchen",
    paymentStatus: "Unpaid",
    createdAt: "12:45 WIB",
    cashierName: "Asep Sunandar"
  },
  {
    id: "ORD-005",
    orderNumber: "SND-20260809-005",
    outletId: "out-1",
    tableCode: "Outdoor 01",
    customerName: "Kak Maya & Teman",
    paxCount: 3,
    priority: "Normal",
    estimatedPrepTimeMins: 15,
    createdAtTimestamp: Date.now() - 12 * 60 * 1000, // 12 min ago
    items: [
      { id: "oi-13", menuId: "m-2b", menuName: "Nasi Timbel Tutug Oncom Tasik", category: "Nasi & Paket Liwet", price: 38000, costHPP: 14000, qty: 3, note: "Oncom garing", kitchenStatus: "Cooking", kitchenStation: "Dapur Tumis & Nasi" },
      { id: "oi-14", menuId: "m-4b", menuName: "Ikan Nila Cobek Hijau Parahyangan", category: "Olahan Gurame & Nila", price: 36000, costHPP: 14500, qty: 1, note: "Cabai hijau extra kencur", kitchenStatus: "Cooking", kitchenStation: "Dapur Bakar/Goreng" },
      { id: "oi-15", menuId: "m-12", menuName: "Es Teh Manis Jumbo Poci", category: "Minuman & Es", price: 10000, costHPP: 2500, qty: 3, note: "", kitchenStatus: "Ready", kitchenStation: "Bar Minuman" }
    ],
    subtotal: 180000,
    taxPB1: 18000,
    serviceCharge: 9000,
    discount: 0,
    total: 207000,
    status: "InKitchen",
    paymentStatus: "Unpaid",
    createdAt: "12:36 WIB",
    cashierName: "Siti Rahma"
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Beras Cianjur Pandan Wangi", category: "Beras & Biji", currentStock: 85, minStockAlert: 20, unit: "kg", avgCostPerUnit: 15000, lastRestocked: "2026-08-07", supplierName: "Distributor Beras Priangan" },
  { id: "inv-2", name: "Daging Ayam Kampung Segar", category: "Bahan Basah", currentStock: 24, minStockAlert: 10, unit: "kg", avgCostPerUnit: 45000, lastRestocked: "2026-08-08", supplierName: "Peternakan Pasundan" },
  { id: "inv-3", name: "Ikan Gurame Hidup (500-700g)", category: "Bahan Basah", currentStock: 18, minStockAlert: 12, unit: "kg", avgCostPerUnit: 48000, lastRestocked: "2026-08-08", supplierName: "Tambak Gurame Waduk Cirata" },
  { id: "inv-4", name: "Teri Medan Grade A", category: "Bahan Basah", currentStock: 8, minStockAlert: 3, unit: "kg", avgCostPerUnit: 80000, lastRestocked: "2026-08-05", supplierName: "Toko Bahan Sembako Dago" },
  { id: "inv-5", name: "Pete Segar Papan", category: "Sayuran & Lalapan", currentStock: 15, minStockAlert: 5, unit: "papan", avgCostPerUnit: 10000, lastRestocked: "2026-08-08", supplierName: "Pasar Pasar Baru Bandung" },
  { id: "inv-6", name: "Daun Pisang Pembungkus", category: "Kemasan", currentStock: 120, minStockAlert: 30, unit: "ikat", avgCostPerUnit: 500, lastRestocked: "2026-08-08", supplierName: "Petani Lokal Lembang" },
  { id: "inv-7", name: "Cabai Rawit Merah Segar", category: "Sayuran & Lalapan", currentStock: 4, minStockAlert: 5, unit: "kg", avgCostPerUnit: 65000, lastRestocked: "2026-08-07", supplierName: "Pasar Induk Caringin" },
  { id: "inv-8", name: "Minyak Goreng Sawit", category: "Bumbu & Rempah", currentStock: 35, minStockAlert: 15, unit: "liter", avgCostPerUnit: 16000, lastRestocked: "2026-08-06", supplierName: "Grosir Sembako Jaya" }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Distributor Beras Priangan",
    category: "Beras & Sembako",
    phone: "+62 812-3456-7890",
    email: "priangan.beras@supplier.id",
    address: "Jl. Raya Cianjur No. 45, Bandung",
    leadTimeDays: 2,
    paymentTermDays: 14,
    bankAccount: "BCA 8830123999 a.n PT Priangan Pangan",
    contactPerson: "Bpk. H. Cecep"
  },
  {
    id: "sup-2",
    name: "Peternakan Pasundan",
    category: "Ayam & Daging",
    phone: "+62 813-9876-5432",
    email: "order@pasundanfarm.com",
    address: "Jl. Lembang Asri Km 3, Lembang",
    leadTimeDays: 1,
    paymentTermDays: 7,
    bankAccount: "Mandiri 131000998877 a.n Pasundan Farm",
    contactPerson: "Ibu Imas"
  },
  {
    id: "sup-3",
    name: "Tambak Gurame Waduk Cirata",
    category: "Ikan Segar",
    phone: "+62 811-2233-4455",
    email: "cirata.fish@gmail.com",
    address: "Dermaga Cirata Blok B-12, Purwakarta",
    leadTimeDays: 1,
    paymentTermDays: 14,
    bankAccount: "BRI 002301992288 a.n H. Maman Cirata",
    contactPerson: "Kang Atep"
  },
  {
    id: "sup-4",
    name: "Pasar Induk Caringin",
    category: "Sayuran & Bumbu",
    phone: "+62 857-1122-3344",
    email: "caringin.sayur@gmail.com",
    address: "Pasar Induk Caringin Los A-21, Bandung",
    leadTimeDays: 1,
    paymentTermDays: 0, // Cash
    bankAccount: "BCA 7720192837 a.n Mang Ujang",
    contactPerson: "Mang Ujang"
  }
];

export const INITIAL_PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: "pr-1",
    prNumber: "PR-202608-001",
    requestedBy: "Chef Dadang (Head Chef)",
    department: "Dapur Utama",
    requestDate: "2026-08-08",
    priority: "Urgent",
    status: "Approved",
    items: [
      { itemId: "inv-7", itemName: "Cabai Rawit Merah Segar", unit: "kg", qtyRequested: 10, estimatedCost: 65000 },
      { itemId: "inv-2", itemName: "Daging Ayam Kampung Segar", unit: "kg", qtyRequested: 20, estimatedCost: 45000 }
    ],
    totalEstimatedAmount: 1550000,
    notes: "Stok cabai rawit kritis tinggal 4kg, akhir pekan rame rombongan."
  },
  {
    id: "pr-2",
    prNumber: "PR-202608-002",
    requestedBy: "Teh Euis (Manager Gudang)",
    department: "Gudang Sembako",
    requestDate: "2026-08-09",
    priority: "Normal",
    status: "Pending Approval",
    items: [
      { itemId: "inv-1", itemName: "Beras Cianjur Pandan Wangi", unit: "kg", qtyRequested: 100, estimatedCost: 15000 },
      { itemId: "inv-8", itemName: "Minyak Goreng Sawit", unit: "liter", qtyRequested: 50, estimatedCost: 16000 }
    ],
    totalEstimatedAmount: 2300000,
    notes: "Restock mingguan beras & minyak goreng dapur."
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-202608-001",
    prNumber: "PR-202608-001",
    supplierId: "sup-2",
    supplierName: "Peternakan Pasundan",
    orderDate: "2026-08-08",
    expectedDelivery: "2026-08-09",
    status: "Completed",
    items: [
      { itemId: "inv-2", itemName: "Daging Ayam Kampung Segar", unit: "kg", qtyOrdered: 20, pricePerUnit: 45000, totalPrice: 900000 }
    ],
    totalAmount: 900000,
    paymentTerm: "TOP 7 Hari",
    notes: "Kirim pagi sebelum jam 08.00 WIB"
  },
  {
    id: "po-2",
    poNumber: "PO-202608-002",
    supplierId: "sup-3",
    supplierName: "Tambak Gurame Waduk Cirata",
    orderDate: "2026-08-08",
    expectedDelivery: "2026-08-09",
    status: "Sent",
    items: [
      { itemId: "inv-3", itemName: "Ikan Gurame Hidup (500-700g)", unit: "kg", qtyOrdered: 25, pricePerUnit: 48000, totalPrice: 1200000 }
    ],
    totalAmount: 1200000,
    paymentTerm: "TOP 14 Hari",
    notes: "Pastikan ikan hidup dalam kerek air oxigen."
  }
];

export const INITIAL_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: "grn-1",
    grnNumber: "GRN-202608-001",
    poId: "po-1",
    poNumber: "PO-202608-001",
    supplierName: "Peternakan Pasundan",
    receiveDate: "2026-08-09 07:30 WIB",
    receivedBy: "Teh Euis (Gudang)",
    supplierSuratJalan: "SJ-PAS-8812",
    items: [
      { itemId: "inv-2", itemName: "Daging Ayam Kampung Segar", unit: "kg", qtyOrdered: 20, qtyReceived: 20, pricePerUnit: 45000, batchNumber: "BAT-AYM-0809", expiredDate: "2026-08-12" }
    ],
    totalAmountReceived: 900000,
    notes: "Ayam segar utuh sudah dipotong 4 bagian per kg."
  }
];

export const INITIAL_SUPPLIER_INVOICES: SupplierInvoice[] = [
  {
    id: "inv-sp-1",
    invoiceNumber: "INV-SUP-202608-001",
    supplierInvoiceRef: "INV/PAS/2026/08/102",
    poNumber: "PO-202608-001",
    grnNumber: "GRN-202608-001",
    supplierId: "sup-2",
    supplierName: "Peternakan Pasundan",
    invoiceDate: "2026-08-09",
    dueDate: "2026-08-16",
    totalAmount: 900000,
    paidAmount: 300000,
    remainingBalance: 600000,
    status: "Lunas Sebagian",
    payments: [
      {
        id: "pay-1",
        paymentDate: "2026-08-09",
        amount: 300000,
        paymentMethod: "Transfer Bank BCA",
        referenceNumber: "TRX-BCA-99210",
        notes: "Uang muka DP pengiriman ayam"
      }
    ]
  },
  {
    id: "inv-sp-2",
    invoiceNumber: "INV-SUP-202608-002",
    supplierInvoiceRef: "INV/PRI/2026/08/044",
    poNumber: "PO-202608-000",
    grnNumber: "GRN-202608-000",
    supplierId: "sup-1",
    supplierName: "Distributor Beras Priangan",
    invoiceDate: "2026-07-25",
    dueDate: "2026-08-08",
    totalAmount: 2250000,
    paidAmount: 0,
    remainingBalance: 2250000,
    status: "Jatuh Tempo",
    payments: []
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Bapak Haji Ridwan Sutisna",
    phone: "0812-3456-7890",
    email: "ridwan.sutisna@gmail.com",
    membershipTier: "Platinum",
    points: 1250,
    totalSpent: 18500000,
    visitCount: 24,
    joinDate: "2025-01-15",
    lastVisit: "2026-08-08",
    segment: "VIP Loyalist",
    preferences: {
      favoriteSaungType: "Saung Lesehan VIP",
      favoriteDish: "Paket Gurame Terbang Bumbu Cobek",
      spicinessLevel: "Sangat Pedas",
      dietaryNote: "Suka petai bakar dan lalapan kemangi ekstra melimpah. Tanpa perasa buatan.",
      specialDates: [
        { label: "Ulang Tahun", date: "10 September" },
        { label: "Anniversary Pernikahan", date: "22 November" }
      ]
    },
    transactionHistory: [
      {
        orderId: "ORD-8801",
        date: "2026-08-08 19:30",
        total: 1250000,
        itemsSummary: "Paket Gurame Cobek (2x), Liwet Castrol (2x), Es Kelapa Muda (6x), Ayam Bakar Taliwang",
        pointsEarned: 125
      },
      {
        orderId: "ORD-8620",
        date: "2026-07-28 13:15",
        total: 980000,
        itemsSummary: "Nasi Liwet Sunda Castrol, Nila Goreng Kipas, Sambal Dadak Terasi, Es Cincau",
        pointsEarned: 98
      }
    ],
    notes: "Direktur PT Priangan Utama. Sering membawa rombongan keluarga besar saat akhir pekan."
  },
  {
    id: "cust-2",
    name: "Ibu Dr. Ratna Juwita",
    phone: "0818-0987-6543",
    email: "ratna.juwita@unpad.ac.id",
    membershipTier: "Gold",
    points: 680,
    totalSpent: 8200000,
    visitCount: 12,
    joinDate: "2025-04-10",
    lastVisit: "2026-08-05",
    segment: "High Spender",
    preferences: {
      favoriteSaungType: "Saung Lesehan 03",
      favoriteDish: "Nasi Timbel Komplit Ayam Kampung",
      spicinessLevel: "Sedang",
      dietaryNote: "Rendah garam / kurangi micin, es dawet manis sedang.",
      specialDates: [
        { label: "Ulang Tahun", date: "04 Maret" }
      ]
    },
    transactionHistory: [
      {
        orderId: "ORD-8712",
        date: "2026-08-05 12:45",
        total: 620000,
        itemsSummary: "Nasi Timbel Ayam Kampung (4x), Sayur Asem, Pepes Ikan Mas, Es Dawet Ayu",
        pointsEarned: 62
      }
    ],
    notes: "Suka tempat di pinggir kolam ikan saung leseh."
  },
  {
    id: "cust-3",
    name: "Kang Cecep Firmansyah",
    phone: "0857-1122-3344",
    email: "cecep.firmansyah@yahoo.co.id",
    membershipTier: "Silver",
    points: 340,
    totalSpent: 3900000,
    visitCount: 8,
    joinDate: "2025-08-20",
    lastVisit: "2026-08-01",
    segment: "Frequent Diner",
    preferences: {
      favoriteSaungType: "Meja Utama 05",
      favoriteDish: "Ayam Bakar Bumbu Rujak",
      spicinessLevel: "Sangat Pedas",
      dietaryNote: "Sambal dadak minta limau dikuti 2 biji.",
      specialDates: [
        { label: "Ulang Tahun", date: "18 Mei" }
      ]
    },
    transactionHistory: [
      {
        orderId: "ORD-8501",
        date: "2026-08-01 18:20",
        total: 350000,
        itemsSummary: "Ayam Bakar Bumbu Rujak (2x), Nasi Liwet, Kangkung Oncom, Es Jeruk",
        pointsEarned: 35
      }
    ]
  },
  {
    id: "cust-4",
    name: "Keluarga Besar Bpk Hendra",
    phone: "0813-8899-7766",
    email: "hendra.family@gmail.com",
    membershipTier: "Gold",
    points: 890,
    totalSpent: 11400000,
    visitCount: 9,
    joinDate: "2025-03-01",
    lastVisit: "2026-07-20",
    segment: "Big Family Gathering",
    preferences: {
      favoriteSaungType: "Saung Lesehan 01 (Lesehan Besar)",
      favoriteDish: "Nasi Liwet Sunda Castrol Komplit",
      spicinessLevel: "Sedang",
      dietaryNote: "Ada balita, minta krupuk kaleng & sendok anak.",
      specialDates: [
        { label: "Anniversary", date: "15 Agustus" }
      ]
    },
    transactionHistory: [
      {
        orderId: "ORD-8200",
        date: "2026-07-20 12:30",
        total: 1450000,
        itemsSummary: "Nasi Liwet Castrol Jumbo, Gurame Terbang (2x), Sop Buntut, Es Kelapa Batok (8x)",
        pointsEarned: 145
      }
    ],
    notes: "Selalu booking saung 1 minggu sebelum acara reuni keluarga."
  },
  {
    id: "cust-5",
    name: "Teh Maya Rosdiana",
    phone: "0821-4455-6677",
    email: "maya.rosdiana@outlook.com",
    membershipTier: "Bronze",
    points: 90,
    totalSpent: 950000,
    visitCount: 3,
    joinDate: "2026-02-14",
    lastVisit: "2026-05-10",
    segment: "Risk of Churn",
    preferences: {
      favoriteSaungType: "Meja VIP 02",
      favoriteDish: "Tumis Kangkung Oncom & Pepes Tahu",
      spicinessLevel: "Sedang",
      dietaryNote: "Vegetarian / Sebagian Makan Pepes Tahu",
      specialDates: []
    },
    transactionHistory: [
      {
        orderId: "ORD-7110",
        date: "2026-05-10 13:00",
        total: 280000,
        itemsSummary: "Pepes Tahu Jamur (2x), Tumis Genjer, Teh Poci Garut",
        pointsEarned: 28
      }
    ],
    notes: "Sudah tidak berkunjung lebih dari 90 hari. Perlu penawaran voucher reintegrasi."
  },
  {
    id: "cust-6",
    name: "Rian Hidayat (Mahasiswa Telkom)",
    phone: "0896-1234-5678",
    email: "rian.hidayat@student.telkomuniversity.ac.id",
    membershipTier: "Bronze",
    points: 45,
    totalSpent: 450000,
    visitCount: 2,
    joinDate: "2026-07-01",
    lastVisit: "2026-08-07",
    segment: "New Customer",
    preferences: {
      favoriteSaungType: "Outdoor",
      favoriteDish: "Ayam Goreng Lengkuas + Sambal Dadak",
      spicinessLevel: "Sangat Pedas",
      specialDates: []
    },
    transactionHistory: [
      {
        orderId: "ORD-8790",
        date: "2026-08-07 16:30",
        total: 185000,
        itemsSummary: "Ayam Goreng Lengkuas (2x), Nasi Liwet Porsi, Es Jeruk Purut",
        pointsEarned: 18
      }
    ]
  }
];

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: "vouch-1",
    code: "SUNDA-PLATINUM15",
    title: "Diskon VIP Platinum 15%",
    discountType: "Percent",
    discountValue: 15,
    minSpend: 500000,
    maxDiscount: 150000,
    validUntil: "2026-12-31",
    tierRequired: "Platinum",
    pointsCost: 200,
    description: "Khusus member Platinum. Potongan 15% maksimal Rp 150.000 untuk minimal belanja Rp 500.000."
  },
  {
    id: "vouch-2",
    code: "GURAME-FREE-GOLD",
    title: "Gratis 1 Porsi Gurame Terbang",
    discountType: "FreeItem",
    discountValue: 68000,
    minSpend: 400000,
    validUntil: "2026-09-30",
    tierRequired: "Gold",
    pointsCost: 350,
    freeItemName: "Gurame Terbang Bumbu Cobek",
    description: "Tukarkan 350 Poin untuk menikmati 1 Porsi Gurame Terbang gratis dengan transaksi min. Rp 400rb."
  },
  {
    id: "vouch-3",
    code: "KANGKUNG-FREE",
    title: "Gratis Tumis Kangkung Oncom",
    discountType: "FreeItem",
    discountValue: 22000,
    minSpend: 150000,
    validUntil: "2026-10-15",
    tierRequired: "All",
    pointsCost: 80,
    freeItemName: "Tumis Kangkung Oncom Bumbu Terasi",
    description: "Nikmati Tumis Kangkung Oncom gratis untuk semua member hanya dengan 80 poin!"
  },
  {
    id: "vouch-4",
    code: "CASHBACK-50K",
    title: "Voucher Potongan Rp 50.000",
    discountType: "FixedAmount",
    discountValue: 50000,
    minSpend: 250000,
    validUntil: "2026-11-30",
    tierRequired: "Silver",
    pointsCost: 150,
    description: "Potongan harga langsung Rp 50.000 untuk transaksi minimal Rp 250.000."
  },
  {
    id: "vouch-5",
    code: "ES-KELAPA-BONUS",
    title: "Gratis Es Kelapa Muda Batok",
    discountType: "FreeItem",
    discountValue: 20000,
    minSpend: 100000,
    validUntil: "2026-09-15",
    tierRequired: "All",
    pointsCost: 50,
    freeItemName: "Es Kelapa Muda Segar Batok",
    description: "Penawar dahaga manis gurih alami. Tukarkan 50 Poin."
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: "res-1",
    reservationNumber: "RSV-202608-001",
    customerId: "cust-1",
    customerName: "Bapak Haji Ridwan Sutisna",
    customerPhone: "0812-3456-7890",
    customerEmail: "ridwan.sutisna@gmail.com",
    saungTableId: "s-vip-1",
    saungTableName: "Saung VIP Pasundan",
    reservationDate: "2026-08-09",
    reservationTime: "12:30",
    guestCount: 12,
    depositAmount: 500000,
    depositStatus: "Bebas DP (VIP)",
    depositPaymentMethod: "Transfer Bank",
    notes: "Acara Silaturahmi Keluarga Besar. Minta saung karpet bersih & kipas tambahan.",
    specialRequests: "Pre-order Paket Gurame Cobek (3x), Liwet Castrol Jumbo (2x), Es Kelapa Batok (12x)",
    status: "Terkonfirmasi (DP Lunas)",
    reminderSent: true,
    createdAt: "2026-08-07 10:15"
  },
  {
    id: "res-2",
    reservationNumber: "RSV-202608-002",
    customerId: "cust-2",
    customerName: "Ibu Dr. Ratna Juwita",
    customerPhone: "0818-0987-6543",
    customerEmail: "ratna.juwita@unpad.ac.id",
    saungTableId: "s-lesehan-03",
    saungTableName: "Saung Lesehan 03",
    reservationDate: "2026-08-09",
    reservationTime: "18:00",
    guestCount: 6,
    depositAmount: 200000,
    depositStatus: "DP Lunas",
    depositPaymentMethod: "QRIS BCA",
    notes: "Makan malam reuni dosen Unpad.",
    specialRequests: "Minta saung dekat kolam ikan. Sambal dadak pedas sedang.",
    status: "Terkonfirmasi (DP Lunas)",
    reminderSent: true,
    createdAt: "2026-08-08 14:20"
  },
  {
    id: "res-3",
    reservationNumber: "RSV-202608-003",
    customerId: "cust-4",
    customerName: "Keluarga Besar Bpk Hendra",
    customerPhone: "0813-8899-7766",
    customerEmail: "hendra.family@gmail.com",
    saungTableId: "s-lesehan-01",
    saungTableName: "Saung Lesehan 01 (Utama)",
    reservationDate: "2026-08-10",
    reservationTime: "13:00",
    guestCount: 15,
    depositAmount: 300000,
    depositStatus: "Belum DP",
    notes: "Ulang tahun anak ke-5.",
    specialRequests: "Izin bawa kue ultah sendiri & dekorasi balon ringan.",
    status: "Menunggu DP",
    reminderSent: false,
    createdAt: "2026-08-08 16:45"
  },
  {
    id: "res-4",
    reservationNumber: "RSV-202608-004",
    customerName: "Ibu Ani Wijaya (Walk-in Booking)",
    customerPhone: "0852-9988-7711",
    saungTableId: "m-utama-02",
    saungTableName: "Meja Utama 02",
    reservationDate: "2026-08-11",
    reservationTime: "19:00",
    guestCount: 4,
    depositAmount: 100000,
    depositStatus: "DP Lunas",
    depositPaymentMethod: "Kasir Tunai",
    notes: "Makan malam santai.",
    status: "Terkonfirmasi (DP Lunas)",
    reminderSent: false,
    createdAt: "2026-08-09 09:00"
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    nip: "EMP-2026-001",
    name: "Pak Haji Dadan Supriatna",
    role: "Owner",
    phone: "0811-2233-4455",
    email: "dadan.owner@saungpasundan.id",
    joinDate: "2020-01-01",
    status: "Aktif",
    shift: "Full Day (09:00 - 21:00)",
    baseSalary: 15000000,
    commissionRatePercent: 0,
    pinCode: "9999",
    permissions: {
      canAccessPOS: true,
      canVoidOrder: true,
      canGiveDiscount: true,
      canViewReports: true,
      canManageStock: true,
      canManageEmployees: true,
      canChangeMenuPrice: true,
      canApprovePO: true
    }
  },
  {
    id: "emp-2",
    nip: "EMP-2026-002",
    name: "Ibu Rina Marlina, SE",
    role: "Manager",
    phone: "0812-3344-5566",
    email: "rina.marlina@saungpasundan.id",
    joinDate: "2021-03-15",
    status: "Aktif",
    shift: "Shift Pagi (08:00 - 16:00)",
    baseSalary: 8500000,
    commissionRatePercent: 1.5,
    pinCode: "8888",
    permissions: {
      canAccessPOS: true,
      canVoidOrder: true,
      canGiveDiscount: true,
      canViewReports: true,
      canManageStock: true,
      canManageEmployees: true,
      canChangeMenuPrice: true,
      canApprovePO: true
    }
  },
  {
    id: "emp-3",
    nip: "EMP-2026-003",
    name: "Kang Dedi Kurniawan",
    role: "Supervisor",
    phone: "0813-4455-6677",
    email: "dedi.spv@saungpasundan.id",
    joinDate: "2022-06-01",
    status: "Aktif",
    shift: "Shift Siang/Sore (12:00 - 20:00)",
    baseSalary: 5500000,
    commissionRatePercent: 1.0,
    pinCode: "1234",
    permissions: {
      canAccessPOS: true,
      canVoidOrder: true,
      canGiveDiscount: true,
      canViewReports: true,
      canManageStock: true,
      canManageEmployees: false,
      canChangeMenuPrice: false,
      canApprovePO: false
    }
  },
  {
    id: "emp-4",
    nip: "EMP-2026-004",
    name: "Siti Rahmawati",
    role: "Kasir",
    phone: "0857-1122-3344",
    email: "siti.kasir@saungpasundan.id",
    joinDate: "2023-01-10",
    status: "Aktif",
    shift: "Shift Pagi (08:00 - 16:00)",
    baseSalary: 4200000,
    commissionRatePercent: 0.5,
    pinCode: "2026",
    permissions: {
      canAccessPOS: true,
      canVoidOrder: false,
      canGiveDiscount: false,
      canViewReports: false,
      canManageStock: false,
      canManageEmployees: false,
      canChangeMenuPrice: false,
      canApprovePO: false
    }
  },
  {
    id: "emp-5",
    nip: "EMP-2026-005",
    name: "Asep Sunandar",
    role: "Waiter",
    phone: "0819-8877-6655",
    email: "asep.waiter@saungpasundan.id",
    joinDate: "2023-05-20",
    status: "Aktif",
    shift: "Shift Siang/Sore (12:00 - 20:00)",
    baseSalary: 3800000,
    commissionRatePercent: 2.0,
    pinCode: "5555",
    permissions: {
      canAccessPOS: true,
      canVoidOrder: false,
      canGiveDiscount: false,
      canViewReports: false,
      canManageStock: false,
      canManageEmployees: false,
      canChangeMenuPrice: false,
      canApprovePO: false
    }
  },
  {
    id: "emp-6",
    nip: "EMP-2026-006",
    name: "Chef Mang Ujang",
    role: "Kitchen",
    phone: "0812-9900-1122",
    email: "ujang.kitchen@saungpasundan.id",
    joinDate: "2021-02-01",
    status: "Aktif",
    shift: "Shift Pagi (08:00 - 16:00)",
    baseSalary: 6000000,
    commissionRatePercent: 1.0,
    pinCode: "7777",
    permissions: {
      canAccessPOS: false,
      canVoidOrder: false,
      canGiveDiscount: false,
      canViewReports: false,
      canManageStock: true,
      canManageEmployees: false,
      canChangeMenuPrice: false,
      canApprovePO: false
    }
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    employeeId: "emp-4",
    employeeName: "Siti Rahmawati",
    role: "Kasir",
    date: "2026-08-09",
    clockIn: "07:52",
    status: "Hadir",
    workHours: 8,
    notes: "Tepat waktu, siap di mesin kasir 1"
  },
  {
    id: "att-2",
    employeeId: "emp-6",
    employeeName: "Chef Mang Ujang",
    role: "Kitchen",
    date: "2026-08-09",
    clockIn: "07:45",
    status: "Hadir",
    workHours: 8,
    notes: "Persiapan bahan baku saung pagi"
  },
  {
    id: "att-3",
    employeeId: "emp-5",
    employeeName: "Asep Sunandar",
    role: "Waiter",
    date: "2026-08-09",
    clockIn: "12:15",
    status: "Terlambat",
    workHours: 7.75,
    notes: "Terlambat 15 menit karena hujan di Dago"
  },
  {
    id: "att-4",
    employeeId: "emp-3",
    employeeName: "Kang Dedi Kurniawan",
    role: "Supervisor",
    date: "2026-08-09",
    clockIn: "11:50",
    status: "Hadir",
    workHours: 8,
    notes: "Supervisi saung lesehan shift siang"
  },
  {
    id: "att-5",
    employeeId: "emp-2",
    employeeName: "Ibu Rina Marlina, SE",
    role: "Manager",
    date: "2026-08-09",
    clockIn: "08:30",
    status: "Hadir",
    workHours: 8,
    notes: "Monitoring stok & reservasi saung"
  }
];

export const INITIAL_COMMISSIONS: CommissionRecord[] = [
  {
    id: "com-1",
    employeeId: "emp-5",
    employeeName: "Asep Sunandar",
    role: "Waiter",
    period: "Agustus 2026",
    totalSalesGenerated: 24500000,
    commissionRate: 2.0,
    commissionAmount: 490000,
    tipsAmount: 350000,
    bonusAmount: 100000,
    status: "Lunas"
  },
  {
    id: "com-2",
    employeeId: "emp-4",
    employeeName: "Siti Rahmawati",
    role: "Kasir",
    period: "Agustus 2026",
    totalSalesGenerated: 68000000,
    commissionRate: 0.5,
    commissionAmount: 340000,
    tipsAmount: 150000,
    bonusAmount: 50000,
    status: "Lunas"
  },
  {
    id: "com-3",
    employeeId: "emp-3",
    employeeName: "Kang Dedi Kurniawan",
    role: "Supervisor",
    period: "Agustus 2026",
    totalSalesGenerated: 45000000,
    commissionRate: 1.0,
    commissionAmount: 450000,
    tipsAmount: 200000,
    bonusAmount: 150000,
    status: "Pending"
  },
  {
    id: "com-4",
    employeeId: "emp-6",
    employeeName: "Chef Mang Ujang",
    role: "Kitchen",
    period: "Agustus 2026",
    totalSalesGenerated: 80000000,
    commissionRate: 1.0,
    commissionAmount: 800000,
    tipsAmount: 400000,
    bonusAmount: 200000,
    status: "Pending"
  }
];

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: "usr-1",
    fullName: "H. Asep Sunandar",
    username: "owner",
    passwordHash: "owner123",
    pin: "1234",
    role: "OWNER",
    outletId: "ALL",
    status: "Aktif",
    email: "asep.owner@saungpasundan.id",
    phone: "0812-3456-7890",
    lastLogin: "2026-08-09 11:30 WIB",
    createdAt: "2025-01-10"
  },
  {
    id: "usr-2",
    fullName: "Siti Rahmawati",
    username: "kasir",
    passwordHash: "kasir123",
    pin: "8888",
    role: "CASHIER",
    outletId: "out-1",
    status: "Aktif",
    email: "siti.kasir@saungpasundan.id",
    phone: "0813-8888-9999",
    lastLogin: "2026-08-09 10:15 WIB",
    createdAt: "2025-01-12"
  },
  {
    id: "usr-3",
    fullName: "Chef Mang Ujang",
    username: "kitchen",
    passwordHash: "dapur123",
    pin: "5555",
    role: "KITCHEN",
    outletId: "out-1",
    status: "Aktif",
    email: "ujang.koki@saungpasundan.id",
    phone: "0815-7777-6666",
    lastLogin: "2026-08-09 09:00 WIB",
    createdAt: "2025-02-01"
  },
  {
    id: "usr-4",
    fullName: "Dewi Lestari",
    username: "manager_bogor",
    passwordHash: "bogor123",
    pin: "2026",
    role: "MANAGER",
    outletId: "out-2",
    status: "Aktif",
    email: "dewi.manager@saungpasundan.id",
    phone: "0819-1122-3344",
    lastLogin: "2026-08-08 17:45 WIB",
    createdAt: "2025-03-15"
  },
  {
    id: "usr-5",
    fullName: "Kang Dedi Kurniawan",
    username: "supervisor_dago",
    passwordHash: "spv123",
    pin: "4321",
    role: "SUPERVISOR",
    outletId: "out-1",
    status: "Aktif",
    email: "dedi.spv@saungpasundan.id",
    phone: "0812-9900-1122",
    lastLogin: "2026-08-09 08:30 WIB",
    createdAt: "2025-04-10"
  }
];


