# Module 03 — Resume Builder

## Purpose

Let users build a structured resume (contact, summary, skills, experience, education, projects), preview it as markdown, improve sections with AI, and export to PDF.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `app/(main)/resume/page.jsx` | Resume page shell |
| `app/(main)/resume/_components/resume-builder.jsx` | Main builder UI |
| `app/(main)/resume/_components/entry-form.jsx` | Section entry forms |
| `actions/resume.js` | `saveResume`, `getResume`, `improveWithAI` |
| `app/lib/helper.js` | `entriesToMarkdown()` |
| `app/lib/schema.js` | Zod schemas for resume sections |

### Data Model

One resume per user (`Resume.userId` is unique).

| Field | Type | Description |
|-------|------|-------------|
| `content` | Text (markdown) | Full resume as markdown |
| `userId` | String (FK) | Owner |

Commented-out fields in schema suggest planned features: `atsScore`, `feedback`.

### User Flow

```text
1. User fills structured form sections
2. entriesToMarkdown() converts to markdown preview
3. saveResume(content) → upsert Resume row
4. improveWithAI({ current, type }) → Groq rewrites a section
5. Optional PDF export via html2pdf.js (client-side)
```

---

## Server Actions

### `saveResume(content)`

Upserts single resume for authenticated user. Revalidates `/resume`.

### `getResume()`

Returns user's resume or null.

### `improveWithAI({ current, type })`

Uses user profile (industry, skills, bio) + section type to generate improved paragraph via Groq.

---

## Known Gaps

| Issue | Impact |
|-------|--------|
| Form doesn't hydrate from saved markdown | User sees preview but form fields start empty |
| No version history | Can't undo or compare versions |
| No job-description targeting | Resume isn't tailored to a specific role |
| No link to ATS module | Built resume can't be analyzed in-app without re-upload |
| PDF export is client-only | Quality/layout inconsistent across browsers |
| No templates | All resumes look the same |

---

## Recommendations (Product-Grade)

### P0 — Bidirectional Markdown ↔ Form

Parse saved markdown back into form state on load (or store structured JSON alongside markdown).

### P1 — Resume Versions

```prisma
model ResumeVersion {
  id        String   @id @default(cuid())
  resumeId  String
  content   String   @db.Text
  label     String?  // "Software Engineer", "Product Manager"
  createdAt DateTime @default(now())
}
```

### P1 — In-App ATS Check

Button: "Analyze this resume" → call ATS logic on `resume.content` without file upload.

### P2 — Templates

Provide 3–5 markdown templates (modern, classic, minimal) with theme selector.

### P2 — Job Targeting

Add optional `targetJobDescription` field; AI rewrites summary and skills for keyword alignment.

---

## Future Implementation Checklist

- [ ] Parse markdown → form state on page load
- [ ] Add `ResumeVersion` model and version picker UI
- [ ] "Analyze with ATS" button using existing `analyzeResume` logic on text
- [ ] Server-side PDF generation (Puppeteer or `@react-pdf/renderer`)
- [ ] Resume templates library in `data/resume-templates.js`
- [ ] Auto-save debounce (every 30s)
- [ ] Enable `atsScore` and `feedback` fields on Resume model
