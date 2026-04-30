/**
 * Analytics API — aggregates data from all modules for the BI dashboard.
 * All computations are done server-side so the client just renders.
 */

const express = require('express');
const router  = express.Router();
const db      = require('../db/database');

// ── Helper ────────────────────────────────────────────────────────────────────
const pct = (n, d) => d === 0 ? 0 : Math.round((n / d) * 100);

// GET /api/analytics/summary  — top-level KPIs
router.get('/summary', (req, res) => {
  const mothers      = db.getAllMothers();
  const vaccinations = db.getVaccinations();
  const deliveries   = db.getKitDeliveries();
  const appointments = db.getAppointments();
  const reminders    = db.getReminders();
  const orders       = db.getOrders();
  const products     = db.getProducts();

  const totalMothers   = mothers.length;
  const highRisk       = mothers.filter(m => m.risk_level === 'high').length;
  const mediumRisk     = mothers.filter(m => m.risk_level === 'medium').length;
  const bpjsCovered    = mothers.filter(m => m.bpjs_status).length;
  const vaccTaken      = vaccinations.filter(v => v.status === 'taken').length;
  const vaccPlanned    = vaccinations.filter(v => v.status === 'planned').length;
  const vaccOverdue    = vaccinations.filter(v => v.status === 'planned' && new Date(v.date) < new Date()).length;
  const kitDelivered   = deliveries.filter(d => d.status === 'delivered').length;
  const kitFailed      = deliveries.filter(d => d.status === 'failed').length;
  const emergencyAppts = appointments.filter(a => a.type === 'emergency').length;
  const pendingReminders = reminders.filter(r => r.status === 'pending').length;
  const totalRevenue   = orders.reduce((s, o) => s + (o.total_usdc || 0), 0);
  const totalOrders    = orders.length;

  res.json({
    totalMothers,
    highRisk,
    mediumRisk,
    lowRisk:          totalMothers - highRisk - mediumRisk,
    bpjsCovered,
    bpjsUncovered:    totalMothers - bpjsCovered,
    bpjsCoverageRate: pct(bpjsCovered, totalMothers),
    vaccTaken,
    vaccPlanned,
    vaccOverdue,
    vaccCompletionRate: pct(vaccTaken, vaccTaken + vaccPlanned),
    kitDelivered,
    kitFailed,
    kitDeliveryRate:  pct(kitDelivered, deliveries.length),
    emergencyAppts,
    pendingReminders,
    totalRevenue:     parseFloat(totalRevenue.toFixed(2)),
    totalOrders,
    avgOrderValue:    totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0,
    totalProducts:    products.length,
  });
});

// GET /api/analytics/risk-by-region  — risk distribution per region
router.get('/risk-by-region', (req, res) => {
  const mothers = db.getAllMothers();
  const regions = {};
  for (const m of mothers) {
    if (!regions[m.region]) regions[m.region] = { region: m.region, total: 0, high: 0, medium: 0, low: 0, bpjs: 0 };
    regions[m.region].total++;
    regions[m.region][m.risk_level]++;
    if (m.bpjs_status) regions[m.region].bpjs++;
  }
  res.json(Object.values(regions).sort((a, b) => b.total - a.total));
});

// GET /api/analytics/vaccination-coverage  — coverage by vaccine type
router.get('/vaccination-coverage', (req, res) => {
  const vaccinations = db.getVaccinations();
  const byVaccine = {};
  for (const v of vaccinations) {
    if (!byVaccine[v.vaccine_name]) byVaccine[v.vaccine_name] = { name: v.vaccine_name, type: v.type, taken: 0, planned: 0 };
    byVaccine[v.vaccine_name][v.status === 'taken' ? 'taken' : 'planned']++;
  }
  const result = Object.values(byVaccine).map(v => ({
    ...v,
    total:    v.taken + v.planned,
    coverage: pct(v.taken, v.taken + v.planned),
  })).sort((a, b) => b.total - a.total);
  res.json(result);
});

// GET /api/analytics/delivery-performance  — kit delivery by type and status
router.get('/delivery-performance', (req, res) => {
  const deliveries = db.getKitDeliveries();
  const byType = {};
  for (const d of deliveries) {
    if (!byType[d.kit_type]) byType[d.kit_type] = { kit_type: d.kit_type, total: 0, delivered: 0, in_transit: 0, ordered: 0, failed: 0, avg_days: [] };
    byType[d.kit_type].total++;
    byType[d.kit_type][d.status]++;
    if (d.status === 'delivered' && d.ordered_at && d.delivered_at) {
      byType[d.kit_type].avg_days.push(Math.round((new Date(d.delivered_at) - new Date(d.ordered_at)) / 86400000));
    }
  }
  const result = Object.values(byType).map(t => ({
    ...t,
    delivery_rate: pct(t.delivered, t.total),
    avg_delivery_days: t.avg_days.length > 0 ? Math.round(t.avg_days.reduce((a, b) => a + b, 0) / t.avg_days.length) : null,
    avg_days: undefined,
  }));
  res.json(result);
});

// GET /api/analytics/phase-distribution  — mothers by phase + journey progress
router.get('/phase-distribution', (req, res) => {
  const mothers = db.getAllMothers();
  const phases  = { pregnancy: [], infant: [], toddler: [] };
  for (const m of mothers) {
    if (phases[m.phase]) phases[m.phase].push(m.days_in_journey);
  }
  res.json(Object.entries(phases).map(([phase, days]) => ({
    phase,
    count:   days.length,
    avg_day: days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0,
    pct:     pct(days.length, mothers.length),
  })));
});

// GET /api/analytics/appointments-summary  — appointments by type and urgency
router.get('/appointments-summary', (req, res) => {
  const appointments = db.getAppointments();
  const byType = { emergency: 0, urgent: 0, routine: 0 };
  const byStatus = { confirmed: 0, scheduled: 0, cancelled: 0 };
  for (const a of appointments) {
    if (byType[a.type] !== undefined) byType[a.type]++;
    if (byStatus[a.status] !== undefined) byStatus[a.status]++;
  }
  res.json({ byType, byStatus, total: appointments.length });
});

// GET /api/analytics/shop-performance  — revenue and orders by category
router.get('/shop-performance', (req, res) => {
  const orders   = db.getOrders();
  const products = db.getProducts();
  const byCategory = {};

  for (const o of orders) {
    for (const item of (o.items || [])) {
      const product = products.find(p => p.id === item.product_id);
      const cat = product?.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = { category: cat, orders: 0, units: 0, revenue_usdc: 0 };
      byCategory[cat].orders++;
      byCategory[cat].units += item.qty || 0;
      byCategory[cat].revenue_usdc += (item.qty || 0) * (item.price_usdc || 0);
    }
  }

  const result = Object.values(byCategory).map(c => ({
    ...c,
    revenue_usdc: parseFloat(c.revenue_usdc.toFixed(2)),
  })).sort((a, b) => b.revenue_usdc - a.revenue_usdc);

  const totalRevenue = result.reduce((s, c) => s + c.revenue_usdc, 0);
  res.json({
    byCategory: result.map(c => ({ ...c, share_pct: pct(c.revenue_usdc, totalRevenue) })),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalOrders: orders.length,
  });
});

// GET /api/analytics/agent-activity  — agent session stats
router.get('/agent-activity', (req, res) => {
  const sessions = db.getAgentTasks(100);
  const byAgent  = {};
  const byStatus = { completed: 0, running: 0, failed: 0 };

  for (const s of sessions) {
    const agent = s.agent_name || 'Unknown';
    if (!byAgent[agent]) byAgent[agent] = { agent, sessions: 0, completed: 0 };
    byAgent[agent].sessions++;
    if (s.status === 'completed') byAgent[agent].completed++;
    if (byStatus[s.status] !== undefined) byStatus[s.status]++;
  }

  res.json({
    total:    sessions.length,
    byStatus,
    byAgent:  Object.values(byAgent),
    successRate: pct(byStatus.completed, sessions.length),
  });
});

module.exports = router;
