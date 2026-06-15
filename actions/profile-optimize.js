"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateText, parseJsonResponse } from "@/lib/groq";
import { stripMarkdown } from "@/lib/resume-text";
import { getPlatform } from "@/data/optimization-platforms";
import { fetchProfileByPlatform } from "@/lib/profile-fetchers";

const PLATFORM_PROMPTS = {
  linkedin: `You are a LinkedIn profile optimization expert. Analyze the profile content and return actionable improvements for recruiter discovery and ATS keyword matching on LinkedIn.

Focus on: headline clarity, keyword-rich about section, quantified experience bullets, skill alignment, and professional branding.`,

  github: `You are a GitHub profile optimization expert for developers. Analyze the profile and suggest improvements for recruiter appeal, open-source credibility, and technical branding.

Focus on: bio clarity, profile README impact, pinned repo strategy, tech stack visibility, and contribution story.`,

  portfolio: `You are a portfolio and personal branding expert. Analyze the portfolio content and suggest improvements for hiring managers and clients.

Focus on: hero clarity, project impact storytelling, social proof, CTA effectiveness, and visual copy structure.`,
};

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

function buildProfileInput(platform, formData, resumeText) {
  const config = getPlatform(platform);
  if (!config) throw new Error("Invalid platform");

  const parts = config.fields
    .map((field) => {
      const value = (formData[field.key] || "").trim();
      return value ? `## ${field.label}\n${value}` : null;
    })
    .filter(Boolean);

  if (resumeText) {
    parts.push(`## Resume context (for alignment)\n${resumeText.slice(0, 6000)}`);
  }

  if (parts.length === 0) {
    const platformMessages = {
      linkedin:
        "LinkedIn profile could not be fetched automatically. Please fill in at least one field (Headline, About, or Experience) using the manual entry section and try again.",
      github:
        "No GitHub profile data found. Please fill in at least one field manually before optimizing.",
      portfolio:
        "No portfolio data found. Please fill in at least one field manually before optimizing.",
    };
    throw new Error(
      platformMessages[platform] ||
        "Please fill at least one profile section before optimizing."
    );
  }

  return parts.join("\n\n");
}


function normalizeResult(data) {
  return {
    overallScore: Math.min(100, Math.max(0, Number(data.overallScore) || 0)),
    summary: data.summary || "",
    sections: Array.isArray(data.sections)
      ? data.sections.map((s) => ({
          name: s.name || "Section",
          score: Math.min(100, Math.max(0, Number(s.score) || 0)),
          current: s.current || "",
          suggested: s.suggested || "",
          tips: Array.isArray(s.tips) ? s.tips : [],
        }))
      : [],
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
  };
}

export async function fetchProfileData({
  platform,
  identifier,
  portfolioSiteUrl,
  projectUrlsText,
}) {
  await getAuthenticatedUser();

  const config = getPlatform(platform);
  if (!config) throw new Error("Invalid platform");

  return await fetchProfileByPlatform(platform, {
    identifier,
    portfolioSiteUrl,
    projectUrlsText,
  });
}

export async function optimizeProfileFromSource({
  platform,
  identifier,
  portfolioSiteUrl,
  projectUrlsText,
  useResume = true,
  profileLabel,
  extraFormData = {},
}) {
  const fetched = await fetchProfileData({
    platform,
    identifier,
    portfolioSiteUrl,
    projectUrlsText,
  });

  const mergedFormData = {
    ...fetched.formData,
    ...extraFormData,
    profileLabel:
      profileLabel ||
      `${configLabel(platform)}: ${fetched.identifier || "profile"}`,
  };

  const result = await optimizeProfile({
    platform,
    formData: mergedFormData,
    useResume,
    sourceMeta: {
      identifier: fetched.identifier,
      profileUrl: fetched.profileUrl,
      fetchNote: fetched.fetchNote,
    },
  });

  return { ...result, fetchInfo: fetched };
}

function configLabel(platform) {
  return getPlatform(platform)?.name || platform;
}

export async function optimizeProfile({
  platform,
  formData,
  useResume = false,
  sourceMeta = null,
}) {
  const user = await getAuthenticatedUser();
  const config = getPlatform(platform);
  if (!config) throw new Error("Invalid platform");

  let resumeText = "";
  if (useResume && user.resume?.content) {
    resumeText = stripMarkdown(user.resume.content);
  }

  const profileInput = buildProfileInput(platform, formData, resumeText);

  const prompt = `${PLATFORM_PROMPTS[platform]}

Profile content to optimize:
---
${profileInput}
---

Return ONLY valid JSON:
{
  "overallScore": 75,
  "summary": "2-3 sentence overall assessment",
  "sections": [
    {
      "name": "Section name e.g. Headline",
      "score": 80,
      "current": "brief note on current state",
      "suggested": "improved version or concrete rewrite",
      "tips": ["actionable tip 1", "actionable tip 2"]
    }
  ],
  "keywords": ["keyword1", "keyword2"],
  "actionItems": ["priority action 1", "priority action 2", "priority action 3"]
}

Rules:
- Include 3-5 sections relevant to ${config.name}.
- Scores are 0-100 per section; overallScore reflects total profile strength.
- Suggested text should be ready to copy-paste where possible.
- keywords: top 8-12 terms for discoverability on ${config.name}.`;

  const raw = await generateText(prompt, {
    temperature: 0.3,
    jsonMode: true,
    maxTokens: 4096,
  });

  const data = parseJsonResponse(raw, `${config.name} optimization`);
  const result = normalizeResult(data);

  const resultWithMeta = {
    ...result,
    sourceMeta: sourceMeta || null,
  };

  const saved = await db.profileOptimization.create({
    data: {
      userId: user.id,
      platform,
      profileLabel: formData.profileLabel || config.name,
      overallScore: result.overallScore,
      result: resultWithMeta,
    },
  });

  return {
    id: saved.id,
    platform: saved.platform,
    profileLabel: saved.profileLabel,
    createdAt: saved.createdAt,
    ...resultWithMeta,
  };
}

export async function getProfileOptimizationHistory(platform) {
  const user = await getAuthenticatedUser();

  return await db.profileOptimization.findMany({
    where: {
      userId: user.id,
      ...(platform ? { platform } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      profileLabel: true,
      overallScore: true,
      createdAt: true,
    },
  });
}

export async function getProfileOptimizationById(id) {
  const user = await getAuthenticatedUser();

  const record = await db.profileOptimization.findFirst({
    where: { id, userId: user.id },
  });

  if (!record) throw new Error("Optimization not found");

  return {
    id: record.id,
    platform: record.platform,
    profileLabel: record.profileLabel,
    overallScore: record.overallScore,
    createdAt: record.createdAt,
    ...record.result,
  };
}

export async function deleteProfileOptimization(id) {
  const user = await getAuthenticatedUser();

  return await db.profileOptimization.deleteMany({
    where: { id, userId: user.id },
  });
}
