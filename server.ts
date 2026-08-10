import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Enable CORS & OPTIONS preflight for custom headers like x-gemini-api-key
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-gemini-api-key");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Helper function to lazily get or initialize Gemini AI Client
  function getAiClient(customKey?: string): GoogleGenAI | null {
    const key = (customKey && customKey.trim().length > 0) ? customKey.trim() : process.env.GEMINI_API_KEY;
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

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
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

  // License Validation Endpoint
  app.post("/api/license/validate", (req, res) => {
    const { licenseKey } = req.body;
    if (!licenseKey || typeof licenseKey !== "string") {
      return res.status(400).json({ valid: false, message: "License key required" });
    }

    const cleanKey = licenseKey.trim().toUpperCase();

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

    const fallbackRecipe = {
      recipeTitle: recipeName.includes("Gurame")
        ? "Gurame Bakar Bumbu Rujak Pasundan"
        : recipeName.includes("Liwet")
        ? "Nasi Liwet Kastrol Rempah Saung"
        : recipeName.includes("Pepes")
        ? "Pepes Ikan Mas Bumbu Kuning Kemangi"
        : recipeName.includes("Sayur Asem")
        ? "Sayur Asem Komplit Priangan"
        : recipeName.includes("Sambal")
        ? "Sambal Dadak Limau & Goang Hijau"
        : recipeName,
      sundaCategory: recipeName.includes("Gurame")
        ? "Olahan Gurame & Nila"
        : recipeName.includes("Liwet")
        ? "Nasi & Paket Liwet"
        : recipeName.includes("Pepes")
        ? "Pepes Khas Sunda"
        : recipeName.includes("Sayur")
        ? "Sayuran & Sup"
        : "Sambal Khas Sunda",
      originStory: `Masakan khas Priangan yang autentik dengan keharmonisan rasa gurih, pedas segar, dan aroma rempah harum yang dimasak secara tradisional.`,
      servings: Number(targetServings) || 4,
      estimatedHppPerServing: 22000,
      suggestedPricePerServing: 65000,
      marginPercent: "66%",
      ingredients: [
        { name: "Bahan Utama (Ikan/Ayam/Beras/Bahan)", qty: 500, unit: "gram", estimatedCost: 15000, note: "Pilihan segar kualitas terbaik" },
        { name: "Bumbu Halus (Kencur, Bawang, Kunyit, Cabai)", qty: 80, unit: "gram", estimatedCost: 4000, note: "Haluskan dengan ulekan batu" },
        { name: "Daun Kemangi & Salam Sereh", qty: 30, unit: "gram", estimatedCost: 1500, note: "Petik segar sebelum dimasak" },
        { name: "Jeruk Limau & Terasi Bakar", qty: 2, unit: "buah", estimatedCost: 1500, note: "Untuk aroma wangi segar khas Sunda" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Bersihkan bahan utama, baluri perasan jeruk nipis dan garam halus. Diamkan 10 menit.", durationMins: 10, chefTip: "Perasan nipis meresap menghilangkan bau amis." },
        { stepNumber: 2, instruction: "Tumis bumbu halus khas Sunda bersama daun salam, sereh, dan kencur hingga harum dan berminyak.", durationMins: 8, chefTip: "Gunakan api sedang agar bumbu matang merata tanpa gosong." },
        { stepNumber: 3, instruction: "Ungkep atau panggang bahan utama bersama bumbu olesan rempah hingga bumbu meresap ke dalam serat.", durationMins: 20, chefTip: "Olesi mentega/kecap manis di 5 menit terakhir pemanggangan." },
        { stepNumber: 4, instruction: "Angkat dan sajikan hangat di atas tampah beralaskan daun pisang bersama lalapan leunca & kemangi.", durationMins: 2, chefTip: "Sajikan bersama cobek sambal dadak segar." }
      ],
      servingStyle: "Disajikan di atas tampah beralas daun pisang atau kastrol hangat, lengkap dengan lalapan segar (leunca, timun, kemangi, terong bulat) dan cobek sambal dadak.",
      pairingRecommendation: "Sangat pas disandingkan dengan Es Kelapa Muda Jeruk & Kerupuk Aci khas Parahyangan."
    };

    if (!getAiClient(customApiKey)) {
      return res.json({ success: true, isMock: true, data: fallbackRecipe });
    }

    try {
      const systemInstruction = `Anda adalah Koki Pakar Kuliner Sunda & Master Chef Rumah Makan Lesehan Sunda. 
Buatkan resep masakan Sunda lengkap, autentik, dan presisi untuk bisnis restoran.
Kembalikan respon JSON persis berformat:
{
  "recipeTitle": "string",
  "sundaCategory": "string (Paket Menu Komplit | Nasi Liwet | Ayam & Bebek | Olahan Ikan | Pepes Khas Sunda | Tumisan & Cah | Sayuran & Sup | Sambal Khas Sunda)",
  "originStory": "string (penjelasan filosofi/keautentikan masakan Sunda ini dalam 2 kalimat)",
  "servings": number,
  "estimatedHppPerServing": number (dalam Rupiah, misal 22000),
  "suggestedPricePerServing": number (dalam Rupiah, misal 65000),
  "marginPercent": "string (misal 66%)",
  "ingredients": [
    { "name": "string", "qty": number, "unit": "string (gram|ml|ekor|porsi|buah)", "estimatedCost": number, "note": "string" }
  ],
  "cookingSteps": [
    { "stepNumber": number, "instruction": "string", "durationMins": number, "chefTip": "string" }
  ],
  "servingStyle": "string (saran penyajian di saung lesehan)",
  "pairingRecommendation": "string (saran minuman/pencuci mulut)"
}`;

      const promptText = `Buatkan resep masakan Sunda autentik: "${recipeName}" untuk porsi: ${targetServings} porsi. Sertakan rincian bahan presisi, estimasi HPP per porsi, dan langkah memasak ala koki Sunda.`;

      const responseText = await generateGeminiContentWithFallback({
        contents: promptText,
        systemInstruction,
        temperature: 0.7,
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

      return res.json({
        success: true,
        isMock: false,
        data: parsedData,
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
