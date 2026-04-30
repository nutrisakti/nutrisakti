/**
 * Reminder Agent
 * Generates vaccination and checkup reminders for a mother based on her
 * vaccination schedule in the database.
 */

const db = require('../db/database');

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(iso) {
  return Math.ceil((new Date(iso) - Date.now()) / 86400000);
}

const reminderAgent = {
  name: 'ReminderAgent',

  /**
   * Get upcoming vaccination reminders for a mother.
   * Also creates new reminder records for any planned vaccinations
   * that don't already have one.
   */
  getReminders: (motherId) => {
    const mother = db.getMother(motherId);
    if (!mother) return { success: false, error: 'Mother not found' };

    // Get planned vaccinations
    const planned = db.getVaccinations({ mother_id: motherId, status: 'planned' });

    // Ensure reminders exist for each planned vaccination
    const existing = db.getReminders({ mother_id: motherId });
    const existingVaccNames = existing.map(r => r.vaccine_name);

    const newReminders = [];
    for (const vacc of planned) {
      if (!existingVaccNames.includes(vacc.vaccine_name)) {
        const days = daysUntil(vacc.date);
        const urgency = days <= 3 ? '🔴 SEGERA' : days <= 7 ? '🟡 Minggu ini' : '🟢 Mendatang';
        const reminder = db.insertReminder({
          mother_id:    motherId,
          type:         'vaccination',
          vaccine_name: vacc.vaccine_name,
          due_date:     vacc.date,
          message:      `${urgency}: Imunisasi ${vacc.vaccine_name} pada ${formatDate(vacc.date)} (${days} hari lagi) di ${vacc.puskesmas_name}.`,
        });
        newReminders.push(reminder);
      }
    }

    // Return all reminders for this mother
    const allReminders = db.getReminders({ mother_id: motherId });

    // Build a human-readable summary
    const upcoming = allReminders
      .filter(r => daysUntil(r.due_date) >= 0)
      .slice(0, 5);

    const summaryLines = upcoming.map(r => {
      const days = daysUntil(r.due_date);
      const urgency = days === 0 ? '🔴 HARI INI' : days <= 3 ? '🔴 ' + days + ' hari lagi' : days <= 7 ? '🟡 ' + days + ' hari lagi' : '🟢 ' + days + ' hari lagi';
      return `${urgency} — ${r.vaccine_name || r.type}: ${formatDate(r.due_date)}`;
    });

    return {
      success:      true,
      motherId,
      motherName:   mother.name,
      reminders:    allReminders,
      newCreated:   newReminders.length,
      summary:      summaryLines.length > 0
        ? `📅 Jadwal imunisasi ${mother.name}:\n${summaryLines.join('\n')}`
        : `✅ Tidak ada jadwal imunisasi mendatang untuk ${mother.name}.`,
    };
  },

  /**
   * Create a custom reminder (e.g. checkup, medication).
   */
  createReminder: (motherId, type, message, dueDate) => {
    const mother = db.getMother(motherId);
    if (!mother) return { success: false, error: 'Mother not found' };
    const reminder = db.insertReminder({ mother_id: motherId, type, vaccine_name: null, due_date: dueDate, message });
    return { success: true, reminder };
  },

  getAllReminders: (filters = {}) => db.getReminders(filters),
};

module.exports = reminderAgent;
