# NutriSakti v3 — Cloud Run Deployment

Single container: Express API + React frontend on port 8080.

## Structure

```
prototypes-v3/
├── server/          Express API + multi-agent system
│   └── src/
│       ├── agents/  GuardianAgent, NutritionAgent, LogisticsAgent, HealthAuditAgent
│       ├── tools/   MCP tools: calendar, database, blockchain, whatsapp
│       ├── db/      In-memory store (mock data, 5 Indonesian mothers)
│       └── routes/  REST API endpoints
├── client/          React dashboard (built → served by Express)
├── Dockerfile       Multi-stage build
├── cloudbuild.yaml  Cloud Build CI/CD pipeline
└── deploy.sh        Manual deploy script
```

## Run Locally

```bash
# Option 1: Node directly (uses pre-built client)
node server/src/index.js
# → http://localhost:8080

# Option 2: Docker
docker build -t nutrisakti_v3 .
docker run -p 8080:8080 nutrisakti_v3
# → http://localhost:8080
```

## Deploy to Google Cloud Run

### Prerequisites
```bash
gcloud auth login
gcloud config set project leo-ai-agent-491912
gcloud auth configure-docker
```

### Deploy (one command)
```bash
./deploy.sh leo-ai-agent-491912
```

### Or via Cloud Build (CI/CD)
```bash
gcloud builds submit --config cloudbuild.yaml --project leo-ai-agent-491912
```

### Manual gcloud deploy
```bash
# Build & push
docker build -t gcr.io/leo-ai-agent-491912/nutrisakti_v3 .
docker push gcr.io/leo-ai-agent-491912/nutrisakti_v3

# Deploy
gcloud run deploy nutrisakti_v3 \
  --image gcr.io/leo-ai-agent-491912/nutrisakti_v3 \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/agent/chat | Guardian Agent — main multi-step workflow |
| GET | /api/mothers | All 5 Indonesian mothers |
| GET | /api/audit | HealthAuditAgent scan all |
| GET | /api/audit/:id | Audit single mother |
| POST | /api/kit/request | LogisticsAgent — DID + USDC escrow |
| GET | /api/kit-requests | All kit requests |
| GET | /api/alerts | Active WhatsApp alerts |
| GET | /api/sessions | Agent session history |
| GET | /api/calendar/:id | Upcoming milestones |
| GET | /api/blockchain/bpjs/:id | BPJS status |

## Demo Scenarios (Guardian Agent Chat)

```
"saya makan daun kelor tapi pusing"
→ NutritionAgent detects anemia risk → WhatsApp alert to midwife

"minta kit prenatal"
→ LogisticsAgent: DID verify → USDC escrow → NGO notified

"cek status bpjs"
→ HealthAuditAgent: blockchain check → calendar milestones

"audit semua ibu"
→ HealthAuditAgent: scans all 5 mothers → flags high-risk
```

## Mock Data

5 Indonesian mothers across Eastern Indonesia:
- Ibu Siti Aminah — NTT, Hamil, BPJS Aktif, Risiko Rendah
- Ibu Maria Goreti — Papua, Bayi, **Tanpa BPJS**, **Risiko Tinggi**
- Ibu Fatimah Zahra — Maluku, Hamil, BPJS Aktif, Risiko Sedang
- Ibu Dewi Kartika — NTB, Balita, BPJS Aktif, Risiko Rendah
- Ibu Nur Halimah — NTT, Hamil, **Tanpa BPJS**, **Risiko Tinggi**
