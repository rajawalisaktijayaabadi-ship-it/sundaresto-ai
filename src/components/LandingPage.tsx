import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  UtensilsCrossed,
  LayoutGrid,
  TrendingUp,
  ShieldCheck,
  Check,
  ArrowRight,
  Smartphone,
  Monitor,
  Store,
  Layers,
  ChefHat,
  Receipt,
  Zap,
  Users,
  Play,
  Film,
  Image as ImageIcon,
  ShieldAlert,
  Radio,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { formatRupiah } from "../utils/formatters";
import { WebsiteConfig, MediaItem, BroadcastNotification } from "../types/controlPanel";

interface LandingPageProps {
  onOpenLogin: () => void;
  onQuickDemo: (tier: "BASIC" | "PRO" | "ENTERPRISE") => void;
  onOpenDeveloperControlPanel?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onQuickDemo,
  onOpenDeveloperControlPanel
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "ENTERPRISE">("PRO");
  const [liveConfig, setLiveConfig] = useState<WebsiteConfig | null>(null);
  const [activeBroadcasts, setActiveBroadcasts] = useState<BroadcastNotification[]>([]);
  const [galleryFilter, setGalleryFilter] = useState<"all" | "food" | "saung">("all");

  // Fetch live website content from server CMS
  useEffect(() => {
    const fetchLiveWebsiteConfig = async () => {
      try {
        const res = await fetch("/api/public/website-config");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.websiteConfig) {
            setLiveConfig(json.websiteConfig);
            setActiveBroadcasts(json.activeBroadcasts || []);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live website config, using defaults:", err);
      }
    };
    fetchLiveWebsiteConfig();
  }, []);

  // Filtered media items from live CMS
  const mediaItems = liveConfig?.featuredMedia || [];
  const displayedMedia = mediaItems.filter((m) => {
    if (!m.isActive) return false;
    if (galleryFilter === "food") return m.placement === "gallery_food";
    if (galleryFilter === "saung") return m.placement === "gallery_saung";
    return true;
  });

  return (
    <div className="min-w-full min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Banner (Live from CMS) */}
      {(liveConfig?.isAnnouncementActive !== false || activeBroadcasts.length > 0) && (
        <div className="bg-gradient-to-r from-emerald-900 via-amber-700 to-emerald-950 px-4 py-2 text-center text-xs md:text-sm font-semibold text-amber-200 border-b border-amber-500/20 flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
          <span>
            {activeBroadcasts[0]?.message ||
              liveConfig?.topAnnouncementText ||
              "SundaResto AI v2.5 - Terintegrasi Google Gemini AI, Support Voice POS & Multi-Saung"}
          </span>
          <span className="hidden md:inline bg-amber-400/20 px-2 py-0.5 rounded text-[10px] text-amber-300 border border-amber-400/30">
            Live Server CMS
          </span>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-stone-800/80 sticky top-0 bg-stone-950/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-amber-400/30">
            <UtensilsCrossed className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-emerald-200 bg-clip-text text-transparent">
              {liveConfig?.appName || "SundaResto"} <span className="font-sans font-extrabold text-amber-400 text-sm px-1.5 py-0.5 bg-amber-400/10 rounded border border-amber-400/30 ml-1">AI</span>
            </h1>
            <p className="text-[10px] text-stone-400 tracking-wider uppercase">
              {liveConfig?.appTagline || "Smart POS & Resto Operating System"}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <a href="#fitur" className="hover:text-amber-400 transition">Fitur Utama</a>
          <a href="#demo-video" className="hover:text-amber-400 transition">Video Demo</a>
          <a href="#galeri" className="hover:text-amber-400 transition">Galeri Resto</a>
          <a href="#harga" className="hover:text-amber-400 transition">Pricing</a>
          <a href="#faq" className="hover:text-amber-400 transition">FAQ</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenDeveloperControlPanel && (
            <button
              onClick={onOpenDeveloperControlPanel}
              className="px-3 py-2 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition flex items-center gap-1.5"
              title="Akses Developer & Control Panel (Edit Post-Deploy)"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Developer Panel</span>
            </button>
          )}

          <button
            onClick={onOpenLogin}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-200 hover:text-white hover:bg-stone-800 rounded-xl border border-stone-700 transition"
          >
            Aktivasi Lisensi
          </button>

          <button
            onClick={() => onQuickDemo("PRO")}
            className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition"
          >
            <Zap className="w-4 h-4" />
            <span>Coba Demo</span>
          </button>
        </div>
      </nav>

      {/* Hero Section (Live Dynamic Copywriting) */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-900/30 to-amber-600/20 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-xl">
          <Bot className="w-4 h-4 text-amber-400" />
          <span>{liveConfig?.heroBadgeText || "Aplikasi Smart AI Pertama Khusus Rumah Makan Sunda & Saung Lesehan"}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-amber-100 max-w-4xl mx-auto leading-tight">
          {liveConfig?.heroHeadline || "Kelola Rumah Makan Sunda Lebih"}{" "}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300 bg-clip-text text-transparent">
            {liveConfig?.heroHighlightText || "Mewah, Cerdas & Cepat"}
          </span>{" "}
          dengan AI
        </h1>

        <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
          {liveConfig?.heroDescription ||
            "Platform POS terintegrasi khusus kuliner Pasundan: Order Suara AI, Manajemen Saung Lesehan Real-time, KDS Dapur, Hitung HPP & Stok Bahan (BOM), serta AI Marketing Consultant."}
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onQuickDemo("PRO")}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-base rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 hover:scale-105 transition transform"
          >
            <Sparkles className="w-5 h-5 text-stone-950" />
            Buka Demo Aplikasi Sekarang
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-8 py-4 bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-base rounded-2xl border border-amber-500/30 flex items-center justify-center gap-2 transition"
          >
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            Aktivasi Kunci Lisensi Resto
          </button>
        </div>

        {/* Devices supported badge */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 border-t border-stone-800/60 pt-6">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-amber-400" />
            <span>PC & Laptop Kasir</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android / Tablet POS</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span>iPhone & iPad Waiter</span>
          </div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Single & Multi-Outlet</span>
          </div>
        </div>
      </section>

      {/* --- PROMO VIDEO SECTION (LIVE FROM CMS) --- */}
      {liveConfig?.isPromoVideoEnabled !== false && liveConfig?.promoVideoUrl && (
        <section id="demo-video" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Video Demo Langsung</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
              {liveConfig.promoVideoTitle || "Lihat Cara Kerja SundaResto AI di Lapangan"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto">
              Simak kemudahan operasional pelayan saung dan kasir saat menerima pesanan suara AI dalam hitungan detik.
            </p>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-amber-500/30 bg-stone-900 shadow-2xl shadow-amber-500/10 max-w-4xl mx-auto">
            <iframe
              src={liveConfig.promoVideoUrl}
              title={liveConfig.promoVideoTitle || "Promo Video"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      {/* --- DYNAMIC MEDIA GALLERY (FOTO SAUNG & KULINER) --- */}
      {displayedMedia.length > 0 && (
        <section id="galeri" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-t border-stone-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block mb-1">
                Galeri Visual
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
                Suasana Saung Asri & Kuliner Autentik
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                onClick={() => setGalleryFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                  galleryFilter === "all" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Semua Foto
              </button>
              <button
                onClick={() => setGalleryFilter("food")}
                className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                  galleryFilter === "food" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Masakan Sunda
              </button>
              <button
                onClick={() => setGalleryFilter("saung")}
                className={`px-3 py-1.5 rounded-lg transition font-semibold ${
                  galleryFilter === "saung" ? "bg-amber-500 text-stone-950 font-bold" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                Saung & Lesehan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMedia.map((item) => (
              <div
                key={item.id}
                className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden group hover:border-amber-500/40 transition flex flex-col shadow-xl"
              >
                <div className="relative aspect-4/3 bg-stone-950 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-950/80 backdrop-blur-md rounded-lg text-[10px] font-extrabold uppercase text-amber-300 border border-stone-800 shadow">
                    {item.placement === "gallery_food" ? "Kuliner Pasundan" : "Saung Lesehan"}
                  </span>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-amber-100">{item.title}</h4>
                  {item.caption && <p className="text-xs text-stone-400">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pricing Section (Dynamic from CMS) */}
      <section id="harga" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-800/80 text-center">
        <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">Paket Lisensi Resto</h2>
        <p className="text-3xl font-serif font-bold text-amber-100 mb-12">Pilih Paket Sesuai Kebutuhan Saung & Cabang</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
          {/* Starter Plan */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Starter Lesehan</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-stone-100">
                  {formatRupiah(liveConfig?.pricingStarterMonthly || 149000)}
                </span>
                <span className="text-xs text-stone-400">/bulan</span>
              </div>
              <p className="text-xs text-stone-400">Cocok untuk 1 warung makan Sunda atau lesehan baru merintis.</p>

              <ul className="space-y-2.5 text-xs text-stone-300 pt-4 border-t border-stone-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>1 Outlet Kasir</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Maksimal 10 Saung / Meja</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>POS Standard & Cetak Struk</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Inventori Bahan Dasar</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickDemo("BASIC")}
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition"
            >
              Coba Starter Demo
            </button>
          </div>

          {/* Pro Plan (Best Value) */}
          <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/40 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-amber-500/10">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow">
              Paling Populer
            </span>

            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pro Multi-Saung</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-amber-200">
                  {formatRupiah(liveConfig?.pricingProMonthly || 299000)}
                </span>
                <span className="text-xs text-stone-400">/bulan</span>
              </div>
              <p className="text-xs text-stone-400">Ideal untuk Rumah Makan Saung Lesehan 10-50 Saung dengan KDS Dapur.</p>

              <ul className="space-y-2.5 text-xs text-stone-200 pt-4 border-t border-stone-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Maksimal 3 Outlet / Cabang</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Hingga 50 Saung / Meja Lesehan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>AI Voice POS Order Terintegrasi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>KDS Layar Dapur & Bar Minuman</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Resep BOM & Hitung HPP Otomatis</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickDemo("PRO")}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              Coba Pro Demo Gratis
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Enterprise Franchise</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-stone-100">
                  {formatRupiah(liveConfig?.pricingEnterpriseMonthly || 799000)}
                </span>
                <span className="text-xs text-stone-400">/bulan</span>
              </div>
              <p className="text-xs text-stone-400">Untuk grup restoran multi-cabang dengan ribuan transaksi harian.</p>

              <ul className="space-y-2.5 text-xs text-stone-300 pt-4 border-t border-stone-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Unlimited Outlet & Saung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Full AI Executive & Marketing Pilot</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Transfer Stok Antar Gudang Cabang</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  <span>Custom Branding & Thermal Logo</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onQuickDemo("ENTERPRISE")}
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition"
            >
              Coba Enterprise Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contact & Footer Section (Dynamic from CMS) */}
      <footer className="py-12 border-t border-stone-800 text-xs text-stone-400 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-left">
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-amber-200 text-sm">
              {liveConfig?.appName || "SundaResto AI"}
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              {liveConfig?.appTagline || "Sistem Operasional Digital Rumah Makan Sunda & Saung Lesehan Pertama di Indonesia."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-amber-200 text-sm">Kontak & Dukungan Pengembang</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>WhatsApp: {liveConfig?.contactWhatsapp || "0812-8888-9900"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Email: {liveConfig?.contactEmail || "developer@sundaresto.ai"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{liveConfig?.restaurantAddress || "Jl. Raya Parahyangan No. 128, Bandung"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif font-bold text-amber-200 text-sm">Akses Pengembang / Owner</h4>
            <p className="text-xs text-stone-400">
              Kelola user, CMS website, API key, dan media tanpa perlu redeploy.
            </p>
            {onOpenDeveloperControlPanel && (
              <button
                onClick={onOpenDeveloperControlPanel}
                className="mt-2 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Buka Master Control Panel</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-stone-800/80 pt-6 text-center text-[11px] text-stone-500">
          <p>{liveConfig?.footerCopyright || "© 2026 SundaResto AI. Hak Cipta Dilindungi Undang-Undang."}</p>
        </div>
      </footer>
    </div>
  );
};
