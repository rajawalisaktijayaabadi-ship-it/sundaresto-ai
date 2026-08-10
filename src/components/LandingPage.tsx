import React, { useState } from "react";
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
  Users
} from "lucide-react";
import { formatRupiah } from "../utils/formatters";

interface LandingPageProps {
  onOpenLogin: () => void;
  onQuickDemo: (tier: "BASIC" | "PRO" | "ENTERPRISE") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onQuickDemo }) => {
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "ENTERPRISE">("PRO");

  return (
    <div className="min-w-full min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-amber-700 to-emerald-950 px-4 py-2 text-center text-xs md:text-sm font-semibold text-amber-200 border-b border-amber-500/20 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>SundaResto AI v2.5 - Terintegrasi Google Gemini AI, Support Voice POS & Multi-Saung</span>
        <span className="hidden md:inline bg-amber-400/20 px-2 py-0.5 rounded text-[10px] text-amber-300 border border-amber-400/30">
          Ready for Indonesia Market
        </span>
      </div>

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-stone-800/80 sticky top-0 bg-stone-950/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-amber-400/30">
            <UtensilsCrossed className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-emerald-200 bg-clip-text text-transparent">
              SundaResto <span className="font-sans font-extrabold text-amber-400 text-sm px-1.5 py-0.5 bg-amber-400/10 rounded border border-amber-400/30 ml-1">AI</span>
            </h1>
            <p className="text-[10px] text-stone-400 tracking-wider uppercase">Smart POS & Resto Operating System</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <a href="#fitur" className="hover:text-amber-400 transition">Fitur Utama</a>
          <a href="#ai-copilot" className="hover:text-amber-400 transition">AI Features</a>
          <a href="#harga" className="hover:text-amber-400 transition">Pricing</a>
          <a href="#faq" className="hover:text-amber-400 transition">FAQ</a>
          <a href="#testimoni" className="hover:text-amber-400 transition">Testimoni</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 text-sm font-semibold text-stone-200 hover:text-white hover:bg-stone-800 rounded-xl border border-stone-700 transition"
          >
            Aktivasi Lisensi
          </button>
          <button
            onClick={() => onQuickDemo("PRO")}
            className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
          >
            <Zap className="w-4 h-4" />
            Coba Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-900/30 to-amber-600/20 rounded-full blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-xl">
          <Bot className="w-4 h-4 text-amber-400" />
          <span>Aplikasi Smart AI Pertama Khusus Rumah Makan Sunda & Saung Lesehan</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-amber-100 max-w-4xl mx-auto leading-tight">
          Kelola Rumah Makan Sunda Lebih <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300 bg-clip-text text-transparent">Mewah, Cerdas & Cepat</span> dengan AI
        </h1>

        <p className="mt-6 text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
          Platform POS terintegrasi khusus kuliner Pasundan: Order Suara AI, Manajemen Saung Lesehan Real-time, KDS Dapur, Hitung HPP & Stok Bahan (BOM), serta AI Marketing Consultant.
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

        {/* Live Mock Dashboard Preview Card */}
        <div className="mt-12 relative max-w-5xl mx-auto rounded-3xl border border-amber-500/30 bg-stone-900/90 shadow-2xl p-4 sm:p-6 text-left overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-mono text-stone-400 ml-2">RM Saung Pasundan Dago - Live POS System</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-500/30">
              ● PRO LICENSE ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Saung Grid Preview */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span className="flex items-center gap-1.5"><LayoutGrid className="w-4 h-4 text-amber-400" /> Denah Saung & Meja</span>
                <span className="text-emerald-400 font-mono">12 Saung</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-950/80 border border-emerald-500/40 p-2 rounded-lg text-emerald-200 font-bold">Saung 01<div className="text-[10px] text-stone-400">Isi</div></div>
                <div className="bg-amber-950/80 border border-amber-500/40 p-2 rounded-lg text-amber-200 font-bold">Saung 02<div className="text-[10px] text-stone-400">Masak</div></div>
                <div className="bg-stone-900 border border-stone-800 p-2 rounded-lg text-stone-300 font-semibold">Saung 03<div className="text-[10px] text-emerald-400">Kosong</div></div>
                <div className="bg-sky-950/80 border border-sky-500/40 p-2 rounded-lg text-sky-200 font-bold">Saung 04<div className="text-[10px] text-stone-400">Bill</div></div>
                <div className="bg-purple-950/80 border border-purple-500/40 p-2 rounded-lg text-purple-200 font-bold">Saung 05<div className="text-[10px] text-stone-400">Booked</div></div>
                <div className="bg-stone-900 border border-stone-800 p-2 rounded-lg text-stone-300 font-semibold">Saung 06<div className="text-[10px] text-emerald-400">Kosong</div></div>
              </div>
            </div>

            {/* Smart Voice AI Input Preview */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-emerald-400" /> AI Voice & Text Order</span>
                <span className="text-amber-400 text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">Gemini 3.6</span>
              </div>
              <div className="bg-stone-900 p-3 rounded-lg border border-stone-800 text-xs text-stone-300 italic">
                "Pesan 2 Nasi Liwet Saung 04, 1 Gurame Bakar Kecap pedas sedang, 3 Es Teh Manis Jumbo..."
              </div>
              <div className="text-[11px] bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/30 text-emerald-200 font-medium">
                ✓ Auto-Parsed ke Saung 04 (3 Menu, Total Rp 202.000)
              </div>
            </div>

            {/* Daily KPI Preview */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-emerald-400" /> Ringkasan Hari Ini</span>
                <span className="text-stone-400 text-[10px]">9 Ags 2026</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-stone-900 p-2 rounded-lg">
                  <span className="text-stone-400">Omset Penjualan:</span>
                  <span className="font-bold text-emerald-400 font-mono">Rp 14.850.000</span>
                </div>
                <div className="flex justify-between items-center bg-stone-900 p-2 rounded-lg">
                  <span className="text-stone-400">Total Pesanan:</span>
                  <span className="font-bold text-amber-200 font-mono">42 Transaksi</span>
                </div>
                <div className="flex justify-between items-center bg-stone-900 p-2 rounded-lg">
                  <span className="text-stone-400">Menu Terlaris:</span>
                  <span className="font-semibold text-amber-300">Gurame Bakar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">Fitur Terlengkap Restoran Sunda</h2>
          <p className="text-3xl font-serif font-bold text-amber-100">Dirancang Khusus Alur Rumah Makan Sunda & Saung Lesehan</p>
          <p className="mt-3 text-stone-400 text-sm">Semua modul saling terintegrasi otomatis: POS, Saung, Dapur, Stok Bahan, hingga Laporan Keuangan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-200 mb-2">AI Voice & Natural Text POS Order</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Kasir atau Waiter cukup mengetik atau menyebut pesanan lisan. Gemini AI otomatis mengurai menu, jumlah, porsi, catatan pedas, dan nomor saung.
            </p>
          </div>

          <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-200 mb-2">Peta Denah Saung Lesehan Real-time</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Pantau status Saung 1-50 (Kosong, Masak, Minta Bill, Terisi, Booked). Dukung pendaftaran rombongan dan pindah saung instan.
            </p>
          </div>

          <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-200 mb-2">KDS Kitchen Display System</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Layar Dapur & Bar realtime dipisah berdasarkan Stasiun (Dapur Bakar/Goreng, Tumis & Liwet, Bar Es). Timer durasi masak otomatis.
            </p>
          </div>

          <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-200 mb-2">Hitung HPP & Stok Bahan (BOM)</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Setiap kali porsi Nasi Liwet / Gurame Bakar terjual, stok beras, ikan, dan cabai otomatis terpotong presisi beserta hitungan margin HPP.
            </p>
          </div>

          <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-200 mb-2">Struk Thermal 80mm & QRIS Payment</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dukungan cetak struk kasir thermal, kalkulasi Pajak PB1 10%, Service Charge 5%, Split Bill, dan cetak QRIS dinamis.
            </p>
          </div>

          <div className="bg-stone-900/60 p-6 rounded-2xl border border-stone-800 hover:border-amber-500/40 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-amber-200 mb-2">Multi-Outlet & Multi-Cabang</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Kelola cabang Dago Bandung, Bogor, Serpong, dan Jakarta dalam satu akun terpusat dengan laporan konsolidasi omset harian.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section with License Simulator */}
      <section id="harga" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">Lisensi Software SundaResto AI</h2>
          <p className="text-3xl font-serif font-bold text-amber-100">Beli Sekali atau Langganan Lisensi Siap Pakai</p>
          <p className="mt-3 text-stone-400 text-sm">Pilih paket sesuai skala rumah makan Sunda Anda. Bisa dijual kembali oleh Software Reseller.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pro Plan */}
          <div className="bg-stone-900 rounded-3xl p-8 border-2 border-amber-500 relative shadow-2xl flex flex-col justify-between">
            <div className="absolute -top-4 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              PALING POPULER
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-200">SundaResto Pro</h3>
              <p className="text-xs text-stone-400 mt-1">Ideal untuk Rumah Makan Saung Lesehan 1-3 Cabang</p>
              <div className="mt-6 font-mono font-bold text-3xl text-amber-400">
                {formatRupiah(2490000)} <span className="text-xs font-sans text-stone-400 font-normal">/ tahun / outlet</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">✓ Termasuk Lisensi Aktif `SUNDA-PRO-2026-X9A`</p>

              <ul className="mt-6 space-y-3 text-xs text-stone-300 border-t border-stone-800 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Hingga 3 Outlet Cabang</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Hingga 50 Saung & Meja Lesehan</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Full Voice AI POS Order Input</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Layar Dapur KDS (Dapur & Bar)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Manajemen Stok Bahan & HPP (BOM)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Gemini AI Menu & Marketing Co-Pilot</li>
              </ul>
            </div>

            <button
              onClick={() => onQuickDemo("PRO")}
              className="mt-8 w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg transition"
            >
              Aktifkan Lisensi Pro (Demo)
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-stone-900/80 rounded-3xl p-8 border border-stone-800 hover:border-stone-700 transition flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-100">SundaResto Enterprise</h3>
              <p className="text-xs text-stone-400 mt-1">Untuk Grup Restoran & Waralaba Sunda Multi-Outlet</p>
              <div className="mt-6 font-mono font-bold text-3xl text-stone-100">
                {formatRupiah(5990000)} <span className="text-xs font-sans text-stone-400 font-normal">/ tahun</span>
              </div>
              <p className="text-[11px] text-amber-400 mt-1">✓ Unlimited Outlet & Custom Brand Logo</p>

              <ul className="mt-6 space-y-3 text-xs text-stone-300 border-t border-stone-800 pt-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Unlimited Outlet & Saung Lesehan</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Fitur Reseller License Generator</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Smart Stock Forecasting AI</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Laporan Konsolidasi Holding Group</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Priority Support 24/7 Indonesia</li>
              </ul>
            </div>

            <button
              onClick={() => onQuickDemo("ENTERPRISE")}
              className="mt-8 w-full py-3.5 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold rounded-xl border border-amber-500/30 transition"
            >
              Aktifkan Lisensi Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-stone-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-3xl font-serif font-bold text-amber-100">Pertanyaan Umum Seputar SundaResto AI</p>
        </div>

        <div className="space-y-4 text-left">
          <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800">
            <h4 className="font-bold text-amber-200 text-sm">Apakah SundaResto AI mendukung printer kasir thermal & cetak dapur?</h4>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              Ya, aplikasi mendukung semua jenis printer thermal Bluetooth, USB, maupun Ethernet LAN untuk cetak struk kasir, dapur (KDS), dan cetak checker saung.
            </p>
          </div>

          <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800">
            <h4 className="font-bold text-amber-200 text-sm">Bagaimana sistem menghitung HPP & stok bahan baku (BOM)?</h4>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              Setiap kali menu (seperti Ayam Bakar atau Gurame Terbang) terjual di POS, sistem otomatis mengurangi stok bahan mentah (ayam, beras, cabai, minyak) secara presisi sesuai resep BOM.
            </p>
          </div>

          <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800">
            <h4 className="font-bold text-amber-200 text-sm">Apakah bisa digunakan jika koneksi internet terputus (Offline mode)?</h4>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              SundaResto AI memiliki sistem offline-first untuk transaksi kasir di local device, dan otomatis tersinkronisasi kembali ke cloud saat koneksi internet kembali terhubung.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-stone-800/80 text-center">
        <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">Testimoni Pengusaha Kuliner Sunda</h2>
        <p className="text-3xl font-serif font-bold text-amber-100 mb-12">Dipercaya oleh Pemilik Rumah Makan & Saung Lesehan</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "Aplikasi SundaResto AI sangat membantu waktu jam sibuk makan siang di 12 saung lesehan kami. Fitur AI voice order bikin waiter gak salah catat pesanan Gurame & Liwet lagi!"
            </p>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">H. Maman Sulaeman</h4>
              <p className="text-[10px] text-stone-400">Owner RM Saung Pasundan Dago</p>
            </div>
          </div>

          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "Sistem HPP BOM nya juara banget! Kami bisa langsung tau sisa stok ikan gurame hidup dan beras cianjur tiap kali ada pembayaran di kasir."
            </p>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">Ibu Hj. Neng Yulia</h4>
              <p className="text-[10px] text-stone-400">Pengelola Lesehan Gurame Bogor</p>
            </div>
          </div>

          <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-stone-300 italic leading-relaxed">
              "Fitur AI Marketing Co-Pilot nya sangat praktis. Kita tinggal klik langsung jadi caption Instagram dan broadcast promo WA Bahasa Sunda yang menarik!"
            </p>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">Kang Dadang Ramlan</h4>
              <p className="text-[10px] text-stone-400">Manager Operasional Nasi Liwet Priangan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-stone-800 text-center text-xs text-stone-500">
        <p>© 2026 SundaResto AI. Hak Cipta Dilindungi Undang-Undang. Solusi Software Kuliner Indonesia.</p>
        <p className="mt-1 text-[11px] text-amber-500/60">Pengembangan AI Studio | Model: Gemini 3.6 Flash</p>
      </footer>
    </div>
  );
};
