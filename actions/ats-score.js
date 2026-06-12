"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateText, parseJsonResponse } from "@/lib/groq";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Extract plain text from PDF buffer. Uses dynamic import for Next.js compatibility.
 */
async function extractTextFromPdf(buffer) {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return (data?.text || "").trim();
}

/**
 * Extract plain text from uploaded resume (PDF or DOCX).
 */
async function extractResumeText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type?.toLowerCase() || "";
  const name = file.name?.toLowerCase() || "";

  if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
    return await extractTextFromPdf(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").trim();
  }

  throw new Error("Unsupported file type. Use PDF or DOCX only.");
}

function getFileType(file) {
  const name = file.name?.toLowerCase() || "";
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".docx")) return "docx";
  return file.type || "unknown";
}

function normalizeAnalysisData(data) {
  return {
    overallScore: Math.min(100, Math.max(0, Number(data.overallScore) || 0)),
    totalIssues: Math.max(0, Number(data.totalIssues) || 0),
    content: data.content || { score: 0, items: [] },
    formatBrevity: data.formatBrevity || { score: 0, items: [] },
    style: data.style || { score: 0, items: [] },
    sections: data.sections || { score: 0, items: [] },
    skills: data.skills || { score: 0, items: [] },
    contentDetails: Array.isArray(data.contentDetails) ? data.contentDetails : [],
  };
}

/**
 * ATS analysis prompt: evaluate resume and return structured scores and issues.
 */
const ATS_ANALYSIS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyze the resume text and return a single valid JSON object.

Required JSON shape (use real values, not type descriptions):
{
  "overallScore": 75,
  "totalIssues": 3,
  "content": {
    "score": 80,
    "items": [
      { "name": "ATS Parse Rate", "status": "pass", "detail": "Brief reason under 100 chars" },
      { "name": "Quantifying Impact", "status": "fail", "detail": "Brief reason under 100 chars" },
      { "name": "Repetition", "status": "pass", "detail": "Brief reason under 100 chars" },
      { "name": "Spelling & Grammar", "status": "pass", "detail": "Brief reason under 100 chars" },
      { "name": "Summarize Resume", "status": "pass", "detail": "Brief reason under 100 chars" }
    ]
  },
  "formatBrevity": { "score": 70, "items": [{ "name": "Length", "status": "pass", "detail": "Brief reason" }] },
  "style": { "score": 75, "items": [{ "name": "Consistency", "status": "pass", "detail": "Brief reason" }] },
  "sections": { "score": 80, "items": [{ "name": "Contact Info", "status": "pass", "detail": "Brief reason" }] },
  "skills": { "score": 70, "items": [{ "name": "Keyword Match", "status": "fail", "detail": "Brief reason" }] },
  "contentDetails": [
    { "category": "ATS PARSE RATE", "snippet": "short resume excerpt", "score": 80, "feedback": "short feedback" }
  ]
}

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no comments, no trailing commas.
- "status" must be exactly one string: "pass", "fail", or "locked" (never use | or multiple values).
- Keep every "detail" and "feedback" under 100 characters.
- overallScore: 0-100 reflecting ATS readiness.
- totalIssues: count of items with status "fail".
- Each category (content, formatBrevity, style, sections, skills): score 0-100 and 2-4 items.
- contentDetails: 1-3 entries with category, snippet, score, and feedback.`;

const ATS_MAX_RETRIES = 2;

async function requestAtsAnalysis(fullPrompt, attempt = 1) {
  const raw = await generateText(fullPrompt, {
    maxTokens: 8192,
    temperature: 0.2,
    jsonMode: true,
  });

  try {
    return parseJsonResponse(raw, "ATS analysis");
  } catch (parseErr) {
    if (attempt >= ATS_MAX_RETRIES) {
      console.error(
        "ATS JSON parse error:",
        parseErr.message,
        "raw snippet:",
        raw.slice(0, 500)
      );
      throw new Error("Invalid analysis response. Please try again.");
    }

    const retryPrompt = `${fullPrompt}

Your previous response was invalid JSON. Return ONLY a valid JSON object matching the required shape. No markdown. Keep strings short.`;
    return requestAtsAnalysis(retryPrompt, attempt + 1);
  }
}

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Analyze resume and return ATS score + breakdown. Persists result to AtsAnalysis history.
 */
export async function analyzeResume(formData) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  const user = await getAuthenticatedUser();

  const file = formData.get("resume");
  if (!file || !(file instanceof File)) {
    throw new Error("Please upload a resume file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size must be under 2MB.");
  }

  const allowed =
    ALLOWED_TYPES.some((t) => file.type === t) ||
    file.name?.toLowerCase().endsWith(".pdf") ||
    file.name?.toLowerCase().endsWith(".docx");
  if (!allowed) {
    throw new Error("Only PDF and DOCX files are allowed.");
  }

  let resumeText = "";
  try {
    resumeText = await extractResumeText(file);
  } catch (e) {
    console.error("Resume extraction error:", e);
    throw new Error("Could not extract text from the file. Ensure it is a valid PDF or DOCX.");
  }

  if (!resumeText || resumeText.length < 20) {
    throw new Error("Resume text is too short or could not be extracted. Please use a different file or ensure the PDF is not image-only.");
  }

  const userPrompt = `Analyze the following resume text and return the ATS analysis JSON as specified. Resume text:\n\n---\n${resumeText.slice(0, 28000)}\n---`;

  const fullPrompt = `${ATS_ANALYSIS_SYSTEM_PROMPT}\n\n${userPrompt}`;

  try {
    const data = await requestAtsAnalysis(fullPrompt);
    const analysis = normalizeAnalysisData(data);

    let saved;
    try {
      saved = await db.atsAnalysis.create({
        data: {
          userId: user.id,
          fileName: file.name || null,
          fileType: getFileType(file),
          overallScore: analysis.overallScore,
          totalIssues: analysis.totalIssues,
          result: analysis,
        },
      });
    } catch (dbError) {
      if (dbError?.code === "P2021") {
        throw new Error(
          "ATS history table is missing. Run: npx prisma migrate deploy"
        );
      }
      throw dbError;
    }

    return {
      id: saved.id,
      createdAt: saved.createdAt,
      fileName: saved.fileName,
      ...analysis,
    };
  } catch (error) {
    console.error("ATS analysis error:", error);
    throw error instanceof Error ? error : new Error("Failed to analyze resume.");
  }
}

/**
 * List ATS analysis history for the current user (newest first).
 */
export async function getAtsAnalysisHistory() {
  const user = await getAuthenticatedUser();

  return await db.atsAnalysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      overallScore: true,
      totalIssues: true,
      createdAt: true,
    },
  });
}

/**
 * Get a single ATS analysis with full explanations (category items + contentDetails).
 */
export async function getAtsAnalysisById(id) {
  const user = await getAuthenticatedUser();

  const record = await db.atsAnalysis.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!record) throw new Error("ATS analysis not found");

  const result = record.result;

  return {
    id: record.id,
    fileName: record.fileName,
    fileType: record.fileType,
    overallScore: record.overallScore,
    totalIssues: record.totalIssues,
    createdAt: record.createdAt,
    content: result.content,
    formatBrevity: result.formatBrevity,
    style: result.style,
    sections: result.sections,
    skills: result.skills,
    contentDetails: result.contentDetails,
  };
}

/**
 * Delete an ATS analysis from history.
 */
export async function deleteAtsAnalysis(id) {
  const user = await getAuthenticatedUser();

  return await db.atsAnalysis.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });
}

/**
 * Wrapper for useActionState: receives formData from form submit and returns result or error.
 */
export async function analyzeResumeFormAction(prevState, formData) {
  try {
    const data = await analyzeResume(formData);
    return { success: true, data, error: null };
  } catch (err) {
    const message = err?.message || "Failed to analyze resume.";
    return { success: false, data: null, error: message };
  }
}
