# NutriSakti v3 — Wireframes / Mock Diagrams

> ASCII wireframes for all 8 dashboard panels + mobile chat view.

---

## Global Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (230px)          │  TOPBAR                                  │
│  ┌─────────────────────┐  │  ┌──────────────────────────────────┐   │
│  │ NutriSakti          │  │  │ [Panel Title]   🔴2 Critical     │   │
│  │ Multi-Agent v3      │  │  │                 API:8080  5 Moms │   │
│  ├─────────────────────┤  │  └──────────────────────────────────┘   │
│  │ 📊 Overview         │  │                                          │
│  │ 🤖 Guardian Agent   │  │  CONTENT AREA                           │
│  │ 👩 Mothers          │  │  (scrollable)                           │
│  │ 💉 Vaccination Cal  │  │                                          │
│  │ 📦 Kit Delivery     │  │                                          │
│  │ 🔍 Health Audit     │  │                                          │
│  │ 🛒 Kit Requests     │  │                                          │
│  │ 📋 Agent Sessions   │  │                                          │
│  ├─────────────────────┤  │                                          │
│  │ SETTINGS            │  │                                          │
│  │ Language: 🇬🇧 EN    │  │                                          │
│  │ Theme:   🌙 Dark    │  │                                          │
│  ├─────────────────────┤  │                                          │
│  │ MCP Tools           │  │                                          │
│  │ 🛠 calendar         │  │                                          │
│  │ 🛠 database         │  │                                          │
│  │ 🛠 blockchain       │  │                                          │
│  │ 🛠 whatsapp         │  │                                          │
│  └─────────────────────┘  │                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Panel 1 — Overview

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  TOTAL MOTHERS   │  │   HIGH RISK      │  │    NO BPJS       │
│                  │  │                  │  │                  │
│       5          │  │       2          │  │       2          │
│  Registered      │  │  Needs attention │  │  Not registered  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  🤰 PREGNANT     │  │  👶 INFANT       │  │  🧒 TODDLER      │
│       3          │  │       1          │  │       1          │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔔 ACTIVE ALERTS (3)                                           │
│  ┌──────────┬────────────┬──────────────────────────────────┐  │
│  │ [high]   │ midwife    │ ⚠️ ANEMIA RISK: MTR001 ...       │  │
│  │ [high]   │ social_wkr │ 🚨 BPJS TIDAK AKTIF: MTR002 ... │  │
│  │ [info]   │ ngo        │ 📦 Kit prenatal diminta ...      │  │
│  └──────────┴────────────┴──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Panel 2 — Guardian Agent Chat

```
┌──────────────────────────────────────────┐  ┌─────────────────────┐
│  Mother: [Ibu Siti Aminah ▼] [GuardianAgent] │  │  Agent Execution Log│
├──────────────────────────────────────────┤  ├─────────────────────┤
│                                          │  │ Session: a3f2b1...  │
│  🤖 Guardian Agent                       │  │ Intents: nutrition  │
│  ┌────────────────────────────────────┐  │  ├─────────────────────┤
│  │ Hello! I am the NutriSakti         │  │  │[GuardianAgent]      │
│  │ Guardian Agent.                    │  │  │ session_started     │
│  │ Try typing:                        │  │  ├─────────────────────┤
│  │ • "I ate moringa but feel dizzy"   │  │  │[GuardianAgent]      │
│  │ • "request prenatal kit"           │  │  │ intents_detected    │
│  └────────────────────────────────────┘  │  ├─────────────────────┤
│                                          │  │[GuardianAgent]      │
│                    ┌──────────────────┐  │  │ routing_to          │
│                    │ I ate moringa    │  │  │ → NutritionAgent    │
│                    │ but feel dizzy   │  │  ├─────────────────────┤
│                    └──────────────────┘  │  │[NutritionAgent]     │
│                                          │  │ 🛠 database         │
│  🤖 Guardian Agent                       │  ├─────────────────────┤
│  ┌────────────────────────────────────┐  │  │[NutritionAgent]     │
│  │ ✅ Nutrition log saved.            │  │  │ 🛠 whatsapp         │
│  │ ⚠️ Anemia risk detected.           │  │  ├─────────────────────┤
│  │ Midwife notified via WhatsApp.     │  │  │[HealthAuditAgent]   │
│  └────────────────────────────────────┘  │  │ 🛠 calendar         │
│                                          │  └─────────────────────┘
├──────────────────────────────────────────┤
│  [Type a message...              ] [Send]│
└──────────────────────────────────────────┘
```

---

## Panel 3 — Mothers List

```
┌─────────────────────────────────────────────────────────────────────┐
│  MOTHERS LIST (5)                                                   │
├──────────┬─────┬──────────┬──────┬──────────┬──────┬───────┬──────┤
│  NAME    │ AGE │ PHASE    │ DAYS │ REGION   │ BPJS │ RISK  │ ACT  │
├──────────┼─────┼──────────┼──────┼──────────┼──────┼───────┼──────┤
│ Ibu Siti │ 28  │ 🤰 Preg  │ 120  │ Kupang   │[✅]  │[low]  │[Det]│
│ MTR001   │ yrs │          │      │ NTT      │      │       │      │
├──────────┼─────┼──────────┼──────┼──────────┼──────┼───────┼──────┤
│ Ibu Maria│ 24  │ 👶 Infant│ 350  │ Jayapura │[❌]  │[HIGH] │[Det]│
│ MTR002   │ yrs │          │      │ Papua    │      │       │      │
├──────────┼─────┼──────────┼──────┼──────────┼──────┼───────┼──────┤
│ Ibu Fati │ 32  │ 🤰 Preg  │  85  │ Ambon    │[✅]  │[med]  │[Det]│
│ MTR003   │ yrs │          │      │ Maluku   │      │       │      │
├──────────┼─────┼──────────┼──────┼──────────┼──────┼───────┼──────┤
│ Ibu Dewi │ 25  │ 🧒 Todd  │ 680  │ Mataram  │[✅]  │[low]  │[Det]│
│ MTR004   │ yrs │          │      │ NTB      │      │       │      │
├──────────┼─────┼──────────┼──────┼──────────┼──────┼───────┼──────┤
│ Ibu Nur  │ 29  │ 🤰 Preg  │ 200  │ Ende     │[❌]  │[HIGH] │[Det]│
│ MTR005   │ yrs │          │      │ NTT      │      │       │      │
└──────────┴─────┴──────────┴──────┴──────────┴──────┴───────┴──────┘
```

---

## Panel 4 — Vaccination Calendar

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  TOTAL       │  │  ✅ GIVEN    │  │  📅 PLANNED  │
│     13       │  │      8       │  │      5       │
└──────────────┘  └──────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FILTER VACCINATION CALENDAR                                    │
│                                                                 │
│  Status:  [All] [✅ Given] [📅 Planned]                        │
│                                                                 │
│  Type:    [All] [💉 Mandatory] [🔄 Booster] [🤰 Prenatal]     │
│                                                                 │
│  Center:  [All Health Centers              ▼]                  │
│                                                                 │
│  Vaccine: [Search vaccine...    ]   [↺ Reset]                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  VACCINATION SCHEDULE (13 entries)                              │
├──────────┬──────────────┬──────────┬──────────┬────────┬───────┤
│  MOTHER  │  VACCINE     │  TYPE    │  STATUS  │  DATE  │CENTER │
├──────────┼──────────────┼──────────┼──────────┼────────┼───────┤
│ Ibu Siti │ TT Hamil 1   │[prenatal]│[✅ Given]│Mar 15  │PKM001 │
│ Ibu Siti │ TT Hamil 2   │[prenatal]│[📅 Plan] │Apr 23  │PKM001 │
│ Ibu Maria│ Hepatitis B  │[wajib]   │[✅ Given]│Apr 20  │PKM003 │
│ Ibu Maria│ Campak/MR    │[wajib]   │[📅 Plan] │Apr 18  │PKM003 │
│          │              │          │[⚠️ LATE] │        │       │
│ Ibu Dewi │ DPT Lanjutan │[lanjutan]│[📅 Plan] │Apr 13  │PKM005 │
└──────────┴──────────────┴──────────┴──────────┴────────┴───────┘
  ████ Overdue rows highlighted in red
```

---

## Panel 5 — Kit Delivery Tracking

```
┌──────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│TOTAL │  │✅DELIVERED│  │🚚TRANSIT │  │📋ORDERED │  │❌ FAILED │
│  6   │  │    2     │  │    1     │  │    2     │  │    1     │
└──────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘

  Delivery Success Rate                              33%
  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

┌─────────────────────────────────────────────────────────────────┐
│  FILTER DELIVERY TRACKING                                       │
│  Status: [All][📋Ordered][🚚Transit][✅Delivered][❌Failed]    │
│  Kit:    [All][🤰Prenatal][🏥Delivery][👶Newborn][🥗Nutrition] │
│  Center: [All Health Centers                    ▼]             │
└─────────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬────────────┬────────┬────────┬──────┬──────┐
│  MOTHER  │  KIT     │  STATUS    │ORDERED │RECEIVED│ DAYS │PROOF │
├──────────┼──────────┼────────────┼────────┼────────┼──────┼──────┤
│ Ibu Siti │[prenatal]│[✅Delivered]│Mar 10  │Mar 15  │  5d  │0xab..│
│ Ibu Maria│[newborn] │[🚚Transit] │Apr 03  │  —     │  —   │  —   │
│ Ibu Fati │[prenatal]│[📋Ordered] │Apr 07  │  —     │  —   │  —   │
│ Ibu Dewi │[nutrition│[✅Delivered]│Feb 08  │Feb 13  │  5d  │0xde..│
│ Ibu Nur  │[prenatal]│[❌Failed]  │Mar 24  │  —     │  —   │  —   │
└──────────┴──────────┴────────────┴────────┴────────┴──────┴──────┘
  ████ Failed rows highlighted in red
```

---

## Panel 6 — Health Audit

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ TOTAL MOTHERS│  │  HIGH RISK   │  │   NO BPJS    │
│      5       │  │      2       │  │      2       │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────────────────────────────────────────────┐  ┌──────────────────┐
│  AUDIT ALL MOTHERS (HealthAuditAgent)                │  │  AUDIT DETAIL    │
├────────┬────────┬──────┬──────┬──────┬──────┬───────┤  ├──────────────────┤
│ NAME   │ REGION │PHASE │ BPJS │ RISK │ATTN? │ACTION │  │ Ibu Maria Goreti │
├────────┼────────┼──────┼──────┼──────┼──────┼───────┤  │                  │
│IbuSiti │ NTT    │ preg │[✅]  │[low] │[✅No]│[Audit]│  │ BPJS: [❌ Tidak] │
│IbuMaria│ Papua  │infant│[❌]  │[HIGH]│[⚠️Ya]│[Audit]│  │                  │
│IbuFati │ Maluku │ preg │[✅]  │[med] │[⚠️Ya]│[Audit]│  │ Risks:           │
│IbuDewi │ NTB    │ todd │[✅]  │[low] │[✅No]│[Audit]│  │ [bpjs_uncovered] │
│IbuNur  │ NTT    │ preg │[❌]  │[HIGH]│[⚠️Ya]│[Audit]│  │ [high_risk_mother│
└────────┴────────┴──────┴──────┴──────┴──────┴───────┘  │                  │
                                                           │ Upcoming:        │
                                                           │ Campak/MR        │
                                                           │ 10 days (Day 360)│
                                                           │                  │
                                                           │ [Close]          │
                                                           └──────────────────┘
```

---

## Panel 7 — Kit Requests

```
┌──────────────────────────────────────┐  ┌──────────────────────┐
│  🛒 REQUEST NEW KIT (LogisticsAgent) │  │  📊 KIT STATISTICS   │
│                                      │  │                      │
│  Mother: [Ibu Siti Aminah       ▼]  │  │         3            │
│                                      │  │   Total requests     │
│  Kit:    [Prenatal Care Kit ($25)▼] │  │                      │
│                                      │  │  USDC Total: $75     │
│  [📦 Request Kit (DID + USDC Escrow)]│  └──────────────────────┘
│                                      │
│  ┌──────────────────────────────┐   │
│  │ ✅ Kit prenatal requested!   │   │
│  │ TX: 0x2f7d3b7dc8c908...     │   │
│  │ USDC Escrowed: $25           │   │
│  │ DID Verified: ✅             │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  KIT REQUEST HISTORY                                            │
├──────────┬──────────┬────────────┬──────┬─────┬────────────────┤
│  MOTHER  │  KIT     │  STATUS    │ USDC │ DID │  TIME          │
├──────────┼──────────┼────────────┼──────┼─────┼────────────────┤
│ Ibu Siti │ prenatal │[escrowed]  │ $25  │ ✅  │ 10:32:15       │
│ Ibu Maria│ newborn  │[escrowed]  │ $20  │ ✅  │ 10:28:44       │
│ Ibu Fati │ prenatal │[escrowed]  │ $25  │ ✅  │ 10:15:02       │
└──────────┴──────────┴────────────┴──────┴─────┴────────────────┘
```

---

## Panel 8 — Agent Sessions

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENT SESSION HISTORY (3)                                      │
├─────────────────────────────────────────────────────────────────┤
│  [GuardianAgent] I ate moringa but feel dizzy          [▼]     │
│                  [completed]  10:32:15        [Expand]         │
├─────────────────────────────────────────────────────────────────┤
│  [GuardianAgent] request prenatal kit                  [▼]     │
│                  [completed]  10:28:44        [Expand]         │
├─────────────────────────────────────────────────────────────────┤
│  [GuardianAgent] audit all mothers                     [▼]     │
│                  [completed]  10:15:02        [Expand]         │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ {                                                         │ │
│  │   "response": "📊 Audit done: 5 mothers, 2 high risk...",│ │
│  │   "results": {                                            │ │
│  │     "auditAll": { "totalMothers": 5, "highRisk": 2 }     │ │
│  │   }                                                       │ │
│  │ }                                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Settings (Sidebar Bottom)

```
┌─────────────────────────┐
│  SETTINGS               │
│                         │
│  Language               │
│  ┌─────────────────┐    │
│  │  🇬🇧 EN  ◄──── │    │  ← toggle
│  └─────────────────┘    │
│                         │
│  Theme                  │
│  ┌─────────────────┐    │
│  │  🌙 Dark  ◄──── │    │  ← toggle
│  └─────────────────┘    │
│                         │
│  ─────────────────────  │
│  MCP Tools              │
│  🛠 calendar            │
│  🛠 database            │
│  🛠 blockchain          │
│  🛠 whatsapp            │
└─────────────────────────┘
```
