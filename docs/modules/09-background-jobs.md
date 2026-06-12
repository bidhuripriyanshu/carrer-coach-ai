# Module 09 — Background Jobs (Inngest)

## Purpose

Run scheduled and event-driven tasks outside the request cycle — primarily refreshing industry insights data weekly.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `lib/inngest/client.js` | Inngest app client |
| `lib/inngest/function.js` | Cron function definition |
| `app/api/inngest/route.js` | Inngest serve endpoint |

### Registered Function

**`generateIndustryInsights`**

| Property | Value |
|----------|-------|
| Trigger | Cron `0 0 * * 0` (Sunday midnight) |
| Steps | Fetch industries → Groq per industry → Update DB |

### Flow

```text
Inngest Cron (weekly)
  → step.run("Fetch industries") — all IndustryInsight rows
  → For each industry:
      → step.run("Generate insights") — Groq generateText
      → cleanJsonResponse → JSON.parse
      → step.run("Update insights") — Prisma update
```

### Endpoint

`GET/POST/PUT /api/inngest` — required by Inngest SDK for function registration and execution.

---

## Known Gaps

| Issue | Impact |
|-------|--------|
| Sequential loop over industries | Slow; one failure can block others |
| No per-industry error isolation | Bad JSON parse stops remaining updates |
| No alerting on failure | Silent data staleness |
| No manual trigger | Can't refresh on demand |
| Inngest env vars not documented | Hard to set up locally |

---

## Recommendations (Product-Grade)

### P1 — Parallel Execution with Concurrency

```javascript
await Promise.all(
  industries.map(({ industry }) =>
    step.run(`Update ${industry}`, () => refreshIndustry(industry))
  )
);
```

Or use Inngest's `step.run` with fan-out pattern and concurrency limit of 5.

### P1 — Per-Industry Error Handling

```javascript
try {
  const insights = JSON.parse(cleanJsonResponse(text));
  await db.industryInsight.update({ ... });
} catch (err) {
  console.error(`Failed to refresh ${industry}:`, err);
  // continue to next industry
}
```

### P2 — Event-Driven Jobs

| Event | Action |
|-------|--------|
| `user/onboarded` | Generate industry insight if missing |
| `resume/saved` | Optional ATS pre-analysis |
| `assessment/completed` | Update user skill profile |

### P2 — Additional Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Weekly digest email | Monday 9am | Summary of progress |
| Stale insight alert | Daily | Flag insights older than 14 days |
| AI usage report | Monthly | Cost tracking for admin |

---

## Local Development

```bash
# Terminal 1
npm run dev

# Terminal 2 (Inngest Dev Server)
npx inngest-cli@latest dev
```

Register functions at `http://localhost:3000/api/inngest`.

---

## Future Implementation Checklist

- [ ] Add per-industry try/catch in cron loop
- [ ] Parallelize with concurrency limit
- [ ] Add `user/onboarded` event trigger for insight generation
- [ ] Add admin "force refresh" API (protected)
- [ ] Document `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in `.env.example`
- [ ] Add Sentry/error notification on job failure
- [ ] Add job run history logging table
