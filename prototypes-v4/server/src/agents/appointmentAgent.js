/**
 * Appointment Agent
 * Books doctor / emergency appointments based on reported symptoms and risk level.
 * Triggered by GuardianAgent when critical symptoms are detected.
 */

const db = require('../db/database');

// Symptom → urgency mapping
const EMERGENCY_SYMPTOMS = ['kejang', 'tidak sadar', 'sesak napas', 'pendarahan', 'demam tinggi', 'tidak mau menyusu', 'biru', 'lemas sekali'];
const URGENT_SYMPTOMS    = ['demam', 'diare', 'muntah terus', 'nyeri hebat', 'tekanan darah tinggi', 'bengkak', 'pusing berat'];

// Doctor pool per puskesmas
const DOCTORS = {
  PKM001: [{ name: 'Dr. Hendra Kusuma, SpA', specialty: 'Pediatri' }, { name: 'Bidan Sri Wahyuni', specialty: 'Kebidanan' }],
  PKM002: [{ name: 'Dr. Amelia Putri, SpOG', specialty: 'Kandungan' }, { name: 'Bidan Ratna Dewi', specialty: 'Kebidanan' }],
  PKM003: [{ name: 'Dr. Yusuf Hendra, SpA',  specialty: 'Pediatri' }, { name: 'Bidan Maria Tefa', specialty: 'Kebidanan' }],
  PKM004: [{ name: 'Dr. Siti Rahayu, SpOG',  specialty: 'Kandungan' }, { name: 'Bidan Fatma Sari', specialty: 'Kebidanan' }],
  PKM005: [{ name: 'Dr. Budi Santoso, SpA',  specialty: 'Pediatri' }, { name: 'Bidan Lestari', specialty: 'Kebidanan' }],
};

function classifyUrgency(symptoms, riskLevel) {
  const lower = symptoms.join(' ').toLowerCase();
  if (EMERGENCY_SYMPTOMS.some(s => lower.includes(s))) return 'emergency';
  if (URGENT_SYMPTOMS.some(s => lower.includes(s)) || riskLevel === 'high') return 'urgent';
  return 'routine';
}

function pickDoctor(puskesmasId, phase) {
  const pool = DOCTORS[puskesmasId] || DOCTORS['PKM001'];
  // Prefer pediatrician for infant/toddler, OB for pregnancy
  if (phase === 'pregnancy') return pool.find(d => d.specialty === 'Kandungan') || pool[0];
  if (phase === 'infant' || phase === 'toddler') return pool.find(d => d.specialty === 'Pediatri') || pool[0];
  return pool[0];
}

function scheduledAt(urgency) {
  const now = Date.now();
  if (urgency === 'emergency') return new Date(now + 2 * 3600000).toISOString();   // 2 hours
  if (urgency === 'urgent')    return new Date(now + 24 * 3600000).toISOString();  // tomorrow
  return new Date(now + 7 * 24 * 3600000).toISOString();                           // 1 week
}

const appointmentAgent = {
  name: 'AppointmentAgent',

  /**
   * Book an appointment based on reported symptoms.
   * @param {string} motherId
   * @param {string[]} symptoms  - detected symptom strings
   * @param {string} reason      - free-text reason from mother's message
   */
  bookAppointment: (motherId, symptoms, reason) => {
    const mother = db.getMother(motherId);
    if (!mother) return { success: false, error: 'Mother not found' };

    const urgency  = classifyUrgency(symptoms, mother.risk_level);
    const doctor   = pickDoctor(mother.puskesmas_id, mother.phase);
    const schedAt  = scheduledAt(urgency);

    const appointment = db.insertAppointment({
      mother_id:    motherId,
      type:         urgency,
      doctor:       doctor.name,
      specialty:    doctor.specialty,
      puskesmas_id: mother.puskesmas_id,
      scheduled_at: schedAt,
      reason:       reason || symptoms.join(', '),
      status:       urgency === 'emergency' ? 'confirmed' : 'scheduled',
      created_by:   'GuardianAgent',
    });

    // Log health event
    db.insertHealthLog({
      id:          'HL' + Date.now(),
      mother_id:   motherId,
      type:        'appointment_booked',
      description: `${urgency.toUpperCase()} appointment booked with ${doctor.name}`,
      logged_by:   'AppointmentAgent',
    });

    return {
      success:     true,
      appointment,
      urgency,
      doctor:      doctor.name,
      specialty:   doctor.specialty,
      scheduledAt: schedAt,
      message:     urgency === 'emergency'
        ? `🚨 DARURAT: Janji temu dengan ${doctor.name} dikonfirmasi dalam 2 jam!`
        : urgency === 'urgent'
        ? `⚠️ Janji temu mendesak dengan ${doctor.name} dijadwalkan besok.`
        : `📅 Janji temu rutin dengan ${doctor.name} dijadwalkan minggu depan.`,
    };
  },

  getAllAppointments: (filters = {}) => db.getAppointments(filters),
};

module.exports = appointmentAgent;
