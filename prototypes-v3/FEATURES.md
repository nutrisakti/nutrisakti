# NutriSakti v3 — Feature List

---

## Multi-Agent System

### Primary Agent — GuardianAgent
- Natural language intent detection (nutrition, kit, health, audit)
- Symptom detection (dizziness, weakness, nausea)
- Routes to sub-agents based on context
- Composes unified response from all sub-agent results
- Logs every session with full execution trace

### Sub-Agent — NutritionAgent
- Identifies 6 Indonesian local foods (Daun Kelor, Singkong, Ubi Jalar, Ikan Teri, Kacang Hijau, Telur Kampung)
- Analyzes protein, iron, calcium, vitamins per food
- Detects anemia risk from reported symptoms
- Flags low iron / low protein conditions
- Triggers WhatsApp alert to midwife if anemia risk detected

### Sub-Agent — LogisticsAgent
- DID (Decentralized Identity) verification via blockchain tool
- BPJS eligibility check before kit release
- USDC escrow simulation for kit payment
- Notifies NGO coordinator via WhatsApp on kit request
- Logs transaction hash to database

### Sub-Agent — HealthAuditAgent
- Full health history fetch per mother
- BPJS on-chain status check
- Upcoming milestone calculation from calendar tool
- Risk assessment: `bpjs_uncovered`, `high_risk_mother`, `no_recent_visits`
- Sends WhatsApp alerts to social workers and midwives
- Bulk scan of all mothers with attention flags

---

## MCP Tools (4)

| Tool | Description |
|------|-------------|
| `calendar` | Milestone scheduling across 1000-day journey, overdue detection |
| `database` | In-memory health records, nutrition logs, kit requests, alerts |
| `blockchain` | DID verification, BPJS status, USDC escrow, TX hash generation |
| `whatsapp` | Alert routing to midwife, social worker, NGO coordinator |

---

## Dashboard Panels (8)

### 1. Overview
- Total mothers, high-risk count, no-BPJS count
- Phase breakdown (Pregnant / Infant / Toddler)
- Live active alerts feed with severity badges

### 2. Guardian Agent Chat
- Natural language chat interface
- Mother selector dropdown
- Real-time agent execution log panel (agent name, MCP tool called, execution order)
- Session ID, duration ms, and detected intents displayed

### 3. Mothers List
- Full table of all registered mothers
- Columns: name, age, phase, days in journey, region, BPJS status, risk level
- Click row to open audit detail

### 4. Vaccination Calendar
- 13 mock vaccination records across 5 mothers
- Multi-filter:
  - Status: Given / Planned
  - Vaccine type: Mandatory / Booster / Prenatal
  - Health center dropdown
  - Vaccine name search box
- Overdue row highlighting (planned date passed)
- Stats: total scheduled, given, planned

### 5. Kit Delivery Tracking
- 6 mock deliveries with full lifecycle (Ordered → Dispatched → Delivered / Failed)
- Multi-filter:
  - Delivery status: Ordered / In Transit / Delivered / Failed
  - Kit type: Prenatal / Delivery / Newborn / Nutrition
  - Health center dropdown
- Delivery success rate progress bar
- Days-to-deliver column (green ≤3 days, yellow ≤7, red >7)
- On-chain proof hash display per delivery

### 6. Health Audit
- Bulk scan of all mothers with risk flags and attention indicators
- Per-mother deep audit: BPJS status, upcoming milestones, risk list
- Triggers live WhatsApp alerts during audit run

### 7. Kit Requests
- Request any of 4 kit types via LogisticsAgent
- Shows DID verification result, USDC escrowed amount, TX hash
- Full request history table

### 8. Agent Sessions
- History of all Guardian Agent sessions
- Expandable JSON output per session showing full agent result

---

## UI / UX

- **Language toggle** — English (default) / Bahasa Indonesia, persisted to `localStorage`
- **Dark / Light mode** — Dark default, full theme switch, persisted to `localStorage`
- Theme tokens cover: background, surface, border, text, input, row highlight, overdue row
- Responsive inline styles — no external CSS library dependency

---

## Infrastructure

| Item | Detail |
|------|--------|
| Container | Single Docker image — Express API + React build on port 8080 |
| Dockerfile | Multi-stage build, `--platform=linux/amd64` for Cloud Run |
| CI/CD | `cloudbuild.yaml` — Google Cloud Build pipeline |
| Manual deploy | `deploy.sh YOUR_PROJECT_ID` |
| Upload size | `.gcloudignore` excludes node_modules (~5 MB vs 160 MB) |
| Health check | `GET /healthz` endpoint for Cloud Run startup probe |
| Region | `asia-southeast2` (Jakarta) |

---

## Mock Data

| Data | Count | Detail |
|------|-------|--------|
| Mothers | 5 | NTT, Papua, Maluku, NTB — mix of risk levels and BPJS status |
| Puskesmas | 5 | One per region, mapped to each mother |
| Vaccination records | 13 | Taken + planned, all vaccine types |
| Kit deliveries | 6 | All statuses represented (delivered, in transit, ordered, failed) |
| Local foods | 6 | Full nutritional data (protein, iron, calcium, vitamins) |
| Kit types | 4 | Prenatal ($25), Delivery ($35), Newborn ($20), Nutrition ($15) USDC |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/agent/chat` | Guardian Agent — main multi-step workflow |
| `GET` | `/api/mothers` | All mothers |
| `GET` | `/api/mothers/:id` | Single mother with health logs |
| `GET` | `/api/vaccinations` | Vaccination records (supports `?status=&type=&puskesmas=&vaccine_name=`) |
| `POST` | `/api/vaccinations` | Record a new vaccination |
| `GET` | `/api/kit-deliveries` | Delivery tracking (supports `?status=&kit_type=&puskesmas=`) |
| `GET` | `/api/kit-deliveries/stats` | Delivery summary stats |
| `POST` | `/api/kit/request` | LogisticsAgent — DID verify + USDC escrow |
| `GET` | `/api/kit-requests` | All kit requests |
| `GET` | `/api/audit` | HealthAuditAgent — scan all mothers |
| `GET` | `/api/audit/:id` | Audit single mother |
| `GET` | `/api/alerts` | Active WhatsApp alerts |
| `GET` | `/api/sessions` | Agent session history |
| `GET` | `/api/calendar/:id` | Upcoming milestones for a mother |
| `GET` | `/api/blockchain/bpjs/:id` | BPJS status check |
| `GET` | `/api/blockchain/did/:id` | DID verification |
| `GET` | `/api/puskesmas` | All health centers |
| `GET` | `/api/vaccine-schedule` | Master vaccination schedule |
| `GET` | `/healthz` | Health check for Cloud Run |
