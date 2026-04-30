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

// ── Intent detection ─────────────────────────────────────────────────────────
//
// IMPORTANT DESIGN RULE:
//   Intents only trigger sub-agents that perform ACTIONS (log food, book doctor,
//   request kit, etc.). General knowledge questions ("cara mengatasi mual",
//   "apa itu MPASI", "tips kehamilan") always fall through to 'general' so
//   Gemini answers them directly without polluting results with sub-agent noise.

const INTENTS = {
  // Only when user is LOGGING food they actually ate
  nutrition:   ['saya makan', 'tadi makan', 'sudah makan', 'habis makan', 'makan daun', 'makan ikan',
                'makan singkong', 'makan ubi', 'makan kelor', 'makan telur', 'makan kacang',
                'i ate', 'i had', 'just ate', 'ate moringa'],
  // Kit request actions
  kit:         ['minta kit', 'pesan kit', 'request kit', 'butuh kit', 'kirim kit',
                'minta paket', 'pesan paket', 'prenatal kit', 'delivery kit', 'newborn kit'],
  // Health record / BPJS / vaccination schedule lookup
  health:      ['cek bpjs', 'status bpjs', 'imunisasi saya', 'vaksin saya', 'jadwal imunisasi',
                'jadwal vaksin', 'milestone saya', 'kunjungan saya', 'check bpjs'],
  // Full audit
  audit:       ['audit semua', 'cek semua ibu', 'laporan risiko', 'scan semua', 'audit all'],
  // Doctor / emergency booking
  appointment: ['pesan dokter', 'booking dokter', 'reservasi dokter', 'janji dokter',
                'book doctor', 'book appointment', 'need doctor', 'butuh dokter',
                'darurat', 'emergency', 'kejang', 'tidak sadar', 'sesak napas',
                'pendarahan', 'demam tinggi', 'tidak mau menyusu'],
  // Vaccination reminder lookup
  reminder:    ['pengingat vaksin', 'reminder vaksin', 'jadwal vaksinasi saya',
                'kapan vaksin berikutnya', 'ingatkan vaksin', 'show my vaccination',
                'tampilkan jadwal vaksinasi'],
  // Shop / purchase
  shop:        ['beli ', 'order ', 'pesan susu', 'pesan popok', 'pesan biskuit',
                'beli susu', 'beli popok', 'beli diaper', 'beli biskuit',
                'buy milk', 'buy diaper', 'buy biscuit', 'PRD0'],
};

function detectIntents(text) {
  const lower = text.toLowerCase();
  const detected = [];
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k))) detected.push(intent);
  }
  // Everything else → general (answered by Gemini directly)
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
        // Only log food if the user mentions a specific food they ate
        const foodMatch = userInput.match(/(?:saya makan|tadi makan|sudah makan|habis makan|i ate|i had|just ate)\s+(.+?)(?:\s+tapi|\s+dan|\s+but|$)/i) ||
                          userInput.match(/(daun kelor|singkong|ubi jalar|ikan teri|kacang hijau|telur|moringa)/i);
        if (foodMatch) {
          const foodInput = foodMatch[1] || foodMatch[0];
          agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'NutritionAgent' });
          results.nutrition = await nutritionAgent.analyzeFood(motherId, foodInput.trim(), symptoms);
          agentLog.push({ agent: 'NutritionAgent', action: 'completed', riskFlags: results.nutrition.riskFlags });

          if (symptoms.length > 0) {
            agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'HealthAuditAgent', reason: 'symptoms_detected' });
            results.healthAudit = await healthAuditAgent.auditMother(motherId);
          }
        }
        // If no specific food found, let Gemini answer the nutrition question
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
    let followUpQuestions = [];
    let geminiMeta = { used: false, flagged: false, flags: [] };

    agentLog.push({ agent: 'GuardianAgent', action: 'calling_gemini', tool: 'gemini' });

    const history = getHistory(motherId);
    const geminiResult = await askGemini({
      mother:       motherData.mother,
      userMessage:  userInput,
      history,
      agentResults: results,
    });

    if (geminiResult.source === 'gemini' && geminiResult.text) {
      response          = geminiResult.text;
      followUpQuestions = geminiResult.followUpQuestions || [];
      geminiMeta = { used: true, flagged: geminiResult.flagged, flags: geminiResult.flags, model: geminiResult.model || 'gemini-2.5-flash' };
      agentLog.push({ agent: 'GuardianAgent', action: 'gemini_response_received', tool: 'gemini', flagged: geminiResult.flagged });
      appendHistory(motherId, 'user',  userInput);
      appendHistory(motherId, 'model', geminiResult.text);
    } else {
      response = buildFallbackText(intents, results, motherData.mother);
      followUpQuestions = buildFallbackFollowUps(intents, motherData.mother);
      geminiMeta = { used: false, flagged: false, flags: [], error: geminiResult.error };
      agentLog.push({ agent: 'GuardianAgent', action: 'gemini_fallback', reason: geminiResult.error || 'no response' });
      // Log the actual error for debugging
      if (geminiResult.error) console.error('[GuardianAgent] Gemini error:', geminiResult.error);
    }

    // ── Step 5: Build rich interactive cards ─────────────────────────────────
    const cards = buildCards(intents, results, motherData.mother);

    // ── Step 6: Finalise ──────────────────────────────────────────────────────
    const duration = Date.now() - startTime;
    db.updateAgentTask(sessionId, JSON.stringify({ response, results }), 'completed');

    return {
      sessionId,
      motherId,
      motherName:       motherData.mother?.name,
      userInput,
      intentsDetected:  intents,
      agentLog,
      results,
      response,
      cards,
      followUpQuestions,
      gemini:           geminiMeta,
      durationMs:       duration,
      timestamp:        new Date().toISOString(),
    };
  },
};

// ── Rich card builder ─────────────────────────────────────────────────────────
/**
 * Builds an array of typed interactive cards from agent results.
 * Each card has: { type, ...data }
 * Types: 'appointment', 'calendar', 'tracking', 'products', 'order_confirm',
 *        'qris', 'reminders', 'nutrition', 'audit', 'hospital_map'
 */
function buildCards(intents, results, mother) {
  const cards = [];

  // ── Appointment card ──────────────────────────────────────────────────────
  if (results.appointment?.success) {
    const a = results.appointment;
    const puskesmasCoords = {
      PKM001: { lat: -10.1772, lng: 123.6070, address: 'Jl. Timor Raya No.1, Kupang, NTT' },
      PKM002: { lat: -8.8432,  lng: 121.6629, address: 'Jl. Pahlawan No.5, Ende, NTT' },
      PKM003: { lat: -2.5916,  lng: 140.6690, address: 'Jl. Raya Sentani No.10, Jayapura, Papua' },
      PKM004: { lat: -3.6954,  lng: 128.1814, address: 'Jl. Dr. Kayadoe No.3, Ambon, Maluku' },
      PKM005: { lat: -8.5833,  lng: 116.1167, address: 'Jl. Pejanggik No.8, Mataram, NTB' },
    };
    const coords = puskesmasCoords[a.appointment?.puskesmas_id] || puskesmasCoords['PKM001'];
    cards.push({
      type:        'appointment',
      urgency:     a.urgency,
      doctor:      a.doctor,
      specialty:   a.specialty,
      scheduledAt: a.scheduledAt,
      reason:      a.appointment?.reason,
      status:      a.appointment?.status,
      puskesmas:   mother?.puskesmas_id,
      address:     coords.address,
      lat:         coords.lat,
      lng:         coords.lng,
      mapsUrl:     `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`,
    });
  }

  // ── Vaccination calendar card ─────────────────────────────────────────────
  if (results.reminder?.success) {
    const upcoming = (results.reminder.reminders || [])
      .filter(r => Math.ceil((new Date(r.due_date) - Date.now()) / 86400000) >= 0)
      .slice(0, 6);
    if (upcoming.length > 0) {
      cards.push({ type: 'calendar', reminders: upcoming });
    }
  }

  // ── Health milestone calendar ─────────────────────────────────────────────
  if (results.healthAudit?.upcomingMilestones?.length > 0) {
    cards.push({
      type:       'milestones',
      milestones: results.healthAudit.upcomingMilestones,
      summary:    results.healthAudit.summary,
      risks:      results.healthAudit.risks || [],
    });
  }

  // ── Product grid card ─────────────────────────────────────────────────────
  if (results.shop?.products?.length > 0 && !results.shop?.order) {
    cards.push({
      type:     'products',
      products: results.shop.products.slice(0, 6),
      category: results.shop.category,
    });
  }

  // ── Order confirmation + QRIS ─────────────────────────────────────────────
  if (results.shop?.success && results.shop?.order) {
    cards.push({
      type:    'order_confirm',
      order:   results.shop.order,
      product: results.shop.product,
      qty:     results.shop.qty,
      total:   results.shop.total,
    });
    // Show QRIS for payment
    cards.push({
      type:      'qris',
      amount:    results.shop.total,
      orderId:   results.shop.order?.id,
      merchant:  'NutriSakti Shop',
      // Dummy QRIS data — in production this would be a real QR payload
      qrData:    `NUTRISAKTI-${results.shop.order?.id}-${results.shop.total}USDC`,
    });
  }

  // ── Kit delivery tracking card ────────────────────────────────────────────
  if (results.kit?.success) {
    cards.push({
      type:     'tracking',
      kitType:  results.kit.kitType,
      txHash:   results.kit.txHash,
      status:   'ordered',
      steps: [
        { label: 'Order Placed',   done: true,  time: new Date().toISOString() },
        { label: 'DID Verified',   done: true,  time: new Date().toISOString() },
        { label: 'USDC Escrowed',  done: true,  time: new Date().toISOString() },
        { label: 'Dispatched',     done: false, time: null },
        { label: 'Out for Delivery', done: false, time: null },
        { label: 'Delivered',      done: false, time: null },
      ],
      usdcEscrowed: results.kit.usdcEscrowed,
    });
  }

  // ── Nutrition card ────────────────────────────────────────────────────────
  if (results.nutrition) {
    const n = results.nutrition;
    cards.push({
      type:        'nutrition',
      food:        n.foodIdentified,
      nutrients:   n.nutrients || {},
      riskFlags:   n.riskFlags || [],
      recommendation: n.recommendation,
    });
  }

  // ── Audit summary card ────────────────────────────────────────────────────
  if (results.auditAll) {
    cards.push({
      type:          'audit',
      totalMothers:  results.auditAll.totalMothers,
      highRisk:      results.auditAll.highRisk,
      uncoveredBPJS: results.auditAll.uncoveredBPJS,
      mothers:       (results.auditAll.mothers || []).slice(0, 5),
    });
  }

  return cards;
}

// ── Fallback text (no Gemini) ─────────────────────────────────────────────────
function buildFallbackText(intents, results, mother) {
  const name = mother?.name || 'Ibu';
  const parts = [];

  if (results.nutrition) {
    const n = results.nutrition;
    parts.push(`✅ Catatan nutrisi "${n.foodIdentified}" telah disimpan.`);
    if (n.riskFlags?.includes('anemia_risk')) parts.push(`⚠️ Terdeteksi risiko anemia. Bidan telah diberitahu.`);
    parts.push(`💡 ${n.recommendation}`);
  }
  if (results.appointment?.success) parts.push(results.appointment.message);
  if (results.reminder?.success) parts.push(results.reminder.summary);
  if (results.kit?.success) parts.push(`📦 Kit ${results.kit.kitType} berhasil dipesan.`);
  if (results.shop?.message) parts.push(results.shop.message);
  if (results.healthAudit) parts.push(`📋 ${results.healthAudit.summary}`);
  if (results.auditAll) parts.push(`📊 Audit: ${results.auditAll.totalMothers} ibu, ${results.auditAll.highRisk} risiko tinggi.`);

  if (parts.length === 0) {
    parts.push(`Halo ${name}! Saya Guardian Agent NutriSakti. Saya siap membantu Anda dengan informasi kesehatan ibu dan bayi, jadwal vaksinasi, reservasi dokter, atau belanja produk kebutuhan ibu dan bayi.`);
  }
  return parts.join('\n');
}

function buildFallbackFollowUps(intents, mother) {
  const phase = mother?.phase || 'pregnancy';
  const base = {
    pregnancy: ['Makanan baik untuk ibu hamil?', 'Kapan jadwal kontrol berikutnya?', 'Cara mengatasi mual pagi?'],
    infant:    ['Jadwal imunisasi bayi saya?', 'Kapan mulai MPASI?', 'Cara meningkatkan ASI?'],
    toddler:   ['Menu MPASI untuk balita?', 'Jadwal vaksin booster?', 'Cara stimulasi tumbuh kembang?'],
  };
  return base[phase] || base['pregnancy'];
}

module.exports = guardianAgent;
