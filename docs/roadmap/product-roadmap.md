# Product Roadmap — AI Career Coach

Phased plan to evolve from MVP to production-grade SaaS. Priorities are ordered by impact and dependency.

---

## Current State Summary

| Area | Status |
|------|--------|
| Core features | Working (resume, ATS, cover letter, quiz, dashboard) |
| AI provider | Groq (`llama-3.3-70b-versatile`) |
| Auth | Clerk (functional) |
| Database | PostgreSQL + Prisma (5 models) |
| Tests | None |
| CI/CD | None |
| Payments | None |
| Monitoring | None |
| Documentation | Module docs in `docs/` (this release) |

---

## Phase 1 — Production Hardening (2–4 weeks)

**Goal:** Secure, stable, trustworthy MVP.

### Security & Auth

| Task | Module | Priority |
|------|--------|----------|
| Add auth to `/api/ats-analyze` | ATS | P0 |
| Add `/ats-score` to middleware | Auth | P0 |
| Enforce onboarding on all main routes | Auth | P0 |
| Fix onboarding redirect bug | Auth | P0 |
| Per-user AI rate limiting | AI | P0 |

### Reliability

| Task | Module | Priority |
|------|--------|----------|
| Zod validation for all AI JSON outputs | AI | P1 |
| Retry logic for Groq rate limits | AI | P1 |
| Remove `@google/genai` dead dependency | AI | P1 |
| Per-industry error handling in Inngest | Jobs | P1 |
| Remove `console.log` from production paths | All | P2 |

### Developer Experience

| Task | Priority |
|------|----------|
| Add `.env.example` | P0 |
| Update root `README.md` (Gemini → Groq) | P1 |
| Add `prisma/seed.js` for dev data | P2 |

### Testing Foundation

| Task | Priority |
|------|----------|
| Vitest setup | P1 |
| Unit tests for `lib/groq.js`, `cleanJsonResponse` | P1 |
| Integration tests for server actions (mocked AI) | P2 |
| Playwright E2E: sign-in → onboarding → dashboard | P2 |

---

## Phase 2 — Core Product Polish (4–6 weeks)

**Goal:** Features users expect from a polished career tool.

### Resume Module

- [ ] Hydrate form from saved markdown
- [ ] In-app ATS analysis (no re-upload)
- [ ] Auto-save with debounce
- [ ] Resume version history

### ATS Module

- [ ] Persist `AtsAnalysis` results
- [ ] Analysis history page
- [ ] Job description comparison mode

### Cover Letter Module

- [ ] Editable letters after generation
- [ ] Regenerate with tone options
- [ ] PDF export

### Interview Module

- [ ] Question bank (pre-generated, cached in DB)
- [ ] Difficulty levels
- [ ] Behavioral question mode
- [ ] Weak-area insights on dashboard

### Dashboard

- [ ] Skills gap widget (user skills vs recommended)
- [ ] Stale data warning when insights are old

---

## Phase 3 — Monetization & Growth (6–8 weeks)

**Goal:** Sustainable business model.

### Subscriptions (Stripe)

| Tier | Features |
|------|----------|
| **Free** | 1 resume, 3 ATS scans/month, 2 cover letters/month, 5 quiz attempts/month |
| **Pro** ($12/mo) | Unlimited AI, version history, job targeting, priority support |
| **Teams** ($29/mo) | Pro + 5 seats, shared templates, admin dashboard |

### Implementation

- [ ] Stripe Checkout + Customer Portal
- [ ] `Subscription` model in Prisma
- [ ] Usage metering via `AiUsage` table
- [ ] Feature gates in server actions
- [ ] Unlock "locked" ATS premium items for Pro users

### Application Tracker

- [ ] `JobApplication` model
- [ ] Kanban board UI (Applied → Interviewing → Offer → Rejected)
- [ ] Link applications to resume + cover letter

---

## Phase 4 — Scale & Intelligence (8–12 weeks)

**Goal:** Differentiated, data-driven product.

### AI Improvements

- [ ] Model routing by task (fast model for short tasks)
- [ ] Prompt versioning and A/B testing
- [ ] Fallback AI provider (OpenAI/Anthropic)
- [ ] Real market data integration (BLS, job board APIs)

### Advanced Features

- [ ] Resume vs job description keyword match
- [ ] Open-ended interview with AI rubric scoring
- [ ] Learning path recommendations (courses, certifications)
- [ ] Weekly email digest (Inngest + Resend/SendGrid)

### Infrastructure

- [ ] Sentry error tracking
- [ ] PostHog or Mixpanel analytics
- [ ] Redis caching for industry insights
- [ ] GitHub Actions CI (lint, test, deploy)
- [ ] Staging environment on Vercel

---

## Phase 5 — Enterprise & Compliance (12+ weeks)

**Goal:** B2B readiness and regulatory compliance.

- [ ] GDPR: data export, right to deletion
- [ ] SOC 2 preparation (audit logging)
- [ ] Team/org accounts with RBAC
- [ ] White-label option for career centers / universities
- [ ] API for third-party integrations
- [ ] Multi-language support (i18n)

---

## Suggested Sprint Breakdown (Next 4 Sprints)

### Sprint 1 — Security First

1. Auth on ATS API + middleware for `/ats-score`
2. Global onboarding enforcement
3. Fix onboarding redirect
4. `.env.example`

### Sprint 2 — AI Reliability

1. Zod schemas for JSON AI outputs
2. Retry logic in `lib/groq.js`
3. Move prompts to `lib/ai/prompts/`
4. Remove `@google/genai`

### Sprint 3 — User Value

1. ATS result persistence + history
2. Editable cover letters
3. Resume form hydration from saved content
4. In-app ATS on built resume

### Sprint 4 — Quality

1. Vitest + first unit tests
2. Playwright E2E for critical path
3. Sentry integration
4. GitHub Actions CI

---

## Success Metrics (KPIs)

| Metric | Target (6 months) |
|--------|-------------------|
| Onboarding completion rate | > 80% |
| Weekly active users | Track baseline → +20% MoM |
| Resume save rate | > 60% of onboarded users |
| ATS analyses per user | > 2/month |
| Quiz completion rate | > 50% of started quizzes |
| Free → Pro conversion | > 5% |
| AI error rate | < 2% of requests |
| P95 API latency (AI) | < 8 seconds |

---

## Technical Debt Register

| Item | Severity | Phase |
|------|----------|-------|
| No auth on ATS API | Critical | 1 |
| Gemini docs in README | Medium | 1 |
| `assesments` typo in schema | Low | 2 |
| Duplicate `layout.js` / `layout.jsx` in (main) | Low | 1 |
| No TypeScript | Medium | 4 (optional migration) |
| Client-side PDF only | Medium | 2 |

---

## How to Use This Roadmap

1. Pick a **phase** based on business priority (usually start with Phase 1).
2. Open the relevant **module doc** in `docs/modules/` for implementation details.
3. Create GitHub issues from checklist items.
4. Update this roadmap when priorities shift.
