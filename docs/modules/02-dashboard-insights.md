# Module 02 — Dashboard & Industry Insights

## Purpose

Show users market intelligence for their industry: salary ranges, growth rate, demand level, top skills, trends, and recommended skills to learn.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `app/(main)/dashboard/page.jsx` | Server page; onboarding gate |
| `app/(main)/dashboard/_components/dashboard-view.jsx` | Charts and insight cards |
| `actions/dashboard.js` | `getIndustryInsights`, `generateAIInsights` |
| `lib/inngest/function.js` | Weekly cron refresh |
| `data/industries.js` | Industry taxonomy |

### Data Flow

```text
User visits /dashboard
  → getIndustryInsights()
  → Load User + IndustryInsight by user.industry
  → If no insight row: generateAIInsights() via Groq → create IndustryInsight
  → Render salary bar chart (Recharts), skills, trends, outlook badges
```

### IndustryInsight Schema

| Field | Type | Description |
|-------|------|-------------|
| `industry` | String (unique) | Slug key, e.g. `tech-software-development` |
| `salaryRanges` | Json[] | `{ role, min, max, median, location }` |
| `growthRate` | Float | Percentage |
| `demandLevel` | String | High / Medium / Low |
| `topSkills` | String[] | In-demand skills |
| `marketOutlook` | String | Positive / Neutral / Negative |
| `keyTrends` | String[] | Industry trends |
| `recommendedSkills` | String[] | Skills to learn |
| `lastUpdated` | DateTime | Last AI refresh |
| `nextUpdate` | DateTime | Scheduled next refresh |

### Refresh Strategy

| Trigger | When |
|---------|------|
| Onboarding | First user in industry → AI generates insight |
| First dashboard visit | If user has industry but no insight row |
| Inngest cron | Weekly (Sunday midnight) for all existing rows |

---

## AI Prompt Contract

`generateAIInsights(industry)` expects Groq to return **only** valid JSON matching the schema above. Uses `cleanJsonResponse()` before `JSON.parse`.

**Risk:** LLM may return malformed JSON → parse failure → user sees error.

---

## Known Gaps

| Issue | Impact |
|-------|--------|
| AI data is not sourced from real APIs | Salaries/trends are LLM-estimated, not live market data |
| No staleness indicator in UI beyond badges | Users may trust outdated data |
| Sequential Inngest loop | Slow as industry count grows |
| No per-user customization | Same insight for all users in an industry |
| No skills gap analysis | Dashboard doesn't compare user skills vs recommended |

---

## Recommendations (Product-Grade)

### P1 — Data Source Layer

Introduce a `lib/market-data/` abstraction:

```text
MarketDataProvider (interface)
  ├── GroqProvider (current — fallback)
  ├── BLSProvider (US Bureau of Labor Statistics)
  └── LinkedIn/Adzuna API (future)
```

### P1 — Caching

- Cache `IndustryInsight` reads with `unstable_cache` (Next.js) or Redis
- Invalidate on cron completion

### P2 — Skills Gap Widget

Compare `user.skills` vs `industryInsight.recommendedSkills` and show a gap score + learning suggestions.

### P2 — Location-Aware Salaries

Add `user.location` field and filter salary ranges by region.

---

## Future Implementation Checklist

- [ ] Add `lib/ai/prompts/industry-insights.js` for prompt versioning
- [ ] Add JSON schema validation (Zod) after AI response
- [ ] Parallelize Inngest industry updates with concurrency limit
- [ ] Add "Refresh now" button (rate-limited, admin or premium)
- [ ] Skills gap component on dashboard
- [ ] Integrate real salary API (Levels.fyi, Glassdoor, or BLS)
- [ ] Add `IndustryInsight.version` for prompt migration tracking
