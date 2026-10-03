# StudyLM — Phase 14 Architecture Blueprint
## Advanced AI Research & Knowledge Synthesis

This document details the architectural design, security boundaries, deterministic workflows, and claim-evidence verification pipeline for **Phase 14** of StudyLM (Adhyayan-AI).

---

## 1. High-Level Architectural Flow

```text
                     +───────────────────────────────────+
                     |         RESEARCH QUESTION         |
                     |  (User query or academic topic)   |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |      RESEARCH INTENT ANALYZER     |
                     |  - Intent: explain, compare,      |
                     |    analyze, summarize, timeline,  |
                     |    cause/effect, pros/cons, etc.  |
                     |  - Entity & focus aspect parsing  |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |         RESEARCH PLANNER          |
                     |  - Bounded sub-question generation|
                     |  - Deterministic execution plan   |
                     |  - Configurable limits (2-4 steps)|
                     |  - No recursive/infinite loops    |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |        EVIDENCE RETRIEVAL         |
                     |  - Multi-query Vector Search      |
                     |  - Web Search / Scoped Ingestion  |
                     |  - Deduplication & Diversity      |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |        EVIDENCE VALIDATION        |
                     |  - Strict tenant & source auth    |
                     |  - Provenance & metadata checks   |
                     |  - Rejection of invalid chunks    |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |      CROSS-SOURCE SYNTHESIS       |
                     |  - Compare & Timeline mode logic  |
                     |  - Contradiction Detection        |
                     |  - Knowledge Gap Detection        |
                     |  - Grounded Gemini Synthesis      |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |       CLAIM-EVIDENCE MATRIX       |
                     |  - Claim extraction from answer   |
                     |  - Support typing: direct,        |
                     |    indirect, conflicting, insucc. |
                     |  - Confidence & counter-evidence  |
                     +───────────────────────────────────+
                                       │
                                       ▼
                     +───────────────────────────────────+
                     |      FINAL RESEARCH REPORT        |
                     |  - Structured academic report     |
                     |  - Grounded Citations & Sources   |
                     |  - Formatted References & Export  |
                     |  - Persistent Research Session    |
                     +───────────────────────────────────+
```

---

## 2. Core Modules & Boundaries

### 2.1 Research Intent Classification
Deterministic categorization into supported archetypes:
- `explain`: Concept exposition and foundational explanations.
- `compare`: Side-by-side comparison of two or more approaches or entities.
- `analyze`: In-depth breakdown of mechanisms, components, and trade-offs.
- `summarize`: High-level synthesis of primary findings.
- `investigate`: Investigative deep dive across multiple perspectives.
- `evaluate_evidence`: Empirical appraisal of claimed results.
- `timeline`: Chronological progression of events or developments.
- `cause_effect`: Causal chain extraction and dependencies.
- `pros_cons`: Structured evaluation of benefits, limitations, and risks.
- `definition`: Precise terminology definitions and core scope.
- `general`: Fallback research classification when query spans multiple categories.

### 2.2 Controlled Research Planning
- Generates 2 to 4 focused sub-questions designed to gather comprehensive multi-faceted evidence without unbounded iteration.
- Execution is strictly linear and deterministic.
- Prevents infinite loops, recursive agent spawning, and arbitrary tool execution.

### 2.3 Evidence Retrieval, Deduplication & Authorization
- **Multi-Query Retrieval**: Executes scoped vector search against MongoDB Atlas and safe web research.
- **Deduplication**: Filters out redundant passages sharing high cosine/Jaccard similarity.
- **Strict Authorization**: Ensures every retrieved chunk belongs strictly to the requested `notebookId` and an authorized document/web source owned by the user.

### 2.4 Contradiction & Knowledge Gap Detection
- **Contradiction Detection**: Flags opposing claims across sources (e.g. Source A claims performance gain, Source B claims regression) as `"Sources differ"` without hallucinating a resolution.
- **Knowledge Gap Detection**: Explicitly identifies unanswered aspects or missing evidence rather than assuming absence of evidence is proof of non-existence.

### 2.5 Claim-Evidence Verification Matrix
- Factual claims in the synthesis are extracted and mapped to specific chunk IDs and citations.
- Support status: `direct` (fully substantiated), `indirect` (contextually inferred), `conflicting` (opposing evidence exists), `insufficient` (unsupported by sources).

---

## 3. Persistent Storage Model (`ResearchSession`)
Each research execution is stored in MongoDB:
- Compound indexes on `{ notebookId: 1, createdAt: -1 }` and `{ userId: 1, createdAt: -1 }`.
- Preserves the original question, intent, plan, evidence array, claims matrix, synthesis sections, report, citations, references, and performance metadata.
- Enables session resumption, comparison, and exporting (Markdown / Text).

---

## 4. Security & Privacy Guarantees
1. **Zero Secret Leakage**: No API keys, credentials, or internal embeddings stored in session models.
2. **Strict User Ownership**: Multi-tenant authorization enforced on all research routes.
3. **No Autonomous Agents**: Controlled deterministic workflows only; no unsupervised background tool execution.
