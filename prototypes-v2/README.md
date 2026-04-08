# NutriSakti v2 — Multi-Agent System

## Running

**Terminal 1 — API:**
```bash
cd agent-api && node src/index.js
# http://localhost:3001
```

**Terminal 2 — Dashboard:**
```bash
cd dashboard && npm start
# http://localhost:3000
```

## Architecture

```
GuardianAgent (Primary)
├── NutritionAgent  → food analysis, anemia detection
├── LogisticsAgent  → DID verify, USDC escrow, kit request
└── HealthAuditAgent → BPJS check, milestone scan, alerts

MCP Tools
├── calendar   → milestone scheduling
├── database   → in-memory health records
├── blockchain → Polygon DID + USDC mock
└── whatsapp   → tele-consultation alerts
```

## Demo Workflow

In Guardian Agent Chat, try:
- `"saya makan daun kelor tapi pusing"` → NutritionAgent + WhatsApp alert
- `"minta kit prenatal"` → LogisticsAgent + DID + USDC escrow
- `"cek status bpjs"` → HealthAuditAgent + blockchain check
- `"audit semua ibu"` → full scan of all mothers
