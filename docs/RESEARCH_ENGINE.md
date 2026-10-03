# StudyLM — Advanced Research & Knowledge Synthesis Engine

## 1. Overview
The StudyLM Advanced Research Engine (Phase 14) is a deterministic knowledge synthesis system that transforms complex research inquiries into comprehensive, academic-grade reports with verifiable citation provenance and claim-evidence verification.

---

## 2. Deterministic Pipeline Stages

```text
1. Research Question Ingestion
   ↓
2. Intent Classification (explain, compare, analyze, summarize, timeline, cause/effect, pros/cons, definition)
   ↓
3. Bounded Planning (2 to 4 structured sub-questions)
   ↓
4. Multi-Query Evidence Retrieval (Vector Search & Web Research)
   ↓
5. Deduplication & Tenant Provenance Authorization
   ↓
6. Cross-Source Divergence & Contradiction Detection
   ↓
7. Knowledge Gap Detection (Unanswered sub-questions & sparse coverage)
   ↓
8. Gemini Grounded Synthesis (Structured JSON output with [EVIDENCE_X] links)
   ↓
9. Claim-Evidence Verification Matrix (direct, indirect, conflicting, insufficient)
   ↓
10. Academic Report Assembly & Persistent Session Storage
```

---

## 3. Key Components & Behavioral Guarantees

### 3.1 Bounded Deterministic Planning
- Formulates 2 to 4 sub-questions maximum based on question intent and subject targets.
- Guarantees linear, non-recursive execution.
- Prevents infinite agent loops and tool iteration storms.

### 3.2 Strict Evidence Provenance & Validation
- Every retrieved excerpt is validated against the authenticated `notebookId` and user ownership.
- Unauthorized or cross-tenant document chunks are rejected prior to synthesis.
- Embeddings and database internal IDs are never exposed in user reports.

### 3.3 Conservative Contradiction Detection
- When two distinct sources make conflicting claims on the same metric or subject, the system flags the conflict as `"Sources differ"` and links both evidence excerpts side-by-side.
- The engine does not invent arbitrary winners between conflicting sources.

### 3.4 Explicit Knowledge Gap Detection
- Sub-questions with insufficient or absent evidence are explicitly presented in the **Knowledge Gaps & Unanswered Questions** section.
- The system adheres strictly to the rule: *absence of evidence is never presented as proof of non-existence*.

### 3.5 Claim-Evidence Verification Matrix
- Factual claims are extracted from the synthesis.
- Each claim is mapped to supporting chunk references with classified support levels:
  - `direct`: Unambiguous source support.
  - `indirect`: Contextual support.
  - `conflicting`: Opposing evidence exists.
  - `insufficient`: Unsupported by available sources.

---

## 4. API Reference

### Research Sessions
- `POST /api/notebooks/:notebookId/research-sessions`: Execute advanced research session
- `GET /api/notebooks/:notebookId/research-sessions`: List past sessions (with pagination, status, and search filters)
- `GET /api/notebooks/:notebookId/research-sessions/:id`: Get complete session details including plan, matrix, and report
- `DELETE /api/notebooks/:notebookId/research-sessions/:id`: Delete a research session
- `POST /api/notebooks/:notebookId/research-sessions/:id/export`: Export research report as Markdown (`.md`) or Plain Text (`.txt`)

---

## 5. Security & Anti-Hallucination Guarantees
1. **Zero Evidence Hallucination Guard**: Inquiries with 0 matching evidence return an explicit insufficient evidence notice without fabricating answers.
2. **Provenance Preservation**: All citations link directly to verifiable document/web chunks.
3. **No Unsupervised Autonomous Agents**: All research execution is bounded, auditable, and deterministic.
