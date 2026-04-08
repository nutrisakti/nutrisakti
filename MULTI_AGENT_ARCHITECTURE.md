## 🏗️ The Multi-Agent Architecture for NutriSakti

Instead of just having 5 separate apps, your hackathon project will be the **"NutriSakti Brain"**—a primary agent that coordinates sub-agents to manage a mother's journey.

### 1. The Primary Agent: "The Guardian"
* **Role:** The orchestrator that interacts with the user (mother) via natural language.
* **Logic:** It uses the user's current phase (e.g., "Day 45 of Pregnancy") from the **Timeline Dashboard** to decide which sub-agent needs to act.

### 2. The Sub-Agents (Specialists)
* **Nutrition Agent:** Interfaces with the **Food Hack (AI Vision)**. When a mother says, "I'm eating Moringa today," this agent triggers the TensorFlow Lite scan, analyzes nutrient density, and generates the 30-second AI cooking video.
* **Logistics Agent:** Manages the **1-Click Kit Request** and **Hospital Inventory**. It checks the blockchain for eligibility and coordinates with the Hospital System to ensure stock is available before confirming a kit request.
* **Health Audit Agent:** Coordinates with the **Healthcare Provider Portal** and **Social Worker Tool**. It monitors BPJS status and triggers alerts to social workers if a mother is "uncovered" or misses a milestone.

---

## 🛠️ How to Adapt Your Files for the Hackathon

To meet the specific "Core Requirements" of your hackathon problem statement:

### A. Integrate Multiple Tools via MCP
Use the **Model Context Protocol (MCP)** to connect your existing prototypes:
* **Tool 1 (Calendar):** Connect the **Timeline Dashboard** milestones to a real-time calendar so the mother gets push notifications for checkups.
* **Tool 2 (Database):** Use your **WatermelonDB/PostgreSQL** setup as the "Structured Data" source the agent queries to remember a mother's health history.
* **Tool 3 (Blockchain):** Use an MCP server to query the **Polygon blockchain** for verified transaction history and USDC bounty balances.

### B. Multi-Step Workflow Example
**User Input:** *"I just took my vitamins, but I'm feeling dizzy. Also, I need my next nutrition kit."*
1.  **Step 1:** The **Primary Agent** logs the vitamin intake in the **Digital Health Book**.
2.  **Step 2:** It calls the **Health Agent**, which detects "dizziness" as a risk, checks the database for previous anemia records, and sends a WhatsApp alert via the **Tele-Consultation API** to a midwife.
3.  **Step 3:** It calls the **Logistics Agent**, which verifies the mother's DID on-chain and initiates the **USDC escrow** for a Nutrition Kit.
