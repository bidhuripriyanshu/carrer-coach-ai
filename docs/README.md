# AI Career Coach — Module Documentation

Product-grade, module-based documentation for the AI Career Coach platform. Use this as the single source of truth for architecture, implementation details, and planned improvements.

---

## Documentation Index

| # | Module | Doc | Status |
|---|--------|-----|--------|
| 0 | **System Architecture** | [architecture/system-overview.md](./architecture/system-overview.md) | Current |
| 1 | **Auth & Onboarding** | [modules/01-auth-onboarding.md](./modules/01-auth-onboarding.md) | MVP |
| 2 | **Dashboard & Industry Insights** | [modules/02-dashboard-insights.md](./modules/02-dashboard-insights.md) | MVP |
| 3 | **Resume Builder** | [modules/03-resume-builder.md](./modules/03-resume-builder.md) | MVP |
| 4 | **ATS Score Analysis** | [modules/04-ats-score.md](./modules/04-ats-score.md) | MVP |
| 5 | **AI Cover Letter** | [modules/05-cover-letter.md](./modules/05-cover-letter.md) | MVP |
| 6 | **Interview Preparation** | [modules/06-interview-prep.md](./modules/06-interview-prep.md) | MVP |
| 7 | **AI Infrastructure** | [modules/07-ai-infrastructure.md](./modules/07-ai-infrastructure.md) | MVP |
| 8 | **Database & Data Model** | [modules/08-database.md](./modules/08-database.md) | Current |
| 9 | **Background Jobs (Inngest)** | [modules/09-background-jobs.md](./modules/09-background-jobs.md) | MVP |
| 10 | **Profile Optimization** | [modules/10-profile-optimization.md](./modules/10-profile-optimization.md) | MVP |
| 11 | **Product Roadmap** | [roadmap/product-roadmap.md](./roadmap/product-roadmap.md) | Planning |

---

## Quick Reference

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Auth | Clerk |
| Database | PostgreSQL + Prisma 7 |
| AI | Groq (`llama-3.3-70b-versatile`) |
| Background Jobs | Inngest |
| UI | Tailwind CSS 4, Radix UI, shadcn-style components |

### Maturity Levels

| Level | Meaning |
|-------|---------|
| **MVP** | Core flow works; not production-hardened |
| **Beta** | Auth, validation, error handling in place |
| **Production** | Tests, monitoring, rate limits, compliance |
| **Scale** | Caching, queues, multi-model AI, analytics |

### How to Read These Docs

Each module doc follows the same structure:

1. **Purpose** — What the module does for users
2. **Current Implementation** — Files, routes, data flow
3. **API / Server Actions** — Entry points and contracts
4. **Known Gaps** — Bugs and missing product-grade features
5. **Recommendations** — What to build next
6. **Future Implementation** — Concrete tasks for the next sprint

---

## Contributing to Docs

When you change a module, update its doc in the same PR. Keep `roadmap/product-roadmap.md` in sync with priority changes.
