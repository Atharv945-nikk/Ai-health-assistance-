# AI HealthCare Assistant — Multimodal, Personalized, RAG-Powered Health Assistance Platform

[![Node.js Version](https://img.shields.io/badge/node-v24.x-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-SQLite%20WAL%20(Node%2024%20Native)-blue.svg)](https://nodejs.org/api/sqlite.html)
[![AI Architecture](https://img.shields.io/badge/AI-Dual--RAG%20%7C%20Vision%20%7C%20Emergency%20Triaging-teal.svg)](#ai--safety-architecture)
[![Test Coverage](https://img.shields.io/badge/tests-48%20passing%20(100%25)-success.svg)](#automated-testing)
[![Languages](https://img.shields.io/badge/languages-English%20%7C%20Hindi%20%7C%20Marathi-orange.svg)](#multilingual-support)

A clinical-grade, production-ready AI healthcare platform engineered for personalized patient education, deterministic emergency triage, lab report ingestion, multimodal medical imaging interpretation, and privacy-preserving multi-tenant retrieval-augmented generation (RAG).

---

## 🌟 Key Capabilities

### 1. 🛡️ Deterministic Emergency Triage (Pre-LLM Safety Overrides)
- **Zero Hallucination Emergency Detection:** Red-flag clinical crises (acute cardiac infarction, ischemic stroke via FAST protocol, anaphylactic airway compromise, respiratory stridor, and psychiatric crisis) are identified through deterministic regex rules **before** inputs reach any generative model.
- **Urgency Classification:** Automatically categorizes symptom complaints into 5 defined clinical urgency levels (Level 1: Routine self-care, Level 2: Non-urgent clinic visit, Level 3: Same-day clinic, Level 4: Immediate Urgent Care/ER, Level 5: Red-Flag Emergency Override).
- **Direct Emergency Routing:** Displays prominent one-touch calling for **911** (US/Canada), **112** (EU/India/Global), and **988** (Suicide & Crisis Lifeline).

### 2. 💬 Multi-Turn Health Consultation with SSE Streaming & Citations
- **Real-Time Streaming:** Server-Sent Events (`?stream=true`) provide low-latency token streaming to the browser.
- **Authoritative Grounding:** Every clinical response includes formal citations with source organization, year, and direct evidence extracts (e.g., *World Health Organization (WHO)*, *American Heart Association (AHA/ACC)*, *American Diabetes Association (ADA)*, *Centers for Disease Control and Prevention (CDC)*).
- **Long-Term Memory Synthesis:** Automatically detects and indexes patient chronic conditions, known drug allergies, and clinical preferences into an explainable, auditable memory ledger.

### 3. 📄 Medical Report Ingestion & Private RAG Engine
- **Multi-Format Extraction:** Ingests clinical lab reports, blood panels, and discharge summaries in PDF and plain text.
- **Biomarker Parsing:** Scans and tabulates standard blood metrics (Fasting Glucose, HbA1c, Total Cholesterol, HDL, LDL, Triglycerides, Hemoglobin, Creatinine) against physiological reference ranges with High / Normal / Low indicators.
- **Report Q&A:** Allows natural-language querying grounded strictly in the patient's uploaded documents.

### 4. 🔬 Multimodal Medical Scan Vision Pipeline
- **Modality Support:** Accommodates Chest & Bone X-Rays, Brain & Spine MRIs, CT Scans, Dermatology lesion photographs, and Ultrasound sonography.
- **Clinical Structuring:** Outputs detailed anatomical observations, potential abnormalities, uncertainty/confidence bounds, and explicit radiological limitations (e.g., image artifacting, resolution constraints, inability to substitute for biopsy).

### 5. 💊 Searchable Pharmacopeia Monographs
- Comprehensive directory of common prescription and OTC medications (e.g., Amoxicillin, Paracetamol/Acetaminophen, Metformin, Atorvastatin, Lisinopril, Omeprazole).
- Provides active mechanism of action, typical indications, common vs. serious adverse reactions, drug-drug interactions, and clear "When to contact a physician" directives.

### 6. 🔒 Enterprise Security & Multi-Tenant Isolation
- **Tenant Isolation:** Enforced via strict SQL query parameterization (`WHERE user_id = ?`). Tested against Insecure Direct Object References (IDOR).
- **Prompt Injection Defense:** Untrusted report texts are sanitized and encapsulated inside non-executable `<untrusted_report_data>` delimiters.
- **Right to Erasure (GDPR/HIPAA):** Granular deletion of individual health memories, single report/image removals, and complete 1-click account and data erasure.

### 7. 🌐 Multilingual Accessibility
- Full native interface and clinical vocabulary localization in **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.

---

## 🏗️ Architectural Topology

```
[ Frontend (React 18 + Vite + Tailwind + Lucide) ]
                      │  REST / SSE Stream
                      ▼
[ Backend Engine (Node.js 24 + Express 5 + TypeScript) ]
   ├── Authentication & RBAC (JWT + PBKDF2/bcrypt)
   ├── Security Layer (Rate-Limiter, Helmet, CORS, Sanitizer)
   ├── Deterministic Emergency Rule Engine (Pre-LLM Bypass)
   ├── Multi-Provider AI Engine (Gemini 1.5 Pro/Flash + Heuristic Fallback)
   ├── Dual-RAG Embeddings Engine (Global Authoritative + Private Reports)
   └── Immutable Security Audit Ledger
                      │  Atomic WAL Queries
                      ▼
[ SQLite Database (Built-in Node 24 'node:sqlite' DatabaseSync) ]
   ├── 17 Relational Tables (Users, Profiles, Reports, Images, Memory, etc.)
   └── Vector Document Store (Float32Array Embeddings with Hybrid Search)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v24.x` or higher (utilizes native `node:sqlite` DatabaseSync module).
- **npm**: `v10.x` or higher.

### 1. Clone & Configure Environment
```bash
# Clone the repository
git clone <repo-url>
cd "AI Healthcare Assistant"

# Create .env from template
cp .env.example .env
```

Review `.env` variables:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
CORS_ORIGIN=http://localhost:5173

# AI Provider ("gemini" or "heuristic")
AI_PROVIDER=heuristic
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
*(Note: When `AI_PROVIDER=heuristic`, the system functions completely offline without any third-party API keys, delivering verified deterministic responses).*

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Run Database Migrations & Seeds
```bash
npm run db:migrate
npm run db:seed
```
This prepares the SQLite database at `backend/data/healthcare.db` and provisions seed users and authoritative clinical reference guidelines.

#### Seed Demo Credentials:
- **Patient Account:** `patient@demo.local` / `Patient123!`
- **Administrator Account:** `admin@healthcare.local` / `AdminSecure2026!`

### 4. Run Development Servers
In separate terminals:
```bash
# Terminal 1: Start Backend (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 5173)
npm run dev:frontend
```
Open `http://localhost:5173` in your browser.

### 5. Production Build
```bash
# Compiles both backend TypeScript and frontend Vite distribution bundles
npm run build
```

---

## 🧪 Automated Testing

The automated test suite runs comprehensive end-to-end integration and security assertions across 6 categories:
1. **Deterministic Clinical Emergency Rules:** Cardiac, FAST stroke, acute anaphylaxis, psychiatric crisis hotline.
2. **AI Safety & Prompt Injection Guardrails:** Jailbreak detection, system prompt leakage, untrusted boundary containment.
3. **Authentication & Identity:** Password hashing, duplicate email handling, JWT session lifecycle.
4. **Multi-Tenant Data Isolation (IDOR):** Tenant cross-boundary chat, report, and memory access restrictions.
5. **Symptom Assessment & "Why This Disease?" Reasoning:** Differential diagnosis, biological etiology, limitations.
6. **RAG Evidence & Pharmacopeia Retrieval:** Authoritative vector retrieval, drug monographs.

```bash
npm test
```

### Verified Test Results:
```text
================================================================
 TEST SUMMARY SCORECARD:
 Total Passed: 48
 Total Failed: 0
 Success Rate: 100.0%
================================================================
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── emergencyRules.ts        # Deterministic emergency triage
│   │   │   ├── promptInjectionGuard.ts  # Prompt injection firewall
│   │   │   ├── ragService.ts            # Dual RAG hybrid vector search
│   │   │   └── providers/               # Gemini & heuristic AI providers
│   │   ├── config/                      # Environment schema validation
│   │   ├── database/                    # Node:sqlite connection & migrations
│   │   ├── middlewares/                 # Auth, RBAC, error handlers
│   │   ├── routes/                      # Express route endpoints
│   │   ├── services/                    # Business logic & data access
│   │   └── types/                       # TypeScript interfaces
│   ├── test/
│   │   └── runTests.ts                  # Comprehensive automated test runner
│   └── data/                            # SQLite database store (WAL mode)
├── frontend/
│   ├── src/
│   │   ├── api/                         # Typed API client with fetch/SSE
│   │   ├── components/                  # Navbar, Sidebar, Footer, Disclaimers
│   │   ├── context/                     # Auth & multilingual context
│   │   ├── i18n/                        # English, Hindi, Marathi translations
│   │   ├── pages/                       # 14 Full clinical & administrative pages
│   │   └── types/                       # Frontend TypeScript types
├── ARCHITECTURE.md                      # Detailed technical architecture
├── AI_SAFETY.md                         # Safety guidelines & red-flag specs
├── DATABASE.md                          # Schema, 17 tables, indexes & relations
├── API.md                               # REST API specifications & schemas
├── RAG.md                               # Embeddings & retrieval design
├── SECURITY.md                          # HIPAA, GDPR, IDOR & auth controls
└── TESTING.md                           # Verification methodology & coverage
```

---

## ⚖️ Clinical Disclaimer

**IMPORTANT:** The AI Healthcare Assistant is strictly an educational and informational aid. It does **not** provide definitive medical diagnoses, dispense medical advice, or replace direct consultation with a qualified physician or healthcare provider. In the event of a medical crisis, contact your local emergency services (911 / 112) immediately.
