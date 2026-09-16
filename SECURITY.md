# Security Policy & Safeguards

## 1. Principles
- **Least Privilege & Role-Based Access Control (RBAC)**: Patients access only their own records; Administrators access only system telemetry and configuration.
- **Tenant Isolation**: Every database query on sensitive records (profiles, reports, images, conversations, memories) includes `WHERE user_id = :authenticated_user_id`.
- **Zero Hardcoded Credentials**: All secrets, JWT keys, and API tokens are dynamically loaded from environment variables.

---

## 2. Attack Surface Defenses

| Threat Vector | Defense Mechanism | Implementation |
|---|---|---|
| **Cross-User Data Leakage** | IDOR protection & foreign key scoping | Controller & Service-layer ownership validation |
| **SQL Injection** | Prepared statements & parameterized queries | `better-sqlite3` prepared statements / ORM query builder |
| **Cross-Site Scripting (XSS)** | Input sanitization & Content Security Policy | DOMPurify on frontend markdown, Helmet headers on backend |
| **Cross-Site Request Forgery (CSRF)** | Strict SameSite cookies / Bearer Authorization | JWT Authorization headers, CORS whitelisting |
| **Denial of Service (DoS)** | IP & User-based Rate Limiting | `express-rate-limit` (100 req/min general, 15 req/min AI endpoints) |
| **Malicious File Uploads** | Extension, MIME type, and magic bytes check | `multer` filter, sandboxed upload dir, random UUID filename |
| **Prompt Injection** | Strict trust boundary enclosure | Data-only tag wrapping `<untrusted_report_data>` + heuristic regex |

---

## 3. Data Protection & Privacy Rights
- **Right to Erasure (GDPR / HIPAA)**: Single endpoint `DELETE /api/v1/auth/account` cascades deletion to:
  - User profile, health profile, allergies, conditions, medications
  - Conversations, messages, symptom assessments
  - Uploaded medical report files from disk, report database records, and vector chunks
  - Medical image files from disk and vision records
  - Extracted health memories
  - Audit logs are anonymized (`user_id` set to null or hashed).
- **Individual Memory Deletion**: Users can review and selectively purge individual extracted memories via the UI or API.
