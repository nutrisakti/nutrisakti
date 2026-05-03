/**
 * Guardian Agent — Integration Tests
 *
 * Tests the full pipeline: intent detection → sub-agent routing → Gemini → response
 *
 * Run: node test/guardian.test.js
 * Requires: GEMINI_API_KEY in server/.env
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const guardianAgent = require('../src/agents/guardianAgent');
const { askGemini }  = require('../src/services/geminiService');

// ── Helpers ───────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

async function run(label, fn) {
  console.log(`\n📋 ${label}`);
  try {
    await fn();
  } catch (e) {
    console.error(`  💥 Exception: ${e.message}`);
    failed++;
  }
}

// ── Test cases ────────────────────────────────────────────────────────────────

async function testGeminiDirectCall() {
  await run('Gemini direct call — general knowledge question', async () => {
    const result = await askGemini({
      mother: {
        name: 'Ibu Fatimah Zahra', age: 32, phase: 'pregnancy',
        days_in_journey: 85, village: 'Ambon', region: 'Maluku',
        bpjs_status: 1, risk_level: 'medium',
      },
      userMessage: 'Cara mengatasi mual pagi?',
      history: [],
      agentResults: {},
    });

    assert(result.source === 'gemini',          'source is gemini (not fallback)', `got: ${result.source}, error: ${result.error}`);
    assert(!!result.model,                       'model name is returned',          `got: ${result.model}`);
    assert(typeof result.text === 'string',      'text is a string');
    assert(result.text.length > 100,             'text is substantive (>100 chars)', `got ${result.text?.length} chars`);
    assert(!result.text.includes('FOLLOWUP_JSON'), 'FOLLOWUP_JSON marker stripped from text');
    assert(Array.isArray(result.followUpQuestions), 'followUpQuestions is an array');
    assert(result.followUpQuestions.length >= 2,  'at least 2 follow-up questions returned', `got: ${JSON.stringify(result.followUpQuestions)}`);
    assert(result.followUpQuestions.every(q => typeof q === 'string' && q.length > 3), 'all follow-ups are non-empty strings');
    assert(!result.flagged,                      'response not safety-flagged');

    console.log(`  📝 Response preview: "${result.text.slice(0, 120)}..."`);
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testGeminiEnglishQuestion() {
  await run('Gemini — English question gets English follow-ups', async () => {
    const result = await askGemini({
      mother: { name: 'Ibu Siti', age: 28, phase: 'pregnancy', days_in_journey: 120, village: 'Kupang', region: 'NTT', bpjs_status: 1, risk_level: 'low' },
      userMessage: 'What foods are good for my baby during pregnancy?',
      history: [],
      agentResults: {},
    });

    assert(result.source === 'gemini',           'source is gemini');
    assert(result.text.length > 80,              'substantive response');
    assert(result.followUpQuestions.length >= 1, 'has follow-up questions');
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testGeneralIntentGoesToGemini() {
  await run('Guardian Agent — general intent routes to Gemini only (no sub-agents)', async () => {
    const result = await guardianAgent.process('MTR003', 'Cara mengatasi mual pagi?');

    assert(result.intentsDetected.includes('general'), 'intent is general', `got: ${result.intentsDetected}`);
    assert(result.gemini?.used === true,               'Gemini was used');
    assert(!!result.gemini?.model,                     'model name present', `got: ${result.gemini?.model}`);
    assert(typeof result.response === 'string',        'response is a string');
    assert(result.response.length > 100,               'response is substantive');
    assert(!result.response.includes('FOLLOWUP_JSON'), 'FOLLOWUP_JSON not in response');
    assert(Array.isArray(result.followUpQuestions),    'followUpQuestions is array');
    assert(result.followUpQuestions.length >= 2,       'at least 2 follow-ups', `got: ${JSON.stringify(result.followUpQuestions)}`);
    assert(result.cards.length === 0,                  'no cards for general intent');

    // Verify no sub-agents were called
    const subAgentActions = result.agentLog.filter(l => l.action === 'routing_to');
    assert(subAgentActions.length === 0,               'no sub-agents triggered', `triggered: ${subAgentActions.map(l=>l.subAgent).join(', ')}`);

    console.log(`  📝 Response: "${result.response.slice(0, 150)}..."`);
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testNutritionIntentWithFood() {
  await run('Guardian Agent — food logging intent triggers NutritionAgent', async () => {
    const result = await guardianAgent.process('MTR001', 'Saya makan daun kelor tadi pagi');

    assert(result.intentsDetected.includes('nutrition'), 'intent is nutrition', `got: ${result.intentsDetected}`);
    assert(result.gemini?.used === true,                 'Gemini still used for enrichment');
    assert(typeof result.response === 'string',          'response is a string');
    assert(result.response.length > 50,                  'response is substantive');

    const nutritionLog = result.agentLog.find(l => l.subAgent === 'NutritionAgent');
    assert(!!nutritionLog,                               'NutritionAgent was called');

    console.log(`  📝 Response: "${result.response.slice(0, 150)}..."`);
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testAppointmentIntentWithEmergency() {
  await run('Guardian Agent — emergency symptom triggers AppointmentAgent', async () => {
    const result = await guardianAgent.process('MTR002', 'bayi saya demam tinggi tidak mau menyusu');

    assert(result.intentsDetected.includes('appointment'), 'intent is appointment', `got: ${result.intentsDetected}`);
    assert(result.gemini?.used === true,                   'Gemini still used');

    const apptLog = result.agentLog.find(l => l.subAgent === 'AppointmentAgent');
    assert(!!apptLog,                                      'AppointmentAgent was called');
    assert(result.results?.appointment?.success === true,  'appointment was booked');
    assert(result.results?.appointment?.urgency === 'emergency', 'urgency is emergency', `got: ${result.results?.appointment?.urgency}`);

    const apptCard = result.cards.find(c => c.type === 'appointment');
    assert(!!apptCard,                                     'appointment card generated');
    assert(!!apptCard?.mapsUrl,                            'appointment card has maps URL');

    console.log(`  🏥 Urgency: ${result.results?.appointment?.urgency}`);
    console.log(`  📍 Address: ${apptCard?.address}`);
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testReminderIntent() {
  await run('Guardian Agent — reminder intent returns vaccination schedule', async () => {
    const result = await guardianAgent.process('MTR002', 'tampilkan jadwal vaksinasi saya');

    assert(result.intentsDetected.includes('reminder'), 'intent is reminder', `got: ${result.intentsDetected}`);
    assert(result.gemini?.used === true,                'Gemini used');
    assert(result.results?.reminder?.success === true,  'reminder lookup succeeded');

    const calCard = result.cards.find(c => c.type === 'calendar');
    assert(!!calCard,                                   'calendar card generated');
    assert(calCard?.reminders?.length > 0,              'calendar card has reminders');

    console.log(`  📅 Reminders: ${result.results?.reminder?.reminders?.length}`);
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testShopIntent() {
  await run('Guardian Agent — shop intent returns product cards', async () => {
    const result = await guardianAgent.process('MTR001', 'beli susu ibu hamil');

    assert(result.intentsDetected.includes('shop'), 'intent is shop', `got: ${result.intentsDetected}`);
    assert(result.gemini?.used === true,             'Gemini used');

    const productCard = result.cards.find(c => c.type === 'products');
    assert(!!productCard,                            'products card generated');
    assert(productCard?.products?.length > 0,        'products card has items');

    console.log(`  🛍️ Products: ${productCard?.products?.length}`);
    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testFollowUpQuestionsAreContextual() {
  await run('Gemini — follow-up questions are contextual (not generic)', async () => {
    const result = await askGemini({
      mother: { name: 'Ibu Dewi', age: 25, phase: 'toddler', days_in_journey: 680, village: 'Mataram', region: 'NTB', bpjs_status: 1, risk_level: 'low' },
      userMessage: 'Kapan sebaiknya mulai MPASI?',
      history: [],
      agentResults: {},
    });

    assert(result.source === 'gemini',            'source is gemini');
    assert(result.followUpQuestions.length >= 2,  'has follow-ups');

    // Follow-ups should be about MPASI/feeding, not generic greetings
    const allText = result.followUpQuestions.join(' ').toLowerCase();
    const isContextual = allText.includes('mpasi') || allText.includes('makan') ||
                         allText.includes('food') || allText.includes('buah') ||
                         allText.includes('sayur') || allText.includes('porsi') ||
                         allText.includes('usia') || allText.includes('bayi');
    assert(isContextual, 'follow-ups are contextual to MPASI topic', `got: ${JSON.stringify(result.followUpQuestions)}`);

    console.log(`  💬 Follow-ups: ${JSON.stringify(result.followUpQuestions)}`);
  });
}

async function testConversationHistory() {
  await run('Gemini — conversation history maintains context', async () => {
    // First turn
    const r1 = await askGemini({
      mother: { name: 'Ibu Siti', age: 28, phase: 'pregnancy', days_in_journey: 120, village: 'Kupang', region: 'NTT', bpjs_status: 1, risk_level: 'low' },
      userMessage: 'Apa manfaat daun kelor untuk ibu hamil?',
      history: [],
      agentResults: {},
    });

    assert(r1.source === 'gemini', 'first turn: source is gemini');

    // Second turn with history
    const history = [
      { role: 'user',  parts: [{ text: 'Apa manfaat daun kelor untuk ibu hamil?' }] },
      { role: 'model', parts: [{ text: r1.text }] },
    ];

    const r2 = await askGemini({
      mother: { name: 'Ibu Siti', age: 28, phase: 'pregnancy', days_in_journey: 120, village: 'Kupang', region: 'NTT', bpjs_status: 1, risk_level: 'low' },
      userMessage: 'Berapa banyak yang boleh dikonsumsi per hari?',
      history,
      agentResults: {},
    });

    assert(r2.source === 'gemini',  'second turn: source is gemini');
    assert(r2.text.length > 50,     'second turn has substantive response');
    // Response should reference kelor since it's in history context
    const mentionsKelor = r2.text.toLowerCase().includes('kelor') || r2.text.toLowerCase().includes('moringa') || r2.text.toLowerCase().includes('porsi');
    assert(mentionsKelor, 'second turn references prior context (kelor/porsi)', `response: "${r2.text.slice(0,200)}"`);

    console.log(`  💬 Turn 2 follow-ups: ${JSON.stringify(r2.followUpQuestions)}`);
  });
}

// ── Run all tests ─────────────────────────────────────────────────────────────
(async () => {
  console.log('🧪 NutriSakti Guardian Agent — Integration Tests');
  console.log('='.repeat(55));
  console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'SET (' + process.env.GEMINI_API_KEY.slice(0,12) + '...)' : '❌ NOT SET'}`);

  await testGeminiDirectCall();
  await testGeminiEnglishQuestion();
  await testGeneralIntentGoesToGemini();
  await testNutritionIntentWithFood();
  await testAppointmentIntentWithEmergency();
  await testReminderIntent();
  await testShopIntent();
  await testFollowUpQuestionsAreContextual();
  await testConversationHistory();

  console.log('\n' + '='.repeat(55));
  console.log(`✅ Passed: ${passed}  ❌ Failed: ${failed}  Total: ${passed + failed}`);
  process.exit(failed > 0 ? 1 : 0);
})();
