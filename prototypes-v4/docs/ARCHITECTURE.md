# NutriSakti v3 — Architecture Diagram

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph Client["🌐 Client Layer (React)"]
        UI[Dashboard UI\n8 Panels]
        CTX[AppContext\ntheme + i18n]
        APIJS[api.js\nfetch wrapper]
    end

    subgraph CloudRun["☁️ Google Cloud Run (asia-southeast2)"]
        subgraph Container["Docker Container — port 8080"]
            EXPRESS[Express Server\nnode src/index.js]
            STATIC[Static File Server\nclient/build/]
            HEALTH[GET /healthz]

            subgraph API["REST API  /api/*"]
                ROUTES[routes/api.js]
            end

            subgraph Agents["Multi-Agent System"]
                GA[GuardianAgent\nOrchestrator]
                NA[NutritionAgent]
                LA[LogisticsAgent]
                HA[HealthAuditAgent]
            end

            subgraph MCP["MCP Tools"]
                T1[📅 calendar]
                T2[🗄️ database]
                T3[⛓️ blockchain]
                T4[💬 whatsapp]
            end

            subgraph DB["In-Memory Store"]
                D1[(mothers)]
                D2[(vaccinations)]
                D3[(kit_deliveries)]
                D4[(health_logs)]
                D5[(alerts)]
                D6[(agent_tasks)]
            end
        end
    end

    subgraph GCP["Google Cloud Platform"]
        GCB[Cloud Build\ncloudbuild.yaml]
        GCR[Container Registry\ngcr.io/PROJECT/nutrisakti-v3]
    end

    UI --> APIJS
    APIJS -->|HTTP fetch| EXPRESS
    EXPRESS --> STATIC
    EXPRESS --> HEALTH
    EXPRESS --> ROUTES
    ROUTES --> GA
    GA --> NA & LA & HA
    NA --> T2 & T4
    LA --> T3 & T2 & T4
    HA --> T2 & T3 & T1 & T4
    T2 --> D1 & D2 & D3 & D4 & D5 & D6
    T3 --> D3 & D6
    GCB --> GCR --> CloudRun
```

---

## 2. Multi-Agent Coordination

```mermaid
sequenceDiagram
    participant U as 👩 User
    participant GA as GuardianAgent
    participant NA as NutritionAgent
    participant LA as LogisticsAgent
    participant HA as HealthAuditAgent
    participant DB as MCP:database
    participant BC as MCP:blockchain
    participant CAL as MCP:calendar
    participant WA as MCP:whatsapp

    U->>GA: "I ate moringa but feel dizzy"
    GA->>GA: detectIntents() → [nutrition]
    GA->>GA: detectSymptoms() → [dizzy]
    GA->>DB: getMother(MTR001)
    DB-->>GA: mother context

    GA->>NA: analyzeFood(MTR001, "moringa", ["dizzy"])
    NA->>NA: identify food → daun kelor
    NA->>NA: detect risk → anemia_risk
    NA->>DB: saveNutritionLog()
    DB-->>NA: logId
    NA->>WA: sendAlert("midwife", "⚠️ ANEMIA RISK...", "high")
    WA-->>NA: alertId
    NA-->>GA: { riskFlags, recommendation }

    GA->>HA: auditMother(MTR001) [symptoms detected]
    HA->>DB: getMother(MTR001)
    HA->>BC: checkBPJS(MTR001)
    BC-->>HA: { covered: true }
    HA->>CAL: getUpcomingMilestones(MTR001)
    CAL-->>HA: { upcoming: [...] }
    HA-->>GA: { summary, risks, milestones }

    GA->>GA: composeResponse()
    GA->>DB: updateAgentTask(sessionId, output)
    GA-->>U: "✅ Nutrition logged. ⚠️ Anemia risk detected..."
```

---

## 3. Deployment Pipeline

```mermaid
flowchart LR
    subgraph Dev["💻 Developer (M1 Mac)"]
        CODE[Source Code]
        SUBMIT[gcloud builds submit]
    end

    subgraph CloudBuild["⚙️ Cloud Build"]
        B1[docker build\n--platform linux/amd64]
        B2[docker push\ngcr.io/PROJECT/nutrisakti-v3:SHA]
        B3[gcloud run deploy\nnurisakti-v3]
    end

    subgraph Registry["📦 Container Registry"]
        IMG[nutrisakti-v3:latest\nnurisakti-v3:SHORT_SHA]
    end

    subgraph CloudRunSvc["☁️ Cloud Run Service"]
        REV[New Revision\nlinux/amd64]
        PROBE[Startup Probe\nGET /healthz]
        TRAFFIC[100% Traffic]
    end

    CODE --> SUBMIT --> B1 --> B2 --> IMG
    B2 --> B3 --> REV --> PROBE
    PROBE -->|healthy| TRAFFIC
    PROBE -->|failed| ROLLBACK[Rollback to\nprevious revision]
```

---

## 4. Data Flow — Vaccination Calendar

```mermaid
flowchart LR
    subgraph Input["Input"]
        F1[status filter]
        F2[type filter]
        F3[puskesmas filter]
        F4[vaccine name search]
    end

    subgraph API["GET /api/vaccinations"]
        QP[Query params\nparsed]
        FE[Filter engine\ndb.getVaccinations]
    end

    subgraph Store["In-Memory Store"]
        VAC[(vaccinations\n13 records)]
        PKM[(puskesmas\n5 centers)]
        MOM[(mothers\n5 records)]
    end

    subgraph Output["Dashboard Output"]
        TABLE[Filtered table]
        STATS[Stats: total/given/planned]
        OD[Overdue highlights]
    end

    F1 & F2 & F3 & F4 --> QP --> FE
    FE --> VAC
    FE --> PKM
    FE --> MOM
    FE --> TABLE & STATS & OD
```

---

## 5. Container Internal Structure

```
/app
├── server/
│   ├── package.json
│   ├── node_modules/          ← installed at build time
│   └── src/
│       ├── index.js           ← Express entry, serves /app/client/build
│       ├── routes/
│       │   └── api.js         ← all REST endpoints
│       ├── agents/
│       │   ├── guardianAgent.js
│       │   ├── nutritionAgent.js
│       │   ├── logisticsAgent.js
│       │   └── healthAuditAgent.js
│       ├── tools/
│       │   └── mcpTools.js    ← calendar, database, blockchain, whatsapp
│       └── db/
│           └── database.js    ← in-memory store + mock data
└── client/
    └── build/                 ← React production build (copied from stage 1)
        ├── index.html
        └── static/
            └── js/main.*.js   ← 55KB gzipped
```

---

## 6. Technology Stack

```mermaid
graph TD
    subgraph Frontend
        R[React 18]
        CTX[React Context API]
        I18N[i18n.js\nEN + ID translations]
        THM[theme.js\ndark + light tokens]
    end

    subgraph Backend
        EX[Express 4]
        UUID[uuid v9]
        NODE[Node 18 Alpine]
    end

    subgraph Infrastructure
        CR[Google Cloud Run]
        CB[Google Cloud Build]
        GCR2[Google Container Registry]
        DOCKER[Docker\nlinux/amd64]
    end

    subgraph Simulated_Integrations
        POLY[Polygon Blockchain\nmock DID + USDC]
        WA2[WhatsApp Business API\nmock alerts]
        BPJS2[BPJS Verification Bridge\nmock status]
    end

    R --> EX
    CTX --> I18N & THM
    EX --> NODE
    NODE --> DOCKER --> CR
    CB --> GCR2 --> CR
    EX -.simulates.-> POLY & WA2 & BPJS2
```
