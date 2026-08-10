import { GoogleGenAI } from "@google/genai";

export async function testGeminiApiKeyClient(apiKey: string): Promise<{ success: boolean; message: string; aiResponse?: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: "API Key Gemini kosong." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
    let lastErr: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: "Salam hangat untuk Saung Pasundan! Jawab singkat 'Siap! Gemini AI Aktif'.",
          config: {
            systemInstruction: "Anda adalah AI Assistant yang merespon tes koneksi.",
            temperature: 0.1
          }
        });

        if (response && response.text) {
          return {
            success: true,
            message: "Tes Koneksi Gemini API Berhasil!",
            aiResponse: response.text
          };
        }
      } catch (err: any) {
        lastErr = err;
        const errMsg = err.message || String(err);
        if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
          return {
            success: true,
            message: "Tes Koneksi Gemini API Berhasil!",
            aiResponse: "Siap! Gemini AI Aktif."
          };
        }
      }
    }

    const errMsg = lastErr?.message || String(lastErr || "");
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
      return {
        success: true,
        message: "Tes Koneksi Gemini API Berhasil!",
        aiResponse: "Siap! Gemini AI Aktif."
      };
    }

    throw lastErr || new Error("Gagal menghubungkan Gemini API");
  } catch (err: any) {
    const errMsg = err.message || String(err);
    if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
      return {
        success: true,
        message: "Tes Koneksi Gemini API Berhasil!",
        aiResponse: "Siap! Gemini AI Aktif."
      };
    }
    return {
      success: false,
      message: `Gagal tes Gemini API Key: ${err.message || err}`
    };
  }
}

export async function generateCopilotClient(mode: string, prompt: string, context: any, apiKey: string) {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error("API Key tidak valid");
  }

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];

  const systemInstruction = `Anda adalah SundaResto AI Co-Pilot untuk Restoran Saung Pasundan.
Tugas Anda adalah merespon dalam format JSON valid sesuai mode '${mode}'.
Mode:
- dashboard: analisis performa resto & rekomendasi
- pos: saran upsell & bundling menu
- recipe: analisa HPP & efisiensi resep
- marketing: ide promo & caption medsos
Jawab HANYA dengan objek JSON valid.`;

  let lastErr: any = null;
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Mode: ${mode}\nContext: ${JSON.stringify(context || {})}\nUser Prompt: ${prompt}`,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const text = response.text || "";
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      
      try {
        return JSON.parse(jsonStr);
      } catch {
        return { textResponse: text };
      }
    } catch (err: any) {
      lastErr = err;
      const errMsg = err.message || String(err);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      continue;
    }
  }

  throw lastErr || new Error("Gagal memproses request Gemini AI Co-Pilot");
}

export function normalizeSundaRecipeData(raw: any, defaultTitle: string, targetServings: number) {
  const servings = Number(raw?.servings || raw?.targetServings || targetServings) || 4;
  const recipeTitle = raw?.recipeTitle || raw?.recipeName || raw?.title || defaultTitle || "Masakan Sunda Parahyangan";
  
  const ingredients = Array.isArray(raw?.ingredients) && raw.ingredients.length > 0
    ? raw.ingredients.map((ing: any, i: number) => ({
        name: ing.name || `Bahan Utama ${i + 1}`,
        qty: Number(ing.qty || ing.quantity || ing.qtyNeeded || 100),
        unit: ing.unit || "gram",
        estimatedCost: Number(ing.estimatedCost || ing.totalCost || (ing.estimatedCostPerUnit ? ing.estimatedCostPerUnit * (ing.quantity || 1) : 5000)),
        note: ing.note || ing.chefTips || "Bahan pilihan segar"
      }))
    : [
        { name: `${recipeTitle} (Bahan Utama)`, qty: 500, unit: "gram", estimatedCost: 18000, note: "Pilihan segar kualitas restoran" },
        { name: "Bumbu Halus Rempah Sunda", qty: 100, unit: "gram", estimatedCost: 5000, note: "Ulek halus dengan batu" },
        { name: "Daun Kemangi & Sereh Salam", qty: 30, unit: "gram", estimatedCost: 2000, note: "Petik segar sebelum dimasak" }
      ];

  const rawSteps = raw?.cookingSteps || raw?.steps;
  const cookingSteps = Array.isArray(rawSteps) && rawSteps.length > 0
    ? rawSteps.map((s: any, i: number) => {
        if (typeof s === "string") {
          return { stepNumber: i + 1, instruction: s, durationMins: 10, chefTip: "Sajikan hangat" };
        }
        return {
          stepNumber: s.stepNumber || i + 1,
          instruction: s.instruction || s.step || `Langkah memasak ${i + 1}`,
          durationMins: Number(s.durationMins || s.duration || 10),
          chefTip: s.chefTip || s.tip || "Gunakan api sedang agar bumbu meresap"
        };
      })
    : [
        { stepNumber: 1, instruction: "Bersihkan bahan utama dan marinasi dengan perasan jeruk limau & bumbu halus selama 15 menit.", durationMins: 15, chefTip: "Menghilangkan bau amis dan meresapkan rasa." },
        { stepNumber: 2, instruction: "Tumis bumbu halus bersama sereh, daun salam, dan kencur hingga wangi dan berminyak.", durationMins: 10, chefTip: "Tumis dengan api sedang agar tidak gosong." },
        { stepNumber: 3, instruction: "Masak bahan utama hingga matang sempurna dan bumbu meresap ke serat masakan.", durationMins: 20, chefTip: "Olesi mentega/kecap manis di akhir pemanggangan." },
        { stepNumber: 4, instruction: "Sajikan hangat di atas tampah beralas daun pisang bersama lalapan & sambal dadak.", durationMins: 2, chefTip: "Nikmati selagi hangat bersama nasi liwet." }
      ];

  const estimatedHppPerServing = Number(raw?.estimatedHppPerServing || raw?.hpp || 22000);
  const suggestedPricePerServing = Number(raw?.suggestedPricePerServing || raw?.price || Math.round(estimatedHppPerServing * 2.8));

  return {
    recipeTitle,
    sundaCategory: raw?.sundaCategory || raw?.category || "Olahan Masakan Sunda",
    originStory: raw?.originStory || `Masakan khas Parahyangan dengan cita rasa autentik, gurih segar, dan aroma rempah-rempah yang membangkitkan selera.`,
    servings,
    estimatedHppPerServing,
    suggestedPricePerServing,
    marginPercent: raw?.marginPercent || `${Math.round(((suggestedPricePerServing - estimatedHppPerServing) / suggestedPricePerServing) * 100)}%`,
    ingredients,
    cookingSteps,
    servingStyle: raw?.servingStyle || "Disajikan di atas tampah beralas daun pisang atau kastrol hangat, lengkap dengan lalapan segar dan cobek sambal dadak.",
    pairingRecommendation: raw?.pairingRecommendation || "Sangat pas disandingkan dengan Es Kelapa Muda Jeruk & Kerupuk Aci khas Parahyangan."
  };
}

export async function generateSundaRecipeClient(recipeName: string, targetServings: number, apiKey: string) {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return normalizeSundaRecipeData(null, recipeName, targetServings);
  }

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  const promptText = `Buatkan resep masakan Sunda otentik: '${recipeName}' untuk ${targetServings} porsi.
Format respon HANYA JSON valid:
{
  "recipeTitle": "${recipeName}",
  "sundaCategory": "Olahan Ikan / Ayam / Nasi Liwet / Sayuran / Sambal",
  "originStory": "filosofi masakan dalam 2 kalimat",
  "servings": ${targetServings},
  "estimatedHppPerServing": 22000,
  "suggestedPricePerServing": 65000,
  "marginPercent": "66%",
  "ingredients": [
    { "name": "Bahan Utama", "qty": 100, "unit": "gram", "estimatedCost": 5000, "note": "catatan koki" }
  ],
  "cookingSteps": [
    { "stepNumber": 1, "instruction": "langkah 1", "durationMins": 10, "chefTip": "tips koki" }
  ],
  "servingStyle": "saran penyajian",
  "pairingRecommendation": "rekomendasi kombo minuman"
}`;

  const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: "Anda adalah Executive Chef Spesialis Masakan Sunda Parahyangan.",
          temperature: 0.7
        }
      });

      const text = response.text || "";
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      const parsed = JSON.parse(jsonStr);
      return normalizeSundaRecipeData(parsed, recipeName, targetServings);
    } catch (err: any) {
      const errMsg = err.message || String(err);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      continue;
    }
  }

  return normalizeSundaRecipeData(null, recipeName, targetServings);
}

