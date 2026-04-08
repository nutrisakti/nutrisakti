const BASE = '/api';

export const getMothers    = () => fetch(`${BASE}/mothers`).then(r => r.json());
export const getMother     = (id) => fetch(`${BASE}/mothers/${id}`).then(r => r.json());
export const getAuditAll   = () => fetch(`${BASE}/audit`).then(r => r.json());
export const getAudit      = (id) => fetch(`${BASE}/audit/${id}`).then(r => r.json());
export const getAlerts     = () => fetch(`${BASE}/alerts`).then(r => r.json());
export const getSessions   = () => fetch(`${BASE}/sessions`).then(r => r.json());
export const getCalendar   = (id) => fetch(`${BASE}/calendar/${id}`).then(r => r.json());
export const getKitRequests= () => fetch(`${BASE}/kit-requests`).then(r => r.json());

export const chat = (motherId, message) =>
  fetch(`${BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motherId, message }),
  }).then(r => r.json());

export const requestKit = (motherId, kitType) =>
  fetch(`${BASE}/kit/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motherId, kitType }),
  }).then(r => r.json());
