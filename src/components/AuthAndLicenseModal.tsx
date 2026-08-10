import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
  LogIn,
  UserPlus,
  HelpCircle,
  Lock,
  Mail,
  Smartphone,
  Shield,
  User,
  Building2
} from "lucide-react";
import { LicenseInfo } from "../types";

export type AuthMode = "login" | "register" | "forgot" | "license" | "verification";

interface AuthAndLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseValidated: (info: LicenseInfo) => void;
  initialMode?: AuthMode;
  onStartOnboarding?: () => void;
}

export const AuthAndLicenseModal: React.FC<AuthAndLicenseModalProps> = ({
  isOpen,
  onClose,
  onLicenseValidated,
  initialMode = "login",
  onStartOnboarding
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);

  // Form inputs
  const [email, setEmail] = useState("owner@pasundan.com");
  const [password, setPassword] = useState("••••••••");
  const [ownerName, setOwnerName] = useState("Siti Rahma");
  const [restaurantName, setRestaurantName] = useState("RM Saung Pasundan");
  const [phone, setPhone] = useState("0812-9988-7766");
  const [otpCode, setOtpCode] = useState("8899");
  const [licenseKey, setLicenseKey] = useState("SUNDA-PRO-2026-X9A");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState<LicenseInfo | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Auto-validate demo license on login
      const info: LicenseInfo = {
        key: "SUNDA-PRO-2026-X9A",
        tier: "PRO",
        tierName: "SundaResto AI Pro (Verified)",
        maxOutlets: 3,
        maxSaung: 50,
        expiryDate: "2027-12-31",
        features: ["AI Voice Order", "Digital Saung Grid", "KDS Kitchen", "BOM Stock"],
        ownerName: ownerName || "RM Saung Pasundan",
        isValid: true
      };
      setSuccessInfo(info);
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("verification");
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("verification");
    }, 600);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("license");
    }, 600);
  };

  const handleLicenseVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey })
      });
      const data = await res.json();

      if (data.valid) {
        const info: LicenseInfo = {
          key: data.key,
          tier: data.tier,
          tierName: data.tierName,
          maxOutlets: data.maxOutlets,
          maxSaung: data.maxSaung,
          expiryDate: data.expiryDate,
          features: data.features,
          ownerName: data.ownerName || ownerName,
          isValid: true
        };
        setSuccessInfo(info);
      } else {
        setErrorMsg(data.message || "Kunci lisensi tidak valid.");
      }
    } catch {
      if (licenseKey.trim().toUpperCase().includes("SUNDA")) {
        const info: LicenseInfo = {
          key: licenseKey.toUpperCase(),
          tier: "PRO",
          tierName: "SundaResto AI Pro (Verified)",
          maxOutlets: 3,
          maxSaung: 50,
          expiryDate: "2027-12-31",
          features: ["AI Voice Order", "Digital Saung Grid", "KDS Kitchen", "BOM Stock"],
          ownerName: ownerName || "RM Saung Pasundan",
          isValid: true
        };
        setSuccessInfo(info);
      } else {
        setErrorMsg("Kunci lisensi salah. Gunakan contoh: SUNDA-PRO-2026-X9A atau SUNDA-ENT-MULTI-888");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (successInfo) {
      onLicenseValidated(successInfo);
      if (onStartOnboarding) {
        onStartOnboarding();
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-stone-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-1.5 rounded-xl hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!successInfo ? (
          <div>
            {/* Auth Navigation Header Tabs */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-2xl border border-stone-800 mb-6 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  authMode === "login" ? "bg-amber-500 text-stone-950 font-bold shadow" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  authMode === "register" ? "bg-amber-500 text-stone-950 font-bold shadow" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </button>
              <button
                onClick={() => setAuthMode("forgot")}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  authMode === "forgot" ? "bg-amber-500 text-stone-950 font-bold shadow" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> Lupa Pass
              </button>
              <button
                onClick={() => setAuthMode("license")}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  authMode === "license" ? "bg-amber-500 text-stone-950 font-bold shadow" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" /> Lisensi
              </button>
            </div>

            {/* 1. LOGIN MODE */}
            {authMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="text-left mb-2">
                  <h2 className="text-xl font-serif font-bold text-amber-100">Login Akun SundaResto AI</h2>
                  <p className="text-xs text-stone-400">Masuk menggunakan email & password akun terdaftar.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Email Pengguna</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Belum punya akun?</span>
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Daftar Sekarang
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
                >
                  {isLoading ? "Memproses Login..." : "Masuk ke Sistem Resto"}
                </button>
              </form>
            )}

            {/* 2. REGISTER MODE */}
            {authMode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in duration-200">
                <div className="text-left mb-2">
                  <h2 className="text-xl font-serif font-bold text-amber-100">Pendaftaran Pemilik Resto</h2>
                  <p className="text-xs text-stone-400">Buat akun baru untuk mengelola outlet restoran Anda.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Nama Pemilik / Owner</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Nama Restoran</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Email & WhatsApp</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 outline-none"
                      required
                    />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:border-amber-400 outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
                >
                  {isLoading ? "Mengirim Verifikasi..." : "Lanjut Verifikasi OTP Kode"}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD MODE */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="text-left mb-2">
                  <h2 className="text-xl font-serif font-bold text-amber-100">Reset Password Akun</h2>
                  <p className="text-xs text-stone-400">Masukkan email terdaftar untuk menerima link reset kata sandi.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Email Terdaftar</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 focus:border-amber-400 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
                >
                  Kirim Kode Reset Password
                </button>
              </form>
            )}

            {/* 4. VERIFICATION MODE */}
            {authMode === "verification" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4 animate-in fade-in duration-200">
                <div className="text-left mb-2">
                  <h2 className="text-xl font-serif font-bold text-amber-100">Verifikasi Kode OTP / Email</h2>
                  <p className="text-xs text-stone-400">Kode 4-digit dikirim ke WhatsApp / Email {phone}.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Kode Verifikasi OTP</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-stone-950 border border-amber-500/40 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-amber-300 focus:border-amber-400 outline-none"
                    maxLength={6}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
                >
                  Konfirmasi Verifikasi
                </button>
              </form>
            )}

            {/* 5. LICENSE ACTIVATION MODE */}
            {authMode === "license" && (
              <form onSubmit={handleLicenseVerify} className="space-y-4 animate-in fade-in duration-200">
                <div className="text-left mb-2">
                  <h2 className="text-xl font-serif font-bold text-amber-100">Aktivasi Lisensi Software</h2>
                  <p className="text-xs text-stone-400">Masukkan Kunci Serial Lisensi Resmi untuk membuka fitur.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200 mb-1">Kunci Serial Lisensi</label>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-amber-300 font-mono text-xs uppercase outline-none focus:border-amber-400"
                    required
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-semibold text-stone-400 block">Kunci Demo Cepat:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLicenseKey("SUNDA-PRO-2026-X9A")}
                      className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg"
                    >
                      SUNDA-PRO-2026-X9A
                    </button>
                    <button
                      type="button"
                      onClick={() => setLicenseKey("SUNDA-ENT-MULTI-888")}
                      className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-lg"
                    >
                      SUNDA-ENT-MULTI-888
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
                >
                  {isLoading ? "Memverifikasi..." : "Aktivasi & Masuk Resto"}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* SUCCESS VERIFICATION CARD */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-amber-100">Verifikasi & Lisensi Berhasil!</h3>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Pemilik / Resto:</span>
                <span className="font-bold text-amber-200">{successInfo.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Paket Lisensi:</span>
                <span className="font-bold text-emerald-400 font-mono">{successInfo.tierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Masa Berlaku:</span>
                <span className="font-mono text-stone-200">{successInfo.expiryDate}</span>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-stone-950 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition text-xs"
            >
              <Sparkles className="w-5 h-5" />
              Lanjut ke Setup Onboarding Resto
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
