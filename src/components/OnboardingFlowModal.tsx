import React, { useState } from "react";
import {
  Building2,
  Store,
  Utensils,
  Receipt,
  LayoutGrid,
  BookOpen,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Form States for Onboarding Steps
  const [restaurantProfile, setRestaurantProfile] = useState({
    name: "RM Saung Pasundan",
    tagline: "Masakan Khas Sunda & Lesehan Saung",
    phone: "0812-9988-7766",
    address: "Jl. Raya Padalarang No. 88, Bandung"
  });

  const [outletInfo, setOutletInfo] = useState({
    name: "Cabang Bandung Pusat (Flagship)",
    code: "SND-BDG-01",
    city: "Bandung",
    capacity: 24
  });

  const [businessType, setBusinessType] = useState("Lesehan & Resto Khas Sunda");
  const [taxConfig, setTaxConfig] = useState({
    ppnPercent: 10,
    serviceChargePercent: 5,
    isTaxInclusive: false
  });

  const [tablesConfig, setTablesConfig] = useState([
    { code: "S-01", name: "Saung Lesehan 1 (VIP)", capacity: 8, zone: "Area Utama" },
    { code: "S-02", name: "Saung Lesehan 2", capacity: 6, zone: "Area Kolam" },
    { code: "M-01", name: "Meja Dining 1", capacity: 4, zone: "Indoor AC" }
  ]);

  const [initialMenu, setInitialMenu] = useState([
    { name: "Ayam Bakar Pasundan", price: 32000, category: "Makanan Utama" },
    { name: "Gurame Terbang Sambal Terasi", price: 75000, category: "Makanan Utama" },
    { name: "Es Jeruk Kelapa Muda", price: 15000, category: "Minuman" }
  ]);

  const [initialInventory, setInitialInventory] = useState([
    { name: "Ayam Utuh Segar", stock: 50, unit: "kg" },
    { name: "Beras Cianjur", stock: 200, unit: "kg" },
    { name: "Minyak Goreng", stock: 60, unit: "liter" }
  ]);

  if (!isOpen) return null;

  const steps = [
    { num: 1, label: "Profile Resto", icon: Building2 },
    { num: 2, label: "Outlet / Cabang", icon: Store },
    { num: 3, label: "Jenis Bisnis", icon: Utensils },
    { num: 4, label: "Pajak & PB1", icon: Receipt },
    { num: 5, label: "Saung & Meja", icon: LayoutGrid },
    { num: 6, label: "Menu Utama", icon: BookOpen },
    { num: 7, label: "Stok Awal", icon: Layers }
  ];

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete({
        restaurantProfile,
        outletInfo,
        businessType,
        taxConfig,
        tablesConfig,
        initialMenu,
        initialInventory
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl text-stone-100 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-2 rounded-xl hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-stone-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-amber-100">Setup Awal Restoran (Onboarding)</h2>
            <p className="text-xs text-stone-400">Langkah {currentStep} dari 7 — Konfigurasi dasar sistem SundaResto AI</p>
          </div>
        </div>

        {/* Step Stepper Indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 border-b border-stone-800/60">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCompleted = st.num < currentStep;
            const isCurrent = st.num === currentStep;

            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`flex flex-col items-center gap-1.5 min-w-[70px] transition ${
                  isCurrent
                    ? "text-amber-400 font-bold"
                    : isCompleted
                    ? "text-emerald-400"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition ${
                    isCurrent
                      ? "bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/30"
                      : isCompleted
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                      : "bg-stone-950 text-stone-500 border border-stone-800"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[10px] text-center font-medium whitespace-nowrap">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step Contents */}
        <div className="min-h-[260px]">
          {/* STEP 1: Restaurant Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Profil Usaha Restoran
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Nama Brand / Restoran</label>
                  <input
                    type="text"
                    value={restaurantProfile.name}
                    onChange={(e) => setRestaurantProfile({ ...restaurantProfile, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Slogan / Tagline</label>
                  <input
                    type="text"
                    value={restaurantProfile.tagline}
                    onChange={(e) => setRestaurantProfile({ ...restaurantProfile, tagline: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Nomor Telepon / Whatsapp</label>
                  <input
                    type="text"
                    value={restaurantProfile.phone}
                    onChange={(e) => setRestaurantProfile({ ...restaurantProfile, phone: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Alamat Lengkap Pusat</label>
                  <input
                    type="text"
                    value={restaurantProfile.address}
                    onChange={(e) => setRestaurantProfile({ ...restaurantProfile, address: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Outlet */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <Store className="w-5 h-5" /> Outlet Pertama Restoran
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Nama Outlet Cabang</label>
                  <input
                    type="text"
                    value={outletInfo.name}
                    onChange={(e) => setOutletInfo({ ...outletInfo, name: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Kode Cabang</label>
                  <input
                    type="text"
                    value={outletInfo.code}
                    onChange={(e) => setOutletInfo({ ...outletInfo, code: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Kota Location</label>
                  <input
                    type="text"
                    value={outletInfo.city}
                    onChange={(e) => setOutletInfo({ ...outletInfo, city: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Kapasitas Saung / Meja</label>
                  <input
                    type="number"
                    value={outletInfo.capacity}
                    onChange={(e) => setOutletInfo({ ...outletInfo, capacity: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Business Type */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Tipe Kategori Bisnis Resto
              </h3>
              <p className="text-xs text-stone-400">Pilih format operasional utama rumah makan Anda:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Lesehan & Resto Khas Sunda",
                  "Fast Casual / Foodcourt",
                  "Fine Dining & Resort Resto"
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition ${
                      businessType === type
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold"
                        : "bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-800"
                    }`}
                  >
                    <span className="text-xs">{type}</span>
                    <span className="text-[10px] text-stone-400 mt-2">Dukungan cetak dapur & saung grid</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Tax */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <Receipt className="w-5 h-5" /> Pengaturan PB1 Pajak & Service
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Pajak Restoran (PB1 / PPN %)</label>
                  <input
                    type="number"
                    value={taxConfig.ppnPercent}
                    onChange={(e) => setTaxConfig({ ...taxConfig, ppnPercent: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    value={taxConfig.serviceChargePercent}
                    onChange={(e) => setTaxConfig({ ...taxConfig, serviceChargePercent: Number(e.target.value) })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-300">Harga Menu Sudah Termasuk Pajak (Inclusive)?</span>
                <input
                  type="checkbox"
                  checked={taxConfig.isTaxInclusive}
                  onChange={(e) => setTaxConfig({ ...taxConfig, isTaxInclusive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Tables */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" /> Setup Awal Denah Saung & Meja
              </h3>
              <div className="space-y-2">
                {tablesConfig.map((tb, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400">{tb.code}</span>
                      <span className="text-stone-100 font-medium">{tb.name}</span>
                    </div>
                    <span className="text-stone-400 text-[11px]">{tb.zone} • Cap: {tb.capacity} Orang</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Menu */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Menu Favorit Restoran Pasundan
              </h3>
              <div className="space-y-2">
                {initialMenu.map((m, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-100 block">{m.name}</span>
                      <span className="text-[10px] text-amber-400">{m.category}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">Rp {m.price.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Initial Inventory */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-base text-amber-300 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Stok Awal Bahan Baku Utama
              </h3>
              <div className="space-y-2">
                {initialInventory.map((inv, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-100">{inv.name}</span>
                    <span className="font-mono text-amber-300 font-bold">{inv.stock} {inv.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Buttons */}
        <div className="mt-8 pt-4 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold flex items-center gap-2 disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Kemball
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs shadow-lg flex items-center gap-2 transition"
          >
            {currentStep === 7 ? (
              <>
                <span>Selesaikan Onboarding</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Lanjut (Step {currentStep + 1})</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
