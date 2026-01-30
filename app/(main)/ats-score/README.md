# ATS Score Feature — How It Works & Common Errors

This document explains how the **ATS (Applicant Tracking System) Resume Score** feature works and what errors you might see.

---

## Overview

The ATS Score feature lets users **upload a resume** (PDF or DOCX), then get an **AI-powered score and feedback** on how well the resume is optimized for applicant tracking systems. The flow is:

1. User selects or drops a file on the ATS Score page.
2. User clicks **Upload Your Resume**.
3. The file is sent to the API → text is extracted → Gemini AI analyzes it → structured score + feedback is returned.
4. The page shows overall score, category breakdowns, and content details.

---

## File Structure & Data Flow

```
User (browser)
    │
    ▼  POST FormData { resume: File }
app/(main)/ats-score/page.js  ──────────────────────────────────────────┐
    │                                                                   │
    │  fetch("/api/ats-analyze", { method: "POST", body: formData })    │
    ▼                                                                   │
app/api/ats-analyze/route.js                                            │
    │                                                                   │
    │  analyzeResume(formData)                                         │
    ▼                                                                   │
actions/ats-score.js                                                    │
    │                                                                   │
    │  1. Validate file (type, size)                                   │
    │  2. extractResumeText(file) → PDF (pdf-parse) or DOCX (mammoth)  │
    │  3. ai.models.generateContent(...) → Gemini                       │
    │  4. Parse JSON from response, normalize, return                   │
    ▼                                                                   │
    │  { success: true, data: { overallScore, totalIssues, content, ... } }
    └───────────────────────────────────────────────────────────────────┘
    │
    ▼
page.js renders: ScoreGauge, Accordion (categories), Content Details card
```

- **Page** = UI + client-side file validation + calls API.
- **API route** = Receives form data, calls server action, returns JSON.
- **Server action** = File validation, text extraction, Gemini call, JSON parsing, structured result.

---

## How Each Part Works

### 1. `app/(main)/ats-score/page.js` (Client)

- **Drop zone + file input**: User can drag-and-drop or click to choose a file. Only one file is used.
- **Client-side validation** (before upload):
  - Allowed: `application/pdf`, DOCX (by MIME or `.pdf` / `.docx` extension).
  - Max size: **2MB**.
  - If invalid: toast error, file cleared or submit blocked.
- **Submit**: Builds `FormData`, appends `resume` (the File), POSTs to `/api/ats-analyze`. On success, stores `result` and shows score + accordions + content details. On failure, shows `submitError` and toast.
- **UI**:
  - **ScoreGauge**: Semi-circle gauge for `overallScore` (0–100).
  - **Accordion**: One section per category (`content`, `formatBrevity`, `style`, `sections`, `skills`) with score and items (pass/fail/locked + detail).
  - **Content details**: List of `contentDetails` (category, snippet, score bar, feedback).

So the page is responsible for: choosing the file, validating it in the browser, calling the API, and rendering the result. It does **not** call the server action directly; it goes through the API route.

### 2. `app/api/ats-analyze/route.js` (API)

- **POST only**: Reads `request.formData()`, passes it to `analyzeResume(formData)` from `@/actions/ats-score`.
- **Success**: `NextResponse.json({ success: true, data })`.
- **Error**: Catches any thrown error, returns `NextResponse.json({ success: false, error: message }, { status: 400 })`.

So the API is a thin wrapper: form data in → `analyzeResume` → JSON out. Any error from the action becomes a 400 with an `error` message.

### 3. `actions/ats-score.js` (Server)

- **Startup**: Requires `GEMINI_API_KEY`. If missing, the app throws as soon as the module is loaded.
- **Constants**: Max file size 2MB; allowed MIME types for PDF and DOCX.
- **extractResumeText(file)**:
  - PDF: dynamic `import("pdf-parse")`, then `pdfParse(buffer)` → text.
  - DOCX: `mammoth.extractRawText({ buffer })` → text.
  - Otherwise throws (unsupported type).
- **analyzeResume(formData)**:
  1. Gets `resume` from `formData`; checks it’s a `File`.
  2. Validates size (≤ 2MB) and type (PDF or DOCX).
  3. Calls `extractResumeText(file)` to get `resumeText`.
  4. If text is missing or very short (< 20 chars), throws.
  5. Builds a long prompt: system ATS instructions + resume text (first 28k chars). Sends to Gemini via `ai.models.generateContent({ model: GEMINI_MODEL, contents: fullPrompt })`.
  6. Takes `result.text` (or fallback path for legacy shape), strips markdown code fences, finds JSON with `/\{[\s\S]*\}/`, parses it.
  7. Returns normalized object: `overallScore`, `totalIssues`, `content`, `formatBrevity`, `style`, `sections`, `skills`, `contentDetails`. Scores clamped 0–100; missing categories default to `{ score: 0, items: [] }`.
- **analyzeResumeFormAction(prevState, formData)**: Alternative entry for `useActionState`; calls `analyzeResume` and returns `{ success, data, error }`. The current page does **not** use this; it uses the API route instead.

So the “brain” of the feature is in the server action: validation, extraction, Gemini call, and response shaping. Errors here become the messages the API returns.

---

## Errors You Might See (and Why)

| Error message | Where it comes from | Cause |
|---------------|---------------------|--------|
| **GEMINI_API_KEY environment variable is not set** | `actions/ats-score.js` (top-level) | `.env` has no `GEMINI_API_KEY`. Server fails as soon as the module is loaded. |
| **Please upload a resume file.** | `analyzeResume` | `formData.get("resume")` is missing or not a `File` (e.g. wrong field name or empty form). |
| **File size must be under 2MB.** | Page (client) or `analyzeResume` | File &gt; 2MB. |
| **Only PDF and DOCX files are allowed.** | Page or `analyzeResume` | File type is not PDF/DOCX (by MIME or extension). |
| **Could not extract text from the file. Ensure it is a valid PDF or DOCX.** | `analyzeResume` after `extractResumeText` | PDF: `pdf-parse` failed (e.g. corrupted, image-only PDF). DOCX: `mammoth` failed. |
| **Resume text is too short or could not be extracted. Please use a different file or ensure the PDF is not image-only.** | `analyzeResume` | Extracted text length &lt; 20 characters. Common with image-only PDFs (no real text layer). |
| **Invalid analysis response. Please try again.** | `analyzeResume` | Gemini returned something that isn’t valid JSON, or JSON doesn’t contain the expected structure after parsing. |
| **Failed to analyze resume.** | API route or `analyzeResumeFormAction` | Generic catch-all (e.g. network to Gemini, quota, or any unexpected throw). |
| **PDF parser not available.** | `extractTextFromPdf` | Dynamic import of `pdf-parse` didn’t give a callable function. |

---

## Quick Troubleshooting

1. **“GEMINI_API_KEY environment variable is not set”**  
   Add `GEMINI_API_KEY=your_key` to `.env` (or `.env.local`) and restart the dev/server process.

2. **“Please upload a resume file” / upload does nothing**  
   Ensure the client sends `FormData` with key `resume` and value = the `File` (same as in the page: `formData.append("resume", selectedFile)`).

3. **“Could not extract text” / “Resume text is too short”**  
   Use a different file or a PDF that has selectable text (not a scanned image without OCR). For image-only PDFs, you’d need an OCR step (not in this codebase).

4. **“Invalid analysis response”**  
   Usually Gemini returned markdown or extra text. The code already strips ``` and takes the first `{ ... }`. If it still fails, check server logs for the raw snippet; you may need to relax the prompt or add more robust JSON extraction.

5. **Upload works but UI shows nothing**  
   Check network tab: API should return `{ success: true, data: { ... } }`. If `success` is false or `data` is missing, the page will show the `error` message and clear the result.

---

## Dependencies (for this feature)

- **@google/genai** — Gemini API client.
- **pdf-parse** — PDF text extraction (dynamic import in `ats-score.js`). If you see “PDF parser not available” or a module-not-found error, add it: `npm install pdf-parse`.
- **mammoth** — DOCX text extraction (imported in `ats-score.js`). Add with `npm install mammoth` if missing.

Ensure `GEMINI_API_KEY` is set in the environment where the API and server actions run (e.g. dev server or production host).
