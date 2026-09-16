# Architecture Specification: AI Healthcare Assistant

## 1. System Overview

The **AI Healthcare Assistant** is an enterprise-grade, multimodal, personalized, RAG-powered healthcare guidance and educational platform. It is engineered with a strict **Safety-First, Evidence-Backed, Privacy-Preserving** architecture.

```
+-------------------------------------------------------------------------+
|                               FRONTEND                                  |
|         React + Vite + Tailwind CSS + Lucide + i18n (EN/HI/MR)          |
|  - Dashboard      - AI Health Chat        - Symptom & Urgency Triage   |
|  - Reports Vault  - Medical Image Vision   - Medicine Information       |
|  - Health Profile - Health Memory Manager - Admin & Observability       |
+-------------------------------------------------------------------------+
                                   |  HTTPS / SSE / REST
                                   v
+-------------------------------------------------------------------------+
|                             API GATEWAY                                 |
|  - Helmet Security Headers   - CORS Policy       - Rate Limiting        |
|  - Request ID Tracing        - Input Sanitizer   - Auth Middleware (JWT)|
+-------------------------------------------------------------------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v                                                   v
+------------------------------------+  +---------------------------------+
|          CORE DOMAIN ENGINE        |  |         AI & SAFETY LAYER       |
| - Authentication & RBAC Service    |  | - Deterministic Emergency Engine|
| - Patient Health Profile Service   |  | - Prompt Injection Guardrail    |
| - Symptom & Urgency Assessor       |  | - Multi-Provider AI Abstraction |
| - Document & Report Processing     |  |   (Gemini, OpenAI, Heuristic)   |
| - Medical Image Analysis Pipeline  |  | - Dual RAG Engine               |
| - Pharmacopeia & Medicine Service  |  |   (Global Medical + User Docs)  |
| - Health Context & Memory Engine   |  | - Citation & Provenance Verifier|
| - Multilingual Translation Broker  |  | - Audit & Safety Incident Logger|
+------------------------------------+  +---------------------------------+
         |                                                   |
         +-------------------------+-------------------------+
                                   |
                                   v
+-------------------------------------------------------------------------+
|                          PERSISTENCE & STORAGE                          |
| - Relational DB: SQLite (WAL, Foreign Keys) / PostgreSQL Compatible    |
| - Vector Index: HNSW / Cosine Vector Space + FTS5 Full-Text Search      |
| - File Storage: Sandboxed Private Storage with Content-Type Verification|
+-------------------------------------------------------------------------+
```

---

## 2. Layered Architecture Principles

### 2.1 Separation of Concerns
1. **Presentation Layer (`frontend/`)**: Pure UI components, localized rendering, streaming event handlers, responsive layout, accessible forms.
2. **Transport & Gateway (`backend/src/routes`, `middlewares`)**: Validation via schema, auth guards, rate limiters, error boundaries.
3. **Application Services (`backend/src/services`)**: Business rules, triage logic, report extraction, memory scoping.
4. **AI & RAG Subsystem (`backend/src/ai`)**: Safety filters, prompt assembly, vector embeddings, provider fallbacks.
5. **Data Access Layer (`backend/src/database`)**: Repositories, migrations, transaction boundaries.

---

## 3. Core Subsystems

### 3.1 Deterministic Emergency & Triage Rule Engine
**Principle:** Machine learning models must NEVER override clinical safety imperatives.
- User input is parsed against high-risk deterministic emergency rules (e.g., chest pain with arm/jaw radiation, acute dyspnea, sudden neurological deficit, severe uncontrolled hemorrhage).
- If an emergency condition is matched, an immediate Level 5 (Emergency) triage response is triggered with immediate emergency dispatch advice, bypassing non-essential AI dialogue.

### 3.2 Dual RAG (Retrieval-Augmented Generation) Architecture
- **Global Medical Knowledge Base**: Ingests authoritative clinical guidelines (WHO, MedlinePlus, CDC, NIH, PubMed Central). Pre-indexed with embedding vectors, provenance metadata, publish dates, and evidence levels.
- **Private User Document Knowledge Base**: User-uploaded medical reports (lab results, discharge summaries, imaging reports) are partitioned strictly by `user_id`. One user can NEVER query or retrieve another user's chunks.
- **Hybrid Retrieval**: Combines dense semantic vector retrieval (Cosine Similarity) with sparse lexical search (FTS5 BM25) for high precision across clinical terminologies.

### 3.3 Multimodal Vision Pipeline
- Validates medical images (X-ray, MRI, CT, dermatology, scans).
- Inspects metadata and runs preprocessing.
- Vision model extracts anatomical region, visual features, and potential abnormal findings.
- Calculates an educational confidence score and attaches non-diagnostic disclaimers reminding the user that AI analysis is educational and does not constitute a formal radiological reading.

### 3.4 Multi-Provider AI Abstraction
- Standard interfaces: `LLMProvider`, `EmbeddingProvider`, `VisionProvider`.
- Default adapter: Google Gemini API / OpenAI API.
- Offline heuristic fallback provider: Built-in deterministic clinical logic provider that enables full offline functionality, unit testing, and continuous integration without requiring live API keys.

---

## 4. Ruflo v3.5 Enterprise Swarm Orchestration

The project utilizes Ruflo v3.5 Enterprise orchestration with a `hierarchical-mesh` topology:
- **Coordinator Agent**: Oversees architectural compliance and task delegation.
- **Specialist Agents**: Frontend, Backend, Database, AI/RAG, Security, Healthcare Safety, and QA.
- **Shared Memory**: Captures verified implementation patterns and test assertions in `.swarm/memory.db`.
