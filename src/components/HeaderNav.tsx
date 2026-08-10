import React, { useState } from "react";
import {
  BarChart3,
  UtensilsCrossed,
  ClipboardList,
  LayoutGrid,
  ChefHat,
  BookOpen,
  Layers,
  Truck,
  Heart,
  TrendingUp,
  Bot,
  Settings,
  Store,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Plus,
  Building2,
  Calendar,
  Users,
  KeyRound,
  Sparkles,
  ShoppingBag,
  Crown,
  CheckCircle2,
  Lock
} from "lucide-react";
import { LicenseInfo, Outlet } from "../types";
import { RBAC_ROLES, RbacRole, isTabAllowedForRole, getDefaultTabForRole } from "../utils/rbac";

export type ActiveTab =
  | "dashboard"
  | "pos"
  | "orders"
  | "saung"
  | "kds"
  | "inventory"
  | "recipe"
  | "purchasing"
  | "crm"
  | "reservation"
  | "employee"
  | "outlet"
  | "aipilot"
  | "reports"
  | "license"
  | "settings";

interface HeaderNavProps {
  license: LicenseInfo;
  outlets: Outlet[];
  currentOutlet: Outlet;
  onSelectOutlet: (outlet: Outlet) => void;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onLogoutToLanding: () => void;
  currentRole?: RbacRole;
  onChangeRole?: (role: RbacRole) => void;
  children?: React.ReactNode;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  license,
  outlets,
  currentOutlet,
  onSelectOutlet,
  activeTab,
  onChangeTab,
  onLogoutToLanding,
  currentRole = "OWNER",
  onChangeRole,
  children
}) => {
  // Tablet/Desktop Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Mobile "More" Drawer Modal State
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  // Active Role state fallback if not controlled
  const [selectedRoleState, setSelectedRoleState] = useState<RbacRole>(currentRole);
  const activeRole = currentRole || selectedRoleState;

  const handleRoleChange = (role: RbacRole) => {
    setSelectedRoleState(role);
    if (onChangeRole) onChangeRole(role);

    // If active tab is not allowed for new role, auto switch to role's primary tab
    if (!isTabAllowedForRole(role, activeTab)) {
      onChangeTab(getDefaultTabForRole(role));
    }
  };

  // Desktop / Tablet Sidebar Item List
  const allSidebarNavItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "pos", label: "POS", icon: UtensilsCrossed },
    { id: "orders", label: "Orders", icon: ClipboardList, badge: "Live" },
    { id: "saung", label: "Tables", icon: LayoutGrid },
    { id: "kds", label: "Kitchen", icon: ChefHat },
    { id: "recipe", label: "Menu", icon: BookOpen },
    { id: "inventory", label: "Inventory", icon: Layers },
    { id: "purchasing", label: "Purchasing", icon: Truck },
    { id: "crm", label: "Customers", icon: Heart },
    { id: "reports", label: "Reports", icon: TrendingUp },
    { id: "aipilot", label: "AI", icon: Bot, isAi: true },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Filter sidebar items according to RBAC permissions
  const sidebarNavItems = allSidebarNavItems.filter((item) =>
    isTabAllowedForRole(activeRole, item.id as ActiveTab)
  );

  // Secondary sub-items accessible in Settings or More menu
  const settingsSubItems = [
    { id: "outlet", label: "Multi-Outlet Branch", icon: Building2 },
    { id: "reservation", label: "Reservasi Saung", icon: Calendar },
    { id: "employee", label: "Karyawan & Akses POS", icon: Users },
    { id: "license", label: "Kelola Lisensi Software", icon: KeyRound }
  ].filter((item) => isTabAllowedForRole(activeRole, item.id as ActiveTab));

  const handleMobileNavClick = (tabId: string) => {
    onChangeTab(tabId as ActiveTab);
    setIsMobileMoreOpen(false);
  };

  const activeRoleDef = RBAC_ROLES[activeRole] || RBAC_ROLES.OWNER;

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans">
      {/* Top Header Bar across all viewports */}
      <header className="bg-stone-900 border-b border-stone-800 text-stone-100 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
          {/* Brand & Collapse Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-2 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 transition"
              title={isSidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar Navigation"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center text-amber-100 shadow">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-base text-amber-200 tracking-wide">
                SundaResto <span className="text-amber-400 font-sans text-xs">AI</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{license.tierName}</span>
            </div>
          </div>

          {/* Outlet Switcher, RBAC Role Switcher & User Control */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Outlet Selector Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-stone-950 hover:bg-stone-800 border border-stone-700 px-3 py-1.5 rounded-xl cursor-pointer transition text-amber-200">
                <Store className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-semibold text-xs max-w-[120px] sm:max-w-[150px] truncate">{currentOutlet.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              </div>

              {/* Dropdown list */}
              <div className="absolute right-0 top-full mt-1 w-64 bg-stone-900 border border-amber-500/30 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <span className="text-[10px] font-bold uppercase text-stone-400 px-2 py-1 block">Pilih Cabang Resto:</span>
                {outlets.map((out) => (
                  <button
                    key={out.id}
                    onClick={() => onSelectOutlet(out)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      out.id === currentOutlet.id
                        ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                        : "text-stone-300 hover:bg-stone-800"
                    }`}
                  >
                    <span>{out.name}</span>
                    <span className="text-[10px] text-stone-400">{out.city}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RBAC Role Selector Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-stone-950 hover:bg-stone-800 border border-amber-500/40 px-3 py-1.5 rounded-xl cursor-pointer transition text-stone-100">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">Akses Role (RBAC)</span>
                  <span className="font-bold text-xs text-amber-300 flex items-center gap-1">
                    {activeRoleDef.id}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 ml-1" />
              </div>

              {/* Role Dropdown Options */}
              <div className="absolute right-0 top-full mt-1 w-80 bg-stone-900 border border-amber-500/40 rounded-2xl shadow-2xl p-3 hidden group-hover:block z-50 space-y-2">
                <div className="border-b border-stone-800 pb-2">
                  <span className="text-[10px] font-bold uppercase text-amber-300 block">Switch Active RBAC Role:</span>
                  <p className="text-[10px] text-stone-400">Pilih role untuk simulasi hak akses RBAC pengguna.</p>
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {(Object.keys(RBAC_ROLES) as RbacRole[]).map((rKey) => {
                    const rDef = RBAC_ROLES[rKey];
                    const isSelected = rKey === activeRole;
                    return (
                      <button
                        key={rKey}
                        onClick={() => handleRoleChange(rKey)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition border flex items-start gap-2 ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow"
                            : "bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800"
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-amber-400" : "text-stone-600"}`} />
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold">{rDef.id}</span>
                          </div>
                          <p className="text-[10px] text-amber-300 font-mono">
                            Modul: {rDef.permissionsList.join(" • ")}
                          </p>
                          <p className="text-[10px] text-stone-400 leading-tight">{rDef.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Profile User Badge */}
            <div className="hidden lg:flex items-center gap-2 bg-stone-950 px-2.5 py-1.5 rounded-xl border border-stone-800 text-xs text-stone-300">
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">Role Active: {activeRole}</span>
            </div>

            <button
              onClick={onLogoutToLanding}
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-xl transition"
              title="Keluar ke Landing Page"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Layout with Desktop/Tablet Sidebar and Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop & Tablet Sidebar Navigation */}
        <aside
          className={`hidden md:flex flex-col bg-stone-900 border-r border-stone-800 transition-all duration-300 z-20 ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="p-3 flex-1 overflow-y-auto space-y-1 scrollbar-thin">
            {!isSidebarCollapsed && (
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Akses Menu ({activeRole})
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 font-mono font-bold">
                  RBAC
                </span>
              </div>
            )}

            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onChangeTab(item.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
                      : item.isAi
                      ? "text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
                      : "text-stone-300 hover:bg-stone-800 hover:text-amber-200"
                  } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
                  title={item.label}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${item.isAi && !isActive ? "animate-pulse" : ""}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="ml-auto bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Role Permission Summary Footer in Sidebar */}
          {!isSidebarCollapsed && (
            <div className="p-3 border-t border-stone-800 bg-stone-950/50 space-y-2">
              <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" /> Matriks RBAC
                  </span>
                  <span className="text-amber-300 font-bold font-mono text-[10px]">{activeRole}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {activeRoleDef.permissionsList.map((p, pIdx) => (
                    <span key={pIdx} className="text-[9px] bg-stone-950 text-emerald-300 border border-stone-800 px-1.5 py-0.5 rounded font-mono">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Central Main Content View */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile Floating Action Button (FAB) for Quick Transaction / POS */}
      <div className="md:hidden fixed right-4 bottom-20 z-40">
        <button
          onClick={() => onChangeTab("pos")}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-2xl flex items-center justify-center border-2 border-amber-300 active:scale-95 transition-transform"
          title="Transaksi Baru / POS"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar: Home | POS | Orders | AI | More */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 z-40 px-2 py-1.5">
        <div className="grid grid-cols-5 gap-1 text-center">
          {/* 1. Home (Dashboard) */}
          <button
            onClick={() => onChangeTab("dashboard")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
              activeTab === "dashboard" ? "text-amber-400 bg-amber-500/10 font-bold" : "text-stone-400"
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          {/* 2. POS */}
          <button
            onClick={() => onChangeTab("pos")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
              activeTab === "pos" ? "text-amber-400 bg-amber-500/10 font-bold" : "text-stone-400"
            }`}
          >
            <UtensilsCrossed className="w-5 h-5 mb-0.5" />
            <span>POS</span>
          </button>

          {/* 3. Orders */}
          <button
            onClick={() => onChangeTab("orders")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
              activeTab === "orders" ? "text-amber-400 bg-amber-500/10 font-bold" : "text-stone-400"
            }`}
          >
            <ClipboardList className="w-5 h-5 mb-0.5" />
            <span>Orders</span>
          </button>

          {/* 4. AI */}
          <button
            onClick={() => onChangeTab("aipilot")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
              activeTab === "aipilot" ? "text-amber-400 bg-amber-500/10 font-bold" : "text-amber-300"
            }`}
          >
            <Bot className="w-5 h-5 mb-0.5 animate-bounce" />
            <span>AI</span>
          </button>

          {/* 5. More */}
          <button
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-semibold transition ${
              isMobileMoreOpen ? "text-amber-400 bg-amber-500/10 font-bold" : "text-stone-400"
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* Mobile "More" Drawer / Modal Sheet */}
      {isMobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-stone-900 border-t border-amber-500/30 rounded-t-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-100">Navigasi Selengkapnya</h3>
              </div>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavClick(item.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition ${
                      isActive
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                        : "bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Modul Operasional Tambahan
              </span>
              <div className="grid grid-cols-2 gap-2">
                {settingsSubItems.map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleMobileNavClick(sub.id)}
                      className="p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-left flex items-center gap-2 text-xs text-stone-300 hover:bg-stone-800"
                    >
                      <Icon className="w-4 h-4 text-emerald-400" />
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
