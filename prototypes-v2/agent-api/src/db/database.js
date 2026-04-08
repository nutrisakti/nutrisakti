/**
 * In-memory database (pure JS, no native modules required)
 * Simulates PostgreSQL/WatermelonDB for the hackathon demo
 */

const now = () => new Date().toISOString();

const store = {
  mothers: [
    { id: 'MTR001', name: 'Ibu Siti Aminah',   age: 28, phase: 'pregnancy', days_in_journey: 120, region: 'NTT',    village: 'Kupang',   bpjs_status: 1, risk_level: 'low',    created_at: now() },
    { id: 'MTR002', name: 'Ibu Maria Goreti',   age: 24, phase: 'infant',    days_in_journey: 350, region: 'Papua',  village: 'Jayapura', bpjs_status: 0, risk_level: 'high',   created_at: now() },
    { id: 'MTR003', name: 'Ibu Fatimah Zahra',  age: 32, phase: 'pregnancy', days_in_journey: 85,  region: 'Maluku', village: 'Ambon',    bpjs_status: 1, risk_level: 'medium', created_at: now() },
    { id: 'MTR004', name: 'Ibu Dewi Kartika',   age: 25, phase: 'toddler',   days_in_journey: 680, region: 'NTB',    village: 'Mataram',  bpjs_status: 1, risk_level: 'low',    created_at: now() },
    { id: 'MTR005', name: 'Ibu Nur Halimah',    age: 29, phase: 'pregnancy', days_in_journey: 200, region: 'NTT',    village: 'Ende',     bpjs_status: 0, risk_level: 'high',   created_at: now() },
  ],
  health_logs: [],
  nutrition_logs: [],
  kit_requests: [],
  agent_tasks: [],
  alerts: [],
};

// Simple query helpers that mimic SQLite API
const db = {
  getMother: (id) => store.mothers.find(m => m.id === id) || null,
  getAllMothers: () => [...store.mothers].sort((a, b) => (b.risk_level > a.risk_level ? 1 : -1)),

  insertHealthLog: (row) => { store.health_logs.push({ ...row, created_at: now() }); },
  getHealthLogs: (motherId, limit = 10) =>
    store.health_logs.filter(l => l.mother_id === motherId).slice(-limit).reverse(),

  insertNutritionLog: (row) => { store.nutrition_logs.push({ ...row, created_at: now() }); },
  getNutritionLogs: (motherId, limit = 5) =>
    store.nutrition_logs.filter(l => l.mother_id === motherId).slice(-limit).reverse(),

  insertKitRequest: (row) => { store.kit_requests.push({ ...row, created_at: now() }); },
  getKitRequests: () =>
    store.kit_requests.map(kr => ({
      ...kr,
      mother_name: store.mothers.find(m => m.id === kr.mother_id)?.name || 'Unknown'
    })).reverse(),

  insertAgentTask: (row) => { store.agent_tasks.push({ ...row, created_at: now() }); },
  updateAgentTask: (id, output, status) => {
    const task = store.agent_tasks.find(t => t.id === id);
    if (task) { task.output = output; task.status = status; }
  },
  getAgentTasks: (limit = 20) => [...store.agent_tasks].reverse().slice(0, limit),

  insertAlert: (row) => { store.alerts.push({ ...row, resolved: 0, created_at: now() }); },
  getAlerts: () => store.alerts.filter(a => !a.resolved).reverse(),
};

module.exports = db;
