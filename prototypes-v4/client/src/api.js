const BASE = (process.env.REACT_APP_API_URL || '') + '/api';

export const getMothers      = () => fetch(`${BASE}/mothers`).then(r => r.json());
export const getMother       = (id) => fetch(`${BASE}/mothers/${id}`).then(r => r.json());
export const getAuditAll     = () => fetch(`${BASE}/audit`).then(r => r.json());
export const getAudit        = (id) => fetch(`${BASE}/audit/${id}`).then(r => r.json());
export const getAlerts       = () => fetch(`${BASE}/alerts`).then(r => r.json());
export const getSessions     = () => fetch(`${BASE}/sessions`).then(r => r.json());
export const getCalendar     = (id) => fetch(`${BASE}/calendar/${id}`).then(r => r.json());
export const getKitRequests  = () => fetch(`${BASE}/kit-requests`).then(r => r.json());
export const getPuskesmas    = () => fetch(`${BASE}/puskesmas`).then(r => r.json());
export const getVaccineSchedule = () => fetch(`${BASE}/vaccine-schedule`).then(r => r.json());

export const getVaccinations = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/vaccinations?${q}`).then(r => r.json());
};
export const addVaccination = (data) =>
  fetch(`${BASE}/vaccinations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const getKitDeliveries = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/kit-deliveries?${q}`).then(r => r.json());
};
export const getKitDeliveryStats = () => fetch(`${BASE}/kit-deliveries/stats`).then(r => r.json());

export const chat = (motherId, message) =>
  fetch(`${BASE}/agent/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherId, message }) }).then(r => r.json());

export const requestKit = (motherId, kitType) =>
  fetch(`${BASE}/kit/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherId, kitType }) }).then(r => r.json());

// ── Appointments ──────────────────────────────────────────────────────────────
export const getAppointments = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/appointments?${q}`).then(r => r.json());
};
export const bookAppointment = (motherId, symptoms, reason) =>
  fetch(`${BASE}/appointments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherId, symptoms, reason }) }).then(r => r.json());

// ── Reminders ─────────────────────────────────────────────────────────────────
export const getReminders = (motherId) => fetch(`${BASE}/reminders/${motherId}`).then(r => r.json());
export const getAllReminders = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/reminders?${q}`).then(r => r.json());
};

// ── Shop ──────────────────────────────────────────────────────────────────────
export const getProducts = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/shop/products?${q}`).then(r => r.json());
};
export const getOrders = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/shop/orders?${q}`).then(r => r.json());
};
export const placeOrder = (motherId, message, address) =>
  fetch(`${BASE}/shop/order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherId, message, address }) }).then(r => r.json());

// ── Analytics / BI ────────────────────────────────────────────────────────────
export const getAnalyticsSummary        = () => fetch(`${BASE}/analytics/summary`).then(r => r.json());
export const getAnalyticsRiskByRegion   = () => fetch(`${BASE}/analytics/risk-by-region`).then(r => r.json());
export const getAnalyticsVaccCoverage   = () => fetch(`${BASE}/analytics/vaccination-coverage`).then(r => r.json());
export const getAnalyticsDelivery       = () => fetch(`${BASE}/analytics/delivery-performance`).then(r => r.json());
export const getAnalyticsPhase          = () => fetch(`${BASE}/analytics/phase-distribution`).then(r => r.json());
export const getAnalyticsAppointments   = () => fetch(`${BASE}/analytics/appointments-summary`).then(r => r.json());
export const getAnalyticsShop           = () => fetch(`${BASE}/analytics/shop-performance`).then(r => r.json());
export const getAnalyticsAgentActivity  = () => fetch(`${BASE}/analytics/agent-activity`).then(r => r.json());

// ── Version / diagnostics ─────────────────────────────────────────────────────
export const getVersion = () => fetch(`${BASE}/version`).then(r => r.json());
