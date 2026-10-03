# StudyLM — AI Study & Research Platform

> A production-grade, NotebookLM-style AI study and research platform that allows users to create notebooks, upload documents (PDF, DOCX, TXT), ingest web URLs, ask questions grounded in their sources with citations, and generate summaries, notes, flashcards, and quizzes.

---

## 📌 Status: Phase 14 Completed (Advanced AI Research & Knowledge Synthesis)

- **Phase 01:** Foundation, Monorepo, Express Backend, MongoDB, CORS, `/api/health` *(Verified)*
- **Phase 02:** Light-First Academic UI/UX, Design System, Landing Page, Dashboard, 3-Panel Workspace, Chat UI, Source Management, Settings, Profile *(Verified)*
- **Phase 03:** Secure JWT & Bcrypt Authentication, User Registration, Login, Protected Routes, Session Management & Profile Update *(Verified)*
- **Phase 04:** Authenticated Notebooks CRUD, Strict User Isolation, Search & Pagination *(Verified)*
- **Phase 05:** Document & Multi-Format Source Management (PDF, DOCX, TXT, Web URL, Plain Text), Cloudinary Storage *(Verified)*
- **Phase 06:** Document Processing Pipeline, Text Extraction, Cleaning & Deterministic Chunking *(Verified)*
- **Phase 07:** Google Gemini Embeddings (`text-embedding-004`), MongoDB Atlas Vector Search & Semantic Retrieval *(Verified)*
- **Phase 08:** Grounded RAG Chat, AI Answers & Citations Synthesis *(Verified)*
- **Phase 09:** AI Study Tools (Summarizer, Flashcards, Quizzes, Mind Maps) *(Verified)*
- **Phase 10:** Core NotebookLM Intelligence (Source Analysis, Deep Coverage, Deterministic Synthesis) *(Verified)*
- **Phase 11:** Web Sources + Advanced Research Engine (SSRF Protection, Multi-Source Vector Scoping, Grounded Research) *(Verified)*
- **Phase 12:** Production Hardening + Reliability + Observability (Rate Limiting, AI Quota Guard, NoSQL Sanitization, Graceful Shutdown, Stale Job Recovery, Health Probes) *(Verified)*
- **Phase 13:** Personal Research Memory + Advanced Knowledge UX (User & Notebook Memory, Source Relationships, Deep-Link Citation Previews, Saved Insights, Bookmarks, Universal Search, Knowledge Overview, Activity Timeline, Personalized Study Recommendations) *(Verified)*
- **Phase 14:** Advanced AI Research & Knowledge Synthesis (Intent Classification, Bounded Planning, Multi-Query Retrieval, Provenance Validation, Claim-Evidence Matrix, Contradiction Detection, Knowledge Gaps, Academic Reports, Markdown/Text Export) *(Verified)*




---

## 🌐 Web Sources + Advanced Research (Phase 10)

### Phase 10 Architecture

```text
User Research Question
        │
        ▼
Query & Scope Validation (notebook | web | all)
        │
        ▼
Multi-Source Vector Search Scoping
        │
        ├───────────────────────────────┐
        ▼                               ▼
Notebook Sources Retrieval       Web Search / Ingested Web Sources
        │                               │
        │                               ▼
        │                         Safe Fetcher (Hop-by-hop SSRF validation)
        │                               │
        │                               ▼
        │                         Web Extractor (Cheerio, tag stripping, bounded size)
        │                               │
        │                               ▼
        │                         Web Chunks & Gemini Embeddings
        └───────────────────────────────┘
                        │
                        ▼
            Combined Context Builder
      (Structured [NOTEBOOK_SOURCE_X] & [WEB_SOURCE_X])
                        │
                        ▼
             Grounded Research Prompt
      (Anti-Prompt Injection & Conflict Separation)
                        │
                        ▼
            Gemini Research Synthesis
                        │
                        ▼
       Citation & Provenance Verification
                        │
                        ▼
            Grounded Research Report
```

### URL Security & SSRF Protections (`backend/src/services/web/webSecurity.js`)

All outbound HTTP requests pass through comprehensive security barriers:
- **Protocol Enforcement:** Only `http:` and `https:` schemes allowed.
- **DNS & IP Validation:** Resolves IP address via `dns.lookup` before connection.
- **Loopback & Private Network Blocking:** Blocks `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `100.64.0.0/10` (CGNAT), `169.254.0.0/16` (Link-local), `::1`, `fc00::/7`, `fe80::/10`.
- **Cloud Metadata Endpoints Blocked:** `169.254.169.254`, `metadata.google.internal`, `100.100.100.200`.
- **Manual Redirect Validation:** Revalidates every single redirect destination hop against SSRF rules up to `WEB_MAX_REDIRECTS=5`.
- **Size Bounds:** Enforces `WEB_MAX_RESPONSE_BYTES=5000000` (5MB) and `WEB_MAX_EXTRACTED_CHARS=2000000` (2MB).

### Web Source Ingestion & Chunking (`backend/src/models/WebSource.js`)

Web pages are ingested, cleaned (stripping scripts, styles, forms, ads, and navigation), hashed via SHA-256 for caching, and chunked using the shared `Chunk` model with:
- `sourceKind`: `'web'`
- `webSourceId`: ObjectId reference to `WebSource`
- Full 768-dimensional Gemini embeddings stored directly in MongoDB for instant vector search.

### Multi-Source Vector Search Scoping (`backend/src/services/search/vectorSearchService.js`)

Semantic search natively supports:
- `sourceScope: 'notebook'` — Searches only document chunks.
- `sourceScope: 'web'` — Searches only web source chunks.
- `sourceScope: 'all'` — Performs unified cross-source semantic ranking with provenance tagging.

### Deep Research Engine (`backend/src/services/research/`)

- **Prompt Injection Defense:** Treats all external webpage text strictly as untrusted data within `<web_source>` delimiters. System instructions explicitly command the model never to obey instructions embedded within sources.
- **Source Conflict Handling:** When notebook and web sources disagree, the engine highlights the disagreement and explicitly cites both sources rather than hallucinating a resolution.
- **Provenance Citations:** Returns distinct badges and links for Notebook Documents vs. Web Sources with direct URL navigation.

### Web Source & Research APIs

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/notebooks/:notebookId/web-sources` | Ingest new web source URL |
| `GET` | `/api/notebooks/:notebookId/web-sources` | List web sources for notebook |
| `GET` | `/api/notebooks/:notebookId/web-sources/:webSourceId` | Get single web source details |
| `POST` | `/api/notebooks/:notebookId/web-sources/:webSourceId/refresh` | Force refresh & re-index web source |
| `DELETE` | `/api/notebooks/:notebookId/web-sources/:webSourceId` | Delete web source & its chunks |
| `POST` | `/api/notebooks/:notebookId/research` | Run deep multi-source research synthesis |

### Environment Configuration

```bash
WEB_FETCH_TIMEOUT_MS=15000
WEB_MAX_RESPONSE_BYTES=5000000
WEB_MAX_EXTRACTED_CHARS=2000000
WEB_MAX_REDIRECTS=5
WEB_SOURCE_CACHE_TTL_HOURS=24
WEB_SEARCH_PROVIDER=duckduckgo
WEB_SEARCH_API_KEY=
RESEARCH_MAX_SEARCH_RESULTS=5
RESEARCH_MAX_FETCHED_SOURCES=5
RESEARCH_MAX_CONTEXT_CHUNKS=10
RESEARCH_MAX_CONTEXT_CHARS=40000
RESEARCH_MAX_HISTORY_MESSAGES=8
MAX_RESEARCH_QUERY_LENGTH=2000
```


---

## 📚 AI Study Tools (Phase 09)

### Study Tools Architecture

```text
User Action (Select Tool & Optional Topic)
    │
    ▼
Verify JWT & Notebook Ownership
    │
    ▼
Bounded Chunk Retrieval (Scoped to notebookId & topic via vector search / top chunks)
    │
    ▼
Context Builder (Structured sources with [SOURCE_X] IDs within token/character limits)
    │
    ▼
Dedicated Study Tool Prompt Builder (Enforces strict source grounding & JSON schemas)
    │
    ▼
Gemini Chat Generation (GEMINI_CHAT_MODEL)
    │
    ▼
Structured JSON Output Validation & Sanitization (studyOutputValidator.js)
    │
    ▼
Citation Extraction & Verification (Maps [SOURCE_X] → chunkId, doc title, page span)
    │
    ▼
Save StudyToolResult Record & Return Clean Payload to Frontend
```

### Core Study Tools

1. **Executive Summarizer (`POST /api/notebooks/:notebookId/study-tools/summary`):**
   - Modes: `detailed` (comprehensive overview, key takeaways, concept definitions glossary) and `short` (concise bullet-point synthesis).
   - Grounded citations attached to each point and concept.
2. **Flashcard Generator (`POST /api/notebooks/:notebookId/study-tools/flashcards`):**
   - Configurable count (1–30, default 10) and difficulty (`easy`, `medium`, `hard`, `mixed`).
   - Generates structured cards with test questions, source-derived answers, and citations.
   - Frontend provides interactive flip card deck, shuffle, restart, and grid mode.
3. **Multiple-Choice Quiz Generator (`POST /api/notebooks/:notebookId/study-tools/quiz`):**
   - Configurable count (1–20, default 10) and difficulty.
   - Generates questions with exactly 4 options, a validated `correctAnswer` index (0–3), grounded explanation, and source citations.
   - Frontend provides interactive question-by-question flow, instant feedback, and final score percentage review.
4. **Knowledge Mind Map Generator (`POST /api/notebooks/:notebookId/study-tools/mindmap`):**
   - Generates a hierarchical recursive JSON taxonomy tree (max depth: 5, max nodes: 100).
   - Frontend renders an interactive collapsible concept tree with node level indicators.

### Study Tool Data Model (`backend/src/models/StudyToolResult.js`)

- `userId`: ObjectId (references `User`, required, indexed).
- `notebookId`: ObjectId (references `Notebook`, required, indexed).
- `toolType`: String (`'summary' | 'flashcards' | 'quiz' | 'mindmap'`, required).
- `title`: String (descriptive study title).
- `input`: Mixed (stores configuration like mode, count, difficulty, topic).
- `result`: Mixed (structured tool output validated against schemas).
- `citations`: Array of citation objects (`citationNumber`, `chunkId`, `documentId`, `documentTitle`, `sourceType`, `pageNumber`, `pageStart`, `pageEnd`, `snippet`).
- `metadata`: Mixed (model used, retrieved chunk counts).
- Timestamps: `true`.
- Compound Indexes: `{ notebookId: 1, userId: 1, createdAt: -1 }` and `{ notebookId: 1, toolType: 1, createdAt: -1 }`.

### Study Tool REST APIs

All endpoints require JWT Bearer authentication and enforce strict notebook ownership:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/notebooks/:notebookId/study-tools/summary` | Generate grounded summary |
| `POST` | `/api/notebooks/:notebookId/study-tools/flashcards` | Generate grounded flashcard deck |
| `POST` | `/api/notebooks/:notebookId/study-tools/quiz` | Generate grounded multiple-choice quiz |
| `POST` | `/api/notebooks/:notebookId/study-tools/mindmap` | Generate grounded hierarchical mind map |
| `GET` | `/api/notebooks/:notebookId/study-tools` | List previously generated study tools for notebook |
| `GET` | `/api/notebooks/:notebookId/study-tools/:studyToolId` | Get single study tool record |
| `DELETE` | `/api/notebooks/:notebookId/study-tools/:studyToolId` | Delete study tool record |

### Cascade Deletion Guarantees

When a notebook is deleted, all associated `StudyToolResult` records are automatically removed along with documents, chunks, chat sessions, and chat messages.

---

## 🤖 Grounded RAG Chat & Citations (Phase 08)

### RAG Architecture Flow

```text
User Question
    │
    ▼
Validate & Trim Message (length ≤ 5000)
    │
    ▼
Verify JWT & Notebook Ownership
    │
    ▼
Generate Query Embedding (Gemini text-embedding-004)
    │
    ▼
Vector Search (MongoDB Atlas Vector Search / Scoped Cosine Similarity)
    │
    ▼
Retrieve Top-K Relevant Chunks (filtered by notebookId)
    │
    ▼
Context Builder (Construct structured sources with [SOURCE_X] IDs, max tokens & chars)
    │
    ▼
Grounded Gemini Prompt (Strict anti-hallucination system instructions + recent chat history)
    │
    ▼
Answer & Citation Synthesis (Maps [SOURCE_X] → validated document & page references)
    │
    ▼
Save User & Assistant ChatMessages (Stores validated citations, chunkIds, page numbers)
    │
    ▼
Return Clean Grounded Response with Source References
```

### Dedicated RAG Services (`backend/src/services/rag/`)

- **`contextBuilder.js`:**
  - Formats retrieved chunks into unambiguous `[SOURCE_1]`, `[SOURCE_2]` blocks.
  - Enforces strict context budget limits: max context chunks (`8`) and max context characters (`30,000`).
  - Maintains deterministic `sourceMap` linking temporary IDs to rich document/chunk metadata.
- **`promptBuilder.js`:**
  - Enforces strict educational and anti-hallucination system instructions.
  - Limits conversation history window to the most recent `8` messages (`RAG_MAX_HISTORY_MESSAGES`).
  - Grounds generation exclusively on provided notebook sources.
- **`citationService.js`:**
  - Extracts model source references (`[SOURCE_X]`).
  - Validates and deduplicates citations against retrieved chunks.
  - Replaces internal source tags with clean, sequential `[1]`, `[2]` numeric markers.
  - Generates structured citation payloads with `chunkId`, `documentId`, `documentTitle`, `sourceType`, `pageNumber`, `pageStart`, and `pageEnd`.
- **`ragService.js`:**
  - Orchestrates the retrieval, context preparation, Gemini chat completion, and citation processing.
  - **Insufficient Information Behavior:** If vector retrieval yields 0 matching chunks or if evidence is insufficient, returns an explicit safe response (`"I couldn't find enough information about this in your notebook sources..."`) without falling back to ungrounded LLM general knowledge.

### Chat Data Models

#### `ChatSession` (`backend/src/models/ChatSession.js`)
- `notebookId`: ObjectId (required, references `Notebook`).
- `userId`: ObjectId (required, references `User`).
- `title`: String (auto-generated from first message or default `'New Chat'`).
- Compound Index: `{ userId: 1, notebookId: 1, updatedAt: -1 }`.

#### `ChatMessage` (`backend/src/models/ChatMessage.js`)
- `sessionId`: ObjectId (required, references `ChatSession`).
- `notebookId`: ObjectId (required, references `Notebook`).
- `userId`: ObjectId (required, references `User`).
- `role`: `'user' | 'assistant'` (required).
- `content`: String (required).
- `citations`: Array of structured citations (`citationNumber`, `chunkId`, `documentId`, `documentTitle`, `sourceType`, `pageNumber`, `pageStart`, `pageEnd`, `snippet`).
- `retrieval`: Metadata capturing `topK`, `scoreThreshold`, and `retrievedChunkCount`.
- `model`: String (e.g. `'gemini-1.5-flash'`).
- Compound Indexes: `{ sessionId: 1, createdAt: 1 }` and `{ notebookId: 1, createdAt: 1 }`.

### Chat REST APIs

All routes are mounted under `/api/notebooks/:notebookId/chats` and require JWT authentication:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/notebooks/:notebookId/chats` | Create a new chat session |
| `GET` | `/api/notebooks/:notebookId/chats` | List user chat sessions for the notebook (paginated) |
| `GET` | `/api/notebooks/:notebookId/chats/:sessionId` | Get chat session details |
| `DELETE` | `/api/notebooks/:notebookId/chats/:sessionId` | Delete chat session & cascade delete all its messages |
| `GET` | `/api/notebooks/:notebookId/chats/:sessionId/messages` | Get chronological message history |
| `POST` | `/api/notebooks/:notebookId/chats/:sessionId/messages` | Send user message & receive grounded RAG answer with citations |

### Cascade Deletion Guarantees

- Deleting a `ChatSession` automatically deletes all associated `ChatMessage` documents.
- Deleting a `Notebook` cascades and deletes all child `Document`, `Chunk`, `ChatSession`, and `ChatMessage` records, eliminating orphaned data.

### Environment Configuration

```env
# Gemini Chat & RAG Settings
GEMINI_CHAT_MODEL=gemini-1.5-flash
RAG_DEFAULT_TOP_K=5
RAG_MAX_TOP_K=10
RAG_DEFAULT_SCORE_THRESHOLD=0.1
RAG_MAX_CONTEXT_CHUNKS=8
RAG_MAX_CONTEXT_CHARS=30000
RAG_MAX_HISTORY_MESSAGES=8
MAX_CHAT_MESSAGE_LENGTH=5000
```

---

## 🧠 Embeddings & Vector Search (Phase 07)

### Embedding Architecture (`backend/src/services/embedding/`)
- **Model:** Google Gemini `text-embedding-004` (768 numeric dimensions).
- **Service (`embeddingService.js`):**
  - Single embedding generation via `generateEmbedding(text)`.
  - Bounded batch generation via `generateEmbeddings(texts, batchSize = 16)` using `batchEmbedContents`.
  - Exponential backoff retry handler for transient rate limits (`429` / `503` / `RESOURCE_EXHAUSTED`).
  - Strict vector validation: verifies array structure, numeric completeness, and exact 768-dimension shape.
  - Safe API error masking without exposing sensitive keys or complete raw document contents.
  - **No Silent Fallback:** Embedding failure fails the operation safely and transitions documents to `status: 'failed'` (`metadata.embeddingStatus: 'failed'`).
  - **Optional Development Fallback:** Configurable strictly via `ENABLE_PSEUDO_EMBEDDING_FALLBACK=true` (default: `false`). *Warning: Pseudo-embeddings are strictly prohibited in `NODE_ENV=production` and are not suitable for real semantic search.*

### Chunk Model Extension (`backend/src/models/Chunk.js`)
- `embedding`: `[Number]` — 768-dimensional float vector, configured with `select: false` to prevent leaking raw numeric arrays in basic API queries.
- `embeddingModel`: String (`'text-embedding-004'`).
- `embeddingDimensions`: Number (`768`).
- `embeddedAt`: Date timestamp.

### Document Processing Lifecycle Integration
```text
Document (pending)
   ↓
Processing (extract + clean)
   ↓
Deterministic Chunks Generated
   ↓
Gemini Embeddings Generated & Validated
   ↓
Idempotent Chunk Replacement & Persistence
   ↓
Document Ready (embeddingStatus: 'completed')
```

### MongoDB Atlas Vector Search Index Configuration

To enable vector search on your MongoDB Atlas cluster:
1. Navigate to **MongoDB Atlas > Database > Browse Collections**.
2. Select database `studylm` and collection `chunks`.
3. Go to the **Search Indexes** tab and click **Create Search Index** (select **JSON Editor**).
4. Name the index `vector_index` and paste the following configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "notebookId"
    }
  ]
}
```

> **Local MongoDB Fallback:** When running locally without Atlas Search, `vectorSearchService.js` transparently executes an in-memory cosine similarity search strictly scoped to the requested `notebookId`.

### Semantic Search API Endpoint

**Endpoint:** `POST /api/notebooks/:notebookId/search`  
**Protection:** Private (JWT Bearer Token & Notebook Ownership Required)

**Request Body:**
```json
{
  "query": "What are the principles of quantum superposition and qubits?",
  "topK": 5,
  "scoreThreshold": 0.5
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Semantic search completed successfully",
  "data": {
    "query": "What are the principles of quantum superposition and qubits?",
    "results": [
      {
        "chunkId": "66f4a8b1c9e8d7a123456789",
        "documentId": "66f4a8b1c9e8d7a123456780",
        "notebookId": "66f4a8b1c9e8d7a123456770",
        "chunkIndex": 0,
        "text": "Quantum computing harnesses the laws of quantum mechanics...",
        "pageNumber": 1,
        "pageStart": 1,
        "pageEnd": 1,
        "score": 0.8924,
        "documentTitle": "Quantum Computing Principles.pdf",
        "sourceType": "pdf"
      }
    ]
  },
  "timestamp": "2026-10-02T05:50:00.000Z"
}
```

### Document Re-embedding Endpoint

**Endpoint:** `POST /api/notebooks/:notebookId/documents/:documentId/embed`  
**Protection:** Private (JWT Bearer Token & Notebook Ownership Required)  
- Atomically regenerates and replaces chunk embeddings idempotently.

---

## ⚙️ Document Processing Pipeline (Phase 06)

### Processing Architecture (`backend/src/services/document/`)
- **PDF Processor (`pdfProcessor.js`):** Extracts text using `pdf-parse`, preserving explicit page boundaries (`pageNumber`, `pageStart`, `pageEnd`) for citation accuracy.
- **DOCX Processor (`docxProcessor.js`):** Extracts semantic paragraphs, headings, and tables using `mammoth`.
- **TXT Processor (`txtProcessor.js`):** Decodes UTF-8 buffers, strips BOM, and normalizes line endings.
- **Plain Text Processor:** Formats and cleans raw user-submitted notes.
- **URL Processor (`urlProcessor.js`):** HTML content scraper with strict SSRF protection (blocks loopback, private IPv4/IPv6, link-local, cloud metadata IPs). Cleans semantic article/main text using `cheerio`.
- **Text Cleaner (`textCleaner.js`):** Deterministic Unicode normalization (NFKC), newline consolidation, and whitespace trimming.
- **Chunker (`chunker.js`):** Segments documents into ~800–1200 token passages (~3200–4800 chars) with ~100–150 token overlap (~400–600 chars), preserving page ranges for citations.

### Chunk Data Model (`backend/src/models/Chunk.js`)
- `documentId`: ObjectId referencing `Document`, required, indexed.
- `notebookId`: ObjectId referencing `Notebook`, required, indexed.
- `chunkIndex`: Number (deterministic 0-based index).
- `text`: String (clean chunk text).
- `tokenCount`: Number (estimated tokens).
- `charCount`: Number (character count).
- `pageNumber`: Number (exact page for single-page chunks or null).
- `pageStart`: Number (starting page for multi-page/overlapping chunks).
- `pageEnd`: Number (ending page for multi-page/overlapping chunks).
- `metadata`: Mixed object.
- **Compound Indexes:**
  - `{ documentId: 1, chunkIndex: 1 }` (unique)
  - `{ notebookId: 1 }`

### Processing Lifecycle & Status Polling
- **Lifecycle:** `pending` ➔ `processing` ➔ `ready` (or `failed`).
- **Idempotency:** Re-processing a document deletes existing chunks before inserting new chunks, preventing duplicates.
- **Status API:** `GET /api/notebooks/:notebookId/documents/:documentId/status`
- **Reprocess API:** `POST /api/notebooks/:notebookId/documents/:documentId/process`
- **Chunks API:** `GET /api/notebooks/:notebookId/documents/:documentId/chunks`

---

## 📄 Document & Source Management (Phase 05)

### Supported Source Types
- **PDF Documents (`pdf`):** Uploaded via multipart form-data and securely stored in Cloudinary.
- **Word Documents (`docx`):** Standard `.docx` and `.doc` files uploaded and stored in Cloudinary.
- **Text Files (`txt`):** Plain text documents uploaded and stored in Cloudinary.
- **Plain Text Notes (`text`):** User-typed notes persisted directly as raw text.
- **Web Pages (`url`):** Registered HTTP/HTTPS URLs ready for ingestion.

### Data Model & Indexing (`backend/src/models/Document.js`)
- `notebookId`: ObjectId referencing `Notebook`, indexed, required.
- `title`: String (1–200 characters), trimmed, required.
- `sourceType`: Enum `['pdf', 'docx', 'txt', 'text', 'url']`, required.
- `originalName`: String.
- `mimeType`: String.
- `fileSize`: Number (in bytes).
- `storageUrl`: String (Cloudinary secure delivery URL).
- `storagePublicId`: String (Cloudinary unique asset identifier).
- `sourceUrl`: String (for web sources).
- `rawText`: String (for plain text notes; remains empty for files in Phase 05).
- `status`: Enum `['pending', 'processing', 'ready', 'failed']` (default: `'pending'`).
- `processingError`: String.
- `metadata`: Mixed object for extensible metadata.
- **Compound Indexes:**
  - `{ notebookId: 1, createdAt: -1 }`
  - `{ notebookId: 1, status: 1 }`

### Cloudinary Storage & Upload Middleware
- Uploads are processed in-memory via `multer.memoryStorage()` and streamed directly to Cloudinary (`studylm/notebooks/:notebookId/sources/`).
- Enforces strict file type checks and a configurable maximum file size (`MAX_FILE_SIZE_MB=20`).
- Prohibits executable/script files (`.exe`, `.sh`, `.bat`, `.js`, `.php`).
- Automatic Cloudinary asset cleanup occurs when deleting sources or cascade-deleting notebooks.

### Document API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/notebooks/:notebookId/documents` | Bearer Token | Upload file (multipart) or create URL/Text source (201) |
| `GET` | `/api/notebooks/:notebookId/documents` | Bearer Token | Fetch notebook sources with pagination & search (200) |
| `GET` | `/api/notebooks/:notebookId/documents/:documentId` | Bearer Token | Fetch single source scoped to user's notebook (200) |
| `PATCH`| `/api/notebooks/:notebookId/documents/:documentId` | Bearer Token | Update document title with validation (200) |
| `DELETE`| `/api/notebooks/:notebookId/documents/:documentId` | Bearer Token | Delete document & Cloudinary asset (200) |

---

## 📚 Notebook Management (Phase 04)

### Data Model & Indexing
- **Mongoose Schema (`backend/src/models/Notebook.js`):**
  - `ownerId`: ObjectId referencing `User`, indexed, required.
  - `title`: String (1–120 characters), trimmed, required.
  - `description`: String (up to 500 characters), trimmed.
  - `icon`: String (default `"book"`).
  - Timestamps: automatic `createdAt` and `updatedAt`.
- **Compound Indexes:**
  - `{ ownerId: 1, updatedAt: -1 }` for high-performance scoped and sorted queries.

### Security & Ownership Isolation
- All notebook queries strictly enforce `{ _id: id, ownerId: req.user._id }`.
- Cross-user operations (viewing, updating, deleting) return a clean `404 Not Found` without disclosing existence of other users' notebook IDs.
- Ownership assignment (`ownerId = req.user._id`) is strictly managed on the backend; client-supplied `ownerId` is discarded.

### Notebook API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/notebooks` | Bearer Token | Create a new notebook with `ownerId = req.user._id` (201) |
| `GET` | `/api/notebooks` | Bearer Token | Fetch user's notebooks with `?page=1&limit=12&search=query` (200) |
| `GET` | `/api/notebooks/:id` | Bearer Token | Fetch single notebook by ID scoped to authenticated user (200) |
| `PATCH`| `/api/notebooks/:id` | Bearer Token | Update title, description, or icon with validation (200) |
| `DELETE`| `/api/notebooks/:id` | Bearer Token | Delete user's notebook with confirmation (200) |

---

## 🔐 Authentication & Security (Phase 03)

### Security Features
- **Password Hashing:** 12-round bcrypt salt, plaintext passwords never logged or persisted.
- **Model Security:** `passwordHash` field explicitly excluded (`select: false`) across Mongoose queries.
- **Stateless Tokens:** Minimal JWT payload (`{ userId, role }`) signed with `JWT_SECRET` and configurable expiration (`JWT_EXPIRES_IN=7d`).
- **Input Sanitization:** Email normalization (lowercase, trim), regex validation, and duplicate conflict checks.
- **Centralized Interceptor:** Axios request interceptor attaches Bearer tokens via `tokenStorage`; response interceptor captures 401 unauthorized errors to clear sessions without redirect loops.
- **Protected Routing:** `ProtectedRoute` guards private workspace routes with loading skeletons and redirect-path preservation (`/login?redirect=...`).

### Auth API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user, hash password, return `{ user, token }` (201) |
| `POST` | `/api/auth/login` | Public | Authenticate user, update `lastLoginAt`, return `{ user, token }` (200) |
| `GET` | `/api/auth/me` | Bearer Token | Return currently authenticated user profile (200) |
| `PATCH`| `/api/auth/profile` | Bearer Token | Update user display name and avatar (200) |
| `POST` | `/api/auth/logout` | Public/Bearer| Acknowledge stateless session termination (200) |

---

## 🎨 Design System & Palette (60:30:10 Rule)

| Role | Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Neutral Background (60%)** | Pale Alabaster | `#F7F8F6` | Primary page & workspace canvas |
| **Surface (60%)** | Pure White | `#FFFFFF` | Cards, panels, modals, dropdowns |
| **Text Primary (30%)** | Deep Forest Slate | `#17211D` | High-contrast readable typography |
| **Text Muted (30%)** | Sage Muted | `#6B756F` | Secondary meta, timestamps, subheaders |
| **Border (30%)** | Soft Platinum | `#E2E7E3` | Subtle, accessible section dividers |
| **Primary Action (10%)** | Deep Academic Emerald | `#1F5E4B` | Main CTAs, badges, brand focus |
| **Primary Dark (10%)** | Forest Pine | `#174638` | Hover states, active buttons |
| **Accent (10%)** | Warm Ochre Gold | `#D6A84F` | Starred notebooks, quiz highlights |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Authentication Context:** React Context + `tokenStorage` + Axios interceptors
- **Styling:** Tailwind CSS v4 (Custom academic design tokens)
- **Icons:** Lucide React
- **Typography:** Plus Jakarta Sans & Inter

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose ODM)
- **Authentication:** JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Security & Utilities:** Helmet, CORS, Morgan, Dotenv

---

## 📂 Project Structure

```
studylm/
├── .gitignore                          # Root gitignore (prevents leaks of .env, node_modules)
├── package.json                        # Monorepo root configuration & dev scripts
├── README.md                           # Comprehensive project documentation
│
├── backend/                            # Node.js + Express backend service
│   ├── .env                            # Local environment variables (gitignored)
│   ├── .env.example                    # Template environment configuration
│   ├── .gitignore                      # Backend specific ignores
│   ├── package.json                    # Backend dependencies (Express, Mongoose, JWT, bcryptjs)
│   └── src/
│       ├── config/
│       │   ├── db.js                   # Resilient MongoDB Mongoose connection handler
│       │   └── env.js                  # Environment variable loader & validator
│       ├── controllers/
│       │   ├── auth.controller.js      # Register, Login, Me, Profile update, Logout
│       │   └── health.controller.js    # GET /api/health controller with system metrics
│       ├── middlewares/
│       │   ├── auth.js                 # JWT Bearer token verification middleware
│       │   ├── errorHandler.js         # Centralized global error handling middleware
│       │   └── notFound.js             # 404 unmatched route handler
│       ├── models/
│       │   └── User.js                 # Mongoose User model with bcrypt hashing & safe serialization
│       ├── routes/
│       │   ├── auth.routes.js          # Authentication & profile routes (/api/auth)
│       │   ├── health.routes.js        # Health check router (/api/health)
│       │   └── index.js                # Central API router mounting all domain routes
│       ├── utils/
│       │   ├── apiError.js             # Custom ApiError class with status codes
│       │   ├── apiResponse.js          # Standardized JSON response envelope
│       │   ├── asyncHandler.js         # Controller async wrapper helper
│       │   └── jwt.js                  # JWT token signing & verification utility
│       ├── app.js                      # Express app initialization (CORS, Helmet, parsers)
│       └── server.js                   # Server entry point with graceful shutdown
│
└── frontend/                           # React + Vite frontend client
    ├── .env                            # Frontend environment variables (gitignored)
    ├── .env.example                    # Frontend environment template
    ├── .gitignore                      # Frontend specific ignores
    ├── index.html                      # App HTML template with Plus Jakarta Sans & Inter
    ├── package.json                    # Frontend dependencies and scripts
    ├── vite.config.js                  # Vite configuration with Tailwind & API proxy
    └── src/
        ├── api/
        │   ├── apiClient.js            # Configured Axios instance with token interceptors
        │   ├── authService.js          # Auth API service (register, login, getMe, updateProfile)
        │   └── healthService.js        # Health check API service call
        ├── components/
        │   ├── auth/
        │   │   ├── ProtectedRoute.jsx  # Route guard with session loader & redirect
        │   │   └── PublicOnlyRoute.jsx # Guest guard preventing authenticated visits to login/register
        │   ├── chat/
        │   │   ├── ChatInput.jsx       # Chat input with prompt chips & source attachment
        │   │   ├── ChatMessage.jsx     # Markdown formatting, citations & actions
        │   │   └── CitationCard.jsx    # Distinct citation pills with excerpt preview
        │   ├── common/
        │   │   ├── Loader.jsx          # Reusable loading spinner
        │   │   └── StatusBadge.jsx     # Status badge with live ping indicators
        │   ├── layout/
        │   │   ├── AppLayout.jsx       # Workspace shell with sidebar & mobile drawer
        │   │   ├── AppNavbar.jsx       # Application header with real user menu & sign out
        │   │   ├── AppSidebar.jsx      # Desktop sidebar & responsive navigation with real user
        │   │   ├── Footer.jsx          # System footer
        │   │   ├── LandingFooter.jsx   # Public landing footer
        │   │   ├── LandingNavbar.jsx   # Public landing navigation with auth state switch
        │   │   └── MainLayout.jsx      # Layout wrapper
        │   ├── notebooks/
        │   │   ├── CreateNotebookModal.jsx # Create notebook dialog
        │   │   └── NotebookCard.jsx    # Notebook card with favorite toggle & menu
        │   ├── sources/
        │   │   ├── AddSourceModal.jsx  # Multi-tab modal (PDF, DOCX, TXT, Web, Paste)
        │   │   └── SourceCard.jsx      # Source card with status & actions
        │   ├── study/
        │   │   └── StudyToolsPanel.jsx # Summary, Notes, Quiz, Flashcards, Key Points
        │   └── ui/
        │       ├── Avatar.jsx          # User avatars with fallback initials
        │       ├── Badge.jsx           # Academic color badges
        │       ├── Button.jsx          # Primary, secondary, outline, ghost, danger
        │       ├── Card.jsx            # Card family with subtle borders
        │       ├── Dropdown.jsx        # Click-outside menu dropdowns
        │       ├── EmptyState.jsx      # Empty state with actionable triggers
        │       ├── Input.jsx           # Form inputs with icons & validation
        │       ├── Modal.jsx           # Accessible dialogs
        │       ├── Skeleton.jsx        # Content skeletons
        │       ├── Tabs.jsx            # Underline & pill tabs
        │       ├── Textarea.jsx        # Multiline text areas
        │       └── Tooltip.jsx         # Positioning tooltips
        ├── context/
        │   ├── AuthContext.jsx         # Global user state, login, register, logout, session init
        │   └── ToastContext.jsx        # Toast notification system
        ├── pages/
        │   ├── DashboardPage.jsx       # Personalized study dashboard with user greeting
        │   ├── HealthPage.jsx          # Live diagnostic health inspector
        │   ├── HomePage.jsx            # Architectural monitor
        │   ├── LandingPage.jsx         # Public product landing page
        │   ├── LoginPage.jsx           # Clean sign-in with show/hide password & redirect
        │   ├── NotebookWorkspacePage.jsx # 3-panel intelligent workspace
        │   ├── NotFoundPage.jsx        # 404 error page
        │   ├── ProfilePage.jsx         # Real user profile with inline edit & research metrics
        │   ├── RegisterPage.jsx        # Account registration with password checklist
        │   └── SettingsPage.jsx        # Preferences, AI model & privacy
        ├── routes/
        │   └── AppRoutes.jsx           # React Router route registry with ProtectedRoute guards
        ├── utils/
        │   └── tokenStorage.js         # Centralized token persistence helper
        ├── App.jsx                     # Root application wrapped in AuthProvider & ToastProvider
        ├── index.css                   # Custom Tailwind design tokens & base rules
        └── main.jsx                    # React DOM entry point
```

---

## 🚀 Getting Started

### 1. Installation

```bash
# From workspace root:
npm run install:all
```

### 2. Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Run **both** Backend (5000) and Frontend (5173) concurrently |
| `npm run dev:backend` | Start Express backend development server |
| `npm run dev:frontend` | Start Vite frontend development server |
| `npm run build:frontend`| Create production build of frontend client |

---

## 🗺️ Application Routes

- `/` — Public Product Landing Page
- `/login` — Sign In Form (redirects if already logged in)
- `/register` — Account Registration (auto-login on creation)
- `/dashboard` — Protected: Notebooks Dashboard
- `/notebooks/:id` — Protected: 3-Panel Study & Research Workspace
- `/settings` — Protected: Preferences, Appearance & AI Grounding Settings
- `/profile` — Protected: Real User Profile & Research Storage Quotas
- `/health` — Protected/Diagnostic: Live Backend & MongoDB System Diagnostics
- `*` — 404 Error Page
