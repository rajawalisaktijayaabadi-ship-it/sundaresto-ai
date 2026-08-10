import React, { useState } from "react";
import { LicenseInfo } from "../types";
import { generateLicenseKey } from "../utils/formatters";
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Plus,
  Zap,
  Building2,
  CheckCircle2
} from "lucide-react";

interface LicenseModuleProps {
  license: LicenseInfo;
  onUpdateLicense: (info: LicenseInfo) => void;
}

export const LicenseModule: React.FC<LicenseModuleProps> = ({ license, onUpdateLicense }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [genTier, setGenTier] = useState<"PRO" | "ENTERPRISE">("PRO");

  const [inputKey, setInputKey] = useState("");
  const [activateMsg, setActivateMsg] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateKey = () => {
    const key = generateLicenseKey(genTier);
    setGeneratedKey(key);
  };

  const handleActivateInputKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    if (inputKey.toUpperCase().includes("SUNDA")) {
      const updated: LicenseInfo = {
        ...license,
        key: inputKey.toUpperCase(),
        tierName: inputKey.toUpperCase().includes("ENT")
          ? "SundaResto AI Enterprise Multi-Outlet"
          : "SundaResto AI Pro (Multi-Saung)",
        expiryDate: "2028-12-31"
      };
      onUpdateLicense(updated);
      setActivateMsg("✓ Lisensi Baru Berhasil Diterapkan!");
      setInputKey("");
    } else {
      setActivateMsg("Kunci lisensi tidak valid. Gunakan format SUNDA-PRO-XXXX");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-amber-100">
              Kelola Lisensi Software & Reseller Key
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Kelola hak akses software SundaResto AI, serial number lisensi cabang, dan generate lisensi baru untuk dijual kembali.
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/80 border border-emerald-500/40 px-4 py-2 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>STATUS: LISENSI AKTIF ({license.tierName})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active License Details (6 cols) */}
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
                <button onClick={() => copyToClipboard(license.key)} className="text-stone-400 hover:text-white">
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
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Pilih Tipe Paket Lisensi yang Dihasilkan:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setGenTier("PRO")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    genTier === "PRO"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  <span>SundaResto Pro</span>
                  <span className="text-[10px] text-stone-500">3 Outlet / 50 Saung</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGenTier("ENTERPRISE")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                    genTier === "ENTERPRISE"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-stone-950 border-stone-800 text-stone-400"
                  }`}
                >
                  <span>SundaResto Enterprise</span>
                  <span className="text-[10px] text-stone-500">Unlimited Multi-Outlet</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateKey}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Generate Serial Key Baru
            </button>

            {generatedKey && (
              <div className="bg-stone-950 p-4 rounded-2xl border border-amber-500/40 text-center space-y-2 animate-fade-in">
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Kunci Lisensi Baru Siap Dijual:</span>
                <div className="font-mono font-extrabold text-lg text-amber-300 tracking-wider">
                  {generatedKey}
                </div>
                <button
                  onClick={() => copyToClipboard(generatedKey)}
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-emerald-300 border border-emerald-500/30 rounded-xl inline-flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Serial Key</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Activate Form */}
          <form onSubmit={handleActivateInputKey} className="pt-4 border-t border-stone-800 space-y-3">
            <label className="text-xs font-semibold text-stone-300 block">
              Ganti / Update Kunci Lisensi di Cabang Ini:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="SUNDA-PRO-XXXX-XXXX"
                className="flex-1 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 uppercase outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 font-bold text-xs rounded-xl border border-stone-700 transition"
              >
                Terapkan
              </button>
            </div>
            {activateMsg && <p className="text-[11px] text-emerald-400 font-medium">{activateMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};
