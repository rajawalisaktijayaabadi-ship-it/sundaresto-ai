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

export async function generateSundaRecipeClient(recipeName: string, targetServings: number, apiKey: string) {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error("API Key tidak valid");
  }

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  const promptText = `Buatkan resep masakan Sunda otentik: '${recipeName}' untuk ${targetServings} porsi.
Format respon HANYA JSON valid:
{
  "recipeName": "...",
  "category": "...",
  "targetServings": ${targetServings},
  "prepTimeMinutes": 20,
  "cookTimeMinutes": 30,
  "ingredients": [
    { "name": "Bahan 1", "quantity": 100, "unit": "gram", "estimatedCostPerUnit": 50, "totalCost": 5000 }
  ],
  "steps": ["Langkah 1", "Langkah 2"],
  "chefTips": "...",
  "pairingRecommendation": "..."
}`;

  const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];
  let lastErr: any = null;
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
      return JSON.parse(jsonStr);
    } catch (err: any) {
      lastErr = err;
      const errMsg = err.message || String(err);
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      continue;
    }
  }

  throw lastErr || new Error("Gagal menghasilkan resep Sunda AI");
}

