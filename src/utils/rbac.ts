import { ActiveTab } from "../components/HeaderNav";

export type RbacRole = "DEVELOPER" | "OWNER" | "MANAGER" | "SUPERVISOR" | "CASHIER" | "WAITER" | "KITCHEN";

export interface RoleDefinition {
  id: RbacRole;
  label: string;
  badgeColor: string;
  description: string;
  allowedTabs: ActiveTab[];
  permissionsList: string[];
}

export const RBAC_ROLES: Record<RbacRole, RoleDefinition> = {
  DEVELOPER: {
    id: "DEVELOPER",
    label: "DEVELOPER / SUPER ADMIN (Akses Root & API Key)",
    badgeColor: "bg-purple-600 text-white border-purple-400 font-extrabold shadow-md",
    description: "Akses Super Admin & Developer: Root System, Manual Gemini API Key Management, License Generator, Debug Logs, & Full Access.",
    allowedTabs: [
      "dashboard",
      "pos",
      "orders",
      "saung",
      "kds",
      "recipe",
      "inventory",
      "purchasing",
      "crm",
      "reservation",
      "employee",
      "outlet",
      "aipilot",
      "reports",
      "license",
      "settings",
      "control_panel"
    ],
    permissionsList: ["Super Admin Root", "Developer Console", "Gemini API Key Config", "All Outlets Access", "System Logs"]
  },
  OWNER: {
    id: "OWNER",
    label: "OWNER (Pemilik Resto)",
    badgeColor: "bg-amber-500 text-stone-950 border-amber-300",
    description: "Akses penuh tanpa batas: Everything, Finance, Reports, License, & AI Pilot Engine.",
    allowedTabs: [
      "dashboard",
      "pos",
      "orders",
      "saung",
      "kds",
      "recipe",
      "inventory",
      "purchasing",
      "crm",
      "reservation",
      "employee",
      "outlet",
      "aipilot",
      "reports",
      "license",
      "settings"
    ],
    permissionsList: ["Everything", "Finance", "Reports", "License", "AI Advisor"]
  },
  MANAGER: {
    id: "MANAGER",
    label: "MANAGER (Manajer Operasional)",
    badgeColor: "bg-emerald-500 text-stone-950 border-emerald-300",
    description: "Akses kelola restoran: Dashboard, POS, Inventory, Employees, & Reports.",
    allowedTabs: [
      "dashboard",
      "pos",
      "inventory",
      "recipe",
      "employee",
      "reports"
    ],
    permissionsList: ["Dashboard", "POS", "Inventory", "Employees", "Reports"]
  },
  SUPERVISOR: {
    id: "SUPERVISOR",
    label: "SUPERVISOR (Pengawas Shift)",
    badgeColor: "bg-sky-500 text-stone-950 border-sky-300",
    description: "Akses operasional shift: POS, Kitchen Display, Inventory, & Shift Purchasing.",
    allowedTabs: [
      "pos",
      "kds",
      "inventory",
      "purchasing"
    ],
    permissionsList: ["POS", "Kitchen", "Inventory", "Shift"]
  },
  CASHIER: {
    id: "CASHIER",
    label: "CASHIER / KASIR",
    badgeColor: "bg-purple-500 text-white border-purple-300",
    description: "Akses transaksi kasir: POS & Records Transaksi (Orders).",
    allowedTabs: [
      "pos",
      "orders"
    ],
    permissionsList: ["POS", "Transactions"]
  },
  WAITER: {
    id: "WAITER",
    label: "WAITER / PRAMUSAJI",
    badgeColor: "bg-blue-500 text-white border-blue-300",
    description: "Akses pelayanan saung: Tables (Saung), Orders, & Customer Info.",
    allowedTabs: [
      "saung",
      "orders",
      "crm"
    ],
    permissionsList: ["Tables", "Orders", "Customer"]
  },
  KITCHEN: {
    id: "KITCHEN",
    label: "KITCHEN / KOKI DAPUR",
    badgeColor: "bg-rose-500 text-white border-rose-300",
    description: "Akses khusus dapur: Kitchen Display System (KDS).",
    allowedTabs: [
      "kds"
    ],
    permissionsList: ["Kitchen Display"]
  }
};

export function normalizeRole(roleString: string): RbacRole {
  if (!roleString) return "OWNER";
  const r = roleString.toUpperCase();
  if (r.includes("OWNER") || r.includes("PEMILIK")) return "OWNER";
  if (r.includes("MANAGER") || r.includes("MANAJER")) return "MANAGER";
  if (r.includes("SUPERVISOR") || r.includes("SPV")) return "SUPERVISOR";
  if (r.includes("CASHIER") || r.includes("KASIR")) return "CASHIER";
  if (r.includes("WAITER") || r.includes("PRAMUSAJI") || r.includes("PELAYAN")) return "WAITER";
  if (r.includes("KITCHEN") || r.includes("KOKI") || r.includes("DAPUR")) return "KITCHEN";
  return "OWNER";
}

export function isTabAllowedForRole(role: string, tab: ActiveTab): boolean {
  const norm = normalizeRole(role);
  const def = RBAC_ROLES[norm];
  if (!def) return true;
  return def.allowedTabs.includes(tab);
}

export function getDefaultTabForRole(role: string): ActiveTab {
  const norm = normalizeRole(role);
  const def = RBAC_ROLES[norm];
  return def?.allowedTabs[0] || "dashboard";
}
