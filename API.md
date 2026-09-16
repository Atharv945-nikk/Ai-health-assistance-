# API Specification: AI Healthcare Assistant

## 1. Gateway Conventions
- Base URL: `/api/v1`
- Content Type: `application/json` (unless `multipart/form-data` for file uploads or `text/event-stream` for chat stream)
- Authentication: Bearer JWT Token in `Authorization` header (`Authorization: Bearer <token>`)
- Correlation: Every request is annotated with `X-Request-Id` and `X-Response-Time`
- Standard Error Format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation",
    "details": []
  }
}
```

---

## 2. API Endpoints

### 2.1 Authentication (`/api/v1/auth`)
- `POST /register`: Create account (`email`, `password`, `full_name`, `language`)
- `POST /login`: Authenticate and obtain JWT (`email`, `password`)
- `POST /logout`: Invalidate session
- `POST /forgot-password`: Request password reset token
- `POST /reset-password`: Reset password with token
- `GET /me`: Get authenticated user profile & preferences
- `DELETE /account`: Permanently delete account and all associated health records (GDPR/HIPAA right to be forgotten)

### 2.2 Health Profile (`/api/v1/profile`)
- `GET /`: Retrieve user profile, metrics, allergies, conditions, medications
- `PUT /`: Update general demographics & lifestyle
- `POST /allergies`: Add allergy entry
- `DELETE /allergies/:id`: Remove allergy entry
- `POST /conditions`: Add medical condition
- `DELETE /conditions/:id`: Remove condition
- `POST /medications`: Add active medication
- `DELETE /medications/:id`: Remove medication

### 2.3 AI Health Chat (`/api/v1/chat`)
- `GET /conversations`: List user conversations (paginated, search query)
- `POST /conversations`: Create new conversation session
- `GET /conversations/:id`: Retrieve conversation message history
- `PATCH /conversations/:id`: Rename conversation
- `DELETE /conversations/:id`: Delete conversation and messages
- `POST /conversations/:id/messages`: Send user message; supports SSE streaming with query `?stream=true`
- `POST /conversations/:id/clear`: Clear messages in conversation

### 2.4 Symptom Checker & Urgency Triage (`/api/v1/symptoms`)
- `POST /analyze`: Submit structured symptom intake:
  - Input: `symptoms`, `duration`, `severity`, `additionalContext`, `includeProfileContext`
  - Runs deterministic emergency rule filter first.
  - Returns: `urgencyLevel`, `isEmergency`, `differentialPossibilities`, `supportingFactors`, `missingInformation`, `nextSteps`, `disclaimer`
- `POST /why-condition`: "Why this disease?" clinical rationale:
  - Input: `conditionName`, `symptoms`
  - Returns: Mechanism explanation, risk factors, confirmatory vs contradictory observations, non-diagnostic boundaries.

### 2.5 Medical Reports (`/api/v1/reports`)
- `POST /upload`: Multipart upload (PDF, PNG, JPG, DOCX). Validates MIME type, file size (<20MB), scans for prompt injection.
- `GET /`: List all uploaded user reports
- `GET /:id`: Get report metadata, processing state, extracted text, and AI summary
- `GET /:id/file`: Download/view original sanitized file (user-scoped access check)
- `POST /:id/ask`: Ask targeted questions about the specific report
- `DELETE /:id`: Delete report file, database record, and vector chunks

### 2.6 Medical Image Vision (`/api/v1/images`)
- `POST /upload-and-analyze`: Upload medical scan (X-ray, MRI, CT, skin lesion) + optional modality/body region
- `GET /`: List analyzed images
- `GET /:id`: Retrieve analysis, visual annotations, limitations, educational findings
- `DELETE /:id`: Delete image and analysis record

### 2.7 Medicine Information (`/api/v1/medicines`)
- `GET /search`: Search medicine database (`?q=paracetamol`)
- `GET /:name`: Detailed drug monograph (indications, mechanisms, typical side effects, contraindications, drug-drug interactions, official references)

### 2.8 Health Memory (`/api/v1/memory`)
- `GET /`: List user's active health memories (extracted clinical context)
- `DELETE /:id`: Delete a specific health memory
- `POST /clear`: Wipe all long-term health memories

### 2.9 RAG & Evidence (`/api/v1/rag`)
- `GET /sources`: List authoritative medical knowledge sources and update timestamps
- `POST /query`: Semantic search over medical literature with citations

### 2.10 Admin & Telemetry (`/api/v1/admin`) (Admin role required)
- `GET /health`: Detailed system health (DB, storage, AI provider status)
- `GET /metrics`: Latency, request counts, safety trigger counts
- `GET /audit-logs`: Audit trail logs
- `GET /rag-stats`: Indexed documents and chunk counts
