# RAG (Retrieval-Augmented Generation) Architecture

## 1. Dual-Corpus Philosophy
The application strictly enforces **Logical and Physical Partitioning** between two distinct knowledge corpora:

```
+------------------------------------+      +------------------------------------+
|    GLOBAL MEDICAL KNOWLEDGE BASE   |      |    USER PRIVATE MEDICAL REPORTS    |
| - Authoritative Public Sources     |      | - Lab Results, Scans, Discharge    |
| - WHO, CDC, MedlinePlus, PubMed    |      | - Strictly Scoped to user_id       |
| - Read-Only for Regular Users      |      | - Private, Encrypted, Isolated     |
| - Global Shared Vector Index       |      | - User-Specific Vector Sub-Index   |
+------------------------------------+      +------------------------------------+
                  \                                    /
                   \                                  /
                    v                                v
                 +--------------------------------------+
                 |      HYBRID RETRIEVER & RERANKER     |
                 |  - Dense Cosine Similarity Embeddings |
                 |  - Sparse BM25 / FTS5 Keyword Match  |
                 |  - Strict Multi-Tenant Filter:       |
                 |    WHERE user_id = :authenticated_id |
                 +--------------------------------------+
                                    |
                                    v
                 +--------------------------------------+
                 |       PROMPT INJECTION SANITIZER     |
                 | Documents treated as UNTRUSTED DATA  |
                 +--------------------------------------+
                                    |
                                    v
                 +--------------------------------------+
                 |         CITATION SYNTHESIS           |
                 |  Evidence level, Title, URL, Date    |
                 +--------------------------------------+
```

---

## 2. Ingestion & Preprocessing Pipeline
1. **Document Loading**: Text, Markdown, PDF (`pdf-parse`), DOCX.
2. **Text Sanitization & Normalization**: Strips executable macros, dangerous scripts, and anomalous unicode.
3. **Chunking Strategy**:
   - Recursive character chunking with 500 token window and 100 token overlap.
   - Boundaries prioritize clinical headings (e.g., "Impression:", "Findings:", "Methodology:").
4. **Embedding Generation**: Normalized vector representations (384-d or 768-d depending on provider adapter).
5. **Metadata Attribution**:
   - Document ID, Chunk Index, Source Title, Organization, Publication Date, URL, Evidence Grade (A/B/C).

---

## 3. Retrieval & Reranking
- **Query Rewriting**: Expands user colloquialisms into clinical synonyms (e.g. "high BP" -> "hypertension, elevated blood pressure").
- **Hybrid Search Score**:
  $$\text{Score} = \alpha \cdot \text{Sim}_{\text{dense}}(q, d) + (1 - \alpha) \cdot \text{Score}_{\text{sparse}}(q, d)$$
- **Evidence Formatting**: Top-$K$ relevant passages are supplied into the LLM system prompt within `<medical_evidence>` blocks with explicit citation indices `[1]`, `[2]`.

---

## 4. Citation Integrity Policy
- The model is instructed: *“Cite ONLY sources provided in `<medical_evidence>`. If no provided evidence supports an empirical clinical assertion, state clearly that authoritative guidelines are unverified for this case.”*
- Zero hallucination policy: Citations cannot be synthesized or fabricated.
