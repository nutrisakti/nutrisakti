const express = require('express');
const router = express.Router();
const guardianAgent = require('../agents/guardianAgent');
const logisticsAgent = require('../agents/logisticsAgent');
const healthAuditAgent = require('../agents/healthAuditAgent');
const tools = require('../tools/mcpTools');
const db = require('../db/database');

router.post('/agent/chat', async (req, res) => {
  const { motherId, message } = req.body;
  if (!motherId || !message) return res.status(400).json({ error: 'motherId and message required' });
  try { res.json(await guardianAgent.process(motherId, message)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/mothers',          (req, res) => res.json(tools.database.getAllMothers()));
router.get('/mothers/:id',      (req, res) => { const d = tools.database.getMother(req.params.id); d.mother ? res.json(d) : res.status(404).json({ error: 'Not found' }); });
router.get('/blockchain/bpjs/:id', (req, res) => res.json(tools.blockchain.checkBPJS(req.params.id)));
router.get('/blockchain/did/:id',  (req, res) => res.json(tools.blockchain.verifyDID(req.params.id)));
router.get('/kit-requests',     (req, res) => res.json(tools.blockchain.getKitRequests()));
router.get('/calendar/:id',     (req, res) => res.json(tools.calendar.getUpcomingMilestones(req.params.id)));
router.get('/alerts',           (req, res) => res.json(tools.database.getAlerts()));
router.get('/sessions',         (req, res) => res.json(db.getAgentTasks(20)));

router.post('/kit/request', async (req, res) => {
  const { motherId, kitType } = req.body;
  if (!motherId || !kitType) return res.status(400).json({ error: 'motherId and kitType required' });
  try { res.json(await logisticsAgent.requestKit(motherId, kitType)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/audit',      async (req, res) => { try { res.json(await healthAuditAgent.scanAllMothers()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/audit/:id',  async (req, res) => { try { res.json(await healthAuditAgent.auditMother(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

module.exports = router;
