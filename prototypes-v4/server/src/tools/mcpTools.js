/**
 * MCP Tool Definitions
 * Simulates MCP (Model Context Protocol) integrations:
 * - calendar: Timeline milestone scheduling
 * - database: Structured health data queries
 * - blockchain: Polygon on-chain verification
 * - whatsapp: Tele-consultation alerts
 */

const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const mcpTools = {

  // ── Tool 1: Calendar ─────────────────────────────────────────────────────
  calendar: {
    name: 'calendar',
    getUpcomingMilestones: (motherId) => {
      const mother = db.getMother(motherId);
      if (!mother) return { error: 'Mother not found' };
      const day = mother.days_in_journey;
      const all = [
        { day: 90,   label: 'Akhir Trimester 1',       type: 'checkup' },
        { day: 180,  label: 'Akhir Trimester 2',       type: 'checkup' },
        { day: 280,  label: 'Perkiraan Kelahiran',      type: 'birth' },
        { day: 300,  label: 'Imunisasi Hepatitis B',    type: 'vaccine' },
        { day: 330,  label: 'Imunisasi BCG & Polio 1', type: 'vaccine' },
        { day: 390,  label: 'Imunisasi DPT-HB-Hib 1', type: 'vaccine' },
        { day: 460,  label: 'Mulai MPASI',             type: 'nutrition' },
        { day: 640,  label: 'Imunisasi Campak/MR',     type: 'vaccine' },
        { day: 1000, label: '1000 Hari Selesai',       type: 'milestone' },
      ];
      const upcoming = all.filter(m => m.day > day).slice(0, 3).map(m => ({ ...m, daysUntil: m.day - day }));
      return { motherId, currentDay: day, upcoming, tool: 'calendar' };
    },
    logMilestone: (motherId, title, description) => {
      const id = uuidv4();
      db.insertHealthLog({ id, mother_id: motherId, type: 'milestone', description: `${title}: ${description}`, logged_by: 'calendar_tool' });
      return { success: true, logId: id, tool: 'calendar' };
    }
  },

  // ── Tool 2: Database ─────────────────────────────────────────────────────
  database: {
    name: 'database',
    getMother: (motherId) => {
      const mother = db.getMother(motherId);
      const logs = db.getHealthLogs(motherId);
      const nutrition = db.getNutritionLogs(motherId);
      return { mother, logs, nutrition, tool: 'database' };
    },
    getAllMothers: () => db.getAllMothers(),
    saveHealthLog: (motherId, type, description, data = {}) => {
      const id = uuidv4();
      db.insertHealthLog({ id, mother_id: motherId, type, description, data: JSON.stringify(data), logged_by: 'system' });
      return { success: true, logId: id, tool: 'database' };
    },
    saveNutritionLog: (motherId, foodName, nutrients, riskFlags, aiAnalysis) => {
      const id = uuidv4();
      db.insertNutritionLog({ id, mother_id: motherId, food_name: foodName, nutrients: JSON.stringify(nutrients), risk_flags: JSON.stringify(riskFlags), ai_analysis: aiAnalysis });
      return { success: true, logId: id, tool: 'database' };
    },
    getAlerts: () => db.getAlerts(),
  },

  // ── Tool 3: Blockchain ───────────────────────────────────────────────────
  blockchain: {
    name: 'blockchain',
    verifyDID: (motherId) => {
      const mother = db.getMother(motherId);
      if (!mother) return { verified: false, error: 'Not found' };
      return { verified: true, did: `did:polygon:nutrisakti:${motherId}`, bpjsOnChain: mother.bpjs_status === 1, eligibleForKit: true, tool: 'blockchain' };
    },
    checkBPJS: (motherId) => {
      const mother = db.getMother(motherId);
      if (!mother) return { covered: false };
      return { covered: mother.bpjs_status === 1, motherId, status: mother.bpjs_status === 1 ? 'Aktif' : 'Tidak Terdaftar', tool: 'blockchain' };
    },
    escrowUSDC: (motherId, kitType, amount) => {
      const requestId = uuidv4();
      db.insertKitRequest({ id: requestId, mother_id: motherId, kit_type: kitType, status: 'escrowed', did_verified: 1, usdc_escrowed: amount });
      return { success: true, requestId, txHash: `0x${Math.random().toString(16).slice(2, 42)}`, amount, tool: 'blockchain' };
    },
    getKitRequests: () => db.getKitRequests(),
  },

  // ── Tool 4: WhatsApp ─────────────────────────────────────────────────────
  whatsapp: {
    name: 'whatsapp',
    sendAlert: (recipientType, message, severity = 'info') => {
      const alertId = uuidv4();
      db.insertAlert({ id: alertId, type: recipientType, message, severity });
      console.log(`[WhatsApp] ${severity.toUpperCase()} → ${recipientType}: ${message}`);
      return { success: true, alertId, recipient: recipientType, message, tool: 'whatsapp' };
    },
    sendMotherAlert: (motherId, message) => {
      const mother = db.getMother(motherId);
      const alertId = uuidv4();
      db.insertAlert({ id: alertId, mother_id: motherId, type: 'mother_alert', message, severity: 'warning' });
      return { success: true, alertId, motherName: mother?.name, tool: 'whatsapp' };
    }
  }
};

module.exports = mcpTools;
