const express = require('express');
const router = express.Router();
const guardianAgent = require('../agents/guardianAgent');
const logisticsAgent = require('../agents/logisticsAgent');
const healthAuditAgent = require('../agents/healthAuditAgent');
const tools = require('../tools/mcpTools');
const db = require('../db/database');

// ── Primary Agent: Guardian ──────────────────────────────────────────────────
// POST /api/agent/chat  — Main multi-step workflow entry point
router.post('/agent/chat', async (req, res) => {
  const { motherId, message } = req.body;
  if (!motherId || !message) return res.status(400).json({ error: 'motherId and message required' });
  try {
    const result = await guardianAgent.process(motherId, message);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── MCP Tool: Database ───────────────────────────────────────────────────────
router.get('/mothers', (req, res) => {
  res.json(tools.database.getAllMothers());
});

router.get('/mothers/:id', (req, res) => {
  const data = tools.database.getMother(req.params.id);
  if (!data.mother) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// ── MCP Tool: Blockchain ─────────────────────────────────────────────────────
router.get('/blockchain/bpjs/:motherId', (req, res) => {
  res.json(tools.blockchain.checkBPJS(req.params.motherId));
});

router.get('/blockchain/did/:motherId', (req, res) => {
  res.json(tools.blockchain.verifyDID(req.params.motherId));
});

router.get('/kit-requests', (req, res) => {
  res.json(tools.blockchain.getKitRequests());
});

// ── MCP Tool: Calendar ───────────────────────────────────────────────────────
router.get('/calendar/:motherId', (req, res) => {
  res.json(tools.calendar.getUpcomingMilestones(req.params.motherId));
});

// ── Sub-Agent: Logistics ─────────────────────────────────────────────────────
router.post('/kit/request', async (req, res) => {
  const { motherId, kitType } = req.body;
  if (!motherId || !kitType) return res.status(400).json({ error: 'motherId and kitType required' });
  try {
    const result = await logisticsAgent.requestKit(motherId, kitType);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Sub-Agent: Health Audit ──────────────────────────────────────────────────
router.get('/audit/:motherId', async (req, res) => {
  try {
    const result = await healthAuditAgent.auditMother(req.params.motherId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/audit', async (req, res) => {
  try {
    const result = await healthAuditAgent.scanAllMothers();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Alerts ───────────────────────────────────────────────────────────────────
router.get('/alerts', (req, res) => {
  res.json(tools.database.getAlerts());
});

// ── Agent Session History ────────────────────────────────────────────────────
router.get('/sessions', (req, res) => {
  res.json(db.getAgentTasks(20));
});

module.exports = router;
