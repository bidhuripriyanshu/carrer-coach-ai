# Module 05 — AI Cover Letter

## Purpose

Generate tailored cover letters from the user's profile and a target job (company, title, description). Store, list, preview, and delete letters.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `app/(main)/ai-cover-letter/page.jsx` | Letter list |
| `app/(main)/ai-cover-letter/new/page.jsx` | Generation form |
| `app/(main)/ai-cover-letter/[id]/page.jsx` | Preview (read-only) |
| `actions/cover-letter.js` | CRUD + AI generation |
| `_components/cover-letter-*.jsx` | UI components |

### Routes

| Route | Action |
|-------|--------|
| `/ai-cover-letter` | List all letters |
| `/ai-cover-letter/new` | Create new letter |
| `/ai-cover-letter/[id]` | View single letter |

### Data Model

```prisma
model CoverLetter {
  id              String
  userId          String
  content         String    // Markdown
  jobDescription  String?
  companyName     String
  jobTitle        String
  status          String    @default("draft")  // draft | completed
  createdAt       DateTime
  updatedAt       DateTime
}
```

### Generation Flow

```text
Form: companyName, jobTitle, jobDescription
  → generateCoverLetter(data)
  → Build prompt from user profile + job details
  → Groq generateText
  → Save CoverLetter { status: "completed" }
  → Return letter → redirect to list or preview
```

---

## Server Actions

| Function | Description |
|----------|-------------|
| `generateCoverLetter(data)` | AI generate + DB create |
| `getCoverLetters()` | List by user, newest first |
| `getCoverLetter(id)` | Single letter (scoped to user) |
| `deleteCoverLetter(id)` | Delete (scoped to user) |

---

## Known Gaps

| Issue | Impact |
|-------|--------|
| Preview is read-only | Can't edit after generation |
| No regenerate / refine | User must delete and recreate |
| No link to resume | Letter doesn't pull from latest resume |
| No export (PDF/DOCX) | Users copy markdown manually |
| No application tracking | Letters aren't tied to job applications |
| `[id]` page has no 404 handling | Missing letter shows blank/error |

---

## Recommendations (Product-Grade)

### P1 — Editable Cover Letters

Add `updateCoverLetter(id, content)` server action and markdown editor on `[id]` page.

### P1 — Regenerate with Variants

"Regenerate" button with tone options: formal, enthusiastic, concise.

### P2 — Resume Context Injection

Pull latest `Resume.content` into the generation prompt for consistency.

### P2 — Application Tracker Integration

```prisma
model JobApplication {
  id            String
  userId        String
  companyName   String
  jobTitle      String
  status        String   // applied, interviewing, offered, rejected
  coverLetterId String?
  resumeId      String?
  appliedAt     DateTime?
}
```

### P2 — Export

PDF/DOCX download matching resume export pipeline.

---

## Future Implementation Checklist

- [ ] Add `updateCoverLetter` server action
- [ ] Editable markdown preview on `[id]` page
- [ ] Regenerate with tone selector
- [ ] Inject resume content into prompt
- [ ] PDF export
- [ ] Not-found UI when letter doesn't exist
- [ ] Cover letter templates by industry
- [ ] ATS keyword check for cover letter content
