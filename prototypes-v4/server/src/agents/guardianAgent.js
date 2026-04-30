/**
 * Primary Agent: Guardian Agent
 * Orchestrates sub-agents based on natural language input and mother's phase.
 * Implements the multi-step workflow from MULTI_AGENT_ARCHITECTURE.md
 *
 * LLM Integration:
 *  - Uses Google Gemini (gemini-1.5-flash) for general Q&A and response enrichment
 *  - Falls back to rule-based composeResponse() when Gemini is unavailable
 *  - All Gemini responses pass through a safety/bias filter before being returned
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const nutritionAgent = require('./nutritionAgent');
const logisticsAgent = require('./logisticsAgent');
const healthAuditAgent = require('./healthAuditAgent');
const appointmentAgent = require('./appointmentAgent');
const reminderAgent = require('./reminderAgent');
const shopAgent = require('./shopAgent');
const tools = require('../tools/mcpTools');
const { askGemini } = require('../services/geminiService');

// ── Intent detection keywords ─────────────────────────────────────────────────
const INTENTS = {
  nutrition:   ['makan', 'makanan', 'nutrisi', 'vitamin', 'pusing', 'lemas', 'anemia', 'kelor', 'singkong', 'ubi', 'ikan'],
  kit:         ['kit', 'paket', 'minta', 'pesan', 'prenatal', 'persalinan', 'bayi', 'nutrisi kit'],
  health:      ['bpjs', 'imunisasi', 'vaksin', 'periksa', 'kunjungan', 'milestone', 'jadwal'],
  audit:       ['audit', 'status', 'laporan', 'risiko', 'cek semua'],
  appointment: ['dokter', 'doctor', 'darurat', 'emergency', 'sakit', 'demam', 'kejang', 'sesak', 'pendarahan', 'tidak sadar', 'bidan', 'periksa dokter', 'reservasi', 'booking', 'janji'],
  reminder:    ['pengingat', 'reminder', 'jadwal vaksin', 'kapan vaksin', 'jadwal imunisasi', 'ingatkan', 'jadwal saya', 'vaksinasi berikutnya'],
  shop:        ['beli', 'pesan susu', 'susu', 'popok', 'diaper', 'biskuit', 'biscuit', 'belanja', 'toko', 'shop', 'order', 'produk', 'vitamin beli', 'pampers', 'merries', 'milna'],
};

function detectIntents(text) {
  const lower = text.toLowerCase();
  const detected = [];
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k))) detected.push(intent);
  }
  return detected.length > 0 ? detected : ['general'];
}

function detectSymptoms(text) {
  const lower = text.toLowerCase();
  const symptoms = [];
  // Critical / emergency
  if (lower.includes('kejang'))           symptoms.push('kejang');
  if (lower.includes('tidak sadar'))      symptoms.push('tidak sadar');
  if (lower.includes('sesak napas'))      symptoms.push('sesak napas');
  if (lower.includes('pendarahan'))       symptoms.push('pendarahan');
  if (lower.includes('demam tinggi'))     symptoms.push('demam tinggi');
  if (lower.includes('tidak mau menyusu')) symptoms.push('tidak mau menyusu');
  if (lower.includes('biru'))             symptoms.push('biru');
  if (lower.includes('lemas sekali'))     symptoms.push('lemas sekali');
  // Urgent
  if (lower.includes('demam'))            symptoms.push('demam');
  if (lower.includes('diare'))            symptoms.push('diare');
  if (lower.includes('muntah'))           symptoms.push('muntah');
  if (lower.includes('nyeri'))            symptoms.push('nyeri');
  if (lower.includes('tekanan darah'))    symptoms.push('tekanan darah tinggi');
  if (lower.includes('bengkak'))          symptoms.push('bengkak');
  // General
  if (lower.includes('pusing'))           symptoms.push('pusing');
  if (lower.includes('lemas'))            symptoms.push('lemas');
  if (lower.includes('mual'))             symptoms.push('mual');
  return symptoms;
}

function detectKitType(text) {
  if (text.includes('prenatal') || text.includes('hamil')) return 'prenatal';
  if (text.includes('persalinan') || text.includes('melahirkan')) return 'delivery';
  if (text.includes('bayi') || text.includes('newborn')) return 'newborn';
  if (text.includes('nutrisi')) return 'nutrition';
  return 'prenatal';
}

// ── In-memory conversation history per session (motherId → turns) ─────────────
// Keeps the last 10 turns so Gemini has conversational context without
// blowing up the token budget.
const conversationHistories = new Map();
const MAX_HISTORY_TURNS = 10;

function getHistory(motherId) {
  return conversationHistories.get(motherId) || [];
}

function appendHistory(motherId, role, text) {
  const history = getHistory(motherId);
  history.push({ role, parts: [{ text }] });
  // Keep only the last MAX_HISTORY_TURNS turns
  if (history.length > MAX_HISTORY_TURNS) history.splice(0, history.length - MAX_HISTORY_TURNS);
  conversationHistories.set(motherId, history);
}

// ── Guardian Agent ────────────────────────────────────────────────────────────
const guardianAgent = {
  name: 'GuardianAgent',

  /**
   * Main entry point: process natural language input and coordinate sub-agents.
   * Returns a structured result including the final response text, agent log,
   * and Gemini metadata.
   */
  process: async (motherId, userInput) => {
    const sessionId = uuidv4();
    const startTime = Date.now();
    const agentLog  = [];
    const results   = {};

    // Log session start
    db.insertAgentTask({
      id: sessionId, session_id: sessionId,
      agent_name: 'GuardianAgent', input: userInput, status: 'running',
    });

    agentLog.push({ agent: 'GuardianAgent', action: 'session_started', sessionId, motherId, input: userInput });

    // ── Step 1: Detect intents ────────────────────────────────────────────────
    const intents  = detectIntents(userInput);
    const symptoms = detectSymptoms(userInput);
    agentLog.push({ agent: 'GuardianAgent', action: 'intents_detected', intents, symptoms });

    // ── Step 2: Load mother context ───────────────────────────────────────────
    const motherData = tools.database.getMother(motherId);
    agentLog.push({ agent: 'GuardianAgent', action: 'context_loaded', tool: 'database', mother: motherData.mother?.name });

    // ── Step 3: Route to sub-agents ───────────────────────────────────────────
    for (const intent of intents) {

      if (intent === 'nutrition') {
        const foodMatch = userInput.match(/makan\s+(\w+(?:\s+\w+)?)/i) ||
                          userInput.match(/(daun kelor|singkong|ubi jalar|ikan teri|kacang hijau|telur)/i);
        const foodInput = foodMatch ? foodMatch[1] : userInput;

        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'NutritionAgent' });
        results.nutrition = await nutritionAgent.analyzeFood(motherId, foodInput, symptoms);
        agentLog.push({ agent: 'NutritionAgent', action: 'completed', riskFlags: results.nutrition.riskFlags });

        if (symptoms.length > 0) {
          agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'HealthAuditAgent', reason: 'symptoms_detected' });
          results.healthAudit = await healthAuditAgent.auditMother(motherId);
        }
      }

      if (intent === 'kit') {
        const kitType = detectKitType(userInput);
        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'LogisticsAgent', kitType });
        results.kit = await logisticsAgent.requestKit(motherId, kitType);
        agentLog.push({ agent: 'LogisticsAgent', action: 'completed', success: results.kit.success });
      }

      if (intent === 'health') {
        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'HealthAuditAgent' });
        results.healthAudit = await healthAuditAgent.auditMother(motherId);
        agentLog.push({ agent: 'HealthAuditAgent', action: 'completed', risks: results.healthAudit.risks });
      }

      if (intent === 'audit') {
        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'HealthAuditAgent', mode: 'scan_all' });
        results.auditAll = await healthAuditAgent.scanAllMothers();
      }

      if (intent === 'appointment') {
        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'AppointmentAgent', symptoms });
        results.appointment = appointmentAgent.bookAppointment(motherId, symptoms, userInput);
        agentLog.push({ agent: 'AppointmentAgent', action: 'completed', urgency: results.appointment.urgency });
      }

      if (intent === 'reminder') {
        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'ReminderAgent' });
        results.reminder = reminderAgent.getReminders(motherId);
        agentLog.push({ agent: 'ReminderAgent', action: 'completed', count: results.reminder.reminders?.length });
      }

      if (intent === 'shop') {
        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'ShopAgent' });
        // Try to place an order if a product ID is mentioned, otherwise browse
        if (/PRD\d{3}/i.test(userInput)) {
          results.shop = shopAgent.placeOrder(motherId, userInput);
        } else {
          results.shop = shopAgent.browseProducts(userInput);
        }
        agentLog.push({ agent: 'ShopAgent', action: 'completed', success: results.shop.success });
      }
    }

    // ── Step 4: Compose response (Gemini-first, rule-based fallback) ──────────
    let response;
    let geminiMeta = { used: false, flagged: false, flags: [] };

    // Always try Gemini — it enriches even structured intents with a natural reply
    agentLog.push({ agent: 'GuardianAgent', action: 'calling_gemini', tool: 'gemini' });

    const history = getHistory(motherId);
    const geminiResult = await askGemini({
      mother:       motherData.mother,
      userMessage:  userInput,
      history,
      agentResults: results,
    });

    if (geminiResult.source === 'gemini' && geminiResult.text) {
      // Gemini answered successfully
      response = buildHybridResponse(results, geminiResult.text);
      geminiMeta = {
        used:    true,
        flagged: geminiResult.flagged,
        flags:   geminiResult.flags,
        model:   'gemini-1.5-flash',
      };

      agentLog.push({
        agent:   'GuardianAgent',
        action:  'gemini_response_received',
        tool:    'gemini',
        flagged: geminiResult.flagged,
        flags:   geminiResult.flags,
      });

      // Persist this turn in conversation history
      appendHistory(motherId, 'user',  userInput);
      appendHistory(motherId, 'model', geminiResult.text);

    } else {
      // Gemini unavailable — fall back to rule-based composer
      response = composeResponse(userInput, intents, results, motherData.mother);
      geminiMeta = { used: false, flagged: false, flags: [], error: geminiResult.error };

      agentLog.push({
        agent:  'GuardianAgent',
        action: 'gemini_fallback',
        reason: geminiResult.error || 'no response',
      });
    }

    // ── Step 5: Finalise ──────────────────────────────────────────────────────
    const duration = Date.now() - startTime;
    db.updateAgentTask(sessionId, JSON.stringify({ response, results }), 'completed');

    return {
      sessionId,
      motherId,
      motherName:      motherData.mother?.name,
      userInput,
      intentsDetected: intents,
      agentLog,
      results,
      response,
      gemini:          geminiMeta,
      durationMs:      duration,
      timestamp:       new Date().toISOString(),
    };
  },
};

// ── Response composers ────────────────────────────────────────────────────────

/**
 * Hybrid response: prepend structured agent results (kit TX, audit summary, etc.)
 * then append Gemini's natural language answer.
 */
function buildHybridResponse(results, geminiText) {
  const parts = [];

  if (results.nutrition) {
    const n = results.nutrition;
    parts.push(`✅ Catatan nutrisi "${n.foodIdentified}" telah disimpan.`);
    if (n.riskFlags?.includes('anemia_risk')) {
      parts.push(`⚠️ Terdeteksi risiko anemia. Bidan telah diberitahu via WhatsApp.`);
    }
  }

  if (results.kit) {
    const k = results.kit;
    if (k.success) {
      parts.push(`📦 Kit ${k.kitType} berhasil diminta! USDC ${k.usdcEscrowed} di-escrow.`);
      parts.push(`🔗 TX Hash: ${k.txHash?.slice(0, 20)}...`);
    } else {
      parts.push(`❌ Permintaan kit gagal: ${k.error}`);
    }
  }

  if (results.healthAudit) {
    const h = results.healthAudit;
    parts.push(`📋 ${h.summary}`);
    if (h.upcomingMilestones?.length > 0) {
      parts.push(`📅 Milestone berikutnya: ${h.upcomingMilestones[0].label} (${h.upcomingMilestones[0].daysUntil} hari lagi)`);
    }
  }

  if (results.auditAll) {
    const a = results.auditAll;
    parts.push(`📊 Audit selesai: ${a.totalMothers} ibu, ${a.highRisk} risiko tinggi, ${a.uncoveredBPJS} tanpa BPJS.`);
  }

  if (results.appointment) {
    parts.push(results.appointment.message || '');
  }

  if (results.reminder) {
    parts.push(results.reminder.summary || '');
  }

  if (results.shop) {
    if (results.shop.message) {
      parts.push(results.shop.message);
    } else if (results.shop.needsSelection && results.shop.products?.length > 0) {
      const list = results.shop.products.slice(0, 4).map(p =>
        `  ${p.image_emoji} [${p.id}] ${p.name} — Rp${p.price_idr.toLocaleString('id-ID')} / ${p.price_usdc} USDC`
      ).join('\n');
      parts.push(`🛍️ Produk tersedia:\n${list}\n\nKetik ID produk + jumlah untuk memesan (contoh: "pesan PRD001 2 buah")`);
    }
  }

  // Append Gemini's enriched natural language answer
  if (parts.length > 0) {
    parts.push(''); // blank line separator
  }
  parts.push(geminiText);

  return parts.join('\n');
}

/**
 * Rule-based fallback response (used when Gemini is unavailable).
 */
function composeResponse(input, intents, results, mother) {
  const parts = [];
  const name  = mother?.name || 'Ibu';

  if (results.nutrition) {
    const n = results.nutrition;
    parts.push(`✅ Catatan nutrisi "${n.foodIdentified}" telah disimpan.`);
    if (n.riskFlags.includes('anemia_risk')) {
      parts.push(`⚠️ Terdeteksi risiko anemia. Bidan telah diberitahu via WhatsApp.`);
    }
    parts.push(`💡 ${n.recommendation}`);
  }

  if (results.kit) {
    const k = results.kit;
    if (k.success) {
      parts.push(`📦 Kit ${k.kitType} berhasil diminta! USDC ${k.usdcEscrowed} di-escrow.`);
      parts.push(`🔗 TX Hash: ${k.txHash?.slice(0, 20)}...`);
    } else {
      parts.push(`❌ Permintaan kit gagal: ${k.error}`);
    }
  }

  if (results.healthAudit) {
    const h = results.healthAudit;
    parts.push(`📋 ${h.summary}`);
    if (h.upcomingMilestones?.length > 0) {
      parts.push(`📅 Milestone berikutnya: ${h.upcomingMilestones[0].label} (${h.upcomingMilestones[0].daysUntil} hari lagi)`);
    }
  }

  if (results.auditAll) {
    const a = results.auditAll;
    parts.push(`📊 Audit selesai: ${a.totalMothers} ibu, ${a.highRisk} risiko tinggi, ${a.uncoveredBPJS} tanpa BPJS.`);
  }

  if (results.appointment) {
    parts.push(results.appointment.message || '');
  }

  if (results.reminder) {
    parts.push(results.reminder.summary || '');
  }

  if (results.shop) {
    if (results.shop.message) {
      parts.push(results.shop.message);
    } else if (results.shop.needsSelection && results.shop.products?.length > 0) {
      const list = results.shop.products.slice(0, 4).map(p =>
        `  ${p.image_emoji} [${p.id}] ${p.name} — Rp${p.price_idr.toLocaleString('id-ID')} / ${p.price_usdc} USDC`
      ).join('\n');
      parts.push(`🛍️ Produk tersedia:\n${list}\n\nKetik ID produk + jumlah untuk memesan (contoh: "pesan PRD001 2 buah")`);
    }
  }

  if (parts.length === 0) {
    parts.push(`Halo ${name}! Saya Guardian Agent NutriSakti. Saya bisa membantu dengan nutrisi, permintaan kit, pemeriksaan kesehatan, reservasi dokter, pengingat vaksinasi, atau belanja produk ibu & bayi.`);
  }

  return parts.join('\n');
}

module.exports = guardianAgent;
