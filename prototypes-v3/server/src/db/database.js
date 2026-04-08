/**
 * In-memory database (pure JS, no native modules required)
 * Simulates PostgreSQL/WatermelonDB for the hackathon demo
 */

const now = () => new Date().toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString();

// ── Vaccination master schedule ───────────────────────────────────────────────
const VACCINE_SCHEDULE = [
  { id: 'V01', name: 'Hepatitis B',       type: 'wajib',   ageMonths: 0,  description: 'Diberikan segera setelah lahir' },
  { id: 'V02', name: 'BCG',               type: 'wajib',   ageMonths: 1,  description: 'Mencegah tuberkulosis' },
  { id: 'V03', name: 'Polio 1',           type: 'wajib',   ageMonths: 1,  description: 'Tetes polio pertama' },
  { id: 'V04', name: 'DPT-HB-Hib 1',     type: 'wajib',   ageMonths: 2,  description: 'Difteri, Pertusis, Tetanus' },
  { id: 'V05', name: 'Polio 2',           type: 'wajib',   ageMonths: 2,  description: 'Tetes polio kedua' },
  { id: 'V06', name: 'DPT-HB-Hib 2',     type: 'wajib',   ageMonths: 3,  description: 'Dosis kedua DPT' },
  { id: 'V07', name: 'Polio 3',           type: 'wajib',   ageMonths: 3,  description: 'Tetes polio ketiga' },
  { id: 'V08', name: 'DPT-HB-Hib 3',     type: 'wajib',   ageMonths: 4,  description: 'Dosis ketiga DPT' },
  { id: 'V09', name: 'Polio 4 (IPV)',     type: 'wajib',   ageMonths: 4,  description: 'Polio suntik' },
  { id: 'V10', name: 'Campak/MR',         type: 'wajib',   ageMonths: 9,  description: 'Campak dan Rubella' },
  { id: 'V11', name: 'DPT-HB-Hib Lanjut','type': 'lanjutan', ageMonths: 18, description: 'Booster DPT' },
  { id: 'V12', name: 'Campak/MR Lanjut', type: 'lanjutan', ageMonths: 18, description: 'Booster Campak' },
  { id: 'V13', name: 'TT Ibu Hamil 1',   type: 'prenatal', ageMonths: null, description: 'Tetanus Toksoid untuk ibu hamil' },
  { id: 'V14', name: 'TT Ibu Hamil 2',   type: 'prenatal', ageMonths: null, description: 'Dosis kedua TT ibu hamil' },
];

// ── Puskesmas list ────────────────────────────────────────────────────────────
const PUSKESMAS = [
  { id: 'PKM001', name: 'Puskesmas Kupang Kota',  region: 'NTT',    village: 'Kupang' },
  { id: 'PKM002', name: 'Puskesmas Ende',          region: 'NTT',    village: 'Ende' },
  { id: 'PKM003', name: 'Puskesmas Jayapura',      region: 'Papua',  village: 'Jayapura' },
  { id: 'PKM004', name: 'Puskesmas Ambon Tengah',  region: 'Maluku', village: 'Ambon' },
  { id: 'PKM005', name: 'Puskesmas Mataram',       region: 'NTB',    village: 'Mataram' },
];

const store = {
  mothers: [
    { id: 'MTR001', name: 'Ibu Siti Aminah',   age: 28, phase: 'pregnancy', days_in_journey: 120, region: 'NTT',    village: 'Kupang',   bpjs_status: 1, risk_level: 'low',    puskesmas_id: 'PKM001', created_at: now() },
    { id: 'MTR002', name: 'Ibu Maria Goreti',   age: 24, phase: 'infant',    days_in_journey: 350, region: 'Papua',  village: 'Jayapura', bpjs_status: 0, risk_level: 'high',   puskesmas_id: 'PKM003', created_at: now() },
    { id: 'MTR003', name: 'Ibu Fatimah Zahra',  age: 32, phase: 'pregnancy', days_in_journey: 85,  region: 'Maluku', village: 'Ambon',    bpjs_status: 1, risk_level: 'medium', puskesmas_id: 'PKM004', created_at: now() },
    { id: 'MTR004', name: 'Ibu Dewi Kartika',   age: 25, phase: 'toddler',   days_in_journey: 680, region: 'NTB',    village: 'Mataram',  bpjs_status: 1, risk_level: 'low',    puskesmas_id: 'PKM005', created_at: now() },
    { id: 'MTR005', name: 'Ibu Nur Halimah',    age: 29, phase: 'pregnancy', days_in_journey: 200, region: 'NTT',    village: 'Ende',     bpjs_status: 0, risk_level: 'high',   puskesmas_id: 'PKM002', created_at: now() },
  ],

  // Vaccination records — taken + planned
  vaccinations: [
    // MTR001 - pregnancy, taken TT1 & TT2
    { id: 'VAC001', mother_id: 'MTR001', vaccine_id: 'V13', vaccine_name: 'TT Ibu Hamil 1', type: 'prenatal', status: 'taken',   date: daysAgo(45), puskesmas_id: 'PKM001', notes: 'Reaksi normal' },
    { id: 'VAC002', mother_id: 'MTR001', vaccine_id: 'V14', vaccine_name: 'TT Ibu Hamil 2', type: 'prenatal', status: 'planned', date: daysAhead(15), puskesmas_id: 'PKM001', notes: '' },
    // MTR002 - infant, several taken
    { id: 'VAC003', mother_id: 'MTR002', vaccine_id: 'V01', vaccine_name: 'Hepatitis B',    type: 'wajib',   status: 'taken',   date: daysAgo(350), puskesmas_id: 'PKM003', notes: 'Lahir di RS' },
    { id: 'VAC004', mother_id: 'MTR002', vaccine_id: 'V02', vaccine_name: 'BCG',            type: 'wajib',   status: 'taken',   date: daysAgo(320), puskesmas_id: 'PKM003', notes: '' },
    { id: 'VAC005', mother_id: 'MTR002', vaccine_id: 'V03', vaccine_name: 'Polio 1',        type: 'wajib',   status: 'taken',   date: daysAgo(320), puskesmas_id: 'PKM003', notes: '' },
    { id: 'VAC006', mother_id: 'MTR002', vaccine_id: 'V04', vaccine_name: 'DPT-HB-Hib 1',  type: 'wajib',   status: 'taken',   date: daysAgo(290), puskesmas_id: 'PKM003', notes: '' },
    { id: 'VAC007', mother_id: 'MTR002', vaccine_id: 'V10', vaccine_name: 'Campak/MR',      type: 'wajib',   status: 'planned', date: daysAhead(10), puskesmas_id: 'PKM003', notes: 'Jadwal 9 bulan' },
    // MTR003 - pregnancy
    { id: 'VAC008', mother_id: 'MTR003', vaccine_id: 'V13', vaccine_name: 'TT Ibu Hamil 1', type: 'prenatal', status: 'taken',   date: daysAgo(20), puskesmas_id: 'PKM004', notes: '' },
    { id: 'VAC009', mother_id: 'MTR003', vaccine_id: 'V14', vaccine_name: 'TT Ibu Hamil 2', type: 'prenatal', status: 'planned', date: daysAhead(30), puskesmas_id: 'PKM004', notes: '' },
    // MTR004 - toddler, booster due
    { id: 'VAC010', mother_id: 'MTR004', vaccine_id: 'V01', vaccine_name: 'Hepatitis B',    type: 'wajib',   status: 'taken',   date: daysAgo(680), puskesmas_id: 'PKM005', notes: '' },
    { id: 'VAC011', mother_id: 'MTR004', vaccine_id: 'V10', vaccine_name: 'Campak/MR',      type: 'wajib',   status: 'taken',   date: daysAgo(400), puskesmas_id: 'PKM005', notes: '' },
    { id: 'VAC012', mother_id: 'MTR004', vaccine_id: 'V11', vaccine_name: 'DPT-HB-Hib Lanjut', type: 'lanjutan', status: 'planned', date: daysAhead(5), puskesmas_id: 'PKM005', notes: 'Booster 18 bulan' },
    // MTR005 - pregnancy, no vaccinations yet
    { id: 'VAC013', mother_id: 'MTR005', vaccine_id: 'V13', vaccine_name: 'TT Ibu Hamil 1', type: 'prenatal', status: 'planned', date: daysAhead(7), puskesmas_id: 'PKM002', notes: 'Belum dilakukan' },
  ],

  // Kit delivery tracking
  kit_deliveries: [
    { id: 'KD001', mother_id: 'MTR001', kit_type: 'prenatal',  status: 'delivered',  ordered_at: daysAgo(30), dispatched_at: daysAgo(27), delivered_at: daysAgo(25), puskesmas_id: 'PKM001', proof_hash: '0xabc123', notes: 'Diterima oleh ibu langsung' },
    { id: 'KD002', mother_id: 'MTR002', kit_type: 'newborn',   status: 'in_transit', ordered_at: daysAgo(5),  dispatched_at: daysAgo(3),  delivered_at: null,        puskesmas_id: 'PKM003', proof_hash: null,       notes: 'Dalam perjalanan ke Jayapura' },
    { id: 'KD003', mother_id: 'MTR003', kit_type: 'prenatal',  status: 'ordered',    ordered_at: daysAgo(1),  dispatched_at: null,        delivered_at: null,        puskesmas_id: 'PKM004', proof_hash: null,       notes: 'Menunggu pengiriman' },
    { id: 'KD004', mother_id: 'MTR004', kit_type: 'nutrition', status: 'delivered',  ordered_at: daysAgo(60), dispatched_at: daysAgo(57), delivered_at: daysAgo(55), puskesmas_id: 'PKM005', proof_hash: '0xdef456', notes: 'Diterima di Posyandu' },
    { id: 'KD005', mother_id: 'MTR005', kit_type: 'prenatal',  status: 'failed',     ordered_at: daysAgo(15), dispatched_at: daysAgo(12), delivered_at: null,        puskesmas_id: 'PKM002', proof_hash: null,       notes: 'Alamat tidak ditemukan, perlu verifikasi ulang' },
    { id: 'KD006', mother_id: 'MTR001', kit_type: 'delivery',  status: 'ordered',    ordered_at: daysAgo(2),  dispatched_at: null,        delivered_at: null,        puskesmas_id: 'PKM001', proof_hash: null,       notes: 'Kit persalinan dipesan' },
  ],

  health_logs: [],
  nutrition_logs: [],
  kit_requests: [],
  agent_tasks: [],
  alerts: [],
};

const db = {
  getMother:      (id) => store.mothers.find(m => m.id === id) || null,
  getAllMothers:   () => [...store.mothers].sort((a, b) => (b.risk_level > a.risk_level ? 1 : -1)),
  getPuskesmas:   () => PUSKESMAS,
  getVaccineSchedule: () => VACCINE_SCHEDULE,

  // Vaccinations
  getVaccinations: (filters = {}) => {
    let rows = store.vaccinations.map(v => ({
      ...v,
      mother_name: store.mothers.find(m => m.id === v.mother_id)?.name || 'Unknown',
      puskesmas_name: PUSKESMAS.find(p => p.id === v.puskesmas_id)?.name || 'Unknown',
    }));
    if (filters.status)      rows = rows.filter(r => r.status === filters.status);
    if (filters.type)        rows = rows.filter(r => r.type === filters.type);
    if (filters.puskesmas)   rows = rows.filter(r => r.puskesmas_id === filters.puskesmas);
    if (filters.mother_id)   rows = rows.filter(r => r.mother_id === filters.mother_id);
    if (filters.vaccine_name) rows = rows.filter(r => r.vaccine_name.toLowerCase().includes(filters.vaccine_name.toLowerCase()));
    return rows.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  addVaccination: (row) => { store.vaccinations.push({ ...row, id: `VAC${Date.now()}` }); },

  // Kit deliveries
  getKitDeliveries: (filters = {}) => {
    let rows = store.kit_deliveries.map(d => ({
      ...d,
      mother_name: store.mothers.find(m => m.id === d.mother_id)?.name || 'Unknown',
      puskesmas_name: PUSKESMAS.find(p => p.id === d.puskesmas_id)?.name || 'Unknown',
    }));
    if (filters.status)    rows = rows.filter(r => r.status === filters.status);
    if (filters.kit_type)  rows = rows.filter(r => r.kit_type === filters.kit_type);
    if (filters.puskesmas) rows = rows.filter(r => r.puskesmas_id === filters.puskesmas);
    if (filters.mother_id) rows = rows.filter(r => r.mother_id === filters.mother_id);
    return rows.sort((a, b) => new Date(b.ordered_at) - new Date(a.ordered_at));
  },

  insertHealthLog:    (row) => { store.health_logs.push({ ...row, created_at: now() }); },
  getHealthLogs:      (motherId, limit = 10) => store.health_logs.filter(l => l.mother_id === motherId).slice(-limit).reverse(),
  insertNutritionLog: (row) => { store.nutrition_logs.push({ ...row, created_at: now() }); },
  getNutritionLogs:   (motherId, limit = 5) => store.nutrition_logs.filter(l => l.mother_id === motherId).slice(-limit).reverse(),
  insertKitRequest:   (row) => { store.kit_requests.push({ ...row, created_at: now() }); },
  getKitRequests:     () => store.kit_requests.map(kr => ({ ...kr, mother_name: store.mothers.find(m => m.id === kr.mother_id)?.name || 'Unknown' })).reverse(),
  insertAgentTask:    (row) => { store.agent_tasks.push({ ...row, created_at: now() }); },
  updateAgentTask:    (id, output, status) => { const t = store.agent_tasks.find(t => t.id === id); if (t) { t.output = output; t.status = status; } },
  getAgentTasks:      (limit = 20) => [...store.agent_tasks].reverse().slice(0, limit),
  insertAlert:        (row) => { store.alerts.push({ ...row, resolved: 0, created_at: now() }); },
  getAlerts:          () => store.alerts.filter(a => !a.resolved).reverse(),
};

module.exports = db;
