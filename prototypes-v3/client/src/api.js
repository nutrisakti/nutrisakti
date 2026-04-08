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

// Vaccination calendar — pass filters as object e.g. { status:'planned', type:'wajib', puskesmas:'PKM001' }
export const getVaccinations = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/vaccinations?${q}`).then(r => r.json());
};

export const addVaccination = (data) =>
  fetch(`${BASE}/vaccinations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

// Kit delivery tracking
export const getKitDeliveries = (filters = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
  return fetch(`${BASE}/kit-deliveries?${q}`).then(r => r.json());
};

export const getKitDeliveryStats = () => fetch(`${BASE}/kit-deliveries/stats`).then(r => r.json());

export const chat = (motherId, message) =>
  fetch(`${BASE}/agent/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherId, message }) }).then(r => r.json());

export const requestKit = (motherId, kitType) =>
  fetch(`${BASE}/kit/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ motherId, kitType }) }).then(r => r.json());
