# Module 04 — ATS Score Analysis

## Purpose

Analyze uploaded resumes (PDF/DOCX) against ATS best practices and return structured scores, category breakdowns, and actionable feedback.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `app/(main)/ats-score/page.js` | Client upload UI |
| `app/api/ats-analyze/route.js` | POST endpoint for file upload |
| `actions/ats-score.js` | Text extraction + Groq analysis |

### Data Flow

```text
User drops PDF/DOCX (max 2MB)
  → fetch POST /api/ats-analyze (multipart)
  → analyzeResume(formData)
  → extractTextFromPdf / mammoth (DOCX)
  → Build prompt (system + resume text, max 28k chars)
  → Groq generateText (maxTokens: 8192)
  → cleanJsonResponse → JSON.parse
  → Return scores to UI (NOT persisted)
```

### Response Shape

```json
{
  "overallScore": 0-100,
  "totalIssues": number,
  "content": { "score": number, "items": [{ "name", "status", "detail" }] },
  "formatBrevity": { "score", "items" },
  "style": { "score", "items" },
  "sections": { "score", "items" },
  "skills": { "score", "items" },
  "contentDetails": [{ "category", "snippet", "score", "feedback" }]
}
```

Item `status`: `pass` | `fail` | `locked` (premium placeholder in prompt)

---

## Validation Rules

| Rule | Value |
|------|-------|
| Max file size | 2 MB |
| Allowed types | PDF, DOCX |
| Min extracted text | 20 characters |

---

## Known Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| **API has no auth** | Critical | Anyone can POST and consume Groq quota |
| **Results not saved** | High | No history, no progress tracking |
| **Route not in middleware** | Medium | Page accessible without login |
| **No job description comparison** | Medium | Generic ATS only |
| **Image-only PDFs fail silently** | Medium | No OCR fallback |
| **"locked" items** | Low | Premium placeholders with no monetization |

---

## Recommendations (Product-Grade)

### P0 — Secure the API

```javascript
// app/api/ats-analyze/route.js
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // ... rate limit per userId
}
```

### P0 — Rate Limiting

Use Upstash Redis or Vercel KV:

- Free tier: 3 analyses/day
- Pro tier: unlimited

### P1 — Persist Results

```prisma
model AtsAnalysis {
  id           String   @id @default(cuid())
  userId       String
  fileName     String?
  overallScore Float
  result       Json     // full analysis payload
  createdAt    DateTime @default(now())
  @@index([userId])
}
```

### P1 — Resume Builder Integration

Analyze in-app resume content without upload.

### P2 — Job Description Mode

Optional `jobDescription` field in form → keyword match score vs role requirements.

### P2 — OCR for Scanned PDFs

Integrate Tesseract or a cloud OCR service for image-based PDFs.

---

## Future Implementation Checklist

- [ ] Add Clerk auth to `/api/ats-analyze`
- [ ] Add `/ats-score` to middleware protected routes
- [ ] Create `AtsAnalysis` model and history UI
- [ ] Per-user rate limiting
- [ ] Job description comparison mode
- [ ] Link ATS results to Resume model (`atsScore`, `feedback` fields)
- [ ] OCR fallback for scanned documents
- [ ] Move ATS prompt to `lib/ai/prompts/ats-analysis.js`
