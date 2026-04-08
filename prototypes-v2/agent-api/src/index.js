const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'NutriSakti Multi-Agent API v2',
    agents: ['GuardianAgent', 'NutritionAgent', 'LogisticsAgent', 'HealthAuditAgent'],
    mcpTools: ['calendar', 'database', 'blockchain', 'whatsapp'],
    endpoints: {
      chat:       'POST /api/agent/chat',
      mothers:    'GET  /api/mothers',
      audit:      'GET  /api/audit',
      kitRequest: 'POST /api/kit/request',
      alerts:     'GET  /api/alerts',
      sessions:   'GET  /api/sessions',
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 NutriSakti Agent API running on http://localhost:${PORT}`);
  console.log(`\n📡 Agents: GuardianAgent → [NutritionAgent, LogisticsAgent, HealthAuditAgent]`);
  console.log(`🛠️  MCP Tools: calendar, database, blockchain, whatsapp\n`);
});
