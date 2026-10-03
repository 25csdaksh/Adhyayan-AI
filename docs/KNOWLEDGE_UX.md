# StudyLM — Advanced Knowledge UX Architecture

## 1. Overview
Phase 13 introduces a comprehensive Knowledge UX layer built on top of the NotebookLM-style grounded intelligence foundation.

---

## 2. Core Knowledge UX Components

### 1. Citation Deep Linking & Chunk Preview (`SourcePreviewPanel` / `SourcePreviewModal`)
When users click on any citation badge `[1]`:
- Instantly fetches the exact source chunk.
- Displays surrounding chunk context (preceding and subsequent passages) for complete context.
- Shows page numbers (for PDFs) and live domain URLs (for web sources).
- Displays extracted document intelligence (title, source type, size, summary).

### 2. Source Relationship Graph (`SourceRelationshipsPanel`)
Detects relationships between uploaded documents and live web sources based on topic sets and source analysis:
- **Relationship Types**: `overlapping`, `supporting`, `contrasting`, `dependent`, `related`.
- **Confidence Scoring**: Deterministic Jaccard topic scoring ensures relationships are generated only with sufficient evidence.
- **Bi-directional Navigation**: Users can inspect relationships and jump directly into the source summaries.

### 3. Saved Insights & Cross-Entity Bookmarks (`SavedInsightsPanel`)
- **Saved Insights**: Save key findings from chat responses or study tool results. Preserves grounded citation references.
- **Bookmarks**: Unified bookmarking system across documents, web sources, chat messages, and study tool results with unique index constraints.

### 4. Universal Notebook Search (`UniversalSearchModal`)
- Fast, unified search across **Sources**, **Chats**, **Insights**, and **Study Tools**.
- Uses MongoDB indexes for metadata/text matching, avoiding unnecessary expensive embedding computations for UI search.

### 5. Research Activity Timeline (`ActivityTimelinePanel`)
- Audit trail recording milestones: `source_added`, `source_analyzed`, `question_asked`, `insight_saved`, `study_tool_generated`, `source_refreshed`.
- Privacy-conscious: never logs sensitive raw chat contents or passwords.

### 6. Knowledge Overview & Personalized Recommendations (`KnowledgeOverviewPanel`)
- Comprehensive dashboard showing source distributions, processing health, top topics, and key concepts.
- **Personalized Study Recommendations**: Deterministically suggests topics to review, study tools to generate, and related source comparisons based strictly on actual workspace activity.

---

## 3. UI Integration & Studio Layout
The right panel of the Notebook Workspace features a 6-tab Studio switcher:
1. **Overview**: Knowledge dashboard, topic index, and study recommendations.
2. **Study**: Flashcards, practice quizzes, study guides, mind maps, glossaries, FAQs.
3. **Research**: Deep web research and live search synthesis.
4. **Insights**: Saved research findings and citation references.
5. **Relations**: Semantic document relationship explorer.
6. **Timeline**: Event history and research milestones.
