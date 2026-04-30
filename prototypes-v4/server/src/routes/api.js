const express = require('express');
const router = express.Router();
const guardianAgent = require('../agents/guardianAgent');
const logisticsAgent = require('../agents/logisticsAgent');
const healthAuditAgent = require('../agents/healthAuditAgent');
const appointmentAgent = require('../agents/appointmentAgent');
const reminderAgent = require('../agents/reminderAgent');
const shopAgent = require('../agents/shopAgent');
const tools = require('../tools/mcpTools');
const db = require('../db/database');

router.post('/agent/chat', async (req, res) => {
  const { motherId, message } = req.body;
  if (!motherId || !message) return res.status(400).json({ error: 'motherId and message required' });
  try { res.json(await guardianAgent.process(motherId, message)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/mothers',             (req, res) => res.json(tools.database.getAllMothers()));
router.get('/mothers/:id',         (req, res) => { const d = tools.database.getMother(req.params.id); d.mother ? res.json(d) : res.status(404).json({ error: 'Not found' }); });
router.get('/blockchain/bpjs/:id', (req, res) => res.json(tools.blockchain.checkBPJS(req.params.id)));
router.get('/blockchain/did/:id',  (req, res) => res.json(tools.blockchain.verifyDID(req.params.id)));
router.get('/kit-requests',        (req, res) => res.json(tools.blockchain.getKitRequests()));
router.get('/calendar/:id',        (req, res) => res.json(tools.calendar.getUpcomingMilestones(req.params.id)));
router.get('/alerts',              (req, res) => res.json(tools.database.getAlerts()));
router.get('/sessions',            (req, res) => res.json(db.getAgentTasks(20)));
router.get('/puskesmas',           (req, res) => res.json(db.getPuskesmas()));
router.get('/vaccine-schedule',    (req, res) => res.json(db.getVaccineSchedule()));

// ── Vaccination calendar ──────────────────────────────────────────────────────
router.get('/vaccinations', (req, res) => res.json(db.getVaccinations(req.query)));
router.post('/vaccinations', (req, res) => {
  const { mother_id, vaccine_id, vaccine_name, type, status, date, puskesmas_id, notes } = req.body;
  if (!mother_id || !vaccine_name) return res.status(400).json({ error: 'mother_id and vaccine_name required' });
  const row = { mother_id, vaccine_id, vaccine_name, type: type || 'wajib', status: status || 'taken', date: date || new Date().toISOString(), puskesmas_id, notes: notes || '' };
  db.addVaccination(row);
  res.json({ success: true, vaccination: row });
});

// ── Kit delivery tracking ─────────────────────────────────────────────────────
router.get('/kit-deliveries', (req, res) => res.json(db.getKitDeliveries(req.query)));
router.get('/kit-deliveries/stats', (req, res) => {
  const all = db.getKitDeliveries();
  res.json({
    total:      all.length,
    delivered:  all.filter(d => d.status === 'delivered').length,
    in_transit: all.filter(d => d.status === 'in_transit').length,
    ordered:    all.filter(d => d.status === 'ordered').length,
    failed:     all.filter(d => d.status === 'failed').length,
    delivery_rate: Math.round(all.filter(d => d.status === 'delivered').length / all.length * 100) + '%',
  });
});

router.post('/kit/request', async (req, res) => {
  const { motherId, kitType } = req.body;
  if (!motherId || !kitType) return res.status(400).json({ error: 'motherId and kitType required' });
  try { res.json(await logisticsAgent.requestKit(motherId, kitType)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/audit',      async (req, res) => { try { res.json(await healthAuditAgent.scanAllMothers()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/audit/:id',  async (req, res) => { try { res.json(await healthAuditAgent.auditMother(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

// ── Appointments ──────────────────────────────────────────────────────────────
router.get('/appointments', (req, res) => res.json(appointmentAgent.getAllAppointments(req.query)));
router.post('/appointments', (req, res) => {
  const { motherId, symptoms, reason } = req.body;
  if (!motherId) return res.status(400).json({ error: 'motherId required' });
  res.json(appointmentAgent.bookAppointment(motherId, symptoms || [], reason || ''));
});
router.patch('/appointments/:id', (req, res) => {
  const result = db.updateAppointmentStatus(req.params.id, req.body.status);
  result ? res.json({ success: true, appointment: result }) : res.status(404).json({ error: 'Not found' });
});

// ── Reminders ─────────────────────────────────────────────────────────────────
router.get('/reminders', (req, res) => res.json(reminderAgent.getAllReminders(req.query)));
router.get('/reminders/:motherId', (req, res) => res.json(reminderAgent.getReminders(req.params.motherId)));
router.post('/reminders', (req, res) => {
  const { motherId, type, message, dueDate } = req.body;
  if (!motherId || !message) return res.status(400).json({ error: 'motherId and message required' });
  res.json(reminderAgent.createReminder(motherId, type || 'custom', message, dueDate || new Date().toISOString()));
});

// ── Shop ──────────────────────────────────────────────────────────────────────
router.get('/shop/products', (req, res) => res.json(shopAgent.getProducts(req.query)));
router.get('/shop/products/:id', (req, res) => {
  const p = db.getProduct(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Product not found' });
});
router.get('/shop/orders', (req, res) => res.json(shopAgent.getOrders(req.query)));
router.post('/shop/order', (req, res) => {
  const { motherId, message, address } = req.body;
  if (!motherId || !message) return res.status(400).json({ error: 'motherId and message required' });
  res.json(shopAgent.placeOrder(motherId, message, address));
});

module.exports = router;

router.post('/agent/chat', async (req, res) => {
  const { motherId, message } = req.body;
  if (!motherId || !message) return res.status(400).json({ error: 'motherId and message required' });
  try { res.json(await guardianAgent.process(motherId, message)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/mothers',             (req, res) => res.json(tools.database.getAllMothers()));
router.get('/mothers/:id',         (req, res) => { const d = tools.database.getMother(req.params.id); d.mother ? res.json(d) : res.status(404).json({ error: 'Not found' }); });
router.get('/blockchain/bpjs/:id', (req, res) => res.json(tools.blockchain.checkBPJS(req.params.id)));
router.get('/blockchain/did/:id',  (req, res) => res.json(tools.blockchain.verifyDID(req.params.id)));
router.get('/kit-requests',        (req, res) => res.json(tools.blockchain.getKitRequests()));
router.get('/calendar/:id',        (req, res) => res.json(tools.calendar.getUpcomingMilestones(req.params.id)));
router.get('/alerts',              (req, res) => res.json(tools.database.getAlerts()));
router.get('/sessions',            (req, res) => res.json(db.getAgentTasks(20)));
router.get('/puskesmas',           (req, res) => res.json(db.getPuskesmas()));
router.get('/vaccine-schedule',    (req, res) => res.json(db.getVaccineSchedule()));

// ── Vaccination calendar with multi-filter ────────────────────────────────────
// GET /api/vaccinations?status=taken|planned&type=wajib|lanjutan|prenatal&puskesmas=PKM001&mother_id=MTR001&vaccine_name=BCG
router.get('/vaccinations', (req, res) => {
  res.json(db.getVaccinations(req.query));
});

// POST /api/vaccinations — record a vaccination
router.post('/vaccinations', (req, res) => {
  const { mother_id, vaccine_id, vaccine_name, type, status, date, puskesmas_id, notes } = req.body;
  if (!mother_id || !vaccine_name) return res.status(400).json({ error: 'mother_id and vaccine_name required' });
  const row = { mother_id, vaccine_id, vaccine_name, type: type || 'wajib', status: status || 'taken', date: date || new Date().toISOString(), puskesmas_id, notes: notes || '' };
  db.addVaccination(row);
  res.json({ success: true, vaccination: row });
});

// ── Kit delivery tracking ─────────────────────────────────────────────────────
// GET /api/kit-deliveries?status=ordered|in_transit|delivered|failed&kit_type=prenatal&puskesmas=PKM001&mother_id=MTR001
router.get('/kit-deliveries', (req, res) => {
  res.json(db.getKitDeliveries(req.query));
});

// GET /api/kit-deliveries/stats — summary stats
router.get('/kit-deliveries/stats', (req, res) => {
  const all = db.getKitDeliveries();
  res.json({
    total:      all.length,
    delivered:  all.filter(d => d.status === 'delivered').length,
    in_transit: all.filter(d => d.status === 'in_transit').length,
    ordered:    all.filter(d => d.status === 'ordered').length,
    failed:     all.filter(d => d.status === 'failed').length,
    delivery_rate: Math.round(all.filter(d => d.status === 'delivered').length / all.length * 100) + '%',
  });
});

router.post('/kit/request', async (req, res) => {
  const { motherId, kitType } = req.body;
  if (!motherId || !kitType) return res.status(400).json({ error: 'motherId and kitType required' });
  try { res.json(await logisticsAgent.requestKit(motherId, kitType)); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/audit',      async (req, res) => { try { res.json(await healthAuditAgent.scanAllMothers()); } catch (e) { res.status(500).json({ error: e.message }); } });
router.get('/audit/:id',  async (req, res) => { try { res.json(await healthAuditAgent.auditMother(req.params.id)); } catch (e) { res.status(500).json({ error: e.message }); } });

module.exports = router;
