import React, { useState } from "react";
import { UserAccount, LicenseInfo, Outlet } from "../types";
import { RbacRole, RBAC_ROLES } from "../utils/rbac";
import { generateLicenseKey } from "../utils/formatters";
import {
  UserCheck,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Lock,
  User,
  Building2,
  Phone,
  Mail,
  Copy,
  Check,
  Zap,
  Settings,
  Receipt,
  Printer,
  Save,
  Search,
  Key,
  Shield,
  RefreshCw,
  Clock
} from "lucide-react";

interface SettingsModuleProps {
  license: LicenseInfo;
  onUpdateLicense: (info: LicenseInfo) => void;
  userAccounts: UserAccount[];
  onAddUserAccount: (account: UserAccount) => void;
  onUpdateUserAccount: (account: UserAccount) => void;
  onDeleteUserAccount: (id: string) => void;
  outlets: Outlet[];
  currentOutlet: Outlet;
  onUpdateOutlet?: (outlet: Outlet) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  license,
  onUpdateLicense,
  userAccounts,
  onAddUserAccount,
  onUpdateUserAccount,
  onDeleteUserAccount,
  outlets,
  currentOutlet,
  onUpdateOutlet
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"accounts" | "developer" | "license" | "receipt">("accounts");

  // Developer & Gemini API Key Settings State
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState<string>(() => {
    return localStorage.getItem("custom_gemini_api_key") || "";
  });
  const [showGeminiKeyText, setShowGeminiKeyText] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; aiResponse?: string } | null>(null);

  const handleSaveGeminiKey = () => {
    const trimmed = geminiApiKeyInput.trim();
    if (!trimmed) {
      localStorage.removeItem("custom_gemini_api_key");
      showToast("API Key Gemini telah dihapus dari local storage.");
      setTestResult(null);
      return;
    }
    localStorage.setItem("custom_gemini_api_key", trimmed);
    showToast("✓ API Key Gemini berhasil disimpan secara manual!");
    setTestResult(null);
  };

  const handleClearGeminiKey = () => {
    localStorage.removeItem("custom_gemini_api_key");
    setGeminiApiKeyInput("");
    showToast("API Key Gemini telah dihapus dari local storage.");
    setTestResult(null);
  };

  const handleTestGeminiKey = async () => {
    const keyToTest = geminiApiKeyInput.trim() || localStorage.getItem("custom_gemini_api_key") || "";
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: "Silakan masukkan API Key Gemini terlebih dahulu sebelum melakukan tes."
      });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": keyToTest
        },
        body: JSON.stringify({ customApiKey: keyToTest })
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setTestResult(data);
      } else {
        const textResponse = await res.text();
        setTestResult({
          success: false,
          message: `Server merespon dengan status ${res.status}: ${textResponse.slice(0, 120)}...`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Gagal menghubungi server tes: ${err.message || err}`
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  // Account Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Modal State for New Account Form
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState<UserAccount | null>(null);

  // New Account Form State
  const [newFullName, setNewFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [newPin, setNewPin] = useState("1234");
  const [newRole, setNewRole] = useState<RbacRole>("CASHIER");
  const [newOutletId, setNewOutletId] = useState<string>(currentOutlet?.id || "ALL");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showNewPasswordText, setShowNewPasswordText] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit Password Modal Form State
  const [editPasswordInput, setEditPasswordInput] = useState("");
  const [editConfirmPasswordInput, setEditConfirmPasswordInput] = useState("");
  const [showEditPasswordText, setShowEditPasswordText] = useState(false);
  const [editPasswordError, setEditPasswordError] = useState("");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // License State (for license tab)
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [genTier, setGenTier] = useState<"PRO" | "ENTERPRISE">("PRO");
  const [inputKey, setInputKey] = useState("");
  const [activateMsg, setActivateMsg] = useState("");

  // Receipt Settings State
  const [receiptHeaderMsg, setReceiptHeaderMsg] = useState("Sampurasun! Hatur Nuhun Samparannya.");
  const [receiptFooterMsg, setReceiptFooterMsg] = useState("Muguk Mangku Sugema! Diantos Kasumpinganana Deui.");
  const [taxRate, setTaxRate] = useState<number>(currentOutlet?.taxRatePct || 10);
  const [serviceRate, setServiceRate] = useState<number>(currentOutlet?.serviceChargePct || 5);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newFullName.trim()) {
      setFormError("Nama lengkap wajib diisi.");
      return;
    }
    if (!newUsername.trim()) {
      setFormError("Username wajib diisi.");
      return;
    }
    // Check if username already exists
    if (userAccounts.some((u) => u.username.toLowerCase() === newUsername.toLowerCase().trim())) {
      setFormError("Username ini sudah digunakan oleh akun lain.");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setFormError("Password minimal 4 karakter.");
      return;
    }
    if (newPassword !== newConfirmPassword) {
      setFormError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    const newAcc: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: newFullName,
      username: newUsername.trim().toLowerCase(),
      passwordHash: newPassword,
      pin: newPin || "1234",
      role: newRole,
      outletId: newOutletId,
      status: "Aktif",
      email: newEmail || undefined,
      phone: newPhone || undefined,
      lastLogin: "Belum pernah login",
      createdAt: new Date().toISOString().split("T")[0]
    };

    onAddUserAccount(newAcc);
    showToast(`✓ Akun '${newAcc.username}' (${newAcc.fullName}) berhasil dibuat!`);

    // Reset Form
    setNewFullName("");
    setNewUsername("");
    setNewPassword("");
    setNewConfirmPassword("");
    setNewEmail("");
    setNewPhone("");
    setShowAddAccountModal(false);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditPasswordModal) return;
    setEditPasswordError("");

    if (!editPasswordInput || editPasswordInput.length < 4) {
      setEditPasswordError("Password baru minimal 4 karakter.");
      return;
    }
    if (editPasswordInput !== editConfirmPasswordInput) {
      setEditPasswordError("Konfirmasi password tidak cocok.");
      return;
    }

    const updatedAccount: UserAccount = {
      ...showEditPasswordModal,
      passwordHash: editPasswordInput
    };

    onUpdateUserAccount(updatedAccount);
    showToast(`✓ Password akun '${updatedAccount.username}' berhasil diperbarui!`);
    setShowEditPasswordModal(null);
    setEditPasswordInput("");
    setEditConfirmPasswordInput("");
  };

  const handleToggleStatus = (account: UserAccount) => {
    const updated: UserAccount = {
      ...account,
      status: account.status === "Aktif" ? "Nonaktif" : "Aktif"
    };
    onUpdateUserAccount(updated);
    showToast(`Status akun '${account.username}' diubah menjadi ${updated.status}`);
  };

  const handleSaveReceiptSettings = () => {
    if (currentOutlet && onUpdateOutlet) {
      onUpdateOutlet({
        ...currentOutlet,
        taxRatePct: taxRate,
        serviceChargePct: serviceRate
      });
    }
    showToast("✓ Pengaturan Struk & Pajak Kasir Berhasil Disimpan!");
  };

  // Filter accounts
  const filteredAccounts = userAccounts.filter((acc) => {
    const matchesSearch =
      acc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.email && acc.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || acc.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-stone-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-300 animate-bounce text-xs">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Header Navigation Tabs */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-100">
              Pengaturan Sistem & Keamanan Resto
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Kelola akun login (username & password), lisensi software, hak akses RBAC, serta format struk kasir.
            </p>
          </div>
        </div>

        {/* Sub-tab Switchers */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "accounts"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Akun & Password</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-stone-900/60 text-amber-100 font-mono">
              {userAccounts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("developer")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "developer"
                ? "bg-purple-600 text-white shadow-md border border-purple-400"
                : "text-purple-300 hover:text-purple-100 bg-purple-950/40 border border-purple-900/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Developer & Gemini API</span>
            <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500 text-white font-extrabold uppercase tracking-wide">
              Super Admin
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("license")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "license"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Lisensi & Serial Key</span>
          </button>

          <button
            onClick={() => setActiveSubTab("receipt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === "receipt"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Struk & Pajak</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ACCOUNTS & PASSWORDS MANAGEMENT */}
      {activeSubTab === "accounts" && (
        <div className="space-y-6">
          {/* Top Account Actions & Filter Bar */}
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / username..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-auto bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-300 font-bold outline-none"
              >
                <option value="ALL">Semua Jabatan (Role)</option>
                <option value="DEVELOPER">Developer (Super Admin Root)</option>
                <option value="OWNER">Owner (Pemilik)</option>
                <option value="MANAGER">Manager</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="CASHIER">Kasir (Cashier)</option>
                <option value="KITCHEN">Koki (Kitchen)</option>
                <option value="WAITER">Waiter (Pramusaji)</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddAccountModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-2xl shadow-xl transition flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>

          {/* User Accounts Grid / Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  Daftar Akun Pengguna & Hak Akses Software
                </h3>
              </div>
              <span className="text-xs text-stone-400">
                Menampilkan {filteredAccounts.length} dari {userAccounts.length} Akun
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800">
                  <tr>
                    <th className="p-4">Pengguna / Nama</th>
                    <th className="p-4">Username Login</th>
                    <th className="p-4">Role Jabatan</th>
                    <th className="p-4">Akses Cabang</th>
                    <th className="p-4 text-center">PIN Kasir</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-200">
                  {filteredAccounts.map((acc) => {
                    const roleInfo = RBAC_ROLES[acc.role] || RBAC_ROLES.CASHIER;
                    const outletObj = outlets.find((o) => o.id === acc.outletId);

                    return (
                      <tr key={acc.id} className="hover:bg-stone-950/60 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-sm">
                              {acc.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <strong className="block font-bold text-amber-100 text-sm">{acc.fullName}</strong>
                              <span className="text-[11px] text-stone-400">
                                {acc.email || acc.phone || `Dibuat: ${acc.createdAt}`}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-mono font-bold text-amber-300 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800 text-xs">
                            @{acc.username}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleInfo.badgeColor}`}>
                            {roleInfo.label.split("(")[0]}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="text-stone-300 font-medium">
                            {acc.outletId === "ALL" ? "Semua Cabang (Global)" : outletObj?.name || acc.outletId}
                          </span>
                        </td>

                        <td className="p-4 text-center font-mono font-bold text-amber-400">
                          {acc.pin || "1234"}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(acc)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                              acc.status === "Aktif"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                            }`}
                          >
                            {acc.status}
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setShowEditPasswordModal(acc)}
                              className="px-2.5 py-1.5 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-stone-700"
                              title="Ubah Password Akun Ini"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Reset Password</span>
                            </button>

                            {acc.role !== "OWNER" && (
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus akun '${acc.username}'?`)) {
                                    onDeleteUserAccount(acc.id);
                                    showToast(`Akun '${acc.username}' berhasil dihapus.`);
                                  }
                                }}
                                className="p-1.5 bg-stone-800 hover:bg-rose-500 text-stone-400 hover:text-white rounded-lg transition border border-stone-700"
                                title="Hapus Akun"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEVELOPER & GEMINI API KEY MANAGEMENT */}
      {activeSubTab === "developer" && (
        <div className="space-y-6">
          {/* Top Developer & Super Admin Banner */}
          <div className="bg-gradient-to-r from-purple-950/80 via-stone-900 to-amber-950/40 border border-purple-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                    SUPER ADMIN ROOT
                  </span>
                  <span className="text-xs font-mono text-purple-300 font-bold">Role: DEVELOPER</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-amber-100 flex items-center gap-2">
                  <span>Konsol Developer & Akses Root Sistem</span>
                </h3>
                <p className="text-xs text-stone-300 max-w-2xl">
                  Akun Super Admin Developer memiliki tingkat wewenang penuh tanpa batas di seluruh modul, cabang outlet, generator lisensi, serta pengaturan manual API Key Gemini AI.
                </p>
              </div>

              {/* Developer Account Badge Box */}
              <div className="bg-stone-950/90 border border-purple-500/50 p-4 rounded-2xl space-y-2 text-xs font-mono min-w-[260px]">
                <div className="text-[10px] font-sans font-bold text-purple-300 uppercase tracking-wider border-b border-purple-900/60 pb-1 flex justify-between items-center">
                  <span>Kredensial Login Dev:</span>
                  <span className="text-emerald-400 font-bold">● Status: Aktif</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Username:</span>
                  <span className="font-bold text-amber-300">developer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Password:</span>
                  <span className="font-bold text-amber-300">dev123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">PIN Kasir:</span>
                  <span className="font-bold text-amber-300">9999</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Gemini API Key Configuration Section */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-inner">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                    <span>Pengaturan Manual API Key Gemini AI</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Masukkan API Key Gemini secara manual untuk mengaktifkan fitur AI Co-Pilot & Resep Sunda AI setelah deploy.
                  </p>
                </div>
              </div>

              {/* Saved Status Pill */}
              <div className="hidden sm:block">
                {localStorage.getItem("custom_gemini_api_key") ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>API Key Tersimpan & Aktif</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Menggunakan AI Local Fallback</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-amber-200 block mb-1.5">
                  Input Gemini API Key (Google AI Studio):
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKeyText ? "text" : "password"}
                    value={geminiApiKeyInput}
                    onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                    placeholder="Masukkan API Key Gemini (contoh: AIzaSy...)"
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-4 pr-10 py-3 text-sm text-stone-100 font-mono outline-none focus:border-purple-400 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKeyText(!showGeminiKeyText)}
                    className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-200"
                  >
                    {showGeminiKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  API Key ini tersimpan aman di browser (local storage) dan otomatis dikirimkan ke server saat menjalankan fitur AI.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveGeminiKey}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan API Key</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestGeminiKey}
                  disabled={isTestingKey}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 border border-purple-400"
                >
                  {isTestingKey ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isTestingKey ? "Menguji Koneksi..." : "Tes Koneksi Gemini API"}</span>
                </button>

                {geminiApiKeyInput && (
                  <button
                    type="button"
                    onClick={handleClearGeminiKey}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-rose-600 text-stone-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-stone-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Key</span>
                  </button>
                )}
              </div>

              {/* Test Result Display Banner */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    testResult.success
                      ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-200"
                      : "bg-rose-950/70 border-rose-500/60 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.aiResponse && (
                    <div className="bg-stone-950/80 p-3 rounded-xl border border-emerald-900 font-mono text-emerald-300 text-[11px]">
                      Response Gemini: "{testResult.aiResponse}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Guide Card for Deployment */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Panduan Memasang API Key Gemini Setelah Deploy</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-300 leading-relaxed">
              <li>
                Dapatkan API Key Gemini secara gratis melalui Google AI Studio: <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-mono">https://aistudio.google.com</a>.
              </li>
              <li>
                Buka menu <strong className="text-white">Setting → Developer & Gemini API</strong> pada aplikasi SundaResto AI ini.
              </li>
              <li>
                Tempelkan (paste) API Key pada kolom <strong className="text-amber-300">Input Gemini API Key</strong> di atas, lalu klik <strong className="text-amber-300">Simpan API Key</strong>.
              </li>
              <li>
                Klik <strong className="text-purple-300">Tes Koneksi Gemini API</strong> untuk memastikan server berhasil merespon.
              </li>
              <li>
                Setelah tersimpan, seluruh fitur AI seperti <strong className="text-white">AI Co-Pilot</strong>, <strong className="text-white">Resep Masakan Sunda AI</strong>, dan <strong className="text-white">Promosi Otomatis</strong> akan berjalan secara real-time menggunakan API Key Anda.
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 3: LICENSE & KEY GENERATOR */}
      {activeSubTab === "license" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active License Info (6 cols) */}
          <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif font-bold text-base text-amber-200">
                Rincian Lisensi Resto Terdaftar
              </h3>
              <span className="text-xs font-mono text-emerald-400">Valid s.d {license.expiryDate}</span>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Serial Key Active:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-amber-300 bg-stone-900 px-3 py-1 rounded-lg border border-stone-800">
                  <span>{license.key}</span>
                  <button onClick={() => {
                    navigator.clipboard.writeText(license.key);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }} className="text-stone-400 hover:text-white">
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-400">Pemilik / Rantai Resto:</span>
                <span className="font-bold text-stone-200">{license.ownerName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-400">Kapasitas Outlet:</span>
                <span className="font-bold text-stone-200">Hingga {license.maxOutlets} Cabang</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-400">Kapasitas Saung Lesehan:</span>
                <span className="font-bold text-stone-200">Hingga {license.maxSaung} Saung / Meja</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-amber-200 mb-2">Modul Fitur Terbuka:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
                {license.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reseller License Generator Tool (6 cols) */}
          <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-200">
                  Reseller Serial Key Generator
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Buat Kunci Serial Lisensi baru untuk klien rumah makan Sunda lainnya.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Pilih Tier Paket Lisensi:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGenTier("PRO")}
                    className={`p-3 rounded-2xl border text-left text-xs transition ${
                      genTier === "PRO"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    <span className="block font-bold">Pro Multi-Saung</span>
                    <span className="text-[10px] opacity-80">Maks 3 Cabang & 50 Saung</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGenTier("ENTERPRISE")}
                    className={`p-3 rounded-2xl border text-left text-xs transition ${
                      genTier === "ENTERPRISE"
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                        : "bg-stone-950 border-stone-800 text-stone-400"
                    }`}
                  >
                    <span className="block font-bold">Enterprise Unlimited</span>
                    <span className="text-[10px] opacity-80">Unlimited Cabang & Franchise</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const key = generateLicenseKey(genTier);
                  setGeneratedKey(key);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-stone-950" />
                <span>Generate Serial Key Baru ({genTier})</span>
              </button>

              {generatedKey && (
                <div className="bg-stone-950 p-4 rounded-2xl border border-amber-500/40 space-y-2 text-center">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    Kunci Serial Baru Berhasil Dibuat:
                  </span>
                  <div className="font-mono font-extrabold text-lg text-emerald-400 tracking-wider">
                    {generatedKey}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                      showToast("Kunci lisensi disalin!");
                    }}
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg text-xs font-bold border border-stone-800 inline-flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kunci Serial</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIPT & TAX SETTINGS */}
      {activeSubTab === "receipt" && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <Receipt className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Pengaturan Cetak Struk Kasir & Pajak
              </h3>
              <p className="text-xs text-stone-400">
                Sesuaikan teks ucapan salam Sunda di header & footer struk serta tarif pajak PB1 & service charge.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-amber-200 block mb-1">
                Header Pesan Sambutan Struk (Atas Struk):
              </label>
              <input
                type="text"
                value={receiptHeaderMsg}
                onChange={(e) => setReceiptHeaderMsg(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-amber-200 block mb-1">
                Footer Pesan Penutup Struk (Bawah Struk):
              </label>
              <input
                type="text"
                value={receiptFooterMsg}
                onChange={(e) => setReceiptFooterMsg(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-bold text-amber-200 block mb-1">
                  Pajak Resto (PB1 %):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-stone-100 font-mono font-bold outline-none focus:border-amber-400"
                  />
                  <span className="text-stone-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-amber-200 block mb-1">
                  Service Charge Pelayanan (%):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={serviceRate}
                    onChange={(e) => setServiceRate(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-stone-100 font-mono font-bold outline-none focus:border-amber-400"
                  />
                  <span className="text-stone-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveReceiptSettings}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan Struk & Pajak</span>
          </button>
        </div>
      )}

      {/* MODAL: CREATE NEW USER ACCOUNT */}
      {showAddAccountModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-amber-100">
                  Buat Akun Pengguna Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddAccountModal(false)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-rose-500/20 border border-rose-500/40 p-3 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-amber-200 block mb-1">Nama Lengkap Karyawan / Pemilik *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Contoh: Asep Hermawan"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-200 block mb-1">Username Login *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Contoh: asep_kasir"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-200 block mb-1">PIN Kasir Cepat (4 Digit)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono font-bold outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-200 block mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPasswordText ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 4 karakter"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-3.5 pr-9 py-2.5 text-stone-100 font-mono outline-none focus:border-amber-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPasswordText(!showNewPasswordText)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-200"
                    >
                      {showNewPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-amber-200 block mb-1">Konfirmasi Password *</label>
                  <input
                    type={showNewPasswordText ? "text" : "password"}
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Role & Outlet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-amber-200 block mb-1">Jabatan Hak Akses (Role)</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as RbacRole)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 font-bold outline-none focus:border-amber-400"
                  >
                    <option value="DEVELOPER">Super Admin Developer (Akses Root)</option>
                    <option value="OWNER">Owner (Akses Penuh)</option>
                    <option value="MANAGER">Manager</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="CASHIER">Kasir (Cashier)</option>
                    <option value="KITCHEN">Koki Dapur (Kitchen)</option>
                    <option value="WAITER">Waiter (Pramusaji)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-amber-200 block mb-1">Akses Cabang Outlet</label>
                  <select
                    value={newOutletId}
                    onChange={(e) => setNewOutletId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-200 font-bold outline-none focus:border-amber-400"
                  >
                    <option value="ALL">Semua Cabang (Global)</option>
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-400 block mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@saung.id"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-400 block mb-1">No HP / WhatsApp (Opsional)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="w-1/2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-xl shadow transition"
                >
                  Simpan Akun Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / RESET PASSWORD */}
      {showEditPasswordModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-100">
                  Ubah Password Akun
                </h3>
              </div>
              <button
                onClick={() => setShowEditPasswordModal(null)}
                className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
              <div>
                Nama: <strong className="text-amber-200">{showEditPasswordModal.fullName}</strong>
              </div>
              <div>
                Username: <strong className="text-amber-400 font-mono">@{showEditPasswordModal.username}</strong>
              </div>
            </div>

            {editPasswordError && (
              <div className="bg-rose-500/20 border border-rose-500/40 p-2.5 rounded-xl text-rose-300 text-xs font-bold">
                {editPasswordError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-amber-200 block mb-1">Password Baru *</label>
                <div className="relative">
                  <input
                    type={showEditPasswordText ? "text" : "password"}
                    value={editPasswordInput}
                    onChange={(e) => setEditPasswordInput(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-3.5 pr-9 py-2.5 text-stone-100 font-mono outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPasswordText(!showEditPasswordText)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-200"
                  >
                    {showEditPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-amber-200 block mb-1">Konfirmasi Password Baru *</label>
                <input
                  type={showEditPasswordText ? "text" : "password"}
                  value={editConfirmPasswordInput}
                  onChange={(e) => setEditConfirmPasswordInput(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-100 font-mono outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditPasswordModal(null)}
                  className="w-1/2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-xl shadow transition"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
