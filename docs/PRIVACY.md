# StudyLM — Data Privacy & User Agency Manifesto

## 1. Core Privacy Tenets

### 1.1 Source-Grounded Isolation
All user uploaded documents, text excerpts, vector embeddings, and conversation records are strictly scoped by `userId` and `notebookId` at the database query layer. No cross-tenant access or multi-user data leakage is permitted.

### 1.2 Explicit Memory Creation Only
StudyLM never silently scrapes or archives arbitrary user chat messages as permanent research memory. Memories are created exclusively through intentional, user-driven actions.

### 1.3 Zero Secret Storage
Passwords are never stored in plaintext and are salted using Bcrypt with a cost factor of 12. JWT tokens, credentials, and API keys are strictly excluded from all user-facing data exports and query responses.

---

## 2. User Data Rights & Controls

### 2.1 Complete Self-Service Data Export
Users can export their complete research archive at any time via:
`GET /api/users/export-data`
This emits a structured JSON archive containing:
- User profile metadata
- All created notebooks
- Uploaded document & web source catalogs
- Explicit research memories & preferences
- Saved insights with citation references
- Bookmarks
- Advanced research sessions and synthesis reports
- Recent activity timeline logs

### 2.2 Irreversible Cascading Account & Data Deletion
Users have the absolute right to permanently delete their account and all associated data via:
`DELETE /api/users/me`
This performs a full cascading purge across all 16 database collections:
- `User`
- `Notebook`
- `Document`
- `Chunk` (Vector embeddings)
- `WebSource`
- `ChatSession` & `ChatMessage`
- `StudyToolResult`
- `UserMemory` & `NotebookMemory`
- `SavedInsight` & `Bookmark`
- `SourceRelationship`
- `ResearchSession`
- `ActivityLog`
- `UsageRecord`
- Associated Cloudinary assets
