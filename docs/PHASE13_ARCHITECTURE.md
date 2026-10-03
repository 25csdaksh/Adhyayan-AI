# StudyLM — Phase 13 Architecture Blueprint
## Personal Research Memory + Advanced Knowledge UX

This document details the architectural design, security boundaries, and data flow for **Phase 13** of StudyLM (Adhyayan-AI).

---

## 1. High-Level Architectural Flow

```text
+-------------------------------------------------------------------------+
|                              USER MEMORY                                |
|  - Explicit user preferences (learning goals, research interests, tone) |
|  - Strict user ownership, full CRUD, non-intrusive retrieval           |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                            NOTEBOOK MEMORY                              |
|  - Scoped notebook instructions (study goal, purpose, preferred style)  |
|  - Owned by notebook creator, customizable per research workspace       |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                        SOURCE RELATIONSHIP GRAPH                        |
|  - Semantic link detection across documents & web sources               |
|  - Categorization: related, overlapping, supporting, contrasting,       |
|    dependent                                                            |
|  - Grounded in source analysis topics and chunk vector proximity        |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                        RESEARCH ACTIVITY TIMELINE                       |
|  - Structured audit trail: sources added, analyzed, questions asked,    |
|    insights saved, study tools generated                                |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                        PERSONALIZED KNOWLEDGE UX                        |
|  - Knowledge Overview (source counts, top topics, concept definitions)  |
|  - Deterministic Study Recommendations                                  |
|  - Universal Notebook Search (Sources, Chats, Insights, Study Tools)    |
|  - Saved Insights & Cross-Entity Bookmarks                              |
|  - Deep-Linked Citation Preview Panel                                   |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
|                      EXISTING GROUNDED RAG ENGINE                       |
|  - Grounding Authority: Source chunks ALWAYS override memory            |
|  - Memory provides stylistic alignment and learning objectives only    |
|  - Strict character and token context budgets                           |
+-------------------------------------------------------------------------+
```

---

## 2. Core Principles & Non-Negotiable Rules

1. **Grounded Source Authority**:
   Source documents remain the sole authoritative fact base. If a user memory or notebook instruction contradicts source text, source evidence strictly takes precedence.
2. **Explicit Memory Only**:
   Arbitrary chat conversations are never silently harvested into user memory. Memories are created exclusively via explicit user actions (e.g., clicking "Remember this", adding research interests, or configuring notebook goals).
3. **Strict Data Isolation**:
   Every database query across Memory, Saved Insights, Bookmarks, and Activity Logs verifies `userId: req.user._id` and `notebookId` ownership. Cross-user access is impossible (returns `404 Not Found`).
4. **Performance & Bounded Injection**:
   Only top relevant memories (max 3–5 items, capped at 1,500 characters total) are injected into RAG prompts to avoid context bloat and token waste.

---

## 3. Data Models

1. **`UserMemory`**: Persistent user-level preferences, goals, and instructions.
2. **`NotebookMemory`**: Workspace-specific research guidelines and style directives.
3. **`SourceRelationship`**: Graph edges connecting related or contrasting notebook sources.
4. **`SavedInsight`**: User-curated key findings from chat responses or study tools.
5. **`Bookmark`**: Quick-access bookmarks for sources, chat messages, insights, and study tools.
6. **`ActivityLog`**: Chronological event log tracking notebook exploration milestones.
