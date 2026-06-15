"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateText, parseJsonResponse } from "@/lib/groq";
import { extractResumeTextFromFile, stripMarkdown } from "@/lib/resume-text";

const INTERVIEW_TYPES = {
  technical: {
    label: "Technical",
    category: "AI Technical",
    interviewer: "Alex, a senior technical interviewer",
    focus:
      "technical depth, system design, coding concepts, projects, tools, and problem-solving from the resume",
  },
  hr: {
    label: "HR",
    category: "AI HR",
    interviewer: "Sarah, an experienced HR interviewer",
    focus:
      "behavioral questions, communication, teamwork, leadership, strengths, weaknesses, and culture fit",
  },
};

const TOTAL_TURNS = 5;

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

function normalizeResumeText(text) {
  const cleaned = (text || "").trim();
  if (!cleaned || cleaned.length < 50) {
    throw new Error(
      "Resume text is too short. Upload a complete resume or build one in the Resume Builder."
    );
  }
  return cleaned.slice(0, 12000);
}

export async function getSavedResumeForInterview() {
  const user = await getAuthenticatedUser();
  const resume = await db.resume.findUnique({
    where: { userId: user.id },
    select: { content: true },
  });

  if (!resume?.content) return null;

  return {
    source: "saved",
    text: stripMarkdown(resume.content),
  };
}

export async function extractInterviewResumeText(formData) {
  await getAuthenticatedUser();

  const file = formData.get("resume");
  const text = await extractResumeTextFromFile(file);
  return {
    source: "upload",
    fileName: file.name,
    text: normalizeResumeText(text),
  };
}

export async function getLiveInterviewTurn({
  type,
  resumeText,
  conversation = [],
  turnIndex = 0,
}) {
  await getAuthenticatedUser();

  const config = INTERVIEW_TYPES[type];
  if (!config) throw new Error("Invalid interview type");

  const historyText =
    conversation.length > 0
      ? conversation
          .map(
            (item, i) =>
              `Turn ${i + 1}\nQ: ${item.question}\nA: ${item.userAnswer}`
          )
          .join("\n\n")
      : "No previous turns yet.";

  const prompt = `You are ${config.interviewer} conducting a LIVE face-to-face ${config.label} interview.

Resume:
---
${normalizeResumeText(resumeText)}
---

Previous conversation:
${historyText}

Current turn: ${turnIndex + 1} of ${TOTAL_TURNS}

Generate the next live interview moment. Focus on: ${config.focus}

Rules:
- If turn 1: greet briefly and ask the opening question (reference resume specifics).
- If turn 2+: start with a short acknowledgment of the candidate's LAST answer (1 sentence), then ask the next question.
- Questions must feel conversational, like a real video interview.
- Ask follow-ups when answers are vague; go deeper on resume projects/skills.
- Do NOT repeat previous questions.
- Keep question under 220 characters.
- Return ONLY valid JSON:
{
  "acknowledgment": "string or empty for turn 1",
  "question": "string"
}`;

  const raw = await generateText(prompt, {
    temperature: 0.45,
    jsonMode: true,
    maxTokens: 1024,
  });

  const data = parseJsonResponse(raw, "live interview turn");

  return {
    acknowledgment: String(data.acknowledgment || "").trim(),
    question: String(data.question || "").trim(),
  };
}

export async function evaluateAiInterview({
  type,
  resumeText,
  conversation,
  proctoring,
}) {
  const user = await getAuthenticatedUser();
  const config = INTERVIEW_TYPES[type];
  if (!config) throw new Error("Invalid interview type");

  if (!conversation?.length) {
    throw new Error("Interview conversation is required");
  }

  const transcript = conversation
    .map(
      (item, i) =>
        `Turn ${i + 1}\nInterviewer: ${item.acknowledgment ? item.acknowledgment + " " : ""}${item.question}\nCandidate: ${item.userAnswer}`
    )
    .join("\n\n");

  const proctoringPenalty = Math.min(3, Number(proctoring?.penalty) || 0);
  const violationSummary =
    proctoring?.violations?.length > 0
      ? `Proctoring violations: ${proctoring.violations.length} (tab switches, clipboard, camera, etc.).`
      : "No proctoring violations detected.";

  const prompt = `You are evaluating a LIVE proctored ${config.label} interview. Score honestly from 0-10.

Resume:
---
${normalizeResumeText(resumeText)}
---

Full interview transcript:
${transcript}

${violationSummary}
Apply up to ${proctoringPenalty} point penalty for integrity issues when calculating finalOverallScore.

Return ONLY valid JSON:
{
  "overallScore": 7.5,
  "finalOverallScore": 7.0,
  "integrityNote": "brief note on proctoring impact",
  "improvementTip": "1-2 sentences",
  "evaluations": [
    {
      "question": "string",
      "userAnswer": "string",
      "score": 8,
      "feedback": "string"
    }
  ]
}

Rules:
- Score communication, relevance, depth, and authenticity.
- Penalize vague, copied-sounding, or off-topic answers.
- finalOverallScore = overallScore minus integrity penalty (min 0).`;

  const raw = await generateText(prompt, {
    temperature: 0.2,
    jsonMode: true,
    maxTokens: 4096,
  });

  const data = parseJsonResponse(raw, "interview evaluation");
  const evaluations = Array.isArray(data.evaluations) ? data.evaluations : [];

  const finalScore = Math.min(
    10,
    Math.max(
      0,
      Number(data.finalOverallScore ?? data.overallScore) - 0
    )
  );

  const questionResults = evaluations.map((item, index) => ({
    question: item.question || conversation[index]?.question || "",
    userAnswer: item.userAnswer || conversation[index]?.userAnswer || "",
    score: Math.min(10, Math.max(0, Number(item.score) || 0)),
    feedback: item.feedback || "",
    maxScore: 10,
    acknowledgment: conversation[index]?.acknowledgment || "",
  }));

  const improvementTip = [
    data.improvementTip,
    data.integrityNote,
    proctoringPenalty > 0
      ? `Integrity penalty applied: -${proctoringPenalty} (violations during proctored session).`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const assessment = await db.assessment.create({
    data: {
      userId: user.id,
      quizScore: finalScore,
      category: config.category,
      improvementTip: improvementTip || null,
      questions: questionResults,
    },
  });

  return {
    ...assessment,
    proctoring: {
      violationCount: proctoring?.violations?.length || 0,
      penalty: proctoringPenalty,
      rawScore: Number(data.overallScore) || finalScore,
    },
  };
}
