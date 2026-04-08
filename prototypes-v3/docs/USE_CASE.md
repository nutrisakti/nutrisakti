# NutriSakti v3 — Use Case Diagram

## System Actors & Use Cases

```mermaid
graph TB
    subgraph Actors
        M([👩 Mother])
        MW([👩‍⚕️ Midwife])
        SW([🦺 Social Worker])
        NGO([🏛️ NGO / Government])
        PKM([🏥 Puskesmas Staff])
        SYS([⚙️ System / Agent])
    end

    subgraph NutriSakti_v3["NutriSakti v3 System"]
        UC1[Chat with Guardian Agent]
        UC2[Log food intake]
        UC3[Request maternal kit]
        UC4[Check BPJS status]
        UC5[View 1000-day timeline]
        UC6[Record vaccination]
        UC7[View vaccination calendar]
        UC8[Filter vaccinations\nby type / status / center]
        UC9[Track kit delivery]
        UC10[Run health audit]
        UC11[Receive WhatsApp alert]
        UC12[Manage kit inventory]
        UC13[View impact dashboard]
        UC14[Escrow USDC for kit]
        UC15[Verify DID on-chain]
    end

    M --> UC1
    M --> UC2
    M --> UC3
    M --> UC4
    M --> UC5

    PKM --> UC6
    PKM --> UC7
    PKM --> UC8

    MW --> UC10
    MW --> UC11
    MW --> UC7

    SW --> UC10
    SW --> UC11
    SW --> UC9

    NGO --> UC13
    NGO --> UC9
    NGO --> UC12

    SYS --> UC11
    SYS --> UC14
    SYS --> UC15

    UC1 -.includes.-> UC2
    UC1 -.includes.-> UC3
    UC1 -.includes.-> UC4
    UC3 -.includes.-> UC14
    UC3 -.includes.-> UC15
    UC10 -.includes.-> UC11
```

## Detailed Use Cases per Actor

```mermaid
graph LR
    subgraph Mother["👩 Mother"]
        M1[Chat in natural language]
        M2[Log food & symptoms]
        M3[Request prenatal kit]
        M4[View vaccination schedule]
        M5[Track kit delivery]
    end

    subgraph Midwife["👩‍⚕️ Midwife / Doctor"]
        MW1[Receive anemia alerts]
        MW2[View assigned mothers]
        MW3[Record health milestone]
        MW4[Check BPJS coverage]
    end

    subgraph SocialWorker["🦺 Social Worker"]
        SW1[Receive high-risk alerts]
        SW2[Audit mother health status]
        SW3[Verify kit delivery]
        SW4[Report uncovered BPJS]
    end

    subgraph Government["🏛️ NGO / Government"]
        G1[View delivery success rate]
        G2[Monitor USDC escrow pool]
        G3[Track stunting risk regions]
        G4[Receive NGO kit notifications]
    end

    subgraph PuskesmasStaff["🏥 Puskesmas Staff"]
        P1[Record vaccination given]
        P2[Filter vaccination calendar]
        P3[View overdue vaccinations]
        P4[Search by vaccine type]
    end

    subgraph GuardianAgent["🤖 Guardian Agent"]
        GA1[Detect intent from input]
        GA2[Route to sub-agents]
        GA3[Compose unified response]
        GA4[Log session trace]
    end

    M1 --> GA1
    GA1 --> GA2
    GA2 --> GA3
    GA3 --> GA4
```

## Use Case Descriptions

| ID | Actor | Use Case | Pre-condition | Post-condition |
|----|-------|----------|---------------|----------------|
| UC1 | Mother | Chat with Guardian Agent | Mother selected | Agent response + log |
| UC2 | Mother | Log food intake | Message contains food name | Nutrition saved, risk checked |
| UC3 | Mother | Request maternal kit | DID exists | USDC escrowed, NGO notified |
| UC4 | Mother | Check BPJS status | Mother ID valid | BPJS status returned |
| UC5 | Mother | View 1000-day timeline | Mother registered | Milestones displayed |
| UC6 | Puskesmas | Record vaccination | Mother + vaccine selected | Record saved |
| UC7 | Puskesmas / Midwife | View vaccination calendar | — | Filtered list shown |
| UC8 | Puskesmas | Filter vaccinations | Calendar open | Filtered results |
| UC9 | Social Worker / NGO | Track kit delivery | — | Delivery status shown |
| UC10 | Midwife / Social Worker | Run health audit | Mother ID | Risks + alerts triggered |
| UC11 | Midwife / Social Worker | Receive WhatsApp alert | Risk detected | Alert logged |
| UC12 | NGO | Manage kit inventory | — | Stock levels visible |
| UC13 | NGO / Government | View impact dashboard | — | Stats + delivery rate |
| UC14 | System | Escrow USDC | DID verified | TX hash generated |
| UC15 | System | Verify DID on-chain | Mother ID | Verified / rejected |
