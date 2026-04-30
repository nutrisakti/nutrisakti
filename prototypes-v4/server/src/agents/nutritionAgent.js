/**
 * Sub-Agent: Nutrition Agent
 * Handles food recognition, nutrient analysis, and anemia/risk detection.
 * Interfaces with: database tool, whatsapp tool
 */

const tools = require('../tools/mcpTools');

const INDONESIAN_FOODS = {
  'daun kelor': { protein: 9.4, iron: 4.0, calcium: 185, vitamins: ['A','C','E','K'], risk: [] },
  'singkong':   { protein: 1.4, iron: 0.3, calcium: 16,  vitamins: ['C','B6'],        risk: ['high_carb'] },
  'ubi jalar':  { protein: 1.6, iron: 0.6, calcium: 30,  vitamins: ['A','C'],          risk: [] },
  'ikan teri':  { protein: 10.0, iron: 2.0, calcium: 972, vitamins: ['D','B12'],       risk: [] },
  'kacang hijau':{ protein: 7.0, iron: 1.4, calcium: 27, vitamins: ['B1','B2'],        risk: [] },
  'telur kampung':{ protein: 12.5, iron: 1.8, calcium: 56, vitamins: ['A','D','B12'], risk: [] },
};

const nutritionAgent = {
  name: 'NutritionAgent',

  /**
   * Analyze food input and detect maternal health risks
   */
  analyzeFood: async (motherId, foodInput, symptoms = []) => {
    const steps = [];

    // Step 1: Identify food
    const foodKey = Object.keys(INDONESIAN_FOODS).find(k =>
      foodInput.toLowerCase().includes(k)
    ) || 'unknown';

    const nutrients = INDONESIAN_FOODS[foodKey] || {
      protein: 2.0, iron: 0.5, calcium: 20, vitamins: [], risk: ['unknown_food']
    };

    steps.push({ step: 1, action: 'food_identified', result: foodKey, agent: 'NutritionAgent' });

    // Step 2: Risk detection
    const riskFlags = [...nutrients.risk];
    if (symptoms.includes('pusing') || symptoms.includes('lemas')) {
      riskFlags.push('anemia_risk');
    }
    if (nutrients.iron < 1.0) riskFlags.push('low_iron');
    if (nutrients.protein < 3.0) riskFlags.push('low_protein');

    steps.push({ step: 2, action: 'risk_analysis', riskFlags, agent: 'NutritionAgent' });

    // Step 3: Save to database (MCP Tool: database)
    const analysis = `Analisis: ${foodKey} mengandung ${nutrients.protein}g protein, ${nutrients.iron}mg zat besi. ${riskFlags.length > 0 ? 'Risiko: ' + riskFlags.join(', ') : 'Nutrisi baik.'}`;
    const dbResult = tools.database.saveNutritionLog(motherId, foodKey, nutrients, riskFlags, analysis);
    steps.push({ step: 3, action: 'saved_to_database', result: dbResult, tool: 'database' });

    // Step 4: If high risk, trigger WhatsApp alert (MCP Tool: whatsapp)
    let alertResult = null;
    if (riskFlags.includes('anemia_risk')) {
      alertResult = tools.whatsapp.sendAlert(
        'midwife',
        `⚠️ RISIKO ANEMIA: ${motherId} melaporkan gejala pusing/lemas. Perlu pemeriksaan segera.`,
        'high'
      );
      steps.push({ step: 4, action: 'alert_sent', result: alertResult, tool: 'whatsapp' });
    }

    return {
      agent: 'NutritionAgent',
      motherId,
      foodIdentified: foodKey,
      nutrients,
      riskFlags,
      analysis,
      alertSent: !!alertResult,
      steps,
      recommendation: riskFlags.includes('anemia_risk')
        ? 'Segera konsultasi dengan bidan. Konsumsi lebih banyak daun kelor dan ikan teri.'
        : `${foodKey} adalah pilihan baik. Lanjutkan pola makan bergizi.`
    };
  }
};

module.exports = nutritionAgent;
