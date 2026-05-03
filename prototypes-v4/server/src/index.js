require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const apiRoutes = require('./routes/api');

const app  = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

// ── Build metadata (injected at Docker build time or set at startup) ──────────
const BUILD_INFO = {
  version:     '4.0.0',
  buildTime:   process.env.BUILD_TIME    || new Date().toISOString(),
  gitCommit:   process.env.GIT_COMMIT    || 'local',
  nodeVersion: process.version,
  environment: process.env.NODE_ENV      || 'development',
};

app.use(cors());
app.use(express.json());

// ── Health check — Cloud Run probes this ──────────────────────────────────────
app.get('/healthz', (req, res) => res.json({ status: 'ok', port: PORT }));

// ── Version / diagnostics endpoint ───────────────────────────────────────────
app.get('/api/version', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  res.json({
    server: {
      ...BUILD_INFO,
      uptime:       Math.round(process.uptime()),
      uptimeHuman:  formatUptime(process.uptime()),
      memoryMB:     Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    services: {
      gemini: {
        configured: !!geminiKey,
        keyPrefix:  geminiKey ? geminiKey.slice(0, 8) + '...' : null,
        models:     ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'],
      },
      agents: [
        'GuardianAgent', 'NutritionAgent', 'LogisticsAgent',
        'HealthAuditAgent', 'AppointmentAgent', 'ReminderAgent', 'ShopAgent',
      ],
      mcpTools: ['calendar', 'database', 'blockchain', 'whatsapp', 'gemini'],
      features: [
        'chat_with_gemini', 'rich_cards', 'follow_up_questions',
        'gemini_intent_analysis', 'appointment_booking', 'vaccination_reminders',
        'shop_ecommerce', 'qris_payment', 'kit_delivery_tracking',
        'bi_analytics_dashboard',
      ],
    },
    checks: {
      geminiApiKey:    !!geminiKey,
      dotenvLoaded:    !!process.env.GEMINI_API_KEY,
      clientBuildPath: path.join(__dirname, '../../client/build'),
    },
  });
});

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);
app.use('/api/analytics', require('./routes/analytics'));

// ── Serve React build (production) ───────────────────────────────────────────
const clientBuild = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 NutriSakti v4 — ${BUILD_INFO.environment}`);
  console.log(`   Port:    ${PORT}`);
  console.log(`   Build:   ${BUILD_INFO.buildTime}`);
  console.log(`   Commit:  ${BUILD_INFO.gitCommit}`);
  console.log(`   Node:    ${BUILD_INFO.nodeVersion}`);
  console.log(`   Gemini:  ${process.env.GEMINI_API_KEY ? '✅ API key loaded (' + process.env.GEMINI_API_KEY.slice(0,8) + '...)' : '❌ GEMINI_API_KEY not set'}`);
  console.log(`   Agents:  GuardianAgent → 6 sub-agents`);
  console.log(`   Version: GET /api/version\n`);
});
