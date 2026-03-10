### 1. For the Mothers (The "Guardian" Interface)

**Objective:** High accessibility, offline-first health tracking, and "Food Hacking."

> **Prompt for Kiro:** > "Develop the **User Persona: Mother** module.
> * **UI/UX:** Design a 'First 1,000 Days' timeline dashboard (Pregnancy to 2-year-old).
> * **Feature 1 (Food Hack):** Build the Camera Interface for raw material recognition (TensorFlow Lite). When a photo is taken, show a 'Nutrient Density' card and a button to 'Generate AI Cooking Video.'
> * **Feature 2 (Kit Request):** Create a 1-click 'Request Maternal-Baby Kit' button. Behind the scenes, check the DID (Decentralized ID) for eligibility and trigger a request to the Marketplace.
> * **Feature 3 (Health Book):** Build an offline-first immunization and check-up log. Use **NFC Card Emulation** so a mother can 'tap' her phone at a Posyandu to update her records on-chain."
> 
> 

### 2. For the Midwives & Doctors (The "Verifiable Care" Portal)

**Objective:** Verification of health milestones and direct communication.

> **Prompt for Kiro:** > "Develop the **User Persona: Healthcare Provider** module.
> * **Verification Dashboard:** A list of assigned mothers in their region. When a midwife performs a vaccination or check-up, implement a 'Sign with Private Key' function to record the milestone on the blockchain.
> * **BPJS Bridge:** A tool to scan a mother's QR code and instantly check their **BPJS Verification Bridge** status. If 'Uncovered,' show a red alert with a 'Help Enroll' workflow.
> * **Tele-Consultation:** Integrate the **WhatsApp Business API Bridge** so providers can receive automated alerts if a mother’s 'Food Hack' logs indicate high risk (e.g., severe anemia signs during pregnancy)."
> 
> 

### 3. For Social Workers (The "Last-Mile" Audit Tool)

**Objective:** Independent audit of BGN (National Nutrition) food and emergency response.

> **Prompt for Kiro:** > "Develop the **User Persona: Social Worker** module.
> * **Quality Audit Tool:** A module to verify the nutrition quality of food delivered by BGN partners (SPPG). Social workers take a photo of the distributed food and log 'Quality Points.' This data is sent to the **BGN Quality Auditor Smart Contract** to rank providers.
> * **Emergency Signal Gateway:** In 'Disaster Mode,' show a map of 'High-Priority Mothers' (flagged via ZKP) who need immediate evacuation or nutrition kits.
> * **Incentive Layer:** Implement a 'Bounty Wallet' where social workers receive **USDC** rewards for successfully verifying a kit delivery in remote areas."
> 
> 

### 4. For Government & NGOs (The "Impact Dashboard")

**Objective:** High-level data visualization, anti-corruption, and fund allocation.

> **Prompt for Kiro:** > "Develop the **User Persona: Strategic Dashboard** for Government/NGOs.
> * **On-Chain Audit Trail:** Build a real-time visualization map of Eastern Indonesia showing:
> 1. Stunting risk clusters (based on aggregated, anonymized health data).
> 2. Distribution efficiency of Maternal Kits (Proof of Delivery vs. Funds Released).
> 3. BPJS Coverage rates by village.
> 
> 
> * **Fund Management:** An interface to deposit **USDC** into the 'Stunting-Free Bounty' pool. Show the 'Social Return on Investment' (SROI) by calculating kits delivered versus stunting markers reduced."
> 
> 

### 5. For Hospitals & Puskesmas (The "Supply Chain & Data" Hub)

**Objective:** Medical supply inventory and official health records.

> **Prompt for Kiro:** > "Develop the **User Persona: Clinical Facility** module.
> * **Inventory Management:** A ledger for 'Maternal-Baby Kits' currently in stock. When a kit is given to a mother, the 'Proof of Delivery' scan must automatically update the hospital's stock and notify the NGO/Government for replenishment.
> * **Medical Record Sync:** Build a secure bridge to sync the 'Digital Health Book' from the mother’s phone to the hospital’s internal records using **Zero-Knowledge Proofs** to maintain patient confidentiality while ensuring the doctor has the correct history."
> 
> 

---

### **Technical Outcome: The NutriSakti Ecosystem**

By building these 5 modules, the outcome is a **closed-loop accountability system**:

1. **The Mother** gets food and protection.
2. **The Midwife** gets a digital, tamper-proof record of her work.
3. **The Social Worker** ensures the government food (BGN) is actually healthy.
4. **The Government** gets 100% transparency on where their money goes.
5. **The Hospital** ensures the medical supply chain never breaks.
