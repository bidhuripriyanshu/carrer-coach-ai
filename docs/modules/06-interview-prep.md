# Module 06 — Interview Preparation

## Purpose

Generate industry-specific technical interview quizzes, track scores over time, show performance charts, and provide AI improvement tips for wrong answers.

---

## Current Implementation

### Key Files

| File | Role |
|------|------|
| `app/(main)/interview/page.jsx` | Stats dashboard + history |
| `app/(main)/interview/mock/page.jsx` | Live quiz session |
| `actions/interview.js` | Quiz generation + assessment storage |
| `_components/quiz.jsx` | Quiz UI |
| `_components/quiz-result.jsx` | Results screen |
| `_components/performance-chart.jsx` | Recharts line chart |

### Data Model

```prisma
model Assessment {
  id             String
  userId         String
  quizScore      Float       // Percentage 0-100
  questions      Json[]      // Per-question results
  category       String      // "Technical"
  improvementTip String?     // AI tip for wrong answers
  createdAt      DateTime
}
```

### Question JSON (stored after quiz)

```json
{
  "question": "string",
  "answer": "correct answer",
  "userAnswer": "user's choice",
  "isCorrect": true,
  "explanation": "string"
}
```

### Quiz Flow

```text
/interview/mock
  → generateQuiz() — Groq returns 10 MCQs as JSON
  → User answers all questions
  → saveQuizResult(questions, answers, score)
  → If wrong answers: Groq generates improvementTip
  → Save Assessment → show results
  → /interview shows history + chart
```

---

## Known Gaps

| Issue | Impact |
|-------|--------|
| MCQ only | No behavioral or open-ended questions |
| Questions regenerated each session | No question bank or difficulty progression |
| `console.log` in production path | Noise in logs |
| No timed mode | Doesn't simulate real interview pressure |
| No category variety | Only "Technical" category used |
| Quiz can fail on bad JSON | Same LLM parse risk as other modules |

---

## Recommendations (Product-Grade)

### P1 — Question Bank

```prisma
model InterviewQuestion {
  id          String
  industry    String
  difficulty  String   // easy, medium, hard
  category    String   // technical, behavioral, system-design
  question    String
  options     Json
  correctAnswer String
  explanation String
  createdAt   DateTime
}
```

Pre-generate and cache questions; serve from DB instead of live AI per quiz.

### P1 — Behavioral Interview Mode

Open-ended questions with AI rubric scoring (communication, structure, relevance).

### P2 — Timed Mock Interview

60-second per question timer; score includes speed bonus.

### P2 — Spaced Repetition

Resurface questions user got wrong in future quizzes.

### P2 — Video Mock (Advanced)

WebRTC recording + speech-to-text + AI feedback on delivery.

---

## Future Implementation Checklist

- [ ] Remove `console.log` from `interview.js`
- [ ] Add Zod validation for quiz JSON from Groq
- [ ] Create `InterviewQuestion` model and seed script
- [ ] Difficulty selector (easy / medium / hard)
- [ ] Behavioral question mode
- [ ] Timed quiz option
- [ ] Category filter (technical, behavioral, system design)
- [ ] Weak-area dashboard (topics with lowest accuracy)
- [ ] Share score card (optional social feature)
