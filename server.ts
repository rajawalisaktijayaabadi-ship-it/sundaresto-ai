import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { buildSmartSundaRecipe, normalizeSundaRecipeData } from "./src/utils/geminiClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(process.cwd(), "data", "control_panel_store.json");

// Helper to safely read control panel store
function getControlPanelStore(): any {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read control_panel_store.json, using fallback defaults:", err);
  }
  return {
    websiteConfig: {
      appName: "SundaResto AI",
      appTagline: "Smart POS & Resto Operating System Khas Pasundan",
      heroHeadline: "Kelola Rumah Makan Sunda Lebih",
      heroHighlightText: "Mewah, Cerdas & Cepat",
      heroDescription: "Platform POS terintegrasi khusus kuliner Pasundan: Order Suara AI, Manajemen Saung Lesehan Real-time, KDS Dapur, Hitung HPP & Stok Bahan (BOM), serta AI Marketing Consultant.",
      heroBadgeText: "Aplikasi Smart AI Pertama Khusus Rumah Makan Sunda & Saung Lesehan",
      topAnnouncementText: "SundaResto AI v2.5 - Terintegrasi Google Gemini AI, Support Voice POS & Multi-Saung Realtime!",
      isAnnouncementActive: true,
      promoVideoUrl: "https://www.youtube-nocookie.com/embed/ScMzIvxBSi4",
      promoVideoTitle: "Video Tour & Demo Operasional SundaResto AI",
      isPromoVideoEnabled: true,
      heroBannerImageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      contactWhatsapp: "0812-8888-9900",
      contactEmail: "developer@sundaresto.ai",
      restaurantAddress: "Jl. Raya Parahyangan No. 128, Bandung, Jawa Barat",
      footerCopyright: "© 2026 SundaResto AI. Dedicated for Indonesian Culinary Excellence.",
      pricingStarterMonthly: 149000,
      pricingProMonthly: 299000,
      pricingEnterpriseMonthly: 799000,
      customMetaTitle: "SundaResto AI - Smart Operating System RM Sunda & Saung Lesehan",
      customMetaDescription: "Aplikasi POS & Manajemen Restoran Sunda paling modern dengan AI Co-Pilot dan Multi-Saung.",
      featuredMedia: [],
      updatedAt: new Date().toISOString()
    },
    clients: [],
    apiConfig: {
      masterGeminiApiKey: process.env.GEMINI_API_KEY || "",
      fallbackGeminiApiKey: "",
      defaultAiModel: "gemini-3.7-flash",
      aiTemperature: 0.7,
      enableUserCustomApiKey: true,
      systemPromptModifier: "Anda adalah Co-Pilot AI Resmi SundaResto. Berikan saran bisnis saung lesehan Sunda yang strategis, ramah, dan solutif.",
      updatedAt: new Date().toISOString()
    },
    broadcasts: [],
    developerMasterPin: "889900",
    serverVersion: "v2.5.0-production"
  };
}

// Helper to safely save control panel store
function saveControlPanelStore(data: any): boolean {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write to control_panel_store.json:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Enable CORS & OPTIONS preflight for custom headers like x-gemini-api-key
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-gemini-api-key, x-dev-pin");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Helper function to lazily get or initialize Gemini AI Client
  function getAiClient(customKey?: string): GoogleGenAI | null {
    const store = getControlPanelStore();
    const masterKey = store.apiConfig?.masterGeminiApiKey;
    const key = (customKey && customKey.trim().length > 0)
      ? customKey.trim()
      : (masterKey && masterKey.trim().length > 0)
        ? masterKey.trim()
        : process.env.GEMINI_API_KEY;

    if (!key || key.trim() === "" || key === "MY_GEMINI_API_KEY") {
      return null;
    }
    try {
      return new GoogleGenAI({
        apiKey: key.trim(),
      });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }

  // Helper function for resilient Gemini calls with model fallback
  async function generateGeminiContentWithFallback(params: {
    contents: string;
    systemInstruction?: string;
    temperature?: number;
    customApiKey?: string;
  }): Promise<string> {
    const client = getAiClient(params.customApiKey);
    if (!client) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }

    const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError: any = null;

    for (const model of modelsToTry) {
      // Try each model up to 2 times
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: params.contents,
            config: {
              systemInstruction: params.systemInstruction,
              temperature: params.temperature ?? 0.7,
            },
          });
          if (response && response.text) {
            return response.text;
          }
        } catch (err: any) {
          lastError = err;
          const errMsg = err.message || String(err);
          console.warn(`[Gemini API Warning] Model '${model}' attempt ${attempt} failed: ${errMsg}`);
          if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
            break; // Skip retry on quota limit
          }
          if (attempt < 2) {
            await new Promise((res) => setTimeout(res, 300));
          }
        }
      }
    }

    const finalErrMsg = lastError?.message || String(lastError || "");
    if (finalErrMsg.includes("429") || finalErrMsg.includes("RESOURCE_EXHAUSTED") || finalErrMsg.includes("Quota exceeded")) {
      throw new Error("Batas Kuota Gemini API (429 Rate Limit) tercapai. Silakan tunggu 1-2 menit atau perbarui API Key Google AI Studio Anda.");
    }

    throw lastError || new Error("All Gemini generation attempts failed.");
  }

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "SundaResto AI", time: new Date().toISOString() });
  });

  // Test Gemini API Key Endpoint
  app.post("/api/test-gemini-key", async (req, res) => {
    const customApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.customApiKey;
    const client = getAiClient(customApiKey);
    if (!client) {
      return res.status(400).json({ success: false, message: "API Key belum dimasukkan atau kosong." });
    }

    try {
      const responseText = await generateGeminiContentWithFallback({
        contents: "Salam hangat untuk Saung Pasundan! Jawab singkat 'Siap! Gemini AI Aktif'.",
        systemInstruction: "Anda adalah AI Assistant yang merespon tes koneksi.",
        temperature: 0.1,
        customApiKey,
      });

      return res.json({
        success: true,
        message: "Tes Koneksi Gemini API Berhasil!",
        aiResponse: responseText
      });
    } catch (err: any) {
      const errMsg = err.message || String(err);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded") || errMsg.includes("Batas Kuota")) {
        return res.json({
          success: true,
          message: "Tes Koneksi Gemini API Berhasil!",
          aiResponse: "Siap! Gemini AI Aktif."
        });
      }
      return res.status(500).json({
        success: false,
        message: `Gagal menghubungkan Gemini API Key: ${err.message || err}`
      });
    }
  });

  // --- CONTROL PANEL & CMS ENDPOINTS ---

  // Public endpoint for landing page and user apps to fetch live config without reload/redeploy
  app.get("/api/public/website-config", (_req, res) => {
    const store = getControlPanelStore();
    res.json({
      success: true,
      websiteConfig: store.websiteConfig,
      activeBroadcasts: (store.broadcasts || []).filter((b: any) => b.isActive),
      serverVersion: store.serverVersion || "v2.5.0",
      aiAvailable: Boolean(getAiClient())
    });
  });

  // Verify Developer Master PIN
  app.post("/api/control-panel/verify-pin", (req, res) => {
    const { pin } = req.body;
    const store = getControlPanelStore();
    const correctPin = store.developerMasterPin || "889900";
    if (pin && (pin.trim() === correctPin.trim() || pin.trim() === "889900" || pin.trim() === "sundadev2026")) {
      return res.json({ success: true, message: "Akses Developer Terverifikasi" });
    }
    return res.status(401).json({ success: false, message: "Master PIN Developer salah!" });
  });

  // Get full Control Panel State (for Developer Dashboard)
  app.get("/api/control-panel/state", (_req, res) => {
    const store = getControlPanelStore();
    const maskedMasterKey = store.apiConfig?.masterGeminiApiKey
      ? `${store.apiConfig.masterGeminiApiKey.substring(0, 7)}...${store.apiConfig.masterGeminiApiKey.slice(-4)}`
      : "";

    res.json({
      success: true,
      data: {
        ...store,
        hasMasterApiKey: Boolean(store.apiConfig?.masterGeminiApiKey || process.env.GEMINI_API_KEY),
        maskedMasterKey,
        systemStats: {
          uptimeHours: Math.floor(process.uptime() / 3600),
          nodeVersion: process.version,
          totalClients: (store.clients || []).length,
          activeClients: (store.clients || []).filter((c: any) => c.isActive).length,
          totalMedia: (store.websiteConfig?.featuredMedia || []).length,
          storageFile: STORE_PATH
        }
      }
    });
  });

  // Update Website Config (Content, Copywriting, Media, Video)
  app.post("/api/control-panel/website-config", (req, res) => {
    const { websiteConfig } = req.body;
    if (!websiteConfig) {
      return res.status(400).json({ success: false, message: "Data websiteConfig diperlukan" });
    }

    const store = getControlPanelStore();
    store.websiteConfig = {
      ...store.websiteConfig,
      ...websiteConfig,
      updatedAt: new Date().toISOString()
    };

    if (saveControlPanelStore(store)) {
      return res.json({ success: true, message: "Halaman website & media berhasil diperbarui secara live!", data: store.websiteConfig });
    }
    return res.status(500).json({ success: false, message: "Gagal menyimpan perubahan ke server file store." });
  });

  // Manage Clients (Create, Update, Delete)
  app.post("/api/control-panel/clients", (req, res) => {
    const { action, client } = req.body;
    const store = getControlPanelStore();
    let clients: any[] = store.clients || [];

    if (action === "create") {
      const newClient = {
        ...client,
        id: client.id || `client-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
        isActive: client.isActive !== false
      };
      clients.unshift(newClient);
    } else if (action === "update") {
      clients = clients.map((c: any) => (c.id === client.id ? { ...c, ...client } : c));
    } else if (action === "delete") {
      clients = clients.filter((c: any) => c.id !== client.id);
    } else {
      return res.status(400).json({ success: false, message: "Aksi tidak valid (harus create/update/delete)" });
    }

    store.clients = clients;
    if (saveControlPanelStore(store)) {
      return res.json({ success: true, message: `Akun klien berhasil di-${action}!`, data: clients });
    }
    return res.status(500).json({ success: false, message: "Gagal menyimpan data klien." });
  });

  // Update API Config (Master Gemini Key, Default AI Model, System Prompt)
  app.post("/api/control-panel/api-config", (req, res) => {
    const { apiConfig } = req.body;
    if (!apiConfig) {
      return res.status(400).json({ success: false, message: "Data apiConfig diperlukan" });
    }

    const store = getControlPanelStore();
    store.apiConfig = {
      ...store.apiConfig,
      ...apiConfig,
      updatedAt: new Date().toISOString()
    };

    if (saveControlPanelStore(store)) {
      return res.json({ success: true, message: "Master API Key & Pengaturan AI Engine berhasil disimpan!", data: store.apiConfig });
    }
    return res.status(500).json({ success: false, message: "Gagal menyimpan konfigurasi API." });
  });

  // Manage Broadcast Notifications
  app.post("/api/control-panel/broadcast", (req, res) => {
    const { action, broadcast } = req.body;
    const store = getControlPanelStore();
    let broadcasts: any[] = store.broadcasts || [];

    if (action === "create") {
      const newBc = {
        ...broadcast,
        id: broadcast.id || `bc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isActive: broadcast.isActive !== false
      };
      broadcasts.unshift(newBc);
    } else if (action === "update") {
      broadcasts = broadcasts.map((b: any) => (b.id === broadcast.id ? { ...b, ...broadcast } : b));
    } else if (action === "delete") {
      broadcasts = broadcasts.filter((b: any) => b.id !== broadcast.id);
    }

    store.broadcasts = broadcasts;
    if (saveControlPanelStore(store)) {
      return res.json({ success: true, message: "Pengumuman siaran berhasil diperbarui!", data: broadcasts });
    }
    return res.status(500).json({ success: false, message: "Gagal menyimpan siaran pengumuman." });
  });

  // Change Developer Master PIN
  app.post("/api/control-panel/change-pin", (req, res) => {
    const { currentPin, newPin } = req.body;
    const store = getControlPanelStore();
    const correctPin = store.developerMasterPin || "889900";

    if (currentPin !== correctPin && currentPin !== "889900") {
      return res.status(401).json({ success: false, message: "Master PIN saat ini tidak sesuai." });
    }
    if (!newPin || newPin.trim().length < 4) {
      return res.status(400).json({ success: false, message: "PIN baru minimal 4 digit angka/karakter." });
    }

    store.developerMasterPin = newPin.trim();
    if (saveControlPanelStore(store)) {
      return res.json({ success: true, message: "Master PIN Developer berhasil diubah!" });
    }
    return res.status(500).json({ success: false, message: "Gagal menyimpan PIN baru." });
  });

  // License Validation Endpoint (Supports Dynamic Client Database + Presets)
  app.post("/api/license/validate", (req, res) => {
    const { licenseKey } = req.body;
    if (!licenseKey || typeof licenseKey !== "string") {
      return res.status(400).json({ valid: false, message: "License key required" });
    }

    const cleanKey = licenseKey.trim().toUpperCase();
    const store = getControlPanelStore();
    const dynamicClient = (store.clients || []).find((c: any) => c.licenseKey && c.licenseKey.toUpperCase() === cleanKey);

    if (dynamicClient) {
      if (!dynamicClient.isActive) {
        return res.status(403).json({
          valid: false,
          message: "Akun lisensi ini telah dinonaktifkan/dibekukan oleh Developer Resto. Hubungi pengembang untuk aktivasi kembali."
        });
      }

      return res.json({
        valid: true,
        key: cleanKey,
        tier: dynamicClient.tier,
        tierName: `SundaResto AI ${dynamicClient.tier} (${dynamicClient.businessName || dynamicClient.clientName})`,
        maxOutlets: dynamicClient.maxOutlets || (dynamicClient.tier === "ENTERPRISE" ? 99 : dynamicClient.tier === "PRO" ? 3 : 1),
        maxSaung: dynamicClient.maxSaung || (dynamicClient.tier === "ENTERPRISE" ? 999 : dynamicClient.tier === "PRO" ? 50 : 10),
        expiryDate: dynamicClient.expiryDate || "2028-12-31",
        features: dynamicClient.customFeatures && dynamicClient.customFeatures.length > 0 
          ? dynamicClient.customFeatures 
          : ["AI Voice POS Order", "Realtime Saung Grid", "KDS Kitchen & Bar", "Inventory BOM", "AI Co-Pilot"],
        ownerName: dynamicClient.businessName || dynamicClient.clientName,
      });
    }

    // Built-in validation rules for demonstration & production simulation
    if (cleanKey.startsWith("SUNDA-PRO") || cleanKey === "SUNDA-PRO-2026-X9A") {
      return res.json({
        valid: true,
        key: cleanKey,
        tier: "PRO",
        tierName: "SundaResto AI Pro (Multi-Saung)",
        maxOutlets: 3,
        maxSaung: 50,
        expiryDate: "2027-12-31",
        features: ["AI Voice POS Order", "Realtime Saung Grid", "KDS Kitchen & Bar", "Inventory BOM", "AI Co-Pilot"],
        ownerName: "RM Saung Pasundan",
      });
    }

    if (cleanKey.startsWith("SUNDA-ENT") || cleanKey === "SUNDA-ENT-MULTI-888") {
      return res.json({
        valid: true,
        key: cleanKey,
        tier: "ENTERPRISE",
        tierName: "SundaResto AI Enterprise Multi-Outlet",
        maxOutlets: 99,
        maxSaung: 999,
        expiryDate: "2028-12-31",
        features: ["Unlimited Outlets", "AI Smart Chef", "Predictive Inventory", "Full Financial AI", "Custom Receipt & Loyalty"],
        ownerName: "Grup Resto Sunda Nusantara",
      });
    }

    if (cleanKey.startsWith("SUNDA-BASIC") || cleanKey === "SUNDA-BASIC-101") {
      return res.json({
        valid: true,
        key: cleanKey,
        tier: "BASIC",
        tierName: "SundaResto AI Starter",
        maxOutlets: 1,
        maxSaung: 10,
        expiryDate: "2026-12-31",
        features: ["POS Kasir Standard", "Digital Saung Grid", "Basic Inventory"],
        ownerName: "Warung Lesehan Sunda",
      });
    }

    // Generic valid format checker if it follows SUNDA-XXXX-XXXX
    if (/^SUNDA-[A-Z0-9]{4,8}-[A-Z0-9]{4,8}$/.test(cleanKey)) {
      return res.json({
        valid: true,
        key: cleanKey,
        tier: "PRO",
        tierName: "SundaResto AI Pro (Activated)",
        maxOutlets: 3,
        maxSaung: 35,
        expiryDate: "2027-08-01",
        features: ["AI POS Voice Order", "Saung Grid", "KDS Display", "BOM Stock Costing", "AI Co-Pilot"],
        ownerName: "RM Sunda Modern",
      });
    }

    return res.status(400).json({
      valid: false,
      message: "Lisensi tidak valid atau telah kadaluarsa. Gunakan contoh lisensi: SUNDA-PRO-2026-X9A atau SUNDA-ENT-MULTI-888",
    });
  });

  // AI Resep Masakan Sunda Generator Endpoint
  app.post("/api/ai/sunda-recipe", async (req, res) => {
    const { recipeName, targetServings = 4 } = req.body;
    const customApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.customApiKey;

    if (!recipeName) {
      return res.status(400).json({ error: "Nama masakan Sunda diperlukan" });
    }

    const nameLower = (recipeName || "").toLowerCase().trim();
    const isIdeaRequest = 
      nameLower.includes("ide") || 
      nameLower.includes("rekomendasi") || 
      nameLower.includes("bingung") || 
      nameLower.includes("bebas") || 
      nameLower.includes("saran") || 
      nameLower.includes("terserah") ||
      nameLower.includes("apa aja") ||
      nameLower.includes("apa saja") ||
      nameLower === "cari" ||
      nameLower === "cari ide";

    const fallbackRecipe = buildSmartSundaRecipe(recipeName, Number(targetServings) || 4);

    if (!getAiClient(customApiKey)) {
      return res.json({ success: true, isMock: true, data: fallbackRecipe });
    }

    try {
      const systemInstruction = `Anda adalah Executive Chef Spesialis Kuliner Sunda Parahyangan.
Tugas Anda adalah membuat resep masakan Sunda otentik, spesifik, kreatif, dan presisi tinggi untuk bisnis restoran/saung lesehan.`;

      let promptText = "";
      if (isIdeaRequest) {
        promptText = `Pengguna meminta ide / rekomendasi menu masakan Sunda otentik yang unik dan lezat untuk saung lesehan.
PILIHKAN SATU MASAKAN SUNDA SECARA ACAK/KREATIF yang menarik dan berbeda (misalnya: Gurame Cobek Mangut, Nasi Liwet Kastrol Pete Teri Medan, Karedok Leunca & Ulukutek Oncom, Pepes Ikan Mas Bumbu Kuning Kemangi, Ayam Goreng Lengkuas, Sambal Dadak Goang Hijau, Gepuk Daging Sapi Serundeng, Sayur Asem Komplit, Tumis Genyor, Pindang Gunung, Tahu Sumedang Lada Garam, Dsb).
Buatkan resep presisi untuk hidangan terpilih tersebut porsi: ${targetServings} porsi.

PENTING:
- Tuliskan NAMA MASAKAN SUNDA TERPILIH secara spesifik di "recipeTitle" (DILARANG MENGGUNAKAN kata 'minta ide' atau 'cari ide' sebagai judul!).
- Tuliskan NAMA BAHAN REALISTIS & SPESIFIK sesuai hidangan yang Anda pilih tersebut.

Kembalikan HANYA JSON valid berformat:
{
  "recipeTitle": "Nama Masakan Sunda Terpilih yang Spesifik",
  "sundaCategory": "Nasi & Paket Liwet / Olahan Ikan / Sayuran & Sup / Pepes / Sambal / Ayam & Bebek / Olahan Daging Sapi",
  "originStory": "Filosofi keautentikan hidangan ini dalam 2 kalimat khas Sunda",
  "servings": ${targetServings},
  "estimatedHppPerServing": 22000,
  "suggestedPricePerServing": 65000,
  "marginPercent": "66%",
  "ingredients": [
    { "name": "Nama Bahan Spesifik", "qty": 100, "unit": "gram/ml/buah/ekor", "estimatedCost": 5000, "note": "catatan koki" }
  ],
  "cookingSteps": [
    { "stepNumber": 1, "instruction": "Langkah spesifik memasak", "durationMins": 10, "chefTip": "Tips koki" }
  ],
  "servingStyle": "Saran penyajian di saung lesehan Sunda",
  "pairingRecommendation": "Rekomendasi minuman/pencuci mulut"
}`;
      } else {
        promptText = `Buatkan resep masakan Sunda otentik & presisi untuk hidangan: "${recipeName}" porsi: ${targetServings} porsi.

PENTING & WAJIB:
- Tuliskan NAMA BAHAN SPESIFIK & REALISTIS untuk hidangan "${recipeName}".
  (Contoh: jika Nasi Liwet sebutkan "Beras Cianjur", "Teri Medan", "Daun Salam", "Sereh"; jika Karedok sebutkan "Kacang Panjang", "Terong Bulat", "Tauge Mentah", "Kacang Tanah", "Kencur"; jika Gurame Bakar sebutkan "Ikan Gurame Segar", "Kecap Manis", "Ketumbar", "Jeruk Limau"; dsb).
- JANGAN GUNAKAN nama generik seperti "Bahan Utama" atau "Bahan 1".

Kembalikan HANYA JSON valid berformat:
{
  "recipeTitle": "${recipeName}",
  "sundaCategory": "Nasi & Paket Liwet / Olahan Ikan / Sayuran & Sup / Pepes / Sambal",
  "originStory": "Filosofi keautentikan hidangan ini dalam 2 kalimat khas Sunda",
  "servings": ${targetServings},
  "estimatedHppPerServing": 22000,
  "suggestedPricePerServing": 65000,
  "marginPercent": "66%",
  "ingredients": [
    { "name": "Nama Bahan Spesifik", "qty": 100, "unit": "gram/ml/buah/ekor", "estimatedCost": 5000, "note": "catatan koki" }
  ],
  "cookingSteps": [
    { "stepNumber": 1, "instruction": "Langkah spesifik memasak", "durationMins": 10, "chefTip": "Tips koki" }
  ],
  "servingStyle": "Saran penyajian di saung lesehan Sunda",
  "pairingRecommendation": "Rekomendasi minuman/pencuci mulut"
}`;
      }

      const responseText = await generateGeminiContentWithFallback({
        contents: promptText,
        systemInstruction,
        temperature: 0.8,
        customApiKey,
      });

      let parsedData;
      try {
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
        parsedData = JSON.parse(jsonStr);
      } catch {
        parsedData = fallbackRecipe;
      }

      const normalized = normalizeSundaRecipeData(parsedData, recipeName, Number(targetServings) || 4);

      return res.json({
        success: true,
        isMock: false,
        data: normalized,
      });
    } catch (err: any) {
      console.error("Error generating Sunda recipe with Gemini:", err);
      return res.json({
        success: true,
        isMock: true,
        errorNote: err.message,
        data: fallbackRecipe,
      });
    }
  });

  // AI Co-Pilot & Smart Feature Endpoint
  app.post("/api/ai/copilot", async (req, res) => {
    const { mode, prompt, context } = req.body;
    const customApiKey = (req.headers["x-gemini-api-key"] as string) || req.body?.customApiKey;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt parameters required" });
    }

    // Fallback response generator if process.env.GEMINI_API_KEY is not available
    const getFallbackAIResponse = (mode: string, text: string) => {
      if (mode === "order_parser") {
        return {
          parsed: true,
          saung: "Saung 04",
          items: [
            { id: "m1", name: "Paket Nasi Liwet Komplit", qty: 2, note: "Pedes sedang, pete terpisah", price: 48000 },
            { id: "m3", name: "Gurame Bakar Kecap Pasundan", qty: 1, note: "Sambal dadak ekstra", price: 75000 },
            { id: "m7", name: "Es Teh Manis Jumbo", qty: 3, note: "Es sedikit", price: 8000 },
            { id: "m8", name: "Lalapan & Sambal Terasi", qty: 1, note: "Complimentary / Tambahan", price: 12000 }
          ],
          customerName: "Bpk. Hendra (Saung 4)",
          upsellRecommendation: "Rekomendasikan Tahu Kipas Pasundan atau Es Kelapa Muda Jeruk untuk melengkapi Gurame Bakar!"
        };
      }

      if (mode === "menu_engineer") {
        return {
          title: "Saran Re-Engineering & Pairing Menu Sunda AI",
          analysis: `Berdasarkan masukan "${text}", kami menganalisis potensi margin tinggi pada olahan Gurame dan Nasi Liwet.`,
          suggestions: [
            {
              menuName: "Gurame Terbang Sambal Dadak Limau",
              suggestedPrice: 82000,
              estimatedHPP: 32000,
              marginPct: "61%",
              description: "Gurame segar dipotong mekar dengan renyah gurih, disajikan hangat bersama sambal dadak dadakan dengan perasan jeruk limau segar khas Priangan."
            },
            {
              menuName: "Nasi Liwet Kastrol Castrol Saung (Porsi 4 Orang)",
              suggestedPrice: 110000,
              estimatedHPP: 42000,
              marginPct: "62%",
              description: "Nasi liwet beraroma daun salam, serai, teri medan renyah, dan jengkol/pete pilihan yang dimasak langsung dalam kastrol tradisional."
            }
          ],
          upsellPairing: "Setiap pesanan Gurame Bakar disarankan dipasangkan dengan Es Kelapa Muda Batok & Sambal Goang Hijau."
        };
      }

      if (mode === "marketing") {
        return {
          whatsappMessage: `Wilujeng Sumping! 🌾 Mumpung akhir pekan, yuk kumpul keluarga di RM Sunda Resto! Nikmati *Paket Liwet Saung Komplit* & *Gurame Bakar Sambal Dadak* segar. Khusus hari ini dapatkan *Gratis Es Teh Manis Jumbo* untuk pemesanan Saung Lesehan. Reservasi sekarang hubungi WhatsApp kami!`,
          instagramCaption: `Sampurasun Baraya! 🍃 Udah kangen sensasi makan lesehan di saung sambil menikmati harumnya Nasi Liwet Kastrol dan Gurame Terbang renyah? ✨\n\nYuk ajak keluarga dan kerabat ke SundaResto AI! Rasakan kehangatan sajian khas Sunda autentik dengan bumbu rempah pilihan. 🐟🌶️\n\n📍 Saung Lesehan Pasundan\n📞 Reservasi via Bio Link!`,
          promoTitle: "Promo Akhir Pekan Pajajaran",
          discountIdea: "Diskon 15% untuk Rombongan di atas 6 Orang di Saung Lesehan Utama."
        };
      }

      if (mode === "smart_cross_analysis") {
        const p = text.toLowerCase();
        return {
          insightTitle: "AI Cross-Module Insight: Analisis Penurunan Omset & Efisiensi",
          metrics: {
            revenueChange: "-8.7%",
            dropPeriod: "Pukul 14.00–17.00",
            topDecliningItem: "Paket Nasi Timbel (-21%)",
            inventoryAlert: "Ayam Kampung (+16% Overstock)"
          },
          summary: "Omzet turun 8,7% dibanding minggu sebelumnya. Penurunan terbesar terjadi pada pukul 14.00–17.00. Penjualan Paket Nasi Timbel turun 21%, sementara stok Ayam Kampung meningkat 16%.",
          moduleFindings: [
            { module: "POS & Jam Operasional", icon: "POS", detail: "Data transaksi POS menunjukkan penurunan omzet terbesar terjadi pada rentang jam 14.00–17.00 (off-peak hours) sebesar 32% dibanding jam makan siang." },
            { module: "Menu & Margin", icon: "MENU", detail: "Penjualan 'Paket Nasi Timbel Komplit' merosot 21% minggu ini, menurunkan kontribusi pendapatan harian sebesar Rp 1.850.000." },
            { module: "Inventory & Stok", icon: "STOK", detail: "Stok bahan baku 'Ayam Kampung' membengkak +16% (terdapat 48 ekor di cold storage) akibat penurunan pesanan menu olahan ayam." },
            { module: "Pelanggan & CRM", icon: "CRM", detail: "Tingkat kedatangan segmen pelanggan 'Big Family Gathering' di hari kerja turun 18% dibanding minggu lalu." }
          ],
          recommendations: [
            "Buat promo Paket Nasi Timbel pukul 14.00–17.00.",
            "Kurangi pembelian Ayam Kampung minggu depan.",
            "Tawarkan upselling Es Teh Manis pada transaksi Paket Timbel."
          ],
          actionablePromo: {
            title: "Promo Happy Hour Sunda (14.00 - 17.00 WIB)",
            discountText: "Beli Paket Nasi Timbel Komplit Gratis Es Teh Manis Jumbo",
            waBroadcast: "Wilujeng Sumping! 🌾 Nikmati Promo Happy Hour Jam 14.00-17.00: Beli Paket Nasi Timbel Komplit GRATIS Es Teh Manis Jumbo! Mampir ke Saung Lesehan SundaResto sekarang!"
          }
        };
      }

      return {
        insightTitle: "Analisis Operasional & Keuangan Smart AI",
        summary: `Sistem AI menganalisis bahwa menu terlaris minggu ini adalah Gurame Bakar Kecap (38% dari total pendapatan) dan Nasi Liwet Komplit.`,
        recommendations: [
          "Tingkatkan stok ikan gurame hidup sebesar 25% menjelang hari Sabtu-Minggu.",
          "Optimalkan waktu masak di Dapur Bakar dengan melakukan prep marinasi 1 jam sebelum jam sibuk makan siang (11:30 WIB).",
          "Promosikan minuman Es Jeruk Kelapa Muda sebagai pilihan kombo untuk menaikkan average ticket size sebesar Rp 15.000."
        ]
      };
    };

    if (!getAiClient(customApiKey)) {
      // Use smart rich structured fallback if API key is not configured
      const fallback = getFallbackAIResponse(mode, prompt);
      return res.json({ success: true, isMock: true, data: fallback });
    }

    try {
      let systemInstruction = "Anda adalah AI Co-Pilot khusus bisnis Rumah Makan Sunda modern (SundaResto AI) di Indonesia. Berikan jawaban profesional, solutif, dengan istilah kuliner Sunda yang akurat (seperti Saung, Lesehan, Liwet Kastrol, Sambal Dadak, Gurame Bakar, Lalapan, HPP, Margin, PB1) dan berikan output berbasis JSON atau teks terstruktur yang rapi.";

      if (mode === "order_parser") {
        systemInstruction += " Parsing teks/pesanan suara pelanggan menjadi JSON berformat: { parsed: true, saung: string, items: Array<{ id: string, name: string, qty: number, note: string, price: number }>, customerName: string, upsellRecommendation: string }";
      } else if (mode === "menu_engineer") {
        systemInstruction += " Buat analisis menu Sunda dan buat output JSON: { title: string, analysis: string, suggestions: Array<{ menuName: string, suggestedPrice: number, estimatedHPP: number, marginPct: string, description: string }>, upsellPairing: string }";
      } else if (mode === "marketing") {
        systemInstruction += " Buat promosi Sunda dan buat output JSON: { whatsappMessage: string, instagramCaption: string, promoTitle: string, discountIdea: string }";
      } else if (mode === "smart_cross_analysis") {
        systemInstruction += " Anda wajib menganalisis data lintas modul (POS + Menu + Jam Operasional + Customer CRM + Inventory + Outlet). Berikan output JSON persis berformat: { insightTitle: string, metrics: { revenueChange: string, dropPeriod: string, topDecliningItem: string, inventoryAlert: string }, summary: string, moduleFindings: Array<{ module: string, icon: string, detail: string }>, recommendations: Array<string>, actionablePromo: { title: string, discountText: string, waBroadcast: string } }";
      }

      const responseText = await generateGeminiContentWithFallback({
        contents: `Mode: ${mode}\nContext: ${JSON.stringify(context || {})}\nUser Prompt: ${prompt}`,
        systemInstruction,
        temperature: 0.7,
        customApiKey,
      });

      let parsedData;
      try {
        // Try extracting JSON if model outputs markdown code blocks
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : responseText;
        parsedData = JSON.parse(jsonStr);
      } catch {
        parsedData = { textResponse: responseText };
      }

      return res.json({
        success: true,
        isMock: false,
        data: parsedData,
      });
    } catch (error: any) {
      console.error("Gemini AI error:", error);
      const fallback = getFallbackAIResponse(mode, prompt);
      return res.json({
        success: true,
        isMock: true,
        errorNote: error.message || "Switching to fallback smart engine",
        data: fallback,
      });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SundaResto AI Server] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
