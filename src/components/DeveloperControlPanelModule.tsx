import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Key,
  Users,
  Globe,
  Film,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Lock,
  Unlock,
  Radio,
  Server,
  Play,
  Image as ImageIcon,
  Save,
  MessageSquare,
  Building,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Zap,
  Clock,
  Send,
  X
} from "lucide-react";
import {
  WebsiteConfig,
  DeveloperClientAccount,
  DeveloperApiConfig,
  BroadcastNotification,
  MediaItem,
  ControlPanelStore
} from "../types/controlPanel";
import { formatRupiah } from "../utils/formatters";

interface DeveloperControlPanelModuleProps {
  onClose?: () => void;
  onApplyClientLicense?: (client: DeveloperClientAccount) => void;
}

export const DeveloperControlPanelModule: React.FC<DeveloperControlPanelModuleProps> = ({
  onClose,
  onApplyClientLicense
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"clients" | "api" | "website" | "media" | "broadcast" | "security">("clients");

  // Master Data State
  const [storeData, setStoreData] = useState<ControlPanelStore | null>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Client Management State
  const [clientSearch, setClientSearch] = useState("");
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [editingClient, setEditingClient] = useState<DeveloperClientAccount | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // API Config State
  const [masterApiKeyInput, setMasterApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string; response?: string } | null>(null);

  // Website Config State (Local form copy)
  const [webConfigForm, setWebConfigForm] = useState<WebsiteConfig | null>(null);
  const [isSavingWebConfig, setIsSavingWebConfig] = useState(false);

  // Media Manager State
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [newMediaForm, setNewMediaForm] = useState<Partial<MediaItem>>({
    type: "image",
    placement: "gallery_food",
    isActive: true
  });

  // Broadcast State
  const [newBroadcastForm, setNewBroadcastForm] = useState<Partial<BroadcastNotification>>({
    type: "info",
    targetTiers: ["ALL"],
    isActive: true
  });

  // Security PIN Change
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");

  // Fetch full control panel state from server
  const fetchControlPanelState = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/control-panel/state");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStoreData(json.data);
          setSystemStats(json.data.systemStats);
          setWebConfigForm(json.data.websiteConfig);
          setMasterApiKeyInput(json.data.apiConfig?.masterGeminiApiKey || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch control panel state:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    // Check if session PIN already stored
    const savedPin = sessionStorage.getItem("sunda_dev_pin");
    if (savedPin) {
      verifyPin(savedPin);
    }
  }, []);

  const verifyPin = async (pinToTest?: string) => {
    const pin = pinToTest || inputPin;
    if (!pin) return;
    setIsLoadingAuth(true);
    setAuthError("");

    try {
      const res = await fetch("/api/control-panel/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("sunda_dev_pin", pin);
        fetchControlPanelState();
      } else {
        setAuthError(data.message || "Master PIN tidak valid!");
      }
    } catch (err) {
      setAuthError("Gagal menghubungi server");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- CLIENT ACTIONS ---
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const isNew = !storeData?.clients?.some((c) => c.id === editingClient.id);
      const res = await fetch("/api/control-panel/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isNew ? "create" : "update",
          client: editingClient
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(isNew ? "Akun pelanggan baru berhasil dibuat!" : "Data pelanggan berhasil diperbarui!");
        setIsClientModalOpen(false);
        setEditingClient(null);
        fetchControlPanelState();
      } else {
        showNotification(data.message || "Gagal menyimpan akun klien", "error");
      }
    } catch (err) {
      showNotification("Terjadi kesalahan jaringan", "error");
    }
  };

  const handleDeleteClient = async (client: DeveloperClientAccount) => {
    if (!confirm(`Yakin ingin menghapus akun pelanggan "${client.businessName}" (${client.clientName})?`)) return;

    try {
      const res = await fetch("/api/control-panel/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", client })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Akun pelanggan berhasil dihapus");
        fetchControlPanelState();
      }
    } catch (err) {
      showNotification("Gagal menghapus pelanggan", "error");
    }
  };

  const handleToggleClientActive = async (client: DeveloperClientAccount) => {
    try {
      const updated = { ...client, isActive: !client.isActive };
      const res = await fetch("/api/control-panel/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", client: updated })
      });
      if (res.ok) {
        showNotification(
          updated.isActive
            ? `Akun ${client.businessName} telah DI-AKTIFKAN kembali.`
            : `Akun ${client.businessName} telah DIBEKUKAN/NONAKTIF.`
        );
        fetchControlPanelState();
      }
    } catch (err) {
      showNotification("Gagal mengubah status akun", "error");
    }
  };

  const generateRandomLicense = (tier: "BASIC" | "PRO" | "ENTERPRISE") => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let p1 = "";
    let p2 = "";
    for (let i = 0; i < 4; i++) p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    return `SUNDA-${tier.substring(0, 3)}-${p1}-${p2}`;
  };

  // --- API CONFIG ACTIONS ---
  const handleSaveApiConfig = async () => {
    if (!storeData) return;
    try {
      const updatedConfig: DeveloperApiConfig = {
        ...storeData.apiConfig,
        masterGeminiApiKey: masterApiKeyInput.trim(),
        updatedAt: new Date().toISOString()
      };

      const res = await fetch("/api/control-panel/api-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiConfig: updatedConfig })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Master Gemini API Key & Pengaturan AI Engine berhasil disimpan!");
        fetchControlPanelState();
      } else {
        showNotification(data.message || "Gagal menyimpan API Key", "error");
      }
    } catch (err) {
      showNotification("Gagal menghubungi server", "error");
    }
  };

  const handleTestMasterGeminiKey = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await fetch("/api/test-gemini-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": masterApiKeyInput.trim()
        },
        body: JSON.stringify({ customApiKey: masterApiKeyInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiTestResult({
          success: true,
          message: "Koneksi Google Gemini API Aktif & Berfungsi Sempurna!",
          response: data.aiResponse
        });
      } else {
        setApiTestResult({
          success: false,
          message: data.message || "Gagal menghubungi Gemini API"
        });
      }
    } catch (err: any) {
      setApiTestResult({
        success: false,
        message: err.message || "Terjadi kesalahan jaringan saat tes API"
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // --- WEBSITE CONFIG ACTIONS ---
  const handleSaveWebsiteConfig = async () => {
    if (!webConfigForm) return;
    setIsSavingWebConfig(true);
    try {
      const res = await fetch("/api/control-panel/website-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteConfig: webConfigForm })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Teks website, judul, video & media berhasil diperbarui secara live!");
        fetchControlPanelState();
      } else {
        showNotification(data.message || "Gagal menyimpan konfigurasi website", "error");
      }
    } catch (err) {
      showNotification("Gagal menghubungi server", "error");
    } finally {
      setIsSavingWebConfig(false);
    }
  };

  // --- MEDIA MANAGER ACTIONS ---
  const handleAddMedia = () => {
    if (!webConfigForm || !newMediaForm.url || !newMediaForm.title) return;

    const media: MediaItem = {
      id: `media-${Date.now()}`,
      type: newMediaForm.type || "image",
      title: newMediaForm.title,
      url: newMediaForm.url,
      caption: newMediaForm.caption || "",
      placement: newMediaForm.placement || "gallery_food",
      isActive: newMediaForm.isActive !== false,
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updatedMediaList = [media, ...(webConfigForm.featuredMedia || [])];
    const updatedWebConfig = { ...webConfigForm, featuredMedia: updatedMediaList };

    setWebConfigForm(updatedWebConfig);
    setIsAddMediaModalOpen(false);
    setNewMediaForm({ type: "image", placement: "gallery_food", isActive: true });

    // Auto save
    fetch("/api/control-panel/website-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteConfig: updatedWebConfig })
    }).then(() => showNotification("Media baru berhasil ditambahkan!"));
  };

  const handleDeleteMedia = (id: string) => {
    if (!webConfigForm) return;
    const updated = (webConfigForm.featuredMedia || []).filter((m) => m.id !== id);
    const updatedConfig = { ...webConfigForm, featuredMedia: updated };
    setWebConfigForm(updatedConfig);

    fetch("/api/control-panel/website-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ websiteConfig: updatedConfig })
    }).then(() => showNotification("Media berhasil dihapus"));
  };

  // --- BROADCAST ACTIONS ---
  const handleCreateBroadcast = async () => {
    if (!newBroadcastForm.title || !newBroadcastForm.message) return;

    try {
      const res = await fetch("/api/control-panel/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          broadcast: newBroadcastForm
        })
      });
      if (res.ok) {
        showNotification("Pengumuman siaran berhasil dipublikasikan ke semua user!");
        setNewBroadcastForm({ type: "info", targetTiers: ["ALL"], isActive: true, title: "", message: "" });
        fetchControlPanelState();
      }
    } catch (err) {
      showNotification("Gagal mengirim siaran", "error");
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    try {
      await fetch("/api/control-panel/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", broadcast: { id } })
      });
      showNotification("Siaran dihapus");
      fetchControlPanelState();
    } catch (err) {
      showNotification("Gagal menghapus siaran", "error");
    }
  };

  // --- PIN CHANGE ACTION ---
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/control-panel/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin: currentPinInput, newPin: newPinInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Master PIN Developer berhasil diubah!");
        sessionStorage.setItem("sunda_dev_pin", newPinInput);
        setCurrentPinInput("");
        setNewPinInput("");
      } else {
        showNotification(data.message || "Gagal mengubah PIN", "error");
      }
    } catch (err) {
      showNotification("Gagal menghubungi server", "error");
    }
  };

  // If not authenticated, render sleek PIN login screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Developer & Master Control Panel
            </span>
            <h2 className="text-2xl font-serif font-bold text-stone-100 mt-2">
              Akses Master Pengembang
            </h2>
            <p className="text-xs text-stone-400">
              Kelola akun pelanggan, live CMS website, API key, dan media tanpa perlu deploy ulang.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyPin();
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                Masukkan Master PIN Developer:
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Default: 889900"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-xl px-4 py-3 text-stone-100 font-mono text-center tracking-widest text-lg outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-500 mt-1.5 italic">
                *PIN Default resmi: <span className="text-amber-400 font-mono font-bold">889900</span> (Dapat diubah di menu keamanan).
              </p>
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex gap-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isLoadingAuth || !inputPin}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoadingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                <span>Buka Control Panel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Clients
  const filteredClients = (storeData?.clients || []).filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.businessName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.licenseKey.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesTier = filterTier === "ALL" || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-stone-900/90 border border-amber-500/20 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg font-bold">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                Developer Master Control Panel
              </h1>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-full font-bold">
                LIVE PERSISTENT
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Pusat Manajemen Pelanggan, Live Website CMS, Master AI Engine & Pengaturan Pasca-Deploy
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchControlPanelState()}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl flex items-center gap-1.5 transition"
            title="Refresh Data dari Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Tutup Panel</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold shadow-lg transition animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Telemetry & Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Klien / Outlet</span>
          </span>
          <div className="text-2xl font-bold font-mono text-amber-200">
            {systemStats?.totalClients || storeData?.clients?.length || 0}
          </div>
          <span className="text-[10px] text-emerald-400">
            {systemStats?.activeClients || 0} Akun Aktif Berlangganan
          </span>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Master AI Engine</span>
          </span>
          <div className="text-base font-bold font-mono text-purple-200 truncate">
            {storeData?.apiConfig?.defaultAiModel || "Gemini 2.5 Flash"}
          </div>
          <span className="text-[10px] text-stone-400">
            {storeData?.apiConfig?.masterGeminiApiKey ? "🟢 Master Key Terkonfigurasi" : "🟡 Menggunakan Default System"}
          </span>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Status Live Website CMS</span>
          </span>
          <div className="text-base font-bold text-blue-200 truncate">
            {storeData?.websiteConfig?.appName || "SundaResto AI"}
          </div>
          <span className="text-[10px] text-emerald-400">
            ✓ Sinkronisasi Realtime Aktif
          </span>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server Uptime</span>
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            {systemStats?.uptimeHours || 0} <span className="text-xs font-normal">Jam</span>
          </div>
          <span className="text-[10px] text-stone-400">
            Node {systemStats?.nodeVersion || "v20+"}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-800 gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "clients"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "bg-stone-900 text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pelanggan & Lisensi ({storeData?.clients?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "api"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "bg-stone-900 text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Master API Key & Model AI</span>
        </button>

        <button
          onClick={() => setActiveTab("website")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "website"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "bg-stone-900 text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Live Website CMS (Teks & Slogan)</span>
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "media"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "bg-stone-900 text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Media & Video Promo ({storeData?.websiteConfig?.featuredMedia?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "broadcast"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "bg-stone-900 text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Siaran Pengumuman ({storeData?.broadcasts?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "security"
              ? "bg-amber-500 text-stone-950 font-bold shadow"
              : "bg-stone-900 text-stone-300 hover:bg-stone-800"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Keamanan & Master PIN</span>
        </button>
      </div>

      {/* --- TAB 1: CLIENTS & LICENSE MANAGEMENT --- */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Cari nama klien, bisnis resto, no lisensi, atau email..."
                className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-xl px-4 py-2 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none"
              >
                <option value="ALL">Semua Paket</option>
                <option value="BASIC">Starter (Basic)</option>
                <option value="PRO">Pro Multi-Saung</option>
                <option value="ENTERPRISE">Enterprise Franchise</option>
              </select>
            </div>

            <button
              onClick={() => {
                const newLicKey = generateRandomLicense("PRO");
                setEditingClient({
                  id: `client-${Date.now()}`,
                  clientName: "",
                  businessName: "",
                  email: "",
                  phone: "",
                  passwordPin: "123456",
                  tier: "PRO",
                  licenseKey: newLicKey,
                  isActive: true,
                  maxOutlets: 3,
                  maxSaung: 50,
                  expiryDate: "2027-12-31",
                  createdAt: new Date().toISOString().split("T")[0],
                  customFeatures: ["AI Voice POS Order", "Realtime Saung Grid", "KDS Kitchen & Bar", "Inventory BOM", "AI Co-Pilot"]
                });
                setIsClientModalOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Pelanggan Baru</span>
            </button>
          </div>

          {/* Client Table / Grid */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-4">Restoran & Pemilik</th>
                    <th className="p-4">Paket / Tier</th>
                    <th className="p-4">No. Lisensi Key</th>
                    <th className="p-4">Kuota Saung / Outlet</th>
                    <th className="p-4">Masa Berlaku</th>
                    <th className="p-4">Status Akun</th>
                    <th className="p-4 text-right">Aksi Developer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-500 italic">
                        Tidak ada data akun pelanggan yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-stone-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-stone-100 text-sm">{client.businessName || "Belum ada nama resto"}</div>
                          <div className="text-stone-400 text-[11px]">{client.clientName} • {client.phone || client.email}</div>
                          {client.notes && (
                            <div className="text-[10px] text-amber-400/80 italic mt-0.5">{client.notes}</div>
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${
                              client.tier === "ENTERPRISE"
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                : client.tier === "PRO"
                                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                                : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            {client.tier}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-bold text-amber-300">
                          <div className="flex items-center gap-1.5">
                            <span>{client.licenseKey}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(client.licenseKey);
                                showNotification("Lisensi berhasil disalin!");
                              }}
                              className="text-stone-500 hover:text-stone-300 p-1"
                              title="Salin Lisensi"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-stone-500 font-sans">PIN Login: {client.passwordPin}</div>
                        </td>

                        <td className="p-4">
                          <div className="text-stone-300 font-semibold">{client.maxOutlets} Outlet</div>
                          <div className="text-stone-500 text-[11px]">{client.maxSaung} Saung Lesehan</div>
                        </td>

                        <td className="p-4">
                          <div className="font-mono text-stone-200">{client.expiryDate}</div>
                          <div className="text-[10px] text-stone-500">Dibuat: {client.createdAt}</div>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleClientActive(client)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition ${
                              client.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                            }`}
                          >
                            {client.isActive ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            <span>{client.isActive ? "Aktif Berjalan" : "Dibekukan"}</span>
                          </button>
                        </td>

                        <td className="p-4 text-right space-x-1">
                          {onApplyClientLicense && (
                            <button
                              onClick={() => {
                                onApplyClientLicense(client);
                                showNotification(`Beralih ke akun pelanggan: ${client.businessName}`);
                              }}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
                              title="Login & Uji Akun Ini"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setIsClientModalOpen(true);
                            }}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg transition"
                            title="Edit Akun Pelanggan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="p-1.5 bg-stone-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: MASTER API KEY & AI ENGINE --- */}
      {activeTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Key Form */}
          <div className="lg:col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-5">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif font-bold text-lg text-amber-100">
                Pengaturan Master Google Gemini API Key
              </h2>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              API Key yang dimasukkan di sini akan menjadi <strong>Master API Key Server</strong> untuk seluruh
              fitur AI di aplikasi (Voice POS Order, Generator Resep Sunda, AI Co-Pilot, dan Analisis Cross-Module).
              Setiap pembaruan akan langsung berlaku untuk semua akun user tanpa redeploy!
            </p>

            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-200 block">
                Master Gemini API Key (Google AI Studio):
              </label>

              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={masterApiKeyInput}
                  onChange={(e) => setMasterApiKeyInput(e.target.value)}
                  placeholder="Masukkan API Key (AIzaSy...)"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-stone-100 font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveApiConfig}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Master API Key</span>
                </button>

                <button
                  onClick={handleTestMasterGeminiKey}
                  disabled={isTestingApi || !masterApiKeyInput}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl border border-stone-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? "animate-spin" : ""}`} />
                  <span>{isTestingApi ? "Menghubungi Gemini..." : "Tes Koneksi AI Live"}</span>
                </button>
              </div>
            </div>

            {/* Test Result Box */}
            {apiTestResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                  apiTestResult.success
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/80 border-rose-500/40 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {apiTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{apiTestResult.message}</span>
                </div>
                {apiTestResult.response && (
                  <p className="text-[11px] text-stone-300 font-mono bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                    Response AI: "{apiTestResult.response}"
                  </p>
                )}
              </div>
            )}

            {/* Default AI Model Selector */}
            <div className="pt-4 border-t border-stone-800 space-y-3">
              <label className="text-xs font-bold text-stone-200 block">
                Model Gemini Default:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", desc: "Super Cerdas & Responsif (Rekomendasi Utama)" },
                  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", desc: "Generasi Terbaru Stabil & Cepat" },
                  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", desc: "Ultra Cepat & Hemat untuk POS Voice" },
                  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", desc: "Analisis Bisnis & Strategi Mendalam" }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (storeData) {
                        setStoreData({
                          ...storeData,
                          apiConfig: { ...storeData.apiConfig, defaultAiModel: m.id as any }
                        });
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      storeData?.apiConfig?.defaultAiModel === m.id
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                        : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    <div className="font-bold text-xs text-stone-200">{m.name}</div>
                    <div className="text-[10px] text-stone-500">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* System Prompt Customization */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-stone-300 block">
                Executive Chef & Co-Pilot System Instruction:
              </label>
              <textarea
                value={storeData?.apiConfig?.systemPromptModifier || ""}
                onChange={(e) => {
                  if (storeData) {
                    setStoreData({
                      ...storeData,
                      apiConfig: { ...storeData.apiConfig, systemPromptModifier: e.target.value }
                    });
                  }
                }}
                rows={3}
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-xl p-3 text-xs text-stone-200 outline-none"
              />
            </div>
          </div>

          {/* Side Info & Troubleshooting */}
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <h3 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Panduan Developer API</span>
            </h3>

            <div className="text-xs text-stone-400 space-y-2.5 leading-relaxed">
              <p>
                1. Dapatkan API Key gratis di <strong>Google AI Studio</strong> (aistudio.google.com).
              </p>
              <p>
                2. Kunci disimpan terenkripsi di server (file store) dan tidak diekspos ke browser pelanggan.
              </p>
              <p>
                3. Jika pelanggan ingin menggunakan API key mereka sendiri, aktifkan toggle di bawah.
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300 font-semibold">Izinkan Klien Pakai Kunci Sendiri</span>
                <input
                  type="checkbox"
                  checked={storeData?.apiConfig?.enableUserCustomApiKey !== false}
                  onChange={(e) => {
                    if (storeData) {
                      setStoreData({
                        ...storeData,
                        apiConfig: { ...storeData.apiConfig, enableUserCustomApiKey: e.target.checked }
                      });
                    }
                  }}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
              </div>
              <p className="text-[10px] text-stone-500">
                Jika dimatikan, seluruh klien wajib menggunakan Master API Key pengembang.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: LIVE WEBSITE CMS (COPYWRITING & SLOGAN) --- */}
      {activeTab === "website" && webConfigForm && (
        <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <span>Live Website Copywriting & Text Editor</span>
              </h2>
              <p className="text-xs text-stone-400">
                Ubah judul, slogan, nomor WhatsApp, deskripsi, dan harga paket langsung dari panel ini.
              </p>
            </div>

            <button
              onClick={handleSaveWebsiteConfig}
              disabled={isSavingWebConfig}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingWebConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan & Terapkan ke Website Live</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Nama Brand / Aplikasi:</label>
              <input
                type="text"
                value={webConfigForm.appName}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, appName: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Tagline Sub-Brand:</label>
              <input
                type="text"
                value={webConfigForm.appTagline}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, appTagline: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Judul Utama Hero (Awal):</label>
              <input
                type="text"
                value={webConfigForm.heroHeadline}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, heroHeadline: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Teks Sorotan Warna Emas (Highlight):</label>
              <input
                type="text"
                value={webConfigForm.heroHighlightText}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, heroHighlightText: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-bold outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Deskripsi Panjang Hero Section:</label>
              <textarea
                value={webConfigForm.heroDescription}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, heroDescription: e.target.value })}
                rows={3}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Pita Teks Atas (Running Announcement Bar):</label>
              <input
                type="text"
                value={webConfigForm.topAnnouncementText}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, topAnnouncementText: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Badge Hero Kecil:</label>
              <input
                type="text"
                value={webConfigForm.heroBadgeText}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, heroBadgeText: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Kontak WhatsApp Admin / Sales:</label>
              <input
                type="text"
                value={webConfigForm.contactWhatsapp}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, contactWhatsapp: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Email Developer / Support:</label>
              <input
                type="email"
                value={webConfigForm.contactEmail}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, contactEmail: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Alamat Lengkap Showroom / Resto Utama:</label>
              <input
                type="text"
                value={webConfigForm.restaurantAddress}
                onChange={(e) => setWebConfigForm({ ...webConfigForm, restaurantAddress: e.target.value })}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: MEDIA & PROMO VIDEO MANAGER --- */}
      {activeTab === "media" && webConfigForm && (
        <div className="space-y-6">
          {/* Promo Video Banner Section */}
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  <span>Video Promo & Demo Aplikasi di Halaman Depan</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Dukung sematan video YouTube, YouTube NoCookie, atau link MP4 direct.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-300 font-semibold">Tampilkan Video di Landing Page:</span>
                <input
                  type="checkbox"
                  checked={webConfigForm.isPromoVideoEnabled !== false}
                  onChange={(e) => setWebConfigForm({ ...webConfigForm, isPromoVideoEnabled: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Judul Video Promo:</label>
                <input
                  type="text"
                  value={webConfigForm.promoVideoTitle || ""}
                  onChange={(e) => setWebConfigForm({ ...webConfigForm, promoVideoTitle: e.target.value })}
                  placeholder="Contoh: Video Tour Resto & Demo Order Suara AI"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">URL Embed Video (YouTube/MP4):</label>
                <input
                  type="text"
                  value={webConfigForm.promoVideoUrl || ""}
                  onChange={(e) => setWebConfigForm({ ...webConfigForm, promoVideoUrl: e.target.value })}
                  placeholder="https://www.youtube-nocookie.com/embed/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 font-mono outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Live Video Preview */}
            {webConfigForm.promoVideoUrl && (
              <div className="pt-2">
                <span className="text-[11px] text-stone-400 font-semibold block mb-2">Live Video Preview:</span>
                <div className="aspect-video max-w-lg bg-stone-950 rounded-xl border border-stone-800 overflow-hidden shadow-lg">
                  <iframe
                    src={webConfigForm.promoVideoUrl}
                    title="Live Promo Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gallery Media Items */}
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Galeri Foto Masakan Sunda & Saung Lesehan</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Foto-foto ini akan ditampilkan di katalog dan galeri landing page untuk menarik pelanggan baru.
                </p>
              </div>

              <button
                onClick={() => setIsAddMediaModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Foto/Media Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(webConfigForm.featuredMedia || []).map((media) => (
                <div
                  key={media.id}
                  className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden group hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-stone-900 overflow-hidden">
                    <img
                      src={media.url}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-stone-950/80 backdrop-blur-md rounded text-[9px] font-bold uppercase text-amber-300 border border-stone-800">
                      {media.placement.replace("_", " ")}
                    </span>
                  </div>

                  <div className="p-3 space-y-1">
                    <div className="font-bold text-xs text-stone-100">{media.title}</div>
                    {media.caption && <p className="text-[11px] text-stone-400">{media.caption}</p>}
                  </div>

                  <div className="p-3 pt-0 flex items-center justify-between border-t border-stone-900 text-xs">
                    <span className="text-[10px] text-stone-500">{media.createdAt}</span>
                    <button
                      onClick={() => handleDeleteMedia(media.id)}
                      className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
                      title="Hapus Media"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: BROADCAST NOTIFICATIONS --- */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <span>Buat Pengumuman Siaran Baru</span>
            </h3>
            <p className="text-xs text-stone-400">
              Pesan ini akan langsung muncul sebagai banner atau notifikasi di dashboard semua pelanggan yang sedang login.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  value={newBroadcastForm.title || ""}
                  onChange={(e) => setNewBroadcastForm({ ...newBroadcastForm, title: e.target.value })}
                  placeholder="Contoh: 🚀 Update Sistem AI v2.5 Tersedia!"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Isi Pesan Siaran:</label>
                <textarea
                  value={newBroadcastForm.message || ""}
                  onChange={(e) => setNewBroadcastForm({ ...newBroadcastForm, message: e.target.value })}
                  placeholder="Tulis rincian pesan untuk pelanggan resto..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Tipe Pesan:</label>
                <select
                  value={newBroadcastForm.type}
                  onChange={(e) => setNewBroadcastForm({ ...newBroadcastForm, type: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none"
                >
                  <option value="info">Info / Pengumuman</option>
                  <option value="promo">Promo & Bonus</option>
                  <option value="warning">Penting / Perhatian</option>
                  <option value="maintenance">Jadwal Maintenance Server</option>
                </select>
              </div>

              <button
                onClick={handleCreateBroadcast}
                disabled={!newBroadcastForm.title || !newBroadcastForm.message}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Siaran ke Seluruh User</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-200">
              Daftar Siaran Aktif ({storeData?.broadcasts?.length || 0})
            </h3>

            <div className="space-y-3">
              {(storeData?.broadcasts || []).map((bc) => (
                <div
                  key={bc.id}
                  className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-100">{bc.title}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {bc.type}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400">{bc.message}</p>
                    <span className="text-[10px] text-stone-600 font-mono block pt-1">{bc.createdAt}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteBroadcast(bc.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
                    title="Hapus Siaran"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: SECURITY & MASTER PIN --- */}
      {activeTab === "security" && (
        <div className="max-w-xl mx-auto bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif font-bold text-lg text-amber-100">
              Keamanan Master PIN Developer
            </h2>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Master PIN ini digunakan untuk mengakses Developer Control Panel. Pastikan menyimpan PIN di tempat aman.
          </p>

          <form onSubmit={handleChangePin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Master PIN Saat Ini:</label>
              <input
                type="password"
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value)}
                placeholder="Masukkan PIN saat ini (default: 889900)"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Master PIN Baru:</label>
              <input
                type="password"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="Minimal 4 digit angka/huruf rahasia"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={!currentPinInput || !newPinInput}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
            >
              Simpan Master PIN Baru
            </button>
          </form>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT CLIENT --- */}
      {isClientModalOpen && editingClient && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Form Akun Pelanggan & Lisensi Resto</span>
              </h3>
              <button
                onClick={() => {
                  setIsClientModalOpen(false);
                  setEditingClient(null);
                }}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Nama Bisnis / Resto Sunda:</label>
                  <input
                    type="text"
                    required
                    value={editingClient.businessName}
                    onChange={(e) => setEditingClient({ ...editingClient, businessName: e.target.value })}
                    placeholder="Contoh: RM Saung Talaga Pasundan"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Nama Lengkap Pemilik / Klien:</label>
                  <input
                    type="text"
                    required
                    value={editingClient.clientName}
                    onChange={(e) => setEditingClient({ ...editingClient, clientName: e.target.value })}
                    placeholder="Contoh: Bpk. H. Dedi Mulyadi"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Email Pemilik:</label>
                  <input
                    type="email"
                    required
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    placeholder="owner@saungresto.id"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Nomor WhatsApp / HP:</label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Pilihan Paket Langganan:</label>
                  <select
                    value={editingClient.tier}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setEditingClient({
                        ...editingClient,
                        tier: t,
                        maxOutlets: t === "ENTERPRISE" ? 99 : t === "PRO" ? 3 : 1,
                        maxSaung: t === "ENTERPRISE" ? 999 : t === "PRO" ? 50 : 10
                      });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-amber-300 font-bold outline-none"
                  >
                    <option value="BASIC">Starter (1 Outlet, 10 Saung)</option>
                    <option value="PRO">Pro Multi-Saung (3 Outlet, 50 Saung)</option>
                    <option value="ENTERPRISE">Enterprise Franchise (Unlimited)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-300">Nomor Lisensi Kunci:</label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingClient({
                          ...editingClient,
                          licenseKey: generateRandomLicense(editingClient.tier)
                        })
                      }
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      🎲 Acak Baru
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingClient.licenseKey}
                    onChange={(e) => setEditingClient({ ...editingClient, licenseKey: e.target.value.toUpperCase() })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">PIN Login Akun Klien:</label>
                  <input
                    type="text"
                    required
                    value={editingClient.passwordPin}
                    onChange={(e) => setEditingClient({ ...editingClient, passwordPin: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-300">Masa Aktif Sampai:</label>
                  <input
                    type="date"
                    value={editingClient.expiryDate}
                    onChange={(e) => setEditingClient({ ...editingClient, expiryDate: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-300">Catatan Khusus Pengembang:</label>
                <input
                  type="text"
                  value={editingClient.notes || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  placeholder="Contoh: Cabang Lembang, Paket promo tahunan"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl font-bold shadow"
                >
                  Simpan Akun Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD MEDIA --- */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span>Tambah Foto / Gambar Menu Baru</span>
              </h3>
              <button onClick={() => setIsAddMediaModalOpen(false)} className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-300 block mb-1">Judul Foto:</label>
                <input
                  type="text"
                  value={newMediaForm.title || ""}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, title: e.target.value })}
                  placeholder="Contoh: Karedok Leunca Khas Sunda"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">URL Gambar (Unsplash / CDN):</label>
                <input
                  type="text"
                  value={newMediaForm.url || ""}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none font-mono"
                />
              </div>

              {/* Quick Presets for Sundanese food photos */}
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400">Pilihan Cepat Foto Sunda Unsplash:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { title: "Nasi Liwet", url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" },
                    { title: "Ikan Gurame Bakar", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" },
                    { title: "Saung Lesehan Bambu", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" },
                    { title: "Ayam Goreng Lengkuas", url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80" },
                    { title: "Es Kelapa Muda Jeruk", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80" }
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() =>
                        setNewMediaForm({
                          ...newMediaForm,
                          title: preset.title,
                          url: preset.url
                        })
                      }
                      className="px-2 py-0.5 bg-stone-800 hover:bg-amber-500/20 text-stone-300 hover:text-amber-200 text-[10px] rounded border border-stone-700"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">Penempatan Media:</label>
                <select
                  value={newMediaForm.placement}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, placement: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none"
                >
                  <option value="gallery_food">Galeri Masakan & Kuliner</option>
                  <option value="gallery_saung">Galeri Saung & Suasana Resto</option>
                  <option value="hero_banner">Banner Utama Halaman Depan</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">Keterangan / Caption Singkat:</label>
                <input
                  type="text"
                  value={newMediaForm.caption || ""}
                  onChange={(e) => setNewMediaForm({ ...newMediaForm, caption: e.target.value })}
                  placeholder="Contoh: Gurame bakar arang dengan lalapan segar"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddMediaModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddMedia}
                  disabled={!newMediaForm.url || !newMediaForm.title}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl font-bold shadow disabled:opacity-50"
                >
                  Tambahkan ke Galeri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
