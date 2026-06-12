# Module 08 — Database & Data Model

## Purpose

Persist users, resumes, cover letters, assessments, and industry insights in PostgreSQL via Prisma ORM.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `prisma/schema.prisma` | Data model definition |
| `prisma/migrations/` | Schema migrations |
| `lib/prisma.js` | Singleton Prisma client (Prisma 7 + pg adapter) |
| `prisma.config.js` | Migration URL from `DATABASE_URL` |

### Connection

Uses `@prisma/adapter-pg` with the `pg` driver — suitable for serverless with connection pooling (consider Prisma Accelerate or PgBouncer at scale).

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| IndustryInsight : "industry slug FK"
    User ||--o| Resume : "one-to-one"
    User ||--o{ CoverLetter : "one-to-many"
    User ||--o{ Assessment : "one-to-many"

    User {
        uuid id PK
        string clerkUserId UK
        string email
        string industry FK
        int experience
        string[] skills
        string bio
    }

    IndustryInsight {
        string industry UK
        json[] salaryRanges
        float growthRate
        string demandLevel
        string[] topSkills
        string marketOutlook
        string[] keyTrends
        string[] recommendedSkills
        datetime lastUpdated
        datetime nextUpdate
    }

    Resume {
        string id PK
        string userId UK_FK
        text content
    }

    CoverLetter {
        string id PK
        string userId FK
        text content
        string companyName
        string jobTitle
        string status
    }

    Assessment {
        string id PK
        string userId FK
        float quizScore
        json[] questions
        string category
        string improvementTip
    }
```

---

## Model Details

### User

| Field | Notes |
|-------|-------|
| `clerkUserId` | Unique link to Clerk |
| `industry` | FK to `IndustryInsight.industry` (string slug, not UUID) |
| `skills` | PostgreSQL string array |
| `assesments` | Relation name has typo (should be `assessments`) |

### IndustryInsight

Shared across all users in the same industry. Key format: `{industryId}-{sub-industry-slug}`.

### Resume

One per user (`userId` unique). Markdown content only.

### CoverLetter

Multiple per user. Status: `draft` | `completed`.

### Assessment

Quiz attempt history. `questions` is JSON array of per-question results.

---

## Design Decisions & Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| Industry FK via string slug | Simple onboarding flow | Harder to rename industries |
| One resume per user | Simple UX | Power users want multiple versions |
| ATS results not stored | No storage cost | No history or progress |
| `ON DELETE RESTRICT` on children | Data integrity | User deletion requires cascade strategy |

---

## Known Gaps

| Issue | Recommendation |
|-------|----------------|
| `assesments` typo on User model | Rename to `assessments` in migration |
| No soft delete | Add `deletedAt` on user-generated content |
| No audit trail | Add `AuditLog` model for compliance |
| Commented `atsScore` on Resume | Implement or remove |
| No indexes on `CoverLetter.createdAt` | Add for list pagination |
| User deletion blocked by RESTRICT | Add cascade or soft-delete flow |

---

## Planned Schema Additions

### Phase 1 — Product Essentials

```prisma
model AtsAnalysis {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  fileName     String?
  overallScore Float
  result       Json
  createdAt    DateTime @default(now())
  @@index([userId, createdAt])
}

model AiUsage {
  id        String   @id @default(cuid())
  userId    String
  feature   String   // "cover-letter", "ats", "quiz", etc.
  tokens    Int?
  createdAt DateTime @default(now())
  @@index([userId, createdAt])
}
```

### Phase 2 — Monetization

```prisma
model Subscription {
  id               String   @id @default(cuid())
  userId           String   @unique
  stripeCustomerId String   @unique
  stripePriceId    String
  status           String   // active, canceled, past_due
  currentPeriodEnd DateTime
}
```

### Phase 3 — Application Tracker

```prisma
model JobApplication {
  id            String   @id @default(cuid())
  userId        String
  companyName   String
  jobTitle      String
  status        String
  coverLetterId String?
  appliedAt     DateTime?
  @@index([userId])
}
```

---

## Migration Guidelines

1. Always create migrations: `npx prisma migrate dev --name descriptive_name`
2. Never edit production data manually without a script
3. Backfill new columns with defaults before making them required
4. Test migrations on a staging DB before production

---

## Future Implementation Checklist

- [ ] Fix `assesments` → `assessments` relation name
- [ ] Add `AtsAnalysis` model
- [ ] Add `AiUsage` tracking model
- [ ] Add `onboardingCompletedAt` to User
- [ ] Add `deletedAt` soft delete on CoverLetter, Assessment
- [ ] Evaluate Prisma Accelerate for serverless connection pooling
- [ ] Add database seed script for dev (`prisma/seed.js`)
- [ ] Add `Subscription` model when Stripe is integrated
