const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run uses 8080

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Serve React build (production)
const clientBuild = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NutriSakti v3 running on port ${PORT}`);
  console.log(`Agents: GuardianAgent → [NutritionAgent, LogisticsAgent, HealthAuditAgent]`);
  console.log(`MCP Tools: calendar, database, blockchain, whatsapp`);
});
