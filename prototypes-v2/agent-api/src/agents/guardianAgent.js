/**
 * Primary Agent: Guardian Agent
 * Orchestrates sub-agents based on natural language input and mother's phase.
 * Implements the multi-step workflow from MULTI_AGENT_ARCHITECTURE.md
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const nutritionAgent = require('./nutritionAgent');
const logisticsAgent = require('./logisticsAgent');
const healthAuditAgent = require('./healthAuditAgent');
const tools = require('../tools/mcpTools');

// Intent detection keywords
const INTENTS = {
  nutrition:  ['makan', 'makanan', 'nutrisi', 'vitamin', 'pusing', 'lemas', 'anemia', 'kelor', 'singkong', 'ubi', 'ikan'],
  kit:        ['kit', 'paket', 'minta', 'pesan', 'prenatal', 'persalinan', 'bayi', 'nutrisi kit'],
  health:     ['bpjs', 'imunisasi', 'vaksin', 'periksa', 'kunjungan', 'milestone', 'jadwal'],
  audit:      ['audit', 'status', 'laporan', 'risiko', 'cek semua'],
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
  const symptoms = [];
  if (text.includes('pusing')) symptoms.push('pusing');
  if (text.includes('lemas')) symptoms.push('lemas');
  if (text.includes('mual')) symptoms.push('mual');
  if (text.includes('nyeri')) symptoms.push('nyeri');
  return symptoms;
}

function detectKitType(text) {
  if (text.includes('prenatal') || text.includes('hamil')) return 'prenatal';
  if (text.includes('persalinan') || text.includes('melahirkan')) return 'delivery';
  if (text.includes('bayi') || text.includes('newborn')) return 'newborn';
  if (text.includes('nutrisi')) return 'nutrition';
  return 'prenatal'; // default
}

const guardianAgent = {
  name: 'GuardianAgent',

  /**
   * Main entry point: process natural language input and coordinate sub-agents
   * This is the multi-step workflow from the architecture doc
   */
  process: async (motherId, userInput) => {
    const sessionId = uuidv4();
    const startTime = Date.now();
    const agentLog = [];
    const results = {};

    // Log session start
    db.insertAgentTask({ id: sessionId, session_id: sessionId, agent_name: 'GuardianAgent', input: userInput, status: 'running' });

    agentLog.push({
      agent: 'GuardianAgent',
      action: 'session_started',
      sessionId,
      motherId,
      input: userInput
    });

    // Step 1: Detect intents from user input
    const intents = detectIntents(userInput);
    const symptoms = detectSymptoms(userInput);
    agentLog.push({ agent: 'GuardianAgent', action: 'intents_detected', intents, symptoms });

    // Step 2: Get mother context from database (MCP Tool: database)
    const motherData = tools.database.getMother(motherId);
    agentLog.push({ agent: 'GuardianAgent', action: 'context_loaded', tool: 'database', mother: motherData.mother?.name });

    // Step 3: Route to sub-agents based on intents (multi-step workflow)
    for (const intent of intents) {

      if (intent === 'nutrition') {
        // Extract food name from input
        const foodMatch = userInput.match(/makan\s+(\w+(?:\s+\w+)?)/i) ||
                          userInput.match(/(daun kelor|singkong|ubi jalar|ikan teri|kacang hijau|telur)/i);
        const foodInput = foodMatch ? foodMatch[1] : userInput;

        agentLog.push({ agent: 'GuardianAgent', action: 'routing_to', subAgent: 'NutritionAgent' });
        results.nutrition = await nutritionAgent.analyzeFood(motherId, foodInput, symptoms);
        agentLog.push({ agent: 'NutritionAgent', action: 'completed', riskFlags: results.nutrition.riskFlags });

        // If vitamin intake logged + symptoms → also trigger health audit
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
    }

    // Step 4: Compose final response
    const response = composeResponse(userInput, intents, results, motherData.mother);
    const duration = Date.now() - startTime;

    // Update session log
    db.updateAgentTask(sessionId, JSON.stringify({ response, results }), 'completed');

    return {
      sessionId,
      motherId,
      motherName: motherData.mother?.name,
      userInput,
      intentsDetected: intents,
      agentLog,
      results,
      response,
      durationMs: duration,
      timestamp: new Date().toISOString()
    };
  }
};

function composeResponse(input, intents, results, mother) {
  const parts = [];
  const name = mother?.name || 'Ibu';

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

  if (parts.length === 0) {
    parts.push(`Halo ${name}! Saya Guardian Agent NutriSakti. Saya bisa membantu dengan nutrisi, permintaan kit, atau pemeriksaan kesehatan.`);
  }

  return parts.join('\n');
}

module.exports = guardianAgent;
