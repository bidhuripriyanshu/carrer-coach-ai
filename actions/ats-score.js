"use server";

import { GoogleGenAI } from "@google/genai";
// import mammoth from "mammoth";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * Extract plain text from PDF buffer. Uses dynamic import for Next.js compatibility.
 */
async function extractTextFromPdf(buffer) {
  const mod = await import("pdf-parse");
  const pdfParse = mod.default ?? mod;
  if (typeof pdfParse !== "function") {
    throw new Error("PDF parser not available.");
  }
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

/**
 * ATS analysis prompt: evaluate resume and return structured scores and issues.
 */
const ATS_ANALYSIS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyst. Analyze the resume text and return a JSON object with the following structure. Be strict but fair. Use only the keys specified; no extra keys.

{
  "overallScore": number (0-100),
  "totalIssues": number,
  "content": {
    "score": number (0-100),
    "items": [
      { "name": "ATS Parse Rate", "status": "pass" | "fail" | "locked", "detail": "brief reason" },
      { "name": "Quantifying Impact", "status": "pass" | "fail" | "locked", "detail": "brief reason" },
      { "name": "Repetition", "status": "pass" | "fail" | "locked", "detail": "brief reason" },
      { "name": "Spelling & Grammar", "status": "pass" | "fail" | "locked", "detail": "brief reason" },
      { "name": "Summarize Resume", "status": "pass" | "fail" | "locked", "detail": "brief reason" }
    ]
  },
  "formatBrevity": { "score": number (0-100), "items": [ { "name": string, "status": "pass" | "fail" | "locked", "detail": string } ] },
  "style": { "score": number (0-100), "items": [ { "name": string, "status": "pass" | "fail" | "locked", "detail": string } ] },
  "sections": { "score": number (0-100), "items": [ { "name": string, "status": "pass" | "fail" | "locked", "detail": string } ] },
  "skills": { "score": number (0-100), "items": [ { "name": string, "status": "pass" | "fail" | "locked", "detail": string } ] },
  "contentDetails": [
    { "category": "ATS PARSE RATE", "snippet": "relevant resume snippet", "score": number (0-100), "feedback": "short feedback" }
  ]
}

Rules:
- overallScore: single number 0-100 reflecting overall ATS readiness.
- totalIssues: count of all issues (fail status + actionable feedback).
- For each category (content, formatBrevity, style, sections, skills): provide score 0-100 and at least 2-4 items with name, status, and short detail.
- Use "pass" when the resume meets the criterion, "fail" when it does not, "locked" only for premium-placeholder items if you want to leave them unimplemented.
- contentDetails: 1-3 entries with category, a short snippet from the resume, score, and feedback (e.g. for ATS parse rate, repetition, impact).
- Return ONLY valid JSON, no markdown code fences or extra text.`;

/**
 * Analyze resume and return ATS score + breakdown. Called when user uploads a file in the square bracket (drop zone).
 */
export async function analyzeResume(formData) {
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
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: fullPrompt,
    });

    const raw =
      (result?.text ??
        result?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "").trim();
    const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : cleaned;

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("ATS JSON parse error:", parseErr?.message, "raw snippet:", raw.slice(0, 300));
      throw new Error("Invalid analysis response. Please try again.");
    }

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
  } catch (error) {
    console.error("ATS analysis error:", error);
    throw error instanceof Error ? error : new Error("Failed to analyze resume.");
  }
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
