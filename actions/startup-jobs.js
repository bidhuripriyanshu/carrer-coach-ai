"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateText, parseJsonResponse } from "@/lib/groq";
import { stripMarkdown } from "@/lib/resume-text";

// ─── Auth helper ────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { resume: true },
  });

  if (!user) throw new Error("User not found");
  return user;
}

// ─── Prompt builder ─────────────────────────────────────────────────────────

function buildStartupPrompt(resumeText, jobProfile) {
  const {
    targetRole,
    techStack,
    experience,
    location,
    workMode,
    industries,
  } = jobProfile;

  return `You are a startup talent scout AI. Based on the candidate's resume and target job profile below, recommend 10 real, named, actively-hiring startups that are a strong match.

## Candidate Resume
---
${resumeText.slice(0, 4000)}
---

## Target Job Profile
- Role: ${targetRole}
- Tech Stack: ${Array.isArray(techStack) ? techStack.join(", ") : techStack || "any"}
- Experience level: ${experience || "any"}
- Location preference: ${location || "any"}
- Work mode: ${workMode || "any"}
- Preferred industries: ${Array.isArray(industries) && industries.length ? industries.join(", ") : "any"}

Return ONLY valid JSON — a top-level array (not wrapped in an object) of startup objects:
[
  {
    "name": "string — real company name",
    "tagline": "string — one-line description",
    "website": "https://...",
    "linkedinUrl": "https://linkedin.com/company/...",
    "crunchbaseUrl": "https://crunchbase.com/organization/...",
    "jobsUrl": "https://... careers page or empty string",
    "teamSize": 45,
    "fundingStage": "Seed | Series A | Series B | Series C | Series D | Bootstrapped | IPO",
    "techStack": ["React", "Node.js"],
    "openRoles": ["Senior Frontend Engineer", "Full-Stack Developer"],
    "matchScore": 88,
    "matchReason": "2-sentence explanation of why this startup fits the candidate",
    "location": "Bangalore / Remote",
    "industry": "FinTech",
    "founded": 2018,
    "remote": true
  }
]

Rules:
- Only real, named companies — no placeholders, no invented names.
- matchScore is 0–100 based on tech stack overlap, role fit, location match, and growth stage suitability.
- teamSize must be a realistic integer based on your training data; add a rough estimate if exact figure unknown.
- Order results by matchScore descending.
- Include a healthy mix of team size tiers (micro 1–10, seed 11–50, series-a 51–200, series-b 201–500, late 500+) unless the profile strongly constrains it.
- Focus on startups known to have active engineering/product hiring cultures.
- founded should be a 4-digit year integer or null.
- remote is a boolean.`;
}

// ─── Normalize AI output ─────────────────────────────────────────────────────

function normalizeResults(raw) {
  const arr = Array.isArray(raw) ? raw : raw?.startups || raw?.results || [];
  return arr.map((item, i) => ({
    id: `startup-${i}-${Date.now()}`,
    name: item.name || "Unknown",
    tagline: item.tagline || "",
    website: item.website || "",
    linkedinUrl: item.linkedinUrl || "",
    crunchbaseUrl: item.crunchbaseUrl || "",
    jobsUrl: item.jobsUrl || "",
    teamSize: Number(item.teamSize) || 0,
    fundingStage: item.fundingStage || "Unknown",
    techStack: Array.isArray(item.techStack) ? item.techStack : [],
    openRoles: Array.isArray(item.openRoles) ? item.openRoles : [],
    matchScore: Math.min(100, Math.max(0, Number(item.matchScore) || 0)),
    matchReason: item.matchReason || "",
    location: item.location || "",
    industry: item.industry || "",
    founded: item.founded ? Number(item.founded) : null,
    remote: Boolean(item.remote),
  }));
}

// ─── Parse array response ─────────────────────────────────────────────────────

function parseArrayResponse(text) {
  let cleaned = (text || "").trim();

  // Strip markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();
  }

  // Try to find an array in the response
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    return JSON.parse(arrMatch[0]);
  }

  // Fallback: try full parse (might be { results: [...] })
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.startups)) return parsed.startups;
  if (Array.isArray(parsed?.results)) return parsed.results;
  return [];
}

// ─── Server actions ──────────────────────────────────────────────────────────

/**
 * Load the authenticated user's saved resume content.
 * Returns stripped plain text, or null if no resume saved.
 */
export async function getSavedResume() {
  const user = await getAuthenticatedUser();
  if (!user.resume?.content) return null;
  return stripMarkdown(user.resume.content);
}

/**
 * Primary action: run AI search and persist to DB.
 */
export async function findStartups({ resumeText, jobProfile }) {
  const user = await getAuthenticatedUser();

  if (!resumeText?.trim()) {
    throw new Error("Resume text is required to find matching startups.");
  }
  if (!jobProfile?.targetRole?.trim()) {
    throw new Error("Target role is required.");
  }

  const prompt = buildStartupPrompt(resumeText.trim(), jobProfile);

  const raw = await generateText(prompt, {
    temperature: 0.4,
    maxTokens: 4096,
  });

  let results;
  try {
    const parsed = parseArrayResponse(raw);
    results = normalizeResults(parsed);
  } catch {
    throw new Error(
      "AI returned unexpected output. Please try again."
    );
  }

  if (results.length === 0) {
    throw new Error(
      "No startups found. Try broadening your tech stack or location preferences."
    );
  }

  // Persist search to DB (non-blocking — returns results even if DB save fails)
  let savedId = null;
  let savedAt = new Date();
  try {
    const saved = await db.jobSearch.create({
      data: {
        userId: user.id,
        resumeText: resumeText.slice(0, 20000),
        targetRole: jobProfile.targetRole,
        techStack: Array.isArray(jobProfile.techStack)
          ? jobProfile.techStack
          : (jobProfile.techStack || "").split(",").map((s) => s.trim()).filter(Boolean),
        location: jobProfile.location || null,
        workMode: jobProfile.workMode || null,
        experience: jobProfile.experience || null,
        industries: Array.isArray(jobProfile.industries) ? jobProfile.industries : [],
        results,
        resultCount: results.length,
      },
    });
    savedId = saved.id;
    savedAt = saved.createdAt;
  } catch (dbErr) {
    // DB table may not exist yet (migration pending) — results are still returned
    console.warn("[startup-jobs] DB save skipped:", dbErr?.message);
  }

  return {
    id: savedId,
    results,
    resultCount: results.length,
    createdAt: savedAt,
  };

}

/**
 * Get the user's search history (light — no full results JSON).
 */
export async function getJobSearchHistory() {
  const user = await getAuthenticatedUser();

  return await db.jobSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      targetRole: true,
      techStack: true,
      location: true,
      resultCount: true,
      createdAt: true,
    },
  });
}

/**
 * Load a specific search by ID (includes full results).
 */
export async function getJobSearchById(id) {
  const user = await getAuthenticatedUser();

  const record = await db.jobSearch.findFirst({
    where: { id, userId: user.id },
  });

  if (!record) throw new Error("Search not found.");
  return record;
}

/**
 * Delete a saved search.
 */
export async function deleteJobSearch(id) {
  const user = await getAuthenticatedUser();
  await db.jobSearch.deleteMany({ where: { id, userId: user.id } });
}
