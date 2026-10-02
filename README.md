# StudyLM — AI Study & Research Platform

> A production-grade, NotebookLM-style AI study and research platform that allows users to create notebooks, upload documents (PDF, DOCX, TXT), ingest web URLs, ask questions grounded in their sources with citations, and generate summaries, notes, flashcards, and quizzes.

---

## 📌 Status: Phase 02 Completed (UI/UX & Design System)

- **Phase 01:** Foundation, Monorepo, Express Backend, MongoDB, CORS, `/api/health` *(Verified)*
- **Phase 02:** Light-First Academic UI/UX, Design System, Landing Page, Dashboard, 3-Panel Workspace, Chat UI, Source Management, Settings, Profile *(Verified)*
- **Phase 03:** Authentication & Security *(Upcoming)*
- **Phase 04:** Document Ingestion & Storage *(Upcoming)*
- **Phase 05:** Vector Search & Gemini RAG *(Upcoming)*

---

## 🎨 Design System & Palette (60:30:10 Rule)

StudyLM utilizes a light-first, academic + AI research design system:

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
- **Styling:** Tailwind CSS v4 (Custom academic design tokens)
- **HTTP Client:** Axios (configured with interceptors & normalized error handling)
- **Icons:** Lucide React
- **Typography:** Plus Jakarta Sans & Inter

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose ODM)
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
│   ├── package.json                    # Backend dependencies and scripts
│   └── src/
│       ├── config/
│       │   ├── db.js                   # Resilient MongoDB Mongoose connection handler
│       │   └── env.js                  # Environment variable loader & validator
│       ├── controllers/
│       │   └── health.controller.js    # GET /api/health controller with system metrics
│       ├── middlewares/
│       │   ├── errorHandler.js         # Centralized global error handling middleware
│       │   └── notFound.js             # 404 unmatched route handler
│       ├── routes/
│       │   ├── health.routes.js        # Route definitions for /api/health
│       │   └── index.js                # Main router mounting all domain routes
│       ├── utils/
│       │   ├── apiError.js             # Custom ApiError class with status codes
│       │   ├── apiResponse.js          # Standardized JSON response envelope
│       │   └── asyncHandler.js         # Controller async wrapper helper
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
        │   ├── apiClient.js            # Configured Axios instance with interceptors
        │   └── healthService.js        # Health check API service call
        ├── components/
        │   ├── chat/
        │   │   ├── ChatInput.jsx       # Chat input with prompt chips & source attachment
        │   │   ├── ChatMessage.jsx     # Markdown formatting, citations & actions
        │   │   └── CitationCard.jsx    # Distinct citation pills with excerpt preview
        │   ├── common/
        │   │   ├── Loader.jsx          # Reusable loading spinner
        │   │   └── StatusBadge.jsx     # Status badge with live ping indicators
        │   ├── layout/
        │   │   ├── AppLayout.jsx       # Workspace shell with sidebar & mobile drawer
        │   │   ├── AppNavbar.jsx       # Application header with global search & notifications
        │   │   ├── AppSidebar.jsx      # Desktop sidebar & responsive navigation
        │   │   ├── Footer.jsx          # System footer
        │   │   ├── LandingFooter.jsx   # Public landing footer
        │   │   ├── LandingNavbar.jsx   # Public landing navigation
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
        │   └── ToastContext.jsx        # Toast notification system
        ├── mock/
        │   └── mockData.js             # High-quality mock notebooks, sources & chat
        ├── pages/
        │   ├── DashboardPage.jsx       # Personalized study dashboard
        │   ├── HealthPage.jsx          # Live diagnostic health inspector
        │   ├── HomePage.jsx            # Architectural monitor
        │   ├── LandingPage.jsx         # Public product landing page
        │   ├── NotebookWorkspacePage.jsx # 3-panel intelligent workspace
        │   ├── NotFoundPage.jsx        # 404 error page
        │   ├── ProfilePage.jsx         # User profile & research stats
        │   └── SettingsPage.jsx        # Preferences, AI model & privacy
        ├── routes/
        │   └── AppRoutes.jsx           # React Router route registry
        ├── App.jsx                     # Root application with ToastProvider
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
- `/dashboard` — Notebooks Dashboard
- `/notebooks/:id` — 3-Panel Study & Research Workspace
- `/settings` — Preferences, Appearance & AI Grounding Settings
- `/profile` — User Profile & Research Storage Quotas
- `/health` — Live Backend & MongoDB System Diagnostics
- `*` — 404 Error Page
