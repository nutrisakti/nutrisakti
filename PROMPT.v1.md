### Part 1: The Prompt for Kiro (Technical Implementation)

**System Role:** You are a Senior Full-Stack Engineer and Blockchain Architect specializing in Digital Public Goods (DPGs).

**Objective:** Build a high-fidelity prototype for **"NutriSakti,"** an enterprise-grade maternal health platform for the UNICEF Venture Fund. The app must serve pregnant mothers and babies in the First 1,000 Days, specifically in low-connectivity regions like Eastern Indonesia.

**Core Technical Requirements:**

1. **Frontend:** React Native (Cross-platform) with an **Offline-First** architecture (Redux Persist / WatermelonDB) for data syncing in 2G areas.
2. **Blockchain Layer (Web3):** - Integrate an Ethereum Layer 2 (Polygon/Arbitrum) for low gas fees.
* Implement **Zero-Knowledge Proofs (ZKP)** using SnarkJS or Circom to verify BPJS (National Health Insurance) status and medical records without exposing PII (Personally Identifiable Information).


3. **AI Integration:** - A TensorFlow Lite model for on-device image recognition of raw local foodstuffs (e.g., Moringa, local tubers).
* Generative AI API (via OpenAI/Gemini) to convert recognized food into nutritional recipes and trigger AI-rendered cooking video templates.


4. **Integration Layer:** - **BPJS Oracle:** Create a mock API bridge to verify insurance status.
* **WhatsApp Business API:** Integration for midwife/doctor consultations.
* **Payment Gateway:** Smart contract-based disbursement using **USDC** for the Maternal-Baby Kit marketplace.


5. **Disaster Priority Protocol:** Implement a metadata flag in the decentralized ID (DID) that prioritizes users for aid during emergency/disaster triggers.

**Instruction:** - Initialize the project structure.

* Generate the Smart Contract code for the "Impact Bounty" system (USDC disbursement).
* Create the UI flow for the "Visual Nutrition Hack" (Camera -> AI Recognition -> Recipe).
* Provide a detailed **Technical Stack Document** for the entire ecosystem.

---

### Part 2: The Technical Stack Document

Kiro should output a document similar to the one below. This is what you will attach to your UNICEF application to prove the "Robustness" of your project.

#### **Project NutriSakti: Enterprise Technical Stack**

| Layer | Component | Technology | Why This Choice? |
| --- | --- | --- | --- |
| **Mobile App** | Framework | **React Native** | High performance with shared codebase for iOS/Android. |
| **Data Privacy** | Privacy Layer | **ZKP (Zero-Knowledge Proofs)** | Ensures "Social Protection" data is verifiable but private. |
| **Blockchain** | Network | **Polygon / Arbitrum** | Scalable, low-cost transactions for "Real-time reconciliation." |
| **Decentralized ID** | Identity | **W3C DID Standards** | Gives mothers ownership of their own health data. |
| **Backend / API** | Logic | **Node.js (NestJS)** | Enterprise-grade, scalable, and modular. |
| **Database** | Persistence | **PostgreSQL (Local) + IPFS** | IPFS stores AI videos; local DB handles offline records. |
| **AI / ML** | Vision | **TensorFlow Lite (Edge)** | Allows "Food Hacking" without needing a data connection. |
| **Oracles** | Data Feeds | **Chainlink Any-API** | Connects BPJS government data to the blockchain ledger. |
| **Messaging** | Support | **Twilio / WhatsApp API** | Uses the most familiar interface for local communities. |
| **Payments** | Settlement | **USDC (Circle)** | Avoids volatility; ensures 0% aid diversion to local vendors. |

### Part 3: Disaster Mitigation & High-Sensitivity Logic

To address your requirement for **Disaster Mitigation**:
The application stack includes a **"Circuit Breaker"** in the Smart Contracts. In the event of a documented natural disaster (verified via a Climate Oracle), the system automatically elevates the "Priority Status" of pregnant mothers in that geo-location, unlocking emergency USDC funds for "Maternal-Baby Kits" without waiting for traditional bureaucratic approval.
