/**
 * Sub-Agent: Health Audit Agent
 * Monitors BPJS coverage, missed milestones, and triggers social worker alerts.
 * Interfaces with: database tool, blockchain tool, calendar tool, whatsapp tool
 */

const tools = require('../tools/mcpTools');

const healthAuditAgent = {
  name: 'HealthAuditAgent',

  /**
   * Run a full audit on a mother's health status
   */
  auditMother: async (motherId) => {
    const steps = [];

    // Step 1: Fetch health history (MCP Tool: database)
    const data = tools.database.getMother(motherId);
    steps.push({ step: 1, action: 'fetched_health_history', tool: 'database', recordCount: data.logs.length });

    if (!data.mother) {
      return { agent: 'HealthAuditAgent', success: false, error: 'Ibu tidak ditemukan', steps };
    }

    // Step 2: Check BPJS on-chain (MCP Tool: blockchain)
    const bpjs = tools.blockchain.checkBPJS(motherId);
    steps.push({ step: 2, action: 'bpjs_checked', result: bpjs, tool: 'blockchain' });

    // Step 3: Get upcoming milestones (MCP Tool: calendar)
    const calendar = tools.calendar.getUpcomingMilestones(motherId);
    steps.push({ step: 3, action: 'milestones_fetched', result: calendar, tool: 'calendar' });

    // Step 4: Determine risk level
    const risks = [];
    if (!bpjs.covered) risks.push('bpjs_uncovered');
    if (data.mother.risk_level === 'high') risks.push('high_risk_mother');
    if (data.logs.length === 0) risks.push('no_recent_visits');

    steps.push({ step: 4, action: 'risk_assessment', risks });

    // Step 5: Send alerts if needed (MCP Tool: whatsapp)
    const alerts = [];
    if (!bpjs.covered) {
      const alert = tools.whatsapp.sendAlert(
        'social_worker',
        `🚨 BPJS TIDAK AKTIF: ${data.mother.name} (${motherId}) di ${data.mother.village}, ${data.mother.region}. Bantu pendaftaran segera.`,
        'high'
      );
      alerts.push(alert);
      steps.push({ step: 5, action: 'bpjs_alert_sent', tool: 'whatsapp' });
    }

    if (data.mother.risk_level === 'high') {
      const alert = tools.whatsapp.sendAlert(
        'midwife',
        `⚠️ IBU RISIKO TINGGI: ${data.mother.name} memerlukan kunjungan prioritas di ${data.mother.village}.`,
        'high'
      );
      alerts.push(alert);
      steps.push({ step: 5, action: 'high_risk_alert_sent', tool: 'whatsapp' });
    }

    return {
      agent: 'HealthAuditAgent',
      success: true,
      mother: data.mother,
      bpjsStatus: bpjs,
      upcomingMilestones: calendar.upcoming,
      risks,
      alertsSent: alerts.length,
      steps,
      summary: risks.length === 0
        ? `${data.mother.name} dalam kondisi baik. ${calendar.upcoming?.length || 0} milestone mendatang.`
        : `${data.mother.name} memerlukan perhatian: ${risks.join(', ')}`
    };
  },

  /**
   * Scan all mothers and flag high-risk ones
   */
  scanAllMothers: async () => {
    const mothers = tools.database.getAllMothers();
    const results = [];

    for (const mother of mothers) {
      const bpjs = tools.blockchain.checkBPJS(mother.id);
      results.push({
        id: mother.id,
        name: mother.name,
        region: mother.region,
        riskLevel: mother.risk_level,
        bpjsCovered: bpjs.covered,
        phase: mother.phase,
        daysInJourney: mother.days_in_journey,
        needsAttention: mother.risk_level === 'high' || !bpjs.covered
      });
    }

    return {
      agent: 'HealthAuditAgent',
      totalMothers: results.length,
      highRisk: results.filter(r => r.riskLevel === 'high').length,
      uncoveredBPJS: results.filter(r => !r.bpjsCovered).length,
      needsAttention: results.filter(r => r.needsAttention).length,
      mothers: results
    };
  }
};

module.exports = healthAuditAgent;
