# System Architecture Overview

## Product Vision

AI Career Coach is a SaaS platform that helps professionals build resumes, score ATS compatibility, generate cover letters, prepare for interviews, and stay informed about their industry's job market — all personalized to their profile.

**Current maturity:** Functional MVP / early beta  
**Target maturity:** Production-grade SaaS with subscriptions, analytics, and compliance

---

## High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│  Landing │ Clerk Auth │ Dashboard │ Resume │ ATS │ Cover Letter │ Quiz  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP ROUTER (Node.js)                      │
│                                                                         │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │ Middleware  │  │ Server Actions   │  │ API Routes                  │ │
│  │ (Clerk)     │  │ actions/*.js     │  │ /api/ats-analyze            │ │
│  └─────────────┘  └──────────────────┘  │ /api/inngest                │ │
│                                         └─────────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │ lib/groq.js │  │ lib/prisma.js    │  │ lib/inngest/            │ │
│  │ (AI client) │  │ (DB client)      │  │ (cron jobs)             │ │
│  └─────────────┘  └──────────────────┘  └─────────────────────────┘ │
└──────────────┬──────────────────┬──────────────────┬──────────────────┘
               │                  │                  │
               ▼                  ▼                  ▼
        ┌──────────┐      ┌─────────────┐    ┌─────────────┐
        │  Clerk   │      │ PostgreSQL  │    │  Groq API   │
        │  (Auth)  │      │  (Prisma)   │    │  (LLM)      │
        └──────────┘      └─────────────┘    └─────────────┘
```

---

## Request Flow Patterns

### Pattern A — Server Action (Primary)

Used for: resume save, cover letter generation, quiz, dashboard data.

```text
Client Component
  → useFetch hook / form action
  → Server Action (actions/*.js)
  → auth() + resolve User by clerkUserId
  → Prisma / Groq
  → return data or throw
```

### Pattern B — API Route (File Upload)

Used for: ATS resume upload (multipart form data).

```text
Client fetch("/api/ats-analyze", { body: formData })
  → app/api/ats-analyze/route.js
  → analyzeResume(formData) in actions/ats-score.js
  → extract PDF/DOCX text → Groq → JSON
```

### Pattern C — Background Job

Used for: weekly industry insight refresh.

```text
Inngest Cron (Sunday 00:00)
  → lib/inngest/function.js
  → For each IndustryInsight row → Groq → update DB
```

---

## Route Groups

| Group | Path | Auth | Purpose |
|-------|------|------|---------|
| Public | `/` | No | Landing page |
| Auth | `/sign-in`, `/sign-up` | No | Clerk flows |
| Main | `/dashboard`, `/resume`, etc. | Yes (middleware) | App features |

**Note:** `/ats-score` is not in the middleware protected list. Add it for consistency.

---

## Cross-Cutting Concerns

| Concern | Current State | Target State |
|---------|---------------|--------------|
| Authentication | Clerk + middleware | + session refresh, org/team support |
| Authorization | Per-user DB scoping | + RBAC, admin roles |
| AI calls | Direct Groq fetch | + rate limits, cost tracking, model routing |
| Error handling | Generic throws | Structured errors + Sentry |
| Validation | Zod on some forms | Zod on all inputs + API |
| Caching | None | Redis / React cache for insights |
| Testing | None | Unit + E2E + CI |
| Monitoring | console.log | Sentry + analytics |
| Payments | None | Stripe subscriptions |

---

## Directory Conventions

```text
app/(main)/<feature>/
  page.jsx          # Route entry (server or client)
  layout.js         # Feature layout (optional)
  _components/      # Feature-private components

actions/<feature>.js   # Server actions for the feature
lib/                   # Shared infrastructure
docs/modules/          # Per-module documentation
```

**Rule:** Business logic lives in `actions/`. UI components stay thin. AI prompts live next to the action that uses them (or move to `lib/ai/prompts/` at scale).

---

## Environment Dependencies

See `.env.example` in the project root. Required services:

- PostgreSQL (Neon, Supabase, or self-hosted)
- Clerk (auth)
- Groq (AI)
- Inngest (optional, for cron)

---

## Security Posture Summary

| Area | Risk | Priority |
|------|------|----------|
| `/api/ats-analyze` unauthenticated | API abuse, cost drain | P0 |
| No rate limiting on AI | Quota exhaustion | P0 |
| Onboarding not enforced globally | Poor AI personalization | P1 |
| No audit logging | Compliance gap | P2 |
| Secrets in `.env` only | OK if not committed | — |

See individual module docs for detailed remediation steps.
