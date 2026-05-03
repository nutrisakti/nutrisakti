/**
 * Gemini Service — Google Gemini API integration for Guardian Agent
 *
 * Responsibilities:
 *  1. Send contextual prompts to Gemini (gemini-1.5-flash)
 *  2. Apply a safety/bias filter to every response before returning it
 *  3. Generate follow-up question suggestions
 *  4. Provide a graceful fallback when the API key is absent or the call fails
 */

const https = require('https');

const GEMINI_API_KEY  = process.env.GEMINI_API_KEY || '';
const GEMINI_MODELS = [
  'gemini-2.5-flash',       // preferred — most capable
  'gemini-2.5-flash-lite',  // fallback — lighter, higher quota
  'gemini-flash-lite-latest', // last resort
];
const GEMINI_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
const REQUEST_TIMEOUT = 20000;

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Guardian Agent for NutriSakti, an Indonesian maternal and child health platform serving mothers in Eastern Indonesia (NTT, Papua, Maluku, NTB).

Your role:
- Answer questions about pregnancy, infant care, child nutrition, vaccinations, breastfeeding, MPASI, growth milestones, and the 1000 First Days programme
- Provide evidence-based, culturally sensitive guidance in the same language the user writes in (Indonesian or English)
- Be warm, supportive, conversational, and non-judgmental
- Give detailed, helpful answers — not just one-liners

Strict rules:
1. NEVER use stigmatising, shaming, or blaming language
2. NEVER give a diagnosis — always recommend consulting a midwife (bidan) or doctor for medical concerns
3. NEVER express pessimism about outcomes; frame everything constructively
4. Keep responses focused and actionable (aim for 3-5 sentences or bullet points)
5. Always end your response with a JSON block of follow-up questions

IMPORTANT — Response format:
Always end your response with this exact JSON block (no markdown fences):
FOLLOWUP_JSON:{"questions":["question 1","question 2","question 3"]}

The follow-up questions should be:
- Relevant to what was just discussed
- Short (max 8 words each)
- In the same language as the conversation
- Actionable things the mother might want to know next

Example:
"Daun kelor sangat baik untuk ibu hamil karena kaya zat besi dan kalsium. Konsumsi 1-2 porsi per hari sudah cukup. Pastikan dicuci bersih sebelum dimasak.
FOLLOWUP_JSON:{"questions":["Berapa porsi daun kelor per hari?","Makanan lain untuk cegah anemia?","Kapan jadwal kontrol kehamilan saya?"]}"`;

// ── Safety filters ────────────────────────────────────────────────────────────
const SAFETY_FILTERS = [
  { pattern: /\b(salah|bersalah|lalai|ceroboh|tidak peduli|tidak bertanggung jawab)\b/gi, replacement: 'perlu perhatian lebih' },
  { pattern: /\b(tidak ada harapan|mustahil|tidak bisa sembuh|sudah terlambat)\b/gi, replacement: 'masih bisa diperbaiki dengan bantuan yang tepat' },
  { pattern: /\b(miskin|tidak mampu|orang susah)\b/gi, replacement: 'keluarga yang membutuhkan dukungan' },
  { pattern: /\b(orang pedalaman|primitif|terbelakang|terpencil yang tidak tahu)\b/gi, replacement: 'komunitas yang membutuhkan akses layanan kesehatan' },
  { pattern: /\b(hopeless|impossible|too late|negligent|irresponsible|careless|poor people|primitive|backward)\b/gi, replacement: 'needing additional support' },
  { pattern: /\b(pasti mati|akan meninggal|fatal)\b/gi, replacement: 'memerlukan penanganan medis segera' },
];

function applySafetyFilter(text) {
  let filtered = text;
  const flags = [];
  for (const { pattern, replacement } of SAFETY_FILTERS) {
    const matches = filtered.match(pattern);
    if (matches) { flags.push(...matches.map(m => m.toLowerCase())); filtered = filtered.replace(pattern, replacement); }
  }
  return { text: filtered, flagged: flags.length > 0, flags };
}

/**
 * Parse the FOLLOWUP_JSON block out of Gemini's response.
 * Handles truncated JSON gracefully by extracting whatever questions are complete.
 * Returns { cleanText, followUpQuestions }
 */
function parseFollowUp(rawText) {
  const marker = 'FOLLOWUP_JSON:';
  const idx = rawText.lastIndexOf(marker);
  if (idx === -1) return { cleanText: rawText.trim(), followUpQuestions: [] };

  const cleanText = rawText.slice(0, idx).trim();
  const jsonStr   = rawText.slice(idx + marker.length).trim();

  // Try full parse first
  try {
    const parsed = JSON.parse(jsonStr);
    return { cleanText, followUpQuestions: parsed.questions || [] };
  } catch {
    // JSON was truncated — extract complete quoted strings manually
    const questions = [];
    const re = /"([^"]{3,80})"/g;
    let m;
    while ((m = re.exec(jsonStr)) !== null) {
      const q = m[1].trim();
      // Skip the key name "questions"
      if (q !== 'questions' && q.length >= 5) questions.push(q);
    }
    return { cleanText, followUpQuestions: questions.slice(0, 4) };
  }
}

function httpsPost(url, payload) {
  return new Promise((resolve, reject) => {
    const body   = JSON.stringify(payload);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT, () => { req.destroy(new Error('Gemini request timed out')); });
    req.write(body);
    req.end();
  });
}

function buildPayload(systemPrompt, conversationHistory, userMessage) {
  return {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [...conversationHistory, { role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature: 0.5, topP: 0.9, maxOutputTokens: 1200 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE'    },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };
}

/**
 * Main export: ask Gemini a question with mother context.
 * Returns { text, followUpQuestions, flagged, flags, source }
 */
async function askGemini({ mother, userMessage, history = [], agentResults = {} }) {
  if (!GEMINI_API_KEY) {
    return { text: null, followUpQuestions: [], flagged: false, flags: [], source: 'fallback', error: 'GEMINI_API_KEY not configured' };
  }

  const contextBlock    = buildContextBlock(mother, agentResults);
  const enrichedMessage = contextBlock
    ? `[Konteks Pasien]\n${contextBlock}\n\n[Pertanyaan]\n${userMessage}`
    : userMessage;

  const payload = buildPayload(SYSTEM_PROMPT, history, enrichedMessage);

  // Try each model in order until one succeeds
  for (const model of GEMINI_MODELS) {
    const apiUrl = `${GEMINI_ENDPOINT_BASE}${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const { status, body } = await httpsPost(apiUrl, payload);

      // Retry-able errors — try next model
      if (status === 503 || status === 429 || status === 404) {
        console.warn(`[GeminiService] ${model} returned ${status}, trying next model...`);
        continue;
      }

      if (body.promptFeedback?.blockReason) {
        return {
          text: 'Maaf, saya tidak dapat memproses pertanyaan tersebut. Silakan hubungi bidan atau tenaga kesehatan terdekat.',
          followUpQuestions: ['Hubungi bidan terdekat?', 'Cek jadwal vaksinasi?'],
          flagged: true, flags: [`blocked:${body.promptFeedback.blockReason}`], source: 'gemini',
        };
      }

      if (status !== 200 || !body.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.warn(`[GeminiService] ${model} unexpected response ${status}:`, JSON.stringify(body.error || body).slice(0, 120));
        continue;
      }

      const rawText = body.candidates[0].content.parts[0].text.trim();
      const { cleanText, followUpQuestions } = parseFollowUp(rawText);
      const { text, flagged, flags } = applySafetyFilter(cleanText);

      return { text, followUpQuestions, flagged, flags, source: 'gemini', model, rawResponse: body };

    } catch (err) {
      console.warn(`[GeminiService] ${model} threw: ${err.message}`);
      continue;
    }
  }

  // All models failed
  console.error('[GeminiService] All models failed');
  return { text: null, followUpQuestions: [], flagged: false, flags: [], source: 'fallback', error: 'All Gemini models unavailable' };
}

function buildContextBlock(mother, agentResults) {
  if (!mother) return '';
  const lines = [
    `Nama: ${mother.name}`,
    `Usia: ${mother.age} tahun`,
    `Fase: ${mother.phase} (hari ke-${mother.days_in_journey} dari 1000 hari)`,
    `Wilayah: ${mother.village}, ${mother.region}`,
    `BPJS: ${mother.bpjs_status ? 'Aktif' : 'Tidak aktif'}`,
    `Risiko: ${mother.risk_level}`,
  ];
  if (agentResults.nutrition) {
    lines.push(`Nutrisi terakhir: ${agentResults.nutrition.foodIdentified}`);
    if (agentResults.nutrition.riskFlags?.length) lines.push(`Risiko nutrisi: ${agentResults.nutrition.riskFlags.join(', ')}`);
  }
  if (agentResults.healthAudit?.risks?.length) lines.push(`Risiko kesehatan: ${agentResults.healthAudit.risks.join(', ')}`);
  return lines.join('\n');
}

module.exports = { askGemini, applySafetyFilter, SYSTEM_PROMPT, httpsPost, GEMINI_ENDPOINT_BASE, GEMINI_MODELS };
