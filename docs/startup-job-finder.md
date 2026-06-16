# 🚀 Startup Job Finder Module

> **Module:** `startup-job-finder`
> **Route:** `/startup-jobs`
> **Status:** Planned — implementation doc
> **Part of:** AI Career Coach (`carrer-coach-ai`)

---

## Table of Contents

- [Overview](#overview)
- [User Flow](#user-flow)
- [Features](#features)
- [Team Size Filter System](#team-size-filter-system)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [AI Strategy](#ai-strategy)
- [Component Tree](#component-tree)
- [File Structure](#file-structure)
- [Implementation Plan (Phases)](#implementation-plan-phases)
- [Environment Variables](#environment-variables)
- [Open Questions](#open-questions)

---

## Overview

The **Startup Job Finder** module lets users paste their resume and describe their target job profile. The AI then matches them with **real actively-hiring startups**, ranked and filterable by **team size**. This gives junior and mid-level candidates access to startup opportunities that are hard to discover on traditional job boards.

### Why startups by team size?

| Team Size | What it means for candidates |
|-----------|------------------------------|
| **1–10** (Micro) | Founding engineer / early hire; high equity, high ownership, high risk |
| **11–50** (Seed) | Core team; still early enough to shape culture and stack |
| **51–200** (Series A) | Scaling phase; structured teams, clearer career ladders |
| **201–500** (Series B) | Large startup; more process, good comp, less ambiguity |
| **500+** (Late-stage) | Near big-company structure; startup upside fading |

Filtering by team size lets users self-select their risk tolerance and desired work environment.

---

## User Flow

```
/startup-jobs

  Step 1 ─ INPUT
  ┌──────────────────────┐  ┌───────────────────────┐
  │  Resume              │  │  Job Profile           │
  │  (auto-fill saved    │  │  ∙ Target role         │
  │   resume or paste)   │  │  ∙ Tech stack          │
  │                      │  │  ∙ Location preference │
  └──────────────────────┘  └───────────────────────┘

  Step 2 ─ FILTER (adjustable before/after search)
  [ All ] [ 1–10 ] [ 11–50 ] [ 51–200 ] [ 201–500 ] [ 500+ ]
  [ Remote only ]  [ Seed | Series A | Series B | Series C+ ]

  Step 3 ─ Click "Find Startups"  →  AI runs

  Step 4 ─ RESULTS GRID
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │Startup A │  │Startup B │  │Startup C │  …
  │Team:  12 │  │Team:  45 │  │Team: 180 │
  │Match: 92%│  │Match: 87%│  │Match: 81%│
  │ [Apply]  │  │ [Apply]  │  │ [Apply]  │
  └──────────┘  └──────────┘  └──────────┘
```

---

## Features

### 1. Resume Input

- **Auto-fill** from the user's saved `Resume` (markdown from DB via server action).
- User can **paste a different resume** or override any section.
- Text is stripped of markdown before being sent to the AI for cleaner context.

### 2. Job Profile Form

| Field | Type | Required | Example |
|-------|------|----------|---------|
| Target Role | Text | ✅ | "Full-Stack Engineer", "Product Designer" |
| Tech Stack | Tag input / text | ✅ | "React, Node.js, PostgreSQL" |
| Experience Level | Select | ✅ | Fresher / Junior / Mid / Senior / Lead |
| Location | Text | ❌ | "Bangalore", "Remote", "US only" |
| Work Mode | Radio | ❌ | Remote / Hybrid / On-site / Any |
| Preferred Industries | Multi-select | ❌ | FinTech, HealthTech, SaaS, EdTech |

### 3. Team Size Filters _(Core Feature)_

Multi-selectable chips — applied instantly on the client:

| Tier | Label | Range | Color |
|------|-------|-------|-------|
| 🟣 | Micro | 1–10 | Purple |
| 🔵 | Seed | 11–50 | Blue |
| 🟢 | Series A | 51–200 | Green |
| 🟡 | Series B | 201–500 | Yellow |
| 🟠 | Late Stage | 500+ | Orange |

### 4. Startup Result Cards

Each card displays:
- Company name + logo (favicon fallback)
- One-line tagline
- **Team size** badge (colour-coded by tier)
- **Funding stage** tag (Seed, Series A, Bootstrapped, etc.)
- **Tech stack** pills
- **Open roles** matching the user's profile
- **AI Match score** (0–100%)
- **Why it matches** — 1–2 sentence AI reasoning
- Links: Website · LinkedIn · Crunchbase · Careers page

### 5. Sorting

- Match score — default, highest first
- Team size — ascending / descending
- Funding stage
- Most recently hiring

### 6. Search History

- Every search is saved to DB (`JobSearch` model).
- Users can reload any past search from the history panel.
- Soft cap: 10 searches per user retained.

---

## Team Size Filter System

Filtering is **client-side** — no extra AI call needed when changing the tier selection.

```js
// data/team-size-tiers.js

export const TEAM_SIZE_TIERS = [
  { id: "micro",      label: "Micro",      range: [1, 10],       color: "purple", emoji: "🟣" },
  { id: "seed",       label: "Seed",       range: [11, 50],      color: "blue",   emoji: "🔵" },
  { id: "series-a",   label: "Series A",   range: [51, 200],     color: "green",  emoji: "🟢" },
  { id: "series-b",   label: "Series B",   range: [201, 500],    color: "yellow", emoji: "🟡" },
  { id: "late-stage", label: "Late Stage", range: [501, Infinity], color: "orange", emoji: "🟠" },
];

export function getTier(teamSize) {
  return TEAM_SIZE_TIERS.find(
    (t) => teamSize >= t.range[0] && teamSize <= t.range[1]
  );
}
```

When `selectedTiers` is empty → show all results.

---

## Architecture

```
Browser
│
├── /startup-jobs  (Next.js server component)
│     └── pre-loads: saved resume content + search history from DB
│
├── StartupJobFinder  (client component — main state holder)
│     ├── ResumeInput          auto-fill / paste resume
│     ├── JobProfileForm       role, stack, location, work mode, industries
│     ├── TeamSizeFilter       multi-select tier chips
│     └── handleSearch()  ──▶  server action: findStartups()
│
├── actions/startup-jobs.js  (server actions)
│     ├── getAuthenticatedUser()
│     ├── loadSavedResume()         reads user.resume.content from DB
│     ├── buildPrompt()             assembles AI prompt
│     ├── generateText()            calls Groq / Gemini
│     ├── parseJsonResponse()
│     ├── saveJobSearch()           persists to DB
│     └── returns StartupResult[]
│
└── StartupResultsGrid  (client — no server calls)
      ├── TeamSizeFilter   instant client-side re-filter
      ├── SortBar
      └── StartupCard × N
```

### Data Sources

The AI returns **real, publicly known startups** that:
1. Match the user's tech stack and target role
2. Are known to actively hire (based on model training data)
3. Fit the location / remote preference

> ⚠️ **Phase 1 note:** LLMs don't have live job board access — results come from the model's training knowledge. Phase 2 will integrate live APIs (Wellfound, Greenhouse) to verify and enrich results.

---

## Database Schema

### New model — add to `prisma/schema.prisma`

```prisma
model JobSearch {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // Inputs stored for reload
  resumeText  String   @db.Text
  targetRole  String
  techStack   String[]
  location    String?
  workMode    String?     // "remote" | "hybrid" | "onsite" | "any"
  experience  String?     // "fresher" | "junior" | "mid" | "senior" | "lead"
  industries  String[]

  // AI output
  results     Json        // StartupResult[]
  resultCount Int         @default(0)

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([userId, createdAt])
}
```

### Add relation to `User` model

```prisma
model User {
  // ... existing fields ...
  jobSearches JobSearch[]
}
```

### `StartupResult` TypeScript shape (stored in JSON)

```ts
type StartupResult = {
  id: string;            // generated uuid
  name: string;          // "Razorpay"
  tagline: string;       // "Payment infrastructure for India"
  website: string;       // "https://razorpay.com"
  linkedinUrl?: string;
  crunchbaseUrl?: string;
  jobsUrl?: string;      // careers page
  teamSize: number;      // 320
  fundingStage: string;  // "Series D"
  techStack: string[];   // ["React", "Go", "Kafka"]
  openRoles: string[];   // ["Senior Frontend Engineer", "DevOps Lead"]
  matchScore: number;    // 87
  matchReason: string;   // "Your React + Node.js background aligns with..."
  location: string;      // "Bangalore / Remote"
  industry: string;      // "FinTech"
  founded?: number;      // 2014
  remote: boolean;
};
```

---

## API Design

### `actions/startup-jobs.js` — Server Actions

```js
/**
 * Primary: run AI search and save to DB.
 * Returns saved search ID + results array.
 */
export async function findStartups({ resumeText, jobProfile })
  // → Promise<{ id: string, results: StartupResult[], createdAt: Date }>

/**
 * Load the user's saved resume for auto-fill.
 */
export async function getSavedResume()
  // → Promise<string | null>   (markdown content)

/**
 * History
 */
export async function getJobSearchHistory()
  // → Promise<JobSearch[]>    (light fields: id, targetRole, resultCount, createdAt)

export async function getJobSearchById(id)
  // → Promise<JobSearch>      (full record including results JSON)

export async function deleteJobSearch(id)
  // → Promise<void>
```

### Optional REST route (Phase 2)

```
GET /api/startups?role=engineer&stack=react,node&location=remote
```

Used to call live job board APIs (Wellfound, Greenhouse) and merge with AI results.

---

## AI Strategy

### Full prompt

```
You are a startup talent scout AI. Based on the user's resume and target job profile,
recommend 8–12 real, actively-hiring startups that are a strong match.

## User Resume
---
{resumeText — truncated to 4000 chars}
---

## Target Job Profile
- Role: {targetRole}
- Tech Stack: {techStack.join(", ")}
- Experience: {experience}
- Location preference: {location || "any"}
- Work mode: {workMode || "any"}
- Preferred industries: {industries.join(", ") || "any"}

Return ONLY valid JSON — an array of startup objects:
[
  {
    "name": "string",
    "tagline": "string — max one line",
    "website": "https://...",
    "linkedinUrl": "https://linkedin.com/company/...",
    "teamSize": 45,
    "fundingStage": "Series A",
    "techStack": ["React", "Node.js"],
    "openRoles": ["Senior Frontend Engineer"],
    "matchScore": 88,
    "matchReason": "2-sentence explanation of why this startup fits the user's profile",
    "location": "Bangalore / Remote",
    "industry": "FinTech",
    "remote": true
  }
]

Rules:
- Only recommend real, named startups. No invented or placeholder companies.
- matchScore: 0–100, weighted by tech stack overlap, role fit, location, and growth stage.
- teamSize must be a realistic integer from your training knowledge.
- Order results by matchScore descending.
- Include a healthy mix of team sizes (micro → late-stage) unless the profile
  strongly narrows the preference.
- Focus on startups known to have active engineering/product hiring cultures.
```

### Token budget

| Component | Approx. tokens |
|-----------|---------------|
| Resume (4000 chars) | ~1 000 |
| Prompt overhead | ~350 |
| Response (12 startups) | ~2 400 |
| **Total** | **~3 750** |

Well within Groq Llama 3.3 70B and Gemini 2.5 Flash limits.

---

## Component Tree

```
app/(main)/startup-jobs/
├── page.jsx                          Server component
│                                     Loads: saved resume + search history
└── _components/
    ├── startup-job-finder.jsx        Client — main state orchestrator
    ├── resume-input.jsx              Textarea + "Use saved resume" button
    ├── job-profile-form.jsx          Role, stack, experience, location, work mode
    ├── team-size-filter.jsx          Multi-select tier chips (instant client filter)
    ├── sort-bar.jsx                  Sort by match score / team size / stage
    ├── startup-results-grid.jsx      Applies active filter + sort, renders cards
    ├── startup-card.jsx              Individual startup result card
    ├── startup-skeleton.jsx          Animated loading skeleton (8 placeholder cards)
    └── search-history-panel.jsx      Sidebar / dropdown of past searches
```

---

## File Structure

```
carrer-coach-ai/
├── app/
│   └── (main)/
│       └── startup-jobs/
│           ├── page.jsx                        [NEW]
│           └── _components/
│               ├── startup-job-finder.jsx      [NEW]
│               ├── resume-input.jsx            [NEW]
│               ├── job-profile-form.jsx        [NEW]
│               ├── team-size-filter.jsx        [NEW]
│               ├── sort-bar.jsx                [NEW]
│               ├── startup-results-grid.jsx    [NEW]
│               ├── startup-card.jsx            [NEW]
│               ├── startup-skeleton.jsx        [NEW]
│               └── search-history-panel.jsx    [NEW]
│
├── actions/
│   └── startup-jobs.js                         [NEW]
│
├── data/
│   └── team-size-tiers.js                      [NEW]
│
├── docs/
│   └── startup-job-finder.md                   [THIS FILE]
│
└── prisma/
    └── schema.prisma                           [MODIFY — JobSearch + User relation]
```

---

## Implementation Plan (Phases)

### Phase 1 — Core MVP

- [ ] `prisma/schema.prisma` — add `JobSearch` model + `User.jobSearches` relation
- [ ] `npx prisma migrate dev --name add_job_search`
- [ ] `data/team-size-tiers.js` — tier definitions + `getTier()` helper
- [ ] `actions/startup-jobs.js`
  - `getSavedResume()`
  - `findStartups()` — prompt + AI call + save to DB
  - `getJobSearchHistory()`
  - `getJobSearchById()`
  - `deleteJobSearch()`
- [ ] `app/(main)/startup-jobs/page.jsx` — server: load resume + history, pass as props
- [ ] `_components/resume-input.jsx`
- [ ] `_components/job-profile-form.jsx`
- [ ] `_components/team-size-filter.jsx`
- [ ] `_components/startup-card.jsx`
- [ ] `_components/startup-skeleton.jsx`
- [ ] `_components/startup-results-grid.jsx`
- [ ] `_components/sort-bar.jsx`
- [ ] `_components/search-history-panel.jsx`
- [ ] `_components/startup-job-finder.jsx` — wire everything together
- [ ] Add "Startup Jobs" link to `components/header.jsx`

### Phase 2 — Live Data Enrichment

- [ ] Wellfound (AngelList) API integration — live job listings
- [ ] Crunchbase Basic API — verify team size + funding stage
- [ ] Clearbit Logo API — company logo images
- [ ] Bookmark / save startup feature (`SavedStartup` model)
- [ ] Inngest weekly cron — email digest of new matching startups

### Phase 3 — Intelligence & Tracking

- [ ] Application Tracker — mark startups as Applied / Interviewing / Offer / Rejected
- [ ] Re-rank based on user's application history and feedback signals
- [ ] Push notification when a bookmarked startup posts a new matching role
- [ ] Skills gap report — compare user stack to startup's open role requirements

---

## Environment Variables

Phase 1 uses existing keys — **no new env vars required**.

| Variable | Description | Phase |
|----------|-------------|-------|
| `GROQ_API_KEY` | Already present in `.env` | 1 |
| `WELLFOUND_API_KEY` | Wellfound Talent API | 2 |
| `CRUNCHBASE_API_KEY` | Crunchbase Basic enrichment | 2 |
| `CLEARBIT_API_KEY` | Logo / company data | 2 |

---

## Open Questions

Decisions needed before coding begins:

1. **AI backend** — Use existing Groq (`lib/groq.js`) or Gemini for this module?
   - *Recommendation:* Groq is faster and cheaper for structured JSON; use Groq.

2. **Result caching** — Cache AI results for identical inputs (hash of resume + job profile) for 24 h to avoid redundant API calls?

3. **Team size accuracy** — LLMs can hallucinate team sizes. Add disclaimer ("Approximate — verify on LinkedIn/Crunchbase") on each card, or build a verification step?

4. **Navigation placement** — "Startup Jobs" directly in header nav, or under a "Jobs" dropdown (future home of Job Tracker too)?

5. **Search history limit** — Hard cap at 10, or unlimited with pagination?

6. **Resume source** — Accept only the saved resume (auto-filled), or allow paste-in of a completely different version (e.g. role-specific)?

---

## Related Modules

| Module | How it connects |
|--------|----------------|
| **Resume Builder** (`/resume`) | Auto-fills resume text for searches |
| **ATS Score** (`/ats-score`) | Optimise resume before searching |
| **AI Cover Letter** (`/ai-cover-letter`) | Generate tailored letter for a found startup |
| **Profile Optimizer** (`/profile-optimize`) | Optimise LinkedIn before cold-reaching a startup |

---

*Document version: 1.0 — 2026-06-15*
*Module owner: AI Career Coach Dev Team*
