# StudyLM — Research Memory & Personalization Architecture

## 1. Overview & Privacy Principles
The StudyLM Personal Research Memory system stores user research preferences and explicitly saved knowledge. 

### Key Privacy Tenets
1. **Explicit Memory Creation Only**: StudyLM never automatically scrapes or saves arbitrary user chat content or private conversations as permanent memory.
2. **Strict User Ownership**: All memory queries enforce `userId` scoping directly at the database layer. No cross-tenant access is permitted.
3. **No Sensitive Data**: Passwords, authentication tokens, API keys, credentials, or inferred personal attributes are never stored.
4. **Full User Agency**: Users have complete visibility into their memories and can create, edit, deactivate, or permanently delete any memory entry at any time.

---

## 2. Memory Types & Schema
Memory records are stored in MongoDB with compound indexing on `{ userId: 1, type: 1, active: 1 }`.

| Field | Type | Description |
|---|---|---|
| `userId` | `ObjectId` (Indexed) | Owner of the memory record |
| `type` | `String` (Enum) | `preference`, `learning_goal`, `research_interest`, `saved_fact`, `saved_instruction`, `study_preference` |
| `content` | `String` (1-2000 chars) | The factual or instructional content of the memory |
| `source` | `String` | Origin of the memory (e.g., `user_explicit`, `notebook_directive`) |
| `confidence` | `Number` (0.0 to 1.0) | Memory reliability score (default 1.0 for explicit user inputs) |
| `active` | `Boolean` (Indexed) | Active status switch allowing temporary deactivation without deletion |
| `tags` | `[String]` | Categorization tags for filtering |
| `createdAt` / `updatedAt` | `Date` | Timestamp tracking |

---

## 3. Notebook-Level Memory
Notebooks can also define persistent workspace-specific memory context:
- **Notebook Purpose**: The high-level study or research objective for this specific workspace.
- **Study Goal**: Target milestone (e.g., "Prepare for final exam in Distributed Systems").
- **Explanation Style**: Style directives (e.g., "concise and mathematical", "beginner-friendly with analogical explanations").
- **Custom Instructions**: Domain constraints (e.g., "focus on RFC specifications and security threat models").

---

## 4. Memory-Aware Grounded RAG Flow
When a user asks a question in a notebook:
```text
User Query
   │
   ├──▶ Query Analyzer (Extract key concepts & intent)
   │
   ├──▶ Vector Search & Keyword Search (Retrieve relevant source chunks)
   │
   ├──▶ Notebook Memory Loader (Load workspace directives)
   │
   ├──▶ User Memory Matcher (Retrieve top relevant active preferences)
   │
   ▼
Context Builder (Prompt Assembly)
   │
   ├── Source Chunks (PRIMARY FACTUAL GROUND TRUTH)
   │
   └── User & Notebook Preferences (DELIMITED GUIDANCE ONLY)
   │
   ▼
Gemini Pro Model Generation
   │
   ▼
Grounded AI Answer with Citations
```

### Critical Grounding Guarantee
Source content **ALWAYS** remains the sole factual ground truth. Memory directives guide explanation style and learning focus only. The prompt builder explicitly instructs Gemini:
> *(IMPORTANT: The notebook sources below remain the authoritative fact base. Preferences guide explanation tone and focus only. Memory must NEVER override or contradict source evidence.)*

---

## 5. API Reference

### User Memory
- `POST /api/memory`: Create a new explicit memory
- `GET /api/memory`: List memories (with pagination, `type`, `active`, and `search` filters)
- `GET /api/memory/:id`: Get a specific memory record
- `PATCH /api/memory/:id`: Update content, tags, or active status
- `DELETE /api/memory/:id`: Delete a memory record

### Notebook Memory
- `GET /api/notebooks/:notebookId/memory`: Get notebook-level memory context
- `PUT /api/notebooks/:notebookId/memory`: Upsert notebook purpose, goal, style, and instructions
- `DELETE /api/notebooks/:notebookId/memory`: Reset notebook memory to defaults
