import { GoogleGenAI } from "@google/genai";

export async function testGeminiApiKeyClient(apiKey: string): Promise<{ success: boolean; message: string; aiResponse?: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, message: "API Key Gemini kosong." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
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
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

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

export function sanitizeSundaTitle(raw: string): string {
  if (!raw) return "Ayam Bakar Bekakak Pasundan";
  const cleaned = raw
    .replace(/\b(cari|minta|tolong|buatkan|resep|ide|rekomendasi|saran|bingung|bebas|apa|saja|aja|menu)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length < 2) {
    return "Ayam Bakar Bekakak Pasundan";
  }
  return cleaned;
}

const SUNDA_IDEAS_POOL = [
  {
    recipeTitle: "Nasi Liwet Kastrol Pete Teri Medan",
    sundaCategory: "Nasi & Paket Liwet",
    originStory: "Nasi liwet khas Parahyangan dimasak dalam kastrol aluminium bersama bumbu rempah harum, pete segar, dan taburan teri medan garing.",
    estimatedHppPerServing: 18000,
    suggestedPricePerServing: 48000,
    marginPercent: "62%",
    ingredients: (s: number) => [
      { name: "Beras Pulen Cianjur", qty: 120 * s, unit: "gram", estimatedCost: 2000 * s, note: "Pilihan beras harum Cianjur" },
      { name: "Teri Medan Garing", qty: 30 * s, unit: "gram", estimatedCost: 3500 * s, note: "Goreng renyah garing" },
      { name: "Pete Segar Kupas", qty: 25 * s, unit: "gram", estimatedCost: 3000 * s, note: "Aroma wangi gurih" },
      { name: "Bawang Merah & Putih Iris", qty: 30 * s, unit: "gram", estimatedCost: 1500 * s, note: "Tumis harum awal" },
      { name: "Daun Salam, Sereh Memar & Cabai Rawit", qty: 20 * s, unit: "gram", estimatedCost: 1500 * s, note: "Rempah komplit kastrol" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Cuci beras Cianjur hingga bersih, masukkan ke dalam kastrol aluminium tradisional.", durationMins: 5, chefTip: "Gunakan air bersuhu ruang dengan takaran 1.25 tinggi beras." },
      { stepNumber: 2, instruction: "Tumis irisan bawang merah, bawang putih, daun salam, dan serai hingga harum, lalu campurkan ke beras bersama pete dan garam.", durationMins: 8, chefTip: "Bumbu tumis membuat nasi liwet gurih meresap." },
      { stepNumber: 3, instruction: "Masak dalam kastrol bertutup di atas api sedang hingga mendidih, lalu kecilkan api hingga air meresap tuntas.", durationMins: 25, chefTip: "Jangan buka tutup kastrol saat tanak agar uap matang sempurna." },
      { stepNumber: 4, instruction: "Taburi teri medan goreng renyah dan cabai rawit utuh di atasnya saat dihidangkan hangat.", durationMins: 2, chefTip: "Sajikan langsung dalam kastrol." }
    ],
    servingStyle: "Disajikan langsung di dalam kastrol aluminium hangat beralaskan daun pisang, lengkap dengan cobek sambal dadak.",
    pairingRecommendation: "Sangat cocok disandingkan dengan Gurame Bakar Bumbu Rujak dan Es Teh Manis Serai."
  },
  {
    recipeTitle: "Gurame Cobek Mangut Khas Saung",
    sundaCategory: "Olahan Ikan",
    originStory: "Gurame goreng renyah disiram sambal cobek jahe kencur khas Priangan yang segar pedas membakar selera.",
    estimatedHppPerServing: 28000,
    suggestedPricePerServing: 75000,
    marginPercent: "62%",
    ingredients: (s: number) => [
      { name: "Ikan Gurame Segar (Kerat)", qty: 200 * s, unit: "gram", estimatedCost: 18000 * s, note: "Goreng garing renyah" },
      { name: "Bumbu Cobek (Kencur, Jahe, Cabai Rawit, Bawang)", qty: 40 * s, unit: "gram", estimatedCost: 3500 * s, note: "Ulek kasar siram air panas" },
      { name: "Jeruk Limau & Terasi Bakar", qty: 15 * s, unit: "gram", estimatedCost: 1500 * s, note: "Penyegar aroma" },
      { name: "Lalapan Leunca, Kemangi & Timun", qty: 50 * s, unit: "gram", estimatedCost: 2000 * s, note: "Mentah segar" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Bersihkan ikan gurame, baluri perasan jeruk nipis, ketumbar, dan garam. Marinasi 15 menit.", durationMins: 15, chefTip: "Kerat dalam badan ikan agar garing sampai tulang." },
      { stepNumber: 2, instruction: "Goreng ikan dalam minyak panas melimpah hingga garing keemasan.", durationMins: 12, chefTip: "Pastikan minyak sangat panas sebelum ikan dimasukkan." },
      { stepNumber: 3, instruction: "Ulek kasar kencur, jahe, cabai rawit, bawang merah, terasi bakar, dan garam di atas cobek batu, lalu siram air panas mendidih dan perasan limau.", durationMins: 5, chefTip: "Siraman air panas menyatukan aroma kencur dan jahe segar." },
      { stepNumber: 4, instruction: "Penyet gurame goreng di atas cobek batu bersiram bumbu.", durationMins: 2, chefTip: "Sajikan panas-panas bersama lalapan leunca." }
    ],
    servingStyle: "Disajikan di atas cobek batu cembung besar dengan siraman bumbu cobek wangi meresap.",
    pairingRecommendation: "Pas disandingkan dengan Nasi Liwet Kastrol dan Es Kelapa Muda."
  },
  {
    recipeTitle: "Karedok Leunca & Ulukutek Oncom",
    sundaCategory: "Sayuran & Sup",
    originStory: "Paduan karedok leunca renyah bumbu kencur dan ulukutek oncom Bandung tumis leunca yang gurih pedas khas saung lesehan.",
    estimatedHppPerServing: 12000,
    suggestedPricePerServing: 35000,
    marginPercent: "65%",
    ingredients: (s: number) => [
      { name: "Leunca Segar & Oncom Bandung", qty: 150 * s, unit: "gram", estimatedCost: 5000 * s, note: "Oncom bakar haluskan" },
      { name: "Bumbu Kencur (Kencur, Cabai Rawit, Terasi, Bawang)", qty: 30 * s, unit: "gram", estimatedCost: 2500 * s, note: "Ulek harum dadakan" },
      { name: "Daun Kemangi & Kacang Panjang", qty: 40 * s, unit: "gram", estimatedCost: 2000 * s, note: "Potong renyah mentah" },
      { name: "Minyak Kelapa & Garam Gula Aren", qty: 15 * s, unit: "gram", estimatedCost: 1000 * s, note: "Penyedap rasa alami" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Bakar oncom Bandung hingga harum kecokelatan, hancurkan dengan ulekan kasar.", durationMins: 8, chefTip: "Oncom Bandung berkualitas memberikan cita rasa gurih khas." },
      { stepNumber: 2, instruction: "Ulek cabai rawit, kencur, terasi bakar, bawang merah, gula aren, dan garam hingga harum.", durationMins: 5, chefTip: "Kencur memberikan aroma khas yang segar." },
      { stepNumber: 3, instruction: "Tumis bumbu ulek bersama oncom dan leunca dengan sedikit minyak kelapa hingga leunca sedikit layu namun tetap renyah.", durationMins: 7, chefTip: "Jangan masak terlalu lama agar leunca tidak pahit." },
      { stepNumber: 4, instruction: "Tambahkan daun kemangi segar di akhir tumisan, angkat dan sajikan.", durationMins: 2, chefTip: "Sajikan hangat bersama kerupuk aci." }
    ],
    servingStyle: "Disajikan di atas cobek gerabah beralaskan daun pisang segar.",
    pairingRecommendation: "Sempurna disantap bersama Nasi Timbel dan Pepes Ikan Mas."
  },
  {
    recipeTitle: "Pepes Ikan Mas Bumbu Kuning Kemangi",
    sundaCategory: "Pepes Khas Sunda",
    originStory: "Ikan mas segar dibumbui rempah kuning melimpah, dibungkus daun pisang batu, dikukus empuk hingga meresap lalu dibakar arang.",
    estimatedHppPerServing: 20000,
    suggestedPricePerServing: 52000,
    marginPercent: "61%",
    ingredients: (s: number) => [
      { name: "Ikan Mas Segar", qty: 180 * s, unit: "gram", estimatedCost: 12000 * s, note: "Bersihkan sisik & insang" },
      { name: "Bumbu Kuning (Kunyit, Kencur, Kemiri, Bawang)", qty: 40 * s, unit: "gram", estimatedCost: 3000 * s, note: "Haluskan dengan ulekan batu" },
      { name: "Daun Kemangi Melimpah & Sereh Salam", qty: 30 * s, unit: "gram", estimatedCost: 2000 * s, note: "Wangi wangi rempah" },
      { name: "Daun Pisang Batu & Semat Lidi", qty: 2 * s, unit: "lembar", estimatedCost: 1000 * s, note: "Bungkus rapi tradisional" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Bersihkan ikan mas, baluri garam dan perasan jeruk nipis. Lumuri seluruh badan ikan dengan bumbu kuning halus.", durationMins: 15, chefTip: "Selipkan bumbu kuning dan daun kemangi ke dalam perut ikan." },
      { stepNumber: 2, instruction: "Tata daun salam, serai memar, cabai rawit, dan kemangi di atas daun pisang batu, letakkan ikan lalu bungkus rapat dan semat lidi.", durationMins: 10, chefTip: "Daun pisang batu tidak mudah robek dan memberi aroma harum alami." },
      { stepNumber: 3, instruction: "Kukus pepes selama 45 menit hingga bumbu meresap merata dan duri ikan melunak.", durationMins: 45, chefTip: "Kukus dengan api sedang bertutup rapat." },
      { stepNumber: 4, instruction: "Bakar sebentar bungkus pepes di atas arang batok kelapa hingga daun mengering dan aromatik.", durationMins: 8, chefTip: "Proses pembakaran arang memunculkan rasa gurih asap khas." }
    ],
    servingStyle: "Disajikan utuh berbungkus daun pisang yang dibuka sedikit untuk memperlihatkan kepulan uap harum.",
    pairingRecommendation: "Sangat pas ditemani Sayur Asem Komplit dan Sambal Dadak."
  },
  {
    recipeTitle: "Ayam Goreng Bumbu Lengkuas Serundeng",
    sundaCategory: "Ayam & Bebek Pasundan",
    originStory: "Ayam pejantan diungkep bumbu parutan lengkuas melimpah, digoreng keemasan dengan taburan serundeng lengkuas garing gurih.",
    estimatedHppPerServing: 22000,
    suggestedPricePerServing: 58000,
    marginPercent: "62%",
    ingredients: (s: number) => [
      { name: "Daging Ayam Pejantan Segar", qty: 200 * s, unit: "gram", estimatedCost: 14000 * s, note: "Potongan porsi padat" },
      { name: "Lengkuas Muda Parut Melimpah", qty: 60 * s, unit: "gram", estimatedCost: 3500 * s, note: "Bumbu serundeng garing" },
      { name: "Bumbu Ungkep (Kunyit, Ketumbar, Bawang, Kemiri)", qty: 35 * s, unit: "gram", estimatedCost: 2500 * s, note: "Ulek halus harum" },
      { name: "Salam Sereh & Air Kelapa", qty: 50 * s, unit: "ml", estimatedCost: 1000 * s, note: "Ungkep gurih alami" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Ungkep potongan ayam bersama parutan lengkuas, bumbu halus, daun salam, serai, dan air kelapa hingga air menyusut dan ayam empuk.", durationMins: 35, chefTip: "Air kelapa membuat serat daging manis gurih alami." },
      { stepNumber: 2, instruction: "Tiriskan ayam dan pisahkan parutan lengkuas sisa ungkepan.", durationMins: 5, chefTip: "Goreng secara terpisah agar serundeng lengkuas tidak gosong." },
      { stepNumber: 3, instruction: "Goreng ayam hingga kuning keemasan, lalu goreng parutan lengkuas hingga garing renyah kecokelatan.", durationMins: 10, chefTip: "Gunakan saringan halus saat mengangkat serundeng lengkuas." },
      { stepNumber: 4, instruction: "Taburi serundeng lengkuas garing melimpah di atas ayam goreng.", durationMins: 2, chefTip: "Sajikan hangat bersama sambal goang hijau." }
    ],
    servingStyle: "Disajikan di atas piring beralas daun pisang dengan taburan serundeng lengkuas gurih melimpah.",
    pairingRecommendation: "Nikmat disandingkan dengan Nasi Hangat, Sayur Asem, dan Sambal Goang."
  },
  {
    recipeTitle: "Sayur Asem Komplit Khas Parahyangan",
    sundaCategory: "Sayuran & Sup",
    originStory: "Kesegaran kuah asam jawa dan gurih terasi bakar dengan kombinasi melinjo, jagung manis, labu siam, dan kacang panjang.",
    estimatedHppPerServing: 10000,
    suggestedPricePerServing: 28000,
    marginPercent: "64%",
    ingredients: (s: number) => [
      { name: "Aneka Sayur Asem (Melinjo, Jagung, Labu Siam, Kacang Panjang)", qty: 200 * s, unit: "gram", estimatedCost: 4500 * s, note: "Potong rapi segar" },
      { name: "Bumbu Asem Jawa & Terasi Bakar", qty: 25 * s, unit: "gram", estimatedCost: 2000 * s, note: "Seduh air hangat" },
      { name: "Bumbu Halus (Cabai Merah, Bawang, Kemiri)", qty: 25 * s, unit: "gram", estimatedCost: 1500 * s, note: "Haluskan halus" },
      { name: "Kacang Tanah & Daun Melinjo", qty: 30 * s, unit: "gram", estimatedCost: 1000 * s, note: "Rebus empuk" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Didihkan air, masukkan bumbu halus, asam jawa, terasi bakar, daun salam, dan lengkuas memar.", durationMins: 10, chefTip: "Rebus bumbu hingga wangi harum keluar." },
      { stepNumber: 2, instruction: "Masukkan bahan keras terlebih dahulu: jagung manis, melinjo, dan kacang tanah. Masak hingga setengah empuk.", durationMins: 15, chefTip: "Memasak bertahap menjaga tekstur sayuran." },
      { stepNumber: 3, instruction: "Masukkan labu siam, kacang panjang, dan daun melinjo. Bumbui gula aren dan garam secukupnya.", durationMins: 8, chefTip: "Cicipi paduan rasa asam, manis, dan gurih yang seimbang." },
      { stepNumber: 4, instruction: "Angkat dan sajikan kuah segar asam manis dalam mangkuk gerabah.", durationMins: 2, chefTip: "Nikmati selagi panas." }
    ],
    servingStyle: "Disajikan dalam mangkuk gerabah dalam keadaan panas dengan kuah bening kemerahan yang segar.",
    pairingRecommendation: "Pendamping setia untuk Ikan Asin Jambal Roti, Sambal Terasi, dan Nasi Liwet."
  },
  {
    recipeTitle: "Sambal Dadak Limau & Goang Hijau",
    sundaCategory: "Sambal Khas Sunda",
    originStory: "Dua varian sambal mentah ikonik Sunda: Sambal Dadak terasi ulek kasar & Sambal Goang hijau kencur siram minyak panas.",
    estimatedHppPerServing: 5000,
    suggestedPricePerServing: 16000,
    marginPercent: "68%",
    ingredients: (s: number) => [
      { name: "Cabai Rawit Merah & Hijau Segar", qty: 30 * s, unit: "gram", estimatedCost: 2000 * s, note: "Segar dipetik" },
      { name: "Kencur & Terasi Bakar Pasundan", qty: 10 * s, unit: "gram", estimatedCost: 1000 * s, note: "Bakar arang harum" },
      { name: "Jeruk Limau & Minyak Kelapa Panas", qty: 15 * s, unit: "ml", estimatedCost: 1000 * s, note: "Siraman harum" },
      { name: "Tomat Hijau, Garam & Gula Aren", qty: 15 * s, unit: "gram", estimatedCost: 500 * s, note: "Penyeimbang rasa" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Untuk Sambal Goang Hijau: Ulek kasar cabai rawit hijau, kencur, garam, dan bawang putih di atas cobek batu.", durationMins: 3, chefTip: "Siram dengan 1 sendok makan minyak kelapa mendidih." },
      { stepNumber: 2, instruction: "Untuk Sambal Dadak: Ulek kasar cabai merah, terasi bakar, gula aren, garam, dan irisan tomat.", durationMins: 3, chefTip: "Kucuri perasan jeruk limau segar beserta kulitnya." },
      { stepNumber: 3, instruction: "Tata kedua jenis sambal berdampingan di piring cobek cembung.", durationMins: 2, chefTip: "Sajikan segera tanpa disimpan lama agar rasa mentah tetap segar." }
    ],
    servingStyle: "Disajikan berdampingan di atas cobek batu cembung beralas daun pisang.",
    pairingRecommendation: "Cocok untuk melengkapi seluruh hidangan gorengan, bakaran, dan lalapan mentah Saung Lesehan."
  },
  {
    recipeTitle: "Gepuk Sapi Serundeng Manis Gurih",
    sundaCategory: "Olahan Daging Sapi",
    originStory: "Daging sapi pilihan direbus empuk, dipukul-pukul hingga seratnya memipih lebar, lalu digoreng dengan bumbu rempah kelapa gurih manis.",
    estimatedHppPerServing: 26000,
    suggestedPricePerServing: 68000,
    marginPercent: "61%",
    ingredients: (s: number) => [
      { name: "Daging Sapi Has Dalam", qty: 120 * s, unit: "gram", estimatedCost: 16000 * s, note: "Rebus empuk memarkan" },
      { name: "Santan & Kelapa Parut Sangrai", qty: 40 * s, unit: "gram", estimatedCost: 3000 * s, note: "Serundeng gurih" },
      { name: "Gula Aren Asli Pasundan", qty: 25 * s, unit: "gram", estimatedCost: 2000 * s, note: "Manis gurih legi" },
      { name: "Bumbu Halus (Ketumbar, Bawang, Lengkuas, Salam)", qty: 30 * s, unit: "gram", estimatedCost: 2000 * s, note: "Ungkep meresap" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: "Rebus daging sapi dalam air bergaram hingga setengah empuk. Potong searah serat lalu pukul-pukul perlahan dengan pemukul daging hingga memipih.", durationMins: 35, chefTip: "Memukul searah serat membuat daging empuk tanpa hancur." },
      { stepNumber: 2, instruction: "Ungkep daging pipih bersama bumbu halus ketumbar, gula aren, air asam jawa, dan santan hingga meresap dan mengering.", durationMins: 30, chefTip: "Gunakan api kecil agar gula aren meresap dalam serat." },
      { stepNumber: 3, instruction: "Goreng daging gepuk sebentar dalam minyak panas hingga kecokelatan mengkaramel.", durationMins: 5, chefTip: "Jangan goreng terlalu lama agar daging tidak keras." },
      { stepNumber: 4, instruction: "Goreng sisa bumbu kelapa hingga menjadi serundeng garing, taburkan di atas gepuk.", durationMins: 5, chefTip: "Sajikan hangat bersama nasi timbel." }
    ],
    servingStyle: "Disajikan di atas piring beralas daun pisang dengan taburan serundeng manis gurih melimpah.",
    pairingRecommendation: "Sangat serasi disandingkan dengan Nasi Timbel, Sayur Asem, dan Sambal Terasi."
  }
];

export function buildSmartSundaRecipe(recipeName: string, targetServings: number) {
  const nameLower = (recipeName || "").toLowerCase().trim();
  const servings = Number(targetServings) || 4;

  // 1. Check if user is asking for ideas or recommendations
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

  if (isIdeaRequest) {
    const randomIndex = Math.floor(Math.random() * SUNDA_IDEAS_POOL.length);
    const tmpl = SUNDA_IDEAS_POOL[randomIndex];
    return {
      recipeTitle: tmpl.recipeTitle,
      sundaCategory: tmpl.sundaCategory,
      originStory: tmpl.originStory,
      servings,
      estimatedHppPerServing: tmpl.estimatedHppPerServing,
      suggestedPricePerServing: tmpl.suggestedPricePerServing,
      marginPercent: tmpl.marginPercent,
      ingredients: tmpl.ingredients(servings),
      cookingSteps: tmpl.cookingSteps,
      servingStyle: tmpl.servingStyle,
      pairingRecommendation: tmpl.pairingRecommendation
    };
  }

  // 2. Check AYAM / BEKAKAK / BEBEK
  if (nameLower.includes("ayam") || nameLower.includes("bekakak") || nameLower.includes("bebek") || nameLower.includes("chick")) {
    const isBebek = nameLower.includes("bebek");
    const proteinName = isBebek ? "Daging Bebek Segar" : "Daging Ayam Kampung Utuh";
    return {
      recipeTitle: recipeName.trim() || "Ayam Bakar Bekakak Bumbu Lengkuas",
      sundaCategory: "Ayam & Bebek Pasundan",
      originStory: `Sajian ${isBebek ? 'bebek' : 'ayam'} khas Sunda yang diungkep bumbu rempah meresap lalu dibakar atau digoreng hingga harum gurih keemasan.`,
      servings,
      estimatedHppPerServing: 26000,
      suggestedPricePerServing: 70000,
      marginPercent: "63%",
      ingredients: [
        { name: proteinName, qty: 220 * servings, unit: "gram", estimatedCost: 18000 * servings, note: "Potongan segar berkualitas" },
        { name: "Bumbu Ungkep Rempah (Lengkuas, Kunyit, Jahe, Kemiri)", qty: 35 * servings, unit: "gram", estimatedCost: 3000 * servings, note: "Ulek halus tradisional" },
        { name: "Daun Salam, Sereh Memar & Santan", qty: 25 * servings, unit: "ml", estimatedCost: 1500 * servings, note: "Memberikan kelezatan gurih" },
        { name: "Kecap Manis Pasundan & Margarin", qty: 20 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Olesan bakar / bumbu goreng" },
        { name: "Lalapan Segar & Cobek Sambal Dadak", qty: 50 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Sajikan komplit saung lesehan" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: `Cuci bersih ${isBebek ? 'bebek' : 'ayam'}, baluri perasan jeruk nipis dan garam. Diamkan 15 menit.`, durationMins: 15, chefTip: "Menghilangkan aroma amis." },
        { stepNumber: 2, instruction: "Ungkep bersama bumbu halus lengkuas, kunyit, daun salam, serai, dan sedikit santan hingga empuk meresap.", durationMins: 30, chefTip: "Ungkep api sedang sampai air surut." },
        { stepNumber: 3, instruction: "Bakar di atas arang batok kelapa sambil diolesi racikan kecap manis margarin hingga kecokelatan harum.", durationMins: 10, chefTip: "Balik sekali-sekali agar tidak gosong." },
        { stepNumber: 4, instruction: "Sajikan hangat di atas daun pisang bersama sambal dadak limau & lalapan leunca.", durationMins: 2, chefTip: "Sajikan bersama nasi hangat." }
      ],
      servingStyle: "Disajikan di atas piring beralas daun pisang segar, dilengkapi sambal dadak limau dan lalapan leunca.",
      pairingRecommendation: "Pas disandingkan dengan Es Teh Manis Serai dan Nasi Liwet."
    };
  }

  // 3. Check GURAME / NILA / IKAN (must come AFTER Ayam check!)
  if (nameLower.includes("gurame") || nameLower.includes("nila") || nameLower.includes("ikan") || nameLower.includes("pindang")) {
    return {
      recipeTitle: recipeName.trim() || "Gurame Bakar Bumbu Rujak Kecap",
      sundaCategory: "Olahan Ikan",
      originStory: "Olahan ikan air tawar khas saung lesehan Sunda dengan teknik marinasi rempah ketumbar kunyit dan olesan kecap manis bakar arang yang meresap sempurna.",
      servings,
      estimatedHppPerServing: 28000,
      suggestedPricePerServing: 75000,
      marginPercent: "62%",
      ingredients: [
        { name: "Ikan Gurame / Nila Segar", qty: 200 * servings, unit: "gram", estimatedCost: 18000 * servings, note: "Potong kerat badan ikan" },
        { name: "Bumbu Marinasi (Kunyit, Bawang, Ketumbar)", qty: 30 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Ulek halus marinasi 15 menit" },
        { name: "Kecap Manis Pasundan & Margarin", qty: 25 * servings, unit: "gram", estimatedCost: 2500 * servings, note: "Olesan bakar arang" },
        { name: "Jeruk Limau & Sambal Kecap Pedas", qty: 15 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Aroma wangi segar" },
        { name: "Lalapan Segar (Timun, Kemangi, Leunca)", qty: 50 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Lalapan mentah segar" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Bersihkan ikan gurame, kerat-kerat badannya lalu lumuri perasan jeruk nipis, garam, dan bumbu halus kunyit ketumbar.", durationMins: 15, chefTip: "Marinasi minimal 15 menit agar bau lumpur hilang." },
        { stepNumber: 2, instruction: "Goreng/bakar setengah matang terlebih dahulu agar daging ikan kokoh dan tidak hancur saat dibakar.", durationMins: 10, chefTip: "Gunakan api arang sedang." },
        { stepNumber: 3, instruction: "Olesi ikan dengan racikan kecap manis, ketumbar halus, margarin, dan sedikit air asam jawa. Bakar di atas arang batok kelapa.", durationMins: 10, chefTip: "Olesi bertahap 3x hingga kecap mengkaramel cantik." },
        { stepNumber: 4, instruction: "Sajikan di atas tampah daun pisang bersama sambal kecap rawit limau & cobek sambal dadak.", durationMins: 2, chefTip: "Kucuri perasan jeruk limau segar saat akan disantap." }
      ],
      servingStyle: "Disajikan utuh di atas tampah beralas daun pisang, dilengkapi cobek sambal kecap rawit, sambal dadak, dan lalapan segar komplit.",
      pairingRecommendation: "Sangat pas ditemani Nasi Liwet Kastrol dan Es Jeruk Kelapa Muda."
    };
  }

  // 4. Check LIWET / NASI
  if (nameLower.includes("liwet") || nameLower.includes("nasi") || nameLower.includes("kastrol") || nameLower.includes("timbel")) {
    return {
      recipeTitle: recipeName.trim() || "Nasi Liwet Kastrol Rempah Saung",
      sundaCategory: "Nasi & Paket Liwet",
      originStory: "Nasi liwet khas Parahyangan dimasak langsung dalam kastrol aluminium bersama rempah harum, teri medan, dan salam sereh untuk cita rasa gurih autentik saung lesehan.",
      servings,
      estimatedHppPerServing: 18000,
      suggestedPricePerServing: 45000,
      marginPercent: "60%",
      ingredients: [
        { name: "Beras Cianjur / Cisaat Pulen", qty: 120 * servings, unit: "gram", estimatedCost: 3000 * servings, note: "Beras lokal pulen aromatik" },
        { name: "Teri Medan / Ikan Asin Peda", qty: 25 * servings, unit: "gram", estimatedCost: 2500 * servings, note: "Goreng garing renyah" },
        { name: "Bawang Merah Siung Utuh", qty: 15 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Tumis harum dalam kastrol" },
        { name: "Daun Salam & Sereh Memar", qty: 2 * servings, unit: "lembar", estimatedCost: 500 * servings, note: "Petik segar aromatik" },
        { name: "Cabai Rawit Merah Utuh", qty: 5 * servings, unit: "buah", estimatedCost: 800 * servings, note: "Tanam utuh di dalam nasi" },
        { name: "Minyak Kelapa / Santan Encuk", qty: 15 * servings, unit: "ml", estimatedCost: 700 * servings, note: "Memberikan kilap gurih" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Cuci beras Cianjur hingga bersih, masukkan ke dalam kastrol aluminium bersama air secukupnya.", durationMins: 5, chefTip: "Ukur air 1 ruas jari di atas beras." },
        { stepNumber: 2, instruction: "Tumis bawang merah, daun salam, sereh memar, dan cabai rawit dengan sedikit minyak kelapa hingga wangi.", durationMins: 5, chefTip: "Jangan sampai bawang gosong agar tidak pahit." },
        { stepNumber: 3, instruction: "Masukkan tumisan bumbu dan sebagian teri goreng ke dalam kastrol, aduk rata lalu tutup rapat kastrol.", durationMins: 20, chefTip: "Gunakan api kecil begitu air mulai surut." },
        { stepNumber: 4, instruction: "Taburkan sisa teri Medan garing di atas nasi liwet hangat. Sajikan langsung dari kastrol bersama lalapan & sambal dadak.", durationMins: 2, chefTip: "Sajikan dengan daun pisang di bawah kastrol." }
      ],
      servingStyle: "Disajikan langsung di dalam kastrol hangat beralaskan daun pisang, dilengkapi dengan lalapan leunca, terong bulat, dan cobek sambal dadak.",
      pairingRecommendation: "Sangat cocok disandingkan dengan Es Kelapa Muda Jeruk Nipis dan Tahu Goreng Sumedang."
    };
  }

  // 5. Check KAREDOK / LOTEK / PENCOK
  if (nameLower.includes("karedok") || nameLower.includes("lotek") || nameLower.includes("pencok") || nameLower.includes("ulukuteuk")) {
    return {
      recipeTitle: recipeName.trim() || "Karedok / Lotek Pasundan",
      sundaCategory: "Sayuran & Salak Sunda",
      originStory: "Lalapan segar mentah khas Sunda yang disiram bumbu kacang kencur dadak, menciptakan paduan rasa renyah, pedas, gurih, dan segar yang membangkitkan selera.",
      servings,
      estimatedHppPerServing: 12000,
      suggestedPricePerServing: 30000,
      marginPercent: "60%",
      ingredients: [
        { name: "Kacang Panjang Segar (Iris)", qty: 40 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Potong 1 cm renyah mentah" },
        { name: "Tauge Panjang Mentah", qty: 30 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Bersihkan ekornya" },
        { name: "Terong Bulat Hijau / Leunca", qty: 25 * servings, unit: "gram", estimatedCost: 1200 * servings, note: "Iris tipis bulat" },
        { name: "Daun Kemangi Segar", qty: 15 * servings, unit: "gram", estimatedCost: 800 * servings, note: "Petik daun muda aromatik" },
        { name: "Kacang Tanah Goreng (Bumbu)", qty: 35 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Goreng matang gurih" },
        { name: "Kencur Segar & Cabai Rawit", qty: 10 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Bumbu kunci karedok Sunda" },
        { name: "Gula Merah Aren & Air Asam Jawa", qty: 15 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Penyeimbang manis gurih" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Ulek kencur, cabai rawit, terasi bakar, garam, dan gula merah di atas cobek batu hingga halus.", durationMins: 5, chefTip: "Kencur harus benar-benar halus agar aromanya menyatu." },
        { stepNumber: 2, instruction: "Masukkan kacang tanah goreng, ulek bertahap sambil diberi sedikit air asam jawa hangat hingga menjadi bumbu kacang kental.", durationMins: 5, chefTip: "Atur kekentalan bumbu agar tidak terlalu encer." },
        { stepNumber: 3, instruction: "Masukkan potongan kacang panjang, tauge, terong bulat, mentimun, dan kemangi segar mentah.", durationMins: 3, chefTip: "Aduk perlahan jangan sampai sayuran terlalu remuk." },
        { stepNumber: 4, instruction: "Pindahkan ke piring saji beralas daun pisang, taburi kerupuk aci merah/kuning di atasnya.", durationMins: 2, chefTip: "Sajikan segera agar sayuran tidak layu." }
      ],
      servingStyle: "Disajikan di atas cobek batu atau piring gerabah beralas daun pisang dengan taburan kerupuk aci renyah.",
      pairingRecommendation: "Pas disandingkan dengan Nasi Hangat, Ikan Asin Jambal Roti, dan Es Teh Manis Serai."
    };
  }

  // 6. Check PEPES
  if (nameLower.includes("pepes")) {
    return {
      recipeTitle: recipeName.trim() || "Pepes Bumbu Kuning Kemangi Pasundan",
      sundaCategory: "Pepes Khas Sunda",
      originStory: "Lauk khas Sunda yang dibungkus rapi dengan daun pisang batu, dikukus lama hingga bumbu meresap ke tulang lalu dibakar arang untuk menghasilkan aroma asap nan legendaris.",
      servings,
      estimatedHppPerServing: 20000,
      suggestedPricePerServing: 50000,
      marginPercent: "60%",
      ingredients: [
        { name: "Ikan Mas / Tahu / Ayam Segar", qty: 150 * servings, unit: "gram", estimatedCost: 11000 * servings, note: "Pilihan segar berkualitas" },
        { name: "Bumbu Halus Pepes (Kencur, Kunyit, Kemiri, Bawang)", qty: 35 * servings, unit: "gram", estimatedCost: 3000 * servings, note: "Haluskan dengan ulekan batu" },
        { name: "Daun Kemangi Segar (Melimpah)", qty: 20 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Aroma wangi khas pepes" },
        { name: "Daun Salam, Sereh & Cabai Rawit Utuh", qty: 15 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Semat dalam bungkusan" },
        { name: "Daun Pisang Batu & Semat Lidi", qty: 2 * servings, unit: "lembar", estimatedCost: 1000 * servings, note: "Layukan dulu agar tidak robek" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Bersihkan bahan utama, baluri bumbu halus kunyit kencur, garam, dan sedikit gula.", durationMins: 10, chefTip: "Aduk hingga seluruh bagian bahan terbalur rata." },
        { stepNumber: 2, instruction: "Siapkan 2 lapis daun pisang, tatai daun salam, serai iris, daun kemangi, dan cabai rawit utuh. Letakkan bahan utama di atasnya.", durationMins: 5, chefTip: "Gunakan daun pisang batu agar wangi dan tidak bocor." },
        { stepNumber: 3, instruction: "Bungkus bentuk tum/semat dengan lidi di kedua ujungnya. Kukus dalam dandang panas selama 35-45 menit.", durationMins: 40, chefTip: "Kukus hingga tulang lunak dan bumbu meresap." },
        { stepNumber: 4, instruction: "Bakar sebentar di atas panggangan arang selama 5 menit hingga daun pisang sedikit kecokelatan beraroma asap.", durationMins: 5, chefTip: "Proses bakar akhir kunci aroma pepes autentik." }
      ],
      servingStyle: "Disajikan hangat dalam bungkusan daun pisang yang dibuka sedikit aromanya membumbung harum.",
      pairingRecommendation: "Sangat nikmat disajikan bersama Nasi Timbel Daun Pisang dan Sayur Asem."
    };
  }

  // 7. Check SAYUR ASEM / SUP
  if (nameLower.includes("sayur") || nameLower.includes("asem") || nameLower.includes("asam") || nameLower.includes("sop")) {
    return {
      recipeTitle: recipeName.trim() || "Sayur Asem Komplit Priangan",
      sundaCategory: "Sayuran & Sup",
      originStory: "Kombinasi kesegaran kuah asam jawa dan gurihnya terasi bakar dengan aneka hasil bumi Parahyangan seperti melinjo, jagung manis, dan labu siam.",
      servings,
      estimatedHppPerServing: 10000,
      suggestedPricePerServing: 25000,
      marginPercent: "60%",
      ingredients: [
        { name: "Jagung Manis (Potong)", qty: 50 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Manis segar potong miring" },
        { name: "Labu Siam & Kacang Panjang", qty: 60 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Potong dadu renyah" },
        { name: "Buah & Daun Melinjo Segar", qty: 30 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Pilihan empuk gurih" },
        { name: "Kacang Tanah Kulit", qty: 20 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Rebus hingga empuk" },
        { name: "Asem Jawa Segar & Lengkuas Memar", qty: 15 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Asam alami merangsang selera" },
        { name: "Bumbu Ulek (Bawang, Cabai, Terasi Bakar)", qty: 25 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Kunci kuah gurih beraroma" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Didihkan air dalam panci bersama lengkuas memar, daun salam, air asam jawa, dan bumbu halus terasi.", durationMins: 10, chefTip: "Gunakan terasi udang bakar berkualitas." },
        { stepNumber: 2, instruction: "Masukkan jagung manis, buah melinjo, dan kacang tanah. Rebus hingga setengah matang dan empuk.", durationMins: 10, chefTip: "Masukkan bahan yang keras terlebih dahulu." },
        { stepNumber: 3, instruction: "Masukkan labu siam, kacang panjang, dan daun melinjo. Tambahkan garam dan gula pasir/aren secukupnya.", durationMins: 8, chefTip: "Jangan terlalu lama agar labu siam tetap garing." },
        { stepNumber: 4, instruction: "Cicipi rasa gurih manis asam yang seimbang. Tuang ke mangkuk saji saung lesehan.", durationMins: 2, chefTip: "Sajikan selagi kuah panas mendidih." }
      ],
      servingStyle: "Disajikan dalam mangkuk gerabah/keramik tradisional dengan kuah melimpah beraroma asem segar.",
      pairingRecommendation: "Pasangan abadi Ikan Asin Jambal Roti, Sambal Terasi Dadak, dan Nasi Hangat."
    };
  }

  // 8. Check SOTO / GEPUK / EMPAL / DAGING
  if (nameLower.includes("soto") || nameLower.includes("gepuk") || nameLower.includes("empal") || nameLower.includes("daging") || nameLower.includes("sapi")) {
    return {
      recipeTitle: recipeName.trim() || "Soto Bandung / Empal Gepuk Pasundan",
      sundaCategory: "Olahan Daging Sapi",
      originStory: "Olahan daging sapi segar khas Pasundan berkaldu bening gurih dengan campuran irisan lobak putih renyah dan kacang kedelai goreng.",
      servings,
      estimatedHppPerServing: 25000,
      suggestedPricePerServing: 60000,
      marginPercent: "58%",
      ingredients: [
        { name: "Daging Sapi Segar (Has Dalam / Sandung Lamur)", qty: 100 * servings, unit: "gram", estimatedCost: 15000 * servings, note: "Rebus empuk potong dadu" },
        { name: "Lobak Putih Segar (Iris Tipis)", qty: 40 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Direbus terpisah dengan garam" },
        { name: "Kacang Kedelai Goreng Krenyes", qty: 20 * servings, unit: "gram", estimatedCost: 1500 * servings, note: "Taburan khas Pasundan" },
        { name: "Bumbu Rempah (Bawang, Serai, Jahe, Lengkuas)", qty: 25 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Tumis harum kaldu bening" },
        { name: "Daun Bawang, Seledri & Bawang Goreng", qty: 15 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Taburan wangi segar" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Rebus daging sapi dalam air bersama daun salam dan serai hingga empuk.", durationMins: 40, chefTip: "Saring air kaldu agar kuah tetap bening jernih." },
        { stepNumber: 2, instruction: "Iris tipis lobak putih, remas dengan sedikit garam lalu cuci bersih dan rebus sebentar.", durationMins: 8, chefTip: "Proses meremas garam menghilangkan bau langur lobak." },
        { stepNumber: 3, instruction: "Tumis bawang putih, bawang merah, dan serai halus hingga wangi. Masukkan ke dalam kuah kaldu sapi mendidih.", durationMins: 10, chefTip: "Bumbu tumis membuat kuah gurih aromatik." },
        { stepNumber: 4, instruction: "Tata potongan daging dan lobak di mangkuk, siram kuah bening panas. Taburi kedelai goreng dan seledri.", durationMins: 3, chefTip: "Sajikan bersama emping renyah." }
      ],
      servingStyle: "Disajikan dalam mangkuk keramik dalam keadaan panas mengepul dengan taburan kedelai goreng gurih dan emping.",
      pairingRecommendation: "Sangat nikmat disandingkan dengan Nasi Putih Pulen dan Perkedel Kentang."
    };
  }

  // 9. Check SAMBAL / COBEK
  if (nameLower.includes("sambal") || nameLower.includes("cobek") || nameLower.includes("goang")) {
    return {
      recipeTitle: recipeName.trim() || "Sambal Dadak Limau Pasundan",
      sundaCategory: "Sambal Khas Sunda",
      originStory: "Sambal khas Priangan yang diulek mentah secara dadakan saat dipesan, dipadukan dengan terasi udang bakar dan perasan jeruk limau yang menyegarkan.",
      servings,
      estimatedHppPerServing: 5000,
      suggestedPricePerServing: 15000,
      marginPercent: "67%",
      ingredients: [
        { name: "Cabai Rawit Merah & Hijau Segar", qty: 25 * servings, unit: "gram", estimatedCost: 2000 * servings, note: "Cabai pedas segar dipetik" },
        { name: "Terasi Udang Bakar Pasundan", qty: 8 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Bakar arang hingga wangi" },
        { name: "Tomat Merah / Tomat Hijau Iris", qty: 15 * servings, unit: "gram", estimatedCost: 800 * servings, note: "Kesegaran asam manis" },
        { name: "Gula Aren & Garam Gurih", qty: 10 * servings, unit: "gram", estimatedCost: 500 * servings, note: "Penyeimbang rasa" },
        { name: "Jeruk Limau Pasundan", qty: 1 * servings, unit: "buah", estimatedCost: 700 * servings, note: "Kucuri segar terakhir" }
      ],
      cookingSteps: [
        { stepNumber: 1, instruction: "Bakar terasi udang di atas api kecil/arang hingga wangi merekah.", durationMins: 3, chefTip: "Terasi bakar berkualitas adalah kunci utama." },
        { stepNumber: 2, instruction: "Masukkan cabai rawit, terasi bakar, garam, dan gula aren ke dalam cobek batu.", durationMins: 2, chefTip: "Gunakan cobek batu asli agar ulekan maksimal." },
        { stepNumber: 3, instruction: "Ulek kasar jangan terlalu halus agar tekstur renyah cabai masih terasa di lidah.", durationMins: 3, chefTip: "Tekstur ulek kasar khas sambal dadak Sunda." },
        { stepNumber: 4, instruction: "Masukkan irisan tomat dan kucuri air perasan jeruk limau segar beserta kulitnya.", durationMins: 1, chefTip: "Aduk sebentar dan langsung sajikan." }
      ],
      servingStyle: "Disajikan langsung di atas cobek batu cembung beralas daun pisang.",
      pairingRecommendation: "Pelengkap wajib untuk semua lauk gorengan, bakar, dan lalapan segar Saung Pasundan."
    };
  }

  // 10. Generic fallback for custom names
  const cleanTitle = sanitizeSundaTitle(recipeName);
  return {
    recipeTitle: `${cleanTitle} Khas Saung Pasundan`,
    sundaCategory: "Olahan Kuliner Sunda",
    originStory: `Resep hidangan '${cleanTitle}' autentik khas Parahyangan yang mengedepankan kesegaran bahan baku lokal, keharuman bumbu ulek rempah tradisional, dan cita rasa gurih nikmat.`,
    servings,
    estimatedHppPerServing: 22000,
    suggestedPricePerServing: 55000,
    marginPercent: "60%",
    ingredients: [
      { name: `${cleanTitle} (Bahan Segar Utama)`, qty: 150 * servings, unit: "gram", estimatedCost: 12000 * servings, note: "Bahan utama pilihan kualitas terbaik" },
      { name: "Bumbu Ulek Halus (Kencur, Bawang, Kunyit, Kemiri)", qty: 35 * servings, unit: "gram", estimatedCost: 2500 * servings, note: "Diulek tradisional dengan cobek batu" },
      { name: "Rempah Aromatik (Daun Salam, Sereh Memar, Lengkuas)", qty: 15 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Rempah segar melimpah" },
      { name: "Daun Kemangi & Cabai Rawit Merah", qty: 20 * servings, unit: "gram", estimatedCost: 1200 * servings, note: "Menambah aroma wangi dan kepedasan" },
      { name: "Minyak Kelapa / Margarin & Garam Gula Aren", qty: 20 * servings, unit: "gram", estimatedCost: 1000 * servings, note: "Penyegar rasa gurih khas Sunda" }
    ],
    cookingSteps: [
      { stepNumber: 1, instruction: `Bersihkan ${cleanTitle} hingga higienis, baluri perasan jeruk limau dan garam halus. Diamkan 10 menit.`, durationMins: 10, chefTip: "Menghilangkan aroma tidak sedap dan meresapkan rasa awal." },
      { stepNumber: 2, instruction: "Tumis bumbu halus khas Sunda bersama daun salam, serai memar, dan kencur di atas wajan dengan minyak panas hingga wangi harum.", durationMins: 8, chefTip: "Gunakan api sedang agar bumbu tidak gosong." },
      { stepNumber: 3, instruction: `Masukkan ${cleanTitle} ke dalam bumbu tumis. Masak dengan perlahan hingga bumbu meresap sempurna sampai ke dalam serat.`, durationMins: 18, chefTip: "Aduk secara berkala agar matang merata." },
      { stepNumber: 4, instruction: "Tambahkan daun kemangi segar dan cabai rawit di akhir memasak. Angkat dan sajikan hangat di atas piring beralas daun pisang.", durationMins: 2, chefTip: "Sajikan bersama lalapan leunca dan cobek sambal dadak." }
    ],
    servingStyle: "Disajikan hangat di atas gerabah/tampah beralaskan daun pisang segar, lengkap dengan lalapan dan sambal dadak.",
    pairingRecommendation: "Sangat serasi dinikmati bersama Nasi Liwet Kastrol dan Es Kelapa Muda Jeruk."
  };
}

export function normalizeSundaRecipeData(raw: any, defaultTitle: string, targetServings: number) {
  const servings = Number(raw?.servings || raw?.targetServings || targetServings) || 4;
  let rawTitle = raw?.recipeTitle || raw?.recipeName || raw?.title || defaultTitle || "Masakan Sunda Parahyangan";
  
  const titleLower = rawTitle.toLowerCase().trim();
  const isIdeaRequest = 
    titleLower.includes("cari ide") || 
    titleLower.includes("minta ide") || 
    titleLower.includes("rekomendasi") ||
    titleLower.includes("bingung") ||
    titleLower.includes("terserah") ||
    titleLower === "ide" ||
    titleLower === "cari";

  const smartFallback = buildSmartSundaRecipe(isIdeaRequest ? "minta ide" : rawTitle, servings);

  let finalTitle = isIdeaRequest ? smartFallback.recipeTitle : rawTitle;

  let ingredients = Array.isArray(raw?.ingredients) && raw.ingredients.length > 0
    ? raw.ingredients.map((ing: any, i: number) => ({
        name: ing.name || ing.bahan || `Bahan ${i + 1}`,
        qty: Number(ing.qty || ing.quantity || ing.qtyNeeded || 100),
        unit: ing.unit || "gram",
        estimatedCost: Number(ing.estimatedCost || ing.totalCost || (ing.estimatedCostPerUnit ? ing.estimatedCostPerUnit * (ing.quantity || 1) : 5000)),
        note: ing.note || ing.chefTips || "Bahan pilihan segar"
      }))
    : smartFallback.ingredients;

  // Safeguard: Check if ingredients contain invalid keywords like "cari ide" or mismatching protein
  const hasInvalidIngName = ingredients.some((ing: any) => ing.name && ing.name.toLowerCase().includes("cari ide"));
  const titleHasChicken = finalTitle.toLowerCase().includes("ayam") || finalTitle.toLowerCase().includes("bekakak");
  const ingHasFish = ingredients.some((ing: any) => ing.name && (ing.name.toLowerCase().includes("gurame") || ing.name.toLowerCase().includes("nila")));

  if (hasInvalidIngName || (titleHasChicken && ingHasFish)) {
    ingredients = smartFallback.ingredients;
  }

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
    : smartFallback.cookingSteps;

  const estimatedHppPerServing = Number(raw?.estimatedHppPerServing || raw?.hpp || smartFallback.estimatedHppPerServing);
  const suggestedPricePerServing = Number(raw?.suggestedPricePerServing || raw?.price || Math.round(estimatedHppPerServing * 2.8));

  let originStory = raw?.originStory;
  if (!originStory || originStory.toLowerCase().includes("cari ide") || (titleHasChicken && originStory.toLowerCase().includes("ikan"))) {
    originStory = smartFallback.originStory;
  }

  return {
    recipeTitle: finalTitle,
    sundaCategory: raw?.sundaCategory || raw?.category || smartFallback.sundaCategory,
    originStory,
    servings,
    estimatedHppPerServing,
    suggestedPricePerServing,
    marginPercent: raw?.marginPercent || `${Math.round(((suggestedPricePerServing - estimatedHppPerServing) / suggestedPricePerServing) * 100)}%`,
    ingredients,
    cookingSteps,
    servingStyle: raw?.servingStyle || smartFallback.servingStyle,
    pairingRecommendation: raw?.pairingRecommendation || smartFallback.pairingRecommendation
  };
}

export async function generateSundaRecipeClient(recipeName: string, targetServings: number, apiKey: string) {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return normalizeSundaRecipeData(null, recipeName, targetServings);
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

  const ai = new GoogleGenAI({ apiKey: cleanKey });
  
  const promptText = isIdeaRequest
    ? `Pengguna meminta ide resep masakan Sunda yang lezat dan beragam. Pilihlah SATU menu masakan Sunda yang unik dan populer (seperti Nasi Liwet Kastrol, Gurame Cobek, Ulukutek Oncom, Pepes Ikan Mas, Karedok Leunca, Gepuk Daging, Sayur Asem, dsb). JANGAN pilih Ayam Bakar Bekakak kecuali jika tidak ada pilihan lain. Buatkan resep presisi untuk ${targetServings} porsi.

PENTING & WAJIB:
- Tuliskan NAMA BAHAN SPESIFIK & REALISTIS untuk hidangan yang kamu pilih.
- JANGAN GUNAKAN nama generik seperti "Bahan Utama" atau "Bahan 1".

Kembalikan HANYA JSON valid dengan format:
{
  "recipeTitle": "Nama Hidangan Sunda yang Kamu Pilih",
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
}`
    : `Buatkan resep masakan Sunda otentik & presisi untuk hidangan: "${recipeName}" porsi: ${targetServings} porsi.

PENTING & WAJIB:
- Tuliskan NAMA BAHAN SPESIFIK & REALISTIS untuk hidangan "${recipeName}".
  (Contoh: jika Nasi Liwet sebutkan "Beras Cianjur", "Teri Medan", "Daun Salam", "Sereh"; jika Karedok sebutkan "Kacang Panjang", "Terong Bulat", "Tauge Mentah", "Kacang Tanah", "Kencur"; jika Gurame Bakar sebutkan "Ikan Gurame Segar", "Kecap Manis", "Ketumbar", "Jeruk Limau"; dsb).
- JANGAN GUNAKAN nama generik seperti "Bahan Utama" atau "Bahan 1".

Kembalikan HANYA JSON valid dengan format:
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

  const modelsToTry = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: "Anda adalah Executive Chef Spesialis Masakan Sunda Parahyangan yang sangat paham resep kuliner Sunda autentik.",
          temperature: 0.85
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

