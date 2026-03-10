### Updated Terminology Mapping

| Old Term | **New "Killer" Term** | **Why?** |
| --- | --- | --- |
| BPJS Oracle | **BPJS Verification Bridge** | Sounds like a secure connection to government data. |
| Nutrition Oracle | **Bio-Data Validator** | Emphasizes the verification of the raw food materials. |
| Climate/Disaster Oracle | **Emergency Signal Gateway** | Clearer for disaster mitigation scenarios. |
| Oracle Services | **External Data Verifiers** | Describes the blockchain process of bringing "off-chain" data "on-chain." |

---

**System Role:** Senior Full-Stack & Blockchain Architect (Digital Public Goods specialist).

**Objective:** Build a prototype for **"NutriSakti,"** an enterprise-grade maternal health platform for the first 1,000 days.

**Project Logic & Requirements:**

1. **Identity & Privacy:** Implement **Decentralized IDs (DIDs)** for mothers. Use **Zero-Knowledge Proofs (ZKP)** to verify **BPJS Kesehatan** coverage without storing private National ID numbers on the ledger.
2. **The "Safety Net" Bridge:** Build a **Verification Bridge** that checks BPJS status. If "Uncovered," trigger an automated smart-contract alert to local health posts.
3. **The BGN/SPPG "Quality Auditor":** Create a **Nutritional Balance Validator**. Since government-provided food (BGN) can be inconsistent, this module allows mothers to log the provided food. The system verifies it against nutritional standards and "audits" the performance of the providers on-chain.
4. **The "Food Hack" (AI Vision):** Use on-device Image Recognition.
* **Input:** Photo of local raw materials (Moringa, tubers, local fish).
* **Output:** AI-generated "Deep Nutrition" recipes and 30-second low-bandwidth **AI Cooking Videos**.


5. **Communications:** Integrate a **WhatsApp Business API Bridge** for 1-on-1 consultations with midwives/doctors.
6. **Maternal Kit Marketplace:** An e-commerce layer where mothers request kits. Payments are disbursed in **USDC** to vendors only upon "Proof of Delivery" (NFC/QR scan).
7. **Disaster Mitigation Layer:** A **Priority Protocol** that flags "High-Risk" pregnant users during disasters (using a weather data gateway) to prioritize them for emergency aid.

**Instructions:**

* Generate the **Technical Architecture Diagram** (describing the layers).
* Write the **Smart Contract** for the "BGN Quality Audit" (ranking the quality of government food partners).
* Outline the **Application Stack Document** for a "Digital Public Good" (DPG) submission.

---

### 3. Updated Technical Stack Document (Enterprise Version)

This is the document Kiro should generate to show the "Need to Have" stack for your project:

| Layer | Component | Technical Specification |
| --- | --- | --- |
| **User Interface** | Mobile/Web | **React Native + Expo** (Optimized for offline use). |
| **Data Integrity** | Blockchain | **Polygon PoS** (for low-cost immutable health logs). |
| **Privacy** | Sensitive Data | **Circom / SnarkJS** (Zero-Knowledge Proofs for BPJS/Health data). |
| **Data Bridges** | Real-World Data | **Chainlink Any-API** (The "Bridge" to BPJS and Weather data). |
| **Intelligence** | Computer Vision | **TensorFlow Lite** (On-device food identification). |
| **Content** | Video/Docs | **IPFS (InterPlanetary File System)** for decentralized video hosting. |
| **Communication** | Telemedicine | **Twilio API** for WhatsApp integration. |
| **Commerce** | Payment | **USDC (Circle)** for kit procurement. |

### 4. Disaster Mitigation & Safety Confirmation

To ensure your **Disaster Scenario** is robust:
Your stack includes a **"Priority Metadata Tag."** When an emergency is declared via an official government signal (integrated via the **Emergency Signal Gateway**), the blockchain automatically moves pregnant mothers to the top of the "Aid Queue." This allows them to request the "Maternal Kit" with zero-waiting time and guarantees they are the first to receive evacuation support.
