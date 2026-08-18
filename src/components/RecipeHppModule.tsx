import React, { useState } from "react";
import { generateSundaRecipeClient, normalizeSundaRecipeData } from "../utils/geminiClient";
import { MenuItem, InventoryItem, RecipeIngredient, MenuCategory } from "../types";
import { formatRupiah } from "../utils/formatters";
import {
  BookOpen,
  Calculator,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sliders,
  DollarSign,
  PieChart,
  Search,
  Check,
  Edit2,
  Flame,
  ChefHat,
  Info,
  X,
  Printer,
  Utensils,
  Bot,
  Clock,
  ListOrdered,
  Layers,
  ChevronRight,
  Send,
  RefreshCw
} from "lucide-react";

interface SundaRecipeAiData {
  recipeTitle: string;
  sundaCategory: MenuCategory;
  originStory: string;
  servings: number;
  estimatedHppPerServing: number;
  suggestedPricePerServing: number;
  marginPercent: string;
  ingredients: Array<{
    name: string;
    qty: number;
    unit: string;
    estimatedCost: number;
    note?: string;
  }>;
  cookingSteps: Array<{
    stepNumber: number;
    instruction: string;
    durationMins?: number;
    chefTip?: string;
  }>;
  servingStyle: string;
  pairingRecommendation: string;
}

interface RecipeHppModuleProps {
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  onUpdateMenuItemPrice: (menuId: string, newPrice: number, newHpp?: number) => void;
  onUpdateRecipe: (menuId: string, updatedRecipe: RecipeIngredient[], newHpp: number) => void;
  onAddNewMenuItem?: (newItem: MenuItem) => void;
}

export const RecipeHppModule: React.FC<RecipeHppModuleProps> = ({
  menuItems,
  inventory,
  onUpdateMenuItemPrice,
  onUpdateRecipe,
  onAddNewMenuItem
}) => {
  const [selectedMenu, setSelectedMenu] = useState<MenuItem>(menuItems[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // AI Resep Masakan Sunda Modal States
  const [showAiRecipeModal, setShowAiRecipeModal] = useState(false);
  const [recipePrompt, setRecipePrompt] = useState("Gurame Bakar Bumbu Rujak Pasundan");
  const [targetServings, setTargetServings] = useState<number>(4);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<SundaRecipeAiData | null>(null);

  const quickSundaPrompts = [
    "Gurame Bakar Bumbu Rujak Pasundan",
    "Nasi Liwet Kastrol Pete Teri Medan",
    "Pepes Ikan Mas Bumbu Kuning Kemangi",
    "Sayur Asem Komplit Khas Parahyangan",
    "Sambal Dadak Limau & Goang Hijau",
    "Ayam Bakar Bekakak Bumbu Lengkuas",
    "Karedok Leunca & Ulukutek Oncom",
    "Gepuk Sapi Serundeng Manis Gurih"
  ];

  const handleGenerateSundaRecipe = async (dishName?: string) => {
    const promptToUse = dishName || recipePrompt;
    if (!promptToUse.trim()) return;

    setIsGeneratingRecipe(true);
    try {
      const savedKey = localStorage.getItem("custom_gemini_api_key") || "";
      const response = await fetch("/api/ai/sunda-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": savedKey
        },
        body: JSON.stringify({
          recipeName: promptToUse,
          targetServings,
          customApiKey: savedKey
        })
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success && data.data) {
          const norm = normalizeSundaRecipeData(data.data, promptToUse, targetServings);
          setGeneratedRecipe(norm);
          if (norm?.recipeTitle) {
            setRecipePrompt(norm.recipeTitle);
          }
          return;
        }
      }

      // Fallback to client Gemini direct call or smart local fallback
      const clientData = await generateSundaRecipeClient(promptToUse, targetServings, savedKey);
      const norm = normalizeSundaRecipeData(clientData, promptToUse, targetServings);
      setGeneratedRecipe(norm);
      if (norm?.recipeTitle) {
        setRecipePrompt(norm.recipeTitle);
      }
    } catch (err) {
      console.error("Recipe API error, attempting direct client fallback...", err);
      const savedKey = localStorage.getItem("custom_gemini_api_key") || "";
      try {
        const clientData = await generateSundaRecipeClient(promptToUse, targetServings, savedKey);
        const norm = normalizeSundaRecipeData(clientData, promptToUse, targetServings);
        setGeneratedRecipe(norm);
        if (norm?.recipeTitle) {
          setRecipePrompt(norm.recipeTitle);
        }
      } catch (clientErr) {
        console.error("Client fallback error:", clientErr);
        const norm = normalizeSundaRecipeData(null, promptToUse, targetServings);
        setGeneratedRecipe(norm);
        if (norm?.recipeTitle) {
          setRecipePrompt(norm.recipeTitle);
        }
      }
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const handleApplyRecipeToCurrentMenu = () => {
    if (!generatedRecipe || !selectedMenu) return;

    const newRecipeIngredients: RecipeIngredient[] = generatedRecipe.ingredients.map((ing, idx) => {
      // Find matching inventory item if exists, otherwise create dummy ID
      const matchedInv = inventory.find((i) => i.name.toLowerCase().includes(ing.name.toLowerCase()));
      return {
        ingredientId: matchedInv ? matchedInv.id : `ing-gen-${idx}`,
        name: ing.name,
        qtyNeeded: ing.qty,
        unit: ing.unit,
        costPerUnit: Math.round(ing.estimatedCost / (ing.qty || 1))
      };
    });

    setEditingRecipe(newRecipeIngredients);
    setCookingSteps(generatedRecipe.cookingSteps.map((s) => `${s.instruction} (${s.chefTip || "Tips Koki"})`));

    onUpdateRecipe(
      selectedMenu.id,
      newRecipeIngredients,
      generatedRecipe.estimatedHppPerServing
    );
    onUpdateMenuItemPrice(
      selectedMenu.id,
      generatedRecipe.suggestedPricePerServing,
      generatedRecipe.estimatedHppPerServing
    );

    showToast(`Resep ${generatedRecipe.recipeTitle} berhasil diterapkan pada ${selectedMenu.name}!`);
    setShowAiRecipeModal(false);
  };

  const handleAddNewMenuFromRecipe = () => {
    if (!generatedRecipe || !onAddNewMenuItem) return;

    const newMenuItem: MenuItem = {
      id: `m-${Date.now()}`,
      name: generatedRecipe.recipeTitle,
      category: (generatedRecipe.sundaCategory as MenuCategory) || "Olahan Gurame & Nila",
      price: generatedRecipe.suggestedPricePerServing,
      costHPP: generatedRecipe.estimatedHppPerServing,
      description: `${generatedRecipe.originStory} - ${generatedRecipe.servingStyle}`,
      image: generatedRecipe.recipeTitle.includes("Gurame")
        ? "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
        : generatedRecipe.recipeTitle.includes("Liwet")
        ? "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80",
      isAvailable: true,
      isPopular: true,
      recipe: generatedRecipe.ingredients.map((ing, idx) => ({
        ingredientId: `ing-gen-${idx}`,
        name: ing.name,
        qtyNeeded: ing.qty,
        unit: ing.unit,
        costPerUnit: Math.round(ing.estimatedCost / (ing.qty || 1))
      }))
    };

    onAddNewMenuItem(newMenuItem);
    setSelectedMenu(newMenuItem);
    setEditingRecipe(newMenuItem.recipe || []);
    showToast(`Menu baru '${newMenuItem.name}' telah ditambahkan ke Resto!`);
    setShowAiRecipeModal(false);
  };

  // Recipe Editor States for selected menu
  const [editingRecipe, setEditingRecipe] = useState<RecipeIngredient[]>(
    selectedMenu?.recipe || []
  );
  const [overheadGasAndPackaging, setOverheadGasAndPackaging] = useState<number>(2500); // Default gas + daun/box Rp 2.500
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(65); // Default 65% target margin
  const [customNoteStep, setCustomNoteStep] = useState<string>("");
  const [cookingSteps, setCookingSteps] = useState<string[]>([
    "Cuci bersih bahan utama dan rendam dengan bumbu marinasi khas Sunda selama 15 menit.",
    "Panaskan wajan atau kastrol dengan minyak kelapa asli / arang kayu bakar.",
    "Masak hingga matang meresap dan harum aroma rempah kencur & daun kemangi.",
    "Sajikan hangat di atas tampah beralaskan daun pisang bersama sambal dadak segar."
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch Selected Menu
  const handleSelectMenu = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setEditingRecipe(menu.recipe || []);
  };

  // Calculate Ingredient Total HPP
  const totalRawIngredientCost = editingRecipe.reduce(
    (sum, item) => sum + item.qtyNeeded * item.costPerUnit,
    0
  );

  const calculatedTotalHPP = totalRawIngredientCost + overheadGasAndPackaging;
  const currentPrice = selectedMenu ? selectedMenu.price : 0;
  const currentGrossProfit = currentPrice - calculatedTotalHPP;
  const currentMarginPercent =
    currentPrice > 0 ? Math.round((currentGrossProfit / currentPrice) * 100) : 0;

  // AI Recommended Price Formula:
  // AI Price = Calculated HPP / (1 - (Target Margin % / 100))
  // Rounded up to nearest Rp 1.000 for realistic Sundanese restaurant pricing
  const rawAiRecommendedPrice =
    targetMarginPercent < 100
      ? calculatedTotalHPP / (1 - targetMarginPercent / 100)
      : calculatedTotalHPP * 2.5;

  const aiRecommendedPrice = Math.ceil(rawAiRecommendedPrice / 1000) * 1000;
  const aiGrossProfit = aiRecommendedPrice - calculatedTotalHPP;
  const aiMarginPercent = Math.round((aiGrossProfit / aiRecommendedPrice) * 100);

  // Add New Ingredient Row to Recipe
  const [newIngId, setNewIngId] = useState<string>(inventory[0]?.id || "");
  const [newIngQtyNeeded, setNewIngQtyNeeded] = useState<number>(1);

  const handleAddIngredientToRecipe = () => {
    const invItem = inventory.find((i) => i.id === newIngId);
    if (!invItem) return;

    const newItem: RecipeIngredient = {
      ingredientId: invItem.id,
      name: invItem.name,
      qtyNeeded: newIngQtyNeeded,
      unit: invItem.unit,
      costPerUnit: invItem.avgCostPerUnit
    };

    const updated = [...editingRecipe, newItem];
    setEditingRecipe(updated);

    const newHpp = updated.reduce((s, i) => s + i.qtyNeeded * i.costPerUnit, 0) + overheadGasAndPackaging;
    onUpdateRecipe(selectedMenu.id, updated, newHpp);
    showToast(`Bahan ${invItem.name} ditambahkan ke resep!`);
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = editingRecipe.filter((_, idx) => idx !== index);
    setEditingRecipe(updated);
    const newHpp = updated.reduce((s, i) => s + i.qtyNeeded * i.costPerUnit, 0) + overheadGasAndPackaging;
    onUpdateRecipe(selectedMenu.id, updated, newHpp);
  };

  const handleQtyChange = (index: number, newQty: number) => {
    const updated = editingRecipe.map((item, idx) => {
      if (idx === index) {
        return { ...item, qtyNeeded: newQty };
      }
      return item;
    });
    setEditingRecipe(updated);
    const newHpp = updated.reduce((s, i) => s + i.qtyNeeded * i.costPerUnit, 0) + overheadGasAndPackaging;
    onUpdateRecipe(selectedMenu.id, updated, newHpp);
  };

  // Apply AI Price Recommendation
  const handleApplyAiPrice = () => {
    onUpdateMenuItemPrice(selectedMenu.id, aiRecommendedPrice, calculatedTotalHPP);
    setSelectedMenu((prev) => ({
      ...prev,
      price: aiRecommendedPrice,
      costHPP: calculatedTotalHPP
    }));
    showToast(`Harga jual ${selectedMenu.name} diperbarui menjadi ${formatRupiah(aiRecommendedPrice)}!`);
  };

  // Filter Categories
  const categories = [
    "All",
    "Paket Menu Komplit",
    "Nasi Timbel",
    "Nasi Liwet",
    "Ayam & Bebek",
    "Olahan Ikan",
    "Pepes Khas Sunda",
    "Tumisan & Cah",
    "Sayuran & Sup",
    "Sambal Khas Sunda",
    "Minuman & Es"
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate Overall Average Portfolio Margin
  const totalPortfolioRevenue = menuItems.reduce((s, m) => s + m.price, 0);
  const totalPortfolioHPP = menuItems.reduce((s, m) => s + m.costHPP, 0);
  const averagePortfolioMargin = Math.round(
    ((totalPortfolioRevenue - totalPortfolioHPP) / totalPortfolioRevenue) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-stone-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Stats Header */}
      <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-amber-100">
                Manajemen Resep, Komposisi Bahan & Kalkulator HPP Otomatis
              </h2>
              <p className="text-xs text-stone-400">
                Rincian Bill of Materials (BOM) per porsi, perhitungan HPP otomatis, serta Rekomendasi Harga Jual berbasis AI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowAiRecipeModal(true);
                if (!generatedRecipe) handleGenerateSundaRecipe();
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs rounded-2xl shadow-xl transition flex items-center gap-2 border border-amber-300"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>AI Resep Masakan Sunda</span>
            </button>

            <div className="flex items-center gap-3 bg-stone-950 border border-stone-800 p-3 rounded-2xl">
              <div className="text-right text-xs">
                <span className="text-stone-400 block">Rata-rata Margin Resto:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-base">
                  {averagePortfolioMargin}% Margin Bersih
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Menu Selection List (4 Cols) + Right Recipe Editor & AI Pricing (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Menu List Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-stone-900 border border-stone-800 p-4 rounded-3xl space-y-3 shadow-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu Sunda..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-stone-950"
                      : "bg-stone-950 text-stone-400 hover:bg-stone-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredMenuItems.map((item) => {
                const isSelected = selectedMenu?.id === item.id;
                const margin = Math.round(((item.price - item.costHPP) / item.price) * 100);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMenu(item)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-200 shadow-md"
                        : "bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-850"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-stone-800"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-amber-100">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                          <span>Jual: {formatRupiah(item.price)}</span>
                          <span>•</span>
                          <span>HPP: {formatRupiah(item.costHPP)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          margin >= 60
                            ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
                            : margin >= 45
                            ? "bg-amber-950 border-amber-500/40 text-amber-300"
                            : "bg-rose-950 border-rose-500/40 text-rose-300"
                        }`}
                      >
                        {margin}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Menu Recipe & HPP Calculator */}
        {selectedMenu ? (
          <div className="lg:col-span-8 space-y-6">
            {/* Header Info Card */}
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMenu.image}
                  alt={selectedMenu.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/30 shadow-lg"
                />
                <div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wide">
                    {selectedMenu.category}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-amber-100 mt-1">
                    {selectedMenu.name}
                  </h3>
                  <p className="text-xs text-stone-400 max-w-md mt-0.5">
                    {selectedMenu.description}
                  </p>
                </div>
              </div>

              {/* Live HPP & Profit Indicators */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 min-w-[200px] space-y-1.5 text-right">
                <div className="text-xs flex justify-between gap-4 text-stone-400">
                  <span>Harga Jual Saat Ini:</span>
                  <strong className="text-amber-300 font-mono">{formatRupiah(currentPrice)}</strong>
                </div>
                <div className="text-xs flex justify-between gap-4 text-stone-400">
                  <span>HPP Otomatis BOM:</span>
                  <strong className="text-rose-400 font-mono">{formatRupiah(calculatedTotalHPP)}</strong>
                </div>
                <div className="border-t border-stone-800 pt-1 flex justify-between gap-4 text-xs">
                  <span className="font-bold text-stone-200">Profit / Porsi:</span>
                  <strong className="text-emerald-400 font-mono font-extrabold text-sm">
                    {formatRupiah(currentGrossProfit)} ({currentMarginPercent}%)
                  </strong>
                </div>
              </div>
            </div>

            {/* 1. Komposisi Bahan & Harga (Bill of Materials) */}
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-stone-800">
                <div>
                  <h4 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>Komposisi Bahan Baku (BOM) & Harga Satuan</span>
                  </h4>
                  <p className="text-xs text-stone-400">
                    Atur takaran bahan mentah per porsi. HPP akan berkalkulasi secara otomatis.
                  </p>
                </div>

                <div className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  Subtotal Bahan: {formatRupiah(totalRawIngredientCost)}
                </div>
              </div>

              {/* Table of Recipe Ingredients */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-amber-200 uppercase text-[10px] tracking-wider border-b border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">Nama Bahan Baku</th>
                      <th className="py-2.5 px-3 text-center">Takaran per Porsi</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Biaya HPP (Rp)</th>
                      <th className="py-2.5 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 font-medium">
                    {editingRecipe.map((rec, index) => {
                      const costLine = rec.qtyNeeded * rec.costPerUnit;

                      return (
                        <tr key={index} className="hover:bg-stone-850/50">
                          <td className="py-2.5 px-3 font-bold text-amber-100">{rec.name}</td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={rec.qtyNeeded}
                                onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                                className="w-16 bg-stone-950 border border-stone-700 text-emerald-400 font-mono font-bold text-center rounded-lg px-1.5 py-1 outline-none focus:border-amber-400"
                              />
                              <span className="text-stone-400 text-[11px]">{rec.unit}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-400">
                            {formatRupiah(rec.costPerUnit)} / {rec.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                            {formatRupiah(costLine)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleRemoveIngredient(index)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
                              title="Hapus Bahan Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Ingredient Form Bar */}
              <div className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-center gap-3 text-xs">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-stone-400 block mb-0.5">Tambah Bahan Baku:</label>
                  <select
                    value={newIngId}
                    onChange={(e) => setNewIngId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-amber-200 font-bold rounded-xl px-3 py-1.5 outline-none"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} ({formatRupiah(inv.avgCostPerUnit)}/{inv.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28">
                  <label className="text-[10px] text-stone-400 block mb-0.5">Takaran Needed:</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newIngQtyNeeded}
                    onChange={(e) => setNewIngQtyNeeded(Number(e.target.value))}
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 font-mono rounded-xl px-3 py-1.5 outline-none"
                  />
                </div>

                <button
                  onClick={handleAddIngredientToRecipe}
                  className="w-full sm:w-auto mt-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Variable Overhead (Gas, Daun, Box) */}
              <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-200 block">Biaya Operasional Dapur & Kemasan:</span>
                  <span className="text-[10px] text-stone-400">
                    Sewa gas LPG/arang kayu bakar + pembungkus daun pisang/box takeout
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 font-mono">Rp</span>
                  <input
                    type="number"
                    value={overheadGasAndPackaging}
                    onChange={(e) => setOverheadGasAndPackaging(Number(e.target.value))}
                    className="w-24 bg-stone-900 border border-stone-700 text-amber-300 font-mono font-bold text-right rounded-xl px-3 py-1.5 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Harga Jual Rekomendasi AI & Simulasi Margin */}
            <div className="bg-stone-900 border border-amber-500/30 p-6 rounded-3xl shadow-2xl space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-serif font-bold text-base text-amber-200">
                      Rekomendasi Harga Jual AI & Simulasi Margin
                    </h4>
                    <p className="text-xs text-stone-400">
                      Algoritma AI menganalisis HPP, target margin resto, dan benchmark pasar kuliner Sunda.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/10 text-amber-300 font-bold text-xs px-3 py-1 rounded-full border border-amber-500/20">
                  Target Margin: {targetMarginPercent}%
                </div>
              </div>

              {/* Interactive Target Margin Slider */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-stone-300">Geser Target Gross Margin Resto (%):</label>
                  <span className="font-mono text-amber-300 font-bold text-sm">{targetMarginPercent}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="80"
                  step="1"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>40% (Harga Terjangkau)</span>
                  <span>65% (Standar Resto Sunda)</span>
                  <span>80% (Premium Saung)</span>
                </div>
              </div>

              {/* Comparison Box: Price Current vs AI Recommended */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Price Box */}
                <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">
                    Harga Jual Kasir Saat Ini
                  </span>
                  <div className="font-mono font-extrabold text-2xl text-stone-100">
                    {formatRupiah(currentPrice)}
                  </div>
                  <div className="text-xs text-stone-400 space-y-0.5">
                    <div>Profit Bersih: <strong className="text-emerald-400 font-mono">{formatRupiah(currentGrossProfit)}</strong></div>
                    <div>Actual Margin: <strong className="text-amber-300 font-mono">{currentMarginPercent}%</strong></div>
                  </div>
                </div>

                {/* AI Recommended Price Box */}
                <div className="bg-gradient-to-br from-amber-950/60 to-stone-950 p-4 rounded-2xl border border-amber-500/40 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Rekomendasi AI Optimal
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                      Rekomendasi Terbaik
                    </span>
                  </div>

                  <div className="font-mono font-extrabold text-2xl text-amber-300">
                    {formatRupiah(aiRecommendedPrice)}
                  </div>

                  <div className="text-xs text-stone-300 space-y-0.5">
                    <div>Profit Estimasi: <strong className="text-emerald-400 font-mono">{formatRupiah(aiGrossProfit)}</strong></div>
                    <div>Margin Tercapai: <strong className="text-amber-300 font-mono">{aiMarginPercent}%</strong></div>
                  </div>

                  <button
                    onClick={handleApplyAiPrice}
                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Terapkan Harga Rekomendasi AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Panduan Resep & Langkah Memasak Dapur */}
            <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-serif font-bold text-base text-amber-200">
                      Instruksi Standar Operasional Memasak Dapur
                    </h4>
                    <p className="text-xs text-stone-400">
                      Standard Operating Procedure (SOP) racikan masakan agar cita rasa selalu konsisten di semua cabang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {cookingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-stone-950 p-3 rounded-2xl border border-stone-800 flex items-start gap-3 text-xs"
                  >
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-500/20">
                      {idx + 1}
                    </span>
                    <p className="text-stone-300 pt-0.5 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-400 space-y-3">
            <BookOpen className="w-12 h-12 text-amber-500/40 mx-auto" />
            <p className="text-sm">Pilih salah satu menu makanan dari daftar di sebelah kiri untuk melihat resep dan kalkulasi HPP.</p>
          </div>
        )}
      </div>

      {/* AI Resep Masakan Sunda Modal */}
      {showAiRecipeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-amber-500/30 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-100 flex items-center gap-2">
                    AI Resep Masakan Sunda Autentik
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Gemini 3.6 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Koki Pintar AI untuk Pembuatan Resep, Takaran Bahan Presisi, SOP Dapur & Estimasi HPP Resto.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAiRecipeModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input & Quick Prompts Section */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
              <label className="text-xs font-bold text-amber-200 block">
                Cari atau Ketik Ide Masakan Sunda yang Ingin Dibuatkan Resepnya:
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={recipePrompt}
                  onChange={(e) => setRecipePrompt(e.target.value)}
                  placeholder="Contoh: Gurame Bakar Kecap Pasundan, Nasi Liwet Kastrol, Pepes Ikan Mas..."
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-400"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={targetServings}
                    onChange={(e) => setTargetServings(Number(e.target.value))}
                    className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-bold outline-none"
                  >
                    <option value={1}>1 Porsi</option>
                    <option value={4}>4 Porsi (Saung)</option>
                    <option value={10}>10 Porsi (Rombongan)</option>
                  </select>

                  <button
                    onClick={() => handleGenerateSundaRecipe()}
                    disabled={isGeneratingRecipe || !recipePrompt.trim()}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shrink-0 shadow"
                  >
                    {isGeneratingRecipe ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    ) : (
                      <Sparkles className="w-4 h-4 fill-stone-950" />
                    )}
                    <span>{isGeneratingRecipe ? "Meracik Resep..." : "Generate Resep AI"}</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-semibold block">Pilihan Cepat Masakan Sunda Favorit:</span>
                  <button
                    onClick={() => {
                      setRecipePrompt("minta ide");
                      handleGenerateSundaRecipe("minta ide");
                    }}
                    disabled={isGeneratingRecipe}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-lg transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>🎲 Acak Ide Menu Sunda Baru</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickSundaPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setRecipePrompt(prompt);
                        handleGenerateSundaRecipe(prompt);
                      }}
                      className="px-2.5 py-1 bg-stone-900 hover:bg-amber-500/20 hover:text-amber-200 text-stone-300 rounded-lg text-[11px] font-medium border border-stone-800 transition flex items-center gap-1"
                    >
                      <Utensils className="w-3 h-3 text-amber-400" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipe Content Result */}
            {isGeneratingRecipe ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                  <ChefHat className="w-8 h-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-amber-200 text-base">
                    Meracik Bumbu & Menghitung HPP Masakan Sunda...
                  </h4>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    AI sedang mengkombinasikan bahan baku autentik Priangan, takaran rempah, waktu masak SOP dapur, dan kalkulasi margin keuntungan resto.
                  </p>
                </div>
              </div>
            ) : generatedRecipe ? (
              <div id="printable-sunda-recipe" className="space-y-6">
                {/* Title Card & Story */}
                <div className="bg-gradient-to-r from-amber-950/60 via-stone-950 to-amber-950/40 p-5 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {generatedRecipe.sundaCategory}
                      </span>
                      <h2 className="font-serif font-bold text-2xl text-amber-100 mt-1">
                        {generatedRecipe.recipeTitle}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-400">Porsi Standard:</span>
                      <span className="px-2.5 py-1 bg-stone-900 text-amber-300 font-bold text-xs rounded-lg border border-stone-800">
                        {generatedRecipe.servings} Porsi
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 italic leading-relaxed">
                    "{generatedRecipe.originStory}"
                  </p>

                  {/* Financial & HPP Summary Pills */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 block">Estimasi HPP / Porsi</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        {formatRupiah(generatedRecipe.estimatedHppPerServing)}
                      </span>
                    </div>

                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 block">Saran Harga Jual Resto</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {formatRupiah(generatedRecipe.suggestedPricePerServing)}
                      </span>
                    </div>

                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 block">Estimasi Margin Bersih</span>
                      <span className="font-mono font-extrabold text-amber-300 text-sm">
                        {generatedRecipe.marginPercent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ingredients Table */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Komposisi Bahan Baku (BOM) & Takaran:</span>
                  </h4>

                  <div className="bg-stone-950 rounded-2xl border border-stone-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800">
                        <tr>
                          <th className="p-3">Nama Bahan Baku</th>
                          <th className="p-3 text-center">Takaran</th>
                          <th className="p-3 text-right">Perkiraan Biaya</th>
                          <th className="p-3">Catatan Khusus Koki</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-900 text-stone-200">
                        {generatedRecipe.ingredients.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-stone-900/50">
                            <td className="p-3 font-medium text-amber-100">{ing.name}</td>
                            <td className="p-3 text-center font-mono font-bold text-stone-300">
                              {ing.qty} {ing.unit}
                            </td>
                            <td className="p-3 text-right font-mono text-emerald-400">
                              {formatRupiah(ing.estimatedCost)}
                            </td>
                            <td className="p-3 text-stone-400 text-[11px]">{ing.note || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cooking Instructions */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    <span>SOP Langkah Memasak Dapur & Tips Koki Sunda:</span>
                  </h4>

                  <div className="space-y-2">
                    {generatedRecipe.cookingSteps.map((step) => (
                      <div
                        key={step.stepNumber}
                        className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] flex items-center justify-center font-mono">
                              {step.stepNumber}
                            </span>
                            Langkah {step.stepNumber}
                          </span>
                          {step.durationMins && (
                            <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" /> ~{step.durationMins} menit
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-300 pl-7 leading-relaxed">{step.instruction}</p>
                        {step.chefTip && (
                          <p className="text-[11px] text-amber-400/90 pl-7 italic flex items-center gap-1 font-sans">
                            💡 <strong>Tips Koki:</strong> {step.chefTip}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Serving Style & Pairing Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                    <span className="text-xs font-bold text-amber-300 block">🍃 Penyajian Khas Saung Lesehan:</span>
                    <p className="text-xs text-stone-300 leading-relaxed">{generatedRecipe.servingStyle}</p>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-1.5">
                    <span className="text-xs font-bold text-amber-300 block">🍹 Rekomendasi Kombo / Upselling:</span>
                    <p className="text-xs text-stone-300 leading-relaxed">{generatedRecipe.pairingRecommendation}</p>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Resep Dapur Koki</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onAddNewMenuItem && (
                      <button
                        type="button"
                        onClick={handleAddNewMenuFromRecipe}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 flex-1 sm:flex-none justify-center"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>➕ Tambahkan ke Daftar Menu Resto</span>
                      </button>
                    )}

                    {selectedMenu && (
                      <button
                        type="button"
                        onClick={handleApplyRecipeToCurrentMenu}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 flex-1 sm:flex-none justify-center"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Terapkan ke Menu '{selectedMenu.name}'</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
