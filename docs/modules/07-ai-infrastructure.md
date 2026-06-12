# Module 07 — AI Infrastructure

## Purpose

Centralize all LLM calls through a single Groq client, standardize prompts, handle errors, and prepare for model routing, cost control, and observability.

---

## Current Implementation

### Key File

`lib/groq.js` — shared AI client used by all modules.

| Export | Description |
|--------|-------------|
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |
| `generateText(prompt, options)` | Chat completion via Groq REST API |
| `cleanJsonResponse(text)` | Strip markdown fences, extract JSON |
| `isRateLimitError(error)` | Detect 429 / quota errors |

### Options for `generateText`

| Option | Default | Description |
|--------|---------|-------------|
| `model` | `GROQ_MODEL` | Override model per call |
| `temperature` | `0.7` | Creativity (lower for JSON) |
| `maxTokens` | `4096` | Max response length |

### Modules Using AI

| Module | Action | Output Type |
|--------|--------|-------------|
| Cover Letter | `generateCoverLetter` | Markdown text |
| Resume | `improveWithAI` | Plain text paragraph |
| Dashboard | `generateAIInsights` | JSON |
| Interview | `generateQuiz`, improvement tip | JSON / text |
| ATS Score | `analyzeResume` | JSON (large) |
| Inngest | `generateIndustryInsights` | JSON |

### Dead Dependency

`@google/genai` remains in `package.json` but is **unused**. Remove it to reduce bundle size and config noise.

---

## Current Architecture

```text
actions/*.js
  → lib/groq.js → fetch(Groq API)
  → cleanJsonResponse (if JSON)
  → JSON.parse (no schema validation)
```

**Problems at scale:**
- One model for all tasks (overkill for simple tasks, underpowered for complex)
- No retry logic
- No prompt versioning
- No cost/token tracking
- No structured output mode

---

## Target Architecture (Product-Grade)

```text
actions/*.js
  → lib/ai/service.js          # High-level AI service
      → lib/ai/prompts/*.js    # Versioned prompt templates
      → lib/ai/schemas/*.js    # Zod schemas for JSON outputs
      → lib/ai/providers/groq.js
      → lib/ai/providers/...   # Future: OpenAI, Anthropic fallback
      → lib/ai/rate-limiter.js
      → lib/ai/telemetry.js    # Token usage, latency, errors
```

### Recommended Model Routing

| Task | Model | Temperature | Reason |
|------|-------|-------------|--------|
| JSON (quiz, insights, ATS) | `llama-3.3-70b-versatile` | 0.2 | Structured output |
| Cover letter | `llama-3.3-70b-versatile` | 0.7 | Creative writing |
| Resume improve | `llama-3.1-8b-instant` | 0.5 | Fast, short output |
| Improvement tips | `llama-3.1-8b-instant` | 0.6 | Short text |

### JSON Reliability Pattern

```javascript
import { z } from "zod";
import { generateText, cleanJsonResponse } from "@/lib/groq";

const QuizSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    explanation: z.string(),
  })),
});

export async function generateQuizWithValidation(prompt) {
  const raw = await generateText(prompt, { temperature: 0.2 });
  const parsed = JSON.parse(cleanJsonResponse(raw));
  return QuizSchema.parse(parsed); // throws with clear Zod errors
}
```

### Retry Pattern

```javascript
async function generateWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimitError(err) || i === maxRetries - 1) throw err;
      await sleep(2 ** i * 1000);
    }
  }
}
```

---

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key from console.groq.com |

---

## Future Implementation Checklist

- [ ] Remove `@google/genai` from `package.json` and `next.config.mjs`
- [ ] Create `lib/ai/prompts/` directory with one file per feature
- [ ] Add Zod schemas for all JSON AI outputs
- [ ] Add retry with exponential backoff in `lib/groq.js`
- [ ] Add per-user AI usage tracking table
- [ ] Model routing by task type
- [ ] Log token usage (if Groq returns usage in response)
- [ ] Fallback provider (OpenAI/Anthropic) for Groq outages
- [ ] Prompt A/B testing framework for quality improvement
