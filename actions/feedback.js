"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { feedbackSchema } from "@/lib/schemas/feedback";

// ── Submit a new feedback ──────────────────────────────────────────────────
export async function submitFeedback(rawData) {
  const parsed = feedbackSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, role, rating, category, message } = parsed.data;

  // Optionally link to logged-in user
  let dbUserId = null;
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
      const user = await db.user.findUnique({
        where: { clerkUserId: clerkId },
        select: { id: true },
      });
      dbUserId = user?.id ?? null;
    }
  } catch {
    // Not authenticated — anonymous feedback is fine
  }

  await db.feedback.create({
    data: {
      name,
      role: role || null,
      rating,
      category,
      message,
      approved: true,
      ...(dbUserId ? { userId: dbUserId } : {}),
    },
  });

  revalidatePath("/");

  return { success: true };
}

// ── Fetch latest approved feedback for the landing page ───────────────────
export async function getPublicFeedback({ limit = 6 } = {}) {
  const rows = await db.feedback.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      role: true,
      rating: true,
      category: true,
      message: true,
      createdAt: true,
    },
  });

  return rows;
}

// ── Aggregate stats ────────────────────────────────────────────────────────
export async function getFeedbackStats() {
  const agg = await db.feedback.aggregate({
    where: { approved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  return {
    total: agg._count.id,
    avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
  };
}
