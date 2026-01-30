# AI Career Coach

An AI-powered career coaching platform that helps professionals build ATS-optimized resumes, generate cover letters, prepare for interviews, and stay ahead with industry insights—all powered by Google Gemini AI.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [System Design](#system-design)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Future Improvements](#future-improvements)

---

## Overview

**AI Career Coach** is a full-stack Next.js application that provides:

- **Personalized onboarding** — Users set industry, skills, and experience for tailored guidance.
- **Resume builder** — Create and edit markdown resumes with AI assistance.
- **ATS score analysis** — Upload PDF/DOCX resumes and get structured scores and feedback (content, format, style, sections, skills).
- **AI cover letters** — Generate job-specific cover letters from profile and job description.
- **Interview preparation** — AI-generated multiple-choice quizzes by industry/skills, with assessments and performance tracking.
- **Industry insights** — Salary ranges, growth rate, demand level, top skills, market outlook, and trends for the user’s industry (cached in DB, refreshed via Inngest cron).

Authentication is handled by **Clerk**; data is stored in **PostgreSQL** with **Prisma**. Background jobs (e.g. industry insight refresh) use **Inngest** with **Gemini** for AI.

---

## Features

### 1. Landing & Marketing

- **Hero section** with CTA to sign up or go to dashboard.
- **Features** — AI career guidance, interview prep, industry insights, smart resume creation.
- **Stats** — Industries covered, interview questions, success rate, 24/7 support.
- **How it works** — Onboarding → Documents → Interview prep → Progress tracking.
- **Testimonials** and **FAQ** accordion.
- **CTA** to start journey (links to dashboard).

### 2. Authentication (Clerk)

- **Sign In / Sign Up** — Clerk-hosted flows under `(auth)/sign-in` and `(auth)/sign-up`.
- **Protected routes** — Dashboard, resume, interview, AI cover letter, onboarding.
- **Middleware** — Redirects unauthenticated users to sign-in on protected paths.
- **User sync** — `checkUser` ensures Clerk users exist in the app database (Prisma `User`).

### 3. Onboarding

- **First-time flow** — New users are redirected to `/onboarding` until they complete it.
- **Form** — Industry (from predefined list), skills, experience, bio, etc.
- **Redirect** — After onboarding, users go to `/dashboard`.

### 4. Dashboard (Industry Insights)

- **Industry insights** for the user’s industry:
  - Salary ranges (role, min, max, median) with bar chart.
  - Growth rate, demand level, market outlook.
  - Top skills, key trends, recommended skills.
- **Data source** — Stored in `IndustryInsight`; generated on first visit or via Inngest cron (Gemini).
- **Last updated / next update** badges.

### 5. Resume Builder

- **Single resume per user** — Stored in `Resume` (markdown `content`).
- **Rich editor** — Markdown editing with live preview (e.g. `@uiw/react-md-editor`).
- **Server actions** — Load and save resume via `actions/resume.js`.
- **Export** — Optional PDF export (e.g. `html2pdf.js`).

### 6. ATS Score Analysis

- **Upload** — PDF or DOCX, max 2MB, drag-and-drop or file picker.
- **API** — `POST /api/ats-analyze` receives file, calls server action `analyzeResume`.
- **Backend** — Extracts text (e.g. `pdf-parse`, `mammoth`), sends to Gemini with a strict JSON prompt.
- **Response** — Overall score, category scores (content, format/brevity, style, sections, skills), per-item status (pass/fail/locked) and detail, plus content details with snippets and feedback.
- **UI** — Score display, category breakdowns, and actionable feedback.

### 7. AI Cover Letter

- **List** — All cover letters for the user (`/ai-cover-letter`).
- **Create** — Form: company name, job title, job description → `generateCoverLetter` server action.
- **AI** — Gemini uses user profile (industry, experience, skills, bio) + job details to generate markdown letter.
- **Storage** — `CoverLetter` model (content, jobDescription, companyName, jobTitle, status).
- **Preview/Edit** — View and edit individual letters (`/ai-cover-letter/[id]`, `/ai-cover-letter/new`).

### 8. Interview Preparation

- **Quiz generation** — `generateQuiz` server action: Gemini returns 10 multiple-choice questions (4 options, correct answer, explanation) based on user industry and skills.
- **Assessments** — Each attempt saved as `Assessment` (quizScore, questions JSON, category, improvementTip).
- **UI** — Stats cards, performance chart (e.g. Recharts), list of past assessments with option to retake or view results.
- **Mock interview** — Optional mock flow under `/interview/mock`.

### 9. Background Jobs (Inngest)

- **Inngest** — Serves `/api/inngest` and runs serverless functions.
- **Cron** — “Generate Industry Insights” runs weekly (e.g. Sunday midnight); for each `IndustryInsight` row, calls Gemini to refresh salary ranges, growth, demand, skills, trends, outlook, and updates the DB.
- **AI** — Uses Inngest’s Gemini integration (`step.ai.wrap`) for reliable, retriable AI calls.

### 10. UI & UX

- **Next.js 15** — App Router, React 19, async server components where applicable.
- **Tailwind CSS** — Styling and layout.
- **Radix UI** — Accordion, alert dialog, dialog, dropdown, tabs, progress, etc.
- **shadcn-style components** — Button, Card, Input, Label, Select, Textarea, Badge, etc.
- **Theme** — `next-themes` for light/dark; `ThemeProvider` and global CSS variables.
- **Notifications** — Sonner toasts for errors and success.
- **Responsive** — Mobile-friendly layout and header (e.g. dropdown for growth tools).

---

## Tech Stack

| Layer        | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 15 (App Router, Turbopack)  |
| UI          | React 19, Tailwind CSS 4, Radix UI |
| Auth        | Clerk                               |
| Database    | PostgreSQL + Prisma 7               |
| AI          | Google Gemini (e.g. 2.5 Flash)     |
| Background  | Inngest                             |
| Forms       | React Hook Form, Zod                |
| Charts      | Recharts                            |
| Markdown    | @uiw/react-md-editor                |
| PDF/DOCX    | pdf-parse, mammoth                  |

---

## Project Structure

```text
carrer-coach-ai/
├── app/
│   ├── (auth)/              # Clerk sign-in, sign-up
│   ├── (main)/              # Protected app routes
│   │   ├── dashboard/       # Industry insights
│   │   ├── resume/          # Resume builder
│   │   ├── ats-score/       # ATS analysis page
│   │   ├── ai-cover-letter/ # Cover letter list, new, [id]
│   │   ├── interview/       # Quiz, assessments, mock
│   │   └── onboarding/      # First-time onboarding
│   ├── api/
│   │   ├── ats-analyze/     # POST resume analysis
│   │   └── inngest/         # Inngest webhook
│   ├── layout.js, page.jsx  # Root layout, landing
│   └── lib/                 # Schemas, helpers
├── actions/                 # Server actions
│   ├── ats-score.js
│   ├── cover-letter.js
│   ├── dashboard.js
│   ├── interview.js
│   ├── resume.js
│   └── user.js
├── components/              # Shared UI (header, hero, theme, ui/)
├── data/                    # Static data (features, faqs, industries, etc.)
├── hooks/                   # e.g. use-fetch
├── lib/                     # Prisma, Inngest client/functions, checkUser, utils
├── prisma/
│   ├── schema.prisma        # User, Assessment, Resume, CoverLetter, IndustryInsight
│   └── migrations/
├── public/                  # Logo, banners
└── scripts/                 # Utilities (e.g. check-pdf)
```

---

## System Design

### High-level architecture

```text
┌─────────────┐     ┌──────────────────────────────────────────────────┐
│   Browser   │────▶│  Next.js App (App Router)                         │
│   (Clerk)   │     │  - Landing, (auth), (main) routes                 │
└─────────────┘     │  - API routes: /api/ats-analyze, /api/inngest     │
                   └───────────────┬────────────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Clerk           │     │  PostgreSQL     │     │  Google Gemini   │
│  (Auth, User)    │     │  (Prisma ORM)    │     │  (AI)            │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                  │
                                  │  Events
                                  ▼
                         ┌─────────────────┐
                         │  Inngest        │
                         │  (Cron: weekly  │
                         │   industry      │
                         │   insights)     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Gemini (AI)    │
                         └─────────────────┘
```

### Data flow (summary)

1. **User** — Signs in with Clerk; middleware protects routes; `checkUser` ensures a `User` row in DB (linked by `clerkUserId`).
2. **Onboarding** — Form updates `User` (industry, skills, experience, bio); then redirect to dashboard.
3. **Dashboard** — Load `User` + `IndustryInsight` by `user.industry`; if none, generate via Gemini and create `IndustryInsight`; display salary chart, skills, trends, outlook.
4. **Resume** — Load/save single `Resume` by `userId`; optional ATS analysis via upload → API → extract text → Gemini → structured JSON → UI.
5. **Cover letter** — Form (company, title, description) → `generateCoverLetter` (Gemini + user profile) → create `CoverLetter` → list/detail/preview.
6. **Interview** — `generateQuiz` (Gemini, industry + skills) → user submits answers → create `Assessment`; dashboard shows history and performance.
7. **Industry insights refresh** — Inngest cron triggers function; for each `IndustryInsight`, call Gemini; parse JSON; update same row (salaryRanges, growthRate, demandLevel, topSkills, keyTrends, marketOutlook, recommendedSkills, lastUpdated, nextUpdate).

### Main models (Prisma)

- **User** — clerkUserId, email, name, industry, experience, skills, bio; relation to IndustryInsight, Assessment, Resume, CoverLetter.
- **IndustryInsight** — industry (unique), salaryRanges JSON, growthRate, demandLevel, topSkills, keyTrends, marketOutlook, recommendedSkills, lastUpdated, nextUpdate.
- **Resume** — userId (unique), content (markdown).
- **CoverLetter** — userId, content, jobDescription, companyName, jobTitle, status.
- **Assessment** — userId, quizScore, questions JSON, category, improvementTip.

### Security

- **Auth** — All protected routes require Clerk session; middleware redirects unauthenticated users.
- **Server actions** — Use `auth()` from Clerk; resolve `User` by `clerkUserId`; all mutations scoped to current user.
- **API** — `/api/ats-analyze` is called from client after auth; consider adding rate limits and file validation in production.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Clerk account
- Google AI (Gemini) API key
- Inngest account (for cron jobs)

### Install and run

```bash
# Install dependencies
npm install

# Set environment variables (see below)
cp .env.example .env
# Edit .env with your keys

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Development
npm run dev
```

- App: `http://localhost:3000`
- Inngest Dev Server: run separately if you use local Inngest (see Inngest docs).

### Build and start

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable           | Description                    | Required |
|--------------------|--------------------------------|----------|
| `DATABASE_URL`     | PostgreSQL connection string   | Yes      |
| `NEXT_PUBLIC_CLERK_*` | Clerk publishable keys, sign-in/up URLs, etc. | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key               | Yes      |
| `GEMINI_API_KEY`   | Google AI (Gemini) API key     | Yes (for AI and Inngest) |
| `INNGEST_*`        | Inngest keys/URLs if using Inngest | For cron |

Add a `.env.example` in the repo (without secrets) so new contributors know which variables to set.

---

## Future Improvements

### Product & features

- **Resume ATS vs job description** — Compare resume to a specific job description and suggest keyword and experience alignment.
- **Multiple resumes** — Support several resumes per user (e.g. by role or industry).
- **Cover letter ATS check** — Score cover letters for clarity and keyword match.
- **Interview: free-form Q&A** — Simulate real interviews with open-ended questions and AI feedback (e.g. speech-to-text or typed).
- **Interview: video mock** — Optional recording and AI feedback on tone and clarity.
- **Skills gap analysis** — Compare user skills to industry `topSkills` and `recommendedSkills` and suggest learning paths.
- **Job recommendations** — Use profile + industry insights to suggest roles or companies (e.g. from job boards API).
- **Application tracker** — Track applications (company, role, status, dates) and link to resumes/cover letters.

### Technical & UX

- **Caching & performance** — Cache industry insights and ATS results; use React cache or Redis where useful.
- **Rate limiting** — Limit `/api/ats-analyze` and AI server actions per user/IP to avoid abuse and control cost.
- **Resume parsing** — More robust PDF/DOCX parsing and section detection; optional re-run of ATS when resume is updated.
- **Error handling** — Clear user messages for AI/API failures; retries for transient errors.
- **Testing** — Unit tests for server actions and API routes; E2E for critical flows (onboarding, resume save, ATS upload, cover letter generation).
- **i18n** — Multi-language support for landing and app (e.g. next-intl).
- **Accessibility** — Full keyboard navigation, ARIA labels, and screen reader checks for forms and charts.
- **Monitoring** — Logging and error tracking (e.g. Sentry); basic analytics for feature usage.

### Infrastructure & DevOps

- **CI/CD** — Automated lint, test, and deploy (e.g. Vercel).
- **Database** — Connection pooling (e.g. Prisma Accelerate or PgBouncer) for serverless.
- **Inngest** — Add more functions (e.g. nightly digest, scheduled “refresh industry” per user) and stricter idempotency.

### Security & compliance

- **Audit** — Log sensitive actions (e.g. data export, profile changes).
- **Data retention** — Policy and jobs to delete or anonymize old assessments and cover letters.
- **Compliance** — Align with GDPR/CCPA if storing EU/US user data (consent, export, delete).

---

## License

Private. All rights reserved.
